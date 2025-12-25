/**
 * @fileoverview Schemas للسندات (قبض وصرف)
 * @module schemas/vouchers
 */

import { z } from "zod";
import {
  idSchema,
  businessIdSchema,
  positiveAmountSchema,
  notesSchema,
  dateSchema,
  listParamsSchema,
  dateRangeSchema,
} from "./common";

// ==================== الثوابت ====================

export const voucherTypes = ["receipt", "payment"] as const;
export const paymentMethods = ["cash", "check", "transfer", "card"] as const;

export const voucherTypeLabels: Record<typeof voucherTypes[number], string> = {
  receipt: "سند قبض",
  payment: "سند صرف",
};

export const paymentMethodLabels: Record<typeof paymentMethods[number], string> = {
  cash: "نقدي",
  check: "شيك",
  transfer: "تحويل بنكي",
  card: "بطاقة",
};

// ==================== Schemas ====================

/**
 * نوع السند
 */
export const voucherTypeSchema = z.enum(voucherTypes, {
  message: "نوع السند غير صحيح"
});

/**
 * طريقة الدفع
 */
export const paymentMethodSchema = z.enum(paymentMethods, {
  message: "طريقة الدفع غير صحيحة"
});

/**
 * إنشاء سند قبض
 */
export const createReceiptVoucherSchema = z.object({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional().nullable(),
  treasuryId: idSchema,
  partyId: idSchema.optional().nullable(),
  categoryId: idSchema.optional().nullable(),
  amount: positiveAmountSchema,
  paymentMethod: paymentMethodSchema.default("cash"),
  checkNumber: z.string().max(50).optional().nullable(),
  checkDate: z.coerce.date().optional().nullable(),
  checkBank: z.string().max(100).optional().nullable(),
  bankReference: z.string().max(100).optional().nullable(),
  date: dateSchema.default(() => new Date()),
  description: z.string().max(500).optional().nullable(),
  notes: notesSchema,
});

/**
 * إنشاء سند صرف
 */
export const createPaymentVoucherSchema = createReceiptVoucherSchema;

/**
 * تعديل سند
 */
export const updateVoucherSchema = createReceiptVoucherSchema.partial().extend({
  id: idSchema,
});

/**
 * فلترة السندات
 */
export const filterVouchersSchema = listParamsSchema
  .merge(dateRangeSchema)
  .extend({
    businessId: businessIdSchema,
    subSystemId: idSchema.optional(),
    treasuryId: idSchema.optional(),
    partyId: idSchema.optional(),
    categoryId: idSchema.optional(),
    paymentMethod: paymentMethodSchema.optional(),
    voucherType: voucherTypeSchema.optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
  });

// ==================== أنواع TypeScript ====================

export type VoucherType = z.infer<typeof voucherTypeSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CreateReceiptVoucher = z.infer<typeof createReceiptVoucherSchema>;
export type CreatePaymentVoucher = z.infer<typeof createPaymentVoucherSchema>;
export type UpdateVoucher = z.infer<typeof updateVoucherSchema>;
export type FilterVouchers = z.infer<typeof filterVouchersSchema>;
