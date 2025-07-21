"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Parámetros de entorno
const RPC_URL = process.env.ETH_RPC_URL;
const PRIVATE_KEY = '0xfde954c5396f9c011e94b8ce3750a4029f37d6ab4568440f2452b48e4abed4e6';
const TOKEN_ADDRESS = '0x82B9e52b26A2954E113F94Ff26647754d5a4247D'; // MXNB
const ESCROW_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;
const AMOUNT = ethers_1.ethers.parseUnits('2000', 6); // 2000 MXNB (6 decimales)
// ABI mínima ERC20
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) public returns (bool)',
    'function allowance(address owner, address spender) public view returns (uint256)',
    'function balanceOf(address owner) public view returns (uint256)'
];
async function main() {
    if (!RPC_URL || !PRIVATE_KEY || !TOKEN_ADDRESS || !ESCROW_ADDRESS) {
        throw new Error('Faltan variables de entorno para approve');
    }
    const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
    const token = new ethers_1.ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
    const balance = await token.balanceOf(signer.address);
    console.log('Saldo MXNB:', ethers_1.ethers.formatUnits(balance, 18));
    if (balance.lt(AMOUNT)) {
        throw new Error('Saldo insuficiente para aprobar el fondeo');
    }
    const currentAllowance = await token.allowance(signer.address, ESCROW_ADDRESS);
    console.log('Allowance actual:', ethers_1.ethers.formatUnits(currentAllowance, 18));
    // Forzar approve por el monto requerido, sin importar allowance previo
    console.log(`Aprobando ${ethers_1.ethers.formatUnits(AMOUNT, 6)} MXNB para el contrato de escrow...`);
    const tx = await token.approve(ESCROW_ADDRESS, AMOUNT);
    console.log('Transacción enviada. Hash:', tx.hash);
    await tx.wait();
    console.log('Approve confirmado en blockchain.');
}
main().catch(e => { console.error(e); process.exit(1); });
