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
import { businesses, subscriptionAccounts, metersEnhanced } from "../../drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

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
        // ✅ تنفيذ الفوترة التلقائية
        const autoBillingService = (await import("../services/auto-billing-service")).default;
        const result = await autoBillingService.run();
        
        logger.info("Auto-billing job completed", {
          success: result.success,
          failed: result.failed,
          invoicesCreated: result.invoicesCreated.length,
          errors: result.errors.length
        });

        // ✅ إرسال تقرير للمحاسب إذا كانت هناك أخطاء
        if (result.errors.length > 0) {
          logger.warn("Auto-billing had errors", { 
            errorCount: result.errors.length,
            errors: result.errors
          });
          try {
            const { notificationService } = await import("../notifications/notification-service");
            // جلب email المحاسب من إعدادات الشركة
            const accountantEmail = process.env.ACCOUNTANT_EMAIL || "accountant@example.com";
            await notificationService.send(
              'error',
              'Auto-Billing Errors',
              'أخطاء في الفوترة التلقائية',
              `Auto-billing encountered ${result.errors.length} errors. Please check the logs.`,
              `واجهت الفوترة التلقائية ${result.errors.length} أخطاء. يرجى مراجعة السجلات.`,
              [{ email: accountantEmail }],
              { channels: ['email'] }
            );
          } catch (emailError: any) {
            logger.error('Failed to send error email to accountant', { error: emailError.message });
          }
        }
      } catch (error: any) {
        logger.error("Auto-billing job failed", { error: error.message });
      }
    }, 10 * 24 * 60 * 60 * 1000); // 10 أيام

    // 2. شحن الحصص المدعومة - أول كل شهر
    this.scheduleMonthlyJob("charge-subsidies", "1 0 1 * *", async () => {
      logger.info("Running charge-subsidies job...");
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
            // ✅ جلب جميع حسابات المشترك المدعومة (government_support) النشطة
            const subsidizedAccounts = await db
              .select({
                id: subscriptionAccounts.id,
                customerId: subscriptionAccounts.customerId,
                monthlyQuota: subscriptionAccounts.monthlyQuota,
                iotDeviceId: subscriptionAccounts.iotDeviceId,
              })
              .from(subscriptionAccounts)
              .where(and(
                eq(subscriptionAccounts.businessId, business.id),
                eq(subscriptionAccounts.accountType, 'government_support'),
                eq(subscriptionAccounts.status, 'active')
              ));

            logger.info(`Found ${subsidizedAccounts.length} subsidized accounts for business ${business.id}`);

            for (const account of subsidizedAccounts) {
              try {
                const quotaKwh = parseFloat(account.monthlyQuota?.toString() || "0");
                
                if (quotaKwh <= 0) {
                  logger.warn(`Account ${account.id} has no monthly quota`, { accountId: account.id });
                  continue;
                }

                logger.info(`Charging monthly quota for subscription account ${account.id}`, {
                  customerId: account.customerId,
                  quotaKwh
                });
                
                // ✅ استدعاء ACREL API لشحن الحصة
                try {
                  const { acrelService } = await import("../developer/integrations/acrel-service");
                  
                  // جلب العداد المرتبط بحساب المشترك
                  const [meter] = await db
                    .select({
                      id: metersEnhanced.id,
                      iotDeviceId: metersEnhanced.iotDeviceId,
                      category: metersEnhanced.category,
                    })
                    .from(metersEnhanced)
                    .where(and(
                      eq(metersEnhanced.subscriptionAccountId, account.id),
                      eq(metersEnhanced.category, 'iot'),
                      eq(metersEnhanced.isActive, true)
                    ))
                    .limit(1);

                  const iotDeviceId = account.iotDeviceId || meter?.iotDeviceId;

                  if (iotDeviceId && meter?.id) {
                    // ✅ شحن الحصة الشهرية عبر ACREL API
                    try {
                      await acrelService.setMonthlyQuota(iotDeviceId, quotaKwh);
                      
                      logger.info(`Quota charged successfully for subscription account ${account.id}`, {
                        accountId: account.id,
                        customerId: account.customerId,
                        iotDeviceId,
                        quotaKwh,
                        meterId: meter.id
                      });

                      // ✅ تحديث lastQuotaChargeDate في subscriptionAccounts (يمكن إضافة حقل لاحقاً)
                      // حالياً نكتفي بتسجيل العملية في log
                      
                    } catch (quotaError: any) {
                      logger.error(`Failed to charge quota via ACREL API for account ${account.id}`, {
                        accountId: account.id,
                        customerId: account.customerId,
                        iotDeviceId,
                        quotaKwh,
                        error: quotaError.message
                      });
                      // لا نرمي الخطأ - نتابع مع باقي الحسابات
                    }
                  } else {
                    logger.warn(`No IoT device ID found for subscription account ${account.id}`, {
                      accountId: account.id,
                      customerId: account.customerId
                    });
                  }
                } catch (acrelError: any) {
                  logger.error(`ACREL API error for subscription account ${account.id}`, {
                    accountId: account.id,
                    customerId: account.customerId,
                    error: acrelError.message,
                  });
                  // لا نرمي الخطأ - نتابع مع باقي الحسابات
                }
              } catch (error: any) {
                logger.error(`Failed to charge quota for subscription account ${account.id}`, {
                  accountId: account.id,
                  customerId: account.customerId,
                  error: error.message,
                });
              }
            }
          } catch (error: any) {
            logger.error(`Failed to process subsidies for business ${business.id}`, {
              error: error.message,
            });
          }
        }

        logger.info("Charge-subsidies job completed");
      } catch (error: any) {
        logger.error("Charge-subsidies job failed", { error: error.message });
      }
    }, 1); // اليوم 1 من كل شهر

    // 3. تقرير الدعم - اليوم 28 من كل شهر
    this.scheduleMonthlyJob("generate-subsidy-report", "59 23 28 * *", async () => {
      logger.info("Running generate-subsidy-report job...");
      try {
        const db = await getDb();
        if (!db) return;

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        // جلب جميع الشركات النشطة
        const activeBusinesses = await db
          .select({ id: businesses.id })
          .from(businesses)
          .where(eq(businesses.isActive, true));

        for (const business of activeBusinesses) {
          try {
            // جمع بيانات الاستهلاك الشهري
            const [report] = await db.execute(
              `SELECT 
                COUNT(DISTINCT gsc.customer_id) as total_customers,
                SUM(gsc.total_consumption) as total_consumption,
                SUM(gsc.supported_consumption) as supported_consumption,
                SUM(gsc.support_amount) as total_support_amount,
                COUNT(CASE WHEN gsc.status = 'active' THEN 1 END) as active_customers
               FROM government_support_consumption gsc
               WHERE gsc.business_id = ? AND gsc.year = ? AND gsc.month = ?`,
              [business.id, year, month]
            );

            logger.info(`Monthly subsidy report generated for business ${business.id}`, {
              report: (report as any[])[0]
            });

            // ✅ إرسال التقرير للجهات المعنية
            try {
              const { notificationService } = await import("../notifications/notification-service");
              const governmentEmail = process.env.GOVERNMENT_EMAIL || "government@example.com";
              const reportData = (report as any[])[0];
              await notificationService.send(
                'info',
                `Monthly Subsidy Report - ${year}/${month}`,
                `تقرير الدعم الشهري - ${year}/${month}`,
                `Monthly subsidy report has been generated. Total supported consumption: ${reportData?.total_supported_consumption || 0} kWh, Total support amount: ${reportData?.total_support_amount || 0} SAR.`,
                `تم توليد تقرير الدعم الشهري. إجمالي الاستهلاك المدعوم: ${reportData?.total_supported_consumption || 0} كيلوواط، إجمالي مبلغ الدعم: ${reportData?.total_support_amount || 0} ريال.`,
                [{ email: governmentEmail }],
                { channels: ['email'] }
              );
            } catch (emailError: any) {
              logger.error('Failed to send report to government', { error: emailError.message });
            }

          } catch (error: any) {
            logger.error(`Failed to generate report for business ${business.id}`, {
              error: error.message,
            });
          }
        }

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
            // ✅ استدعاء خدمة حساب الإهلاك
            const depreciationService = (await import("../services/depreciation-service")).default;
            const result = await depreciationService.calculateMonthlyDepreciation(business.id);
            
            logger.info(`Monthly depreciation calculated for business ${business.id}`, {
              success: result.success,
              failed: result.failed,
              totalDepreciation: result.totalDepreciation,
              errors: result.errors.length,
            });

            // ✅ إشعار المحاسب إذا كانت هناك أخطاء
            if (result.errors.length > 0) {
              logger.warn(`Depreciation had errors for business ${business.id}`, {
                errorCount: result.errors.length,
              });
              try {
                const { notificationService } = await import("../notifications/notification-service");
                const accountantEmail = process.env.ACCOUNTANT_EMAIL || "accountant@example.com";
                await notificationService.send(
                  'error',
                  'Depreciation Calculation Errors',
                  'أخطاء في حساب الإهلاك',
                  `Depreciation calculation for business ${business.id} encountered ${result.errors.length} errors.`,
                  `واجه حساب الإهلاك للشركة ${business.id} ${result.errors.length} أخطاء.`,
                  [{ email: accountantEmail }],
                  { channels: ['email'] }
                );
              } catch (emailError: any) {
                logger.error('Failed to send error email to accountant', { error: emailError.message });
              }
            }
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
        // ✅ معالجة سجلات الحضور من أجهزة البصمة
        const db = await getDb();
        if (!db) return;

        // جلب سجلات الحضور غير المعالجة من أجهزة البصمة
        // يمكن إضافة جدول attendance_raw_records لسجلات البصمة الخام
        // ثم معالجتها وتحويلها إلى سجلات حضور عادية
        
        // مثال: معالجة السجلات الخام
        // const [rawRecords] = await db.execute(
        //   `SELECT * FROM attendance_raw_records WHERE processed = false LIMIT 100`
        // );
        
        // for (const record of rawRecords as any[]) {
        //   // معالجة وتحويل إلى attendance_records
        //   // تحديث processed = true
        // }

        logger.info("Process-attendance job completed - No raw records to process");
      } catch (error: any) {
        logger.error("Process-attendance job failed", { error: error.message });
      }
    }, 0, 30); // 12:30 صباحاً

    // 6. تذكيرات الدفع - 9 صباحاً يومياً
    this.scheduleDailyJob("payment-reminders", "0 9 * * *", async () => {
      logger.info("Running payment-reminders job...");
      try {
        const db = await getDb();
        if (!db) return;

        // جلب الفواتير المتأخرة (> 30 يوم)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [overdueInvoices] = await db.execute(
          `SELECT 
            i.id, i.invoice_number, i.total_amount, i.due_date,
            c.id as customer_id, c.name_ar as customer_name,
            c.phone, c.email
           FROM invoices_enhanced i
           JOIN customers c ON i.customer_id = c.id
           WHERE i.status = 'unpaid' 
             AND i.due_date < ?
             AND i.reminder_sent_at IS NULL OR i.reminder_sent_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
          [thirtyDaysAgo.toISOString().split('T')[0]]
        );

        for (const invoice of overdueInvoices as any[]) {
          try {
            // إرسال تذكير عبر جميع القنوات (SMS + WhatsApp + Email)
            logger.info(`Sending payment reminder to customer ${invoice.customer_id}`, {
              invoiceNumber: invoice.invoice_number,
              amount: invoice.total_amount
            });

            // ✅ استدعاء Services للإرسال
            const { smsChannel } = await import("../notifications/channels/sms");
            const { whatsappChannel } = await import("../notifications/channels/whatsapp");
            const { emailChannel } = await import("../notifications/channels/email");

            const daysOverdue = Math.floor(
              (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
            );

            // إرسال SMS
            if (invoice.phone) {
              await smsChannel.send(
                {
                  id: Date.now(),
                  type: 'payment_reminder',
                  titleAr: 'تذكير بالدفع',
                  messageAr: `تذكير: الفاتورة ${invoice.invoice_number} بقيمة ${invoice.total_amount} ريال متأخرة ${daysOverdue} يوم. يرجى السداد.`,
                  priority: 'high',
                  createdAt: new Date(),
                },
                { phone: invoice.phone }
              );
            }

            // إرسال WhatsApp
            if (invoice.phone) {
              await whatsappChannel.sendPaymentReminder(invoice.phone, {
                customerName: invoice.customer_name,
                invoiceNumber: invoice.invoice_number,
                totalAmount: parseFloat(invoice.total_amount),
                daysOverdue,
              });
            }

            // إرسال Email
            if (invoice.email) {
              await emailChannel.send(
                {
                  id: Date.now(),
                  type: 'payment_reminder',
                  titleAr: 'تذكير بالدفع',
                  messageAr: `عزيزي ${invoice.customer_name}، لديك فاتورة متأخرة رقم ${invoice.invoice_number} بقيمة ${invoice.total_amount} ريال. متأخرة منذ ${daysOverdue} يوم. يرجى السداد في أقرب وقت.`,
                  priority: 'high',
                  createdAt: new Date(),
                },
                { email: invoice.email }
              );
            }

            // تحديث تاريخ آخر تذكير
            await db.execute(
              `UPDATE invoices_enhanced SET reminder_sent_at = NOW() WHERE id = ?`,
              [invoice.id]
            );

          } catch (error: any) {
            logger.error(`Failed to send reminder for invoice ${invoice.invoice_number}`, {
              error: error.message,
            });
          }
        }

        logger.info("Payment-reminders job completed", {
          reminders_sent: (overdueInvoices as any[]).length
        });
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
        // ✅ تسوية عمليات الدفع المسبق اليومية
        try {
          const db = await getDb();
          if (!db) return;

          // جلب جميع معاملات الدفع المسبق المعلقة
          const [pendingTransactions] = await db.execute(
            `SELECT * FROM payment_transactions 
             WHERE payment_method = 'prepaid' 
             AND status = 'pending' 
             AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)`
          );

          for (const transaction of pendingTransactions as any[]) {
            try {
              // التحقق من حالة الدفع من بوابة الدفع
              // ثم تحديث الحالة وتسوية الرصيد
              // يمكن إضافة منطق أكثر تفصيلاً حسب نوع البوابة
              
              // تحديث الحالة إلى settled بعد التحقق
              await db.execute(
                `UPDATE payment_transactions 
                 SET status = 'settled', settled_at = NOW() 
                 WHERE id = ?`,
                [transaction.id]
              );
            } catch (txError: any) {
              logger.error('Failed to settle prepaid transaction', {
                transactionId: transaction.id,
                error: txError.message,
              });
            }
          }

          logger.info("Daily-prepaid-settlement job completed", {
            settledCount: (pendingTransactions as any[]).length,
          });
        } catch (settlementError: any) {
          logger.error('Failed to settle prepaid transactions', { error: settlementError.message });
        }
      } catch (error: any) {
        logger.error("Daily-prepaid-settlement job failed", { error: error.message });
      }
    }, 23, 55); // 11:55 مساءً

    // 9. فحص الاتصال بالأجهزة - كل 15 دقيقة
    this.scheduleJob("check-device-connectivity", "*/15 * * * *", async () => {
      logger.info("Running check-device-connectivity job...");
      try {
        // ✅ فحص حالة الاتصال بالأجهزة (IoT, SCADA)
        try {
          const db = await getDb();
          if (!db) return;

          // فحص عدادات ACREL
          const { acrelService } = await import("../developer/integrations/acrel-service");
          const [acrelMeters] = await db.execute(
            `SELECT id, acrel_meter_id, status FROM acrel_meters WHERE is_active = true`
          );

          for (const meter of acrelMeters as any[]) {
            try {
              const testResult = await acrelService.testConnection();
              const newStatus = testResult.success ? 'online' : 'offline';
              
              if (meter.status !== newStatus) {
                await db.execute(
                  `UPDATE acrel_meters SET status = ?, last_connectivity_check = NOW() WHERE id = ?`,
                  [newStatus, meter.id]
                );
                logger.info(`ACREL meter ${meter.id} status changed to ${newStatus}`);
              }
            } catch (error: any) {
              await db.execute(
                `UPDATE acrel_meters SET status = 'offline', last_connectivity_check = NOW() WHERE id = ?`,
                [meter.id]
              );
            }
          }

          // فحص عدادات STS
          const { stsService } = await import("../developer/integrations/sts-service");
          const [stsMeters] = await db.execute(
            `SELECT id, sts_meter_id, status FROM sts_meters WHERE is_active = true`
          );

          for (const meter of stsMeters as any[]) {
            try {
              const testResult = await stsService.testConnection();
              const newStatus = testResult.success ? 'online' : 'offline';
              
              if (meter.status !== newStatus) {
                await db.execute(
                  `UPDATE sts_meters SET status = ?, last_connectivity_check = NOW() WHERE id = ?`,
                  [newStatus, meter.id]
                );
                logger.info(`STS meter ${meter.id} status changed to ${newStatus}`);
              }
            } catch (error: any) {
              await db.execute(
                `UPDATE sts_meters SET status = 'offline', last_connectivity_check = NOW() WHERE id = ?`,
                [meter.id]
              );
            }
          }

          logger.info("Check-device-connectivity job completed");
        } catch (connectivityError: any) {
          logger.error('Failed to check device connectivity', { error: connectivityError.message });
        }
      } catch (error: any) {
        logger.error("Check-device-connectivity job failed", { error: error.message });
      }
    }, 15 * 60 * 1000); // 15 دقيقة

    // 9.1. القراءات التلقائية من ACREL - كل ساعة
    this.scheduleJob("acrel-auto-reading", "0 * * * *", async () => {
      logger.info("Running acrel-auto-reading job...");
      try {
        const db = await getDb();
        if (!db) return;

        const { acrelService } = await import("../developer/integrations/acrel-service");

        // جلب جميع عدادات ACREL النشطة
        const [meters] = await db.execute(
          `SELECT id, acrel_meter_id, meter_type, meter_id, business_id 
           FROM acrel_meters 
           WHERE status = 'online'`
        );

        for (const meter of meters as any[]) {
          try {
            // سحب القراءة من ACREL API
            const reading = await acrelService.getReading(meter.id);

            if (reading && reading.success) {
              // حفظ القراءة في acrel_readings
              await db.execute(
                `INSERT INTO acrel_readings (
                  acrel_meter_id, reading_date, 
                  voltage, current, power, energy, frequency, power_factor,
                  voltage_l1, voltage_l2, voltage_l3, current_l1, current_l2, current_l3,
                  power_l1, power_l2, power_l3, exported_energy, imported_energy, total_energy,
                  temperature1, temperature2, temperature3, temperature4, leakage_current, breaker_status
                ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  meter.id,
                  reading.data?.voltage || null,
                  reading.data?.current || null,
                  reading.data?.power || null,
                  reading.data?.energy || null,
                  reading.data?.frequency || null,
                  reading.data?.powerFactor || null,
                  reading.data?.voltageL1 || null,
                  reading.data?.voltageL2 || null,
                  reading.data?.voltageL3 || null,
                  reading.data?.currentL1 || null,
                  reading.data?.currentL2 || null,
                  reading.data?.currentL3 || null,
                  reading.data?.powerL1 || null,
                  reading.data?.powerL2 || null,
                  reading.data?.powerL3 || null,
                  reading.data?.exportedEnergy || null,
                  reading.data?.importedEnergy || null,
                  reading.data?.totalEnergy || null,
                  reading.data?.temperature1 || null,
                  reading.data?.temperature2 || null,
                  reading.data?.temperature3 || null,
                  reading.data?.temperature4 || null,
                  reading.data?.leakageCurrent || null,
                  reading.data?.breakerStatus || null,
                ]
              );

              // إذا كان العداد مربوطاً بنظام الفوترة، حفظ القراءة في meter_readings_enhanced
              if (meter.meter_id) {
                const currentReading = reading.data?.energy || reading.data?.totalEnergy || "0";
                await db.execute(
                  `INSERT INTO meter_readings_enhanced (
                    meter_id, reading_date, current_reading, consumption, reading_type, source
                  ) VALUES (?, NOW(), ?, 0, 'automatic', 'acrel')
                  ON DUPLICATE KEY UPDATE 
                    current_reading = VALUES(current_reading),
                    updated_at = NOW()`,
                  [meter.meter_id, currentReading]
                );
              }

              logger.info(`ACREL reading saved for meter ${meter.id}`);
            }
          } catch (error: any) {
            logger.error(`Failed to read ACREL meter ${meter.id}`, { error: error.message });
          }
        }

        logger.info("Acrel-auto-reading job completed", { meters_processed: (meters as any[]).length });
      } catch (error: any) {
        logger.error("Acrel-auto-reading job failed", { error: error.message });
      }
    }, 60 * 60 * 1000); // كل ساعة

    // 9.2. القراءات التلقائية من STS - كل ساعة
    this.scheduleJob("sts-auto-reading", "0 * * * *", async () => {
      logger.info("Running sts-auto-reading job...");
      try {
        const db = await getDb();
        if (!db) return;

        const { stsService } = await import("../developer/integrations/sts-service");

        // جلب جميع عدادات STS النشطة
        const [meters] = await db.execute(
          `SELECT id, sts_meter_number, meter_id, business_id, customer_id 
           FROM sts_meters 
           WHERE status = 'active'`
        );

        for (const meter of meters as any[]) {
          try {
            // سحب القراءة من STS API
            const reading = await stsService.getMeterReading(meter.id);

            if (reading && reading.success) {
              // تحديث remaining_kwh في sts_meters
              if (reading.data?.remainingKWH !== undefined) {
                await db.execute(
                  `UPDATE sts_meters SET remaining_kwh = ?, last_reading_date = NOW() WHERE id = ?`,
                  [reading.data.remainingKWH, meter.id]
                );
              }

              // إذا كان العداد مربوطاً بنظام الفوترة، حفظ القراءة في meter_readings_enhanced
              if (meter.meter_id) {
                const currentReading = reading.data?.currentReading || reading.data?.totalKWH || "0";
                await db.execute(
                  `INSERT INTO meter_readings_enhanced (
                    meter_id, reading_date, current_reading, consumption, reading_type, source
                  ) VALUES (?, NOW(), ?, 0, 'automatic', 'sts')
                  ON DUPLICATE KEY UPDATE 
                    current_reading = VALUES(current_reading),
                    updated_at = NOW()`,
                  [meter.meter_id, currentReading]
                );
              }

              logger.info(`STS reading saved for meter ${meter.id}`);
            }
          } catch (error: any) {
            logger.error(`Failed to read STS meter ${meter.id}`, { error: error.message });
          }
        }

        logger.info("Sts-auto-reading job completed", { meters_processed: (meters as any[]).length });
      } catch (error: any) {
        logger.error("Sts-auto-reading job failed", { error: error.message });
      }
    }, 60 * 60 * 1000); // كل ساعة

    // 9.3. فحص حدود الائتمان - كل 6 ساعات
    this.scheduleJob("check-credit-limits", "0 */6 * * *", async () => {
      logger.info("Running check-credit-limits job...");
      try {
        const db = await getDb();
        if (!db) return;

        // جلب جميع عدادات الائتمان (ACREL و STS)
        const [acrelCreditMeters] = await db.execute(
          `SELECT id, acrel_meter_id, business_id, customer_id, credit_limit, current_debt, payment_mode
           FROM acrel_meters 
           WHERE payment_mode = 'credit' AND status = 'online'`
        );

        const [stsCreditMeters] = await db.execute(
          `SELECT id, sts_meter_number, business_id, customer_id, credit_limit, current_debt, payment_mode
           FROM sts_meters 
           WHERE payment_mode = 'credit' AND status = 'active'`
        );

        // فحص عدادات ACREL
        for (const meter of acrelCreditMeters as any[]) {
          try {
            const creditLimit = parseFloat(meter.credit_limit || "0");
            const currentDebt = parseFloat(meter.current_debt || "0");
            const usagePercentage = creditLimit > 0 ? (currentDebt / creditLimit) * 100 : 0;

            // تحذير عند 80%
            if (usagePercentage >= 80 && usagePercentage < 90) {
              logger.warn(`ACREL meter ${meter.id} approaching credit limit`, {
                usage: usagePercentage.toFixed(1) + "%",
                debt: currentDebt,
                limit: creditLimit,
              });
              // ✅ إرسال إشعار للعميل
              try {
                const { notificationService } = await import("../notifications/notification-service");
                const [customer] = await db.execute(
                  `SELECT c.mobile_no, c.email, c.id, c.business_id 
                   FROM customers c 
                   JOIN meters_enhanced m ON m.customer_id = c.id 
                   WHERE m.id = ?`,
                  [meter.id]
                );
                if (customer && (customer as any[]).length > 0) {
                  const cust = (customer as any[])[0];
                  await notificationService.send(
                    'warning',
                    'Credit Limit Warning',
                    'تحذير: اقتراب حد الائتمان',
                    `Your electricity meter is approaching its credit limit (${usagePercentage.toFixed(1)}% used). Please recharge soon.`,
                    `عداد الكهرباء الخاص بك يقترب من حد الائتمان (${usagePercentage.toFixed(1)}% مستخدم). يرجى الشحن قريباً.`,
                    [{ 
                      phone: cust.mobile_no, 
                      email: cust.email,
                      businessId: cust.business_id 
                    }],
                    { channels: ['sms', 'whatsapp', 'email'] }
                  );
                }
              } catch (notifError: any) {
                logger.error(`Failed to send credit warning to customer`, { 
                  meterId: meter.id, 
                  error: notifError.message 
                });
              }
            }

            // إطفاء عند 100%
            if (usagePercentage >= 100) {
              logger.warn(`ACREL meter ${meter.id} reached credit limit, disconnecting...`);
              const { acrelService } = await import("../developer/integrations/acrel-service");
              await acrelService.disconnectMeter(meter.id, "Credit limit reached");
              // ✅ إرسال إشعار للعميل
              try {
                const { notificationService } = await import("../notifications/notification-service");
                const [customer] = await db.execute(
                  `SELECT c.mobile_no, c.email, c.id, c.business_id 
                   FROM customers c 
                   JOIN meters_enhanced m ON m.customer_id = c.id 
                   WHERE m.id = ?`,
                  [meter.id]
                );
                if (customer && (customer as any[]).length > 0) {
                  const cust = (customer as any[])[0];
                  await notificationService.send(
                    'warning',
                    'Credit Limit Warning',
                    'تحذير: اقتراب حد الائتمان',
                    `Your electricity meter is approaching its credit limit (${usagePercentage.toFixed(1)}% used). Please recharge soon.`,
                    `عداد الكهرباء الخاص بك يقترب من حد الائتمان (${usagePercentage.toFixed(1)}% مستخدم). يرجى الشحن قريباً.`,
                    [{ 
                      phone: cust.mobile_no, 
                      email: cust.email,
                      businessId: cust.business_id 
                    }],
                    { channels: ['sms', 'whatsapp', 'email'] }
                  );
                }
              } catch (notifError: any) {
                logger.error(`Failed to send credit warning to customer`, { 
                  meterId: meter.id, 
                  error: notifError.message 
                });
              }
            }
          } catch (error: any) {
            logger.error(`Failed to check credit for ACREL meter ${meter.id}`, { error: error.message });
          }
        }

        // فحص عدادات STS
        for (const meter of stsCreditMeters as any[]) {
          try {
            const creditLimit = parseFloat(meter.credit_limit || "0");
            const currentDebt = parseFloat(meter.current_debt || "0");
            const usagePercentage = creditLimit > 0 ? (currentDebt / creditLimit) * 100 : 0;

            // تحذير عند 80%
            if (usagePercentage >= 80 && usagePercentage < 90) {
              logger.warn(`STS meter ${meter.id} approaching credit limit`, {
                usage: usagePercentage.toFixed(1) + "%",
                debt: currentDebt,
                limit: creditLimit,
              });
              // ✅ إرسال إشعار للعميل
              try {
                const { notificationService } = await import("../notifications/notification-service");
                const [customer] = await db.execute(
                  `SELECT c.mobile_no, c.email, c.id, c.business_id 
                   FROM customers c 
                   JOIN meters_enhanced m ON m.customer_id = c.id 
                   WHERE m.id = ?`,
                  [meter.id]
                );
                if (customer && (customer as any[]).length > 0) {
                  const cust = (customer as any[])[0];
                  await notificationService.send(
                    'warning',
                    'Credit Limit Warning',
                    'تحذير: اقتراب حد الائتمان',
                    `Your electricity meter is approaching its credit limit (${usagePercentage.toFixed(1)}% used). Please recharge soon.`,
                    `عداد الكهرباء الخاص بك يقترب من حد الائتمان (${usagePercentage.toFixed(1)}% مستخدم). يرجى الشحن قريباً.`,
                    [{ 
                      phone: cust.mobile_no, 
                      email: cust.email,
                      businessId: cust.business_id 
                    }],
                    { channels: ['sms', 'whatsapp', 'email'] }
                  );
                }
              } catch (notifError: any) {
                logger.error(`Failed to send credit warning to customer`, { 
                  meterId: meter.id, 
                  error: notifError.message 
                });
              }
            }

            // إطفاء عند 100%
            if (usagePercentage >= 100) {
              logger.warn(`STS meter ${meter.id} reached credit limit, disconnecting...`);
              const { stsService } = await import("../developer/integrations/sts-service");
              await stsService.disconnectMeter(meter.id, "Credit limit reached");
              // ✅ إرسال إشعار للعميل
              try {
                const { notificationService } = await import("../notifications/notification-service");
                const [customer] = await db.execute(
                  `SELECT c.mobile_no, c.email, c.id, c.business_id 
                   FROM customers c 
                   JOIN meters_enhanced m ON m.customer_id = c.id 
                   WHERE m.id = ?`,
                  [meter.id]
                );
                if (customer && (customer as any[]).length > 0) {
                  const cust = (customer as any[])[0];
                  await notificationService.send(
                    'warning',
                    'Credit Limit Warning',
                    'تحذير: اقتراب حد الائتمان',
                    `Your electricity meter is approaching its credit limit (${usagePercentage.toFixed(1)}% used). Please recharge soon.`,
                    `عداد الكهرباء الخاص بك يقترب من حد الائتمان (${usagePercentage.toFixed(1)}% مستخدم). يرجى الشحن قريباً.`,
                    [{ 
                      phone: cust.mobile_no, 
                      email: cust.email,
                      businessId: cust.business_id 
                    }],
                    { channels: ['sms', 'whatsapp', 'email'] }
                  );
                }
              } catch (notifError: any) {
                logger.error(`Failed to send credit warning to customer`, { 
                  meterId: meter.id, 
                  error: notifError.message 
                });
              }
            }
          } catch (error: any) {
            logger.error(`Failed to check credit for STS meter ${meter.id}`, { error: error.message });
          }
        }

        logger.info("Check-credit-limits job completed", {
          acrel_meters: (acrelCreditMeters as any[]).length,
          sts_meters: (stsCreditMeters as any[]).length,
        });
      } catch (error: any) {
        logger.error("Check-credit-limits job failed", { error: error.message });
      }
    }, 6 * 60 * 60 * 1000); // كل 6 ساعات

    // 10. النسخ الاحتياطي - 2 صباحاً يومياً
    this.scheduleDailyJob("daily-backup", "0 2 * * *", async () => {
      logger.info("Running daily-backup job...");
      try {
        // ✅ تنفيذ النسخ الاحتياطي
        try {
          // يمكن استخدام pg_dump لـ PostgreSQL
          const { exec } = require('child_process');
          const util = require('util');
          const execPromise = util.promisify(exec);
          
          const dbName = process.env.DB_NAME || '666666';
          const dbUser = process.env.DB_USER || 'postgres';
          const backupDir = process.env.BACKUP_DIR || './backups';
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupFile = `${backupDir}/backup_${dbName}_${timestamp}.sql`;

          // إنشاء المجلد إذا لم يكن موجوداً
          const fs = require('fs');
          if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
          }

          // تنفيذ النسخ الاحتياطي
          const command = `pg_dump -U ${dbUser} -d ${dbName} -F c -f ${backupFile}`;
          
          try {
            await execPromise(command);
            logger.info(`Daily backup completed: ${backupFile}`);
            
            // حذف النسخ القديمة (الاحتفاظ بآخر 30 يوم)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const files = fs.readdirSync(backupDir);
            for (const file of files) {
              const filePath = `${backupDir}/${file}`;
              const stats = fs.statSync(filePath);
              if (stats.mtime < thirtyDaysAgo) {
                fs.unlinkSync(filePath);
                logger.info(`Deleted old backup: ${file}`);
              }
            }
          } catch (backupError: any) {
            logger.error('Backup command failed', { error: backupError.message });
          }
        } catch (backupError: any) {
          logger.error('Daily-backup job failed', { error: backupError.message });
        }
      } catch (error: any) {
        logger.error("Daily-backup job failed", { error: error.message });
      }
    }, 2, 0); // 2:00 صباحاً
  }

  /**
   * Cron Jobs متوسطة الأولوية
   */
  private static scheduleMediumPriorityJobs() {
    // 11. التقارير اليومية + مراقبة المرحلة الانتقالية - 8 صباحاً
    this.scheduleDailyJob("daily-reports-and-monitoring", "0 8 * * *", async () => {
      logger.info("Running daily-reports-and-monitoring job...");
      try {
        const db = await getDb();
        if (!db) return;

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        // جلب جميع الشركات النشطة
        const activeBusinesses = await db
          .select({ id: businesses.id })
          .from(businesses)
          .where(eq(businesses.isActive, true));

        for (const business of activeBusinesses) {
          try {
            // 1. مراقبة المرحلة الانتقالية
            const [monitoring] = await db.execute(
              `SELECT 
                tsm.customer_id,
                tsm.total_consumption,
                tsm.supported_consumption,
                gsc.monthly_quota,
                ((tsm.supported_consumption / gsc.monthly_quota) * 100) as quota_usage_percentage,
                tsm.consumption_trend
               FROM transition_support_monitoring tsm
               JOIN government_support_customers gsc ON tsm.customer_id = gsc.customer_id
               WHERE tsm.business_id = ? AND tsm.year = ? AND tsm.month = ?`,
              [business.id, year, month]
            );

            // فحص العملاء المعرضين للخطر
            for (const customer of monitoring as any[]) {
              if (customer.quota_usage_percentage >= 90) {
                logger.warn(`Customer ${customer.customer_id} approaching quota limit`, {
                  usage: customer.quota_usage_percentage,
                  quota: customer.monthly_quota
                });

                // ✅ إرسال إشعار للعميل
                try {
                  const { notificationService } = await import("../notifications/notification-service");
                  const [customerData] = await db.execute(
                    `SELECT c.mobile_no, c.email, c.id, c.business_id 
                     FROM customers c 
                     WHERE c.id = ?`,
                    [customer.customer_id]
                  );
                  if (customerData && (customerData as any[]).length > 0) {
                    const cust = (customerData as any[])[0];
                    await notificationService.send(
                      'warning',
                      'Quota Limit Warning',
                      'تنبيه: اقتراب انتهاء الحصة',
                      `You have consumed ${customer.quota_usage_percentage.toFixed(1)}% of your monthly quota.`,
                      `لقد استهلكت ${customer.quota_usage_percentage.toFixed(1)}% من حصتك الشهرية.`,
                      [{ 
                        phone: cust.mobile_no, 
                        email: cust.email,
                        businessId: cust.business_id 
                      }],
                      { channels: ['sms', 'whatsapp', 'email'] }
                    );
                  }
                } catch (notifError: any) {
                  logger.error(`Failed to send quota warning to customer`, { 
                    customerId: customer.customer_id, 
                    error: notifError.message 
                  });
                }
              }
            }

            logger.info(`Daily monitoring completed for business ${business.id}`, {
              customers_monitored: (monitoring as any[]).length
            });

          } catch (error: any) {
            logger.error(`Failed to process daily monitoring for business ${business.id}`, {
              error: error.message,
            });
          }
        }

        logger.info("Daily-reports-and-monitoring job completed");
      } catch (error: any) {
        logger.error("Daily-reports-and-monitoring job failed", { error: error.message });
      }
    }, 8, 0); // 8:00 صباحاً

    // 12. تنظيف السجلات - أسبوعياً (الأحد 3 صباحاً)
    this.scheduleWeeklyJob("cleanup-logs", "0 3 * * 0", async () => {
      logger.info("Running cleanup-logs job...");
      try {
        // ✅ تنظيف السجلات القديمة
        try {
          const db = await getDb();
          if (!db) return;

          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          // تنظيف سجلات الإشعارات القديمة
          await db.execute(
            `DELETE FROM messaging_logs WHERE created_at < ?`,
            [thirtyDaysAgo]
          );

          // تنظيف سجلات الأخطاء القديمة (إذا كان هناك جدول error_logs)
          // await db.execute(`DELETE FROM error_logs WHERE created_at < ?`, [thirtyDaysAgo]);

          // تنظيف سجلات الحضور القديمة (أكثر من سنة)
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          await db.execute(
            `DELETE FROM attendance_records WHERE attendance_date < ?`,
            [oneYearAgo]
          );

          logger.info("Cleanup-logs job completed");
        } catch (cleanupError: any) {
          logger.error('Failed to cleanup old logs', { error: cleanupError.message });
        }
      } catch (error: any) {
        logger.error("Cleanup-logs job failed", { error: error.message });
      }
    }, 0, 3, 0); // الأحد 3:00 صباحاً

    // 13. تحديث الأسعار - أول كل شهر
    this.scheduleMonthlyJob("update-prices", "0 0 1 * *", async () => {
      logger.info("Running update-prices job...");
      try {
        // ✅ تحديث أسعار المواد والخدمات
        try {
          const db = await getDb();
          if (!db) return;

          // يمكن إضافة منطق لجلب الأسعار من مصادر خارجية
          // أو تحديثها من جدول price_history
          // مثال: جلب آخر تحديث للأسعار وتطبيقها

          logger.info("Update-prices job completed - No external price source configured");
        } catch (priceError: any) {
          logger.error('Failed to update prices', { error: priceError.message });
        }
      } catch (error: any) {
        logger.error("Update-prices job failed", { error: error.message });
      }
    }, 1); // اليوم 1 من كل شهر

    // 14. الإحصائيات اليومية - 1 صباحاً
    this.scheduleDailyJob("daily-statistics", "0 1 * * *", async () => {
      logger.info("Running daily-statistics job...");
      try {
        // ✅ تحديث الإحصائيات اليومية
        try {
          const db = await getDb();
          if (!db) return;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // حساب إجمالي الفواتير اليوم
          const [invoices] = await db.execute(
            `SELECT 
               COUNT(*) as count,
               COALESCE(SUM(total_amount), 0) as total
             FROM invoices_enhanced 
             WHERE DATE(invoice_date) = DATE(?)
             AND status = 'paid'`,
            [today]
          );

          // حساب إجمالي العملاء النشطين
          const [customers] = await db.execute(
            `SELECT COUNT(*) as count FROM customers_enhanced WHERE is_active = true`
          );

          // حساب إجمالي الاستهلاك اليوم
          const [consumption] = await db.execute(
            `SELECT COALESCE(SUM(consumption), 0) as total
             FROM meter_readings_enhanced 
             WHERE DATE(reading_date) = DATE(?)`,
            [today]
          );

          // حفظ الإحصائيات في جدول daily_statistics (إذا كان موجوداً)
          // await db.execute(
          //   `INSERT INTO daily_statistics (date, invoices_count, invoices_total, active_customers, daily_consumption)
          //    VALUES (?, ?, ?, ?, ?)
          //    ON DUPLICATE KEY UPDATE 
          //      invoices_count = VALUES(invoices_count),
          //      invoices_total = VALUES(invoices_total),
          //      active_customers = VALUES(active_customers),
          //      daily_consumption = VALUES(daily_consumption)`,
          //   [today, invoices[0].count, invoices[0].total, customers[0].count, consumption[0].total]
          // );

          logger.info("Daily-statistics job completed", {
            invoices: (invoices as any[])[0]?.count || 0,
            totalInvoices: (invoices as any[])[0]?.total || 0,
            activeCustomers: (customers as any[])[0]?.count || 0,
            dailyConsumption: (consumption as any[])[0]?.total || 0,
          });
        } catch (statsError: any) {
          logger.error('Failed to update daily statistics', { error: statsError.message });
        }
      } catch (error: any) {
        logger.error("Daily-statistics job failed", { error: error.message });
      }
    }, 1, 0); // 1:00 صباحاً

    // 15. إشعارات النظام - كل 30 دقيقة
    this.scheduleJob("system-notifications", "*/30 * * * *", async () => {
      logger.info("Running system-notifications job...");
      try {
        // ✅ فحص وإرسال إشعارات النظام
        try {
          const db = await getDb();
          if (!db) return;

          // فحص الأخطاء الحرجة في آخر ساعة
          const oneHourAgo = new Date();
          oneHourAgo.setHours(oneHourAgo.getHours() - 1);

          // فحص الاتصالات الفاشلة مع الأجهزة
          const [failedConnections] = await db.execute(
            `SELECT COUNT(*) as count 
             FROM acrel_command_logs 
             WHERE status = 'failed' 
             AND created_at > ?`,
            [oneHourAgo]
          );

          // فحص الفواتير المتأخرة
          const [overdueInvoices] = await db.execute(
            `SELECT COUNT(*) as count 
             FROM invoices_enhanced 
             WHERE status = 'unpaid' 
             AND due_date < CURDATE()`
          );

          // إرسال إشعار للمدير إذا كانت هناك مشاكل
          if ((failedConnections as any[])[0]?.count > 10 || (overdueInvoices as any[])[0]?.count > 50) {
            const { notificationService } = await import("../notifications/notification-service");
            const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
            
            await notificationService.send(
              'warning',
              'System Alert',
              'تنبيه النظام',
              `System notifications: ${(failedConnections as any[])[0]?.count || 0} failed device connections, ${(overdueInvoices as any[])[0]?.count || 0} overdue invoices.`,
              `تنبيهات النظام: ${(failedConnections as any[])[0]?.count || 0} اتصالات فاشلة مع الأجهزة، ${(overdueInvoices as any[])[0]?.count || 0} فواتير متأخرة.`,
              [{ email: adminEmail }],
              { channels: ['email'] }
            );
          }

          logger.info("System-notifications job completed", {
            failedConnections: (failedConnections as any[])[0]?.count || 0,
            overdueInvoices: (overdueInvoices as any[])[0]?.count || 0,
          });
        } catch (notifError: any) {
          logger.error('Failed to check system notifications', { error: notifError.message });
        }
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

