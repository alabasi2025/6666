import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// 3. النظام المحاسبي - Accounting System
// ============================================

// شجرة الحسابات - هيكل جديد يتفرع من أسماء الأنظمة
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: int("parent_id"),
  level: int("level").default(1),
  // النظام الذي ينتمي إليه الحساب (بدلاً من التصنيف المحاسبي التقليدي)
  systemModule: mysqlEnum("system_module", [
    "assets",           // إدارة الأصول
    "maintenance",      // الصيانة
    "inventory",        // المخزون
    "procurement",      // المشتريات
    "customers",        // العملاء
    "billing",          // الفوترة
    "scada",            // المراقبة والتحكم
    "projects",         // المشاريع
    "hr",               // الموارد البشرية
    "operations",       // العمليات
    "finance",          // المالية العامة
    "general"           // عام
  ]).notNull(),
  // نوع الحساب داخل النظام
  accountType: mysqlEnum("account_type", [
    "main",             // حساب رئيسي
    "sub",              // حساب فرعي
    "detail"            // حساب تفصيلي
  ]).default("detail"),
  nature: mysqlEnum("nature", ["debit", "credit"]).notNull(),
  isParent: boolean("is_parent").default(false),
  isActive: boolean("is_active").default(true),
  isCashAccount: boolean("is_cash_account").default(false),
  isBankAccount: boolean("is_bank_account").default(false),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  openingBalance: decimal("opening_balance", { precision: 18, scale: 2 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0"),
  description: text("description"),
  // ربط الحساب بكيان محدد (مستودع، عميل، مورد، مشروع، إلخ)
  linkedEntityType: varchar("linked_entity_type", { length: 50 }),
  linkedEntityId: int("linked_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الفترات المحاسبية
export const fiscalPeriods = mysqlTable("fiscal_periods", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  year: int("year").notNull(),
  period: int("period").notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: mysqlEnum("status", ["open", "closed", "locked"]).default("open"),
  closedBy: int("closed_by"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// القيود اليومية
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  entryNumber: varchar("entry_number", { length: 50 }).notNull(),
  entryDate: date("entry_date").notNull(),
  periodId: int("period_id").notNull(),
  type: mysqlEnum("type", [
    "manual", "auto", "opening", "closing", "adjustment",
    "invoice", "payment", "receipt", "transfer", "depreciation"
  ]).default("manual"),
  sourceModule: varchar("source_module", { length: 50 }),
  sourceId: int("source_id"),
  description: text("description"),
  totalDebit: decimal("total_debit", { precision: 18, scale: 2 }).default("0"),
  totalCredit: decimal("total_credit", { precision: 18, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "posted", "reversed"]).default("draft"),
  postedBy: int("posted_by"),
  postedAt: timestamp("posted_at"),
  reversedBy: int("reversed_by"),
  reversedAt: timestamp("reversed_at"),
  reversalEntryId: int("reversal_entry_id"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تفاصيل القيود
export const journalEntryLines = mysqlTable("journal_entry_lines", {
  id: int("id").autoincrement().primaryKey(),
  entryId: int("entry_id").notNull(),
  lineNumber: int("line_number").notNull(),
  accountId: int("account_id").notNull(),
  costCenterId: int("cost_center_id"),
  description: text("description"),
  debit: decimal("debit", { precision: 18, scale: 2 }).default("0"),
  credit: decimal("credit", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مراكز التكلفة
export const costCenters = mysqlTable("cost_centers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: int("parent_id"),
  level: int("level").default(1),
  type: mysqlEnum("type", ["station", "department", "project", "activity"]),
  stationId: int("station_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
