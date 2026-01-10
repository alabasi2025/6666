/**
 * Defective Components Router
 * Router لإدارة المكونات التالفة
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { logger } from "./utils/logger";

export const defectiveComponentsRouter = router({
  // قائمة المكونات التالفة
  list: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      componentType: z.enum(["meter", "transformer", "cable", "switch", "capacitor", "relay", "circuit_breaker", "other"]).optional(),
      assessmentStatus: z.enum(["pending", "under_review", "assessed", "approved"]).optional(),
      disposition: z.enum(["repair", "scrap", "return_supplier", "warranty_claim", "pending"]).optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const offset = (input.page - 1) * input.limit;
        
        let query = `
          SELECT 
            dc.*,
            i.name_ar as item_name,
            c.name_ar as customer_name,
            u.name_ar as reported_by_name
          FROM defective_components dc
          LEFT JOIN items i ON dc.item_id = i.id
          LEFT JOIN customers c ON dc.customer_id = c.id
          LEFT JOIN users u ON dc.reported_by = u.id
          WHERE dc.business_id = ?
        `;
        
        const params: any[] = [input.businessId];
        
        if (input.componentType) {
          query += " AND dc.component_type = ?";
          params.push(input.componentType);
        }
        
        if (input.assessmentStatus) {
          query += " AND dc.assessment_status = ?";
          params.push(input.assessmentStatus);
        }
        
        if (input.disposition) {
          query += " AND dc.disposition = ?";
          params.push(input.disposition);
        }
        
        query += " ORDER BY dc.defect_date DESC LIMIT ? OFFSET ?";
        params.push(input.limit, offset);
        
        const [rows] = await db.execute(query, params);
        
        const [countRows] = await db.execute(
          query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
          params.slice(0, -2)
        );
        
        const total = (countRows as any[])[0]?.total || 0;
        
        return {
          defectiveComponents: rows as any[],
          total,
          page: input.page,
          limit: input.limit,
        };
      } catch (error: any) {
        logger.error("Error fetching defective components:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب المكونات التالفة",
        });
      }
    }),
  
  // تسجيل مكون تالف
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      componentType: z.enum(["meter", "transformer", "cable", "switch", "capacitor", "relay", "circuit_breaker", "other"]),
      itemId: z.number().optional(),
      serialNumber: z.string().optional(),
      defectReason: z.string().min(1),
      defectCategory: z.enum(["manufacturing", "wear_tear", "accident", "misuse", "electrical", "mechanical", "environmental", "unknown"]),
      severity: z.enum(["minor", "moderate", "major", "critical"]).default("moderate"),
      foundAt: z.string().optional(),
      customerId: z.number().optional(),
      workOrderId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        
        const [result] = await db.execute(
          `INSERT INTO defective_components (
            business_id, component_type, item_id, serial_number,
            defect_reason, defect_category, severity, found_at,
            customer_id, work_order_id, assessment_status,
            disposition, reported_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
          [
            input.businessId,
            input.componentType,
            input.itemId,
            input.serialNumber,
            input.defectReason,
            input.defectCategory,
            input.severity,
            input.foundAt,
            input.customerId,
            input.workOrderId,
            ctx.user.id,
          ]
        );
        
        return { id: (result as any).insertId, success: true };
      } catch (error: any) {
        logger.error("Error creating defective component:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تسجيل المكون التالف",
        });
      }
    }),
  
  // تقييم مكون تالف
  assess: protectedProcedure
    .input(z.object({
      id: z.number(),
      technicalAssessment: z.string(),
      rootCause: z.string().optional(),
      recommendations: z.string().optional(),
      repairFeasible: z.enum(["yes", "no", "maybe"]),
      estimatedCost: z.number().optional(),
      recommendedAction: z.enum(["repair", "replace", "scrap", "return", "investigate"]),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        
        // تحديث حالة المكون
        await db.execute(
          `UPDATE defective_components SET
            assessment_status = 'assessed',
            assessment_date = NOW(),
            assessed_by = ?,
            assessment_notes = ?,
            disposition = ?
          WHERE id = ?`,
          [ctx.user.id, input.technicalAssessment, input.recommendedAction, input.id]
        );
        
        // إنشاء سجل التقييم
        await db.execute(
          `INSERT INTO defect_assessments (
            defective_component_id, assessed_by, technical_assessment,
            root_cause, recommendations, repair_feasible,
            estimated_cost, recommended_action
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.id,
            ctx.user.id,
            input.technicalAssessment,
            input.rootCause,
            input.recommendations,
            input.repairFeasible,
            input.estimatedCost,
            input.recommendedAction,
          ]
        );
        
        return { success: true };
      } catch (error: any) {
        logger.error("Error assessing defective component:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تقييم المكون",
        });
      }
    }),
  
  // إحصائيات
  getStats: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        
        let query = `
          SELECT 
            component_type,
            defect_category,
            disposition,
            COUNT(*) as count,
            SUM(IFNULL(estimated_repair_cost, 0)) as total_estimated_cost,
            SUM(IFNULL(actual_repair_cost, 0)) as total_actual_cost
          FROM defective_components
          WHERE business_id = ?
        `;
        
        const params: any[] = [input.businessId];
        
        if (input.startDate) {
          query += " AND defect_date >= ?";
          params.push(input.startDate);
        }
        
        if (input.endDate) {
          query += " AND defect_date <= ?";
          params.push(input.endDate);
        }
        
        query += " GROUP BY component_type, defect_category, disposition";
        
        const [rows] = await db.execute(query, params);
        
        return rows as any[];
      } catch (error: any) {
        logger.error("Error fetching defective components stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب الإحصائيات",
        });
      }
    }),
  
  // تقرير المكونات التالفة
  getReport: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      componentType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        
        let query = `
          SELECT 
            dc.*,
            i.name_ar as item_name,
            c.name_ar as customer_name,
            u.name_ar as reported_by_name,
            a.name_ar as assessed_by_name,
            da.technical_assessment,
            da.recommended_action
          FROM defective_components dc
          LEFT JOIN items i ON dc.item_id = i.id
          LEFT JOIN customers c ON dc.customer_id = c.id
          LEFT JOIN users u ON dc.reported_by = u.id
          LEFT JOIN users a ON dc.assessed_by = a.id
          LEFT JOIN defect_assessments da ON da.defective_component_id = dc.id
          WHERE dc.business_id = ?
            AND dc.defect_date BETWEEN ? AND ?
        `;
        
        const params: any[] = [input.businessId, input.startDate, input.endDate];
        
        if (input.componentType) {
          query += " AND dc.component_type = ?";
          params.push(input.componentType);
        }
        
        query += " ORDER BY dc.defect_date DESC";
        
        const [rows] = await db.execute(query, params);
        
        return rows as any[];
      } catch (error: any) {
        logger.error("Error generating defective components report:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إنشاء التقرير",
        });
      }
    }),
});

