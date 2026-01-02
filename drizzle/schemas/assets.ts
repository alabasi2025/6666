import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
