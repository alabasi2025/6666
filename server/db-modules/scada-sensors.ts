// ============================================
// SCADA System Functions
// ============================================

export async function getScadaEquipment(businessId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(equipment.businessId, businessId)];
  if (status) conditions.push(eq(equipment.status, status as any));
  
  return await db.select({
    id: equipment.id,
    businessId: equipment.businessId,
    code: equipment.code,
    nameAr: equipment.nameAr,
    nameEn: equipment.nameEn,
    type: equipment.type,
    manufacturer: equipment.manufacturer,
    model: equipment.model,
    location: equipment.location,
    status: equipment.status,
    createdAt: equipment.createdAt,
  }).from(equipment)
    .where(and(...conditions))
    .orderBy(desc(equipment.createdAt));
}

export async function getScadaEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select({
    id: equipment.id,
    businessId: equipment.businessId,
    code: equipment.code,
    nameAr: equipment.nameAr,
    nameEn: equipment.nameEn,
    type: equipment.type,
    manufacturer: equipment.manufacturer,
    model: equipment.model,
    serialNumber: equipment.serialNumber,
    location: equipment.location,
    installationDate: equipment.installationDate,
    status: equipment.status,
    description: equipment.description,
    createdAt: equipment.createdAt,
  }).from(equipment).where(eq(equipment.id, id));
  return result || null;
}

export async function createScadaEquipment(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(equipment).values({
    businessId: data.businessId,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    type: data.type,
    manufacturer: data.manufacturer,
    model: data.model,
    serialNumber: data.serialNumber,
    location: data.location,
    installationDate: data.installationDate ? new Date(data.installationDate) : null,
    status: data.status || "active",
    description: data.description,
  });
  
  return result.insertId;
}

export async function updateScadaEquipment(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.installationDate) updateData.installationDate = new Date(data.installationDate);
  
  await db.update(equipment).set(updateData).where(eq(equipment.id, id));
}

export async function deleteScadaEquipment(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(equipment).where(eq(equipment.id, id));
}

export async function getScadaSensors(businessId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(sensors.businessId, businessId)];
  if (status) conditions.push(eq(sensors.status, status as any));
  
  return await db.select({
    id: sensors.id,
    businessId: sensors.businessId,
    equipmentId: sensors.equipmentId,
    code: sensors.code,
    nameAr: sensors.nameAr,
    nameEn: sensors.nameEn,
    type: sensors.type,
    unit: sensors.unit,
    currentValue: sensors.currentValue,
    status: sensors.status,
    createdAt: sensors.createdAt,
  }).from(sensors)
    .where(and(...conditions))
    .orderBy(desc(sensors.createdAt));
}

export async function getScadaSensorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select({
    id: sensors.id,
    businessId: sensors.businessId,
    equipmentId: sensors.equipmentId,
    code: sensors.code,
    nameAr: sensors.nameAr,
    nameEn: sensors.nameEn,
    type: sensors.type,
    unit: sensors.unit,
    minValue: sensors.minValue,
    maxValue: sensors.maxValue,
    warningThreshold: sensors.warningThreshold,
    criticalThreshold: sensors.criticalThreshold,
    currentValue: sensors.currentValue,
    location: sensors.location,
    status: sensors.status,
    createdAt: sensors.createdAt,
  }).from(sensors).where(eq(sensors.id, id));
  return result || null;
}

export async function createScadaSensor(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(sensors).values({
    businessId: data.businessId,
    equipmentId: data.equipmentId,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    type: data.type,
    unit: data.unit,
    minValue: data.minValue,
    maxValue: data.maxValue,
    warningThreshold: data.warningThreshold,
    criticalThreshold: data.criticalThreshold,
    location: data.location,
    status: data.status || "active",
  });
  
  return result.insertId;
}

export async function updateScadaSensor(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(sensors).set(data).where(eq(sensors.id, id));
}

export async function deleteScadaSensor(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(sensors).where(eq(sensors.id, id));
}

export async function getScadaAlerts(businessId: number, type?: string, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(alerts.businessId, businessId)];
  if (type) conditions.push(eq(alerts.alertType, type as any));
  if (status) conditions.push(eq(alerts.status, status as any));
  
  return await db.select({
    id: alerts.id,
    businessId: alerts.businessId,
    equipmentId: alerts.equipmentId,
    sensorId: alerts.sensorId,
    alertType: alerts.alertType,
    title: alerts.title,
    message: alerts.message,
    priority: alerts.priority,
    status: alerts.status,
    createdAt: alerts.createdAt,
  }).from(alerts)
    .where(and(...conditions))
    .orderBy(desc(alerts.createdAt));
}

export async function getScadaAlertById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.select({
    id: alerts.id,
    businessId: alerts.businessId,
    equipmentId: alerts.equipmentId,
    sensorId: alerts.sensorId,
    alertType: alerts.alertType,
    title: alerts.title,
    message: alerts.message,
    priority: alerts.priority,
    status: alerts.status,
    resolvedBy: alerts.resolvedBy,
    resolvedAt: alerts.resolvedAt,
    createdAt: alerts.createdAt,
  }).from(alerts).where(eq(alerts.id, id));
  return result || null;
}

export async function createScadaAlert(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(alerts).values({
    businessId: data.businessId,
    equipmentId: data.equipmentId,
    sensorId: data.sensorId,
    alertType: data.alertType || "warning",
    title: data.title,
    message: data.message,
    priority: data.priority || "medium",
    status: "active",
  });
  
  return result.insertId;
}

export async function updateScadaAlertStatus(id: number, status: string, resolvedBy?: number) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  if (status === "acknowledged") {
    updateData.acknowledgedAt = new Date();
  } else if (status === "resolved") {
    updateData.resolvedAt = new Date();
    if (resolvedBy) updateData.resolvedBy = resolvedBy;
  }
  
  await db.update(alerts).set(updateData).where(eq(alerts.id, id));
}

export async function deleteScadaAlert(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(alerts).where(eq(alerts.id, id));
}

export async function getScadaDashboard(businessId: number) {
  const db = await getDb();
  if (!db) return { equipment: [], sensors: [], alerts: [] };
  
  const [equipmentList, sensorsList, alertsList] = await Promise.all([
    db.select({
      id: equipment.id,
      code: equipment.code,
      nameAr: equipment.nameAr,
      type: equipment.type,
      status: equipment.status,
    }).from(equipment).where(eq(equipment.businessId, businessId)).limit(10),
    db.select({
      id: sensors.id,
      code: sensors.code,
      nameAr: sensors.nameAr,
      type: sensors.type,
      currentValue: sensors.currentValue,
      status: sensors.status,
    }).from(sensors).where(eq(sensors.businessId, businessId)).limit(10),
    db.select({
      id: alerts.id,
      alertType: alerts.alertType,
      title: alerts.title,
      priority: alerts.priority,
      status: alerts.status,
    }).from(alerts).where(and(
      eq(alerts.businessId, businessId),
      eq(alerts.status, "active")
    )).limit(10),
  ]);
  
  return {
    equipment: equipmentList,
    sensors: sensorsList,
    alerts: alertsList,
  };
}

export async function getScadaStats(businessId: number) {
  const db = await getDb();
  if (!db) return {
    totalEquipment: 0,
    onlineEquipment: 0,
    offlineEquipment: 0,
    totalSensors: 0,
    activeSensors: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
  };
  
  const [equipmentList, sensorsList, alertsList] = await Promise.all([
    db.select({
      id: equipment.id,
      status: equipment.status,
    }).from(equipment).where(eq(equipment.businessId, businessId)),
    db.select({
      id: sensors.id,
      status: sensors.status,
    }).from(sensors).where(eq(sensors.businessId, businessId)),
    db.select({
      id: alerts.id,
      alertType: alerts.alertType,
      status: alerts.status,
    }).from(alerts).where(and(
      eq(alerts.businessId, businessId),
      eq(alerts.status, "active")
    )),
  ]);
  
  return {
    totalEquipment: equipmentList.length,
    onlineEquipment: equipmentList.filter(e => e.status === "online" || e.status === "active").length,
    offlineEquipment: equipmentList.filter(e => e.status === "offline" || e.status === "inactive").length,
    totalSensors: sensorsList.length,
    activeSensors: sensorsList.filter(s => s.status === "active").length,
    activeAlerts: alertsList.length,
    criticalAlerts: alertsList.filter(a => a.alertType === "critical" || a.alertType === "emergency").length,
  };
}

export async function getScadaAlertsStats(businessId: number) {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, acknowledged: 0, resolved: 0 };
  
  const alertsList = await db.select({
    id: alerts.id,
    status: alerts.status,
  }).from(alerts).where(eq(alerts.businessId, businessId));
  
  return {
    total: alertsList.length,
    active: alertsList.filter(a => a.status === "active").length,
    acknowledged: alertsList.filter(a => a.status === "acknowledged").length,
    resolved: alertsList.filter(a => a.status === "resolved").length,
  };
}


// ============================================
// Sensor Functions - دوال المستشعرات
// ============================================

export async function getSensors(businessId: number, stationId?: number) {
  const db = await getDb();
  const selectFields = {
    id: sensors.id,
    businessId: sensors.businessId,
    stationId: sensors.stationId,
    code: sensors.code,
    nameAr: sensors.nameAr,
    nameEn: sensors.nameEn,
    type: sensors.type,
    unit: sensors.unit,
    currentValue: sensors.currentValue,
    status: sensors.status,
  };
  let query = db.select(selectFields).from(sensors).where(eq(sensors.businessId, businessId));
  if (stationId) {
    query = db.select(selectFields).from(sensors).where(
      and(eq(sensors.businessId, businessId), eq(sensors.stationId, stationId))
    );
  }
  return await query;
}

export async function getSensorById(id: number) {
  const db = await getDb();
  const [sensor] = await db.select({
    id: sensors.id,
    businessId: sensors.businessId,
    stationId: sensors.stationId,
    equipmentId: sensors.equipmentId,
    code: sensors.code,
    nameAr: sensors.nameAr,
    nameEn: sensors.nameEn,
    type: sensors.type,
    unit: sensors.unit,
    minValue: sensors.minValue,
    maxValue: sensors.maxValue,
    warningThreshold: sensors.warningThreshold,
    criticalThreshold: sensors.criticalThreshold,
    currentValue: sensors.currentValue,
    location: sensors.location,
    status: sensors.status,
    createdAt: sensors.createdAt,
  }).from(sensors).where(eq(sensors.id, id));
  return sensor || null;
}

export async function createSensor(data: any) {
  const db = await getDb();
  const [result] = await db.insert(sensors).values(data);
  return result.insertId;
}

export async function updateSensor(id: number, data: any) {
  const db = await getDb();
  await db.update(sensors).set(data).where(eq(sensors.id, id));
  return { success: true };
}

export async function deleteSensor(id: number) {
  const db = await getDb();
  await db.delete(sensors).where(eq(sensors.id, id));
  return { success: true };
}

// ============================================
