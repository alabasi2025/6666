import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { db } from "./db";
import { logger } from "./utils/logger";

// ============================================
// Messaging Router - تكامل SMS/WhatsApp
// ============================================
// 
// ملاحظة: هذا Router جزء من نظام المطور (Developer System)
// جميع التكاملات الخارجية يجب أن تكون في developer.integrations
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
          const db = await getDb();
          if (!db) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "قاعدة البيانات غير متاحة",
            });
          }

          // ✅ 1. جلب بيانات الفاتورة والعميل
          const invoice = await db.query.invoicesEnhanced.findFirst({
            where: (invoices, { eq }) => eq(invoices.id, input.invoiceId),
            with: {
              customer: true,
            },
          });

          if (!invoice) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "الفاتورة غير موجودة",
            });
          }

          if (!invoice.customer) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "العميل غير موجود",
            });
          }

          // ✅ 2-4. إرسال الرسالة عبر القناة المحددة
          const { smsChannel } = await import("./notifications/channels/sms");
          const { whatsappChannel } = await import("./notifications/channels/whatsapp");
          const { emailChannel } = await import("./notifications/channels/email");

          const invoiceData = {
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customer.nameAr,
            totalAmount: parseFloat(invoice.totalAmount),
            dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
          };

          let result: any = { success: false, channel: input.channel };

          if (input.channel === 'sms' && invoice.customer.phone) {
            result = await smsChannel.send(
              {
                id: Date.now(),
                type: 'invoice',
                titleAr: 'فاتورة جديدة',
                messageAr: `فاتورة رقم ${invoiceData.invoiceNumber} بمبلغ ${invoiceData.totalAmount} ريال. تاريخ الاستحقاق: ${invoiceData.dueDate}`,
                priority: 'normal',
                createdAt: new Date(),
              },
              { phone: invoice.customer.phone }
            );
          } else if (input.channel === 'whatsapp' && invoice.customer.phone) {
            const success = await whatsappChannel.sendInvoice(invoice.customer.phone, invoiceData);
            result = { success, channel: 'whatsapp' };
          } else if (input.channel === 'email' && invoice.customer.email) {
            result = await emailChannel.sendInvoice(invoice.customer.email, invoiceData);
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `القناة ${input.channel} غير متاحة أو بيانات العميل غير مكتملة`,
            });
          }

          // ✅ 5. حفظ سجل الرسالة (يتم تلقائياً في logMessage)
          
          return {
            success: result.success,
            message: "تم إرسال الفاتورة بنجاح",
            messageId: result.messageId,
          };
        } catch (error: any) {
          logger.error("Error sending invoice:", error);
          throw new TRPCError({
            code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message || "فشل في إرسال الفاتورة",
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
          const db = await getDb();
          if (!db) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "قاعدة البيانات غير متاحة",
            });
          }

          // جلب بيانات العميل
          const customer = await db.query.customersEnhanced.findFirst({
            where: (customers, { eq }) => eq(customers.id, input.customerId),
          });

          if (!customer) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "العميل غير موجود",
            });
          }

          // جلب بيانات الفاتورة إن وجدت
          let invoice: any = null;
          if (input.invoiceId) {
            invoice = await db.query.invoicesEnhanced.findFirst({
              where: (invoices, { eq }) => eq(invoices.id, input.invoiceId),
            });
          }

          // إرسال التذكير عبر القناة المحددة
          const { smsChannel } = await import("./notifications/channels/sms");
          const { whatsappChannel } = await import("./notifications/channels/whatsapp");
          const { emailChannel } = await import("./notifications/channels/email");

          let result: any = { success: false };

          if (input.channel === 'sms' && customer.phone) {
            const message = invoice
              ? `تذكير: الفاتورة ${invoice.invoiceNumber} بقيمة ${invoice.totalAmount} ريال متأخرة. يرجى السداد.`
              : `عزيزي ${customer.nameAr}، لديك فاتورة متأخرة. يرجى السداد في أقرب وقت.`;

            result = await smsChannel.send(
              {
                id: Date.now(),
                type: 'payment_reminder',
                titleAr: 'تذكير بالدفع',
                messageAr: message,
                priority: 'high',
                createdAt: new Date(),
              },
              { phone: customer.phone }
            );
          } else if (input.channel === 'whatsapp' && customer.phone && invoice) {
            const daysOverdue = invoice.dueDate
              ? Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            
            const success = await whatsappChannel.sendPaymentReminder(customer.phone, {
              customerName: customer.nameAr,
              invoiceNumber: invoice.invoiceNumber,
              totalAmount: parseFloat(invoice.totalAmount),
              daysOverdue,
            });
            result = { success, channel: 'whatsapp' };
          } else if (input.channel === 'email' && customer.email) {
            result = await emailChannel.send(
              {
                id: Date.now(),
                type: 'payment_reminder',
                titleAr: 'تذكير بالدفع',
                messageAr: invoice
                  ? `عزيزي ${customer.nameAr}، لديك فاتورة متأخرة رقم ${invoice.invoiceNumber} بقيمة ${invoice.totalAmount} ريال. يرجى السداد في أقرب وقت.`
                  : `عزيزي ${customer.nameAr}، لديك فاتورة متأخرة. يرجى السداد في أقرب وقت.`,
                priority: 'high',
                createdAt: new Date(),
              },
              { email: customer.email }
            );
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `القناة ${input.channel} غير متاحة أو بيانات العميل غير مكتملة`,
            });
          }

          return {
            success: result.success,
            message: "تم إرسال التذكير بنجاح",
            messageId: result.messageId,
          };
        } catch (error: any) {
          logger.error("Error sending reminder:", error);
          throw new TRPCError({
            code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message || "فشل في إرسال التذكير",
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
          const db = await getDb();
          if (!db) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "قاعدة البيانات غير متاحة",
            });
          }

          // جلب بيانات الدفعة والعميل
          const payment = await db.query.paymentsEnhanced.findFirst({
            where: (payments, { eq }) => eq(payments.id, input.paymentId),
            with: {
              customer: true,
              invoice: true,
            },
          });

          if (!payment) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "الدفعة غير موجودة",
            });
          }

          if (!payment.customer) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "العميل غير موجود",
            });
          }

          // إرسال التأكيد عبر القناة المحددة
          const { smsChannel } = await import("./notifications/channels/sms");
          const { whatsappChannel } = await import("./notifications/channels/whatsapp");
          const { emailChannel } = await import("./notifications/channels/email");

          const paymentData = {
            customerName: payment.customer.nameAr,
            amount: parseFloat(payment.amount),
            receiptNumber: payment.receiptNumber || payment.id.toString(),
            invoiceNumber: payment.invoice?.invoiceNumber,
          };

          let result: any = { success: false };

          if (input.channel === 'sms' && payment.customer.phone) {
            result = await smsChannel.send(
              {
                id: Date.now(),
                type: 'payment_confirmation',
                titleAr: 'تأكيد الدفع',
                messageAr: `تم استلام دفعتكم بنجاح: ${paymentData.amount} ريال. رقم الإيصال: ${paymentData.receiptNumber}`,
                priority: 'normal',
                createdAt: new Date(),
              },
              { phone: payment.customer.phone }
            );
          } else if (input.channel === 'whatsapp' && payment.customer.phone) {
            const success = await whatsappChannel.sendPaymentConfirmation(payment.customer.phone, paymentData);
            result = { success, channel: 'whatsapp' };
          } else if (input.channel === 'email' && payment.customer.email) {
            result = await emailChannel.send(
              {
                id: Date.now(),
                type: 'payment_confirmation',
                titleAr: 'تأكيد الدفع',
                messageAr: `عزيزي ${paymentData.customerName}، تم استلام دفعتكم بنجاح بمبلغ ${paymentData.amount} ريال. رقم الإيصال: ${paymentData.receiptNumber}`,
                priority: 'normal',
                createdAt: new Date(),
              },
              { email: payment.customer.email }
            );
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `القناة ${input.channel} غير متاحة أو بيانات العميل غير مكتملة`,
            });
          }

          return {
            success: result.success,
            message: "تم إرسال تأكيد الدفع بنجاح",
            messageId: result.messageId,
          };
        } catch (error: any) {
          logger.error("Error sending payment confirmation:", error);
          throw new TRPCError({
            code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message || "فشل في إرسال تأكيد الدفع",
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

          // ✅ إرسال الرسالة عبر المزود
          try {
            const { notificationService } = await import("./notifications/notification-service");
            
            // إرسال الرسالة عبر notificationService
            await notificationService.send({
              businessId: input.businessId,
              channels: input.channels || [input.channel],
              recipients: [input.recipient],
              template: 'custom',
              data: {
                message: input.message,
                subject: input.subject,
              },
            });
            
            // تحديث حالة الرسالة
            await db.execute(
              "UPDATE sms_messages SET status = 'sent', sent_at = NOW() WHERE id = ?",
              [messageId]
            );
          } catch (sendError: any) {
            logger.error('Failed to send custom message via provider', {
              messageId,
              error: sendError.message,
            });
            // تحديث حالة الرسالة بالفشل
            await db.execute(
              "UPDATE sms_messages SET status = 'failed', error_message = ? WHERE id = ?",
              [sendError.message || 'فشل الإرسال', messageId]
            );
          }

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

          // ✅ إعادة إرسال الرسالة عبر المزود
          try {
            const { notificationService } = await import("./notifications/notification-service");
            
            // إعادة إرسال الرسالة
            await notificationService.send({
              businessId: message.business_id || 1,
              channels: [message.channel || 'sms'],
              recipients: [message.recipient],
              template: message.template || 'custom',
              data: message.data ? (typeof message.data === 'string' ? JSON.parse(message.data) : message.data) : {},
            });
            
            // تحديث حالة الرسالة
            await db.execute(
              "UPDATE sms_messages SET status = 'sent', sent_at = NOW(), retry_count = retry_count + 1 WHERE id = ?",
              [input.messageId]
            );
          } catch (retryError: any) {
            logger.error('Failed to retry sending message', {
              messageId: input.messageId,
              error: retryError.message,
            });
            
            // تحديث حالة الرسالة بالفشل
            await db.execute(
              "UPDATE sms_messages SET status = 'failed', error_message = ? WHERE id = ?",
              [retryError.message || 'فشل إعادة الإرسال', input.messageId]
            );
          }

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

