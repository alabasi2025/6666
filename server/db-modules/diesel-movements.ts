// حركات الديزل - Tank Movements
// ============================================

export async function getDieselTankMovements(filters?: {
  businessId?: number;
  stationId?: number;
  tankId?: number;
  movementType?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.businessId) conditions.push(eq(dieselTankMovements.businessId, filters.businessId));
  if (filters?.stationId) conditions.push(eq(dieselTankMovements.stationId, filters.stationId));
  if (filters?.tankId) {
    conditions.push(
      or(
        eq(dieselTankMovements.fromTankId, filters.tankId),
        eq(dieselTankMovements.toTankId, filters.tankId)
      )
    );
  }
  if (filters?.movementType) conditions.push(eq(dieselTankMovements.movementType, filters.movementType as any));
  if (filters?.fromDate) conditions.push(gte(dieselTankMovements.movementDate, new Date(filters.fromDate)));
  if (filters?.toDate) conditions.push(lte(dieselTankMovements.movementDate, new Date(filters.toDate)));
  
  return await db.select({
    id: dieselTankMovements.id,
    businessId: dieselTankMovements.businessId,
    stationId: dieselTankMovements.stationId,
    fromTankId: dieselTankMovements.fromTankId,
    toTankId: dieselTankMovements.toTankId,
    movementType: dieselTankMovements.movementType,
    quantity: dieselTankMovements.quantity,
    movementDate: dieselTankMovements.movementDate,
    createdAt: dieselTankMovements.createdAt,
  }).from(dieselTankMovements)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dieselTankMovements.createdAt));
}

export async function createDieselTankMovement(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(dieselTankMovements).values({
    ...data,
    movementDate: new Date(data.movementDate),
  });
  
  // تحديث مستويات الخزانات
  if (data.fromTankId) {
    const fromTank = await getDieselTankById(data.fromTankId);
    if (fromTank) {
      const newLevel = parseFloat(fromTank.currentLevel || "0") - data.quantity;
      await updateDieselTankLevel(data.fromTankId, Math.max(0, newLevel));
    }
  }
  
  if (data.toTankId) {
    const toTank = await getDieselTankById(data.toTankId);
    if (toTank) {
      const newLevel = parseFloat(toTank.currentLevel || "0") + data.quantity;
      await updateDieselTankLevel(data.toTankId, newLevel);
    }
  }
  
  return result.insertId;
}

// ============================================
// استهلاك المولدات - Generator Consumption
// ============================================

export async function getGeneratorDieselConsumption(filters?: {
  businessId?: number;
  stationId?: number;
  generatorId?: number;
  fromDate?: string;
  toDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.businessId) conditions.push(eq(generatorDieselConsumption.businessId, filters.businessId));
  if (filters?.stationId) conditions.push(eq(generatorDieselConsumption.stationId, filters.stationId));
  if (filters?.generatorId) conditions.push(eq(generatorDieselConsumption.generatorId, filters.generatorId));
  if (filters?.fromDate) conditions.push(gte(generatorDieselConsumption.consumptionDate, new Date(filters.fromDate)));
  if (filters?.toDate) conditions.push(lte(generatorDieselConsumption.consumptionDate, new Date(filters.toDate)));
  
  return await db.select({
    id: generatorDieselConsumption.id,
    businessId: generatorDieselConsumption.businessId,
    stationId: generatorDieselConsumption.stationId,
    generatorId: generatorDieselConsumption.generatorId,
    consumptionDate: generatorDieselConsumption.consumptionDate,
    quantityConsumed: generatorDieselConsumption.quantityConsumed,
    runningHours: generatorDieselConsumption.runningHours,
    consumptionRate: generatorDieselConsumption.consumptionRate,
    createdAt: generatorDieselConsumption.createdAt,
  }).from(generatorDieselConsumption)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(generatorDieselConsumption.createdAt));
}

export async function createGeneratorDieselConsumption(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(generatorDieselConsumption).values({
    ...data,
    consumptionDate: new Date(data.consumptionDate),
  });
  return result.insertId;
}

export async function getGeneratorConsumptionStatistics(filters: {
  businessId?: number;
  stationId?: number;
  generatorId?: number;
  fromDate: string;
  toDate: string;
}) {
  const db = await getDb();
  if (!db) return { totalConsumed: 0, totalHours: 0, avgRate: 0 };
  
  const conditions = [];
  if (filters.businessId) conditions.push(eq(generatorDieselConsumption.businessId, filters.businessId));
  if (filters.stationId) conditions.push(eq(generatorDieselConsumption.stationId, filters.stationId));
  if (filters.generatorId) conditions.push(eq(generatorDieselConsumption.generatorId, filters.generatorId));
  conditions.push(gte(generatorDieselConsumption.consumptionDate, new Date(filters.fromDate)));
  conditions.push(lte(generatorDieselConsumption.consumptionDate, new Date(filters.toDate)));
  
  const [stats] = await db.select({
    totalConsumed: sql<number>`COALESCE(SUM(quantity_consumed), 0)`,
    totalHours: sql<number>`COALESCE(SUM(running_hours), 0)`,
    avgRate: sql<number>`COALESCE(AVG(consumption_rate), 0)`,
  }).from(generatorDieselConsumption)
    .where(and(...conditions));
  
  return stats || { totalConsumed: 0, totalHours: 0, avgRate: 0 };
}

// ============================================
