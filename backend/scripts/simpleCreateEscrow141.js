require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { DataSource } = require('typeorm');

// Database connection
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '140290',
    database: process.env.DB_NAME || 'kustodia',
    synchronize: false,
    logging: false,
    entities: ['../src/entities/*.ts'],
});

async function createEscrowForPayment141() {
    try {
        console.log('🚀 Creating escrow for Payment 141 using simple approach...');
        
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        // Check Payment 141 status
        const paymentData = await AppDataSource.query(`
            SELECT p.id, p.status, p.amount, p.deposit_clabe, p.vertical_type,
                   e.id as escrow_id, e.status as escrow_status, e.custody_amount, 
                   e.custody_end, e.smart_contract_escrow_id
            FROM payment p
            LEFT JOIN escrow e ON p.escrow_id = e.id
            WHERE p.id = 141
        `);

        if (paymentData.length === 0) {
            throw new Error('Payment 141 not found');
        }

        const payment = paymentData[0];
        console.log('📋 Payment 141 details:');
        console.log('  - Status:', payment.status);
        console.log('  - Amount:', payment.amount, 'MXN');
        console.log('  - Custody Amount:', payment.custody_amount, 'MXN');
        console.log('  - Escrow Status:', payment.escrow_status);
        console.log('  - Smart Contract ID:', payment.smart_contract_escrow_id);

        // Setup blockchain connection
        const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        const bridgeWallet = new ethers.Wallet(process.env.ESCROW_PRIVATE_KEY, provider);
        
        console.log('🔗 Bridge wallet address:', bridgeWallet.address);
        console.log('🏦 Expected bridge wallet:', process.env.ESCROW_BRIDGE_WALLET);

        // Use the correct environment variables
        const tokenAddress = process.env.MXNB_CONTRACT_ADDRESS;
        const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS;
        
        console.log('📝 Contract addresses:');
        console.log('  - MXNB Token:', tokenAddress);
        console.log('  - Escrow Contract:', escrowAddress);

        // Check MXNB balance
        const mxnbContract = new ethers.Contract(
            tokenAddress,
            [
                'function balanceOf(address) view returns (uint256)',
                'function decimals() view returns (uint8)',
                'function approve(address spender, uint256 amount) returns (bool)',
                'function allowance(address owner, address spender) view returns (uint256)'
            ],
            bridgeWallet
        );

        const balance = await mxnbContract.balanceOf(bridgeWallet.address);
        const decimals = await mxnbContract.decimals();
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        console.log('💰 Bridge wallet MXNB balance:', balanceFormatted);

        const custodyAmountWei = ethers.parseUnits(payment.custody_amount.toString(), decimals);
        console.log('📊 Custody amount:', payment.custody_amount, 'MXNB');

        if (balance < custodyAmountWei) {
            throw new Error(`Insufficient MXNB balance. Need: ${payment.custody_amount}, Have: ${balanceFormatted}`);
        }

        // Check current allowance
        const currentAllowance = await mxnbContract.allowance(bridgeWallet.address, escrowAddress);
        console.log('🔍 Current allowance:', ethers.formatUnits(currentAllowance, decimals));

        if (currentAllowance < custodyAmountWei) {
            console.log('📝 Approving MXNB spending...');
            const approveTx = await mxnbContract.approve(escrowAddress, custodyAmountWei);
            await approveTx.wait();
            console.log('✅ MXNB approval confirmed:', approveTx.hash);
        } else {
            console.log('✅ MXNB already approved');
        }

        // Calculate deadline
        const custodyEndDate = new Date(payment.custody_end);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const custodyEndTimestamp = Math.floor(custodyEndDate.getTime() / 1000);
        
        let deadline;
        if (custodyEndTimestamp <= currentTimestamp) {
            const futureDate = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours from now
            deadline = Math.floor(futureDate.getTime() / 1000);
            console.log('⏰ Original deadline passed, setting new deadline:', new Date(deadline * 1000).toISOString());
        } else {
            deadline = custodyEndTimestamp;
            console.log('⏰ Using original deadline:', custodyEndDate.toISOString());
        }

        // Try a simpler escrow creation approach - let's first check what escrows exist
        console.log('🔍 Checking existing escrows...');
        const escrowContract = new ethers.Contract(
            escrowAddress,
            [
                'function escrowCount() view returns (uint256)',
                'function escrows(uint256) view returns (address, address, address, uint256, uint256, bool, bool, string, string, string)',
                'function createEscrow(address, uint256, address, address, uint256, string, string, string) returns (uint256)'
            ],
            bridgeWallet
        );

        const escrowCount = await escrowContract.escrowCount();
        console.log('📊 Current escrow count:', escrowCount.toString());

        // Create the escrow with the simpler function signature
        console.log('🔨 Creating escrow on smart contract...');
        
        try {
            const createEscrowTx = await escrowContract.createEscrow(
                tokenAddress,                    // token
                custodyAmountWei,               // amount
                bridgeWallet.address,           // payer
                bridgeWallet.address,           // payee
                deadline,                       // deadline
                payment.vertical_type || '',   // vertical
                payment.deposit_clabe || '',   // clabe
                'Payment 141 escrow'           // conditions
            );

            console.log('⏳ Waiting for escrow creation confirmation...');
            const receipt = await createEscrowTx.wait();
            console.log('✅ Escrow creation confirmed:', createEscrowTx.hash);

            // Get the new escrow ID
            const newEscrowCount = await escrowContract.escrowCount();
            const smartContractEscrowId = newEscrowCount.toString();
            console.log('🆔 Smart contract escrow ID:', smartContractEscrowId);

            // Update database
            console.log('💾 Updating database...');
            await AppDataSource.query(`
                UPDATE escrow 
                SET smart_contract_escrow_id = $1, status = 'active', blockchain_tx_hash = $2, updated_at = NOW()
                WHERE id = $3
            `, [smartContractEscrowId, createEscrowTx.hash, payment.escrow_id]);

            await AppDataSource.query(`
                UPDATE payment 
                SET status = 'escrowed', updated_at = NOW()
                WHERE id = $1
            `, [payment.id]);

            // Create payment event
            await AppDataSource.query(`
                INSERT INTO payment_event (payment_id, event_type, details, created_at, is_automatic)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [
                payment.id,
                'escrow_created',
                JSON.stringify({
                    escrow_id: payment.escrow_id,
                    smart_contract_escrow_id: smartContractEscrowId,
                    custody_amount: payment.custody_amount,
                    transaction_hash: createEscrowTx.hash,
                    deadline: new Date(deadline * 1000).toISOString(),
                    manual_completion: true
                }),
                false
            ]);

            console.log('🎉 Escrow creation completed successfully!');
            console.log('📊 Summary:');
            console.log('  - Payment ID:', payment.id);
            console.log('  - Escrow ID:', payment.escrow_id);
            console.log('  - Smart Contract Escrow ID:', smartContractEscrowId);
            console.log('  - Custody Amount:', payment.custody_amount, 'MXNB');
            console.log('  - Transaction Hash:', createEscrowTx.hash);
            console.log('  - Release Date:', new Date(deadline * 1000).toISOString());

            // Verify final state
            const finalCheck = await AppDataSource.query(`
                SELECT p.id, p.status, e.status as escrow_status, e.smart_contract_escrow_id, e.custody_end, e.blockchain_tx_hash
                FROM payment p 
                JOIN escrow e ON p.escrow_id = e.id 
                WHERE p.id = $1
            `, [payment.id]);
            
            console.log('🔍 Final state:', finalCheck[0]);
            console.log('\n✅ Payment 141 escrow is now active and ready for release!');

        } catch (contractError) {
            console.error('❌ Contract call failed:', contractError.message);
            
            // Let's try to get more information about the contract
            console.log('\n🔍 Debugging contract state...');
            try {
                const escrowInfo = await escrowContract.escrows(1); // Check escrow 1 as example
                console.log('📋 Example escrow 1 structure:', escrowInfo);
            } catch (debugError) {
                console.log('⚠️ Could not read escrow structure:', debugError.message);
            }
            
            throw contractError;
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.reason) {
            console.error('Error reason:', error.reason);
        }
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
createEscrowForPayment141().catch(console.error);
