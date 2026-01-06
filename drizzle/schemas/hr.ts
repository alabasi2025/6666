import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum, datetime } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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

