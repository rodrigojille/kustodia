const { ethers } = require('ethers');

async function findRealEscrowId() {
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const txHash = '0x520cb8c866671a9497ee81df15de5fe688d608b36afab5bc4f46c99e1eb30ce1';
    
    console.log('🔍 Checking transaction logs for real escrow ID...');
    
    const receipt = await provider.getTransactionReceipt(txHash);
    console.log(`Found ${receipt.logs.length} logs in transaction`);
    
    // EscrowCreated event signature
    const escrowCreatedTopic = ethers.id("EscrowCreated(uint256,address,address,uint256,string,string)");
    
    for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        if (log.topics[0] === escrowCreatedTopic) {
            console.log(`\n✅ Found EscrowCreated event in log ${i}:`);
            const escrowId = ethers.toBigInt(log.topics[1]).toString();
            console.log(`🎯 REAL ESCROW ID: ${escrowId}`);
            return escrowId;
        }
    }
    
    console.log('❌ No EscrowCreated event found');
}

findRealEscrowId().catch(console.error);
