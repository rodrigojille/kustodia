"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletAutomationService = void 0;
exports.handlePermanentClabeDeposit = handlePermanentClabeDeposit;
const cron = __importStar(require("node-cron"));
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const WalletTransaction_1 = require("../entity/WalletTransaction");
const junoService_1 = require("./junoService");
const blockchainService_1 = require("./blockchainService");
async function handlePermanentClabeDeposit(user, amount) {
    if (!user.wallet_address) {
        console.error(`User ${user.id} does not have a wallet address. Cannot process deposit.`);
        // Optionally, create a notification for the admin/user
        return;
    }
    console.log(`Handling permanent CLABE deposit for user ${user.id}. Amount: ${amount}`);
    const walletTransactionRepo = ormconfig_1.default.getRepository(WalletTransaction_1.WalletTransaction);
    // 1. Create a preliminary transaction record
    let transaction = walletTransactionRepo.create({
        user: user,
        type: 'DEPOSIT',
        status: 'pending_bridge_transfer', // This is a valid status
        amount_mxn: amount,
        // deposit_clabe is not stored here as it's the user's permanent one
    });
    await walletTransactionRepo.save(transaction);
    try {
        // 2. Initiate the blockchain transfer
        const txHash = await (0, blockchainService_1.sendMxnbToAddress)(user.wallet_address, amount);
        console.log(`Blockchain transaction initiated for user ${user.id}. Hash: ${txHash}`);
        // 3. Update the transaction record with the hash
        transaction.blockchain_tx_hash = txHash;
        transaction.status = 'pending_blockchain_confirmation'; // The watcher service will pick it up from here
        await walletTransactionRepo.save(transaction);
    }
    catch (error) {
        console.error(`Failed to send MXNB for user ${user.id}. Error:`, error);
        // 4. Mark the transaction as failed
        transaction.status = 'failed';
        await walletTransactionRepo.save(transaction);
        // Optionally, notify the user/admin of the failure
    }
}
class WalletAutomationService {
    startDepositWatcher() {
        // Run every minute
        cron.schedule('*/1 * * * *', async () => {
            console.log('🔍 Running Wallet Deposit Watcher...');
            try {
                const walletTransactionRepo = ormconfig_1.default.getRepository(WalletTransaction_1.WalletTransaction);
                // 1. Get all local transactions pending deposit
                const pendingTransactions = await walletTransactionRepo.findBy({
                    status: 'pending_deposit',
                    type: 'DEPOSIT'
                });
                if (pendingTransactions.length === 0) {
                    console.log('No pending wallet deposits to check.');
                    return;
                }
                // 2. Get recent transactions from Juno
                // Assuming isStage=true for development environment
                const junoTransactions = await (0, junoService_1.listJunoTransactions)();
                // 3. Match transactions
                for (const tx of pendingTransactions) {
                    const matchedJunoTx = junoTransactions.find((junoTx) => junoTx.details?.clabe === tx.deposit_clabe && junoTx.category === 'DEPOSIT');
                    if (matchedJunoTx) {
                        console.log(`✅ Match found for CLABE ${tx.deposit_clabe}!`);
                        // Update local transaction record
                        tx.status = 'pending_juno_withdrawal'; // Next step in the flow
                        tx.amount_mxn = parseFloat(matchedJunoTx.amount.value);
                        tx.juno_transaction_id = matchedJunoTx.id;
                        await walletTransactionRepo.save(tx);
                        console.log(`Transaction ${tx.id} updated. Status: pending_juno_withdrawal.`);
                    }
                }
            }
            catch (error) {
                console.error('Error during wallet deposit watcher execution:', error);
            }
        });
    }
    startJunoToBridgeTransfer() {
        // Run every minute, offset by 30 seconds to avoid conflict with the deposit watcher
        cron.schedule('30 */1 * * * *', async () => {
            console.log('🔄 Running Juno to Bridge Transfer Watcher...');
            try {
                const walletTransactionRepo = ormconfig_1.default.getRepository(WalletTransaction_1.WalletTransaction);
                const pendingWithdrawals = await walletTransactionRepo.findBy({
                    status: 'pending_juno_withdrawal',
                    type: 'DEPOSIT'
                });
                if (pendingWithdrawals.length === 0) {
                    return;
                }
                for (const tx of pendingWithdrawals) {
                    // We need to convert MXN to MXNB. Assuming 1:1 for now.
                    // In a real scenario, you'd get the exchange rate.
                    const amountToWithdraw = tx.amount_mxn;
                    if (amountToWithdraw > 0) {
                        console.log(`Initiating withdrawal of ${amountToWithdraw} MXNB for transaction ${tx.id}`);
                        // Call the new service function
                        await (0, junoService_1.withdrawCryptoToBridgeWallet)(amountToWithdraw, blockchainService_1.bridgeWalletAddress);
                        // Update status to the next step
                        tx.status = 'pending_bridge_transfer';
                        await walletTransactionRepo.save(tx);
                        console.log(`Transaction ${tx.id} updated. Status: pending_bridge_transfer.`);
                    }
                }
            }
            catch (error) {
                console.error('Error during Juno to Bridge transfer execution:', error);
            }
        });
    }
    startBridgeToUserTransfer() {
        // Run every minute, offset by 45 seconds
        cron.schedule('45 */1 * * * *', async () => {
            console.log('🚀 Running Bridge to User Transfer Watcher...');
            const walletTransactionRepo = ormconfig_1.default.getRepository(WalletTransaction_1.WalletTransaction);
            const userRepo = ormconfig_1.default.getRepository(User_1.User);
            try {
                const pendingTransfers = await walletTransactionRepo.findBy({
                    status: 'pending_bridge_transfer',
                    type: 'DEPOSIT'
                });
                if (pendingTransfers.length === 0) {
                    return;
                }
                for (const tx of pendingTransfers) {
                    const user = await userRepo.findOneBy({ id: tx.user_id });
                    if (!user || !user.wallet_address) {
                        console.error(`User ${tx.user_id} or their wallet address not found for transaction ${tx.id}. Skipping.`);
                        continue;
                    }
                    console.log(`Initiating blockchain transfer for tx ${tx.id} to user ${user.id} at ${user.wallet_address}`);
                    const blockchainHash = await (0, blockchainService_1.sendMxnbToAddress)(user.wallet_address, tx.amount_mxn);
                    tx.blockchain_tx_hash = blockchainHash;
                    tx.status = 'pending_blockchain_confirmation';
                    await walletTransactionRepo.save(tx);
                    console.log(`Transaction ${tx.id} sent to blockchain. Hash: ${blockchainHash}, Status: pending_blockchain_confirmation.`);
                }
            }
            catch (error) {
                console.error('Error during Bridge to User transfer execution:', error);
            }
        });
    }
    startBlockchainConfirmationWatcher() {
        // Run every 2 minutes
        cron.schedule('*/2 * * * *', async () => {
            console.log('🔗 Running Blockchain Confirmation Watcher...');
            const walletTransactionRepo = ormconfig_1.default.getRepository(WalletTransaction_1.WalletTransaction);
            try {
                const pendingConfirmations = await walletTransactionRepo.createQueryBuilder('tx')
                    .where('tx.status = :status', { status: 'pending_blockchain_confirmation' })
                    .andWhere('tx.blockchain_tx_hash IS NOT NULL')
                    .getMany();
                if (pendingConfirmations.length === 0) {
                    return;
                }
                for (const tx of pendingConfirmations) {
                    const receipt = await (0, blockchainService_1.getTransactionReceipt)(tx.blockchain_tx_hash);
                    if (receipt && receipt.status === 1) {
                        // Success!
                        tx.status = 'completed';
                        await walletTransactionRepo.save(tx);
                        console.log(`✅ Transaction ${tx.id} confirmed and completed. Hash: ${tx.blockchain_tx_hash}`);
                    }
                    else if (receipt && receipt.status === 0) {
                        // Failed transaction
                        tx.status = 'failed'; // Or a more specific error status
                        await walletTransactionRepo.save(tx);
                        console.error(`❌ Transaction ${tx.id} failed on-chain. Hash: ${tx.blockchain_tx_hash}`);
                    }
                    else {
                        // Still pending, do nothing
                        console.log(`Transaction ${tx.id} is still pending confirmation. Hash: ${tx.blockchain_tx_hash}`);
                    }
                }
            }
            catch (error) {
                console.error('Error during Blockchain Confirmation execution:', error);
            }
        });
    }
}
exports.WalletAutomationService = WalletAutomationService;
