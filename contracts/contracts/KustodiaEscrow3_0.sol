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
        uint256 amount;
        uint256 custodyAmount;
        uint256 createdAt;
        uint256 custodyPeriod;
        Status status;
        // User-defined commission
        address userCommissionBeneficiary;
        uint256 userCommissionAmount;
        // Platform commission
        address platformCommissionBeneficiary;
        uint256 platformCommissionAmount;
    }

    IERC20Upgradeable public mxnbs;
    uint256 public escrowCount;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed seller, uint256 amount, uint256 custodyAmount, address userCommissionBeneficiary, address platformCommissionBeneficiary);
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
        uint256 amount,
        uint256 custodyAmount,
        uint256 custodyPeriod,
        address userCommissionBeneficiary,
        uint256 userCommissionAmount,
        address platformCommissionBeneficiary,
        uint256 platformCommissionAmount
    ) external returns (uint256) {
        require(amount > 0, "Amount required");
        require(seller != address(0), "Seller required");
        require(mxnbs.allowance(msg.sender, address(this)) >= amount, "Approve tokens first");

        // Transfer total amount from payer to contract
        require(mxnbs.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        escrows[++escrowCount] = Escrow({
            payer: msg.sender,
            seller: seller,
            amount: amount,
            custodyAmount: custodyAmount,
            createdAt: block.timestamp,
            custodyPeriod: custodyPeriod,
            status: Status.Funded,
            userCommissionBeneficiary: userCommissionBeneficiary,
            userCommissionAmount: userCommissionAmount,
            platformCommissionBeneficiary: platformCommissionBeneficiary,
            platformCommissionAmount: platformCommissionAmount
        });

        emit EscrowCreated(escrowCount, msg.sender, seller, amount, custodyAmount, userCommissionBeneficiary, platformCommissionBeneficiary);
        return escrowCount;
    }

    function releaseEscrow(uint256 escrowId) external {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == Status.Funded, "Not funded");
        require(msg.sender == esc.payer, "Only payer can release");
        esc.status = Status.Released;

        // Calculate total commission
        uint256 totalCommission = esc.userCommissionAmount + esc.platformCommissionAmount;
        
        // Calculate seller amount
        uint256 sellerAmount = esc.amount - esc.custodyAmount - totalCommission;
        
        // Pay user-defined commission
        if (esc.userCommissionBeneficiary != address(0) && esc.userCommissionAmount > 0) {
            require(mxnbs.transfer(esc.userCommissionBeneficiary, esc.userCommissionAmount), "User commission payment failed");
        }

        // Pay platform commission
        if (esc.platformCommissionBeneficiary != address(0) && esc.platformCommissionAmount > 0) {
            require(mxnbs.transfer(esc.platformCommissionBeneficiary, esc.platformCommissionAmount), "Platform commission payment failed");
        }

        // Pay seller the remaining amount
        require(mxnbs.transfer(esc.seller, sellerAmount), "Seller payment failed");

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
