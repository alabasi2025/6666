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

  return await db.select({
    id: fieldOperations.id,
    businessId: fieldOperations.businessId,
    operationNumber: fieldOperations.operationNumber,
    operationType: fieldOperations.operationType,
    title: fieldOperations.title,
    description: fieldOperations.description,
    address: fieldOperations.address,
    status: fieldOperations.status,
    priority: fieldOperations.priority,
    scheduledDate: fieldOperations.scheduledDate,
    assignedTeamId: fieldOperations.assignedTeamId,
    assignedWorkerId: fieldOperations.assignedWorkerId,
  }).from(fieldOperations)
    .where(and(...conditions))
    .orderBy(desc(fieldOperations.createdAt));
}

export async function getFieldOperationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: fieldOperations.id,
    businessId: fieldOperations.businessId,
    branchId: fieldOperations.branchId,
    stationId: fieldOperations.stationId,
    operationNumber: fieldOperations.operationNumber,
    operationType: fieldOperations.operationType,
    status: fieldOperations.status,
    priority: fieldOperations.priority,
    description: fieldOperations.description,
    customerId: fieldOperations.customerId,
    meterId: fieldOperations.meterId,
    scheduledDate: fieldOperations.scheduledDate,
    scheduledTime: fieldOperations.scheduledTime,
    actualDate: fieldOperations.actualDate,
    actualTime: fieldOperations.actualTime,
    assignedTeamId: fieldOperations.assignedTeamId,
    assignedWorkerId: fieldOperations.assignedWorkerId,
    notes: fieldOperations.notes,
    completionNotes: fieldOperations.completionNotes,
    startedAt: fieldOperations.startedAt,
    completedAt: fieldOperations.completedAt,
    actualDuration: fieldOperations.actualDuration,
    createdBy: fieldOperations.createdBy,
    createdAt: fieldOperations.createdAt,
    updatedAt: fieldOperations.updatedAt,
  }).from(fieldOperations).where(eq(fieldOperations.id, id));
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

