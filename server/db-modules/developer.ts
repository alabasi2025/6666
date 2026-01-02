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

  return await db.select({
    id: integrations.id,
    businessId: integrations.businessId,
    name: integrations.name,
    integrationType: integrations.integrationType,
    status: integrations.status,
    isActive: integrations.isActive,
    createdAt: integrations.createdAt,
  }).from(integrations).where(and(...conditions)).orderBy(desc(integrations.createdAt));
}

export async function getIntegrationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: integrations.id,
    businessId: integrations.businessId,
    name: integrations.name,
    description: integrations.description,
    integrationType: integrations.integrationType,
    status: integrations.status,
    isActive: integrations.isActive,
    endpoint: integrations.endpoint,
    authType: integrations.authType,
    lastSyncAt: integrations.lastSyncAt,
    syncFrequency: integrations.syncFrequency,
    createdAt: integrations.createdAt,
    updatedAt: integrations.updatedAt,
  }).from(integrations).where(eq(integrations.id, id)).limit(1);
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

  return await db.select({
    id: integrationConfigs.id,
    integrationId: integrationConfigs.integrationId,
    configKey: integrationConfigs.configKey,
    configValue: integrationConfigs.configValue,
    valueType: integrationConfigs.valueType,
    isEncrypted: integrationConfigs.isEncrypted,
  }).from(integrationConfigs)
    .where(eq(integrationConfigs.integrationId, integrationId))
    .orderBy(asc(integrationConfigs.configKey));
}

export async function setIntegrationConfig(integrationId: number, key: string, value: string, options?: { isEncrypted?: boolean; valueType?: 'string' | 'number' | 'boolean' | 'json' }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select({
    id: integrationConfigs.id,
  }).from(integrationConfigs)
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

  return await db.select({
    id: integrationLogs.id,
    integrationId: integrationLogs.integrationId,
    action: integrationLogs.action,
    status: integrationLogs.status,
    responseCode: integrationLogs.responseCode,
    createdAt: integrationLogs.createdAt,
  }).from(integrationLogs)
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

  return await db.select({
    id: systemEvents.id,
    businessId: systemEvents.businessId,
    eventType: systemEvents.eventType,
    status: systemEvents.status,
    createdAt: systemEvents.createdAt,
  }).from(systemEvents)
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

  return await db.select({
    id: eventSubscriptions.id,
    businessId: eventSubscriptions.businessId,
    eventType: eventSubscriptions.eventType,
    subscriberType: eventSubscriptions.subscriberType,
    isActive: eventSubscriptions.isActive,
    priority: eventSubscriptions.priority,
  }).from(eventSubscriptions)
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

  const result = await db.select({
    id: apiKeys.id,
    businessId: apiKeys.businessId,
    keyHash: apiKeys.keyHash,
    permissions: apiKeys.permissions,
    rateLimitPerMinute: apiKeys.rateLimitPerMinute,
    rateLimitPerDay: apiKeys.rateLimitPerDay,
    expiresAt: apiKeys.expiresAt,
    isActive: apiKeys.isActive,
  }).from(apiKeys)
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

  return await db.select({
    id: apiLogs.id,
    apiKeyId: apiLogs.apiKeyId,
    method: apiLogs.method,
    endpoint: apiLogs.endpoint,
    statusCode: apiLogs.statusCode,
    createdAt: apiLogs.createdAt,
  }).from(apiLogs)
    .where(and(...conditions))
    .orderBy(desc(apiLogs.createdAt))
    .limit(filters?.limit || 100);
}
