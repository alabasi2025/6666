/**
 * @fileoverview Schemas للخزائن
 * @module schemas/treasuries
 */

import { z } from "zod";
import {
  idSchema,
  businessIdSchema,
  codeSchema,
  nameArSchema,
  nameEnSchema,
  amountSchema,
  currencySchema,
  notesSchema,
  isActiveSchema,
  listParamsSchema,
} from "./common";

// ==================== الثوابت ====================

export const treasuryTypes = ["cash", "bank", "wallet", "cashier"] as const;

export const treasuryTypeLabels: Record<typeof treasuryTypes[number], string> = {
  cash: "صندوق نقدي",
  bank: "حساب بنكي",
  wallet: "محفظة إلكترونية",
  cashier: "صراف",
};

// ==================== Schemas ====================

/**
 * نوع الخزينة
 */
export const treasuryTypeSchema = z.enum(treasuryTypes, {
  message: "نوع الخزينة غير صحيح"
});

/**
 * إنشاء خزينة جديدة
 */
export const createTreasurySchema = z.object({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional().nullable(),
  accountId: idSchema.optional().nullable(),
  code: codeSchema,
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  treasuryType: treasuryTypeSchema,
  currency: currencySchema,
  openingBalance: amountSchema.default(0),
  bankName: z.string().max(100).optional().nullable(),
  accountNumber: z.string().max(50).optional().nullable(),
  iban: z.string().max(50).optional().nullable(),
  notes: notesSchema,
  isActive: isActiveSchema,
});

/**
 * تعديل خزينة
 */
export const updateTreasurySchema = createTreasurySchema.partial().extend({
  id: idSchema,
});

/**
 * فلترة الخزائن
 */
export const filterTreasuriesSchema = listParamsSchema.extend({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional(),
  treasuryType: treasuryTypeSchema.optional(),
  isActive: z.boolean().optional(),
});

/**
 * تحويل بين الخزائن
 */
export const transferBetweenTreasuriesSchema = z.object({
  fromTreasuryId: idSchema,
  toTreasuryId: idSchema,
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().max(500).optional(),
  date: z.coerce.date().default(() => new Date()),
}).refine(
  (data) => data.fromTreasuryId !== data.toTreasuryId,
  { message: "لا يمكن التحويل لنفس الخزينة" }
);

// ==================== أنواع TypeScript ====================

export type TreasuryType = z.infer<typeof treasuryTypeSchema>;
export type CreateTreasury = z.infer<typeof createTreasurySchema>;
export type UpdateTreasury = z.infer<typeof updateTreasurySchema>;
export type FilterTreasuries = z.infer<typeof filterTreasuriesSchema>;
export type TransferBetweenTreasuries = z.infer<typeof transferBetweenTreasuriesSchema>;
