/**
 * STS API Client
 * عميل API للاتصال مع نظام STS (Smart Token System)
 * 
 * التكامل مع نظام صديق الذي يبيع العدادات ويوفر:
 * - شحن أكواد (Tokens)
 * - سحب قراءة العداد
 * - إصدار أكواد صيانة
 * - التحكم بالعداد (خفض/رفع الأمبير، تشغيل/إطفاء)
 * - معرفة الرصيد وكم باقي كيلوهات
 * - القراءة الحالية
 * - معرفة حالة الاتصال (متصل/منقطع بالـ DCU عبر RF)
 * 
 * هذا الملف جزء من نظام المطور (Developer System)
 * جميع التكاملات الخارجية يجب أن تكون في نظام المطور
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { logger } from "../../utils/logger";

interface STSAPIConfig {
  baseURL: string;
  apiKey: string;
  apiSecret?: string;
  merchantId?: string;
  timeout?: number;
  retryAttempts?: number;
}

interface MeterReading {
  meterId: string;
  meterNumber: string;
  currentReading: number;
  previousReading: number;
  consumption: number;
  remainingKWH: number;
  balance: number;
  timestamp: string;
  [key: string]: any;
}

interface MeterStatus {
  meterId: string;
  meterNumber: string;
  isConnected: boolean;
  connectionType: "rf" | "wired" | "unknown";
  dcuId?: string;
  signalStrength?: number;
  lastConnectionTime?: string;
  status: "online" | "offline" | "maintenance";
  [key: string]: any;
}

interface TokenResponse {
  success: boolean;
  token?: string;
  tokenId?: string;
  amount: number;
  meterId: string;
  expirationDate?: string;
  error?: string;
  message?: string;
}

interface MaintenanceCodeResponse {
  success: boolean;
  code?: string;
  codeId?: string;
  meterId: string;
  codeType: "maintenance" | "repair" | "inspection";
  expirationDate?: string;
  error?: string;
  message?: string;
}

interface ControlResponse {
  success: boolean;
  commandId?: string;
  meterId: string;
  commandType: "disconnect" | "reconnect" | "setAmperage" | "turnOn" | "turnOff";
  message?: string;
  error?: string;
}

export class STSAPIClient {
  private client: AxiosInstance;
  private config: Required<STSAPIConfig>;
  private retryAttempts: number;

  constructor(config: STSAPIConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      merchantId: "",
      apiSecret: "",
      ...config,
    } as Required<STSAPIConfig>;

    this.retryAttempts = this.config.retryAttempts;

    // إنشاء Axios instance
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
        "X-Merchant-Id": this.config.merchantId || "",
        // يمكن إضافة API Secret في header آخر إذا لزم الأمر
        ...(this.config.apiSecret && { "X-API-Secret": this.config.apiSecret }),
      },
    });

    // إعداد interceptors للمعالجة
    this.setupInterceptors();
  }

  /**
   * إعداد interceptors للتعامل مع الأخطاء وإعادة المحاولة
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug("STS API Request", {
          method: config.method,
          url: config.url,
        });
        return config;
      },
      (error) => {
        logger.error("STS API Request Error", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug("STS API Response", {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as any;
        
        // إعادة المحاولة في حالة أخطاء الشبكة أو 5xx
        if (
          (!config || !config.__retryCount) &&
          (error.code === "ECONNABORTED" ||
            (error.response && error.response.status >= 500))
        ) {
          config.__retryCount = config.__retryCount || 0;
          
          if (config.__retryCount < this.retryAttempts) {
            config.__retryCount++;
            const delay = Math.pow(2, config.__retryCount) * 1000; // Exponential backoff
            
            logger.warn(`STS API Retry ${config.__retryCount}/${this.retryAttempts}`, {
              url: config.url,
              delay,
            });
            
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.client(config);
          }
        }

        logger.error("STS API Error", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: config?.url,
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * شحن عداد STS (إنشاء Token)
   * ملاحظة: STS يولد كيلوهات وليس رصيد نقدي
   * @param meterId معرف العداد
   * @param amount المبلغ المطلوب شحنه (ريال)
   * @param paymentMethod طريقة الدفع (اختياري)
   * @param tariffId معرف التعرفة (لحساب الكيلوهات من المبلغ)
   */
  async chargeMeter(
    meterId: string,
    amount: number,
    paymentMethod?: string,
    tariffId?: string
  ): Promise<TokenResponse> {
    try {
      const response = await this.client.post("/api/meters/charge", {
        meterId,
        amount,
        paymentMethod,
        tariffId, // لإحتساب الكيلوهات من المبلغ حسب التعرفة
      });
      
      return {
        success: true,
        token: response.data.token,
        tokenId: response.data.tokenId,
        amount,
        meterId,
        expirationDate: response.data.expirationDate,
        message: response.data.message || "تم شحن العداد بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to charge STS meter", {
        meterId,
        amount,
        error: error.message,
      });
      return {
        success: false,
        amount,
        meterId,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * سحب قراءة العداد
   * @param meterId معرف العداد
   */
  async getMeterReading(meterId: string): Promise<MeterReading> {
    try {
      const response = await this.client.get(`/api/meters/${meterId}/reading`);
      return response.data.data || response.data;
    } catch (error: any) {
      logger.error("Failed to get STS meter reading", {
        meterId,
        error: error.message,
      });
      throw new Error(`فشل في جلب قراءة العداد: ${error.message}`);
    }
  }

  /**
   * جلب قراءات متعددة للعدادات
   * @param meterIds قائمة معرفات العدادات
   */
  async getMeterReadings(meterIds: string[]): Promise<MeterReading[]> {
    try {
      const response = await this.client.post("/api/meters/readings/batch", {
        meterIds,
      });
      return response.data.data || response.data;
    } catch (error: any) {
      logger.error("Failed to get STS meter readings", {
        meterIds,
        error: error.message,
      });
      throw new Error(`فشل في جلب قراءات العدادات: ${error.message}`);
    }
  }

  /**
   * معرفة حالة العداد (متصل/منقطع)
   * @param meterId معرف العداد
   */
  async getMeterStatus(meterId: string): Promise<MeterStatus> {
    try {
      const response = await this.client.get(`/api/meters/${meterId}/status`);
      return response.data.data || response.data;
    } catch (error: any) {
      logger.error("Failed to get STS meter status", {
        meterId,
        error: error.message,
      });
      throw new Error(`فشل في جلب حالة العداد: ${error.message}`);
    }
  }

  /**
   * معرفة الرصيد وكم باقي كيلوهات
   * @param meterId معرف العداد
   */
  async getMeterBalance(meterId: string): Promise<{
    meterId: string;
    balance: number;
    remainingKWH: number;
    currentReading: number;
    lastUpdate: string;
  }> {
    try {
      const response = await this.client.get(`/api/meters/${meterId}/balance`);
      return response.data.data || response.data;
    } catch (error: any) {
      logger.error("Failed to get STS meter balance", {
        meterId,
        error: error.message,
      });
      throw new Error(`فشل في جلب رصيد العداد: ${error.message}`);
    }
  }

  /**
   * إصدار كود صيانة للعداد
   * @param meterId معرف العداد
   * @param codeType نوع الكود (maintenance, repair, inspection)
   * @param reason سبب الصيانة (اختياري)
   */
  async generateMaintenanceCode(
    meterId: string,
    codeType: "maintenance" | "repair" | "inspection",
    reason?: string
  ): Promise<MaintenanceCodeResponse> {
    try {
      const response = await this.client.post("/api/meters/maintenance-code", {
        meterId,
        codeType,
        reason,
      });
      
      return {
        success: true,
        code: response.data.code,
        codeId: response.data.codeId,
        meterId,
        codeType,
        expirationDate: response.data.expirationDate,
        message: response.data.message || "تم إصدار كود الصيانة بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to generate maintenance code", {
        meterId,
        codeType,
        error: error.message,
      });
      return {
        success: false,
        meterId,
        codeType,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * فصل العداد (Disconnect)
   * @param meterId معرف العداد
   * @param reason سبب الفصل (اختياري)
   */
  async disconnectMeter(meterId: string, reason?: string): Promise<ControlResponse> {
    try {
      const response = await this.client.post("/api/meters/disconnect", {
        meterId,
        reason,
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        meterId,
        commandType: "disconnect",
        message: response.data.message || "تم فصل العداد بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to disconnect STS meter", {
        meterId,
        error: error.message,
      });
      return {
        success: false,
        meterId,
        commandType: "disconnect",
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * إعادة توصيل العداد (Reconnect)
   * @param meterId معرف العداد
   */
  async reconnectMeter(meterId: string): Promise<ControlResponse> {
    try {
      const response = await this.client.post("/api/meters/reconnect", {
        meterId,
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        meterId,
        commandType: "reconnect",
        message: response.data.message || "تم إعادة توصيل العداد بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to reconnect STS meter", {
        meterId,
        error: error.message,
      });
      return {
        success: false,
        meterId,
        commandType: "reconnect",
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * خفض الأمبير
   * @param meterId معرف العداد
   * @param amperage قيمة الأمبير الجديدة
   */
  async reduceAmperage(meterId: string, amperage: number): Promise<ControlResponse> {
    try {
      const response = await this.client.post("/api/meters/set-amperage", {
        meterId,
        amperage,
        action: "reduce",
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        meterId,
        commandType: "setAmperage",
        message: response.data.message || `تم خفض الأمبير إلى ${amperage}A بنجاح`,
      };
    } catch (error: any) {
      logger.error("Failed to reduce amperage", {
        meterId,
        amperage,
        error: error.message,
      });
      return {
        success: false,
        meterId,
        commandType: "setAmperage",
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * رفع الأمبير
   * @param meterId معرف العداد
   * @param amperage قيمة الأمبير الجديدة
   */
  async increaseAmperage(meterId: string, amperage: number): Promise<ControlResponse> {
    try {
      const response = await this.client.post("/api/meters/set-amperage", {
        meterId,
        amperage,
        action: "increase",
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        meterId,
        commandType: "setAmperage",
        message: response.data.message || `تم رفع الأمبير إلى ${amperage}A بنجاح`,
      };
    } catch (error: any) {
      logger.error("Failed to increase amperage", {
        meterId,
        amperage,
        error: error.message,
      });
      return {
        success: false,
        meterId,
        commandType: "setAmperage",
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * تشغيل العداد (Turn On)
   * @param meterId معرف العداد
   */
  async turnOnMeter(meterId: string): Promise<ControlResponse> {
    try {
      const response = await this.client.post("/api/meters/turn-on", {
        meterId,
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        meterId,
        commandType: "turnOn",
        message: response.data.message || "تم تشغيل العداد بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to turn on STS meter", {
        meterId,
        error: error.message,
      });
      return {
        success: false,
        meterId,
        commandType: "turnOn",
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * إطفاء العداد (Turn Off)
   * @param meterId معرف العداد
   */
  async turnOffMeter(meterId: string): Promise<ControlResponse> {
    try {
      const response = await this.client.post("/api/meters/turn-off", {
        meterId,
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        meterId,
        commandType: "turnOff",
        message: response.data.message || "تم إطفاء العداد بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to turn off STS meter", {
        meterId,
        error: error.message,
      });
      return {
        success: false,
        meterId,
        commandType: "turnOff",
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * التحقق من حالة الأمر
   * @param commandId معرف الأمر
   */
  async checkCommandStatus(commandId: string): Promise<{
    status: "pending" | "executed" | "failed";
    message?: string;
  }> {
    try {
      const response = await this.client.get(`/api/commands/${commandId}/status`);
      return response.data;
    } catch (error: any) {
      logger.error("Failed to check command status", {
        commandId,
        error: error.message,
      });
      throw new Error(`فشل في التحقق من حالة الأمر: ${error.message}`);
    }
  }

  /**
   * التحقق من حالة الشحن
   * @param chargeRequestId معرف طلب الشحن
   */
  async verifyCharge(chargeRequestId: number): Promise<{
    success: boolean;
    status: "pending" | "completed" | "failed";
    token?: string;
    message?: string;
  }> {
    try {
      const response = await this.client.get(`/api/charges/${chargeRequestId}/verify`);
      return response.data;
    } catch (error: any) {
      logger.error("Failed to verify charge", {
        chargeRequestId,
        error: error.message,
      });
      throw new Error(`فشل في التحقق من حالة الشحن: ${error.message}`);
    }
  }

  /**
   * اختبار الاتصال
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get("/api/health");
      return response.status === 200;
    } catch (error: any) {
      logger.error("STS API connection test failed", error);
      return false;
    }
  }
}

/**
 * إنشاء instance افتراضي من STSAPIClient
 * يمكن استبدالها بإعدادات من قاعدة البيانات أو متغيرات البيئة
 */
export function createSTSAPIClient(): STSAPIClient {
  const config: STSAPIConfig = {
    baseURL: process.env.STS_API_BASE_URL || "https://api.sts-provider.com",
    apiKey: process.env.STS_API_KEY || "",
    apiSecret: process.env.STS_API_SECRET,
    merchantId: process.env.STS_MERCHANT_ID,
    timeout: parseInt(process.env.STS_API_TIMEOUT || "30000"),
    retryAttempts: parseInt(process.env.STS_API_RETRY_ATTEMPTS || "3"),
  };

  if (!config.apiKey) {
    logger.warn("STS API Key not configured. Please set STS_API_KEY environment variable.");
  }

  return new STSAPIClient(config);
}

