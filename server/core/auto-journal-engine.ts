/**
 * محرك القيود المحاسبية التلقائي
 * Auto Journal Entry Engine
 * 
 * هذا المحرك ينشئ القيود المحاسبية تلقائياً عند أي عملية مالية
 * بدون الحاجة لتدخل يدوي
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { accounts, journalEntries, journalEntryLines, fiscalPeriods } from "../../drizzle/schemas/accounting";
import { logger } from "../utils/logger";

// ============================================
// Types
// ============================================

export interface JournalEntryLine {
  accountId: number;
  debit?: string;
  credit?: string;
  description?: string;
  costCenterId?: number;
}

export interface JournalEntryData {
  businessId: number;
  branchId?: number;
  entryDate: Date;
  periodId: number;
  type: "auto" | "invoice" | "payment" | "receipt" | "transfer" | "depreciation";
  sourceModule: string;
  sourceId: number;
  description: string;
  lines: JournalEntryLine[];
  createdBy: number;
}

// ============================================
// Auto Journal Engine Class
// ============================================

export class AutoJournalEngine {
  /**
   * إنشاء قيد محاسبي تلقائي
   */
  static async createJournalEntry(data: JournalEntryData): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // التحقق من التوازن
      const totalDebit = data.lines.reduce((sum, line) => sum + parseFloat(line.debit || "0"), 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + parseFloat(line.credit || "0"), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`القيد غير متوازن: المدين=${totalDebit.toFixed(2)}, الدائن=${totalCredit.toFixed(2)}`);
      }

      // توليد رقم القيد
      const entryNumber = `JE-AUTO-${Date.now()}`;

      // إنشاء القيد
      const [result] = await db.insert(journalEntries).values({
        businessId: data.businessId,
        branchId: data.branchId,
        entryNumber,
        entryDate: data.entryDate,
        periodId: data.periodId,
        type: data.type,
        sourceModule: data.sourceModule,
        sourceId: data.sourceId,
        description: data.description,
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        status: "draft",
        createdBy: data.createdBy,
      });

      const entryId = result.insertId;

      // إضافة بنود القيد
      for (let i = 0; i < data.lines.length; i++) {
        const line = data.lines[i];
        await db.insert(journalEntryLines).values({
          entryId: entryId,
          lineNumber: i + 1,
          accountId: line.accountId,
          debit: line.debit || "0",
          credit: line.credit || "0",
          description: line.description,
          costCenterId: line.costCenterId,
        });
      }

      // ترحيل القيد تلقائياً
      await this.postJournalEntry(entryId, data.createdBy);

      logger.info("Auto journal entry created", {
        entryId,
        entryNumber,
        sourceModule: data.sourceModule,
        sourceId: data.sourceId,
        totalDebit,
        totalCredit,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create auto journal entry", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * ترحيل القيد (Post Journal Entry)
   */
  static async postJournalEntry(entryId: number, userId: number): Promise<void> {
    const db = await getDb();
    if (!db) return;

    const [entry] = await db
      .select({
        id: journalEntries.id,
        status: journalEntries.status,
        totalDebit: journalEntries.totalDebit,
        totalCredit: journalEntries.totalCredit,
      })
      .from(journalEntries)
      .where(eq(journalEntries.id, entryId));

    if (!entry) throw new Error("القيد غير موجود");
    if (entry.status !== "draft") throw new Error("القيد مرحّل بالفعل");

    // التحقق من التوازن
    if (entry.totalDebit !== entry.totalCredit) {
      throw new Error("مجموع المدين لا يساوي مجموع الدائن");
    }

    // تحديث أرصدة الحسابات
    const lines = await db
      .select({
        id: journalEntryLines.id,
        accountId: journalEntryLines.accountId,
        debit: journalEntryLines.debit,
        credit: journalEntryLines.credit,
      })
      .from(journalEntryLines)
      .where(eq(journalEntryLines.entryId, entryId));

    for (const line of lines) {
      const [account] = await db
        .select({
          id: accounts.id,
          currentBalance: accounts.currentBalance,
          nature: accounts.nature,
        })
        .from(accounts)
        .where(eq(accounts.id, line.accountId));

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

      await db
        .update(accounts)
        .set({ currentBalance: newBalance.toFixed(2) })
        .where(eq(accounts.id, line.accountId));
    }

    // تحديث حالة القيد
    await db
      .update(journalEntries)
      .set({
        status: "posted",
        postedBy: userId,
        postedAt: new Date(),
      })
      .where(eq(journalEntries.id, entryId));
  }

  /**
   * جلب الحساب بالكود
   */
  static async getAccountByCode(businessId: number, code: string): Promise<number | null> {
    const db = await getDb();
    if (!db) return null;

    const [account] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.businessId, businessId), eq(accounts.code, code), eq(accounts.isActive, true)))
      .limit(1);

    return account?.id || null;
  }

  /**
   * جلب الفترة المحاسبية الحالية
   */
  static async getCurrentPeriod(businessId: number): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [period] = await db
      .select({ id: fiscalPeriods.id })
      .from(fiscalPeriods)
      .where(and(eq(fiscalPeriods.businessId, businessId), eq(fiscalPeriods.status, "open")))
      .orderBy(fiscalPeriods.startDate)
      .limit(1);

    if (!period) {
      throw new Error("لا توجد فترة محاسبية نشطة");
    }

    return period.id;
  }

  // ============================================
  // Event Handlers - معالجات الأحداث
  // ============================================

  /**
   * عند إنشاء فاتورة
   * مدين: العملاء | دائن: الإيرادات
   */
  static async onInvoiceCreated(invoice: {
    id: number;
    businessId: number;
    branchId?: number;
    customerId: number;
    invoiceNumber: string;
    invoiceDate: Date;
    totalAmount: number;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(invoice.businessId);

      // جلب حسابات افتراضية (يجب إنشاؤها في شجرة الحسابات)
      const customersAccountId = await this.getAccountByCode(invoice.businessId, "1200"); // عملاء
      const revenueAccountId = await this.getAccountByCode(invoice.businessId, "4100"); // إيرادات الكهرباء

      if (!customersAccountId || !revenueAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة. يرجى إنشاء حسابات: 1200 (عملاء), 4100 (إيرادات)");
      }

      const entryId = await this.createJournalEntry({
        businessId: invoice.businessId,
        branchId: invoice.branchId,
        entryDate: invoice.invoiceDate,
        periodId,
        type: "invoice",
        sourceModule: "billing",
        sourceId: invoice.id,
        description: `فاتورة #${invoice.invoiceNumber}`,
        lines: [
          {
            accountId: customersAccountId,
            debit: invoice.totalAmount.toFixed(2),
            description: `فاتورة #${invoice.invoiceNumber}`,
          },
          {
            accountId: revenueAccountId,
            credit: invoice.totalAmount.toFixed(2),
            description: `إيراد فاتورة #${invoice.invoiceNumber}`,
          },
        ],
        createdBy: invoice.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for invoice", {
        error: error.message,
        invoiceId: invoice.id,
      });
      // لا نرمي الخطأ - نكتفي بتسجيله
      throw error;
    }
  }

  /**
   * عند استلام دفعة
   * مدين: نقد/بنك | دائن: العملاء
   */
  static async onPaymentReceived(payment: {
    id: number;
    businessId: number;
    branchId?: number;
    customerId: number;
    invoiceId?: number;
    amount: number;
    paymentMethod: "cash" | "bank" | "card";
    bankId?: number;
    paymentDate: Date;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(payment.businessId);

      // تحديد حساب الدفع
      let paymentAccountId: number | null = null;
      if (payment.paymentMethod === "cash") {
        paymentAccountId = await this.getAccountByCode(payment.businessId, "1100"); // نقدية
      } else if (payment.paymentMethod === "bank" && payment.bankId) {
        // حساب البنك (يجب أن يكون له كود مثل 1110, 1111, إلخ)
        paymentAccountId = await this.getAccountByCode(payment.businessId, `111${payment.bankId}`);
        if (!paymentAccountId) {
          // Fallback لحساب البنك العام
          paymentAccountId = await this.getAccountByCode(payment.businessId, "1110");
        }
      } else {
        paymentAccountId = await this.getAccountByCode(payment.businessId, "1100"); // افتراضي: نقدية
      }

      const customersAccountId = await this.getAccountByCode(payment.businessId, "1200"); // عملاء

      if (!paymentAccountId || !customersAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة");
      }

      const entryId = await this.createJournalEntry({
        businessId: payment.businessId,
        branchId: payment.branchId,
        entryDate: payment.paymentDate,
        periodId,
        type: "payment",
        sourceModule: "billing",
        sourceId: payment.id,
        description: `دفعة من عميل #${payment.customerId}${payment.invoiceId ? ` - فاتورة #${payment.invoiceId}` : ""}`,
        lines: [
          {
            accountId: paymentAccountId,
            debit: payment.amount.toFixed(2),
            description: `دفعة نقدية/بنكية`,
          },
          {
            accountId: customersAccountId,
            credit: payment.amount.toFixed(2),
            description: `تسوية دين عميل #${payment.customerId}`,
          },
        ],
        createdBy: payment.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for payment", {
        error: error.message,
        paymentId: payment.id,
      });
      throw error;
    }
  }

  /**
   * عند شحن STS
   * مدين: بنك | دائن: إيراد دفع مسبق
   */
  static async onSTSRecharge(recharge: {
    id: number;
    businessId: number;
    branchId?: number;
    customerId: number;
    meterId: number;
    amount: number;
    bankId?: number;
    rechargeDate: Date;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(recharge.businessId);

      const bankAccountId = recharge.bankId
        ? await this.getAccountByCode(recharge.businessId, `111${recharge.bankId}`)
        : await this.getAccountByCode(recharge.businessId, "1110"); // بنك افتراضي

      const prepaidRevenueAccountId = await this.getAccountByCode(recharge.businessId, "4101"); // إيراد دفع مسبق

      if (!bankAccountId || !prepaidRevenueAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة");
      }

      const entryId = await this.createJournalEntry({
        businessId: recharge.businessId,
        branchId: recharge.branchId,
        entryDate: recharge.rechargeDate,
        periodId,
        type: "receipt",
        sourceModule: "sts",
        sourceId: recharge.id,
        description: `شحن STS - عداد #${recharge.meterId}`,
        lines: [
          {
            accountId: bankAccountId,
            debit: recharge.amount.toFixed(2),
            description: `شحن STS - عداد #${recharge.meterId}`,
          },
          {
            accountId: prepaidRevenueAccountId,
            credit: recharge.amount.toFixed(2),
            description: `إيراد دفع مسبق - عداد #${recharge.meterId}`,
          },
        ],
        createdBy: recharge.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for STS recharge", {
        error: error.message,
        rechargeId: recharge.id,
      });
      throw error;
    }
  }

  /**
   * عند استلام بضائع (GRN)
   * مدين: مخزون | دائن: بضاعة واردة
   */
  static async onGoodsReceipt(grn: {
    id: number;
    businessId: number;
    branchId?: number;
    supplierId: number;
    totalAmount: number;
    receiptDate: Date;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(grn.businessId);

      const inventoryAccountId = await this.getAccountByCode(grn.businessId, "1300"); // مخزون
      const goodsReceivedAccountId = await this.getAccountByCode(grn.businessId, "2200"); // بضاعة واردة

      if (!inventoryAccountId || !goodsReceivedAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة");
      }

      const entryId = await this.createJournalEntry({
        businessId: grn.businessId,
        branchId: grn.branchId,
        entryDate: grn.receiptDate,
        periodId,
        type: "auto",
        sourceModule: "inventory",
        sourceId: grn.id,
        description: `استلام بضائع من مورد #${grn.supplierId}`,
        lines: [
          {
            accountId: inventoryAccountId,
            debit: grn.totalAmount.toFixed(2),
            description: `استلام بضائع - GRN #${grn.id}`,
          },
          {
            accountId: goodsReceivedAccountId,
            credit: grn.totalAmount.toFixed(2),
            description: `بضاعة واردة - مورد #${grn.supplierId}`,
          },
        ],
        createdBy: grn.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for GRN", {
        error: error.message,
        grnId: grn.id,
      });
      throw error;
    }
  }

  /**
   * عند دفع مورد
   * مدين: موردين | دائن: بنك
   */
  static async onSupplierPayment(payment: {
    id: number;
    businessId: number;
    branchId?: number;
    supplierId: number;
    amount: number;
    bankId?: number;
    paymentDate: Date;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(payment.businessId);

      const suppliersAccountId = await this.getAccountByCode(payment.businessId, "2100"); // موردين
      const bankAccountId = payment.bankId
        ? await this.getAccountByCode(payment.businessId, `111${payment.bankId}`)
        : await this.getAccountByCode(payment.businessId, "1110");

      if (!suppliersAccountId || !bankAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة");
      }

      const entryId = await this.createJournalEntry({
        businessId: payment.businessId,
        branchId: payment.branchId,
        entryDate: payment.paymentDate,
        periodId,
        type: "payment",
        sourceModule: "procurement",
        sourceId: payment.id,
        description: `دفع مورد #${payment.supplierId}`,
        lines: [
          {
            accountId: suppliersAccountId,
            debit: payment.amount.toFixed(2),
            description: `تسوية دين مورد #${payment.supplierId}`,
          },
          {
            accountId: bankAccountId,
            credit: payment.amount.toFixed(2),
            description: `دفع من البنك`,
          },
        ],
        createdBy: payment.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for supplier payment", {
        error: error.message,
        paymentId: payment.id,
      });
      throw error;
    }
  }

  /**
   * عند صرف رواتب
   * مدين: رواتب | دائن: بنك
   */
  static async onPayroll(payroll: {
    id: number;
    businessId: number;
    branchId?: number;
    totalAmount: number;
    payrollDate: Date;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(payroll.businessId);

      const salariesAccountId = await this.getAccountByCode(payroll.businessId, "5100"); // رواتب
      const bankAccountId = await this.getAccountByCode(payroll.businessId, "1110"); // بنك

      if (!salariesAccountId || !bankAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة");
      }

      const entryId = await this.createJournalEntry({
        businessId: payroll.businessId,
        branchId: payroll.branchId,
        entryDate: payroll.payrollDate,
        periodId,
        type: "payment",
        sourceModule: "hr",
        sourceId: payroll.id,
        description: `صرف رواتب`,
        lines: [
          {
            accountId: salariesAccountId,
            debit: payroll.totalAmount.toFixed(2),
            description: `رواتب الموظفين`,
          },
          {
            accountId: bankAccountId,
            credit: payroll.totalAmount.toFixed(2),
            description: `صرف من البنك`,
          },
        ],
        createdBy: payroll.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for payroll", {
        error: error.message,
        payrollId: payroll.id,
      });
      throw error;
    }
  }

  /**
   * عند استبدال عداد تالف
   * مدين: العملاء | دائن: مبيعات معدات
   */
  static async onMeterReplacement(replacement: {
    id: number;
    businessId: number;
    branchId?: number;
    customerId: number;
    workOrderId: number;
    meterCost: number;
    replacementDate: Date;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(replacement.businessId);

      const customersAccountId = await this.getAccountByCode(replacement.businessId, "1200"); // عملاء
      const equipmentSalesAccountId = await this.getAccountByCode(replacement.businessId, "4200"); // مبيعات معدات

      if (!customersAccountId || !equipmentSalesAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة");
      }

      const entryId = await this.createJournalEntry({
        businessId: replacement.businessId,
        branchId: replacement.branchId,
        entryDate: replacement.replacementDate,
        periodId,
        type: "auto",
        sourceModule: "maintenance",
        sourceId: replacement.workOrderId,
        description: `استبدال عداد - أمر عمل #${replacement.workOrderId}`,
        lines: [
          {
            accountId: customersAccountId,
            debit: replacement.meterCost.toFixed(2),
            description: `تكلفة استبدال عداد`,
          },
          {
            accountId: equipmentSalesAccountId,
            credit: replacement.meterCost.toFixed(2),
            description: `مبيعات عداد - عميل #${replacement.customerId}`,
          },
        ],
        createdBy: replacement.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for meter replacement", {
        error: error.message,
        replacementId: replacement.id,
      });
      throw error;
    }
  }

  /**
   * عند ترقية اشتراك
   * مدين: بنك + عملاء (التأمين) | دائن: إيراد اشتراك
   */
  static async onSubscriptionUpgrade(upgrade: {
    id: number;
    businessId: number;
    branchId?: number;
    customerId: number;
    workOrderId: number;
    subscriptionFee: number;
    depositAmount: number;
    depositRefunded: number; // التأمين القديم المسترجع
    bankId?: number;
    upgradeDate: Date;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(upgrade.businessId);

      const bankAccountId = upgrade.bankId
        ? await this.getAccountByCode(upgrade.businessId, `111${upgrade.bankId}`)
        : await this.getAccountByCode(upgrade.businessId, "1110");
      const customersAccountId = await this.getAccountByCode(upgrade.businessId, "1200"); // عملاء
      const subscriptionRevenueAccountId = await this.getAccountByCode(upgrade.businessId, "4102"); // إيراد اشتراك

      if (!bankAccountId || !customersAccountId || !subscriptionRevenueAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة");
      }

      // حساب المبلغ الإجمالي
      const totalAmount = upgrade.subscriptionFee + upgrade.depositAmount - upgrade.depositRefunded;

      const lines: JournalEntryLine[] = [];

      // مدين: البنك (المبلغ المدفوع نقداً)
      if (upgrade.subscriptionFee + upgrade.depositAmount - upgrade.depositRefunded > 0) {
        lines.push({
          accountId: bankAccountId,
          debit: (upgrade.subscriptionFee + upgrade.depositAmount - upgrade.depositRefunded).toFixed(2),
          description: `دفع ترقية اشتراك`,
        });
      }

      // مدين: العملاء (التأمين المسترجع)
      if (upgrade.depositRefunded > 0) {
        lines.push({
          accountId: customersAccountId,
          debit: upgrade.depositRefunded.toFixed(2),
          description: `استرجاع تأمين قديم`,
        });
      }

      // دائن: إيراد اشتراك
      lines.push({
        accountId: subscriptionRevenueAccountId,
        credit: totalAmount.toFixed(2),
        description: `إيراد ترقية اشتراك`,
      });

      const entryId = await this.createJournalEntry({
        businessId: upgrade.businessId,
        branchId: upgrade.branchId,
        entryDate: upgrade.upgradeDate,
        periodId,
        type: "auto",
        sourceModule: "maintenance",
        sourceId: upgrade.workOrderId,
        description: `ترقية اشتراك - أمر عمل #${upgrade.workOrderId}`,
        lines,
        createdBy: upgrade.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for subscription upgrade", {
        error: error.message,
        upgradeId: upgrade.id,
      });
      throw error;
    }
  }

  /**
   * عند صرف مخزون (عداد) للتركيب
   * مدين: تكلفة بضاعة مباعة | دائن: مخزون
   */
  static async onInventoryIssue(issue: {
    id: number;
    businessId: number;
    branchId?: number;
    workOrderId: number;
    itemId: number;
    quantity: number;
    unitCost: number;
    issueDate: Date;
    createdBy: number;
  }): Promise<number> {
    try {
      const periodId = await this.getCurrentPeriod(issue.businessId);

      const costOfGoodsSoldAccountId = await this.getAccountByCode(issue.businessId, "5101"); // تكلفة بضاعة مباعة
      const inventoryAccountId = await this.getAccountByCode(issue.businessId, "1300"); // مخزون

      if (!costOfGoodsSoldAccountId || !inventoryAccountId) {
        throw new Error("الحسابات المحاسبية غير موجودة");
      }

      const totalCost = issue.quantity * issue.unitCost;

      const entryId = await this.createJournalEntry({
        businessId: issue.businessId,
        branchId: issue.branchId,
        entryDate: issue.issueDate,
        periodId,
        type: "auto",
        sourceModule: "inventory",
        sourceId: issue.id,
        description: `صرف مخزون - أمر عمل #${issue.workOrderId}`,
        lines: [
          {
            accountId: costOfGoodsSoldAccountId,
            debit: totalCost.toFixed(2),
            description: `تكلفة صرف صنف #${issue.itemId}`,
          },
          {
            accountId: inventoryAccountId,
            credit: totalCost.toFixed(2),
            description: `صرف من المخزون`,
          },
        ],
        createdBy: issue.createdBy,
      });

      return entryId;
    } catch (error: any) {
      logger.error("Failed to create journal entry for inventory issue", {
        error: error.message,
        issueId: issue.id,
      });
      throw error;
    }
  }
}

