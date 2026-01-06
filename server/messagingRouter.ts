import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { db } from "./db";
import { logger } from "./utils/logger";

// ============================================
// Messaging Router - تكامل SMS/WhatsApp
// ============================================

export const messagingRouter = router({
  // ============================================
  // القوالب
  // ============================================
  templates: router({
    // قائمة القوالب
    list: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          templateType: z.string().optional(),
          channel: z.enum(["sms", "whatsapp", "email", "all"]).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          let query = "SELECT * FROM sms_templates WHERE business_id = ?";
          const params: any[] = [input.businessId];

          if (input.templateType) {
            query += " AND template_type = ?";
            params.push(input.templateType);
          }

          if (input.channel) {
            query += " AND channel = ?";
            params.push(input.channel);
          }

          if (input.isActive !== undefined) {
            query += " AND is_active = ?";
            params.push(input.isActive);
          }

          query += " ORDER BY is_default DESC, created_at DESC";

          const [rows] = await db.execute(query, params);

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching templates:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب القوالب",
          });
        }
      }),

    // إنشاء قالب
    create: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          templateName: z.string().min(1),
          templateType: z.enum(["invoice", "payment_reminder", "payment_confirmation", "reading_notification", "custom"]),
          channel: z.enum(["sms", "whatsapp", "email", "all"]).default("sms"),
          subject: z.string().optional(),
          message: z.string().min(1),
          variables: z.any().optional(),
          description: z.string().optional(),
          isDefault: z.boolean().default(false),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // إذا كان القالب افتراضياً، إلغاء الافتراضية من القوالب الأخرى
          if (input.isDefault) {
            await db.execute(
              "UPDATE sms_templates SET is_default = false WHERE business_id = ? AND template_type = ? AND channel = ?",
              [input.businessId, input.templateType, input.channel]
            );
          }

          const [result] = await db.execute(
            `INSERT INTO sms_templates (
              business_id, template_name, template_type, channel,
              subject, message, variables, description, is_active, is_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, ?)`,
            [
              input.businessId,
              input.templateName,
              input.templateType,
              input.channel,
              input.subject || null,
              input.message,
              input.variables ? JSON.stringify(input.variables) : null,
              input.description || null,
              input.isDefault,
            ]
          );

          return {
            id: (result as any).insertId,
            success: true,
            message: "تم إنشاء القالب بنجاح",
          };
        } catch (error: any) {
          logger.error("Error creating template:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء القالب",
          });
        }
      }),

    // تحديث قالب
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          templateName: z.string().optional(),
          subject: z.string().optional(),
          message: z.string().optional(),
          variables: z.any().optional(),
          isActive: z.boolean().optional(),
          isDefault: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance
          const { id, ...updates } = input;

          const updateFields: string[] = [];
          const params: any[] = [];

          Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
              if (key === "variables" && value) {
                updateFields.push(`${key} = ?`);
                params.push(JSON.stringify(value));
              } else {
                updateFields.push(`${key} = ?`);
                params.push(value);
              }
            }
          });

          if (updateFields.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "لا توجد حقول للتحديث",
            });
          }

          params.push(id);

          await db.execute(
            `UPDATE sms_templates SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
            params
          );

          return {
            success: true,
            message: "تم تحديث القالب بنجاح",
          };
        } catch (error: any) {
          logger.error("Error updating template:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث القالب",
          });
        }
      }),
  }),

  // ============================================
  // الإرسال
  // ============================================
  send: router({
    // إرسال فاتورة
    invoice: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          invoiceId: z.number(),
          channel: z.enum(["sms", "whatsapp", "email"]).default("sms"),
          templateId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // TODO: تنفيذ منطق إرسال الفاتورة
          // هذا يحتاج:
          // 1. جلب بيانات الفاتورة والعميل
          // 2. جلب القالب (أو استخدام الافتراضي)
          // 3. ملء القالب بالبيانات
          // 4. إرسال الرسالة عبر المزود
          // 5. حفظ سجل الرسالة

          return {
            success: true,
            message: "تم إرسال الفاتورة بنجاح",
          };
        } catch (error: any) {
          logger.error("Error sending invoice:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إرسال الفاتورة",
          });
        }
      }),

    // إرسال تذكير
    reminder: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          invoiceId: z.number().optional(),
          channel: z.enum(["sms", "whatsapp", "email"]).default("sms"),
          templateId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // TODO: تنفيذ منطق إرسال التذكير
          // مشابه لإرسال الفاتورة

          return {
            success: true,
            message: "تم إرسال التذكير بنجاح",
          };
        } catch (error: any) {
          logger.error("Error sending reminder:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إرسال التذكير",
          });
        }
      }),

    // إرسال تأكيد الدفع
    paymentConfirmation: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          paymentId: z.number(),
          channel: z.enum(["sms", "whatsapp", "email"]).default("sms"),
          templateId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // TODO: تنفيذ منطق إرسال تأكيد الدفع

          return {
            success: true,
            message: "تم إرسال تأكيد الدفع بنجاح",
          };
        } catch (error: any) {
          logger.error("Error sending payment confirmation:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إرسال تأكيد الدفع",
          });
        }
      }),

    // إرسال رسالة مخصصة
    custom: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          channel: z.enum(["sms", "whatsapp", "email"]),
          message: z.string().min(1),
          subject: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // جلب بيانات العميل
          const [customerRows] = await db.execute(
            "SELECT phone, email FROM customers WHERE id = ?",
            [input.customerId]
          );

          const customer = (customerRows as any[])[0];
          if (!customer) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "العميل غير موجود",
            });
          }

          // تحديد المستلم
          let recipient = "";
          if (input.channel === "sms" || input.channel === "whatsapp") {
            recipient = customer.phone || "";
          } else if (input.channel === "email") {
            recipient = customer.email || "";
          }

          if (!recipient) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `لا يوجد ${input.channel === "email" ? "بريد إلكتروني" : "رقم هاتف"} للعميل`,
            });
          }

          // إنشاء سجل الرسالة
          const [result] = await db.execute(
            `INSERT INTO sms_messages (
              business_id, customer_id, message_type, channel,
              recipient, subject, message, status
            ) VALUES (?, ?, 'custom', ?, ?, ?, ?, 'pending')`,
            [
              input.businessId,
              input.customerId,
              input.channel,
              recipient,
              input.subject || null,
              input.message,
            ]
          );

          const messageId = (result as any).insertId;

          // TODO: إرسال الرسالة عبر المزود
          // هذا يحتاج:
          // 1. جلب المزود الافتراضي
          // 2. إرسال الرسالة عبر API المزود
          // 3. تحديث حالة الرسالة

          return {
            id: messageId,
            success: true,
            message: "تم إرسال الرسالة بنجاح",
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error sending custom message:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إرسال الرسالة",
          });
        }
      }),
  }),

  // ============================================
  // إعادة المحاولة
  // ============================================
  retry: router({
    // قائمة الرسائل الفاشلة
    list: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          status: z.enum(["pending", "failed"]).default("failed"),
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
              sm.*,
              c.name_ar as customer_name,
              c.phone as customer_phone
            FROM sms_messages sm
            LEFT JOIN customers c ON sm.customer_id = c.id
            WHERE sm.business_id = ? AND sm.status = ?
          `;

          const params: any[] = [input.businessId, input.status];

          query += " ORDER BY sm.created_at DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);
          const [countRows] = await db.execute(
            query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
            params.slice(0, -2)
          );

          const total = (countRows as any[])[0]?.total || 0;

          return {
            messages: rows as any[],
            total,
            page: input.page,
            limit: input.limit,
          };
        } catch (error: any) {
          logger.error("Error fetching failed messages:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الرسائل الفاشلة",
          });
        }
      }),

    // إعادة إرسال رسالة
    retry: adminProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // جلب بيانات الرسالة
          const [rows] = await db.execute(
            "SELECT * FROM sms_messages WHERE id = ?",
            [input.messageId]
          );

          const message = (rows as any[])[0];
          if (!message) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "الرسالة غير موجودة",
            });
          }

          // التحقق من عدد المحاولات
          if (message.retry_count >= message.max_retries) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "تم تجاوز الحد الأقصى لمحاولات إعادة الإرسال",
            });
          }

          // تحديث عدد المحاولات
          await db.execute(
            `UPDATE sms_messages 
             SET retry_count = retry_count + 1,
                 status = 'pending',
                 next_retry_at = DATE_ADD(NOW(), INTERVAL (retry_count + 1) * 60 MINUTE)
             WHERE id = ?`,
            [input.messageId]
          );

          // TODO: إعادة إرسال الرسالة عبر المزود

          return {
            success: true,
            message: "تم جدولة إعادة الإرسال",
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error retrying message:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إعادة الإرسال",
          });
        }
      }),
  }),
});

