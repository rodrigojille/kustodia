import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fundEscrow() {
    try {
        console.log('💰 Funding escrow ID 5 with 1000 MXNB...');
        
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        const wallet = new ethers.Wallet(process.env.ESCROW_PRIVATE_KEY!, provider);
        
        // Contract addresses
        const tokenAddress = process.env.MXNB_CONTRACT_SEPOLIA!;
        const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS!;
        
        console.log(`📋 Details:`);
        console.log(`- From Wallet: ${wallet.address}`);
        console.log(`- To Escrow Contract: ${escrowAddress}`);
        console.log(`- Token: ${tokenAddress}`);
        console.log(`- Amount: 1000 MXNB`);
        
        // ERC20 ABI for transfer
        const erc20Abi = [
            "function transfer(address to, uint256 amount) returns (bool)",
            "function balanceOf(address owner) view returns (uint256)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
        ];
        
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
        
        // Check current balances
        const walletBalance = await tokenContract.balanceOf(wallet.address);
        const escrowBalance = await tokenContract.balanceOf(escrowAddress);
        const decimals = await tokenContract.decimals();
        const symbol = await tokenContract.symbol();
        
        console.log(`\n💰 Current Balances:`);
        console.log(`- Wallet: ${ethers.formatUnits(walletBalance, decimals)} ${symbol}`);
        console.log(`- Escrow: ${ethers.formatUnits(escrowBalance, decimals)} ${symbol}`);
        
        // Transfer amount
        const transferAmount = ethers.parseUnits('1000', decimals);
        
        if (walletBalance < transferAmount) {
            console.log(`❌ Insufficient balance! Need 1000 ${symbol}, have ${ethers.formatUnits(walletBalance, decimals)}`);
            return;
        }
        
        console.log(`\n🚀 Transferring 1000 ${symbol} to escrow contract...`);
        const tx = await tokenContract.transfer(escrowAddress, transferAmount);
        console.log(`📝 Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Transfer completed! Block: ${receipt.blockNumber}`);
        
        // Check new balances
        const newWalletBalance = await tokenContract.balanceOf(wallet.address);
        const newEscrowBalance = await tokenContract.balanceOf(escrowAddress);
        
        console.log(`\n💰 New Balances:`);
        console.log(`- Wallet: ${ethers.formatUnits(newWalletBalance, decimals)} ${symbol}`);
        console.log(`- Escrow: ${ethers.formatUnits(newEscrowBalance, decimals)} ${symbol}`);
        console.log(`\n🎉 Escrow ID 5 is now funded with 1000 ${symbol}!`);
        
    } catch (error) {
        console.error('❌ Error funding escrow:', error);
    }
}

fundEscrow();
