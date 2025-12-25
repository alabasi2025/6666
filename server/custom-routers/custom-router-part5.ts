
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  customAccounts, customTransactions, customNotes, customMemos, noteCategories,
  InsertCustomAccount, InsertCustomTransaction, InsertCustomNote, InsertCustomMemo,
  customParties, customCategories, customTreasuryMovements, customPartyTransactions, customSettings,
  InsertCustomParty, InsertCustomCategory, InsertCustomTreasuryMovement, InsertCustomPartyTransaction, InsertCustomSetting
} from "../drizzle/schema";
import { eq, and, desc, asc, like, sql } from "drizzle-orm";

          eq(customReceiptVouchers.sourceType, "intermediary")
        ));
      
      let matchCount = 0;
      
      // Try to match payments with receipts
      for (const payment of payments) {
        for (const receipt of receipts) {
          // Check if amounts match
          if (payment.amount === receipt.amount && 
              payment.destinationIntermediaryId === receipt.sourceIntermediaryId) {
            
            // Calculate confidence score
            const paymentDate = new Date(payment.voucherDate);
            const receiptDate = new Date(receipt.voucherDate);
            const daysDiff = Math.abs((paymentDate.getTime() - receiptDate.getTime()) / (1000 * 60 * 60 * 24));
            
            let confidenceScore: "high" | "medium" | "low" = "low";
            if (daysDiff <= 1) confidenceScore = "high";
            else if (daysDiff <= 7) confidenceScore = "medium";
            
            // Create reconciliation
            await db.insert(customReconciliations).values({
              businessId: input.businessId,
              paymentVoucherId: payment.id,
              receiptVoucherId: receipt.id,
              amount: payment.amount,
              currency: payment.currency,
              confidenceScore,
              status: "pending",
            });
            
            matchCount++;
            break;
          }
        }
      }
      
      return { count: matchCount, success: true };
    }),

  confirm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const reconciliation = await db.select({
        id: customReconciliations.id,
        paymentVoucherId: customReconciliations.paymentVoucherId,
        receiptVoucherId: customReconciliations.receiptVoucherId,
      }).from(customReconciliations)
        .where(eq(customReconciliations.id, input.id))
        .limit(1);
      
      if (!reconciliation[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reconciliation not found' });
      }
      
      // Update reconciliation status
      await db.update(customReconciliations)
        .set({ 
          status: "confirmed",
          confirmedBy: ctx.user?.id,
          confirmedAt: new Date(),
        })
        .where(eq(customReconciliations.id, input.id));
      
      // Mark vouchers as reconciled
      await db.update(customPaymentVouchers)
        .set({ 
          isReconciled: true,
          reconciledWith: reconciliation[0].receiptVoucherId,
          reconciledAt: new Date(),
        })
        .where(eq(customPaymentVouchers.id, reconciliation[0].paymentVoucherId));
      
      await db.update(customReceiptVouchers)
        .set({ 
          isReconciled: true,
          reconciledWith: reconciliation[0].paymentVoucherId,
          reconciledAt: new Date(),
        })
        .where(eq(customReceiptVouchers.id, reconciliation[0].receiptVoucherId));
      
      return { success: true };
    }),

  reject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.update(customReconciliations)
        .set({ status: "rejected" })
        .where(eq(customReconciliations.id, input.id));
      
      return { success: true };
    }),
});

// ============================================
/**
 * @namespace customPartiesRouter
 * @description Router لإدارة الأطراف (العملاء/الموردين) المخصصة -
 * يتيح تسجيل الأطراف وتتبع أرصدتهم وحركاتهم المالية.
 */
// Custom Parties Router (إدارة الأطراف)
// ============================================
export const customPartiesRouter = router({
  /**
   * استرجاع قائمة الأطراف
   * 
   * @procedure list
   * @description يسترجع قائمة الأطراف (العملاء/الموردين) مع إمكانية الفلترة.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} input.businessId - معرف الشركة
   * @param {string} [input.partyType] - نوع الطرف (customer|supplier|both)
   * 
   * @returns {Promise<CustomParty[]>} قائمة الأطراف
   */
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      subSystemId: z.number().optional(),
      partyType: z.enum(["customer", "supplier", "employee", "partner", "government", "other"]).optional(),
      search: z.string().optional(),
      isActive: z.boolean().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select({
        id: customParties.id,
        businessId: customParties.businessId,
        subSystemId: customParties.subSystemId,
        code: customParties.code,
        nameAr: customParties.nameAr,
        nameEn: customParties.nameEn,
        partyType: customParties.partyType,
        phone: customParties.phone,
        mobile: customParties.mobile,
        email: customParties.email,
        address: customParties.address,
        city: customParties.city,
        country: customParties.country,
        creditLimit: customParties.creditLimit,
        currentBalance: customParties.currentBalance,
        currency: customParties.currency,
        isActive: customParties.isActive,
        createdAt: customParties.createdAt,
      }).from(customParties).where(eq(customParties.businessId, input.businessId));
      
      const results = await query.orderBy(asc(customParties.nameAr));
      
      // تصفية إضافية
      let filtered = results;
      if (input.subSystemId) filtered = filtered.filter(p => p.subSystemId === input.subSystemId);
      if (input.partyType) filtered = filtered.filter(p => p.partyType === input.partyType);
      if (input.isActive !== undefined) filtered = filtered.filter(p => p.isActive === input.isActive);
      if (input.search) {
        const s = input.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.nameAr.toLowerCase().includes(s) || 
          p.code.toLowerCase().includes(s) ||
          (p.phone && p.phone.includes(s)) ||
          (p.mobile && p.mobile.includes(s))
        );
      }
      
      return filtered;
    }),

  // الحصول على طرف بالمعرف
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.select({
        id: customParties.id,
        businessId: customParties.businessId,
        subSystemId: customParties.subSystemId,
        code: customParties.code,
        nameAr: customParties.nameAr,
        nameEn: customParties.nameEn,
        partyType: customParties.partyType,
        phone: customParties.phone,
        mobile: customParties.mobile,
        email: customParties.email,
        address: customParties.address,
        city: customParties.city,
        country: customParties.country,
        taxNumber: customParties.taxNumber,
        commercialRegister: customParties.commercialRegister,
        creditLimit: customParties.creditLimit,
        currentBalance: customParties.currentBalance,
        currency: customParties.currency,
        contactPerson: customParties.contactPerson,
        notes: customParties.notes,
        isActive: customParties.isActive,
        createdAt: customParties.createdAt,
      }).from(customParties).where(eq(customParties.id, input.id)).limit(1);
      return result[0] || null;
    }),

  // إنشاء طرف جديد
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      partyType: z.enum(["customer", "supplier", "employee", "partner", "government", "other"]),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      taxNumber: z.string().optional(),
      commercialRegister: z.string().optional(),
      creditLimit: z.string().optional(),
      currency: z.string().optional(),
      contactPerson: z.string().optional(),
      notes: z.string().optional(),
      tags: z.any().optional(),
      createdBy: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customParties).values(input as InsertCustomParty);
      return { id: Number(result[0].insertId), success: true };
    }),

  // تحديث طرف
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      partyType: z.enum(["customer", "supplier", "employee", "partner", "government", "other"]).optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      taxNumber: z.string().optional(),
      commercialRegister: z.string().optional(),
      creditLimit: z.string().optional(),
      currency: z.string().optional(),
      contactPerson: z.string().optional(),
      notes: z.string().optional(),
      tags: z.any().optional(),
      isActive: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customParties).set(data).where(eq(customParties.id, id));
      return { success: true };
    }),

  // حذف طرف
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customParties).where(eq(customParties.id, input.id));
      return { success: true };
    }),

  // الحصول على رصيد طرف
  getBalance: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const party = await db.select({
        id: customParties.id,
        nameAr: customParties.nameAr,
        currentBalance: customParties.currentBalance,
        creditLimit: customParties.creditLimit,
        currency: customParties.currency,
      }).from(customParties).where(eq(customParties.id, input.id)).limit(1);
      if (!party[0]) return null;
      
      return {
        partyId: party[0].id,
        partyName: party[0].nameAr,
        currentBalance: party[0].currentBalance,
        creditLimit: party[0].creditLimit,
        currency: party[0].currency
      };
    }),

  // كشف حساب طرف
  getStatement: protectedProcedure
    .input(z.object({ 
      partyId: z.number(),
      fromDate: z.string().optional(),
      toDate: z.string().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const transactions = await db.select({
        id: customPartyTransactions.id,
        partyId: customPartyTransactions.partyId,
        transactionType: customPartyTransactions.transactionType,
        transactionDate: customPartyTransactions.transactionDate,
        amount: customPartyTransactions.amount,
        balanceBefore: customPartyTransactions.balanceBefore,
        balanceAfter: customPartyTransactions.balanceAfter,
        referenceNumber: customPartyTransactions.referenceNumber,
        description: customPartyTransactions.description,
      }).from(customPartyTransactions)
        .where(eq(customPartyTransactions.partyId, input.partyId))
        .orderBy(asc(customPartyTransactions.transactionDate));
      
      return transactions;
    }),

  // تحديث رصيد طرف
  updateBalance: protectedProcedure
    .input(z.object({ id: z.number(), amount: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.update(customParties)
        .set({ currentBalance: input.amount })
        .where(eq(customParties.id, input.id));
      return { success: true };
    }),
});

// ============================================
/**
 * @namespace customCategoriesRouter
 * @description Router لإدارة الفئات المخصصة - يتيح إنشاء فئات
 * هرمية لتصنيف العناصر المختلفة في النظام.
 */
// Custom Categories Router (إدارة التصنيفات)
// ============================================
export const customCategoriesRouter = router({
  // قائمة التصنيفات
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      subSystemId: z.number().optional(),
      categoryType: z.enum(["income", "expense", "both"]).optional(),
      parentId: z.number().optional(),
      isActive: z.boolean().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const results = await db.select({
        id: customCategories.id,
        businessId: customCategories.businessId,
        subSystemId: customCategories.subSystemId,
        code: customCategories.code,
        nameAr: customCategories.nameAr,
        nameEn: customCategories.nameEn,
        categoryType: customCategories.categoryType,
        parentId: customCategories.parentId,
        level: customCategories.level,
        color: customCategories.color,
        icon: customCategories.icon,
        isActive: customCategories.isActive,
        createdAt: customCategories.createdAt,
      }).from(customCategories)
        .where(eq(customCategories.businessId, input.businessId))
        .orderBy(asc(customCategories.code));
      
      let filtered = results;
      if (input.subSystemId) filtered = filtered.filter(c => c.subSystemId === input.subSystemId);
      if (input.categoryType) filtered = filtered.filter(c => c.categoryType === input.categoryType);
      if (input.parentId !== undefined) filtered = filtered.filter(c => c.parentId === input.parentId);
      if (input.isActive !== undefined) filtered = filtered.filter(c => c.isActive === input.isActive);
      
      return filtered;
    }),

  // الحصول على تصنيف بالمعرف
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.select({
        id: customCategories.id,
        businessId: customCategories.businessId,
        subSystemId: customCategories.subSystemId,
        code: customCategories.code,
        nameAr: customCategories.nameAr,
        nameEn: customCategories.nameEn,
        categoryType: customCategories.categoryType,
        parentId: customCategories.parentId,
        level: customCategories.level,
        color: customCategories.color,
        icon: customCategories.icon,
        description: customCategories.description,
        linkedAccountId: customCategories.linkedAccountId,
        isActive: customCategories.isActive,
