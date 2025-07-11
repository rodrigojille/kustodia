const AppDataSource = require('./dist/src/ormconfig.js').default;

async function checkPayment90() {
  try {
    await AppDataSource.initialize();
    const result = await AppDataSource.query('SELECT id, status, amount, reference FROM payment WHERE id = 90');
    console.log('Payment 90 Status:', JSON.stringify(result[0], null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPayment90();
