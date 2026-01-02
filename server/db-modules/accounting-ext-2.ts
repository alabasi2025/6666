export async function reverseJournalEntry(id: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const entry = await getJournalEntryById(id);
  if (!entry) throw new Error("القيد غير موجود");
  if (entry.status !== "posted") throw new Error("لا يمكن عكس قيد غير مرحّل");
  
  // Create reverse entry
  const reversedLines = entry.lines.map((line: any) => ({
    accountId: line.accountId,
    debit: line.credit,
    credit: line.debit,
    description: `عكس: ${line.description || ""}`,
    costCenterId: line.costCenterId,
  }));
  
  const newId = await createJournalEntry({
    businessId: entry.businessId,
    branchId: entry.branchId,
    entryDate: new Date().toISOString().split('T')[0],
    periodId: entry.periodId,
    type: "adjustment",
    description: `عكس القيد ${entry.entryNumber}: ${reason || ""}`,
    lines: reversedLines,
    createdBy: userId,
  });
  
  // Post the reverse entry
  await postJournalEntry(newId, userId);
  
  // Mark original as reversed
  await db.update(journalEntries).set({ status: "reversed" }).where(eq(journalEntries.id, id));
  
  return newId;
}

export async function getFiscalPeriods(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(fiscalPeriods.businessId, businessId)];
  if (filters.year) conditions.push(eq(fiscalPeriods.year, filters.year));
  if (filters.status) conditions.push(eq(fiscalPeriods.status, filters.status as any));
  
  return await db.select({
    id: fiscalPeriods.id,
    businessId: fiscalPeriods.businessId,
    year: fiscalPeriods.year,
    period: fiscalPeriods.period,
    startDate: fiscalPeriods.startDate,
    endDate: fiscalPeriods.endDate,
    status: fiscalPeriods.status,
  }).from(fiscalPeriods)
    .where(and(...conditions))
    .orderBy(desc(fiscalPeriods.year), desc(fiscalPeriods.period));
}

export async function createFiscalPeriod(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(fiscalPeriods).values(data);
  return result[0].insertId;
}

export async function closeFiscalPeriod(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(fiscalPeriods).set({
    status: "closed",
    closedBy: userId,
    closedAt: new Date(),
  }).where(eq(fiscalPeriods.id, id));
}

export async function reopenFiscalPeriod(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(fiscalPeriods).set({
    status: "open",
    closedBy: null,
    closedAt: null,
  }).where(eq(fiscalPeriods.id, id));
}

export async function getCostCenters(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: costCenters.id,
    businessId: costCenters.businessId,
    code: costCenters.code,
    nameAr: costCenters.nameAr,
    nameEn: costCenters.nameEn,
    parentId: costCenters.parentId,
    isActive: costCenters.isActive,
  }).from(costCenters)
    .where(and(eq(costCenters.businessId, businessId), eq(costCenters.isActive, true)))
    .orderBy(asc(costCenters.code));
}

export async function createCostCenter(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(costCenters).values(data);
  return result[0].insertId;
}

export async function updateCostCenter(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(costCenters).set(data).where(eq(costCenters.id, id));
}

export async function deleteCostCenter(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(costCenters).set({ isActive: false }).where(eq(costCenters.id, id));
}

export async function getTrialBalance(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: accounts.id,
    code: accounts.code,
    nameAr: accounts.nameAr,
    nature: accounts.nature,
    openingBalance: accounts.openingBalance,
    currentBalance: accounts.currentBalance,
  }).from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.isActive, true)))
    .orderBy(asc(accounts.code));
}

export async function getGeneralLedger(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions: any[] = [eq(journalEntries.businessId, businessId), eq(journalEntries.status, "posted")];
  
  const entries = await db.select({
    entryId: journalEntries.id,
    entryNumber: journalEntries.entryNumber,
    entryDate: journalEntries.entryDate,
    description: journalEntries.description,
    lineId: journalEntryLines.id,
    accountId: journalEntryLines.accountId,
    debit: journalEntryLines.debit,
    credit: journalEntryLines.credit,
    lineDescription: journalEntryLines.description,
  })
    .from(journalEntries)
    .innerJoin(journalEntryLines, eq(journalEntries.id, journalEntryLines.journalEntryId))
    .where(and(...conditions))
    .orderBy(desc(journalEntries.entryDate));
  
  if (filters.accountId) {
    return entries.filter(e => e.accountId === filters.accountId);
  }
  
  return entries;
}

export async function getIncomeStatement(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return { revenues: [], expenses: [], totalRevenue: 0, totalExpense: 0, netIncome: 0 };
  
  // Get revenue and expense accounts
  const revenueAccounts = await db.select({
    id: accounts.id,
    code: accounts.code,
    nameAr: accounts.nameAr,
    currentBalance: accounts.currentBalance,
  }).from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.nature, "credit"), eq(accounts.isActive, true)));
  
  const expenseAccounts = await db.select({
    id: accounts.id,
    code: accounts.code,
    nameAr: accounts.nameAr,
    currentBalance: accounts.currentBalance,
  }).from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.nature, "debit"), eq(accounts.isActive, true)));
  
  const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  const totalExpense = expenseAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  
  return {
    revenues: revenueAccounts,
    expenses: expenseAccounts,
    totalRevenue,
    totalExpense,
    netIncome: totalRevenue - totalExpense,
  };
}

export async function getBalanceSheet(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return { assets: [], liabilities: [], equity: [], totalAssets: 0, totalLiabilities: 0, totalEquity: 0 };
  
  const allAccounts = await db.select({
    id: accounts.id,
    code: accounts.code,
    nameAr: accounts.nameAr,
    nature: accounts.nature,
    currentBalance: accounts.currentBalance,
  }).from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.isActive, true)));
  
  // Simple categorization based on account nature
  const assetAccounts = allAccounts.filter(acc => acc.nature === "debit");
  const liabilityAccounts = allAccounts.filter(acc => acc.nature === "credit");
  
  const totalAssets = assetAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance || "0"), 0);
  
  return {
    assets: assetAccounts,
    liabilities: liabilityAccounts,
    equity: [],
    totalAssets,
    totalLiabilities,
    totalEquity: totalAssets - totalLiabilities,
  };
}

export async function getAccountingDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalAccounts: 0, totalEntries: 0, pendingEntries: 0, currentPeriod: null };
  
  const [totalAccounts] = await db.select({ count: count() }).from(accounts).where(eq(accounts.businessId, businessId));
  const [totalEntries] = await db.select({ count: count() }).from(journalEntries).where(eq(journalEntries.businessId, businessId));
  const [pendingEntries] = await db.select({ count: count() }).from(journalEntries).where(and(eq(journalEntries.businessId, businessId), eq(journalEntries.status, "draft")));
  const [currentPeriod] = await db.select({
    id: fiscalPeriods.id,
    year: fiscalPeriods.year,
    period: fiscalPeriods.period,
    status: fiscalPeriods.status,
  }).from(fiscalPeriods).where(and(eq(fiscalPeriods.businessId, businessId), eq(fiscalPeriods.status, "open"))).limit(1);
  
  return {
    totalAccounts: totalAccounts?.count || 0,
    totalEntries: totalEntries?.count || 0,
    pendingEntries: pendingEntries?.count || 0,
    currentPeriod,
  };
}
