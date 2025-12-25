// ============================================
// Equipment & SCADA
// ============================================

export async function createEquipment(data: InsertEquipment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(equipment).values(data);
  return result[0].insertId;
}

export async function getEquipment(businessId: number, stationId?: number) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(equipment.businessId, businessId)];
  if (stationId) conditions.push(eq(equipment.stationId, stationId));

  return await db.select({
    id: equipment.id,
    businessId: equipment.businessId,
    stationId: equipment.stationId,
    code: equipment.code,
    nameAr: equipment.nameAr,
    nameEn: equipment.nameEn,
    type: equipment.type,
    status: equipment.status,
    manufacturer: equipment.manufacturer,
    model: equipment.model,
  }).from(equipment).where(and(...conditions)).orderBy(asc(equipment.nameAr));
}

// ============================================
// Alerts
// ============================================

export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(alerts).values(data);
  return result[0].insertId;
}

export async function getActiveAlerts(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: alerts.id,
    businessId: alerts.businessId,
    stationId: alerts.stationId,
    equipmentId: alerts.equipmentId,
    alertType: alerts.alertType,
    category: alerts.category,
    title: alerts.title,
    status: alerts.status,
    triggeredAt: alerts.triggeredAt,
  }).from(alerts)
    .where(and(
      eq(alerts.businessId, businessId),
      eq(alerts.status, 'active')
    ))
    .orderBy(desc(alerts.triggeredAt));
}

export async function acknowledgeAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(alerts).set({
    status: 'acknowledged',
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
  }).where(eq(alerts.id, id));
}
