/**
 * ACREL API Client
 * عميل API للاتصال مع منصة ACREL IoT-EMS
 * 
 * ملاحظة: التكامل يتم عبر REST API وليس MQTT
 * 
 * هذا الملف جزء من نظام المطور (Developer System)
 * جميع التكاملات الخارجية يجب أن تكون في نظام المطور
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { logger } from "../../utils/logger";

interface AcrelAPIConfig {
  baseURL: string;
  apiKey: string;
  apiSecret?: string;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * نوع العداد ACREL
 */
export type AcrelMeterType = "ADL200" | "ADW300";

/**
 * نوع الطور (Phase Type)
 */
export type PhaseType = "single" | "three";

/**
 * نوع محول التيار (Current Transformer Type)
 */
export type CTType = "built_in" | "external";

/**
 * نوع قرص محول التيار (CT Core Type)
 */
export type CTCoreType = "split" | "solid"; // قابل للفتح | حلقة مغلقة

/**
 * أحجام محولات التيار المتاحة (أمبير)
 */
export type CTSize = 100 | 150 | 200 | 250 | 300 | 400 | 600 | 800 | 1000;

/**
 * نوع الدفع
 */
export type PaymentMode = "postpaid" | "prepaid" | "credit"; // دفع آجل | دفع مسبق | ائتمان

/**
 * تعرفة زمنية (Time of Use Tariff)
 */
interface TimeOfUseTariff {
  tariffId: string;
  name: string;
  startTime: string; // HH:mm (مثال: "06:00")
  endTime: string; // HH:mm (مثال: "18:00")
  pricePerKWH: number; // سعر الكيلووات ساعة
  isActive: boolean;
}

/**
 * جدول التعرفات المتعددة (8 تعرفات في اليوم)
 */
interface MultiTariffSchedule {
  meterId: string;
  tariffs: TimeOfUseTariff[]; // حتى 8 تعرفات
  effectiveDate?: string; // تاريخ تفعيل الجدول
  [key: string]: any;
}

/**
 * معلومات الائتمان (Credit Limit)
 */
interface CreditInfo {
  meterId: string;
  creditLimit: number; // حد الائتمان (ريال)
  currentDebt: number; // الدين الحالي (ريال)
  creditUsed: number; // الائتمان المستخدم
  remainingCredit: number; // الائتمان المتبقي
  autoDisconnect: boolean; // إطفاء تلقائي عند الوصول للحد
  [key: string]: any;
}

/**
 * معلومات الرصيد (للمسبق الدفع)
 */
interface PrepaidBalance {
  meterId: string;
  balance: number; // الرصيد الحالي (ريال)
  consumptionRate: number; // معدل الاستهلاك حسب التعرفة
  estimatedDaysRemaining: number; // الأيام المتبقية المتوقعة
  lastUpdate: string;
  [key: string]: any;
}

/**
 * قراءة عداد ADL200 (للمشتركين)
 * Single Phase - سنجل فاز
 */
interface ADL200Reading {
  meterId: string;
  meterType: "ADL200";
  phaseType: "single"; // سنجل فاز
  timestamp: string;
  // القياسات الأساسية (Single Phase)
  voltage?: number; // الجهد (فولت)
  current?: number; // التيار (أمبير)
  power?: number; // القدرة (وات)
  energy?: number; // الطاقة المستهلكة (كيلووات ساعة)
  frequency?: number; // التردد (هيرتز)
  powerFactor?: number; // معامل القدرة
  [key: string]: any;
}

/**
 * قراءة عداد ADW300 (للمراقبة)
 * Three Phase - ثلاثي فاز مع محولات تيار
 */
interface ADW300Reading {
  meterId: string;
  meterType: "ADW300";
  phaseType: "three"; // ثلاثي فاز
  timestamp: string;
  // الطاقة
  exportedEnergy?: number; // الطاقة المصدرة (كيلووات ساعة)
  importedEnergy?: number; // الطاقة المستوردة (كيلووات ساعة)
  totalEnergy?: number; // إجمالي الطاقة (كيلووات ساعة)
  // القياسات الأساسية (Three Phase)
  voltageL1?: number; // الجهد الطور الأول (فولت)
  voltageL2?: number; // الجهد الطور الثاني (فولت)
  voltageL3?: number; // الجهد الطور الثالث (فولت)
  voltageAvg?: number; // متوسط الجهد (فولت)
  currentL1?: number; // التيار الطور الأول (أمبير) - بعد محول التيار
  currentL2?: number; // التيار الطور الثاني (أمبير) - بعد محول التيار
  currentL3?: number; // التيار الطور الثالث (أمبير) - بعد محول التيار
  currentAvg?: number; // متوسط التيار (أمبير)
  powerL1?: number; // القدرة الطور الأول (وات)
  powerL2?: number; // القدرة الطور الثاني (وات)
  powerL3?: number; // القدرة الطور الثالث (وات)
  powerTotal?: number; // إجمالي القدرة (وات)
  frequency?: number; // التردد (هيرتز)
  powerFactor?: number; // معامل القدرة
  // معلومات محولات التيار
  ct1Ratio?: number; // نسبة محول التيار الأول (مثال: 100/5)
  ct2Ratio?: number; // نسبة محول التيار الثاني
  ct3Ratio?: number; // نسبة محول التيار الثالث
  // حساسات الحرارة (4 منافذ)
  temperature1?: number; // حساس الحرارة الأول (درجة مئوية)
  temperature2?: number; // حساس الحرارة الثاني (درجة مئوية)
  temperature3?: number; // حساس الحرارة الثالث (درجة مئوية)
  temperature4?: number; // حساس الحرارة الرابع (درجة مئوية)
  // قياس التسرب
  leakageCurrent?: number; // تيار التسرب (أمبير)
  // حالة القاطع (شغال/طافي)
  breakerStatus?: "on" | "off" | "trip"; // حالة القاطع
  breakerStatusRaw?: number; // القيمة الخام من العداد (قراءة فقط، لا تحكم)
  [key: string]: any;
}

/**
 * قراءة عداد ACREL (موحد)
 */
type MeterReading = ADL200Reading | ADW300Reading;

/**
 * معلومات محول التيار (لـ ADW300)
 */
interface CurrentTransformerInfo {
  type: CTType; // built_in أو external
  size?: CTSize; // حجم المحول (أمبير) - فقط للنوع external
  coreType?: CTCoreType; // split أو solid - فقط للنوع external
  ct1Size?: CTSize; // حجم المحول الأول (أمبير)
  ct2Size?: CTSize; // حجم المحول الثاني (أمبير)
  ct3Size?: CTSize; // حجم المحول الثالث (أمبير)
  ct1CoreType?: CTCoreType; // نوع قرص المحول الأول
  ct2CoreType?: CTCoreType; // نوع قرص المحول الثاني
  ct3CoreType?: CTCoreType; // نوع قرص المحول الثالث
  isFixed?: boolean; // هل المحولات مثبتة بالعداد (لا يمكن تغييرها)
}

/**
 * معلومات العداد
 */
interface MeterInfo {
  meterId: string;
  meterNumber: string;
  meterType: AcrelMeterType;
  phaseType: PhaseType; // single للـ ADL200، three للـ ADW300
  model: string;
  manufacturer: string;
  installationDate?: string;
  location?: string;
  connectionType: "wifi" | "rs485" | "mqtt";
  networkId?: string; // معرف شبكة WiFi
  status: "online" | "offline" | "maintenance";
  lastSeen?: string;
  // معلومات محولات التيار (لـ ADW300 فقط)
  currentTransformers?: CurrentTransformerInfo;
  [key: string]: any;
}

/**
 * بيانات البنية التحتية (للمراقبة)
 */
interface InfrastructureMetric {
  deviceId: string;
  deviceType: "generator" | "cable" | "meter_panel" | "solar_panel";
  timestamp: string;
  metrics: Record<string, number>;
  // للطاقة الشمسية والمولدات
  exportedEnergy?: number;
  importedEnergy?: number;
  totalEnergy?: number;
}

interface CommandResponse {
  success: boolean;
  commandId?: string;
  message?: string;
  error?: string;
}

export class AcrelAPIClient {
  private client: AxiosInstance;
  private config: Required<AcrelAPIConfig>;
  private retryAttempts: number;

  constructor(config: AcrelAPIConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      ...config,
    } as Required<AcrelAPIConfig>;

    this.retryAttempts = this.config.retryAttempts;

    // إنشاء Axios instance
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
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
        logger.debug("ACREL API Request", {
          method: config.method,
          url: config.url,
        });
        return config;
      },
      (error) => {
        logger.error("ACREL API Request Error", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug("ACREL API Response", {
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
            
            logger.warn(`ACREL API Retry ${config.__retryCount}/${this.retryAttempts}`, {
              url: config.url,
              delay,
            });
            
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.client(config);
          }
        }

        logger.error("ACREL API Error", {
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
   * جلب معلومات العداد
   * @param meterId معرف العداد
   */
  async getMeterInfo(meterId: string): Promise<MeterInfo> {
    try {
      const response = await this.client.get(`/api/meters/${meterId}/info`);
      const info = response.data.data || response.data;
      
      // التأكد من أن المعلومات تحتوي على نوع الطور
      if (!info.phaseType) {
        info.phaseType = info.meterType === "ADL200" ? "single" : "three";
      }
      
      return info;
    } catch (error: any) {
      logger.error("Failed to get meter info", {
        meterId,
        error: error.message,
      });
      throw new Error(`فشل في جلب معلومات العداد: ${error.message}`);
    }
  }

  /**
   * تحديث معلومات محولات التيار (لـ ADW300)
   * @param meterId معرف العداد
   * @param ctInfo معلومات محولات التيار
   */
  async updateCTInfo(
    meterId: string,
    ctInfo: CurrentTransformerInfo
  ): Promise<CommandResponse> {
    try {
      const response = await this.client.post(`/api/meters/${meterId}/ct-info`, {
        ctInfo,
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        message: response.data.message || "تم تحديث معلومات محولات التيار بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to update CT info", {
        meterId,
        error: error.message,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * جلب قراءات العداد
   * @param meterId معرف العداد
   * @param startDate تاريخ البداية (اختياري)
   * @param endDate تاريخ النهاية (اختياري)
   */
  async getMeterReading(
    meterId: string,
    startDate?: string,
    endDate?: string
  ): Promise<MeterReading[]> {
    try {
      const params: any = { meterId };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await this.client.get("/api/meters/readings", { params });
      return response.data.data || response.data;
    } catch (error: any) {
      logger.error("Failed to get meter reading", {
        meterId,
        error: error.message,
      });
      throw new Error(`فشل في جلب قراءة العداد: ${error.message}`);
    }
  }

  /**
   * جلب قراءة عداد ADL200 (للمشتركين)
   * @param meterId معرف العداد
   */
  async getADL200Reading(meterId: string): Promise<ADL200Reading> {
    try {
      const response = await this.client.get(`/api/meters/${meterId}/reading/adl200`);
      return response.data.data || response.data;
    } catch (error: any) {
      logger.error("Failed to get ADL200 reading", {
        meterId,
        error: error.message,
      });
      throw new Error(`فشل في جلب قراءة عداد ADL200: ${error.message}`);
    }
  }

  /**
   * جلب قراءة عداد ADW300 (للمراقبة)
   * @param meterId معرف العداد
   */
  async getADW300Reading(meterId: string): Promise<ADW300Reading> {
    try {
      const response = await this.client.get(`/api/meters/${meterId}/reading/adw300`);
      const reading = response.data.data || response.data;
      
      // التأكد من أن القراءة تحتوي على جميع البيانات المطلوبة
      return {
        ...reading,
        meterType: "ADW300",
        phaseType: "three", // ثلاثي فاز
        // الطاقة
        exportedEnergy: reading.exportedEnergy || reading.energy_exported,
        importedEnergy: reading.importedEnergy || reading.energy_imported,
        totalEnergy: reading.totalEnergy || reading.energy_total,
        // الجهد (Three Phase)
        voltageL1: reading.voltageL1 || reading.voltage_l1 || reading.voltage1,
        voltageL2: reading.voltageL2 || reading.voltage_l2 || reading.voltage2,
        voltageL3: reading.voltageL3 || reading.voltage_l3 || reading.voltage3,
        voltageAvg: reading.voltageAvg || reading.voltage_avg,
        // التيار (Three Phase) - بعد محول التيار
        currentL1: reading.currentL1 || reading.current_l1 || reading.current1,
        currentL2: reading.currentL2 || reading.current_l2 || reading.current2,
        currentL3: reading.currentL3 || reading.current_l3 || reading.current3,
        currentAvg: reading.currentAvg || reading.current_avg,
        // القدرة (Three Phase)
        powerL1: reading.powerL1 || reading.power_l1 || reading.power1,
        powerL2: reading.powerL2 || reading.power_l2 || reading.power2,
        powerL3: reading.powerL3 || reading.power_l3 || reading.power3,
        powerTotal: reading.powerTotal || reading.power_total,
        // محولات التيار
        ct1Ratio: reading.ct1Ratio || reading.ct1_ratio,
        ct2Ratio: reading.ct2Ratio || reading.ct2_ratio,
        ct3Ratio: reading.ct3Ratio || reading.ct3_ratio,
        // حساسات الحرارة
        temperature1: reading.temperature1 || reading.temp1,
        temperature2: reading.temperature2 || reading.temp2,
        temperature3: reading.temperature3 || reading.temp3,
        temperature4: reading.temperature4 || reading.temp4,
        // التسرب
        leakageCurrent: reading.leakageCurrent || reading.leakage,
        // حالة القاطع
        breakerStatus: reading.breakerStatus || (reading.breaker === 1 ? "on" : reading.breaker === 0 ? "off" : "trip"),
        breakerStatusRaw: reading.breakerStatusRaw || reading.breaker,
      };
    } catch (error: any) {
      logger.error("Failed to get ADW300 reading", {
        meterId,
        error: error.message,
      });
      throw new Error(`فشل في جلب قراءة عداد ADW300: ${error.message}`);
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
      logger.error("Failed to get meter readings", {
        meterIds,
        error: error.message,
      });
      throw new Error(`فشل في جلب قراءات العدادات: ${error.message}`);
    }
  }

  /**
   * جلب بيانات البنية التحتية (للمراقبة)
   * @param deviceId معرف الجهاز (اختياري)
   * @param deviceType نوع الجهاز (generator, cable, meter_panel, solar_panel)
   */
  async getInfrastructureMetrics(
    deviceId?: string,
    deviceType?: "generator" | "cable" | "meter_panel" | "solar_panel"
  ): Promise<InfrastructureMetric[]> {
    try {
      const params: any = {};
      if (deviceId) params.deviceId = deviceId;
      if (deviceType) params.deviceType = deviceType;
      
      const response = await this.client.get("/api/infrastructure/metrics", { params });
      const metrics = response.data.data || response.data;
      
      // التأكد من أن البيانات تحتوي على الطاقة المصدرة/المستوردة
      return Array.isArray(metrics) ? metrics.map((m: any) => ({
        ...m,
        exportedEnergy: m.exportedEnergy || m.energy_exported,
        importedEnergy: m.importedEnergy || m.energy_imported,
        totalEnergy: m.totalEnergy || m.energy_total,
      })) : metrics;
    } catch (error: any) {
      logger.error("Failed to get infrastructure metrics", {
        deviceId,
        deviceType,
        error: error.message,
      });
      throw new Error(`فشل في جلب بيانات البنية التحتية: ${error.message}`);
    }
  }

  /**
   * جلب قراءات عدادات المراقبة (ADW300) المرتبطة بجهاز معين
   * @param deviceId معرف الجهاز (مولد، كيبل، طبلات، طاقة شمسية)
   */
  async getMonitoringMeterReadings(deviceId: string): Promise<ADW300Reading[]> {
    try {
      const response = await this.client.get(`/api/infrastructure/${deviceId}/meters/readings`);
      return response.data.data || response.data;
    } catch (error: any) {
      logger.error("Failed to get monitoring meter readings", {
        deviceId,
        error: error.message,
      });
      throw new Error(`فشل في جلب قراءات عدادات المراقبة: ${error.message}`);
    }
  }

  /**
   * فصل الخدمة عن مشترك
   * @param meterId معرف العداد
   * @param reason سبب الفصل (اختياري)
   */
  async disconnectMeter(meterId: string, reason?: string): Promise<CommandResponse> {
    try {
      const response = await this.client.post("/api/meters/disconnect", {
        meterId,
        reason,
      });
      return {
        success: true,
        commandId: response.data.commandId,
        message: response.data.message || "تم فصل الخدمة بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to disconnect meter", {
        meterId,
        error: error.message,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * إعادة توصيل الخدمة
   * @param meterId معرف العداد
   */
  async reconnectMeter(meterId: string): Promise<CommandResponse> {
    try {
      const response = await this.client.post("/api/meters/reconnect", {
        meterId,
      });
      return {
        success: true,
        commandId: response.data.commandId,
        message: response.data.message || "تم إعادة توصيل الخدمة بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to reconnect meter", {
        meterId,
        error: error.message,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * تغيير التعرفة عن بعد
   * @param meterId معرف العداد
   * @param tariffId معرف التعرفة الجديدة
   */
  async setTariff(meterId: string, tariffId: string): Promise<CommandResponse> {
    try {
      const response = await this.client.post("/api/meters/tariff", {
        meterId,
        tariffId,
      });
      return {
        success: true,
        commandId: response.data.commandId,
        message: response.data.message || "تم تغيير التعرفة بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to set tariff", {
        meterId,
        tariffId,
        error: error.message,
      });
      return {
        success: false,
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
   * ربط العداد بشبكة WiFi
   * @param meterId معرف العداد
   * @param networkId معرف شبكة WiFi
   * @param password كلمة مرور WiFi
   */
  async connectToWiFi(
    meterId: string,
    networkId: string,
    password: string
  ): Promise<CommandResponse> {
    try {
      const response = await this.client.post("/api/meters/connect-wifi", {
        meterId,
        networkId,
        password,
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        message: response.data.message || "تم ربط العداد بشبكة WiFi بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to connect meter to WiFi", {
        meterId,
        networkId,
        error: error.message,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * تفعيل إرسال البيانات عبر MQTT
   * @param meterId معرف العداد
   * @param mqttBroker عنوان MQTT Broker
   * @param mqttTopic موضوع MQTT
   */
  async enableMQTT(
    meterId: string,
    mqttBroker: string,
    mqttTopic: string
  ): Promise<CommandResponse> {
    try {
      const response = await this.client.post("/api/meters/enable-mqtt", {
        meterId,
        mqttBroker,
        mqttTopic,
      });
      
      return {
        success: true,
        commandId: response.data.commandId,
        message: response.data.message || "تم تفعيل MQTT بنجاح",
      };
    } catch (error: any) {
      logger.error("Failed to enable MQTT", {
        meterId,
        error: error.message,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
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
      logger.error("ACREL API connection test failed", error);
      return false;
    }
  }
}

// Export types
export type { 
  MeterReading, 
  ADL200Reading, 
  ADW300Reading, 
  MeterInfo, 
  InfrastructureMetric,
  CurrentTransformerInfo,
  TimeOfUseTariff,
  MultiTariffSchedule,
  CreditInfo,
  PrepaidBalance,
};

/**
 * إنشاء instance افتراضي من AcrelAPIClient
 * يمكن استبدالها بإعدادات من قاعدة البيانات أو متغيرات البيئة
 */
export function createAcrelAPIClient(): AcrelAPIClient {
  const config: AcrelAPIConfig = {
    baseURL: process.env.ACREL_API_BASE_URL || "https://api.acrel.com",
    apiKey: process.env.ACREL_API_KEY || "",
    apiSecret: process.env.ACREL_API_SECRET,
    timeout: parseInt(process.env.ACREL_API_TIMEOUT || "30000"),
    retryAttempts: parseInt(process.env.ACREL_API_RETRY_ATTEMPTS || "3"),
  };

  if (!config.apiKey) {
    logger.warn("ACREL API Key not configured. Please set ACREL_API_KEY environment variable.");
  }

  return new AcrelAPIClient(config);
}

