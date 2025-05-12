import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { createEscrow } from "../src/services/escrowService";

console.log('Starting testEscrow.ts');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ESCROW_CONTRACT_ADDRESS:', process.env.ESCROW_CONTRACT_ADDRESS);
console.log('ESCROW_PRIVATE_KEY:', process.env.ESCROW_PRIVATE_KEY ? '***set***' : '***missing***');

async function main() {
  const seller = "0x000000000000000000000000000000000000dead"; // Replace with a valid test address if needed
  const custodyAmount = "1000000"; // 1 MXNB (6 decimals)
  const custodyPeriod = 60; // 1 minute

  try {
    console.log('Calling createEscrow...');
    const result = await createEscrow({ seller, custodyAmount, custodyPeriod });
    console.log("Escrow created:", result);
  } catch (err) {
    console.error("Error creating escrow:", err);
  }
}

main();
