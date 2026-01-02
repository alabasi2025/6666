// ============================================
// Inventory Management
// ============================================

export async function createItem(data: InsertItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(items).values(data);
  return result[0].insertId;
}

export async function getItems(businessId: number, filters?: { categoryId?: number; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(items.businessId, businessId), eq(items.isActive, true)];
  if (filters?.categoryId) conditions.push(eq(items.categoryId, filters.categoryId));
  if (filters?.search) {
    conditions.push(
      or(
        like(items.nameAr, `%${filters.search}%`),
        like(items.code, `%${filters.search}%`)
      )!
    );
  }

  return await db.select({
    id: items.id,
    businessId: items.businessId,
    categoryId: items.categoryId,
    code: items.code,
    nameAr: items.nameAr,
    nameEn: items.nameEn,
    unit: items.unit,
    unitCost: items.unitCost,
    isActive: items.isActive,
  }).from(items).where(and(...conditions)).orderBy(asc(items.nameAr));
}

// ============================================
// Supplier Management
// ============================================

export async function createSupplier(data: InsertSupplier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(suppliers).values(data);
  return result[0].insertId;
}

export async function getSuppliers(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: suppliers.id,
    businessId: suppliers.businessId,
    code: suppliers.code,
    nameAr: suppliers.nameAr,
    nameEn: suppliers.nameEn,
    phone: suppliers.phone,
    email: suppliers.email,
    status: suppliers.status,
    isActive: suppliers.isActive,
  }).from(suppliers)
    .where(and(eq(suppliers.businessId, businessId), eq(suppliers.isActive, true)))
    .orderBy(asc(suppliers.nameAr));
}

