/**
 * نظام Cron Jobs
 * Scheduled Tasks System
 * 
 * جميع المهام المجدولة في النظام
 * 
 * ملاحظة: يستخدم setInterval بدلاً من node-cron
 * تم تعطيل التنفيذ الفوري لمنع التكرار عند بدء التشغيل
 */

import { logger } from "../utils/logger";
import { PreventiveSchedulingEngine } from "./preventive-scheduling-engine";
import { getDb } from "../db";
import { businesses } from "../../drizzle/schemas/organization";
import { eq } from "drizzle-orm";

// ============================================
// Cron Jobs Manager
// ============================================

interface ScheduledJob {
  name: string;
  schedule: string; // للتوثيق فقط
  task: () => Promise<void>;
  interval?: NodeJS.Timeout;
  timeout?: NodeJS.Timeout;
}

// متغير للتأكد من أن التهيئة تتم مرة واحدة فقط
let isInitialized = false;

export class CronJobsManager {
  private static jobs: Map<string, ScheduledJob> = new Map();

  /**
   * تهيئة جميع Cron Jobs
   */
  static initialize() {
    // منع التهيئة المتكررة
    if (isInitialized) {
      logger.warn("Cron Jobs already initialized, skipping...");
      return;
    }
    
    isInitialized = true;
    logger.info("Initializing Cron Jobs...");

    // Cron Jobs الحرجة
    this.scheduleCriticalJobs();

    // Cron Jobs عالية الأولوية
    this.scheduleHighPriorityJobs();

    // Cron Jobs متوسطة الأولوية
    this.scheduleMediumPriorityJobs();

    logger.info(`Cron Jobs initialized: ${this.jobs.size} jobs scheduled`);
  }

  /**
   * Cron Jobs الحرجة
   */
  private static scheduleCriticalJobs() {
    // 1. الفوترة التلقائية - كل 10 أيام
    this.scheduleJob("auto-billing", "0 0 */10 * *", async () => {
      logger.info("Running auto-billing job...");
      try {
        // TODO: تنفيذ الفوترة التلقائية
        logger.info("Auto-billing job completed");
      } catch (error: any) {
        logger.error("Auto-billing job failed", { error: error.message });
      }
    }, 10 * 24 * 60 * 60 * 1000); // 10 أيام

    // 2. شحن الحصص المدعومة - أول كل شهر
    this.scheduleMonthlyJob("charge-subsidies", "1 0 1 * *", async () => {
      logger.info("Running charge-subsidies job...");
      try {
        // TODO: تنفيذ شحن الحصص المدعومة
        logger.info("Charge-subsidies job completed");
      } catch (error: any) {
        logger.error("Charge-subsidies job failed", { error: error.message });
      }
    }, 1); // اليوم 1 من كل شهر

    // 3. تقرير الدعم - اليوم 28 من كل شهر
    this.scheduleMonthlyJob("generate-subsidy-report", "59 23 28 * *", async () => {
      logger.info("Running generate-subsidy-report job...");
      try {
        // TODO: تنفيذ تقرير الدعم
        logger.info("Generate-subsidy-report job completed");
      } catch (error: any) {
        logger.error("Generate-subsidy-report job failed", { error: error.message });
      }
    }, 28); // اليوم 28 من كل شهر

    // 4. الإهلاك الشهري - أول كل شهر
    this.scheduleMonthlyJob("monthly-depreciation", "0 1 1 * *", async () => {
      logger.info("Running monthly-depreciation job...");
      try {
        const db = await getDb();
        if (!db) return;

        // جلب جميع الشركات النشطة
        const activeBusinesses = await db
          .select({ id: businesses.id })
          .from(businesses)
          .where(eq(businesses.isActive, true));

        for (const business of activeBusinesses) {
          try {
            // TODO: استدعاء دالة حساب الإهلاك
            logger.info(`Monthly depreciation calculated for business ${business.id}`);
          } catch (error: any) {
            logger.error(`Failed to calculate depreciation for business ${business.id}`, {
              error: error.message,
            });
          }
        }

        logger.info("Monthly-depreciation job completed");
      } catch (error: any) {
        logger.error("Monthly-depreciation job failed", { error: error.message });
      }
    }, 1); // اليوم 1 من كل شهر
  }

  /**
   * Cron Jobs عالية الأولوية
   */
  private static scheduleHighPriorityJobs() {
    // 5. معالجة الحضور - يومياً 12:30
    this.scheduleDailyJob("process-attendance", "30 0 * * *", async () => {
      logger.info("Running process-attendance job...");
      try {
        // TODO: معالجة سجلات الحضور من أجهزة البصمة
        logger.info("Process-attendance job completed");
      } catch (error: any) {
        logger.error("Process-attendance job failed", { error: error.message });
      }
    }, 0, 30); // 12:30 صباحاً

    // 6. تذكيرات الدفع - 9 صباحاً يومياً
    this.scheduleDailyJob("payment-reminders", "0 9 * * *", async () => {
      logger.info("Running payment-reminders job...");
      try {
        // TODO: إرسال تذكيرات الدفع
        logger.info("Payment-reminders job completed");
      } catch (error: any) {
        logger.error("Payment-reminders job failed", { error: error.message });
      }
    }, 9, 0); // 9:00 صباحاً

    // 7. الصيانة الوقائية - منتصف الليل يومياً
    this.scheduleDailyJob("preventive-maintenance", "0 0 * * *", async () => {
      logger.info("Running preventive-maintenance job...");
      try {
        const db = await getDb();
        if (!db) return;

        // جلب جميع الشركات النشطة
        const activeBusinesses = await db
          .select({ id: businesses.id })
          .from(businesses)
          .where(eq(businesses.isActive, true));

        for (const business of activeBusinesses) {
          try {
            const result = await PreventiveSchedulingEngine.schedulePreventiveMaintenance(
              business.id,
              1 // system user
            );

            logger.info(`Preventive maintenance scheduled for business ${business.id}`, {
              scheduled: result.scheduled,
              workOrderIds: result.workOrderIds,
            });
          } catch (error: any) {
            logger.error(`Failed to schedule PM for business ${business.id}`, {
              error: error.message,
            });
          }
        }

        logger.info("Preventive-maintenance job completed");
      } catch (error: any) {
        logger.error("Preventive-maintenance job failed", { error: error.message });
      }
    }, 0, 0); // منتصف الليل

    // 8. تسوية الدفع المسبق - 11:55 مساءً يومياً
    this.scheduleDailyJob("daily-prepaid-settlement", "55 23 * * *", async () => {
      logger.info("Running daily-prepaid-settlement job...");
      try {
        // TODO: تسوية عمليات الدفع المسبق اليومية
        logger.info("Daily-prepaid-settlement job completed");
      } catch (error: any) {
        logger.error("Daily-prepaid-settlement job failed", { error: error.message });
      }
    }, 23, 55); // 11:55 مساءً

    // 9. فحص الاتصال بالأجهزة - كل 15 دقيقة
    this.scheduleJob("check-device-connectivity", "*/15 * * * *", async () => {
      logger.info("Running check-device-connectivity job...");
      try {
        // TODO: فحص حالة الاتصال بالأجهزة (IoT, SCADA)
        logger.info("Check-device-connectivity job completed");
      } catch (error: any) {
        logger.error("Check-device-connectivity job failed", { error: error.message });
      }
    }, 15 * 60 * 1000); // 15 دقيقة

    // 10. النسخ الاحتياطي - 2 صباحاً يومياً
    this.scheduleDailyJob("daily-backup", "0 2 * * *", async () => {
      logger.info("Running daily-backup job...");
      try {
        // TODO: تنفيذ النسخ الاحتياطي
        logger.info("Daily-backup job completed");
      } catch (error: any) {
        logger.error("Daily-backup job failed", { error: error.message });
      }
    }, 2, 0); // 2:00 صباحاً
  }

  /**
   * Cron Jobs متوسطة الأولوية
   */
  private static scheduleMediumPriorityJobs() {
    // 11. التقارير اليومية - 8 صباحاً
    this.scheduleDailyJob("daily-reports", "0 8 * * *", async () => {
      logger.info("Running daily-reports job...");
      try {
        // TODO: توليد التقارير اليومية
        logger.info("Daily-reports job completed");
      } catch (error: any) {
        logger.error("Daily-reports job failed", { error: error.message });
      }
    }, 8, 0); // 8:00 صباحاً

    // 12. تنظيف السجلات - أسبوعياً (الأحد 3 صباحاً)
    this.scheduleWeeklyJob("cleanup-logs", "0 3 * * 0", async () => {
      logger.info("Running cleanup-logs job...");
      try {
        // TODO: تنظيف السجلات القديمة
        logger.info("Cleanup-logs job completed");
      } catch (error: any) {
        logger.error("Cleanup-logs job failed", { error: error.message });
      }
    }, 0, 3, 0); // الأحد 3:00 صباحاً

    // 13. تحديث الأسعار - أول كل شهر
    this.scheduleMonthlyJob("update-prices", "0 0 1 * *", async () => {
      logger.info("Running update-prices job...");
      try {
        // TODO: تحديث أسعار المواد والخدمات
        logger.info("Update-prices job completed");
      } catch (error: any) {
        logger.error("Update-prices job failed", { error: error.message });
      }
    }, 1); // اليوم 1 من كل شهر

    // 14. الإحصائيات اليومية - 1 صباحاً
    this.scheduleDailyJob("daily-statistics", "0 1 * * *", async () => {
      logger.info("Running daily-statistics job...");
      try {
        // TODO: تحديث الإحصائيات اليومية
        logger.info("Daily-statistics job completed");
      } catch (error: any) {
        logger.error("Daily-statistics job failed", { error: error.message });
      }
    }, 1, 0); // 1:00 صباحاً

    // 15. إشعارات النظام - كل 30 دقيقة
    this.scheduleJob("system-notifications", "*/30 * * * *", async () => {
      logger.info("Running system-notifications job...");
      try {
        // TODO: فحص وإرسال إشعارات النظام
        logger.info("System-notifications job completed");
      } catch (error: any) {
        logger.error("System-notifications job failed", { error: error.message });
      }
    }, 30 * 60 * 1000); // 30 دقيقة
  }

  /**
   * جدولة مهمة بفترة زمنية ثابتة
   * ملاحظة: لا يتم التنفيذ الفوري - فقط جدولة
   */
  private static scheduleJob(name: string, schedule: string, task: () => Promise<void>, intervalMs: number) {
    // تحقق من عدم وجود المهمة مسبقاً
    if (this.jobs.has(name)) {
      logger.warn(`Job ${name} already exists, skipping...`);
      return;
    }

    const job: ScheduledJob = {
      name,
      schedule,
      task,
    };

    // جدولة فقط بدون تنفيذ فوري
    job.interval = setInterval(() => {
      task().catch((error) => logger.error(`${name} job failed`, { error: error.message }));
    }, intervalMs);

    this.jobs.set(name, job);
    logger.info(`Scheduled job: ${name} (interval: ${intervalMs}ms)`);
  }

  /**
   * جدولة مهمة يومية
   */
  private static scheduleDailyJob(
    name: string,
    schedule: string,
    task: () => Promise<void>,
    hour: number,
    minute: number
  ) {
    // تحقق من عدم وجود المهمة مسبقاً
    if (this.jobs.has(name)) {
      logger.warn(`Job ${name} already exists, skipping...`);
      return;
    }

    const job: ScheduledJob = {
      name,
      schedule,
      task,
    };

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // إذا كان الوقت المحدد قد مضى اليوم، نحدده لليوم التالي
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const msUntilNext = scheduledTime.getTime() - now.getTime();

    // جدولة التنفيذ الأول
    job.timeout = setTimeout(() => {
      task().catch((error) => logger.error(`${name} job failed`, { error: error.message }));

      // جدولة يومية بعد ذلك
      job.interval = setInterval(() => {
        task().catch((error) => logger.error(`${name} job failed`, { error: error.message }));
      }, 24 * 60 * 60 * 1000); // 24 ساعة
    }, msUntilNext);

    this.jobs.set(name, job);
    logger.info(`Scheduled daily job: ${name} at ${hour}:${minute} (next run in ${Math.round(msUntilNext / 60000)} minutes)`);
  }

  /**
   * جدولة مهمة أسبوعية
   */
  private static scheduleWeeklyJob(
    name: string,
    schedule: string,
    task: () => Promise<void>,
    dayOfWeek: number, // 0 = الأحد
    hour: number,
    minute: number
  ) {
    // تحقق من عدم وجود المهمة مسبقاً
    if (this.jobs.has(name)) {
      logger.warn(`Job ${name} already exists, skipping...`);
      return;
    }

    const job: ScheduledJob = {
      name,
      schedule,
      task,
    };

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // حساب الأيام حتى اليوم المحدد
    const currentDay = now.getDay();
    let daysUntilNext = dayOfWeek - currentDay;
    if (daysUntilNext <= 0) daysUntilNext += 7;

    scheduledTime.setDate(now.getDate() + daysUntilNext);

    const msUntilNext = scheduledTime.getTime() - now.getTime();

    // جدولة التنفيذ الأول
    job.timeout = setTimeout(() => {
      task().catch((error) => logger.error(`${name} job failed`, { error: error.message }));

      // جدولة أسبوعية بعد ذلك
      job.interval = setInterval(() => {
        task().catch((error) => logger.error(`${name} job failed`, { error: error.message }));
      }, 7 * 24 * 60 * 60 * 1000); // 7 أيام
    }, msUntilNext);

    this.jobs.set(name, job);
    logger.info(`Scheduled weekly job: ${name} on day ${dayOfWeek} at ${hour}:${minute}`);
  }

  /**
   * جدولة مهمة شهرية
   */
  private static scheduleMonthlyJob(
    name: string,
    schedule: string,
    task: () => Promise<void>,
    dayOfMonth: number
  ) {
    // تحقق من عدم وجود المهمة مسبقاً
    if (this.jobs.has(name)) {
      logger.warn(`Job ${name} already exists, skipping...`);
      return;
    }

    const job: ScheduledJob = {
      name,
      schedule,
      task,
    };

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setDate(dayOfMonth);
    scheduledTime.setHours(0, 0, 0, 0);

    // إذا كان اليوم المحدد قد مضى هذا الشهر، نحدده للشهر القادم
    if (scheduledTime <= now) {
      scheduledTime.setMonth(scheduledTime.getMonth() + 1);
    }

    const msUntilNext = scheduledTime.getTime() - now.getTime();

    // جدولة التنفيذ الأول
    job.timeout = setTimeout(() => {
      task().catch((error) => logger.error(`${name} job failed`, { error: error.message }));

      // جدولة شهرية بعد ذلك (تقريبية - 30 يوم)
      job.interval = setInterval(() => {
        task().catch((error) => logger.error(`${name} job failed`, { error: error.message }));
      }, 30 * 24 * 60 * 60 * 1000); // 30 يوم
    }, msUntilNext);

    this.jobs.set(name, job);
    logger.info(`Scheduled monthly job: ${name} on day ${dayOfMonth}`);
  }

  /**
   * إيقاف جميع Cron Jobs
   */
  static stopAll() {
    logger.info("Stopping all Cron Jobs...");
    this.jobs.forEach((job, name) => {
      if (job.interval) {
        clearInterval(job.interval);
      }
      if (job.timeout) {
        clearTimeout(job.timeout);
      }
      logger.info(`Stopped job: ${name}`);
    });
    this.jobs.clear();
    isInitialized = false;
  }

  /**
   * جلب حالة Cron Job
   */
  static getJobStatus(name: string): { running: boolean; schedule?: string } | null {
    const job = this.jobs.get(name);
    if (!job) return null;
    return {
      running: !!job.interval || !!job.timeout,
      schedule: job.schedule,
    };
  }

  /**
   * جلب جميع Cron Jobs
   */
  static getAllJobs(): Array<{ name: string; schedule: string; running: boolean }> {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      schedule: job.schedule,
      running: !!job.interval || !!job.timeout,
    }));
  }
}
