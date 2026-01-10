import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { logger } from "./utils/logger";

// ============================================
// Government Support Router - إدارة الدعم الحكومي
// ============================================

export const governmentSupportRouter = router({
  // ============================================
  // إدارة بيانات الدعم للمشتركين
  // ============================================
  customers: router({
    // قائمة العملاء المدعومين
    list: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          status: z.enum(["active", "suspended", "expired", "cancelled"]).optional(),
          supportCategory: z.string().optional(),
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
              gsc.*,
              c.name_ar as customer_name,
              c.phone as customer_phone,
              c.account_number
            FROM government_support_customers gsc
            LEFT JOIN customers c ON gsc.customer_id = c.id
            WHERE gsc.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND gsc.customer_id = ?";
            params.push(input.customerId);
          }

          if (input.status) {
            query += " AND gsc.status = ?";
            params.push(input.status);
          }

          if (input.supportCategory) {
            query += " AND gsc.support_category = ?";
            params.push(input.supportCategory);
          }

          if (input.search) {
            query += " AND (c.name_ar LIKE ? OR c.account_number LIKE ? OR gsc.approval_number LIKE ?)";
            const searchTerm = `%${input.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
          }

          query += " ORDER BY gsc.created_at DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);
          const [countRows] = await db.execute(
            query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
            params.slice(0, -2)
          );

          const total = (countRows as any[])[0]?.total || 0;

          return {
            customers: rows as any[],
            total,
            page: input.page,
            limit: input.limit,
          };
        } catch (error: any) {
          logger.error("Error fetching support customers:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب العملاء المدعومين",
          });
        }
      }),

    // تحديث بيانات الدعم
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          supportType: z.enum(["electricity", "water", "gas", "mixed"]).optional(),
          supportCategory: z.enum(["low_income", "disabled", "elderly", "widow", "orphan", "other"]).optional(),
          supportPercentage: z.number().optional(),
          maxSupportAmount: z.number().optional(),
          monthlyQuota: z.number().optional(),
          status: z.enum(["active", "suspended", "expired", "cancelled"]).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
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
            `UPDATE government_support_customers SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
            params
          );

          return {
            success: true,
            message: "تم تحديث بيانات الدعم بنجاح",
          };
        } catch (error: any) {
          logger.error("Error updating support customer:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث بيانات الدعم",
          });
        }
      }),

    // الحصول على الحصة
    getQuota: protectedProcedure
      .input(z.object({ customerId: z.number(), year: z.number(), month: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [rows] = await db.execute(
            `SELECT 
              gsc.*,
              gsc.monthly_quota as quota,
              gsc.remaining_quota as remaining
            FROM government_support_customers gsc
            WHERE gsc.customer_id = ? AND gsc.status = 'active'`,
            [input.customerId]
          );

          const support = (rows as any[])[0];
          if (!support) {
            return {
              hasSupport: false,
              quota: 0,
              remaining: 0,
            };
          }

          // حساب الحصة المستخدمة في الشهر المحدد
          const [consumptionRows] = await db.execute(
            `SELECT 
              COALESCE(SUM(supported_consumption), 0) as used
            FROM government_support_consumption
            WHERE customer_id = ? AND year = ? AND month = ?`,
            [input.customerId, input.year, input.month]
          );

          const used = (consumptionRows as any[])[0]?.used || 0;
          const quota = parseFloat(support.monthly_quota || 0);
          const remaining = Math.max(0, quota - used);

          return {
            hasSupport: true,
            quota,
            used,
            remaining,
            supportPercentage: parseFloat(support.support_percentage || 0),
            maxSupportAmount: parseFloat(support.max_support_amount || 0),
          };
        } catch (error: any) {
          logger.error("Error getting quota:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الحصة",
          });
        }
      }),
  }),

  // ============================================
  // إدارة الحصص
  // ============================================
  quotas: router({
    // قائمة الحصص
    list: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          year: z.number().optional(),
          month: z.number().optional(),
          quotaType: z.enum(["national", "regional", "category", "individual"]).optional(),
          status: z.enum(["draft", "active", "closed", "cancelled"]).optional(),
          page: z.number().default(1),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();
          const offset = (input.page - 1) * input.limit;

          let query = `
            SELECT * FROM government_support_quotas
            WHERE business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.year) {
            query += " AND year = ?";
            params.push(input.year);
          }

          if (input.month) {
            query += " AND month = ?";
            params.push(input.month);
          }

          if (input.quotaType) {
            query += " AND quota_type = ?";
            params.push(input.quotaType);
          }

          if (input.status) {
            query += " AND status = ?";
            params.push(input.status);
          }

          query += " ORDER BY year DESC, month DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);
          const [countRows] = await db.execute(
            query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
            params.slice(0, -2)
          );

          const total = (countRows as any[])[0]?.total || 0;

          return {
            quotas: rows as any[],
            total,
            page: input.page,
            limit: input.limit,
          };
        } catch (error: any) {
          logger.error("Error fetching quotas:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الحصص",
          });
        }
      }),

    // إنشاء حصة جديدة
    create: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          year: z.number(),
          month: z.number(),
          quotaType: z.enum(["national", "regional", "category", "individual"]),
          category: z.string().optional(),
          region: z.string().optional(),
          totalQuota: z.number().positive(),
          totalBudget: z.number().positive(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          // التحقق من عدم تكرار الحصة لنفس الفترة
          const [existing] = await db.execute(
            `SELECT id FROM government_support_quotas 
             WHERE business_id = ? AND year = ? AND month = ? AND quota_type = ?`,
            [input.businessId, input.year, input.month, input.quotaType]
          );

          if ((existing as any[]).length > 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "الحصة موجودة مسبقاً لهذه الفترة",
            });
          }

          const [result] = await db.execute(
            `INSERT INTO government_support_quotas (
              business_id, year, month, quota_type, category, region,
              total_quota, allocated_quota, used_quota, remaining_quota,
              total_budget, allocated_budget, used_budget, remaining_budget,
              status, created_by, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 0, 0, ?, 'draft', ?, ?)`,
            [
              input.businessId,
              input.year,
              input.month,
              input.quotaType,
              input.category || null,
              input.region || null,
              input.totalQuota,
              input.totalQuota, // remaining_quota = total_quota initially
              input.totalBudget,
              input.totalBudget, // remaining_budget = total_budget initially
              ctx.user.id,
              input.description || null,
            ]
          );

          return {
            id: (result as any).insertId,
            success: true,
            message: "تم إنشاء الحصة بنجاح",
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error creating quota:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء الحصة",
          });
        }
      }),

    // حساب الحصص الشهرية
    calculateMonthly: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          year: z.number(),
          month: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          // ✅ تنفيذ منطق حساب الحصص الشهرية
          let calculatedCount = 0;

          try {
            // 1. جلب جميع العملاء المدعومين النشطين
            const [supportedCustomers] = await db.execute(
              `SELECT * FROM government_support_customers 
               WHERE business_id = ? AND is_active = true AND is_supported = true`,
              [input.businessId]
            );
            
            const customers = supportedCustomers as any[];

            // 2. حساب الاستهلاك لكل عميل
            for (const customer of customers) {
              try {
                // جلب استهلاك العميل للشهر المحدد
                const [consumption] = await db.execute(
                  `SELECT SUM(total_consumption) as total 
                   FROM government_support_consumption 
                   WHERE business_id = ? AND customer_id = ? 
                   AND YEAR(consumption_date) = ? AND MONTH(consumption_date) = ?`,
                  [input.businessId, customer.customer_id, input.year, input.month]
                );

                const totalConsumption = parseFloat((consumption as any[])[0]?.total || "0");

                // 3. توزيع الحصص حسب الفئات
                const quota = parseFloat(customer.monthly_quota || "0");
                const supportedConsumption = Math.min(totalConsumption, quota);
                const unsupportedConsumption = Math.max(0, totalConsumption - quota);

                // 4. تحديث الحصص المخصصة والمستخدمة
                await db.execute(
                  `UPDATE government_support_customers 
                   SET quota_used = ?, remaining_quota = ?, updated_at = NOW() 
                   WHERE id = ?`,
                  [supportedConsumption, Math.max(0, quota - supportedConsumption), customer.id]
                );

                calculatedCount++;
              } catch (customerError: any) {
                logger.error('Failed to calculate quota for customer', {
                  customerId: customer.customer_id,
                  error: customerError.message,
                });
              }
            }

            return {
              success: true,
              message: "تم حساب الحصص الشهرية بنجاح",
              calculatedCount,
            };
          } catch (error: any) {
            logger.error('Failed to calculate monthly quotas', {
              error: error.message,
              businessId: input.businessId,
            });
            throw error;
          }
        } catch (error: any) {
          logger.error("Error calculating monthly quotas:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في حساب الحصص الشهرية",
          });
        }
      }),
  }),

  // ============================================
  // تتبع الاستهلاك
  // ============================================
  consumption: router({
    // تتبع استهلاك الدعم
    track: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number(),
          invoiceId: z.number().optional(),
          year: z.number(),
          month: z.number(),
          totalConsumption: z.number().positive(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = getDb();

          // جلب بيانات الدعم للعميل
          const [supportRows] = await db.execute(
            `SELECT * FROM government_support_customers 
             WHERE customer_id = ? AND status = 'active'`,
            [input.customerId]
          );

          const support = (supportRows as any[])[0];
          if (!support) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "العميل غير مسجل في نظام الدعم",
            });
          }

          // حساب الاستهلاك المدعوم وغير المدعوم
          const quota = parseFloat(support.monthly_quota || 0);
          const supportedConsumption = Math.min(input.totalConsumption, quota);
          const unsupportedConsumption = Math.max(0, input.totalConsumption - quota);

          // حساب مبلغ الدعم
          const supportPercentage = parseFloat(support.support_percentage || 0);
          const supportAmount = (supportedConsumption * supportPercentage) / 100;
          const maxSupport = parseFloat(support.max_support_amount || 0);
          const finalSupportAmount = maxSupport > 0 ? Math.min(supportAmount, maxSupport) : supportAmount;

          // حفظ تتبع الاستهلاك
          const [result] = await db.execute(
            `INSERT INTO government_support_consumption (
              business_id, customer_id, support_customer_id, invoice_id,
              year, month, total_consumption, supported_consumption, unsupported_consumption,
              total_amount, support_amount, customer_amount, quota_used, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'calculated')`,
            [
              input.businessId,
              input.customerId,
              support.id,
              input.invoiceId || null,
              input.year,
              input.month,
              input.totalConsumption,
              supportedConsumption,
              unsupportedConsumption,
              0, // total_amount - سيتم حسابه لاحقاً
              finalSupportAmount,
              0, // customer_amount - سيتم حسابه لاحقاً
              supportedConsumption,
            ]
          );

          // تحديث بيانات الدعم للعميل
          await db.execute(
            `UPDATE government_support_customers 
             SET total_consumption = total_consumption + ?,
                 supported_consumption = supported_consumption + ?,
                 unsupported_consumption = unsupported_consumption + ?,
                 total_support_amount = total_support_amount + ?,
                 remaining_quota = remaining_quota - ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [
              input.totalConsumption,
              supportedConsumption,
              unsupportedConsumption,
              finalSupportAmount,
              supportedConsumption,
              support.id,
            ]
          );

          return {
            id: (result as any).insertId,
            success: true,
            message: "تم تتبع الاستهلاك بنجاح",
            supportedConsumption,
            supportAmount: finalSupportAmount,
          };
        } catch (error: any) {
          if (error instanceof TRPCError) throw error;
          logger.error("Error tracking consumption:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تتبع الاستهلاك",
          });
        }
      }),

    // الحصول على سجل الاستهلاك
    getHistory: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          customerId: z.number().optional(),
          year: z.number().optional(),
          month: z.number().optional(),
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
              gsc.*,
              c.name_ar as customer_name,
              c.account_number
            FROM government_support_consumption gsc
            LEFT JOIN customers c ON gsc.customer_id = c.id
            WHERE gsc.business_id = ?
          `;

          const params: any[] = [input.businessId];

          if (input.customerId) {
            query += " AND gsc.customer_id = ?";
            params.push(input.customerId);
          }

          if (input.year) {
            query += " AND gsc.year = ?";
            params.push(input.year);
          }

          if (input.month) {
            query += " AND gsc.month = ?";
            params.push(input.month);
          }

          query += " ORDER BY gsc.year DESC, gsc.month DESC, gsc.created_at DESC LIMIT ? OFFSET ?";
          params.push(input.limit, offset);

          const [rows] = await db.execute(query, params);

          return rows as any[];
        } catch (error: any) {
          logger.error("Error fetching consumption history:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب سجل الاستهلاك",
          });
        }
      }),

    // الحصول على الحصة المتبقية
    getRemaining: protectedProcedure
      .input(z.object({ customerId: z.number(), year: z.number(), month: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [rows] = await db.execute(
            `SELECT 
              gsc.monthly_quota,
              gsc.remaining_quota,
              COALESCE(SUM(gsc2.supported_consumption), 0) as used_this_month
            FROM government_support_customers gsc
            LEFT JOIN government_support_consumption gsc2 
              ON gsc.customer_id = gsc2.customer_id 
              AND gsc2.year = ? AND gsc2.month = ?
            WHERE gsc.customer_id = ? AND gsc.status = 'active'
            GROUP BY gsc.id`,
            [input.year, input.month, input.customerId]
          );

          const data = (rows as any[])[0];
          if (!data) {
            return {
              hasSupport: false,
              quota: 0,
              used: 0,
              remaining: 0,
            };
          }

          const quota = parseFloat(data.monthly_quota || 0);
          const used = parseFloat(data.used_this_month || 0);
          const remaining = Math.max(0, quota - used);

          return {
            hasSupport: true,
            quota,
            used,
            remaining,
          };
        } catch (error: any) {
          logger.error("Error getting remaining quota:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الحصة المتبقية",
          });
        }
      }),
  }),

  // ============================================
  // التقارير
  // ============================================
  reports: router({
    // تقرير شهري
    getMonthlyReport: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          year: z.number(),
          month: z.number(),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          const [rows] = await db.execute(
            `SELECT 
              COUNT(DISTINCT gsc.customer_id) as total_customers,
              COUNT(DISTINCT CASE WHEN gsc.status = 'active' THEN gsc.customer_id END) as active_customers,
              COALESCE(SUM(gsc2.total_consumption), 0) as total_consumption,
              COALESCE(SUM(gsc2.supported_consumption), 0) as supported_consumption,
              COALESCE(SUM(gsc2.support_amount), 0) as total_support_amount
            FROM government_support_customers gsc
            LEFT JOIN government_support_consumption gsc2 
              ON gsc.customer_id = gsc2.customer_id 
              AND gsc2.year = ? AND gsc2.month = ?
            WHERE gsc.business_id = ?`,
            [input.year, input.month, input.businessId]
          );

          return (rows as any[])[0] || {};
        } catch (error: any) {
          logger.error("Error generating monthly report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في توليد التقرير الشهري",
          });
        }
      }),

    // تقرير صندوق الدعم
    getFundReport: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const db = getDb();

          // ✅ تنفيذ تقرير صندوق الدعم الكامل
          try {
            // 1. إجمالي الميزانية المخصصة
            const [totalBudgetResult] = await db.execute(
              `SELECT COALESCE(SUM(total_quota), 0) as total 
               FROM government_support_quotas 
               WHERE business_id = ? AND year = ? AND month BETWEEN ? AND ?`,
              [
                input.businessId,
                new Date(input.startDate).getFullYear(),
                new Date(input.startDate).getMonth() + 1,
                new Date(input.endDate).getMonth() + 1,
              ]
            );
            const totalBudget = parseFloat((totalBudgetResult as any[])[0]?.total || "0");

            // 2. إجمالي المبلغ المستخدم
            const [usedBudgetResult] = await db.execute(
              `SELECT COALESCE(SUM(support_amount), 0) as total 
               FROM government_support_consumption 
               WHERE business_id = ? AND consumption_date BETWEEN ? AND ?`,
              [input.businessId, input.startDate, input.endDate]
            );
            const usedBudget = parseFloat((usedBudgetResult as any[])[0]?.total || "0");

            // 3. المبلغ المتبقي
            const remainingBudget = Math.max(0, totalBudget - usedBudget);

            // 4. التوزيع حسب الفئات
            const [categoryDistribution] = await db.execute(
              `SELECT 
                 gsc.category,
                 COUNT(*) as customer_count,
                 SUM(gsc.monthly_quota) as allocated,
                 SUM(gsc.quota_used) as used
               FROM government_support_customers gsc
               WHERE gsc.business_id = ? AND gsc.is_active = true
               GROUP BY gsc.category`,
              [input.businessId]
            );

            // 5. التوزيع حسب المناطق (إذا كان متوفراً)
            const [regionDistribution] = await db.execute(
              `SELECT 
                 gsq.region,
                 SUM(gsq.total_quota) as allocated,
                 SUM(gsq.used_quota) as used
               FROM government_support_quotas gsq
               WHERE gsq.business_id = ? AND gsq.region IS NOT NULL
               GROUP BY gsq.region`,
              [input.businessId]
            );

            const utilization = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

            return {
              totalBudget,
              usedBudget,
              remainingBudget,
              utilization: Math.round(utilization * 100) / 100,
              categoryDistribution: categoryDistribution as any[],
              regionDistribution: regionDistribution as any[],
            };
          } catch (error: any) {
            logger.error('Failed to generate fund report', {
              error: error.message,
              businessId: input.businessId,
            });
            throw error;
          }
        } catch (error: any) {
          logger.error("Error generating fund report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في توليد تقرير الصندوق",
          });
        }
      }),
  }),
});

