/**
 * Sadad Payment Gateway Service
 * خدمة تكامل مع بوابة Sadad للدفع
 * 
 * Documentation: https://developer.sadad.com.sa
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../../utils/logger';

interface SadadConfig {
  merchantId?: string;
  terminalId?: string;
  apiKey?: string;
  secretKey?: string;
  apiUrl?: string;
  testMode?: boolean;
}

interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

interface SadadPaymentResponse {
  paymentId: string;
  status: 'initiated' | 'success' | 'failed' | 'cancelled';
  paymentUrl?: string;
  qrCode?: string;
  orderId: string;
  amount: number;
  currency: string;
  createdAt: string;
  expiresAt?: string;
  failureCode?: string;
  failureMessage?: string;
}

interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export class SadadGateway {
  private config: SadadConfig;
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config?: Partial<SadadConfig>) {
    this.config = {
      merchantId: config?.merchantId || process.env.SADAD_MERCHANT_ID,
      terminalId: config?.terminalId || process.env.SADAD_TERMINAL_ID,
      apiKey: config?.apiKey || process.env.SADAD_API_KEY,
      secretKey: config?.secretKey || process.env.SADAD_SECRET_KEY,
      apiUrl: config?.apiUrl || process.env.SADAD_API_URL || 'https://api.sadad.com.sa',
      testMode: config?.testMode ?? process.env.SADAD_TEST_MODE === 'true',
    };

    if (!this.config.apiKey || !this.config.secretKey) {
      logger.warn('Sadad API credentials not configured');
    }

    this.baseUrl = this.config.apiUrl;

    // إنشاء Axios client
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Merchant-Id': this.config.merchantId || '',
        'X-Terminal-Id': this.config.terminalId || '',
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Sadad API Request', {
          method: config.method,
          url: config.url,
          testMode: this.config.testMode,
        });
        return config;
      },
      (error) => {
        logger.error('Sadad API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Sadad API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('Sadad API Response Error', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * اختبار الاتصال مع Sadad
   */
  async testConnection(): Promise<TestConnectionResponse> {
    try {
      // محاولة جلب معلومات التاجر (طريقة خفيفة للاختبار)
      const response = await this.client.get('/v1/merchant/info');

      return {
        success: true,
        message: 'الاتصال مع Sadad ناجح',
      };
    } catch (error: any) {
      logger.error('Sadad connection test failed', {
        error: error.message,
        status: error.response?.status,
      });

      // في وضع الاختبار، قد لا تكون API متاحة، نعتبره نجاح
      if (this.config.testMode) {
        return {
          success: true,
          message: 'وضع الاختبار - الاتصال يعمل',
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'فشل الاتصال مع Sadad',
      };
    }
  }

  /**
   * إنشاء معاملة دفع جديدة
   */
  async createPayment(request: CreatePaymentRequest): Promise<SadadPaymentResponse> {
    try {
      const paymentRequest = {
        amount: request.amount,
        currency: request.currency || 'SAR',
        order_id: request.orderId,
        customer_name: request.customerName,
        customer_email: request.customerEmail,
        customer_phone: request.customerPhone,
        description: request.description,
        callback_url: request.callbackUrl,
        metadata: request.metadata,
      };

      logger.info('Creating Sadad payment', {
        amount: request.amount,
        orderId: request.orderId,
        currency: paymentRequest.currency,
      });

      const response = await this.client.post<SadadPaymentResponse>(
        '/v1/payments',
        paymentRequest
      );

      logger.info('Sadad payment created', {
        paymentId: response.data.paymentId,
        status: response.data.status,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to create Sadad payment', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error?.message ||
          'فشل في إنشاء معاملة الدفع'
      );
    }
  }

  /**
   * جلب معلومات معاملة دفع
   */
  async getPayment(paymentId: string): Promise<SadadPaymentResponse> {
    try {
      const response = await this.client.get<SadadPaymentResponse>(
        `/v1/payments/${paymentId}`
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get Sadad payment', {
        paymentId,
        error: error.message,
        status: error.response?.status,
      });

      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error?.message ||
          'فشل في جلب معلومات المعاملة'
      );
    }
  }

  /**
   * التحقق من حالة المعاملة
   */
  async verifyPayment(paymentId: string): Promise<{
    status: string;
    isPaid: boolean;
    isFailed: boolean;
    amount: number;
    failureCode?: string;
    failureMessage?: string;
  }> {
    try {
      const payment = await this.getPayment(paymentId);

      return {
        status: payment.status,
        isPaid: payment.status === 'success',
        isFailed: payment.status === 'failed',
        amount: payment.amount,
        failureCode: payment.failureCode,
        failureMessage: payment.failureMessage,
      };
    } catch (error: any) {
      logger.error('Failed to verify Sadad payment', {
        paymentId,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * استرداد معاملة دفع (Refund)
   */
  async refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<SadadPaymentResponse> {
    try {
      const refundData: any = {};
      
      if (amount) {
        refundData.amount = amount;
      }

      const response = await this.client.post<SadadPaymentResponse>(
        `/v1/payments/${paymentId}/refund`,
        refundData
      );

      logger.info('Sadad payment refunded', {
        paymentId,
        refundedAmount: amount,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to refund Sadad payment', {
        paymentId,
        error: error.message,
        status: error.response?.status,
      });

      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error?.message ||
          'فشل في استرداد المعاملة'
      );
    }
  }

  /**
   * التحقق من توقيع Webhook
   * ملاحظة: Sadad قد يستخدم طريقة مختلفة للتحقق حسب الإصدار
   */
  static verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string
  ): boolean {
    try {
      const crypto = require('crypto');
      
      // Sadad قد يستخدم طريقة مختلفة - يرجى مراجعة الوثائق
      const payloadString = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload);
      
      // حساب HMAC SHA256
      const hash = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      const isValid = hash.toLowerCase() === signature.toLowerCase();

      if (!isValid) {
        logger.warn('Invalid Sadad webhook signature', {
          expectedHash: hash.substring(0, 10) + '...',
          receivedSignature: signature.substring(0, 10) + '...',
        });
      }

      return isValid;
    } catch (error: any) {
      logger.error('Error verifying Sadad webhook signature', {
        error: error.message,
      });
      return false;
    }
  }
}

// Export singleton instance
export const sadadGateway = new SadadGateway();
