// Usage: npx ts-node scripts/printPayment19.js
const { createConnection } = require('typeorm');
const ormconfig = require('../src/ormconfig');
const { Payment } = require('../src/entity/Payment');

async function main() {
  const connection = await createConnection(ormconfig);
  const payment = await connection.getRepository(Payment).findOne({ where: { id: 19 } });
  if (!payment) {
    console.log('No payment found with id 19');
    process.exit(1);
  }
  console.log('Payment 19 record:', payment);
  if (payment.clabe) {
    console.log('CLABE:', payment.clabe);
  } else {
    console.log('No CLABE field found in payment record. Full record:', payment);
  }
  await connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
