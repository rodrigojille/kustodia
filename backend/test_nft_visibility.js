async function testNFTVisibility() {
  console.log('🔍 Testing NFT Visibility Fixes...\n');
  
  try {
    const AssetNFTServiceClass = require('./dist/services/assetNFTService.js').default;
    const assetNFTService = new AssetNFTServiceClass();
    
    // Test 1: Check if owner can see their NFT
    console.log('📋 Test 1: Getting user assets for owner...');
    const ownerAddress = '0x164b4A9560aaa5B97D4beEB3b92725eFfF267447';
    
    try {
      const userAssets = await assetNFTService.getUserAssets(ownerAddress);
      console.log('✅ getUserAssets successful!');
      console.log('📊 User assets found:', userAssets.length);
      console.log('🎯 Assets:', userAssets);
    } catch (error) {
      console.log('❌ getUserAssets failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Check if we can get NFT metadata
    console.log('📋 Test 2: Getting asset metadata for Token ID 1...');
    
    try {
      const metadata = await assetNFTService.getAssetMetadata('1');
      console.log('✅ getAssetMetadata successful!');
      console.log('📊 Metadata retrieved:');
      console.log('  - Token ID:', metadata.tokenId);
      console.log('  - Owner:', metadata.owner);
      console.log('  - Token URI:', metadata.tokenURI);
      console.log('  - Asset Data:', metadata.metadata);
      console.log('  - History Events:', metadata.history?.length || 0);
    } catch (error) {
      console.log('❌ getAssetMetadata failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Check if token exists
    console.log('📋 Test 3: Checking if Token ID 1 exists...');
    
    try {
      const exists = await assetNFTService.tokenExists('1');
      console.log('✅ tokenExists check successful!');
      console.log('📊 Token 1 exists:', exists);
    } catch (error) {
      console.log('❌ tokenExists failed:', error.message);
    }
    
    console.log('\n🎉 NFT Visibility Test Complete!');
    
  } catch (error) {
    console.error('💥 Test setup failed:', error);
  }
}

// Run the test
testNFTVisibility().catch(console.error);
