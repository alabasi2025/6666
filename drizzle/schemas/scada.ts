import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
