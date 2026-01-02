import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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
