// ============================================
// Customer Management
// ============================================

export async function createCustomer(data: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customers).values(data);
  return result[0].insertId;
}

export async function getCustomers(businessId: number, filters?: { status?: string; type?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(customers.businessId, businessId)];
  if (filters?.status) conditions.push(eq(customers.status, filters.status as any));
  if (filters?.type) conditions.push(eq(customers.type, filters.type as any));
  if (filters?.search) {
    conditions.push(
      or(
        like(customers.nameAr, `%${filters.search}%`),
        like(customers.accountNumber, `%${filters.search}%`),
        like(customers.phone, `%${filters.search}%`)
      )!
    );
  }

  return await db.select({
    id: customers.id,
    businessId: customers.businessId,
    accountNumber: customers.accountNumber,
    nameAr: customers.nameAr,
    nameEn: customers.nameEn,
    type: customers.type,
    phone: customers.phone,
    mobile: customers.mobile,
    status: customers.status,
    currentBalance: customers.currentBalance,
    isActive: customers.isActive,
    createdAt: customers.createdAt,
  }).from(customers).where(and(...conditions)).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: customers.id,
    businessId: customers.businessId,
    branchId: customers.branchId,
    stationId: customers.stationId,
    accountNumber: customers.accountNumber,
    nameAr: customers.nameAr,
    nameEn: customers.nameEn,
    type: customers.type,
    category: customers.category,
    idType: customers.idType,
    idNumber: customers.idNumber,
    phone: customers.phone,
    mobile: customers.mobile,
    email: customers.email,
    address: customers.address,
    city: customers.city,
    district: customers.district,
    postalCode: customers.postalCode,
    latitude: customers.latitude,
    longitude: customers.longitude,
    tariffId: customers.tariffId,
    connectionDate: customers.connectionDate,
    status: customers.status,
    currentBalance: customers.currentBalance,
    depositAmount: customers.depositAmount,
    creditLimit: customers.creditLimit,
    accountId: customers.accountId,
    isActive: customers.isActive,
    notes: customers.notes,
    createdAt: customers.createdAt,
    updatedAt: customers.updatedAt,
  }).from(customers).where(eq(customers.id, id)).limit(1);
  return result[0] || null;
}

// ============================================
// Invoice Management
// ============================================

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(invoices).values(data);
  return result[0].insertId;
}

export async function getInvoices(businessId: number, filters?: { status?: string; customerId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(invoices.businessId, businessId)];
  if (filters?.status) conditions.push(eq(invoices.status, filters.status as any));
  if (filters?.customerId) conditions.push(eq(invoices.customerId, filters.customerId));

  return await db.select({
    id: invoices.id,
    businessId: invoices.businessId,
    customerId: invoices.customerId,
    invoiceNumber: invoices.invoiceNumber,
    invoiceDate: invoices.invoiceDate,
    dueDate: invoices.dueDate,
    totalAmount: invoices.totalAmount,
    paidAmount: invoices.paidAmount,
    balanceDue: invoices.balanceDue,
    status: invoices.status,
    createdAt: invoices.createdAt,
  }).from(invoices).where(and(...conditions)).orderBy(desc(invoices.invoiceDate));
}
