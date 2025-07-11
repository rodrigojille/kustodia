require('dotenv').config();
const { ethers } = require('ethers');

async function checkNextEscrowId() {
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS;
    
    // Simple ABI for nextEscrowId
    const abi = ["function nextEscrowId() view returns (uint256)"];
    const contract = new ethers.Contract(escrowAddress, abi, provider);
    
    const nextId = await contract.nextEscrowId();
    console.log(`🔍 Current nextEscrowId: ${nextId}`);
    console.log(`📝 This means the last created escrow was ID: ${nextId - 1n}`);
    
    // Our escrow was likely created as ID: (nextId - 1)
    const likelyEscrowId = (nextId - 1n).toString();
    console.log(`\n🎯 Our escrow is likely ID: ${likelyEscrowId}`);
    
    return likelyEscrowId;
}

checkNextEscrowId().catch(console.error);
