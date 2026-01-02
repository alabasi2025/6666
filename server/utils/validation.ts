/**
 * @fileoverview التحقق من المدخلات باستخدام Zod
 * @module server/utils/validation
 */

import { z } from "zod";

// Schema للمستخدم
export const userSchema = z.object({
  nameAr: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  nameEn: z.string().optional(),
  phone: z.string().regex(/^05\d{8}$/, "رقم الهاتف غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  role: z.enum(["admin", "manager", "user"]).default("user"),
  jobTitle: z.string().optional(),
  businessId: z.number().positive()
});

export const updateUserSchema = userSchema.partial().extend({
  id: z.number().positive()
});

// Schema للأصل
export const assetSchema = z.object({
  name: z.string().min(2, "اسم الأصل مطلوب"),
  category: z.string().min(1, "الفئة مطلوبة"),
  purchaseDate: z.date(),
  purchasePrice: z.number().positive("سعر الشراء يجب أن يكون موجباً"),
  currentValue: z.number().nonnegative(),
  depreciationRate: z.number().min(0).max(1, "نسبة الإهلاك يجب أن تكون بين 0 و 1"),
  businessId: z.number().positive()
});

export const updateAssetSchema = assetSchema.partial().extend({
  id: z.number().positive()
});

// Schema للفاتورة
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "رقم الفاتورة مطلوب"),
  customerId: z.number().positive().optional(),
  amount: z.number().positive("المبلغ يجب أن يكون موجباً"),
  status: z.enum(["draft", "pending", "paid", "cancelled"]).default("draft"),
  dueDate: z.date(),
  notes: z.string().optional(),
  businessId: z.number().positive()
});

export const updateInvoiceSchema = invoiceSchema.partial().extend({
  id: z.number().positive()
});

// دالة التحقق العامة
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(e => e.message).join(", ");
    throw new Error("خطأ في التحقق: " + errors);
  }
  return result.data;
}

// أنواع مُصدَّرة
export type UserInput = z.infer<typeof userSchema>;
export type AssetInput = z.infer<typeof assetSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
