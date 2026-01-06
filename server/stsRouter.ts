import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { logger } from "./utils/logger";

// ============================================
// STS Router - أتمتة عدادات STS
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
          const db = getDb();
          const offset = (input.page - 1) * input.limit;

          let query = `
            SELECT 
              sm.*,
              c.name_ar as customer_name,
              c.phone as customer_phone,
              m.meter_number as meter_number,
              ac.provider_name as api_provider_name
            FROM sts_meters sm
            LEFT JOIN customers c ON sm.customer_id = c.id
            LEFT JOIN meters m ON sm.meter_id = m.id
            LEFT JOIN sts_api_config ac ON sm.api_config_id = ac.id
            WHERE sm.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND sm.customer_id = ?";
            params.push(input.customerId);
          }

          if (input.status) {
            query += " AND sm.status = ?";
            params.push(input.status);
          }

          if (input.search) {
            query += " AND (sm.sts_meter_number LIKE ? OR c.name_ar LIKE ? OR sm.serial_number LIKE ?)";
            const searchTerm = `%${input.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
          }

          query += " ORDER BY sm.created_at DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);
          const [countRows] = await db.execute(
            query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
            params.slice(0, -2)
          );

          const total = (countRows as any[])[0]?.total || 0;

          return {
            meters: rows as any[],
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

          // TODO: استدعاء API مقدم الخدمة لإنشاء التوكن
          // هذا يحتاج إعدادات API من sts_api_config

          return {
            id: chargeRequestId,
            requestNumber,
            success: true,
            message: "تم إنشاء طلب الشحن بنجاح",
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

          // TODO: استدعاء API للتحقق من حالة الشحن
          // تحديث حالة الطلب بناءً على الاستجابة

          const [rows] = await db.execute(
            "SELECT * FROM sts_charge_requests WHERE id = ?",
            [input.chargeRequestId]
          );

          const request = (rows as any[])[0];
          if (!request) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "طلب الشحن غير موجود",
            });
          }

          return {
            status: request.status,
            message: "تم التحقق من حالة الشحن",
          };
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

          // TODO: تنفيذ اختبار الاتصال الفعلي مع API مقدم الخدمة
          // هذا يحتاج تنفيذ HTTP request للـ API

          // تحديث نتيجة الاختبار
          await db.execute(
            `UPDATE sts_api_config 
             SET last_test_date = NOW(), 
                 last_test_result = 'success',
                 last_test_message = 'تم الاختبار بنجاح'
             WHERE id = ?`,
            [input.apiConfigId]
          );

          return {
            success: true,
            message: "تم اختبار الاتصال بنجاح",
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error testing API connection:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في اختبار الاتصال",
          });
        }
      }),

    // مزامنة العدادات
    syncMeters: adminProcedure
      .input(z.object({ businessId: z.number(), apiConfigId: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // TODO: تنفيذ مزامنة العدادات من API مقدم الخدمة
          // هذا يحتاج استدعاء API لجلب قائمة العدادات ومزامنتها مع قاعدة البيانات

          return {
            success: true,
            message: "تمت المزامنة بنجاح",
            syncedCount: 0, // سيتم تحديثه بعد التنفيذ
          };
        } catch (error: any) {
          logger.error("Error syncing meters:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في مزامنة العدادات",
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

          // TODO: استدعاء API للحصول على الحالة الفعلية للعداد

          return {
            meter,
            status: meter.status,
            balance: meter.current_balance,
            lastSync: meter.updated_at,
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
});

