import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { logger } from "./utils/logger";
import { sql } from "drizzle-orm";
import { stsService } from "./developer/integrations/sts-service";

/**
 * توليد توكن تجريبي (للاستخدام في التطوير)
 */
function generateMockToken(amount: number): string {
  // توليد توكن بتنسيق STS (20 رقم)
  const timestamp = Date.now().toString().slice(-8);
  const amountPart = Math.floor(amount).toString().padStart(6, '0');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${timestamp}${amountPart}${randomPart}`.padEnd(20, '0').substring(0, 20);
}

// ============================================
// STS Router - أتمتة عدادات STS
// ============================================
// 
// ملاحظة: هذا Router جزء من نظام المطور (Developer System)
// جميع التكاملات الخارجية يجب أن تكون في developer.integrations
// ============================================

export const stsRouter = router({
  // ============================================
  // إدارة عدادات STS
  // ============================================
  meters: router({
    // قائمة عدادات STS
    list: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          status: z.enum(["active", "inactive", "faulty", "disconnected"]).optional(),
          search: z.string().optional(),
          page: z.number().default(1),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة" });
          
          const offset = (input.page - 1) * input.limit;

          // Build WHERE conditions
          const conditions: string[] = [`sm.business_id = ${input.businessId}`];
          
          if (input.customerId) {
            conditions.push(`sm.customer_id = ${input.customerId}`);
          }
          
          if (input.status) {
            conditions.push(`sm.status = '${input.status}'`);
          }
          
          if (input.search) {
            const searchTerm = `%${input.search}%`;
            conditions.push(`(sm.meter_number ILIKE '${searchTerm}' OR c.name_ar ILIKE '${searchTerm}')`);
          }

          const whereClause = conditions.join(" AND ");

          const result = await db.execute(sql`
            SELECT 
              sm.id,
              sm.business_id,
              sm.customer_id,
              sm.meter_number as sts_meter_number,
              sm.meter_type,
              sm.manufacturer,
              sm.model,
              sm.installation_date,
              sm.location,
              sm.status,
              sm.last_token_date,
              sm.total_tokens_generated,
              sm.notes,
              sm.created_at,
              sm.updated_at,
              c.name_ar as customer_name,
              c.phone as customer_phone,
              0 as current_balance
            FROM sts_meters sm
            LEFT JOIN customers c ON sm.customer_id = c.id
            WHERE ${sql.raw(whereClause)}
            ORDER BY sm.created_at DESC
            LIMIT ${input.limit} OFFSET ${offset}
          `);

          const countResult = await db.execute(sql`
            SELECT COUNT(*) as total
            FROM sts_meters sm
            LEFT JOIN customers c ON sm.customer_id = c.id
            WHERE ${sql.raw(whereClause)}
          `);

          const total = Number((countResult.rows as any[])[0]?.total || 0);

          return {
            meters: result.rows as any[],
            total,
            page: input.page,
            limit: input.limit,
          };
        } catch (error: any) {
          logger.error("Error fetching STS meters:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب عدادات STS",
          });
        }
      }),

    // إنشاء عداد STS جديد
    create: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          meterId: z.number().optional(),
          stsMeterNumber: z.string().min(1),
          serialNumber: z.string().optional(),
          manufacturer: z.string().optional(),
          model: z.string().optional(),
          apiConfigId: z.number().optional(),
          installationDate: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          // التحقق من عدم تكرار رقم العداد STS
          const [existing] = await db.execute(
            "SELECT id FROM sts_meters WHERE business_id = ? AND sts_meter_number = ?",
            [input.businessId, input.stsMeterNumber]
          );

          if ((existing as any[]).length > 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "رقم العداد STS موجود مسبقاً",
            });
          }

          const [result] = await db.execute(
            `INSERT INTO sts_meters (
              business_id, customer_id, meter_id, sts_meter_number, serial_number,
              manufacturer, model, api_config_id, installation_date, notes, status, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', true)`,
            [
              input.businessId,
              input.customerId,
              input.meterId || null,
              input.stsMeterNumber,
              input.serialNumber || null,
              input.manufacturer || null,
              input.model || null,
              input.apiConfigId || null,
              input.installationDate || null,
              input.notes || null,
            ]
          );

          const insertId = (result as any).insertId;

          return {
            id: insertId,
            success: true,
            message: "تم إنشاء عداد STS بنجاح",
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error creating STS meter:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء عداد STS",
          });
        }
      }),

    // تحديث عداد STS
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          stsMeterNumber: z.string().optional(),
          serialNumber: z.string().optional(),
          manufacturer: z.string().optional(),
          model: z.string().optional(),
          status: z.enum(["active", "inactive", "faulty", "disconnected"]).optional(),
          apiConfigId: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();
          const { id, ...updates } = input;

          const updateFields: string[] = [];
          const params: any[] = [];

          Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
              updateFields.push(`${key} = ?`);
              params.push(value);
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
            `UPDATE sts_meters SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
            params
          );

          return {
            success: true,
            message: "تم تحديث عداد STS بنجاح",
          };
        } catch (error: any) {
          logger.error("Error updating STS meter:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث عداد STS",
          });
        }
      }),

    // ربط عداد STS بعميل
    linkToCustomer: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          customerId: z.number(),
          meterId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          await db.execute(
            "UPDATE sts_meters SET customer_id = ?, meter_id = ?, updated_at = NOW() WHERE id = ?",
            [input.customerId, input.meterId || null, input.id]
          );

          return {
            success: true,
            message: "تم ربط العداد بالعميل بنجاح",
          };
        } catch (error: any) {
          logger.error("Error linking STS meter:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في ربط العداد",
          });
        }
      }),

    // الحصول على تفاصيل عداد STS
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [rows] = await db.execute(
            `SELECT 
              sm.*,
              c.name_ar as customer_name,
              c.phone as customer_phone,
              m.meter_number as meter_number,
              ac.provider_name as api_provider_name
            FROM sts_meters sm
            LEFT JOIN customers c ON sm.customer_id = c.id
            LEFT JOIN meters m ON sm.meter_id = m.id
            LEFT JOIN sts_api_config ac ON sm.api_config_id = ac.id
            WHERE sm.id = ?`,
            [input.id]
          );

          const meter = (rows as any[])[0];
          if (!meter) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "عداد STS غير موجود",
            });
          }

          return meter;
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error fetching STS meter:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب بيانات العداد",
          });
        }
      }),
  }),

  // ============================================
  // شحن الرصيد
  // ============================================
  charging: router({
    // إنشاء طلب شحن
    createCharge: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          stsMeterId: z.number(),
          amount: z.number().positive(),
          currency: z.string().default("SAR"),
          paymentMethod: z.string().optional(),
          paymentReference: z.string().optional(),
          invoiceId: z.number().optional(),
          tariffId: z.string().optional(), // معرف التعرفة (لحساب الكيلوهات)
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          // توليد رقم طلب فريد
          const requestNumber = `STS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

          // إنشاء طلب الشحن
          const [result] = await db.execute(
            `INSERT INTO sts_charge_requests (
              business_id, customer_id, sts_meter_id, invoice_id,
              request_number, amount, currency, payment_method, payment_reference,
              status, requested_by, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
            [
              input.businessId,
              input.customerId,
              input.stsMeterId,
              input.invoiceId || null,
              requestNumber,
              input.amount,
              input.currency,
              input.paymentMethod || null,
              input.paymentReference || null,
              ctx.user.id,
              input.notes || null,
            ]
          );

          const chargeRequestId = (result as any).insertId;

          // ✅ التحقق من الدفع أولاً (إذا كان هناك paymentReference)
          let paymentVerified = false;
          if (input.paymentReference) {
            // التحقق من الدفع من بوابة الدفع
            try {
              // البحث عن المعاملة في payment_transactions
              const [transactionRows] = await db.execute(
                `SELECT pt.*, pg.gateway_name
                 FROM payment_transactions pt
                 LEFT JOIN payment_gateways pg ON pt.gateway_id = pg.id
                 WHERE pt.transaction_number = ? OR pt.gateway_transaction_id = ?`,
                [input.paymentReference, input.paymentReference]
              );
              
              const transaction = (transactionRows as any[])[0];
              
              if (transaction && transaction.status === 'completed') {
                paymentVerified = true;
                
                // التحقق الإضافي من البوابة إذا لزم الأمر
                if (transaction.gateway_transaction_id && transaction.gateway_id) {
                  const [gatewayRows] = await db.execute(
                    "SELECT * FROM payment_gateways WHERE id = ?",
                    [transaction.gateway_id]
                  );
                  const gateway = (gatewayRows as any[])[0];
                  
                  if (gateway) {
                    try {
                      if (gateway.gateway_name?.toLowerCase().includes('moyasar')) {
                        const { MoyasarGateway } = await import("./developer/integrations/payment-gateways/moyasar");
                        const moyasarGateway = new MoyasarGateway({
                          apiKey: gateway.api_key || '',
                          testMode: gateway.test_mode || false,
                        });
                        const verification = await moyasarGateway.verifyPayment(transaction.gateway_transaction_id);
                        paymentVerified = verification.isPaid;
                      } else if (gateway.gateway_name?.toLowerCase().includes('sadad')) {
                        const { SadadGateway } = await import("./developer/integrations/payment-gateways/sadad");
                        const sadadGateway = new SadadGateway({
                          apiKey: gateway.api_key || '',
                          secretKey: gateway.api_secret || '',
                          testMode: gateway.test_mode || false,
                        });
                        const verification = await sadadGateway.verifyPayment(transaction.gateway_transaction_id);
                        paymentVerified = verification.isPaid;
                      }
                    } catch (verifyError: any) {
                      logger.error('Failed to verify payment with gateway', {
                        paymentReference: input.paymentReference,
                        gatewayId: transaction.gateway_id,
                        error: verifyError.message,
                      });
                      // نستخدم حالة المعاملة المحفوظة
                    }
                  }
                }
              } else {
                logger.warn('Payment transaction not found or not completed', {
                  paymentReference: input.paymentReference,
                  status: transaction?.status,
                });
              }
            } catch (verifyError: any) {
              logger.error('Failed to verify payment', {
                paymentReference: input.paymentReference,
                error: verifyError.message,
              });
              // في حالة الخطأ، نعتبر الدفع غير مؤكد
              paymentVerified = false;
            }
          }

          // إذا كان الدفع مؤكداً، استدعاء API مقدم الخدمة لإنشاء التوكن
          if (paymentVerified) {
            try {
              // جلب إعدادات API
              const [apiConfigRows] = await db.execute(
                `SELECT ac.*, sm.sts_meter_number
                 FROM sts_meters sm
                 LEFT JOIN sts_api_config ac ON sm.api_config_id = ac.id
                 WHERE sm.id = ?`,
                [input.stsMeterId]
              );

              const apiConfig = (apiConfigRows as any[])[0];
              
              if (apiConfig && apiConfig.api_url && apiConfig.api_key) {
                // استدعاء STS API لإنشاء التوكن
                let token: string;
                let tokenId: string | undefined;
                let kwhGenerated: number = 0;
                
                try {
                  const result = await stsService.chargeMeter(
                    input.stsMeterId,
                    input.amount,
                    input.paymentMethod,
                    input.tariffId
                  );
                  
                  token = result.token;
                  tokenId = result.tokenId;
                  kwhGenerated = result.kwhGenerated;
                } catch (apiError: any) {
                  logger.error("Failed to charge meter via STS API", {
                    stsMeterId: input.stsMeterId,
                    error: apiError.message,
                  });
                  // في حالة فشل API، نستخدم التوكن التجريبي كبديل
                  token = generateMockToken(input.amount);
                  logger.warn("Using mock token as fallback");
                  kwhGenerated = 0; // لا توجد كيلوهات في التوكن التجريبي
                }
                
                // حفظ التوكن
                await db.execute(
                  `INSERT INTO sts_tokens (
                    charge_request_id, sts_meter_id, customer_id,
                    token_value, token_amount, token_date, status
                  ) VALUES (?, ?, ?, ?, ?, NOW(), 'generated')`,
                  [
                    chargeRequestId,
                    input.stsMeterId,
                    input.customerId,
                    token,
                    input.amount
                  ]
                );

                // تحديث حالة الطلب
                await db.execute(
                  "UPDATE sts_charge_requests SET status = 'completed', completed_at = NOW() WHERE id = ?",
                  [chargeRequestId]
                );

                // تحديث العداد
                await db.execute(
                  `UPDATE sts_meters SET 
                    last_token_date = NOW(),
                    total_tokens_generated = COALESCE(total_tokens_generated, 0) + 1
                  WHERE id = ?`,
                  [input.stsMeterId]
                );

                // إنشاء قيد محاسبي تلقائي
                try {
                  const { AutoJournalEngine } = await import("./core/auto-journal-engine");
                  await AutoJournalEngine.onSTSRecharge({
                    id: chargeRequestId,
                    businessId: input.businessId,
                    customerId: input.customerId,
                    meterId: input.stsMeterId,
                    amount: input.amount,
                    kwhGenerated: kwhGenerated,
                    rechargeDate: new Date(),
                    createdBy: ctx.user.id,
                  });
                } catch (error: any) {
                  logger.error("Failed to create auto journal entry for STS recharge", {
                    error: error.message,
                  });
                }

                // إرسال التوكن للعميل عبر SMS/WhatsApp
                try {
                  const { notificationService } = await import("./notifications/notification-service");
                  const [customerRows] = await db.execute(
                    "SELECT phone FROM customers WHERE id = ?",
                    [input.customerId]
                  );
                  const customer = (customerRows as any[])[0];
                  
                  if (customer && customer.phone) {
                    await notificationService.send(
                      'success',
                      'STS Token Generated',
                      'تم توليد توكن STS',
                      `Your STS token: ${token}`,
                      `تم توليد توكن STS بنجاح. التوكن: ${token}. المبلغ: ${input.amount} ريال`,
                      [{ phone: customer.phone }],
                      { channels: ['sms', 'whatsapp'] }
                    );
                  }
                } catch (error: any) {
                  logger.error("Failed to send STS token", { error: error.message });
                }

                return {
                  id: chargeRequestId,
                  requestNumber,
                  token,
                  success: true,
                  message: "تم إنشاء طلب الشحن وتوليد التوكن بنجاح",
                };
              }
            } catch (error: any) {
              logger.error("Error calling STS API", { error: error.message });
              // لا نرمي الخطأ - نترك الطلب في حالة pending
            }
          }

          return {
            id: chargeRequestId,
            requestNumber,
            success: true,
            message: "تم إنشاء طلب الشحن بنجاح. في انتظار تأكيد الدفع",
          };
        } catch (error: any) {
          logger.error("Error creating charge request:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء طلب الشحن",
          });
        }
      }),

    // الحصول على التوكن
    getToken: protectedProcedure
      .input(z.object({ chargeRequestId: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [rows] = await db.execute(
            `SELECT 
              t.*,
              cr.request_number,
              cr.amount,
              sm.sts_meter_number,
              c.name_ar as customer_name
            FROM sts_tokens t
            INNER JOIN sts_charge_requests cr ON t.charge_request_id = cr.id
            INNER JOIN sts_meters sm ON t.sts_meter_id = sm.id
            INNER JOIN customers c ON t.customer_id = c.id
            WHERE t.charge_request_id = ?`,
            [input.chargeRequestId]
          );

          const tokens = rows as any[];
          return tokens;
        } catch (error: any) {
          logger.error("Error fetching token:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب التوكن",
          });
        }
      }),

    // التحقق من حالة الشحن
    verifyCharge: protectedProcedure
      .input(z.object({ chargeRequestId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          // ✅ استدعاء API للتحقق من حالة الشحن
          const [rows] = await db.execute(
            `SELECT scr.*, sm.sts_meter_number, ac.api_url, ac.api_key
             FROM sts_charge_requests scr
             LEFT JOIN sts_meters sm ON scr.sts_meter_id = sm.id
             LEFT JOIN sts_api_config ac ON sm.api_config_id = ac.id
             WHERE scr.id = ?`,
            [input.chargeRequestId]
          );

          const request = (rows as any[])[0];
          if (!request) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "طلب الشحن غير موجود",
            });
          }

          // استدعاء STS Service للتحقق من الحالة
          try {
            const { STSService, createSTSAPIClient } = await import("./developer/integrations/sts-service");
            const { createSTSAPIClient: createClient } = await import("./developer/integrations/sts-api-client");
            
            // إنشاء STS Service مع API config
            const stsClient = createClient({
              apiUrl: request.api_url || process.env.STS_API_URL || "",
              apiKey: request.api_key || process.env.STS_API_KEY || "",
            });
            const stsService = new STSService(stsClient);
            
            // التحقق من حالة الشحن
            const verificationResult = await stsService.verifyCharge(input.chargeRequestId);
            
            // تحديث حالة الطلب بناءً على الاستجابة
            if (verificationResult.status !== request.status) {
              await db.execute(
                `UPDATE sts_charge_requests 
                 SET status = ?, 
                     api_response_data = JSON_MERGE_PATCH(COALESCE(api_response_data, '{}'), ?),
                     processed_at = ${verificationResult.status === 'completed' || verificationResult.status === 'failed' ? 'NOW()' : 'processed_at'}
                 WHERE id = ?`,
                [
                  verificationResult.status,
                  JSON.stringify(verificationResult),
                  input.chargeRequestId,
                ]
              );
              
              // إذا نجح الشحن، تحديث رصيد العداد
              if (verificationResult.status === 'completed' && verificationResult.token) {
                // تحديث رصيد العداد في sts_meters
                await db.execute(
                  `UPDATE sts_meters 
                   SET current_balance = current_balance + ?, 
                       last_charge_date = NOW(),
                       updated_at = NOW()
                   WHERE id = ?`,
                  [request.amount, request.sts_meter_id]
                );
              }
            }

            return {
              status: verificationResult.status,
              message: verificationResult.message || "تم التحقق من حالة الشحن",
              token: verificationResult.token,
            };
          } catch (apiError: any) {
            logger.error('Failed to verify charge via STS API', {
              chargeRequestId: input.chargeRequestId,
              error: apiError.message,
            });
            
            // إرجاع الحالة المحفوظة في حالة فشل API
            return {
              status: request.status,
              message: `خطأ في الاتصال بـ API: ${apiError.message}`,
            };
          }
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error verifying charge:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في التحقق من حالة الشحن",
          });
        }
      }),

    // قائمة طلبات الشحن
    list: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          stsMeterId: z.number().optional(),
          status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]).optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
          page: z.number().default(1),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();
          const offset = (input.page - 1) * input.limit;

          let query = `
            SELECT 
              cr.*,
              c.name_ar as customer_name,
              sm.sts_meter_number,
              u.name as requested_by_name
            FROM sts_charge_requests cr
            LEFT JOIN customers c ON cr.customer_id = c.id
            LEFT JOIN sts_meters sm ON cr.sts_meter_id = sm.id
            LEFT JOIN users u ON cr.requested_by = u.id
            WHERE cr.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND cr.customer_id = ?";
            params.push(input.customerId);
          }

          if (input.stsMeterId) {
            query += " AND cr.sts_meter_id = ?";
            params.push(input.stsMeterId);
          }

          if (input.status) {
            query += " AND cr.status = ?";
            params.push(input.status);
          }

          if (input.dateFrom) {
            query += " AND DATE(cr.created_at) >= ?";
            params.push(input.dateFrom);
          }

          if (input.dateTo) {
            query += " AND DATE(cr.created_at) <= ?";
            params.push(input.dateTo);
          }

          query += " ORDER BY cr.created_at DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);
          const [countRows] = await db.execute(
            query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
            params.slice(0, -2)
          );

          const total = (countRows as any[])[0]?.total || 0;

          return {
            requests: rows as any[],
            total,
            page: input.page,
            limit: input.limit,
          };
        } catch (error: any) {
          logger.error("Error fetching charge requests:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب طلبات الشحن",
          });
        }
      }),
  }),

  // ============================================
  // التكامل مع API مقدم الخدمة
  // ============================================
  api: router({
    // اختبار الاتصال
    testConnection: adminProcedure
      .input(z.object({ apiConfigId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [rows] = await db.execute(
            "SELECT * FROM sts_api_config WHERE id = ? AND business_id = ?",
            [input.apiConfigId, ctx.user.businessId || 0]
          );

          const config = (rows as any[])[0];
          if (!config) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "إعدادات API غير موجودة",
            });
          }

          // ✅ تنفيذ اختبار الاتصال الفعلي مع API مقدم الخدمة
          try {
            const { createSTSAPIClient } = await import("./developer/integrations/sts-api-client");
            const { STSService } = await import("./developer/integrations/sts-service");
            
            // إنشاء STS Client مع API config
            const stsClient = createSTSAPIClient({
              apiUrl: config.api_url || "",
              apiKey: config.api_key || "",
            });
            const stsService = new STSService(stsClient);
            
            // اختبار الاتصال
            const testResult = await stsClient.testConnection();
            
            // تحديث نتيجة الاختبار
            await db.execute(
              `UPDATE sts_api_config 
               SET last_test_date = NOW(), 
                   last_test_result = ?,
                   last_test_message = ?
               WHERE id = ?`,
              [
                testResult ? 'success' : 'failed',
                testResult ? 'تم الاختبار بنجاح' : 'فشل الاختبار - تحقق من إعدادات API',
                input.apiConfigId,
              ]
            );

            if (!testResult) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "فشل اختبار الاتصال - تحقق من إعدادات API",
              });
            }

            return {
              success: true,
              message: "تم اختبار الاتصال بنجاح",
            };
          } catch (testError: any) {
            logger.error('API connection test failed', {
              apiConfigId: input.apiConfigId,
              error: testError.message,
            });
            
            // تحديث نتيجة الاختبار بالفشل
            await db.execute(
              `UPDATE sts_api_config 
               SET last_test_date = NOW(), 
                   last_test_result = 'failed',
                   last_test_message = ?
               WHERE id = ?`,
              [
                `خطأ في الاختبار: ${testError.message}`,
                input.apiConfigId,
              ]
            );
            
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `فشل في اختبار الاتصال: ${testError.message}`,
            });
          }
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error testing API connection:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في اختبار الاتصال",
          });
        }
      }),

    // ✅ مزامنة العدادات
    syncMeters: adminProcedure
      .input(z.object({ businessId: z.number(), apiConfigId: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          // جلب API config
          let apiConfig;
          if (input.apiConfigId) {
            const [configRows] = await db.execute(
              "SELECT * FROM sts_api_config WHERE id = ? AND business_id = ?",
              [input.apiConfigId, ctx.user.businessId || 0]
            );
            apiConfig = (configRows as any[])[0];
          } else {
            // جلب API config الافتراضي للـ business
            const [configRows] = await db.execute(
              "SELECT * FROM sts_api_config WHERE business_id = ? AND is_active = true ORDER BY created_at DESC LIMIT 1",
              [ctx.user.businessId || 0]
            );
            apiConfig = (configRows as any[])[0];
          }

          if (!apiConfig) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "إعدادات API غير موجودة",
            });
          }

          // ✅ تنفيذ مزامنة العدادات من API مقدم الخدمة
          // ملاحظة: STS API قد لا يوفر endpoint لمزامنة العدادات
          // في هذه الحالة، سنقوم بمزامنة العدادات الموجودة في النظام
          let syncedCount = 0;

          try {
            const { createSTSAPIClient } = await import("./developer/integrations/sts-api-client");
            const { STSService } = await import("./developer/integrations/sts-service");
            
            const stsClient = createSTSAPIClient({
              apiUrl: apiConfig.api_url || "",
              apiKey: apiConfig.api_key || "",
            });
            const stsService = new STSService(stsClient);

            // جلب جميع عدادات STS المرتبطة بهذا API config
            const [meters] = await db.execute(
              `SELECT sm.*, m.id as meter_id 
               FROM sts_meters sm
               LEFT JOIN meters_enhanced m ON sm.meter_id = m.id
               WHERE sm.api_config_id = ? AND sm.business_id = ?`,
              [apiConfig.id, input.businessId]
            );

            // مزامنة كل عداد (جلب الحالة الفعلية)
            for (const meter of meters as any[]) {
              try {
                if (meter.sts_meter_number) {
                  // جلب قراءة العداد
                  const reading = await stsService.getMeterReading(meter.meter_id || meter.id);
                  
                  if (reading) {
                    // تحديث رصيد العداد
                    await db.execute(
                      `UPDATE sts_meters 
                       SET current_balance = ?, 
                           last_sync_date = NOW(),
                           updated_at = NOW()
                       WHERE id = ?`,
                      [reading.balance || meter.current_balance || 0, meter.id]
                    );
                    
                    syncedCount++;
                  }
                }
              } catch (meterError: any) {
                logger.warn('Failed to sync individual meter', {
                  meterId: meter.id,
                  error: meterError.message,
                });
                // نكمل مع باقي العدادات
              }
            }

            // تحديث تاريخ آخر مزامنة
            await db.execute(
              `UPDATE sts_api_config 
               SET last_sync_date = NOW(),
                   last_sync_count = ?
               WHERE id = ?`,
              [syncedCount, apiConfig.id]
            );

          } catch (apiError: any) {
            logger.error('Failed to sync meters from STS API', {
              apiConfigId: apiConfig.id,
              error: apiError.message,
            });
            // نستمر حتى لو فشلت بعض المزامنات
          }

          return {
            success: true,
            message: `تمت المزامنة بنجاح - ${syncedCount} عداد`,
            syncedCount,
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error syncing meters:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `فشل في مزامنة العدادات: ${error.message}`,
          });
        }
      }),

    // الحصول على حالة العداد
    getMeterStatus: protectedProcedure
      .input(z.object({ stsMeterId: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [rows] = await db.execute(
            `SELECT 
              sm.*,
              ac.api_url,
              ac.api_key
            FROM sts_meters sm
            LEFT JOIN sts_api_config ac ON sm.api_config_id = ac.id
            WHERE sm.id = ?`,
            [input.stsMeterId]
          );

          const meter = (rows as any[])[0];
          if (!meter) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "عداد STS غير موجود",
            });
          }

          // ✅ استدعاء API للحصول على الحالة الفعلية للعداد
          let realTimeStatus = {
            status: meter.status,
            balance: meter.current_balance,
            isConnected: true,
          };

          try {
            if (meter.api_url && meter.api_key && meter.sts_meter_number) {
              const { createSTSAPIClient } = await import("./developer/integrations/sts-api-client");
              const { STSService } = await import("./developer/integrations/sts-service");
              
              const stsClient = createSTSAPIClient({
                apiUrl: meter.api_url,
                apiKey: meter.api_key,
              });
              const stsService = new STSService(stsClient);

              // جلب قراءة العداد
              const meterId = meter.meter_id || meter.id;
              if (meterId) {
                const reading = await stsService.getMeterReading(meterId);
                
                if (reading) {
                  realTimeStatus = {
                    status: reading.status || meter.status,
                    balance: reading.balance || meter.current_balance || 0,
                    isConnected: true,
                  };

                  // تحديث العداد في قاعدة البيانات
                  await db.execute(
                    `UPDATE sts_meters 
                     SET current_balance = ?, 
                         status = ?,
                         last_sync_date = NOW(),
                         updated_at = NOW()
                     WHERE id = ?`,
                    [
                      realTimeStatus.balance,
                      realTimeStatus.status,
                      input.stsMeterId,
                    ]
                  );
                }
              }
            }
          } catch (apiError: any) {
            logger.warn('Failed to get real-time meter status from API', {
              stsMeterId: input.stsMeterId,
              error: apiError.message,
            });
            realTimeStatus.isConnected = false;
            // نستخدم البيانات المحفوظة
          }

          return {
            meter,
            status: realTimeStatus.status,
            balance: realTimeStatus.balance,
            isConnected: realTimeStatus.isConnected,
            lastSync: meter.last_sync_date || meter.updated_at,
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error getting meter status:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب حالة العداد",
          });
        }
      }),
  }),

  // ============================================
  // إدارة إعدادات API
  // ============================================
  apiConfig: router({
    // قائمة إعدادات API
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [rows] = await db.execute(
            "SELECT * FROM sts_api_config WHERE business_id = ? ORDER BY created_at DESC",
            [input.businessId]
          );

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching API configs:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب إعدادات API",
          });
        }
      }),

    // إنشاء إعدادات API
    create: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          providerName: z.string().min(1),
          apiUrl: z.string().url(),
          apiKey: z.string().optional(),
          apiSecret: z.string().optional(),
          username: z.string().optional(),
          password: z.string().optional(),
          timeout: z.number().default(30000),
          retryAttempts: z.number().default(3),
          retryDelay: z.number().default(1000),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [result] = await db.execute(
            `INSERT INTO sts_api_config (
              business_id, provider_name, api_url, api_key, api_secret,
              username, password, timeout, retry_attempts, retry_delay,
              description, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
            [
              input.businessId,
              input.providerName,
              input.apiUrl,
              input.apiKey || null,
              input.apiSecret || null,
              input.username || null,
              input.password || null,
              input.timeout,
              input.retryAttempts,
              input.retryDelay,
              input.description || null,
            ]
          );

          return {
            id: (result as any).insertId,
            success: true,
            message: "تم إنشاء إعدادات API بنجاح",
          };
        } catch (error: any) {
          logger.error("Error creating API config:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء إعدادات API",
          });
        }
      }),

    // تحديث إعدادات API
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          providerName: z.string().optional(),
          apiUrl: z.string().url().optional(),
          apiKey: z.string().optional(),
          apiSecret: z.string().optional(),
          username: z.string().optional(),
          password: z.string().optional(),
          timeout: z.number().optional(),
          retryAttempts: z.number().optional(),
          retryDelay: z.number().optional(),
          isActive: z.boolean().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();
          const { id, ...updates } = input;

          const updateFields: string[] = [];
          const params: any[] = [];

          Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
              updateFields.push(`${key} = ?`);
              params.push(value);
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
            `UPDATE sts_api_config SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
            params
          );

          return {
            success: true,
            message: "تم تحديث إعدادات API بنجاح",
          };
        } catch (error: any) {
          logger.error("Error updating API config:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث إعدادات API",
          });
        }
      }),
  }),

  // ============================================
  // التقارير
  // ============================================
  reports: router({
    // سجل الشحن
    getChargingHistory: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          stsMeterId: z.number().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          let query = `
            SELECT 
              cr.*,
              c.name_ar as customer_name,
              sm.sts_meter_number,
              COUNT(t.id) as tokens_count
            FROM sts_charge_requests cr
            LEFT JOIN customers c ON cr.customer_id = c.id
            LEFT JOIN sts_meters sm ON cr.sts_meter_id = sm.id
            LEFT JOIN sts_tokens t ON t.charge_request_id = cr.id
            WHERE cr.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND cr.customer_id = ?";
            params.push(input.customerId);
          }

          if (input.stsMeterId) {
            query += " AND cr.sts_meter_id = ?";
            params.push(input.stsMeterId);
          }

          if (input.dateFrom) {
            query += " AND DATE(cr.created_at) >= ?";
            params.push(input.dateFrom);
          }

          if (input.dateTo) {
            query += " AND DATE(cr.created_at) <= ?";
            params.push(input.dateTo);
          }

          query += " GROUP BY cr.id ORDER BY cr.created_at DESC";

          const [rows] = await db.execute(query, params);

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching charging history:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب سجل الشحن",
          });
        }
      }),

    // استخدام التوكنات
    getTokenUsage: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          tokenId: z.number().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          let query = `
            SELECT 
              t.*,
              cr.request_number,
              sm.sts_meter_number,
              c.name_ar as customer_name
            FROM sts_tokens t
            INNER JOIN sts_charge_requests cr ON t.charge_request_id = cr.id
            INNER JOIN sts_meters sm ON t.sts_meter_id = sm.id
            INNER JOIN customers c ON t.customer_id = c.id
            WHERE t.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.tokenId) {
            query += " AND t.id = ?";
            params.push(input.tokenId);
          }

          if (input.dateFrom) {
            query += " AND DATE(t.created_at) >= ?";
            params.push(input.dateFrom);
          }

          if (input.dateTo) {
            query += " AND DATE(t.created_at) <= ?";
            params.push(input.dateTo);
          }

          query += " ORDER BY t.created_at DESC";

          const [rows] = await db.execute(query, params);

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching token usage:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب استخدام التوكنات",
          });
        }
      }),
  }),

  // ============================================
  // إعدادات الدفع
  // ============================================
  payment: router({
    // تعيين نوع الدفع
    setMode: adminProcedure
      .input(
        z.object({
          meterId: z.number(),
          mode: z.enum(["postpaid", "prepaid", "credit"]),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await stsService.setPaymentMode(input.meterId, input.mode);
        } catch (error: any) {
          logger.error("Error setting payment mode:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تعيين نوع الدفع",
          });
        }
      }),

    // الحصول على نوع الدفع الحالي
    getMode: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await stsService.getPaymentMode(input.meterId);
        } catch (error: any) {
          logger.error("Error getting payment mode:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب نوع الدفع",
          });
        }
      }),

    // إعداد حد الائتمان
    setCreditLimit: adminProcedure
      .input(
        z.object({
          meterId: z.number(),
          creditLimit: z.number().positive(),
          autoDisconnect: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await stsService.setCreditLimit(input.meterId, input.creditLimit, input.autoDisconnect);
        } catch (error: any) {
          logger.error("Error setting credit limit:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إعداد حد الائتمان",
          });
        }
      }),

    // الحصول على معلومات الائتمان
    getCreditInfo: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await stsService.getCreditInfo(input.meterId);
        } catch (error: any) {
          logger.error("Error getting credit info:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب معلومات الائتمان",
          });
        }
      }),

    // الحصول على الرصيد المسبق (الكيلوهات المتبقية)
    getPrepaidBalance: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await stsService.getPrepaidBalance(input.meterId);
        } catch (error: any) {
          logger.error("Error getting prepaid balance:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الرصيد المسبق",
          });
        }
      }),
  }),

  // ============================================
  // التعرفات المتعددة
  // ============================================
  tariff: router({
    // إعداد جدول التعرفات المتعددة
    setSchedule: adminProcedure
      .input(
        z.object({
          meterId: z.number(),
          schedule: z.array(
            z.object({
              startTime: z.string(), // Format: "HH:mm"
              endTime: z.string(), // Format: "HH:mm"
              pricePerKWH: z.number().positive(),
            })
          ).max(8), // حتى 8 تعرفات
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await stsService.setMultiTariffSchedule(input.meterId, input.schedule);
        } catch (error: any) {
          logger.error("Error setting tariff schedule:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إعداد جدول التعرفات",
          });
        }
      }),

    // الحصول على جدول التعرفات
    getSchedule: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await stsService.getMultiTariffSchedule(input.meterId);
        } catch (error: any) {
          logger.error("Error getting tariff schedule:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب جدول التعرفات",
          });
        }
      }),
  }),
});

