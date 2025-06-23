// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract KustodiaEscrow3_0 is Initializable, OwnableUpgradeable {
    enum Status { Pending, Funded, Released, Disputed, Resolved, Cancelled }

    struct Escrow {
        address payer;
        address seller;
        address commission;
        uint256 amount;
        uint256 custodyAmount;
        uint256 createdAt;
        uint256 custodyPeriod;
        Status status;
    }

    IERC20Upgradeable public mxnbs;
    uint256 public escrowCount;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed seller, uint256 amount, uint256 custodyAmount, address commission);
    event EscrowReleased(uint256 indexed escrowId, address indexed to);
    event EscrowDisputed(uint256 indexed escrowId, address indexed by);
    event EscrowResolved(uint256 indexed escrowId, address indexed winner);
    event CustodyReleased(uint256 indexed escrowId, address indexed to);

    function initialize(address _mxnbs) public initializer {
        __Ownable_init();
        mxnbs = IERC20Upgradeable(_mxnbs);
    }

    function createEscrow(
        address seller,
        address commission,
        uint256 amount,
        uint256 custodyAmount,
        uint256 custodyPeriod
    ) external returns (uint256) {
        require(amount > 0, "Amount required");
        require(seller != address(0), "Seller required");
        require(mxnbs.allowance(msg.sender, address(this)) >= amount, "Approve tokens first");

        // Transfer total amount from payer to contract
        require(mxnbs.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        escrows[++escrowCount] = Escrow({
            payer: msg.sender,
            seller: seller,
            commission: commission,
            amount: amount,
            custodyAmount: custodyAmount,
            createdAt: block.timestamp,
            custodyPeriod: custodyPeriod,
            status: Status.Funded
        });

        emit EscrowCreated(escrowCount, msg.sender, seller, amount, custodyAmount, commission);
        return escrowCount;
    }

    function releaseEscrow(uint256 escrowId) external {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == Status.Funded, "Not funded");
        require(msg.sender == esc.payer, "Only payer can release");
        esc.status = Status.Released;

        // Pay seller (amount - custodyAmount), pay commission if set, custody stays in contract
        uint256 sellerAmount = esc.amount - esc.custodyAmount;
        if (esc.commission != address(0)) {
            // For simplicity, commission is NOT deducted here, but logic can be added
        }
        require(mxnbs.transfer(esc.seller, sellerAmount), "Seller payment failed");
        // Optionally: transfer commission, leave custody in contract for later release

        emit EscrowReleased(escrowId, esc.seller);
    }

    function releaseCustody(uint256 escrowId) external onlyOwner {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == Status.Released, "Not released");
        esc.status = Status.Resolved;
        require(mxnbs.transfer(esc.seller, esc.custodyAmount), "Custody payment failed");
        emit CustodyReleased(escrowId, esc.seller);
    }

    function disputeEscrow(uint256 escrowId) external {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == Status.Funded, "Not funded");
        require(msg.sender == esc.payer || msg.sender == esc.seller, "Not allowed");
        esc.status = Status.Disputed;
        emit EscrowDisputed(escrowId, msg.sender);
    }

    function resolveDispute(uint256 escrowId, address winner) external onlyOwner {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == Status.Disputed, "Not disputed");
        esc.status = Status.Resolved;
        require(mxnbs.transfer(winner, esc.amount), "Resolution payment failed");
        emit EscrowResolved(escrowId, winner);
    }
}
