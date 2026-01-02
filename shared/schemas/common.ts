/**
 * @fileoverview Schemas مشتركة للتحقق من صحة البيانات
 * @module schemas/common
 */

import { z } from "zod";

// ==================== الأنماط الأساسية ====================

/**
 * معرف رقمي موجب
 */
export const idSchema = z.number().int().positive({
  message: "المعرف يجب أن يكون رقماً صحيحاً موجباً"
});

/**
 * معرف الشركة
 */
export const businessIdSchema = z.number().int().positive({
  message: "معرف الشركة مطلوب"
});

/**
 * كود فريد (حروف وأرقام)
 */
export const codeSchema = z.string()
  .min(1, "الكود مطلوب")
  .max(50, "الكود يجب ألا يتجاوز 50 حرفاً")
  .regex(/^[a-zA-Z0-9_-]+$/, "الكود يجب أن يحتوي على حروف وأرقام فقط");

/**
 * اسم بالعربية
 */
export const nameArSchema = z.string()
  .min(2, "الاسم بالعربية يجب أن يكون حرفين على الأقل")
  .max(255, "الاسم بالعربية يجب ألا يتجاوز 255 حرفاً");

/**
 * اسم بالإنجليزية (اختياري)
 */
export const nameEnSchema = z.string()
  .max(255, "الاسم بالإنجليزية يجب ألا يتجاوز 255 حرفاً")
  .optional()
  .nullable();

/**
 * رقم هاتف
 */
export const phoneSchema = z.string()
  .regex(/^[+]?[0-9]{9,15}$/, "رقم الهاتف غير صحيح")
  .optional()
  .nullable();

/**
 * بريد إلكتروني
 */
export const emailSchema = z.string()
  .email("البريد الإلكتروني غير صحيح")
  .optional()
  .nullable();

/**
 * مبلغ مالي
 */
export const amountSchema = z.number()
  .min(0, "المبلغ يجب أن يكون صفراً أو أكثر");

/**
 * مبلغ مالي موجب (للسندات)
 */
export const positiveAmountSchema = z.number()
  .positive("المبلغ يجب أن يكون أكبر من صفر");

/**
 * نسبة مئوية
 */
export const percentageSchema = z.number()
  .min(0, "النسبة يجب أن تكون صفراً أو أكثر")
  .max(100, "النسبة يجب ألا تتجاوز 100%");

/**
 * تاريخ
 */
export const dateSchema = z.coerce.date({
  message: "التاريخ غير صحيح"
});

/**
 * تاريخ اختياري
 */
export const optionalDateSchema = dateSchema.optional().nullable();

/**
 * ملاحظات
 */
export const notesSchema = z.string()
  .max(1000, "الملاحظات يجب ألا تتجاوز 1000 حرف")
  .optional()
  .nullable();

/**
 * وصف
 */
export const descriptionSchema = z.string()
  .max(500, "الوصف يجب ألا يتجاوز 500 حرف")
  .optional()
  .nullable();

/**
 * حالة نشط/غير نشط
 */
export const isActiveSchema = z.boolean().default(true);

/**
 * عملة
 */
export const currencySchema = z.enum(["SAR", "USD", "EUR", "AED", "KWD", "BHD", "OMR", "QAR"], {
  message: "العملة غير مدعومة"
}).default("SAR");

// ==================== Schemas للترقيم ====================

/**
 * معاملات الترقيم (Pagination)
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * معاملات الفرز
 */
export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * معاملات البحث
 */
export const searchSchema = z.object({
  search: z.string().optional(),
});

/**
 * معاملات القائمة الكاملة
 */
export const listParamsSchema = paginationSchema
  .merge(sortingSchema)
  .merge(searchSchema);

// ==================== Schemas للفلترة بالتاريخ ====================

/**
 * فلترة بنطاق تاريخ
 */
export const dateRangeSchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية" }
);

// ==================== أنواع TypeScript ====================

export type Id = z.infer<typeof idSchema>;
export type BusinessId = z.infer<typeof businessIdSchema>;
export type Code = z.infer<typeof codeSchema>;
export type NameAr = z.infer<typeof nameArSchema>;
export type NameEn = z.infer<typeof nameEnSchema>;
export type Phone = z.infer<typeof phoneSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Amount = z.infer<typeof amountSchema>;
export type Percentage = z.infer<typeof percentageSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type ListParams = z.infer<typeof listParamsSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
