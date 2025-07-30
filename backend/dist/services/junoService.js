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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeJunoService = initializeJunoService;
exports.createJunoClabe = createJunoClabe;
exports.redeemMXNbForMXN = redeemMXNbForMXN;
exports.getJunoTxHashFromTimeline = getJunoTxHashFromTimeline;
exports.withdrawCryptoToBridgeWallet = withdrawCryptoToBridgeWallet;
exports.listJunoTransactions = listJunoTransactions;
exports.redeemMXNBToMXN = redeemMXNBToMXN;
exports.getWithdrawalStatus = getWithdrawalStatus;
exports.listRecentWithdrawals = listRecentWithdrawals;
exports.verifyWithdrawalProcessed = verifyWithdrawalProcessed;
exports.withdrawMXNBToBridge = withdrawMXNBToBridge;
exports.registerBankAccount = registerBankAccount;
exports.getRegisteredBankAccounts = getRegisteredBankAccounts;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
let JUNO_ENV;
let JUNO_API_KEY;
let JUNO_API_SECRET;
let JUNO_BASE_URL;
function initializeJunoService() {
    JUNO_ENV = process.env.JUNO_ENV || 'stage';
    if (JUNO_ENV === 'stage') {
        JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
        JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
    }
    else {
        JUNO_API_KEY = process.env.JUNO_API_KEY;
        JUNO_API_SECRET = process.env.JUNO_API_SECRET;
    }
    if (!JUNO_API_KEY || !JUNO_API_SECRET) {
        throw new Error(`[JUNO] Missing required API credentials for environment: ${JUNO_ENV}. Please check your .env file.`);
    }
    JUNO_BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
    console.log(`[JUNO] Service Initialized. Using environment: ${JUNO_ENV}`);
    console.log(`[JUNO] Using API key: ${JUNO_API_KEY.slice(0, 4)}... (stage: ${JUNO_ENV === 'stage'})`);
}
/**
 * Creates a unique CLABE for a user via the Juno API.
 * @param userId - The user ID or unique identifier
 * @param userName - The user's full name or email
 * @returns The created CLABE string
 */
async function createJunoClabe() {
    // Correct endpoint for CLABE creation (for deposits)
    const url = 'https://stage.buildwithjuno.com/mint_platform/v1/clabes';
    const requestPath = '/mint_platform/v1/clabes';
    const method = 'POST';
    const nonce = Date.now().toString();
    const body = '{}'; // No payload for AUTO_PAYMENT CLABE
    // Build signature as per Bitso/Juno docs
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    // Bitso HMAC header
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    // Debug logging for troubleshooting
    console.log('--- JUNO CLABE DEBUG ---');
    console.log('String to sign:', dataToSign);
    console.log('Signature:', signature);
    console.log('Headers:', headers);
    console.log('Request body:', body);
    console.log('-----------------------');
    try {
        const response = await axios_1.default.post(url, {}, { headers });
        if (response.data && response.data.success && response.data.payload && response.data.payload.clabe) {
            return response.data.payload.clabe;
        }
        else {
            throw new Error('Unexpected response from Juno CLABE creation: ' + JSON.stringify(response.data));
        }
    }
    catch (err) {
        console.error('Juno CLABE creation error:', err?.response?.data || err?.message || err);
        throw err;
    }
}
/**
 * Redeems MXNb for MXN via the Bitso/Juno API.
 * @param amountMXNb - Amount of MXNb to redeem (as a string or number, in MXNb units)
 * @param travelRuleData - Optional Travel Rule compliance data to include
 * @returns The redemption response from the API
 */
async function redeemMXNbForMXN(amount, destination_bank_account_id) {
    const endpoint = '/mint_platform/v1/redemptions';
    const url = `${JUNO_BASE_URL}${endpoint}`;
    const bodyObj = {
        amount: amount, // Keep amount as string
        destination_bank_account_id,
        asset: 'mxn', // The asset being redeemed is MXNB
    };
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const method = 'POST';
    const requestPath = endpoint;
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    console.log(`[JUNO] Redeeming ${amount} MXNB to bank account ${destination_bank_account_id}...`);
    console.log(`[JUNO] Request Body: ${body}`);
    try {
        const response = await axios_1.default.post(url, bodyObj, { headers });
        // The documentation shows the transaction details are in the 'payload' object
        if (response.data && response.data.success) {
            return response.data.payload;
        }
        throw new Error('Juno redemption response was not successful: ' + JSON.stringify(response.data));
    }
    catch (err) {
        console.error('Juno redemption error:', JSON.stringify(err.response.data, null, 2) || err?.message || err);
        throw err;
    }
}
async function getJunoTxHashFromTimeline(transactionId, isStage = true) {
    const baseUrl = isStage
        ? 'https://stage.buildwithjuno.com'
        : 'https://buildwithjuno.com';
    const requestPath = `/mint_platform/v1/transactions/${transactionId}`;
    const url = `${baseUrl}${requestPath}`;
    const method = 'GET';
    const nonce = Date.now().toString();
    const body = '';
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        const timeline = response.data?.payload?.timeline || [];
        const tokensTransferred = timeline.find((step) => step.step === 'Tokens transferred');
        return tokensTransferred?.receipt || null;
    }
    catch (err) {
        console.error('Error fetching transaction timeline from Juno:', err?.response?.data || err?.message || err);
        return null;
    }
}
/**
 * Lista todas las transacciones de la cuenta Juno.
 * @param isStage Si es true usa el endpoint de stage, si no el de producción
 * @returns Array de transacciones Juno
 */
async function withdrawCryptoToBridgeWallet(amount, destinationAddress) {
    const endpoint = '/mint_platform/v1/withdrawals';
    const url = `${JUNO_BASE_URL}${endpoint}`;
    const bodyObj = {
        amount: amount,
        asset: 'MXNB',
        address: destinationAddress,
        blockchain: 'ARBITRUM'
    };
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const method = 'POST';
    const requestPath = endpoint;
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    console.log('Enviando withdrawal de MXNB via junoService...');
    console.log('Destino:', destinationAddress);
    console.log('Monto:', amount);
    console.log('Payload:', JSON.stringify(bodyObj));
    try {
        const response = await axios_1.default.post(url, bodyObj, { headers, timeout: 15000 }); // 15-second timeout
        console.log('Respuesta withdrawal:', response.data);
        return response.data;
    }
    catch (err) {
        console.error('Error en withdrawal desde junoService:', err?.response?.data || err?.message || err);
        throw err;
    }
}
async function listJunoTransactions(isStage = true) {
    const baseUrl = isStage
        ? 'https://stage.buildwithjuno.com'
        : 'https://buildwithjuno.com';
    // Use the new, correct endpoint for SPEI deposits that includes the receiver_clabe
    const requestPath = '/spei/v1/deposits';
    const url = `${baseUrl}${requestPath}`;
    const method = 'GET';
    const nonce = Date.now().toString();
    const body = ''; // GET request has no body
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        // Enhanced logging for better debugging
        console.log('[JUNO] listSpeiDeposits raw response:', JSON.stringify(response.data, null, 2));
        // The API response contains a `payload` object which in turn contains a `response` array with the deposits.
        // We need to extract this nested array.
        if (response.data && response.data.success && response.data.payload && Array.isArray(response.data.payload.response)) {
            return response.data.payload.response;
        }
        console.warn('[JUNO] No SPEI deposits found or unexpected response structure.');
        return [];
    }
    catch (error) {
        console.error('[JUNO] Error fetching SPEI deposits:', error);
        return [];
    }
}
/**
 * Redeem MXNB tokens to MXN via SPEI to seller's bank account
 * @param amount - Amount in MXN to redeem
 * @param destinationBankAccountId - Juno registered bank account ID
 * @returns Redemption transaction details
 */
async function redeemMXNBToMXN(amount, destinationBankAccountId, idempotencyKey) {
    const url = `${JUNO_BASE_URL}/mint_platform/v1/redemptions`;
    const requestPath = '/mint_platform/v1/redemptions';
    const method = 'POST';
    const nonce = Date.now().toString();
    // 🚨 FIX: Ensure amount is sent as NUMBER, not string
    const bodyData = {
        amount: Number(amount), // Explicitly convert to number
        destination_bank_account_id: destinationBankAccountId,
        asset: 'mxn'
    };
    const body = JSON.stringify(bodyData);
    // Build signature
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    // 🚨 FIX: Use provided idempotency key for retries, or generate new one
    const finalIdempotencyKey = idempotencyKey || crypto.randomUUID();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
        'X-Idempotency-Key': finalIdempotencyKey
    };
    console.log(`[JUNO] Redeeming ${amount} MXN to bank account ${destinationBankAccountId}`);
    console.log('[JUNO] Redemption request:', bodyData);
    try {
        const response = await axios_1.default.post(url, bodyData, { headers });
        console.log(`[JUNO] Redemption successful:`, response.data);
        return response.data.payload;
    }
    catch (error) {
        console.error('[JUNO] Redemption failed:', error?.response?.data || error.message);
        throw new Error(`Juno redemption failed: ${error?.response?.data?.error || error.message}`);
    }
}
/**
 * Get withdrawal status by ID
 * @param withdrawalId - Withdrawal ID to check
 * @returns Withdrawal status details
 */
async function getWithdrawalStatus(withdrawalId) {
    const url = `${JUNO_BASE_URL}/mint_platform/v1/withdrawals/${withdrawalId}`;
    const requestPath = `/mint_platform/v1/withdrawals/${withdrawalId}`;
    const method = 'GET';
    const nonce = Date.now().toString();
    const body = '';
    // Build signature
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        return response.data.payload;
    }
    catch (error) {
        console.error(`[JUNO] Error checking withdrawal status for ${withdrawalId}:`, error?.response?.data || error.message);
        return null;
    }
}
/**
 * List recent withdrawals to verify if a withdrawal was actually processed
 * @returns Array of recent withdrawals
 */
async function listRecentWithdrawals() {
    const url = `${JUNO_BASE_URL}/mint_platform/v1/withdrawals`;
    const requestPath = '/mint_platform/v1/withdrawals';
    const method = 'GET';
    const nonce = Date.now().toString();
    const body = '';
    // Build signature
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        return response.data.payload || [];
    }
    catch (error) {
        console.error('[JUNO] Error fetching recent withdrawals:', error?.response?.data || error.message);
        return [];
    }
}
/**
 * Verify if a withdrawal was actually processed by checking recent withdrawals
 * @param amount - Amount that was withdrawn
 * @param walletAddress - Destination wallet address
 * @param timeWindow - Time window in minutes to check (default: 5 minutes)
 * @returns Withdrawal details if found, null otherwise
 */
async function verifyWithdrawalProcessed(amount, walletAddress, timeWindow = 5) {
    try {
        const recentWithdrawals = await listRecentWithdrawals();
        const cutoffTime = new Date(Date.now() - timeWindow * 60 * 1000);
        // Look for a matching withdrawal in recent history
        const matchingWithdrawal = recentWithdrawals.find((withdrawal) => {
            const withdrawalTime = new Date(withdrawal.created_at || withdrawal.timestamp);
            return (withdrawal.amount === amount &&
                withdrawal.address === walletAddress &&
                withdrawal.asset === 'MXNB' &&
                withdrawalTime >= cutoffTime &&
                (withdrawal.status === 'completed' || withdrawal.status === 'pending' || withdrawal.status === 'processing'));
        });
        if (matchingWithdrawal) {
            console.log(`[JUNO] Found matching withdrawal:`, matchingWithdrawal);
            return matchingWithdrawal;
        }
        return null;
    }
    catch (error) {
        console.error('[JUNO] Error verifying withdrawal:', error.message);
        return null;
    }
}
/**
 * Withdraw MXNB tokens to external crypto wallet (bridge wallet) with improved error handling
 * @param amount - Amount in MXNB to withdraw
 * @param walletAddress - Destination wallet address on Arbitrum
 * @returns Withdrawal transaction details
 */
async function withdrawMXNBToBridge(amount, walletAddress) {
    const url = `${JUNO_BASE_URL}/mint_platform/v1/withdrawals`;
    const requestPath = '/mint_platform/v1/withdrawals';
    const method = 'POST';
    const nonce = Date.now().toString();
    // Generate a deterministic idempotency key based on amount, address, and timestamp (rounded to minute)
    // This helps prevent duplicate withdrawals while allowing retries
    const timestampMinute = Math.floor(Date.now() / 60000) * 60000;
    const idempotencyKey = crypto.createHash('sha256')
        .update(`${amount}-${walletAddress}-${timestampMinute}`)
        .digest('hex')
        .substring(0, 32);
    const bodyData = {
        amount: amount,
        asset: 'MXNB',
        blockchain: 'ARBITRUM',
        address: walletAddress,
        // Add compliance data for Travel Rule (required for withdrawals >= 1000 EUR)
        compliance: {
            originator_name: 'Kustodia Platform',
            originator_address: 'Mexico City, Mexico',
            beneficiary_name: 'Kustodia Escrow Bridge',
            beneficiary_address: 'Arbitrum Network'
        }
    };
    const body = JSON.stringify(bodyData);
    // Build signature
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
        'X-Idempotency-Key': idempotencyKey
    };
    console.log(`[JUNO] Withdrawing ${amount} MXNB to bridge wallet ${walletAddress}`);
    console.log('[JUNO] Withdrawal request:', bodyData);
    console.log(`[JUNO] Using idempotency key: ${idempotencyKey}`);
    try {
        const response = await axios_1.default.post(url, bodyData, { headers });
        console.log(`[JUNO] Withdrawal successful:`, response.data);
        return response.data.payload;
    }
    catch (error) {
        const errorData = error?.response?.data;
        const errorCode = errorData?.error_code || errorData?.code;
        const errorMessage = errorData?.error || errorData?.message || error.message;
        console.error('[JUNO] Withdrawal failed:', errorData || error.message);
        // Handle specific error codes that might be false negatives
        if (errorCode === 34003 || errorCode === '34003' || errorMessage.includes('34003')) {
            console.log('[JUNO] Error 34003 detected - checking if withdrawal was actually processed...');
            // Wait a moment for the withdrawal to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Check if the withdrawal was actually processed despite the error
            const verifiedWithdrawal = await verifyWithdrawalProcessed(amount, walletAddress);
            if (verifiedWithdrawal) {
                console.log('[JUNO] ✅ Withdrawal was actually successful despite error 34003');
                return verifiedWithdrawal;
            }
            else {
                console.log('[JUNO] ❌ Withdrawal was not found in recent transactions');
            }
        }
        // Handle duplicate/idempotency errors
        if (errorMessage.includes('idempotency') || errorMessage.includes('duplicate')) {
            console.log('[JUNO] Idempotency/duplicate error detected - checking recent withdrawals...');
            const verifiedWithdrawal = await verifyWithdrawalProcessed(amount, walletAddress, 10); // Check last 10 minutes
            if (verifiedWithdrawal) {
                console.log('[JUNO] ✅ Found existing withdrawal for this request');
                return verifiedWithdrawal;
            }
        }
        throw new Error(`Juno withdrawal failed: ${errorMessage} (Code: ${errorCode})`);
    }
}
/**
 * Register bank account (CLABE) with Juno for redemptions
 * @param clabe - 18-digit CLABE number
 * @param accountHolderName - Name on the bank account
 * @returns Registration result with UUID
 */
async function registerBankAccount(clabe, accountHolderName) {
    const url = `${JUNO_BASE_URL}/mint_platform/v1/accounts/banks`;
    const requestPath = '/mint_platform/v1/accounts/banks';
    const method = 'POST';
    const nonce = Date.now().toString();
    const bodyData = {
        clabe: clabe,
        account_holder_name: accountHolderName,
        currency: 'MXN',
        ownership: 'INDIVIDUAL_OWNED' // Required by Juno API
    };
    const body = JSON.stringify(bodyData);
    // Build signature
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
        'X-Idempotency-Key': crypto.randomUUID() // Prevent duplicates
    };
    console.log(`[JUNO] Registering bank account CLABE ${clabe} for ${accountHolderName}`);
    console.log('[JUNO] Registration request:', bodyData);
    try {
        const response = await axios_1.default.post(url, bodyData, { headers });
        console.log(`[JUNO] Bank account registration successful:`, response.data);
        return response.data.payload;
    }
    catch (error) {
        console.error('[JUNO] Bank account registration failed:', error?.response?.data || error.message);
        throw new Error(`Juno bank account registration failed: ${error?.response?.data?.error || error.message}`);
    }
}
/**
 * Get registered bank accounts for redemptions
 * @returns Array of registered bank accounts
 */
async function getRegisteredBankAccounts() {
    const url = `${JUNO_BASE_URL}/mint_platform/v1/accounts/banks`;
    const requestPath = '/mint_platform/v1/accounts/banks';
    const method = 'GET';
    const nonce = Date.now().toString();
    const body = '';
    // Build signature
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        console.log(`[JUNO] Found ${response.data.payload?.length || 0} registered bank accounts`);
        return response.data.payload || [];
    }
    catch (error) {
        console.error('[JUNO] Error fetching bank accounts:', error?.response?.data || error.message);
        return [];
    }
}
