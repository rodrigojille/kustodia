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
exports.EtherFuseService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
/**
 * EtherFuse API Integration Service
 * Handles CETES yield generation integration
 */
class EtherFuseService {
    constructor() {
        const etherfuseEnv = process.env.ETHERFUSE_ENV || 'sandbox';
        this.isProduction = etherfuseEnv === 'production';
        this.apiKey = this.isProduction
            ? process.env.ETHERFUSE_API_KEY_PRODUCTION
            : process.env.ETHERFUSE_API_KEY_SANDBOX;
        if (!this.apiKey) {
            this.apiKey = process.env.ETHERFUSE_API_KEY;
            this.isProduction = !!(this.apiKey && this.apiKey.startsWith('api_prod:'));
        }
        this.baseURL = this.isProduction
            ? 'https://api.etherfuse.com'
            : 'https://devnet.etherfuse.com';
        this.apiSecret = process.env.ETHERFUSE_API_SECRET;
        this.merchantId = process.env.ETHERFUSE_MERCHANT_ID;
        this.api = axios_1.default.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Kustodia/1.0.0'
            }
        });
        this.api.interceptors.request.use((config) => {
            if (this.apiKey) {
                config.headers.Authorization = this.apiKey;
            }
            return config;
        });
        this.api.interceptors.response.use((response) => response, (error) => {
            console.error('EtherFuse API Error:', {
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method
            });
            return Promise.reject(error);
        });
    }
    async createCustomer(customerData) {
        try {
            const response = await this.api.post('/ramp/customer', {
                displayName: `${customerData.firstName} ${customerData.lastName}`,
                email: customerData.email,
                phone: customerData.phone
            });
            return {
                success: true,
                data: {
                    customer_id: response.data.customerId,
                    status: response.data.status
                }
            };
        }
        catch (error) {
            const err = error;
            return {
                success: false,
                error: err.response?.data?.message || err.message,
                code: err.response?.status
            };
        }
    }
    async createCetesOrder(orderData) {
        try {
            const payload = {
                customer_id: orderData.customerId,
                amount: orderData.amount,
                currency: 'MXN',
                bond_type: 'CETES',
                investment_period: orderData.period || 'flexible',
                external_reference: `KUSTODIA_PAYMENT_${orderData.paymentId}`,
                metadata: {
                    payment_id: orderData.paymentId,
                    escrow_type: 'custody_yield',
                    source: 'kustodia'
                },
                callback_url: `${process.env.BASE_URL}/api/etherfuse/webhook`,
                auto_compound: true
            };
            const response = await this.api.post('/ramp/orders/cetes', payload);
            return {
                success: true,
                data: {
                    order_id: response.data.id,
                    data: response.data
                }
            };
        }
        catch (error) {
            const err = error;
            return {
                success: false,
                error: err.response?.data?.message || err.message,
                code: err.response?.status
            };
        }
    }
    async getOrderStatus(orderId) {
        try {
            const response = await this.api.get(`/ramp/orders/${orderId}`);
            return {
                success: true,
                data: {
                    earnings: response.data.total_earnings
                }
            };
        }
        catch (error) {
            const err = error;
            return {
                success: false,
                error: err.response?.data?.message || err.message
            };
        }
    }
    async getCurrentRate() {
        try {
            // This endpoint might be hypothetical, adjust if the real one is known
            const response = await this.api.get('/ramp/rates/cetes');
            return {
                success: true,
                data: { annual_rate: response.data.rate }
            };
        }
        catch (error) {
            // Return fallback rate on error
            return {
                success: false, // Indicate failure
                error: error.message,
                data: { annual_rate: 0.072 } // Provide fallback
            };
        }
    }
    verifyWebhookSignature(payload, signature) {
        if (!this.apiSecret) {
            console.error('API Secret for webhook verification is not configured.');
            return false;
        }
        try {
            const expectedSignature = crypto
                .createHmac('sha256', this.apiSecret)
                .update(payload)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSignature, 'utf8'));
        }
        catch (error) {
            console.error('Webhook signature verification failed:', error);
            return false;
        }
    }
    /**
     * Health check for the EtherFuse service
     */
    async healthCheck() {
        try {
            const rateResponse = await this.getCurrentRate();
            if (rateResponse.success) {
                return { success: true, message: 'EtherFuse API is reachable.' };
            }
            else {
                return { success: false, message: 'Could not retrieve data from EtherFuse API.', data: rateResponse.error };
            }
        }
        catch (error) {
            return { success: false, message: 'Failed to connect to EtherFuse API.', data: error.message };
        }
    }
}
exports.EtherFuseService = EtherFuseService;
