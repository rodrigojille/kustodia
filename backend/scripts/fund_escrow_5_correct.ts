import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fundEscrowCorrectly() {
    try {
        console.log('💰 Funding escrow ID 5 using fundEscrow() function...');
        
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        const wallet = new ethers.Wallet(process.env.ESCROW_PRIVATE_KEY!, provider);
        
        // Contract addresses
        const tokenAddress = process.env.MXNB_CONTRACT_SEPOLIA!;
        const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS!;
        
        console.log(`📋 Details:`);
        console.log(`- Bridge Wallet: ${wallet.address}`);
        console.log(`- Escrow Contract: ${escrowAddress}`);
        console.log(`- Token: ${tokenAddress}`);
        console.log(`- Escrow ID: 5`);
        
        // Load contract ABI
        const abiPath = path.join(__dirname, '..', 'src', 'artifacts', 'contracts', 'KustodiaEscrow2_0.sol', 'KustodiaEscrow2_0.json');
        const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        const escrowContract = new ethers.Contract(escrowAddress, contractJson.abi, wallet);
        
        // ERC20 ABI for approval
        const erc20Abi = [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function balanceOf(address owner) view returns (uint256)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
        ];
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
        
        // Check escrow details
        const escrow = await escrowContract.escrows(5);
        console.log(`\n🔍 Escrow 5 Status:`);
        console.log(`- Status: ${escrow.status} (0=Pending, 1=Funded, 2=Released, 3=Disputed, 4=Cancelled)`);
        console.log(`- Amount: ${ethers.formatUnits(escrow.amount, 6)} MXNB`);
        console.log(`- Payer: ${escrow.payer}`);
        console.log(`- Payee: ${escrow.payee}`);
        
        if (escrow.payer === '0x0000000000000000000000000000000000000000' || escrow.amount === 0n) {
            console.log(`❌ Escrow ID 5 does not exist or is empty`);
            console.log(`- Need to check what escrow ID was actually created`);
            return;
        }
        
        if (escrow.status !== 0) {
            console.log(`❌ Escrow is not in Pending status. Current status: ${escrow.status}`);
            return;
        }
        
        // Check current allowance
        const currentAllowance = await tokenContract.allowance(wallet.address, escrowAddress);
        const decimals = await tokenContract.decimals();
        const requiredAmount = escrow.amount;
        
        console.log(`\n💳 Allowance Check:`);
        console.log(`- Current Allowance: ${ethers.formatUnits(currentAllowance, decimals)} MXNB`);
        console.log(`- Required Amount: ${ethers.formatUnits(requiredAmount, decimals)} MXNB`);
        
        // Approve if needed
        if (currentAllowance < requiredAmount) {
            console.log(`🔓 Approving token spend...`);
            const approveTx = await tokenContract.approve(escrowAddress, requiredAmount);
            await approveTx.wait();
            console.log(`✅ Approval completed: ${approveTx.hash}`);
        } else {
            console.log(`✅ Sufficient allowance already exists`);
        }
        
        // Fund the escrow
        console.log(`\n🚀 Calling fundEscrow(5)...`);
        const fundTx = await escrowContract.fundEscrow(5);
        console.log(`📝 Transaction hash: ${fundTx.hash}`);
        
        const receipt = await fundTx.wait();
        console.log(`✅ Escrow funded successfully! Block: ${receipt.blockNumber}`);
        
        // Check new status
        const updatedEscrow = await escrowContract.escrows(5);
        console.log(`\n🎉 Updated Escrow 5 Status:`);
        console.log(`- Status: ${updatedEscrow.status} (should be 1=Funded)`);
        console.log(`- Escrow is now properly funded! 🎉`);
        
    } catch (error) {
        console.error('❌ Error funding escrow:', error);
    }
}

fundEscrowCorrectly();
