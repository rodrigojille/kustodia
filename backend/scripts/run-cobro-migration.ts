import AppDataSource from '../src/ormconfig';

async function runCobroMigration() {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();
    
    console.log('Running cobro inteligente migration...');
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Check if commission_recipients table exists
    const tableExists = await queryRunner.hasTable('commission_recipients');
    
    if (!tableExists) {
      console.log('Creating commission_recipients table...');
      await queryRunner.query(`
        CREATE TABLE commission_recipients (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          payment_id INTEGER REFERENCES payment(id) ON DELETE CASCADE,
          broker_email VARCHAR(255) NOT NULL,
          broker_name VARCHAR(255) NULL,
          broker_percentage DECIMAL(5,2) NOT NULL,
          broker_amount DECIMAL(15,2) NOT NULL,
          paid BOOLEAN DEFAULT FALSE,
          paid_at TIMESTAMP NULL,
          payment_transaction_id VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Creating index on commission_recipients...');
      await queryRunner.query(`
        CREATE INDEX idx_commission_recipients_payment_id ON commission_recipients(payment_id);
      `);
      
      console.log('Commission recipients table created successfully!');
    } else {
      console.log('Commission recipients table already exists');
    }
    
    // Check if cobro inteligente fields exist in payments table
    const columnsToCheck = [
      'operation_type',
      'transaction_category', 
      'broker_email',
      'seller_email',
      'total_commission_percentage',
      'total_commission_amount',
      'net_amount',
      'custody_percent',
      'custody_period',
      'initiator_type'
    ];
    
    for (const column of columnsToCheck) {
      const hasColumn = await queryRunner.hasColumn('payment', column);
      if (!hasColumn) {
        console.log(`Adding ${column} column to payment table...`);
        
        switch (column) {
          case 'operation_type':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN operation_type VARCHAR(50) NULL`);
            break;
          case 'transaction_category':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN transaction_category VARCHAR(50) NULL`);
            break;
          case 'broker_email':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN broker_email VARCHAR(255) NULL`);
            break;
          case 'seller_email':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN seller_email VARCHAR(255) NULL`);
            break;
          case 'total_commission_percentage':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN total_commission_percentage DECIMAL(5,2) DEFAULT 0`);
            break;
          case 'total_commission_amount':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN total_commission_amount DECIMAL(15,2) DEFAULT 0`);
            break;
          case 'net_amount':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN net_amount DECIMAL(15,2) NULL`);
            break;
          case 'custody_percent':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN custody_percent DECIMAL(5,2) DEFAULT 100`);
            break;
          case 'custody_period':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN custody_period INTEGER DEFAULT 30`);
            break;
          case 'initiator_type':
            await queryRunner.query(`ALTER TABLE payment ADD COLUMN initiator_type VARCHAR(20) DEFAULT 'payer'`);
            break;
        }
        console.log(`✅ ${column} column added successfully`);
      } else {
        console.log(`✅ ${column} column already exists`);
      }
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('🎉 Cobro inteligente migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running cobro migration:', error);
    process.exit(1);
  }
}

runCobroMigration();
