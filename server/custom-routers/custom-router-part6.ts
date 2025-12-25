
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

        createdAt: customCategories.createdAt,
      }).from(customCategories).where(eq(customCategories.id, input.id)).limit(1);
      return result[0] || null;
    }),

  // إنشاء تصنيف جديد
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      categoryType: z.enum(["income", "expense", "both"]),
      parentId: z.number().optional(),
      level: z.number().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
      linkedAccountId: z.number().optional(),
      createdBy: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customCategories).values(input as InsertCustomCategory);
      return { id: Number(result[0].insertId), success: true };
    }),

  // تحديث تصنيف
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      categoryType: z.enum(["income", "expense", "both"]).optional(),
      parentId: z.number().optional(),
      level: z.number().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
      linkedAccountId: z.number().optional(),
      isActive: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customCategories).set(data).where(eq(customCategories.id, id));
      return { success: true };
    }),

  // حذف تصنيف
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customCategories).where(eq(customCategories.id, input.id));
      return { success: true };
    }),

  // الحصول على التصنيفات الهرمية (Tree)
  getTree: protectedProcedure
    .input(z.object({ businessId: z.number(), categoryType: z.enum(["income", "expense", "both"]).optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const all = await db.select({
        id: customCategories.id,
        code: customCategories.code,
        nameAr: customCategories.nameAr,
        nameEn: customCategories.nameEn,
        categoryType: customCategories.categoryType,
        parentId: customCategories.parentId,
        level: customCategories.level,
        color: customCategories.color,
        icon: customCategories.icon,
        isActive: customCategories.isActive,
      }).from(customCategories)
        .where(eq(customCategories.businessId, input.businessId))
        .orderBy(asc(customCategories.code));
      
      let filtered = all;
      if (input.categoryType) filtered = filtered.filter(c => c.categoryType === input.categoryType || c.categoryType === "both");
      
      // بناء الشجرة
      const buildTree = (items: typeof filtered, parentId: number | null = null): any[] => {
        return items
          .filter(item => item.parentId === parentId)
          .map(item => ({
            ...item,
            children: buildTree(items, item.id)
          }));
      };
      
      return buildTree(filtered);
    }),
});

// ============================================
/**
 * @namespace customTreasuryMovementsRouter
 * @description Router لإدارة حركات الخزينة - يتيح تسجيل المقبوضات
 * والمدفوعات النقدية وتتبع رصيد الخزينة.
 */
// Custom Treasury Movements Router (حركات الخزينة)
// ============================================
export const customTreasuryMovementsRouter = router({
  // قائمة حركات خزينة
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      treasuryId: z.number().optional(),
      movementType: z.enum(["receipt", "payment", "transfer_in", "transfer_out", "adjustment", "opening"]).optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const results = await db.select({
        id: customTreasuryMovements.id,
        businessId: customTreasuryMovements.businessId,
        treasuryId: customTreasuryMovements.treasuryId,
        movementType: customTreasuryMovements.movementType,
        movementDate: customTreasuryMovements.movementDate,
        amount: customTreasuryMovements.amount,
        balanceBefore: customTreasuryMovements.balanceBefore,
        balanceAfter: customTreasuryMovements.balanceAfter,
        referenceNumber: customTreasuryMovements.referenceNumber,
        description: customTreasuryMovements.description,
        createdAt: customTreasuryMovements.createdAt,
      }).from(customTreasuryMovements)
        .where(eq(customTreasuryMovements.businessId, input.businessId))
        .orderBy(desc(customTreasuryMovements.movementDate));
      
      let filtered = results;
      if (input.treasuryId) filtered = filtered.filter(m => m.treasuryId === input.treasuryId);
      if (input.movementType) filtered = filtered.filter(m => m.movementType === input.movementType);
      
      return filtered;
    }),

  // كشف حساب خزينة
  getStatement: protectedProcedure
    .input(z.object({ 
      treasuryId: z.number(),
      fromDate: z.string().optional(),
      toDate: z.string().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const movements = await db.select({
        id: customTreasuryMovements.id,
        treasuryId: customTreasuryMovements.treasuryId,
        movementType: customTreasuryMovements.movementType,
        movementDate: customTreasuryMovements.movementDate,
        amount: customTreasuryMovements.amount,
        balanceBefore: customTreasuryMovements.balanceBefore,
        balanceAfter: customTreasuryMovements.balanceAfter,
        referenceNumber: customTreasuryMovements.referenceNumber,
        description: customTreasuryMovements.description,
      }).from(customTreasuryMovements)
        .where(eq(customTreasuryMovements.treasuryId, input.treasuryId))
        .orderBy(asc(customTreasuryMovements.movementDate), asc(customTreasuryMovements.id));
      
      return movements;
    }),

  // إنشاء حركة (يستخدم داخلياً)
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      treasuryId: z.number(),
      movementType: z.enum(["receipt", "payment", "transfer_in", "transfer_out", "adjustment", "opening"]),
      movementDate: z.string(),
      amount: z.string(),
      balanceBefore: z.string(),
      balanceAfter: z.string(),
      currency: z.string().optional(),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      referenceNumber: z.string().optional(),
      description: z.string().optional(),
      createdBy: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customTreasuryMovements).values(input as InsertCustomTreasuryMovement);
      return { id: Number(result[0].insertId), success: true };
    }),

  // إحصائيات خزينة
  getStats: protectedProcedure
    .input(z.object({ treasuryId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const movements = await db.select({
        id: customTreasuryMovements.id,
        movementType: customTreasuryMovements.movementType,
        amount: customTreasuryMovements.amount,
        balanceAfter: customTreasuryMovements.balanceAfter,
      }).from(customTreasuryMovements)
        .where(eq(customTreasuryMovements.treasuryId, input.treasuryId));
      
      const totalReceipts = movements.filter(m => m.movementType === "receipt" || m.movementType === "transfer_in")
        .reduce((sum, m) => sum + parseFloat(m.amount || "0"), 0);
      const totalPayments = movements.filter(m => m.movementType === "payment" || m.movementType === "transfer_out")
        .reduce((sum, m) => sum + parseFloat(m.amount || "0"), 0);
      
      const lastMovement = movements.sort((a, b) => b.id - a.id)[0];
      
      return {
        totalReceipts,
        totalPayments,
        currentBalance: lastMovement?.balanceAfter || "0",
        movementsCount: movements.length
      };
    }),
});

// ============================================
/**
 * @namespace customPartyTransactionsRouter
 * @description Router لإدارة حركات الأطراف - يتيح تسجيل الحركات
 * المالية مع الأطراف وتحديث أرصدتهم تلقائياً.
 */
// Custom Party Transactions Router (حركات الأطراف)
// ============================================
export const customPartyTransactionsRouter = router({
  // قائمة حركات طرف
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      partyId: z.number().optional(),
      transactionType: z.enum(["receipt", "payment", "invoice", "credit_note", "debit_note", "adjustment"]).optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const results = await db.select({
        id: customPartyTransactions.id,
        businessId: customPartyTransactions.businessId,
        partyId: customPartyTransactions.partyId,
        transactionType: customPartyTransactions.transactionType,
        transactionDate: customPartyTransactions.transactionDate,
        amount: customPartyTransactions.amount,
        balanceBefore: customPartyTransactions.balanceBefore,
        balanceAfter: customPartyTransactions.balanceAfter,
        referenceNumber: customPartyTransactions.referenceNumber,
        description: customPartyTransactions.description,
        createdAt: customPartyTransactions.createdAt,
      }).from(customPartyTransactions)
        .where(eq(customPartyTransactions.businessId, input.businessId))
        .orderBy(desc(customPartyTransactions.transactionDate));
      
      let filtered = results;
      if (input.partyId) filtered = filtered.filter(t => t.partyId === input.partyId);
      if (input.transactionType) filtered = filtered.filter(t => t.transactionType === input.transactionType);
      
      return filtered;
    }),

  // إنشاء حركة (يستخدم داخلياً)
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      partyId: z.number(),
      transactionType: z.enum(["receipt", "payment", "invoice", "credit_note", "debit_note", "adjustment"]),
      transactionDate: z.string(),
      amount: z.string(),
      balanceBefore: z.string(),
      balanceAfter: z.string(),
      currency: z.string().optional(),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      referenceNumber: z.string().optional(),
      description: z.string().optional(),
      createdBy: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customPartyTransactions).values(input as InsertCustomPartyTransaction);
      return { id: Number(result[0].insertId), success: true };
    }),
});

// ============================================
/**
 * @namespace customSettingsRouter
 * @description Router لإدارة الإعدادات المخصصة - يتيح حفظ واسترجاع
 * إعدادات النظام المخصصة لكل شركة.
 */
// Custom Settings Router (إعدادات النظام)
// ============================================
export const customSettingsRouter = router({
  // الحصول على إعداد
  get: protectedProcedure
    .input(z.object({ businessId: z.number(), key: z.string(), subSystemId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const results = await db.select({
        id: customSettings.id,
        businessId: customSettings.businessId,
        subSystemId: customSettings.subSystemId,
        settingKey: customSettings.settingKey,
        settingValue: customSettings.settingValue,
        settingType: customSettings.settingType,
      }).from(customSettings)
        .where(and(
          eq(customSettings.businessId, input.businessId),
          eq(customSettings.settingKey, input.key)
        ));
      
      if (input.subSystemId) {
        const specific = results.find(s => s.subSystemId === input.subSystemId);
        if (specific) return specific;
      }
      
      return results.find(s => !s.subSystemId) || null;
    }),

  // حفظ إعداد
  set: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      settingKey: z.string(),
      settingValue: z.string(),
      settingType: z.enum(["string", "number", "boolean", "json"]).optional(),
      description: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // البحث عن إعداد موجود
      const existing = await db.select({
        id: customSettings.id,
        subSystemId: customSettings.subSystemId,
      }).from(customSettings)
        .where(and(
          eq(customSettings.businessId, input.businessId),
          eq(customSettings.settingKey, input.settingKey)
        ));
      
      const match = input.subSystemId 
        ? existing.find(s => s.subSystemId === input.subSystemId)
        : existing.find(s => !s.subSystemId);
      
      if (match) {
        await db.update(customSettings)
          .set({ settingValue: input.settingValue, settingType: input.settingType })
          .where(eq(customSettings.id, match.id));
      } else {
        await db.insert(customSettings).values(input as InsertCustomSetting);
      }
      
      return { success: true };
    }),

  // قائمة كل الإعدادات
  list: protectedProcedure
    .input(z.object({ businessId: z.number(), subSystemId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const results = await db.select({
        id: customSettings.id,
        businessId: customSettings.businessId,
        subSystemId: customSettings.subSystemId,
        settingKey: customSettings.settingKey,
        settingValue: customSettings.settingValue,
        settingType: customSettings.settingType,
        description: customSettings.description,
      }).from(customSettings)
        .where(eq(customSettings.businessId, input.businessId));
      
      if (input.subSystemId) {
        return results.filter(s => s.subSystemId === input.subSystemId || !s.subSystemId);
      }
      
      return results;
    }),
});

// ============================================
// Combined Custom System Router
// ============================================
export const customSystemRouter = router({
  accounts: customAccountsRouter,
  transactions: customTransactionsRouter,
  notes: customNotesRouter,
  memos: customMemosRouter,
  categories: noteCategoriesRouter,
  // New routers for personal finance system
  subSystems: customSubSystemsRouter,
  treasuries: customTreasuriesRouter,
  intermediaryAccounts: customIntermediaryAccountsRouter,
  receiptVouchers: customReceiptVouchersRouter,
  paymentVouchers: customPaymentVouchersRouter,
  reconciliations: customReconciliationsRouter,
  transfers: customTransfersRouter,
  // === الـ Routers الجديدة (إصلاح الفجوات) ===
  parties: customPartiesRouter,
  expenseCategories: customCategoriesRouter,
  treasuryMovements: customTreasuryMovementsRouter,
  partyTransactions: customPartyTransactionsRouter,
  settings: customSettingsRouter,
});
