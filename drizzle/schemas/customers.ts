import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// 8. نظام العملاء والفوترة - Customers & Billing
// ============================================

// العملاء
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  stationId: int("station_id"),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", ["residential", "commercial", "industrial", "government", "agricultural"]).default("residential"),
  category: varchar("category", { length: 50 }),
  idType: mysqlEnum("id_type", ["national_id", "iqama", "passport", "cr"]),
  idNumber: varchar("id_number", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  tariffId: int("tariff_id"),
  connectionDate: date("connection_date"),
  status: mysqlEnum("status", ["active", "suspended", "disconnected", "closed"]).default("active"),
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0"),
  depositAmount: decimal("deposit_amount", { precision: 18, scale: 2 }).default("0"),
  creditLimit: decimal("credit_limit", { precision: 18, scale: 2 }),
  accountId: int("account_id"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// العدادات
export const meters = mysqlTable("meters", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  meterNumber: varchar("meter_number", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["single_phase", "three_phase", "smart", "prepaid"]).default("single_phase"),
  status: mysqlEnum("status", ["active", "inactive", "faulty", "replaced"]).default("active"),
  installationDate: date("installation_date"),
  lastReadingDate: date("last_reading_date"),
  lastReading: decimal("last_reading", { precision: 15, scale: 3 }),
  multiplier: decimal("multiplier", { precision: 10, scale: 4 }).default("1"),
  maxLoad: decimal("max_load", { precision: 10, scale: 2 }),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// قراءات العدادات
export const meterReadings = mysqlTable("meter_readings", {
  id: int("id").autoincrement().primaryKey(),
  meterId: int("meter_id").notNull(),
  readingDate: date("reading_date").notNull(),
  readingValue: decimal("reading_value", { precision: 15, scale: 3 }).notNull(),
  previousReading: decimal("previous_reading", { precision: 15, scale: 3 }),
  consumption: decimal("consumption", { precision: 15, scale: 3 }),
  readingType: mysqlEnum("reading_type", ["actual", "estimated", "adjusted"]).default("actual"),
  readBy: int("read_by"),
  image: text("image"),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "verified", "billed", "disputed"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الفواتير
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  customerId: int("customer_id").notNull(),
  meterId: int("meter_id"),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  readingId: int("reading_id"),
  consumption: decimal("consumption", { precision: 15, scale: 3 }),
  consumptionAmount: decimal("consumption_amount", { precision: 18, scale: 2 }).default("0"),
  fixedCharges: decimal("fixed_charges", { precision: 18, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 2 }).default("0"),
  otherCharges: decimal("other_charges", { precision: 18, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 2 }).default("0"),
  previousBalance: decimal("previous_balance", { precision: 18, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 2 }).default("0"),
  balanceDue: decimal("balance_due", { precision: 18, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "issued", "sent", "partial", "paid", "overdue", "cancelled"]).default("draft"),
  journalEntryId: int("journal_entry_id"),
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// المدفوعات
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  customerId: int("customer_id").notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "bank_transfer", "check", "online", "sadad"]).default("cash"),
  referenceNumber: varchar("reference_number", { length: 100 }),
  bankAccountId: int("bank_account_id"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("completed"),
  notes: text("notes"),
  journalEntryId: int("journal_entry_id"),
  receivedBy: int("received_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
