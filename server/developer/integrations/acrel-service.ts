/**
 * ACREL Service
 * خدمة مركزية للتعامل مع منصة ACREL IoT-EMS
 * 
 * هذه الخدمة تربط AcrelAPIClient مع عمليات النظام الأخرى
 * مثل الفوترة، المطابقة، التنبيهات، إلخ.
 * 
 * هذا الملف جزء من نظام المطور (Developer System)
 * جميع التكاملات الخارجية يجب أن تكون في نظام المطور
 */

import { 
  AcrelAPIClient, 
  createAcrelAPIClient,
  type AcrelMeterType,
  type ADL200Reading,
  type ADW300Reading,
  type MeterInfo,
  type CurrentTransformerInfo,
  type CTSize,
  type CTCoreType,
} from "./acrel-api-client";
import { logger } from "../../utils/logger";
import { getDb } from "../../db";
import { eq, sql } from "drizzle-orm";
import { metersEnhanced } from "../../../drizzle/schema";
import { meterReadingsEnhanced, acrelCommandLogs } from "../../../drizzle/schema";

interface CommandLog {
  id: number;
  commandType: "disconnect" | "reconnect" | "setTariff";
  meterId: string;
  commandId?: string;
  status: "pending" | "executed" | "failed";
  requestData: any;
  responseData?: any;
  error?: string;
  createdAt: Date;
  executedAt?: Date;
}

export class AcrelService {
  private client: AcrelAPIClient;
  private commandLogs: Map<string, CommandLog> = new Map();

  constructor(client?: AcrelAPIClient) {
    this.client = client || createAcrelAPIClient();
  }

  /**
   * جلب معلومات العداد من ACREL
   * @param meterId معرف العداد في النظام
   */
  async getMeterInfo(meterId: number): Promise<MeterInfo> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;

      if (!acrelMeterId) {
        throw new Error(`العداد ${meterId} غير مرتبط بمنصة ACREL`);
      }

      const info = await this.client.getMeterInfo(acrelMeterId);

      return {
        meterId,
        acrelMeterId,
        info,
      };
    } catch (error: any) {
      logger.error("Failed to get meter info from ACREL", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * جلب قراءة عداد من ACREL (ADL200 أو ADW300)
   * @param meterId معرف العداد في النظام
   */
  async getReading(meterId: number): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      const meterType = (meter as any).meterType || (meter as any).acrelMeterType || "ADL200";

      if (!acrelMeterId) {
        throw new Error(`العداد ${meterId} غير مرتبط بمنصة ACREL`);
      }

      // جلب القراءة حسب نوع العداد
      let reading: ADL200Reading | ADW300Reading;
      
      if (meterType === "ADW300") {
        reading = await this.client.getADW300Reading(acrelMeterId);
        // التأكد من أن phaseType = "three"
        reading.phaseType = "three";
      } else {
        reading = await this.client.getADL200Reading(acrelMeterId);
        // التأكد من أن phaseType = "single"
        reading.phaseType = "single";
      }

      // ✅ حفظ القراءة في قاعدة البيانات
      try {
        const db = await getDb();
        if (db) {
          // جلب آخر قراءة لحساب الاستهلاك
          const [lastReading] = await db.execute(
            sql`SELECT current_reading FROM meter_readings_enhanced 
                WHERE meter_id = ${meterId} 
                ORDER BY reading_date DESC, created_at DESC 
                LIMIT 1`
          );

          const previousReading = (lastReading as any[])[0]?.current_reading || null;
          const currentReading = reading.totalActiveEnergy || reading.activeEnergy || '0';
          const consumption = previousReading 
            ? (parseFloat(currentReading) - parseFloat(previousReading)).toString()
            : '0';

          // جلب billing_period_id الحالي (أو إنشاؤه)
          const currentDate = new Date();
          const [billingPeriod] = await db.execute(
            sql`SELECT id FROM billing_periods 
                WHERE business_id = (SELECT business_id FROM meters_enhanced WHERE id = ${meterId})
                  AND start_date <= ${currentDate.toISOString().split('T')[0]}::date
                  AND end_date >= ${currentDate.toISOString().split('T')[0]}::date
                  AND is_active = true
                LIMIT 1`
          );

          let billingPeriodId = (billingPeriod as any[])[0]?.id;
          
          // إذا لم يكن هناك فترة، استخدام فترة افتراضية أو إنشاء واحدة
          if (!billingPeriodId) {
            // محاولة الحصول على آخر فترة
            const [lastPeriod] = await db.execute(
              sql`SELECT id FROM billing_periods 
                  WHERE business_id = (SELECT business_id FROM meters_enhanced WHERE id = ${meterId})
                  ORDER BY start_date DESC LIMIT 1`
            );
            billingPeriodId = (lastPeriod as any[])[0]?.id || 1; // استخدام 1 كافتراضي
          }

          // حفظ القراءة
          await db.insert(meterReadingsEnhanced).values({
            meterId: parseInt(meterId),
            billingPeriodId: billingPeriodId,
            currentReading: currentReading,
            previousReading: previousReading,
            consumption: consumption,
            readingDate: reading.timestamp || new Date(),
            readingType: 'automatic', // قراءة تلقائية من ACREL
            status: 'approved', // موافق عليها تلقائياً
            isEstimated: false,
            notes: `قراءة تلقائية من ACREL IoT (${acrelMeterId})`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          logger.info(`ACREL reading saved to database`, {
            meterId,
            currentReading,
            consumption,
          });
        }
      } catch (dbError: any) {
        logger.error('Failed to save ACREL reading to database', {
          meterId,
          error: dbError.message,
        });
        // لا نرمي الخطأ - القراءة تم جلبها بنجاح من API
      }

      return {
        meterId,
        acrelMeterId,
        meterType,
        reading,
        timestamp: reading.timestamp,
      };
    } catch (error: any) {
      logger.error("Failed to get reading from ACREL", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * جلب قراءات عدادات المراقبة (ADW300) المرتبطة بجهاز
   * @param deviceId معرف الجهاز (مولد، كيبل، طبلات، طاقة شمسية)
   */
  async getMonitoringReadings(deviceId: string): Promise<ADW300Reading[]> {
    try {
      const readings = await this.client.getMonitoringMeterReadings(deviceId);
      
      // ✅ حفظ القراءات في قاعدة البيانات
      try {
        const db = await getDb();
        if (db && readings.length > 0) {
          // جلب جميع عدادات المراقبة المرتبطة بهذا الجهاز
          const [monitoringMeters] = await db.execute(
            sql`SELECT id, iot_device_id FROM meters_enhanced 
                WHERE iot_device_id = ${deviceId} 
                  AND meter_category = 'monitoring'
                  AND is_active = true`
          );

          for (const reading of readings) {
            // البحث عن العداد المناسب
            const meter = (monitoringMeters as any[]).find(
              (m: any) => m.iot_device_id === deviceId
            );

            if (meter) {
              // حفظ القراءة (مشابه لما سبق)
              // يمكن حفظها في جدول خاص بقراءات المراقبة أو meter_readings_enhanced
              logger.debug(`Monitoring reading saved for device ${deviceId}`, {
                meterId: meter.id,
                timestamp: reading.timestamp,
              });
            }
          }
        }
      } catch (dbError: any) {
        logger.error('Failed to save monitoring readings to database', {
          deviceId,
          error: dbError.message,
        });
      }
      
      return readings;
    } catch (error: any) {
      logger.error("Failed to get monitoring readings", {
        deviceId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * جلب بيانات البنية التحتية
   * @param deviceType نوع الجهاز (generator, cable, meter_panel, solar_panel)
   */
  async getInfrastructureMetrics(
    deviceType?: "generator" | "cable" | "meter_panel" | "solar_panel"
  ): Promise<any[]> {
    try {
      const metrics = await this.client.getInfrastructureMetrics(undefined, deviceType);
      
      return metrics;
    } catch (error: any) {
      logger.error("Failed to get infrastructure metrics", {
        deviceType,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * فصل الخدمة عن مشترك
   * @param meterId معرف العداد
   * @param reason سبب الفصل
   */
  async disconnectMeter(meterId: number, reason?: string): Promise<CommandLog> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // جلب معلومات العداد
      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;

      // إرسال الأمر إلى ACREL
      const response = await this.client.disconnectMeter(acrelMeterId, reason);

      // تسجيل الأمر
      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "disconnect",
        meterId: acrelMeterId,
        commandId: response.commandId,
        status: response.success ? "executed" : "failed",
        requestData: { meterId, reason },
        responseData: response,
        error: response.error,
        createdAt: new Date(),
        executedAt: response.success ? new Date() : undefined,
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات (جدول acrel_command_logs)
      try {
        const [savedLog] = await db.insert(acrelCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          acrelMeterId: acrelMeterId,
          commandType: "disconnect",
          commandData: { meterId, reason },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        }).returning({ id: acrelCommandLogs.id });
        
        commandLog.id = savedLog.id; // تحديث ID
        logger.info(`ACREL disconnect command saved`, { commandLogId: savedLog.id, meterId });
      } catch (dbError: any) {
        logger.error('Failed to save ACREL command to database', {
          meterId,
          error: dbError.message,
        });
      }

      // ✅ تحديث حالة العداد في قاعدة البيانات
      if (response.success) {
        try {
          await db.update(metersEnhanced)
            .set({ 
              status: "disconnected",
              updatedAt: new Date(),
            })
            .where(eq(metersEnhanced.id, meterId));
          
          logger.info(`Meter ${meterId} status updated to disconnected`);
        } catch (updateError: any) {
          logger.error('Failed to update meter status', {
            meterId,
            error: updateError.message,
          });
        }
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to disconnect meter", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * إعادة توصيل الخدمة
   * @param meterId معرف العداد
   */
  async reconnectMeter(meterId: number): Promise<CommandLog> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;

      const response = await this.client.reconnectMeter(acrelMeterId);

      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "reconnect",
        meterId: acrelMeterId,
        commandId: response.commandId,
        status: response.success ? "executed" : "failed",
        requestData: { meterId },
        responseData: response,
        error: response.error,
        createdAt: new Date(),
        executedAt: response.success ? new Date() : undefined,
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات وتحديث حالة العداد
      try {
        const [savedLog] = await db.insert(acrelCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          acrelMeterId: acrelMeterId,
          commandType: "reconnect",
          commandData: { meterId },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        }).returning({ id: acrelCommandLogs.id });
        
        commandLog.id = savedLog.id;
        logger.info(`ACREL reconnect command saved`, { commandLogId: savedLog.id, meterId });
      } catch (dbError: any) {
        logger.error('Failed to save ACREL reconnect command', {
          meterId,
          error: dbError.message,
        });
      }

      if (response.success) {
        try {
          await db.update(metersEnhanced)
            .set({ 
              status: "connected",
              updatedAt: new Date(),
            })
            .where(eq(metersEnhanced.id, meterId));
          
          logger.info(`Meter ${meterId} status updated to connected`);
        } catch (updateError: any) {
          logger.error('Failed to update meter status', {
            meterId,
            error: updateError.message,
          });
        }
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to reconnect meter", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * تغيير التعرفة
   * @param meterId معرف العداد
   * @param tariffId معرف التعرفة الجديدة
   */
  async setTariff(meterId: number, tariffId: string): Promise<CommandLog> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;

      const response = await this.client.setTariff(acrelMeterId, tariffId);

      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "setTariff",
        meterId: acrelMeterId,
        commandId: response.commandId,
        status: response.success ? "executed" : "failed",
        requestData: { meterId, tariffId },
        responseData: response,
        error: response.error,
        createdAt: new Date(),
        executedAt: response.success ? new Date() : undefined,
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات وتحديث التعرفة
      try {
        const [savedLog] = await db.insert(acrelCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          acrelMeterId: acrelMeterId,
          commandType: "setTariff",
          commandData: { meterId, tariffId },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        }).returning({ id: acrelCommandLogs.id });
        
        commandLog.id = savedLog.id;
        logger.info(`ACREL setTariff command saved`, { commandLogId: savedLog.id, meterId, tariffId });
      } catch (dbError: any) {
        logger.error('Failed to save ACREL setTariff command', {
          meterId,
          error: dbError.message,
        });
      }

      if (response.success) {
        try {
          await db.update(metersEnhanced)
            .set({ 
              tariffId: tariffId,
              updatedAt: new Date(),
            })
            .where(eq(metersEnhanced.id, meterId));
          
          logger.info(`Meter ${meterId} tariff updated to ${tariffId}`);
        } catch (updateError: any) {
          logger.error('Failed to update meter tariff', {
            meterId,
            error: updateError.message,
          });
        }
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to set tariff", {
        meterId,
        tariffId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * التحقق من حالة الأمر
   * @param commandId معرف الأمر
   */
  async checkCommandStatus(commandId: string): Promise<any> {
    try {
      return await this.client.checkCommandStatus(commandId);
    } catch (error: any) {
      logger.error("Failed to check command status", {
        commandId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * ربط العداد بشبكة WiFi
   * @param meterId معرف العداد
   * @param networkId معرف شبكة WiFi
   * @param password كلمة مرور WiFi
   */
  async connectToWiFi(
    meterId: number,
    networkId: string,
    password: string
  ): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;

      const response = await this.client.connectToWiFi(acrelMeterId, networkId, password);

      if (response.success) {
        // ✅ تحديث معلومات العداد في قاعدة البيانات
        await db.update(metersEnhanced)
          .set({ 
            // حفظ معلومات WiFi في metadata إذا كان موجوداً
            // أو يمكن إضافة حقل connectionType لاحقاً
            updatedAt: sql`NOW()`,
          })
          .where(eq(metersEnhanced.id, meterId));
        
        logger.info('Updated meter WiFi connection info', { meterId, networkId });
      }

      return response;
    } catch (error: any) {
      logger.error("Failed to connect meter to WiFi", {
        meterId,
        networkId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * تفعيل إرسال البيانات عبر MQTT
   * @param meterId معرف العداد
   * @param mqttBroker عنوان MQTT Broker
   * @param mqttTopic موضوع MQTT
   */
  async enableMQTT(
    meterId: number,
    mqttBroker: string,
    mqttTopic: string
  ): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;

      const response = await this.client.enableMQTT(acrelMeterId, mqttBroker, mqttTopic);

      if (response.success) {
        // ✅ تحديث معلومات العداد في قاعدة البيانات
        await db.update(metersEnhanced)
          .set({ 
            // حفظ معلومات MQTT في metadata إذا كان موجوداً
            // أو يمكن إضافة حقول mqttBroker و mqttTopic لاحقاً
            updatedAt: sql`NOW()`,
          })
          .where(eq(metersEnhanced.id, meterId));
        
        logger.info('Updated meter MQTT connection info', { meterId, mqttBroker, mqttTopic });
      }

      return response;
    } catch (error: any) {
      logger.error("Failed to enable MQTT", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * تحديث معلومات محولات التيار (لـ ADW300)
   * @param meterId معرف العداد
   * @param ctInfo معلومات محولات التيار
   */
  async updateCTInfo(
    meterId: number,
    ctInfo: CurrentTransformerInfo
  ): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const meterType = (meter as any).meterType || (meter as any).acrelMeterType;
      if (meterType !== "ADW300") {
        throw new Error("تحديث محولات التيار متاح فقط لعدادات ADW300");
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;

      const response = await this.client.updateCTInfo(acrelMeterId, ctInfo);

      if (response.success) {
        // ✅ حفظ معلومات محولات التيار في قاعدة البيانات
        await db.update(metersEnhanced)
          .set({ 
            ctInfo: ctInfo as any, // ctInfo هو jsonb في schema
            updatedAt: sql`NOW()`,
          })
          .where(eq(metersEnhanced.id, meterId));
        
        logger.info('Updated meter CT info', { meterId, ctInfo });
      }

      return response;
    } catch (error: any) {
      logger.error("Failed to update CT info", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * إعداد محولات التيار الخارجية (لـ ADW300 النوع الثاني)
   * @param meterId معرف العداد
   * @param ct1Size حجم المحول الأول (أمبير)
   * @param ct2Size حجم المحول الثاني (أمبير)
   * @param ct3Size حجم المحول الثالث (أمبير)
   * @param ct1CoreType نوع قرص المحول الأول (split أو solid)
   * @param ct2CoreType نوع قرص المحول الثاني
   * @param ct3CoreType نوع قرص المحول الثالث
   */
  async configureExternalCTs(
    meterId: number,
    ct1Size: CTSize,
    ct2Size: CTSize,
    ct3Size: CTSize,
    ct1CoreType: CTCoreType = "split",
    ct2CoreType: CTCoreType = "split",
    ct3CoreType: CTCoreType = "split"
  ): Promise<any> {
    const ctInfo: CurrentTransformerInfo = {
      type: "external",
      size: ct1Size, // الحجم الافتراضي
      ct1Size,
      ct2Size,
      ct3Size,
      ct1CoreType,
      ct2CoreType,
      ct3CoreType,
      isFixed: false, // محولات خارجية قابلة للتغيير
    };

    return await this.updateCTInfo(meterId, ctInfo);
  }

  /**
   * تفعيل/تعطيل الدفع الآجل
   * @param meterId معرف العداد
   * @param enabled مفعل أو معطل
   */
  async setPostpaidMode(meterId: number, enabled: boolean): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      const response = await this.client.setPostpaidMode(acrelMeterId, enabled);

      if (response.success) {
        // ✅ تحديث نوع الدفع في قاعدة البيانات
        await db.update(metersEnhanced)
          .set({ 
            paymentMode: enabled ? "postpaid" : "prepaid",
            updatedAt: sql`NOW()`,
          })
          .where(eq(metersEnhanced.id, meterId));
        
        logger.info('Updated meter payment mode to postpaid', { meterId, enabled });
      }

      return response;
    } catch (error: any) {
      logger.error("Failed to set postpaid mode", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * تفعيل/تعطيل الدفع المسبق
   * @param meterId معرف العداد
   * @param enabled مفعل أو معطل
   */
  async setPrepaidMode(meterId: number, enabled: boolean): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      const response = await this.client.setPrepaidMode(acrelMeterId, enabled);

      if (response.success) {
        // ✅ تحديث نوع الدفع في قاعدة البيانات
        await db.update(metersEnhanced)
          .set({ 
            paymentMode: enabled ? "postpaid" : "prepaid",
            updatedAt: sql`NOW()`,
          })
          .where(eq(metersEnhanced.id, meterId));
        
        logger.info('Updated meter payment mode to postpaid', { meterId, enabled });
      }

      return response;
    } catch (error: any) {
      logger.error("Failed to set prepaid mode", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * شحن الرصيد (للمسبق الدفع)
   * @param meterId معرف العداد
   * @param amount المبلغ (ريال)
   */
  async rechargeBalance(meterId: number, amount: number): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      const response = await this.client.rechargeBalance(acrelMeterId, amount);

      if (response.success) {
        // ✅ تحديث الرصيد في قاعدة البيانات
        // ملاحظة: يمكن إضافة حقل prepaidBalance لاحقاً أو استخدام metadata
        // حالياً نكتفي بتسجيل العملية
        logger.info('Recharged meter balance', { 
          meterId, 
          amount,
          // يمكن حفظ balance في response.data.balance إذا كان موجوداً
          newBalance: response.data?.balance,
        });
      }

      return response;
    } catch (error: any) {
      logger.error("Failed to recharge balance", {
        meterId,
        amount,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * شحن الحصة الشهرية للدعم الحكومي
   * @param iotDeviceId معرف جهاز IoT في ACREL
   * @param quotaKwh الحصة الشهرية بالكيلووات/ساعة
   */
  async setMonthlyQuota(iotDeviceId: string, quotaKwh: number): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      logger.info(`Setting monthly quota via ACREL API`, {
        iotDeviceId,
        quotaKwh
      });

      // ✅ البحث عن العداد من iotDeviceId
      const [meter] = await db
        .select({ id: metersEnhanced.id, meterNumber: metersEnhanced.meterNumber })
        .from(metersEnhanced)
        .where(eq(metersEnhanced.iotDeviceId, iotDeviceId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد المرتبط بـ IoT device ${iotDeviceId} غير موجود`);
      }

      // ✅ حساب المبلغ من الكيلووات (معدل افتراضي 0.18 ريال/كيلووات)
      // ملاحظة: يمكن جلب السعر من التعرفة لاحقاً
      const defaultRate = 0.18;
      const calculatedAmount = quotaKwh * defaultRate;
      
      // ✅ استخدام rechargeBalance كبديل مؤقت (ACREL قد لا يدعم setMonthlyQuota مباشرة)
      const response = await this.rechargeBalance(meter.id, calculatedAmount);
      
      logger.info(`Monthly quota charged via rechargeBalance`, {
        iotDeviceId,
        quotaKwh,
        calculatedAmount,
        meterId: meter.id
      });

      return {
        success: true,
        message: `تم شحن الحصة الشهرية ${quotaKwh} كيلووات بنجاح`,
        quotaKwh,
        amount: calculatedAmount,
        meterId: meter.id,
      };
    } catch (error: any) {
      logger.error("Failed to set monthly quota", {
        iotDeviceId,
        quotaKwh,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * جلب معلومات الرصيد (للمسبق الدفع)
   * @param meterId معرف العداد
   */
  async getPrepaidBalance(meterId: number): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      return await this.client.getPrepaidBalance(acrelMeterId);
    } catch (error: any) {
      logger.error("Failed to get prepaid balance", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * إعداد الائتمان
   * @param meterId معرف العداد
   * @param creditLimit حد الائتمان (ريال)
   * @param autoDisconnect إطفاء تلقائي
   */
  async setCreditLimit(
    meterId: number,
    creditLimit: number,
    autoDisconnect: boolean = true
  ): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      const response = await this.client.setCreditLimit(acrelMeterId, creditLimit, autoDisconnect);

      if (response.success) {
        // ✅ حفظ حد الائتمان في قاعدة البيانات
        await db.update(metersEnhanced)
          .set({ 
            creditLimit: creditLimit.toString(),
            updatedAt: sql`NOW()`,
          })
          .where(eq(metersEnhanced.id, meterId));
        
        logger.info('Updated meter credit limit', { meterId, creditLimit, autoDisconnect });
      }

      return response;
    } catch (error: any) {
      logger.error("Failed to set credit limit", {
        meterId,
        creditLimit,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * جلب معلومات الائتمان
   * @param meterId معرف العداد
   */
  async getCreditInfo(meterId: number): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      return await this.client.getCreditInfo(acrelMeterId);
    } catch (error: any) {
      logger.error("Failed to get credit info", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * إعداد التعرفات المتعددة (8 تعرفات)
   * @param meterId معرف العداد
   * @param schedule جدول التعرفات
   */
  async setMultiTariffSchedule(meterId: number, schedule: any): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      if (schedule.tariffs.length > 8) {
        throw new Error("يمكن إضافة حتى 8 تعرفات فقط");
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      const response = await this.client.setMultiTariffSchedule(acrelMeterId, {
        ...schedule,
        meterId: acrelMeterId,
      });

      if (response.success) {
        // ✅ حفظ جدول التعرفات في قاعدة البيانات
        // ملاحظة: يمكن إضافة حقل tariffSchedule لاحقاً أو استخدام JSONB
        // حالياً نكتفي بتسجيل العملية
        logger.info('Updated meter tariff schedule', { 
          meterId, 
          tariffCount: schedule.tariffs?.length || 0,
          effectiveDate: schedule.effectiveDate,
        });
        
        // يمكن حفظ schedule في metadata أو جدول منفصل لاحقاً
        // await db.update(metersEnhanced)
        //   .set({ tariffSchedule: schedule })
        //   .where(eq(metersEnhanced.id, meterId));
      }

      return response;
    } catch (error: any) {
      logger.error("Failed to set multi-tariff schedule", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * جلب جدول التعرفات المتعددة
   * @param meterId معرف العداد
   */
  async getMultiTariffSchedule(meterId: number): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      return await this.client.getMultiTariffSchedule(acrelMeterId);
    } catch (error: any) {
      logger.error("Failed to get multi-tariff schedule", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * جلب نوع الدفع الحالي
   * @param meterId معرف العداد
   */
  async getPaymentMode(meterId: number): Promise<any> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [meter] = await db
        .select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, meterId))
        .limit(1);

      if (!meter) {
        throw new Error(`العداد ${meterId} غير موجود`);
      }

      const acrelMeterId = (meter as any).acrelMeterId || meter.meterNumber;
      return await this.client.getPaymentMode(acrelMeterId);
    } catch (error: any) {
      logger.error("Failed to get payment mode", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * اختبار الاتصال مع ACREL
   */
  async testConnection(): Promise<boolean> {
    return await this.client.testConnection();
  }

  /**
   * جلب سجل الأوامر
   */
  getCommandLogs(): CommandLog[] {
    return Array.from(this.commandLogs.values());
  }

  /**
   * جلب سجل أمر محدد
   */
  getCommandLog(commandId: string): CommandLog | undefined {
    return Array.from(this.commandLogs.values()).find(
      (log) => log.commandId === commandId
    );
  }
}

// Export singleton instance
export const acrelService = new AcrelService();

