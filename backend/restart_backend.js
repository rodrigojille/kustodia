/**
 * Restart Backend with Improved Automation
 * This will apply the new robust escrow creation automation
 */

const { exec } = require('child_process');

console.log('🔄 RESTARTING BACKEND WITH IMPROVED AUTOMATION');
console.log('==============================================');
console.log('Time:', new Date().toISOString());
console.log('');

console.log('📊 New Automation Features:');
console.log('   • Escrow retries: Every 1 minute (was 3 minutes)');
console.log('   • Quick retries: Every 30 seconds for recent failures');
console.log('   • Faster recovery: 1 minute wait (was 2 minutes)');
console.log('   • Better balance checking before escrow creation');
console.log('');

console.log('🛑 Stopping current backend processes...');

// Kill any existing node processes (be careful with this in production)
exec('taskkill /f /im node.exe', (error, stdout, stderr) => {
    if (error && !error.message.includes('not found')) {
        console.error('Error stopping processes:', error.message);
    } else {
        console.log('✅ Backend processes stopped');
    }
    
    console.log('');
    console.log('🚀 Starting backend with improved automation...');
    console.log('💡 The new automation will:');
    console.log('   1. Retry Payment 151 escrow creation every minute');
    console.log('   2. Quick retry every 30 seconds if balance was insufficient');
    console.log('   3. Automatically handle MXNB balance timing issues');
    console.log('');
    console.log('⚠️  Please run: npm run dev');
    console.log('📈 Monitor logs for "⚡ Quick retry" and "🔄 Found X payments needing escrow retry"');
});
