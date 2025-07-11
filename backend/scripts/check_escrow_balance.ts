import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkEscrowBalance() {
    try {
        console.log('🔍 Checking MXNB token balance in escrow contract...');
        
        // Setup provider
        const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        
        // MXNB Token contract
        const tokenAddress = process.env.MXNB_CONTRACT_SEPOLIA!;
        const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS!;
        const bridgeWalletAddress = process.env.BRIDGE_WALLET_ADDRESS!;
        
        // ERC20 ABI for balanceOf
        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
        ];
        
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
        
        // Check balances
        const escrowBalance = await tokenContract.balanceOf(escrowAddress);
        const bridgeBalance = await tokenContract.balanceOf(bridgeWalletAddress);
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        
        console.log('\n📊 Token Balances:');
        console.log(`- Token: ${symbol} (${tokenAddress})`);
        console.log(`- Decimals: ${decimals}`);
        console.log(`- Escrow Contract (${escrowAddress}): ${ethers.formatUnits(escrowBalance, decimals)} ${symbol}`);
        console.log(`- Bridge Wallet (${bridgeWalletAddress}): ${ethers.formatUnits(bridgeBalance, decimals)} ${symbol}`);
        
        // Check if escrow has the expected 1000 MXNB
        const expectedAmount = ethers.parseUnits('1000', decimals);
        console.log('\n🎯 Expected vs Actual:');
        console.log(`- Expected in escrow: 1000 ${symbol}`);
        console.log(`- Actual in escrow: ${ethers.formatUnits(escrowBalance, decimals)} ${symbol}`);
        console.log(`- Transfer successful: ${escrowBalance >= expectedAmount ? '✅ YES' : '❌ NO'}`);
        
    } catch (error) {
        console.error('❌ Error checking balances:', error);
    }
}

checkEscrowBalance();
