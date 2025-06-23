require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '***MASKED***' : 'UNDEFINED');
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***MASKED***' : 'UNDEFINED');
console.log('JUNO_STAGE_API_KEY:', process.env.JUNO_STAGE_API_KEY);
console.log('JUNO_STAGE_API_SECRET:', process.env.JUNO_STAGE_API_SECRET ? '***MASKED***' : 'UNDEFINED');
