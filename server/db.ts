import { eq, and, desc, asc, sql, like, or, isNull, count, inArray, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  businesses, InsertBusiness,
  branches, InsertBranch,
  stations, InsertStation,
  roles, InsertRole,
  permissions,
  rolePermissions,
  userRoles,
  accounts, InsertAccount,
  journalEntries, InsertJournalEntry,
  journalEntryLines,
  costCenters,
  fiscalPeriods,
  assets, InsertAsset,
  assetCategories,
  assetMovements,
  workOrders, InsertWorkOrder,
  workOrderTasks,
  maintenancePlans,
  warehouses,
  items, InsertItem,
  itemCategories,
  stockBalances,
  stockMovements,
  suppliers, InsertSupplier,
  purchaseRequests,
  purchaseOrders,
  // HR System
  departments, InsertDepartment,
  jobTitles, InsertJobTitle,
  salaryGrades, InsertSalaryGrade,
  employees, InsertEmployee,
  salaryDetails, InsertSalaryDetail,
  payrollRuns, InsertPayrollRun,
  payrollItems, InsertPayrollItem,
  attendance, InsertAttendance,
  leaveTypes, InsertLeaveType,
  leaveRequests, InsertLeaveRequest,
  leaveBalances, InsertLeaveBalance,
  performanceEvaluations, InsertPerformanceEvaluation,
  employeeContracts, InsertEmployeeContract,
  customers, InsertCustomer,
  meters,
  meterReadings,
  invoices, InsertInvoice,
  payments,
  equipment, InsertEquipment,
  sensors,
  alerts, InsertAlert,
  auditLogs,
  projects, InsertProject,
  projectPhases,
  projectTasks,
  settings,
  sequences,
  // Developer System
  integrations, InsertIntegration,
  // Field Operations System
  fieldOperations, InsertFieldOperation,
  operationStatusLog, InsertOperationStatusLog,
  installationDetails, InsertInstallationDetail,
  installationPhotos, InsertInstallationPhoto,
  fieldTeams, InsertFieldTeam,
  fieldWorkers, InsertFieldWorker,
  workerLocations, InsertWorkerLocation,
  workerPerformance, InsertWorkerPerformance,
  workerIncentives, InsertWorkerIncentive,
  materialRequests, InsertMaterialRequest,
  materialRequestItems, InsertMaterialRequestItem,
  fieldEquipment, InsertFieldEquipment,
  equipmentMovements, InsertEquipmentMovement,
  inspections, InsertInspection,
  inspectionItems, InsertInspectionItem,
  inspectionChecklists, InsertInspectionChecklist,
  operationApprovals, InsertOperationApproval,
  operationPayments, InsertOperationPayment,
  periodSettlements, InsertPeriodSettlement,
  settlementItems, InsertSettlementItem,
  integrationConfigs, InsertIntegrationConfig,
  integrationLogs, InsertIntegrationLog,
  systemEvents, InsertSystemEvent,
  eventSubscriptions, InsertEventSubscription,
  apiKeys, InsertApiKey,
  apiLogs, InsertApiLog,
  aiModels, InsertAiModel,
  aiPredictions, InsertAiPrediction,
  technicalAlertRules, InsertTechnicalAlertRule,
  technicalAlerts, InsertTechnicalAlert,
  performanceMetrics, InsertPerformanceMetric,
  incomingWebhooks, InsertIncomingWebhook,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _connectionTested = false;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      // Test connection
      if (!_connectionTested) {
        await _db.execute(sql`SELECT 1`);
        console.log("✅ [Database] Connected successfully");
        _connectionTested = true;
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _connectionTested = false;
    }
  }
  return _db;
}

export async function testDatabaseConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.log("⚠️ [Database] DATABASE_URL not set, running in DEMO_MODE");
    return false;
  }
  
  try {
    const db = await getDb();
    if (!db) {
      console.log("❌ [Database] Connection failed");
      return false;
    }
    await db.execute(sql`SELECT 1`);
    console.log("✅ [Database] Connection test successful");
    return true;
  } catch (error) {
    console.error("❌ [Database] Connection test failed:", error);
    return false;
  }
}

// ============================================
// User Management
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "nameAr", "email", "phone", "avatar", "loginMethod", "jobTitle"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(businessId?: number) {
  const db = await getDb();
  if (!db) return [];

  if (businessId) {
    return await db.select().from(users).where(eq(users.businessId, businessId)).orderBy(desc(users.createdAt));
  }
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by phone: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function createUserWithPhone(data: { phone: string; password: string; name?: string; role?: 'user' | 'admin' | 'super_admin' }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const openId = `phone_${data.phone}_${Date.now()}`;
  const result = await db.insert(users).values({
    openId,
    phone: data.phone,
    password: data.password,
    name: data.name || data.phone,
    role: data.role || 'user',
    loginMethod: 'phone',
  });
  
  return result[0].insertId;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<{
  name: string | null;
  email: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'super_admin';
  businessId: number | null;
  branchId: number | null;
  stationId: number | null;
  departmentId: number | null;
  jobTitle: string | null;
  isActive: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Filter out undefined values
  const updateData: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateData[key] = value;
    }
  });

  if (Object.keys(updateData).length === 0) return;

  await db.update(users).set(updateData).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(users).where(eq(users.id, id));
}

// ============================================
// Business Management
// ============================================

export async function createBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(businesses).values(data);
  return result[0].insertId;
}

export async function getBusinesses() {
  const db = await getDb();
  if (!db) {
    console.warn("[DB] Database not available in getBusinesses");
    return [];
  }

  try {
    // Get all active businesses - try with boolean true first
    let result = await db.select().from(businesses).where(eq(businesses.isActive, true)).orderBy(asc(businesses.nameAr));
    console.log("[DB] getBusinesses (isActive=true) returned", result.length, "businesses");
    
    // If no results, try with number 1 (MySQL stores boolean as tinyint)
    if (result.length === 0) {
      console.log("[DB] Trying with isActive=1 (number)");
      result = await db.select().from(businesses).where(eq(businesses.isActive, 1)).orderBy(asc(businesses.nameAr));
      console.log("[DB] getBusinesses (isActive=1) returned", result.length, "businesses");
    }
    
    // If still no results, get all businesses
    if (result.length === 0) {
      console.log("[DB] Trying without filter - getting all businesses");
      result = await db.select().from(businesses).orderBy(asc(businesses.nameAr));
      console.log("[DB] getBusinesses (all) returned", result.length, "businesses");
    }
    
    if (result.length > 0) {
      console.log("[DB] First business:", { id: result[0].id, code: result[0].code, nameAr: result[0].nameAr, nameEn: result[0].nameEn, isActive: result[0].isActive });
    }
    return result;
  } catch (error) {
    console.error("[DB] Error in getBusinesses:", error);
    // Try without filter as fallback
    try {
      const allResult = await db.select().from(businesses).orderBy(asc(businesses.nameAr));
      console.log("[DB] getBusinesses (fallback) returned", allResult.length, "businesses");
      return allResult;
    } catch (fallbackError) {
      console.error("[DB] Fallback query also failed:", fallbackError);
      return [];
    }
  }
}

export async function getBusinessById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return result[0] || null;
}

export async function updateBusiness(id: number, data: Partial<InsertBusiness>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(businesses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(businesses.id, id));
  
  return id;
}

export async function deleteBusiness(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Soft delete - set isActive to false
  await db.update(businesses)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(businesses.id, id));
  
  return id;
}

// ============================================
// Branch Management
// ============================================

export async function createBranch(data: InsertBranch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(branches).values(data);
  return result[0].insertId;
}

export async function getBranches(businessId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (businessId) {
    return await db.select().from(branches)
      .where(and(eq(branches.businessId, businessId), eq(branches.isActive, true)))
      .orderBy(asc(branches.nameAr));
  }
  return await db.select().from(branches).orderBy(asc(branches.nameAr));
}

export async function updateBranch(id: number, data: Partial<InsertBranch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(branches).set(data).where(eq(branches.id, id));
  return { success: true };
}

export async function deleteBranch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(branches).set({ isActive: false }).where(eq(branches.id, id));
  return { success: true };
}

// ============================================
// Station Management
// ============================================

export async function createStation(data: InsertStation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(stations).values(data);
  return result[0].insertId;
}

export async function getStations(businessId?: number, branchId?: number) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(stations.isActive, true)];
  if (businessId) conditions.push(eq(stations.businessId, businessId));
  if (branchId) conditions.push(eq(stations.branchId, branchId));

  return await db.select().from(stations).where(and(...conditions)).orderBy(asc(stations.nameAr));
}

export async function getStationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(stations).where(eq(stations.id, id)).limit(1);
  return result[0] || null;
}

export async function updateStation(id: number, data: Partial<InsertStation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(stations).set(data).where(eq(stations.id, id));
  return { success: true };
}

export async function deleteStation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(stations).set({ isActive: false }).where(eq(stations.id, id));
  return { success: true };
}

// ============================================
// Account Management (Chart of Accounts)
// ============================================

export async function createAccount(data: InsertAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(accounts).values(data);
  return result[0].insertId;
}

export async function getAccounts(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.isActive, true)))
    .orderBy(asc(accounts.code));
}

export async function getAccountById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return result[0] || null;
}

// ============================================
// Asset Management
// ============================================

export async function createAsset(data: InsertAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(assets).values(data);
  return result[0].insertId;
}

export async function getAssets(businessId: number, filters?: { stationId?: number; categoryId?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(assets.businessId, businessId)];
  if (filters?.stationId) conditions.push(eq(assets.stationId, filters.stationId));
  if (filters?.categoryId) conditions.push(eq(assets.categoryId, filters.categoryId));
  if (filters?.status) conditions.push(eq(assets.status, filters.status as any));

  return await db.select().from(assets).where(and(...conditions)).orderBy(desc(assets.createdAt));
}

export async function getAssetById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return result[0] || null;
}

// ============================================
// Work Order Management
// ============================================

export async function createWorkOrder(data: InsertWorkOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workOrders).values(data);
  return result[0].insertId;
}

export async function getWorkOrders(businessId: number, filters?: { status?: string; type?: string; stationId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(workOrders.businessId, businessId)];
  if (filters?.status) conditions.push(eq(workOrders.status, filters.status as any));
  if (filters?.type) conditions.push(eq(workOrders.type, filters.type as any));
  if (filters?.stationId) conditions.push(eq(workOrders.stationId, filters.stationId));

  return await db.select().from(workOrders).where(and(...conditions)).orderBy(desc(workOrders.createdAt));
}

export async function getWorkOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  return result[0] || null;
}

export async function updateWorkOrderStatus(id: number, status: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  
  if (status === 'approved') {
    updateData.approvedBy = userId;
    updateData.approvedAt = new Date();
  } else if (status === 'closed') {
    updateData.closedBy = userId;
    updateData.closedAt = new Date();
  }

  await db.update(workOrders).set(updateData).where(eq(workOrders.id, id));
}

// ============================================
// Customer Management
// ============================================

export async function createCustomer(data: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customers).values(data);
  return result[0].insertId;
}

export async function getCustomers(businessId: number, filters?: { status?: string; type?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(customers.businessId, businessId)];
  if (filters?.status) conditions.push(eq(customers.status, filters.status as any));
  if (filters?.type) conditions.push(eq(customers.type, filters.type as any));
  if (filters?.search) {
    conditions.push(
      or(
        like(customers.nameAr, `%${filters.search}%`),
        like(customers.accountNumber, `%${filters.search}%`),
        like(customers.phone, `%${filters.search}%`)
      )!
    );
  }

  return await db.select().from(customers).where(and(...conditions)).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0] || null;
}

// ============================================
// Invoice Management
// ============================================

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(invoices).values(data);
  return result[0].insertId;
}

export async function getInvoices(businessId: number, filters?: { status?: string; customerId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(invoices.businessId, businessId)];
  if (filters?.status) conditions.push(eq(invoices.status, filters.status as any));
  if (filters?.customerId) conditions.push(eq(invoices.customerId, filters.customerId));

  return await db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.invoiceDate));
}

// ============================================
// Equipment & SCADA
// ============================================

export async function createEquipment(data: InsertEquipment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(equipment).values(data);
  return result[0].insertId;
}

export async function getEquipment(businessId: number, stationId?: number) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(equipment.businessId, businessId)];
  if (stationId) conditions.push(eq(equipment.stationId, stationId));

  return await db.select().from(equipment).where(and(...conditions)).orderBy(asc(equipment.nameAr));
}

// ============================================
// Alerts
// ============================================

export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(alerts).values(data);
  return result[0].insertId;
}

export async function getActiveAlerts(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(alerts)
    .where(and(
      eq(alerts.businessId, businessId),
      eq(alerts.status, 'active')
    ))
    .orderBy(desc(alerts.triggeredAt));
}

export async function acknowledgeAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(alerts).set({
    status: 'acknowledged',
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
  }).where(eq(alerts.id, id));
}

// ============================================
// Projects
// ============================================

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(data);
  return result[0].insertId;
}

export async function getProjects(businessId: number, filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(projects.businessId, businessId)];
  if (filters?.status) conditions.push(eq(projects.status, filters.status as any));

  return await db.select().from(projects).where(and(...conditions)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0] || null;
}

// ============================================
// Dashboard Statistics
// ============================================

export async function getDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return null;

  const [
    totalAssets,
    activeWorkOrders,
    totalCustomers,
    activeAlerts,
    onlineEquipment,
    totalEquipment,
  ] = await Promise.all([
    db.select({ count: count() }).from(assets).where(eq(assets.businessId, businessId)),
    db.select({ count: count() }).from(workOrders).where(and(
      eq(workOrders.businessId, businessId),
      or(
        eq(workOrders.status, 'pending'),
        eq(workOrders.status, 'in_progress'),
        eq(workOrders.status, 'assigned')
      )
    )),
    db.select({ count: count() }).from(customers).where(and(
      eq(customers.businessId, businessId),
      eq(customers.isActive, true)
    )),
    db.select({ count: count() }).from(alerts).where(and(
      eq(alerts.businessId, businessId),
      eq(alerts.status, 'active')
    )),
    db.select({ count: count() }).from(equipment).where(and(
      eq(equipment.businessId, businessId),
      eq(equipment.status, 'online')
    )),
    db.select({ count: count() }).from(equipment).where(eq(equipment.businessId, businessId)),
  ]);

  return {
    totalAssets: totalAssets[0]?.count || 0,
    activeWorkOrders: activeWorkOrders[0]?.count || 0,
    totalCustomers: totalCustomers[0]?.count || 0,
    activeAlerts: activeAlerts[0]?.count || 0,
    onlineEquipment: onlineEquipment[0]?.count || 0,
    totalEquipment: totalEquipment[0]?.count || 0,
  };
}

// ============================================
// Audit Log
// ============================================

export async function createAuditLog(data: {
  businessId?: number;
  userId?: number;
  action: string;
  module: string;
  entityType?: string;
  entityId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLogs).values({
    ...data,
    oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
    newValues: data.newValues ? JSON.stringify(data.newValues) : null,
  });
}

// ============================================
// Sequence Generator
// ============================================

export async function getNextSequence(businessId: number, code: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const seq = await db.select().from(sequences)
    .where(and(eq(sequences.businessId, businessId), eq(sequences.code, code)))
    .limit(1);

  if (seq.length === 0) {
    // Create new sequence
    await db.insert(sequences).values({
      businessId,
      code,
      currentValue: 1,
    });
    return `${code}-000001`;
  }

  const current = seq[0];
  const nextValue = (current.currentValue || 0) + 1;
  
  await db.update(sequences)
    .set({ currentValue: nextValue })
    .where(eq(sequences.id, current.id));

  const prefix = current.prefix || code;
  const suffix = current.suffix || '';
  const digits = current.minDigits || 6;
  const paddedValue = String(nextValue).padStart(digits, '0');

  return `${prefix}-${paddedValue}${suffix}`;
}

// ============================================
// Inventory Management
// ============================================

export async function createItem(data: InsertItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(items).values(data);
  return result[0].insertId;
}

export async function getItems(businessId: number, filters?: { categoryId?: number; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(items.businessId, businessId), eq(items.isActive, true)];
  if (filters?.categoryId) conditions.push(eq(items.categoryId, filters.categoryId));
  if (filters?.search) {
    conditions.push(
      or(
        like(items.nameAr, `%${filters.search}%`),
        like(items.code, `%${filters.search}%`)
      )!
    );
  }

  return await db.select().from(items).where(and(...conditions)).orderBy(asc(items.nameAr));
}

// ============================================
// Supplier Management
// ============================================

export async function createSupplier(data: InsertSupplier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(suppliers).values(data);
  return result[0].insertId;
}

export async function getSuppliers(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(suppliers)
    .where(and(eq(suppliers.businessId, businessId), eq(suppliers.isActive, true)))
    .orderBy(asc(suppliers.nameAr));
}


// ============================================
// Developer System - Integrations
// ============================================

export async function createIntegration(data: InsertIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(integrations).values(data);
  return result[0].insertId;
}

export async function getIntegrations(businessId: number, filters?: { type?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(integrations.businessId, businessId)];
  if (filters?.type) conditions.push(eq(integrations.integrationType, filters.type as any));
  if (filters?.isActive !== undefined) conditions.push(eq(integrations.isActive, filters.isActive));

  return await db.select().from(integrations).where(and(...conditions)).orderBy(desc(integrations.createdAt));
}

export async function getIntegrationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(integrations).where(eq(integrations.id, id)).limit(1);
  return result[0] || null;
}

export async function updateIntegration(id: number, data: Partial<InsertIntegration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(integrations).set(data).where(eq(integrations.id, id));
}

export async function deleteIntegration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(integrations).where(eq(integrations.id, id));
}

// Integration Configs
export async function getIntegrationConfigs(integrationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(integrationConfigs)
    .where(eq(integrationConfigs.integrationId, integrationId))
    .orderBy(asc(integrationConfigs.configKey));
}

export async function setIntegrationConfig(integrationId: number, key: string, value: string, options?: { isEncrypted?: boolean; valueType?: 'string' | 'number' | 'boolean' | 'json' }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(integrationConfigs)
    .where(and(eq(integrationConfigs.integrationId, integrationId), eq(integrationConfigs.configKey, key)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(integrationConfigs)
      .set({ 
        configValue: value, 
        isEncrypted: options?.isEncrypted,
        valueType: options?.valueType,
      })
      .where(eq(integrationConfigs.id, existing[0].id));
  } else {
    await db.insert(integrationConfigs).values({
      integrationId,
      configKey: key,
      configValue: value,
      isEncrypted: options?.isEncrypted || false,
      valueType: options?.valueType || 'string',
    });
  }
}

// Integration Logs
export async function createIntegrationLog(data: InsertIntegrationLog) {
  const db = await getDb();
  if (!db) return;

  await db.insert(integrationLogs).values(data);
}

export async function getIntegrationLogs(integrationId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(integrationLogs)
    .where(eq(integrationLogs.integrationId, integrationId))
    .orderBy(desc(integrationLogs.createdAt))
    .limit(limit);
}

// ============================================
// Developer System - Events
// ============================================

export async function createSystemEvent(data: InsertSystemEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(systemEvents).values(data);
  return result[0].insertId;
}

export async function getSystemEvents(businessId: number, filters?: { eventType?: string; status?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(systemEvents.businessId, businessId)];
  if (filters?.eventType) conditions.push(eq(systemEvents.eventType, filters.eventType));
  if (filters?.status) conditions.push(eq(systemEvents.status, filters.status as any));

  return await db.select().from(systemEvents)
    .where(and(...conditions))
    .orderBy(desc(systemEvents.createdAt))
    .limit(filters?.limit || 100);
}

export async function updateEventStatus(id: number, status: string, errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(systemEvents).set({
    status: status as any,
    processedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
    errorMessage,
  }).where(eq(systemEvents.id, id));
}

// Event Subscriptions
export async function createEventSubscription(data: InsertEventSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(eventSubscriptions).values(data);
  return result[0].insertId;
}

export async function getEventSubscriptions(businessId: number, eventType?: string) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(eventSubscriptions.businessId, businessId), eq(eventSubscriptions.isActive, true)];
  if (eventType) conditions.push(eq(eventSubscriptions.eventType, eventType));

  return await db.select().from(eventSubscriptions)
    .where(and(...conditions))
    .orderBy(asc(eventSubscriptions.priority));
}

export async function updateEventSubscription(id: number, data: Partial<InsertEventSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(eventSubscriptions).set(data).where(eq(eventSubscriptions.id, id));
}

export async function deleteEventSubscription(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(eventSubscriptions).where(eq(eventSubscriptions.id, id));
}

// ============================================
// Developer System - API Keys
// ============================================

export async function createApiKey(data: InsertApiKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(apiKeys).values(data);
  return result[0].insertId;
}

export async function getApiKeys(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: apiKeys.id,
    name: apiKeys.name,
    description: apiKeys.description,
    keyPrefix: apiKeys.keyPrefix,
    permissions: apiKeys.permissions,
    rateLimitPerMinute: apiKeys.rateLimitPerMinute,
    rateLimitPerDay: apiKeys.rateLimitPerDay,
    expiresAt: apiKeys.expiresAt,
    lastUsedAt: apiKeys.lastUsedAt,
    usageCount: apiKeys.usageCount,
    isActive: apiKeys.isActive,
    createdAt: apiKeys.createdAt,
  }).from(apiKeys)
    .where(eq(apiKeys.businessId, businessId))
    .orderBy(desc(apiKeys.createdAt));
}

export async function getApiKeyByHash(keyHash: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)))
    .limit(1);
  return result[0] || null;
}

export async function updateApiKeyUsage(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(apiKeys).set({
    lastUsedAt: new Date(),
    usageCount: sql`${apiKeys.usageCount} + 1`,
  }).where(eq(apiKeys.id, id));
}

export async function revokeApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(apiKeys).set({ isActive: false }).where(eq(apiKeys.id, id));
}

// API Logs
export async function createApiLog(data: InsertApiLog) {
  const db = await getDb();
  if (!db) return;

  await db.insert(apiLogs).values(data);
}

export async function getApiLogs(businessId: number, filters?: { apiKeyId?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(apiLogs.businessId, businessId)];
  if (filters?.apiKeyId) conditions.push(eq(apiLogs.apiKeyId, filters.apiKeyId));

  return await db.select().from(apiLogs)
    .where(and(...conditions))
    .orderBy(desc(apiLogs.createdAt))
    .limit(filters?.limit || 100);
}

// ============================================
// Developer System - AI Models
// ============================================

export async function createAiModel(data: InsertAiModel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aiModels).values(data);
  return result[0].insertId;
}

export async function getAiModels(businessId: number, modelType?: string) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(aiModels.businessId, businessId)];
  if (modelType) conditions.push(eq(aiModels.modelType, modelType as any));

  return await db.select().from(aiModels)
    .where(and(...conditions))
    .orderBy(asc(aiModels.nameAr));
}

export async function getAiModelById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(aiModels).where(eq(aiModels.id, id)).limit(1);
  return result[0] || null;
}

export async function updateAiModel(id: number, data: Partial<InsertAiModel>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aiModels).set(data).where(eq(aiModels.id, id));
}

// AI Predictions
export async function createAiPrediction(data: InsertAiPrediction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aiPredictions).values(data);
  return result[0].insertId;
}

export async function getAiPredictions(businessId: number, filters?: { modelId?: number; predictionType?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(aiPredictions.businessId, businessId)];
  if (filters?.modelId) conditions.push(eq(aiPredictions.modelId, filters.modelId));
  if (filters?.predictionType) conditions.push(eq(aiPredictions.predictionType, filters.predictionType));

  return await db.select().from(aiPredictions)
    .where(and(...conditions))
    .orderBy(desc(aiPredictions.createdAt))
    .limit(filters?.limit || 100);
}

export async function verifyPrediction(id: number, actualValue: any, verifiedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const prediction = await db.select().from(aiPredictions).where(eq(aiPredictions.id, id)).limit(1);
  if (!prediction[0]) throw new Error("Prediction not found");

  // Calculate accuracy based on prediction type
  let accuracy: number | undefined;
  // This would need custom logic based on prediction type

  await db.update(aiPredictions).set({
    actualValue: JSON.stringify(actualValue),
    isVerified: true,
    verifiedAt: new Date(),
    verifiedBy,
    accuracy: accuracy?.toString(),
  }).where(eq(aiPredictions.id, id));
}

// ============================================
// Developer System - Technical Alerts
// ============================================

export async function createTechnicalAlertRule(data: InsertTechnicalAlertRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(technicalAlertRules).values(data);
  return result[0].insertId;
}

export async function getTechnicalAlertRules(businessId: number, category?: string) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(technicalAlertRules.businessId, businessId)];
  if (category) conditions.push(eq(technicalAlertRules.category, category as any));

  return await db.select().from(technicalAlertRules)
    .where(and(...conditions))
    .orderBy(asc(technicalAlertRules.nameAr));
}

export async function updateTechnicalAlertRule(id: number, data: Partial<InsertTechnicalAlertRule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(technicalAlertRules).set(data).where(eq(technicalAlertRules.id, id));
}

export async function createTechnicalAlert(data: InsertTechnicalAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(technicalAlerts).values(data);
  return result[0].insertId;
}

export async function getTechnicalAlerts(businessId: number, filters?: { status?: string; severity?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(technicalAlerts.businessId, businessId)];
  if (filters?.status) conditions.push(eq(technicalAlerts.status, filters.status as any));
  if (filters?.severity) conditions.push(eq(technicalAlerts.severity, filters.severity as any));

  return await db.select().from(technicalAlerts)
    .where(and(...conditions))
    .orderBy(desc(technicalAlerts.createdAt))
    .limit(filters?.limit || 100);
}

export async function acknowledgeTechnicalAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(technicalAlerts).set({
    status: 'acknowledged',
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
  }).where(eq(technicalAlerts.id, id));
}

export async function resolveTechnicalAlert(id: number, userId: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(technicalAlerts).set({
    status: 'resolved',
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolutionNotes: notes,
  }).where(eq(technicalAlerts.id, id));
}

// ============================================
// Developer System - Performance Metrics
// ============================================

export async function recordPerformanceMetric(data: InsertPerformanceMetric) {
  const db = await getDb();
  if (!db) return;

  await db.insert(performanceMetrics).values(data);
}

export async function getPerformanceMetrics(businessId: number, metricType: string, hours: number = 24) {
  const db = await getDb();
  if (!db) return [];

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await db.select().from(performanceMetrics)
    .where(and(
      eq(performanceMetrics.businessId, businessId),
      eq(performanceMetrics.metricType, metricType as any),
      sql`${performanceMetrics.recordedAt} >= ${since}`
    ))
    .orderBy(asc(performanceMetrics.recordedAt));
}

// ============================================
// Developer System - Webhooks
// ============================================

export async function createIncomingWebhook(data: InsertIncomingWebhook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(incomingWebhooks).values(data);
  return result[0].insertId;
}

export async function getIncomingWebhooks(integrationId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(incomingWebhooks)
    .where(eq(incomingWebhooks.integrationId, integrationId))
    .orderBy(desc(incomingWebhooks.createdAt))
    .limit(limit);
}

export async function updateWebhookStatus(id: number, status: string, errorMessage?: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(incomingWebhooks).set({
    status: status as any,
    processedAt: status === 'processed' || status === 'failed' ? new Date() : undefined,
    errorMessage,
  }).where(eq(incomingWebhooks.id, id));
}

// ============================================
// Developer System - Dashboard Stats
// ============================================

export async function getDeveloperDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return {
    totalIntegrations: 0,
    activeIntegrations: 0,
    totalApiKeys: 0,
    activeApiKeys: 0,
    totalEvents: 0,
    pendingEvents: 0,
    totalAlerts: 0,
    activeAlerts: 0,
    totalPredictions: 0,
    aiModels: 0,
  };

  const [
    totalIntegrations,
    activeIntegrations,
    totalApiKeys,
    activeApiKeys,
    totalEvents,
    pendingEvents,
    totalAlerts,
    activeAlerts,
    totalPredictions,
    aiModelsCount,
  ] = await Promise.all([
    db.select({ count: count() }).from(integrations).where(eq(integrations.businessId, businessId)),
    db.select({ count: count() }).from(integrations).where(and(eq(integrations.businessId, businessId), eq(integrations.isActive, true))),
    db.select({ count: count() }).from(apiKeys).where(eq(apiKeys.businessId, businessId)),
    db.select({ count: count() }).from(apiKeys).where(and(eq(apiKeys.businessId, businessId), eq(apiKeys.isActive, true))),
    db.select({ count: count() }).from(systemEvents).where(eq(systemEvents.businessId, businessId)),
    db.select({ count: count() }).from(systemEvents).where(and(eq(systemEvents.businessId, businessId), eq(systemEvents.status, 'pending'))),
    db.select({ count: count() }).from(technicalAlerts).where(eq(technicalAlerts.businessId, businessId)),
    db.select({ count: count() }).from(technicalAlerts).where(and(eq(technicalAlerts.businessId, businessId), eq(technicalAlerts.status, 'active'))),
    db.select({ count: count() }).from(aiPredictions).where(eq(aiPredictions.businessId, businessId)),
    db.select({ count: count() }).from(aiModels).where(eq(aiModels.businessId, businessId)),
  ]);

  return {
    totalIntegrations: totalIntegrations[0]?.count || 0,
    activeIntegrations: activeIntegrations[0]?.count || 0,
    totalApiKeys: totalApiKeys[0]?.count || 0,
    activeApiKeys: activeApiKeys[0]?.count || 0,
    totalEvents: totalEvents[0]?.count || 0,
    pendingEvents: pendingEvents[0]?.count || 0,
    totalAlerts: totalAlerts[0]?.count || 0,
    activeAlerts: activeAlerts[0]?.count || 0,
    totalPredictions: totalPredictions[0]?.count || 0,
    aiModels: aiModelsCount[0]?.count || 0,
  };
}


// ============================================
// Field Operations System - العمليات الميدانية
// ============================================

// Field Operations - العمليات الميدانية
export async function createFieldOperation(data: InsertFieldOperation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fieldOperations).values(data);
  return result[0].insertId;
}

export async function getFieldOperations(businessId: number, filters?: {
  status?: string;
  operationType?: string;
  teamId?: number;
  workerId?: number;
  customerId?: number;
  fromDate?: string;
  toDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(fieldOperations.businessId, businessId)];
  
  if (filters?.status) conditions.push(eq(fieldOperations.status, filters.status as any));
  if (filters?.operationType) conditions.push(eq(fieldOperations.operationType, filters.operationType as any));
  if (filters?.teamId) conditions.push(eq(fieldOperations.assignedTeamId, filters.teamId));
  if (filters?.workerId) conditions.push(eq(fieldOperations.assignedWorkerId, filters.workerId));
  if (filters?.customerId) conditions.push(eq(fieldOperations.customerId, filters.customerId));
  if (filters?.fromDate) conditions.push(sql`${fieldOperations.scheduledDate} >= ${filters.fromDate}`);
  if (filters?.toDate) conditions.push(sql`${fieldOperations.scheduledDate} <= ${filters.toDate}`);

  return await db.select().from(fieldOperations)
    .where(and(...conditions))
    .orderBy(desc(fieldOperations.createdAt));
}

export async function getFieldOperationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(fieldOperations).where(eq(fieldOperations.id, id));
  return result[0] || null;
}

export async function updateFieldOperation(id: number, data: Partial<InsertFieldOperation>) {
  const db = await getDb();
  if (!db) return;

  await db.update(fieldOperations).set(data).where(eq(fieldOperations.id, id));
}

export async function updateOperationStatus(id: number, status: string, userId?: number, reason?: string) {
  const db = await getDb();
  if (!db) return;

  const operation = await getFieldOperationById(id);
  if (!operation) return;

  // Log status change
  await db.insert(operationStatusLog).values({
    operationId: id,
    fromStatus: operation.status,
    toStatus: status,
    changedBy: userId,
    reason,
  });

  // Update operation status
  const updateData: any = { status: status as any };
  if (status === 'in_progress' && !operation.startedAt) {
    updateData.startedAt = new Date();
  }
  if (status === 'completed') {
    updateData.completedAt = new Date();
    if (operation.startedAt) {
      updateData.actualDuration = Math.round((Date.now() - new Date(operation.startedAt).getTime()) / 60000);
    }
  }

  await db.update(fieldOperations).set(updateData).where(eq(fieldOperations.id, id));
}

// Field Teams - الفرق الميدانية
export async function createFieldTeam(data: InsertFieldTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fieldTeams).values(data);
  return result[0].insertId;
}

export async function getFieldTeams(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(fieldTeams)
    .where(eq(fieldTeams.businessId, businessId))
    .orderBy(asc(fieldTeams.nameAr));
}

export async function getFieldTeamById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(fieldTeams).where(eq(fieldTeams.id, id));
  return result[0] || null;
}

export async function updateFieldTeam(id: number, data: Partial<InsertFieldTeam>) {
  const db = await getDb();
  if (!db) return;

  await db.update(fieldTeams).set(data).where(eq(fieldTeams.id, id));
}

// Field Workers - العاملين الميدانيين
export async function createFieldWorker(data: InsertFieldWorker) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fieldWorkers).values(data);
  return result[0].insertId;
}

export async function getFieldWorkers(businessId: number, filters?: {
  teamId?: number;
  status?: string;
  workerType?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(fieldWorkers.businessId, businessId)];
  
  if (filters?.teamId) conditions.push(eq(fieldWorkers.teamId, filters.teamId));
  if (filters?.status) conditions.push(eq(fieldWorkers.status, filters.status as any));
  if (filters?.workerType) conditions.push(eq(fieldWorkers.workerType, filters.workerType as any));

  return await db.select().from(fieldWorkers)
    .where(and(...conditions))
    .orderBy(asc(fieldWorkers.nameAr));
}

export async function getFieldWorkerById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(fieldWorkers).where(eq(fieldWorkers.id, id));
  return result[0] || null;
}

export async function updateFieldWorker(id: number, data: Partial<InsertFieldWorker>) {
  const db = await getDb();
  if (!db) return;

  await db.update(fieldWorkers).set(data).where(eq(fieldWorkers.id, id));
}

export async function updateWorkerLocation(workerId: number, lat: number, lng: number, operationId?: number) {
  const db = await getDb();
  if (!db) return;

  // Insert location history
  await db.insert(workerLocations).values({
    workerId,
    latitude: lat.toString(),
    longitude: lng.toString(),
    operationId,
  });

  // Update current location
  await db.update(fieldWorkers).set({
    currentLocationLat: lat.toString(),
    currentLocationLng: lng.toString(),
    lastLocationUpdate: new Date(),
  }).where(eq(fieldWorkers.id, workerId));
}

// Field Equipment - المعدات الميدانية
export async function createFieldEquipmentItem(data: InsertFieldEquipment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fieldEquipment).values(data);
  return result[0].insertId;
}

export async function getFieldEquipmentList(businessId: number, filters?: {
  status?: string;
  equipmentType?: string;
  teamId?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(fieldEquipment.businessId, businessId)];
  
  if (filters?.status) conditions.push(eq(fieldEquipment.status, filters.status as any));
  if (filters?.equipmentType) conditions.push(eq(fieldEquipment.equipmentType, filters.equipmentType as any));
  if (filters?.teamId) conditions.push(eq(fieldEquipment.assignedTeamId, filters.teamId));

  return await db.select().from(fieldEquipment)
    .where(and(...conditions))
    .orderBy(asc(fieldEquipment.nameAr));
}

export async function updateFieldEquipmentItem(id: number, data: Partial<InsertFieldEquipment>) {
  const db = await getDb();
  if (!db) return;

  await db.update(fieldEquipment).set(data).where(eq(fieldEquipment.id, id));
}

export async function recordEquipmentMovement(data: InsertEquipmentMovement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(equipmentMovements).values(data);
  
  // Update equipment status and holder
  const updateData: any = {};
  if (data.movementType === 'checkout') {
    updateData.status = 'in_use';
    updateData.currentHolderId = data.toHolderId;
  } else if (data.movementType === 'return') {
    updateData.status = 'available';
    updateData.currentHolderId = null;
  } else if (data.movementType === 'maintenance') {
    updateData.status = 'maintenance';
  }
  if (data.conditionAfter) {
    updateData.condition = data.conditionAfter;
  }

  await db.update(fieldEquipment).set(updateData).where(eq(fieldEquipment.id, data.equipmentId));
  
  return result[0].insertId;
}

// Inspections - الفحوصات
export async function createInspection(data: InsertInspection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(inspections).values(data);
  return result[0].insertId;
}

export async function getInspections(businessId: number, filters?: {
  operationId?: number;
  status?: string;
  inspectorId?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(inspections.businessId, businessId)];
  
  if (filters?.operationId) conditions.push(eq(inspections.operationId, filters.operationId));
  if (filters?.status) conditions.push(eq(inspections.status, filters.status as any));
  if (filters?.inspectorId) conditions.push(eq(inspections.inspectorId, filters.inspectorId));

  return await db.select().from(inspections)
    .where(and(...conditions))
    .orderBy(desc(inspections.inspectionDate));
}

export async function updateInspection(id: number, data: Partial<InsertInspection>) {
  const db = await getDb();
  if (!db) return;

  await db.update(inspections).set(data).where(eq(inspections.id, id));
}

export async function addInspectionItems(inspectionId: number, items: InsertInspectionItem[]) {
  const db = await getDb();
  if (!db) return;

  await db.insert(inspectionItems).values(items.map(item => ({ ...item, inspectionId })));
}

// Material Requests - طلبات المواد
export async function createMaterialRequest(data: InsertMaterialRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(materialRequests).values(data);
  return result[0].insertId;
}

export async function getMaterialRequests(businessId: number, filters?: {
  status?: string;
  workerId?: number;
  teamId?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(materialRequests.businessId, businessId)];
  
  if (filters?.status) conditions.push(eq(materialRequests.status, filters.status as any));
  if (filters?.workerId) conditions.push(eq(materialRequests.workerId, filters.workerId));
  if (filters?.teamId) conditions.push(eq(materialRequests.teamId, filters.teamId));

  return await db.select().from(materialRequests)
    .where(and(...conditions))
    .orderBy(desc(materialRequests.createdAt));
}

export async function updateMaterialRequest(id: number, data: Partial<InsertMaterialRequest>) {
  const db = await getDb();
  if (!db) return;

  await db.update(materialRequests).set(data).where(eq(materialRequests.id, id));
}

export async function addMaterialRequestItems(requestId: number, items: InsertMaterialRequestItem[]) {
  const db = await getDb();
  if (!db) return;

  await db.insert(materialRequestItems).values(items.map(item => ({ ...item, requestId })));
}

// Operation Payments - مستحقات العمليات
export async function createOperationPayment(data: InsertOperationPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(operationPayments).values(data);
  return result[0].insertId;
}

export async function getOperationPayments(businessId: number, filters?: {
  workerId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(operationPayments.businessId, businessId)];
  
  if (filters?.workerId) conditions.push(eq(operationPayments.workerId, filters.workerId));
  if (filters?.status) conditions.push(eq(operationPayments.status, filters.status as any));

  return await db.select().from(operationPayments)
    .where(and(...conditions))
    .orderBy(desc(operationPayments.calculatedAt));
}

// Period Settlements - تسويات الفترة
export async function createPeriodSettlement(data: InsertPeriodSettlement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(periodSettlements).values(data);
  return result[0].insertId;
}

export async function getPeriodSettlements(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(periodSettlements)
    .where(eq(periodSettlements.businessId, businessId))
    .orderBy(desc(periodSettlements.createdAt));
}

export async function updatePeriodSettlement(id: number, data: Partial<InsertPeriodSettlement>) {
  const db = await getDb();
  if (!db) return;

  await db.update(periodSettlements).set(data).where(eq(periodSettlements.id, id));
}

export async function addSettlementItems(settlementId: number, items: InsertSettlementItem[]) {
  const db = await getDb();
  if (!db) return;

  await db.insert(settlementItems).values(items.map(item => ({ ...item, settlementId })));
}

// Installation Details - بيانات التركيب
export async function createInstallationDetails(data: InsertInstallationDetail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(installationDetails).values(data);
  return result[0].insertId;
}

export async function getInstallationDetailsByOperation(operationId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(installationDetails).where(eq(installationDetails.operationId, operationId));
  return result[0] || null;
}

export async function addInstallationPhoto(data: InsertInstallationPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(installationPhotos).values(data);
  return result[0].insertId;
}

export async function getInstallationPhotos(operationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(installationPhotos)
    .where(eq(installationPhotos.operationId, operationId))
    .orderBy(asc(installationPhotos.createdAt));
}

// Worker Performance - أداء العاملين
export async function createWorkerPerformance(data: InsertWorkerPerformance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workerPerformance).values(data);
  return result[0].insertId;
}

export async function getWorkerPerformanceHistory(workerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(workerPerformance)
    .where(eq(workerPerformance.workerId, workerId))
    .orderBy(desc(workerPerformance.periodEnd));
}

// Worker Incentives - حوافز العاملين
export async function createWorkerIncentive(data: InsertWorkerIncentive) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workerIncentives).values(data);
  return result[0].insertId;
}

export async function getWorkerIncentives(businessId: number, filters?: {
  workerId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(workerIncentives.businessId, businessId)];
  
  if (filters?.workerId) conditions.push(eq(workerIncentives.workerId, filters.workerId));
  if (filters?.status) conditions.push(eq(workerIncentives.status, filters.status as any));

  return await db.select().from(workerIncentives)
    .where(and(...conditions))
    .orderBy(desc(workerIncentives.createdAt));
}

export async function updateWorkerIncentive(id: number, data: Partial<InsertWorkerIncentive>) {
  const db = await getDb();
  if (!db) return;

  await db.update(workerIncentives).set(data).where(eq(workerIncentives.id, id));
}

// Inspection Checklists - قوائم الفحص
export async function createInspectionChecklist(data: InsertInspectionChecklist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(inspectionChecklists).values(data);
  return result[0].insertId;
}

export async function getInspectionChecklists(businessId: number, operationType?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(inspectionChecklists.businessId, businessId)];
  if (operationType) conditions.push(eq(inspectionChecklists.operationType, operationType));

  return await db.select().from(inspectionChecklists)
    .where(and(...conditions))
    .orderBy(asc(inspectionChecklists.nameAr));
}

// Field Operations Dashboard Stats
export async function getFieldOperationsDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return {
    totalOperations: 0,
    scheduledOperations: 0,
    inProgressOperations: 0,
    completedOperations: 0,
    totalTeams: 0,
    activeTeams: 0,
    totalWorkers: 0,
    availableWorkers: 0,
    totalEquipment: 0,
    availableEquipment: 0,
  };

  const [
    totalOps,
    scheduledOps,
    inProgressOps,
    completedOps,
    totalTeams,
    activeTeams,
    totalWorkers,
    availableWorkers,
    totalEquip,
    availableEquip,
  ] = await Promise.all([
    db.select({ count: count() }).from(fieldOperations).where(eq(fieldOperations.businessId, businessId)),
    db.select({ count: count() }).from(fieldOperations).where(and(eq(fieldOperations.businessId, businessId), eq(fieldOperations.status, 'scheduled'))),
    db.select({ count: count() }).from(fieldOperations).where(and(eq(fieldOperations.businessId, businessId), eq(fieldOperations.status, 'in_progress'))),
    db.select({ count: count() }).from(fieldOperations).where(and(eq(fieldOperations.businessId, businessId), eq(fieldOperations.status, 'completed'))),
    db.select({ count: count() }).from(fieldTeams).where(eq(fieldTeams.businessId, businessId)),
    db.select({ count: count() }).from(fieldTeams).where(and(eq(fieldTeams.businessId, businessId), eq(fieldTeams.status, 'active'))),
    db.select({ count: count() }).from(fieldWorkers).where(eq(fieldWorkers.businessId, businessId)),
    db.select({ count: count() }).from(fieldWorkers).where(and(eq(fieldWorkers.businessId, businessId), eq(fieldWorkers.status, 'available'))),
    db.select({ count: count() }).from(fieldEquipment).where(eq(fieldEquipment.businessId, businessId)),
    db.select({ count: count() }).from(fieldEquipment).where(and(eq(fieldEquipment.businessId, businessId), eq(fieldEquipment.status, 'available'))),
  ]);

  return {
    totalOperations: totalOps[0]?.count || 0,
    scheduledOperations: scheduledOps[0]?.count || 0,
    inProgressOperations: inProgressOps[0]?.count || 0,
    completedOperations: completedOps[0]?.count || 0,
    totalTeams: totalTeams[0]?.count || 0,
    activeTeams: activeTeams[0]?.count || 0,
    totalWorkers: totalWorkers[0]?.count || 0,
    availableWorkers: availableWorkers[0]?.count || 0,
    totalEquipment: totalEquip[0]?.count || 0,
    availableEquipment: availableEquip[0]?.count || 0,
  };
}

// Seed Demo Data - بيانات تجريبية للمستأجرين
export async function seedDemoTenants() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if demo data already exists
  const existingBusinesses = await db.select().from(businesses).limit(1);
  if (existingBusinesses.length > 0) {
    return { message: "Demo data already exists" };
  }

  // Create two tenant businesses
  const [business1Result] = await db.insert(businesses).values({
    code: "ELEC-001",
    nameAr: "شركة الكهرباء الوطنية",
    nameEn: "National Electricity Company",
    type: "holding",
    currency: "SAR",
    isActive: true,
  });
  const business1Id = business1Result.insertId;

  const [business2Result] = await db.insert(businesses).values({
    code: "SOLAR-001",
    nameAr: "شركة الطاقة الشمسية",
    nameEn: "Solar Energy Company",
    type: "subsidiary",
    currency: "SAR",
    isActive: true,
  });
  const business2Id = business2Result.insertId;

  // Create branches for each business
  await db.insert(branches).values([
    { businessId: business1Id, code: "BR-RYD", nameAr: "فرع الرياض", nameEn: "Riyadh Branch", type: "main", city: "الرياض" },
    { businessId: business1Id, code: "BR-JED", nameAr: "فرع جدة", nameEn: "Jeddah Branch", type: "regional", city: "جدة" },
    { businessId: business2Id, code: "BR-DMM", nameAr: "فرع الدمام", nameEn: "Dammam Branch", type: "main", city: "الدمام" },
  ]);

  // Create field teams
  await db.insert(fieldTeams).values([
    { businessId: business1Id, code: "TEAM-001", nameAr: "فريق التركيبات", nameEn: "Installation Team", teamType: "installation", status: "active" },
    { businessId: business1Id, code: "TEAM-002", nameAr: "فريق الصيانة", nameEn: "Maintenance Team", teamType: "maintenance", status: "active" },
    { businessId: business2Id, code: "TEAM-003", nameAr: "فريق الفحص", nameEn: "Inspection Team", teamType: "inspection", status: "active" },
  ]);

  // Create field workers
  await db.insert(fieldWorkers).values([
    { businessId: business1Id, employeeNumber: "EMP-001", nameAr: "أحمد محمد", nameEn: "Ahmed Mohammed", phone: "0501234567", workerType: "technician", status: "available", teamId: 1 },
    { businessId: business1Id, employeeNumber: "EMP-002", nameAr: "خالد علي", nameEn: "Khaled Ali", phone: "0507654321", workerType: "engineer", status: "available", teamId: 1 },
    { businessId: business1Id, employeeNumber: "EMP-003", nameAr: "محمد سعيد", nameEn: "Mohammed Saeed", phone: "0509876543", workerType: "technician", status: "busy", teamId: 2 },
    { businessId: business2Id, employeeNumber: "EMP-004", nameAr: "عبدالله فهد", nameEn: "Abdullah Fahd", phone: "0502345678", workerType: "supervisor", status: "available", teamId: 3 },
  ]);

  // Create field equipment
  await db.insert(fieldEquipment).values([
    { businessId: business1Id, equipmentCode: "EQ-001", nameAr: "جهاز قياس الجهد", nameEn: "Voltage Meter", equipmentType: "measuring", status: "available" },
    { businessId: business1Id, equipmentCode: "EQ-002", nameAr: "سيارة خدمة", nameEn: "Service Vehicle", equipmentType: "vehicle", status: "in_use" },
    { businessId: business2Id, equipmentCode: "EQ-003", nameAr: "معدات السلامة", nameEn: "Safety Equipment", equipmentType: "safety", status: "available" },
  ]);

  // Create sample field operations
  await db.insert(fieldOperations).values([
    { 
      businessId: business1Id, 
      operationNumber: "OP-2024-001", 
      operationType: "installation", 
      status: "scheduled",
      priority: "high",
      title: "تركيب عداد ذكي - حي النخيل",
      description: "تركيب عداد ذكي جديد للعميل رقم 1234",
      address: "حي النخيل، شارع الملك فهد",
      scheduledDate: new Date(),
      assignedTeamId: 1,
      assignedWorkerId: 1,
      estimatedDuration: 60,
    },
    { 
      businessId: business1Id, 
      operationNumber: "OP-2024-002", 
      operationType: "maintenance", 
      status: "in_progress",
      priority: "urgent",
      title: "صيانة طارئة - محطة التحويل",
      description: "إصلاح عطل في محطة التحويل الرئيسية",
      address: "محطة التحويل الرئيسية",
      scheduledDate: new Date(),
      assignedTeamId: 2,
      assignedWorkerId: 3,
      estimatedDuration: 120,
      startedAt: new Date(),
    },
    { 
      businessId: business2Id, 
      operationNumber: "OP-2024-003", 
      operationType: "inspection", 
      status: "scheduled",
      priority: "medium",
      title: "فحص دوري - الألواح الشمسية",
      description: "فحص دوري للألواح الشمسية في المشروع رقم 5",
      address: "مشروع الطاقة الشمسية - الدمام",
      scheduledDate: new Date(),
      assignedTeamId: 3,
      assignedWorkerId: 4,
      estimatedDuration: 180,
    },
  ]);

  return { 
    message: "Demo data created successfully",
    businesses: [
      { id: business1Id, name: "شركة الكهرباء الوطنية" },
      { id: business2Id, name: "شركة الطاقة الشمسية" },
    ]
  };
}


// ============================================
// نظام الموارد البشرية - HR System
// ============================================

// الأقسام - Departments
export async function getDepartments(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(departments).where(eq(departments.businessId, businessId)).orderBy(asc(departments.nameAr));
}

export async function createDepartment(data: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(departments).values(data);
  const [created] = await db.select().from(departments).where(eq(departments.code, data.code)).limit(1);
  return created;
}

export async function updateDepartment(id: number, data: Partial<InsertDepartment>) {
  const db = await getDb();
  if (!db) return;
  await db.update(departments).set(data).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(departments).where(eq(departments.id, id));
}

// المسميات الوظيفية - Job Titles
export async function getJobTitles(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobTitles).where(eq(jobTitles.businessId, businessId)).orderBy(asc(jobTitles.titleAr));
}

export async function createJobTitle(data: InsertJobTitle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobTitles).values(data);
  const [created] = await db.select().from(jobTitles).where(eq(jobTitles.code, data.code)).limit(1);
  return created;
}

export async function updateJobTitle(id: number, data: Partial<InsertJobTitle>) {
  const db = await getDb();
  if (!db) return;
  await db.update(jobTitles).set(data).where(eq(jobTitles.id, id));
}

export async function deleteJobTitle(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobTitles).where(eq(jobTitles.id, id));
}

// سلم الرواتب - Salary Grades
export async function getSalaryGrades(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(salaryGrades).where(eq(salaryGrades.businessId, businessId)).orderBy(asc(salaryGrades.code));
}

export async function createSalaryGrade(data: InsertSalaryGrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(salaryGrades).values(data);
  return result[0].insertId;
}

// الموظفين - Employees
export async function getEmployees(businessId: number, filters?: {
  departmentId?: number;
  status?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(employees.businessId, businessId)];
  if (filters?.departmentId) conditions.push(eq(employees.departmentId, filters.departmentId));
  if (filters?.status) conditions.push(eq(employees.status, filters.status as any));

  return await db.select().from(employees).where(and(...conditions)).orderBy(desc(employees.createdAt));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(employees).where(eq(employees.id, id));
  return result[0] || null;
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(employees).values(data);
  const [created] = await db.select().from(employees).where(eq(employees.employeeNumber, data.employeeNumber)).limit(1);
  return created;
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) return;
  await db.update(employees).set(data).where(eq(employees.id, id));
  const [updated] = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return updated;
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(employees).where(eq(employees.id, id));
}

export async function getUnlinkedEmployees(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(employees)
    .where(and(eq(employees.businessId, businessId), isNull(employees.fieldWorkerId)))
    .orderBy(asc(employees.firstName));
}

export async function linkEmployeeToFieldWorker(employeeId: number, fieldWorkerId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(employees).set({ fieldWorkerId }).where(eq(employees.id, employeeId));
  await db.update(fieldWorkers).set({ employeeId }).where(eq(fieldWorkers.id, fieldWorkerId));
}

export async function unlinkEmployeeFromFieldWorker(employeeId: number) {
  const db = await getDb();
  if (!db) return;
  
  const emp = await getEmployeeById(employeeId);
  if (emp?.fieldWorkerId) {
    await db.update(fieldWorkers).set({ employeeId: null }).where(eq(fieldWorkers.id, emp.fieldWorkerId));
  }
  await db.update(employees).set({ fieldWorkerId: null }).where(eq(employees.id, employeeId));
}

// بيانات الراتب - Salary Details
export async function getSalaryDetailsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(salaryDetails)
    .where(and(eq(salaryDetails.employeeId, employeeId), eq(salaryDetails.isActive, true)));
  return result[0] || null;
}

export async function createSalaryDetails(data: InsertSalaryDetail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // إلغاء تفعيل الراتب السابق
  await db.update(salaryDetails)
    .set({ isActive: false, endDate: data.effectiveDate })
    .where(and(eq(salaryDetails.employeeId, data.employeeId), eq(salaryDetails.isActive, true)));
  
  const result = await db.insert(salaryDetails).values(data);
  return result[0].insertId;
}

// مسيرات الرواتب - Payroll
export async function getPayrollRuns(businessId: number, year?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(payrollRuns.businessId, businessId)];
  if (year) conditions.push(eq(payrollRuns.periodYear, year));

  return await db.select().from(payrollRuns)
    .where(and(...conditions))
    .orderBy(desc(payrollRuns.periodYear), desc(payrollRuns.periodMonth));
}

export async function createPayrollRun(data: InsertPayrollRun) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(payrollRuns).values(data);
  const [created] = await db.select().from(payrollRuns).where(eq(payrollRuns.code, data.code)).limit(1);
  return created;
}

export async function getPayrollItems(payrollRunId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payrollItems).where(eq(payrollItems.payrollRunId, payrollRunId));
}

export async function createPayrollItem(data: InsertPayrollItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payrollItems).values(data);
  return result[0].insertId;
}

export async function updatePayrollRun(id: number, data: Partial<InsertPayrollRun>) {
  const db = await getDb();
  if (!db) return;
  await db.update(payrollRuns).set(data).where(eq(payrollRuns.id, id));
}

// الحضور والانصراف - Attendance
export async function getAttendance(businessId: number, filters?: {
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(attendance.businessId, businessId)];
  if (filters?.employeeId) conditions.push(eq(attendance.employeeId, filters.employeeId));

  return await db.select().from(attendance)
    .where(and(...conditions))
    .orderBy(desc(attendance.attendanceDate));
}

export async function createAttendance(data: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(attendance).values(data);
  const [created] = await db.select().from(attendance)
    .where(and(eq(attendance.employeeId, data.employeeId), eq(attendance.attendanceDate, data.attendanceDate)))
    .limit(1);
  return created;
}

export async function updateAttendance(id: number, data: Partial<InsertAttendance>) {
  const db = await getDb();
  if (!db) return;
  await db.update(attendance).set(data).where(eq(attendance.id, id));
}

export async function getTodayAttendance(employeeId: number, date: Date) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(attendance)
    .where(and(eq(attendance.employeeId, employeeId), eq(attendance.attendanceDate, date)));
  return result[0] || null;
}

// أنواع الإجازات - Leave Types
export async function getLeaveTypes(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leaveTypes).where(eq(leaveTypes.businessId, businessId)).orderBy(asc(leaveTypes.nameAr));
}

export async function createLeaveType(data: InsertLeaveType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(leaveTypes).values(data);
  const [created] = await db.select().from(leaveTypes).where(eq(leaveTypes.code, data.code)).limit(1);
  return created;
}

// طلبات الإجازات - Leave Requests
export async function getLeaveRequests(businessId: number, filters?: {
  employeeId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(leaveRequests.businessId, businessId)];
  if (filters?.employeeId) conditions.push(eq(leaveRequests.employeeId, filters.employeeId));
  if (filters?.status) conditions.push(eq(leaveRequests.status, filters.status as any));

  return await db.select().from(leaveRequests)
    .where(and(...conditions))
    .orderBy(desc(leaveRequests.createdAt));
}

export async function createLeaveRequest(data: InsertLeaveRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(leaveRequests).values(data);
  const [created] = await db.select().from(leaveRequests)
    .where(and(eq(leaveRequests.employeeId, data.employeeId), eq(leaveRequests.startDate, data.startDate)))
    .orderBy(desc(leaveRequests.id))
    .limit(1);
  return created;
}

export async function updateLeaveRequest(id: number, data: Partial<InsertLeaveRequest>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leaveRequests).set(data).where(eq(leaveRequests.id, id));
}

export async function getLeaveRequestById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
  return result[0] || null;
}

// أرصدة الإجازات - Leave Balances
export async function getLeaveBalance(employeeId: number, leaveTypeId: number, year: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leaveBalances)
    .where(and(
      eq(leaveBalances.employeeId, employeeId),
      eq(leaveBalances.leaveTypeId, leaveTypeId),
      eq(leaveBalances.year, year)
    ));
  return result[0] || null;
}

export async function updateLeaveBalance(id: number, data: Partial<InsertLeaveBalance>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leaveBalances).set(data).where(eq(leaveBalances.id, id));
}

// تقييمات الأداء - Performance Evaluations
export async function getPerformanceEvaluations(businessId: number, employeeId?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(performanceEvaluations.businessId, businessId)];
  if (employeeId) conditions.push(eq(performanceEvaluations.employeeId, employeeId));

  return await db.select().from(performanceEvaluations)
    .where(and(...conditions))
    .orderBy(desc(performanceEvaluations.createdAt));
}

export async function createPerformanceEvaluation(data: InsertPerformanceEvaluation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(performanceEvaluations).values(data);
  return result[0].insertId;
}

// إحصائيات الموارد البشرية
export async function getHRDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalEmployees: 0, activeEmployees: 0, pendingLeaves: 0, totalDepartments: 0 };

  const [totalEmployees] = await db.select({ count: count() }).from(employees).where(eq(employees.businessId, businessId));
  const [activeEmployees] = await db.select({ count: count() }).from(employees).where(and(eq(employees.businessId, businessId), eq(employees.status, "active")));
  const [pendingLeaves] = await db.select({ count: count() }).from(leaveRequests).where(and(eq(leaveRequests.businessId, businessId), eq(leaveRequests.status, "pending")));
  const [totalDepartments] = await db.select({ count: count() }).from(departments).where(eq(departments.businessId, businessId));

  return {
    totalEmployees: totalEmployees?.count || 0,
    activeEmployees: activeEmployees?.count || 0,
    pendingLeaves: pendingLeaves?.count || 0,
    totalDepartments: totalDepartments?.count || 0,
  };
}


// ============================================
// Asset Management Extended Functions
// ============================================

export async function getAssetCategories(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(assetCategories)
    .where(and(eq(assetCategories.businessId, businessId), eq(assetCategories.isActive, true)))
    .orderBy(asc(assetCategories.code));
}

export async function createAssetCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assetCategories).values(data);
  return result[0].insertId;
}

export async function updateAssetCategory(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(assetCategories).set(data).where(eq(assetCategories.id, id));
}

export async function deleteAssetCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(assetCategories).set({ isActive: false }).where(eq(assetCategories.id, id));
}

export async function updateAsset(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(assets).set(data).where(eq(assets.id, id));
}

export async function deleteAsset(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(assets).set({ status: "disposed" }).where(eq(assets.id, id));
}

export async function getAssetMovements(filters: { assetId?: number; businessId?: number; movementType?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions: any[] = [];
  if (filters.assetId) conditions.push(eq(assetMovements.assetId, filters.assetId));
  if (filters.movementType) conditions.push(eq(assetMovements.movementType, filters.movementType as any));
  
  if (conditions.length === 0) return [];
  
  return await db.select().from(assetMovements)
    .where(and(...conditions))
    .orderBy(desc(assetMovements.movementDate));
}

export async function createAssetMovement(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assetMovements).values(data);
  return result[0].insertId;
}

export async function calculateDepreciation(params: { businessId: number; periodId?: number; assetIds?: number[]; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get assets for depreciation
  let conditions = [eq(assets.businessId, params.businessId), eq(assets.status, "active")];
  if (params.assetIds && params.assetIds.length > 0) {
    conditions.push(inArray(assets.id, params.assetIds));
  }
  
  const assetsList = await db.select().from(assets).where(and(...conditions));
  
  let totalDepreciation = 0;
  const results: any[] = [];
  
  for (const asset of assetsList) {
    if (!asset.purchaseCost || !asset.usefulLife) continue;
    
    const purchaseCost = parseFloat(asset.purchaseCost);
    const salvageValue = parseFloat(asset.salvageValue || "0");
    const usefulLife = asset.usefulLife;
    
    // Straight-line depreciation
    const annualDepreciation = (purchaseCost - salvageValue) / usefulLife;
    const monthlyDepreciation = annualDepreciation / 12;
    
    // Update accumulated depreciation
    const newAccumulated = parseFloat(asset.accumulatedDepreciation || "0") + monthlyDepreciation;
    const newCurrentValue = purchaseCost - newAccumulated;
    
    await db.update(assets).set({
      accumulatedDepreciation: newAccumulated.toFixed(2),
      currentValue: newCurrentValue.toFixed(2),
    }).where(eq(assets.id, asset.id));
    
    // Create movement record
    await db.insert(assetMovements).values({
      assetId: asset.id,
      movementType: "depreciation",
      movementDate: new Date().toISOString().split('T')[0],
      amount: monthlyDepreciation.toFixed(2),
      description: "إهلاك شهري",
      createdBy: params.userId,
    });
    
    totalDepreciation += monthlyDepreciation;
    results.push({
      assetId: asset.id,
      assetName: asset.nameAr,
      depreciation: monthlyDepreciation,
    });
  }
  
  return { totalDepreciation, count: results.length, results };
}

export async function getDepreciationHistory(filters: { assetId?: number; businessId?: number; year?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(assetMovements.movementType, "depreciation")];
  if (filters.assetId) conditions.push(eq(assetMovements.assetId, filters.assetId));
  
  return await db.select().from(assetMovements)
    .where(and(...conditions))
    .orderBy(desc(assetMovements.movementDate));
}

export async function getAssetDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalAssets: 0, activeAssets: 0, totalValue: 0, totalDepreciation: 0 };
  
  const [total] = await db.select({ count: count() }).from(assets).where(eq(assets.businessId, businessId));
  const [active] = await db.select({ count: count() }).from(assets).where(and(eq(assets.businessId, businessId), eq(assets.status, "active")));
  const [values] = await db.select({ 
    totalValue: sql<number>`COALESCE(SUM(current_value), 0)`,
    totalDepreciation: sql<number>`COALESCE(SUM(accumulated_depreciation), 0)`,
  }).from(assets).where(eq(assets.businessId, businessId));
  
  return {
    totalAssets: total?.count || 0,
    activeAssets: active?.count || 0,
    totalValue: values?.totalValue || 0,
    totalDepreciation: values?.totalDepreciation || 0,
  };
}

// ============================================
// Accounting Extended Functions
// ============================================

export async function updateAccount(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(accounts).set(data).where(eq(accounts.id, id));
}

export async function deleteAccount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(accounts).set({ isActive: false }).where(eq(accounts.id, id));
}

export async function getAccountsTree(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const allAccounts = await db.select().from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.isActive, true)))
    .orderBy(asc(accounts.code));
  
  // Build tree structure
  const buildTree = (parentId: number | null): any[] => {
    return allAccounts
      .filter(acc => acc.parentId === parentId)
      .map(acc => ({
        ...acc,
        children: buildTree(acc.id),
      }));
  };
  
  return buildTree(null);
}

export async function getJournalEntries(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(journalEntries.businessId, businessId)];
  if (filters.periodId) conditions.push(eq(journalEntries.periodId, filters.periodId));
  if (filters.type) conditions.push(eq(journalEntries.type, filters.type as any));
  if (filters.status) conditions.push(eq(journalEntries.status, filters.status as any));
  
  return await db.select().from(journalEntries)
    .where(and(...conditions))
    .orderBy(desc(journalEntries.entryDate))
    .limit(filters.limit || 100);
}

export async function getJournalEntryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
  if (!entry) return null;
  
  const lines = await db.select().from(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  
  return { ...entry, lines };
}

export async function createJournalEntry(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { lines, ...entryData } = data;
  
  // Generate entry number
  const entryNumber = `JE-${Date.now()}`;
  
  // Calculate totals
  let totalDebit = 0;
  let totalCredit = 0;
  lines.forEach((line: any) => {
    totalDebit += parseFloat(line.debit || "0");
    totalCredit += parseFloat(line.credit || "0");
  });
  
  const result = await db.insert(journalEntries).values({
    ...entryData,
    entryNumber,
    totalDebit: totalDebit.toFixed(2),
    totalCredit: totalCredit.toFixed(2),
    status: "draft",
  });
  
  const entryId = result[0].insertId;
  
  // Insert lines
  for (let i = 0; i < lines.length; i++) {
    await db.insert(journalEntryLines).values({
      journalEntryId: entryId,
      lineNumber: i + 1,
      accountId: lines[i].accountId,
      debit: lines[i].debit || "0",
      credit: lines[i].credit || "0",
      description: lines[i].description,
      costCenterId: lines[i].costCenterId,
    });
  }
  
  return entryId;
}

export async function updateJournalEntry(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const { lines, ...entryData } = data;
  
  if (Object.keys(entryData).length > 0) {
    await db.update(journalEntries).set(entryData).where(eq(journalEntries.id, id));
  }
  
  if (lines) {
    // Delete existing lines and insert new ones
    await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
    
    let totalDebit = 0;
    let totalCredit = 0;
    
    for (let i = 0; i < lines.length; i++) {
      totalDebit += parseFloat(lines[i].debit || "0");
      totalCredit += parseFloat(lines[i].credit || "0");
      
      await db.insert(journalEntryLines).values({
        journalEntryId: id,
        lineNumber: i + 1,
        accountId: lines[i].accountId,
        debit: lines[i].debit || "0",
        credit: lines[i].credit || "0",
        description: lines[i].description,
        costCenterId: lines[i].costCenterId,
      });
    }
    
    await db.update(journalEntries).set({
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2),
    }).where(eq(journalEntries.id, id));
  }
}

export async function deleteJournalEntry(id: number) {
  const db = await getDb();
  if (!db) return;
  
  // Only delete draft entries
  const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
  if (entry?.status !== "draft") {
    throw new Error("لا يمكن حذف قيد مرحّل");
  }
  
  await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
}

export async function postJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
  if (!entry) throw new Error("القيد غير موجود");
  if (entry.status !== "draft") throw new Error("القيد مرحّل بالفعل");
  
  // Verify debit = credit
  if (entry.totalDebit !== entry.totalCredit) {
    throw new Error("مجموع المدين لا يساوي مجموع الدائن");
  }
  
  // Update account balances
  const lines = await db.select().from(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  
  for (const line of lines) {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, line.accountId));
    if (!account) continue;
    
    const currentBalance = parseFloat(account.currentBalance || "0");
    const debit = parseFloat(line.debit || "0");
    const credit = parseFloat(line.credit || "0");
    
    let newBalance: number;
    if (account.nature === "debit") {
      newBalance = currentBalance + debit - credit;
    } else {
      newBalance = currentBalance + credit - debit;
    }
    
    await db.update(accounts).set({ currentBalance: newBalance.toFixed(2) }).where(eq(accounts.id, line.accountId));
  }
  
  await db.update(journalEntries).set({
    status: "posted",
    postedBy: userId,
    postedAt: new Date(),
  }).where(eq(journalEntries.id, id));
}

export async function reverseJournalEntry(id: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const entry = await getJournalEntryById(id);
  if (!entry) throw new Error("القيد غير موجود");
  if (entry.status !== "posted") throw new Error("لا يمكن عكس قيد غير مرحّل");
  
  // Create reverse entry
  const reversedLines = entry.lines.map((line: any) => ({
    accountId: line.accountId,
    debit: line.credit,
    credit: line.debit,
    description: `عكس: ${line.description || ""}`,
    costCenterId: line.costCenterId,
  }));
  
  const newId = await createJournalEntry({
    businessId: entry.businessId,
    branchId: entry.branchId,
    entryDate: new Date().toISOString().split('T')[0],
    periodId: entry.periodId,
    type: "adjustment",
    description: `عكس القيد ${entry.entryNumber}: ${reason || ""}`,
    lines: reversedLines,
    createdBy: userId,
  });
  
  // Post the reverse entry
  await postJournalEntry(newId, userId);
  
  // Mark original as reversed
  await db.update(journalEntries).set({ status: "reversed" }).where(eq(journalEntries.id, id));
  
  return newId;
}

export async function getFiscalPeriods(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(fiscalPeriods.businessId, businessId)];
  if (filters.year) conditions.push(eq(fiscalPeriods.year, filters.year));
  if (filters.status) conditions.push(eq(fiscalPeriods.status, filters.status as any));
  
  return await db.select().from(fiscalPeriods)
    .where(and(...conditions))
    .orderBy(desc(fiscalPeriods.year), desc(fiscalPeriods.period));
}

export async function createFiscalPeriod(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(fiscalPeriods).values(data);
  return result[0].insertId;
}

export async function closeFiscalPeriod(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(fiscalPeriods).set({
    status: "closed",
    closedBy: userId,
    closedAt: new Date(),
  }).where(eq(fiscalPeriods.id, id));
}

export async function reopenFiscalPeriod(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(fiscalPeriods).set({
    status: "open",
    closedBy: null,
    closedAt: null,
  }).where(eq(fiscalPeriods.id, id));
}

export async function getCostCenters(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(costCenters)
    .where(and(eq(costCenters.businessId, businessId), eq(costCenters.isActive, true)))
    .orderBy(asc(costCenters.code));
}

export async function createCostCenter(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(costCenters).values(data);
  return result[0].insertId;
}

export async function updateCostCenter(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(costCenters).set(data).where(eq(costCenters.id, id));
}

export async function deleteCostCenter(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(costCenters).set({ isActive: false }).where(eq(costCenters.id, id));
}

export async function getTrialBalance(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: accounts.id,
    code: accounts.code,
    nameAr: accounts.nameAr,
    nature: accounts.nature,
    openingBalance: accounts.openingBalance,
    currentBalance: accounts.currentBalance,
  }).from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.isActive, true)))
    .orderBy(asc(accounts.code));
}

export async function getGeneralLedger(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions: any[] = [eq(journalEntries.businessId, businessId), eq(journalEntries.status, "posted")];
  
  const entries = await db.select({
    entryId: journalEntries.id,
    entryNumber: journalEntries.entryNumber,
    entryDate: journalEntries.entryDate,
    description: journalEntries.description,
    lineId: journalEntryLines.id,
    accountId: journalEntryLines.accountId,
    debit: journalEntryLines.debit,
    credit: journalEntryLines.credit,
    lineDescription: journalEntryLines.description,
  })
    .from(journalEntries)
    .innerJoin(journalEntryLines, eq(journalEntries.id, journalEntryLines.journalEntryId))
    .where(and(...conditions))
    .orderBy(desc(journalEntries.entryDate));
  
  if (filters.accountId) {
    return entries.filter(e => e.accountId === filters.accountId);
  }
  
  return entries;
}

export async function getIncomeStatement(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return { revenues: [], expenses: [], totalRevenue: 0, totalExpense: 0, netIncome: 0 };
  
  // Get revenue and expense accounts
  const revenueAccounts = await db.select().from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.nature, "credit"), eq(accounts.isActive, true)));
  
  const expenseAccounts = await db.select().from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.nature, "debit"), eq(accounts.isActive, true)));
  
  const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  const totalExpense = expenseAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  
  return {
    revenues: revenueAccounts,
    expenses: expenseAccounts,
    totalRevenue,
    totalExpense,
    netIncome: totalRevenue - totalExpense,
  };
}

export async function getBalanceSheet(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return { assets: [], liabilities: [], equity: [], totalAssets: 0, totalLiabilities: 0, totalEquity: 0 };
  
  const allAccounts = await db.select().from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.isActive, true)));
  
  // Simple categorization based on account nature
  const assetAccounts = allAccounts.filter(acc => acc.nature === "debit");
  const liabilityAccounts = allAccounts.filter(acc => acc.nature === "credit");
  
  const totalAssets = assetAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  
  return {
    assets: assetAccounts,
    liabilities: liabilityAccounts,
    equity: [],
    totalAssets,
    totalLiabilities,
    totalEquity: totalAssets - totalLiabilities,
  };
}

export async function getAccountingDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalAccounts: 0, totalEntries: 0, pendingEntries: 0, currentPeriod: null };
  
  const [totalAccounts] = await db.select({ count: count() }).from(accounts).where(eq(accounts.businessId, businessId));
  const [totalEntries] = await db.select({ count: count() }).from(journalEntries).where(eq(journalEntries.businessId, businessId));
  const [pendingEntries] = await db.select({ count: count() }).from(journalEntries).where(and(eq(journalEntries.businessId, businessId), eq(journalEntries.status, "draft")));
  const [currentPeriod] = await db.select().from(fiscalPeriods).where(and(eq(fiscalPeriods.businessId, businessId), eq(fiscalPeriods.status, "open"))).limit(1);
  
  return {
    totalAccounts: totalAccounts?.count || 0,
    totalEntries: totalEntries?.count || 0,
    pendingEntries: pendingEntries?.count || 0,
    currentPeriod,
  };
}

// ============================================
// Inventory Extended Functions
// ============================================

export async function getWarehouses(businessId: number, filters?: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(warehouses.businessId, businessId), eq(warehouses.isActive, true)];
  if (filters?.branchId) conditions.push(eq(warehouses.branchId, filters.branchId));
  if (filters?.type) conditions.push(eq(warehouses.type, filters.type as any));
  
  return await db.select().from(warehouses)
    .where(and(...conditions))
    .orderBy(asc(warehouses.nameAr));
}

export async function getWarehouseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(warehouses).where(eq(warehouses.id, id));
  return result || null;
}

export async function createWarehouse(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(warehouses).values(data);
  return result[0].insertId;
}

export async function updateWarehouse(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(warehouses).set(data).where(eq(warehouses.id, id));
}

export async function deleteWarehouse(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(warehouses).set({ isActive: false }).where(eq(warehouses.id, id));
}

export async function getItemCategories(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(itemCategories)
    .where(and(eq(itemCategories.businessId, businessId), eq(itemCategories.isActive, true)))
    .orderBy(asc(itemCategories.code));
}

export async function createItemCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(itemCategories).values(data);
  return result[0].insertId;
}

export async function updateItemCategory(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(itemCategories).set(data).where(eq(itemCategories.id, id));
}

export async function deleteItemCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(itemCategories).set({ isActive: false }).where(eq(itemCategories.id, id));
}

export async function getItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(items).where(eq(items.id, id));
  return result || null;
}

export async function updateItem(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(items).set(data).where(eq(items.id, id));
}

export async function deleteItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(items).set({ isActive: false }).where(eq(items.id, id));
}

export async function getStockBalances(filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions: any[] = [];
  if (filters.warehouseId) conditions.push(eq(stockBalances.warehouseId, filters.warehouseId));
  if (filters.itemId) conditions.push(eq(stockBalances.itemId, filters.itemId));
  
  const query = db.select({
    id: stockBalances.id,
    itemId: stockBalances.itemId,
    warehouseId: stockBalances.warehouseId,
    quantity: stockBalances.quantity,
    reservedQty: stockBalances.reservedQty,
    availableQty: stockBalances.availableQty,
    averageCost: stockBalances.averageCost,
    totalValue: stockBalances.totalValue,
    itemCode: items.code,
    itemName: items.nameAr,
    warehouseName: warehouses.nameAr,
  })
    .from(stockBalances)
    .leftJoin(items, eq(stockBalances.itemId, items.id))
    .leftJoin(warehouses, eq(stockBalances.warehouseId, warehouses.id));
  
  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }
  
  return await query;
}

export async function getStockBalancesByItem(itemId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stockBalances).where(eq(stockBalances.itemId, itemId));
}

export async function getStockBalancesByWarehouse(warehouseId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stockBalances).where(eq(stockBalances.warehouseId, warehouseId));
}

export async function getStockMovements(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(stockMovements.businessId, businessId)];
  if (filters.warehouseId) conditions.push(eq(stockMovements.warehouseId, filters.warehouseId));
  if (filters.itemId) conditions.push(eq(stockMovements.itemId, filters.itemId));
  if (filters.movementType) conditions.push(eq(stockMovements.movementType, filters.movementType as any));
  
  return await db.select().from(stockMovements)
    .where(and(...conditions))
    .orderBy(desc(stockMovements.movementDate))
    .limit(filters.limit || 100);
}

export async function createStockMovement(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current balance
  const [currentBalance] = await db.select().from(stockBalances)
    .where(and(eq(stockBalances.itemId, data.itemId), eq(stockBalances.warehouseId, data.warehouseId)));
  
  const balanceBefore = currentBalance ? parseFloat(currentBalance.quantity || "0") : 0;
  const quantity = parseFloat(data.quantity);
  
  let balanceAfter: number;
  if (["receipt", "transfer_in", "adjustment_in", "return"].includes(data.movementType)) {
    balanceAfter = balanceBefore + quantity;
  } else {
    balanceAfter = balanceBefore - quantity;
  }
  
  // Insert movement
  const result = await db.insert(stockMovements).values({
    ...data,
    balanceBefore: balanceBefore.toFixed(3),
    balanceAfter: balanceAfter.toFixed(3),
  });
  
  // Update or create stock balance
  if (currentBalance) {
    await db.update(stockBalances).set({
      quantity: balanceAfter.toFixed(3),
      availableQty: balanceAfter.toFixed(3),
      lastMovementDate: new Date(),
    }).where(eq(stockBalances.id, currentBalance.id));
  } else {
    await db.insert(stockBalances).values({
      itemId: data.itemId,
      warehouseId: data.warehouseId,
      quantity: balanceAfter.toFixed(3),
      availableQty: balanceAfter.toFixed(3),
      lastMovementDate: new Date(),
    });
  }
  
  return result[0].insertId;
}

export async function transferStock(data: { businessId: number; itemId: number; fromWarehouseId: number; toWarehouseId: number; quantity: string; notes?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date().toISOString();
  
  // Create transfer out movement
  await createStockMovement({
    businessId: data.businessId,
    itemId: data.itemId,
    warehouseId: data.fromWarehouseId,
    movementType: "transfer_out",
    movementDate: now,
    quantity: data.quantity,
    notes: data.notes,
    createdBy: data.userId,
  });
  
  // Create transfer in movement
  await createStockMovement({
    businessId: data.businessId,
    itemId: data.itemId,
    warehouseId: data.toWarehouseId,
    movementType: "transfer_in",
    movementDate: now,
    quantity: data.quantity,
    notes: data.notes,
    createdBy: data.userId,
  });
  
  return { success: true };
}

export async function adjustStock(data: { businessId: number; itemId: number; warehouseId: number; adjustmentType: string; quantity: string; reason?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const movementType = data.adjustmentType === "in" ? "adjustment_in" : "adjustment_out";
  
  return await createStockMovement({
    businessId: data.businessId,
    itemId: data.itemId,
    warehouseId: data.warehouseId,
    movementType,
    movementDate: new Date().toISOString(),
    quantity: data.quantity,
    notes: data.reason,
    createdBy: data.userId,
  });
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(suppliers).where(eq(suppliers.id, id));
  return result || null;
}

export async function updateSupplier(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

export async function deleteSupplier(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(suppliers).set({ isActive: false }).where(eq(suppliers.id, id));
}

export async function getPurchaseOrders(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(purchaseOrders.businessId, businessId)];
  if (filters.supplierId) conditions.push(eq(purchaseOrders.supplierId, filters.supplierId));
  if (filters.status) conditions.push(eq(purchaseOrders.status, filters.status as any));
  
  return await db.select().from(purchaseOrders)
    .where(and(...conditions))
    .orderBy(desc(purchaseOrders.orderDate))
    .limit(filters.limit || 100);
}

export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
  return result || null;
}

export async function createPurchaseOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { items: orderItems, ...orderData } = data;
  
  // Generate order number
  const orderNumber = `PO-${Date.now()}`;
  
  // Calculate totals
  let subtotal = 0;
  let taxAmount = 0;
  
  for (const item of orderItems) {
    const lineTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
    const lineTax = lineTotal * (parseFloat(item.taxRate || "0") / 100);
    subtotal += lineTotal;
    taxAmount += lineTax;
  }
  
  const totalAmount = subtotal + taxAmount - parseFloat(orderData.discountAmount || "0");
  
  const result = await db.insert(purchaseOrders).values({
    ...orderData,
    orderNumber,
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    status: "draft",
  });
  
  return result[0].insertId;
}

export async function updatePurchaseOrderStatus(id: number, status: string, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  
  if (status === "approved") {
    updateData.approvedBy = userId;
    updateData.approvedAt = new Date();
  }
  
  await db.update(purchaseOrders).set(updateData).where(eq(purchaseOrders.id, id));
}

export async function receivePurchaseOrder(data: { id: number; items: any[]; warehouseId: number; notes?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, data.id));
  if (!order) throw new Error("أمر الشراء غير موجود");
  
  // Create stock movements for received items
  for (const item of data.items) {
    await createStockMovement({
      businessId: order.businessId,
      itemId: item.itemId,
      warehouseId: data.warehouseId,
      movementType: "receipt",
      movementDate: new Date().toISOString(),
      documentType: "purchase_order",
      documentId: data.id,
      documentNumber: order.orderNumber,
      quantity: item.receivedQty,
      notes: data.notes,
      createdBy: data.userId,
    });
  }
  
  // Update order status
  await db.update(purchaseOrders).set({ status: "received" }).where(eq(purchaseOrders.id, data.id));
}

export async function getInventoryDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalItems: 0, totalWarehouses: 0, lowStockItems: 0, totalValue: 0 };
  
  const [totalItems] = await db.select({ count: count() }).from(items).where(eq(items.businessId, businessId));
  const [totalWarehouses] = await db.select({ count: count() }).from(warehouses).where(eq(warehouses.businessId, businessId));
  const [totalValue] = await db.select({ total: sql<number>`COALESCE(SUM(total_value), 0)` }).from(stockBalances);
  
  return {
    totalItems: totalItems?.count || 0,
    totalWarehouses: totalWarehouses?.count || 0,
    lowStockItems: 0, // TODO: Calculate based on min stock
    totalValue: totalValue?.total || 0,
  };
}

// ============================================
// Maintenance Extended Functions
// ============================================

export async function updateWorkOrder(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(workOrders).set(data).where(eq(workOrders.id, id));
}

export async function completeWorkOrder(data: { id: number; actualHours?: string; actualCost?: string; laborCost?: string; partsCost?: string; completionNotes?: string; failureCode?: string; rootCause?: string; userId: number }) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(workOrders).set({
    status: "completed",
    actualEnd: new Date(),
    actualHours: data.actualHours,
    actualCost: data.actualCost,
    laborCost: data.laborCost,
    partsCost: data.partsCost,
    completionNotes: data.completionNotes,
    failureCode: data.failureCode,
    rootCause: data.rootCause,
  }).where(eq(workOrders.id, data.id));
}

export async function deleteWorkOrder(id: number) {
  const db = await getDb();
  if (!db) return;
  
  // Only delete draft work orders
  const [order] = await db.select().from(workOrders).where(eq(workOrders.id, id));
  if (order?.status !== "draft") {
    throw new Error("لا يمكن حذف أمر عمل غير مسودة");
  }
  
  await db.delete(workOrderTasks).where(eq(workOrderTasks.workOrderId, id));
  await db.delete(workOrders).where(eq(workOrders.id, id));
}

export async function getWorkOrderTasks(workOrderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(workOrderTasks)
    .where(eq(workOrderTasks.workOrderId, workOrderId))
    .orderBy(asc(workOrderTasks.taskNumber));
}

export async function createWorkOrderTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get next task number
  const [lastTask] = await db.select({ maxNum: sql<number>`MAX(task_number)` })
    .from(workOrderTasks)
    .where(eq(workOrderTasks.workOrderId, data.workOrderId));
  
  const taskNumber = (lastTask?.maxNum || 0) + 1;
  
  const result = await db.insert(workOrderTasks).values({
    ...data,
    taskNumber,
    status: "pending",
  });
  
  return result[0].insertId;
}

export async function updateWorkOrderTask(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(workOrderTasks).set(data).where(eq(workOrderTasks.id, id));
}

export async function completeWorkOrderTask(id: number, data: { actualHours?: string; notes?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(workOrderTasks).set({
    status: "completed",
    actualHours: data.actualHours,
    notes: data.notes,
    completedAt: new Date(),
  }).where(eq(workOrderTasks.id, id));
}

export async function deleteWorkOrderTask(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(workOrderTasks).where(eq(workOrderTasks.id, id));
}

export async function getMaintenancePlans(businessId: number, filters?: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(maintenancePlans.businessId, businessId)];
  if (filters?.assetCategoryId) conditions.push(eq(maintenancePlans.assetCategoryId, filters.assetCategoryId));
  if (filters?.frequency) conditions.push(eq(maintenancePlans.frequency, filters.frequency as any));
  if (filters?.isActive !== undefined) conditions.push(eq(maintenancePlans.isActive, filters.isActive));
  
  return await db.select().from(maintenancePlans)
    .where(and(...conditions))
    .orderBy(asc(maintenancePlans.nameAr));
}

export async function getMaintenancePlanById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(maintenancePlans).where(eq(maintenancePlans.id, id));
  return result || null;
}

export async function createMaintenancePlan(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(maintenancePlans).values(data);
  return result[0].insertId;
}

export async function updateMaintenancePlan(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(maintenancePlans).set(data).where(eq(maintenancePlans.id, id));
}

export async function deleteMaintenancePlan(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(maintenancePlans).set({ isActive: false }).where(eq(maintenancePlans.id, id));
}

export async function generateWorkOrdersFromPlan(data: { planId: number; assetIds?: number[]; scheduledDate?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const plan = await getMaintenancePlanById(data.planId);
  if (!plan) throw new Error("خطة الصيانة غير موجودة");
  
  // Get assets for this plan
  let assetConditions = [eq(assets.businessId, plan.businessId), eq(assets.status, "active")];
  if (plan.assetCategoryId) assetConditions.push(eq(assets.categoryId, plan.assetCategoryId));
  if (data.assetIds && data.assetIds.length > 0) assetConditions.push(inArray(assets.id, data.assetIds));
  
  const assetsList = await db.select().from(assets).where(and(...assetConditions));
  
  const createdOrders: number[] = [];
  
  for (const asset of assetsList) {
    const orderNumber = `WO-${Date.now()}-${asset.id}`;
    
    const result = await db.insert(workOrders).values({
      businessId: plan.businessId,
      branchId: asset.branchId,
      stationId: asset.stationId,
      orderNumber,
      type: "preventive",
      priority: "medium",
      status: "pending",
      assetId: asset.id,
      title: `${plan.nameAr} - ${asset.nameAr}`,
      description: plan.description,
      scheduledStart: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
      estimatedHours: plan.estimatedHours,
      estimatedCost: plan.estimatedCost,
      createdBy: data.userId,
    });
    
    createdOrders.push(result[0].insertId);
    
    // Create tasks from plan
    if (plan.tasks) {
      const tasks = typeof plan.tasks === "string" ? JSON.parse(plan.tasks) : plan.tasks;
      for (let i = 0; i < tasks.length; i++) {
        await db.insert(workOrderTasks).values({
          workOrderId: result[0].insertId,
          taskNumber: i + 1,
          description: tasks[i].description,
          estimatedHours: tasks[i].estimatedHours,
          status: "pending",
        });
      }
    }
  }
  
  return { count: createdOrders.length, orderIds: createdOrders };
}

// Technicians (using employees or field workers)
export async function getTechnicians(businessId: number, filters?: any) {
  const db = await getDb();
  if (!db) return [];
  
  // Return employees who can be technicians
  return await db.select().from(employees)
    .where(and(eq(employees.businessId, businessId), eq(employees.status, "active")))
    .orderBy(asc(employees.firstName));
}

export async function getTechnicianById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(employees).where(eq(employees.id, id));
  return result || null;
}

export async function createTechnician(data: any) {
  // Create as employee
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(employees).values({
    businessId: data.businessId,
    employeeNumber: data.code,
    firstName: data.nameAr,
    lastName: "",
    phone: data.phone,
    email: data.email,
    status: "active",
  });
  
  return result[0].insertId;
}

export async function updateTechnician(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = {};
  if (data.nameAr) updateData.firstName = data.nameAr;
  if (data.phone) updateData.phone = data.phone;
  if (data.email) updateData.email = data.email;
  if (data.isActive !== undefined) updateData.status = data.isActive ? "active" : "inactive";
  
  await db.update(employees).set(updateData).where(eq(employees.id, id));
}

export async function deleteTechnician(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(employees).set({ status: "inactive" }).where(eq(employees.id, id));
}

export async function getTechnicianWorkload(data: { technicianId: number; startDate?: string; endDate?: string }) {
  const db = await getDb();
  if (!db) return { assignedOrders: 0, completedOrders: 0, totalHours: 0 };
  
  const [assigned] = await db.select({ count: count() }).from(workOrders)
    .where(and(eq(workOrders.assignedTo, data.technicianId), ne(workOrders.status, "completed"), ne(workOrders.status, "cancelled")));
  
  const [completed] = await db.select({ count: count() }).from(workOrders)
    .where(and(eq(workOrders.assignedTo, data.technicianId), eq(workOrders.status, "completed")));
  
  const [hours] = await db.select({ total: sql<number>`COALESCE(SUM(actual_hours), 0)` }).from(workOrders)
    .where(eq(workOrders.assignedTo, data.technicianId));
  
  return {
    assignedOrders: assigned?.count || 0,
    completedOrders: completed?.count || 0,
    totalHours: hours?.total || 0,
  };
}

export async function getWorkOrderSpareParts(workOrderId: number) {
  // TODO: Implement when spare parts table is available
  return [];
}

export async function addSparePartToWorkOrder(data: any) {
  // TODO: Implement when spare parts table is available
  return 0;
}

export async function removeSparePartFromWorkOrder(id: number) {
  // TODO: Implement when spare parts table is available
}

export async function getMaintenanceDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalWorkOrders: 0, pendingOrders: 0, completedOrders: 0, activePlans: 0 };
  
  const [total] = await db.select({ count: count() }).from(workOrders).where(eq(workOrders.businessId, businessId));
  const [pending] = await db.select({ count: count() }).from(workOrders).where(and(eq(workOrders.businessId, businessId), eq(workOrders.status, "pending")));
  const [completed] = await db.select({ count: count() }).from(workOrders).where(and(eq(workOrders.businessId, businessId), eq(workOrders.status, "completed")));
  const [plans] = await db.select({ count: count() }).from(maintenancePlans).where(and(eq(maintenancePlans.businessId, businessId), eq(maintenancePlans.isActive, true)));
  
  return {
    totalWorkOrders: total?.count || 0,
    pendingOrders: pending?.count || 0,
    completedOrders: completed?.count || 0,
    activePlans: plans?.count || 0,
  };
}

export async function getWorkOrderSummaryReport(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    status: workOrders.status,
    count: count(),
  }).from(workOrders)
    .where(eq(workOrders.businessId, businessId))
    .groupBy(workOrders.status);
}

export async function getMaintenanceCostsReport(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return { totalCost: 0, laborCost: 0, partsCost: 0 };
  
  const [costs] = await db.select({
    totalCost: sql<number>`COALESCE(SUM(actual_cost), 0)`,
    laborCost: sql<number>`COALESCE(SUM(labor_cost), 0)`,
    partsCost: sql<number>`COALESCE(SUM(parts_cost), 0)`,
  }).from(workOrders)
    .where(and(eq(workOrders.businessId, businessId), eq(workOrders.status, "completed")));
  
  return costs || { totalCost: 0, laborCost: 0, partsCost: 0 };
}

export async function getEquipmentDowntimeReport(businessId: number, filters: any) {
  // TODO: Implement downtime tracking
  return [];
}



// ============================================
// Projects System Functions (Extended)
// ============================================

export async function updateProject(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  
  await db.update(projects).set(updateData).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(projectTasks).where(eq(projectTasks.projectId, id));
  await db.delete(projectPhases).where(eq(projectPhases.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectPhases(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(projectPhases)
    .where(eq(projectPhases.projectId, projectId))
    .orderBy(asc(projectPhases.sortOrder));
}

export async function createProjectPhase(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(projectPhases).values({
    projectId: data.projectId,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    description: data.description,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    status: data.status || "pending",
    progress: data.progress || 0,
    sortOrder: data.sortOrder || 0,
  });
  
  return result.insertId;
}

export async function updateProjectPhase(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  
  await db.update(projectPhases).set(updateData).where(eq(projectPhases.id, id));
}

export async function deleteProjectPhase(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(projectPhases).where(eq(projectPhases.id, id));
}

export async function getProjectTasks(projectId: number, phaseId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(projectTasks.projectId, projectId)];
  if (phaseId) conditions.push(eq(projectTasks.phaseId, phaseId));
  
  return await db.select().from(projectTasks)
    .where(and(...conditions))
    .orderBy(asc(projectTasks.dueDate));
}

export async function createProjectTask(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(projectTasks).values({
    projectId: data.projectId,
    phaseId: data.phaseId,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    description: data.description,
    assigneeId: data.assigneeId,
    startDate: data.startDate ? new Date(data.startDate) : null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    priority: data.priority || "medium",
    status: data.status || "pending",
    progress: data.progress || 0,
    estimatedHours: data.estimatedHours,
    actualHours: data.actualHours,
  });
  
  return result.insertId;
}

export async function updateProjectTask(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  
  await db.update(projectTasks).set(updateData).where(eq(projectTasks.id, id));
}

export async function deleteProjectTask(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(projectTasks).where(eq(projectTasks.id, id));
}

export async function getProjectsStats(businessId: number) {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, completed: 0, onHold: 0, totalBudget: 0 };
  
  const allProjects = await db.select().from(projects).where(eq(projects.businessId, businessId));
  
  return {
    total: allProjects.length,
    active: allProjects.filter(p => p.status === "in_progress").length,
    completed: allProjects.filter(p => p.status === "completed").length,
    onHold: allProjects.filter(p => p.status === "on_hold").length,
    planning: allProjects.filter(p => p.status === "planning").length,
    totalBudget: allProjects.reduce((sum, p) => sum + parseFloat(p.budget || "0"), 0),
  };
}

export async function getProjectGanttData(projectId: number) {
  const db = await getDb();
  if (!db) return { phases: [], tasks: [] };
  
  const phases = await getProjectPhases(projectId);
  const tasks = await getProjectTasks(projectId);
  
  return { phases, tasks };
}

// ============================================
// SCADA System Functions
// ============================================

export async function getScadaEquipment(businessId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(equipment.businessId, businessId)];
  if (status) conditions.push(eq(equipment.status, status as any));
  
  return await db.select().from(equipment)
    .where(and(...conditions))
    .orderBy(desc(equipment.createdAt));
}

export async function getScadaEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select().from(equipment).where(eq(equipment.id, id));
  return result || null;
}

export async function createScadaEquipment(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(equipment).values({
    businessId: data.businessId,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    type: data.type,
    manufacturer: data.manufacturer,
    model: data.model,
    serialNumber: data.serialNumber,
    location: data.location,
    installationDate: data.installationDate ? new Date(data.installationDate) : null,
    status: data.status || "active",
    description: data.description,
  });
  
  return result.insertId;
}

export async function updateScadaEquipment(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.installationDate) updateData.installationDate = new Date(data.installationDate);
  
  await db.update(equipment).set(updateData).where(eq(equipment.id, id));
}

export async function deleteScadaEquipment(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(equipment).where(eq(equipment.id, id));
}

export async function getScadaSensors(businessId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(sensors.businessId, businessId)];
  if (status) conditions.push(eq(sensors.status, status as any));
  
  return await db.select().from(sensors)
    .where(and(...conditions))
    .orderBy(desc(sensors.createdAt));
}

export async function getScadaSensorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select().from(sensors).where(eq(sensors.id, id));
  return result || null;
}

export async function createScadaSensor(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(sensors).values({
    businessId: data.businessId,
    equipmentId: data.equipmentId,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    type: data.type,
    unit: data.unit,
    minValue: data.minValue,
    maxValue: data.maxValue,
    warningThreshold: data.warningThreshold,
    criticalThreshold: data.criticalThreshold,
    location: data.location,
    status: data.status || "active",
  });
  
  return result.insertId;
}

export async function updateScadaSensor(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(sensors).set(data).where(eq(sensors.id, id));
}

export async function deleteScadaSensor(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(sensors).where(eq(sensors.id, id));
}

export async function getScadaAlerts(businessId: number, type?: string, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(alerts.businessId, businessId)];
  if (type) conditions.push(eq(alerts.alertType, type as any));
  if (status) conditions.push(eq(alerts.status, status as any));
  
  return await db.select().from(alerts)
    .where(and(...conditions))
    .orderBy(desc(alerts.createdAt));
}

export async function getScadaAlertById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select().from(alerts).where(eq(alerts.id, id));
  return result || null;
}

export async function createScadaAlert(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(alerts).values({
    businessId: data.businessId,
    equipmentId: data.equipmentId,
    sensorId: data.sensorId,
    alertType: data.alertType || "warning",
    title: data.title,
    message: data.message,
    priority: data.priority || "medium",
    status: "active",
  });
  
  return result.insertId;
}

export async function updateScadaAlertStatus(id: number, status: string, resolvedBy?: number) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  if (status === "acknowledged") {
    updateData.acknowledgedAt = new Date();
  } else if (status === "resolved") {
    updateData.resolvedAt = new Date();
    if (resolvedBy) updateData.resolvedBy = resolvedBy;
  }
  
  await db.update(alerts).set(updateData).where(eq(alerts.id, id));
}

export async function deleteScadaAlert(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(alerts).where(eq(alerts.id, id));
}

export async function getScadaDashboard(businessId: number) {
  const db = await getDb();
  if (!db) return { equipment: [], sensors: [], alerts: [] };
  
  const [equipmentList, sensorsList, alertsList] = await Promise.all([
    db.select().from(equipment).where(eq(equipment.businessId, businessId)).limit(10),
    db.select().from(sensors).where(eq(sensors.businessId, businessId)).limit(10),
    db.select().from(alerts).where(and(
      eq(alerts.businessId, businessId),
      eq(alerts.status, "active")
    )).limit(10),
  ]);
  
  return {
    equipment: equipmentList,
    sensors: sensorsList,
    alerts: alertsList,
  };
}

export async function getScadaStats(businessId: number) {
  const db = await getDb();
  if (!db) return {
    totalEquipment: 0,
    onlineEquipment: 0,
    offlineEquipment: 0,
    totalSensors: 0,
    activeSensors: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
  };
  
  const [equipmentList, sensorsList, alertsList] = await Promise.all([
    db.select().from(equipment).where(eq(equipment.businessId, businessId)),
    db.select().from(sensors).where(eq(sensors.businessId, businessId)),
    db.select().from(alerts).where(and(
      eq(alerts.businessId, businessId),
      eq(alerts.status, "active")
    )),
  ]);
  
  return {
    totalEquipment: equipmentList.length,
    onlineEquipment: equipmentList.filter(e => e.status === "online" || e.status === "active").length,
    offlineEquipment: equipmentList.filter(e => e.status === "offline" || e.status === "inactive").length,
    totalSensors: sensorsList.length,
    activeSensors: sensorsList.filter(s => s.status === "active").length,
    activeAlerts: alertsList.length,
    criticalAlerts: alertsList.filter(a => a.alertType === "critical" || a.alertType === "emergency").length,
  };
}

export async function getScadaAlertsStats(businessId: number) {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, acknowledged: 0, resolved: 0 };
  
  const alertsList = await db.select().from(alerts).where(eq(alerts.businessId, businessId));
  
  return {
    total: alertsList.length,
    active: alertsList.filter(a => a.status === "active").length,
    acknowledged: alertsList.filter(a => a.status === "acknowledged").length,
    resolved: alertsList.filter(a => a.status === "resolved").length,
  };
}
