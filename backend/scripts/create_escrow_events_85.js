require('dotenv').config();
const { DataSource } = require('typeorm');

// Database configuration
const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: String(process.env.POSTGRES_PASSWORD),
  database: process.env.POSTGRES_DB,
  entities: ["src/entity/**/*.js"],
  synchronize: false,
  logging: false,
});

async function createEscrowEvents() {
  console.log('🎯 Creating missing events for Payment 85...');
  
  await AppDataSource.initialize();
  
  const paymentEventRepo = AppDataSource.getRepository('PaymentEvent');
  
  const events = [
    {
      paymentId: 85,
      type: 'escrow_created',
      description: '🔒 Custodia creada en blockchain (Escrow ID: 1)',
      created_at: new Date()
    },
    {
      paymentId: 85,
      type: 'escrow_funded',
      description: '💰 Custodia fondeada con 1000 MXNB',
      created_at: new Date()
    }
  ];
  
  console.log('📝 Creating events:');
  for (const event of events) {
    console.log(`- ${event.type}: ${event.description}`);
    
    // Use raw query since entities might not load properly
    await AppDataSource.query(
      `INSERT INTO payment_event (type, description, "paymentId", created_at) 
       VALUES ($1, $2, $3, $4)`,
      [event.type, event.description, event.paymentId, event.created_at]
    );
  }
  
  console.log('✅ Events created! Check your payment timeline now.');
  process.exit(0);
}

createEscrowEvents().catch(console.error);
