// ============================================
// مهام استلام الديزل - Diesel Receiving Tasks
// ============================================

export async function getDieselReceivingTasks(filters?: {
  businessId?: number;
  stationId?: number;
  employeeId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.businessId) conditions.push(eq(dieselReceivingTasks.businessId, filters.businessId));
  if (filters?.stationId) conditions.push(eq(dieselReceivingTasks.stationId, filters.stationId));
  if (filters?.employeeId) conditions.push(eq(dieselReceivingTasks.employeeId, filters.employeeId));
  if (filters?.status) conditions.push(eq(dieselReceivingTasks.status, filters.status as any));
  if (filters?.fromDate) conditions.push(gte(dieselReceivingTasks.taskDate, new Date(filters.fromDate)));
  if (filters?.toDate) conditions.push(lte(dieselReceivingTasks.taskDate, new Date(filters.toDate)));
  
  return await db.select({
    id: dieselReceivingTasks.id,
    businessId: dieselReceivingTasks.businessId,
    stationId: dieselReceivingTasks.stationId,
    taskNumber: dieselReceivingTasks.taskNumber,
    taskDate: dieselReceivingTasks.taskDate,
    employeeId: dieselReceivingTasks.employeeId,
    status: dieselReceivingTasks.status,
    createdAt: dieselReceivingTasks.createdAt,
  }).from(dieselReceivingTasks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dieselReceivingTasks.createdAt));
}

export async function getDieselReceivingTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select({
    id: dieselReceivingTasks.id,
    businessId: dieselReceivingTasks.businessId,
    stationId: dieselReceivingTasks.stationId,
    taskNumber: dieselReceivingTasks.taskNumber,
    taskDate: dieselReceivingTasks.taskDate,
    employeeId: dieselReceivingTasks.employeeId,
    tankerId: dieselReceivingTasks.tankerId,
    expectedQuantity: dieselReceivingTasks.expectedQuantity,
    actualQuantity: dieselReceivingTasks.actualQuantity,
    status: dieselReceivingTasks.status,
    notes: dieselReceivingTasks.notes,
    createdAt: dieselReceivingTasks.createdAt,
  }).from(dieselReceivingTasks).where(eq(dieselReceivingTasks.id, id));
  return result || null;
}

export async function createDieselReceivingTask(data: any) {
  const db = await getDb();
  if (!db) return;
  
  // توليد رقم المهمة
  const taskNumber = `DRT-${Date.now()}`;
  
  const [result] = await db.insert(dieselReceivingTasks).values({
    ...data,
    taskNumber,
    taskDate: new Date(data.taskDate),
    status: "pending",
  });
  return result.insertId;
}

export async function updateDieselReceivingTaskStatus(id: number, status: string, additionalData?: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status, ...additionalData };
  
  await db.update(dieselReceivingTasks).set(updateData).where(eq(dieselReceivingTasks.id, id));
}

export async function updateDieselReceivingTask(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.taskDate) updateData.taskDate = new Date(data.taskDate);
  
  await db.update(dieselReceivingTasks).set(updateData).where(eq(dieselReceivingTasks.id, id));
}

export async function deleteDieselReceivingTask(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(dieselReceivingTasks).where(eq(dieselReceivingTasks.id, id));
}

// ============================================
// قراءات الطرمبات - Pump Readings
// ============================================

export async function getDieselPumpReadings(filters?: {
  businessId?: number;
  pumpMeterId?: number;
  taskId?: number;
  fromDate?: string;
  toDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.businessId) conditions.push(eq(dieselPumpReadings.businessId, filters.businessId));
  if (filters?.pumpMeterId) conditions.push(eq(dieselPumpReadings.pumpMeterId, filters.pumpMeterId));
  if (filters?.taskId) conditions.push(eq(dieselPumpReadings.taskId, filters.taskId));
  if (filters?.fromDate) conditions.push(gte(dieselPumpReadings.readingDate, new Date(filters.fromDate)));
  if (filters?.toDate) conditions.push(lte(dieselPumpReadings.readingDate, new Date(filters.toDate)));
  
  return await db.select({
    id: dieselPumpReadings.id,
    businessId: dieselPumpReadings.businessId,
    pumpMeterId: dieselPumpReadings.pumpMeterId,
    taskId: dieselPumpReadings.taskId,
    readingDate: dieselPumpReadings.readingDate,
    readingType: dieselPumpReadings.readingType,
    readingValue: dieselPumpReadings.readingValue,
    createdAt: dieselPumpReadings.createdAt,
  }).from(dieselPumpReadings)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dieselPumpReadings.createdAt));
}

export async function createDieselPumpReading(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(dieselPumpReadings).values({
    ...data,
    readingDate: new Date(data.readingDate),
  });
  
  // تحديث القراءة الحالية للطرمبة
  if (data.readingType === "after") {
    await db.update(dieselPumpMeters)
      .set({ currentReading: data.readingValue.toString() })
      .where(eq(dieselPumpMeters.id, data.pumpMeterId));
  }
  
  return result.insertId;
}

// ============================================
