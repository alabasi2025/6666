/**
 * Custom Account Types Router
 * إدارة أنواع الحسابات المخصصة
 */

import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  customAccountTypes,
  type CustomAccountType,
  type InsertCustomAccountType,
} from "../drizzle/schema";
import { router, protectedProcedure } from "./_core/trpc";

// Schema للتحقق من البيانات
const createAccountTypeSchema = z.object({
  subSystemId: z.number().int().positive().optional(), // النظام الفرعي
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
        subSystemId: z.number().int().positive().optional(), // فلتر بالنظام الفرعي
        includeInactive: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const businessId = ctx.user.businessId;
      
      const conditions = [eq(customAccountTypes.businessId, businessId)];
      
      // فلتر بالنظام الفرعي
      if (input?.subSystemId) {
        conditions.push(eq(customAccountTypes.subSystemId, input.subSystemId));
      }
      
      if (!input?.includeInactive) {
        conditions.push(eq(customAccountTypes.isActive, true));
      }
      
      const types = await db
        .select()
        .from(customAccountTypes)
        .where(and(...conditions))
        .orderBy(customAccountTypes.displayOrder, customAccountTypes.typeNameAr);
      
      return types;
    }),

  /**
   * الحصول على نوع حساب محدد
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
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
      const businessId = ctx.user.businessId;
      const userId = ctx.user.id;
      
      // التحقق من عدم وجود نوع بنفس الكود
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
          subSystemId: input.subSystemId, // حفظ النظام الفرعي
          typeCode: input.typeCode,
          typeNameAr: input.typeNameAr,
          typeNameEn: input.typeNameEn,
          description: input.description,
          color: input.color,
          icon: input.icon,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
          isSystemType: false, // الأنواع المخصصة ليست نظامية
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
      const businessId = ctx.user.businessId;
      const { id, ...updateData } = input;
      
      // التحقق من وجود النوع
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
      
      // منع تعديل الأنواع النظامية (الافتراضية)
      if (existing.isSystemType) {
        throw new Error("لا يمكن تعديل الأنواع النظامية الافتراضية");
      }
      
      // التحقق من عدم تكرار الكود
      if (updateData.typeCode) {
        const [duplicate] = await db
          .select()
          .from(customAccountTypes)
          .where(
            and(
              eq(customAccountTypes.businessId, businessId),
              eq(customAccountTypes.typeCode, updateData.typeCode),
              // استثناء النوع الحالي
              // @ts-ignore
              db.sql`id != ${id}`
            )
          )
          .limit(1);
        
        if (duplicate) {
          throw new Error("يوجد نوع حساب آخر بنفس الكود");
        }
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
   * حذف نوع حساب (فقط الأنواع غير النظامية)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const businessId = ctx.user.businessId;
      
      // التحقق من وجود النوع
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
      
      // منع حذف الأنواع النظامية
      if (existing.isSystemType) {
        throw new Error("لا يمكن حذف الأنواع النظامية الافتراضية");
      }
      
      // TODO: التحقق من عدم وجود حسابات مرتبطة بهذا النوع
      
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

  /**
   * إعادة ترتيب الأنواع
   */
  reorder: protectedProcedure
    .input(
      z.object({
        types: z.array(
          z.object({
            id: z.number().int().positive(),
            displayOrder: z.number().int(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = ctx.user.businessId;
      
      // تحديث ترتيب كل نوع
      for (const type of input.types) {
        await db
          .update(customAccountTypes)
          .set({ displayOrder: type.displayOrder })
          .where(
            and(
              eq(customAccountTypes.id, type.id),
              eq(customAccountTypes.businessId, businessId)
            )
          );
      }
      
      return { message: "تم إعادة ترتيب الأنواع بنجاح" };
    }),
});
