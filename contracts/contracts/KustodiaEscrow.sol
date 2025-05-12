// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KustodiaEscrow is Ownable {
    IERC20 public mxnbToken;
    address public platformWallet;
    uint256 public constant FEE_BPS = 150; // 1.5% fee (basis points)

    enum EscrowStatus { Active, Released, Disputed, Resolved, Refunded }

    struct Escrow {
        address buyer;
        address seller;
        uint256 custodyAmount;
        uint256 custodyEnd;
        EscrowStatus status;
    }

    uint256 public escrowCounter;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 custodyAmount, uint256 custodyEnd);
    event ImmediateRelease(uint256 indexed escrowId, uint256 amount, address to);
    event CustodyReleased(uint256 indexed escrowId, uint256 amount, address to);
    event DisputeRaised(uint256 indexed escrowId, address by);
    event DisputeResolved(uint256 indexed escrowId, bool releasedToSeller);

    constructor(address _mxnbToken, address _platformWallet) {
        mxnbToken = IERC20(_mxnbToken);
        platformWallet = _platformWallet;
    }

    function createEscrow(
        address seller,
        uint256 custodyAmount,
        uint256 custodyPeriod // in seconds
    ) external {
        require(custodyAmount > 0, "Amount must be > 0");
        // Transfer custody amount from buyer to contract
        require(mxnbToken.transferFrom(msg.sender, address(this), custodyAmount), "Token transfer failed");

        escrows[escrowCounter] = Escrow({
            buyer: msg.sender,
            seller: seller,
            custodyAmount: custodyAmount,
            custodyEnd: block.timestamp + custodyPeriod,
            status: EscrowStatus.Active
        });

        emit EscrowCreated(escrowCounter, msg.sender, seller, custodyAmount, block.timestamp + custodyPeriod);
        escrowCounter++;
    }

    function releaseCustody(uint256 escrowId) external onlyOwner {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == EscrowStatus.Active, "Not active");
        require(block.timestamp >= esc.custodyEnd, "Custody period not ended");

        esc.status = EscrowStatus.Released;
        require(mxnbToken.transfer(platformWallet, esc.custodyAmount), "Custody release failed");
        emit CustodyReleased(escrowId, esc.custodyAmount, platformWallet);
    }

    function raiseDispute(uint256 escrowId) external {
        Escrow storage esc = escrows[escrowId];
        require(msg.sender == esc.buyer || msg.sender == esc.seller, "Not participant");
        require(esc.status == EscrowStatus.Active, "Not active");

        esc.status = EscrowStatus.Disputed;
        emit DisputeRaised(escrowId, msg.sender);
    }

    function resolveDispute(uint256 escrowId, bool releaseToSeller) external onlyOwner {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == EscrowStatus.Disputed, "Not disputed");

        esc.status = EscrowStatus.Resolved;
        if (releaseToSeller) {
            require(mxnbToken.transfer(esc.seller, esc.custodyAmount), "Release failed");
        } else {
            require(mxnbToken.transfer(esc.buyer, esc.custodyAmount), "Refund failed");
        }
        emit DisputeResolved(escrowId, releaseToSeller);
    }
}
