// ============================================
// Account Management (Chart of Accounts)
// ============================================

export async function createAccount(data: InsertAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(accounts).values(data);
  return result[0].insertId;
}

export async function getAccounts(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: accounts.id,
    businessId: accounts.businessId,
    code: accounts.code,
    nameAr: accounts.nameAr,
    nameEn: accounts.nameEn,
    parentId: accounts.parentId,
    level: accounts.level,
    systemModule: accounts.systemModule,
    accountType: accounts.accountType,
    nature: accounts.nature,
    isParent: accounts.isParent,
    isActive: accounts.isActive,
    currentBalance: accounts.currentBalance,
  }).from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.isActive, true)))
    .orderBy(asc(accounts.code));
}

export async function getAccountById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: accounts.id,
    businessId: accounts.businessId,
    code: accounts.code,
    nameAr: accounts.nameAr,
    nameEn: accounts.nameEn,
    parentId: accounts.parentId,
    level: accounts.level,
    systemModule: accounts.systemModule,
    accountType: accounts.accountType,
    nature: accounts.nature,
    isParent: accounts.isParent,
    isActive: accounts.isActive,
    isCashAccount: accounts.isCashAccount,
    isBankAccount: accounts.isBankAccount,
    currency: accounts.currency,
    openingBalance: accounts.openingBalance,
    currentBalance: accounts.currentBalance,
    description: accounts.description,
    linkedEntityType: accounts.linkedEntityType,
    linkedEntityId: accounts.linkedEntityId,
    createdAt: accounts.createdAt,
    updatedAt: accounts.updatedAt,
  }).from(accounts).where(eq(accounts.id, id)).limit(1);
  return result[0] || null;
}
