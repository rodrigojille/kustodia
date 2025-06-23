// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title KustodiaEscrow2_0
 * @dev Upgradable, bridge-wallet-only escrow contract for modular payment flows by vertical (multi-CLABE ready).
 *      All critical actions are restricted to the platform's bridge wallet. No direct user on-chain interaction.
 */
contract KustodiaEscrow2_0 is Initializable, OwnableUpgradeable {
    enum EscrowStatus { Pending, Funded, Released, Disputed, Cancelled }

    struct Escrow {
        address payer;
        address payee;
        uint256 amount;
        uint256 deadline;
        string vertical;    // e.g. "inmobiliaria"
        string clabe;       // CLABE asociada
        EscrowStatus status;
        string conditions;  // JSON/IPFS con reglas particulares
        address token;      // Token ERC20 a custodiar (NUEVO - SIEMPRE AL FINAL)
    }

    uint256 public nextEscrowId;
    mapping(uint256 => Escrow) public escrows;
    // Only bridge wallet (platform) can operate critical functions
    address public bridgeWallet;
    address public platformWallet;

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount, string vertical, string clabe);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId);
    event EscrowDisputed(uint256 indexed escrowId, address by, string reason);
    event EscrowCancelled(uint256 indexed escrowId);

    modifier onlyBridge() {
        require(msg.sender == bridgeWallet, "Not bridge wallet");
        _;
    }

    function initialize(address _bridgeWallet, address _platformWallet) public initializer {
        __Ownable_init();
        require(_bridgeWallet != address(0), "Invalid bridge wallet");
        require(_platformWallet != address(0), "Invalid platform wallet");
        bridgeWallet = _bridgeWallet;
        platformWallet = _platformWallet;
        nextEscrowId = 1;
    }

    function setBridgeWallet(address _bridgeWallet) external onlyOwner {
        require(_bridgeWallet != address(0), "Invalid bridge wallet");
        bridgeWallet = _bridgeWallet;
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    function createEscrow(
        address payer,
        address payee,
        address token,
        uint256 amount,
        uint256 deadline,
        string memory vertical,
        string memory clabe,
        string memory conditions
    ) external onlyBridge returns (uint256) {
        require(payee != address(0), "Invalid payee");
        require(payer != address(0), "Invalid payer");
        require(amount > 0, "Invalid amount");
        require(deadline > block.timestamp, "Invalid deadline");
        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            payer: payer,
            payee: payee,
            token: token,
            amount: amount,
            deadline: deadline,
            vertical: vertical,
            clabe: clabe,
            status: EscrowStatus.Pending,
            conditions: conditions
        });
        emit EscrowCreated(escrowId, payer, payee, amount, vertical, clabe);
        return escrowId;
    }

    function fundEscrow(uint256 escrowId) external onlyBridge {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Pending, "Not pending");
        require(e.token != address(0), "Token not set");
        require(e.amount > 0, "Amount not set");
        // Transferir tokens desde el payer al contrato
        require(IERC20(e.token).transferFrom(e.payer, address(this), e.amount), "Token transfer failed");
        e.status = EscrowStatus.Funded;
        emit EscrowFunded(escrowId, e.amount);
    }

    function release(uint256 escrowId) external onlyBridge {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Funded, "Not funded");
        e.status = EscrowStatus.Released;
        // Transfer tokens to bridge wallet on release for on-chain auditability
        require(IERC20(e.token).transfer(bridgeWallet, e.amount), "Token transfer failed");
        emit EscrowReleased(escrowId);
    }

    function dispute(uint256 escrowId, string memory reason) external onlyBridge {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Funded, "Not funded");
        require(block.timestamp < e.deadline, "Deadline passed");
        e.status = EscrowStatus.Disputed;
        emit EscrowDisputed(escrowId, msg.sender, reason);
    }

    function cancel(uint256 escrowId) external onlyBridge {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Pending, "Not pending");
        e.status = EscrowStatus.Cancelled;
        emit EscrowCancelled(escrowId);
    }

    event EscrowDisputeResolved(uint256 indexed escrowId, bool inFavorOfSeller);

    /**
     * @dev Rescue ERC20 tokens stuck in the contract (admin only).
     * Can be used to recover MXNB if a release event was emitted but tokens were not transferred.
     */
    function rescueTokens(address token, address to, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(to, amount), "Rescue transfer failed");
    }

    /**
     * @dev Resuelve una disputa. Si inFavorOfSeller es true, el escrow regresa a Funded (puede liberarse después). Si es false, se cancela y los fondos se regresan al payer.
     * Solo el bridge wallet puede llamar.
     */
    function resolveDispute(uint256 escrowId, bool inFavorOfSeller) external onlyBridge {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Disputed, "Not disputed");
        if (inFavorOfSeller) {
            e.status = EscrowStatus.Funded;
        } else {
            e.status = EscrowStatus.Cancelled;
            require(IERC20(e.token).transfer(platformWallet, e.amount), "Refund failed");
        }
        emit EscrowDisputeResolved(escrowId, inFavorOfSeller);
    }

    // Optional: Add view functions, batch events, or future upgrades here.
}
