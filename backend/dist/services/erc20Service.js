"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintToEscrow = mintToEscrow;
exports.transferToEscrow = transferToEscrow;
const ethers_1 = require("ethers");
const MockERC20_json_1 = __importDefault(require("../../../contracts/artifacts/contracts/MockERC20.sol/MockERC20.json"));
const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
const privateKey = process.env.ESCROW_PRIVATE_KEY;
const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
const contractAddress = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA";
const mockERC20 = new ethers_1.ethers.Contract(contractAddress, MockERC20_json_1.default.abi, wallet);
async function mintToEscrow(to, amount) {
    // amount should be in wei (string)
    const tx = await mockERC20.mint(to, amount);
    await tx.wait();
    return tx.hash;
}
async function transferToEscrow(to, amount) {
    // amount should be in wei (string)
    const tx = await mockERC20.transfer(to, amount);
    await tx.wait();
    return tx.hash;
}
