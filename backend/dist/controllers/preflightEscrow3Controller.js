"use strict";
// preflightEscrow3Controller.ts
// Returns contract/token/wallet info for escrow signature, WITHOUT creating a payment record
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preflightEscrow3 = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const ESCROW3_CONTRACT_ADDRESS = process.env.ESCROW3_CONTRACT_ADDRESS;
const MXNBS_CONTRACT_ADDRESS = process.env.MXNB_CONTRACT_ADDRESS;
const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;
const escrowAbi = [
    "event EscrowCreated(uint256 indexed smart_contract_escrow_id, address indexed payer, address indexed seller, uint256 amount, uint256 custodyAmount, address commission)",
    "event EscrowReleased(uint256 indexed smart_contract_escrow_id, address indexed to)",
    "event CustodyReleased(uint256 indexed smart_contract_escrow_id, address indexed to)",
    "event EscrowDisputed(uint256 indexed smart_contract_escrow_id, address indexed by)",
    "event EscrowResolved(uint256 indexed smart_contract_escrow_id, address indexed winner)"
];
const preflightEscrow3 = async (req, res) => {
    try {
        const { recipient_email, amount, custody_percent, custody_days, commission_percent, commission_beneficiary_email, description } = req.body;
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        // Validate input
        if (!recipient_email || !amount || !custody_percent || !custody_days) {
            return res.status(400).json({ error: "Missing required parameters." });
        }
        const payer = req.user;
        if (!payer)
            return res.status(401).json({ error: "Unauthorized" });
        // Fetch payer and recipient from DB
        const payerUser = await userRepo.findOne({ where: { id: payer.id } });
        const recipientUser = await userRepo.findOne({ where: { email: recipient_email } });
        if (!payerUser || !recipientUser) {
            return res.status(404).json({ error: "Payer or recipient not found." });
        }
        if (!payerUser.wallet_address || !payerUser.portal_share) {
            return res.status(400).json({ error: "Payer wallet not configured." });
        }
        if (!recipientUser.wallet_address) {
            return res.status(400).json({ error: "Recipient wallet not configured." });
        }
        // Prepare commission info
        let commission_wallet = null;
        if (commission_beneficiary_email) {
            const commissionUser = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
            if (!commissionUser || !commissionUser.wallet_address) {
                return res.status(400).json({ error: "Commission beneficiary wallet not configured." });
            }
            commission_wallet = commissionUser.wallet_address;
        }
        // Calculate custody and commission amounts
        const amt = Number(amount);
        const custodyAmt = Math.round((amt * Number(custody_percent)) / 100);
        // Commission is only for display; not needed for signature
        // Return info for frontend to construct on-chain tx (NO DB writes)
        res.json({
            payer_wallet: payerUser.wallet_address,
            payer_portal_share: payerUser.portal_share,
            recipient_wallet: recipientUser.wallet_address,
            commission_wallet,
            backendAmount: amt,
            custody_amount: custodyAmt,
            custody_days,
            contract: {
                address: ESCROW3_CONTRACT_ADDRESS,
                abi: escrowAbi
            },
            token: {
                address: MXNBS_CONTRACT_ADDRESS
            },
            rpc_url: ARBITRUM_SEPOLIA_RPC_URL
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.preflightEscrow3 = preflightEscrow3;
