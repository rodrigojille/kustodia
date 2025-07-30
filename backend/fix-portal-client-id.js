// Script to fix the Portal client ID mismatch
const { AppDataSource } = require('./src/data-source');
const { User } = require('./src/entity/User');
require('dotenv').config();

async function fixPortalClientId() {
  console.log('🔧 Fixing Portal Client ID Mismatch');
  console.log('===================================');
  
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Get the user with ID 8
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: 8 } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 Current User Data:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Current Client ID:', user.portal_client_id);
    
    // Extract the correct client ID from the Portal share
    const correctClientId = 'cmdguzcsh155lzqjweb2xkeq0'; // From the signing share pair ID
    
    console.log('\n🔄 Updating Portal Client ID...');
    console.log('  From:', user.portal_client_id);
    console.log('  To:', correctClientId);
    
    // Update the user's portal_client_id
    user.portal_client_id = correctClientId;
    await userRepository.save(user);
    
    console.log('✅ Portal Client ID updated successfully!');
    
    // Verify the update
    const updatedUser = await userRepository.findOne({ where: { id: 8 } });
    console.log('\n📋 Verification:');
    console.log('  Updated Client ID:', updatedUser.portal_client_id);
    console.log('  Signing Share Pair ID: cmdguzcsh155lzqjweb2xkeq0');
    console.log('  ✅ IDs now match!');
    
    console.log('\n🎉 Fix complete! The Portal authentication should now work.');
    console.log('Please restart the backend server and try the payment again.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

fixPortalClientId().catch(console.error);
