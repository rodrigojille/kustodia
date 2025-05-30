import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

console.log('[escrowService] Starting import');
console.log('[escrowService] ENV.ESCROW_CONTRACT_ADDRESS:', process.env.ESCROW_CONTRACT_ADDRESS);
console.log('[escrowService] ENV.ESCROW_PRIVATE_KEY:', process.env.ESCROW_PRIVATE_KEY ? '***set***' : '***missing***');

// Artifact paths
const escrowArtifactPath = path.join(__dirname, '../../artifacts/contracts/KustodiaEscrow.sol/KustodiaEscrow.json');
const erc20ArtifactPath = path.join(__dirname, '../../artifacts/contracts/ERC20.json');
console.log('[escrowService] Resolved KustodiaEscrow.json path:', escrowArtifactPath);
console.log('[escrowService] Resolved ERC20.json path:', erc20ArtifactPath);
console.log('[escrowService] KustodiaEscrow.json exists:', fs.existsSync(escrowArtifactPath));
console.log('[escrowService] ERC20.json exists:', fs.existsSync(erc20ArtifactPath));


// Arbitrum testnet/configurable
const RPC_URL = process.env.ETH_RPC_URL!;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Use mainnet deployer/escrow key from env
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Mainnet contract addresses
const ESCROW_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS!;
const TOKEN_ADDRESS = process.env.MOCK_ERC20_ADDRESS!;

// Load ABIs
const KustodiaEscrowArtifact = require(escrowArtifactPath);
const ESCROW_ABI = KustodiaEscrowArtifact.abi;
// MXNB is a proxy contract. Merge proxy ABI with ERC20 ABI for full functionality.
const PROXY_ABI = [
  {"inputs":[{"internalType":"address","name":"implementationContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},
  {"stateMutability":"payable","type":"fallback"},
  {"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"}
];

// Load ERC20 ABI from artifact if available, otherwise use minimal ERC20 ABI
let ERC20_ABI: any[] = [];
try {
  ERC20_ABI = JSON.parse(fs.readFileSync(erc20ArtifactPath, "utf8")).abi;
} catch (e) {
  // Fallback: minimal ERC20 ABI
  ERC20_ABI = [
    {"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},
    {"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},
    {"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"},
    {"constant":false,"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}
  ];
}

// Merge proxy and ERC20 ABIs
const TOKEN_ABI = [...PROXY_ABI, ...ERC20_ABI];

export const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

/**
 * Transfers MXNB from the platform bridge wallet to the platform Juno wallet.
 * @param amount Amount of MXNB to transfer (as string, in token decimals)
 * @param to Destination address (platform Juno wallet)
 * @returns Transaction hash
 */
export async function transferMXNBToJunoWallet(amount: string, to: string): Promise<string> {
  try {
    const tx = await tokenContract.transfer(to, amount);
    const receipt = await tx.wait();
    console.log(`[MXNB Transfer] Success. Tx hash: ${tx.hash}`);
    return tx.hash;
  } catch (err) {
    console.error('[MXNB Transfer] Error:', err);
    throw err;
  }
}

export async function createEscrow({
  seller,
  custodyAmount,
  custodyPeriod
}: {
  seller: string,
  custodyAmount: string,
  custodyPeriod: number
}) {
  // Check current allowance
  const currentAllowance = await tokenContract.allowance(signer.address, ESCROW_ADDRESS);
  if (currentAllowance.lt(custodyAmount)) {
    if (!currentAllowance.isZero()) {
      const resetTx = await tokenContract.approve(ESCROW_ADDRESS, 0);
      await resetTx.wait();
    }
    const approveTx = await tokenContract.approve(ESCROW_ADDRESS, custodyAmount);
    await approveTx.wait();
  }

  // Create escrow on-chain with the custody amount
  const tx = await escrowContract.createEscrow(
    seller,
    custodyAmount,
    custodyPeriod
  );
  const receipt = await tx.wait();

  // Find EscrowCreated event
  const event = receipt.events?.find((e: any) => e.event === "EscrowCreated");
  const escrowId = event?.args?.escrowId;
  // Return both escrowId and transaction hash
  return { escrowId: escrowId?.toString(), txHash: tx.hash };
}

export async function releaseCustody(escrowId: number) {
  const tx = await escrowContract.releaseCustody(escrowId);
  await tx.wait();
}

export async function raiseDispute(escrowId: number) {
  const tx = await escrowContract.raiseDispute(escrowId);
  await tx.wait();
}

export async function resolveDispute(escrowId: number, releaseToSeller: boolean) {
  const tx = await escrowContract.resolveDispute(escrowId, releaseToSeller);
  await tx.wait();
}

export async function getEscrow(escrowId: number) {
  return escrowContract.escrows(escrowId);
}
