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
  systemType: mysqlEnum("system_type", ["energy", "custom"]).default("energy").notNull(),
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
  password: varchar("password", { length: 255 }),
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
// 11. نظام المطور - Developer System
// ============================================

// التكاملات الخارجية - External Integrations
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  integrationType: mysqlEnum("integration_type", [
    "payment_gateway", "sms", "whatsapp", "email", "iot", 
    "erp", "crm", "scada", "gis", "weather", "maps", "other"
  ]).notNull(),
  category: mysqlEnum("category", ["local", "international", "internal"]).default("local"),
  provider: varchar("provider", { length: 100 }),
  baseUrl: varchar("base_url", { length: 500 }),
  apiVersion: varchar("api_version", { length: 20 }),
  authType: mysqlEnum("auth_type", ["api_key", "oauth2", "basic", "hmac", "jwt", "none"]).default("api_key"),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  priority: int("priority").default(1),
  lastHealthCheck: timestamp("last_health_check"),
  healthStatus: mysqlEnum("health_status", ["healthy", "degraded", "down", "unknown"]).default("unknown"),
  webhookUrl: varchar("webhook_url", { length: 500 }),
  webhookSecret: varchar("webhook_secret", { length: 255 }),
  rateLimitPerMinute: int("rate_limit_per_minute").default(60),
  timeoutSeconds: int("timeout_seconds").default(30),
  retryAttempts: int("retry_attempts").default(3),
  metadata: json("metadata"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// إعدادات التكاملات - Integration Configs
export const integrationConfigs = mysqlTable("integration_configs", {
  id: int("id").autoincrement().primaryKey(),
  integrationId: int("integration_id").notNull(),
  configKey: varchar("config_key", { length: 100 }).notNull(),
  configValue: text("config_value"),
  isEncrypted: boolean("is_encrypted").default(false),
  valueType: mysqlEnum("value_type", ["string", "number", "boolean", "json"]).default("string"),
  environment: mysqlEnum("environment", ["production", "staging", "development"]).default("production"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سجلات التكاملات - Integration Logs
export const integrationLogs = mysqlTable("integration_logs", {
  id: int("id").autoincrement().primaryKey(),
  integrationId: int("integration_id").notNull(),
  businessId: int("business_id").notNull(),
  requestId: varchar("request_id", { length: 100 }),
  direction: mysqlEnum("direction", ["outgoing", "incoming"]).notNull(),
  method: varchar("method", { length: 10 }),
  endpoint: varchar("endpoint", { length: 500 }),
  requestHeaders: json("request_headers"),
  requestBody: json("request_body"),
  responseStatus: int("response_status"),
  responseHeaders: json("response_headers"),
  responseBody: json("response_body"),
  durationMs: int("duration_ms"),
  status: mysqlEnum("status", ["success", "failed", "timeout", "error"]).notNull(),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// نظام الأحداث - Events System
export const systemEvents = mysqlTable("system_events", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventSource: varchar("event_source", { length: 50 }).notNull(),
  aggregateType: varchar("aggregate_type", { length: 50 }),
  aggregateId: int("aggregate_id"),
  payload: json("payload").notNull(),
  metadata: json("metadata"),
  correlationId: varchar("correlation_id", { length: 100 }),
  causationId: varchar("causation_id", { length: 100 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الاشتراكات في الأحداث - Event Subscriptions
export const eventSubscriptions = mysqlTable("event_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  subscriberName: varchar("subscriber_name", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  handlerType: mysqlEnum("handler_type", ["webhook", "queue", "function", "email", "sms"]).notNull(),
  handlerConfig: json("handler_config").notNull(),
  filterExpression: json("filter_expression"),
  isActive: boolean("is_active").default(true),
  priority: int("priority").default(0),
  maxRetries: int("max_retries").default(3),
  retryDelaySeconds: int("retry_delay_seconds").default(60),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مفاتيح API - API Keys
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  permissions: json("permissions"),
  allowedIps: json("allowed_ips"),
  allowedOrigins: json("allowed_origins"),
  rateLimitPerMinute: int("rate_limit_per_minute").default(60),
  rateLimitPerDay: int("rate_limit_per_day").default(10000),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  usageCount: int("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سجلات استخدام API - API Usage Logs
export const apiLogs = mysqlTable("api_logs", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("api_key_id"),
  businessId: int("business_id").notNull(),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  requestHeaders: json("request_headers"),
  requestBody: json("request_body"),
  responseStatus: int("response_status"),
  responseTime: int("response_time"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: varchar("user_agent", { length: 500 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// نماذج الذكاء الاصطناعي - AI Models
export const aiModels = mysqlTable("ai_models", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  modelType: mysqlEnum("model_type", [
    "consumption_forecast", "fault_detection", "load_optimization",
    "anomaly_detection", "demand_prediction", "maintenance_prediction",
    "customer_churn", "fraud_detection", "price_optimization", "other"
  ]).notNull(),
  provider: mysqlEnum("provider", ["internal", "openai", "azure", "google", "aws", "custom"]).default("internal"),
  modelVersion: varchar("model_version", { length: 50 }),
  endpoint: varchar("endpoint", { length: 500 }),
  inputSchema: json("input_schema"),
  outputSchema: json("output_schema"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  lastTrainedAt: timestamp("last_trained_at"),
  trainingDataCount: int("training_data_count"),
  isActive: boolean("is_active").default(true),
  config: json("config"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تنبؤات الذكاء الاصطناعي - AI Predictions
export const aiPredictions = mysqlTable("ai_predictions", {
  id: int("id").autoincrement().primaryKey(),
  modelId: int("model_id").notNull(),
  businessId: int("business_id").notNull(),
  predictionType: varchar("prediction_type", { length: 50 }).notNull(),
  targetEntity: varchar("target_entity", { length: 50 }),
  targetEntityId: int("target_entity_id"),
  inputData: json("input_data").notNull(),
  prediction: json("prediction").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  predictionDate: date("prediction_date").notNull(),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  actualValue: json("actual_value"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: int("verified_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// قواعد التنبيهات التقنية - Technical Alert Rules
export const technicalAlertRules = mysqlTable("technical_alert_rules", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  category: mysqlEnum("category", [
    "performance", "security", "availability", "integration", "database", "api", "system"
  ]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).default("warning"),
  condition: json("condition").notNull(),
  threshold: decimal("threshold", { precision: 15, scale: 4 }),
  comparisonOperator: mysqlEnum("comparison_operator", ["gt", "gte", "lt", "lte", "eq", "neq"]),
  evaluationPeriodMinutes: int("evaluation_period_minutes").default(5),
  cooldownMinutes: int("cooldown_minutes").default(15),
  notificationChannels: json("notification_channels"),
  escalationRules: json("escalation_rules"),
  autoResolve: boolean("auto_resolve").default(true),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// التنبيهات التقنية - Technical Alerts
export const technicalAlerts = mysqlTable("technical_alerts", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: int("rule_id").notNull(),
  businessId: int("business_id").notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  source: varchar("source", { length: 100 }),
  sourceId: varchar("source_id", { length: 100 }),
  currentValue: decimal("current_value", { precision: 15, scale: 4 }),
  thresholdValue: decimal("threshold_value", { precision: 15, scale: 4 }),
  metadata: json("metadata"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved", "suppressed"]).default("active"),
  acknowledgedBy: int("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: int("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  notificationsSent: json("notifications_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مقاييس الأداء - Performance Metrics
export const performanceMetrics = mysqlTable("performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  metricType: mysqlEnum("metric_type", [
    "response_time", "throughput", "error_rate", "cpu_usage", 
    "memory_usage", "disk_usage", "network_io", "db_connections",
    "active_users", "api_calls", "queue_size", "cache_hit_rate"
  ]).notNull(),
  source: varchar("source", { length: 100 }),
  value: decimal("value", { precision: 15, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  tags: json("tags"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Webhooks المستلمة - Incoming Webhooks
export const incomingWebhooks = mysqlTable("incoming_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  integrationId: int("integration_id").notNull(),
  businessId: int("business_id").notNull(),
  webhookType: varchar("webhook_type", { length: 100 }).notNull(),
  payload: json("payload").notNull(),
  headers: json("headers"),
  signature: varchar("signature", { length: 255 }),
  isValid: boolean("is_valid").default(true),
  status: mysqlEnum("status", ["received", "processing", "processed", "failed"]).default("received"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  sourceIp: varchar("source_ip", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 12. نظام العمليات الميدانية - Field Operations
// ============================================

// العمليات الميدانية - Field Operations
export const fieldOperations = mysqlTable("field_operations", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id"),
  operationNumber: varchar("operation_number", { length: 30 }).notNull(),
  operationType: mysqlEnum("operation_type", [
    "installation", "maintenance", "inspection", "disconnection", 
    "reconnection", "meter_reading", "collection", "repair", "replacement"
  ]).notNull(),
  status: mysqlEnum("status", [
    "draft", "scheduled", "assigned", "in_progress", "waiting_customer",
    "on_hold", "completed", "cancelled", "rejected"
  ]).default("draft"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  customerId: int("customer_id"),
  assetId: int("asset_id"),
  locationLat: decimal("location_lat", { precision: 10, scale: 8 }),
  locationLng: decimal("location_lng", { precision: 11, scale: 8 }),
  address: text("address"),
  scheduledDate: date("scheduled_date"),
  scheduledTime: varchar("scheduled_time", { length: 10 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  assignedTeamId: int("assigned_team_id"),
  assignedWorkerId: int("assigned_worker_id"),
  estimatedDuration: int("estimated_duration"),
  actualDuration: int("actual_duration"),
  notes: text("notes"),
  completionNotes: text("completion_notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سجل حالات العملية - Operation Status Log
export const operationStatusLog = mysqlTable("operation_status_log", {
  id: int("id").autoincrement().primaryKey(),
  operationId: int("operation_id").notNull(),
  fromStatus: varchar("from_status", { length: 30 }),
  toStatus: varchar("to_status", { length: 30 }).notNull(),
  changedBy: int("changed_by"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  reason: text("reason"),
  notes: text("notes"),
});

// بيانات التركيب الفنية - Installation Details
export const installationDetails = mysqlTable("installation_details", {
  id: int("id").autoincrement().primaryKey(),
  operationId: int("operation_id").notNull(),
  customerId: int("customer_id"),
  meterSerialNumber: varchar("meter_serial_number", { length: 100 }),
  meterType: mysqlEnum("meter_type", ["smart", "traditional", "prepaid"]),
  sealNumber: varchar("seal_number", { length: 50 }),
  sealColor: varchar("seal_color", { length: 30 }),
  sealType: varchar("seal_type", { length: 50 }),
  breakerType: varchar("breaker_type", { length: 50 }),
  breakerCapacity: varchar("breaker_capacity", { length: 20 }),
  breakerBrand: varchar("breaker_brand", { length: 50 }),
  cableLength: decimal("cable_length", { precision: 10, scale: 2 }),
  cableType: varchar("cable_type", { length: 50 }),
  cableSize: varchar("cable_size", { length: 20 }),
  initialReading: decimal("initial_reading", { precision: 15, scale: 3 }),
  installationDate: date("installation_date"),
  installationTime: varchar("installation_time", { length: 10 }),
  technicianId: int("technician_id"),
  notes: text("notes"),
  customerSignature: text("customer_signature"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// صور التركيب - Installation Photos
export const installationPhotos = mysqlTable("installation_photos", {
  id: int("id").autoincrement().primaryKey(),
  installationId: int("installation_id"),
  operationId: int("operation_id").notNull(),
  photoType: mysqlEnum("photo_type", [
    "meter_front", "meter_reading", "seal", "breaker", "wiring",
    "location", "customer_premises", "before_installation", "after_installation"
  ]),
  photoUrl: varchar("photo_url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 200 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  capturedAt: timestamp("captured_at"),
  uploadedBy: int("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الفرق الميدانية - Field Teams
export const fieldTeams = mysqlTable("field_teams", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  teamType: mysqlEnum("team_type", [
    "installation", "maintenance", "inspection", "collection", "mixed"
  ]).default("mixed"),
  leaderId: int("leader_id"),
  maxMembers: int("max_members").default(10),
  currentMembers: int("current_members").default(0),
  status: mysqlEnum("status", ["active", "inactive", "on_leave"]).default("active"),
  workingArea: text("working_area"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// العاملين الميدانيين - Field Workers
export const fieldWorkers = mysqlTable("field_workers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  userId: int("user_id"),
  employeeId: int("employee_id"), // ربط بجدول الموظفين
  employeeNumber: varchar("employee_number", { length: 30 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  teamId: int("team_id"),
  workerType: mysqlEnum("worker_type", [
    "technician", "engineer", "supervisor", "driver", "helper"
  ]).default("technician"),
  specialization: varchar("specialization", { length: 100 }),
  skills: json("skills"),
  status: mysqlEnum("status", ["available", "busy", "on_leave", "inactive"]).default("available"),
  currentLocationLat: decimal("current_location_lat", { precision: 10, scale: 8 }),
  currentLocationLng: decimal("current_location_lng", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("last_location_update"),
  hireDate: date("hire_date"),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
  operationRate: decimal("operation_rate", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مواقع العاملين - Worker Locations
export const workerLocations = mysqlTable("worker_locations", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("worker_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 10, scale: 2 }),
  speed: decimal("speed", { precision: 10, scale: 2 }),
  heading: decimal("heading", { precision: 5, scale: 2 }),
  altitude: decimal("altitude", { precision: 10, scale: 2 }),
  batteryLevel: int("battery_level"),
  isMoving: boolean("is_moving").default(false),
  operationId: int("operation_id"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// تقييم أداء العاملين - Worker Performance
export const workerPerformance = mysqlTable("worker_performance", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("worker_id").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  totalOperations: int("total_operations").default(0),
  completedOperations: int("completed_operations").default(0),
  onTimeOperations: int("on_time_operations").default(0),
  avgCompletionTime: decimal("avg_completion_time", { precision: 10, scale: 2 }),
  customerRating: decimal("customer_rating", { precision: 3, scale: 2 }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  attendanceRate: decimal("attendance_rate", { precision: 5, scale: 2 }),
  notes: text("notes"),
  evaluatedBy: int("evaluated_by"),
  evaluatedAt: timestamp("evaluated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الحوافز والمكافآت - Worker Incentives
export const workerIncentives = mysqlTable("worker_incentives", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("worker_id").notNull(),
  businessId: int("business_id").notNull(),
  incentiveType: mysqlEnum("incentive_type", ["bonus", "commission", "penalty", "allowance"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  status: mysqlEnum("status", ["pending", "approved", "paid", "cancelled"]).default("pending"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// طلبات صرف المواد - Material Requests
export const materialRequests = mysqlTable("material_requests", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  requestNumber: varchar("request_number", { length: 30 }).notNull(),
  operationId: int("operation_id"),
  workerId: int("worker_id"),
  teamId: int("team_id"),
  warehouseId: int("warehouse_id"),
  requestDate: date("request_date").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "issued", "returned", "cancelled"]).default("pending"),
  notes: text("notes"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  issuedBy: int("issued_by"),
  issuedAt: timestamp("issued_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// بنود طلب المواد - Material Request Items
export const materialRequestItems = mysqlTable("material_request_items", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("request_id").notNull(),
  itemId: int("item_id").notNull(),
  requestedQty: decimal("requested_qty", { precision: 12, scale: 3 }).notNull(),
  approvedQty: decimal("approved_qty", { precision: 12, scale: 3 }),
  issuedQty: decimal("issued_qty", { precision: 12, scale: 3 }),
  returnedQty: decimal("returned_qty", { precision: 12, scale: 3 }),
  unit: varchar("unit", { length: 20 }),
  notes: text("notes"),
});

// المعدات الميدانية - Field Equipment
export const fieldEquipment = mysqlTable("field_equipment", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  equipmentCode: varchar("equipment_code", { length: 30 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  equipmentType: mysqlEnum("equipment_type", ["tool", "vehicle", "device", "safety", "measuring"]).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  model: varchar("model", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  status: mysqlEnum("status", ["available", "in_use", "maintenance", "retired", "lost"]).default("available"),
  currentHolderId: int("current_holder_id"),
  assignedTeamId: int("assigned_team_id"),
  purchaseDate: date("purchase_date"),
  purchaseCost: decimal("purchase_cost", { precision: 12, scale: 2 }),
  warrantyEnd: date("warranty_end"),
  lastMaintenance: date("last_maintenance"),
  nextMaintenance: date("next_maintenance"),
  condition: mysqlEnum("condition", ["excellent", "good", "fair", "poor"]).default("good"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// حركات المعدات - Equipment Movements
export const equipmentMovements = mysqlTable("equipment_movements", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipment_id").notNull(),
  movementType: mysqlEnum("movement_type", ["checkout", "return", "transfer", "maintenance", "retire"]).notNull(),
  fromHolderId: int("from_holder_id"),
  toHolderId: int("to_holder_id"),
  operationId: int("operation_id"),
  movementDate: timestamp("movement_date").defaultNow().notNull(),
  conditionBefore: mysqlEnum("condition_before", ["excellent", "good", "fair", "poor"]),
  conditionAfter: mysqlEnum("condition_after", ["excellent", "good", "fair", "poor"]),
  notes: text("notes"),
  recordedBy: int("recorded_by"),
});

// الفحوصات - Inspections
export const inspections = mysqlTable("inspections", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  operationId: int("operation_id").notNull(),
  inspectionNumber: varchar("inspection_number", { length: 30 }).notNull(),
  inspectionType: mysqlEnum("inspection_type", ["quality", "safety", "completion", "periodic"]).notNull(),
  inspectorId: int("inspector_id"),
  inspectionDate: timestamp("inspection_date").defaultNow().notNull(),
  status: mysqlEnum("status", ["pending", "passed", "failed", "conditional"]).default("pending"),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// بنود الفحص - Inspection Items
export const inspectionItems = mysqlTable("inspection_items", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspection_id").notNull(),
  checklistItemId: int("checklist_item_id"),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  isPassed: boolean("is_passed"),
  score: decimal("score", { precision: 5, scale: 2 }),
  notes: text("notes"),
  photoUrl: varchar("photo_url", { length: 500 }),
});

// قوائم الفحص - Inspection Checklists
export const inspectionChecklists = mysqlTable("inspection_checklists", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 30 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  operationType: varchar("operation_type", { length: 50 }),
  items: json("items"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الموافقات - Operation Approvals
export const operationApprovals = mysqlTable("operation_approvals", {
  id: int("id").autoincrement().primaryKey(),
  operationId: int("operation_id").notNull(),
  approvalLevel: int("approval_level").default(1),
  approverId: int("approver_id"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  decisionDate: timestamp("decision_date"),
  notes: text("notes"),
  signatureUrl: varchar("signature_url", { length: 500 }),
});

// مستحقات العمليات - Operation Payments
export const operationPayments = mysqlTable("operation_payments", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  operationId: int("operation_id").notNull(),
  workerId: int("worker_id").notNull(),
  paymentType: mysqlEnum("payment_type", ["fixed", "per_operation", "commission", "hourly"]).default("per_operation"),
  baseAmount: decimal("base_amount", { precision: 12, scale: 2 }).default("0"),
  bonusAmount: decimal("bonus_amount", { precision: 12, scale: 2 }).default("0"),
  deductionAmount: decimal("deduction_amount", { precision: 12, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["calculated", "approved", "paid"]).default("calculated"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
});

// تسويات الفترة - Period Settlements
export const periodSettlements = mysqlTable("period_settlements", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  settlementNumber: varchar("settlement_number", { length: 30 }).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  totalOperations: int("total_operations").default(0),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  totalBonuses: decimal("total_bonuses", { precision: 15, scale: 2 }).default("0"),
  totalDeductions: decimal("total_deductions", { precision: 15, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "approved", "paid"]).default("draft"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// بنود التسوية - Settlement Items
export const settlementItems = mysqlTable("settlement_items", {
  id: int("id").autoincrement().primaryKey(),
  settlementId: int("settlement_id").notNull(),
  workerId: int("worker_id").notNull(),
  operationsCount: int("operations_count").default(0),
  baseAmount: decimal("base_amount", { precision: 12, scale: 2 }).default("0"),
  bonuses: decimal("bonuses", { precision: 12, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 12, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).default("0"),
  paymentMethod: mysqlEnum("payment_method", ["cash", "bank_transfer", "check"]),
  paymentReference: varchar("payment_reference", { length: 100 }),
  paidAt: timestamp("paid_at"),
});

// ============================================
// 13. الإعدادات والتكوين - Settings
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
// 14. النظام المخصص - Custom System
// ============================================

// حسابات النظام المخصص - Custom Accounts
export const customAccounts = mysqlTable("custom_accounts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountType: mysqlEnum("account_type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  parentId: int("parent_id"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// حركات الحسابات المخصصة - Custom Account Transactions
export const customTransactions = mysqlTable("custom_transactions", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  transactionNumber: varchar("transaction_number", { length: 50 }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  accountId: int("account_id").notNull(),
  transactionType: mysqlEnum("transaction_type", ["debit", "credit"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  attachments: json("attachments"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الملاحظات - Notes
export const customNotes = mysqlTable("custom_notes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  color: varchar("color", { length: 20 }),
  isPinned: boolean("is_pinned").default(false),
  isArchived: boolean("is_archived").default(false),
  tags: json("tags"),
  attachments: json("attachments"),
  reminderDate: timestamp("reminder_date"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// المذكرات - Memos
export const customMemos = mysqlTable("custom_memos", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  memoNumber: varchar("memo_number", { length: 50 }).notNull(),
  memoDate: date("memo_date").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content"),
  memoType: mysqlEnum("memo_type", ["internal", "external", "circular", "directive"]).default("internal"),
  fromDepartment: varchar("from_department", { length: 255 }),
  toDepartment: varchar("to_department", { length: 255 }),
  status: mysqlEnum("status", ["draft", "sent", "received", "archived"]).default("draft"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  attachments: json("attachments"),
  responseRequired: boolean("response_required").default(false),
  responseDeadline: date("response_deadline"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// فئات الملاحظات - Note Categories
export const noteCategories = mysqlTable("note_categories", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// رسوم الفاتورة - Invoice Fees
export const invoiceFees = mysqlTable("invoice_fees", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoice_id").notNull(),
  feeTypeId: int("fee_type_id").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الصناديق - Cashboxes
export const cashboxes = mysqlTable("cashboxes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  branchId: int("branch_id"),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  assignedTo: int("assigned_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// طرق الدفع - Payment Methods
export const paymentMethodsNew = mysqlTable("payment_methods_new", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  methodType: mysqlEnum("method_type", ["cash", "card", "bank_transfer", "check", "online", "sadad", "wallet"]).default("cash"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// المدفوعات المحسن - Enhanced Payments
export const paymentsEnhanced = mysqlTable("payments_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  customerId: int("customer_id").notNull(),
  meterId: int("meter_id"),
  invoiceId: int("invoice_id"),
  cashboxId: int("cashbox_id"),
  paymentMethodId: int("payment_method_id"),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  balanceDueBefore: decimal("balance_due_before", { precision: 18, scale: 2 }),
  balanceDueAfter: decimal("balance_due_after", { precision: 18, scale: 2 }),
  payerName: varchar("payer_name", { length: 255 }),
  referenceNumber: varchar("reference_number", { length: 100 }),
  status: mysqlEnum("payment_status", ["pending", "completed", "failed", "refunded"]).default("completed"),
  notes: text("notes"),
  receivedBy: int("received_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الإيصالات - Receipts
export const receipts = mysqlTable("receipts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  paymentId: int("payment_id").notNull(),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull(),
  issueDate: date("issue_date").notNull(),
  description: text("description"),
  printedBy: int("printed_by"),
  printedAt: timestamp("printed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// أكواد الشحن المسبق - Prepaid Codes
export const prepaidCodes = mysqlTable("prepaid_codes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  meterId: int("meter_id"),
  code: varchar("code", { length: 100 }).notNull().unique(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  status: mysqlEnum("prepaid_status", ["active", "used", "expired", "cancelled"]).default("active"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  generatedBy: int("generated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer System Types
export type Area = typeof areas.$inferSelect;
export type InsertArea = typeof areas.$inferInsert;
export type Square = typeof squares.$inferSelect;
export type InsertSquare = typeof squares.$inferInsert;
export type Cabinet = typeof cabinets.$inferSelect;
export type InsertCabinet = typeof cabinets.$inferInsert;
export type Tariff = typeof tariffs.$inferSelect;
export type InsertTariff = typeof tariffs.$inferInsert;
export type FeeType = typeof feeTypes.$inferSelect;
export type InsertFeeType = typeof feeTypes.$inferInsert;
export type CustomerEnhanced = typeof customersEnhanced.$inferSelect;
export type InsertCustomerEnhanced = typeof customersEnhanced.$inferInsert;
export type CustomerWallet = typeof customerWallets.$inferSelect;
export type InsertCustomerWallet = typeof customerWallets.$inferInsert;
export type CustomerTransactionNew = typeof customerTransactionsNew.$inferSelect;
export type InsertCustomerTransactionNew = typeof customerTransactionsNew.$inferInsert;
export type MeterEnhanced = typeof metersEnhanced.$inferSelect;
export type InsertMeterEnhanced = typeof metersEnhanced.$inferInsert;
export type BillingPeriod = typeof billingPeriods.$inferSelect;
export type InsertBillingPeriod = typeof billingPeriods.$inferInsert;
export type MeterReadingEnhanced = typeof meterReadingsEnhanced.$inferSelect;
export type InsertMeterReadingEnhanced = typeof meterReadingsEnhanced.$inferInsert;
export type InvoiceEnhanced = typeof invoicesEnhanced.$inferSelect;
export type InsertInvoiceEnhanced = typeof invoicesEnhanced.$inferInsert;
export type InvoiceFee = typeof invoiceFees.$inferSelect;
export type InsertInvoiceFee = typeof invoiceFees.$inferInsert;
export type Cashbox = typeof cashboxes.$inferSelect;
export type InsertCashbox = typeof cashboxes.$inferInsert;
export type PaymentMethodNew = typeof paymentMethodsNew.$inferSelect;
export type InsertPaymentMethodNew = typeof paymentMethodsNew.$inferInsert;
export type PaymentEnhanced = typeof paymentsEnhanced.$inferSelect;
export type InsertPaymentEnhanced = typeof paymentsEnhanced.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;
export type PrepaidCode = typeof prepaidCodes.$inferSelect;
export type InsertPrepaidCode = typeof prepaidCodes.$inferInsert;


// ============================================
// نظام استهلاك الديزل - Diesel Consumption System
// ============================================

// الموردين - Diesel Suppliers
export const dieselSuppliers = mysqlTable("diesel_suppliers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الوايتات (صهاريج الديزل) - Diesel Tankers
export const dieselTankers = mysqlTable("diesel_tankers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(), // السعة الكلية
  compartment1Capacity: decimal("compartment1_capacity", { precision: 10, scale: 2 }), // عين 1
  compartment2Capacity: decimal("compartment2_capacity", { precision: 10, scale: 2 }), // عين 2
  driverName: varchar("driver_name", { length: 100 }),
  driverPhone: varchar("driver_phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// خزانات المحطة - Station Tanks
export const dieselTanks = mysqlTable("diesel_tanks", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  // نوع الخزان حسب الوظيفة
  type: mysqlEnum("tank_type", [
    "receiving",      // خزان استلام
    "main",           // خزان رئيسي
    "pre_output",     // خزان قبل طرمبة الخروج
    "generator"       // خزان مولد
  ]).notNull(),
  
  // مادة الخزان
  material: mysqlEnum("tank_material", [
    "plastic",        // بلاستيك
    "iron",           // حديد
    "stainless_steel", // ستانلس ستيل
    "fiberglass"      // فايبر جلاس
  ]).default("plastic"),
  
  // بيانات الخزان الفنية
  brand: varchar("brand", { length: 100 }),           // الماركة
  color: varchar("color", { length: 50 }),            // اللون
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(), // السعة الكلية
  height: decimal("height", { precision: 8, scale: 2 }),    // الارتفاع بالسنتيمتر
  diameter: decimal("diameter", { precision: 8, scale: 2 }), // القطر بالسنتيمتر
  deadStock: decimal("dead_stock", { precision: 10, scale: 2 }).default("0"), // الكمية الميتة
  effectiveCapacity: decimal("effective_capacity", { precision: 10, scale: 2 }), // السعة الفعلية = السعة - الكمية الميتة
  
  // المستويات
  currentLevel: decimal("current_level", { precision: 10, scale: 2 }).default("0"),
  minLevel: decimal("min_level", { precision: 10, scale: 2 }).default("0"),
  
  // عدد الفتحات
  openingsCount: int("openings_count").default(1),
  
  // ربط بمولد (للخزانات المرتبطة بمولد)
  linkedGeneratorId: int("linked_generator_id"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// فتحات الخزان - Tank Openings
export const dieselTankOpenings = mysqlTable("diesel_tank_openings", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tank_id").notNull(),
  openingNumber: int("opening_number").notNull(),      // رقم الفتحة
  position: mysqlEnum("position", [
    "top",            // فوق
    "bottom",         // تحت
    "side"            // جانب
  ]).notNull(),
  usage: mysqlEnum("usage", [
    "inlet",          // دخول
    "outlet",         // خروج
    "ventilation",    // تهوية
    "measurement",    // قياس
    "cleaning"        // تنظيف
  ]).notNull(),
  diameter: decimal("diameter", { precision: 6, scale: 2 }), // قطر الفتحة بالسنتيمتر
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مواصير التسليك - Diesel Pipes
export const dieselPipes = mysqlTable("diesel_pipes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  // مادة المواصير
  material: mysqlEnum("pipe_material", [
    "iron",           // حديد
    "plastic",        // بلاستيك
    "copper",         // نحاس
    "stainless_steel" // ستانلس ستيل
  ]).default("iron"),
  
  diameter: decimal("diameter", { precision: 6, scale: 2 }),  // القطر بالسنتيمتر
  length: decimal("length", { precision: 8, scale: 2 }),      // الطول بالمتر
  
  // حالة المواصير
  condition: mysqlEnum("condition", [
    "good",           // جيدة
    "fair",           // متوسطة
    "poor",           // سيئة
    "needs_replacement" // تحتاج استبدال
  ]).default("good"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تهيئة مخطط الديزل للمحطة - Station Diesel Configuration
export const stationDieselConfig = mysqlTable("station_diesel_config", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull().unique(), // محطة واحدة لها تهيئة واحدة
  
  // إعدادات الطرمبات
  hasIntakePump: boolean("has_intake_pump").default(false),      // هل يوجد طرمبة دخول؟
  hasOutputPump: boolean("has_output_pump").default(false),      // هل يوجد طرمبة خروج؟
  intakePumpHasMeter: boolean("intake_pump_has_meter").default(false), // طرمبة الدخول بعداد؟
  outputPumpHasMeter: boolean("output_pump_has_meter").default(false), // طرمبة الخروج بعداد؟
  
  notes: text("notes"),
  configuredBy: int("configured_by"),
  configuredAt: timestamp("configured_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مسار الديزل في المحطة - Station Diesel Path
// يحدد ترتيب الأصول في مسار الديزل
export const stationDieselPath = mysqlTable("station_diesel_path", {
  id: int("id").autoincrement().primaryKey(),
  configId: int("config_id").notNull(),             // مرتبط بتهيئة المحطة
  sequenceOrder: int("sequence_order").notNull(),   // ترتيب في المسار
  
  // نوع العنصر في المسار
  elementType: mysqlEnum("element_type", [
    "receiving_tank",   // خزان استلام
    "pipe",             // مواصير
    "intake_pump",      // طرمبة دخول
    "main_tank",        // خزان رئيسي
    "pre_output_tank",  // خزان قبل طرمبة الخروج
    "output_pump",      // طرمبة خروج
    "generator_tank"    // خزان مولد
  ]).notNull(),
  
  // معرف العنصر (خزان أو طرمبة أو مواصير)
  tankId: int("tank_id"),
  pumpId: int("pump_id"),
  pipeId: int("pipe_id"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// طرمبات العدادات - Pump Meters
export const dieselPumpMeters = mysqlTable("diesel_pump_meters", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id"),
  supplierId: int("supplier_id"), // للطرمبات عند المورد
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("pump_type", [
    "supplier",       // طرمبة المورد
    "intake",         // طرمبة الدخول (الاستلام)
    "output"          // طرمبة الخروج (التوزيع)
  ]).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  currentReading: decimal("current_reading", { precision: 15, scale: 2 }).default("0"), // القراءة التسلسلية الحالية
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مهام استلام الديزل - Diesel Receiving Tasks
export const dieselReceivingTasks = mysqlTable("diesel_receiving_tasks", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  taskNumber: varchar("task_number", { length: 50 }).notNull(),
  taskDate: date("task_date").notNull(),
  
  // بيانات الموظف والوايت
  employeeId: int("employee_id").notNull(), // فني المولدات
  tankerId: int("tanker_id").notNull(),
  supplierId: int("supplier_id").notNull(),
  
  // حالة المهمة
  status: mysqlEnum("task_status", [
    "pending",        // في الانتظار
    "started",        // بدأت (ذهب للمورد)
    "at_supplier",    // عند المورد
    "loading",        // جاري التحميل
    "returning",      // في طريق العودة
    "at_station",     // وصل المحطة
    "unloading",      // جاري التفريغ
    "completed",      // مكتملة
    "cancelled"       // ملغاة
  ]).default("pending"),
  
  // توقيتات التتبع
  startTime: datetime("start_time"),           // وقت بدء المهمة
  arrivalAtSupplierTime: datetime("arrival_at_supplier_time"), // وقت الوصول للمورد
  loadingStartTime: datetime("loading_start_time"),   // وقت بدء التحميل
  loadingEndTime: datetime("loading_end_time"),       // وقت انتهاء التحميل
  departureFromSupplierTime: datetime("departure_from_supplier_time"), // وقت المغادرة من المورد
  arrivalAtStationTime: datetime("arrival_at_station_time"), // وقت الوصول للمحطة
  unloadingStartTime: datetime("unloading_start_time"), // وقت بدء التفريغ
  unloadingEndTime: datetime("unloading_end_time"),     // وقت انتهاء التفريغ
  completionTime: datetime("completion_time"),   // وقت إتمام المهمة
  
  // قراءات طرمبة المورد (تسلسلية)
  supplierPumpId: int("supplier_pump_id"),
  supplierPumpReadingBefore: decimal("supplier_pump_reading_before", { precision: 15, scale: 2 }),
  supplierPumpReadingAfter: decimal("supplier_pump_reading_after", { precision: 15, scale: 2 }),
  supplierPumpReadingBeforeImage: text("supplier_pump_reading_before_image"),
  supplierPumpReadingAfterImage: text("supplier_pump_reading_after_image"),
  
  // فاتورة المورد
  supplierInvoiceNumber: varchar("supplier_invoice_number", { length: 50 }),
  supplierInvoiceImage: text("supplier_invoice_image"),
  supplierInvoiceAmount: decimal("supplier_invoice_amount", { precision: 18, scale: 2 }),
  
  // الكمية المستلمة من المورد
  quantityFromSupplier: decimal("quantity_from_supplier", { precision: 10, scale: 2 }),
  compartment1Quantity: decimal("compartment1_quantity", { precision: 10, scale: 2 }), // كمية عين 1
  compartment2Quantity: decimal("compartment2_quantity", { precision: 10, scale: 2 }), // كمية عين 2
  
  // قراءات طرمبة الدخول بالمحطة (تسلسلية)
  intakePumpId: int("intake_pump_id"),
  intakePumpReadingBefore: decimal("intake_pump_reading_before", { precision: 15, scale: 2 }),
  intakePumpReadingAfter: decimal("intake_pump_reading_after", { precision: 15, scale: 2 }),
  intakePumpReadingBeforeImage: text("intake_pump_reading_before_image"),
  intakePumpReadingAfterImage: text("intake_pump_reading_after_image"),
  
  // الكمية المستلمة في المحطة
  quantityReceivedAtStation: decimal("quantity_received_at_station", { precision: 10, scale: 2 }),
  receivingTankId: int("receiving_tank_id"), // خزان الاستلام
  
  // الفرق (إن وجد)
  quantityDifference: decimal("quantity_difference", { precision: 10, scale: 2 }),
  differenceNotes: text("difference_notes"),
  
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سجل قراءات الطرمبات - Pump Meter Readings Log
export const dieselPumpReadings = mysqlTable("diesel_pump_readings", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  pumpMeterId: int("pump_meter_id").notNull(),
  taskId: int("task_id"), // مرتبط بمهمة استلام
  readingDate: datetime("reading_date").notNull(),
  readingValue: decimal("reading_value", { precision: 15, scale: 2 }).notNull(), // القراءة التسلسلية
  readingType: mysqlEnum("reading_type", ["before", "after"]).notNull(),
  readingImage: text("reading_image"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }), // الكمية (الفرق بين القراءتين)
  recordedBy: int("recorded_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// حركات الديزل بين الخزانات - Diesel Tank Movements
export const dieselTankMovements = mysqlTable("diesel_tank_movements", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  movementDate: datetime("movement_date").notNull(),
  movementType: mysqlEnum("movement_type", [
    "receiving",      // استلام من الوايت
    "transfer",       // نقل بين خزانات
    "consumption",    // استهلاك (للمولدات)
    "adjustment"      // تعديل جرد
  ]).notNull(),
  fromTankId: int("from_tank_id"),
  toTankId: int("to_tank_id"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  taskId: int("task_id"), // مرتبط بمهمة استلام
  outputPumpId: int("output_pump_id"), // طرمبة الخروج
  outputPumpReadingBefore: decimal("output_pump_reading_before", { precision: 15, scale: 2 }),
  outputPumpReadingAfter: decimal("output_pump_reading_after", { precision: 15, scale: 2 }),
  generatorId: int("generator_id"), // للاستهلاك
  notes: text("notes"),
  recordedBy: int("recorded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// استهلاك المولدات - Generator Diesel Consumption
export const generatorDieselConsumption = mysqlTable("generator_diesel_consumption", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  generatorId: int("generator_id").notNull(),
  consumptionDate: date("consumption_date").notNull(),
  rocketTankId: int("rocket_tank_id"), // خزان الصاروخ
  startLevel: decimal("start_level", { precision: 10, scale: 2 }),
  endLevel: decimal("end_level", { precision: 10, scale: 2 }),
  quantityConsumed: decimal("quantity_consumed", { precision: 10, scale: 2 }).notNull(),
  runningHours: decimal("running_hours", { precision: 8, scale: 2 }), // ساعات التشغيل
  consumptionRate: decimal("consumption_rate", { precision: 8, scale: 2 }), // معدل الاستهلاك لتر/ساعة
  notes: text("notes"),
  recordedBy: int("recorded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Diesel System Types
export type DieselSupplier = typeof dieselSuppliers.$inferSelect;
export type InsertDieselSupplier = typeof dieselSuppliers.$inferInsert;
export type DieselTanker = typeof dieselTankers.$inferSelect;
export type InsertDieselTanker = typeof dieselTankers.$inferInsert;
export type DieselTank = typeof dieselTanks.$inferSelect;
export type InsertDieselTank = typeof dieselTanks.$inferInsert;
export type DieselTankOpening = typeof dieselTankOpenings.$inferSelect;
export type InsertDieselTankOpening = typeof dieselTankOpenings.$inferInsert;
export type DieselPipe = typeof dieselPipes.$inferSelect;
export type InsertDieselPipe = typeof dieselPipes.$inferInsert;
export type StationDieselConfig = typeof stationDieselConfig.$inferSelect;
export type InsertStationDieselConfig = typeof stationDieselConfig.$inferInsert;
export type StationDieselPath = typeof stationDieselPath.$inferSelect;
export type InsertStationDieselPath = typeof stationDieselPath.$inferInsert;
export type DieselPumpMeter = typeof dieselPumpMeters.$inferSelect;
export type InsertDieselPumpMeter = typeof dieselPumpMeters.$inferInsert;
export type DieselReceivingTask = typeof dieselReceivingTasks.$inferSelect;
export type InsertDieselReceivingTask = typeof dieselReceivingTasks.$inferInsert;
export type DieselPumpReading = typeof dieselPumpReadings.$inferSelect;
export type InsertDieselPumpReading = typeof dieselPumpReadings.$inferInsert;
export type DieselTankMovement = typeof dieselTankMovements.$inferSelect;
export type InsertDieselTankMovement = typeof dieselTankMovements.$inferInsert;
export type GeneratorDieselConsumption = typeof generatorDieselConsumption.$inferSelect;
export type InsertGeneratorDieselConsumption = typeof generatorDieselConsumption.$inferInsert;
