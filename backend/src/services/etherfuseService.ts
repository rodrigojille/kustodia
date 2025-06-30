import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as crypto from 'crypto';

// --- Interfaces for API communication ---

interface CreateCustomerData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface CreateCetesOrderData {
  customerId: string;
  amount: number;
  paymentId: string;
  period?: string;
}

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  code?: number;
  data?: T;
}

/**
 * EtherFuse API Integration Service
 * Handles CETES yield generation integration
 */
export class EtherFuseService {
  private isProduction: boolean;
  private apiKey: string | undefined;
  private baseURL: string;
  private apiSecret: string | undefined;
  private merchantId: string | undefined;
  private api: AxiosInstance;

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

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Kustodia/1.0.0'
      }
    });

    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.apiKey) {
        config.headers.Authorization = this.apiKey as string;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        console.error('EtherFuse API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });
        return Promise.reject(error);
      }
    );
  }

  async createCustomer(customerData: CreateCustomerData): Promise<ApiResponse<{ customer_id: string; status: string }>> {
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
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return {
        success: false,
        error: err.response?.data?.message || err.message,
        code: err.response?.status
      };
    }
  }

  async createCetesOrder(orderData: CreateCetesOrderData): Promise<ApiResponse<{ order_id: string; data: any }>> {
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
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        return {
            success: false,
            error: err.response?.data?.message || err.message,
            code: err.response?.status
        };
    }
  }
  
  async getOrderStatus(orderId: string): Promise<ApiResponse<{ earnings: number }>> {
      try {
          const response = await this.api.get(`/ramp/orders/${orderId}`);
          return {
              success: true,
              data: {
                earnings: response.data.total_earnings
              }
          };
      } catch (error) {
          const err = error as AxiosError<{ message: string }>;
          return {
              success: false,
              error: err.response?.data?.message || err.message
          };
      }
  }

  async getCurrentRate(): Promise<ApiResponse<{ annual_rate: number }>> {
      try {
          // This endpoint might be hypothetical, adjust if the real one is known
          const response = await this.api.get('/ramp/rates/cetes');
          return {
              success: true,
              data: { annual_rate: response.data.rate }
          };
      } catch (error) {
          // Return fallback rate on error
          return {
              success: false, // Indicate failure
              error: (error as Error).message,
              data: { annual_rate: 0.072 } // Provide fallback
          };
      }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.apiSecret) {
        console.error('API Secret for webhook verification is not configured.');
        return false;
    }
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Health check for the EtherFuse service
   */
  async healthCheck(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const rateResponse = await this.getCurrentRate();
      if (rateResponse.success) {
        return { success: true, message: 'EtherFuse API is reachable.' };
      } else {
        return { success: false, message: 'Could not retrieve data from EtherFuse API.', data: rateResponse.error };
      }
    } catch (error: any) {
      return { success: false, message: 'Failed to connect to EtherFuse API.', data: error.message };
    }
  }
}
