import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// النظام المخصص - Personal Finance System
// ============================================

// الأنظمة الفرعية - Sub Systems
export const customSubSystems = mysqlTable("custom_sub_systems", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("css_business_idx").on(table.businessId),
  codeIdx: uniqueIndex("css_code_idx").on(table.businessId, table.code),
}));

// الخزائن - Treasuries (صناديق، بنوك، محافظ إلكترونية، صرافين)
export const customTreasuries = mysqlTable("custom_treasuries", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subSystemId: int("sub_system_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  treasuryType: mysqlEnum("treasury_type", ["cash", "bank", "wallet", "exchange"]).notNull(),
  // cash = صندوق، bank = بنك، wallet = محفظة إلكترونية، exchange = صراف
  bankName: varchar("bank_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 100 }),
  iban: varchar("iban", { length: 50 }),
  swiftCode: varchar("swift_code", { length: 20 }),
  walletProvider: varchar("wallet_provider", { length: 100 }), // STC Pay, Apple Pay, etc.
  walletNumber: varchar("wallet_number", { length: 100 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  openingBalance: decimal("opening_balance", { precision: 18, scale: 2 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("ct_business_idx").on(table.businessId),
  subSystemIdx: index("ct_subsystem_idx").on(table.subSystemId),
  typeIdx: index("ct_type_idx").on(table.treasuryType),
  codeIdx: uniqueIndex("ct_code_idx").on(table.businessId, table.code),
}));

// الحسابات الوسيطة - Intermediary Accounts
export const customIntermediaryAccounts = mysqlTable("custom_intermediary_accounts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  fromSubSystemId: int("from_sub_system_id").notNull(),
  toSubSystemId: int("to_sub_system_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سندات القبض - Receipt Vouchers
export const customReceiptVouchers = mysqlTable("custom_receipt_vouchers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subSystemId: int("sub_system_id").notNull(),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
  voucherDate: date("voucher_date").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // من أين (المصدر)
  sourceType: mysqlEnum("source_type", ["person", "entity", "intermediary", "party", "other"]).notNull(),
  sourceName: varchar("source_name", { length: 255 }),
  sourceIntermediaryId: int("source_intermediary_id"), // إذا كان من حساب وسيط
  // === الحقول الجديدة ===
  partyId: int("party_id"), // ربط بجدول الأطراف
  categoryId: int("category_id"), // ربط بجدول التصنيفات
  // طريقة الدفع
  paymentMethod: mysqlEnum("payment_method", ["cash", "check", "transfer", "card", "wallet", "other"]).default("cash"),
  checkNumber: varchar("check_number", { length: 50 }),
  checkDate: date("check_date"),
  checkBank: varchar("check_bank", { length: 100 }),
  bankReference: varchar("bank_reference", { length: 100 }),
  // === نهاية الحقول الجديدة ===
  // إلى أين (الخزينة)
  treasuryId: int("treasury_id").notNull(),
  description: text("description"),
  attachments: json("attachments"),
  status: mysqlEnum("status", ["draft", "confirmed", "cancelled"]).default("draft"),
  isReconciled: boolean("is_reconciled").default(false),
  reconciledWith: int("reconciled_with"), // رقم سند الصرف المطابق
  reconciledAt: timestamp("reconciled_at"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("crv_business_idx").on(table.businessId),
  subSystemIdx: index("crv_subsystem_idx").on(table.subSystemId),
  treasuryIdx: index("crv_treasury_idx").on(table.treasuryId),
  partyIdx: index("crv_party_idx").on(table.partyId),
  categoryIdx: index("crv_category_idx").on(table.categoryId),
  dateIdx: index("crv_date_idx").on(table.voucherDate),
  numberIdx: uniqueIndex("crv_number_idx").on(table.businessId, table.subSystemId, table.voucherNumber),
}));

// سندات الصرف - Payment Vouchers
export const customPaymentVouchers = mysqlTable("custom_payment_vouchers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subSystemId: int("sub_system_id").notNull(),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
  voucherDate: date("voucher_date").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // من أين (الخزينة)
  treasuryId: int("treasury_id").notNull(),
  // إلى أين (الوجهة)
  destinationType: mysqlEnum("destination_type", ["person", "entity", "intermediary", "party", "other"]).notNull(),
  destinationName: varchar("destination_name", { length: 255 }),
  destinationIntermediaryId: int("destination_intermediary_id"), // إذا كان إلى حساب وسيط
  // === الحقول الجديدة ===
  partyId: int("party_id"), // ربط بجدول الأطراف
  categoryId: int("category_id"), // ربط بجدول التصنيفات
  // طريقة الدفع
  paymentMethod: mysqlEnum("payment_method", ["cash", "check", "transfer", "card", "wallet", "other"]).default("cash"),
  checkNumber: varchar("check_number", { length: 50 }),
  checkDate: date("check_date"),
  checkBank: varchar("check_bank", { length: 100 }),
  bankReference: varchar("bank_reference", { length: 100 }),
  // === نهاية الحقول الجديدة ===
  description: text("description"),
  attachments: json("attachments"),
  status: mysqlEnum("status", ["draft", "confirmed", "cancelled"]).default("draft"),
  isReconciled: boolean("is_reconciled").default(false),
  reconciledWith: int("reconciled_with"), // رقم سند القبض المطابق
  reconciledAt: timestamp("reconciled_at"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("cpv_business_idx").on(table.businessId),
  subSystemIdx: index("cpv_subsystem_idx").on(table.subSystemId),
  treasuryIdx: index("cpv_treasury_idx").on(table.treasuryId),
  partyIdx: index("cpv_party_idx").on(table.partyId),
  categoryIdx: index("cpv_category_idx").on(table.categoryId),
  dateIdx: index("cpv_date_idx").on(table.voucherDate),
  numberIdx: uniqueIndex("cpv_number_idx").on(table.businessId, table.subSystemId, table.voucherNumber),
}));

// المطابقات - Reconciliations
export const customReconciliations = mysqlTable("custom_reconciliations", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  paymentVoucherId: int("payment_voucher_id").notNull(),
  receiptVoucherId: int("receipt_voucher_id").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  confidenceScore: mysqlEnum("confidence_score", ["high", "medium", "low"]).default("medium"),
  status: mysqlEnum("status", ["pending", "confirmed", "rejected"]).default("pending"),
  notes: text("notes"),
  confirmedBy: int("confirmed_by"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// التحويلات بين الخزائن - Treasury Transfers
export const customTreasuryTransfers = mysqlTable("custom_treasury_transfers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subSystemId: int("sub_system_id").notNull(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull(),
  transferDate: date("transfer_date").notNull(),
  fromTreasuryId: int("from_treasury_id").notNull(),
  toTreasuryId: int("to_treasury_id").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1"),
  fees: decimal("fees", { precision: 18, scale: 2 }).default("0"),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "confirmed", "cancelled"]).default("draft"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Types للجداول الجديدة
export type CustomSubSystem = typeof customSubSystems.$inferSelect;
export type InsertCustomSubSystem = typeof customSubSystems.$inferInsert;
export type CustomTreasury = typeof customTreasuries.$inferSelect;
export type InsertCustomTreasury = typeof customTreasuries.$inferInsert;
export type CustomIntermediaryAccount = typeof customIntermediaryAccounts.$inferSelect;
export type InsertCustomIntermediaryAccount = typeof customIntermediaryAccounts.$inferInsert;
export type CustomReceiptVoucher = typeof customReceiptVouchers.$inferSelect;
export type InsertCustomReceiptVoucher = typeof customReceiptVouchers.$inferInsert;
export type CustomPaymentVoucher = typeof customPaymentVouchers.$inferSelect;
export type InsertCustomPaymentVoucher = typeof customPaymentVouchers.$inferInsert;
export type CustomReconciliation = typeof customReconciliations.$inferSelect;
export type InsertCustomReconciliation = typeof customReconciliations.$inferInsert;
export type CustomTreasuryTransfer = typeof customTreasuryTransfers.$inferSelect;
export type InsertCustomTreasuryTransfer = typeof customTreasuryTransfers.$inferInsert;
