import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
const tokenAddress = process.env.MOCK_ERC20_ADDRESS as string;
const custodialWallet = process.env.ESCROW_BRIDGE_WALLET as string;

const path = require('path');
const abiPath = path.join(process.cwd(), 'artifacts', 'contracts', 'ERC20.json');
console.log('Intentando leer ABI en:', abiPath);
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;

async function main() {
  const token = new ethers.Contract(tokenAddress, abi, provider);

  try {
    const symbol = await token.symbol();
    console.log('symbol:', symbol);
  } catch (e) {
    console.error('Error calling symbol()', e);
  }

  try {
    const decimals = await token.decimals();
    console.log('decimals:', decimals);
  } catch (e) {
    console.error('Error calling decimals()', e);
  }

  try {
    const balance = await token.balanceOf(custodialWallet);
    console.log('balanceOf(custodio):', balance.toString());
  } catch (e) {
    console.error('Error calling balanceOf()', e);
  }

  try {
    const paused = await token.paused();
    console.log('paused:', paused);
  } catch (e) {
    console.error('Error calling paused()', e);
  }

  try {
    const isBlacklisted = await token.isBlacklisted(custodialWallet);
    console.log('isBlacklisted(custodio):', isBlacklisted);
  } catch (e) {
    console.error('Error calling isBlacklisted()', e);
  }

  try {
    const allowance = await token.allowance(custodialWallet, process.env.ESCROW_CONTRACT_ADDRESS);
    console.log('allowance(custodio, escrow):', allowance.toString());
  } catch (e) {
    console.error('Error calling allowance()', e);
  }
}

main();
