import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
