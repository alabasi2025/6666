import { pgTable, varchar, integer, text, timestamp, boolean, numeric, jsonb, date, serial } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================
// نظام العملاء والفوترة المتكامل - Customer & Billing System
// مبني على نظام Smart-ELC القديم
// ============================================

// المناطق - Areas
export const areas = pgTable("areas", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  projectId: integer("project_id"),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  address: text("address"),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// المربعات - Squares
export const squares = pgTable("squares", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  areaId: integer("area_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الكابينات - Cabinets
export const cabinets = pgTable("cabinets", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  squareId: integer("square_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  cabinetType: varchar("cabinet_type", { length: 20 }).default("distribution"),
  capacity: integer("capacity"),
  currentLoad: integer("current_load").default(0),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// التعرفة - Tariffs
export const tariffs = pgTable("tariffs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  tariffType: varchar("tariff_type", { length: 20 }).default("standard"),
  serviceType: varchar("service_type", { length: 20 }).default("electricity"),
  slabs: jsonb("slabs"),
  fixedCharge: numeric("fixed_charge", { precision: 18, scale: 2 }).default("0"),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("15"),
  effectiveFrom: date("effective_from"),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// أنواع الرسوم - Fee Types
export const feeTypes = pgTable("fee_types", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  feeType: varchar("fee_type", { length: 20 }).default("fixed"),
  amount: numeric("amount", { precision: 18, scale: 2 }).default("0"),
  isRecurring: boolean("is_recurring").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// العملاء المحسن - Enhanced Customers
export const customersEnhanced = pgTable("customers_enhanced", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  projectId: integer("project_id"),
  branchId: integer("branch_id"), // الربط الإداري - الفرع الأساسي
  stationId: integer("station_id"), // الربط الإداري - المحطة الأساسية
  fullName: varchar("full_name", { length: 255 }).notNull(),
  mobileNo: varchar("mobile_no", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  nationalId: varchar("national_id", { length: 50 }),
  latitude: numeric("latitude", { precision: 10, scale: 8 }), // للميزة الخرائط
  longitude: numeric("longitude", { precision: 11, scale: 8 }), // للميزة الخرائط
  customerType: varchar("customer_type", { length: 20 }).default("residential"),
  serviceTier: varchar("service_tier", { length: 20 }).default("basic"),
  status: varchar("cust_status", { length: 20 }).default("active"),
  balanceDue: numeric("balance_due", { precision: 18, scale: 2 }).default("0"),
  userId: integer("user_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// محفظة العميل - Customer Wallet
export const customerWallets = pgTable("customer_wallets", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  lastTransactionDate: timestamp("last_transaction_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// معاملات العميل - Customer Transactions
export const customerTransactionsNew = pgTable("customer_transactions_new", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  walletId: integer("wallet_id"),
  transactionType: varchar("trans_type", { length: 20 }).notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  balanceBefore: numeric("balance_before", { precision: 18, scale: 2 }),
  balanceAfter: numeric("balance_after", { precision: 18, scale: 2 }),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  description: text("description"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// العدادات المحسن - Enhanced Meters
export const metersEnhanced = pgTable("meters_enhanced", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id"),
  branchId: integer("branch_id"), // الربط الإداري - الفرع التابع له العداد
  cabinetId: integer("cabinet_id"),
  areaId: integer("area_id"), // الربط الجغرافي - المنطقة
  squareId: integer("square_id"), // الربط الجغرافي - المربع
  tariffId: integer("tariff_id"),
  projectId: integer("project_id"),
  meterNumber: varchar("meter_number", { length: 50 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  meterType: varchar("meter_type", { length: 20 }).default("electricity"),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  category: varchar("meter_category", { length: 20 }).default("offline"),
  // حقول العنوان والموقع
  address: text("address"), // العنوان
  location: varchar("location", { length: 255 }), // الموقع
  neighborhood: varchar("neighborhood", { length: 255 }), // الجوار
  establishmentName: varchar("establishment_name", { length: 255 }), // اسم المنشأة
  latitude: numeric("latitude", { precision: 10, scale: 8 }), // للميزة الخرائط
  longitude: numeric("longitude", { precision: 11, scale: 8 }), // للميزة الخرائط
  currentReading: numeric("current_reading", { precision: 15, scale: 3 }).default("0"),
  previousReading: numeric("previous_reading", { precision: 15, scale: 3 }).default("0"),
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  balanceDue: numeric("balance_due", { precision: 18, scale: 2 }).default("0"),
  installationDate: date("installation_date"),
  installationStatus: varchar("installation_status", { length: 20 }).default("new"),
  signNumber: varchar("sign_number", { length: 50 }),
  signColor: varchar("sign_color", { length: 50 }),
  status: varchar("meter_status", { length: 20 }).default("active"),
  isActive: boolean("is_active").default(true),
  iotDeviceId: varchar("iot_device_id", { length: 100 }),
  lastSyncTime: timestamp("last_sync_time"),
  // ACREL/STS Integration Fields
  externalIntegrationType: varchar("external_integration_type", { length: 20 }).default("none"),
  acrelMeterId: varchar("acrel_meter_id", { length: 100 }),
  acrelMeterType: varchar("acrel_meter_type", { length: 20 }),
  stsMeterId: varchar("sts_meter_id", { length: 100 }),
  paymentMode: varchar("payment_mode", { length: 20 }).default("postpaid"),
  creditLimit: numeric("credit_limit", { precision: 18, scale: 2 }),
  ctInfo: jsonb("ct_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// فترات الفوترة - Billing Periods
export const billingPeriods = pgTable("billing_periods", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  projectId: integer("project_id"),
  name: varchar("name", { length: 100 }).notNull(),
  periodNumber: integer("period_number"),
  month: integer("month"),
  year: integer("year"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("period_status", { length: 20 }).default("pending"),
  readingStartDate: date("reading_start_date"),
  readingEndDate: date("reading_end_date"),
  billingDate: date("billing_date"),
  dueDate: date("due_date"),
  totalMeters: integer("total_meters").default(0),
  readMeters: integer("read_meters").default(0),
  billedMeters: integer("billed_meters").default(0),
  createdBy: integer("created_by"),
  closedBy: integer("closed_by"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// قراءات العدادات المحسن - Enhanced Meter Readings
export const meterReadingsEnhanced = pgTable("meter_readings_enhanced", {
  id: serial("id").primaryKey(),
  meterId: integer("meter_id").notNull(),
  billingPeriodId: integer("billing_period_id").notNull(),
  currentReading: numeric("current_reading", { precision: 15, scale: 3 }).notNull(),
  previousReading: numeric("previous_reading", { precision: 15, scale: 3 }),
  consumption: numeric("consumption", { precision: 15, scale: 3 }),
  readingDate: date("reading_date").notNull(),
  readingType: varchar("reading_type", { length: 20 }).default("actual"),
  status: varchar("reading_status", { length: 20 }).default("entered"),
  isEstimated: boolean("is_estimated").default(false),
  images: jsonb("images"),
  readBy: integer("read_by"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الفواتير المحسن - Enhanced Invoices
export const invoicesEnhanced = pgTable("invoices_enhanced", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id").notNull(),
  meterId: integer("meter_id"),
  meterReadingId: integer("meter_reading_id"),
  billingPeriodId: integer("billing_period_id"),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  meterNumber: varchar("meter_number", { length: 50 }),
  previousReading: numeric("previous_reading", { precision: 15, scale: 3 }),
  currentReading: numeric("current_reading", { precision: 15, scale: 3 }),
  totalConsumptionKWH: numeric("total_consumption_kwh", { precision: 15, scale: 3 }),
  priceKwh: numeric("price_kwh", { precision: 10, scale: 4 }),
  consumptionAmount: numeric("consumption_amount", { precision: 18, scale: 2 }).default("0"),
  fixedCharges: numeric("fixed_charges", { precision: 18, scale: 2 }).default("0"),
  totalFees: numeric("total_fees", { precision: 18, scale: 2 }).default("0"),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("15"),
  vatAmount: numeric("vat_amount", { precision: 18, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).default("0"),
  previousBalanceDue: numeric("previous_balance_due", { precision: 18, scale: 2 }).default("0"),
  finalAmount: numeric("final_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0"),
  balanceDue: numeric("balance_due", { precision: 18, scale: 2 }).default("0"),
  status: varchar("invoice_status", { length: 20 }).default("generated"),
  invoiceType: varchar("invoice_type", { length: 20 }).default("final"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// رسوم الفاتورة - Invoice Fees
export const invoiceFees = pgTable("invoice_fees", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  feeTypeId: integer("fee_type_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الصناديق - Cashboxes
export const cashboxes = pgTable("cashboxes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  assignedTo: integer("assigned_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// طرق الدفع - Payment Methods
export const paymentMethodsNew = pgTable("payment_methods_new", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  methodType: varchar("method_type", { length: 20 }).default("cash"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// المدفوعات المحسن - Enhanced Payments
export const paymentsEnhanced = pgTable("payments_enhanced", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id").notNull(),
  meterId: integer("meter_id"),
  invoiceId: integer("invoice_id"),
  cashboxId: integer("cashbox_id"),
  paymentMethodId: integer("payment_method_id"),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  balanceDueBefore: numeric("balance_due_before", { precision: 18, scale: 2 }),
  balanceDueAfter: numeric("balance_due_after", { precision: 18, scale: 2 }),
  payerName: varchar("payer_name", { length: 255 }),
  referenceNumber: varchar("reference_number", { length: 100 }),
  status: varchar("payment_status", { length: 20 }).default("completed"),
  notes: text("notes"),
  receivedBy: integer("received_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الإيصالات - Receipts
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  paymentId: integer("payment_id").notNull(),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull(),
  issueDate: date("issue_date").notNull(),
  description: text("description"),
  printedBy: integer("printed_by"),
  printedAt: timestamp("printed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// أكواد الشحن المسبق - Prepaid Codes
export const prepaidCodes = pgTable("prepaid_codes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  meterId: integer("meter_id"),
  code: varchar("code", { length: 100 }).notNull().unique(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  status: varchar("prepaid_status", { length: 20 }).default("active"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  generatedBy: integer("generated_by"),
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

// ============================================
// جداول الربط الإداري - Organizational Linking Tables
// ============================================

// ربط العملاء بالمحطات (many-to-many) - Customer Stations Linking
export const customerStations = pgTable("customer_stations", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  stationId: integer("station_id").notNull(),
  isPrimary: boolean("is_primary").default(false), // هل هذه المحطة الأساسية للعميل
  linkedAt: timestamp("linked_at").defaultNow().notNull(),
  linkedBy: integer("linked_by"), // المستخدم الذي قام بالربط
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ربط العملاء بالفروع (many-to-many) - Customer Branches Linking
export const customerBranches = pgTable("customer_branches", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  branchId: integer("branch_id").notNull(),
  isPrimary: boolean("is_primary").default(false), // هل هذا الفرع الأساسي للعميل
  linkedAt: timestamp("linked_at").defaultNow().notNull(),
  linkedBy: integer("linked_by"), // المستخدم الذي قام بالربط
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types for Organizational Linking
export type CustomerStation = typeof customerStations.$inferSelect;
export type InsertCustomerStation = typeof customerStations.$inferInsert;
export type CustomerBranch = typeof customerBranches.$inferSelect;
export type InsertCustomerBranch = typeof customerBranches.$inferInsert;

// ============================================
// الترحيل المالي/المحاسبي - Financial Transfers
// ============================================

// الترحيل المالي/المحاسبي - Financial Transfers
export const financialTransfers = pgTable("financial_transfers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull(),
  transferType: varchar("transfer_type", { length: 20 }).notNull(),
  transferDate: date("transfer_date").notNull(),
  periodStartDate: date("period_start_date"),
  periodEndDate: date("period_end_date"),
  // Sales (المبيعات/الفواتير)
  salesTotalAmount: numeric("sales_total_amount", { precision: 18, scale: 2 }).default("0"),
  salesCount: integer("sales_count").default(0),
  salesAccountId: integer("sales_account_id"), // حساب المبيعات في النظام المالي
  // Collections (التحصيلات/المدفوعات)
  collectionsTotalAmount: numeric("collections_total_amount", { precision: 18, scale: 2 }).default("0"),
  collectionsCount: integer("collections_count").default(0),
  collectionsAccountId: integer("collections_account_id"), // حساب التحصيلات في النظام المالي
  // Status
  status: varchar("transfer_status", { length: 20 }).default("pending"),
  journalEntryId: integer("journal_entry_id"), // رقم القيد المحاسبي في النظام المالي
  transferredAt: timestamp("transferred_at"),
  transferredBy: integer("transferred_by"),
  // Notes
  notes: text("notes"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// تفاصيل الترحيل - Transfer Details (لحفظ الفواتير والمدفوعات المرحلة)
export const financialTransferDetails = pgTable("financial_transfer_details", {
  id: serial("id").primaryKey(),
  transferId: integer("transfer_id").notNull(),
  referenceType: varchar("reference_type", { length: 20 }).notNull(),
  referenceId: integer("reference_id").notNull(), // invoice_id or payment_id
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FinancialTransfer = typeof financialTransfers.$inferSelect;
export type InsertFinancialTransfer = typeof financialTransfers.$inferInsert;
export type FinancialTransferDetail = typeof financialTransferDetails.$inferSelect;
export type InsertFinancialTransferDetail = typeof financialTransferDetails.$inferInsert;

// ============================================
// طلبات الاشتراك - Subscription Requests
// ============================================

// طلبات الاشتراك - Subscription Requests
export const subscriptionRequests = pgTable("subscription_requests", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  requestNumber: varchar("request_number", { length: 50 }).notNull(),
  stationId: integer("station_id").notNull(), // المحطة التي قدم فيها الطلب
  customerName: varchar("customer_name", { length: 255 }), // الاسم المؤقت (قبل إنشاء حساب العميل)
  customerMobile: varchar("customer_mobile", { length: 50 }),
  customerAddress: text("customer_address"),
  serviceType: varchar("service_type", { length: 20 }).default("electricity"),
  meterCategory: varchar("meter_category", { length: 20 }).default("offline"),
  requestDate: date("request_date").notNull(),
  status: varchar("status", { length: 30 }).default("pending"),
  registeredBy: integer("registered_by"), // المدير الذي سجل البيانات
  registeredAt: timestamp("registered_at"),
  materialSpecifiedBy: integer("material_specified_by"), // المهندس الذي حدد المواد
  materialSpecifiedAt: timestamp("material_specified_at"),
  materialIssuedAt: timestamp("material_issued_at"),
  installationAssignedAt: timestamp("installation_assigned_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: integer("cancelled_by"),
  cancellationReason: text("cancellation_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// تحديد المواد - Material Specifications (ما يحتاجه المهندس بعد زيارة الموقع)
export const materialSpecifications = pgTable("material_specifications", {
  id: serial("id").primaryKey(),
  subscriptionRequestId: integer("subscription_request_id").notNull(),
  operationId: integer("operation_id"), // ربط بعملية ميدانية (إذا كانت موجودة)
  specifiedBy: integer("specified_by").notNull(), // المهندس الذي حدد المواد
  specificationDate: date("specification_date").notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// بنود تحديد المواد - Material Specification Items
export const materialSpecificationItems = pgTable("material_specification_items", {
  id: serial("id").primaryKey(),
  specificationId: integer("specification_id").notNull(),
  itemId: integer("item_id").notNull(), // الصنف من المخزن
  requestedQty: numeric("requested_qty", { precision: 12, scale: 3 }).notNull(),
  approvedQty: numeric("approved_qty", { precision: 12, scale: 3 }),
  issuedQty: numeric("issued_qty", { precision: 12, scale: 3 }),
  unit: varchar("unit", { length: 20 }),
  notes: text("notes"),
});

// إصدار المواد - Material Issuances (ربط مع materialRequests)
export const materialIssuances = pgTable("material_issuances", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  issuanceNumber: varchar("issuance_number", { length: 50 }).notNull(),
  subscriptionRequestId: integer("subscription_request_id"),
  materialRequestId: integer("material_request_id"), // ربط بطلب المواد في نظام العمليات الميدانية
  specificationId: integer("specification_id"),
  operationId: integer("operation_id"),
  warehouseId: integer("warehouse_id").notNull(),
  issuedBy: integer("issued_by").notNull(),
  issuanceDate: date("issuance_date").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// بنود إصدار المواد - Material Issuance Items
export const materialIssuanceItems = pgTable("material_issuance_items", {
  id: serial("id").primaryKey(),
  issuanceId: integer("issuance_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 18, scale: 4 }),
  totalCost: numeric("total_cost", { precision: 18, scale: 2 }),
  returnedQty: numeric("returned_qty", { precision: 12, scale: 3 }).default("0"),
  notes: text("notes"),
});

// ============================================
// ربط العداد بالمخزن - Meter Inventory Items
// ============================================

// ربط العداد بالأصناف من المخزن - Meter Inventory Items
export const meterInventoryItems = pgTable("meter_inventory_items", {
  id: serial("id").primaryKey(),
  meterId: integer("meter_id").notNull(),
  itemId: integer("item_id").notNull(), // الصنف من المخزن (عداد، CT، كابل، إلخ)
  itemType: varchar("item_type", { length: 20 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).default("1"),
  unitCost: numeric("unit_cost", { precision: 18, scale: 4 }),
  totalCost: numeric("total_cost", { precision: 18, scale: 2 }),
  installationDate: date("installation_date"),
  removedDate: date("removed_date"),
  status: varchar("status", { length: 20 }).default("installed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// الختومات والقواطع - Seals & Breakers
// ============================================

// الختومات - Meter Seals (متعددة لكل عداد)
export const meterSeals = pgTable("meter_seals", {
  id: serial("id").primaryKey(),
  meterId: integer("meter_id").notNull(),
  sealName: varchar("seal_name", { length: 255 }), // اسم الختم
  sealColor: varchar("seal_color", { length: 50 }), // لون الختم
  sealNumber: varchar("seal_number", { length: 50 }).notNull(), // رقم الختم
  sealType: varchar("seal_type", { length: 50 }), // نوع الختم
  installationDate: date("installation_date"),
  removedDate: date("removed_date"),
  removedReason: text("removed_reason"),
  installedBy: integer("installed_by"),
  removedBy: integer("removed_by"),
  status: varchar("status", { length: 20 }).default("installed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// القواطع - Meter Breakers
export const meterBreakers = pgTable("meter_breakers", {
  id: serial("id").primaryKey(),
  meterId: integer("meter_id").notNull(),
  breakerType: varchar("breaker_type", { length: 50 }), // نوع القاطع
  breakerCapacity: varchar("breaker_capacity", { length: 50 }), // سعة القاطع (Ampere)
  breakerBrand: varchar("breaker_brand", { length: 100 }), // الشركة المصنعة
  breakerModel: varchar("breaker_model", { length: 100 }), // الموديل
  serialNumber: varchar("serial_number", { length: 100 }), // الرقم التسلسلي
  installationDate: date("installation_date"),
  removedDate: date("removed_date"),
  removedReason: text("removed_reason"),
  installedBy: integer("installed_by"),
  removedBy: integer("removed_by"),
  status: varchar("status", { length: 20 }).default("installed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// الشكاوى - Complaints
// ============================================

// الشكاوى - Complaints
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  complaintNumber: varchar("complaint_number", { length: 50 }).notNull(),
  customerId: integer("customer_id"),
  meterId: integer("meter_id"),
  complaintType: varchar("complaint_type", { length: 30 }).notNull(),
  priority: varchar("priority", { length: 20 }).default("medium"),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("new"),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by"),
  assignedTo: integer("assigned_to"),
  customerRating: integer("customer_rating"), // تقييم العميل للحل (1-5)
  customerFeedback: text("customer_feedback"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type SubscriptionRequest = typeof subscriptionRequests.$inferSelect;
export type InsertSubscriptionRequest = typeof subscriptionRequests.$inferInsert;
export type MaterialSpecification = typeof materialSpecifications.$inferSelect;
export type InsertMaterialSpecification = typeof materialSpecifications.$inferInsert;
export type MaterialSpecificationItem = typeof materialSpecificationItems.$inferSelect;
export type InsertMaterialSpecificationItem = typeof materialSpecificationItems.$inferInsert;
export type MaterialIssuance = typeof materialIssuances.$inferSelect;
export type InsertMaterialIssuance = typeof materialIssuances.$inferInsert;
export type MaterialIssuanceItem = typeof materialIssuanceItems.$inferSelect;
export type InsertMaterialIssuanceItem = typeof materialIssuanceItems.$inferInsert;
export type MeterInventoryItem = typeof meterInventoryItems.$inferSelect;
export type InsertMeterInventoryItem = typeof meterInventoryItems.$inferInsert;
export type MeterSeal = typeof meterSeals.$inferSelect;
export type InsertMeterSeal = typeof meterSeals.$inferInsert;
export type MeterBreaker = typeof meterBreakers.$inferSelect;
export type InsertMeterBreaker = typeof meterBreakers.$inferInsert;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = typeof complaints.$inferInsert;
