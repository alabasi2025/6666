// ============================================
// Accounting Extended Functions
// ============================================

export async function updateAccount(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(accounts).set(data).where(eq(accounts.id, id));
}

export async function deleteAccount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(accounts).set({ isActive: false }).where(eq(accounts.id, id));
}

export async function getAccountsTree(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const allAccounts = await db.select({
    id: accounts.id,
    code: accounts.code,
    nameAr: accounts.nameAr,
    nameEn: accounts.nameEn,
    parentId: accounts.parentId,
    level: accounts.level,
    accountType: accounts.accountType,
    nature: accounts.nature,
    isParent: accounts.isParent,
    currentBalance: accounts.currentBalance,
  }).from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.isActive, true)))
    .orderBy(asc(accounts.code));
  
  // Build tree structure
  const buildTree = (parentId: number | null): any[] => {
    return allAccounts
      .filter(acc => acc.parentId === parentId)
      .map(acc => ({
        ...acc,
        children: buildTree(acc.id),
      }));
  };
  
  return buildTree(null);
}

export async function getJournalEntries(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(journalEntries.businessId, businessId)];
  if (filters.periodId) conditions.push(eq(journalEntries.periodId, filters.periodId));
  if (filters.type) conditions.push(eq(journalEntries.type, filters.type as any));
  if (filters.status) conditions.push(eq(journalEntries.status, filters.status as any));
  
  return await db.select({
    id: journalEntries.id,
    businessId: journalEntries.businessId,
    entryNumber: journalEntries.entryNumber,
    entryDate: journalEntries.entryDate,
    type: journalEntries.type,
    description: journalEntries.description,
    totalDebit: journalEntries.totalDebit,
    totalCredit: journalEntries.totalCredit,
    status: journalEntries.status,
    createdAt: journalEntries.createdAt,
  }).from(journalEntries)
    .where(and(...conditions))
    .orderBy(desc(journalEntries.entryDate))
    .limit(filters.limit || 100);
}

export async function getJournalEntryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [entry] = await db.select({
    id: journalEntries.id,
    businessId: journalEntries.businessId,
    entryNumber: journalEntries.entryNumber,
    entryDate: journalEntries.entryDate,
    type: journalEntries.type,
    description: journalEntries.description,
    reference: journalEntries.reference,
    totalDebit: journalEntries.totalDebit,
    totalCredit: journalEntries.totalCredit,
    status: journalEntries.status,
    createdBy: journalEntries.createdBy,
    createdAt: journalEntries.createdAt,
  }).from(journalEntries).where(eq(journalEntries.id, id));
  if (!entry) return null;
  
  const lines = await db.select({
    id: journalEntryLines.id,
    journalEntryId: journalEntryLines.journalEntryId,
    accountId: journalEntryLines.accountId,
    debit: journalEntryLines.debit,
    credit: journalEntryLines.credit,
    description: journalEntryLines.description,
  }).from(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  
  return { ...entry, lines };
}

export async function createJournalEntry(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { lines, ...entryData } = data;
  
  // Generate entry number
  const entryNumber = `JE-${Date.now()}`;
  
  // Calculate totals
  let totalDebit = 0;
  let totalCredit = 0;
  lines.forEach((line: any) => {
    totalDebit += parseFloat(line.debit || "0");
    totalCredit += parseFloat(line.credit || "0");
  });
  
  const result = await db.insert(journalEntries).values({
    ...entryData,
    entryNumber,
    totalDebit: totalDebit.toFixed(2),
    totalCredit: totalCredit.toFixed(2),
    status: "draft",
  });
  
  const entryId = result[0].insertId;
  
  // Insert lines
  for (let i = 0; i < lines.length; i++) {
    await db.insert(journalEntryLines).values({
      journalEntryId: entryId,
      lineNumber: i + 1,
      accountId: lines[i].accountId,
      debit: lines[i].debit || "0",
      credit: lines[i].credit || "0",
      description: lines[i].description,
      costCenterId: lines[i].costCenterId,
    });
  }
  
  return entryId;
}

export async function updateJournalEntry(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const { lines, ...entryData } = data;
  
  if (Object.keys(entryData).length > 0) {
    await db.update(journalEntries).set(entryData).where(eq(journalEntries.id, id));
  }
  
  if (lines) {
    // Delete existing lines and insert new ones
    await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
    
    let totalDebit = 0;
    let totalCredit = 0;
    
    for (let i = 0; i < lines.length; i++) {
      totalDebit += parseFloat(lines[i].debit || "0");
      totalCredit += parseFloat(lines[i].credit || "0");
      
      await db.insert(journalEntryLines).values({
        journalEntryId: id,
        lineNumber: i + 1,
        accountId: lines[i].accountId,
        debit: lines[i].debit || "0",
        credit: lines[i].credit || "0",
        description: lines[i].description,
        costCenterId: lines[i].costCenterId,
      });
    }
    
    await db.update(journalEntries).set({
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2),
    }).where(eq(journalEntries.id, id));
  }
}

export async function deleteJournalEntry(id: number) {
  const db = await getDb();
  if (!db) return;
  
  // Only delete draft entries
  const [entry] = await db.select({
    id: journalEntries.id,
    status: journalEntries.status,
  }).from(journalEntries).where(eq(journalEntries.id, id));
  if (entry?.status !== "draft") {
    throw new Error("لا يمكن حذف قيد مرحّل");
  }
  
  await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
}

export async function postJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const [entry] = await db.select({
    id: journalEntries.id,
    status: journalEntries.status,
    totalDebit: journalEntries.totalDebit,
    totalCredit: journalEntries.totalCredit,
  }).from(journalEntries).where(eq(journalEntries.id, id));
  if (!entry) throw new Error("القيد غير موجود");
  if (entry.status !== "draft") throw new Error("القيد مرحّل بالفعل");
  
  // Verify debit = credit
  if (entry.totalDebit !== entry.totalCredit) {
    throw new Error("مجموع المدين لا يساوي مجموع الدائن");
  }
  
  // Update account balances
  const lines = await db.select({
    id: journalEntryLines.id,
    accountId: journalEntryLines.accountId,
    debit: journalEntryLines.debit,
    credit: journalEntryLines.credit,
  }).from(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
  
  for (const line of lines) {
    const [account] = await db.select({
      id: accounts.id,
      currentBalance: accounts.currentBalance,
      nature: accounts.nature,
    }).from(accounts).where(eq(accounts.id, line.accountId));
    if (!account) continue;
    
    const currentBalance = parseFloat(account.currentBalance || "0");
    const debit = parseFloat(line.debit || "0");
    const credit = parseFloat(line.credit || "0");
    
    let newBalance: number;
    if (account.nature === "debit") {
      newBalance = currentBalance + debit - credit;
    } else {
      newBalance = currentBalance + credit - debit;
    }
    
    await db.update(accounts).set({ currentBalance: newBalance.toFixed(2) }).where(eq(accounts.id, line.accountId));
  }
  
  await db.update(journalEntries).set({
    status: "posted",
    postedBy: userId,
    postedAt: new Date(),
  }).where(eq(journalEntries.id, id));
}

