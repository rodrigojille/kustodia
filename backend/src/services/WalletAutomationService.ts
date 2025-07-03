import * as cron from 'node-cron';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { WalletTransaction } from '../entity/WalletTransaction';
import { listJunoTransactions, withdrawCryptoToBridgeWallet } from './junoService';
import { sendMxnbToAddress, getTransactionReceipt, bridgeWalletAddress } from './blockchainService';



export class WalletAutomationService {

  public startDepositWatcher() {
    // Run every minute
    cron.schedule('*/1 * * * *', async () => {
      console.log('🔍 Running Wallet Deposit Watcher...');
      try {
        const walletTransactionRepo = AppDataSource.getRepository(WalletTransaction);
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
        const junoTransactions = await listJunoTransactions(true);

        // 3. Match transactions
        for (const tx of pendingTransactions) {
          const matchedJunoTx = junoTransactions.find(
            (junoTx: any) => junoTx.details?.clabe === tx.deposit_clabe && junoTx.category === 'DEPOSIT'
          );

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
      } catch (error) {
        console.error('Error during wallet deposit watcher execution:', error);
      }
    });
  }

  public startJunoToBridgeTransfer() {
    // Run every minute, offset by 30 seconds to avoid conflict with the deposit watcher
    cron.schedule('30 */1 * * * *', async () => {
      console.log('🔄 Running Juno to Bridge Transfer Watcher...');
      try {
        const walletTransactionRepo = AppDataSource.getRepository(WalletTransaction);
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
            await withdrawCryptoToBridgeWallet(amountToWithdraw, bridgeWalletAddress);

            // Update status to the next step
            tx.status = 'pending_bridge_transfer';
            await walletTransactionRepo.save(tx);

            console.log(`Transaction ${tx.id} updated. Status: pending_bridge_transfer.`);
          }
        }
      } catch (error) {
        console.error('Error during Juno to Bridge transfer execution:', error);
      }
    });
  }

  public startBridgeToUserTransfer() {
    // Run every minute, offset by 45 seconds
    cron.schedule('45 */1 * * * *', async () => {
      console.log('🚀 Running Bridge to User Transfer Watcher...');
      const walletTransactionRepo = AppDataSource.getRepository(WalletTransaction);
      const userRepo = AppDataSource.getRepository(User);

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

          const blockchainHash = await sendMxnbToAddress(user.wallet_address, tx.amount_mxn);

          tx.blockchain_tx_hash = blockchainHash;
          tx.status = 'pending_blockchain_confirmation';
          await walletTransactionRepo.save(tx);

          console.log(`Transaction ${tx.id} sent to blockchain. Hash: ${blockchainHash}, Status: pending_blockchain_confirmation.`);
        }
      } catch (error) {
        console.error('Error during Bridge to User transfer execution:', error);
      }
    });
  }

  public startBlockchainConfirmationWatcher() {
    // Run every 2 minutes
    cron.schedule('*/2 * * * *', async () => {
      console.log('🔗 Running Blockchain Confirmation Watcher...');
      const walletTransactionRepo = AppDataSource.getRepository(WalletTransaction);

      try {
        const pendingConfirmations = await walletTransactionRepo.createQueryBuilder('tx')
          .where('tx.status = :status', { status: 'pending_blockchain_confirmation' })
          .andWhere('tx.blockchain_tx_hash IS NOT NULL')
          .getMany();

        if (pendingConfirmations.length === 0) {
          return;
        }

        for (const tx of pendingConfirmations) {
          const receipt = await getTransactionReceipt(tx.blockchain_tx_hash!);

          if (receipt && receipt.status === 1) {
            // Success!
            tx.status = 'completed';
            await walletTransactionRepo.save(tx);
            console.log(`✅ Transaction ${tx.id} confirmed and completed. Hash: ${tx.blockchain_tx_hash}`);
          } else if (receipt && receipt.status === 0) {
            // Failed transaction
            tx.status = 'failed'; // Or a more specific error status
            await walletTransactionRepo.save(tx);
            console.error(`❌ Transaction ${tx.id} failed on-chain. Hash: ${tx.blockchain_tx_hash}`);
          } else {
            // Still pending, do nothing
            console.log(`Transaction ${tx.id} is still pending confirmation. Hash: ${tx.blockchain_tx_hash}`);
          }
        }
      } catch (error) {
        console.error('Error during Blockchain Confirmation execution:', error);
      }
    });
  }
}
