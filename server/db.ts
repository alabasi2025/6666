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
  // Developer System
  integrations, InsertIntegration,
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
