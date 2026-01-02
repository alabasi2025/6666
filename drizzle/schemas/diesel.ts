import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// نظام استهلاك الديزل - Diesel Consumption System
// ============================================

// الموردين - Diesel Suppliers
export const dieselSuppliers = mysqlTable("diesel_suppliers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// الوايتات (صهاريج الديزل) - Diesel Tankers
export const dieselTankers = mysqlTable("diesel_tankers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(), // السعة الكلية
  compartment1Capacity: decimal("compartment1_capacity", { precision: 10, scale: 2 }), // عين 1
  compartment2Capacity: decimal("compartment2_capacity", { precision: 10, scale: 2 }), // عين 2
  driverName: varchar("driver_name", { length: 100 }),
  driverPhone: varchar("driver_phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// خزانات المحطة - Station Tanks
export const dieselTanks = mysqlTable("diesel_tanks", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  // نوع الخزان حسب الوظيفة
  type: mysqlEnum("tank_type", [
    "receiving",      // خزان استلام
    "main",           // خزان رئيسي
    "pre_output",     // خزان قبل طرمبة الخروج
    "generator"       // خزان مولد
  ]).notNull(),
  
  // مادة الخزان
  material: mysqlEnum("tank_material", [
    "plastic",        // بلاستيك
    "iron",           // حديد
    "stainless_steel", // ستانلس ستيل
    "fiberglass"      // فايبر جلاس
  ]).default("plastic"),
  
  // بيانات الخزان الفنية
  brand: varchar("brand", { length: 100 }),           // الماركة
  color: varchar("color", { length: 50 }),            // اللون
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(), // السعة الكلية
  height: decimal("height", { precision: 8, scale: 2 }),    // الارتفاع بالسنتيمتر
  diameter: decimal("diameter", { precision: 8, scale: 2 }), // القطر بالسنتيمتر
  deadStock: decimal("dead_stock", { precision: 10, scale: 2 }).default("0"), // الكمية الميتة
  effectiveCapacity: decimal("effective_capacity", { precision: 10, scale: 2 }), // السعة الفعلية = السعة - الكمية الميتة
  
  // المستويات
  currentLevel: decimal("current_level", { precision: 10, scale: 2 }).default("0"),
  minLevel: decimal("min_level", { precision: 10, scale: 2 }).default("0"),
  
  // عدد الفتحات
  openingsCount: int("openings_count").default(1),
  
  // ربط بمولد (للخزانات المرتبطة بمولد)
  linkedGeneratorId: int("linked_generator_id"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// فتحات الخزان - Tank Openings
export const dieselTankOpenings = mysqlTable("diesel_tank_openings", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tank_id").notNull(),
  openingNumber: int("opening_number").notNull(),      // رقم الفتحة
  position: mysqlEnum("position", [
    "top",            // فوق
    "bottom",         // تحت
    "side"            // جانب
  ]).notNull(),
  usage: mysqlEnum("usage", [
    "inlet",          // دخول
    "outlet",         // خروج
    "ventilation",    // تهوية
    "measurement",    // قياس
    "cleaning"        // تنظيف
  ]).notNull(),
  diameter: decimal("diameter", { precision: 6, scale: 2 }), // قطر الفتحة بالسنتيمتر
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مواصير التسليك - Diesel Pipes
export const dieselPipes = mysqlTable("diesel_pipes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  // مادة المواصير
  material: mysqlEnum("pipe_material", [
    "iron",           // حديد
    "plastic",        // بلاستيك
    "copper",         // نحاس
    "stainless_steel" // ستانلس ستيل
  ]).default("iron"),
  
  diameter: decimal("diameter", { precision: 6, scale: 2 }),  // القطر بالسنتيمتر
  length: decimal("length", { precision: 8, scale: 2 }),      // الطول بالمتر
  
  // حالة المواصير
  condition: mysqlEnum("condition", [
    "good",           // جيدة
    "fair",           // متوسطة
    "poor",           // سيئة
    "needs_replacement" // تحتاج استبدال
  ]).default("good"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// تهيئة مخطط الديزل للمحطة - Station Diesel Configuration
export const stationDieselConfig = mysqlTable("station_diesel_config", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull().unique(), // محطة واحدة لها تهيئة واحدة
  
  // إعدادات الطرمبات
  hasIntakePump: boolean("has_intake_pump").default(false),      // هل يوجد طرمبة دخول؟
  hasOutputPump: boolean("has_output_pump").default(false),      // هل يوجد طرمبة خروج؟
  intakePumpHasMeter: boolean("intake_pump_has_meter").default(false), // طرمبة الدخول بعداد؟
  outputPumpHasMeter: boolean("output_pump_has_meter").default(false), // طرمبة الخروج بعداد؟
  
  notes: text("notes"),
  configuredBy: int("configured_by"),
  configuredAt: timestamp("configured_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مسار الديزل في المحطة - Station Diesel Path
// يحدد ترتيب الأصول في مسار الديزل
export const stationDieselPath = mysqlTable("station_diesel_path", {
  id: int("id").autoincrement().primaryKey(),
  configId: int("config_id").notNull(),             // مرتبط بتهيئة المحطة
  sequenceOrder: int("sequence_order").notNull(),   // ترتيب في المسار
  
  // نوع العنصر في المسار
  elementType: mysqlEnum("element_type", [
    "receiving_tank",   // خزان استلام
    "pipe",             // مواصير
    "intake_pump",      // طرمبة دخول
    "main_tank",        // خزان رئيسي
    "pre_output_tank",  // خزان قبل طرمبة الخروج
    "output_pump",      // طرمبة خروج
    "generator_tank"    // خزان مولد
  ]).notNull(),
  
  // معرف العنصر (خزان أو طرمبة أو مواصير)
  tankId: int("tank_id"),
  pumpId: int("pump_id"),
  pipeId: int("pipe_id"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// طرمبات العدادات - Pump Meters
export const dieselPumpMeters = mysqlTable("diesel_pump_meters", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id"),
  supplierId: int("supplier_id"), // للطرمبات عند المورد
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("pump_type", [
    "supplier",       // طرمبة المورد
    "intake",         // طرمبة الدخول (الاستلام)
    "output"          // طرمبة الخروج (التوزيع)
  ]).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  currentReading: decimal("current_reading", { precision: 15, scale: 2 }).default("0"), // القراءة التسلسلية الحالية
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// مهام استلام الديزل - Diesel Receiving Tasks
export const dieselReceivingTasks = mysqlTable("diesel_receiving_tasks", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  taskNumber: varchar("task_number", { length: 50 }).notNull(),
  taskDate: date("task_date").notNull(),
  
  // بيانات الموظف والوايت
  employeeId: int("employee_id").notNull(), // فني المولدات
  tankerId: int("tanker_id").notNull(),
  supplierId: int("supplier_id").notNull(),
  
  // حالة المهمة
  status: mysqlEnum("task_status", [
    "pending",        // في الانتظار
    "started",        // بدأت (ذهب للمورد)
    "at_supplier",    // عند المورد
    "loading",        // جاري التحميل
    "returning",      // في طريق العودة
    "at_station",     // وصل المحطة
    "unloading",      // جاري التفريغ
    "completed",      // مكتملة
    "cancelled"       // ملغاة
  ]).default("pending"),
  
  // توقيتات التتبع
  startTime: datetime("start_time"),           // وقت بدء المهمة
  arrivalAtSupplierTime: datetime("arrival_at_supplier_time"), // وقت الوصول للمورد
  loadingStartTime: datetime("loading_start_time"),   // وقت بدء التحميل
  loadingEndTime: datetime("loading_end_time"),       // وقت انتهاء التحميل
  departureFromSupplierTime: datetime("departure_from_supplier_time"), // وقت المغادرة من المورد
  arrivalAtStationTime: datetime("arrival_at_station_time"), // وقت الوصول للمحطة
  unloadingStartTime: datetime("unloading_start_time"), // وقت بدء التفريغ
  unloadingEndTime: datetime("unloading_end_time"),     // وقت انتهاء التفريغ
  completionTime: datetime("completion_time"),   // وقت إتمام المهمة
  
  // قراءات طرمبة المورد (تسلسلية)
  supplierPumpId: int("supplier_pump_id"),
  supplierPumpReadingBefore: decimal("supplier_pump_reading_before", { precision: 15, scale: 2 }),
  supplierPumpReadingAfter: decimal("supplier_pump_reading_after", { precision: 15, scale: 2 }),
  supplierPumpReadingBeforeImage: text("supplier_pump_reading_before_image"),
  supplierPumpReadingAfterImage: text("supplier_pump_reading_after_image"),
  
  // فاتورة المورد
  supplierInvoiceNumber: varchar("supplier_invoice_number", { length: 50 }),
  supplierInvoiceImage: text("supplier_invoice_image"),
  supplierInvoiceAmount: decimal("supplier_invoice_amount", { precision: 18, scale: 2 }),
  
  // الكمية المستلمة من المورد
  quantityFromSupplier: decimal("quantity_from_supplier", { precision: 10, scale: 2 }),
  compartment1Quantity: decimal("compartment1_quantity", { precision: 10, scale: 2 }), // كمية عين 1
  compartment2Quantity: decimal("compartment2_quantity", { precision: 10, scale: 2 }), // كمية عين 2
  
  // قراءات طرمبة الدخول بالمحطة (تسلسلية)
  intakePumpId: int("intake_pump_id"),
  intakePumpReadingBefore: decimal("intake_pump_reading_before", { precision: 15, scale: 2 }),
  intakePumpReadingAfter: decimal("intake_pump_reading_after", { precision: 15, scale: 2 }),
  intakePumpReadingBeforeImage: text("intake_pump_reading_before_image"),
  intakePumpReadingAfterImage: text("intake_pump_reading_after_image"),
  
  // الكمية المستلمة في المحطة
  quantityReceivedAtStation: decimal("quantity_received_at_station", { precision: 10, scale: 2 }),
  receivingTankId: int("receiving_tank_id"), // خزان الاستلام
  
  // الفرق (إن وجد)
  quantityDifference: decimal("quantity_difference", { precision: 10, scale: 2 }),
  differenceNotes: text("difference_notes"),
  
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// سجل قراءات الطرمبات - Pump Meter Readings Log
export const dieselPumpReadings = mysqlTable("diesel_pump_readings", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  pumpMeterId: int("pump_meter_id").notNull(),
  taskId: int("task_id"), // مرتبط بمهمة استلام
  readingDate: datetime("reading_date").notNull(),
  readingValue: decimal("reading_value", { precision: 15, scale: 2 }).notNull(), // القراءة التسلسلية
  readingType: mysqlEnum("reading_type", ["before", "after"]).notNull(),
  readingImage: text("reading_image"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }), // الكمية (الفرق بين القراءتين)
  recordedBy: int("recorded_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// حركات الديزل بين الخزانات - Diesel Tank Movements
export const dieselTankMovements = mysqlTable("diesel_tank_movements", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  movementDate: datetime("movement_date").notNull(),
  movementType: mysqlEnum("movement_type", [
    "receiving",      // استلام من الوايت
    "transfer",       // نقل بين خزانات
    "consumption",    // استهلاك (للمولدات)
    "adjustment"      // تعديل جرد
  ]).notNull(),
  fromTankId: int("from_tank_id"),
  toTankId: int("to_tank_id"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  taskId: int("task_id"), // مرتبط بمهمة استلام
  outputPumpId: int("output_pump_id"), // طرمبة الخروج
  outputPumpReadingBefore: decimal("output_pump_reading_before", { precision: 15, scale: 2 }),
  outputPumpReadingAfter: decimal("output_pump_reading_after", { precision: 15, scale: 2 }),
  generatorId: int("generator_id"), // للاستهلاك
  notes: text("notes"),
  recordedBy: int("recorded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// استهلاك المولدات - Generator Diesel Consumption
export const generatorDieselConsumption = mysqlTable("generator_diesel_consumption", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  stationId: int("station_id").notNull(),
  generatorId: int("generator_id").notNull(),
  consumptionDate: date("consumption_date").notNull(),
  rocketTankId: int("rocket_tank_id"), // خزان الصاروخ
  startLevel: decimal("start_level", { precision: 10, scale: 2 }),
  endLevel: decimal("end_level", { precision: 10, scale: 2 }),
  quantityConsumed: decimal("quantity_consumed", { precision: 10, scale: 2 }).notNull(),
  runningHours: decimal("running_hours", { precision: 8, scale: 2 }), // ساعات التشغيل
  consumptionRate: decimal("consumption_rate", { precision: 8, scale: 2 }), // معدل الاستهلاك لتر/ساعة
  notes: text("notes"),
  recordedBy: int("recorded_by"),
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

