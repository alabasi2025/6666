  nameEn: varchar("name_en", { length: 100 }),
  
  // الرصيد السنوي
  annualBalance: int("annual_balance").default(0),
  
  // الخصائص
  isPaid: boolean("is_paid").default(true),
  requiresApproval: boolean("requires_approval").default(true),
  allowsCarryOver: boolean("allows_carry_over").default(false),
  maxCarryOverDays: int("max_carry_over_days").default(0),
  
  // اللون
  color: varchar("color", { length: 20 }).default("#3B82F6"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// طلبات الإجازات - Leave Requests
export const leaveRequests = mysqlTable("leave_requests", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  businessId: int("business_id").notNull(),
  leaveTypeId: int("leave_type_id").notNull(),
  
  // الفترة
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: int("total_days").notNull(),
  
  // السبب
  reason: text("reason"),
  attachmentPath: varchar("attachment_path", { length: 500 }),
  
  // الحالة
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending"),
  
  // الموافقة
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// أرصدة الإجازات - Leave Balances
export const leaveBalances = mysqlTable("leave_balances", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  leaveTypeId: int("leave_type_id").notNull(),
  year: int("year").notNull(),
  
  // الرصيد
  openingBalance: int("opening_balance").default(0),
  earnedBalance: int("earned_balance").default(0),
  usedBalance: int("used_balance").default(0),
  adjustmentBalance: int("adjustment_balance").default(0),
  remainingBalance: int("remaining_balance").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تقييمات الأداء - Performance Evaluations
export const performanceEvaluations = mysqlTable("performance_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  businessId: int("business_id").notNull(),
  
  // الفترة
  evaluationPeriod: varchar("evaluation_period", { length: 50 }).notNull(),
  periodStartDate: date("period_start_date").notNull(),
  periodEndDate: date("period_end_date").notNull(),
  
  // التقييم
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  performanceRating: mysqlEnum("performance_rating", ["exceptional", "exceeds", "meets", "needs_improvement", "unsatisfactory"]),
  
  // المعايير
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  productivityScore: decimal("productivity_score", { precision: 5, scale: 2 }),
  attendanceScore: decimal("attendance_score", { precision: 5, scale: 2 }),
  teamworkScore: decimal("teamwork_score", { precision: 5, scale: 2 }),
  initiativeScore: decimal("initiative_score", { precision: 5, scale: 2 }),
  
  // الملاحظات
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  goals: text("goals"),
  managerComments: text("manager_comments"),
  employeeComments: text("employee_comments"),
  
  // المقيّم
  evaluatedBy: int("evaluated_by").notNull(),
  evaluatedAt: timestamp("evaluated_at"),
  
  // الحالة
  status: mysqlEnum("status", ["draft", "submitted", "reviewed", "acknowledged"]).default("draft"),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// العقود - Contracts
export const employeeContracts = mysqlTable("employee_contracts", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  businessId: int("business_id").notNull(),
  
  contractNumber: varchar("contract_number", { length: 50 }).notNull(),
  contractType: mysqlEnum("contract_type", ["permanent", "fixed_term", "temporary", "probation"]).default("permanent"),
  
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  
  // شروط العقد
  basicSalary: decimal("basic_salary", { precision: 15, scale: 2 }),
  probationPeriodDays: int("probation_period_days").default(90),
  noticePeriodDays: int("notice_period_days").default(30),
  
  // المستند
  documentPath: varchar("document_path", { length: 500 }),
  
  // الحالة
  status: mysqlEnum("status", ["active", "expired", "terminated", "renewed"]).default("active"),
  terminationDate: date("termination_date"),
  terminationReason: text("termination_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Types Export for HR System
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

export type JobTitle = typeof jobTitles.$inferSelect;
export type InsertJobTitle = typeof jobTitles.$inferInsert;

export type SalaryGrade = typeof salaryGrades.$inferSelect;
export type InsertSalaryGrade = typeof salaryGrades.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

export type SalaryDetail = typeof salaryDetails.$inferSelect;
export type InsertSalaryDetail = typeof salaryDetails.$inferInsert;

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type InsertPayrollRun = typeof payrollRuns.$inferInsert;

export type PayrollItem = typeof payrollItems.$inferSelect;
export type InsertPayrollItem = typeof payrollItems.$inferInsert;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

export type LeaveType = typeof leaveTypes.$inferSelect;
export type InsertLeaveType = typeof leaveTypes.$inferInsert;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;

export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type InsertLeaveBalance = typeof leaveBalances.$inferInsert;

export type PerformanceEvaluation = typeof performanceEvaluations.$inferSelect;
export type InsertPerformanceEvaluation = typeof performanceEvaluations.$inferInsert;

export type EmployeeContract = typeof employeeContracts.$inferSelect;
export type InsertEmployeeContract = typeof employeeContracts.$inferInsert;

// Custom System Types
export type CustomAccount = typeof customAccounts.$inferSelect;
export type InsertCustomAccount = typeof customAccounts.$inferInsert;
export type CustomTransaction = typeof customTransactions.$inferSelect;
export type InsertCustomTransaction = typeof customTransactions.$inferInsert;
export type CustomNote = typeof customNotes.$inferSelect;
export type InsertCustomNote = typeof customNotes.$inferInsert;
export type CustomMemo = typeof customMemos.$inferSelect;
export type InsertCustomMemo = typeof customMemos.$inferInsert;
export type NoteCategory = typeof noteCategories.$inferSelect;
export type InsertNoteCategory = typeof noteCategories.$inferInsert;


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
