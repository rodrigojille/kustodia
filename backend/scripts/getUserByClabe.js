"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../src/ormconfig"));
const User_1 = require("../src/entity/User");
async function main() {
    await ormconfig_1.default.initialize();
    const user = await ormconfig_1.default.getRepository(User_1.User).findOne({ where: { deposit_clabe: '710969000000351106' } });
    if (user) {
        console.log('User with CLABE 710969000000351106:', user);
        console.log('Full name:', user.full_name);
    }
    else {
        console.log('No user found with CLABE 710969000000351106');
    }
    process.exit(0);
}
main();
