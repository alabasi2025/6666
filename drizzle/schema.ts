import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  date,
  datetime,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================
// 1. الهيكل التنظيمي - Organizational Structure
// ============================================

// الشركات - Companies/Businesses
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", ["holding", "subsidiary", "branch"]).default("subsidiary").notNull(),
  parentId: int("parent_id"),
  logo: text("logo"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  commercialRegister: varchar("commercial_register", { length: 50 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  fiscalYearStart: int("fiscal_year_start").default(1),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Riyadh"),
  isActive: boolean("is_active").default(true),
  settings: json("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الفروع - Branches
export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", ["main", "regional", "local"]).default("local").notNull(),
  parentId: int("parent_id"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Saudi Arabia"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  managerId: int("manager_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// المحطات - Stations
export const stations = mysqlTable("stations", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", [
    "generation", "transmission", "distribution", "substation", 
    "solar", "wind", "hydro", "thermal", "nuclear", "storage"
  ]).notNull(),
  status: mysqlEnum("status", ["operational", "maintenance", "offline", "construction", "decommissioned"]).default("operational"),
  capacity: decimal("capacity", { precision: 15, scale: 2 }),
  capacityUnit: varchar("capacity_unit", { length: 20 }).default("MW"),
  voltageLevel: varchar("voltage_level", { length: 50 }),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  commissionDate: date("commission_date"),
  managerId: int("manager_id"),
  isActive: boolean("is_active").default(true),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 2. المستخدمين والصلاحيات - Users & Permissions
// ============================================

// المستخدمين
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  employeeId: varchar("employee_id", { length: 20 }),
  name: text("name"),
  nameAr: varchar("name_ar", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
  businessId: int("business_id"),
  branchId: int("branch_id"),
  stationId: int("station_id"),
  departmentId: int("department_id"),
  jobTitle: varchar("job_title", { length: 100 }),
  isActive: boolean("is_active").default(true),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// الأدوار
export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id"),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  description: text("description"),
  level: int("level").default(1),
  isSystem: boolean("is_system").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الصلاحيات
export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  module: varchar("module", { length: 50 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ربط الأدوار بالصلاحيات
export const rolePermissions = mysqlTable("role_permissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("role_id").notNull(),
  permissionId: int("permission_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ربط المستخدمين بالأدوار
export const userRoles = mysqlTable("user_roles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  roleId: int("role_id").notNull(),
  businessId: int("business_id"),
  branchId: int("branch_id"),
  stationId: int("station_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 3. النظام المحاسبي - Accounting System
// ============================================

// شجرة الحسابات - هيكل جديد يتفرع من أسماء الأنظمة
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: int("parent_id"),
  level: int("level").default(1),
  // النظام الذي ينتمي إليه الحساب (بدلاً من التصنيف المحاسبي التقليدي)
  systemModule: mysqlEnum("system_module", [
    "assets",           // إدارة الأصول
    "maintenance",      // الصيانة
    "inventory",        // المخزون
    "procurement",      // المشتريات
    "customers",        // العملاء
    "billing",          // الفوترة
    "scada",            // المراقبة والتحكم
    "projects",         // المشاريع
    "hr",               // الموارد البشرية
    "operations",       // العمليات
    "finance",          // المالية العامة
    "general"           // عام
  ]).notNull(),
  // نوع الحساب داخل النظام
  accountType: mysqlEnum("account_type", [
    "main",             // حساب رئيسي
    "sub",              // حساب فرعي
    "detail"            // حساب تفصيلي
  ]).default("detail"),
  nature: mysqlEnum("nature", ["debit", "credit"]).notNull(),
  isParent: boolean("is_parent").default(false),
  isActive: boolean("is_active").default(true),
  isCashAccount: boolean("is_cash_account").default(false),
  isBankAccount: boolean("is_bank_account").default(false),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  openingBalance: decimal("opening_balance", { precision: 18, scale: 2 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0"),
  description: text("description"),
  // ربط الحساب بكيان محدد (مستودع، عميل، مورد، مشروع، إلخ)
  linkedEntityType: varchar("linked_entity_type", { length: 50 }),
  linkedEntityId: int("linked_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الفترات المحاسبية
export const fiscalPeriods = mysqlTable("fiscal_periods", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  year: int("year").notNull(),
  period: int("period").notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: mysqlEnum("status", ["open", "closed", "locked"]).default("open"),
  closedBy: int("closed_by"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// القيود اليومية
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  entryNumber: varchar("entry_number", { length: 50 }).notNull(),
  entryDate: date("entry_date").notNull(),
  periodId: int("period_id").notNull(),
  type: mysqlEnum("type", [
    "manual", "auto", "opening", "closing", "adjustment",
    "invoice", "payment", "receipt", "transfer", "depreciation"
  ]).default("manual"),
  sourceModule: varchar("source_module", { length: 50 }),
  sourceId: int("source_id"),
  description: text("description"),
  totalDebit: decimal("total_debit", { precision: 18, scale: 2 }).default("0"),
  totalCredit: decimal("total_credit", { precision: 18, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "posted", "reversed"]).default("draft"),
  postedBy: int("posted_by"),
  postedAt: timestamp("posted_at"),
  reversedBy: int("reversed_by"),
  reversedAt: timestamp("reversed_at"),
  reversalEntryId: int("reversal_entry_id"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تفاصيل القيود
export const journalEntryLines = mysqlTable("journal_entry_lines", {
  id: int("id").autoincrement().primaryKey(),
  entryId: int("entry_id").notNull(),
  lineNumber: int("line_number").notNull(),
  accountId: int("account_id").notNull(),
  costCenterId: int("cost_center_id"),
  description: text("description"),
  debit: decimal("debit", { precision: 18, scale: 2 }).default("0"),
  credit: decimal("credit", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مراكز التكلفة
export const costCenters = mysqlTable("cost_centers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: int("parent_id"),
  level: int("level").default(1),
  type: mysqlEnum("type", ["station", "department", "project", "activity"]),
  stationId: int("station_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 4. إدارة الأصول - Asset Management
// ============================================

// فئات الأصول
export const assetCategories = mysqlTable("asset_categories", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: int("parent_id"),
  depreciationMethod: mysqlEnum("depreciation_method", ["straight_line", "declining_balance", "units_of_production"]).default("straight_line"),
  usefulLife: int("useful_life"),
  salvagePercentage: decimal("salvage_percentage", { precision: 5, scale: 2 }).default("0"),
  assetAccountId: int("asset_account_id"),
  depreciationAccountId: int("depreciation_account_id"),
  accumulatedDepAccountId: int("accumulated_dep_account_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الأصول الثابتة
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  stationId: int("station_id"),
  categoryId: int("category_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  serialNumber: varchar("serial_number", { length: 100 }),
  model: varchar("model", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  purchaseDate: date("purchase_date"),
  commissionDate: date("commission_date"),
  purchaseCost: decimal("purchase_cost", { precision: 18, scale: 2 }).default("0"),
  currentValue: decimal("current_value", { precision: 18, scale: 2 }).default("0"),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 18, scale: 2 }).default("0"),
  salvageValue: decimal("salvage_value", { precision: 18, scale: 2 }).default("0"),
  usefulLife: int("useful_life"),
  depreciationMethod: mysqlEnum("depreciation_method", ["straight_line", "declining_balance", "units_of_production"]),
  status: mysqlEnum("status", ["active", "maintenance", "disposed", "transferred", "idle"]).default("active"),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  warrantyExpiry: date("warranty_expiry"),
  supplierId: int("supplier_id"),
  purchaseOrderId: int("purchase_order_id"),
  parentAssetId: int("parent_asset_id"),
  qrCode: varchar("qr_code", { length: 255 }),
  barcode: varchar("barcode", { length: 100 }),
  image: text("image"),
  specifications: json("specifications"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// حركات الأصول
export const assetMovements = mysqlTable("asset_movements", {
  id: int("id").autoincrement().primaryKey(),
  assetId: int("asset_id").notNull(),
  movementType: mysqlEnum("movement_type", [
    "purchase", "transfer", "maintenance", "upgrade", 
    "revaluation", "impairment", "disposal", "depreciation"
  ]).notNull(),
  movementDate: date("movement_date").notNull(),
  fromBranchId: int("from_branch_id"),
  toBranchId: int("to_branch_id"),
  fromStationId: int("from_station_id"),
  toStationId: int("to_station_id"),
  amount: decimal("amount", { precision: 18, scale: 2 }),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  journalEntryId: int("journal_entry_id"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 5. نظام الصيانة - Maintenance System
// ============================================

// أوامر العمل
export const workOrders = mysqlTable("work_orders", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  stationId: int("station_id"),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["preventive", "corrective", "emergency", "inspection", "calibration"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", [
    "draft", "pending", "approved", "assigned", "in_progress", 
    "on_hold", "completed", "cancelled", "closed"
  ]).default("draft"),
  assetId: int("asset_id"),
  equipmentId: int("equipment_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requestedBy: int("requested_by"),
  requestedDate: datetime("requested_date"),
  scheduledStart: datetime("scheduled_start"),
  scheduledEnd: datetime("scheduled_end"),
  actualStart: datetime("actual_start"),
  actualEnd: datetime("actual_end"),
  assignedTo: int("assigned_to"),
  teamId: int("team_id"),
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 8, scale: 2 }),
  estimatedCost: decimal("estimated_cost", { precision: 18, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 18, scale: 2 }),
  laborCost: decimal("labor_cost", { precision: 18, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 18, scale: 2 }),
  completionNotes: text("completion_notes"),
  failureCode: varchar("failure_code", { length: 50 }),
  rootCause: text("root_cause"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  closedBy: int("closed_by"),
  closedAt: timestamp("closed_at"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مهام أمر العمل
export const workOrderTasks = mysqlTable("work_order_tasks", {
  id: int("id").autoincrement().primaryKey(),
  workOrderId: int("work_order_id").notNull(),
  taskNumber: int("task_number").notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "skipped"]).default("pending"),
  assignedTo: int("assigned_to"),
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 8, scale: 2 }),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// خطط الصيانة الوقائية
export const maintenancePlans = mysqlTable("maintenance_plans", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  assetCategoryId: int("asset_category_id"),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "quarterly", "semi_annual", "annual"]).notNull(),
  intervalDays: int("interval_days"),
  basedOn: mysqlEnum("based_on", ["calendar", "meter", "condition"]).default("calendar"),
  meterType: varchar("meter_type", { length: 50 }),
  meterInterval: decimal("meter_interval", { precision: 15, scale: 2 }),
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  estimatedCost: decimal("estimated_cost", { precision: 18, scale: 2 }),
  isActive: boolean("is_active").default(true),
  tasks: json("tasks"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 6. نظام المخزون - Inventory System
// ============================================

// المستودعات
export const warehouses = mysqlTable("warehouses", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  stationId: int("station_id"),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", ["main", "spare_parts", "consumables", "transit", "quarantine"]).default("main"),
  address: text("address"),
  managerId: int("manager_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// فئات الأصناف
export const itemCategories = mysqlTable("item_categories", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: int("parent_id"),
  inventoryAccountId: int("inventory_account_id"),
  cogsAccountId: int("cogs_account_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الأصناف
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  categoryId: int("category_id"),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  type: mysqlEnum("type", ["spare_part", "consumable", "raw_material", "finished_good"]).default("spare_part"),
  unit: varchar("unit", { length: 20 }).notNull(),
  barcode: varchar("barcode", { length: 100 }),
  minStock: decimal("min_stock", { precision: 15, scale: 3 }).default("0"),
  maxStock: decimal("max_stock", { precision: 15, scale: 3 }),
  reorderPoint: decimal("reorder_point", { precision: 15, scale: 3 }),
  reorderQty: decimal("reorder_qty", { precision: 15, scale: 3 }),
  standardCost: decimal("standard_cost", { precision: 18, scale: 4 }).default("0"),
  lastPurchasePrice: decimal("last_purchase_price", { precision: 18, scale: 4 }),
  averageCost: decimal("average_cost", { precision: 18, scale: 4 }),
  isActive: boolean("is_active").default(true),
  image: text("image"),
  specifications: json("specifications"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// أرصدة المخزون
export const stockBalances = mysqlTable("stock_balances", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("item_id").notNull(),
  warehouseId: int("warehouse_id").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 3 }).default("0"),
  reservedQty: decimal("reserved_qty", { precision: 15, scale: 3 }).default("0"),
  availableQty: decimal("available_qty", { precision: 15, scale: 3 }).default("0"),
  averageCost: decimal("average_cost", { precision: 18, scale: 4 }).default("0"),
  totalValue: decimal("total_value", { precision: 18, scale: 2 }).default("0"),
  lastMovementDate: timestamp("last_movement_date"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// حركات المخزون
export const stockMovements = mysqlTable("stock_movements", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  itemId: int("item_id").notNull(),
  warehouseId: int("warehouse_id").notNull(),
  movementType: mysqlEnum("movement_type", [
    "receipt", "issue", "transfer_in", "transfer_out",
    "adjustment_in", "adjustment_out", "return", "scrap"
  ]).notNull(),
  movementDate: datetime("movement_date").notNull(),
  documentType: varchar("document_type", { length: 50 }),
  documentId: int("document_id"),
  documentNumber: varchar("document_number", { length: 50 }),
  quantity: decimal("quantity", { precision: 15, scale: 3 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 18, scale: 4 }),
  totalCost: decimal("total_cost", { precision: 18, scale: 2 }),
  balanceBefore: decimal("balance_before", { precision: 15, scale: 3 }),
  balanceAfter: decimal("balance_after", { precision: 15, scale: 3 }),
  notes: text("notes"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 7. نظام المشتريات - Procurement System
// ============================================

// الموردين
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", ["manufacturer", "distributor", "contractor", "service_provider"]),
  contactPerson: varchar("contact_person", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  paymentTerms: int("payment_terms").default(30),
  creditLimit: decimal("credit_limit", { precision: 18, scale: 2 }),
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0"),
  accountId: int("account_id"),
  rating: int("rating"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// طلبات الشراء
export const purchaseRequests = mysqlTable("purchase_requests", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  stationId: int("station_id"),
  requestNumber: varchar("request_number", { length: 50 }).notNull(),
  requestDate: date("request_date").notNull(),
  requiredDate: date("required_date"),
  status: mysqlEnum("status", ["draft", "pending", "approved", "rejected", "converted", "cancelled"]).default("draft"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  requestedBy: int("requested_by").notNull(),
  departmentId: int("department_id"),
  purpose: text("purpose"),
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default("0"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// أوامر الشراء
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  orderDate: date("order_date").notNull(),
  supplierId: int("supplier_id").notNull(),
  status: mysqlEnum("status", [
    "draft", "pending", "approved", "sent", "partial_received",
    "received", "cancelled", "closed"
  ]).default("draft"),
  deliveryDate: date("delivery_date"),
  warehouseId: int("warehouse_id"),
  paymentTerms: int("payment_terms"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1"),
  subtotal: decimal("subtotal", { precision: 18, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 2 }).default("0"),
  notes: text("notes"),
  terms: text("terms"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

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

// ============================================
// 9. نظام المراقبة والتحكم - SCADA
// ============================================

// المعدات
export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  assetId: int("asset_id"),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", [
    "transformer", "generator", "switchgear", "breaker", "relay",
    "meter", "sensor", "inverter", "battery", "panel", "cable", "motor"
  ]).notNull(),
  status: mysqlEnum("status", ["online", "offline", "maintenance", "fault", "unknown"]).default("unknown"),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  ratedCapacity: decimal("rated_capacity", { precision: 15, scale: 2 }),
  capacityUnit: varchar("capacity_unit", { length: 20 }),
  voltageRating: varchar("voltage_rating", { length: 50 }),
  currentRating: varchar("current_rating", { length: 50 }),
  installationDate: date("installation_date"),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isControllable: boolean("is_controllable").default(false),
  isMonitored: boolean("is_monitored").default(true),
  communicationProtocol: varchar("communication_protocol", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// أجهزة الاستشعار
export const sensors = mysqlTable("sensors", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipment_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  type: mysqlEnum("type", [
    "voltage", "current", "power", "frequency", "temperature",
    "humidity", "pressure", "flow", "level", "speed", "vibration"
  ]).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  minValue: decimal("min_value", { precision: 15, scale: 4 }),
  maxValue: decimal("max_value", { precision: 15, scale: 4 }),
  warningLow: decimal("warning_low", { precision: 15, scale: 4 }),
  warningHigh: decimal("warning_high", { precision: 15, scale: 4 }),
  criticalLow: decimal("critical_low", { precision: 15, scale: 4 }),
  criticalHigh: decimal("critical_high", { precision: 15, scale: 4 }),
  currentValue: decimal("current_value", { precision: 15, scale: 4 }),
  lastReadingTime: timestamp("last_reading_time"),
  status: mysqlEnum("status", ["active", "inactive", "faulty"]).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// التنبيهات
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id"),
  equipmentId: int("equipment_id"),
  sensorId: int("sensor_id"),
  alertType: mysqlEnum("alert_type", ["info", "warning", "critical", "emergency"]).notNull(),
  category: varchar("category", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  value: decimal("value", { precision: 15, scale: 4 }),
  threshold: decimal("threshold", { precision: 15, scale: 4 }),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved", "escalated"]).default("active"),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
  acknowledgedBy: int("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: int("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  workOrderId: int("work_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// سجل التدقيق
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id"),
  userId: int("user_id"),
  action: varchar("action", { length: 50 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: int("entity_id"),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 10. نظام المشاريع - Projects System
// ============================================

// المشاريع
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  stationId: int("station_id"),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  type: mysqlEnum("type", [
    "construction", "expansion", "maintenance", "upgrade",
    "installation", "decommission", "study"
  ]).notNull(),
  status: mysqlEnum("status", [
    "planning", "approved", "in_progress", "on_hold",
    "completed", "cancelled", "closed"
  ]).default("planning"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  managerId: int("manager_id"),
  startDate: date("start_date"),
  plannedEndDate: date("planned_end_date"),
  actualEndDate: date("actual_end_date"),
  budget: decimal("budget", { precision: 18, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 18, scale: 2 }).default("0"),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"),
  costCenterId: int("cost_center_id"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  closedBy: int("closed_by"),
  closedAt: timestamp("closed_at"),
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مراحل المشروع
export const projectPhases = mysqlTable("project_phases", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull(),
  phaseNumber: int("phase_number").notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  actualStartDate: date("actual_start_date"),
  actualEndDate: date("actual_end_date"),
  budget: decimal("budget", { precision: 18, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 18, scale: 2 }).default("0"),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مهام المشروع
export const projectTasks = mysqlTable("project_tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull(),
  phaseId: int("phase_id"),
  parentTaskId: int("parent_task_id"),
  taskNumber: varchar("task_number", { length: 50 }),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  type: mysqlEnum("type", ["task", "milestone"]).default("task"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  assignedTo: int("assigned_to"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  actualStartDate: date("actual_start_date"),
  actualEndDate: date("actual_end_date"),
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 8, scale: 2 }),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"),
  dependencies: json("dependencies"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// 11. الإعدادات والتكوين - Settings
// ============================================

// الإعدادات العامة
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id"),
  category: varchar("category", { length: 50 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  valueType: mysqlEnum("value_type", ["string", "number", "boolean", "json"]).default("string"),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// التسلسلات
export const sequences = mysqlTable("sequences", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  prefix: varchar("prefix", { length: 20 }),
  suffix: varchar("suffix", { length: 20 }),
  currentValue: int("current_value").default(0),
  minDigits: int("min_digits").default(6),
  resetPeriod: mysqlEnum("reset_period", ["never", "yearly", "monthly"]).default("never"),
  lastResetDate: date("last_reset_date"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
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
