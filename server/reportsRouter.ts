/**
 * Reports Router
 * Router للتقارير المتقدمة
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { logger } from "./utils/logger";
import { sql } from "drizzle-orm";

export const reportsRouter = router({
  // ============================================
  // تقارير الأداء
  // ============================================
  performance: router({
    // تقرير الأداء اليومي
    daily: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        date: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax
          const result = await db.execute(sql`
            SELECT 
              COUNT(DISTINCT c.id)::integer as total_customers,
              COUNT(DISTINCT m.id)::integer as total_meters,
              COUNT(DISTINCT mr.id)::integer as readings_taken,
              COUNT(DISTINCT i.id)::integer as invoices_generated,
              COALESCE(SUM(i.total_amount::numeric), 0)::numeric as total_revenue,
              COUNT(DISTINCT p.id)::integer as payments_received,
              COALESCE(SUM(p.amount::numeric), 0)::numeric as total_collected,
              COUNT(DISTINCT wo.id)::integer as work_orders_completed
            FROM businesses b
            LEFT JOIN customers_enhanced c ON c.business_id = b.id
            LEFT JOIN meters_enhanced m ON m.business_id = b.id
            LEFT JOIN meter_readings_enhanced mr ON mr.reading_date::date = ${input.date}::date
            LEFT JOIN invoices_enhanced i ON i.invoice_date::date = ${input.date}::date
            LEFT JOIN payments_enhanced p ON p.payment_date::date = ${input.date}::date
            LEFT JOIN work_orders wo ON wo.completed_at::date = ${input.date}::date AND wo.status = 'completed'
            WHERE b.id = ${input.businessId}
          `);
          
          return (result.rows || [])[0] || {};
        } catch (error: any) {
          logger.error("Error generating daily performance report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير الأداء اليومي",
          });
        }
      }),
    
    // تقرير الأداء الشهري
    monthly: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        year: z.number(),
        month: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax مع EXTRACT
          const result = await db.execute(sql`
            SELECT 
              COUNT(DISTINCT c.id)::integer as total_customers,
              COUNT(DISTINCT c.id) FILTER (WHERE c.is_active = TRUE)::integer as active_customers,
              COUNT(DISTINCT m.id)::integer as total_meters,
              COUNT(DISTINCT mr.id)::integer as total_readings,
              COUNT(DISTINCT i.id)::integer as total_invoices,
              COALESCE(SUM(i.total_amount::numeric), 0)::numeric as total_billed,
              COUNT(DISTINCT p.id)::integer as total_payments,
              COALESCE(SUM(p.amount::numeric), 0)::numeric as total_collected,
              COUNT(DISTINCT wo.id)::integer as total_work_orders,
              COUNT(DISTINCT wo.id) FILTER (WHERE wo.status = 'completed')::integer as completed_work_orders
            FROM businesses b
            LEFT JOIN customers_enhanced c ON c.business_id = b.id
            LEFT JOIN meters_enhanced m ON m.business_id = b.id
            LEFT JOIN meter_readings_enhanced mr ON EXTRACT(YEAR FROM mr.reading_date) = ${input.year} AND EXTRACT(MONTH FROM mr.reading_date) = ${input.month}
            LEFT JOIN invoices_enhanced i ON EXTRACT(YEAR FROM i.invoice_date) = ${input.year} AND EXTRACT(MONTH FROM i.invoice_date) = ${input.month}
            LEFT JOIN payments_enhanced p ON EXTRACT(YEAR FROM p.payment_date) = ${input.year} AND EXTRACT(MONTH FROM p.payment_date) = ${input.month}
            LEFT JOIN work_orders wo ON EXTRACT(YEAR FROM wo.created_at) = ${input.year} AND EXTRACT(MONTH FROM wo.created_at) = ${input.month}
            WHERE b.id = ${input.businessId}
          `);
          
          return (result.rows || [])[0] || {};
        } catch (error: any) {
          logger.error("Error generating monthly performance report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير الأداء الشهري",
          });
        }
      }),
  }),
  
  // ============================================
  // تقارير الإيرادات
  // ============================================
  revenue: router({
    // تقرير الإيرادات التفصيلي
    detailed: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        groupBy: z.enum(["day", "month", "customer", "service_type"]).default("month"),
      }))
      .query(async ({ input }) => {
        try {
          const db = getDb();
          
          let groupByClause = "";
          let selectClause = "";
          
          // ✅ استخدام PostgreSQL syntax
          let query;
          switch (input.groupBy) {
            case "day":
              query = sql`
                SELECT 
                  i.invoice_date::date as period,
                  COUNT(i.id)::integer as invoice_count,
                  COALESCE(SUM(i.subtotal::numeric), 0)::numeric as subtotal,
                  COALESCE(SUM(i.vat_amount::numeric), 0)::numeric as vat_amount,
                  COALESCE(SUM(i.total_amount::numeric), 0)::numeric as total_amount,
                  COALESCE(SUM(p.amount::numeric), 0)::numeric as collected,
                  (COALESCE(SUM(i.total_amount::numeric), 0) - COALESCE(SUM(p.amount::numeric), 0))::numeric as outstanding
                FROM invoices_enhanced i
                LEFT JOIN customers_enhanced c ON i.customer_id = c.id
                LEFT JOIN meters_enhanced m ON i.meter_id = m.id
                LEFT JOIN payments_enhanced p ON p.invoice_id = i.id
                WHERE i.business_id = ${input.businessId}
                  AND i.invoice_date::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                GROUP BY i.invoice_date::date
                ORDER BY period DESC
              `;
              break;
            case "month":
              query = sql`
                SELECT 
                  TO_CHAR(i.invoice_date, 'YYYY-MM') as period,
                  COUNT(i.id)::integer as invoice_count,
                  COALESCE(SUM(i.subtotal::numeric), 0)::numeric as subtotal,
                  COALESCE(SUM(i.vat_amount::numeric), 0)::numeric as vat_amount,
                  COALESCE(SUM(i.total_amount::numeric), 0)::numeric as total_amount,
                  COALESCE(SUM(p.amount::numeric), 0)::numeric as collected,
                  (COALESCE(SUM(i.total_amount::numeric), 0) - COALESCE(SUM(p.amount::numeric), 0))::numeric as outstanding
                FROM invoices_enhanced i
                LEFT JOIN customers_enhanced c ON i.customer_id = c.id
                LEFT JOIN meters_enhanced m ON i.meter_id = m.id
                LEFT JOIN payments_enhanced p ON p.invoice_id = i.id
                WHERE i.business_id = ${input.businessId}
                  AND i.invoice_date::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                GROUP BY TO_CHAR(i.invoice_date, 'YYYY-MM')
                ORDER BY period DESC
              `;
              break;
            case "customer":
              query = sql`
                SELECT 
                  c.id as customer_id,
                  c.full_name as customer_name,
                  COUNT(i.id)::integer as invoice_count,
                  COALESCE(SUM(i.subtotal::numeric), 0)::numeric as subtotal,
                  COALESCE(SUM(i.vat_amount::numeric), 0)::numeric as vat_amount,
                  COALESCE(SUM(i.total_amount::numeric), 0)::numeric as total_amount,
                  COALESCE(SUM(p.amount::numeric), 0)::numeric as collected,
                  (COALESCE(SUM(i.total_amount::numeric), 0) - COALESCE(SUM(p.amount::numeric), 0))::numeric as outstanding
                FROM invoices_enhanced i
                LEFT JOIN customers_enhanced c ON i.customer_id = c.id
                LEFT JOIN meters_enhanced m ON i.meter_id = m.id
                LEFT JOIN payments_enhanced p ON p.invoice_id = i.id
                WHERE i.business_id = ${input.businessId}
                  AND i.invoice_date::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                GROUP BY c.id, c.full_name
                ORDER BY total_amount DESC
              `;
              break;
            case "service_type":
              query = sql`
                SELECT 
                  m.service_type,
                  COUNT(i.id)::integer as invoice_count,
                  COALESCE(SUM(i.subtotal::numeric), 0)::numeric as subtotal,
                  COALESCE(SUM(i.vat_amount::numeric), 0)::numeric as vat_amount,
                  COALESCE(SUM(i.total_amount::numeric), 0)::numeric as total_amount,
                  COALESCE(SUM(p.amount::numeric), 0)::numeric as collected,
                  (COALESCE(SUM(i.total_amount::numeric), 0) - COALESCE(SUM(p.amount::numeric), 0))::numeric as outstanding
                FROM invoices_enhanced i
                LEFT JOIN customers_enhanced c ON i.customer_id = c.id
                LEFT JOIN meters_enhanced m ON i.meter_id = m.id
                LEFT JOIN payments_enhanced p ON p.invoice_id = i.id
                WHERE i.business_id = ${input.businessId}
                  AND i.invoice_date::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                GROUP BY m.service_type
                ORDER BY total_amount DESC
              `;
              break;
          }
          
          const result = await db.execute(query);
          return (result.rows || []) as any[];
        } catch (error: any) {
          logger.error("Error generating revenue report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير الإيرادات",
          });
        }
      }),
    
    // تقرير الإيرادات مقابل التكاليف
    profitLoss: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax
          const result = await db.execute(sql`
            SELECT 
              -- الإيرادات
              COALESCE(SUM(CASE WHEN a.nature = 'credit' THEN jel.credit::numeric ELSE 0 END), 0)::numeric as total_revenue,
              -- المصروفات
              COALESCE(SUM(CASE WHEN a.nature = 'debit' AND a.account_type IN ('expense', 'cost') THEN jel.debit::numeric ELSE 0 END), 0)::numeric as total_expenses,
              -- صافي الربح
              (COALESCE(SUM(CASE WHEN a.nature = 'credit' THEN jel.credit::numeric ELSE 0 END), 0)::numeric -
               COALESCE(SUM(CASE WHEN a.nature = 'debit' AND a.account_type IN ('expense', 'cost') THEN jel.debit::numeric ELSE 0 END), 0)::numeric)::numeric as net_profit
            FROM journal_entry_lines jel
            JOIN journal_entries je ON jel.entry_id = je.id
            JOIN accounts a ON jel.account_id = a.id
            WHERE je.business_id = ${input.businessId}
              AND je.entry_date::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
              AND je.status = 'posted'
          `);
          
          return (result.rows || [])[0] || {};
        } catch (error: any) {
          logger.error("Error generating profit/loss report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير الأرباح والخسائر",
          });
        }
      }),
  }),
  
  // ============================================
  // تقارير المخزون
  // ============================================
  inventory: router({
    // تقرير حالة المخزون
    stockStatus: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        warehouseId: z.number().optional(),
        categoryId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax
          let query: any;
          if (input.warehouseId && input.categoryId) {
            query = sql`
              SELECT 
                i.id, i.code, i.name_ar, i.name_en,
                ic.name_ar as category_name,
                w.name_ar as warehouse_name,
                sb.quantity_on_hand::numeric,
                sb.quantity_reserved::numeric,
                sb.quantity_available::numeric,
                i.min_stock_level::numeric,
                i.max_stock_level::numeric,
                i.unit_cost::numeric,
                (sb.quantity_on_hand::numeric * i.unit_cost::numeric)::numeric as stock_value,
                CASE
                  WHEN sb.quantity_available::numeric <= i.min_stock_level::numeric THEN 'low'
                  WHEN sb.quantity_available::numeric >= i.max_stock_level::numeric THEN 'high'
                  ELSE 'normal'
                END as stock_status
              FROM items i
              LEFT JOIN item_categories ic ON i.category_id = ic.id
              LEFT JOIN stock_balances sb ON i.id = sb.item_id
              LEFT JOIN warehouses w ON sb.warehouse_id = w.id
              WHERE i.business_id = ${input.businessId}
                AND sb.warehouse_id = ${input.warehouseId}
                AND i.category_id = ${input.categoryId}
              ORDER BY i.code
            `;
          } else if (input.warehouseId) {
            query = sql`
              SELECT 
                i.id, i.code, i.name_ar, i.name_en,
                ic.name_ar as category_name,
                w.name_ar as warehouse_name,
                sb.quantity_on_hand::numeric,
                sb.quantity_reserved::numeric,
                sb.quantity_available::numeric,
                i.min_stock_level::numeric,
                i.max_stock_level::numeric,
                i.unit_cost::numeric,
                (sb.quantity_on_hand::numeric * i.unit_cost::numeric)::numeric as stock_value,
                CASE
                  WHEN sb.quantity_available::numeric <= i.min_stock_level::numeric THEN 'low'
                  WHEN sb.quantity_available::numeric >= i.max_stock_level::numeric THEN 'high'
                  ELSE 'normal'
                END as stock_status
              FROM items i
              LEFT JOIN item_categories ic ON i.category_id = ic.id
              LEFT JOIN stock_balances sb ON i.id = sb.item_id
              LEFT JOIN warehouses w ON sb.warehouse_id = w.id
              WHERE i.business_id = ${input.businessId}
                AND sb.warehouse_id = ${input.warehouseId}
              ORDER BY i.code
            `;
          } else if (input.categoryId) {
            query = sql`
              SELECT 
                i.id, i.code, i.name_ar, i.name_en,
                ic.name_ar as category_name,
                w.name_ar as warehouse_name,
                sb.quantity_on_hand::numeric,
                sb.quantity_reserved::numeric,
                sb.quantity_available::numeric,
                i.min_stock_level::numeric,
                i.max_stock_level::numeric,
                i.unit_cost::numeric,
                (sb.quantity_on_hand::numeric * i.unit_cost::numeric)::numeric as stock_value,
                CASE
                  WHEN sb.quantity_available::numeric <= i.min_stock_level::numeric THEN 'low'
                  WHEN sb.quantity_available::numeric >= i.max_stock_level::numeric THEN 'high'
                  ELSE 'normal'
                END as stock_status
              FROM items i
              LEFT JOIN item_categories ic ON i.category_id = ic.id
              LEFT JOIN stock_balances sb ON i.id = sb.item_id
              LEFT JOIN warehouses w ON sb.warehouse_id = w.id
              WHERE i.business_id = ${input.businessId}
                AND i.category_id = ${input.categoryId}
              ORDER BY i.code
            `;
          } else {
            query = sql`
              SELECT 
                i.id, i.code, i.name_ar, i.name_en,
                ic.name_ar as category_name,
                w.name_ar as warehouse_name,
                sb.quantity_on_hand::numeric,
                sb.quantity_reserved::numeric,
                sb.quantity_available::numeric,
                i.min_stock_level::numeric,
                i.max_stock_level::numeric,
                i.unit_cost::numeric,
                (sb.quantity_on_hand::numeric * i.unit_cost::numeric)::numeric as stock_value,
                CASE
                  WHEN sb.quantity_available::numeric <= i.min_stock_level::numeric THEN 'low'
                  WHEN sb.quantity_available::numeric >= i.max_stock_level::numeric THEN 'high'
                  ELSE 'normal'
                END as stock_status
              FROM items i
              LEFT JOIN item_categories ic ON i.category_id = ic.id
              LEFT JOIN stock_balances sb ON i.id = sb.item_id
              LEFT JOIN warehouses w ON sb.warehouse_id = w.id
              WHERE i.business_id = ${input.businessId}
              ORDER BY i.code
            `;
          }
          
          const result = await db.execute(query);
          return (result.rows || []) as any[];
        } catch (error: any) {
          logger.error("Error generating stock status report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير حالة المخزون",
          });
        }
      }),
    
    // تقرير حركات المخزون
    movements: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        movementType: z.enum(["in", "out", "transfer", "adjustment"]).optional(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax
          let query: any;
          if (input.movementType) {
            query = sql`
              SELECT 
                sm.id, sm.movement_date, sm.movement_type,
                sm.quantity::numeric, sm.reference_number,
                i.name_ar as item_name,
                fw.name_ar as from_warehouse,
                tw.name_ar as to_warehouse,
                u.name_ar as created_by_name
              FROM stock_movements sm
              JOIN items i ON sm.item_id = i.id
              LEFT JOIN warehouses fw ON sm.from_warehouse_id = fw.id
              LEFT JOIN warehouses tw ON sm.to_warehouse_id = tw.id
              LEFT JOIN users u ON sm.created_by = u.id
              WHERE sm.business_id = ${input.businessId}
                AND sm.movement_date::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                AND sm.movement_type = ${input.movementType}
              ORDER BY sm.movement_date DESC
            `;
          } else {
            query = sql`
              SELECT 
                sm.id, sm.movement_date, sm.movement_type,
                sm.quantity::numeric, sm.reference_number,
                i.name_ar as item_name,
                fw.name_ar as from_warehouse,
                tw.name_ar as to_warehouse,
                u.name_ar as created_by_name
              FROM stock_movements sm
              JOIN items i ON sm.item_id = i.id
              LEFT JOIN warehouses fw ON sm.from_warehouse_id = fw.id
              LEFT JOIN warehouses tw ON sm.to_warehouse_id = tw.id
              LEFT JOIN users u ON sm.created_by = u.id
              WHERE sm.business_id = ${input.businessId}
                AND sm.movement_date::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
              ORDER BY sm.movement_date DESC
            `;
          }
          
          const result = await db.execute(query);
          return (result.rows || []) as any[];
        } catch (error: any) {
          logger.error("Error generating inventory movements report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير حركات المخزون",
          });
        }
      }),
  }),
  
  // ============================================
  // تقارير الصيانة
  // ============================================
  maintenance: router({
    // تقرير أوامر العمل
    workOrders: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax
          let query: any;
          if (input.status) {
            query = sql`
              SELECT 
                wo.id, wo.work_order_number, wo.work_order_type,
                wo.priority, wo.status, wo.scheduled_date,
                wo.completed_at, wo.estimated_cost::numeric, wo.actual_cost::numeric,
                c.full_name as customer_name,
                t.name_ar as technician_name
              FROM work_orders wo
              LEFT JOIN customers_enhanced c ON wo.customer_id = c.id
              LEFT JOIN field_workers t ON wo.assigned_technician_id = t.id
              WHERE wo.business_id = ${input.businessId}
                AND wo.created_at::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                AND wo.status = ${input.status}
              ORDER BY wo.created_at DESC
            `;
          } else {
            query = sql`
              SELECT 
                wo.id, wo.work_order_number, wo.work_order_type,
                wo.priority, wo.status, wo.scheduled_date,
                wo.completed_at, wo.estimated_cost::numeric, wo.actual_cost::numeric,
                c.full_name as customer_name,
                t.name_ar as technician_name
              FROM work_orders wo
              LEFT JOIN customers_enhanced c ON wo.customer_id = c.id
              LEFT JOIN field_workers t ON wo.assigned_technician_id = t.id
              WHERE wo.business_id = ${input.businessId}
                AND wo.created_at::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
              ORDER BY wo.created_at DESC
            `;
          }
          
          const result = await db.execute(query);
          return (result.rows || []) as any[];
        } catch (error: any) {
          logger.error("Error generating work orders report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير أوامر العمل",
          });
        }
      }),
    
    // تقرير تكاليف الصيانة
    costs: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        groupBy: z.enum(["type", "technician", "month"]).default("month"),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax
          let query: any;
          switch (input.groupBy) {
            case "type":
              query = sql`
                SELECT 
                  wo.work_order_type as group_key,
                  COUNT(wo.id)::integer as work_order_count,
                  COALESCE(SUM(wo.estimated_cost::numeric), 0)::numeric as total_estimated,
                  COALESCE(SUM(wo.actual_cost::numeric), 0)::numeric as total_actual,
                  (COALESCE(SUM(wo.actual_cost::numeric), 0) - COALESCE(SUM(wo.estimated_cost::numeric), 0))::numeric as variance
                FROM work_orders wo
                LEFT JOIN field_workers t ON wo.assigned_technician_id = t.id
                WHERE wo.business_id = ${input.businessId}
                  AND wo.created_at::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                GROUP BY wo.work_order_type
                ORDER BY wo.work_order_type
              `;
              break;
            case "technician":
              query = sql`
                SELECT 
                  t.id as technician_id,
                  t.name_ar as technician_name,
                  COUNT(wo.id)::integer as work_order_count,
                  COALESCE(SUM(wo.estimated_cost::numeric), 0)::numeric as total_estimated,
                  COALESCE(SUM(wo.actual_cost::numeric), 0)::numeric as total_actual,
                  (COALESCE(SUM(wo.actual_cost::numeric), 0) - COALESCE(SUM(wo.estimated_cost::numeric), 0))::numeric as variance
                FROM work_orders wo
                LEFT JOIN field_workers t ON wo.assigned_technician_id = t.id
                WHERE wo.business_id = ${input.businessId}
                  AND wo.created_at::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                GROUP BY t.id, t.name_ar
                ORDER BY t.name_ar
              `;
              break;
            case "month":
              query = sql`
                SELECT 
                  TO_CHAR(wo.created_at, 'YYYY-MM') as month,
                  COUNT(wo.id)::integer as work_order_count,
                  COALESCE(SUM(wo.estimated_cost::numeric), 0)::numeric as total_estimated,
                  COALESCE(SUM(wo.actual_cost::numeric), 0)::numeric as total_actual,
                  (COALESCE(SUM(wo.actual_cost::numeric), 0) - COALESCE(SUM(wo.estimated_cost::numeric), 0))::numeric as variance
                FROM work_orders wo
                LEFT JOIN field_workers t ON wo.assigned_technician_id = t.id
                WHERE wo.business_id = ${input.businessId}
                  AND wo.created_at::date BETWEEN ${input.startDate}::date AND ${input.endDate}::date
                GROUP BY TO_CHAR(wo.created_at, 'YYYY-MM')
                ORDER BY month
              `;
              break;
          }
          
          const result = await db.execute(query);
          return (result.rows || []) as any[];
        } catch (error: any) {
          logger.error("Error generating maintenance costs report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير تكاليف الصيانة",
          });
        }
      }),
  }),
  
  // ============================================
  // تقارير المشاريع
  // ============================================
  projects: router({
    // تقرير حالة المشاريع
    status: protectedProcedure
      .input(z.object({
        businessId: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax
          const result = await db.execute(sql`
            SELECT 
              p.id, p.code, p.name_ar, p.project_type,
              p.status, p.start_date, p.end_date,
              p.estimated_budget::numeric, p.actual_cost::numeric,
              p.completion_percentage::numeric,
              COUNT(DISTINCT t.id)::integer as task_count,
              COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::integer as completed_tasks,
              (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::numeric * 100.0 / NULLIF(COUNT(DISTINCT t.id), 0))::numeric as task_completion_rate
            FROM projects p
            LEFT JOIN project_tasks t ON p.id = t.project_id
            WHERE p.business_id = ${input.businessId}
            GROUP BY p.id, p.code, p.name_ar, p.project_type, p.status, p.start_date, p.end_date, p.estimated_budget, p.actual_cost, p.completion_percentage, p.created_at
            ORDER BY p.created_at DESC
          `);
          
          return (result.rows || []) as any[];
        } catch (error: any) {
          logger.error("Error generating projects status report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء تقرير حالة المشاريع",
          });
        }
      }),
  }),
  
  // ============================================
  // لوحات المؤشرات
  // ============================================
  dashboards: router({
    // لوحة المؤشرات الرئيسية
    executive: protectedProcedure
      .input(z.object({
        businessId: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // ✅ استخدام PostgreSQL syntax
          const result = await db.execute(sql`
            SELECT 
              (SELECT COUNT(*)::integer FROM customers_enhanced WHERE business_id = ${input.businessId}) as total_customers,
              (SELECT COUNT(*)::integer FROM meters_enhanced WHERE business_id = ${input.businessId}) as total_meters,
              (SELECT COALESCE(SUM(total_amount::numeric), 0)::numeric FROM invoices_enhanced 
               WHERE business_id = ${input.businessId} AND EXTRACT(MONTH FROM invoice_date) = EXTRACT(MONTH FROM NOW())) as monthly_revenue,
              (SELECT COUNT(*)::integer FROM work_orders 
               WHERE business_id = ${input.businessId} AND status = 'pending') as pending_work_orders,
              (SELECT COUNT(*)::integer FROM projects 
               WHERE business_id = ${input.businessId} AND status = 'in_progress') as active_projects
          `);
          
          return (result.rows || [])[0] || {};
        } catch (error: any) {
          logger.error("Error generating executive dashboard:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب بيانات لوحة المؤشرات",
          });
        }
      }),
  }),
});

