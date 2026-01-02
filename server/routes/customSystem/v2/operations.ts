/**
 * النظام المخصص v2.2.0 - Operations Router
 * شاشة العمليات الموحدة (سند قبض، سند صرف، تحويل بين الحسابات)
 */

import { Router } from "express";
import { getDb } from "../../../db";
import {
  customJournalEntries,
  customJournalEntryLines,
  customAccountBalances,
  customAccounts,
  customCurrencies,
  customReceipts,
  customPayments,
  type InsertCustomJournalEntry,
  type InsertCustomJournalEntryLine,
  type InsertCustomReceipt,
  type InsertCustomPayment,
} from "../../../../drizzle/schemas/customSystemV2";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

async function resolveValidatedExchangeRate(params: {
  db: any;
  businessId: number;
  currencyId: number;
  exchangeRate?: unknown;
}) {
  const { db, businessId, currencyId, exchangeRate } = params;

  const [currency] = await db
    .select()
    .from(customCurrencies)
    .where(and(eq(customCurrencies.businessId, businessId), eq(customCurrencies.id, currencyId)))
    .limit(1);

  if (!currency) {
    return { status: 404 as const, error: "العملة غير موجودة" };
  }

  // العملة الأساسية: السعر = 1 دائماً
  if (currency.isBaseCurrency) {
    return { rate: 1.0 };
  }

  const fallbackRate = currency.currentRate ?? null;
  const raw = exchangeRate ?? fallbackRate;

  if (raw === null || raw === undefined || raw === "") {
    return { status: 400 as const, error: "سعر الصرف مطلوب لهذه العملة" };
  }

  const rateNum = typeof raw === "number" ? raw : parseFloat(String(raw));
  if (!Number.isFinite(rateNum) || rateNum <= 0) {
    return { status: 400 as const, error: "سعر الصرف غير صحيح" };
  }

  const min = currency.minRate ? parseFloat(String(currency.minRate)) : null;
  const max = currency.maxRate ? parseFloat(String(currency.maxRate)) : null;

  if (min !== null && rateNum < min) {
    return { status: 400 as const, error: `سعر الصرف أقل من الحد الأدنى (${currency.minRate})` };
  }
  if (max !== null && rateNum > max) {
    return { status: 400 as const, error: `سعر الصرف أعلى من الحد الأعلى (${currency.maxRate})` };
  }

  return { rate: rateNum };
}

/**
 * POST /api/custom-system/v2/operations/receipt
 * إنشاء سند قبض (مع قيد يومي تلقائي)
 */
router.post("/receipt", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "قاعدة البيانات غير متاحة" });
    }
    
    const businessId = (req as any).user?.businessId;
    const userId = (req as any).user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      subSystemId,
      receiptNumber,
      receiptDate,
      fromAccountId,
      toAccountId,
      amount,
      currencyId,
      exchangeRate,
      description,
      notes,
      attachments,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!receiptNumber || !receiptDate || !fromAccountId || !toAccountId || !amount || !currencyId) {
      return res.status(400).json({
        error: "رقم السند، التاريخ، الحساب المدين، الحساب الدائن، المبلغ، والعملة مطلوبة",
      });
    }

    // التحقق من أن الحسابين مختلفين
    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: "لا يمكن التحويل من وإلى نفس الحساب" });
    }

    const currencyIdNum = parseInt(String(currencyId));
    if (isNaN(currencyIdNum)) {
      return res.status(400).json({ error: "معرف العملة غير صحيح" });
    }

    const resolvedRate = await resolveValidatedExchangeRate({
      db,
      businessId,
      currencyId: currencyIdNum,
      exchangeRate,
    });

    if ("error" in resolvedRate) {
      return res.status(resolvedRate.status).json({ error: resolvedRate.error });
    }

    // حساب المبلغ بالعملة الأساسية
    const rate = resolvedRate.rate;
    const amountInBase = parseFloat(amount) * rate;

    // إنشاء رقم قيد تلقائي
    const entryNumber = `REC-${receiptNumber}`;

    // إنشاء القيد اليومي
    const journalEntry: InsertCustomJournalEntry = {
      businessId,
      subSystemId: subSystemId || null,
      entryNumber,
      entryDate: receiptDate,
      entryType: "system_generated",
      description: description || `سند قبض رقم ${receiptNumber}`,
      notes: notes || null,
      referenceType: "receipt",
      referenceNumber: receiptNumber,
      status: "posted",
      postedAt: new Date(),
      postedBy: userId,
      createdBy: userId,
    };

    const [entryResult] = await db.insert(customJournalEntries).values(journalEntry);
    const journalEntryId = entryResult.insertId;

    // إنشاء سطور القيد (مدين: الحساب المستلم، دائن: الحساب الدافع)
    const lines: InsertCustomJournalEntryLine[] = [
      {
        businessId,
        journalEntryId,
        accountId: toAccountId, // الحساب المستلم (مدين)
        debitAmount: String(amount),
        creditAmount: "0.00",
        currencyId: currencyIdNum,
        exchangeRate: String(rate),
        debitAmountBase: String(amountInBase),
        creditAmountBase: "0.00",
        description: description || null,
        lineOrder: 1,
      },
      {
        businessId,
        journalEntryId,
        accountId: fromAccountId, // الحساب الدافع (دائن)
        debitAmount: "0.00",
        creditAmount: String(amount),
        currencyId: currencyIdNum,
        exchangeRate: String(rate),
        debitAmountBase: "0.00",
        creditAmountBase: String(amountInBase),
        description: description || null,
        lineOrder: 2,
      },
    ];

    await db.insert(customJournalEntryLines).values(lines);

    // تحديث أرصدة الحسابات
    for (const line of lines) {
      const debitAmount = parseFloat(line.debitAmountBase);
      const creditAmount = parseFloat(line.creditAmountBase);

      const [balance] = await db
        .select()
        .from(customAccountBalances)
        .where(
          and(
            eq(customAccountBalances.accountId, line.accountId),
            eq(customAccountBalances.currencyId, currencyIdNum)
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
            lastTransactionDate: receiptDate,
            lastTransactionId: journalEntryId,
          })
          .where(eq(customAccountBalances.id, balance.id));
      } else {
        const newCurrentBalance = debitAmount - creditAmount;

        await db.insert(customAccountBalances).values({
          businessId,
          accountId: line.accountId,
          currencyId: currencyIdNum,
          debitBalance: String(debitAmount),
          creditBalance: String(creditAmount),
          currentBalance: String(newCurrentBalance),
          lastTransactionDate: receiptDate,
          lastTransactionId: journalEntryId,
        });
      }
    }

    // إنشاء سند القبض
    const receipt: InsertCustomReceipt = {
      businessId,
      subSystemId: subSystemId || null,
      voucherNumber: receiptNumber, // استخدام voucherNumber بدلاً من receiptNumber
      voucherDate: receiptDate, // استخدام voucherDate بدلاً من receiptDate
      amount: String(amount),
      currencyId: currencyIdNum,
      exchangeRate: String(rate),
      amountInBaseCurrency: String(amountInBase),
      journalEntryId,
      sourceIntermediaryId: fromAccountId, // استخدام sourceIntermediaryId بدلاً من fromAccountId
      treasuryId: toAccountId, // استخدام treasuryId بدلاً من toAccountId
      description: description || null,
      attachments: attachments || notes || null, // استخدام attachments بدلاً من notes
      status: "approved",
      createdBy: userId,
    };

    const [receiptResult] = await db.insert(customReceipts).values(receipt);

    // تحديث القيد بمعرف السند
    await db
      .update(customJournalEntries)
      .set({ referenceId: receiptResult.insertId })
      .where(eq(customJournalEntries.id, journalEntryId));

    // جلب السند المُنشأ
    const [created] = await db
      .select()
      .from(customReceipts)
      .where(eq(customReceipts.id, receiptResult.insertId))
      .limit(1);

    res.status(201).json(created);
  } catch (error) {
    console.error("خطأ في إنشاء سند القبض:", error);
    res.status(500).json({ error: "فشل في إنشاء سند القبض" });
  }
});

/**
 * POST /api/custom-system/v2/operations/payment
 * إنشاء سند صرف (مع قيد يومي تلقائي)
 */
router.post("/payment", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "قاعدة البيانات غير متاحة" });
    }
    
    const businessId = (req as any).user?.businessId;
    const userId = (req as any).user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      subSystemId,
      paymentNumber,
      paymentDate,
      fromAccountId,
      toAccountId,
      amount,
      currencyId,
      exchangeRate,
      description,
      notes,
      attachments,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!paymentNumber || !paymentDate || !fromAccountId || !toAccountId || !amount || !currencyId) {
      return res.status(400).json({
        error: "رقم السند، التاريخ، الحساب المدين، الحساب الدائن، المبلغ، والعملة مطلوبة",
      });
    }

    // التحقق من أن الحسابين مختلفين
    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: "لا يمكن التحويل من وإلى نفس الحساب" });
    }

    const currencyIdNum = parseInt(String(currencyId));
    if (isNaN(currencyIdNum)) {
      return res.status(400).json({ error: "معرف العملة غير صحيح" });
    }

    const resolvedRate = await resolveValidatedExchangeRate({
      db,
      businessId,
      currencyId: currencyIdNum,
      exchangeRate,
    });

    if ("error" in resolvedRate) {
      return res.status(resolvedRate.status).json({ error: resolvedRate.error });
    }

    // حساب المبلغ بالعملة الأساسية
    const rate = resolvedRate.rate;
    const amountInBase = parseFloat(amount) * rate;

    // إنشاء رقم قيد تلقائي
    const entryNumber = `PAY-${paymentNumber}`;

    // إنشاء القيد اليومي
    const journalEntry: InsertCustomJournalEntry = {
      businessId,
      subSystemId: subSystemId || null,
      entryNumber,
      entryDate: paymentDate,
      entryType: "system_generated",
      description: description || `سند صرف رقم ${paymentNumber}`,
      notes: notes || null,
      referenceType: "payment",
      referenceNumber: paymentNumber,
      status: "posted",
      postedAt: new Date(),
      postedBy: userId,
      createdBy: userId,
    };

    const [entryResult] = await db.insert(customJournalEntries).values(journalEntry);
    const journalEntryId = entryResult.insertId;

    // إنشاء سطور القيد (مدين: الحساب المستلم، دائن: الحساب الدافع)
    const lines: InsertCustomJournalEntryLine[] = [
      {
        businessId,
        journalEntryId,
        accountId: toAccountId, // الحساب المستلم (مدين)
        debitAmount: String(amount),
        creditAmount: "0.00",
        currencyId: currencyIdNum,
        exchangeRate: String(rate),
        debitAmountBase: String(amountInBase),
        creditAmountBase: "0.00",
        description: description || null,
        lineOrder: 1,
      },
      {
        businessId,
        journalEntryId,
        accountId: fromAccountId, // الحساب الدافع (دائن)
        debitAmount: "0.00",
        creditAmount: String(amount),
        currencyId: currencyIdNum,
        exchangeRate: String(rate),
        debitAmountBase: "0.00",
        creditAmountBase: String(amountInBase),
        description: description || null,
        lineOrder: 2,
      },
    ];

    await db.insert(customJournalEntryLines).values(lines);

    // تحديث أرصدة الحسابات
    for (const line of lines) {
      const debitAmount = parseFloat(line.debitAmountBase);
      const creditAmount = parseFloat(line.creditAmountBase);

      const [balance] = await db
        .select()
        .from(customAccountBalances)
        .where(
          and(
            eq(customAccountBalances.accountId, line.accountId),
            eq(customAccountBalances.currencyId, currencyIdNum)
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
            lastTransactionDate: paymentDate,
            lastTransactionId: journalEntryId,
          })
          .where(eq(customAccountBalances.id, balance.id));
      } else {
        const newCurrentBalance = debitAmount - creditAmount;

        await db.insert(customAccountBalances).values({
          businessId,
          accountId: line.accountId,
          currencyId: currencyIdNum,
          debitBalance: String(debitAmount),
          creditBalance: String(creditAmount),
          currentBalance: String(newCurrentBalance),
          lastTransactionDate: paymentDate,
          lastTransactionId: journalEntryId,
        });
      }
    }

    // إنشاء سند الصرف
    const payment: InsertCustomPayment = {
      businessId,
      subSystemId: subSystemId || null,
      voucherNumber: paymentNumber, // استخدام voucherNumber بدلاً من paymentNumber
      voucherDate: paymentDate, // استخدام voucherDate بدلاً من paymentDate
      amount: String(amount),
      currencyId: currencyIdNum,
      exchangeRate: String(rate),
      amountInBaseCurrency: String(amountInBase),
      journalEntryId,
      treasuryId: fromAccountId, // استخدام treasuryId بدلاً من fromAccountId
      destinationIntermediaryId: toAccountId, // استخدام destinationIntermediaryId بدلاً من toAccountId
      description: description || null,
      attachments: attachments || notes || null, // استخدام attachments بدلاً من notes
      status: "approved",
      createdBy: userId,
    };

    const [paymentResult] = await db.insert(customPayments).values(payment);

    // تحديث القيد بمعرف السند
    await db
      .update(customJournalEntries)
      .set({ referenceId: paymentResult.insertId })
      .where(eq(customJournalEntries.id, journalEntryId));

    // جلب السند المُنشأ
    const [created] = await db
      .select()
      .from(customPayments)
      .where(eq(customPayments.id, paymentResult.insertId))
      .limit(1);

    res.status(201).json(created);
  } catch (error) {
    console.error("خطأ في إنشاء سند الصرف:", error);
    res.status(500).json({ error: "فشل في إنشاء سند الصرف" });
  }
});

/**
 * POST /api/custom-system/v2/operations/transfer
 * تحويل بين حسابين (مع قيد يومي تلقائي)
 */
router.post("/transfer", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "قاعدة البيانات غير متاحة" });
    }
    
    const businessId = (req as any).user?.businessId;
    const userId = (req as any).user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      subSystemId,
      transferNumber,
      transferDate,
      fromAccountId,
      toAccountId,
      amount,
      currencyId,
      exchangeRate,
      description,
      notes,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!transferNumber || !transferDate || !fromAccountId || !toAccountId || !amount || !currencyId) {
      return res.status(400).json({
        error: "رقم التحويل، التاريخ، الحساب المصدر، الحساب الهدف، المبلغ، والعملة مطلوبة",
      });
    }

    // التحقق من أن الحسابين مختلفين
    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: "لا يمكن التحويل من وإلى نفس الحساب" });
    }

    const currencyIdNum = parseInt(String(currencyId));
    if (isNaN(currencyIdNum)) {
      return res.status(400).json({ error: "معرف العملة غير صحيح" });
    }

    const resolvedRate = await resolveValidatedExchangeRate({
      db,
      businessId,
      currencyId: currencyIdNum,
      exchangeRate,
    });

    if ("error" in resolvedRate) {
      return res.status(resolvedRate.status).json({ error: resolvedRate.error });
    }

    // حساب المبلغ بالعملة الأساسية
    const rate = resolvedRate.rate;
    const amountInBase = parseFloat(amount) * rate;

    // إنشاء رقم قيد تلقائي
    const entryNumber = `TRF-${transferNumber}`;

    // إنشاء القيد اليومي
    const journalEntry: InsertCustomJournalEntry = {
      businessId,
      subSystemId: subSystemId || null,
      entryNumber,
      entryDate: transferDate,
      entryType: "system_generated",
      description: description || `تحويل رقم ${transferNumber}`,
      notes: notes || null,
      referenceType: "transfer",
      referenceNumber: transferNumber,
      status: "posted",
      postedAt: new Date(),
      postedBy: userId,
      createdBy: userId,
    };

    const [entryResult] = await db.insert(customJournalEntries).values(journalEntry);
    const journalEntryId = entryResult.insertId;

    // إنشاء سطور القيد (مدين: الحساب الهدف، دائن: الحساب المصدر)
    const lines: InsertCustomJournalEntryLine[] = [
      {
        businessId,
        journalEntryId,
        accountId: toAccountId, // الحساب الهدف (مدين)
        debitAmount: String(amount),
        creditAmount: "0.00",
        currencyId: currencyIdNum,
        exchangeRate: String(rate),
        debitAmountBase: String(amountInBase),
        creditAmountBase: "0.00",
        description: description || null,
        lineOrder: 1,
      },
      {
        businessId,
        journalEntryId,
        accountId: fromAccountId, // الحساب المصدر (دائن)
        debitAmount: "0.00",
        creditAmount: String(amount),
        currencyId: currencyIdNum,
        exchangeRate: String(rate),
        debitAmountBase: "0.00",
        creditAmountBase: String(amountInBase),
        description: description || null,
        lineOrder: 2,
      },
    ];

    await db.insert(customJournalEntryLines).values(lines);

    // تحديث أرصدة الحسابات
    for (const line of lines) {
      const debitAmount = parseFloat(line.debitAmountBase);
      const creditAmount = parseFloat(line.creditAmountBase);

      const [balance] = await db
        .select()
        .from(customAccountBalances)
        .where(
          and(
            eq(customAccountBalances.accountId, line.accountId),
            eq(customAccountBalances.currencyId, currencyIdNum)
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
            lastTransactionDate: transferDate,
            lastTransactionId: journalEntryId,
          })
          .where(eq(customAccountBalances.id, balance.id));
      } else {
        const newCurrentBalance = debitAmount - creditAmount;

        await db.insert(customAccountBalances).values({
          businessId,
          accountId: line.accountId,
          currencyId: currencyIdNum,
          debitBalance: String(debitAmount),
          creditBalance: String(creditAmount),
          currentBalance: String(newCurrentBalance),
          lastTransactionDate: transferDate,
          lastTransactionId: journalEntryId,
        });
      }
    }

    // جلب القيد المُنشأ
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
    console.error("خطأ في إنشاء التحويل:", error);
    res.status(500).json({ error: "فشل في إنشاء التحويل" });
  }
});

/**
 * GET /api/custom-system/v2/operations/recent
 * الحصول على آخر العمليات (سندات قبض، سندات صرف، تحويلات)
 */
router.get("/recent", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "قاعدة البيانات غير متاحة" });
    }
    
    const businessId = (req as any).user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { limit = 20 } = req.query;

    const recentEntries = await db
      .select()
      .from(customJournalEntries)
      .where(
        and(
          eq(customJournalEntries.businessId, businessId),
          eq(customJournalEntries.entryType, "system_generated")
        )
      )
      .orderBy(desc(customJournalEntries.entryDate), desc(customJournalEntries.id))
      .limit(parseInt(String(limit)));

    res.json(recentEntries);
  } catch (error) {
    console.error("خطأ في جلب العمليات الأخيرة:", error);
    res.status(500).json({ error: "فشل في جلب العمليات الأخيرة" });
  }
});

export default router;
