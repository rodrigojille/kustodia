import dotenv from 'dotenv';
import { listJunoTransactions } from './src/services/junoService';

dotenv.config();

async function checkForDeposit() {
  try {
    const transactions = await listJunoTransactions(true);
    console.log('=== Looking for SPEI deposit f86f16a5793b765eb92d5c966ebb2 ===');
    console.log('Total transactions found:', transactions.length);
    
    // Look for ISSUANCE transactions with amount 1000
    const issuanceTransactions = transactions.filter(tx => 
      tx.transaction_type === 'ISSUANCE' && 
      parseFloat(tx.amount) === 1000
    );
    
    console.log('\n=== ISSUANCE transactions with amount 1000 ===');
    issuanceTransactions.forEach(tx => {
      console.log('ID:', tx.id);
      console.log('Amount:', tx.amount);
      console.log('CLABE:', tx.clabe || 'null');
      console.log('Status:', tx.status);
      console.log('Created:', tx.created_at);
      console.log('---');
    });
    
    // Look for any transaction that might reference our deposit ID or CLABE
    const relatedTransactions = transactions.filter(tx => 
      tx.id?.includes('f86f16a5') || 
      tx.reference?.includes('f86f16a5') ||
      (tx.clabe && tx.clabe.includes('710969000000396022'))
    );
    
    console.log('\n=== Transactions related to our CLABE or deposit ID ===');
    relatedTransactions.forEach(tx => {
      console.log('ID:', tx.id);
      console.log('Type:', tx.transaction_type);
      console.log('Amount:', tx.amount);
      console.log('CLABE:', tx.clabe || 'null');
      console.log('Status:', tx.status);
      console.log('---');
    });

    // Check all transactions created today
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(tx => 
      tx.created_at && tx.created_at.startsWith(today)
    );
    
    console.log(`\n=== Transactions created today (${today}) ===`);
    todayTransactions.forEach(tx => {
      console.log('ID:', tx.id);
      console.log('Type:', tx.transaction_type);
      console.log('Amount:', tx.amount);
      console.log('CLABE:', tx.clabe || 'null');
      console.log('Status:', tx.status);
      console.log('Created:', tx.created_at);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkForDeposit();
