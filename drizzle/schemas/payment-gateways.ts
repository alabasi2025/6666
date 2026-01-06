import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { customers } from "./customers";

// ============================================
// نظام تكامل بوابات الدفع (Payment Gateways)
// ============================================

// بوابات الدفع
export const paymentGateways = mysqlTable("payment_gateways", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // معلومات البوابة
  gatewayName: varchar("gateway_name", { length: 100 }).notNull(), // اسم البوابة (مثل: Stripe, PayPal, Tap, etc.)
  gatewayType: mysqlEnum("gateway_type", ["credit_card", "bank_transfer", "wallet", "crypto", "other"]).default("credit_card"),
  
  // إعدادات API
  apiKey: varchar("api_key", { length: 255 }), // مفتاح API
  apiSecret: varchar("api_secret", { length: 255 }), // سر API
  merchantId: varchar("merchant_id", { length: 100 }), // معرف التاجر
  webhookSecret: varchar("webhook_secret", { length: 255 }), // سر Webhook
  
  // إعدادات الاتصال
  apiUrl: varchar("api_url", { length: 255 }), // رابط API
  testMode: boolean("test_mode").default(false), // وضع الاختبار
  sandboxApiKey: varchar("sandbox_api_key", { length: 255 }), // مفتاح API للاختبار
  sandboxApiSecret: varchar("sandbox_api_secret", { length: 255 }), // سر API للاختبار
  
  // الإعدادات الإضافية
  config: json("config"), // إعدادات إضافية (JSON)
  
  // الحالة
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // البوابة الافتراضية
  
  // معلومات إضافية
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// معاملات الدفع
export const paymentTransactions = mysqlTable("payment_transactions", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  invoiceId: int("invoice_id"), // ربط بفاتورة
  gatewayId: int("gateway_id").notNull(), // ربط ببوابة الدفع
  
  // بيانات المعاملة
  transactionNumber: varchar("transaction_number", { length: 100 }).notNull(), // رقم المعاملة الفريد
  gatewayTransactionId: varchar("gateway_transaction_id", { length: 100 }), // معرف المعاملة في البوابة
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(), // المبلغ
  currency: varchar("currency", { length: 10 }).default("SAR"), // العملة
  
  // حالة المعاملة
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled", "refunded"]).default("pending"),
  
  // بيانات الدفع
  paymentMethod: varchar("payment_method", { length: 50 }), // طريقة الدفع (card, bank_transfer, etc.)
  cardLast4: varchar("card_last4", { length: 4 }), // آخر 4 أرقام من البطاقة
  cardBrand: varchar("card_brand", { length: 50 }), // نوع البطاقة (Visa, Mastercard, etc.)
  
  // بيانات API
  requestData: json("request_data"), // بيانات الطلب المرسلة
  responseData: json("response_data"), // بيانات الاستجابة المستلمة
  
  // Webhook
  webhookReceived: boolean("webhook_received").default(false), // تم استلام Webhook
  webhookData: json("webhook_data"), // بيانات Webhook
  
  // الأخطاء
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  
  // التواريخ
  initiatedAt: timestamp("initiated_at").defaultNow(), // تاريخ البدء
  completedAt: timestamp("completed_at"), // تاريخ الإكمال
  failedAt: timestamp("failed_at"), // تاريخ الفشل
  
  // معلومات إضافية
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// إعدادات البوابة
export const paymentGatewayConfig = mysqlTable("payment_gateway_config", {
  id: int("id").autoincrement().primaryKey(),
  gatewayId: int("gateway_id").notNull(),
  businessId: int("business_id").notNull(),
  
  // الإعدادات
  configKey: varchar("config_key", { length: 100 }).notNull(), // مفتاح الإعداد
  configValue: text("config_value"), // قيمة الإعداد
  configType: mysqlEnum("config_type", ["string", "number", "boolean", "json"]).default("string"),
  
  // معلومات إضافية
  description: text("description"),
  isEncrypted: boolean("is_encrypted").default(false), // مشفر
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// استقبال Webhooks
export const paymentWebhooks = mysqlTable("payment_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  gatewayId: int("gateway_id").notNull(),
  transactionId: int("transaction_id"), // ربط بمعاملة
  
  // بيانات Webhook
  eventType: varchar("event_type", { length: 100 }).notNull(), // نوع الحدث
  payload: json("payload").notNull(), // بيانات Webhook
  
  // التحقق
  signature: varchar("signature", { length: 255 }), // التوقيع للتحقق
  isValid: boolean("is_valid").default(false), // صحيح
  
  // المعالجة
  processed: boolean("processed").default(false), // تمت المعالجة
  processedAt: timestamp("processed_at"), // تاريخ المعالجة
  errorMessage: text("error_message"), // رسالة خطأ في المعالجة
  
  // معلومات إضافية
  ipAddress: varchar("ip_address", { length: 50 }), // عنوان IP
  userAgent: varchar("user_agent", { length: 255 }), // User Agent
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const paymentGatewaysRelations = relations(paymentGateways, ({ one, many }) => ({
  transactions: many(paymentTransactions),
  configs: many(paymentGatewayConfig),
  webhooks: many(paymentWebhooks),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one, many }) => ({
  gateway: one(paymentGateways, {
    fields: [paymentTransactions.gatewayId],
    references: [paymentGateways.id],
  }),
  customer: one(customers, {
    fields: [paymentTransactions.customerId],
    references: [customers.id],
  }),
  webhooks: many(paymentWebhooks),
}));

export const paymentGatewayConfigRelations = relations(paymentGatewayConfig, ({ one }) => ({
  gateway: one(paymentGateways, {
    fields: [paymentGatewayConfig.gatewayId],
    references: [paymentGateways.id],
  }),
}));

export const paymentWebhooksRelations = relations(paymentWebhooks, ({ one }) => ({
  gateway: one(paymentGateways, {
    fields: [paymentWebhooks.gatewayId],
    references: [paymentGateways.id],
  }),
  transaction: one(paymentTransactions, {
    fields: [paymentWebhooks.transactionId],
    references: [paymentTransactions.id],
  }),
}));


