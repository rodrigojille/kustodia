// Script to decode and analyze Portal share structure
console.log('🔍 Portal Share Analysis');
console.log('======================');

// The Portal share from the database (truncated for analysis)
const portalShareStart = "eyJjbGllbnRJZCI6IiIsImJhY2t1cFNoYXJlUGFpcklkIjoiIiwic2lnbmluZ1NoYXJlUGFpcklkIjoiY21kZ3V6Y3NoMTU1bHpxandlYjJ4a2VxMCIsInNoYXJlIjoiMTA1ODMyMzAxMzEzOTc0";

try {
  // Decode the base64 portion we can see
  const decoded = Buffer.from(portalShareStart, 'base64').toString('utf-8');
  console.log('Decoded Portal Share (partial):', decoded);
  
  // Try to parse as JSON
  const shareData = JSON.parse(decoded);
  console.log('\n📋 Share Structure:');
  console.log('  Client ID:', shareData.clientId || '(empty)');
  console.log('  Backup Share Pair ID:', shareData.backupSharePairId || '(empty)');
  console.log('  Signing Share Pair ID:', shareData.signingSharePairId);
  console.log('  Share Data Length:', shareData.share?.length || 0);
  
  console.log('\n🔍 Analysis:');
  console.log('  Database Client ID: cmdguzau601xm8u97iaq4ebux');
  console.log('  Share Signing Pair ID: cmdguzcsh155lzqjweb2xkeq0');
  console.log('  ❌ MISMATCH DETECTED!');
  
  console.log('\n💡 Issue Identified:');
  console.log('The Portal share contains a different signing share pair ID than the client ID.');
  console.log('This mismatch is likely causing the AUTH_FAILED error.');
  
  console.log('\n🔧 Possible Solutions:');
  console.log('1. The user needs a new Portal wallet with matching client ID and signing share');
  console.log('2. Update the database with the correct client ID from the signing share');
  console.log('3. Regenerate the Portal wallet to ensure consistency');
  
} catch (error) {
  console.error('❌ Failed to decode Portal share:', error.message);
}
