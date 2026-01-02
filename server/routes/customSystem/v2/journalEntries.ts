/**
 * النظام المخصص v2.2.0 - Journal Entries Router
 * إدارة القيود اليومية (القيد المزدوج)
 */

import { Router } from "express";
import { db } from "../../../db";
import {
  customJournalEntries,
  customJournalEntryLines,
  customAccountBalances,
  customAccounts,
  type InsertCustomJournalEntry,
  type InsertCustomJournalEntryLine,
} from "../../../../drizzle/schemas/customSystemV2";
import { eq, and, desc, between, sql } from "drizzle-orm";

const router = Router();

/**
 * GET /api/custom-system/v2/journal-entries
 * الحصول على جميع القيود اليومية
 */
router.get("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { subSystemId, status, startDate, endDate, entryType } = req.query;

    let query = db
      .select()
      .from(customJournalEntries)
      .where(eq(customJournalEntries.businessId, businessId));

    if (subSystemId) {
      query = query.where(eq(customJournalEntries.subSystemId, parseInt(String(subSystemId))));
    }

    if (status) {
      query = query.where(eq(customJournalEntries.status, String(status)));
    }

    if (entryType) {
      query = query.where(eq(customJournalEntries.entryType, String(entryType)));
    }

    if (startDate && endDate) {
      query = query.where(
        between(customJournalEntries.entryDate, String(startDate), String(endDate))
      );
    }

    const entries = await query.orderBy(desc(customJournalEntries.entryDate), desc(customJournalEntries.id));

    res.json(entries);
  } catch (error) {
    console.error("خطأ في جلب القيود اليومية:", error);
    res.status(500).json({ error: "فشل في جلب القيود اليومية" });
  }
});

/**
 * GET /api/custom-system/v2/journal-entries/:id
 * الحصول على قيد يومي محدد مع سطوره
 */
router.get("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const entryId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(entryId)) {
      return res.status(400).json({ error: "معرف القيد غير صحيح" });
    }

    // جلب القيد
    const [entry] = await db
      .select()
      .from(customJournalEntries)
      .where(
        and(
          eq(customJournalEntries.id, entryId),
          eq(customJournalEntries.businessId, businessId)
        )
      )
      .limit(1);

    if (!entry) {
      return res.status(404).json({ error: "القيد غير موجود" });
    }

    // جلب سطور القيد
    const lines = await db
      .select()
      .from(customJournalEntryLines)
      .where(eq(customJournalEntryLines.journalEntryId, entryId))
      .orderBy(customJournalEntryLines.lineOrder);

    res.json({ ...entry, lines });
  } catch (error) {
    console.error("خطأ في جلب القيد:", error);
    res.status(500).json({ error: "فشل في جلب القيد" });
  }
});

/**
 * POST /api/custom-system/v2/journal-entries
 * إنشاء قيد يومي جديد
 */
router.post("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      subSystemId,
      entryNumber,
      entryDate,
      entryType,
      description,
      notes,
      referenceType,
      referenceId,
      referenceNumber,
      lines,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!entryNumber || !entryDate || !entryType || !description || !lines || lines.length === 0) {
      return res.status(400).json({
        error: "رقم القيد، التاريخ، النوع، الوصف، والسطور مطلوبة",
      });
    }

    // التحقق من عدم تكرار رقم القيد
    const [existing] = await db
      .select()
      .from(customJournalEntries)
      .where(
        and(
          eq(customJournalEntries.businessId, businessId),
          eq(customJournalEntries.entryNumber, entryNumber)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "رقم القيد موجود مسبقاً" });
    }

    // التحقق من توازن القيد (مدين = دائن)
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      totalDebit += parseFloat(line.debitAmount || 0);
      totalCredit += parseFloat(line.creditAmount || 0);
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        error: "القيد غير متوازن: مجموع المدين يجب أن يساوي مجموع الدائن",
        totalDebit,
        totalCredit,
      });
    }

    // إنشاء القيد
    const newEntry: InsertCustomJournalEntry = {
      businessId,
      subSystemId: subSystemId || null,
      entryNumber,
      entryDate,
      entryType,
      description,
      notes: notes || null,
      referenceType: referenceType || null,
      referenceId: referenceId || null,
      referenceNumber: referenceNumber || null,
      status: "draft",
      createdBy: userId,
    };

    const [entryResult] = await db.insert(customJournalEntries).values(newEntry);
    const journalEntryId = entryResult.insertId;

    // إنشاء سطور القيد
    const lineValues: InsertCustomJournalEntryLine[] = lines.map((line: any, index: number) => ({
      businessId,
      journalEntryId,
      accountId: line.accountId,
      debitAmount: String(line.debitAmount || 0),
      creditAmount: String(line.creditAmount || 0),
      currencyId: line.currencyId,
      exchangeRate: line.exchangeRate ? String(line.exchangeRate) : "1.000000",
      debitAmountBase: String(line.debitAmountBase || line.debitAmount || 0),
      creditAmountBase: String(line.creditAmountBase || line.creditAmount || 0),
      description: line.description || null,
      partyId: line.partyId || null,
      costCenterId: line.costCenterId || null,
      lineOrder: index + 1,
    }));

    await db.insert(customJournalEntryLines).values(lineValues);

    // جلب القيد المُنشأ مع سطوره
    const [created] = await db
      .select()
      .from(customJournalEntries)
      .where(eq(customJournalEntries.id, journalEntryId))
      .limit(1);

    const createdLines = await db
      .select()
      .from(customJournalEntryLines)
      .where(eq(customJournalEntryLines.journalEntryId, journalEntryId))
      .orderBy(customJournalEntryLines.lineOrder);

    res.status(201).json({ ...created, lines: createdLines });
  } catch (error) {
    console.error("خطأ في إنشاء القيد:", error);
    res.status(500).json({ error: "فشل في إنشاء القيد" });
  }
});

/**
 * PUT /api/custom-system/v2/journal-entries/:id
 * تحديث قيد يومي (فقط إذا كان draft)
 */
router.put("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const entryId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(entryId)) {
      return res.status(400).json({ error: "معرف القيد غير صحيح" });
    }

    // التحقق من وجود القيد
    const [existing] = await db
      .select()
      .from(customJournalEntries)
      .where(
        and(
          eq(customJournalEntries.id, entryId),
          eq(customJournalEntries.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "القيد غير موجود" });
    }

    // منع تعديل القيود المرحلة
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "لا يمكن تعديل قيد مرحّل" });
    }

    const {
      subSystemId,
      entryDate,
      entryType,
      description,
      notes,
      referenceType,
      referenceId,
      referenceNumber,
      lines,
    } = req.body;

    // إذا تم تحديث السطور، التحقق من التوازن
    if (lines && lines.length > 0) {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const line of lines) {
        totalDebit += parseFloat(line.debitAmount || 0);
        totalCredit += parseFloat(line.creditAmount || 0);
      }

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({
          error: "القيد غير متوازن: مجموع المدين يجب أن يساوي مجموع الدائن",
          totalDebit,
          totalCredit,
        });
      }

      // حذف السطور القديمة
      await db
        .delete(customJournalEntryLines)
        .where(eq(customJournalEntryLines.journalEntryId, entryId));

      // إنشاء السطور الجديدة
      const lineValues: InsertCustomJournalEntryLine[] = lines.map((line: any, index: number) => ({
        businessId,
        journalEntryId: entryId,
        accountId: line.accountId,
        debitAmount: String(line.debitAmount || 0),
        creditAmount: String(line.creditAmount || 0),
        currencyId: line.currencyId,
        exchangeRate: line.exchangeRate ? String(line.exchangeRate) : "1.000000",
        debitAmountBase: String(line.debitAmountBase || line.debitAmount || 0),
        creditAmountBase: String(line.creditAmountBase || line.creditAmount || 0),
        description: line.description || null,
        partyId: line.partyId || null,
        costCenterId: line.costCenterId || null,
        lineOrder: index + 1,
      }));

      await db.insert(customJournalEntryLines).values(lineValues);
    }

    // تحديث بيانات القيد
    const updateData: Partial<InsertCustomJournalEntry> = {};
    if (subSystemId !== undefined) updateData.subSystemId = subSystemId || null;
    if (entryDate) updateData.entryDate = entryDate;
    if (entryType) updateData.entryType = entryType;
    if (description) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes || null;
    if (referenceType !== undefined) updateData.referenceType = referenceType || null;
    if (referenceId !== undefined) updateData.referenceId = referenceId || null;
    if (referenceNumber !== undefined) updateData.referenceNumber = referenceNumber || null;

    await db
      .update(customJournalEntries)
      .set(updateData)
      .where(
        and(
          eq(customJournalEntries.id, entryId),
          eq(customJournalEntries.businessId, businessId)
        )
      );

    // جلب القيد المحدث مع سطوره
    const [updated] = await db
      .select()
      .from(customJournalEntries)
      .where(eq(customJournalEntries.id, entryId))
      .limit(1);

    const updatedLines = await db
      .select()
      .from(customJournalEntryLines)
      .where(eq(customJournalEntryLines.journalEntryId, entryId))
      .orderBy(customJournalEntryLines.lineOrder);

    res.json({ ...updated, lines: updatedLines });
  } catch (error) {
    console.error("خطأ في تحديث القيد:", error);
    res.status(500).json({ error: "فشل في تحديث القيد" });
  }
});

/**
 * POST /api/custom-system/v2/journal-entries/:id/post
 * ترحيل قيد يومي (تحديث الأرصدة)
 */
router.post("/:id/post", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.id;
    const entryId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(entryId)) {
      return res.status(400).json({ error: "معرف القيد غير صحيح" });
    }

    // التحقق من وجود القيد
    const [entry] = await db
      .select()
      .from(customJournalEntries)
      .where(
        and(
          eq(customJournalEntries.id, entryId),
          eq(customJournalEntries.businessId, businessId)
        )
      )
      .limit(1);

    if (!entry) {
      return res.status(404).json({ error: "القيد غير موجود" });
    }

    // التحقق من أن القيد draft
    if (entry.status !== "draft") {
      return res.status(400).json({ error: "القيد مرحّل مسبقاً أو ملغى" });
    }

    // جلب سطور القيد
    const lines = await db
      .select()
      .from(customJournalEntryLines)
      .where(eq(customJournalEntryLines.journalEntryId, entryId));

    if (lines.length === 0) {
      return res.status(400).json({ error: "القيد لا يحتوي على سطور" });
    }

    // تحديث أرصدة الحسابات
    for (const line of lines) {
      const debitAmount = parseFloat(line.debitAmountBase);
      const creditAmount = parseFloat(line.creditAmountBase);

      // جلب الرصيد الحالي أو إنشاء رصيد جديد
      const [balance] = await db
        .select()
        .from(customAccountBalances)
        .where(
          and(
            eq(customAccountBalances.accountId, line.accountId),
            eq(customAccountBalances.currencyId, line.currencyId)
          )
        )
        .limit(1);

      if (balance) {
        // تحديث الرصيد الموجود
        const newDebitBalance = parseFloat(balance.debitBalance) + debitAmount;
        const newCreditBalance = parseFloat(balance.creditBalance) + creditAmount;
        const newCurrentBalance = newDebitBalance - newCreditBalance;

        await db
          .update(customAccountBalances)
          .set({
            debitBalance: String(newDebitBalance),
            creditBalance: String(newCreditBalance),
            currentBalance: String(newCurrentBalance),
            lastTransactionDate: entry.entryDate,
            lastTransactionId: entryId,
          })
          .where(eq(customAccountBalances.id, balance.id));
      } else {
        // إنشاء رصيد جديد
        const newCurrentBalance = debitAmount - creditAmount;

        await db.insert(customAccountBalances).values({
          businessId,
          accountId: line.accountId,
          currencyId: line.currencyId,
          debitBalance: String(debitAmount),
          creditBalance: String(creditAmount),
          currentBalance: String(newCurrentBalance),
          lastTransactionDate: entry.entryDate,
          lastTransactionId: entryId,
        });
      }
    }

    // تحديث حالة القيد
    await db
      .update(customJournalEntries)
      .set({
        status: "posted",
        postedAt: new Date(),
        postedBy: userId,
      })
      .where(eq(customJournalEntries.id, entryId));

    // جلب القيد المحدث
    const [posted] = await db
      .select()
      .from(customJournalEntries)
      .where(eq(customJournalEntries.id, entryId))
      .limit(1);

    res.json(posted);
  } catch (error) {
    console.error("خطأ في ترحيل القيد:", error);
    res.status(500).json({ error: "فشل في ترحيل القيد" });
  }
});

/**
 * POST /api/custom-system/v2/journal-entries/:id/reverse
 * عكس قيد يومي (إنشاء قيد عكسي)
 */
router.post("/:id/reverse", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.id;
    const entryId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(entryId)) {
      return res.status(400).json({ error: "معرف القيد غير صحيح" });
    }

    const { reversalDate, reversalReason } = req.body;

    if (!reversalDate) {
      return res.status(400).json({ error: "تاريخ العكس مطلوب" });
    }

    // التحقق من وجود القيد
    const [entry] = await db
      .select()
      .from(customJournalEntries)
      .where(
        and(
          eq(customJournalEntries.id, entryId),
          eq(customJournalEntries.businessId, businessId)
        )
      )
      .limit(1);

    if (!entry) {
      return res.status(404).json({ error: "القيد غير موجود" });
    }

    // التحقق من أن القيد مرحّل
    if (entry.status !== "posted") {
      return res.status(400).json({ error: "لا يمكن عكس قيد غير مرحّل" });
    }

    // جلب سطور القيد الأصلي
    const originalLines = await db
      .select()
      .from(customJournalEntryLines)
      .where(eq(customJournalEntryLines.journalEntryId, entryId));

    // إنشاء رقم قيد جديد
    const reversalNumber = `${entry.entryNumber}-REV`;

    // إنشاء القيد العكسي
    const reversalEntry: InsertCustomJournalEntry = {
      businessId,
      subSystemId: entry.subSystemId,
      entryNumber: reversalNumber,
      entryDate: reversalDate,
      entryType: "reversal",
      description: `عكس قيد: ${entry.description}`,
      notes: reversalReason || `عكس القيد رقم ${entry.entryNumber}`,
      referenceType: "journal_entry",
      referenceId: entryId,
      referenceNumber: entry.entryNumber,
      status: "posted",
      postedAt: new Date(),
      postedBy: userId,
      createdBy: userId,
    };

    const [reversalResult] = await db.insert(customJournalEntries).values(reversalEntry);
    const reversalEntryId = reversalResult.insertId;

    // إنشاء سطور القيد العكسي (عكس المدين والدائن)
    const reversalLines: InsertCustomJournalEntryLine[] = originalLines.map((line, index) => ({
      businessId,
      journalEntryId: reversalEntryId,
      accountId: line.accountId,
      debitAmount: line.creditAmount, // عكس
      creditAmount: line.debitAmount, // عكس
      currencyId: line.currencyId,
      exchangeRate: line.exchangeRate,
      debitAmountBase: line.creditAmountBase, // عكس
      creditAmountBase: line.debitAmountBase, // عكس
      description: line.description,
      partyId: line.partyId,
      costCenterId: line.costCenterId,
      lineOrder: index + 1,
    }));

    await db.insert(customJournalEntryLines).values(reversalLines);

    // تحديث أرصدة الحسابات
    for (const line of reversalLines) {
      const debitAmount = parseFloat(line.debitAmountBase);
      const creditAmount = parseFloat(line.creditAmountBase);

      const [balance] = await db
        .select()
        .from(customAccountBalances)
        .where(
          and(
            eq(customAccountBalances.accountId, line.accountId),
            eq(customAccountBalances.currencyId, line.currencyId)
          )
        )
        .limit(1);

      if (balance) {
        const newDebitBalance = parseFloat(balance.debitBalance) + debitAmount;
        const newCreditBalance = parseFloat(balance.creditBalance) + creditAmount;
        const newCurrentBalance = newDebitBalance - newCreditBalance;

        await db
          .update(customAccountBalances)
          .set({
            debitBalance: String(newDebitBalance),
            creditBalance: String(newCreditBalance),
            currentBalance: String(newCurrentBalance),
            lastTransactionDate: reversalDate,
            lastTransactionId: reversalEntryId,
          })
          .where(eq(customAccountBalances.id, balance.id));
      }
    }

    // تحديث القيد الأصلي
    await db
      .update(customJournalEntries)
      .set({
        status: "reversed",
        reversedAt: new Date(),
        reversedBy: userId,
        reversalEntryId: reversalEntryId,
      })
      .where(eq(customJournalEntries.id, entryId));

    // جلب القيد العكسي
    const [created] = await db
      .select()
      .from(customJournalEntries)
      .where(eq(customJournalEntries.id, reversalEntryId))
      .limit(1);

    const createdLines = await db
      .select()
      .from(customJournalEntryLines)
      .where(eq(customJournalEntryLines.journalEntryId, reversalEntryId))
      .orderBy(customJournalEntryLines.lineOrder);

    res.status(201).json({ ...created, lines: createdLines });
  } catch (error) {
    console.error("خطأ في عكس القيد:", error);
    res.status(500).json({ error: "فشل في عكس القيد" });
  }
});

/**
 * DELETE /api/custom-system/v2/journal-entries/:id
 * حذف قيد يومي (فقط إذا كان draft)
 */
router.delete("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const entryId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(entryId)) {
      return res.status(400).json({ error: "معرف القيد غير صحيح" });
    }

    // التحقق من وجود القيد
    const [existing] = await db
      .select()
      .from(customJournalEntries)
      .where(
        and(
          eq(customJournalEntries.id, entryId),
          eq(customJournalEntries.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "القيد غير موجود" });
    }

    // منع حذف القيود المرحلة
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "لا يمكن حذف قيد مرحّل" });
    }

    // حذف السطور
    await db
      .delete(customJournalEntryLines)
      .where(eq(customJournalEntryLines.journalEntryId, entryId));

    // حذف القيد
    await db
      .delete(customJournalEntries)
      .where(
        and(
          eq(customJournalEntries.id, entryId),
          eq(customJournalEntries.businessId, businessId)
        )
      );

    res.json({ message: "تم حذف القيد بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف القيد:", error);
    res.status(500).json({ error: "فشل في حذف القيد" });
  }
});

export default router;
