import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkCreatedEscrowId() {
    try {
        console.log('🔍 Checking what escrow ID was actually created...');
        
        // Setup provider
        const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS!;
        
        // Load contract ABI
        const abiPath = path.join(__dirname, '..', 'src', 'artifacts', 'contracts', 'KustodiaEscrow2_0.sol', 'KustodiaEscrow2_0.json');
        const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        const escrowContract = new ethers.Contract(escrowAddress, contractJson.abi, provider);
        
        // Transaction hash from our escrow creation
        const txHash = '0x520cb8c866671a9497ee81df15de5fe688d608b36afab5bc4f46c99e1eb30ce1';
        
        console.log(`📋 Transaction: ${txHash}`);
        
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            console.log('❌ Transaction receipt not found');
            return;
        }
        
        console.log(`✅ Transaction found in block ${receipt.blockNumber}`);
        
        // Parse logs to find EscrowCreated event
        const escrowCreatedEvents = receipt.logs
            .map(log => {
                try {
                    return escrowContract.interface.parseLog(log);
                } catch (e) {
                    return null;
                }
            })
            .filter(parsedLog => parsedLog && parsedLog.name === 'EscrowCreated');
        
        if (escrowCreatedEvents.length === 0) {
            console.log('❌ No EscrowCreated events found in transaction');
            return;
        }
        
        console.log(`\n🎉 Found ${escrowCreatedEvents.length} EscrowCreated event(s):`);
        
        for (const event of escrowCreatedEvents) {
            const escrowId = event.args.escrowId.toString();
            console.log(`\n📋 Escrow Created:`);
            console.log(`- Escrow ID: ${escrowId}`);
            console.log(`- Payer: ${event.args.payer}`);
            console.log(`- Payee: ${event.args.payee}`);
            console.log(`- Amount: ${ethers.formatUnits(event.args.amount, 6)} MXNB`);
            console.log(`- Vertical: ${event.args.vertical}`);
            console.log(`- CLABE: ${event.args.clabe}`);
            
            // Check the actual escrow data on-chain
            const escrow = await escrowContract.escrows(escrowId);
            console.log(`\n🔍 On-chain Escrow ${escrowId} Data:`);
            console.log(`- Status: ${escrow.status} (0=Pending, 1=Funded, 2=Released, 3=Disputed, 4=Cancelled)`);
            console.log(`- Amount: ${ethers.formatUnits(escrow.amount, 6)} MXNB`);
            console.log(`- Payer: ${escrow.payer}`);
            console.log(`- Payee: ${escrow.payee}`);
            console.log(`- Token: ${escrow.token}`);
            
            if (escrow.status === 0 && escrow.amount > 0) {
                console.log(`\n✅ Escrow ${escrowId} is valid and ready to be funded!`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking escrow:', error);
    }
}

checkCreatedEscrowId();
