/**
 * Custom Account Types Router
 * إدارة أنواع الحسابات المخصصة
 */

import { z } from "zod";
import { eq, and, or, isNull } from "drizzle-orm";
import { getDb } from "./db";
import {
  customAccountTypes,
  type CustomAccountType,
  type InsertCustomAccountType,
} from "../drizzle/schemas/customSystemV2";
import { router, protectedProcedure } from "./_core/trpc";

// Schema للتحقق من البيانات
const createAccountTypeSchema = z.object({
  subSystemId: z.number().int().positive().optional(),
  typeCode: z.string().min(1).max(50),
  typeNameAr: z.string().min(1).max(100),
  typeNameEn: z.string().max(100).optional(),
  description: z.string().optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const updateAccountTypeSchema = createAccountTypeSchema.partial().extend({
  id: z.number().int().positive(),
});

export const customAccountTypesRouter = router({
  /**
   * الحصول على قائمة أنواع الحسابات
   */
  list: protectedProcedure
    .input(
      z.object({
        subSystemId: z.number().int().positive().optional(),
        includeInactive: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const businessId = ctx.user.businessId;
      
      // بناء الشروط بشكل صحيح
      let whereClause = eq(customAccountTypes.businessId, businessId);
      
      if (input?.subSystemId) {
        // عرض الأنواع المرتبطة بالنظام الفرعي أو الأنواع العامة (NULL)
        whereClause = and(
          whereClause,
          or(
            eq(customAccountTypes.subSystemId, input.subSystemId),
            isNull(customAccountTypes.subSystemId)
          )
        );
      }
      
      if (!input?.includeInactive) {
        whereClause = and(whereClause, eq(customAccountTypes.isActive, true));
      }
      
      const types = await db
        .select()
        .from(customAccountTypes)
        .where(whereClause)
        .orderBy(customAccountTypes.displayOrder, customAccountTypes.typeNameAr);
      
      return types;
    }),

  /**
   * الحصول على نوع حساب محدد
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const businessId = ctx.user.businessId;
      
      const [accountType] = await db
        .select()
        .from(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.id, input.id),
            eq(customAccountTypes.businessId, businessId)
          )
        )
        .limit(1);
      
      if (!accountType) {
        throw new Error("نوع الحساب غير موجود");
      }
      
      return accountType;
    }),

  /**
   * إنشاء نوع حساب جديد
   */
  create: protectedProcedure
    .input(createAccountTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const businessId = ctx.user.businessId;
      const userId = ctx.user.id;
      
      const [existing] = await db
        .select()
        .from(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.businessId, businessId),
            eq(customAccountTypes.typeCode, input.typeCode)
          )
        )
        .limit(1);
      
      if (existing) {
        throw new Error("يوجد نوع حساب بنفس الكود مسبقاً");
      }
      
      const [newType] = await db
        .insert(customAccountTypes)
        .values({
          businessId,
          subSystemId: input.subSystemId,
          typeCode: input.typeCode,
          typeNameAr: input.typeNameAr,
          typeNameEn: input.typeNameEn,
          description: input.description,
          color: input.color,
          icon: input.icon,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
          isSystemType: false,
          createdBy: userId,
        })
        .$returningId();
      
      return { id: newType.id, message: "تم إنشاء نوع الحساب بنجاح" };
    }),

  /**
   * تحديث نوع حساب
   */
  update: protectedProcedure
    .input(updateAccountTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const businessId = ctx.user.businessId;
      const { id, ...updateData } = input;
      
      const [existing] = await db
        .select()
        .from(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.id, id),
            eq(customAccountTypes.businessId, businessId)
          )
        )
        .limit(1);
      
      if (!existing) {
        throw new Error("نوع الحساب غير موجود");
      }
      
      if (existing.isSystemType) {
        throw new Error("لا يمكن تعديل الأنواع النظامية الافتراضية");
      }
      
      await db
        .update(customAccountTypes)
        .set(updateData)
        .where(
          and(
            eq(customAccountTypes.id, id),
            eq(customAccountTypes.businessId, businessId)
          )
        );
      
      return { message: "تم تحديث نوع الحساب بنجاح" };
    }),

  /**
   * حذف نوع حساب
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const businessId = ctx.user.businessId;
      
      const [existing] = await db
        .select()
        .from(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.id, input.id),
            eq(customAccountTypes.businessId, businessId)
          )
        )
        .limit(1);
      
      if (!existing) {
        throw new Error("نوع الحساب غير موجود");
      }
      
      if (existing.isSystemType) {
        throw new Error("لا يمكن حذف الأنواع النظامية الافتراضية");
      }
      
      await db
        .delete(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.id, input.id),
            eq(customAccountTypes.businessId, businessId)
          )
        );
      
      return { message: "تم حذف نوع الحساب بنجاح" };
    }),

  /**
   * تفعيل/تعطيل نوع حساب
   */
  toggleActive: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const businessId = ctx.user.businessId;
      
      await db
        .update(customAccountTypes)
        .set({ isActive: input.isActive })
        .where(
          and(
            eq(customAccountTypes.id, input.id),
            eq(customAccountTypes.businessId, businessId)
          )
        );
      
      return {
        message: input.isActive
          ? "تم تفعيل نوع الحساب بنجاح"
          : "تم تعطيل نوع الحساب بنجاح",
      };
    }),
});
