"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAndBroadcastWithPortal = signAndBroadcastWithPortal;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
const CHAIN_ID = process.env.CHAIN_ID;
/**
 * Signs and broadcasts a transaction using the PortalHQ MPC signing API.
 * @param {string} userWalletAddress - The user's wallet address (the 'from' address).
 * @param {string} userPortalShare - The user's recovered portal share for signing.
 * @param {string} to - The destination contract address.
 * @param {string} data - The encoded transaction data.
 * @returns {Promise<string>} The transaction hash.
 */
async function signAndBroadcastWithPortal({ userWalletAddress, userPortalShare, userPortalClientId, to, data, }) {
    // NOTE: Portal MPC signing is now handled in the frontend via Portal SDK
    // This backend function is kept as a placeholder for compatibility
    console.log('[PortalSigner] Portal MPC operations moved to frontend. Backend returns placeholder hash.');
    console.log(`[PortalSigner] Target contract: ${to}`);
    console.log(`[PortalSigner] Chain ID: eip155:${CHAIN_ID}`);
    // Return a placeholder transaction hash for backend compatibility
    // Real Portal MPC signing happens in frontend and real hash is passed back
    const placeholderTxHash = `0x${'a'.repeat(64)}`;
    console.log(`[PortalSigner] Returning placeholder hash: ${placeholderTxHash}`);
    return placeholderTxHash;
}
