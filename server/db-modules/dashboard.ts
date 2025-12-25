// ============================================
// Dashboard Statistics
// ============================================

export async function getDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return null;

  const [
    totalAssets,
    activeWorkOrders,
    totalCustomers,
    activeAlerts,
    onlineEquipment,
    totalEquipment,
  ] = await Promise.all([
    db.select({ count: count() }).from(assets).where(eq(assets.businessId, businessId)),
    db.select({ count: count() }).from(workOrders).where(and(
      eq(workOrders.businessId, businessId),
      or(
        eq(workOrders.status, 'pending'),
        eq(workOrders.status, 'in_progress'),
        eq(workOrders.status, 'assigned')
      )
    )),
    db.select({ count: count() }).from(customers).where(and(
      eq(customers.businessId, businessId),
      eq(customers.isActive, true)
    )),
    db.select({ count: count() }).from(alerts).where(and(
      eq(alerts.businessId, businessId),
      eq(alerts.status, 'active')
    )),
    db.select({ count: count() }).from(equipment).where(and(
      eq(equipment.businessId, businessId),
      eq(equipment.status, 'online')
    )),
    db.select({ count: count() }).from(equipment).where(eq(equipment.businessId, businessId)),
  ]);

  return {
    totalAssets: totalAssets[0]?.count || 0,
    activeWorkOrders: activeWorkOrders[0]?.count || 0,
    totalCustomers: totalCustomers[0]?.count || 0,
    activeAlerts: activeAlerts[0]?.count || 0,
    onlineEquipment: onlineEquipment[0]?.count || 0,
    totalEquipment: totalEquipment[0]?.count || 0,
  };
}

// ============================================
// Audit Log
// ============================================

export async function createAuditLog(data: {
  businessId?: number;
  userId?: number;
  action: string;
  module: string;
  entityType?: string;
  entityId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLogs).values({
    ...data,
    oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
    newValues: data.newValues ? JSON.stringify(data.newValues) : null,
  });
}

// ============================================
// Sequence Generator
// ============================================

export async function getNextSequence(businessId: number, code: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const seq = await db.select({
    id: sequences.id,
    businessId: sequences.businessId,
    code: sequences.code,
    prefix: sequences.prefix,
    suffix: sequences.suffix,
    currentValue: sequences.currentValue,
    minDigits: sequences.minDigits,
  }).from(sequences)
    .where(and(eq(sequences.businessId, businessId), eq(sequences.code, code)))
    .limit(1);

  if (seq.length === 0) {
    // Create new sequence
    await db.insert(sequences).values({
      businessId,
      code,
      currentValue: 1,
    });
    return `${code}-000001`;
  }

  const current = seq[0];
  const nextValue = (current.currentValue || 0) + 1;
  
  await db.update(sequences)
    .set({ currentValue: nextValue })
    .where(eq(sequences.id, current.id));

  const prefix = current.prefix || code;
  const suffix = current.suffix || '';
  const digits = current.minDigits || 6;
  const paddedValue = String(nextValue).padStart(digits, '0');

  return `${prefix}-${paddedValue}${suffix}`;
}
