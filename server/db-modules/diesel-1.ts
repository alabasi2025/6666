// ============================================
// نظام استهلاك الديزل - Diesel Consumption System
// ============================================



// ============================================
// موردي الديزل - Diesel Suppliers
// ============================================

export async function getDieselSuppliers(businessId?: number, isActive?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (businessId) conditions.push(eq(dieselSuppliers.businessId, businessId));
  if (isActive !== undefined) conditions.push(eq(dieselSuppliers.isActive, isActive));
  
  return await db.select({
    id: dieselSuppliers.id,
    businessId: dieselSuppliers.businessId,
    code: dieselSuppliers.code,
    nameAr: dieselSuppliers.nameAr,
    nameEn: dieselSuppliers.nameEn,
    phone: dieselSuppliers.phone,
    email: dieselSuppliers.email,
    isActive: dieselSuppliers.isActive,
    createdAt: dieselSuppliers.createdAt,
  }).from(dieselSuppliers)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dieselSuppliers.createdAt));
}

export async function getDieselSupplierById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select({
    id: dieselSuppliers.id,
    businessId: dieselSuppliers.businessId,
    code: dieselSuppliers.code,
    nameAr: dieselSuppliers.nameAr,
    nameEn: dieselSuppliers.nameEn,
    phone: dieselSuppliers.phone,
    email: dieselSuppliers.email,
    address: dieselSuppliers.address,
    taxNumber: dieselSuppliers.taxNumber,
    isActive: dieselSuppliers.isActive,
    createdAt: dieselSuppliers.createdAt,
  }).from(dieselSuppliers).where(eq(dieselSuppliers.id, id));
  return result || null;
}

export async function createDieselSupplier(data: InsertDieselSupplier) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(dieselSuppliers).values(data);
  return result.insertId;
}

export async function updateDieselSupplier(id: number, data: Partial<InsertDieselSupplier>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(dieselSuppliers).set(data).where(eq(dieselSuppliers.id, id));
}

export async function deleteDieselSupplier(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(dieselSuppliers).where(eq(dieselSuppliers.id, id));
}

// ============================================
// الوايتات - Diesel Tankers
// ============================================

export async function getDieselTankers(businessId?: number, isActive?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (businessId) conditions.push(eq(dieselTankers.businessId, businessId));
  if (isActive !== undefined) conditions.push(eq(dieselTankers.isActive, isActive));
  
  return await db.select({
    id: dieselTankers.id,
    businessId: dieselTankers.businessId,
    supplierId: dieselTankers.supplierId,
    code: dieselTankers.code,
    plateNumber: dieselTankers.plateNumber,
    capacity: dieselTankers.capacity,
    driverName: dieselTankers.driverName,
    driverPhone: dieselTankers.driverPhone,
    isActive: dieselTankers.isActive,
    createdAt: dieselTankers.createdAt,
  }).from(dieselTankers)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dieselTankers.createdAt));
}

export async function getDieselTankerById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select({
    id: dieselTankers.id,
    businessId: dieselTankers.businessId,
    supplierId: dieselTankers.supplierId,
    code: dieselTankers.code,
    plateNumber: dieselTankers.plateNumber,
    capacity: dieselTankers.capacity,
    driverName: dieselTankers.driverName,
    driverPhone: dieselTankers.driverPhone,
    isActive: dieselTankers.isActive,
    createdAt: dieselTankers.createdAt,
  }).from(dieselTankers).where(eq(dieselTankers.id, id));
  return result || null;
}

export async function createDieselTanker(data: InsertDieselTanker) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(dieselTankers).values(data);
  return result.insertId;
}

export async function updateDieselTanker(id: number, data: Partial<InsertDieselTanker>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(dieselTankers).set(data).where(eq(dieselTankers.id, id));
}

export async function deleteDieselTanker(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(dieselTankers).where(eq(dieselTankers.id, id));
}

// ============================================
// خزانات المحطة - Diesel Tanks
// ============================================

export async function getDieselTanks(businessId?: number, stationId?: number, type?: string, isActive?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (businessId) conditions.push(eq(dieselTanks.businessId, businessId));
  if (stationId) conditions.push(eq(dieselTanks.stationId, stationId));
  if (type) conditions.push(eq(dieselTanks.type, type as any));
  if (isActive !== undefined) conditions.push(eq(dieselTanks.isActive, isActive));
  
  return await db.select({
    id: dieselTanks.id,
    businessId: dieselTanks.businessId,
    stationId: dieselTanks.stationId,
    code: dieselTanks.code,
    nameAr: dieselTanks.nameAr,
    type: dieselTanks.type,
    capacity: dieselTanks.capacity,
    currentLevel: dieselTanks.currentLevel,
    isActive: dieselTanks.isActive,
    createdAt: dieselTanks.createdAt,
  }).from(dieselTanks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dieselTanks.createdAt));
}

export async function getDieselTankById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select({
    id: dieselTanks.id,
    businessId: dieselTanks.businessId,
    stationId: dieselTanks.stationId,
    code: dieselTanks.code,
    nameAr: dieselTanks.nameAr,
    nameEn: dieselTanks.nameEn,
    type: dieselTanks.type,
    capacity: dieselTanks.capacity,
    currentLevel: dieselTanks.currentLevel,
    minLevel: dieselTanks.minLevel,
    maxLevel: dieselTanks.maxLevel,
    isActive: dieselTanks.isActive,
    createdAt: dieselTanks.createdAt,
  }).from(dieselTanks).where(eq(dieselTanks.id, id));
  return result || null;
}

export async function createDieselTank(data: InsertDieselTank) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(dieselTanks).values(data);
  return result.insertId;
}

export async function updateDieselTank(id: number, data: Partial<InsertDieselTank>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(dieselTanks).set(data).where(eq(dieselTanks.id, id));
}

export async function deleteDieselTank(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(dieselTanks).where(eq(dieselTanks.id, id));
}

export async function updateDieselTankLevel(id: number, newLevel: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(dieselTanks).set({ currentLevel: newLevel.toString() }).where(eq(dieselTanks.id, id));
}

// ============================================
// طرمبات العدادات - Pump Meters
// ============================================

export async function getDieselPumpMeters(businessId?: number, stationId?: number, supplierId?: number, type?: string, isActive?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (businessId) conditions.push(eq(dieselPumpMeters.businessId, businessId));
  if (stationId) conditions.push(eq(dieselPumpMeters.stationId, stationId));
  if (supplierId) conditions.push(eq(dieselPumpMeters.supplierId, supplierId));
  if (type) conditions.push(eq(dieselPumpMeters.type, type as any));
  if (isActive !== undefined) conditions.push(eq(dieselPumpMeters.isActive, isActive));
  
  return await db.select({
    id: dieselPumpMeters.id,
    businessId: dieselPumpMeters.businessId,
    stationId: dieselPumpMeters.stationId,
    supplierId: dieselPumpMeters.supplierId,
    code: dieselPumpMeters.code,
    nameAr: dieselPumpMeters.nameAr,
    type: dieselPumpMeters.type,
    currentReading: dieselPumpMeters.currentReading,
    isActive: dieselPumpMeters.isActive,
    createdAt: dieselPumpMeters.createdAt,
  }).from(dieselPumpMeters)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dieselPumpMeters.createdAt));
}

export async function getDieselPumpMeterById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select({
    id: dieselPumpMeters.id,
    businessId: dieselPumpMeters.businessId,
    stationId: dieselPumpMeters.stationId,
    supplierId: dieselPumpMeters.supplierId,
    code: dieselPumpMeters.code,
    nameAr: dieselPumpMeters.nameAr,
    nameEn: dieselPumpMeters.nameEn,
    type: dieselPumpMeters.type,
    currentReading: dieselPumpMeters.currentReading,
    lastReadingDate: dieselPumpMeters.lastReadingDate,
    isActive: dieselPumpMeters.isActive,
    createdAt: dieselPumpMeters.createdAt,
  }).from(dieselPumpMeters).where(eq(dieselPumpMeters.id, id));
  return result || null;
}

export async function createDieselPumpMeter(data: InsertDieselPumpMeter) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(dieselPumpMeters).values(data);
  return result.insertId;
}

export async function updateDieselPumpMeter(id: number, data: Partial<InsertDieselPumpMeter>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(dieselPumpMeters).set(data).where(eq(dieselPumpMeters.id, id));
}

export async function deleteDieselPumpMeter(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(dieselPumpMeters).where(eq(dieselPumpMeters.id, id));
}
