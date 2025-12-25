// Alerts Functions - دوال التنبيهات
// ============================================

export async function getAlerts(businessId: number, options?: { status?: string; type?: string }) {
  const db = await getDb();
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
  }).from(alerts).where(eq(alerts.businessId, businessId));
}

export async function getAlertById(id: number) {
  const db = await getDb();
  const [alert] = await db.select({
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
  return alert || null;
}

export async function updateAlertStatus(id: number, status: string) {
  const db = await getDb();
  await db.update(alerts).set({ status }).where(eq(alerts.id, id));
  return { success: true };
}

export async function deleteAlert(id: number) {
  const db = await getDb();
  await db.delete(alerts).where(eq(alerts.id, id));
  return { success: true };
}

// ============================================
// Alerts Stats Function
// ============================================

export async function getAlertsStats(businessId: number) {
  const db = await getDb();
  const allAlerts = await db.select({
    id: alerts.id,
    status: alerts.status,
  }).from(alerts).where(eq(alerts.businessId, businessId));
  return {
    total: allAlerts.length,
    active: allAlerts.filter((a: any) => a.status === 'active').length,
    acknowledged: allAlerts.filter((a: any) => a.status === 'acknowledged').length,
    resolved: allAlerts.filter((a: any) => a.status === 'resolved').length,
  };
}

// ============================================
