const { createConnection } = require('typeorm');
const ormConfig = require('./dist/ormconfig').default;

async function makeUserAdmin() {
  try {
    console.log('🔧 Connecting to database...');
    const connection = await createConnection(ormConfig);
    
    const userRepo = connection.getRepository('User');
    const targetEmail = 'rodrigojille6@gmail.com';
    
    console.log(`🔍 Looking for user: ${targetEmail}`);
    const user = await userRepo.findOne({ where: { email: targetEmail } });
    
    if (!user) {
      console.log(`❌ User ${targetEmail} not found!`);
      await connection.close();
      return;
    }
    
    console.log(`👤 Found user:`, {
      id: user.id,
      email: user.email,
      current_role: user.role,
      full_name: user.full_name
    });
    
    if (user.role === 'admin') {
      console.log('✅ User is already an admin!');
    } else {
      console.log('🔄 Updating user role to admin...');
      user.role = 'admin';
      await userRepo.save(user);
      console.log('✅ Successfully made user an admin!');
    }
    
    await connection.close();
    console.log('🔐 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  }
}

makeUserAdmin();
