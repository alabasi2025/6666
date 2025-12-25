import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// نظام العملاء والفوترة المتكامل - Customer & Billing System
// مبني على نظام Smart-ELC القديم
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

// التعرفة - Tariffs
export const tariffs = mysqlTable("tariffs", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  tariffType: mysqlEnum("tariff_type", ["standard", "custom", "promotional", "contract"]).default("standard"),
  serviceType: mysqlEnum("service_type", ["electricity", "water", "gas"]).default("electricity"),
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

// العملاء المحسن - Enhanced Customers
export const customersEnhanced = mysqlTable("customers_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  projectId: int("project_id"),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  mobileNo: varchar("mobile_no", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  nationalId: varchar("national_id", { length: 50 }),
  customerType: mysqlEnum("customer_type", ["residential", "commercial", "industrial", "government"]).default("residential"),
  serviceTier: mysqlEnum("service_tier", ["basic", "premium", "vip"]).default("basic"),
  status: mysqlEnum("cust_status", ["active", "inactive", "suspended", "closed"]).default("active"),
  balanceDue: decimal("balance_due", { precision: 18, scale: 2 }).default("0"),
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
export const customerTransactionsNew = mysqlTable("customer_transactions_new", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(),
  walletId: int("wallet_id"),
  transactionType: mysqlEnum("trans_type", ["payment", "refund", "charge", "adjustment", "deposit", "withdrawal"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 2 }),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  description: text("description"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// العدادات المحسن - Enhanced Meters
export const metersEnhanced = mysqlTable("meters_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id"),
  cabinetId: int("cabinet_id"),
  tariffId: int("tariff_id"),
  projectId: int("project_id"),
  meterNumber: varchar("meter_number", { length: 50 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  meterType: mysqlEnum("meter_type", ["electricity", "water", "gas"]).default("electricity"),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  category: mysqlEnum("meter_category", ["offline", "iot", "code"]).default("offline"),
  currentReading: decimal("current_reading", { precision: 15, scale: 3 }).default("0"),
  previousReading: decimal("previous_reading", { precision: 15, scale: 3 }).default("0"),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  balanceDue: decimal("balance_due", { precision: 18, scale: 2 }).default("0"),
  installationDate: date("installation_date"),
  installationStatus: mysqlEnum("installation_status", ["new", "used", "not_installed"]).default("new"),
  signNumber: varchar("sign_number", { length: 50 }),
  signColor: varchar("sign_color", { length: 50 }),
  status: mysqlEnum("meter_status", ["active", "inactive", "maintenance", "faulty", "not_installed"]).default("active"),
  isActive: boolean("is_active").default(true),
  iotDeviceId: varchar("iot_device_id", { length: 100 }),
  lastSyncTime: timestamp("last_sync_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// فترات الفوترة - Billing Periods
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
  status: mysqlEnum("period_status", ["pending", "active", "reading_phase", "billing_phase", "closed"]).default("pending"),
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

// قراءات العدادات المحسن - Enhanced Meter Readings
export const meterReadingsEnhanced = mysqlTable("meter_readings_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  meterId: int("meter_id").notNull(),
  billingPeriodId: int("billing_period_id").notNull(),
  currentReading: decimal("current_reading", { precision: 15, scale: 3 }).notNull(),
  previousReading: decimal("previous_reading", { precision: 15, scale: 3 }),
  consumption: decimal("consumption", { precision: 15, scale: 3 }),
  readingDate: date("reading_date").notNull(),
  readingType: mysqlEnum("reading_type", ["actual", "estimated", "adjusted"]).default("actual"),
  status: mysqlEnum("reading_status", ["entered", "approved", "locked", "disputed"]).default("entered"),
  isEstimated: boolean("is_estimated").default(false),
  images: json("images"),
  readBy: int("read_by"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الفواتير المحسن - Enhanced Invoices
export const invoicesEnhanced = mysqlTable("invoices_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  meterId: int("meter_id"),
  meterReadingId: int("meter_reading_id"),
  billingPeriodId: int("billing_period_id"),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  meterNumber: varchar("meter_number", { length: 50 }),
  previousReading: decimal("previous_reading", { precision: 15, scale: 3 }),
  currentReading: decimal("current_reading", { precision: 15, scale: 3 }),
  totalConsumptionKWH: decimal("total_consumption_kwh", { precision: 15, scale: 3 }),
  priceKwh: decimal("price_kwh", { precision: 10, scale: 4 }),
  consumptionAmount: decimal("consumption_amount", { precision: 18, scale: 2 }).default("0"),
  fixedCharges: decimal("fixed_charges", { precision: 18, scale: 2 }).default("0"),
  totalFees: decimal("total_fees", { precision: 18, scale: 2 }).default("0"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15"),
  vatAmount: decimal("vat_amount", { precision: 18, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default("0"),
  previousBalanceDue: decimal("previous_balance_due", { precision: 18, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 2 }).default("0"),
  balanceDue: decimal("balance_due", { precision: 18, scale: 2 }).default("0"),
  status: mysqlEnum("invoice_status", ["generated", "partial", "approved", "locked", "paid", "cancelled"]).default("generated"),
  invoiceType: mysqlEnum("invoice_type", ["partial", "final"]).default("final"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
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
export const paymentMethodsNew = mysqlTable("payment_methods_new", {
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

// المدفوعات المحسن - Enhanced Payments
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
  status: mysqlEnum("payment_status", ["pending", "completed", "failed", "refunded"]).default("completed"),
  notes: text("notes"),
  receivedBy: int("received_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الإيصالات - Receipts
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

// أكواد الشحن المسبق - Prepaid Codes
export const prepaidCodes = mysqlTable("prepaid_codes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  meterId: int("meter_id"),
  code: varchar("code", { length: 100 }).notNull().unique(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  status: mysqlEnum("prepaid_status", ["active", "used", "expired", "cancelled"]).default("active"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  generatedBy: int("generated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer System Types
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
export type CustomerTransactionNew = typeof customerTransactionsNew.$inferSelect;
export type InsertCustomerTransactionNew = typeof customerTransactionsNew.$inferInsert;
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
export type PaymentMethodNew = typeof paymentMethodsNew.$inferSelect;
export type InsertPaymentMethodNew = typeof paymentMethodsNew.$inferInsert;
export type PaymentEnhanced = typeof paymentsEnhanced.$inferSelect;
export type InsertPaymentEnhanced = typeof paymentsEnhanced.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;
export type PrepaidCode = typeof prepaidCodes.$inferSelect;
export type InsertPrepaidCode = typeof prepaidCodes.$inferInsert;

