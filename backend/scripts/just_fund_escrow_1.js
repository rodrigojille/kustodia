require('dotenv').config();
const { ethers } = require('ethers');

async function justFundIt() {
    console.log('🚀 Just funding escrow 1...');
    
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ESCROW_PRIVATE_KEY, provider);
    
    // Token and escrow addresses
    const tokenAddress = process.env.MXNB_CONTRACT_SEPOLIA;
    const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS;
    const amount = ethers.parseUnits('1000', 6); // 1000 MXNB
    
    console.log(`💳 Bridge wallet: ${wallet.address}`);
    console.log(`📝 Approving 1000 MXNB...`);
    
    // Approve tokens
    const tokenAbi = ['function approve(address,uint256) returns(bool)'];
    const token = new ethers.Contract(tokenAddress, tokenAbi, wallet);
    const approveTx = await token.approve(escrowAddress, amount);
    await approveTx.wait();
    console.log(`✅ Approved: ${approveTx.hash}`);
    
    console.log(`💰 Funding escrow 1...`);
    
    // Fund escrow
    const escrowAbi = ['function fundEscrow(uint256) external'];
    const escrow = new ethers.Contract(escrowAddress, escrowAbi, wallet);
    const fundTx = await escrow.fundEscrow(1);
    await fundTx.wait();
    
    console.log(`🎉 DONE! Escrow 1 funded: ${fundTx.hash}`);
}

justFundIt().catch(console.error);
