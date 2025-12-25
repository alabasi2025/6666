/**
 * @fileoverview Schemas للتصنيفات
 * @module schemas/categories
 */

import { z } from "zod";
import {
  idSchema,
  businessIdSchema,
  codeSchema,
  nameArSchema,
  nameEnSchema,
  descriptionSchema,
  isActiveSchema,
  listParamsSchema,
} from "./common";

// ==================== الثوابت ====================

export const categoryTypes = ["income", "expense", "both"] as const;

export const categoryTypeLabels: Record<typeof categoryTypes[number], string> = {
  income: "إيرادات",
  expense: "مصروفات",
  both: "مشترك",
};

// ==================== Schemas ====================

/**
 * نوع التصنيف
 */
export const categoryTypeSchema = z.enum(categoryTypes, {
  message: "نوع التصنيف غير صحيح"
});

/**
 * إنشاء تصنيف جديد
 */
export const createCategorySchema = z.object({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional().nullable(),
  parentId: idSchema.optional().nullable(),
  code: codeSchema,
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  categoryType: categoryTypeSchema,
  description: descriptionSchema,
  isActive: isActiveSchema,
});

/**
 * تعديل تصنيف
 */
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: idSchema,
});

/**
 * فلترة التصنيفات
 */
export const filterCategoriesSchema = listParamsSchema.extend({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional(),
  parentId: idSchema.optional().nullable(),
  categoryType: categoryTypeSchema.optional(),
  isActive: z.boolean().optional(),
});

// ==================== أنواع TypeScript ====================

export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type FilterCategories = z.infer<typeof filterCategoriesSchema>;
