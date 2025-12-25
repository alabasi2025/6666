/**
 * @fileoverview Schemas للأطراف (العملاء، الموردين، إلخ)
 * @module schemas/parties
 */

import { z } from "zod";
import {
  idSchema,
  businessIdSchema,
  codeSchema,
  nameArSchema,
  nameEnSchema,
  phoneSchema,
  emailSchema,
  amountSchema,
  currencySchema,
  notesSchema,
  isActiveSchema,
  listParamsSchema,
} from "./common";

// ==================== الثوابت ====================

export const partyTypes = [
  "customer",
  "supplier",
  "employee",
  "partner",
  "government",
  "other",
] as const;

export const partyTypeLabels: Record<typeof partyTypes[number], string> = {
  customer: "عميل",
  supplier: "مورد",
  employee: "موظف",
  partner: "شريك",
  government: "جهة حكومية",
  other: "أخرى",
};

// ==================== Schemas ====================

/**
 * نوع الطرف
 */
export const partyTypeSchema = z.enum(partyTypes, {
  message: "نوع الطرف غير صحيح"
});

/**
 * إنشاء طرف جديد
 */
export const createPartySchema = z.object({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional().nullable(),
  code: codeSchema,
  partyType: partyTypeSchema,
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  phone: phoneSchema,
  mobile: phoneSchema,
  email: emailSchema,
  contactPerson: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).default("المملكة العربية السعودية"),
  address: z.string().max(500).optional().nullable(),
  taxNumber: z.string().max(50).optional().nullable(),
  commercialRegister: z.string().max(50).optional().nullable(),
  creditLimit: amountSchema.default(0),
  currency: currencySchema,
  notes: notesSchema,
  isActive: isActiveSchema,
});

/**
 * تعديل طرف
 */
export const updatePartySchema = createPartySchema.partial().extend({
  id: idSchema,
});

/**
 * فلترة الأطراف
 */
export const filterPartiesSchema = listParamsSchema.extend({
  businessId: businessIdSchema,
  subSystemId: idSchema.optional(),
  partyType: partyTypeSchema.optional(),
  isActive: z.boolean().optional(),
  city: z.string().optional(),
});

/**
 * الحصول على كشف حساب طرف
 */
export const partyStatementSchema = z.object({
  partyId: idSchema,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ==================== أنواع TypeScript ====================

export type PartyType = z.infer<typeof partyTypeSchema>;
export type CreateParty = z.infer<typeof createPartySchema>;
export type UpdateParty = z.infer<typeof updatePartySchema>;
export type FilterParties = z.infer<typeof filterPartiesSchema>;
export type PartyStatement = z.infer<typeof partyStatementSchema>;
