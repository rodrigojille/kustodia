const { ethers } = require("ethers");
require("dotenv").config();

const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
const BRIDGE_WALLET_PK = process.env.BRIDGE_WALLET_PRIVATE_KEY!;
const PROVIDER_URL = process.env.ARBITRUM_RPC_URL!;
const TO = "0xb9cBEa875dCbb3eFd42D36c04cdD6C122eD0C7C9"; // Juno wallet
const AMOUNT = ethers.utils.parseUnits("1000.00", 18); // update decimals/amount as needed

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  const signer = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
  const mxnb = new ethers.Contract(MXNB_TOKEN, ERC20_ABI, signer);

  const tx = await mxnb.transfer(TO, AMOUNT);
  console.log("MXNB transfer tx:", tx.hash);
  await tx.wait();
  console.log("MXNB sent to Juno wallet!");
}

main().catch(console.error);
