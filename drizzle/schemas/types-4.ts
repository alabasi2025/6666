export type DieselSupplier = typeof dieselSuppliers.$inferSelect;
export type InsertDieselSupplier = typeof dieselSuppliers.$inferInsert;
export type DieselTanker = typeof dieselTankers.$inferSelect;
export type InsertDieselTanker = typeof dieselTankers.$inferInsert;
export type DieselTank = typeof dieselTanks.$inferSelect;
export type InsertDieselTank = typeof dieselTanks.$inferInsert;
export type DieselTankOpening = typeof dieselTankOpenings.$inferSelect;
export type InsertDieselTankOpening = typeof dieselTankOpenings.$inferInsert;
export type DieselPipe = typeof dieselPipes.$inferSelect;
export type InsertDieselPipe = typeof dieselPipes.$inferInsert;
export type StationDieselConfig = typeof stationDieselConfig.$inferSelect;
export type InsertStationDieselConfig = typeof stationDieselConfig.$inferInsert;
export type StationDieselPath = typeof stationDieselPath.$inferSelect;
export type InsertStationDieselPath = typeof stationDieselPath.$inferInsert;
export type DieselPumpMeter = typeof dieselPumpMeters.$inferSelect;
export type InsertDieselPumpMeter = typeof dieselPumpMeters.$inferInsert;
export type DieselReceivingTask = typeof dieselReceivingTasks.$inferSelect;
export type InsertDieselReceivingTask = typeof dieselReceivingTasks.$inferInsert;
export type DieselPumpReading = typeof dieselPumpReadings.$inferSelect;
export type InsertDieselPumpReading = typeof dieselPumpReadings.$inferInsert;
export type DieselTankMovement = typeof dieselTankMovements.$inferSelect;
export type InsertDieselTankMovement = typeof dieselTankMovements.$inferInsert;
export type GeneratorDieselConsumption = typeof generatorDieselConsumption.$inferSelect;
export type InsertGeneratorDieselConsumption = typeof generatorDieselConsumption.$inferInsert;


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
