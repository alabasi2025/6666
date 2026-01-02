import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
  systemType: mysqlEnum("system_type", ["energy", "custom", "both"]).default("both").notNull(),
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
