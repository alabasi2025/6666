/**
 * نظام الوسيط - Intermediary System
 * نظام منفصل لإدارة الحسابات الوسيطة بين الأنظمة الفرعية
 * يدعم ربط حساب وسيط بعدة أنظمة فرعية
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ============================================
// 1. الحسابات الوسيطة المحسنة - Enhanced Intermediary Accounts
// ============================================

/**
 * جدول الحسابات الوسيطة
 * كل حساب وسيط يمكن ربطه بعدة أنظمة فرعية
 */
export const intermediaryAccounts = mysqlTable("intermediary_accounts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // معلومات الحساب الأساسية
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  
  // الرصيد والعملة
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  
  // إعدادات الحساب
  accountType: mysqlEnum("account_type", [
    "transfer",      // تحويلات بين الأنظمة
    "settlement",    // تسويات
    "clearing",      // مقاصة
    "suspense",      // معلقات
    "other"          // أخرى
  ]).default("transfer"),
  
  // هل يجب أن يتصفر الرصيد؟
  mustBeZero: boolean("must_be_zero").default(true),
  
  // تنبيه عند وجود رصيد معلق
  alertOnBalance: boolean("alert_on_balance").default(true),
  alertThreshold: decimal("alert_threshold", { precision: 18, scale: 2 }).default("0"),
  
  // الحالة
  isActive: boolean("is_active").default(true),
  
  // التتبع
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 2. ربط الحسابات الوسيطة بالأنظمة الفرعية
// ============================================

/**
 * جدول ربط الحسابات الوسيطة بالأنظمة الفرعية
 * علاقة many-to-many
 */
export const intermediaryAccountSubSystems = mysqlTable("intermediary_account_sub_systems", {
  id: int("id").autoincrement().primaryKey(),
  intermediaryAccountId: int("intermediary_account_id").notNull(),
  subSystemId: int("sub_system_id").notNull(),
  
  // صلاحيات النظام الفرعي على هذا الحساب
  canDebit: boolean("can_debit").default(true),   // يمكنه الإضافة (مدين)
  canCredit: boolean("can_credit").default(true), // يمكنه الخصم (دائن)
  
  // الحد الأقصى للعمليات (اختياري)
  maxTransactionAmount: decimal("max_transaction_amount", { precision: 18, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 3. حركات الحسابات الوسيطة
// ============================================

/**
 * جدول حركات الحسابات الوسيطة
 * يسجل كل عملية على الحساب الوسيط
 */
export const intermediaryAccountMovements = mysqlTable("intermediary_account_movements", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  intermediaryAccountId: int("intermediary_account_id").notNull(),
  
  // النظام الفرعي المصدر
  subSystemId: int("sub_system_id").notNull(),
  
  // نوع الحركة
  movementType: mysqlEnum("movement_type", [
    "debit",   // مدين (إضافة للحساب)
    "credit"   // دائن (خصم من الحساب)
  ]).notNull(),
  
  // المبلغ
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  
  // الرصيد قبل وبعد
  balanceBefore: decimal("balance_before", { precision: 18, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 2 }),
  
  // مرجع العملية الأصلية
  referenceType: mysqlEnum("reference_type", [
    "receipt_voucher",   // سند قبض
    "payment_voucher",   // سند صرف
    "transfer",          // تحويل
    "adjustment",        // تسوية
    "manual"             // يدوي
  ]),
  referenceId: int("reference_id"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  
  // الوصف
  description: text("description"),
  
  // حالة التسوية
  isReconciled: boolean("is_reconciled").default(false),
  reconciledWith: int("reconciled_with"), // معرف الحركة المقابلة
  reconciledAt: timestamp("reconciled_at"),
  reconciledBy: int("reconciled_by"),
  
  // التتبع
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 4. تسويات الحسابات الوسيطة
// ============================================

/**
 * جدول تسويات الحسابات الوسيطة
 * يربط حركتين متقابلتين لتصفير الحساب
 */
export const intermediaryReconciliations = mysqlTable("intermediary_reconciliations", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  intermediaryAccountId: int("intermediary_account_id").notNull(),
  
  // الحركة الأولى (مدين)
  debitMovementId: int("debit_movement_id").notNull(),
  debitSubSystemId: int("debit_sub_system_id").notNull(),
  
  // الحركة الثانية (دائن)
  creditMovementId: int("credit_movement_id").notNull(),
  creditSubSystemId: int("credit_sub_system_id").notNull(),
  
  // المبلغ المسوى
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  
  // ملاحظات
  notes: text("notes"),
  
  // التتبع
  reconciledBy: int("reconciled_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 5. إحصائيات الحسابات الوسيطة
// ============================================

/**
 * جدول ملخص يومي للحسابات الوسيطة
 * للتقارير والمتابعة
 */
export const intermediaryDailySummary = mysqlTable("intermediary_daily_summary", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  intermediaryAccountId: int("intermediary_account_id").notNull(),
  
  // التاريخ
  summaryDate: timestamp("summary_date").notNull(),
  
  // الأرصدة
  openingBalance: decimal("opening_balance", { precision: 18, scale: 2 }).default("0"),
  closingBalance: decimal("closing_balance", { precision: 18, scale: 2 }).default("0"),
  
  // إجمالي الحركات
  totalDebit: decimal("total_debit", { precision: 18, scale: 2 }).default("0"),
  totalCredit: decimal("total_credit", { precision: 18, scale: 2 }).default("0"),
  
  // عدد الحركات
  debitCount: int("debit_count").default(0),
  creditCount: int("credit_count").default(0),
  
  // الحركات المعلقة
  pendingDebit: decimal("pending_debit", { precision: 18, scale: 2 }).default("0"),
  pendingCredit: decimal("pending_credit", { precision: 18, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Types
// ============================================

export type IntermediaryAccount = typeof intermediaryAccounts.$inferSelect;
export type InsertIntermediaryAccount = typeof intermediaryAccounts.$inferInsert;

export type IntermediaryAccountSubSystem = typeof intermediaryAccountSubSystems.$inferSelect;
export type InsertIntermediaryAccountSubSystem = typeof intermediaryAccountSubSystems.$inferInsert;

export type IntermediaryAccountMovement = typeof intermediaryAccountMovements.$inferSelect;
export type InsertIntermediaryAccountMovement = typeof intermediaryAccountMovements.$inferInsert;

export type IntermediaryReconciliation = typeof intermediaryReconciliations.$inferSelect;
export type InsertIntermediaryReconciliation = typeof intermediaryReconciliations.$inferInsert;

export type IntermediaryDailySummary = typeof intermediaryDailySummary.$inferSelect;
export type InsertIntermediaryDailySummary = typeof intermediaryDailySummary.$inferInsert;
