const axios = require('axios');

// Test car data
const testCarData = {
  vin: "1HGBH41JXMN109186",
  make: "Honda",
  model: "Civic",
  year: 2023,
  color: "Azul",
  mileage: 15000,
  condition: "Seminuevo",
  plateNumber: "ABC-123-MX",
  ownerAddress: "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b" // Kustodia deployer address
};

async function createTestCarNFT() {
  try {
    console.log('🚗 Creating test car NFT...');
    console.log('Car data:', JSON.stringify(testCarData, null, 2));
    
    const response = await axios.post('http://localhost:4000/api/assets/vehicle', testCarData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Car NFT created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.tokenId) {
      console.log(`🎉 Token ID: ${response.data.tokenId}`);
      console.log(`📋 Transaction Hash: ${response.data.transactionHash}`);
      console.log(`🔗 View on Arbiscan: https://sepolia.arbiscan.io/tx/${response.data.transactionHash}`);
    }
    
  } catch (error) {
    console.error('❌ Error creating car NFT:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
createTestCarNFT();
