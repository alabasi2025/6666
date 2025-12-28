/**
 * النظام المخصص (Custom System) - الإصدار 2.2.0
 * 
 * نظام محاسبي ومالي مستقل ومتكامل يعمل ضمن النظام الرئيسي
 * يدعم: القيد المزدوج، العملات المتعددة، الأرصدة التفصيلية
 * 
 * التغييرات الرئيسية في v2.2.0:
 * - إضافة نظام العملات وأسعار الصرف
 * - تحويل الخزائن إلى حسابات تفصيلية
 * - إضافة نظام القيود اليومية (Journal Entries)
 * - دعم الأرصدة متعددة العملات
 * - إضافة الأنواع الفرعية للحسابات
 */

import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  date,
  timestamp,
  mysqlEnum,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ============================================================================
// الجداول الجديدة في v2.2.0
// ============================================================================

/**
 * جدول العملات - Currencies
 * يحتوي على جميع العملات المستخدمة في النظام
 */
export const customCurrencies = mysqlTable("custom_currencies", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // معلومات العملة
  code: varchar("code", { length: 10 }).notNull(), // SAR, USD, EUR
  nameAr: varchar("name_ar", { length: 100 }).notNull(), // ريال سعودي
  nameEn: varchar("name_en", { length: 100 }), // Saudi Riyal
  symbol: varchar("symbol", { length: 10 }), // ر.س
  
  // الإعدادات
  isBaseCurrency: boolean("is_base_currency").default(false).notNull(), // العملة الأساسية
  isActive: boolean("is_active").default(true).notNull(),
  decimalPlaces: int("decimal_places").default(2).notNull(), // عدد المنازل العشرية
  
  // الترتيب والعرض
  displayOrder: int("display_order").default(0),
  notes: text("notes"),
  
  // التتبع
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("ccur_business_idx").on(table.businessId),
  codeIdx: index("ccur_code_idx").on(table.code),
  businessCodeUnique: uniqueIndex("ccur_business_code_unique").on(table.businessId, table.code),
  isActiveIdx: index("ccur_is_active_idx").on(table.isActive),
}));

/**
 * جدول أسعار الصرف - Exchange Rates
 * يحتوي على أسعار تحويل العملات
 */
export const customExchangeRates = mysqlTable("custom_exchange_rates", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // العملات
  fromCurrencyId: int("from_currency_id").notNull(), // من عملة
  toCurrencyId: int("to_currency_id").notNull(), // إلى عملة
  
  // سعر الصرف
  rate: decimal("rate", { precision: 18, scale: 6 }).notNull(), // السعر (6 منازل عشرية للدقة)
  effectiveDate: date("effective_date").notNull(), // تاريخ السريان
  expiryDate: date("expiry_date"), // تاريخ الانتهاء (اختياري)
  
  // معلومات إضافية
  source: varchar("source", { length: 100 }), // مصدر السعر (مثلاً: البنك المركزي)
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  
  // التتبع
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("cexr_business_idx").on(table.businessId),
  fromCurrencyIdx: index("cexr_from_currency_idx").on(table.fromCurrencyId),
  toCurrencyIdx: index("cexr_to_currency_idx").on(table.toCurrencyId),
  effectiveDateIdx: index("cexr_effective_date_idx").on(table.effectiveDate),
  isActiveIdx: index("cexr_is_active_idx").on(table.isActive),
  currenciesDateIdx: index("cexr_currencies_date_idx").on(
    table.fromCurrencyId,
    table.toCurrencyId,
    table.effectiveDate
  ),
}));

/**
 * جدول الأنواع الفرعية للحسابات - Account Sub Types
 * يحدد التصنيفات الفرعية لكل نوع حساب (مثلاً: صندوق، بنك، محفظة)
 */
export const customAccountSubTypes = mysqlTable("custom_account_sub_types", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // النوع الرئيسي والفرعي
  accountType: mysqlEnum("account_type", [
    "asset",      // أصول
    "liability",  // التزامات
    "equity",     // حقوق ملكية
    "revenue",    // إيرادات
    "expense",    // مصروفات
  ]).notNull(),
  
  // معلومات النوع الفرعي
  code: varchar("code", { length: 50 }).notNull(), // كود فريد
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  description: text("description"),
  
  // الإعدادات
  isActive: boolean("is_active").default(true).notNull(),
  allowMultipleCurrencies: boolean("allow_multiple_currencies").default(false).notNull(),
  requiresParty: boolean("requires_party").default(false).notNull(), // يتطلب طرف (عميل/مورد)
  
  // أيقونة ولون
  icon: varchar("icon", { length: 50 }), // اسم الأيقونة
  color: varchar("color", { length: 20 }), // لون العرض
  
  // الترتيب
  displayOrder: int("display_order").default(0),
  
  // التتبع
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("cast_business_idx").on(table.businessId),
  accountTypeIdx: index("cast_account_type_idx").on(table.accountType),
  codeIdx: index("cast_code_idx").on(table.code),
  businessCodeUnique: uniqueIndex("cast_business_code_unique").on(table.businessId, table.code),
  isActiveIdx: index("cast_is_active_idx").on(table.isActive),
}));

/**
 * جدول عملات الحسابات - Account Currencies
 * يربط الحسابات بالعملات المسموح بها (للحسابات متعددة العملات)
 */
export const customAccountCurrencies = mysqlTable("custom_account_currencies", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // الحساب والعملة
  accountId: int("account_id").notNull(),
  currencyId: int("currency_id").notNull(),
  
  // الإعدادات
  isDefault: boolean("is_default").default(false).notNull(), // العملة الافتراضية للحساب
  isActive: boolean("is_active").default(true).notNull(),
  
  // التتبع
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("cacr_business_idx").on(table.businessId),
  accountIdx: index("cacr_account_idx").on(table.accountId),
  currencyIdx: index("cacr_currency_idx").on(table.currencyId),
  accountCurrencyUnique: uniqueIndex("cacr_account_currency_unique").on(
    table.accountId,
    table.currencyId
  ),
}));

/**
 * جدول أرصدة الحسابات - Account Balances
 * يحفظ الرصيد الحالي لكل حساب بكل عملة
 */
export const customAccountBalances = mysqlTable("custom_account_balances", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // الحساب والعملة
  accountId: int("account_id").notNull(),
  currencyId: int("currency_id").notNull(),
  
  // الأرصدة
  debitBalance: decimal("debit_balance", { precision: 18, scale: 2 }).default("0.00").notNull(), // الرصيد المدين
  creditBalance: decimal("credit_balance", { precision: 18, scale: 2 }).default("0.00").notNull(), // الرصيد الدائن
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0.00").notNull(), // الرصيد الحالي (مدين - دائن)
  
  // آخر تحديث
  lastTransactionDate: date("last_transaction_date"),
  lastTransactionId: int("last_transaction_id"),
  
  // التتبع
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("cabl_business_idx").on(table.businessId),
  accountIdx: index("cabl_account_idx").on(table.accountId),
  currencyIdx: index("cabl_currency_idx").on(table.currencyId),
  accountCurrencyUnique: uniqueIndex("cabl_account_currency_unique").on(
    table.accountId,
    table.currencyId
  ),
  lastTransactionIdx: index("cabl_last_transaction_idx").on(table.lastTransactionDate),
}));

/**
 * جدول القيود اليومية - Journal Entries
 * يحتوي على رأس القيد اليومي (القيد المزدوج)
 */
export const customJournalEntries = mysqlTable("custom_journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subSystemId: int("sub_system_id"), // النظام الفرعي (إن وجد)
  
  // معلومات القيد
  entryNumber: varchar("entry_number", { length: 50 }).notNull(), // رقم القيد
  entryDate: date("entry_date").notNull(), // تاريخ القيد
  entryType: mysqlEnum("entry_type", [
    "manual",           // قيد يدوي
    "opening",          // قيد افتتاحي
    "closing",          // قيد إقفال
    "adjustment",       // قيد تسوية
    "reversal",         // قيد عكسي
    "system_generated", // قيد تلقائي من النظام
  ]).notNull(),
  
  // الوصف
  description: text("description").notNull(),
  notes: text("notes"),
  
  // المرجع
  referenceType: varchar("reference_type", { length: 50 }), // نوع المرجع (receipt_voucher, payment_voucher, etc.)
  referenceId: int("reference_id"), // معرف المرجع
  referenceNumber: varchar("reference_number", { length: 50 }), // رقم المرجع
  
  // الحالة
  status: mysqlEnum("status", [
    "draft",      // مسودة
    "posted",     // مرحّل
    "reversed",   // معكوس
    "cancelled",  // ملغى
  ]).default("draft").notNull(),
  
  // الترحيل
  postedAt: timestamp("posted_at"),
  postedBy: int("posted_by"),
  
  // الإلغاء/العكس
  reversedAt: timestamp("reversed_at"),
  reversedBy: int("reversed_by"),
  reversalEntryId: int("reversal_entry_id"), // معرف القيد العكسي
  
  // التتبع
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdx: index("cje_business_idx").on(table.businessId),
  subSystemIdx: index("cje_sub_system_idx").on(table.subSystemId),
  entryNumberIdx: index("cje_entry_number_idx").on(table.entryNumber),
  entryDateIdx: index("cje_entry_date_idx").on(table.entryDate),
  entryTypeIdx: index("cje_entry_type_idx").on(table.entryType),
  statusIdx: index("cje_status_idx").on(table.status),
  referenceIdx: index("cje_reference_idx").on(table.referenceType, table.referenceId),
  businessNumberUnique: uniqueIndex("cje_business_number_unique").on(
    table.businessId,
    table.entryNumber
  ),
}));

/**
 * جدول سطور القيود اليومية - Journal Entry Lines
 * يحتوي على تفاصيل كل قيد (الحسابات المدينة والدائنة)
 */
export const customJournalEntryLines = mysqlTable("custom_journal_entry_lines", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // القيد الرئيسي
  journalEntryId: int("journal_entry_id").notNull(),
  
  // الحساب
  accountId: int("account_id").notNull(),
  
  // المبالغ
  debitAmount: decimal("debit_amount", { precision: 18, scale: 2 }).default("0.00").notNull(), // المبلغ المدين
  creditAmount: decimal("credit_amount", { precision: 18, scale: 2 }).default("0.00").notNull(), // المبلغ الدائن
  currencyId: int("currency_id").notNull(), // العملة
  
  // سعر الصرف (إذا كانت العملة غير العملة الأساسية)
  exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default("1.000000"),
  debitAmountBase: decimal("debit_amount_base", { precision: 18, scale: 2 }).default("0.00").notNull(), // المبلغ بالعملة الأساسية
  creditAmountBase: decimal("credit_amount_base", { precision: 18, scale: 2 }).default("0.00").notNull(),
  
  // الوصف
  description: text("description"),
  
  // الطرف (إن وجد)
  partyId: int("party_id"), // الطرف المرتبط بهذا السطر
  
  // مركز التكلفة (للتوسع المستقبلي)
  costCenterId: int("cost_center_id"),
  
  // الترتيب
  lineOrder: int("line_order").default(0).notNull(),
  
  // التتبع
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("cjel_business_idx").on(table.businessId),
  journalEntryIdx: index("cjel_journal_entry_idx").on(table.journalEntryId),
  accountIdx: index("cjel_account_idx").on(table.accountId),
  currencyIdx: index("cjel_currency_idx").on(table.currencyId),
  partyIdx: index("cjel_party_idx").on(table.partyId),
}));

// ============================================================================
// Types للجداول الجديدة
// ============================================================================

export type CustomCurrency = typeof customCurrencies.$inferSelect;
export type InsertCustomCurrency = typeof customCurrencies.$inferInsert;

export type CustomExchangeRate = typeof customExchangeRates.$inferSelect;
export type InsertCustomExchangeRate = typeof customExchangeRates.$inferInsert;

export type CustomAccountSubType = typeof customAccountSubTypes.$inferSelect;
export type InsertCustomAccountSubType = typeof customAccountSubTypes.$inferInsert;

export type CustomAccountCurrency = typeof customAccountCurrencies.$inferSelect;
export type InsertCustomAccountCurrency = typeof customAccountCurrencies.$inferInsert;

export type CustomAccountBalance = typeof customAccountBalances.$inferSelect;
export type InsertCustomAccountBalance = typeof customAccountBalances.$inferInsert;

export type CustomJournalEntry = typeof customJournalEntries.$inferSelect;
export type InsertCustomJournalEntry = typeof customJournalEntries.$inferInsert;

export type CustomJournalEntryLine = typeof customJournalEntryLines.$inferSelect;
export type InsertCustomJournalEntryLine = typeof customJournalEntryLines.$inferInsert;
