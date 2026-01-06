import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { customers } from "./customers";

// ============================================
// نظام دعم المرحلة الانتقالية (Transition Support)
// ============================================

// مراقبة استهلاك الدعم
export const transitionSupportMonitoring = mysqlTable("transition_support_monitoring", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  
  // الفترة
  year: int("year").notNull(),
  month: int("month").notNull(), // 1-12
  
  // الاستهلاك
  totalConsumption: decimal("total_consumption", { precision: 15, scale: 3 }).default("0"), // إجمالي الاستهلاك
  supportedConsumption: decimal("supported_consumption", { precision: 15, scale: 3 }).default("0"), // الاستهلاك المدعوم
  transitionConsumption: decimal("transition_consumption", { precision: 15, scale: 3 }).default("0"), // الاستهلاك في المرحلة الانتقالية
  
  // المبالغ
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default("0"), // إجمالي المبلغ
  supportAmount: decimal("support_amount", { precision: 18, scale: 2 }).default("0"), // مبلغ الدعم
  customerAmount: decimal("customer_amount", { precision: 18, scale: 2 }).default("0"), // المبلغ المطلوب من العميل
  
  // الاتجاهات
  consumptionTrend: mysqlEnum("consumption_trend", ["increasing", "stable", "decreasing"]), // اتجاه الاستهلاك
  supportUtilization: decimal("support_utilization", { precision: 5, scale: 2 }), // نسبة استغلال الدعم
  
  // الحالة
  status: mysqlEnum("status", ["normal", "warning", "critical", "exceeded"]).default("normal"),
  
  // معلومات إضافية
  lastUpdated: timestamp("last_updated").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الإشعارات الاستباقية
export const transitionSupportNotifications = mysqlTable("transition_support_notifications", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  
  // نوع الإشعار
  notificationType: mysqlEnum("notification_type", ["quota_warning", "quota_exceeded", "consumption_increase", "support_ending", "custom"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // المحتوى
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  templateId: int("template_id"), // ربط بقالب الإشعار
  
  // الحالة
  status: mysqlEnum("status", ["pending", "sent", "delivered", "failed", "read"]).default("pending"),
  
  // قنوات الإرسال
  sendVia: mysqlEnum("send_via", ["sms", "email", "whatsapp", "push", "all"]).default("all"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  
  // معلومات إضافية
  metadata: json("metadata"), // بيانات إضافية (JSON)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تعديلات الفوترة
export const transitionSupportBillingAdjustments = mysqlTable("transition_support_billing_adjustments", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  invoiceId: int("invoice_id"), // ربط بفاتورة
  
  // نوع التعديل
  adjustmentType: mysqlEnum("adjustment_type", ["support_reduction", "support_extension", "consumption_limit", "tariff_change", "custom"]).notNull(),
  
  // التعديل
  originalAmount: decimal("original_amount", { precision: 18, scale: 2 }).notNull(), // المبلغ الأصلي
  adjustedAmount: decimal("adjusted_amount", { precision: 18, scale: 2 }).notNull(), // المبلغ المعدل
  adjustmentAmount: decimal("adjustment_amount", { precision: 18, scale: 2 }).notNull(), // قيمة التعديل
  
  // القواعد المطبقة
  appliedRules: json("applied_rules"), // القواعد التي تم تطبيقها (JSON)
  
  // الحالة
  status: mysqlEnum("status", ["draft", "applied", "reversed", "cancelled"]).default("draft"),
  
  // التواريخ
  effectiveDate: date("effective_date"), // تاريخ السريان
  appliedAt: timestamp("applied_at"), // تاريخ التطبيق
  reversedAt: timestamp("reversed_at"), // تاريخ العكس
  
  // معلومات إضافية
  reason: text("reason"), // سبب التعديل
  approvedBy: int("approved_by"), // من وافق على التعديل
  approvedAt: timestamp("approved_at"), // تاريخ الموافقة
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// التنبيهات
export const transitionSupportAlerts = mysqlTable("transition_support_alerts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  
  // نوع التنبيه
  alertType: mysqlEnum("alert_type", ["quota_threshold", "consumption_spike", "support_exhaustion", "billing_anomaly", "custom"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).default("warning"),
  
  // المحتوى
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // القيم
  thresholdValue: decimal("threshold_value", { precision: 18, scale: 2 }), // قيمة العتبة
  currentValue: decimal("current_value", { precision: 18, scale: 2 }), // القيمة الحالية
  
  // الحالة
  status: mysqlEnum("status", ["active", "acknowledged", "resolved", "dismissed"]).default("active"),
  
  // التواريخ
  triggeredAt: timestamp("triggered_at").defaultNow(), // تاريخ التفعيل
  acknowledgedAt: timestamp("acknowledged_at"), // تاريخ الاعتراف
  resolvedAt: timestamp("resolved_at"), // تاريخ الحل
  
  // معلومات إضافية
  acknowledgedBy: int("acknowledged_by"), // من اعترف بالتنبيه
  resolvedBy: int("resolved_by"), // من حل التنبيه
  resolution: text("resolution"), // الحل المطبق
  metadata: json("metadata"), // بيانات إضافية (JSON)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// قواعد المرحلة الانتقالية
export const transitionSupportRules = mysqlTable("transition_support_rules", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // القاعدة
  ruleName: varchar("rule_name", { length: 255 }).notNull(), // اسم القاعدة
  ruleType: mysqlEnum("rule_type", ["consumption_limit", "support_reduction", "tariff_adjustment", "notification_trigger", "custom"]).notNull(),
  
  // الشروط
  conditions: json("conditions"), // شروط القاعدة (JSON)
  
  // الإجراءات
  actions: json("actions"), // الإجراءات المطلوبة (JSON)
  
  // الأولوية
  priority: int("priority").default(0), // أولوية القاعدة
  
  // الحالة
  isActive: boolean("is_active").default(true),
  
  // التواريخ
  startDate: date("start_date"), // تاريخ البدء
  endDate: date("end_date"), // تاريخ الانتهاء
  
  // معلومات إضافية
  description: text("description"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Relations
export const transitionSupportMonitoringRelations = relations(transitionSupportMonitoring, ({ one }) => ({
  customer: one(customers, {
    fields: [transitionSupportMonitoring.customerId],
    references: [customers.id],
  }),
}));

export const transitionSupportNotificationsRelations = relations(transitionSupportNotifications, ({ one }) => ({
  customer: one(customers, {
    fields: [transitionSupportNotifications.customerId],
    references: [customers.id],
  }),
}));

export const transitionSupportBillingAdjustmentsRelations = relations(transitionSupportBillingAdjustments, ({ one }) => ({
  customer: one(customers, {
    fields: [transitionSupportBillingAdjustments.customerId],
    references: [transitionSupportBillingAdjustments.id],
  }),
}));

export const transitionSupportAlertsRelations = relations(transitionSupportAlerts, ({ one }) => ({
  customer: one(customers, {
    fields: [transitionSupportAlerts.customerId],
    references: [customers.id],
  }),
}));


