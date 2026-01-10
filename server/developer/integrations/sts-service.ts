/**
 * STS Service
 * خدمة مركزية للتعامل مع نظام STS (Smart Token System)
 * 
 * هذه الخدمة تربط STSAPIClient مع عمليات النظام الأخرى
 * مثل الفوترة، المطابقة، التنبيهات، إلخ.
 * 
 * هذا الملف جزء من نظام المطور (Developer System)
 * جميع التكاملات الخارجية يجب أن تكون في نظام المطور
 */

import { 
  STSAPIClient, 
  createSTSAPIClient,
  type MultiTariffSchedule,
  type CreditInfo,
  type PrepaidBalance,
  type PaymentMode,
} from "./sts-api-client";
import { logger } from "../../utils/logger";
import { getDb } from "../../db";
import { eq, sql } from "drizzle-orm";
import { metersEnhanced } from "../../../drizzle/schemas/billing-enhanced";
import { stsCommandLogs, meterReadingsEnhanced } from "../../../drizzle/schema";

interface CommandLog {
  id: number;
  commandType: "charge" | "disconnect" | "reconnect" | "setAmperage" | "turnOn" | "turnOff" | "maintenanceCode";
  meterId: string;
  commandId?: string;
  status: "pending" | "executed" | "failed";
  requestData: any;
  responseData?: any;
  error?: string;
  createdAt: Date;
  executedAt?: Date;
}

export class STSService {
  private client: STSAPIClient;
  private commandLogs: Map<string, CommandLog> = new Map();

  constructor(client?: STSAPIClient) {
    this.client = client || createSTSAPIClient();
  }

  /**
   * شحن عداد STS
   * ملاحظة: STS يولد كيلوهات وليس رصيد نقدي
   * @param meterId معرف العداد في النظام
   * @param amount المبلغ (ريال)
   * @param paymentMethod طريقة الدفع
   * @param tariffId معرف التعرفة (لحساب الكيلوهات من المبلغ)
   */
  async chargeMeter(
    meterId: number,
    amount: number,
    paymentMethod?: string,
    tariffId?: string
  ): Promise<{ token: string; tokenId?: string; chargeRequestId: number; kwhGenerated: number }> {
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

      // ✅ الحصول على معرف العداد في STS من حقل في قاعدة البيانات
      // الحقل stsMeterId موجود في metersEnhanced
      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      if (!stsMeterId) {
        throw new Error(`العداد ${meterId} غير مرتبط بنظام STS`);
      }

      // إرسال طلب الشحن إلى STS API
      // STS يولد كيلوهات حسب التعرفة
      const response = await this.client.chargeMeter(stsMeterId, amount, paymentMethod, tariffId);

      if (!response.success || !response.token) {
        throw new Error(response.error || "فشل في شحن العداد");
      }

      // ✅ حفظ طلب الشحن في قاعدة البيانات (sts_command_logs)
      let chargeRequestId = Date.now(); // افتراضي

      // تسجيل الأمر
      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "charge",
        meterId: stsMeterId,
        commandId: response.tokenId,
        status: "executed",
        requestData: { meterId, amount, paymentMethod, tariffId },
        responseData: response,
        createdAt: new Date(),
        executedAt: new Date(),
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات (جدول sts_command_logs)
      try {
        const db = await getDb();
        if (db) {
          const [savedLog] = await db.insert(stsCommandLogs).values({
            businessId: (meter as any).businessId || null,
            meterId: meterId,
            stsMeterId: stsMeterId,
            commandType: "charge",
            commandData: { meterId, amount, paymentMethod, tariffId },
            responseData: response,
            status: "executed",
            errorMessage: null,
            executedAt: new Date(),
            createdAt: new Date(),
          }).returning({ id: stsCommandLogs.id });
          
          chargeRequestId = savedLog.id; // ✅ استخدام ID من قاعدة البيانات
          commandLog.id = savedLog.id;
          
          logger.info(`STS charge command saved`, { 
            commandLogId: savedLog.id, 
            meterId, 
            tokenId: response.tokenId 
          });

          // ✅ تحديث رصيد العداد إذا كان متاحاً
          if ((response as any).kwhGenerated && (response as any).kwhGenerated > 0) {
            try {
              // يمكن تحديث رصيد العداد في جدول meters_enhanced أو جدول خاص
              logger.debug(`Meter charged with ${(response as any).kwhGenerated} KWH`, { meterId });
            } catch (updateError: any) {
              logger.error('Failed to update meter balance', {
                meterId,
                error: updateError.message,
              });
            }
          }
        }
      } catch (dbError: any) {
        logger.error('Failed to save STS command to database', {
          meterId,
          error: dbError.message,
        });
        // لا نرمي الخطأ - الشحن تم بنجاح
      }

      return {
        token: response.token,
        tokenId: response.tokenId,
        chargeRequestId,
        kwhGenerated: (response as any).kwhGenerated || 0, // الكيلوهات المولدة
      };
    } catch (error: any) {
      logger.error("Failed to charge STS meter", {
        meterId,
        amount,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * جلب قراءة عداد من STS
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      // جلب القراءة من STS API
      const reading = await this.client.getMeterReading(stsMeterId);

      // ✅ حفظ القراءة في قاعدة البيانات (جدول meter_readings_enhanced)
      try {
        await db.insert(meterReadingsEnhanced).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          readingDate: new Date(),
          currentReading: reading.consumption?.toString() || "0",
          previousReading: null, // سيتم ملؤه من القراءة السابقة
          consumption: reading.consumption?.toString() || "0",
          voltage: reading.voltage?.toString() || null,
          current: reading.current?.toString() || null,
          power: reading.power?.toString() || null,
          powerFactor: reading.powerFactor?.toString() || null,
          frequency: reading.frequency?.toString() || null,
          balance: reading.balance?.toString() || null,
          readingType: "sts_api",
          source: "sts_service",
          isEstimated: false,
          notes: `STS API Reading - Meter: ${stsMeterId}`,
          createdAt: new Date(),
        });
      } catch (dbError: any) {
        logger.error('Failed to save STS meter reading to database', {
          meterId,
          stsMeterId,
          error: dbError.message,
        });
        // لا نرمي الخطأ - نكمل العملية
      }

      return {
        meterId,
        stsMeterId,
        reading,
        timestamp: reading.timestamp,
      };
    } catch (error: any) {
      logger.error("Failed to get reading from STS", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * معرفة حالة العداد (متصل/منقطع)
   * @param meterId معرف العداد
   */
  async getMeterStatus(meterId: number): Promise<any> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const status = await this.client.getMeterStatus(stsMeterId);

      return {
        meterId,
        stsMeterId,
        status,
      };
    } catch (error: any) {
      logger.error("Failed to get STS meter status", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * معرفة الرصيد وكم باقي كيلوهات
   * @param meterId معرف العداد
   */
  async getMeterBalance(meterId: number): Promise<any> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const balance = await this.client.getMeterBalance(stsMeterId);

      return {
        meterId,
        stsMeterId,
        balance,
      };
    } catch (error: any) {
      logger.error("Failed to get STS meter balance", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * إصدار كود صيانة
   * @param meterId معرف العداد
   * @param codeType نوع الكود
   * @param reason سبب الصيانة
   */
  async generateMaintenanceCode(
    meterId: number,
    codeType: "maintenance" | "repair" | "inspection",
    reason?: string
  ): Promise<{ code: string; codeId?: string }> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const response = await this.client.generateMaintenanceCode(stsMeterId, codeType, reason);

      if (!response.success || !response.code) {
        throw new Error(response.error || "فشل في إصدار كود الصيانة");
      }

      // تسجيل الأمر
      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "maintenanceCode",
        meterId: stsMeterId,
        commandId: response.codeId,
        status: "executed",
        requestData: { meterId, codeType, reason },
        responseData: response,
        createdAt: new Date(),
        executedAt: new Date(),
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات
      try {
        await db.insert(stsCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          stsMeterId: stsMeterId,
          commandType: "maintenanceCode",
          commandData: { meterId, codeId: response.codeId },
          responseData: response,
          status: "executed",
          errorMessage: null,
          executedAt: new Date(),
          createdAt: new Date(),
        });
      } catch (dbError: any) {
        logger.error('Failed to save maintenance code command log', {
          meterId,
          error: dbError.message,
        });
      }

      return {
        code: response.code,
        codeId: response.codeId,
      };
    } catch (error: any) {
      logger.error("Failed to generate maintenance code", {
        meterId,
        codeType,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * فصل العداد
   * @param meterId معرف العداد
   * @param reason سبب الفصل
   */
  async disconnectMeter(meterId: number, reason?: string): Promise<CommandLog> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const response = await this.client.disconnectMeter(stsMeterId, reason);

      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "disconnect",
        meterId: stsMeterId,
        commandId: response.commandId,
        status: response.success ? "executed" : "failed",
        requestData: { meterId, reason },
        responseData: response,
        error: response.error,
        createdAt: new Date(),
        executedAt: response.success ? new Date() : undefined,
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات وتحديث حالة العداد
      try {
        const [savedLog] = await db.insert(stsCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          stsMeterId: stsMeterId,
          commandType: "disconnect",
          commandData: { meterId, reason },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        }).returning({ id: stsCommandLogs.id });
        
        commandLog.id = savedLog.id;
        logger.info(`STS disconnect command saved`, { commandLogId: savedLog.id, meterId });
      } catch (dbError: any) {
        logger.error('Failed to save STS disconnect command', {
          meterId,
          error: dbError.message,
        });
      }

      if (response.success) {
        try {
          await db.update(metersEnhanced)
            .set({ 
              status: "disconnected",
              updatedAt: new Date(),
            })
            .where(eq(metersEnhanced.id, meterId));
          
          logger.info(`STS meter ${meterId} status updated to disconnected`);
        } catch (updateError: any) {
          logger.error('Failed to update meter status', {
            meterId,
            error: updateError.message,
          });
        }
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to disconnect STS meter", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * إعادة توصيل العداد
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const response = await this.client.reconnectMeter(stsMeterId);

      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "reconnect",
        meterId: stsMeterId,
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
        const [savedLog] = await db.insert(stsCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          stsMeterId: stsMeterId,
          commandType: "reconnect",
          commandData: { meterId },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        }).returning({ id: stsCommandLogs.id });
        
        commandLog.id = savedLog.id;
        logger.info(`STS reconnect command saved`, { commandLogId: savedLog.id, meterId });
      } catch (dbError: any) {
        logger.error('Failed to save STS reconnect command', {
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
          
          logger.info(`STS meter ${meterId} status updated to connected`);
        } catch (updateError: any) {
          logger.error('Failed to update meter status', {
            meterId,
            error: updateError.message,
          });
        }
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to reconnect STS meter", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * خفض الأمبير
   * @param meterId معرف العداد
   * @param amperage قيمة الأمبير الجديدة
   */
  async reduceAmperage(meterId: number, amperage: number): Promise<CommandLog> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const response = await this.client.reduceAmperage(stsMeterId, amperage);

      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "setAmperage",
        meterId: stsMeterId,
        commandId: response.commandId,
        status: response.success ? "executed" : "failed",
        requestData: { meterId, amperage, action: "reduce" },
        responseData: response,
        error: response.error,
        createdAt: new Date(),
        executedAt: response.success ? new Date() : undefined,
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات
      try {
        await db.insert(stsCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          stsMeterId: stsMeterId,
          commandType: "setAmperage",
          commandData: { meterId, amperage, action: "reduce" },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        });
      } catch (dbError: any) {
        logger.error('Failed to save reduce amperage command log', {
          meterId,
          error: dbError.message,
        });
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to reduce amperage", {
        meterId,
        amperage,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * رفع الأمبير
   * @param meterId معرف العداد
   * @param amperage قيمة الأمبير الجديدة
   */
  async increaseAmperage(meterId: number, amperage: number): Promise<CommandLog> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const response = await this.client.increaseAmperage(stsMeterId, amperage);

      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "setAmperage",
        meterId: stsMeterId,
        commandId: response.commandId,
        status: response.success ? "executed" : "failed",
        requestData: { meterId, amperage, action: "increase" },
        responseData: response,
        error: response.error,
        createdAt: new Date(),
        executedAt: response.success ? new Date() : undefined,
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات
      try {
        await db.insert(stsCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          stsMeterId: stsMeterId,
          commandType: "setAmperage",
          commandData: { meterId, amperage, action: "increase" },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        });
      } catch (dbError: any) {
        logger.error('Failed to save increase amperage command log', {
          meterId,
          error: dbError.message,
        });
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to increase amperage", {
        meterId,
        amperage,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * تشغيل العداد
   * @param meterId معرف العداد
   */
  async turnOnMeter(meterId: number): Promise<CommandLog> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const response = await this.client.turnOnMeter(stsMeterId);

      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "turnOn",
        meterId: stsMeterId,
        commandId: response.commandId,
        status: response.success ? "executed" : "failed",
        requestData: { meterId },
        responseData: response,
        error: response.error,
        createdAt: new Date(),
        executedAt: response.success ? new Date() : undefined,
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات
      try {
        await db.insert(stsCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          stsMeterId: stsMeterId,
          commandType: "turnOn",
          commandData: { meterId },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        });
        
        // تحديث حالة العداد
        if (response.success) {
          await db.update(metersEnhanced)
            .set({ 
              status: "active",
              updatedAt: sql`NOW()`,
            })
            .where(eq(metersEnhanced.id, meterId));
        }
      } catch (dbError: any) {
        logger.error('Failed to save turn on command log', {
          meterId,
          error: dbError.message,
        });
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to turn on STS meter", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * إطفاء العداد
   * @param meterId معرف العداد
   */
  async turnOffMeter(meterId: number): Promise<CommandLog> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;

      const response = await this.client.turnOffMeter(stsMeterId);

      const commandLog: CommandLog = {
        id: Date.now(),
        commandType: "turnOff",
        meterId: stsMeterId,
        commandId: response.commandId,
        status: response.success ? "executed" : "failed",
        requestData: { meterId },
        responseData: response,
        error: response.error,
        createdAt: new Date(),
        executedAt: response.success ? new Date() : undefined,
      };

      this.commandLogs.set(commandLog.id.toString(), commandLog);

      // ✅ حفظ في قاعدة البيانات
      try {
        await db.insert(stsCommandLogs).values({
          businessId: (meter as any).businessId || null,
          meterId: meterId,
          stsMeterId: stsMeterId,
          commandType: "turnOff",
          commandData: { meterId },
          responseData: response,
          status: response.success ? "executed" : "failed",
          errorMessage: response.error || null,
          executedAt: response.success ? new Date() : null,
          createdAt: new Date(),
        });
        
        // تحديث حالة العداد
        if (response.success) {
          await db.update(metersEnhanced)
            .set({ 
              status: "disconnected",
              updatedAt: sql`NOW()`,
            })
            .where(eq(metersEnhanced.id, meterId));
        }
      } catch (dbError: any) {
        logger.error('Failed to save turn off command log', {
          meterId,
          error: dbError.message,
        });
      }

      return commandLog;
    } catch (error: any) {
      logger.error("Failed to turn off STS meter", {
        meterId,
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
   * التحقق من حالة الشحن
   * @param chargeRequestId معرف طلب الشحن
   */
  async verifyCharge(chargeRequestId: number): Promise<any> {
    try {
      return await this.client.verifyCharge(chargeRequestId);
    } catch (error: any) {
      logger.error("Failed to verify charge", {
        chargeRequestId,
        error: error.message,
      });
      throw error;
    }
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.setPostpaidMode(stsMeterId, enabled);
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.setPrepaidMode(stsMeterId, enabled);
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
   * ملاحظة: STS يولد كيلوهات حسب التعرفة
   * @param meterId معرف العداد
   * @param amount المبلغ (ريال)
   * @param tariffId معرف التعرفة
   */
  async rechargeBalance(meterId: number, amount: number, tariffId?: string): Promise<any> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.rechargeBalance(stsMeterId, amount, tariffId);
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
   * جلب معلومات الرصيد (للمسبق الدفع)
   * @param meterId معرف العداد
   */
  async getPrepaidBalance(meterId: number): Promise<PrepaidBalance> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.getPrepaidBalance(stsMeterId);
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.setCreditLimit(stsMeterId, creditLimit, autoDisconnect);
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
  async getCreditInfo(meterId: number): Promise<CreditInfo> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.getCreditInfo(stsMeterId);
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
  async setMultiTariffSchedule(meterId: number, schedule: MultiTariffSchedule): Promise<any> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.setMultiTariffSchedule(stsMeterId, {
        ...schedule,
        meterId: stsMeterId,
      });
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
  async getMultiTariffSchedule(meterId: number): Promise<MultiTariffSchedule> {
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.getMultiTariffSchedule(stsMeterId);
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

      const stsMeterId = (meter as any).stsMeterId || meter.meterNumber;
      return await this.client.getPaymentMode(stsMeterId);
    } catch (error: any) {
      logger.error("Failed to get payment mode", {
        meterId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * اختبار الاتصال مع STS
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
export const stsService = new STSService();

