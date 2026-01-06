import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================
// نظام عدادات STS (Smart Token System)
// ============================================

// عدادات STS
export const stsMeters = mysqlTable("sts_meters", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  meterId: int("meter_id"), // ربط بالعداد الأساسي
  
  // بيانات العداد STS
  stsMeterNumber: varchar("sts_meter_number", { length: 50 }).notNull(), // رقم العداد في نظام STS
  serialNumber: varchar("serial_number", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  
  // حالة العداد
  status: mysqlEnum("status", ["active", "inactive", "faulty", "disconnected"]).default("active"),
  isActive: boolean("is_active").default(true),
  
  // الرصيد والاستهلاك
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0"),
  totalConsumption: decimal("total_consumption", { precision: 15, scale: 3 }).default("0"),
  lastTokenDate: timestamp("last_token_date"),
  
  // إعدادات API
  apiProvider: varchar("api_provider", { length: 100 }), // مقدم خدمة STS
  apiConfigId: int("api_config_id"), // ربط بإعدادات API
  
  // معلومات إضافية
  installationDate: date("installation_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// إعدادات API مقدم خدمة STS
export const stsApiConfig = mysqlTable("sts_api_config", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // معلومات المزود
  providerName: varchar("provider_name", { length: 100 }).notNull(), // اسم مقدم الخدمة
  apiUrl: varchar("api_url", { length: 255 }).notNull(), // رابط API
  apiKey: varchar("api_key", { length: 255 }), // مفتاح API
  apiSecret: varchar("api_secret", { length: 255 }), // سر API
  username: varchar("username", { length: 100 }),
  password: varchar("password", { length: 255 }),
  
  // إعدادات الاتصال
  timeout: int("timeout").default(30000), // مهلة الاتصال بالمللي ثانية
  retryAttempts: int("retry_attempts").default(3), // عدد محاولات إعادة المحاولة
  retryDelay: int("retry_delay").default(1000), // تأخير إعادة المحاولة
  
  // الحالة
  isActive: boolean("is_active").default(true),
  lastTestDate: timestamp("last_test_date"),
  lastTestResult: mysqlEnum("last_test_result", ["success", "failed", "pending"]),
  lastTestMessage: text("last_test_message"),
  
  // معلومات إضافية
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// طلبات الشحن
export const stsChargeRequests = mysqlTable("sts_charge_requests", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  stsMeterId: int("sts_meter_id").notNull(),
  invoiceId: int("invoice_id"), // ربط بفاتورة (إن وُجدت)
  
  // بيانات الطلب
  requestNumber: varchar("request_number", { length: 50 }).notNull(), // رقم الطلب الفريد
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(), // المبلغ المطلوب شحنه
  currency: varchar("currency", { length: 10 }).default("SAR"),
  
  // حالة الطلب
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),
  
  // بيانات API
  apiRequestId: varchar("api_request_id", { length: 100 }), // معرف الطلب في API مقدم الخدمة
  apiRequestData: json("api_request_data"), // بيانات الطلب المرسلة
  apiResponseData: json("api_response_data"), // بيانات الاستجابة المستلمة
  
  // معلومات الدفع
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 100 }),
  
  // الأخطاء
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  
  // معلومات إضافية
  requestedBy: int("requested_by"), // المستخدم الذي طلب الشحن
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// التوكنات المُنشأة
export const stsTokens = mysqlTable("sts_tokens", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  stsMeterId: int("sts_meter_id").notNull(),
  chargeRequestId: int("charge_request_id").notNull(), // ربط بطلب الشحن
  
  // بيانات التوكن
  tokenNumber: varchar("token_number", { length: 50 }).notNull(), // رقم التوكن
  tokenCode: text("token_code"), // كود التوكن الكامل
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(), // المبلغ المشحون
  units: decimal("units", { precision: 15, scale: 3 }), // الوحدات المشحونة
  
  // حالة التوكن
  status: mysqlEnum("status", ["generated", "sent", "used", "expired", "cancelled"]).default("generated"),
  
  // معلومات الاستخدام
  usedAt: timestamp("used_at"),
  usedBy: int("used_by"), // المستخدم الذي استخدم التوكن
  
  // معلومات الإرسال
  sentAt: timestamp("sent_at"),
  sentVia: mysqlEnum("sent_via", ["sms", "email", "whatsapp", "print", "manual"]),
  sentTo: varchar("sent_to", { length: 255 }), // رقم الهاتف أو البريد
  
  // معلومات إضافية
  expiryDate: timestamp("expiry_date"), // تاريخ انتهاء التوكن
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// معاملات STS
export const stsTransactions = mysqlTable("sts_transactions", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stsMeterId: int("sts_meter_id").notNull(),
  chargeRequestId: int("charge_request_id"),
  tokenId: int("token_id"),
  
  // نوع المعاملة
  transactionType: mysqlEnum("transaction_type", ["charge", "disconnect", "reconnect", "tariff_change", "balance_inquiry"]).notNull(),
  
  // بيانات المعاملة
  amount: decimal("amount", { precision: 18, scale: 2 }),
  units: decimal("units", { precision: 15, scale: 3 }),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 2 }),
  
  // حالة المعاملة
  status: mysqlEnum("status", ["pending", "success", "failed", "cancelled"]).default("pending"),
  
  // بيانات API
  apiTransactionId: varchar("api_transaction_id", { length: 100 }),
  apiRequestData: json("api_request_data"),
  apiResponseData: json("api_response_data"),
  
  // الأخطاء
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  
  // معلومات إضافية
  processedBy: int("processed_by"),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Relations
export const stsMetersRelations = relations(stsMeters, ({ one, many }) => ({
  customer: one(customers, {
    fields: [stsMeters.customerId],
    references: [customers.id],
  }),
  apiConfig: one(stsApiConfig, {
    fields: [stsMeters.apiConfigId],
    references: [stsApiConfig.id],
  }),
  chargeRequests: many(stsChargeRequests),
  tokens: many(stsTokens),
  transactions: many(stsTransactions),
}));

export const stsApiConfigRelations = relations(stsApiConfig, ({ many }) => ({
  meters: many(stsMeters),
}));

export const stsChargeRequestsRelations = relations(stsChargeRequests, ({ one, many }) => ({
  stsMeter: one(stsMeters, {
    fields: [stsChargeRequests.stsMeterId],
    references: [stsMeters.id],
  }),
  customer: one(customers, {
    fields: [stsChargeRequests.customerId],
    references: [customers.id],
  }),
  tokens: many(stsTokens),
  transactions: many(stsTransactions),
}));

export const stsTokensRelations = relations(stsTokens, ({ one }) => ({
  stsMeter: one(stsMeters, {
    fields: [stsTokens.stsMeterId],
    references: [stsMeters.id],
  }),
  chargeRequest: one(stsChargeRequests, {
    fields: [stsTokens.chargeRequestId],
    references: [stsChargeRequests.id],
  }),
}));

export const stsTransactionsRelations = relations(stsTransactions, ({ one }) => ({
  stsMeter: one(stsMeters, {
    fields: [stsTransactions.stsMeterId],
    references: [stsMeters.id],
  }),
  chargeRequest: one(stsChargeRequests, {
    fields: [stsTransactions.chargeRequestId],
    references: [stsChargeRequests.id],
  }),
  token: one(stsTokens, {
    fields: [stsTransactions.tokenId],
    references: [stsTokens.id],
  }),
}));

// Import customers for relations
import { customers } from "./customers";

