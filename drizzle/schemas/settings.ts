import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
