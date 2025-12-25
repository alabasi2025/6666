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

  return await db.select({
    id: aiModels.id,
    businessId: aiModels.businessId,
    nameAr: aiModels.nameAr,
    modelType: aiModels.modelType,
    status: aiModels.status,
    isActive: aiModels.isActive,
    createdAt: aiModels.createdAt,
  }).from(aiModels)
    .where(and(...conditions))
    .orderBy(asc(aiModels.nameAr));
}

export async function getAiModelById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: aiModels.id,
    businessId: aiModels.businessId,
    nameAr: aiModels.nameAr,
    description: aiModels.description,
    modelType: aiModels.modelType,
    status: aiModels.status,
    isActive: aiModels.isActive,
    configuration: aiModels.configuration,
    lastTrainedAt: aiModels.lastTrainedAt,
    accuracy: aiModels.accuracy,
    createdAt: aiModels.createdAt,
    updatedAt: aiModels.updatedAt,
  }).from(aiModels).where(eq(aiModels.id, id)).limit(1);
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

  return await db.select({
    id: aiPredictions.id,
    modelId: aiPredictions.modelId,
    predictionType: aiPredictions.predictionType,
    confidence: aiPredictions.confidence,
    status: aiPredictions.status,
    createdAt: aiPredictions.createdAt,
  }).from(aiPredictions)
    .where(and(...conditions))
    .orderBy(desc(aiPredictions.createdAt))
    .limit(filters?.limit || 100);
}

export async function verifyPrediction(id: number, actualValue: any, verifiedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const prediction = await db.select({
    id: aiPredictions.id,
    predictionType: aiPredictions.predictionType,
    prediction: aiPredictions.prediction,
  }).from(aiPredictions).where(eq(aiPredictions.id, id)).limit(1);
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

  return await db.select({
    id: technicalAlertRules.id,
    businessId: technicalAlertRules.businessId,
    nameAr: technicalAlertRules.nameAr,
    ruleType: technicalAlertRules.ruleType,
    severity: technicalAlertRules.severity,
    isActive: technicalAlertRules.isActive,
  }).from(technicalAlertRules)
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

  return await db.select({
    id: technicalAlerts.id,
    ruleId: technicalAlerts.ruleId,
    businessId: technicalAlerts.businessId,
    severity: technicalAlerts.severity,
    status: technicalAlerts.status,
    triggeredAt: technicalAlerts.triggeredAt,
  }).from(technicalAlerts)
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

  return await db.select({
    id: performanceMetrics.id,
    businessId: performanceMetrics.businessId,
    metricType: performanceMetrics.metricType,
    value: performanceMetrics.value,
    unit: performanceMetrics.unit,
    recordedAt: performanceMetrics.recordedAt,
  }).from(performanceMetrics)
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

  return await db.select({
    id: incomingWebhooks.id,
    businessId: incomingWebhooks.businessId,
    name: incomingWebhooks.name,
    isActive: incomingWebhooks.isActive,
    lastCalledAt: incomingWebhooks.lastCalledAt,
  }).from(incomingWebhooks)
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

