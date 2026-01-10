import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { db } from "./db";
import { logger } from "./utils/logger";

// ============================================
// Payment Gateways Router - تكامل بوابات الدفع
// ============================================
// 
// ملاحظة: هذا Router جزء من نظام المطور (Developer System)
// جميع التكاملات الخارجية يجب أن تكون في developer.integrations
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

          // ✅ تنفيذ اختبار الاتصال الفعلي مع بوابة الدفع
          try {
            if (gateway.gateway_name?.toLowerCase().includes('moyasar')) {
              const { MoyasarGateway } = await import("./developer/integrations/payment-gateways/moyasar");
              const moyasarConfig = {
                apiKey: gateway.api_key || '',
                testMode: gateway.test_mode || false,
              };
              const moyasarGateway = new MoyasarGateway(moyasarConfig);
              const testResult = await moyasarGateway.testConnection();
              
              return {
                success: testResult.success,
                message: testResult.message,
              };
            } else if (gateway.gateway_name?.toLowerCase().includes('sadad')) {
              const { SadadGateway } = await import("./developer/integrations/payment-gateways/sadad");
              const sadadConfig = {
                merchantId: gateway.merchant_id || '',
                terminalId: gateway.config ? JSON.parse(gateway.config)?.terminalId : undefined,
                apiKey: gateway.api_key || '',
                secretKey: gateway.api_secret || '',
                testMode: gateway.test_mode || false,
              };
              const sadadGateway = new SadadGateway(sadadConfig);
              const testResult = await sadadGateway.testConnection();
              
              return {
                success: testResult.success,
                message: testResult.message,
              };
            } else {
              // بوابة غير معروفة - إرجاع نجاح افتراضي
              logger.warn(`Unknown gateway type: ${gateway.gateway_name}`);
              return {
                success: true,
                message: "بوابة الدفع غير مدعومة للاختبار التلقائي",
              };
            }
          } catch (error: any) {
            logger.error('Gateway test connection failed', {
              gatewayId: input.gatewayId,
              gatewayName: gateway.gateway_name,
              error: error.message,
            });
            
            return {
              success: false,
              message: error.message || "فشل في اختبار البوابة",
            };
          }
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

          // ✅ استدعاء API بوابة الدفع لإنشاء المعاملة
          let gatewayTransactionId: string | null = null;
          let paymentUrl: string | null = null;
          let paymentStatus = 'pending';

          try {
            // جلب بيانات البوابة
            const [gatewayRows] = await db.execute(
              "SELECT * FROM payment_gateways WHERE id = ?",
              [input.gatewayId]
            );
            const gateway = (gatewayRows as any[])[0];

            if (!gateway) {
              throw new Error("بوابة الدفع غير موجودة");
            }

            // جلب بيانات العميل
            const [customerRows] = await db.execute(
              "SELECT name_ar, name_en, email, phone FROM customers WHERE id = ?",
              [input.customerId]
            );
            const customer = (customerRows as any[])[0];

            // جلب بيانات الفاتورة (إن وُجدت)
            let invoiceNumber: string | null = null;
            if (input.invoiceId) {
              const [invoiceRows] = await db.execute(
                "SELECT invoice_no FROM invoices_enhanced WHERE id = ?",
                [input.invoiceId]
              );
              invoiceNumber = (invoiceRows as any[])[0]?.invoice_no || null;
            }

            // إنشاء callback URL
            const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/payment/${gateway.gateway_name?.toLowerCase() || 'moyasar'}`;

            // استدعاء API البوابة حسب النوع
            if (gateway.gateway_name?.toLowerCase().includes('moyasar')) {
              const { MoyasarGateway } = await import("./developer/integrations/payment-gateways/moyasar");
              const moyasarConfig = {
                apiKey: gateway.api_key || '',
                testMode: gateway.test_mode || false,
              };
              const moyasarGateway = new MoyasarGateway(moyasarConfig);

              const paymentResponse = await moyasarGateway.createPayment({
                amount: input.amount,
                currency: input.currency || 'SAR',
                description: invoiceNumber 
                  ? `دفع فاتورة #${invoiceNumber}` 
                  : `دفع معاملة #${transactionNumber}`,
                callbackUrl,
                source: {
                  type: 'creditcard', // سيتغير حسب paymentMethod من Frontend
                  name: customer?.name_ar || customer?.name_en || 'عميل',
                },
                metadata: {
                  transactionId: transactionId,
                  transactionNumber,
                  invoiceId: input.invoiceId,
                  customerId: input.customerId,
                },
              });

              gatewayTransactionId = paymentResponse.id;
              paymentStatus = paymentResponse.status === 'paid' ? 'completed' : 
                             paymentResponse.status === 'failed' ? 'failed' : 'pending';
              
              // الحصول على رابط الدفع إن وُجد
              if (paymentResponse.source?.transaction_url) {
                paymentUrl = paymentResponse.source.transaction_url;
              }

              // حفظ استجابة البوابة
              await db.execute(
                `UPDATE payment_transactions 
                 SET gateway_transaction_id = ?, 
                     response_data = ?,
                     status = ?
                 WHERE id = ?`,
                [
                  gatewayTransactionId,
                  JSON.stringify(paymentResponse),
                  paymentStatus,
                  transactionId,
                ]
              );

            } else if (gateway.gateway_name?.toLowerCase().includes('sadad')) {
              const { SadadGateway } = await import("./developer/integrations/payment-gateways/sadad");
              const sadadConfig = {
                merchantId: gateway.merchant_id || '',
                terminalId: gateway.config ? JSON.parse(gateway.config)?.terminalId : undefined,
                apiKey: gateway.api_key || '',
                secretKey: gateway.api_secret || '',
                testMode: gateway.test_mode || false,
              };
              const sadadGateway = new SadadGateway(sadadConfig);

              const paymentResponse = await sadadGateway.createPayment({
                amount: input.amount,
                currency: input.currency || 'SAR',
                orderId: transactionNumber,
                customerName: customer?.name_ar || customer?.name_en || 'عميل',
                customerEmail: input.customerEmail || customer?.email,
                customerPhone: input.customerPhone || customer?.phone,
                description: invoiceNumber 
                  ? `دفع فاتورة #${invoiceNumber}` 
                  : `دفع معاملة #${transactionNumber}`,
                callbackUrl,
                metadata: {
                  transactionId: transactionId,
                  transactionNumber,
                  invoiceId: input.invoiceId,
                  customerId: input.customerId,
                },
              });

              gatewayTransactionId = paymentResponse.paymentId;
              paymentStatus = paymentResponse.status === 'success' ? 'completed' : 
                             paymentResponse.status === 'failed' ? 'failed' : 'pending';
              
              // الحصول على رابط الدفع أو QR Code
              if (paymentResponse.paymentUrl) {
                paymentUrl = paymentResponse.paymentUrl;
              } else if (paymentResponse.qrCode) {
                paymentUrl = paymentResponse.qrCode; // يمكن استخدام QR Code كرابط
              }

              // حفظ استجابة البوابة
              await db.execute(
                `UPDATE payment_transactions 
                 SET gateway_transaction_id = ?, 
                     response_data = ?,
                     status = ?
                 WHERE id = ?`,
                [
                  gatewayTransactionId,
                  JSON.stringify(paymentResponse),
                  paymentStatus,
                  transactionId,
                ]
              );
            } else {
              logger.warn(`Unknown gateway type: ${gateway.gateway_name}`);
              // بوابة غير معروفة - نترك المعاملة كـ pending
            }

          } catch (gatewayError: any) {
            logger.error('Failed to create payment with gateway', {
              transactionId,
              gatewayId: input.gatewayId,
              error: gatewayError.message,
            });

            // تحديث حالة المعاملة بالفشل
            try {
              await db.execute(
                `UPDATE payment_transactions 
                 SET status = 'failed',
                     error_message = ?
                 WHERE id = ?`,
                [
                  gatewayError.message || 'فشل في الاتصال ببوابة الدفع',
                  transactionId,
                ]
              );
            } catch (updateError: any) {
              logger.error('Failed to update transaction status', {
                transactionId,
                error: updateError.message,
              });
            }

            // لا نرمي الخطأ - نعيد المعاملة مع حالة pending/failed
            paymentStatus = 'failed';
          }

          return {
            id: transactionId,
            transactionNumber,
            gatewayTransactionId,
            paymentUrl,
            status: paymentStatus,
            success: paymentStatus !== 'failed',
            message: paymentStatus === 'failed' 
              ? "فشل في إنشاء المعاملة مع بوابة الدفع" 
              : "تم إنشاء المعاملة بنجاح",
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

          // ✅ التحقق من حالة المعاملة من بوابة الدفع إذا كانت pending
          if (transaction.status === 'pending' && transaction.gateway_transaction_id && transaction.gateway_id) {
            const [gatewayRows] = await db.execute(
              "SELECT * FROM payment_gateways WHERE id = ?",
              [transaction.gateway_id]
            );
            const gateway = (gatewayRows as any[])[0];

            if (gateway) {
              try {
                // تنفيذ استدعاء API فعلي حسب نوع البوابة
                if (gateway.gateway_name?.toLowerCase().includes('moyasar')) {
                  const { MoyasarGateway } = await import("./developer/integrations/payment-gateways/moyasar");
                  const moyasarConfig = {
                    apiKey: gateway.api_key || '',
                    testMode: gateway.test_mode || false,
                  };
                  const moyasarGateway = new MoyasarGateway(moyasarConfig);

                  const verification = await moyasarGateway.verifyPayment(transaction.gateway_transaction_id);
                  
                  if (verification.isPaid && transaction.status === 'pending') {
                    // تحديث حالة المعاملة
                    await db.execute(
                      `UPDATE payment_transactions 
                       SET status = 'completed', 
                           completed_at = NOW()
                       WHERE id = ?`,
                      [input.transactionId]
                    );
                    transaction.status = 'completed';
                  } else if (verification.isFailed && transaction.status === 'pending') {
                    await db.execute(
                      `UPDATE payment_transactions 
                       SET status = 'failed',
                           error_message = ?,
                           failed_at = NOW()
                       WHERE id = ?`,
                      [
                        verification.failureMessage || 'فشل الدفع',
                        input.transactionId,
                      ]
                    );
                    transaction.status = 'failed';
                  }

                } else if (gateway.gateway_name?.toLowerCase().includes('sadad')) {
                  const { SadadGateway } = await import("./developer/integrations/payment-gateways/sadad");
                  const sadadConfig = {
                    merchantId: gateway.merchant_id || '',
                    terminalId: gateway.config ? JSON.parse(gateway.config)?.terminalId : undefined,
                    apiKey: gateway.api_key || '',
                    secretKey: gateway.api_secret || '',
                    testMode: gateway.test_mode || false,
                  };
                  const sadadGateway = new SadadGateway(sadadConfig);

                  const verification = await sadadGateway.verifyPayment(transaction.gateway_transaction_id);
                  
                  if (verification.isPaid && transaction.status === 'pending') {
                    await db.execute(
                      `UPDATE payment_transactions 
                       SET status = 'completed', 
                           completed_at = NOW()
                       WHERE id = ?`,
                      [input.transactionId]
                    );
                    transaction.status = 'completed';
                  } else if (verification.isFailed && transaction.status === 'pending') {
                    await db.execute(
                      `UPDATE payment_transactions 
                       SET status = 'failed',
                           error_message = ?,
                           failed_at = NOW()
                       WHERE id = ?`,
                      [
                        verification.failureMessage || 'فشل الدفع',
                        input.transactionId,
                      ]
                    );
                    transaction.status = 'failed';
                  }
                }
              } catch (error: any) {
                logger.error("Error verifying payment with gateway in getStatus", { 
                  transactionId: input.transactionId,
                  gatewayId: transaction.gateway_id,
                  error: error.message 
                });
                // لا نرمي الخطأ - نعيد الحالة الحالية
              }
            }
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

          // تحديث الفاتورة المرتبطة (إن وُجدت)
          const [transactionRows] = await db.execute(
            "SELECT invoice_id, customer_id, business_id, amount FROM payment_transactions WHERE id = ?",
            [input.transactionId]
          );
          const transaction = (transactionRows as any[])[0];
          
          if (transaction && transaction.invoice_id) {
            // تحديث الفاتورة
            await db.execute(
              `UPDATE invoices_enhanced SET 
                paid_amount = COALESCE(paid_amount, 0) + ?,
                balance_due = GREATEST(0, COALESCE(final_amount, total_amount, 0) - (COALESCE(paid_amount, 0) + ?)),
                status = CASE 
                  WHEN (COALESCE(paid_amount, 0) + ?) >= COALESCE(final_amount, total_amount, 0) THEN 'paid'
                  ELSE 'partial'
                END,
                is_paid = CASE 
                  WHEN (COALESCE(paid_amount, 0) + ?) >= COALESCE(final_amount, total_amount, 0) THEN true
                  ELSE false
                END
              WHERE id = ?`,
              [
                transaction.amount,
                transaction.amount,
                transaction.amount,
                transaction.amount,
                transaction.invoice_id
              ]
            );

            // إنشاء قيد محاسبي تلقائي
            try {
              const { AutoJournalEngine } = await import("./core/auto-journal-engine");
              await AutoJournalEngine.onPaymentReceived({
                id: transaction.invoice_id,
                businessId: transaction.business_id,
                customerId: transaction.customer_id,
                invoiceId: transaction.invoice_id,
                amount: parseFloat(transaction.amount),
                paymentMethod: "online",
                paymentDate: new Date(),
                createdBy: ctx.user?.id || 1,
              });
            } catch (error: any) {
              logger.error("Failed to create auto journal entry", { error: error.message });
              // لا نرمي الخطأ - الدفع نجح لكن القيد فشل
            }

            // إرسال إشعار تأكيد الدفع
            try {
              const { notificationService } = await import("./notifications/notification-service");
              const [customerRows] = await db.execute(
                "SELECT phone FROM customers_enhanced WHERE id = ?",
                [transaction.customer_id]
              );
              const customer = (customerRows as any[])[0];
              
              if (customer && customer.phone) {
                await notificationService.sendPaymentConfirmation(
                  customer.phone,
                  transaction.invoice_id ? `INV-${transaction.invoice_id}` : undefined,
                  transaction.amount,
                  new Date().toISOString().split("T")[0],
                  ['sms', 'whatsapp']
                );
              }
            } catch (error: any) {
              logger.error("Failed to send payment confirmation", { error: error.message });
            }
          }

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

          // ✅ التحقق من حالة المعاملة من بوابة الدفع
          if (transaction.gateway_transaction_id && transaction.gateway_id) {
            const [gatewayRows] = await db.execute(
              "SELECT * FROM payment_gateways WHERE id = ?",
              [transaction.gateway_id]
            );
            const gateway = (gatewayRows as any[])[0];

            if (gateway && transaction.status === 'pending') {
              try {
                // تنفيذ استدعاء API فعلي حسب نوع البوابة
                if (gateway.gateway_name?.toLowerCase().includes('moyasar')) {
                  const { MoyasarGateway } = await import("./developer/integrations/payment-gateways/moyasar");
                  const moyasarConfig = {
                    apiKey: gateway.api_key || '',
                    testMode: gateway.test_mode || false,
                  };
                  const moyasarGateway = new MoyasarGateway(moyasarConfig);

                  const verification = await moyasarGateway.verifyPayment(transaction.gateway_transaction_id);
                  
                  if (verification.isPaid) {
                    // تحديث حالة المعاملة
                    await db.execute(
                      `UPDATE payment_transactions 
                       SET status = 'completed', 
                           completed_at = NOW(),
                           response_data = JSONB_SET(COALESCE(response_data, '{}'), '{verified}', 'true')
                       WHERE id = ?`,
                      [input.transactionId]
                    );
                    transaction.status = 'completed';
                    
                    // استدعاء handleSuccess تلقائياً
                    // سيتم استدعاؤه من webhook عادة، لكن هنا نضمن التحديث
                  } else if (verification.isFailed) {
                    await db.execute(
                      `UPDATE payment_transactions 
                       SET status = 'failed',
                           error_message = ?,
                           failed_at = NOW()
                       WHERE id = ?`,
                      [
                        verification.failureMessage || 'فشل الدفع',
                        input.transactionId,
                      ]
                    );
                    transaction.status = 'failed';
                  }

                } else if (gateway.gateway_name?.toLowerCase().includes('sadad')) {
                  const { SadadGateway } = await import("./developer/integrations/payment-gateways/sadad");
                  const sadadConfig = {
                    merchantId: gateway.merchant_id || '',
                    terminalId: gateway.config ? JSON.parse(gateway.config)?.terminalId : undefined,
                    apiKey: gateway.api_key || '',
                    secretKey: gateway.api_secret || '',
                    testMode: gateway.test_mode || false,
                  };
                  const sadadGateway = new SadadGateway(sadadConfig);

                  const verification = await sadadGateway.verifyPayment(transaction.gateway_transaction_id);
                  
                  if (verification.isPaid) {
                    await db.execute(
                      `UPDATE payment_transactions 
                       SET status = 'completed', 
                           completed_at = NOW(),
                           response_data = JSONB_SET(COALESCE(response_data, '{}'), '{verified}', 'true')
                       WHERE id = ?`,
                      [input.transactionId]
                    );
                    transaction.status = 'completed';
                  } else if (verification.isFailed) {
                    await db.execute(
                      `UPDATE payment_transactions 
                       SET status = 'failed',
                           error_message = ?,
                           failed_at = NOW()
                       WHERE id = ?`,
                      [
                        verification.failureMessage || 'فشل الدفع',
                        input.transactionId,
                      ]
                    );
                    transaction.status = 'failed';
                  }
                }
              } catch (error: any) {
                logger.error("Error verifying payment with gateway", { 
                  transactionId: input.transactionId,
                  gatewayId: transaction.gateway_id,
                  error: error.message 
                });
                // لا نرمي الخطأ - نعيد الحالة الحالية
              }
            }
          }

          return {
            status: transaction.status,
            message: "تم التحقق من المعاملة",
            transactionId: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            createdAt: transaction.created_at,
            completedAt: transaction.completed_at,
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

          // التحقق من التوقيع (signature verification)
          if (input.signature && gateway.webhook_secret) {
            const isValid = verifyWebhookSignature(
              input.payload,
              input.signature,
              gateway.webhook_secret
            );
            
            if (!isValid) {
              logger.warn("Invalid webhook signature", { gatewayId: input.gatewayId });
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "توقيع Webhook غير صحيح",
              });
            }
          }

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

          // معالجة Webhook بناءً على نوع الحدث
          await processWebhookEvent(
            input.eventType,
            input.payload,
            gateway,
            webhookId
          );

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

/**
 * التحقق من توقيع Webhook
 */
function verifyWebhookSignature(
  payload: any,
  signature: string,
  secret: string,
  gatewayType?: string
): boolean {
  try {
    // ✅ تنفيذ التحقق الفعلي باستخدام HMAC SHA256
    if (!secret) {
      logger.warn('Webhook secret not configured - accepting in development mode only');
      if (process.env.NODE_ENV === "development") {
        return true;
      }
      return false;
    }

    // استخدام Services للتحقق حسب نوع البوابة
    if (gatewayType?.toLowerCase().includes('moyasar')) {
      const { MoyasarGateway } = require('./developer/integrations/payment-gateways/moyasar');
      return MoyasarGateway.verifyWebhookSignature(payload, signature, secret);
    } else if (gatewayType?.toLowerCase().includes('sadad')) {
      const { SadadGateway } = require('./developer/integrations/payment-gateways/sadad');
      return SadadGateway.verifyWebhookSignature(payload, signature, secret);
    }

    // Fallback: التحقق اليدوي العام
    const crypto = require('crypto');
    const payloadString = typeof payload === 'string' 
      ? payload 
      : JSON.stringify(payload);
    
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
    
    return hash.toLowerCase() === signature.toLowerCase();
  } catch (error: any) {
    logger.error("Error verifying webhook signature", { error: error.message });
    
    // في بيئة التطوير، نسمح بالتمرير
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    
    return false;
  }
}

/**
 * معالجة حدث Webhook
 */
async function processWebhookEvent(
  eventType: string,
  payload: any,
  gateway: any,
  webhookId: number
) {
  try {
    // تحديد نوع الحدث
    if (eventType.includes('payment.success') || eventType.includes('payment.paid')) {
      // معالجة دفعة ناجحة
      const transactionId = payload.transaction_id || payload.id;
      if (transactionId) {
        // البحث عن المعاملة
        const [rows] = await db.execute(
          "SELECT * FROM payment_transactions WHERE gateway_transaction_id = ? OR id = ?",
          [transactionId, transactionId]
        );
        
        const transaction = (rows as any[])[0];
        if (transaction) {
          // تحديث حالة المعاملة
          await db.execute(
            `UPDATE payment_transactions SET 
              status = 'completed',
              gateway_transaction_id = ?,
              response_data = ?,
              completed_at = NOW()
            WHERE id = ?`,
            [
              transactionId,
              JSON.stringify(payload),
              transaction.id
            ]
          );

          // تحديث الفاتورة
          if (transaction.invoice_id) {
            await db.execute(
              `UPDATE invoices_enhanced SET 
                paid_amount = COALESCE(paid_amount, 0) + ?,
                balance_due = GREATEST(0, COALESCE(final_amount, total_amount, 0) - (COALESCE(paid_amount, 0) + ?)),
                status = CASE 
                  WHEN (COALESCE(paid_amount, 0) + ?) >= COALESCE(final_amount, total_amount, 0) THEN 'paid'
                  ELSE 'partial'
                END
              WHERE id = ?`,
              [
                transaction.amount,
                transaction.amount,
                transaction.amount,
                transaction.invoice_id
              ]
            );
          }
        }
      }
    } else if (eventType.includes('payment.failed') || eventType.includes('payment.failure')) {
      // معالجة دفعة فاشلة
      const transactionId = payload.transaction_id || payload.id;
      if (transactionId) {
        await db.execute(
          `UPDATE payment_transactions SET 
            status = 'failed',
            error_message = ?,
            error_code = ?,
            response_data = ?,
            failed_at = NOW()
          WHERE gateway_transaction_id = ? OR id = ?`,
          [
            payload.message || payload.error_message || "فشل الدفع",
            payload.error_code || null,
            JSON.stringify(payload),
            transactionId,
            transactionId
          ]
        );
      }
    } else if (eventType.includes('payment.refunded') || eventType.includes('refund')) {
      // معالجة استرداد
      const transactionId = payload.transaction_id || payload.id;
      if (transactionId) {
        await db.execute(
          `INSERT INTO payment_refunds (
            payment_transaction_id, refund_amount, refund_reason,
            refunded_at, gateway_refund_id, webhook_id
          ) VALUES (?, ?, ?, NOW(), ?, ?)`,
          [
            transactionId,
            payload.refund_amount || payload.amount || 0,
            payload.refund_reason || "استرداد",
            payload.refund_id || null,
            webhookId
          ]
        );
      }
    }

    logger.info("Webhook event processed", { eventType, webhookId });
  } catch (error: any) {
    logger.error("Error processing webhook event", {
      error: error.message,
      eventType,
      webhookId,
    });
    throw error;
  }
}

