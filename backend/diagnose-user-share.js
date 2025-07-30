// Diagnostic script to check user signing share
const axios = require('axios');
const { AppDataSource } = require('./src/data-source');
const { User } = require('./src/entity/User');
require('dotenv').config();

async function diagnoseUserShare() {
  console.log('🔍 User Signing Share Diagnostic');
  console.log('================================');
  
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Get the user with ID 8 (from the logs)
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: 8 } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User Info:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Wallet:', user.wallet_address);
    console.log('  Portal Client ID:', user.portal_client_id);
    console.log('  Has Portal Share:', !!user.portal_share);
    console.log('  Portal Share Length:', user.portal_share?.length || 0);
    console.log('  Portal Share Preview:', user.portal_share ? `${user.portal_share.substring(0, 50)}...` : 'none');
    
    console.log('');
    
    // Test the actual signing share with a simple operation
    if (user.portal_share) {
      console.log('🔐 Testing Portal Share with MPC API...');
      
      const apiKey = process.env.PORTAL_CUSTODIAN_API_KEY;
      
      try {
        // Try a simple eth_accounts call first
        const response = await axios.post('https://mpc-client.portalhq.io/v1/sign', {
          share: user.portal_share,
          method: 'eth_accounts',
          params: '[]',
          chainId: 'eip155:421614',
          rpcUrl: 'https://api.portalhq.io/rpc/v1/eip155/421614'
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Portal Share test successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
      } catch (error) {
        console.log('❌ Portal Share test failed!');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
        
        // Try to understand the specific error
        if (error.response?.data?.id === 'AUTH_FAILED') {
          console.log('');
          console.log('🚨 AUTH_FAILED Error Analysis:');
          console.log('This could mean:');
          console.log('1. The signing share is corrupted or invalid');
          console.log('2. The signing share belongs to a different API key/custodian');
          console.log('3. The signing share format is incorrect');
          console.log('4. There\'s a mismatch between client ID and signing share');
        }
      }
      
      console.log('');
      
      // Test with the exact same payload as the failing transaction
      console.log('🔄 Testing with actual transaction payload...');
      try {
        const response = await axios.post('https://mpc-client.portalhq.io/v1/sign', {
          share: user.portal_share,
          method: 'eth_sendTransaction',
          params: JSON.stringify({
            to: '0x82B9e52b26A2954E113F94Ff26647754d5a4247D',
            data: '0x095ea7b3000000000000000000000000c4109e3d5b6cd1b5b8b0e3b4e8d8f8a5c8e8f8a5000000000000000000000000000000000000000000000000016345785d8a0000',
            value: '0x0'
          }),
          chainId: 'eip155:421614',
          rpcUrl: 'https://api.portalhq.io/rpc/v1/eip155/421614'
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Transaction test successful!');
        console.log('Transaction Hash:', response.data.result);
        
      } catch (error) {
        console.log('❌ Transaction test failed!');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

diagnoseUserShare().catch(console.error);
