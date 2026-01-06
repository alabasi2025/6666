/**
 * محرك التسوية المرن
 * Flexible Reconciliation Engine
 * 
 * هذا المحرك يستخدم الحسابات الوسيطة لمطابقة وتسوية العمليات المالية
 * المبدأ: كل حساب فرعي له "حساب وسيط" تُسجل فيه العمليات اليومية
 * ثم يتم مطابقة الحركات من مختلف الوسيطين وتسويتها
 */

import { eq, and, sql, or, desc, asc, gte, lte, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { accounts, journalEntries, journalEntryLines, fiscalPeriods } from "../../drizzle/schemas/accounting";
import { logger } from "../utils/logger";

// ============================================
// Types
// ============================================

export interface ClearingAccount {
  id: number;
  businessId: number;
  code: string;
  nameAr: string;
  parentAccountId: number;
  isActive: boolean;
}

export interface ClearingEntry {
  id: number;
  clearingAccountId: number;
  entryDate: Date;
  description: string;
  debit: number;
  credit: number;
  sourceModule: string;
  sourceId: number;
  status: "unmatched" | "matched" | "reconciled";
  matchedWith?: number[]; // IDs of matched entries
  reconciliationId?: number;
}

export interface ReconciliationRecord {
  id: number;
  businessId: number;
  reconciliationDate: Date;
  description: string;
  matchedEntries: number[];
  totalDebit: number;
  totalCredit: number;
  status: "draft" | "posted";
  createdBy: number;
}

export type MatchType = "1:1" | "1:N" | "N:1" | "N:M";

// ============================================
// Reconciliation Engine Class
// ============================================

export class ReconciliationEngine {
  /**
   * إنشاء حساب وسيط
   */
  static async createClearingAccount(data: {
    businessId: number;
    code: string;
    nameAr: string;
    parentAccountId: number;
  }): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // التحقق من وجود الحساب الأصلي
      const [parentAccount] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, data.parentAccountId), eq(accounts.businessId, data.businessId)))
        .limit(1);

      if (!parentAccount) {
        throw new Error("الحساب الأصلي غير موجود");
      }

      // إنشاء الحساب الوسيط (نستخدم code pattern للتعرف عليه)
      const [result] = await db.insert(accounts).values({
        businessId: data.businessId,
        code: data.code,
        nameAr: `وسيط ${data.nameAr}`,
        nameEn: `Clearing ${data.nameAr}`,
        parentId: data.parentAccountId,
        level: (parentAccount.level || 1) + 1,
        systemModule: parentAccount.systemModule,
        accountType: "sub",
        nature: parentAccount.nature,
        isParent: false,
        isActive: true,
        description: "حساب وسيط للتسوية", // علامة خاصة في الوصف
      });

      logger.info("Clearing account created", {
        id: result.insertId,
        code: data.code,
        parentAccountId: data.parentAccountId,
      });

      return result.insertId;
    } catch (error: any) {
      logger.error("Failed to create clearing account", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * تسجيل حركة في حساب وسيط
   */
  static async recordClearingEntry(data: {
    businessId: number;
    clearingAccountId: number;
    entryDate: Date;
    description: string;
    debit?: number;
    credit?: number;
    sourceModule: string;
    sourceId: number;
    createdBy: number;
  }): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // التحقق من أن الحساب وسيط (نفحص الوصف)
      const [clearingAccount] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, data.clearingAccountId), eq(accounts.businessId, data.businessId)))
        .limit(1);

      if (!clearingAccount || !clearingAccount.description?.includes("وسيط")) {
        throw new Error("الحساب المحدد ليس حساب وسيط");
      }

      // الحصول على الفترة المحاسبية
      const [period] = await db
        .select({ id: fiscalPeriods.id })
        .from(fiscalPeriods)
        .where(and(eq(fiscalPeriods.businessId, data.businessId), eq(fiscalPeriods.status, "open")))
        .limit(1);

      if (!period) {
        throw new Error("لا توجد فترة محاسبية نشطة");
      }

      // إنشاء قيد يومي في الحساب الوسيط
      const entryNumber = `CLR-${Date.now()}`;
      const debit = data.debit || 0;
      const credit = data.credit || 0;

      const [entryResult] = await db.insert(journalEntries).values({
        businessId: data.businessId,
        entryNumber,
        entryDate: data.entryDate,
        periodId: period.id,
        type: "auto",
        sourceModule: data.sourceModule,
        sourceId: data.sourceId,
        description: data.description,
        totalDebit: debit.toFixed(2),
        totalCredit: credit.toFixed(2),
        status: "posted",
        createdBy: data.createdBy,
        postedBy: data.createdBy,
        postedAt: new Date(),
      });

      const entryId = entryResult.insertId;

      // إضافة بند القيد
      await db.insert(journalEntryLines).values({
        entryId: entryId,
        lineNumber: 1,
        accountId: data.clearingAccountId,
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        description: data.description,
      });

      // تحديث رصيد الحساب الوسيط
      const currentBalance = parseFloat(clearingAccount.currentBalance || "0");
      let newBalance: number;
      if (clearingAccount.nature === "debit") {
        newBalance = currentBalance + debit - credit;
      } else {
        newBalance = currentBalance + credit - debit;
      }

      await db
        .update(accounts)
        .set({ currentBalance: newBalance.toFixed(2) })
        .where(eq(accounts.id, data.clearingAccountId));

      logger.info("Clearing entry recorded", {
        entryId,
        clearingAccountId: data.clearingAccountId,
        debit,
        credit,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to record clearing entry", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * جلب الحركات غير المطابقة لحساب وسيط
   */
  static async getUnmatchedEntries(
    businessId: number,
    clearingAccountId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    let conditions = [
      eq(journalEntries.businessId, businessId),
      eq(journalEntryLines.accountId, clearingAccountId),
      eq(journalEntries.status, "posted"),
    ];

    if (startDate) {
      conditions.push(gte(journalEntries.entryDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(journalEntries.entryDate, endDate));
    }

    const entries = await db
      .select({
        entryId: journalEntries.id,
        entryNumber: journalEntries.entryNumber,
        entryDate: journalEntries.entryDate,
        description: journalEntries.description,
        debit: journalEntryLines.debit,
        credit: journalEntryLines.credit,
        sourceModule: journalEntries.sourceModule,
        sourceId: journalEntries.sourceId,
      })
      .from(journalEntries)
      .innerJoin(journalEntryLines, eq(journalEntries.id, journalEntryLines.entryId))
      .where(and(...conditions))
      .orderBy(desc(journalEntries.entryDate));

    return entries;
  }

  /**
   * مطابقة 1:1 (عملية واحدة ← → عملية واحدة)
   */
  static async matchOneToOne(entry1Id: number, entry2Id: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      const [entry1] = await db
        .select({
          id: journalEntries.id,
          totalDebit: journalEntries.totalDebit,
          totalCredit: journalEntries.totalCredit,
        })
        .from(journalEntries)
        .where(eq(journalEntries.id, entry1Id))
        .limit(1);

      const [entry2] = await db
        .select({
          id: journalEntries.id,
          totalDebit: journalEntries.totalDebit,
          totalCredit: journalEntries.totalCredit,
        })
        .from(journalEntries)
        .where(eq(journalEntries.id, entry2Id))
        .limit(1);

      if (!entry1 || !entry2) return false;

      // التحقق من التوازن
      const entry1Debit = parseFloat(entry1.totalDebit || "0");
      const entry1Credit = parseFloat(entry1.totalCredit || "0");
      const entry2Debit = parseFloat(entry2.totalDebit || "0");
      const entry2Credit = parseFloat(entry2.totalCredit || "0");

      // يجب أن يكون مدين الأول = دائن الثاني والعكس
      const isBalanced =
        Math.abs(entry1Debit - entry2Credit) < 0.01 && Math.abs(entry1Credit - entry2Debit) < 0.01;

      return isBalanced;
    } catch (error) {
      logger.error("Failed to match entries 1:1", { error, entry1Id, entry2Id });
      return false;
    }
  }

  /**
   * مطابقة 1:N (عملية واحدة ← → عدة عمليات)
   */
  static async matchOneToMany(entryId: number, entryIds: number[]): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      const [entry] = await db
        .select({
          totalDebit: journalEntries.totalDebit,
          totalCredit: journalEntries.totalCredit,
        })
        .from(journalEntries)
        .where(eq(journalEntries.id, entryId))
        .limit(1);

      if (!entry) return false;

      const entryDebit = parseFloat(entry.totalDebit || "0");
      const entryCredit = parseFloat(entry.totalCredit || "0");

      // جمع المبالغ من العمليات المتعددة
      const manyEntries = await db
        .select({
          totalDebit: journalEntries.totalDebit,
          totalCredit: journalEntries.totalCredit,
        })
        .from(journalEntries)
        .where(inArray(journalEntries.id, entryIds));

      const totalDebit = manyEntries.reduce((sum, e) => sum + parseFloat(e.totalDebit || "0"), 0);
      const totalCredit = manyEntries.reduce((sum, e) => sum + parseFloat(e.totalCredit || "0"), 0);

      // التحقق من التوازن
      const isBalanced = Math.abs(entryDebit - totalCredit) < 0.01 && Math.abs(entryCredit - totalDebit) < 0.01;

      return isBalanced;
    } catch (error) {
      logger.error("Failed to match entries 1:N", { error, entryId, entryIds });
      return false;
    }
  }

  /**
   * مطابقة N:1 (عدة عمليات ← → عملية واحدة)
   */
  static async matchManyToOne(entryIds: number[], entryId: number): Promise<boolean> {
    return this.matchOneToMany(entryId, entryIds);
  }

  /**
   * مطابقة N:M (عدة ← → عدة)
   */
  static async matchManyToMany(entryIds1: number[], entryIds2: number[]): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      // جمع المبالغ من المجموعة الأولى
      const entries1 = await db
        .select({
          totalDebit: journalEntries.totalDebit,
          totalCredit: journalEntries.totalCredit,
        })
        .from(journalEntries)
        .where(inArray(journalEntries.id, entryIds1));

      const totalDebit1 = entries1.reduce((sum, e) => sum + parseFloat(e.totalDebit || "0"), 0);
      const totalCredit1 = entries1.reduce((sum, e) => sum + parseFloat(e.totalCredit || "0"), 0);

      // جمع المبالغ من المجموعة الثانية
      const entries2 = await db
        .select({
          totalDebit: journalEntries.totalDebit,
          totalCredit: journalEntries.totalCredit,
        })
        .from(journalEntries)
        .where(inArray(journalEntries.id, entryIds2));

      const totalDebit2 = entries2.reduce((sum, e) => sum + parseFloat(e.totalDebit || "0"), 0);
      const totalCredit2 = entries2.reduce((sum, e) => sum + parseFloat(e.totalCredit || "0"), 0);

      // التحقق من التوازن
      const isBalanced = Math.abs(totalDebit1 - totalCredit2) < 0.01 && Math.abs(totalCredit1 - totalDebit2) < 0.01;

      return isBalanced;
    } catch (error) {
      logger.error("Failed to match entries N:M", { error, entryIds1, entryIds2 });
      return false;
    }
  }

  /**
   * تسوية الحركات المطابقة (الترحيل للحساب الدائم)
   */
  static async reconcileMatchedEntries(data: {
    businessId: number;
    matchedEntryIds: number[];
    description: string;
    createdBy: number;
  }): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // جلب جميع القيود المطابقة
      const entries = await db
        .select()
        .from(journalEntries)
        .where(inArray(journalEntries.id, data.matchedEntryIds));

      if (entries.length === 0) {
        throw new Error("لا توجد قيود للمطابقة");
      }

      // حساب الإجماليات
      const totalDebit = entries.reduce((sum, e) => sum + parseFloat(e.totalDebit || "0"), 0);
      const totalCredit = entries.reduce((sum, e) => sum + parseFloat(e.totalCredit || "0"), 0);

      // التحقق من التوازن
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`التسوية غير متوازنة: المدين=${totalDebit.toFixed(2)}, الدائن=${totalCredit.toFixed(2)}`);
      }

      // جلب بنود القيود
      const allLines = await db
        .select()
        .from(journalEntryLines)
        .where(inArray(journalEntryLines.entryId, data.matchedEntryIds));

      // تجميع حسب الحساب
      const accountTotals = new Map<number, { debit: number; credit: number }>();

      for (const line of allLines) {
        const accountId = line.accountId;
        if (!accountTotals.has(accountId)) {
          accountTotals.set(accountId, { debit: 0, credit: 0 });
        }
        const totals = accountTotals.get(accountId)!;
        totals.debit += parseFloat(line.debit || "0");
        totals.credit += parseFloat(line.credit || "0");
      }

      // الحصول على الفترة المحاسبية
      const [period] = await db
        .select({ id: fiscalPeriods.id })
        .from(fiscalPeriods)
        .where(and(eq(fiscalPeriods.businessId, data.businessId), eq(fiscalPeriods.status, "open")))
        .limit(1);

      if (!period) {
        throw new Error("لا توجد فترة محاسبية نشطة");
      }

      // إنشاء قيد التسوية
      const entryNumber = `REC-${Date.now()}`;
      const [reconciliationEntry] = await db.insert(journalEntries).values({
        businessId: data.businessId,
        entryNumber,
        entryDate: new Date(),
        periodId: period.id,
        type: "auto",
        sourceModule: "reconciliation",
        description: data.description,
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        status: "posted",
        createdBy: data.createdBy,
        postedBy: data.createdBy,
        postedAt: new Date(),
      });

      const reconciliationEntryId = reconciliationEntry.insertId;

      // إنشاء بنود القيد (ترحيل للحسابات الدائمة)
      let lineNumber = 1;
      for (const [accountId, totals] of accountTotals.entries()) {
        // جلب الحساب الأصلي (غير الوسيط)
        const [account] = await db
          .select()
          .from(accounts)
          .where(eq(accounts.id, accountId))
          .limit(1);

        if (!account) continue;

        // إذا كان حساب وسيط، نبحث عن الحساب الأصلي
        let permanentAccountId = accountId;
        if (account.description?.includes("وسيط") && account.parentId) {
          permanentAccountId = account.parentId;
        }

        // إنشاء بند القيد
        await db.insert(journalEntryLines).values({
          entryId: reconciliationEntryId,
          lineNumber: lineNumber++,
          accountId: permanentAccountId,
          debit: totals.debit.toFixed(2),
          credit: totals.credit.toFixed(2),
          description: `تسوية من ${account.nameAr}`,
        });

        // تحديث رصيد الحساب الدائم
        const [permanentAccount] = await db
          .select()
          .from(accounts)
          .where(eq(accounts.id, permanentAccountId))
          .limit(1);

        if (permanentAccount) {
          const currentBalance = parseFloat(permanentAccount.currentBalance || "0");
          let newBalance: number;
          if (permanentAccount.nature === "debit") {
            newBalance = currentBalance + totals.debit - totals.credit;
          } else {
            newBalance = currentBalance + totals.credit - totals.debit;
          }

          await db
            .update(accounts)
            .set({ currentBalance: newBalance.toFixed(2) })
            .where(eq(accounts.id, permanentAccountId));
        }
      }

      logger.info("Reconciliation completed", {
        reconciliationEntryId,
        matchedEntries: data.matchedEntryIds.length,
        totalDebit,
        totalCredit,
      });

      return reconciliationEntryId;
    } catch (error: any) {
      logger.error("Failed to reconcile matched entries", {
        error: error.message,
        data,
      });
      throw error;
    }
  }
}

