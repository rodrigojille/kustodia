import AppDataSource from '../ormconfig';
import { redeemMXNbForMXN } from '../services/junoService';

const { JUNO_TEST_SELLER_BANK_ACCOUNT_ID } = process.env;

async function testRedemption() {
  console.log('--- 🚀 Starting Juno Redemption Test ---');

  try {
    // Initialize DB connection to load entities and configs if needed by services
    await AppDataSource.initialize();
    console.log('✅ Database connection initialized.');

    if (!JUNO_TEST_SELLER_BANK_ACCOUNT_ID) {
      throw new Error('JUNO_TEST_SELLER_BANK_ACCOUNT_ID is not set in the environment variables.');
    }

    const amount = 5000.00;
    const destination_bank_account_id = JUNO_TEST_SELLER_BANK_ACCOUNT_ID;

    console.log(`[JUNO] Attempting to redeem ${amount} MXN to bank account ${destination_bank_account_id}...`);

    const result = await redeemMXNbForMXN(amount, destination_bank_account_id);

    console.log('--- ✅ Juno Redemption Successful ---');
    console.log('Response Payload:');
    console.log(JSON.stringify(result, null, 2));

  } catch (err: any) {
    console.error('--- ❌ ERROR during Juno Redemption Test ---');
    console.error('Caught error:', err);
    if (err.response?.data) {
      console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed.');
    }
    console.log('--- 🏁 Test Finished ---');
  }
}

testRedemption();
