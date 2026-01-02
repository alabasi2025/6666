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

  return await db.select({
    id: fieldEquipment.id,
    businessId: fieldEquipment.businessId,
    code: fieldEquipment.code,
    nameAr: fieldEquipment.nameAr,
    equipmentType: fieldEquipment.equipmentType,
    status: fieldEquipment.status,
    currentHolderId: fieldEquipment.currentHolderId,
  }).from(fieldEquipment)
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

  return await db.select({
    id: inspections.id,
    businessId: inspections.businessId,
    inspectionNumber: inspections.inspectionNumber,
    inspectionType: inspections.inspectionType,
    status: inspections.status,
    scheduledDate: inspections.scheduledDate,
    inspectorId: inspections.inspectorId,
  }).from(inspections)
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

  return await db.select({
    id: materialRequests.id,
    businessId: materialRequests.businessId,
    requestNumber: materialRequests.requestNumber,
    status: materialRequests.status,
    requestedBy: materialRequests.requestedBy,
    requestDate: materialRequests.requestDate,
  }).from(materialRequests)
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

