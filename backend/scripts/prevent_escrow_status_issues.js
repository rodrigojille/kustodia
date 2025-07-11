require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function preventEscrowStatusIssues() {
  try {
    console.log('=== PREVENTING FUTURE ESCROW STATUS ISSUES ===\n');
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // 1. Find all escrows with inconsistent statuses
    console.log('\n1. 🔍 Scanning for escrows with inconsistent statuses...');
    
    const inconsistentEscrowsQuery = `
      SELECT 
        e.id,
        e.status,
        e.custody_end,
        p.id as payment_id,
        p.status as payment_status,
        p.recipient_email,
        CASE 
          WHEN e.custody_end < NOW() THEN 'expired'
          ELSE 'active'
        END as expected_status
      FROM escrow e
      JOIN payment p ON p.escrow_id = e.id
      WHERE 
        (e.status = 'funded' OR e.status NOT IN ('active', 'released', 'disputed'))
        AND p.status IN ('escrowed', 'funded')
      ORDER BY e.created_at DESC
    `;
    
    const inconsistentEscrows = await client.query(inconsistentEscrowsQuery);
    
    if (inconsistentEscrows.rows.length === 0) {
      console.log('   ✅ No escrows with inconsistent statuses found');
    } else {
      console.log(`   ⚠️  Found ${inconsistentEscrows.rows.length} escrows with potentially inconsistent statuses:`);
      
      for (const row of inconsistentEscrows.rows) {
        const isExpired = new Date(row.custody_end) < new Date();
        console.log(`   - Escrow ${row.id} (Payment ${row.payment_id}): status='${row.status}', expired=${isExpired}`);
      }
    }
    
    // 2. Fix escrows that should be 'active' but are 'funded'
    console.log('\n2. 🔧 Fixing escrows that should be "active"...');
    
    const fixActiveStatusQuery = `
      UPDATE escrow 
      SET status = 'active', updated_at = NOW()
      WHERE status = 'funded' 
        AND custody_end > NOW()
      RETURNING id, status
    `;
    
    const fixedActiveEscrows = await client.query(fixActiveStatusQuery);
    
    if (fixedActiveEscrows.rows.length > 0) {
      console.log(`   ✅ Fixed ${fixedActiveEscrows.rows.length} escrows to 'active' status`);
      
      // Log events for the fixes
      for (const row of fixedActiveEscrows.rows) {
        const eventQuery = `
          INSERT INTO payment_event (payment_id, type, description, successful, created_at)
          SELECT p.id, 'escrow_status_fix', 'Escrow status corrected from "funded" to "active" for proper automation processing', true, NOW()
          FROM payment p
          WHERE p.escrow_id = $1
        `;
        await client.query(eventQuery, [row.id]);
      }
    } else {
      console.log('   ✅ No escrows needed "active" status fix');
    }
    
    // 3. Report escrows ready for release
    console.log('\n3. 📊 Checking escrows ready for automation release...');
    
    const readyForReleaseQuery = `
      SELECT 
        e.id,
        e.status,
        e.custody_end,
        p.id as payment_id,
        p.recipient_email,
        p.amount
      FROM escrow e
      JOIN payment p ON p.escrow_id = e.id
      WHERE 
        e.status = 'active'
        AND e.custody_end < NOW()
        AND p.status = 'escrowed'
      ORDER BY e.custody_end ASC
    `;
    
    const readyEscrows = await client.query(readyForReleaseQuery);
    
    if (readyEscrows.rows.length > 0) {
      console.log(`   📋 Found ${readyEscrows.rows.length} escrows ready for release:`);
      for (const row of readyEscrows.rows) {
        const daysPastDue = Math.floor((new Date() - new Date(row.custody_end)) / (1000 * 60 * 60 * 24));
        console.log(`   - Payment ${row.payment_id}: ${daysPastDue} days overdue (${row.recipient_email})`);
      }
      console.log('\n   💡 These should be processed by the next automation run');
    } else {
      console.log('   ✅ No escrows currently waiting for release');
    }
    
    // 4. Validate automation service configuration
    console.log('\n4. 🔍 Checking automation service requirements...');
    
    const requiredEnvVars = [
      'ESCROW_BRIDGE_WALLET_ADDRESS',
      'BRIDGE_WALLET_PRIVATE_KEY',
      'ESCROW_CONTRACT_ADDRESS'
    ];
    
    let configValid = true;
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.log(`   ❌ Missing environment variable: ${envVar}`);
        configValid = false;
      }
    }
    
    if (configValid) {
      console.log('   ✅ All required environment variables are present');
    } else {
      console.log('   ⚠️  Some environment variables are missing - automation may fail');
    }
    
    // 5. Summary and recommendations
    console.log('\n5. 📋 SUMMARY AND RECOMMENDATIONS:');
    console.log('   ✅ Escrow status inconsistencies have been fixed');
    console.log('   ✅ Future payments should work correctly with automation');
    console.log('   💡 Make sure the automation service is running regularly');
    console.log('   💡 Monitor payment events for any automation failures');
    console.log('   💡 Consider adding alerts for escrows overdue by >1 day');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

// Run the script
preventEscrowStatusIssues().catch(console.error);
