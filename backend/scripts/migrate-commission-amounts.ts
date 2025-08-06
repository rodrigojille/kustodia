import AppDataSource from '../src/ormconfig';

async function migrateCommissionAmounts() {
  try {
    console.log('🚀 Starting commission amount migration...');
    
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const queryRunner = AppDataSource.createQueryRunner();

    // Traditional Flow (1.0%)
    console.log('📊 Updating Traditional flow commission amounts (1.0%)...');
    const traditionalResult = await queryRunner.query(`
      UPDATE payment 
      SET platform_commission_amount = ROUND((amount * 1.0 / 100)::numeric, 2)
      WHERE payment_type = 'traditional' 
        AND platform_commission_amount IS NULL 
        AND amount IS NOT NULL
    `);
    console.log(`✅ Updated ${traditionalResult[1]} traditional payment records`);

    // Nuevo Flujo (2.0%)
    console.log('📊 Updating Nuevo Flujo commission amounts (2.0%)...');
    const nuevoFlujoResult = await queryRunner.query(`
      UPDATE payment 
      SET platform_commission_amount = ROUND((amount * 2.0 / 100)::numeric, 2)
      WHERE payment_type = 'nuevo_flujo' 
        AND platform_commission_amount IS NULL 
        AND amount IS NOT NULL
    `);
    console.log(`✅ Updated ${nuevoFlujoResult[1]} nuevo flujo payment records`);

    // Cobro Inteligente (1.5%)
    console.log('📊 Updating Cobro Inteligente commission amounts (1.5%)...');
    const cobroResult = await queryRunner.query(`
      UPDATE payment 
      SET platform_commission_amount = ROUND((amount * 1.5 / 100)::numeric, 2)
      WHERE payment_type IN ('cobro_autos', 'cobro_inmobiliaria', 'cobro_otros')
        AND platform_commission_amount IS NULL 
        AND amount IS NOT NULL
    `);
    console.log(`✅ Updated ${cobroResult[1]} cobro inteligente payment records`);

    // Fallback for any remaining NULL values
    console.log('📊 Setting fallback commission amounts (0%) for remaining records...');
    const fallbackResult = await queryRunner.query(`
      UPDATE payment 
      SET platform_commission_amount = 0
      WHERE platform_commission_amount IS NULL
    `);
    console.log(`✅ Updated ${fallbackResult[1]} records with fallback commission`);

    // Verification
    console.log('🔍 Verification - Commission amounts by payment type:');
    const verification = await queryRunner.query(`
      SELECT 
        payment_type,
        COUNT(*) as total_records,
        ROUND(AVG(platform_commission_amount)::numeric, 2) as avg_commission,
        ROUND(SUM(platform_commission_amount)::numeric, 2) as total_commission
      FROM payment 
      WHERE platform_commission_amount IS NOT NULL
      GROUP BY payment_type
      ORDER BY payment_type
    `);
    
    console.table(verification);

    // Check for remaining NULL values
    const nullCheck = await queryRunner.query(`
      SELECT COUNT(*) as null_commission_count 
      FROM payment 
      WHERE platform_commission_amount IS NULL
    `);
    
    console.log(`🔍 Remaining NULL commission amounts: ${nullCheck[0].null_commission_count}`);

    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('✅ Commission amount migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateCommissionAmounts();
