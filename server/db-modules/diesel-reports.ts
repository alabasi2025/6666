// التقارير - Reports
// ============================================

export async function getDieselConsumptionSummary(filters: {
  businessId?: number;
  stationId?: number;
  fromDate: string;
  toDate: string;
}) {
  const db = await getDb();
  if (!db) return { totalReceived: 0, totalConsumed: 0, currentStock: 0 };
  
  // إجمالي المستلم
  const receivedConditions = [];
  if (filters.businessId) receivedConditions.push(eq(dieselReceivingTasks.businessId, filters.businessId));
  if (filters.stationId) receivedConditions.push(eq(dieselReceivingTasks.stationId, filters.stationId));
  receivedConditions.push(eq(dieselReceivingTasks.status, "completed"));
  receivedConditions.push(gte(dieselReceivingTasks.taskDate, new Date(filters.fromDate)));
  receivedConditions.push(lte(dieselReceivingTasks.taskDate, new Date(filters.toDate)));
  
  const [received] = await db.select({
    total: sql<number>`COALESCE(SUM(quantity_received_at_station), 0)`,
  }).from(dieselReceivingTasks)
    .where(and(...receivedConditions));
  
  // إجمالي المستهلك
  const consumedConditions = [];
  if (filters.businessId) consumedConditions.push(eq(generatorDieselConsumption.businessId, filters.businessId));
  if (filters.stationId) consumedConditions.push(eq(generatorDieselConsumption.stationId, filters.stationId));
  consumedConditions.push(gte(generatorDieselConsumption.consumptionDate, new Date(filters.fromDate)));
  consumedConditions.push(lte(generatorDieselConsumption.consumptionDate, new Date(filters.toDate)));
  
  const [consumed] = await db.select({
    total: sql<number>`COALESCE(SUM(quantity_consumed), 0)`,
  }).from(generatorDieselConsumption)
    .where(and(...consumedConditions));
  
  // المخزون الحالي
  const tankConditions = [];
  if (filters.businessId) tankConditions.push(eq(dieselTanks.businessId, filters.businessId));
  if (filters.stationId) tankConditions.push(eq(dieselTanks.stationId, filters.stationId));
  
  const [stock] = await db.select({
    total: sql<number>`COALESCE(SUM(current_level), 0)`,
  }).from(dieselTanks)
    .where(tankConditions.length > 0 ? and(...tankConditions) : undefined);
  
  return {
    totalReceived: received?.total || 0,
    totalConsumed: consumed?.total || 0,
    currentStock: stock?.total || 0,
  };
}

export async function getDieselReceivingTasksReport(filters: {
  businessId?: number;
  stationId?: number;
  supplierId?: number;
  fromDate: string;
  toDate: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters.businessId) conditions.push(eq(dieselReceivingTasks.businessId, filters.businessId));
  if (filters.stationId) conditions.push(eq(dieselReceivingTasks.stationId, filters.stationId));
  if (filters.supplierId) conditions.push(eq(dieselReceivingTasks.supplierId, filters.supplierId));
  conditions.push(gte(dieselReceivingTasks.taskDate, new Date(filters.fromDate)));
  conditions.push(lte(dieselReceivingTasks.taskDate, new Date(filters.toDate)));
  
  return await db.select({
    id: dieselReceivingTasks.id,
    businessId: dieselReceivingTasks.businessId,
    stationId: dieselReceivingTasks.stationId,
    taskNumber: dieselReceivingTasks.taskNumber,
    taskDate: dieselReceivingTasks.taskDate,
    supplierId: dieselReceivingTasks.supplierId,
    tankerId: dieselReceivingTasks.tankerId,
    expectedQuantity: dieselReceivingTasks.expectedQuantity,
    actualQuantity: dieselReceivingTasks.actualQuantity,
    quantityReceivedAtStation: dieselReceivingTasks.quantityReceivedAtStation,
    status: dieselReceivingTasks.status,
  }).from(dieselReceivingTasks)
    .where(and(...conditions))
    .orderBy(desc(dieselReceivingTasks.taskDate));
}

export async function getDieselTankLevelsReport(businessId?: number, stationId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (businessId) conditions.push(eq(dieselTanks.businessId, businessId));
  if (stationId) conditions.push(eq(dieselTanks.stationId, stationId));
  conditions.push(eq(dieselTanks.isActive, true));
  
  return await db.select({
    id: dieselTanks.id,
    businessId: dieselTanks.businessId,
    stationId: dieselTanks.stationId,
    code: dieselTanks.code,
    nameAr: dieselTanks.nameAr,
    type: dieselTanks.type,
    capacity: dieselTanks.capacity,
    currentLevel: dieselTanks.currentLevel,
    minLevel: dieselTanks.minLevel,
    maxLevel: dieselTanks.maxLevel,
  }).from(dieselTanks)
    .where(and(...conditions))
    .orderBy(dieselTanks.type, dieselTanks.nameAr);
}


// ============================================
// أصول الديزل - Diesel Assets (Pipes, Tank Openings)
// ============================================

// المواصير
export async function getDieselPipes(businessId?: number, stationId?: number, isActive?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (businessId) conditions.push(eq(dieselPipes.businessId, businessId));
  if (stationId) conditions.push(eq(dieselPipes.stationId, stationId));
  if (isActive !== undefined) conditions.push(eq(dieselPipes.status, isActive ? "active" : "inactive"));
  
  return await db.select({
    id: dieselPipes.id,
    businessId: dieselPipes.businessId,
    stationId: dieselPipes.stationId,
    code: dieselPipes.code,
    nameAr: dieselPipes.nameAr,
    nameEn: dieselPipes.nameEn,
    fromTankId: dieselPipes.fromTankId,
    toTankId: dieselPipes.toTankId,
    status: dieselPipes.status,
  }).from(dieselPipes)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(dieselPipes.nameAr);
}

export async function createDieselPipe(data: InsertDieselPipe) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dieselPipes).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateDieselPipe(id: number, data: Partial<InsertDieselPipe>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dieselPipes).set(data).where(eq(dieselPipes.id, id));
  return { id, ...data };
}

export async function deleteDieselPipe(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(dieselPipes).where(eq(dieselPipes.id, id));
  return { success: true };
}

// فتحات الخزانات
export async function getDieselTankOpenings(tankId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: dieselTankOpenings.id,
    tankId: dieselTankOpenings.tankId,
    openingNumber: dieselTankOpenings.openingNumber,
    openingType: dieselTankOpenings.openingType,
    diameter: dieselTankOpenings.diameter,
    status: dieselTankOpenings.status,
  }).from(dieselTankOpenings)
    .where(eq(dieselTankOpenings.tankId, tankId))
    .orderBy(dieselTankOpenings.openingNumber);
}

export async function createDieselTankOpening(data: InsertDieselTankOpening) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dieselTankOpenings).values(data);
  return { id: result[0].insertId, ...data };
}

export async function deleteDieselTankOpening(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(dieselTankOpenings).where(eq(dieselTankOpenings.id, id));
  return { success: true };
}

// ============================================
// تهيئة مخطط الديزل للمحطة - Station Diesel Configuration
// ============================================

export async function getStationDieselConfig(stationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({
    id: stationDieselConfig.id,
    stationId: stationDieselConfig.stationId,
    businessId: stationDieselConfig.businessId,
    config: stationDieselConfig.config,
    createdAt: stationDieselConfig.createdAt,
    updatedAt: stationDieselConfig.updatedAt,
  }).from(stationDieselConfig)
    .where(eq(stationDieselConfig.stationId, stationId))
    .limit(1);
  
  if (result.length === 0) return null;
  
  return {
    ...result[0],
    config: result[0].config ? JSON.parse(result[0].config as string) : {},
  };
}

export async function saveStationDieselConfig(data: {
  stationId: number;
  businessId: number;
  config: string;
  updatedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if config exists
  const existing = await db.select({
    id: stationDieselConfig.id,
  }).from(stationDieselConfig)
    .where(eq(stationDieselConfig.stationId, data.stationId))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    await db.update(stationDieselConfig)
      .set({
        config: data.config,
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(stationDieselConfig.stationId, data.stationId));
    return { id: existing[0].id, ...data };
  } else {
    // Create new
    const result = await db.insert(stationDieselConfig).values({
      stationId: data.stationId,
      businessId: data.businessId,
      config: data.config,
      createdBy: data.updatedBy,
    });
    return { id: result[0].insertId, ...data };
  }
}
