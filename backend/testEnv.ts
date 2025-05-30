import dotenv from 'dotenv';
dotenv.config();

console.log('JUNO_STAGE_API_KEY:', process.env.JUNO_STAGE_API_KEY);
console.log('ESCROW_CONTRACT_ADDRESS:', process.env.ESCROW_CONTRACT_ADDRESS);
console.log('ESCROW_PRIVATE_KEY:', process.env.ESCROW_PRIVATE_KEY);
console.log('JUNO_ENV:', process.env.JUNO_ENV);
