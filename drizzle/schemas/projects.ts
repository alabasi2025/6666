import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
