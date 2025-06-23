import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { createEscrow } from "../src/services/escrowService";

console.log('Starting testEscrow.ts');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ESCROW_CONTRACT_ADDRESS:', process.env.ESCROW_CONTRACT_ADDRESS);
console.log('ESCROW_PRIVATE_KEY:', process.env.ESCROW_PRIVATE_KEY ? '***set***' : '***missing***');

async function main() {
  // Updated for KustodiaEscrow2_0 API
  const payer = process.env.ESCROW_BRIDGE_WALLET || "0x000000000000000000000000000000000000dead";
  const payee = "0x000000000000000000000000000000000000dead"; // Replace with a valid test address if needed
  const token = process.env.MOCK_ERC20_ADDRESS || "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
  const amount = "1000000"; // 1 MXNB (6 decimals)
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const vertical = "test";
  const clabe = "";
  const conditions = "Test escrow creation";

  try {
    console.log('Calling createEscrow with new API...');
    const result = await createEscrow({ 
      payer, 
      payee, 
      token, 
      amount, 
      deadline, 
      vertical, 
      clabe, 
      conditions 
    });
    console.log("Escrow created:", result);
  } catch (err) {
    console.error("Error creating escrow:", err);
  }
}

main();
