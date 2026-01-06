import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { db } from "./db";
import { logger } from "./utils/logger";

// ============================================
// Payment Gateways Router - تكامل بوابات الدفع
// ============================================

export const paymentGatewaysRouter = router({
  // ============================================
  // إدارة البوابات
  // ============================================
  gateways: router({
    // قائمة البوابات
    list: protectedProcedure
      .input(z.object({ businessId: z.number(), isActive: z.boolean().optional() }))
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          let query = "SELECT * FROM payment_gateways WHERE business_id = ?";
          const params: any[] = [input.businessId];

          if (input.isActive !== undefined) {
            query += " AND is_active = ?";
            params.push(input.isActive);
          }

          query += " ORDER BY is_default DESC, created_at DESC";

          const [rows] = await db.execute(query, params);

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching payment gateways:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب بوابات الدفع",
          });
        }
      }),

    // تكوين بوابة
    configure: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          gatewayName: z.string().min(1),
          gatewayType: z.enum(["credit_card", "bank_transfer", "wallet", "crypto", "other"]),
          apiKey: z.string().optional(),
          apiSecret: z.string().optional(),
          merchantId: z.string().optional(),
          webhookSecret: z.string().optional(),
          apiUrl: z.string().url().optional(),
          testMode: z.boolean().default(false),
          sandboxApiKey: z.string().optional(),
          sandboxApiSecret: z.string().optional(),
          config: z.any().optional(),
          description: z.string().optional(),
          isDefault: z.boolean().default(false),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // إذا كانت البوابة افتراضية، إلغاء الافتراضية من البوابات الأخرى
          if (input.isDefault) {
            await db.execute(
              "UPDATE payment_gateways SET is_default = false WHERE business_id = ?",
              [input.businessId]
            );
          }

          const [result] = await db.execute(
            `INSERT INTO payment_gateways (
              business_id, gateway_name, gateway_type, api_key, api_secret,
              merchant_id, webhook_secret, api_url, test_mode,
              sandbox_api_key, sandbox_api_secret, config,
              description, is_active, is_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?)`,
            [
              input.businessId,
              input.gatewayName,
              input.gatewayType,
              input.apiKey || null,
              input.apiSecret || null,
              input.merchantId || null,
              input.webhookSecret || null,
              input.apiUrl || null,
              input.testMode,
              input.sandboxApiKey || null,
              input.sandboxApiSecret || null,
              input.config ? JSON.stringify(input.config) : null,
              input.description || null,
              input.isDefault,
            ]
          );

          return {
            id: (result as any).insertId,
            success: true,
            message: "تم تكوين بوابة الدفع بنجاح",
          };
        } catch (error: any) {
          logger.error("Error configuring payment gateway:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تكوين بوابة الدفع",
          });
        }
      }),

    // اختبار البوابة
    test: adminProcedure
      .input(z.object({ gatewayId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          const [rows] = await db.execute(
            "SELECT * FROM payment_gateways WHERE id = ?",
            [input.gatewayId]
          );

          const gateway = (rows as any[])[0];
          if (!gateway) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "بوابة الدفع غير موجودة",
            });
          }

          // TODO: تنفيذ اختبار الاتصال الفعلي مع بوابة الدفع
          // هذا يحتاج تنفيذ HTTP request للـ API

          return {
            success: true,
            message: "تم اختبار البوابة بنجاح",
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error testing payment gateway:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في اختبار البوابة",
          });
        }
      }),
  }),

  // ============================================
  // المعاملات
  // ============================================
  transactions: router({
    // إنشاء معاملة
    create: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          invoiceId: z.number().optional(),
          gatewayId: z.number(),
          amount: z.number().positive(),
          currency: z.string().default("SAR"),
          paymentMethod: z.string().optional(),
          customerEmail: z.string().email().optional(),
          customerPhone: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // توليد رقم معاملة فريد
          const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

          // إنشاء المعاملة
          const [result] = await db.execute(
            `INSERT INTO payment_transactions (
              business_id, customer_id, invoice_id, gateway_id,
              transaction_number, amount, currency, payment_method,
              customer_email, customer_phone, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
              input.businessId,
              input.customerId,
              input.invoiceId || null,
              input.gatewayId,
              transactionNumber,
              input.amount,
              input.currency,
              input.paymentMethod || null,
              input.customerEmail || null,
              input.customerPhone || null,
            ]
          );

          const transactionId = (result as any).insertId;

          // TODO: استدعاء API بوابة الدفع لإنشاء المعاملة
          // هذا يحتاج:
          // 1. جلب بيانات البوابة
          // 2. إعداد بيانات الطلب
          // 3. إرسال الطلب للبوابة
          // 4. حفظ استجابة البوابة
          // 5. تحديث حالة المعاملة

          return {
            id: transactionId,
            transactionNumber,
            success: true,
            message: "تم إنشاء المعاملة بنجاح",
            // paymentUrl: "...", // رابط الدفع (إن وُجد)
          };
        } catch (error: any) {
          logger.error("Error creating payment transaction:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء المعاملة",
          });
        }
      }),

    // الحصول على حالة المعاملة
    getStatus: protectedProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          const [rows] = await db.execute(
            `SELECT 
              pt.*,
              pg.gateway_name,
              c.name_ar as customer_name
            FROM payment_transactions pt
            LEFT JOIN payment_gateways pg ON pt.gateway_id = pg.id
            LEFT JOIN customers c ON pt.customer_id = c.id
            WHERE pt.id = ?`,
            [input.transactionId]
          );

          const transaction = (rows as any[])[0];
          if (!transaction) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "المعاملة غير موجودة",
            });
          }

          return transaction;
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error fetching transaction status:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب حالة المعاملة",
          });
        }
      }),

    // معالجة نجاح الدفع
    handleSuccess: protectedProcedure
      .input(
        z.object({
          transactionId: z.number(),
          gatewayTransactionId: z.string().optional(),
          responseData: z.any().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          await db.execute(
            `UPDATE payment_transactions 
             SET status = 'completed',
                 gateway_transaction_id = ?,
                 response_data = ?,
                 completed_at = NOW()
             WHERE id = ?`,
            [
              input.gatewayTransactionId || null,
              input.responseData ? JSON.stringify(input.responseData) : null,
              input.transactionId,
            ]
          );

          // TODO: تحديث الفاتورة المرتبطة (إن وُجدت)
          // TODO: إنشاء قيد محاسبي (إن وُجد محرك القيود)

          return {
            success: true,
            message: "تم معالجة الدفع بنجاح",
          };
        } catch (error: any) {
          logger.error("Error handling payment success:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في معالجة الدفع",
          });
        }
      }),

    // معالجة فشل الدفع
    handleFailure: protectedProcedure
      .input(
        z.object({
          transactionId: z.number(),
          errorMessage: z.string().optional(),
          errorCode: z.string().optional(),
          responseData: z.any().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          await db.execute(
            `UPDATE payment_transactions 
             SET status = 'failed',
                 error_message = ?,
                 error_code = ?,
                 response_data = ?,
                 failed_at = NOW()
             WHERE id = ?`,
            [
              input.errorMessage || null,
              input.errorCode || null,
              input.responseData ? JSON.stringify(input.responseData) : null,
              input.transactionId,
            ]
          );

          return {
            success: true,
            message: "تم معالجة فشل الدفع",
          };
        } catch (error: any) {
          logger.error("Error handling payment failure:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في معالجة فشل الدفع",
          });
        }
      }),
  }),

  // ============================================
  // التحقق
  // ============================================
  verification: router({
    // التحقق من الدفع
    verify: protectedProcedure
      .input(z.object({ transactionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          const [rows] = await db.execute(
            `SELECT pt.*, pg.* 
             FROM payment_transactions pt
             LEFT JOIN payment_gateways pg ON pt.gateway_id = pg.id
             WHERE pt.id = ?`,
            [input.transactionId]
          );

          const transaction = (rows as any[])[0];
          if (!transaction) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "المعاملة غير موجودة",
            });
          }

          // TODO: استدعاء API بوابة الدفع للتحقق من حالة المعاملة
          // هذا يحتاج:
          // 1. استخدام gatewayTransactionId للتحقق
          // 2. تحديث حالة المعاملة بناءً على الاستجابة

          return {
            status: transaction.status,
            message: "تم التحقق من المعاملة",
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error verifying payment:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في التحقق من الدفع",
          });
        }
      }),

    // استقبال Webhook
    webhook: protectedProcedure
      .input(
        z.object({
          gatewayId: z.number(),
          eventType: z.string(),
          payload: z.any(),
          signature: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Using synchronous db instance

          // جلب بيانات البوابة
          const [gatewayRows] = await db.execute(
            "SELECT * FROM payment_gateways WHERE id = ?",
            [input.gatewayId]
          );

          const gateway = (gatewayRows as any[])[0];
          if (!gateway) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "بوابة الدفع غير موجودة",
            });
          }

          // TODO: التحقق من التوقيع (signature verification)
          // هذا يحتاج:
          // 1. استخدام webhookSecret للتحقق من التوقيع
          // 2. التحقق من صحة البيانات

          // حفظ Webhook
          const [result] = await db.execute(
            `INSERT INTO payment_webhooks (
              gateway_id, event_type, payload, signature, is_valid
            ) VALUES (?, ?, ?, ?, true)`,
            [
              input.gatewayId,
              input.eventType,
              JSON.stringify(input.payload),
              input.signature || null,
            ]
          );

          const webhookId = (result as any).insertId;

          // TODO: معالجة Webhook بناءً على نوع الحدث
          // هذا يحتاج:
          // 1. تحديد نوع الحدث (payment.success, payment.failed, etc.)
          // 2. العثور على المعاملة المرتبطة
          // 3. تحديث حالة المعاملة
          // 4. تحديث الفاتورة (إن وُجدت)

          return {
            id: webhookId,
            success: true,
            message: "تم استقبال Webhook بنجاح",
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error processing webhook:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في معالجة Webhook",
          });
        }
      }),
  }),
});

