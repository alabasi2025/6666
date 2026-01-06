import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================
// نظام إدارة الدعم الحكومي (Government Support)
// ============================================

// بيانات الدعم للمشتركين
export const governmentSupportCustomers = mysqlTable("government_support_customers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  
  // بيانات الدعم
  supportType: mysqlEnum("support_type", ["electricity", "water", "gas", "mixed"]).default("electricity"),
  supportCategory: mysqlEnum("support_category", ["low_income", "disabled", "elderly", "widow", "orphan", "other"]),
  supportPercentage: decimal("support_percentage", { precision: 5, scale: 2 }).default("0"), // نسبة الدعم
  maxSupportAmount: decimal("max_support_amount", { precision: 18, scale: 2 }), // الحد الأقصى للدعم الشهري
  
  // الحصص
  monthlyQuota: decimal("monthly_quota", { precision: 15, scale: 3 }), // الحصة الشهرية (بالكيلووات/متر مكعب)
  remainingQuota: decimal("remaining_quota", { precision: 15, scale: 3 }).default("0"), // الحصة المتبقية
  
  // الاستهلاك
  totalConsumption: decimal("total_consumption", { precision: 15, scale: 3 }).default("0"), // إجمالي الاستهلاك
  supportedConsumption: decimal("supported_consumption", { precision: 15, scale: 3 }).default("0"), // الاستهلاك المدعوم
  unsupportedConsumption: decimal("unsupported_consumption", { precision: 15, scale: 3 }).default("0"), // الاستهلاك غير المدعوم
  
  // المبالغ
  totalSupportAmount: decimal("total_support_amount", { precision: 18, scale: 2 }).default("0"), // إجمالي مبلغ الدعم
  currentMonthSupport: decimal("current_month_support", { precision: 18, scale: 2 }).default("0"), // دعم الشهر الحالي
  
  // الحالة
  status: mysqlEnum("status", ["active", "suspended", "expired", "cancelled"]).default("active"),
  isActive: boolean("is_active").default(true),
  
  // التواريخ
  startDate: date("start_date"), // تاريخ بدء الدعم
  endDate: date("end_date"), // تاريخ انتهاء الدعم
  lastQuotaReset: date("last_quota_reset"), // آخر تاريخ إعادة تعيين الحصة
  
  // معلومات إضافية
  approvalNumber: varchar("approval_number", { length: 100 }), // رقم الموافقة
  approvalDate: date("approval_date"), // تاريخ الموافقة
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الحصص الشهرية
export const governmentSupportQuotas = mysqlTable("government_support_quotas", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // الفترة
  year: int("year").notNull(),
  month: int("month").notNull(), // 1-12
  
  // الحصة
  quotaType: mysqlEnum("quota_type", ["national", "regional", "category", "individual"]).default("national"),
  category: varchar("category", { length: 50 }), // فئة الدعم (low_income, disabled, etc.)
  region: varchar("region", { length: 100 }), // المنطقة
  
  // المبالغ
  totalQuota: decimal("total_quota", { precision: 15, scale: 3 }).notNull(), // إجمالي الحصة
  allocatedQuota: decimal("allocated_quota", { precision: 15, scale: 3 }).default("0"), // الحصة المخصصة
  usedQuota: decimal("used_quota", { precision: 15, scale: 3 }).default("0"), // الحصة المستخدمة
  remainingQuota: decimal("remaining_quota", { precision: 15, scale: 3 }).default("0"), // الحصة المتبقية
  
  // المبلغ
  totalBudget: decimal("total_budget", { precision: 18, scale: 2 }).notNull(), // إجمالي الميزانية
  allocatedBudget: decimal("allocated_budget", { precision: 18, scale: 2 }).default("0"), // الميزانية المخصصة
  usedBudget: decimal("used_budget", { precision: 18, scale: 2 }).default("0"), // الميزانية المستخدمة
  remainingBudget: decimal("remaining_budget", { precision: 18, scale: 2 }).default("0"), // الميزانية المتبقية
  
  // الحالة
  status: mysqlEnum("status", ["draft", "active", "closed", "cancelled"]).default("draft"),
  isActive: boolean("is_active").default(true),
  
  // معلومات إضافية
  description: text("description"),
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تتبع استهلاك الدعم
export const governmentSupportConsumption = mysqlTable("government_support_consumption", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  supportCustomerId: int("support_customer_id").notNull(), // ربط بجدول government_support_customers
  invoiceId: int("invoice_id"), // ربط بفاتورة
  
  // الفترة
  year: int("year").notNull(),
  month: int("month").notNull(), // 1-12
  
  // الاستهلاك
  totalConsumption: decimal("total_consumption", { precision: 15, scale: 3 }).notNull(), // إجمالي الاستهلاك
  supportedConsumption: decimal("supported_consumption", { precision: 15, scale: 3 }).default("0"), // الاستهلاك المدعوم
  unsupportedConsumption: decimal("unsupported_consumption", { precision: 15, scale: 3 }).default("0"), // الاستهلاك غير المدعوم
  
  // المبالغ
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).notNull(), // إجمالي المبلغ
  supportAmount: decimal("support_amount", { precision: 18, scale: 2 }).default("0"), // مبلغ الدعم
  customerAmount: decimal("customer_amount", { precision: 18, scale: 2 }).default("0"), // المبلغ المطلوب من العميل
  
  // الحصة
  quotaUsed: decimal("quota_used", { precision: 15, scale: 3 }).default("0"), // الحصة المستخدمة
  quotaRemaining: decimal("quota_remaining", { precision: 15, scale: 3 }), // الحصة المتبقية
  
  // الحالة
  status: mysqlEnum("status", ["pending", "calculated", "approved", "paid", "cancelled"]).default("pending"),
  
  // معلومات إضافية
  calculationDate: timestamp("calculation_date"), // تاريخ الحساب
  approvalDate: timestamp("approval_date"), // تاريخ الموافقة
  paymentDate: timestamp("payment_date"), // تاريخ الدفع
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تقارير صندوق الدعم
export const governmentSupportReports = mysqlTable("government_support_reports", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // الفترة
  reportType: mysqlEnum("report_type", ["daily", "monthly", "quarterly", "yearly", "custom"]).notNull(),
  year: int("year").notNull(),
  month: int("month"), // 1-12 (للتقارير الشهرية)
  startDate: date("start_date"), // للتقارير المخصصة
  endDate: date("end_date"), // للتقارير المخصصة
  
  // الإحصائيات
  totalCustomers: int("total_customers").default(0), // إجمالي العملاء المدعومين
  activeCustomers: int("active_customers").default(0), // العملاء النشطين
  totalConsumption: decimal("total_consumption", { precision: 15, scale: 3 }).default("0"), // إجمالي الاستهلاك
  supportedConsumption: decimal("supported_consumption", { precision: 15, scale: 3 }).default("0"), // الاستهلاك المدعوم
  totalSupportAmount: decimal("total_support_amount", { precision: 18, scale: 2 }).default("0"), // إجمالي مبلغ الدعم
  totalBudget: decimal("total_budget", { precision: 18, scale: 2 }).default("0"), // إجمالي الميزانية
  budgetUtilization: decimal("budget_utilization", { precision: 5, scale: 2 }).default("0"), // نسبة استغلال الميزانية
  
  // التفاصيل
  reportData: json("report_data"), // بيانات التقرير التفصيلية (JSON)
  
  // الحالة
  status: mysqlEnum("status", ["draft", "generated", "approved", "published"]).default("draft"),
  
  // معلومات إضافية
  generatedBy: int("generated_by"),
  generatedAt: timestamp("generated_at"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// إعدادات الدعم
export const governmentSupportSettings = mysqlTable("government_support_settings", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  
  // الإعدادات العامة
  settingKey: varchar("setting_key", { length: 100 }).notNull(), // مفتاح الإعداد
  settingValue: text("setting_value"), // قيمة الإعداد (JSON أو نص)
  settingType: mysqlEnum("setting_type", ["string", "number", "boolean", "json", "date"]).default("string"),
  
  // الوصف
  description: text("description"),
  category: varchar("category", { length: 50 }), // فئة الإعداد
  
  // الحالة
  isActive: boolean("is_active").default(true),
  
  // معلومات إضافية
  updatedBy: int("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Relations
export const governmentSupportCustomersRelations = relations(governmentSupportCustomers, ({ one, many }) => ({
  customer: one(customers, {
    fields: [governmentSupportCustomers.customerId],
    references: [customers.id],
  }),
  consumption: many(governmentSupportConsumption),
}));

export const governmentSupportConsumptionRelations = relations(governmentSupportConsumption, ({ one }) => ({
  supportCustomer: one(governmentSupportCustomers, {
    fields: [governmentSupportConsumption.supportCustomerId],
    references: [governmentSupportCustomers.id],
  }),
  customer: one(customers, {
    fields: [governmentSupportConsumption.customerId],
    references: [customers.id],
  }),
}));

// Import customers for relations
import { customers } from "./customers";

