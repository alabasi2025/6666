import { eq, and, desc, asc, sql, like, or, isNull, count } from "drizzle-orm";
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
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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
  if (!db) return [];

  return await db.select().from(businesses).where(eq(businesses.isActive, true)).orderBy(asc(businesses.nameAr));
}

export async function getBusinessById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return result[0] || null;
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
  return await db.select().from(branches).where(eq(branches.isActive, true)).orderBy(asc(branches.nameAr));
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
