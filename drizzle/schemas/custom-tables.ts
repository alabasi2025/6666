import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// النظام المخصص - الجداول الجديدة (إصلاح الفجوات)
// Custom System - New Tables (Gap Fixes)
// ============================================

// الأطراف - Parties (عملاء، موردين، موظفين، جهات)
export const customParties = mysqlTable("custom_parties", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subSystemId: int("sub_system_id"), // يمكن ربط الطرف بنظام فرعي محدد
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  partyType: mysqlEnum("party_type", ["customer", "supplier", "employee", "partner", "government", "other"]).notNull(),
  // بيانات التواصل
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Saudi Arabia"),
  // بيانات ضريبية/تجارية
  taxNumber: varchar("tax_number", { length: 50 }),
  commercialRegister: varchar("commercial_register", { length: 50 }),
  // الحدود والأرصدة
  creditLimit: decimal("credit_limit", { precision: 18, scale: 2 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0"), // موجب = له، سالب = عليه
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // معلومات إضافية
  contactPerson: varchar("contact_person", { length: 255 }),
  notes: text("notes"),
  tags: json("tags"),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("cp_business_idx").on(table.businessId),
  subSystemIdx: index("cp_subsystem_idx").on(table.subSystemId),
  codeIdx: uniqueIndex("cp_code_idx").on(table.businessId, table.code),
  partyTypeIdx: index("cp_party_type_idx").on(table.businessId, table.partyType),
  nameIdx: index("cp_name_idx").on(table.nameAr),
}));

// التصنيفات/البنود - Categories (بنود الإيرادات والمصروفات)
export const customCategories = mysqlTable("custom_categories", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subSystemId: int("sub_system_id"), // يمكن ربط التصنيف بنظام فرعي محدد
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  categoryType: mysqlEnum("category_type", ["income", "expense", "both"]).notNull(),
  parentId: int("parent_id"), // للتصنيفات الهرمية
  level: int("level").default(1),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  // ربط بالحساب المحاسبي (اختياري)
  linkedAccountId: int("linked_account_id"),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("cc_business_idx").on(table.businessId),
  parentIdx: index("cc_parent_idx").on(table.parentId),
  codeIdx: uniqueIndex("cc_code_idx").on(table.businessId, table.code),
  typeIdx: index("cc_type_idx").on(table.businessId, table.categoryType),
}));

// حركات الخزينة - Treasury Movements (سجل كل حركة على الخزينة)
export const customTreasuryMovements = mysqlTable("custom_treasury_movements", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  treasuryId: int("treasury_id").notNull(),
  movementType: mysqlEnum("movement_type", [
    "receipt",        // قبض
    "payment",        // صرف
    "transfer_in",    // تحويل وارد
    "transfer_out",   // تحويل صادر
    "adjustment",     // تسوية
    "opening"         // رصيد افتتاحي
  ]).notNull(),
  movementDate: date("movement_date").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // مرجع الحركة
  referenceType: varchar("reference_type", { length: 50 }), // 'receipt_voucher', 'payment_voucher', 'transfer'
  referenceId: int("reference_id"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  description: text("description"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  treasuryIdx: index("ctm_treasury_idx").on(table.treasuryId),
  dateIdx: index("ctm_date_idx").on(table.movementDate),
  typeIdx: index("ctm_type_idx").on(table.movementType),
  refIdx: index("ctm_ref_idx").on(table.referenceType, table.referenceId),
  treasuryDateIdx: index("ctm_treasury_date_idx").on(table.treasuryId, table.movementDate),
}));

// حركات الأطراف - Party Transactions (سجل كل حركة مع طرف)
export const customPartyTransactions = mysqlTable("custom_party_transactions", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  partyId: int("party_id").notNull(),
  transactionType: mysqlEnum("transaction_type", [
    "receipt",        // قبض منه
    "payment",        // صرف له
    "invoice",        // فاتورة
    "credit_note",    // إشعار دائن
    "debit_note",     // إشعار مدين
    "adjustment"      // تسوية
  ]).notNull(),
  transactionDate: date("transaction_date").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // مرجع الحركة
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  description: text("description"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  partyIdx: index("cpt_party_idx").on(table.partyId),
  dateIdx: index("cpt_date_idx").on(table.transactionDate),
  typeIdx: index("cpt_type_idx").on(table.transactionType),
  refIdx: index("cpt_ref_idx").on(table.referenceType, table.referenceId),
  partyDateIdx: index("cpt_party_date_idx").on(table.partyId, table.transactionDate),
}));

// إعدادات النظام المخصص - Custom System Settings
export const customSettings = mysqlTable("custom_settings", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subSystemId: int("sub_system_id"), // إعدادات خاصة بنظام فرعي
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  settingValue: text("setting_value"),
  settingType: mysqlEnum("setting_type", ["string", "number", "boolean", "json"]).default("string"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Types للجداول الجديدة
export type CustomParty = typeof customParties.$inferSelect;
export type InsertCustomParty = typeof customParties.$inferInsert;
export type CustomCategory = typeof customCategories.$inferSelect;
export type InsertCustomCategory = typeof customCategories.$inferInsert;
export type CustomTreasuryMovement = typeof customTreasuryMovements.$inferSelect;
export type InsertCustomTreasuryMovement = typeof customTreasuryMovements.$inferInsert;
export type CustomPartyTransaction = typeof customPartyTransactions.$inferSelect;
export type InsertCustomPartyTransaction = typeof customPartyTransactions.$inferInsert;
export type CustomSetting = typeof customSettings.$inferSelect;
export type InsertCustomSetting = typeof customSettings.$inferInsert;
