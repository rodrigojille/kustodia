// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title KustodiaEscrow2_0Pausable
 * @dev Upgradeable, pausable, bridge-wallet-only escrow contract for modular payment flows by vertical (multi-CLABE ready).
 *      All critical actions are restricted to the platform's bridge wallet. No direct user on-chain interaction.
 *      Includes emergency pause functionality for security.
 */
contract KustodiaEscrow2_0Pausable is 
    Initializable, 
    OwnableUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
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
        address token;      // Token ERC20 a custodiar
    }

    uint256 public nextEscrowId;
    mapping(uint256 => Escrow) public escrows;
    
    // Only bridge wallet (platform) can operate critical functions
    address public bridgeWallet;
    address public platformWallet;
    
    // Emergency pause functionality
    mapping(address => bool) public pausers; // Addresses that can pause the contract

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount, string vertical, string clabe);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId);
    event EscrowDisputed(uint256 indexed escrowId, address by, string reason);
    event EscrowCancelled(uint256 indexed escrowId);
    event BridgeWalletUpdated(address indexed oldBridge, address indexed newBridge);
    event PlatformWalletUpdated(address indexed oldPlatform, address indexed newPlatform);
    event PauserAdded(address indexed pauser);
    event PauserRemoved(address indexed pauser);

    modifier onlyBridge() {
        require(msg.sender == bridgeWallet, "Not bridge wallet");
        _;
    }

    modifier onlyPauser() {
        require(pausers[msg.sender] || msg.sender == owner(), "Not authorized to pause");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _bridgeWallet, address _platformWallet) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        require(_bridgeWallet != address(0), "Invalid bridge wallet");
        require(_platformWallet != address(0), "Invalid platform wallet");
        
        bridgeWallet = _bridgeWallet;
        platformWallet = _platformWallet;
        
        // Grant pauser role to owner initially
        pausers[msg.sender] = true;
        emit PauserAdded(msg.sender);
    }

    /**
     * @dev Create escrow (only bridge wallet, when not paused)
     */
    function createEscrow(
        address payer,
        address payee,
        uint256 amount,
        uint256 deadline,
        string memory vertical,
        string memory clabe,
        string memory conditions,
        address token
    ) external onlyBridge whenNotPaused nonReentrant returns (uint256) {
        require(payer != address(0), "Invalid payer");
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Amount must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(vertical).length > 0, "Vertical cannot be empty");
        require(bytes(clabe).length > 0, "CLABE cannot be empty");

        uint256 escrowId = nextEscrowId++;
        
        Escrow storage newEscrow = escrows[escrowId];
        newEscrow.payer = payer;
        newEscrow.payee = payee;
        newEscrow.amount = amount;
        newEscrow.deadline = deadline;
        newEscrow.vertical = vertical;
        newEscrow.clabe = clabe;
        newEscrow.status = EscrowStatus.Pending;
        newEscrow.conditions = conditions;
        newEscrow.token = token;

        emit EscrowCreated(escrowId, payer, payee, amount, vertical, clabe);
        return escrowId;
    }

    /**
     * @dev Fund escrow (only bridge wallet, when not paused)
     */
    function fundEscrow(uint256 escrowId) external payable onlyBridge whenNotPaused nonReentrant {
        require(escrows[escrowId].payer != address(0), "Escrow does not exist");
        require(escrows[escrowId].status == EscrowStatus.Pending, "Escrow not in pending status");
        require(block.timestamp <= escrows[escrowId].deadline, "Escrow deadline passed");

        Escrow storage escrow = escrows[escrowId];
        
        if (escrow.token == address(0)) {
            // ETH escrow
            require(msg.value == escrow.amount, "Incorrect ETH amount");
        } else {
            // ERC20 token escrow
            require(msg.value == 0, "ETH not accepted for token escrow");
            require(
                IERC20(escrow.token).transferFrom(msg.sender, address(this), escrow.amount),
                "Token transfer failed"
            );
        }

        escrow.status = EscrowStatus.Funded;
        emit EscrowFunded(escrowId, escrow.amount);
    }

    /**
     * @dev Release escrow to payee (only bridge wallet, when not paused)
     */
    function releaseEscrow(uint256 escrowId) external onlyBridge whenNotPaused nonReentrant {
        require(escrows[escrowId].payer != address(0), "Escrow does not exist");
        require(escrows[escrowId].status == EscrowStatus.Funded, "Escrow not funded");

        Escrow storage escrow = escrows[escrowId];
        escrow.status = EscrowStatus.Released;

        if (escrow.token == address(0)) {
            // ETH release
            (bool success, ) = escrow.payee.call{value: escrow.amount}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20 token release
            require(
                IERC20(escrow.token).transfer(escrow.payee, escrow.amount),
                "Token transfer failed"
            );
        }

        emit EscrowReleased(escrowId);
    }

    /**
     * @dev Dispute escrow (only bridge wallet, when not paused)
     */
    function disputeEscrow(uint256 escrowId, string memory reason) external onlyBridge whenNotPaused {
        require(escrows[escrowId].payer != address(0), "Escrow does not exist");
        require(escrows[escrowId].status == EscrowStatus.Funded, "Escrow not funded");

        escrows[escrowId].status = EscrowStatus.Disputed;
        emit EscrowDisputed(escrowId, msg.sender, reason);
    }

    /**
     * @dev Cancel escrow and refund (only bridge wallet, when not paused)
     */
    function cancelEscrow(uint256 escrowId) external onlyBridge whenNotPaused nonReentrant {
        require(escrows[escrowId].payer != address(0), "Escrow does not exist");
        require(
            escrows[escrowId].status == EscrowStatus.Funded || 
            escrows[escrowId].status == EscrowStatus.Disputed,
            "Cannot cancel escrow in current status"
        );

        Escrow storage escrow = escrows[escrowId];
        escrow.status = EscrowStatus.Cancelled;

        if (escrow.token == address(0)) {
            // ETH refund
            (bool success, ) = escrow.payer.call{value: escrow.amount}("");
            require(success, "ETH refund failed");
        } else {
            // ERC20 token refund
            require(
                IERC20(escrow.token).transfer(escrow.payer, escrow.amount),
                "Token refund failed"
            );
        }

        emit EscrowCancelled(escrowId);
    }

    /**
     * @dev Emergency pause (only authorized pausers)
     */
    function pause() external onlyPauser {
        _pause();
    }

    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Add pauser (only owner)
     */
    function addPauser(address pauser) external onlyOwner {
        require(pauser != address(0), "Invalid pauser address");
        pausers[pauser] = true;
        emit PauserAdded(pauser);
    }

    /**
     * @dev Remove pauser (only owner)
     */
    function removePauser(address pauser) external onlyOwner {
        pausers[pauser] = false;
        emit PauserRemoved(pauser);
    }

    /**
     * @dev Update bridge wallet (only owner)
     */
    function updateBridgeWallet(address newBridgeWallet) external onlyOwner {
        require(newBridgeWallet != address(0), "Invalid bridge wallet");
        address oldBridge = bridgeWallet;
        bridgeWallet = newBridgeWallet;
        emit BridgeWalletUpdated(oldBridge, newBridgeWallet);
    }

    /**
     * @dev Update platform wallet (only owner)
     */
    function updatePlatformWallet(address newPlatformWallet) external onlyOwner {
        require(newPlatformWallet != address(0), "Invalid platform wallet");
        address oldPlatform = platformWallet;
        platformWallet = newPlatformWallet;
        emit PlatformWalletUpdated(oldPlatform, newPlatformWallet);
    }

    /**
     * @dev Emergency token rescue (only owner, even when paused)
     */
    function rescueTokens(address token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(IERC20(token).transfer(to, amount), "Rescue transfer failed");
    }

    /**
     * @dev Emergency ETH rescue (only owner, even when paused)
     */
    function rescueETH(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH rescue failed");
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (
        address payer,
        address payee,
        uint256 amount,
        uint256 deadline,
        string memory vertical,
        string memory clabe,
        EscrowStatus status,
        string memory conditions,
        address token
    ) {
        Escrow storage escrow = escrows[escrowId];
        return (
            escrow.payer,
            escrow.payee,
            escrow.amount,
            escrow.deadline,
            escrow.vertical,
            escrow.clabe,
            escrow.status,
            escrow.conditions,
            escrow.token
        );
    }

    /**
     * @dev UUPS upgrade authorization (only owner)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
