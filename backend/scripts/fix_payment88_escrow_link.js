require('dotenv').config({ path: './backend/.env' });
const { DataSource } = require('typeorm');
const path = require('path');

// Import entities
const Payment = require('../dist/entity/Payment').Payment;
const Escrow = require('../dist/entity/Escrow').Escrow;

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "kustodia",
  entities: [Payment, Escrow],
  synchronize: false,
  logging: true,
});

async function fixPayment88EscrowLink() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected!");

    // Check current payment 88
    console.log('=== CURRENT PAYMENT 88 STATUS ===');
    const payment = await AppDataSource.getRepository(Payment).findOne({
      where: { id: 88 },
      relations: ['escrow']
    });
    
    if (!payment) {
      console.log('❌ Payment 88 not found');
      return;
    }
    
    console.log(`Payment ID: ${payment.id}`);
    console.log(`Status: ${payment.status}`);
    console.log(`Escrow ID: ${payment.escrow_id}`);
    console.log(`Amount: ${payment.amount}`);
    
    // Check escrow 76
    console.log('\n=== ESCROW 76 STATUS ===');
    const escrow = await AppDataSource.getRepository(Escrow).findOne({
      where: { id: 76 }
    });
    
    if (!escrow) {
      console.log('❌ Escrow 76 not found');
      return;
    }
    
    console.log(`Escrow ID: ${escrow.id}`);
    console.log(`Payment ID: ${escrow.payment_id}`);
    console.log(`Status: ${escrow.status}`);
    console.log(`Amount: ${escrow.amount}`);
    console.log(`Created: ${escrow.created_at}`);
    
    // Fix the link if needed
    if (!payment.escrow_id && escrow.payment_id === 88) {
      console.log('\n=== FIXING ESCROW LINK ===');
      payment.escrow_id = 76;
      await AppDataSource.getRepository(Payment).save(payment);
      console.log('✅ Payment 88 escrow_id updated to 76');
    }
    
    // Check why escrow hasn't been released
    console.log('\n=== ESCROW RELEASE ANALYSIS ===');
    const daysSinceCreated = Math.floor((new Date() - escrow.created_at) / (1000 * 60 * 60 * 24));
    console.log(`Days since escrow created: ${daysSinceCreated}`);
    
    if (escrow.status === 'funded' && daysSinceCreated >= 3) {
      console.log('🚨 ISSUE: Escrow should have been auto-released after 3 days!');
      console.log('   This indicates the automation service may not be running properly.');
    } else if (escrow.status === 'released') {
      console.log('✅ Escrow has been released');
    } else {
      console.log(`⏳ Escrow status: ${escrow.status}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

fixPayment88EscrowLink();
