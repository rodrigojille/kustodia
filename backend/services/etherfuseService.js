const axios = require('axios');
const crypto = require('crypto');

/**
 * EtherFuse API Integration Service
 * Handles CETES yield generation integration
 */
class EtherFuseService {
  constructor() {
    // Environment-based API key selection
    const etherfuseEnv = process.env.ETHERFUSE_ENV || 'sandbox';
    this.isProduction = etherfuseEnv === 'production';
    
    // Select appropriate API key based on environment
    this.apiKey = this.isProduction 
      ? process.env.ETHERFUSE_API_KEY_PRODUCTION
      : process.env.ETHERFUSE_API_KEY_SANDBOX;
    
    // Legacy support for single API key (fallback)
    if (!this.apiKey) {
      this.apiKey = process.env.ETHERFUSE_API_KEY;
      // Auto-detect environment from API key prefix if available
      this.isProduction = this.apiKey && this.apiKey.startsWith('api_prod:');
    }
    
    // Set base URL based on environment
    this.baseURL = this.isProduction 
      ? 'https://api.etherfuse.com' 
      : 'https://devnet.etherfuse.com';
    
    // API Credentials (to be provided)
    this.apiSecret = process.env.ETHERFUSE_API_SECRET;
    this.merchantId = process.env.ETHERFUSE_MERCHANT_ID;
    
    // Axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Kustodia/1.0.0'
      }
    });

    // Request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      if (this.apiKey) {
        // EtherFuse uses the API key directly in Authorization header (not Bearer)
        config.headers['Authorization'] = this.apiKey;
      }
      return config;
    });

    // Response interceptor for detailed error logging.
    // We use Promise.reject(error) to allow individual method try/catch blocks
    // to handle the error gracefully, rather than letting it bubble up globally.
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log detailed error information for debugging
        console.error('EtherFuse API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });
        // Reject the promise to allow local catch blocks to execute
        return Promise.reject(error);
      }
    );
  }

  /**
   * Test API connectivity
   */
  async healthCheck() {
    try {
      // Use a simple customer list call as health check since there's no dedicated health endpoint
      const response = await this.api.post('/ramp/customers', {
        pageSize: 1,
        pageNumber: 0
      });
      
      return {
        success: true,
        status: 'healthy',
        environment: this.isProduction ? 'production' : 'sandbox',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('EtherFuse API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      return {
        success: false,
        status: 'unhealthy',
        environment: this.isProduction ? 'production' : 'sandbox',
        error: error.message
      };
    }
  }

  /**
   * Get current CETES yield rate
   */
  async getCurrentRate() {
    try {
      // Note: This endpoint may not exist in current API
      // Using fallback rate for now
      const response = await this.api.get('/ramp/rates/cetes');
      
      return {
        success: true,
        rate: response.data.rate,
        currency: 'MXN',
        effective_date: response.data.effective_date
      };
    } catch (error) {
      console.error('EtherFuse API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Return fallback rate (7.2% annual)
      return {
        success: false,
        error: error.message,
        fallback_rate: 0.072
      };
    }
  }

  /**
   * Generate a pre-signed URL for user onboarding
   * @param {string} kustodiaCustomerId - The user's ID from our internal database
   * @param {string} kustodiaBankAccountId - A new unique ID we generate for this bank account relationship
   * @returns {Promise<Object>} The pre-signed URL for the user to complete onboarding
   */
  async generateOnboardingUrl(kustodiaCustomerId, kustodiaBankAccountId) {
    try {
      const payload = {
        customer_id: kustodiaCustomerId,
        bank_account_id: kustodiaBankAccountId,
        redirect_url: `${process.env.BASE_URL}/onboarding/success`
      };

      const response = await this.api.post('/ramp/onboarding-url', payload);
      
      return {
        success: true,
        presignedUrl: response.data.presignedUrl,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  }

  /**
   * List customers (for testing/admin purposes)
   */
  async listCustomers(pageSize = 10, pageNumber = 0) {
    try {
      const response = await this.api.post('/ramp/customers', {
        pageSize,
        pageNumber
      });
      
      return {
        success: true,
        customers: response.data.items,
        totalItems: response.data.totalItems,
        pageInfo: {
          pageSize: response.data.pageSize,
          pageNumber: response.data.pageNumber,
          totalPages: response.data.totalPages
        }
      };
    } catch (error) {
      console.error('EtherFuse API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create CETES investment order
   * @param {Object} orderData - Investment order details
   * @returns {Promise<Object>} Order creation result
   */
  async createCetesOrder(orderData) {
    try {
      const payload = {
        customer_id: orderData.customerId,
        amount: orderData.amount, // Amount in MXN
        currency: 'MXN',
        bond_type: 'CETES',
        investment_period: orderData.period || 'flexible', // flexible for escrow
        external_reference: `KUSTODIA_PAYMENT_${orderData.paymentId}`,
        metadata: {
          payment_id: orderData.paymentId,
          escrow_type: 'custody_yield',
          source: 'kustodia'
        },
        callback_url: `${process.env.BASE_URL}/api/etherfuse/webhook`,
        auto_compound: true // Reinvest earnings
      };

      const response = await this.api.post('/ramp/cetes/orders', payload);
      
      return {
        success: true,
        order_id: response.data.id,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  }

  /**
   * Get order status and earnings
   * @param {string} orderId - EtherFuse order ID
   * @returns {Promise<Object>} Order status and earnings
   */
  async getOrderStatus(orderId) {
    try {
      const response = await this.api.get(`/ramp/orders/${orderId}`);
      
      return {
        success: true,
        status: response.data.status,
        earnings: response.data.total_earnings,
        daily_earnings: response.data.daily_earnings,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Redeem/withdraw CETES investment
   * @param {string} orderId - EtherFuse order ID
   * @returns {Promise<Object>} Redemption result
   */
  async redeemOrder(orderId) {
    try {
      const payload = {
        redemption_type: 'full',
        reason: 'escrow_completion'
      };

      const response = await this.api.post(`/ramp/orders/${orderId}/redeem`, payload);
      
      return {
        success: true,
        redemption_id: response.data.redemption_id,
        principal: response.data.principal_amount,
        earnings: response.data.total_earnings,
        total: response.data.total_amount,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Calculate expected yield for display
   * @param {number} amount - Principal amount in MXN
   * @param {number} days - Number of days in custody
   * @param {number} annualRate - Annual rate (optional, will fetch if not provided)
   * @returns {Promise<Object>} Yield calculation
   */
  async calculateYield(amount, days, annualRate = null) {
    try {
      // Get current rate if not provided
      if (!annualRate) {
        const rateResult = await this.getCurrentRate();
        annualRate = rateResult.success 
          ? rateResult.rate 
          : rateResult.fallback_rate;
      }

      // Daily compounding calculation
      const dailyRate = annualRate / 365;
      const compoundFactor = Math.pow(1 + dailyRate, days);
      const totalAmount = amount * compoundFactor;
      const earnings = totalAmount - amount;

      return {
        success: true,
        principal: amount,
        days: days,
        annual_rate: annualRate,
        daily_rate: dailyRate,
        total_earnings: Math.round(earnings * 100) / 100, // Round to 2 decimals
        percentage_yield: Math.round((earnings / amount) * 10000) / 100, // 2 decimal percentage
        total_amount: Math.round(totalAmount * 100) / 100
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature for security
   * @param {string} payload - Raw request body
   * @param {string} signature - Webhook signature header
   * @returns {boolean} Whether signature is valid
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

module.exports = EtherFuseService;
