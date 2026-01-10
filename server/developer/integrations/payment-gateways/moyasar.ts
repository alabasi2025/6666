/**
 * Moyasar Payment Gateway Service
 * خدمة تكامل مع بوابة Moyasar للدفع
 * 
 * Documentation: https://docs.moyasar.com
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../../utils/logger';

interface MoyasarConfig {
  apiKey: string;
  apiUrl?: string;
  testMode?: boolean;
}

interface CreatePaymentRequest {
  amount: number; // بالريال
  currency?: string;
  description?: string;
  callbackUrl?: string;
  source: {
    type: 'creditcard' | 'applepay' | 'mada' | 'stcpay';
    name?: string;
    number?: string;
    cvc?: string;
    month?: string;
    year?: string;
    manual?: string; // للمدخلات اليدوية
    token?: string; // للتوكنات
    message?: string; // للرسائل
  };
  metadata?: Record<string, any>;
}

interface MoyasarPaymentResponse {
  id: string;
  status: 'paid' | 'failed' | 'initiated';
  amount: number;
  currency: string;
  description?: string;
  invoice_id?: string;
  ip?: string;
  callback_url?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  source: {
    type: string;
    company?: string;
    name?: string;
    number?: string;
    gateway_id?: string;
    reference_number?: string;
    token?: string;
    message?: string;
    transaction_url?: string;
  };
  refunded?: number;
  refunded_at?: string;
  currency_rate?: number;
  fee?: number;
  failure_code?: string;
  failure_message?: string;
}

interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export class MoyasarGateway {
  private config: MoyasarConfig;
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config?: Partial<MoyasarConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.MOYASAR_API_KEY || '',
      apiUrl: config?.apiUrl || process.env.MOYASAR_API_URL || 'https://api.moyasar.com',
      testMode: config?.testMode ?? process.env.MOYASAR_TEST_MODE === 'true',
    };

    if (!this.config.apiKey) {
      logger.warn('Moyasar API Key not configured');
    }

    this.baseUrl = this.config.apiUrl;

    // إنشاء Axios client
    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.config.apiKey,
        password: '', // Moyasar uses API key as username
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Moyasar API Request', {
          method: config.method,
          url: config.url,
          testMode: this.config.testMode,
        });
        return config;
      },
      (error) => {
        logger.error('Moyasar API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Moyasar API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('Moyasar API Response Error', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * اختبار الاتصال مع Moyasar
   */
  async testConnection(): Promise<TestConnectionResponse> {
    try {
      // محاولة جلب قائمة المدفوعات (طريقة خفيفة للاختبار)
      const response = await this.client.get('/v1/payments', {
        params: {
          per: 1, // جلب دفعة واحدة فقط للاختبار
        },
      });

      return {
        success: true,
        message: 'الاتصال مع Moyasar ناجح',
      };
    } catch (error: any) {
      logger.error('Moyasar connection test failed', {
        error: error.message,
        status: error.response?.status,
      });

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'فشل الاتصال مع Moyasar',
      };
    }
  }

  /**
   * إنشاء معاملة دفع جديدة
   */
  async createPayment(request: CreatePaymentRequest): Promise<MoyasarPaymentResponse> {
    try {
      // تحويل المبلغ من ريال إلى هللة (Moyasar يستخدم هللة)
      const amountInHalalas = Math.round(request.amount * 100);

      const paymentRequest = {
        amount: amountInHalalas,
        currency: request.currency || 'SAR',
        description: request.description,
        callback_url: request.callbackUrl,
        source: request.source,
        metadata: request.metadata,
      };

      logger.info('Creating Moyasar payment', {
        amount: request.amount,
        amountInHalalas,
        currency: paymentRequest.currency,
        sourceType: request.source.type,
      });

      const response = await this.client.post<MoyasarPaymentResponse>(
        '/v1/payments',
        paymentRequest
      );

      logger.info('Moyasar payment created', {
        paymentId: response.data.id,
        status: response.data.status,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to create Moyasar payment', {
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
  async getPayment(paymentId: string): Promise<MoyasarPaymentResponse> {
    try {
      const response = await this.client.get<MoyasarPaymentResponse>(
        `/v1/payments/${paymentId}`
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get Moyasar payment', {
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
        isPaid: payment.status === 'paid',
        isFailed: payment.status === 'failed',
        amount: payment.amount / 100, // تحويل من هللة إلى ريال
        failureCode: payment.failure_code,
        failureMessage: payment.failure_message,
      };
    } catch (error: any) {
      logger.error('Failed to verify Moyasar payment', {
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
  ): Promise<MoyasarPaymentResponse> {
    try {
      const refundData: any = {};
      
      if (amount) {
        // تحويل المبلغ من ريال إلى هللة
        refundData.amount = Math.round(amount * 100);
      }

      const response = await this.client.post<MoyasarPaymentResponse>(
        `/v1/payments/${paymentId}/refund`,
        refundData
      );

      logger.info('Moyasar payment refunded', {
        paymentId,
        refundedAmount: amount,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to refund Moyasar payment', {
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
   * التحقق من توقيع Webhook باستخدام HMAC SHA256
   */
  static verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string
  ): boolean {
    try {
      const crypto = require('crypto');
      
      // Moyasar يوقع payload كـ JSON string
      const payloadString = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload);
      
      // حساب HMAC SHA256
      const hash = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      // المقارنة (case-insensitive)
      const isValid = hash.toLowerCase() === signature.toLowerCase();

      if (!isValid) {
        logger.warn('Invalid Moyasar webhook signature', {
          expectedHash: hash.substring(0, 10) + '...',
          receivedSignature: signature.substring(0, 10) + '...',
        });
      }

      return isValid;
    } catch (error: any) {
      logger.error('Error verifying Moyasar webhook signature', {
        error: error.message,
      });
      return false;
    }
  }
}

// Export singleton instance
export const moyasarGateway = new MoyasarGateway();
