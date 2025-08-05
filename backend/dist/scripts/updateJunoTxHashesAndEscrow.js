"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { ethers } = require('ethers');
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const junoService_1 = require("../services/junoService");
const escrowService_1 = require("../services/escrowService");
/**
 * Automatiza:
 * 1. Actualiza el hash on-chain del withdrawal Juno en la base de datos.
 * 2. Cruza el withdrawal con el escrow/payment correspondiente.
 * 3. Ejecuta el contrato inteligente para fondear el escrow.
 */
const ormconfig_1 = __importDefault(require("../ormconfig"));
async function main() {
    // Inicializa la conexión a la base de datos
    await ormconfig_1.default.initialize();
    const withdrawalId = 'd68ff019-1820-4195-bd8c-fcfe12f02317'; // ID del withdrawal real para la prueba
    const paymentId = 61; // hardcoded para demo
    const escrowId = 56; // hardcoded para demo
    const custodyTime = 3 * 24 * 60 * 60; // 3 días en segundos, ajusta según tu lógica
    // 1. Obtener hash de la transacción withdrawal Juno
    console.log('Buscando hash on-chain de withdrawal Juno:', withdrawalId);
    let txHash = await (0, junoService_1.getJunoTxHashFromTimeline)(withdrawalId);
    if (!txHash) {
        // Hash recuperado manualmente para la prueba
        txHash = '0x3b2e7dd88c73338370d001d90345c6b1ca4af659b2b4a145615ae10bab735fd0';
        console.log('Hash on-chain (hardcodeado):', txHash);
    }
    else {
        console.log('Hash on-chain:', txHash);
    }
    // 2. Actualizar Payment y Escrow con el hash
    const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ['escrow'] });
    if (!payment)
        throw new Error('Payment no encontrado');
    payment.blockchain_tx_hash = txHash;
    await paymentRepo.save(payment);
    const escrow = await escrowRepo.findOne({ where: { id: escrowId } });
    if (!escrow)
        throw new Error('Escrow no encontrado');
    escrow.blockchain_tx_hash = txHash;
    await escrowRepo.save(escrow);
    console.log('Actualizados Payment y Escrow con hash:', txHash);
    // 3. Ejecutar contrato inteligente para fondear el escrow
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const signer = new ethers.Wallet(process.env.ESCROW_DEPLOYER_PRIVATE_KEY, provider);
    const tokenContract = new ethers.Contract(process.env.MOCK_ERC20_ADDRESS, ['function approve(address spender, uint256 amount) public returns (bool)'], signer);
    const custodyAmount = ethers.utils.parseUnits('2000', 6).toString(); // 2000 MXNB con 6 decimales
    const escrowContractAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS;
    console.log(`Aprobando ${custodyAmount} tokens para el contrato de escrow...`);
    const approveTx = await tokenContract.approve(escrowContractAddress, custodyAmount);
    await approveTx.wait();
    console.log('Aprobación completada, hash:', approveTx.hash);
    // Usar la platform wallet (misma que el private key del deployer/escrow)
    const platformWallet = process.env.ESCROW_BRIDGE_WALLET;
    // Updated for KustodiaEscrow2_0 API
    console.log('Creando escrow on-chain...');
    const result = await (0, escrowService_1.createEscrow)({
        payer: platformWallet, // Platform wallet as payer
        payee: platformWallet, // Same wallet as payee for this test
        token: process.env.MOCK_ERC20_ADDRESS, // MXNB token
        amount: custodyAmount, // Amount to lock
        deadline: Math.floor(Date.now() / 1000) + custodyTime, // Deadline in seconds
        vertical: 'juno_update', // Business vertical
        clabe: '', // No CLABE for this script
        conditions: 'Juno transaction hash update escrow' // Escrow conditions
    });
    console.log('Escrow creado on-chain:', result);
}
main().catch(e => { console.error(e); process.exit(1); });
