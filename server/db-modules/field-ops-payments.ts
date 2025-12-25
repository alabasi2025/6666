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

  return await db.select({
    id: operationPayments.id,
    businessId: operationPayments.businessId,
    operationId: operationPayments.operationId,
    amount: operationPayments.amount,
    paymentMethod: operationPayments.paymentMethod,
    status: operationPayments.status,
    paymentDate: operationPayments.paymentDate,
  }).from(operationPayments)
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

  return await db.select({
    id: periodSettlements.id,
    businessId: periodSettlements.businessId,
    settlementNumber: periodSettlements.settlementNumber,
    periodStart: periodSettlements.periodStart,
    periodEnd: periodSettlements.periodEnd,
    status: periodSettlements.status,
    totalAmount: periodSettlements.totalAmount,
  }).from(periodSettlements)
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

  const result = await db.select({
    id: installationDetails.id,
    operationId: installationDetails.operationId,
    meterType: installationDetails.meterType,
    meterNumber: installationDetails.meterNumber,
    installationDate: installationDetails.installationDate,
  }).from(installationDetails).where(eq(installationDetails.operationId, operationId));
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

  return await db.select({
    id: installationPhotos.id,
    operationId: installationPhotos.operationId,
    photoType: installationPhotos.photoType,
    photoUrl: installationPhotos.photoUrl,
    createdAt: installationPhotos.createdAt,
  }).from(installationPhotos)
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

  return await db.select({
    id: workerPerformance.id,
    workerId: workerPerformance.workerId,
    periodStart: workerPerformance.periodStart,
    periodEnd: workerPerformance.periodEnd,
    totalOperations: workerPerformance.totalOperations,
    completedOperations: workerPerformance.completedOperations,
    avgRating: workerPerformance.avgRating,
    performanceScore: workerPerformance.performanceScore,
  }).from(workerPerformance)
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

  return await db.select({
    id: workerIncentives.id,
    businessId: workerIncentives.businessId,
    workerId: workerIncentives.workerId,
    incentiveType: workerIncentives.incentiveType,
    amount: workerIncentives.amount,
    status: workerIncentives.status,
    createdAt: workerIncentives.createdAt,
  }).from(workerIncentives)
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

  return await db.select({
    id: inspectionChecklists.id,
    businessId: inspectionChecklists.businessId,
    nameAr: inspectionChecklists.nameAr,
    nameEn: inspectionChecklists.nameEn,
    operationType: inspectionChecklists.operationType,
    isActive: inspectionChecklists.isActive,
  }).from(inspectionChecklists)
    .where(and(...conditions))
    .orderBy(asc(inspectionChecklists.nameAr));
}

