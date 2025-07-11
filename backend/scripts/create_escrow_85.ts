import ormconfig from '../src/ormconfig';
import { Payment } from '../src/entity/Payment';
import { Escrow } from '../src/entity/Escrow';
import { createEscrow } from '../src/services/escrowService';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function createEscrowForPayment85() {
    console.log('🚀 Starting escrow creation for Payment 85, Escrow 73...');
    console.log('Environment path loaded from:', envPath);
    console.log('Database URL:', process.env.DATABASE_URL);
    
    try {
        // Initialize database connection
        if (!ormconfig.isInitialized) {
            await ormconfig.initialize();
            console.log('✅ Database connected');
        }

        // Verify environment variables
        console.log('🔧 Environment variables:');
        console.log(`- Contract Address: ${process.env.KUSTODIA_ESCROW_V2_ADDRESS}`);
        console.log(`- Bridge Wallet: ${process.env.BRIDGE_WALLET_ADDRESS}`);
        console.log(`- MXNB Token: ${process.env.MXNB_CONTRACT_SEPOLIA}`);
        
        // Debug: Check what wallet address the private key corresponds to
        const { ethers } = require('ethers');
        const tempWallet = new ethers.Wallet(process.env.ESCROW_PRIVATE_KEY!);
        console.log(`- Private Key Wallet: ${tempWallet.address}`);
        console.log(`- Addresses Match: ${tempWallet.address.toLowerCase() === process.env.BRIDGE_WALLET_ADDRESS!.toLowerCase()}`);
        console.log();

        // Get payment and escrow from database
        const paymentRepository = ormconfig.getRepository(Payment);
        const escrowRepository = ormconfig.getRepository(Escrow);

        const payment = await paymentRepository.findOne({
            where: { id: 85 },
            relations: ['user', 'seller', 'escrow']
        });

        if (!payment) {
            throw new Error('Payment 85 not found');
        }

        // Debug: Check the raw payment data
        console.log('🔍 Raw payment data:');
        console.log(`- user_id: ${(payment as any).user_id}`);
        console.log(`- seller_id: ${(payment as any).seller_id}`);
        console.log(`- user loaded: ${!!payment.user}`);
        console.log(`- seller loaded: ${!!payment.seller}`);
        console.log();

        const escrow = await escrowRepository.findOne({
            where: { id: 73 },
            relations: ['payment']
        });

        if (!escrow) {
            throw new Error('Escrow 73 not found');
        }

        console.log('📋 Payment and Escrow Details:');
        console.log(`- Payment ID: ${payment.id}`);
        console.log(`- Payment Status: ${payment.status}`);
        console.log(`- Payment Amount: ${payment.amount} MXN`);
        console.log(`- Actual User: ${payment.user ? payment.user.wallet_address : 'NULL'}`);
        console.log(`- Actual Seller: ${payment.seller ? payment.seller.wallet_address : 'NULL'}`);
        console.log(`- Deposit CLABE: ${payment.deposit_clabe}`);
        console.log(`- Escrow ID: ${escrow.id}`);
        console.log(`- Escrow Status: ${escrow.status}`);
        console.log();
        console.log('🌐 Smart Contract Details:');
        console.log(`- Contract uses bridge wallet for both payer and payee`);
        console.log(`- Bridge Wallet: ${process.env.BRIDGE_WALLET_ADDRESS}`);
        console.log();

        // Database maintains proper business relationships, smart contract uses bridge wallet
        if (!payment.user) {
            console.log('⚠️ Warning: Payment user relation is missing');
        }
        if (!payment.seller) {
            console.log('⚠️ Warning: Payment seller relation is missing');
        }
        
        console.log('ℹ️ V2 Contract: Using bridge wallet as both payer and payee for blockchain operations');

        // Check if payment is in correct status for escrow creation
        if (payment.status !== 'withdrawn') {
            console.log(`❌ Payment status is '${payment.status}', but should be 'withdrawn' for escrow creation`);
            return;
        }

        if (escrow.status !== 'pending') {
            console.log(`❌ Escrow status is '${escrow.status}', but should be 'pending' for escrow creation`);
            return;
        }

        console.log('✅ Payment and escrow are in correct status for creation');
        console.log();

        // Prepare escrow parameters - V2 contract uses bridge wallet for both
        const payer = process.env.BRIDGE_WALLET_ADDRESS!; // Bridge wallet as payer
        const payee = process.env.BRIDGE_WALLET_ADDRESS!; // Bridge wallet as payee
        const token = process.env.MXNB_CONTRACT_SEPOLIA; // MXNB token address
        const amount = Math.floor(payment.amount * 1000000).toString(); // Convert MXN to 6-decimal token amount
        const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60); // 2 days from now
        const vertical = 0; // Default vertical type
        const clabe = payment.deposit_clabe || '';
        const conditions = 'Standard payment conditions';

        console.log('🔨 Escrow Creation Parameters:');
        console.log(`- Payer: ${payer}`);
        console.log(`- Payee: ${payee}`);
        console.log(`- Token: ${token}`);
        console.log(`- Amount: ${amount} (6 decimals)`);
        console.log(`- Deadline: ${deadline} (${new Date(deadline * 1000).toISOString()})`);
        console.log(`- Vertical: ${vertical}`);
        console.log(`- CLABE: ${clabe}`);
        console.log(`- Conditions: ${conditions}`);
        console.log();

        // Create escrow on blockchain
        console.log('⛓️ Creating escrow on blockchain...');
        const result = await createEscrow({
            payer,
            payee,
            token: token!,
            amount,
            deadline,
            vertical: vertical.toString(),
            clabe,
            conditions
        });

        console.log('✅ Escrow created successfully!');
        console.log(`- Escrow ID on contract: ${result.escrowId}`);
        console.log(`- Transaction Hash: ${result.txHash}`);
        console.log();

        // Update escrow in database
        console.log('💾 Updating escrow in database...');
        escrow.smart_contract_escrow_id = result.escrowId;
        escrow.blockchain_tx_hash = result.txHash;
        escrow.status = 'active';
        escrow.custody_end = new Date(deadline * 1000);

        await escrowRepository.save(escrow);

        // Update payment status
        payment.status = 'escrowed';
        await paymentRepository.save(payment);

        console.log('✅ Database updated successfully!');
        console.log(`- Escrow status: ${escrow.status}`);
        console.log(`- Payment status: ${payment.status}`);
        console.log(`- Custody end: ${escrow.custody_end}`);
        console.log();

        console.log('🎉 Escrow creation completed successfully!');
        console.log('📋 Summary:');
        console.log(`- Payment 85 status: ${payment.status}`);
        console.log(`- Escrow 73 status: ${escrow.status}`);
        console.log(`- Contract Escrow ID: ${escrow.smart_contract_escrow_id}`);
        console.log(`- Transaction: ${escrow.blockchain_tx_hash}`);

    } catch (error) {
        console.error('❌ Error creating escrow:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
        }
    } finally {
        if (ormconfig.isInitialized) {
            await ormconfig.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
if (require.main === module) {
    console.log('📄 Script started directly');
    createEscrowForPayment85().catch((error) => {
        console.error('❌ Unhandled error:', error);
        process.exit(1);
    }).finally(() => {
        console.log('📄 Script execution completed');
    });
}
