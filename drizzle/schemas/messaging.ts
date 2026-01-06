import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { customers } from "./customers";

// ============================================
// نظام الرسائل SMS/WhatsApp (Messaging)
// ============================================

// قوالب الرسائل
export const smsTemplates = mysqlTable("sms_templates", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // القالب
  templateName: varchar("template_name", { length: 255 }).notNull(), // اسم القالب
  templateType: mysqlEnum("template_type", ["invoice", "payment_reminder", "payment_confirmation", "reading_notification", "custom"]).notNull(),
  channel: mysqlEnum("channel", ["sms", "whatsapp", "email", "all"]).default("sms"), // قناة الإرسال
  
  // المحتوى
  subject: varchar("subject", { length: 255 }), // الموضوع (للبريد الإلكتروني)
  message: text("message").notNull(), // نص الرسالة
  variables: json("variables"), // المتغيرات المستخدمة في القالب (JSON)
  
  // الحالة
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // القالب الافتراضي
  
  // معلومات إضافية
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الرسائل المرسلة
export const smsMessages = mysqlTable("sms_messages", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  templateId: int("template_id"), // ربط بقالب
  
  // بيانات الرسالة
  messageType: mysqlEnum("message_type", ["invoice", "payment_reminder", "payment_confirmation", "reading_notification", "custom"]).notNull(),
  channel: mysqlEnum("channel", ["sms", "whatsapp", "email"]).notNull(),
  
  // المحتوى
  recipient: varchar("recipient", { length: 255 }).notNull(), // رقم الهاتف أو البريد الإلكتروني
  subject: varchar("subject", { length: 255 }), // الموضوع (للبريد)
  message: text("message").notNull(), // نص الرسالة
  
  // الحالة
  status: mysqlEnum("status", ["pending", "sent", "delivered", "failed", "read"]).default("pending"),
  
  // معلومات الإرسال
  provider: varchar("provider", { length: 100 }), // مقدم الخدمة (Twilio, WhatsApp Business API, etc.)
  providerMessageId: varchar("provider_message_id", { length: 100 }), // معرف الرسالة في مقدم الخدمة
  
  // التواريخ
  sentAt: timestamp("sent_at"), // تاريخ الإرسال
  deliveredAt: timestamp("delivered_at"), // تاريخ التسليم
  readAt: timestamp("read_at"), // تاريخ القراءة
  
  // الأخطاء
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  
  // إعادة المحاولة
  retryCount: int("retry_count").default(0), // عدد محاولات إعادة الإرسال
  maxRetries: int("max_retries").default(3), // الحد الأقصى للمحاولات
  nextRetryAt: timestamp("next_retry_at"), // تاريخ المحاولة التالية
  
  // معلومات إضافية
  metadata: json("metadata"), // بيانات إضافية (JSON)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مقدمي الخدمة
export const smsProviders = mysqlTable("sms_providers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // معلومات المزود
  providerName: varchar("provider_name", { length: 100 }).notNull(), // اسم المزود (Twilio, WhatsApp Business, etc.)
  providerType: mysqlEnum("provider_type", ["sms", "whatsapp", "email", "all"]).notNull(),
  
  // إعدادات API
  apiKey: varchar("api_key", { length: 255 }), // مفتاح API
  apiSecret: varchar("api_secret", { length: 255 }), // سر API
  accountSid: varchar("account_sid", { length: 255 }), // Account SID (لـ Twilio)
  authToken: varchar("auth_token", { length: 255 }), // Auth Token
  fromNumber: varchar("from_number", { length: 50 }), // رقم الإرسال (لـ SMS)
  fromEmail: varchar("from_email", { length: 255 }), // البريد الإلكتروني للإرسال (لـ Email)
  whatsappNumber: varchar("whatsapp_number", { length: 50 }), // رقم WhatsApp
  
  // إعدادات الاتصال
  apiUrl: varchar("api_url", { length: 255 }), // رابط API
  webhookUrl: varchar("webhook_url", { length: 255 }), // رابط Webhook
  
  // الحالة
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // المزود الافتراضي
  
  // معلومات إضافية
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سجل التسليم
export const smsDeliveryLog = mysqlTable("sms_delivery_log", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("message_id").notNull(), // ربط برسالة
  
  // حالة التسليم
  status: mysqlEnum("status", ["sent", "delivered", "failed", "read", "undelivered"]).notNull(),
  
  // معلومات من المزود
  providerStatus: varchar("provider_status", { length: 100 }), // حالة من مقدم الخدمة
  providerMessageId: varchar("provider_message_id", { length: 100 }), // معرف الرسالة في المزود
  
  // التواريخ
  statusDate: timestamp("status_date").defaultNow(), // تاريخ الحالة
  
  // معلومات إضافية
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  metadata: json("metadata"), // بيانات إضافية (JSON)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const smsTemplatesRelations = relations(smsTemplates, ({ many }) => ({
  messages: many(smsMessages),
}));

export const smsMessagesRelations = relations(smsMessages, ({ one, many }) => ({
  template: one(smsTemplates, {
    fields: [smsMessages.templateId],
    references: [smsTemplates.id],
  }),
  customer: one(customers, {
    fields: [smsMessages.customerId],
    references: [customers.id],
  }),
  deliveryLogs: many(smsDeliveryLog),
}));

export const smsProvidersRelations = relations(smsProviders, ({ many }) => ({
  messages: many(smsMessages),
}));

export const smsDeliveryLogRelations = relations(smsDeliveryLog, ({ one }) => ({
  message: one(smsMessages, {
    fields: [smsDeliveryLog.messageId],
    references: [smsMessages.id],
  }),
}));


