import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { db } from "./db";
import { logger } from "./utils/logger";

// ============================================
// Transition Support Router - دعم المرحلة الانتقالية
// ============================================

export const transitionSupportRouter = router({
  // ============================================
  // لوحة المراقبة
  // ============================================
  monitoring: router({
    // الحصول على لوحة التحكم
    getDashboard: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          year: z.number().optional(),
          month: z.number().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance
          const currentDate = new Date();
          const year = input.year || currentDate.getFullYear();
          const month = input.month || currentDate.getMonth() + 1;

          // إحصائيات عامة
          const [statsRows] = await db.execute(
            `SELECT 
              COUNT(DISTINCT customer_id) as total_customers,
              COUNT(DISTINCT CASE WHEN status = 'warning' OR status = 'critical' THEN customer_id END) as customers_at_risk,
              COALESCE(SUM(total_consumption), 0) as total_consumption,
              COALESCE(SUM(supported_consumption), 0) as supported_consumption,
              COALESCE(SUM(support_amount), 0) as total_support_amount
            FROM transition_support_monitoring
            WHERE business_id = ? AND year = ? AND month = ?`,
            [input.businessId, year, month]
          );

          // اتجاهات الاستهلاك
          const [trendsRows] = await db.execute(
            `SELECT 
              consumption_trend,
              COUNT(*) as count
            FROM transition_support_monitoring
            WHERE business_id = ? AND year = ? AND month = ?
            GROUP BY consumption_trend`,
            [input.businessId, year, month]
          );

          return {
            stats: (statsRows as any[])[0] || {},
            trends: trendsRows as any[],
            year,
            month,
          };
        } catch (error: any) {
          logger.error("Error fetching monitoring dashboard:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب لوحة المراقبة",
          });
        }
      }),

    // الحصول على اتجاه الاستهلاك
    getConsumptionTrend: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          months: z.number().default(6), // آخر 6 أشهر
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          let query = `
            SELECT 
              year,
              month,
              SUM(total_consumption) as total_consumption,
              SUM(supported_consumption) as supported_consumption,
              SUM(support_amount) as support_amount
            FROM transition_support_monitoring
            WHERE business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND customer_id = ?";
            params.push(input.customerId);
          }

          query += ` 
            AND (year * 12 + month) >= (YEAR(CURDATE()) * 12 + MONTH(CURDATE()) - ?)
            GROUP BY year, month
            ORDER BY year DESC, month DESC
            LIMIT ?
          `;

          params.push(input.months, input.months);

          const [rows] = await db.execute(query, params);

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching consumption trend:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب اتجاه الاستهلاك",
          });
        }
      }),

    // الحصول على التنبيهات
    getAlerts: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          severity: z.enum(["info", "warning", "error", "critical"]).optional(),
          status: z.enum(["active", "acknowledged", "resolved", "dismissed"]).optional(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          let query = `
            SELECT 
              tsa.*,
              c.name_ar as customer_name,
              c.account_number
            FROM transition_support_alerts tsa
            LEFT JOIN customers c ON tsa.customer_id = c.id
            WHERE tsa.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.severity) {
            query += " AND tsa.severity = ?";
            params.push(input.severity);
          }

          if (input.status) {
            query += " AND tsa.status = ?";
            params.push(input.status);
          }

          query += " ORDER BY tsa.triggered_at DESC LIMIT ?";
          params.push(input.limit);

          const [rows] = await db.execute(query, params);

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching alerts:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب التنبيهات",
          });
        }
      }),
  }),

  // ============================================
  // الإشعارات
  // ============================================
  notifications: router({
    // قائمة الإشعارات
    list: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          notificationType: z.string().optional(),
          status: z.enum(["pending", "sent", "delivered", "failed", "read"]).optional(),
          page: z.number().default(1),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance
          const offset = (input.page - 1) * input.limit;

          let query = `
            SELECT 
              tsn.*,
              c.name_ar as customer_name,
              c.phone as customer_phone
            FROM transition_support_notifications tsn
            LEFT JOIN customers c ON tsn.customer_id = c.id
            WHERE tsn.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND tsn.customer_id = ?";
            params.push(input.customerId);
          }

          if (input.notificationType) {
            query += " AND tsn.notification_type = ?";
            params.push(input.notificationType);
          }

          if (input.status) {
            query += " AND tsn.status = ?";
            params.push(input.status);
          }

          query += " ORDER BY tsn.created_at DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);
          const [countRows] = await db.execute(
            query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
            params.slice(0, -2)
          );

          const total = (countRows as any[])[0]?.total || 0;

          return {
            notifications: rows as any[],
            total,
            page: input.page,
            limit: input.limit,
          };
        } catch (error: any) {
          logger.error("Error fetching notifications:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الإشعارات",
          });
        }
      }),

    // إنشاء إشعار
    create: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          notificationType: z.enum(["quota_warning", "quota_exceeded", "consumption_increase", "support_ending", "custom"]),
          priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
          title: z.string().min(1),
          message: z.string().min(1),
          sendVia: z.enum(["sms", "email", "whatsapp", "push", "all"]).default("all"),
          templateId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          const [result] = await db.execute(
            `INSERT INTO transition_support_notifications (
              business_id, customer_id, notification_type, priority,
              title, message, send_via, template_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
              input.businessId,
              input.customerId,
              input.notificationType,
              input.priority,
              input.title,
              input.message,
              input.sendVia,
              input.templateId || null,
            ]
          );

          return {
            id: (result as any).insertId,
            success: true,
            message: "تم إنشاء الإشعار بنجاح",
          };
        } catch (error: any) {
          logger.error("Error creating notification:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء الإشعار",
          });
        }
      }),

    // إرسال إشعار
    send: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // ✅ تنفيذ منطق إرسال الإشعار عبر القنوات المختلفة
          // 1. جلب بيانات الإشعار
          const [notification] = await db.execute(
            `SELECT * FROM transition_support_notifications WHERE id = ?`,
            [input.id]
          );
          
          if (!notification || (notification as any[]).length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "الإشعار غير موجود",
            });
          }

          const notif = (notification as any[])[0];

          // 2. جلب بيانات العميل (الهاتف، البريد)
          const { customersEnhanced } = await import("../../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const [customer] = await db
            .select({
              id: customersEnhanced.id,
              mobileNo: customersEnhanced.mobileNo,
              email: customersEnhanced.email,
              businessId: customersEnhanced.businessId,
            })
            .from(customersEnhanced)
            .where(eq(customersEnhanced.id, notif.customerId))
            .limit(1);

          if (!customer) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "العميل غير موجود",
            });
          }

          // 3. إرسال عبر SMS/Email/WhatsApp حسب sendVia
          const { notificationService } = await import("../notifications/notification-service");
          const channels: any[] = [];
          
          if (notif.sendVia?.includes('sms') && customer.mobileNo) {
            channels.push('sms');
          }
          if (notif.sendVia?.includes('email') && customer.email) {
            channels.push('email');
          }
          if (notif.sendVia?.includes('whatsapp') && customer.mobileNo) {
            channels.push('whatsapp');
          }

          const recipients = [{
            phone: customer.mobileNo,
            email: customer.email,
            businessId: customer.businessId,
          }];

          await notificationService.send(
            'info',
            notif.titleEn || 'Transition Support Notification',
            notif.titleAr || 'إشعار دعم المرحلة الانتقالية',
            notif.messageEn || notif.messageAr || '',
            notif.messageAr || '',
            recipients,
            { channels }
          );

          // 4. تحديث حالة الإشعار
          await db.execute(
            `UPDATE transition_support_notifications 
             SET status = 'sent', sent_at = NOW() 
             WHERE id = ?`,
            [input.id]
          );

          return {
            success: true,
            message: "تم إرسال الإشعار بنجاح",
          };
        } catch (error: any) {
          logger.error("Error sending notification:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إرسال الإشعار",
          });
        }
      }),
  }),

  // ============================================
  // تعديلات الفوترة
  // ============================================
  billing: router({
    // تعديل فاتورة
    adjustInvoice: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          invoiceId: z.number(),
          adjustmentType: z.enum(["support_reduction", "support_extension", "consumption_limit", "tariff_change", "custom"]),
          originalAmount: z.number(),
          adjustedAmount: z.number(),
          reason: z.string().optional(),
          effectiveDate: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          const adjustmentAmount = input.adjustedAmount - input.originalAmount;

          const [result] = await db.execute(
            `INSERT INTO transition_support_billing_adjustments (
              business_id, customer_id, invoice_id, adjustment_type,
              original_amount, adjusted_amount, adjustment_amount,
              reason, effective_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
              input.businessId,
              input.customerId,
              input.invoiceId,
              input.adjustmentType,
              input.originalAmount,
              input.adjustedAmount,
              adjustmentAmount,
              input.reason || null,
              input.effectiveDate || null,
            ]
          );

          return {
            id: (result as any).insertId,
            success: true,
            message: "تم إنشاء تعديل الفوترة بنجاح",
          };
        } catch (error: any) {
          logger.error("Error adjusting invoice:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تعديل الفاتورة",
          });
        }
      }),

    // الحصول على التعديلات
    getAdjustments: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          invoiceId: z.number().optional(),
          status: z.enum(["draft", "applied", "reversed", "cancelled"]).optional(),
          page: z.number().default(1),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance
          const offset = (input.page - 1) * input.limit;

          let query = `
            SELECT 
              tsba.*,
              c.name_ar as customer_name,
              c.account_number
            FROM transition_support_billing_adjustments tsba
            LEFT JOIN customers c ON tsba.customer_id = c.id
            WHERE tsba.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND tsba.customer_id = ?";
            params.push(input.customerId);
          }

          if (input.invoiceId) {
            query += " AND tsba.invoice_id = ?";
            params.push(input.invoiceId);
          }

          if (input.status) {
            query += " AND tsba.status = ?";
            params.push(input.status);
          }

          query += " ORDER BY tsba.created_at DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching adjustments:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب التعديلات",
          });
        }
      }),

    // تطبيق قواعد المرحلة الانتقالية
    applyTransitionRules: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          ruleIds: z.array(z.number()).optional(), // قواعد محددة، أو جميع القواعد النشطة
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // ✅ تنفيذ منطق تطبيق قواعد المرحلة الانتقالية
          let appliedCount = 0;

          try {
            // 1. جلب القواعد النشطة
            const ruleIds = input.ruleIds && input.ruleIds.length > 0
              ? input.ruleIds
              : null;

            let rulesQuery = `
              SELECT * FROM transition_support_rules
              WHERE business_id = ? AND is_active = true
            `;
            const params: any[] = [input.businessId];

            if (ruleIds) {
              rulesQuery += ` AND id IN (${ruleIds.map(() => '?').join(',')})`;
              params.push(...ruleIds);
            }

            const [rules] = await db.execute(rulesQuery, params);
            const activeRules = rules as any[];

            // 2. تقييم الشروط لكل قاعدة
            for (const rule of activeRules) {
              try {
                // التحقق من الشروط (مثال: تاريخ البدء والانتهاء)
                const now = new Date();
                const startDate = rule.startDate ? new Date(rule.startDate) : null;
                const endDate = rule.endDate ? new Date(rule.endDate) : null;

                if (startDate && now < startDate) continue;
                if (endDate && now > endDate) continue;

                // 3. تطبيق الإجراءات المطلوبة
                if (rule.actionType === 'discount' || rule.actionType === 'subsidy') {
                  // جلب العملاء المؤهلين
                  const customerQuery = rule.customerIds
                    ? `SELECT id FROM customers WHERE id IN (${JSON.parse(rule.customerIds).map(() => '?').join(',')}) AND business_id = ?`
                    : `SELECT id FROM customers WHERE business_id = ? AND is_active = true`;

                  const customerParams = rule.customerIds
                    ? [...JSON.parse(rule.customerIds), input.businessId]
                    : [input.businessId];

                  const [customers] = await db.execute(customerQuery, customerParams);
                  const customerList = customers as any[];

                  // 4. إنشاء تعديلات الفوترة تلقائياً
                  for (const customer of customerList) {
                    await db.execute(
                      `INSERT INTO transition_support_billing_adjustments (
                        business_id, customer_id, rule_id, adjustment_type,
                        amount, description, status, created_by
                      ) VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)`,
                      [
                        input.businessId,
                        customer.id,
                        rule.id,
                        rule.actionType,
                        rule.amount || 0,
                        rule.description || `تعديل تلقائي - ${rule.nameAr}`,
                        ctx.user?.id || 1,
                      ]
                    );
                    appliedCount++;
                  }
                }
              } catch (ruleError: any) {
                logger.error('Failed to apply transition rule', {
                  ruleId: rule.id,
                  error: ruleError.message,
                });
              }
            }

            return {
              success: true,
              message: "تم تطبيق قواعد المرحلة الانتقالية بنجاح",
              appliedCount,
            };
          } catch (error: any) {
            logger.error('Failed to apply transition rules', {
              error: error.message,
              businessId: input.businessId,
            });
            throw error;
          }
        } catch (error: any) {
          logger.error("Error applying transition rules:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تطبيق القواعد",
          });
        }
      }),
  }),

  // ============================================
  // إدارة التنبيهات
  // ============================================
  alerts: router({
    // قائمة التنبيهات
    list: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          alertType: z.string().optional(),
          severity: z.enum(["info", "warning", "error", "critical"]).optional(),
          status: z.enum(["active", "acknowledged", "resolved", "dismissed"]).optional(),
          page: z.number().default(1),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance
          const offset = (input.page - 1) * input.limit;

          let query = `
            SELECT 
              tsa.*,
              c.name_ar as customer_name,
              c.account_number
            FROM transition_support_alerts tsa
            LEFT JOIN customers c ON tsa.customer_id = c.id
            WHERE tsa.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND tsa.customer_id = ?";
            params.push(input.customerId);
          }

          if (input.alertType) {
            query += " AND tsa.alert_type = ?";
            params.push(input.alertType);
          }

          if (input.severity) {
            query += " AND tsa.severity = ?";
            params.push(input.severity);
          }

          if (input.status) {
            query += " AND tsa.status = ?";
            params.push(input.status);
          }

          query += " ORDER BY tsa.triggered_at DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);
          const [countRows] = await db.execute(
            query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
            params.slice(0, -2)
          );

          const total = (countRows as any[])[0]?.total || 0;

          return {
            alerts: rows as any[],
            total,
            page: input.page,
            limit: input.limit,
          };
        } catch (error: any) {
          logger.error("Error fetching alerts:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب التنبيهات",
          });
        }
      }),

    // إنشاء تنبيه
    create: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          alertType: z.enum(["quota_threshold", "consumption_spike", "support_exhaustion", "billing_anomaly", "custom"]),
          severity: z.enum(["info", "warning", "error", "critical"]).default("warning"),
          title: z.string().min(1),
          message: z.string().min(1),
          thresholdValue: z.number().optional(),
          currentValue: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          const [result] = await db.execute(
            `INSERT INTO transition_support_alerts (
              business_id, customer_id, alert_type, severity,
              title, message, threshold_value, current_value, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
              input.businessId,
              input.customerId,
              input.alertType,
              input.severity,
              input.title,
              input.message,
              input.thresholdValue || null,
              input.currentValue || null,
            ]
          );

          return {
            id: (result as any).insertId,
            success: true,
            message: "تم إنشاء التنبيه بنجاح",
          };
        } catch (error: any) {
          logger.error("Error creating alert:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء التنبيه",
          });
        }
      }),

    // حل التنبيه
    resolve: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          resolution: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          await db.execute(
            `UPDATE transition_support_alerts 
             SET status = 'resolved', 
                 resolved_at = NOW(),
                 resolved_by = ?,
                 resolution = ?
             WHERE id = ?`,
            [ctx.user.id, input.resolution || null, input.id]
          );

          return {
            success: true,
            message: "تم حل التنبيه بنجاح",
          };
        } catch (error: any) {
          logger.error("Error resolving alert:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في حل التنبيه",
          });
        }
      }),
  }),
});

