import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum, datetime } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
