// ============================================
// نظام العملاء والفوترة المتكامل - Customer & Billing System
// مبني على نظام Smart-ELC القديم
// ============================================

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
  date,
  datetime,
} from "drizzle-orm/mysql-core";

// ============================================
// 1. التقسيم الجغرافي - Geographic Structure
// ============================================

// المناطق - Areas
export const areas = mysqlTable("areas", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  projectId: int("project_id"),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// المربعات - Squares
export const squares = mysqlTable("squares", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  areaId: int("area_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الكابينات - Cabinets
export const cabinets = mysqlTable("cabinets", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  squareId: int("square_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  cabinetType: mysqlEnum("cabinet_type", ["main", "sub", "distribution"]).default("distribution"),
  capacity: int("capacity"),
  currentLoad: int("current_load").default(0),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 2. التعرفة - Tariffs
// ============================================

// التعرفة
export const tariffs = mysqlTable("tariffs", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  tariffType: mysqlEnum("tariff_type", ["standard", "custom", "promotional", "contract"]).default("standard"),
  serviceType: mysqlEnum("service_type", ["electricity", "water", "gas"]).default("electricity"),
  // شرائح التعرفة - JSON array of slabs
  // [{from: 0, to: 100, price: 0.18}, {from: 101, to: 200, price: 0.30}, ...]
  slabs: json("slabs"),
  fixedCharge: decimal("fixed_charge", { precision: 18, scale: 2 }).default("0"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15"),
  effectiveFrom: date("effective_from"),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// أنواع الرسوم - Fee Types
export const feeTypes = mysqlTable("fee_types", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  feeType: mysqlEnum("fee_type", ["fixed", "percentage", "per_unit"]).default("fixed"),
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0"),
  isRecurring: boolean("is_recurring").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 3. العملاء المحسن - Enhanced Customers
// ============================================

// العملاء
export const customersEnhanced = mysqlTable("customers_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  projectId: int("project_id"),
  
  // بيانات العميل الأساسية
  fullName: varchar("full_name", { length: 255 }).notNull(),
  mobileNo: varchar("mobile_no", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  nationalId: varchar("national_id", { length: 50 }),
  
  // نوع العميل ومستوى الخدمة
  customerType: mysqlEnum("customer_type", ["residential", "commercial", "industrial", "government"]).default("residential"),
  serviceTier: mysqlEnum("service_tier", ["basic", "premium", "vip"]).default("basic"),
  
  // الحالة والرصيد
  status: mysqlEnum("status", ["active", "inactive", "suspended", "closed"]).default("active"),
  balanceDue: decimal("balance_due", { precision: 18, scale: 2 }).default("0"),
  
  // ربط بالمستخدم
  userId: int("user_id"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// محفظة العميل - Customer Wallet
export const customerWallets = mysqlTable("customer_wallets", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  lastTransactionDate: timestamp("last_transaction_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// معاملات العميل - Customer Transactions
export const customerTransactions = mysqlTable("customer_transactions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(),
  walletId: int("wallet_id"),
  transactionType: mysqlEnum("transaction_type", [
    "payment", "refund", "charge", "adjustment", "deposit", "withdrawal"
  ]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 2 }),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  description: text("description"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 4. العدادات المحسن - Enhanced Meters
// ============================================

// العدادات
export const metersEnhanced = mysqlTable("meters_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id"),
  cabinetId: int("cabinet_id"),
  tariffId: int("tariff_id"),
  projectId: int("project_id"),
  
  // بيانات العداد
  meterNumber: varchar("meter_number", { length: 50 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  meterType: mysqlEnum("meter_type", ["electricity", "water", "gas"]).default("electricity"),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  
  // فئة العداد
  category: mysqlEnum("category", ["offline", "iot", "code"]).default("offline"),
  
  // القراءات
  currentReading: decimal("current_reading", { precision: 15, scale: 3 }).default("0"),
  previousReading: decimal("previous_reading", { precision: 15, scale: 3 }).default("0"),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  balanceDue: decimal("balance_due", { precision: 18, scale: 2 }).default("0"),
  
  // التركيب
  installationDate: date("installation_date"),
  installationStatus: mysqlEnum("installation_status", ["new", "used", "not_installed"]).default("new"),
  signNumber: varchar("sign_number", { length: 50 }),
  signColor: varchar("sign_color", { length: 50 }),
  
  // الحالة
  status: mysqlEnum("status", ["active", "inactive", "maintenance", "faulty", "not_installed"]).default("active"),
  isActive: boolean("is_active").default(true),
  
  // IoT
  iotDeviceId: varchar("iot_device_id", { length: 100 }),
  lastSyncTime: timestamp("last_sync_time"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 5. فترات الفوترة - Billing Periods
// ============================================

// فترات الفوترة
export const billingPeriods = mysqlTable("billing_periods", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  projectId: int("project_id"),
  
  name: varchar("name", { length: 100 }).notNull(),
  periodNumber: int("period_number"),
  month: int("month"),
  year: int("year"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  
  status: mysqlEnum("status", [
    "pending", "active", "reading_phase", "billing_phase", "closed"
  ]).default("pending"),
  
  readingStartDate: date("reading_start_date"),
  readingEndDate: date("reading_end_date"),
  billingDate: date("billing_date"),
  dueDate: date("due_date"),
  
  totalMeters: int("total_meters").default(0),
  readMeters: int("read_meters").default(0),
  billedMeters: int("billed_meters").default(0),
  
  createdBy: int("created_by"),
  closedBy: int("closed_by"),
  closedAt: timestamp("closed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 6. قراءات العدادات المحسن - Enhanced Meter Readings
// ============================================

// قراءات العدادات
export const meterReadingsEnhanced = mysqlTable("meter_readings_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  meterId: int("meter_id").notNull(),
  billingPeriodId: int("billing_period_id").notNull(),
  
  currentReading: decimal("current_reading", { precision: 15, scale: 3 }).notNull(),
  previousReading: decimal("previous_reading", { precision: 15, scale: 3 }),
  consumption: decimal("consumption", { precision: 15, scale: 3 }),
  
  readingDate: date("reading_date").notNull(),
  readingType: mysqlEnum("reading_type", ["actual", "estimated", "adjusted"]).default("actual"),
  
  status: mysqlEnum("status", ["entered", "approved", "locked", "disputed"]).default("entered"),
  isEstimated: boolean("is_estimated").default(false),
  
  // صور القراءة
  images: json("images"),
  
  // الموظف
  readBy: int("read_by"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 7. الفواتير المحسن - Enhanced Invoices
// ============================================

// الفواتير
export const invoicesEnhanced = mysqlTable("invoices_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  meterId: int("meter_id"),
  meterReadingId: int("meter_reading_id"),
  billingPeriodId: int("billing_period_id"),
  
  // رقم الفاتورة
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  
  // فترة الفاتورة
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  
  // رقم العداد (للعرض)
  meterNumber: varchar("meter_number", { length: 50 }),
  
  // الاستهلاك
  previousReading: decimal("previous_reading", { precision: 15, scale: 3 }),
  currentReading: decimal("current_reading", { precision: 15, scale: 3 }),
  totalConsumptionKWH: decimal("total_consumption_kwh", { precision: 15, scale: 3 }),
  
  // الأسعار
  priceKwh: decimal("price_kwh", { precision: 10, scale: 4 }),
  consumptionAmount: decimal("consumption_amount", { precision: 18, scale: 2 }).default("0"),
  
  // الرسوم
  fixedCharges: decimal("fixed_charges", { precision: 18, scale: 2 }).default("0"),
  totalFees: decimal("total_fees", { precision: 18, scale: 2 }).default("0"),
  
  // الضريبة
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15"),
  vatAmount: decimal("vat_amount", { precision: 18, scale: 2 }).default("0"),
  
  // المبالغ
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default("0"),
  previousBalanceDue: decimal("previous_balance_due", { precision: 18, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 2 }).default("0"),
  balanceDue: decimal("balance_due", { precision: 18, scale: 2 }).default("0"),
  
  // الحالة والنوع
  status: mysqlEnum("status", ["generated", "partial", "approved", "locked", "paid", "cancelled"]).default("generated"),
  invoiceType: mysqlEnum("invoice_type", ["partial", "final"]).default("final"),
  
  // الاعتماد
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  
  // الإنشاء
  createdBy: int("created_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// رسوم الفاتورة - Invoice Fees
export const invoiceFees = mysqlTable("invoice_fees", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoice_id").notNull(),
  feeTypeId: int("fee_type_id").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 8. المدفوعات والإيصالات - Payments & Receipts
// ============================================

// الصناديق - Cashboxes
export const cashboxes = mysqlTable("cashboxes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  
  assignedTo: int("assigned_to"),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// طرق الدفع - Payment Methods
export const paymentMethods = mysqlTable("payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  methodType: mysqlEnum("method_type", ["cash", "card", "bank_transfer", "check", "online", "sadad", "wallet"]).default("cash"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// المدفوعات المحسن
export const paymentsEnhanced = mysqlTable("payments_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  meterId: int("meter_id"),
  invoiceId: int("invoice_id"),
  cashboxId: int("cashbox_id"),
  paymentMethodId: int("payment_method_id"),
  
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  balanceDueBefore: decimal("balance_due_before", { precision: 18, scale: 2 }),
  balanceDueAfter: decimal("balance_due_after", { precision: 18, scale: 2 }),
  
  payerName: varchar("payer_name", { length: 255 }),
  referenceNumber: varchar("reference_number", { length: 100 }),
  
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("completed"),
  
  notes: text("notes"),
  receivedBy: int("received_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الإيصالات
export const receipts = mysqlTable("receipts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  paymentId: int("payment_id").notNull(),
  
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull(),
  issueDate: date("issue_date").notNull(),
  
  description: text("description"),
  
  printedBy: int("printed_by"),
  printedAt: timestamp("printed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 9. أكواد الشحن المسبق - Prepaid Codes
// ============================================

// أكواد الشحن
export const prepaidCodes = mysqlTable("prepaid_codes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  meterId: int("meter_id"),
  
  code: varchar("code", { length: 100 }).notNull().unique(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  
  status: mysqlEnum("status", ["active", "used", "expired", "cancelled"]).default("active"),
  
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  
  generatedBy: int("generated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Type Exports
// ============================================

export type Area = typeof areas.$inferSelect;
export type InsertArea = typeof areas.$inferInsert;
export type Square = typeof squares.$inferSelect;
export type InsertSquare = typeof squares.$inferInsert;
export type Cabinet = typeof cabinets.$inferSelect;
export type InsertCabinet = typeof cabinets.$inferInsert;
export type Tariff = typeof tariffs.$inferSelect;
export type InsertTariff = typeof tariffs.$inferInsert;
export type FeeType = typeof feeTypes.$inferSelect;
export type InsertFeeType = typeof feeTypes.$inferInsert;
export type CustomerEnhanced = typeof customersEnhanced.$inferSelect;
export type InsertCustomerEnhanced = typeof customersEnhanced.$inferInsert;
export type CustomerWallet = typeof customerWallets.$inferSelect;
export type InsertCustomerWallet = typeof customerWallets.$inferInsert;
export type CustomerTransaction = typeof customerTransactions.$inferSelect;
export type InsertCustomerTransaction = typeof customerTransactions.$inferInsert;
export type MeterEnhanced = typeof metersEnhanced.$inferSelect;
export type InsertMeterEnhanced = typeof metersEnhanced.$inferInsert;
export type BillingPeriod = typeof billingPeriods.$inferSelect;
export type InsertBillingPeriod = typeof billingPeriods.$inferInsert;
export type MeterReadingEnhanced = typeof meterReadingsEnhanced.$inferSelect;
export type InsertMeterReadingEnhanced = typeof meterReadingsEnhanced.$inferInsert;
export type InvoiceEnhanced = typeof invoicesEnhanced.$inferSelect;
export type InsertInvoiceEnhanced = typeof invoicesEnhanced.$inferInsert;
export type InvoiceFee = typeof invoiceFees.$inferSelect;
export type InsertInvoiceFee = typeof invoiceFees.$inferInsert;
export type Cashbox = typeof cashboxes.$inferSelect;
export type InsertCashbox = typeof cashboxes.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;
export type PaymentEnhanced = typeof paymentsEnhanced.$inferSelect;
export type InsertPaymentEnhanced = typeof paymentsEnhanced.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;
export type PrepaidCode = typeof prepaidCodes.$inferSelect;
export type InsertPrepaidCode = typeof prepaidCodes.$inferInsert;
