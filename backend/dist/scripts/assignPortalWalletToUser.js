"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const typeorm_1 = require("typeorm");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const PORTAL_API_KEY = '00d44a69-e705-4fca-b97f-fca9dcb126f7';
const USER_ID = 4; // Cambia esto si necesitas otro usuario
async function createPortalWallet() {
    const res = await (0, node_fetch_1.default)('https://mpc-client.portalhq.io/v1/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PORTAL_API_KEY}`
        },
        body: JSON.stringify({})
    });
    if (!res.ok) {
        throw new Error(`Portal API error: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    if (!data.eip155Address) {
        throw new Error('No eip155Address in Portal API response');
    }
    return data.eip155Address;
}
async function assignWalletToUser(userId, walletAddress) {
    const dataSource = new typeorm_1.DataSource(ormconfig_1.default);
    await dataSource.initialize();
    const userRepo = dataSource.getRepository(User_1.User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
        throw new Error(`User with id ${userId} not found`);
    }
    user.wallet_address = walletAddress;
    await userRepo.save(user);
    await dataSource.destroy();
    console.log(`Assigned wallet ${walletAddress} to user id ${userId}`);
}
(async () => {
    try {
        const walletAddress = await createPortalWallet();
        await assignWalletToUser(USER_ID, walletAddress);
        console.log('Done!');
    }
    catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
