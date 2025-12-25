import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
