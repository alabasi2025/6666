// Types Export
// ============================================

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = typeof branches.$inferInsert;

export type Station = typeof stations.$inferSelect;
export type InsertStation = typeof stations.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = typeof workOrders.$inferInsert;

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

export type IntegrationConfig = typeof integrationConfigs.$inferSelect;
export type InsertIntegrationConfig = typeof integrationConfigs.$inferInsert;

export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertIntegrationLog = typeof integrationLogs.$inferInsert;

export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = typeof systemEvents.$inferInsert;

export type EventSubscription = typeof eventSubscriptions.$inferSelect;
export type InsertEventSubscription = typeof eventSubscriptions.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = typeof apiLogs.$inferInsert;

export type AiModel = typeof aiModels.$inferSelect;
export type InsertAiModel = typeof aiModels.$inferInsert;

export type AiPrediction = typeof aiPredictions.$inferSelect;
export type InsertAiPrediction = typeof aiPredictions.$inferInsert;

export type TechnicalAlertRule = typeof technicalAlertRules.$inferSelect;
export type InsertTechnicalAlertRule = typeof technicalAlertRules.$inferInsert;

export type TechnicalAlert = typeof technicalAlerts.$inferSelect;
export type InsertTechnicalAlert = typeof technicalAlerts.$inferInsert;

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

export type IncomingWebhook = typeof incomingWebhooks.$inferSelect;
export type InsertIncomingWebhook = typeof incomingWebhooks.$inferInsert;

export type FieldOperation = typeof fieldOperations.$inferSelect;
export type InsertFieldOperation = typeof fieldOperations.$inferInsert;

export type OperationStatusLog = typeof operationStatusLog.$inferSelect;
export type InsertOperationStatusLog = typeof operationStatusLog.$inferInsert;

export type InstallationDetail = typeof installationDetails.$inferSelect;
export type InsertInstallationDetail = typeof installationDetails.$inferInsert;

export type InstallationPhoto = typeof installationPhotos.$inferSelect;
export type InsertInstallationPhoto = typeof installationPhotos.$inferInsert;

export type FieldTeam = typeof fieldTeams.$inferSelect;
export type InsertFieldTeam = typeof fieldTeams.$inferInsert;

export type FieldWorker = typeof fieldWorkers.$inferSelect;
export type InsertFieldWorker = typeof fieldWorkers.$inferInsert;

export type WorkerLocation = typeof workerLocations.$inferSelect;
export type InsertWorkerLocation = typeof workerLocations.$inferInsert;

export type WorkerPerformance = typeof workerPerformance.$inferSelect;
export type InsertWorkerPerformance = typeof workerPerformance.$inferInsert;

export type WorkerIncentive = typeof workerIncentives.$inferSelect;
export type InsertWorkerIncentive = typeof workerIncentives.$inferInsert;

export type MaterialRequest = typeof materialRequests.$inferSelect;
export type InsertMaterialRequest = typeof materialRequests.$inferInsert;

export type MaterialRequestItem = typeof materialRequestItems.$inferSelect;
export type InsertMaterialRequestItem = typeof materialRequestItems.$inferInsert;

export type FieldEquipmentType = typeof fieldEquipment.$inferSelect;
export type InsertFieldEquipment = typeof fieldEquipment.$inferInsert;

export type EquipmentMovement = typeof equipmentMovements.$inferSelect;
export type InsertEquipmentMovement = typeof equipmentMovements.$inferInsert;

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = typeof inspections.$inferInsert;

export type InspectionItem = typeof inspectionItems.$inferSelect;
export type InsertInspectionItem = typeof inspectionItems.$inferInsert;

export type InspectionChecklist = typeof inspectionChecklists.$inferSelect;
export type InsertInspectionChecklist = typeof inspectionChecklists.$inferInsert;

export type OperationApproval = typeof operationApprovals.$inferSelect;
export type InsertOperationApproval = typeof operationApprovals.$inferInsert;

export type OperationPayment = typeof operationPayments.$inferSelect;
export type InsertOperationPayment = typeof operationPayments.$inferInsert;

export type PeriodSettlement = typeof periodSettlements.$inferSelect;
export type InsertPeriodSettlement = typeof periodSettlements.$inferInsert;

export type SettlementItem = typeof settlementItems.$inferSelect;
export type InsertSettlementItem = typeof settlementItems.$inferInsert;

// ============================================
// 13. نظام الموارد البشرية - Human Resources System
// ============================================

// الأقسام - Departments
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  parentId: int("parent_id"),
  managerId: int("manager_id"),
  costCenterId: int("cost_center_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// المسميات الوظيفية - Job Titles/Positions
export const jobTitles = mysqlTable("job_titles", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  titleAr: varchar("title_ar", { length: 100 }).notNull(),
  titleEn: varchar("title_en", { length: 100 }),
  departmentId: int("department_id"),
  gradeId: int("grade_id"),
  level: int("level").default(1),
  description: text("description"),
  responsibilities: text("responsibilities"),
  requirements: text("requirements"),
  headcount: int("headcount").default(1),
  currentCount: int("current_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// سلم الرواتب - Salary Grades
export const salaryGrades = mysqlTable("salary_grades", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  minSalary: decimal("min_salary", { precision: 15, scale: 2 }),
  maxSalary: decimal("max_salary", { precision: 15, scale: 2 }),
  housingAllowancePct: decimal("housing_allowance_pct", { precision: 5, scale: 2 }).default("0"),
  transportAllowance: decimal("transport_allowance", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الموظفين - Employees
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  employeeNumber: varchar("employee_number", { length: 20 }).notNull(),
  
  // البيانات الشخصية
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  fullNameAr: varchar("full_name_ar", { length: 200 }),
  fullNameEn: varchar("full_name_en", { length: 200 }),
  
  // الهوية
  idType: mysqlEnum("id_type", ["national_id", "passport", "residence"]).default("national_id"),
  idNumber: varchar("id_number", { length: 50 }).notNull(),
  idExpiryDate: date("id_expiry_date"),
  
  nationality: varchar("nationality", { length: 50 }),
  gender: mysqlEnum("gender", ["male", "female"]).default("male"),
  dateOfBirth: date("date_of_birth"),
  placeOfBirth: varchar("place_of_birth", { length: 100 }),
  maritalStatus: mysqlEnum("marital_status", ["single", "married", "divorced", "widowed"]).default("single"),
  
  // معلومات الاتصال
  phone: varchar("phone", { length: 20 }),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }),
  personalEmail: varchar("personal_email", { length: 100 }),
  
  // العنوان
  address: text("address"),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  
  // جهة الاتصال في الطوارئ
  emergencyContactName: varchar("emergency_contact_name", { length: 100 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  emergencyContactRelation: varchar("emergency_contact_relation", { length: 50 }),
  
  // الصورة
  photoPath: varchar("photo_path", { length: 500 }),
  
  // بيانات التوظيف
  hireDate: date("hire_date").notNull(),
  probationEndDate: date("probation_end_date"),
  contractType: mysqlEnum("contract_type", ["permanent", "contract", "temporary", "part_time"]).default("permanent"),
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  
  // الوظيفة
  jobTitleId: int("job_title_id"),
  departmentId: int("department_id"),
  managerId: int("manager_id"),
  isManager: boolean("is_manager").default(false),
  
  // الموقع
  workLocation: varchar("work_location", { length: 100 }),
  stationId: int("station_id"),
  branchId: int("branch_id"),
  
  // ساعات العمل
  workSchedule: mysqlEnum("work_schedule", ["full_time", "shift", "flexible"]).default("full_time"),
  workingHoursPerWeek: decimal("working_hours_per_week", { precision: 5, scale: 2 }).default("40"),
  
  // الربط بالعمليات الميدانية
  fieldWorkerId: int("field_worker_id"),
  
  // الحالة
  status: mysqlEnum("status", ["active", "inactive", "terminated", "suspended", "on_leave"]).default("active"),
  terminationDate: date("termination_date"),
  terminationReason: text("termination_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// بيانات الراتب - Salary Details
export const salaryDetails = mysqlTable("salary_details", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  
  // الراتب الأساسي
  basicSalary: decimal("basic_salary", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  
  // البدلات
  housingAllowance: decimal("housing_allowance", { precision: 15, scale: 2 }).default("0"),
  transportAllowance: decimal("transport_allowance", { precision: 15, scale: 2 }).default("0"),
  foodAllowance: decimal("food_allowance", { precision: 15, scale: 2 }).default("0"),
  phoneAllowance: decimal("phone_allowance", { precision: 15, scale: 2 }).default("0"),
  otherAllowances: decimal("other_allowances", { precision: 15, scale: 2 }).default("0"),
  
  // إجمالي الراتب
  totalSalary: decimal("total_salary", { precision: 15, scale: 2 }),
  
  // طريقة الدفع
  paymentMethod: mysqlEnum("payment_method", ["bank_transfer", "cash", "check"]).default("bank_transfer"),
  bankName: varchar("bank_name", { length: 100 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  iban: varchar("iban", { length: 50 }),
  
  effectiveDate: date("effective_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مسيرات الرواتب - Payroll Runs
export const payrollRuns = mysqlTable("payroll_runs", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  
  // الفترة
  periodYear: int("period_year").notNull(),
  periodMonth: int("period_month").notNull(),
  periodStartDate: date("period_start_date").notNull(),
  periodEndDate: date("period_end_date").notNull(),
  
  // الإجماليات
  totalBasicSalary: decimal("total_basic_salary", { precision: 15, scale: 2 }).default("0"),
  totalAllowances: decimal("total_allowances", { precision: 15, scale: 2 }).default("0"),
  totalDeductions: decimal("total_deductions", { precision: 15, scale: 2 }).default("0"),
  totalNetSalary: decimal("total_net_salary", { precision: 15, scale: 2 }).default("0"),
  employeeCount: int("employee_count").default(0),
  
  // الحالة
  status: mysqlEnum("status", ["draft", "calculated", "approved", "paid", "cancelled"]).default("draft"),
  
  // الربط المحاسبي
  journalEntryId: int("journal_entry_id"),
  
  calculatedAt: timestamp("calculated_at"),
  calculatedBy: int("calculated_by"),
  approvedAt: timestamp("approved_at"),
  approvedBy: int("approved_by"),
  paidAt: timestamp("paid_at"),
  paidBy: int("paid_by"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// بنود مسير الرواتب - Payroll Items
export const payrollItems = mysqlTable("payroll_items", {
  id: int("id").autoincrement().primaryKey(),
  payrollRunId: int("payroll_run_id").notNull(),
  employeeId: int("employee_id").notNull(),
  
  // الراتب الأساسي
  basicSalary: decimal("basic_salary", { precision: 15, scale: 2 }).notNull(),
  workingDays: int("working_days").default(30),
  actualDays: int("actual_days").default(30),
  
  // البدلات
  housingAllowance: decimal("housing_allowance", { precision: 15, scale: 2 }).default("0"),
  transportAllowance: decimal("transport_allowance", { precision: 15, scale: 2 }).default("0"),
  otherAllowances: decimal("other_allowances", { precision: 15, scale: 2 }).default("0"),
  totalAllowances: decimal("total_allowances", { precision: 15, scale: 2 }).default("0"),
  
  // الإضافات
  overtimeHours: decimal("overtime_hours", { precision: 10, scale: 2 }).default("0"),
  overtimeAmount: decimal("overtime_amount", { precision: 15, scale: 2 }).default("0"),
  bonuses: decimal("bonuses", { precision: 15, scale: 2 }).default("0"),
  totalAdditions: decimal("total_additions", { precision: 15, scale: 2 }).default("0"),
  
  // الخصومات
  absenceDays: int("absence_days").default(0),
  absenceDeduction: decimal("absence_deduction", { precision: 15, scale: 2 }).default("0"),
  lateDeduction: decimal("late_deduction", { precision: 15, scale: 2 }).default("0"),
  socialInsurance: decimal("social_insurance", { precision: 15, scale: 2 }).default("0"),
  taxDeduction: decimal("tax_deduction", { precision: 15, scale: 2 }).default("0"),
  loanDeduction: decimal("loan_deduction", { precision: 15, scale: 2 }).default("0"),
  otherDeductions: decimal("other_deductions", { precision: 15, scale: 2 }).default("0"),
  totalDeductions: decimal("total_deductions", { precision: 15, scale: 2 }).default("0"),
  
  // الصافي
  grossSalary: decimal("gross_salary", { precision: 15, scale: 2 }),
  netSalary: decimal("net_salary", { precision: 15, scale: 2 }),
  
  // الحالة
  status: mysqlEnum("status", ["calculated", "approved", "paid"]).default("calculated"),
  paidAt: timestamp("paid_at"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الحضور والانصراف - Attendance
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  businessId: int("business_id").notNull(),
  
  attendanceDate: date("attendance_date").notNull(),
  
  // وقت الحضور
  checkInTime: datetime("check_in_time"),
  checkInLocation: varchar("check_in_location", { length: 255 }),
  checkInLatitude: decimal("check_in_latitude", { precision: 10, scale: 8 }),
  checkInLongitude: decimal("check_in_longitude", { precision: 11, scale: 8 }),
  checkInMethod: mysqlEnum("check_in_method", ["manual", "biometric", "gps", "qr_code"]).default("manual"),
  
  // وقت الانصراف
  checkOutTime: datetime("check_out_time"),
  checkOutLocation: varchar("check_out_location", { length: 255 }),
  checkOutLatitude: decimal("check_out_latitude", { precision: 10, scale: 8 }),
  checkOutLongitude: decimal("check_out_longitude", { precision: 11, scale: 8 }),
  checkOutMethod: mysqlEnum("check_out_method", ["manual", "biometric", "gps", "qr_code"]).default("manual"),
  
  // الحسابات
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  lateMinutes: int("late_minutes").default(0),
  earlyLeaveMinutes: int("early_leave_minutes").default(0),
  
  // الحالة
  status: mysqlEnum("status", ["present", "absent", "late", "half_day", "leave", "holiday", "weekend"]).default("present"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// أنواع الإجازات - Leave Types
export const leaveTypes = mysqlTable("leave_types", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
