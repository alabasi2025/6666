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

  return await db.select({
    id: workOrders.id,
    businessId: workOrders.businessId,
    branchId: workOrders.branchId,
    stationId: workOrders.stationId,
    orderNumber: workOrders.orderNumber,
    type: workOrders.type,
    priority: workOrders.priority,
    status: workOrders.status,
    assetId: workOrders.assetId,
    title: workOrders.title,
    scheduledStart: workOrders.scheduledStart,
    scheduledEnd: workOrders.scheduledEnd,
    assignedTo: workOrders.assignedTo,
    createdAt: workOrders.createdAt,
  }).from(workOrders).where(and(...conditions)).orderBy(desc(workOrders.createdAt));
}

export async function getWorkOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: workOrders.id,
    businessId: workOrders.businessId,
    branchId: workOrders.branchId,
    stationId: workOrders.stationId,
    orderNumber: workOrders.orderNumber,
    type: workOrders.type,
    priority: workOrders.priority,
    status: workOrders.status,
    assetId: workOrders.assetId,
    equipmentId: workOrders.equipmentId,
    title: workOrders.title,
    description: workOrders.description,
    requestedBy: workOrders.requestedBy,
    requestedDate: workOrders.requestedDate,
    scheduledStart: workOrders.scheduledStart,
    scheduledEnd: workOrders.scheduledEnd,
    actualStart: workOrders.actualStart,
    actualEnd: workOrders.actualEnd,
    assignedTo: workOrders.assignedTo,
    teamId: workOrders.teamId,
    estimatedHours: workOrders.estimatedHours,
    actualHours: workOrders.actualHours,
    estimatedCost: workOrders.estimatedCost,
    actualCost: workOrders.actualCost,
    laborCost: workOrders.laborCost,
    partsCost: workOrders.partsCost,
    completionNotes: workOrders.completionNotes,
    failureCode: workOrders.failureCode,
    rootCause: workOrders.rootCause,
    approvedBy: workOrders.approvedBy,
    approvedAt: workOrders.approvedAt,
    closedBy: workOrders.closedBy,
    closedAt: workOrders.closedAt,
    createdBy: workOrders.createdBy,
    createdAt: workOrders.createdAt,
    updatedAt: workOrders.updatedAt,
  }).from(workOrders).where(eq(workOrders.id, id)).limit(1);
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
