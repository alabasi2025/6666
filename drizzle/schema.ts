import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
  jsonb,
  date,
  index,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// 1. الهيكل التنظيمي - Organizational Structure
// ============================================

// الشركات - Companies/Businesses
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("type", { length: 20 }).default("subsidiary").notNull(),
  systemType: varchar("system_type", { length: 20 }).default("both").notNull(),
  parentId: integer("parent_id"),
  logo: text("logo"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  commercialRegister: varchar("commercial_register", { length: 50 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  fiscalYearStart: integer("fiscal_year_start").default(1),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Riyadh"),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الفروع - Branches
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("type", { length: 20 }).default("local").notNull(),
  parentId: integer("parent_id"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Saudi Arabia"),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  managerId: integer("manager_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// المحطات - Stations
export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("operational"),
  capacity: numeric("capacity", { precision: 15, scale: 2 }),
  capacityUnit: varchar("capacity_unit", { length: 20 }).default("MW"),
  voltageLevel: varchar("voltage_level", { length: 50 }),
  address: text("address"),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  commissionDate: date("commission_date"),
  managerId: integer("manager_id"),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 2. المستخدمين والصلاحيات - Users & Permissions
// ============================================

// المستخدمين
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  employeeId: varchar("employee_id", { length: 20 }),
  name: text("name"),
  nameAr: varchar("name_ar", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  password: varchar("password", { length: 255 }),
  avatar: text("avatar"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  businessId: integer("business_id"),
  branchId: integer("branch_id"),
  stationId: integer("station_id"),
  departmentId: integer("department_id"),
  jobTitle: varchar("job_title", { length: 100 }),
  isActive: boolean("is_active").default(true),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// الأدوار
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id"),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  description: text("description"),
  level: integer("level").default(1),
  isSystem: boolean("is_system").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الصلاحيات
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  module: varchar("module", { length: 50 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ربط الأدوار بالصلاحيات
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull(),
  permissionId: integer("permission_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ربط المستخدمين بالأدوار
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roleId: integer("role_id").notNull(),
  businessId: integer("business_id"),
  branchId: integer("branch_id"),
  stationId: integer("station_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 3. النظام المحاسبي - Accounting System
// ============================================

// شجرة الحسابات - هيكل جديد يتفرع من أسماء الأنظمة
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: integer("parent_id"),
  level: integer("level").default(1),
  // النظام الذي ينتمي إليه الحساب (بدلاً من التصنيف المحاسبي التقليدي)
  systemModule: varchar("system_module", { length: 50 }).notNull(),
  // نوع الحساب داخل النظام
  accountType: varchar("account_type", { length: 50 }).default("detail"),
  nature: varchar("nature", { length: 50 }).notNull(),
  isParent: boolean("is_parent").default(false),
  isActive: boolean("is_active").default(true),
  isCashAccount: boolean("is_cash_account").default(false),
  isBankAccount: boolean("is_bank_account").default(false),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  openingBalance: numeric("opening_balance", { precision: 18, scale: 2 }).default("0"),
  currentBalance: numeric("current_balance", { precision: 18, scale: 2 }).default("0"),
  description: text("description"),
  // ربط الحساب بكيان محدد (مستودع، عميل، مورد، مشروع، إلخ)
  linkedEntityType: varchar("linked_entity_type", { length: 50 }),
  linkedEntityId: integer("linked_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الفترات المحاسبية
export const fiscalPeriods = pgTable("fiscal_periods", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  year: integer("year").notNull(),
  period: integer("period").notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status", { length: 50 }).default("open"),
  closedBy: integer("closed_by"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// القيود اليومية
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  entryNumber: varchar("entry_number", { length: 50 }).notNull(),
  entryDate: date("entry_date").notNull(),
  periodId: integer("period_id").notNull(),
  type: varchar("type", { length: 50 }).default("manual"),
  sourceModule: varchar("source_module", { length: 50 }),
  sourceId: integer("source_id"),
  description: text("description"),
  totalDebit: numeric("total_debit", { precision: 18, scale: 2 }).default("0"),
  totalCredit: numeric("total_credit", { precision: 18, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("draft"),
  postedBy: integer("posted_by"),
  postedAt: timestamp("posted_at"),
  reversedBy: integer("reversed_by"),
  reversedAt: timestamp("reversed_at"),
  reversalEntryId: integer("reversal_entry_id"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// تفاصيل القيود
export const journalEntryLines = pgTable("journal_entry_lines", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(),
  lineNumber: integer("line_number").notNull(),
  accountId: integer("account_id").notNull(),
  costCenterId: integer("cost_center_id"),
  description: text("description"),
  debit: numeric("debit", { precision: 18, scale: 2 }).default("0"),
  credit: numeric("credit", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }).default("1"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مراكز التكلفة
export const costCenters = pgTable("cost_centers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: integer("parent_id"),
  level: integer("level").default(1),
  type: varchar("type", { length: 50 }),
  stationId: integer("station_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 4. إدارة الأصول - Asset Management
// ============================================

// فئات الأصول
export const assetCategories = pgTable("asset_categories", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: integer("parent_id"),
  depreciationMethod: varchar("depreciationMethod", { length: 50 }).default("straight_line"),
  usefulLife: integer("useful_life"),
  salvagePercentage: numeric("salvage_percentage", { precision: 5, scale: 2 }).default("0"),
  assetAccountId: integer("asset_account_id"),
  depreciationAccountId: integer("depreciation_account_id"),
  accumulatedDepAccountId: integer("accumulated_dep_account_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الأصول الثابتة
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  stationId: integer("station_id"),
  categoryId: integer("category_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  serialNumber: varchar("serial_number", { length: 100 }),
  model: varchar("model", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  purchaseDate: date("purchase_date"),
  commissionDate: date("commission_date"),
  purchaseCost: numeric("purchase_cost", { precision: 18, scale: 2 }).default("0"),
  currentValue: numeric("current_value", { precision: 18, scale: 2 }).default("0"),
  accumulatedDepreciation: numeric("accumulated_depreciation", { precision: 18, scale: 2 }).default("0"),
  salvageValue: numeric("salvage_value", { precision: 18, scale: 2 }).default("0"),
  usefulLife: integer("useful_life"),
  depreciationMethod: varchar("depreciationMethod", { length: 50 }),
  status: varchar("status", { length: 50 }).default("active"),
  location: varchar("location", { length: 255 }),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  warrantyExpiry: date("warranty_expiry"),
  supplierId: integer("supplier_id"),
  purchaseOrderId: integer("purchase_order_id"),
  parentAssetId: integer("parent_asset_id"),
  qrCode: varchar("qr_code", { length: 255 }),
  barcode: varchar("barcode", { length: 100 }),
  image: text("image"),
  specifications: jsonb("specifications"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// حركات الأصول
export const assetMovements = pgTable("asset_movements", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  movementType: varchar("movement_type", { length: 50 }).notNull(),
  movementDate: date("movement_date").notNull(),
  fromBranchId: integer("from_branch_id"),
  toBranchId: integer("to_branch_id"),
  fromStationId: integer("from_station_id"),
  toStationId: integer("to_station_id"),
  amount: numeric("amount", { precision: 18, scale: 2 }),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  journalEntryId: integer("journal_entry_id"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 5. نظام الصيانة - Maintenance System
// ============================================

// أوامر العمل
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  stationId: integer("station_id"),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  priority: varchar("priority", { length: 50 }).default("medium"),
  status: varchar("status", { length: 50 }).default("draft"),
  assetId: integer("asset_id"),
  equipmentId: integer("equipment_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requestedBy: integer("requested_by"),
  requestedDate: timestamp("requested_date"),
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  assignedTo: integer("assigned_to"),
  teamId: integer("team_id"),
  estimatedHours: numeric("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: numeric("actual_hours", { precision: 8, scale: 2 }),
  estimatedCost: numeric("estimated_cost", { precision: 18, scale: 2 }),
  actualCost: numeric("actual_cost", { precision: 18, scale: 2 }),
  laborCost: numeric("labor_cost", { precision: 18, scale: 2 }),
  partsCost: numeric("parts_cost", { precision: 18, scale: 2 }),
  completionNotes: text("completion_notes"),
  failureCode: varchar("failure_code", { length: 50 }),
  rootCause: text("root_cause"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  closedBy: integer("closed_by"),
  closedAt: timestamp("closed_at"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مهام أمر العمل
export const workOrderTasks = pgTable("work_order_tasks", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").notNull(),
  taskNumber: integer("task_number").notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  assignedTo: integer("assigned_to"),
  estimatedHours: numeric("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: numeric("actual_hours", { precision: 8, scale: 2 }),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// خطط الصيانة الوقائية
export const maintenancePlans = pgTable("maintenance_plans", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  assetCategoryId: integer("asset_category_id"),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  intervalDays: integer("interval_days"),
  basedOn: varchar("basedOn", { length: 50 }).default("calendar"),
  meterType: varchar("meter_type", { length: 50 }),
  meterInterval: numeric("meter_interval", { precision: 15, scale: 2 }),
  estimatedHours: numeric("estimated_hours", { precision: 8, scale: 2 }),
  estimatedCost: numeric("estimated_cost", { precision: 18, scale: 2 }),
  isActive: boolean("is_active").default(true),
  tasks: jsonb("tasks"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 6. نظام المخزون - Inventory System
// ============================================

// المستودعات
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  stationId: integer("station_id"),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("type", { length: 50 }).default("main"),
  address: text("address"),
  managerId: integer("manager_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// فئات الأصناف
export const itemCategories = pgTable("item_categories", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  parentId: integer("parent_id"),
  inventoryAccountId: integer("inventory_account_id"),
  cogsAccountId: integer("cogs_account_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الأصناف
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  categoryId: integer("category_id"),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  type: varchar("type", { length: 50 }).default("spare_part"),
  unit: varchar("unit", { length: 20 }).notNull(),
  barcode: varchar("barcode", { length: 100 }),
  minStock: numeric("min_stock", { precision: 15, scale: 3 }).default("0"),
  maxStock: numeric("max_stock", { precision: 15, scale: 3 }),
  reorderPoint: numeric("reorder_point", { precision: 15, scale: 3 }),
  reorderQty: numeric("reorder_qty", { precision: 15, scale: 3 }),
  standardCost: numeric("standard_cost", { precision: 18, scale: 4 }).default("0"),
  lastPurchasePrice: numeric("last_purchase_price", { precision: 18, scale: 4 }),
  averageCost: numeric("average_cost", { precision: 18, scale: 4 }),
  isActive: boolean("is_active").default(true),
  image: text("image"),
  specifications: jsonb("specifications"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// أرصدة المخزون
export const stockBalances = pgTable("stock_balances", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  quantity: numeric("quantity", { precision: 15, scale: 3 }).default("0"),
  reservedQty: numeric("reserved_qty", { precision: 15, scale: 3 }).default("0"),
  availableQty: numeric("available_qty", { precision: 15, scale: 3 }).default("0"),
  averageCost: numeric("average_cost", { precision: 18, scale: 4 }).default("0"),
  totalValue: numeric("total_value", { precision: 18, scale: 2 }).default("0"),
  lastMovementDate: timestamp("last_movement_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// حركات المخزون
export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  itemId: integer("item_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  movementType: varchar("movement_type", { length: 50 }).notNull(),
  movementDate: timestamp("movement_date").notNull(),
  documentType: varchar("document_type", { length: 50 }),
  documentId: integer("document_id"),
  documentNumber: varchar("document_number", { length: 50 }),
  quantity: numeric("quantity", { precision: 15, scale: 3 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 18, scale: 4 }),
  totalCost: numeric("total_cost", { precision: 18, scale: 2 }),
  balanceBefore: numeric("balance_before", { precision: 15, scale: 3 }),
  balanceAfter: numeric("balance_after", { precision: 15, scale: 3 }),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 7. نظام المشتريات - Procurement System
// ============================================

// الموردين
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("type", { length: 50 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  paymentTerms: integer("payment_terms").default(30),
  creditLimit: numeric("credit_limit", { precision: 18, scale: 2 }),
  currentBalance: numeric("current_balance", { precision: 18, scale: 2 }).default("0"),
  accountId: integer("account_id"),
  rating: integer("rating"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// طلبات الشراء
export const purchaseRequests = pgTable("purchase_requests", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  stationId: integer("station_id"),
  requestNumber: varchar("request_number", { length: 50 }).notNull(),
  requestDate: date("request_date").notNull(),
  requiredDate: date("required_date"),
  status: varchar("status", { length: 50 }).default("draft"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  requestedBy: integer("requested_by").notNull(),
  departmentId: integer("department_id"),
  purpose: text("purpose"),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).default("0"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// أوامر الشراء
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  orderDate: date("order_date").notNull(),
  supplierId: integer("supplier_id").notNull(),
  status: varchar("status", { length: 50 }).default("draft"),
  deliveryDate: date("delivery_date"),
  warehouseId: integer("warehouse_id"),
  paymentTerms: integer("payment_terms"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }).default("1"),
  subtotal: numeric("subtotal", { precision: 18, scale: 2 }).default("0"),
  taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).default("0"),
  discountAmount: numeric("discount_amount", { precision: 18, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0"),
  notes: text("notes"),
  terms: text("terms"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 8. نظام العملاء والفوترة - Customers & Billing
// ============================================

// العملاء
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  stationId: integer("station_id"),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("type", { length: 50 }).default("residential"),
  category: varchar("category", { length: 50 }),
  idType: varchar("idType", { length: 50 }),
  idNumber: varchar("id_number", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  tariffId: integer("tariff_id"),
  connectionDate: date("connection_date"),
  status: varchar("status", { length: 50 }).default("active"),
  currentBalance: numeric("current_balance", { precision: 18, scale: 2 }).default("0"),
  depositAmount: numeric("deposit_amount", { precision: 18, scale: 2 }).default("0"),
  creditLimit: numeric("credit_limit", { precision: 18, scale: 2 }),
  accountId: integer("account_id"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// العدادات
export const meters = pgTable("meters", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id").notNull(),
  meterNumber: varchar("meter_number", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).default("single_phase"),
  status: varchar("status", { length: 50 }).default("active"),
  installationDate: date("installation_date"),
  lastReadingDate: date("last_reading_date"),
  lastReading: numeric("last_reading", { precision: 15, scale: 3 }),
  multiplier: numeric("multiplier", { precision: 10, scale: 4 }).default("1"),
  maxLoad: numeric("max_load", { precision: 10, scale: 2 }),
  location: varchar("location", { length: 255 }),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// قراءات العدادات
export const meterReadings = pgTable("meter_readings", {
  id: serial("id").primaryKey(),
  meterId: integer("meter_id").notNull(),
  readingDate: date("reading_date").notNull(),
  readingValue: numeric("reading_value", { precision: 15, scale: 3 }).notNull(),
  previousReading: numeric("previous_reading", { precision: 15, scale: 3 }),
  consumption: numeric("consumption", { precision: 15, scale: 3 }),
  readingType: varchar("readingType", { length: 50 }).default("actual"),
  readBy: integer("read_by"),
  image: text("image"),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الفواتير
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  customerId: integer("customer_id").notNull(),
  meterId: integer("meter_id"),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  readingId: integer("reading_id"),
  consumption: numeric("consumption", { precision: 15, scale: 3 }),
  consumptionAmount: numeric("consumption_amount", { precision: 18, scale: 2 }).default("0"),
  fixedCharges: numeric("fixed_charges", { precision: 18, scale: 2 }).default("0"),
  taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).default("0"),
  otherCharges: numeric("other_charges", { precision: 18, scale: 2 }).default("0"),
  discountAmount: numeric("discount_amount", { precision: 18, scale: 2 }).default("0"),
  previousBalance: numeric("previous_balance", { precision: 18, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0"),
  balanceDue: numeric("balance_due", { precision: 18, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("draft"),
  journalEntryId: integer("journal_entry_id"),
  notes: text("notes"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// المدفوعات
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  customerId: integer("customer_id").notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash"),
  referenceNumber: varchar("reference_number", { length: 100 }),
  bankAccountId: integer("bank_account_id"),
  status: varchar("status", { length: 50 }).default("completed"),
  notes: text("notes"),
  journalEntryId: integer("journal_entry_id"),
  receivedBy: integer("received_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 9. نظام المراقبة والتحكم - SCADA
// ============================================

// المعدات
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id").notNull(),
  assetId: integer("asset_id"),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("unknown"),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  ratedCapacity: numeric("rated_capacity", { precision: 15, scale: 2 }),
  capacityUnit: varchar("capacity_unit", { length: 20 }),
  voltageRating: varchar("voltage_rating", { length: 50 }),
  currentRating: varchar("current_rating", { length: 50 }),
  installationDate: date("installation_date"),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  location: varchar("location", { length: 255 }),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  isControllable: boolean("is_controllable").default(false),
  isMonitored: boolean("is_monitored").default(true),
  communicationProtocol: varchar("communication_protocol", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// أجهزة الاستشعار
export const sensors = pgTable("sensors", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  type: varchar("type", { length: 50 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  minValue: numeric("min_value", { precision: 15, scale: 4 }),
  maxValue: numeric("max_value", { precision: 15, scale: 4 }),
  warningLow: numeric("warning_low", { precision: 15, scale: 4 }),
  warningHigh: numeric("warning_high", { precision: 15, scale: 4 }),
  criticalLow: numeric("critical_low", { precision: 15, scale: 4 }),
  criticalHigh: numeric("critical_high", { precision: 15, scale: 4 }),
  currentValue: numeric("current_value", { precision: 15, scale: 4 }),
  lastReadingTime: timestamp("last_reading_time"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// التنبيهات
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id"),
  equipmentId: integer("equipment_id"),
  sensorId: integer("sensor_id"),
  alertType: varchar("alertType", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  value: numeric("value", { precision: 15, scale: 4 }),
  threshold: numeric("threshold", { precision: 15, scale: 4 }),
  status: varchar("status", { length: 50 }).default("active"),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
  acknowledgedBy: integer("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  workOrderId: integer("work_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// سجل التدقيق
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id"),
  userId: integer("user_id"),
  action: varchar("action", { length: 50 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 10. نظام المشاريع - Projects System
// ============================================

// المشاريع
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  stationId: integer("station_id"),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("planning"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  managerId: integer("manager_id"),
  startDate: date("start_date"),
  plannedEndDate: date("planned_end_date"),
  actualEndDate: date("actual_end_date"),
  budget: numeric("budget", { precision: 18, scale: 2 }),
  actualCost: numeric("actual_cost", { precision: 18, scale: 2 }).default("0"),
  progress: numeric("progress", { precision: 5, scale: 2 }).default("0"),
  costCenterId: integer("cost_center_id"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  closedBy: integer("closed_by"),
  closedAt: timestamp("closed_at"),
  notes: text("notes"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مراحل المشروع
export const projectPhases = pgTable("project_phases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  phaseNumber: integer("phase_number").notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  actualStartDate: date("actual_start_date"),
  actualEndDate: date("actual_end_date"),
  budget: numeric("budget", { precision: 18, scale: 2 }),
  actualCost: numeric("actual_cost", { precision: 18, scale: 2 }).default("0"),
  progress: numeric("progress", { precision: 5, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مهام المشروع
export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  phaseId: integer("phase_id"),
  parentTaskId: integer("parent_task_id"),
  taskNumber: varchar("task_number", { length: 50 }),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  type: varchar("type", { length: 50 }).default("task"),
  status: varchar("status", { length: 50 }).default("pending"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  assignedTo: integer("assigned_to"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  actualStartDate: date("actual_start_date"),
  actualEndDate: date("actual_end_date"),
  estimatedHours: numeric("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: numeric("actual_hours", { precision: 8, scale: 2 }),
  progress: numeric("progress", { precision: 5, scale: 2 }).default("0"),
  dependencies: jsonb("dependencies"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 11. نظام المطور - Developer System
// ============================================

// التكاملات الخارجية - External Integrations
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  integrationType: varchar("integration_type", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).default("local"),
  provider: varchar("provider", { length: 100 }),
  baseUrl: varchar("base_url", { length: 500 }),
  apiVersion: varchar("api_version", { length: 20 }),
  authType: varchar("authType", { length: 50 }).default("api_key"),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  priority: integer("priority").default(1),
  lastHealthCheck: timestamp("last_health_check"),
  healthStatus: varchar("healthStatus", { length: 50 }).default("unknown"),
  webhookUrl: varchar("webhook_url", { length: 500 }),
  webhookSecret: varchar("webhook_secret", { length: 255 }),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  timeoutSeconds: integer("timeout_seconds").default(30),
  retryAttempts: integer("retry_attempts").default(3),
  metadata: jsonb("metadata"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// إعدادات التكاملات - Integration Configs
export const integrationConfigs = pgTable("integration_configs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull(),
  configKey: varchar("config_key", { length: 100 }).notNull(),
  configValue: text("config_value"),
  isEncrypted: boolean("is_encrypted").default(false),
  valueType: varchar("valueType", { length: 50 }).default("string"),
  environment: varchar("environment", { length: 50 }).default("production"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// سجلات التكاملات - Integration Logs
export const integrationLogs = pgTable("integration_logs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull(),
  businessId: integer("business_id").notNull(),
  requestId: varchar("request_id", { length: 100 }),
  direction: varchar("direction", { length: 50 }).notNull(),
  method: varchar("method", { length: 10 }),
  endpoint: varchar("endpoint", { length: 500 }),
  requestHeaders: jsonb("request_headers"),
  requestBody: jsonb("request_body"),
  responseStatus: integer("response_status"),
  responseHeaders: jsonb("response_headers"),
  responseBody: jsonb("response_body"),
  durationMs: integer("duration_ms"),
  status: varchar("status", { length: 50 }).notNull(),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// نظام الأحداث - Events System
export const systemEvents = pgTable("system_events", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventSource: varchar("event_source", { length: 50 }).notNull(),
  aggregateType: varchar("aggregate_type", { length: 50 }),
  aggregateId: integer("aggregate_id"),
  payload: jsonb("payload").notNull(),
  metadata: jsonb("metadata"),
  correlationId: varchar("correlation_id", { length: 100 }),
  causationId: varchar("causation_id", { length: 100 }),
  status: varchar("status", { length: 50 }).default("pending"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الاشتراكات في الأحداث - Event Subscriptions
export const eventSubscriptions = pgTable("event_subscriptions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  subscriberName: varchar("subscriber_name", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  handlerType: varchar("handlerType", { length: 50 }).notNull(),
  handlerConfig: jsonb("handler_config").notNull(),
  filterExpression: jsonb("filter_expression"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  maxRetries: integer("max_retries").default(3),
  retryDelaySeconds: integer("retry_delay_seconds").default(60),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مفاتيح API - API Keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  permissions: jsonb("permissions"),
  allowedIps: jsonb("allowed_ips"),
  allowedOrigins: jsonb("allowed_origins"),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  rateLimitPerDay: integer("rate_limit_per_day").default(10000),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// سجلات استخدام API - API Usage Logs
export const apiLogs = pgTable("api_logs", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id"),
  businessId: integer("business_id").notNull(),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  requestHeaders: jsonb("request_headers"),
  requestBody: jsonb("request_body"),
  responseStatus: integer("response_status"),
  responseTime: integer("response_time"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: varchar("user_agent", { length: 500 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// نماذج الذكاء الاصطناعي - AI Models
export const aiModels = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  modelType: varchar("model_type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).default("internal"),
  modelVersion: varchar("model_version", { length: 50 }),
  endpoint: varchar("endpoint", { length: 500 }),
  inputSchema: jsonb("input_schema"),
  outputSchema: jsonb("output_schema"),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
  lastTrainedAt: timestamp("last_trained_at"),
  trainingDataCount: integer("training_data_count"),
  isActive: boolean("is_active").default(true),
  config: jsonb("config"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// تنبؤات الذكاء الاصطناعي - AI Predictions
export const aiPredictions = pgTable("ai_predictions", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull(),
  businessId: integer("business_id").notNull(),
  predictionType: varchar("prediction_type", { length: 50 }).notNull(),
  targetEntity: varchar("target_entity", { length: 50 }),
  targetEntityId: integer("target_entity_id"),
  inputData: jsonb("input_data").notNull(),
  prediction: jsonb("prediction").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  predictionDate: date("prediction_date").notNull(),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  actualValue: jsonb("actual_value"),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// قواعد التنبيهات التقنية - Technical Alert Rules
export const technicalAlertRules = pgTable("technical_alert_rules", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("warning"),
  condition: jsonb("condition").notNull(),
  threshold: numeric("threshold", { precision: 15, scale: 4 }),
  comparisonOperator: varchar("comparisonOperator", { length: 50 }),
  evaluationPeriodMinutes: integer("evaluation_period_minutes").default(5),
  cooldownMinutes: integer("cooldown_minutes").default(15),
  notificationChannels: jsonb("notification_channels"),
  escalationRules: jsonb("escalation_rules"),
  autoResolve: boolean("auto_resolve").default(true),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// التنبيهات التقنية - Technical Alerts
export const technicalAlerts = pgTable("technical_alerts", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").notNull(),
  businessId: integer("business_id").notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  source: varchar("source", { length: 100 }),
  sourceId: varchar("source_id", { length: 100 }),
  currentValue: numeric("current_value", { precision: 15, scale: 4 }),
  thresholdValue: numeric("threshold_value", { precision: 15, scale: 4 }),
  metadata: jsonb("metadata"),
  status: varchar("status", { length: 50 }).default("active"),
  acknowledgedBy: integer("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  notificationsSent: jsonb("notifications_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مقاييس الأداء - Performance Metrics
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  metricType: varchar("metric_type", { length: 50 }).notNull(),
  source: varchar("source", { length: 100 }),
  value: numeric("value", { precision: 15, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  tags: jsonb("tags"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Webhooks المستلمة - Incoming Webhooks
export const incomingWebhooks = pgTable("incoming_webhooks", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull(),
  businessId: integer("business_id").notNull(),
  webhookType: varchar("webhook_type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),
  headers: jsonb("headers"),
  signature: varchar("signature", { length: 255 }),
  isValid: boolean("is_valid").default(true),
  status: varchar("status", { length: 50 }).default("received"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  sourceIp: varchar("source_ip", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 12. نظام العمليات الميدانية - Field Operations
// ============================================

// العمليات الميدانية - Field Operations
export const fieldOperations = pgTable("field_operations", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id"),
  operationNumber: varchar("operation_number", { length: 30 }).notNull(),
  operationType: varchar("operation_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("draft"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  customerId: integer("customer_id"),
  assetId: integer("asset_id"),
  locationLat: numeric("location_lat", { precision: 10, scale: 8 }),
  locationLng: numeric("location_lng", { precision: 11, scale: 8 }),
  address: text("address"),
  scheduledDate: date("scheduled_date"),
  scheduledTime: varchar("scheduled_time", { length: 10 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  assignedTeamId: integer("assigned_team_id"),
  assignedWorkerId: integer("assigned_worker_id"),
  estimatedDuration: integer("estimated_duration"),
  actualDuration: integer("actual_duration"),
  notes: text("notes"),
  completionNotes: text("completion_notes"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// سجل حالات العملية - Operation Status Log
export const operationStatusLog = pgTable("operation_status_log", {
  id: serial("id").primaryKey(),
  operationId: integer("operation_id").notNull(),
  fromStatus: varchar("from_status", { length: 30 }),
  toStatus: varchar("to_status", { length: 30 }).notNull(),
  changedBy: integer("changed_by"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  reason: text("reason"),
  notes: text("notes"),
});

// بيانات التركيب الفنية - Installation Details
export const installationDetails = pgTable("installation_details", {
  id: serial("id").primaryKey(),
  operationId: integer("operation_id").notNull(),
  customerId: integer("customer_id"),
  meterSerialNumber: varchar("meter_serial_number", { length: 100 }),
  meterType: varchar("meterType", { length: 50 }),
  sealNumber: varchar("seal_number", { length: 50 }),
  sealColor: varchar("seal_color", { length: 30 }),
  sealType: varchar("seal_type", { length: 50 }),
  breakerType: varchar("breaker_type", { length: 50 }),
  breakerCapacity: varchar("breaker_capacity", { length: 20 }),
  breakerBrand: varchar("breaker_brand", { length: 50 }),
  cableLength: numeric("cable_length", { precision: 10, scale: 2 }),
  cableType: varchar("cable_type", { length: 50 }),
  cableSize: varchar("cable_size", { length: 20 }),
  initialReading: numeric("initial_reading", { precision: 15, scale: 3 }),
  installationDate: date("installation_date"),
  installationTime: varchar("installation_time", { length: 10 }),
  technicianId: integer("technician_id"),
  notes: text("notes"),
  customerSignature: text("customer_signature"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// صور التركيب - Installation Photos
export const installationPhotos = pgTable("installation_photos", {
  id: serial("id").primaryKey(),
  installationId: integer("installation_id"),
  operationId: integer("operation_id").notNull(),
  photoType: varchar("photo_type", { length: 50 }),
  photoUrl: varchar("photo_url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 200 }),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  capturedAt: timestamp("captured_at"),
  uploadedBy: integer("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الفرق الميدانية - Field Teams
export const fieldTeams = pgTable("field_teams", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  teamType: varchar("team_type", { length: 50 }).default("mixed"),
  leaderId: integer("leader_id"),
  maxMembers: integer("max_members").default(10),
  currentMembers: integer("current_members").default(0),
  status: varchar("status", { length: 50 }).default("active"),
  workingArea: text("working_area"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// العاملين الميدانيين - Field Workers
export const fieldWorkers = pgTable("field_workers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  userId: integer("user_id"),
  employeeId: integer("employee_id"), // ربط بجدول الموظفين
  employeeNumber: varchar("employee_number", { length: 30 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  teamId: integer("team_id"),
  workerType: varchar("worker_type", { length: 50 }).default("technician"),
  specialization: varchar("specialization", { length: 100 }),
  skills: jsonb("skills"),
  status: varchar("status", { length: 50 }).default("available"),
  currentLocationLat: numeric("current_location_lat", { precision: 10, scale: 8 }),
  currentLocationLng: numeric("current_location_lng", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("last_location_update"),
  hireDate: date("hire_date"),
  dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }),
  operationRate: numeric("operation_rate", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مواقع العاملين - Worker Locations
export const workerLocations = pgTable("worker_locations", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: numeric("accuracy", { precision: 10, scale: 2 }),
  speed: numeric("speed", { precision: 10, scale: 2 }),
  heading: numeric("heading", { precision: 5, scale: 2 }),
  altitude: numeric("altitude", { precision: 10, scale: 2 }),
  batteryLevel: integer("battery_level"),
  isMoving: boolean("is_moving").default(false),
  operationId: integer("operation_id"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// تقييم أداء العاملين - Worker Performance
export const workerPerformance = pgTable("worker_performance", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  totalOperations: integer("total_operations").default(0),
  completedOperations: integer("completed_operations").default(0),
  onTimeOperations: integer("on_time_operations").default(0),
  avgCompletionTime: numeric("avg_completion_time", { precision: 10, scale: 2 }),
  customerRating: numeric("customer_rating", { precision: 3, scale: 2 }),
  qualityScore: numeric("quality_score", { precision: 5, scale: 2 }),
  attendanceRate: numeric("attendance_rate", { precision: 5, scale: 2 }),
  notes: text("notes"),
  evaluatedBy: integer("evaluated_by"),
  evaluatedAt: timestamp("evaluated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الحوافز والمكافآت - Worker Incentives
export const workerIncentives = pgTable("worker_incentives", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").notNull(),
  businessId: integer("business_id").notNull(),
  incentiveType: varchar("incentiveType", { length: 50 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  status: varchar("status", { length: 50 }).default("pending"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// طلبات صرف المواد - Material Requests
export const materialRequests = pgTable("material_requests", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  requestNumber: varchar("request_number", { length: 30 }).notNull(),
  operationId: integer("operation_id"),
  workerId: integer("worker_id"),
  teamId: integer("team_id"),
  warehouseId: integer("warehouse_id"),
  requestDate: date("request_date").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  notes: text("notes"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  issuedBy: integer("issued_by"),
  issuedAt: timestamp("issued_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// بنود طلب المواد - Material Request Items
export const materialRequestItems = pgTable("material_request_items", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  itemId: integer("item_id").notNull(),
  requestedQty: numeric("requested_qty", { precision: 12, scale: 3 }).notNull(),
  approvedQty: numeric("approved_qty", { precision: 12, scale: 3 }),
  issuedQty: numeric("issued_qty", { precision: 12, scale: 3 }),
  returnedQty: numeric("returned_qty", { precision: 12, scale: 3 }),
  unit: varchar("unit", { length: 20 }),
  notes: text("notes"),
});

// المعدات الميدانية - Field Equipment
export const fieldEquipment = pgTable("field_equipment", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  equipmentCode: varchar("equipment_code", { length: 30 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  equipmentType: varchar("equipmentType", { length: 50 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  model: varchar("model", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  status: varchar("status", { length: 50 }).default("available"),
  currentHolderId: integer("current_holder_id"),
  assignedTeamId: integer("assigned_team_id"),
  purchaseDate: date("purchase_date"),
  purchaseCost: numeric("purchase_cost", { precision: 12, scale: 2 }),
  warrantyEnd: date("warranty_end"),
  lastMaintenance: date("last_maintenance"),
  nextMaintenance: date("next_maintenance"),
  condition: varchar("condition", { length: 50 }).default("good"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// حركات المعدات - Equipment Movements
export const equipmentMovements = pgTable("equipment_movements", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  movementType: varchar("movementType", { length: 50 }).notNull(),
  fromHolderId: integer("from_holder_id"),
  toHolderId: integer("to_holder_id"),
  operationId: integer("operation_id"),
  movementDate: timestamp("movement_date").defaultNow().notNull(),
  conditionBefore: varchar("conditionBefore", { length: 50 }),
  conditionAfter: varchar("conditionAfter", { length: 50 }),
  notes: text("notes"),
  recordedBy: integer("recorded_by"),
});

// الفحوصات - Inspections
export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  operationId: integer("operation_id").notNull(),
  inspectionNumber: varchar("inspection_number", { length: 30 }).notNull(),
  inspectionType: varchar("inspectionType", { length: 50 }).notNull(),
  inspectorId: integer("inspector_id"),
  inspectionDate: timestamp("inspection_date").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  overallScore: numeric("overall_score", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// بنود الفحص - Inspection Items
export const inspectionItems = pgTable("inspection_items", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  checklistItemId: integer("checklist_item_id"),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  isPassed: boolean("is_passed"),
  score: numeric("score", { precision: 5, scale: 2 }),
  notes: text("notes"),
  photoUrl: varchar("photo_url", { length: 500 }),
});

// قوائم الفحص - Inspection Checklists
export const inspectionChecklists = pgTable("inspection_checklists", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 30 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  operationType: varchar("operation_type", { length: 50 }),
  items: jsonb("items"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الموافقات - Operation Approvals
export const operationApprovals = pgTable("operation_approvals", {
  id: serial("id").primaryKey(),
  operationId: integer("operation_id").notNull(),
  approvalLevel: integer("approval_level").default(1),
  approverId: integer("approver_id"),
  status: varchar("status", { length: 50 }).default("pending"),
  decisionDate: timestamp("decision_date"),
  notes: text("notes"),
  signatureUrl: varchar("signature_url", { length: 500 }),
});

// مستحقات العمليات - Operation Payments
export const operationPayments = pgTable("operation_payments", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  operationId: integer("operation_id").notNull(),
  workerId: integer("worker_id").notNull(),
  paymentType: varchar("paymentType", { length: 50 }).default("per_operation"),
  baseAmount: numeric("base_amount", { precision: 12, scale: 2 }).default("0"),
  bonusAmount: numeric("bonus_amount", { precision: 12, scale: 2 }).default("0"),
  deductionAmount: numeric("deduction_amount", { precision: 12, scale: 2 }).default("0"),
  netAmount: numeric("net_amount", { precision: 12, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("calculated"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
});

// تسويات الفترة - Period Settlements
export const periodSettlements = pgTable("period_settlements", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  settlementNumber: varchar("settlement_number", { length: 30 }).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  totalOperations: integer("total_operations").default(0),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).default("0"),
  totalBonuses: numeric("total_bonuses", { precision: 15, scale: 2 }).default("0"),
  totalDeductions: numeric("total_deductions", { precision: 15, scale: 2 }).default("0"),
  netAmount: numeric("net_amount", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("draft"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// بنود التسوية - Settlement Items
export const settlementItems = pgTable("settlement_items", {
  id: serial("id").primaryKey(),
  settlementId: integer("settlement_id").notNull(),
  workerId: integer("worker_id").notNull(),
  operationsCount: integer("operations_count").default(0),
  baseAmount: numeric("base_amount", { precision: 12, scale: 2 }).default("0"),
  bonuses: numeric("bonuses", { precision: 12, scale: 2 }).default("0"),
  deductions: numeric("deductions", { precision: 12, scale: 2 }).default("0"),
  netAmount: numeric("net_amount", { precision: 12, scale: 2 }).default("0"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 100 }),
  paidAt: timestamp("paid_at"),
});

// ============================================
// 13. الإعدادات والتكوين - Settings
// ============================================

// الإعدادات العامة
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id"),
  category: varchar("category", { length: 50 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  valueType: varchar("valueType", { length: 50 }).default("string"),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// التسلسلات
export const sequences = pgTable("sequences", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  prefix: varchar("prefix", { length: 20 }),
  suffix: varchar("suffix", { length: 20 }),
  currentValue: integer("current_value").default(0),
  minDigits: integer("min_digits").default(6),
  resetPeriod: varchar("resetPeriod", { length: 50 }).default("never"),
  lastResetDate: date("last_reset_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 14. النظام المخصص - Custom System
// ============================================

// حسابات النظام المخصص - Custom Accounts
export const customAccounts = pgTable("custom_accounts", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(),
  parentId: integer("parent_id"),
  balance: numeric("balance", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// حركات الحسابات المخصصة - Custom Account Transactions
export const customTransactions = pgTable("custom_transactions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  transactionNumber: varchar("transaction_number", { length: 50 }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  accountId: integer("account_id").notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  attachments: jsonb("attachments"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الملاحظات - Notes
export const customNotes = pgTable("custom_notes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 50 }).default("medium"),
  color: varchar("color", { length: 20 }),
  isPinned: boolean("is_pinned").default(false),
  isArchived: boolean("is_archived").default(false),
  tags: jsonb("tags"),
  attachments: jsonb("attachments"),
  reminderDate: timestamp("reminder_date"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// المذكرات - Memos
export const customMemos = pgTable("custom_memos", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  memoNumber: varchar("memo_number", { length: 50 }).notNull(),
  memoDate: date("memo_date").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content"),
  memoType: varchar("memoType", { length: 50 }).default("internal"),
  fromDepartment: varchar("from_department", { length: 255 }),
  toDepartment: varchar("to_department", { length: 255 }),
  status: varchar("status", { length: 50 }).default("draft"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  attachments: jsonb("attachments"),
  responseRequired: boolean("response_required").default(false),
  responseDeadline: date("response_deadline"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// فئات الملاحظات - Note Categories
export const noteCategories = pgTable("note_categories", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
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
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  parentId: integer("parent_id"),
  managerId: integer("manager_id"),
  costCenterId: integer("cost_center_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// المسميات الوظيفية - Job Titles/Positions
export const jobTitles = pgTable("job_titles", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  titleAr: varchar("title_ar", { length: 100 }).notNull(),
  titleEn: varchar("title_en", { length: 100 }),
  departmentId: integer("department_id"),
  gradeId: integer("grade_id"),
  level: integer("level").default(1),
  description: text("description"),
  responsibilities: text("responsibilities"),
  requirements: text("requirements"),
  headcount: integer("headcount").default(1),
  currentCount: integer("current_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// سلم الرواتب - Salary Grades
export const salaryGrades = pgTable("salary_grades", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  minSalary: numeric("min_salary", { precision: 15, scale: 2 }),
  maxSalary: numeric("max_salary", { precision: 15, scale: 2 }),
  housingAllowancePct: numeric("housing_allowance_pct", { precision: 5, scale: 2 }).default("0"),
  transportAllowance: numeric("transport_allowance", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الموظفين - Employees
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  employeeNumber: varchar("employee_number", { length: 20 }).notNull(),
  
  // البيانات الشخصية
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  fullNameAr: varchar("full_name_ar", { length: 200 }),
  fullNameEn: varchar("full_name_en", { length: 200 }),
  
  // الهوية
  idType: varchar("idType", { length: 50 }).default("national_id"),
  idNumber: varchar("id_number", { length: 50 }).notNull(),
  idExpiryDate: date("id_expiry_date"),
  
  nationality: varchar("nationality", { length: 50 }),
  gender: varchar("gender", { length: 50 }).default("male"),
  dateOfBirth: date("date_of_birth"),
  placeOfBirth: varchar("place_of_birth", { length: 100 }),
  maritalStatus: varchar("maritalStatus", { length: 50 }).default("single"),
  
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
  contractType: varchar("contractType", { length: 50 }).default("permanent"),
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  
  // الوظيفة
  jobTitleId: integer("job_title_id"),
  departmentId: integer("department_id"),
  managerId: integer("manager_id"),
  isManager: boolean("is_manager").default(false),
  
  // الموقع
  workLocation: varchar("work_location", { length: 100 }),
  stationId: integer("station_id"),
  branchId: integer("branch_id"),
  
  // ساعات العمل
  workSchedule: varchar("workSchedule", { length: 50 }).default("full_time"),
  workingHoursPerWeek: numeric("working_hours_per_week", { precision: 5, scale: 2 }).default("40"),
  
  // الربط بالعمليات الميدانية
  fieldWorkerId: integer("field_worker_id"),
  
  // الحالة
  status: varchar("status", { length: 50 }).default("active"),
  terminationDate: date("termination_date"),
  terminationReason: text("termination_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// بيانات الراتب - Salary Details
export const salaryDetails = pgTable("salary_details", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  
  // الراتب الأساسي
  basicSalary: numeric("basic_salary", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  
  // البدلات
  housingAllowance: numeric("housing_allowance", { precision: 15, scale: 2 }).default("0"),
  transportAllowance: numeric("transport_allowance", { precision: 15, scale: 2 }).default("0"),
  foodAllowance: numeric("food_allowance", { precision: 15, scale: 2 }).default("0"),
  phoneAllowance: numeric("phone_allowance", { precision: 15, scale: 2 }).default("0"),
  otherAllowances: numeric("other_allowances", { precision: 15, scale: 2 }).default("0"),
  
  // إجمالي الراتب
  totalSalary: numeric("total_salary", { precision: 15, scale: 2 }),
  
  // طريقة الدفع
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("bank_transfer"),
  bankName: varchar("bank_name", { length: 100 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  iban: varchar("iban", { length: 50 }),
  
  effectiveDate: date("effective_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مسيرات الرواتب - Payroll Runs
export const payrollRuns = pgTable("payroll_runs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  
  // الفترة
  periodYear: integer("period_year").notNull(),
  periodMonth: integer("period_month").notNull(),
  periodStartDate: date("period_start_date").notNull(),
  periodEndDate: date("period_end_date").notNull(),
  
  // الإجماليات
  totalBasicSalary: numeric("total_basic_salary", { precision: 15, scale: 2 }).default("0"),
  totalAllowances: numeric("total_allowances", { precision: 15, scale: 2 }).default("0"),
  totalDeductions: numeric("total_deductions", { precision: 15, scale: 2 }).default("0"),
  totalNetSalary: numeric("total_net_salary", { precision: 15, scale: 2 }).default("0"),
  employeeCount: integer("employee_count").default(0),
  
  // الحالة
  status: varchar("status", { length: 50 }).default("draft"),
  
  // الربط المحاسبي
  journalEntryId: integer("journal_entry_id"),
  
  calculatedAt: timestamp("calculated_at"),
  calculatedBy: integer("calculated_by"),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by"),
  paidAt: timestamp("paid_at"),
  paidBy: integer("paid_by"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// بنود مسير الرواتب - Payroll Items
export const payrollItems = pgTable("payroll_items", {
  id: serial("id").primaryKey(),
  payrollRunId: integer("payroll_run_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  
  // الراتب الأساسي
  basicSalary: numeric("basic_salary", { precision: 15, scale: 2 }).notNull(),
  workingDays: integer("working_days").default(30),
  actualDays: integer("actual_days").default(30),
  
  // البدلات
  housingAllowance: numeric("housing_allowance", { precision: 15, scale: 2 }).default("0"),
  transportAllowance: numeric("transport_allowance", { precision: 15, scale: 2 }).default("0"),
  otherAllowances: numeric("other_allowances", { precision: 15, scale: 2 }).default("0"),
  totalAllowances: numeric("total_allowances", { precision: 15, scale: 2 }).default("0"),
  
  // الإضافات
  overtimeHours: numeric("overtime_hours", { precision: 10, scale: 2 }).default("0"),
  overtimeAmount: numeric("overtime_amount", { precision: 15, scale: 2 }).default("0"),
  bonuses: numeric("bonuses", { precision: 15, scale: 2 }).default("0"),
  totalAdditions: numeric("total_additions", { precision: 15, scale: 2 }).default("0"),
  
  // الخصومات
  absenceDays: integer("absence_days").default(0),
  absenceDeduction: numeric("absence_deduction", { precision: 15, scale: 2 }).default("0"),
  lateDeduction: numeric("late_deduction", { precision: 15, scale: 2 }).default("0"),
  socialInsurance: numeric("social_insurance", { precision: 15, scale: 2 }).default("0"),
  taxDeduction: numeric("tax_deduction", { precision: 15, scale: 2 }).default("0"),
  loanDeduction: numeric("loan_deduction", { precision: 15, scale: 2 }).default("0"),
  otherDeductions: numeric("other_deductions", { precision: 15, scale: 2 }).default("0"),
  totalDeductions: numeric("total_deductions", { precision: 15, scale: 2 }).default("0"),
  
  // الصافي
  grossSalary: numeric("gross_salary", { precision: 15, scale: 2 }),
  netSalary: numeric("net_salary", { precision: 15, scale: 2 }),
  
  // الحالة
  status: varchar("status", { length: 50 }).default("calculated"),
  paidAt: timestamp("paid_at"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الحضور والانصراف - Attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  businessId: integer("business_id").notNull(),
  
  attendanceDate: date("attendance_date").notNull(),
  
  // وقت الحضور
  checkInTime: timestamp("check_in_time"),
  checkInLocation: varchar("check_in_location", { length: 255 }),
  checkInLatitude: numeric("check_in_latitude", { precision: 10, scale: 8 }),
  checkInLongitude: numeric("check_in_longitude", { precision: 11, scale: 8 }),
  checkInMethod: varchar("checkInMethod", { length: 50 }).default("manual"),
  
  // وقت الانصراف
  checkOutTime: timestamp("check_out_time"),
  checkOutLocation: varchar("check_out_location", { length: 255 }),
  checkOutLatitude: numeric("check_out_latitude", { precision: 10, scale: 8 }),
  checkOutLongitude: numeric("check_out_longitude", { precision: 11, scale: 8 }),
  checkOutMethod: varchar("checkOutMethod", { length: 50 }).default("manual"),
  
  // الحسابات
  totalHours: numeric("total_hours", { precision: 5, scale: 2 }),
  overtimeHours: numeric("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  lateMinutes: integer("late_minutes").default(0),
  earlyLeaveMinutes: integer("early_leave_minutes").default(0),
  
  // الحالة
  status: varchar("status", { length: 50 }).default("present"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// أنواع الإجازات - Leave Types
export const leaveTypes = pgTable("leave_types", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  
  // الرصيد السنوي
  annualBalance: integer("annual_balance").default(0),
  
  // الخصائص
  isPaid: boolean("is_paid").default(true),
  requiresApproval: boolean("requires_approval").default(true),
  allowsCarryOver: boolean("allows_carry_over").default(false),
  maxCarryOverDays: integer("max_carry_over_days").default(0),
  
  // اللون
  color: varchar("color", { length: 20 }).default("#3B82F6"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// طلبات الإجازات - Leave Requests
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  businessId: integer("business_id").notNull(),
  leaveTypeId: integer("leave_type_id").notNull(),
  
  // الفترة
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  
  // السبب
  reason: text("reason"),
  attachmentPath: varchar("attachment_path", { length: 500 }),
  
  // الحالة
  status: varchar("status", { length: 50 }).default("pending"),
  
  // الموافقة
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// أرصدة الإجازات - Leave Balances
export const leaveBalances = pgTable("leave_balances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  leaveTypeId: integer("leave_type_id").notNull(),
  year: integer("year").notNull(),
  
  // الرصيد
  openingBalance: integer("opening_balance").default(0),
  earnedBalance: integer("earned_balance").default(0),
  usedBalance: integer("used_balance").default(0),
  adjustmentBalance: integer("adjustment_balance").default(0),
  remainingBalance: integer("remaining_balance").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// تقييمات الأداء - Performance Evaluations
export const performanceEvaluations = pgTable("performance_evaluations", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  businessId: integer("business_id").notNull(),
  
  // الفترة
  evaluationPeriod: varchar("evaluation_period", { length: 50 }).notNull(),
  periodStartDate: date("period_start_date").notNull(),
  periodEndDate: date("period_end_date").notNull(),
  
  // التقييم
  overallScore: numeric("overall_score", { precision: 5, scale: 2 }),
  performanceRating: varchar("performanceRating", { length: 50 }),
  
  // المعايير
  qualityScore: numeric("quality_score", { precision: 5, scale: 2 }),
  productivityScore: numeric("productivity_score", { precision: 5, scale: 2 }),
  attendanceScore: numeric("attendance_score", { precision: 5, scale: 2 }),
  teamworkScore: numeric("teamwork_score", { precision: 5, scale: 2 }),
  initiativeScore: numeric("initiative_score", { precision: 5, scale: 2 }),
  
  // الملاحظات
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  goals: text("goals"),
  managerComments: text("manager_comments"),
  employeeComments: text("employee_comments"),
  
  // المقيّم
  evaluatedBy: integer("evaluated_by").notNull(),
  evaluatedAt: timestamp("evaluated_at"),
  
  // الحالة
  status: varchar("status", { length: 50 }).default("draft"),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// العقود - Contracts
export const employeeContracts = pgTable("employee_contracts", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  businessId: integer("business_id").notNull(),
  
  contractNumber: varchar("contract_number", { length: 50 }).notNull(),
  contractType: varchar("contractType", { length: 50 }).default("permanent"),
  
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  
  // شروط العقد
  basicSalary: numeric("basic_salary", { precision: 15, scale: 2 }),
  probationPeriodDays: integer("probation_period_days").default(90),
  noticePeriodDays: integer("notice_period_days").default(30),
  
  // المستند
  documentPath: varchar("document_path", { length: 500 }),
  
  // الحالة
  status: varchar("status", { length: 50 }).default("active"),
  terminationDate: date("termination_date"),
  terminationReason: text("termination_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
export const areas = pgTable("areas", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  projectId: integer("project_id"),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  address: text("address"),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// المربعات - Squares
export const squares = pgTable("squares", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  areaId: integer("area_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الكابينات - Cabinets
export const cabinets = pgTable("cabinets", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  squareId: integer("square_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  cabinetType: varchar("cabinetType", { length: 50 }).default("distribution"),
  capacity: integer("capacity"),
  currentLoad: integer("current_load").default(0),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// التعرفة - Tariffs
export const tariffs = pgTable("tariffs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  tariffType: varchar("tariffType", { length: 50 }).default("standard"),
  serviceType: varchar("serviceType", { length: 50 }).default("electricity"),
  slabs: jsonb("slabs"),
  fixedCharge: numeric("fixed_charge", { precision: 18, scale: 2 }).default("0"),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("15"),
  effectiveFrom: date("effective_from"),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// أنواع الرسوم - Fee Types
export const feeTypes = pgTable("fee_types", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  feeType: varchar("feeType", { length: 50 }).default("fixed"),
  amount: numeric("amount", { precision: 18, scale: 2 }).default("0"),
  isRecurring: boolean("is_recurring").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// العملاء المحسن - Enhanced Customers
export const customersEnhanced = pgTable("customers_enhanced", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  projectId: integer("project_id"),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  mobileNo: varchar("mobile_no", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  nationalId: varchar("national_id", { length: 50 }),
  customerType: varchar("customerType", { length: 50 }).default("residential"),
  serviceTier: varchar("serviceTier", { length: 50 }).default("basic"),
  status: varchar("status", { length: 50 }).default("active"),
  balanceDue: numeric("balance_due", { precision: 18, scale: 2 }).default("0"),
  userId: integer("user_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// محفظة العميل - Customer Wallet
export const customerWallets = pgTable("customer_wallets", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  lastTransactionDate: timestamp("last_transaction_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// معاملات العميل - Customer Transactions
export const customerTransactionsNew = pgTable("customer_transactions_new", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  walletId: integer("wallet_id"),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  balanceBefore: numeric("balance_before", { precision: 18, scale: 2 }),
  balanceAfter: numeric("balance_after", { precision: 18, scale: 2 }),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  description: text("description"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// العدادات المحسن - Enhanced Meters
export const metersEnhanced = pgTable("meters_enhanced", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id"),
  cabinetId: integer("cabinet_id"),
  tariffId: integer("tariff_id"),
  projectId: integer("project_id"),
  meterNumber: varchar("meter_number", { length: 50 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  meterType: varchar("meterType", { length: 50 }).default("electricity"),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  category: varchar("category", { length: 50 }).default("offline"),
  currentReading: numeric("current_reading", { precision: 15, scale: 3 }).default("0"),
  previousReading: numeric("previous_reading", { precision: 15, scale: 3 }).default("0"),
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  balanceDue: numeric("balance_due", { precision: 18, scale: 2 }).default("0"),
  installationDate: date("installation_date"),
  installationStatus: varchar("installationStatus", { length: 50 }).default("new"),
  signNumber: varchar("sign_number", { length: 50 }),
  signColor: varchar("sign_color", { length: 50 }),
  status: varchar("status", { length: 50 }).default("active"),
  isActive: boolean("is_active").default(true),
  iotDeviceId: varchar("iot_device_id", { length: 100 }),
  lastSyncTime: timestamp("last_sync_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// فترات الفوترة - Billing Periods
export const billingPeriods = pgTable("billing_periods", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  projectId: integer("project_id"),
  name: varchar("name", { length: 100 }).notNull(),
  periodNumber: integer("period_number"),
  month: integer("month"),
  year: integer("year"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  readingStartDate: date("reading_start_date"),
  readingEndDate: date("reading_end_date"),
  billingDate: date("billing_date"),
  dueDate: date("due_date"),
  totalMeters: integer("total_meters").default(0),
  readMeters: integer("read_meters").default(0),
  billedMeters: integer("billed_meters").default(0),
  createdBy: integer("created_by"),
  closedBy: integer("closed_by"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// قراءات العدادات المحسن - Enhanced Meter Readings
export const meterReadingsEnhanced = pgTable("meter_readings_enhanced", {
  id: serial("id").primaryKey(),
  meterId: integer("meter_id").notNull(),
  billingPeriodId: integer("billing_period_id").notNull(),
  currentReading: numeric("current_reading", { precision: 15, scale: 3 }).notNull(),
  previousReading: numeric("previous_reading", { precision: 15, scale: 3 }),
  consumption: numeric("consumption", { precision: 15, scale: 3 }),
  readingDate: date("reading_date").notNull(),
  readingType: varchar("readingType", { length: 50 }).default("actual"),
  status: varchar("status", { length: 50 }).default("entered"),
  isEstimated: boolean("is_estimated").default(false),
  images: jsonb("images"),
  readBy: integer("read_by"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الفواتير المحسن - Enhanced Invoices
export const invoicesEnhanced = pgTable("invoices_enhanced", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id").notNull(),
  meterId: integer("meter_id"),
  meterReadingId: integer("meter_reading_id"),
  billingPeriodId: integer("billing_period_id"),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  meterNumber: varchar("meter_number", { length: 50 }),
  previousReading: numeric("previous_reading", { precision: 15, scale: 3 }),
  currentReading: numeric("current_reading", { precision: 15, scale: 3 }),
  totalConsumptionKWH: numeric("total_consumption_kwh", { precision: 15, scale: 3 }),
  priceKwh: numeric("price_kwh", { precision: 10, scale: 4 }),
  consumptionAmount: numeric("consumption_amount", { precision: 18, scale: 2 }).default("0"),
  fixedCharges: numeric("fixed_charges", { precision: 18, scale: 2 }).default("0"),
  totalFees: numeric("total_fees", { precision: 18, scale: 2 }).default("0"),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("15"),
  vatAmount: numeric("vat_amount", { precision: 18, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).default("0"),
  previousBalanceDue: numeric("previous_balance_due", { precision: 18, scale: 2 }).default("0"),
  finalAmount: numeric("final_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0"),
  balanceDue: numeric("balance_due", { precision: 18, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("generated"),
  invoiceType: varchar("invoiceType", { length: 50 }).default("final"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// رسوم الفاتورة - Invoice Fees
export const invoiceFees = pgTable("invoice_fees", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  feeTypeId: integer("fee_type_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الصناديق - Cashboxes
export const cashboxes = pgTable("cashboxes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  branchId: integer("branch_id"),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  assignedTo: integer("assigned_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// طرق الدفع - Payment Methods
export const paymentMethodsNew = pgTable("payment_methods_new", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  methodType: varchar("methodType", { length: 50 }).default("cash"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// المدفوعات المحسن - Enhanced Payments
export const paymentsEnhanced = pgTable("payments_enhanced", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id").notNull(),
  meterId: integer("meter_id"),
  invoiceId: integer("invoice_id"),
  cashboxId: integer("cashbox_id"),
  paymentMethodId: integer("payment_method_id"),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  balanceDueBefore: numeric("balance_due_before", { precision: 18, scale: 2 }),
  balanceDueAfter: numeric("balance_due_after", { precision: 18, scale: 2 }),
  payerName: varchar("payer_name", { length: 255 }),
  referenceNumber: varchar("reference_number", { length: 100 }),
  status: varchar("status", { length: 50 }).default("completed"),
  notes: text("notes"),
  receivedBy: integer("received_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الإيصالات - Receipts
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  paymentId: integer("payment_id").notNull(),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull(),
  issueDate: date("issue_date").notNull(),
  description: text("description"),
  printedBy: integer("printed_by"),
  printedAt: timestamp("printed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// أكواد الشحن المسبق - Prepaid Codes
export const prepaidCodes = pgTable("prepaid_codes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  meterId: integer("meter_id"),
  code: varchar("code", { length: 100 }).notNull().unique(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("active"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  generatedBy: integer("generated_by"),
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
export const dieselSuppliers = pgTable("diesel_suppliers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الوايتات (صهاريج الديزل) - Diesel Tankers
export const dieselTankers = pgTable("diesel_tankers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  capacity: numeric("capacity", { precision: 10, scale: 2 }).notNull(), // السعة الكلية
  compartment1Capacity: numeric("compartment1_capacity", { precision: 10, scale: 2 }), // عين 1
  compartment2Capacity: numeric("compartment2_capacity", { precision: 10, scale: 2 }), // عين 2
  driverName: varchar("driver_name", { length: 100 }),
  driverPhone: varchar("driver_phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// خزانات المحطة - Station Tanks
export const dieselTanks = pgTable("diesel_tanks", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  // نوع الخزان حسب الوظيفة
  type: varchar("tank_type", { length: 50 }).notNull(),
  
  // مادة الخزان
  material: varchar("tank_material", { length: 50 }).default("plastic"),
  
  // بيانات الخزان الفنية
  brand: varchar("brand", { length: 100 }),           // الماركة
  color: varchar("color", { length: 50 }),            // اللون
  capacity: numeric("capacity", { precision: 10, scale: 2 }).notNull(), // السعة الكلية
  height: numeric("height", { precision: 8, scale: 2 }),    // الارتفاع بالسنتيمتر
  diameter: numeric("diameter", { precision: 8, scale: 2 }), // القطر بالسنتيمتر
  deadStock: numeric("dead_stock", { precision: 10, scale: 2 }).default("0"), // الكمية الميتة
  effectiveCapacity: numeric("effective_capacity", { precision: 10, scale: 2 }), // السعة الفعلية = السعة - الكمية الميتة
  
  // المستويات
  currentLevel: numeric("current_level", { precision: 10, scale: 2 }).default("0"),
  minLevel: numeric("min_level", { precision: 10, scale: 2 }).default("0"),
  
  // عدد الفتحات
  openingsCount: integer("openings_count").default(1),
  
  // ربط بمولد (للخزانات المرتبطة بمولد)
  linkedGeneratorId: integer("linked_generator_id"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// فتحات الخزان - Tank Openings
export const dieselTankOpenings = pgTable("diesel_tank_openings", {
  id: serial("id").primaryKey(),
  tankId: integer("tank_id").notNull(),
  openingNumber: integer("opening_number").notNull(),      // رقم الفتحة
  position: varchar("position", { length: 50 }).notNull(),
  usage: varchar("usage", { length: 50 }).notNull(),
  diameter: numeric("diameter", { precision: 6, scale: 2 }), // قطر الفتحة بالسنتيمتر
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مواصير التسليك - Diesel Pipes
export const dieselPipes = pgTable("diesel_pipes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  // مادة المواصير
  material: varchar("pipe_material", { length: 50 }).default("iron"),
  
  diameter: numeric("diameter", { precision: 6, scale: 2 }),  // القطر بالسنتيمتر
  length: numeric("length", { precision: 8, scale: 2 }),      // الطول بالمتر
  
  // حالة المواصير
  condition: varchar("condition", { length: 50 }).default("good"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// تهيئة مخطط الديزل للمحطة - Station Diesel Configuration
export const stationDieselConfig = pgTable("station_diesel_config", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id").notNull().unique(), // محطة واحدة لها تهيئة واحدة
  
  // إعدادات الطرمبات
  hasIntakePump: boolean("has_intake_pump").default(false),      // هل يوجد طرمبة دخول؟
  hasOutputPump: boolean("has_output_pump").default(false),      // هل يوجد طرمبة خروج؟
  intakePumpHasMeter: boolean("intake_pump_has_meter").default(false), // طرمبة الدخول بعداد؟
  outputPumpHasMeter: boolean("output_pump_has_meter").default(false), // طرمبة الخروج بعداد؟
  
  notes: text("notes"),
  configuredBy: integer("configured_by"),
  configuredAt: timestamp("configured_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مسار الديزل في المحطة - Station Diesel Path
// يحدد ترتيب الأصول في مسار الديزل
export const stationDieselPath = pgTable("station_diesel_path", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").notNull(),             // مرتبط بتهيئة المحطة
  sequenceOrder: integer("sequence_order").notNull(),   // ترتيب في المسار
  
  // نوع العنصر في المسار
  elementType: varchar("element_type", { length: 50 }).notNull(),
  
  // معرف العنصر (خزان أو طرمبة أو مواصير)
  tankId: integer("tank_id"),
  pumpId: integer("pump_id"),
  pipeId: integer("pipe_id"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// طرمبات العدادات - Pump Meters
export const dieselPumpMeters = pgTable("diesel_pump_meters", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id"),
  supplierId: integer("supplier_id"), // للطرمبات عند المورد
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("pump_type", { length: 50 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  currentReading: numeric("current_reading", { precision: 15, scale: 2 }).default("0"), // القراءة التسلسلية الحالية
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مهام استلام الديزل - Diesel Receiving Tasks
export const dieselReceivingTasks = pgTable("diesel_receiving_tasks", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id").notNull(),
  taskNumber: varchar("task_number", { length: 50 }).notNull(),
  taskDate: date("task_date").notNull(),
  
  // بيانات الموظف والوايت
  employeeId: integer("employee_id").notNull(), // فني المولدات
  tankerId: integer("tanker_id").notNull(),
  supplierId: integer("supplier_id").notNull(),
  
  // حالة المهمة
  status: varchar("task_status", { length: 50 }).default("pending"),
  
  // توقيتات التتبع
  startTime: timestamp("start_time"),           // وقت بدء المهمة
  arrivalAtSupplierTime: timestamp("arrival_at_supplier_time"), // وقت الوصول للمورد
  loadingStartTime: timestamp("loading_start_time"),   // وقت بدء التحميل
  loadingEndTime: timestamp("loading_end_time"),       // وقت انتهاء التحميل
  departureFromSupplierTime: timestamp("departure_from_supplier_time"), // وقت المغادرة من المورد
  arrivalAtStationTime: timestamp("arrival_at_station_time"), // وقت الوصول للمحطة
  unloadingStartTime: timestamp("unloading_start_time"), // وقت بدء التفريغ
  unloadingEndTime: timestamp("unloading_end_time"),     // وقت انتهاء التفريغ
  completionTime: timestamp("completion_time"),   // وقت إتمام المهمة
  
  // قراءات طرمبة المورد (تسلسلية)
  supplierPumpId: integer("supplier_pump_id"),
  supplierPumpReadingBefore: numeric("supplier_pump_reading_before", { precision: 15, scale: 2 }),
  supplierPumpReadingAfter: numeric("supplier_pump_reading_after", { precision: 15, scale: 2 }),
  supplierPumpReadingBeforeImage: text("supplier_pump_reading_before_image"),
  supplierPumpReadingAfterImage: text("supplier_pump_reading_after_image"),
  
  // فاتورة المورد
  supplierInvoiceNumber: varchar("supplier_invoice_number", { length: 50 }),
  supplierInvoiceImage: text("supplier_invoice_image"),
  supplierInvoiceAmount: numeric("supplier_invoice_amount", { precision: 18, scale: 2 }),
  
  // الكمية المستلمة من المورد
  quantityFromSupplier: numeric("quantity_from_supplier", { precision: 10, scale: 2 }),
  compartment1Quantity: numeric("compartment1_quantity", { precision: 10, scale: 2 }), // كمية عين 1
  compartment2Quantity: numeric("compartment2_quantity", { precision: 10, scale: 2 }), // كمية عين 2
  
  // قراءات طرمبة الدخول بالمحطة (تسلسلية)
  intakePumpId: integer("intake_pump_id"),
  intakePumpReadingBefore: numeric("intake_pump_reading_before", { precision: 15, scale: 2 }),
  intakePumpReadingAfter: numeric("intake_pump_reading_after", { precision: 15, scale: 2 }),
  intakePumpReadingBeforeImage: text("intake_pump_reading_before_image"),
  intakePumpReadingAfterImage: text("intake_pump_reading_after_image"),
  
  // الكمية المستلمة في المحطة
  quantityReceivedAtStation: numeric("quantity_received_at_station", { precision: 10, scale: 2 }),
  receivingTankId: integer("receiving_tank_id"), // خزان الاستلام
  
  // الفرق (إن وجد)
  quantityDifference: numeric("quantity_difference", { precision: 10, scale: 2 }),
  differenceNotes: text("difference_notes"),
  
  notes: text("notes"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// سجل قراءات الطرمبات - Pump Meter Readings Log
export const dieselPumpReadings = pgTable("diesel_pump_readings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  pumpMeterId: integer("pump_meter_id").notNull(),
  taskId: integer("task_id"), // مرتبط بمهمة استلام
  readingDate: timestamp("reading_date").notNull(),
  readingValue: numeric("reading_value", { precision: 15, scale: 2 }).notNull(), // القراءة التسلسلية
  readingType: varchar("readingType", { length: 50 }).notNull(),
  readingImage: text("reading_image"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }), // الكمية (الفرق بين القراءتين)
  recordedBy: integer("recorded_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// حركات الديزل بين الخزانات - Diesel Tank Movements
export const dieselTankMovements = pgTable("diesel_tank_movements", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id").notNull(),
  movementDate: timestamp("movement_date").notNull(),
  movementType: varchar("movement_type", { length: 50 }).notNull(),
  fromTankId: integer("from_tank_id"),
  toTankId: integer("to_tank_id"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  taskId: integer("task_id"), // مرتبط بمهمة استلام
  outputPumpId: integer("output_pump_id"), // طرمبة الخروج
  outputPumpReadingBefore: numeric("output_pump_reading_before", { precision: 15, scale: 2 }),
  outputPumpReadingAfter: numeric("output_pump_reading_after", { precision: 15, scale: 2 }),
  generatorId: integer("generator_id"), // للاستهلاك
  notes: text("notes"),
  recordedBy: integer("recorded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// استهلاك المولدات - Generator Diesel Consumption
export const generatorDieselConsumption = pgTable("generator_diesel_consumption", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  stationId: integer("station_id").notNull(),
  generatorId: integer("generator_id").notNull(),
  consumptionDate: date("consumption_date").notNull(),
  rocketTankId: integer("rocket_tank_id"), // خزان الصاروخ
  startLevel: numeric("start_level", { precision: 10, scale: 2 }),
  endLevel: numeric("end_level", { precision: 10, scale: 2 }),
  quantityConsumed: numeric("quantity_consumed", { precision: 10, scale: 2 }).notNull(),
  runningHours: numeric("running_hours", { precision: 8, scale: 2 }), // ساعات التشغيل
  consumptionRate: numeric("consumption_rate", { precision: 8, scale: 2 }), // معدل الاستهلاك لتر/ساعة
  notes: text("notes"),
  recordedBy: integer("recorded_by"),
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


// ============================================
// النظام المخصص - Personal Finance System
// ============================================

// الأنظمة الفرعية - Sub Systems
export const customSubSystems = pgTable("custom_sub_systems", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("css_business_idx").on(table.businessId),
  codeIdx: uniqueIndex("css_code_idx").on(table.businessId, table.code),
}));

// الخزائن - Treasuries (صناديق، بنوك، محافظ إلكترونية، صرافين)
export const customTreasuries = pgTable("custom_treasuries", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  subSystemId: integer("sub_system_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  treasuryType: varchar("treasury_type", { length: 50 }).notNull(),
  accountId: integer("account_id"),
  // cash = صندوق، bank = بنك، wallet = محفظة إلكترونية، exchange = صراف
  bankName: varchar("bank_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 100 }),
  iban: varchar("iban", { length: 50 }),
  swiftCode: varchar("swift_code", { length: 20 }),
  walletProvider: varchar("wallet_provider", { length: 100 }), // STC Pay, Apple Pay, etc.
  walletNumber: varchar("wallet_number", { length: 100 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  openingBalance: numeric("opening_balance", { precision: 18, scale: 2 }).default("0"),
  currentBalance: numeric("current_balance", { precision: 18, scale: 2 }).default("0"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("ct_business_idx").on(table.businessId),
  subSystemIdx: index("ct_subsystem_idx").on(table.subSystemId),
  typeIdx: index("ct_type_idx").on(table.treasuryType),
  codeIdx: uniqueIndex("ct_code_idx").on(table.businessId, table.code),
}));

// عملات الخزائن - Treasury Currencies (علاقة many-to-many)
export const customTreasuryCurrencies = pgTable("custom_treasury_currencies", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  treasuryId: integer("treasury_id").notNull(),
  currencyId: integer("currency_id").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  openingBalance: numeric("opening_balance", { precision: 15, scale: 2 }).default("0"),
  currentBalance: numeric("current_balance", { precision: 15, scale: 2 }).default("0"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  treasuryIdx: index("idx_treasury_id").on(table.treasuryId),
  currencyIdx: index("idx_currency_id").on(table.currencyId),
  businessIdx: index("idx_business_id").on(table.businessId),
  uniqueTreasuryCurrency: uniqueIndex("unique_treasury_currency").on(table.treasuryId, table.currencyId),
}));

// الحسابات الوسيطة - Intermediary Accounts
export const customIntermediaryAccounts = pgTable("custom_intermediary_accounts", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  fromSubSystemId: integer("from_sub_system_id").notNull(),
  toSubSystemId: integer("to_sub_system_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// سندات القبض - Receipt Vouchers
export const customReceiptVouchers = pgTable("custom_receipt_vouchers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  subSystemId: integer("sub_system_id").notNull(),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
  voucherDate: date("voucher_date").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // من أين (المصدر)
  sourceType: varchar("sourceType", { length: 50 }).notNull(),
  sourceName: varchar("source_name", { length: 255 }),
  sourceIntermediaryId: integer("source_intermediary_id"), // إذا كان من حساب وسيط
  // === الحقول الجديدة ===
  partyId: integer("party_id"), // ربط بجدول الأطراف
  categoryId: integer("category_id"), // ربط بجدول التصنيفات
  // طريقة الدفع
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash"),
  checkNumber: varchar("check_number", { length: 50 }),
  checkDate: date("check_date"),
  checkBank: varchar("check_bank", { length: 100 }),
  bankReference: varchar("bank_reference", { length: 100 }),
  // === نهاية الحقول الجديدة ===
  // إلى أين (الخزينة)
  treasuryId: integer("treasury_id").notNull(),
  description: text("description"),
  attachments: jsonb("attachments"),
  status: varchar("status", { length: 50 }).default("draft"),
  isReconciled: boolean("is_reconciled").default(false),
  reconciledWith: integer("reconciled_with"), // رقم سند الصرف المطابق
  reconciledAt: timestamp("reconciled_at"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("crv_business_idx").on(table.businessId),
  subSystemIdx: index("crv_subsystem_idx").on(table.subSystemId),
  treasuryIdx: index("crv_treasury_idx").on(table.treasuryId),
  partyIdx: index("crv_party_idx").on(table.partyId),
  categoryIdx: index("crv_category_idx").on(table.categoryId),
  dateIdx: index("crv_date_idx").on(table.voucherDate),
  numberIdx: uniqueIndex("crv_number_idx").on(table.businessId, table.subSystemId, table.voucherNumber),
}));

// سندات الصرف - Payment Vouchers
export const customPaymentVouchers = pgTable("custom_payment_vouchers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  subSystemId: integer("sub_system_id").notNull(),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
  voucherDate: date("voucher_date").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  currencyId: integer("currency_id"), // ربط بجدول العملات
  // من أين (الخزينة)
  treasuryId: integer("treasury_id").notNull(),
  // إلى أين (الوجهة)
  destinationType: varchar("destinationType", { length: 50 }).notNull(),
  destinationName: varchar("destination_name", { length: 255 }),
  destinationIntermediaryId: integer("destination_intermediary_id"), // إذا كان إلى حساب وسيط
  // === الحقول الجديدة ===
  partyId: integer("party_id"), // ربط بجدول الأطراف
  categoryId: integer("category_id"), // ربط بجدول التصنيفات
  // طريقة الدفع
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash"),
  checkNumber: varchar("check_number", { length: 50 }),
  checkDate: date("check_date"),
  checkBank: varchar("check_bank", { length: 100 }),
  bankReference: varchar("bank_reference", { length: 100 }),
  // === نهاية الحقول الجديدة ===
  description: text("description"),
  attachments: jsonb("attachments"),
  status: varchar("status", { length: 50 }).default("draft"),
  editCount: integer("edit_count").default(0).notNull(),
  isReconciled: boolean("is_reconciled").default(false),
  reconciledWith: integer("reconciled_with"), // رقم سند القبض المطابق
  reconciledAt: timestamp("reconciled_at"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("cpv_business_idx").on(table.businessId),
  subSystemIdx: index("cpv_subsystem_idx").on(table.subSystemId),
  treasuryIdx: index("cpv_treasury_idx").on(table.treasuryId),
  partyIdx: index("cpv_party_idx").on(table.partyId),
  categoryIdx: index("cpv_category_idx").on(table.categoryId),
  dateIdx: index("cpv_date_idx").on(table.voucherDate),
  numberIdx: uniqueIndex("cpv_number_idx").on(table.businessId, table.subSystemId, table.voucherNumber),
}));

// بنود سندات الصرف - Payment Voucher Lines (توزيع المبلغ على عدة حسابات)
export const customPaymentVoucherLines = pgTable("custom_payment_voucher_lines", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),

  paymentVoucherId: integer("payment_voucher_id").notNull(),
  lineOrder: integer("line_order").default(0).notNull(),

  // تصنيفات الحساب (للعرض/الفلترة) - اختيارية لأن الحسابId يكفي
  accountType: varchar("account_type", { length: 50 }),
  accountSubTypeId: integer("account_sub_type_id"),

  // الحساب (من دليل الحسابات v2)
  accountId: integer("account_id").notNull(),

  // الحساب التحليلي المرتبط بالحساب (حساب ابن/تفصيلي) إن وجد
  analyticAccountId: integer("analytic_account_id"),

  // الخزينة التحليلية المرتبطة بالحساب (صندوق/بنك/محفظة/صراف) إن وجد
  analyticTreasuryId: integer("analytic_treasury_id"),

  // (اختياري للتوسع لاحقاً) مركز تكلفة إن وجد
  costCenterId: integer("cost_center_id"),

  // البيان والمبلغ
  description: text("description"),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("cpvl_business_idx").on(table.businessId),
  voucherIdx: index("cpvl_voucher_idx").on(table.paymentVoucherId),
  accountIdx: index("cpvl_account_idx").on(table.accountId),
  analyticAccountIdx: index("cpvl_analytic_account_idx").on(table.analyticAccountId),
  analyticTreasuryIdx: index("cpvl_analytic_treasury_idx").on(table.analyticTreasuryId),
  costCenterIdx: index("cpvl_cost_center_idx").on(table.costCenterId),
}));

// المطابقات - Reconciliations
export const customReconciliations = pgTable("custom_reconciliations", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  paymentVoucherId: integer("payment_voucher_id").notNull(),
  receiptVoucherId: integer("receipt_voucher_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  confidenceScore: varchar("confidenceScore", { length: 50 }).default("medium"),
  status: varchar("status", { length: 50 }).default("pending"),
  notes: text("notes"),
  confirmedBy: integer("confirmed_by"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// التحويلات بين الخزائن - Treasury Transfers
export const customTreasuryTransfers = pgTable("custom_treasury_transfers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  subSystemId: integer("sub_system_id").notNull(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull(),
  transferDate: date("transfer_date").notNull(),
  fromTreasuryId: integer("from_treasury_id").notNull(),
  toTreasuryId: integer("to_treasury_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }).default("1"),
  fees: numeric("fees", { precision: 18, scale: 2 }).default("0"),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("draft"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types للجداول الجديدة
export type CustomSubSystem = typeof customSubSystems.$inferSelect;
export type InsertCustomSubSystem = typeof customSubSystems.$inferInsert;
export type CustomTreasury = typeof customTreasuries.$inferSelect;
export type InsertCustomTreasury = typeof customTreasuries.$inferInsert;
export type CustomIntermediaryAccount = typeof customIntermediaryAccounts.$inferSelect;
export type InsertCustomIntermediaryAccount = typeof customIntermediaryAccounts.$inferInsert;
export type CustomReceiptVoucher = typeof customReceiptVouchers.$inferSelect;
export type InsertCustomReceiptVoucher = typeof customReceiptVouchers.$inferInsert;
export type CustomPaymentVoucher = typeof customPaymentVouchers.$inferSelect;
export type InsertCustomPaymentVoucher = typeof customPaymentVouchers.$inferInsert;
export type CustomPaymentVoucherLine = typeof customPaymentVoucherLines.$inferSelect;
export type InsertCustomPaymentVoucherLine = typeof customPaymentVoucherLines.$inferInsert;
export type CustomReconciliation = typeof customReconciliations.$inferSelect;
export type InsertCustomReconciliation = typeof customReconciliations.$inferInsert;
export type CustomTreasuryTransfer = typeof customTreasuryTransfers.$inferSelect;
export type InsertCustomTreasuryTransfer = typeof customTreasuryTransfers.$inferInsert;

// ============================================
// النظام المخصص - الجداول الجديدة (إصلاح الفجوات)
// Custom System - New Tables (Gap Fixes)
// ============================================

// الأطراف - Parties (عملاء، موردين، موظفين، جهات)
export const customParties = pgTable("custom_parties", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  subSystemId: integer("sub_system_id"), // يمكن ربط الطرف بنظام فرعي محدد
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  partyType: varchar("partyType", { length: 50 }).notNull(),
  // بيانات التواصل
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Saudi Arabia"),
  // بيانات ضريبية/تجارية
  taxNumber: varchar("tax_number", { length: 50 }),
  commercialRegister: varchar("commercial_register", { length: 50 }),
  // الحدود والأرصدة
  creditLimit: numeric("credit_limit", { precision: 18, scale: 2 }).default("0"),
  currentBalance: numeric("current_balance", { precision: 18, scale: 2 }).default("0"), // موجب = له، سالب = عليه
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // معلومات إضافية
  contactPerson: varchar("contact_person", { length: 255 }),
  notes: text("notes"),
  tags: jsonb("tags"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("cp_business_idx").on(table.businessId),
  subSystemIdx: index("cp_subsystem_idx").on(table.subSystemId),
  codeIdx: uniqueIndex("cp_code_idx").on(table.businessId, table.code),
  partyTypeIdx: index("cp_party_type_idx").on(table.businessId, table.partyType),
  nameIdx: index("cp_name_idx").on(table.nameAr),
}));

// التصنيفات/البنود - Categories (بنود الإيرادات والمصروفات)
export const customCategories = pgTable("custom_categories", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  subSystemId: integer("sub_system_id"), // يمكن ربط التصنيف بنظام فرعي محدد
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  categoryType: varchar("categoryType", { length: 50 }).notNull(),
  parentId: integer("parent_id"), // للتصنيفات الهرمية
  level: integer("level").default(1),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  // ربط بالحساب المحاسبي (اختياري)
  linkedAccountId: integer("linked_account_id"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("cc_business_idx").on(table.businessId),
  parentIdx: index("cc_parent_idx").on(table.parentId),
  codeIdx: uniqueIndex("cc_code_idx").on(table.businessId, table.code),
  typeIdx: index("cc_type_idx").on(table.businessId, table.categoryType),
}));

// حركات الخزينة - Treasury Movements (سجل كل حركة على الخزينة)
export const customTreasuryMovements = pgTable("custom_treasury_movements", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  treasuryId: integer("treasury_id").notNull(),
  movementType: varchar("movement_type", { length: 50 }).notNull(),
  movementDate: date("movement_date").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  balanceBefore: numeric("balance_before", { precision: 18, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // مرجع الحركة
  referenceType: varchar("reference_type", { length: 50 }), // 'receipt_voucher', 'payment_voucher', 'transfer'
  referenceId: integer("reference_id"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  description: text("description"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  treasuryIdx: index("ctm_treasury_idx").on(table.treasuryId),
  dateIdx: index("ctm_date_idx").on(table.movementDate),
  typeIdx: index("ctm_type_idx").on(table.movementType),
  refIdx: index("ctm_ref_idx").on(table.referenceType, table.referenceId),
  treasuryDateIdx: index("ctm_treasury_date_idx").on(table.treasuryId, table.movementDate),
}));

// حركات الأطراف - Party Transactions (سجل كل حركة مع طرف)
export const customPartyTransactions = pgTable("custom_party_transactions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  partyId: integer("party_id").notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  balanceBefore: numeric("balance_before", { precision: 18, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  // مرجع الحركة
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  referenceNumber: varchar("reference_number", { length: 50 }),
  description: text("description"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  partyIdx: index("cpt_party_idx").on(table.partyId),
  dateIdx: index("cpt_date_idx").on(table.transactionDate),
  typeIdx: index("cpt_type_idx").on(table.transactionType),
  refIdx: index("cpt_ref_idx").on(table.referenceType, table.referenceId),
  partyDateIdx: index("cpt_party_date_idx").on(table.partyId, table.transactionDate),
}));

// إعدادات النظام المخصص - Custom System Settings
export const customSettings = pgTable("custom_settings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  subSystemId: integer("sub_system_id"), // إعدادات خاصة بنظام فرعي
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  settingValue: text("setting_value"),
  settingType: varchar("settingType", { length: 50 }).default("string"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types للجداول الجديدة
export type CustomParty = typeof customParties.$inferSelect;
export type InsertCustomParty = typeof customParties.$inferInsert;
export type CustomCategory = typeof customCategories.$inferSelect;
export type InsertCustomCategory = typeof customCategories.$inferInsert;
export type CustomTreasuryMovement = typeof customTreasuryMovements.$inferSelect;
export type InsertCustomTreasuryMovement = typeof customTreasuryMovements.$inferInsert;
export type CustomPartyTransaction = typeof customPartyTransactions.$inferSelect;
export type InsertCustomPartyTransaction = typeof customPartyTransactions.$inferInsert;
export type CustomSetting = typeof customSettings.$inferSelect;
export type InsertCustomSetting = typeof customSettings.$inferInsert;

// ============================================
// النظام المخصص v2.2.0 - Custom System v2.2.0
// ============================================

// Re-export الجداول الجديدة من customSystemV2.ts
export {
  customCurrencies,
  customExchangeRates,
  customAccountSubTypes,
  customAccountCurrencies,
  customAccountBalances,
  customJournalEntries,
  customJournalEntryLines,
  customReceipts,
  customPayments,
  type CustomCurrency,
  type InsertCustomCurrency,
  type CustomExchangeRate,
  type InsertCustomExchangeRate,
  type CustomAccountSubType,
  type InsertCustomAccountSubType,
  type CustomAccountCurrency,
  type InsertCustomAccountCurrency,
  type CustomAccountBalance,
  type InsertCustomAccountBalance,
  type CustomJournalEntry,
  type InsertCustomJournalEntry,
  type CustomJournalEntryLine,
  type InsertCustomJournalEntryLine,
  type CustomReceipt,
  type InsertCustomReceipt,
  type CustomPayment,
  type InsertCustomPayment,
  customAccountTypes,
  type CustomAccountType,
  type InsertCustomAccountType,
} from "./schemas/customSystemV2";

// Re-export نظام الوسيط - Intermediary System
export {
  intermediaryAccounts,
  intermediaryAccountSubSystems,
  intermediaryAccountMovements,
  intermediaryReconciliations,
  intermediaryDailySummary,
  type IntermediaryAccount,
  type InsertIntermediaryAccount,
  type IntermediaryAccountSubSystem,
  type InsertIntermediaryAccountSubSystem,
  type IntermediaryAccountMovement,
  type InsertIntermediaryAccountMovement,
  type IntermediaryReconciliation,
  type InsertIntermediaryReconciliation,
  type IntermediaryDailySummary,
  type InsertIntermediaryDailySummary,
} from "./schemas/intermediarySystem";

// Pricing Rules
export { pricingRules } from "./schemas/pricing";
export type { pricingRules as PricingRule } from "./schemas/pricing";