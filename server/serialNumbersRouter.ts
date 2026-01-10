/**
 * Serial Numbers Router
 * Router لإدارة الأرقام التسلسلية
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { itemSerialNumbers, serialNumberMovements } from "../drizzle/schemas/serial-numbers";
import { logger } from "./utils/logger";

export const serialNumbersRouter = router({
  // قائمة الأرقام التسلسلية
  list: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      itemId: z.number().optional(),
      warehouseId: z.number().optional(),
      status: z.enum(["in_stock", "issued", "installed", "defective", "returned", "scrapped"]).optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const offset = (input.page - 1) * input.limit;
        
        let query = `
          SELECT 
            isn.*,
            i.name_ar as item_name,
            i.code as item_code,
            w.name_ar as warehouse_name
          FROM item_serial_numbers isn
          LEFT JOIN items i ON isn.item_id = i.id
          LEFT JOIN warehouses w ON isn.warehouse_id = w.id
          WHERE isn.business_id = ?
        `;
        
        const params: any[] = [input.businessId];
        
        if (input.itemId) {
          query += " AND isn.item_id = ?";
          params.push(input.itemId);
        }
        
        if (input.warehouseId) {
          query += " AND isn.warehouse_id = ?";
          params.push(input.warehouseId);
        }
        
        if (input.status) {
          query += " AND isn.status = ?";
          params.push(input.status);
        }
        
        if (input.search) {
          query += " AND (isn.serial_number LIKE ? OR i.name_ar LIKE ?)";
          const searchTerm = `%${input.search}%`;
          params.push(searchTerm, searchTerm);
        }
        
        query += " ORDER BY isn.created_at DESC LIMIT ? OFFSET ?";
        params.push(input.limit, offset);
        
        const [rows] = await db.execute(query, params);
        
        const [countRows] = await db.execute(
          query.replace(/SELECT.*FROM/, "SELECT COUNT(*) as total FROM").replace(/ORDER BY.*/, ""),
          params.slice(0, -2)
        );
        
        const total = (countRows as any[])[0]?.total || 0;
        
        return {
          serialNumbers: rows as any[],
          total,
          page: input.page,
          limit: input.limit,
        };
      } catch (error: any) {
        logger.error("Error fetching serial numbers:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب الأرقام التسلسلية",
        });
      }
    }),
  
  // تفاصيل رقم تسلسلي
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        
        const query = `
          SELECT 
            isn.*,
            i.name_ar as item_name,
            i.code as item_code,
            w.name_ar as warehouse_name,
            c.name_ar as customer_name
          FROM item_serial_numbers isn
          LEFT JOIN items i ON isn.item_id = i.id
          LEFT JOIN warehouses w ON isn.warehouse_id = w.id
          LEFT JOIN customers c ON isn.customer_id = c.id
          WHERE isn.id = ?
        `;
        
        const [rows] = await db.execute(query, [input.id]);
        
        if ((rows as any[]).length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "الرقم التسلسلي غير موجود",
          });
        }
        
        return (rows as any[])[0];
      } catch (error: any) {
        logger.error("Error fetching serial number:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب بيانات الرقم التسلسلي",
        });
      }
    }),
  
  // إضافة رقم تسلسلي جديد
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      itemId: z.number(),
      serialNumber: z.string().min(1),
      warehouseId: z.number(),
      manufacturer: z.string().optional(),
      manufactureDate: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        
        // التحقق من عدم تكرار الرقم التسلسلي
        const [existing] = await db.execute(
          `SELECT id FROM item_serial_numbers WHERE business_id = ? AND serial_number = ?`,
          [input.businessId, input.serialNumber]
        );
        
        if ((existing as any[]).length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "الرقم التسلسلي موجود مسبقاً",
          });
        }
        
        const [result] = await db.execute(
          `INSERT INTO item_serial_numbers (
            business_id, item_id, serial_number, warehouse_id,
            status, received_date, received_by, manufacturer,
            manufacture_date, warranty_expiry, notes, created_by
          ) VALUES (?, ?, ?, ?, 'in_stock', NOW(), ?, ?, ?, ?, ?, ?)`,
          [
            input.businessId,
            input.itemId,
            input.serialNumber,
            input.warehouseId,
            ctx.user.id,
            input.manufacturer,
            input.manufactureDate,
            input.warrantyExpiry,
            input.notes,
            ctx.user.id,
          ]
        );
        
        const id = (result as any).insertId;
        
        // تسجيل الحركة
        await db.execute(
          `INSERT INTO serial_number_movements (
            serial_number_id, movement_type, movement_date,
            to_warehouse_id, description, performed_by
          ) VALUES (?, 'receive', NOW(), ?, ?, ?)`,
          [id, input.warehouseId, `استلام رقم تسلسلي ${input.serialNumber}`, ctx.user.id]
        );
        
        return { id, success: true };
      } catch (error: any) {
        logger.error("Error creating serial number:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "فشل في إضافة الرقم التسلسلي",
        });
      }
    }),
  
  // صرف رقم تسلسلي
  issue: protectedProcedure
    .input(z.object({
      id: z.number(),
      issuedTo: z.string(),
      workOrderId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        
        // تحديث حالة الرقم التسلسلي
        await db.execute(
          `UPDATE item_serial_numbers SET
            status = 'issued',
            issued_date = NOW(),
            issued_to = ?,
            issued_by = ?,
            work_order_id = ?
          WHERE id = ? AND status = 'in_stock'`,
          [input.issuedTo, ctx.user.id, input.workOrderId, input.id]
        );
        
        // تسجيل الحركة
        await db.execute(
          `INSERT INTO serial_number_movements (
            serial_number_id, movement_type, movement_date,
            description, performed_by, reference_type, reference_id
          ) VALUES (?, 'issue', NOW(), ?, ?, 'work_order', ?)`,
          [
            input.id,
            `صرف إلى ${input.issuedTo}`,
            ctx.user.id,
            input.workOrderId
          ]
        );
        
        return { success: true };
      } catch (error: any) {
        logger.error("Error issuing serial number:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في صرف الرقم التسلسلي",
        });
      }
    }),
  
  // تركيب رقم تسلسلي (عداد)
  install: protectedProcedure
    .input(z.object({
      id: z.number(),
      customerId: z.number(),
      meterId: z.number().optional(),
      workOrderId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        
        await db.execute(
          `UPDATE item_serial_numbers SET
            status = 'installed',
            installed_date = NOW(),
            installed_by = ?,
            customer_id = ?,
            meter_id = ?,
            work_order_id = ?
          WHERE id = ? AND status IN ('in_stock', 'issued')`,
          [ctx.user.id, input.customerId, input.meterId, input.workOrderId, input.id]
        );
        
        await db.execute(
          `INSERT INTO serial_number_movements (
            serial_number_id, movement_type, movement_date,
            description, performed_by, reference_type, reference_id
          ) VALUES (?, 'install', NOW(), ?, ?, 'work_order', ?)`,
          [input.id, `تركيب للعميل #${input.customerId}`, ctx.user.id, input.workOrderId]
        );
        
        return { success: true };
      } catch (error: any) {
        logger.error("Error installing serial number:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تركيب الرقم التسلسلي",
        });
      }
    }),
  
  // تسجيل تالف
  markDefective: protectedProcedure
    .input(z.object({
      id: z.number(),
      defectReason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        
        await db.execute(
          `UPDATE item_serial_numbers SET
            status = 'defective',
            defect_date = NOW(),
            defect_reason = ?,
            defect_reported_by = ?
          WHERE id = ?`,
          [input.defectReason, ctx.user.id, input.id]
        );
        
        await db.execute(
          `INSERT INTO serial_number_movements (
            serial_number_id, movement_type, movement_date,
            description, performed_by
          ) VALUES (?, 'defect', NOW(), ?, ?)`,
          [input.id, `تسجيل كتالف: ${input.defectReason}`, ctx.user.id]
        );
        
        return { success: true };
      } catch (error: any) {
        logger.error("Error marking serial number as defective:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تسجيل الصنف كتالف",
        });
      }
    }),
  
  // إحصائيات
  getStats: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      itemId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        
        let query = `
          SELECT 
            status,
            COUNT(*) as count
          FROM item_serial_numbers
          WHERE business_id = ?
        `;
        
        const params: any[] = [input.businessId];
        
        if (input.itemId) {
          query += " AND item_id = ?";
          params.push(input.itemId);
        }
        
        query += " GROUP BY status";
        
        const [rows] = await db.execute(query, params);
        
        return rows as any[];
      } catch (error: any) {
        logger.error("Error fetching serial numbers stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب الإحصائيات",
        });
      }
    }),
  
  // سجل الحركات
  getMovements: protectedProcedure
    .input(z.object({
      serialNumberId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        
        const query = `
          SELECT 
            snm.*,
            u.name_ar as performed_by_name
          FROM serial_number_movements snm
          LEFT JOIN users u ON snm.performed_by = u.id
          WHERE snm.serial_number_id = ?
          ORDER BY snm.movement_date DESC
        `;
        
        const [rows] = await db.execute(query, [input.serialNumberId]);
        
        return rows as any[];
      } catch (error: any) {
        logger.error("Error fetching serial number movements:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب سجل الحركات",
        });
      }
    }),
});

