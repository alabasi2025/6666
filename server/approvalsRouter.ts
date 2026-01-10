/**
 * Approvals Router
 * Router لنظام الموافقات
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { logger } from "./utils/logger";
import { sql } from "drizzle-orm";

export const approvalsRouter = router({
  // قائمة طلبات الموافقة
  list: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
      requestType: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const offset = (input.page - 1) * input.limit;
        
        let query = sql`
          SELECT 
            ar.*,
            u1.name_ar as requested_by_name,
            u2.name_ar as approver_name
          FROM approval_requests ar
          LEFT JOIN users u1 ON ar.requested_by = u1.id
          LEFT JOIN users u2 ON COALESCE(ar.approved_by, ar.rejected_by) = u2.id
          WHERE ar.business_id = ${input.businessId}
        `;
        
        if (input.status) {
          query = sql`${query} AND ar.status = ${input.status}`;
        }
        
        if (input.requestType) {
          query = sql`${query} AND ar.request_type = ${input.requestType}`;
        }
        
        query = sql`${query} ORDER BY ar.requested_at DESC LIMIT ${input.limit} OFFSET ${offset}`;
        
        const rows = await db.execute(query);
        
        return {
          requests: rows.rows as any[],
          total: rows.rows.length,
        };
      } catch (error: any) {
        logger.error("Error fetching approval requests:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب طلبات الموافقة",
        });
      }
    }),
  
  // إنشاء طلب موافقة
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      requestType: z.enum([
        "disconnect_meter", "reconnect_meter", "write_off_debt", "refund",
        "void_invoice", "adjust_billing", "emergency_work_order",
        "high_value_purchase", "dispose_asset", "other"
      ]),
      title: z.string().min(1),
      description: z.string().min(1),
      justification: z.string().optional(),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      amount: z.number().optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.execute(
          sql`INSERT INTO approval_requests (
            business_id, request_type, title, description, justification,
            reference_type, reference_id, amount, priority, requested_by
          ) VALUES (
            ${input.businessId}, ${input.requestType}, ${input.title}, 
            ${input.description}, ${input.justification || null},
            ${input.referenceType || null}, ${input.referenceId || null}, 
            ${input.amount || null}, ${input.priority}, ${ctx.user.id}
          ) RETURNING id`
        );
        
        const id = (result.rows[0] as any).id;
        
        // تسجيل في السجل
        await db.execute(
          sql`INSERT INTO approval_history (
            approval_request_id, action, performed_by, new_status
          ) VALUES (${id}, 'created', ${ctx.user.id}, 'pending')`
        );
        
        logger.info("Approval request created", {
          id,
          type: input.requestType,
          requestedBy: ctx.user.id,
        });
        
        return { id, success: true };
      } catch (error: any) {
        logger.error("Error creating approval request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إنشاء طلب الموافقة",
        });
      }
    }),
  
  // الموافقة على طلب
  approve: adminProcedure
    .input(z.object({
      id: z.number(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // تحديث الطلب
        await db.execute(
          sql`UPDATE approval_requests SET
            status = 'approved',
            approved_by = ${ctx.user.id},
            approved_at = NOW(),
            approver_comments = ${input.comments || null}
          WHERE id = ${input.id} AND status = 'pending'`
        );
        
        // تسجيل في السجل
        await db.execute(
          sql`INSERT INTO approval_history (
            approval_request_id, action, performed_by, 
            old_status, new_status, comments
          ) VALUES (${input.id}, 'approved', ${ctx.user.id}, 'pending', 'approved', ${input.comments || null})`
        );
        
        logger.info("Approval request approved", {
          id: input.id,
          approvedBy: ctx.user.id,
        });
        
        return { success: true };
      } catch (error: any) {
        logger.error("Error approving request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الموافقة على الطلب",
        });
      }
    }),
  
  // رفض طلب
  reject: adminProcedure
    .input(z.object({
      id: z.number(),
      comments: z.string().min(1, "يجب إدخال سبب الرفض"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.execute(
          sql`UPDATE approval_requests SET
            status = 'rejected',
            rejected_by = ${ctx.user.id},
            rejected_at = NOW(),
            approver_comments = ${input.comments}
          WHERE id = ${input.id} AND status = 'pending'`
        );
        
        await db.execute(
          sql`INSERT INTO approval_history (
            approval_request_id, action, performed_by,
            old_status, new_status, comments
          ) VALUES (${input.id}, 'rejected', ${ctx.user.id}, 'pending', 'rejected', ${input.comments})`
        );
        
        logger.info("Approval request rejected", {
          id: input.id,
          rejectedBy: ctx.user.id,
        });
        
        return { success: true };
      } catch (error: any) {
        logger.error("Error rejecting request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في رفض الطلب",
        });
      }
    }),
  
  // الإحصائيات
  getStats: protectedProcedure
    .input(z.object({
      businessId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.execute(
          sql`SELECT 
            status,
            COUNT(*) as count
          FROM approval_requests
          WHERE business_id = ${input.businessId}
          GROUP BY status`
        );
        
        return result.rows as any[];
      } catch (error: any) {
        logger.error("Error fetching approval stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب الإحصائيات",
        });
      }
    }),
});

