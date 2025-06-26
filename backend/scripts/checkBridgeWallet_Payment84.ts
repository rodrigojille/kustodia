import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { ethers } from "ethers";

async function main() {
  // Arbitrum testnet configuration
  const RPC_URL = process.env.ETH_RPC_URL!;
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  // Bridge wallet address
  const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET!;
  const TOKEN_ADDRESS = process.env.MOCK_ERC20_ADDRESS!; // MXNB
  
  console.log(`🔍 Checking Bridge Wallet Balance:`);
  console.log(`Bridge Wallet: ${BRIDGE_WALLET}`);
  console.log(`MXNB Token: ${TOKEN_ADDRESS}`);
  
  // ERC20 ABI for balanceOf
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];
  
  try {
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    
    // Get token details
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    
    // Get bridge wallet balance
    const balance = await tokenContract.balanceOf(BRIDGE_WALLET);
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    
    console.log(`\n💰 Bridge Wallet Balance:`);
    console.log(`${formattedBalance} ${symbol}`);
    
    // Check if we still have the 5000 MXNB that should have been transferred to escrow
    const expectedEscrowAmount = 5000;
    const hasEnoughForEscrow = parseFloat(formattedBalance) >= expectedEscrowAmount;
    
    console.log(`\n📊 Analysis:`);
    console.log(`Expected escrow amount: ${expectedEscrowAmount} MXNB`);
    console.log(`Bridge wallet has enough for escrow: ${hasEnoughForEscrow ? '✅ YES' : '❌ NO'}`);
    
    if (hasEnoughForEscrow) {
      console.log(`\n⚠️  ISSUE CONFIRMED: Bridge wallet still has ${formattedBalance} ${symbol}`);
      console.log(`This suggests the escrow creation did NOT transfer tokens to the smart contract.`);
      console.log(`The escrow contract was created but not funded!`);
    } else {
      console.log(`\n✅ Bridge wallet has been depleted, tokens likely transferred to escrow.`);
    }
    
  } catch (error) {
    console.error("❌ Error checking bridge wallet balance:", error);
  }
}

main().catch(console.error);
