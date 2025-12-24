// @ts-nocheck
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  customAccounts, customTransactions, customNotes, customMemos, noteCategories,
  InsertCustomAccount, InsertCustomTransaction, InsertCustomNote, InsertCustomMemo,
  // الجداول الجديدة
  customParties, customCategories, customTreasuryMovements, customPartyTransactions, customSettings,
  InsertCustomParty, InsertCustomCategory, InsertCustomTreasuryMovement, InsertCustomPartyTransaction, InsertCustomSetting
} from "../drizzle/schema";
import { eq, and, desc, asc, like, sql } from "drizzle-orm";

// ============================================
// Custom Accounts Router
// ============================================
export const customAccountsRouter = router({
  // قائمة الحسابات
  list: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      return await db.select({
        id: customAccounts.id,
        businessId: customAccounts.businessId,
        accountNumber: customAccounts.accountNumber,
        accountName: customAccounts.accountName,
        accountType: customAccounts.accountType,
        parentId: customAccounts.parentId,
        currency: customAccounts.currency,
        balance: customAccounts.balance,
        description: customAccounts.description,
        isActive: customAccounts.isActive,
        createdAt: customAccounts.createdAt,
      }).from(customAccounts)
        .where(eq(customAccounts.businessId, input.businessId))
        .orderBy(asc(customAccounts.accountNumber));
    }),

  // الحصول على حساب بالمعرف
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return null;
      
      const result = await db.select({
        id: customAccounts.id,
        businessId: customAccounts.businessId,
        accountNumber: customAccounts.accountNumber,
        accountName: customAccounts.accountName,
        accountType: customAccounts.accountType,
        parentId: customAccounts.parentId,
        currency: customAccounts.currency,
        balance: customAccounts.balance,
        description: customAccounts.description,
        isActive: customAccounts.isActive,
        createdAt: customAccounts.createdAt,
      }).from(customAccounts)
        .where(eq(customAccounts.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  // إنشاء حساب جديد
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      accountNumber: z.string().min(1),
      accountName: z.string().min(1),
      accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
      parentId: z.number().optional(),
      currency: z.string().default("SAR"),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customAccounts).values({
        ...input,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, success: true };
    }),

  // تحديث حساب
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      accountNumber: z.string().optional(),
      accountName: z.string().optional(),
      accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customAccounts).set(data).where(eq(customAccounts.id, id));
      return { success: true };
    }),

  // حذف حساب
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customAccounts).where(eq(customAccounts.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Custom Transactions Router
// ============================================
export const customTransactionsRouter = router({
  // قائمة الحركات
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      accountId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      const selectFields = {
        id: customTransactions.id,
        businessId: customTransactions.businessId,
        transactionNumber: customTransactions.transactionNumber,
        transactionDate: customTransactions.transactionDate,
        accountId: customTransactions.accountId,
        transactionType: customTransactions.transactionType,
        amount: customTransactions.amount,
        description: customTransactions.description,
        createdAt: customTransactions.createdAt,
      };
      let query = db.select(selectFields)
        .from(customTransactions)
        .where(eq(customTransactions.businessId, input.businessId))
        .orderBy(desc(customTransactions.transactionDate))
        .limit(input.limit);
      
      if (input.accountId) {
        query = db.select(selectFields)
          .from(customTransactions)
          .where(and(
            eq(customTransactions.businessId, input.businessId),
            eq(customTransactions.accountId, input.accountId)
          ))
          .orderBy(desc(customTransactions.transactionDate))
          .limit(input.limit);
      }
      
      return await query;
    }),

  // إنشاء حركة جديدة
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      transactionNumber: z.string().min(1),
      transactionDate: z.string(),
      accountId: z.number(),
      transactionType: z.enum(["debit", "credit"]),
      amount: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customTransactions).values({
        ...input,
        createdBy: ctx.user?.id,
      });
      
      // تحديث رصيد الحساب
      const account = await db.select({
        id: customAccounts.id,
        balance: customAccounts.balance,
      }).from(customAccounts).where(eq(customAccounts.id, input.accountId)).limit(1);
      if (account[0]) {
        const currentBalance = parseFloat(account[0].balance || "0");
        const amount = parseFloat(input.amount);
        const newBalance = input.transactionType === "debit" 
          ? currentBalance + amount 
          : currentBalance - amount;
        
        await db.update(customAccounts)
          .set({ balance: newBalance.toString() })
          .where(eq(customAccounts.id, input.accountId));
      }
      
      return { id: result[0].insertId, success: true };
    }),
});

// ============================================
// Custom Notes Router
// ============================================
export const customNotesRouter = router({
  // قائمة الملاحظات
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      category: z.string().optional(),
      isArchived: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      return await db.select({
        id: customNotes.id,
        businessId: customNotes.businessId,
        title: customNotes.title,
        content: customNotes.content,
        category: customNotes.category,
        priority: customNotes.priority,
        color: customNotes.color,
        tags: customNotes.tags,
        isPinned: customNotes.isPinned,
        isArchived: customNotes.isArchived,
        createdAt: customNotes.createdAt,
      }).from(customNotes)
        .where(and(
          eq(customNotes.businessId, input.businessId),
          eq(customNotes.isArchived, input.isArchived)
        ))
        .orderBy(desc(customNotes.isPinned), desc(customNotes.createdAt));
    }),

  // الحصول على ملاحظة بالمعرف
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return null;
      
      const result = await db.select({
        id: customNotes.id,
        businessId: customNotes.businessId,
        title: customNotes.title,
        content: customNotes.content,
        category: customNotes.category,
        priority: customNotes.priority,
        color: customNotes.color,
        tags: customNotes.tags,
        isPinned: customNotes.isPinned,
        isArchived: customNotes.isArchived,
        createdAt: customNotes.createdAt,
      }).from(customNotes)
        .where(eq(customNotes.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  // إنشاء ملاحظة جديدة
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      title: z.string().min(1),
      content: z.string().optional(),
      category: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      color: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customNotes).values({
        ...input,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, success: true };
    }),

  // تحديث ملاحظة
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      color: z.string().optional(),
      isPinned: z.boolean().optional(),
      isArchived: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customNotes).set(data).where(eq(customNotes.id, id));
      return { success: true };
    }),

  // حذف ملاحظة
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customNotes).where(eq(customNotes.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Custom Memos Router
// ============================================
export const customMemosRouter = router({
  // قائمة المذكرات
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      status: z.enum(["draft", "sent", "received", "archived"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      let conditions = [eq(customMemos.businessId, input.businessId)];
      if (input.status) {
        conditions.push(eq(customMemos.status, input.status));
      }
      
      return await db.select({
        id: customMemos.id,
        businessId: customMemos.businessId,
        memoNumber: customMemos.memoNumber,
        memoDate: customMemos.memoDate,
        subject: customMemos.subject,
        content: customMemos.content,
        memoType: customMemos.memoType,
        fromDepartment: customMemos.fromDepartment,
        toDepartment: customMemos.toDepartment,
        priority: customMemos.priority,
        status: customMemos.status,
        createdAt: customMemos.createdAt,
      }).from(customMemos)
        .where(and(...conditions))
        .orderBy(desc(customMemos.memoDate));
    }),

  // الحصول على مذكرة بالمعرف
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return null;
      
      const result = await db.select({
        id: customMemos.id,
        businessId: customMemos.businessId,
        memoNumber: customMemos.memoNumber,
        memoDate: customMemos.memoDate,
        subject: customMemos.subject,
        content: customMemos.content,
        memoType: customMemos.memoType,
        fromDepartment: customMemos.fromDepartment,
        toDepartment: customMemos.toDepartment,
        priority: customMemos.priority,
        status: customMemos.status,
        responseRequired: customMemos.responseRequired,
        responseDeadline: customMemos.responseDeadline,
        createdAt: customMemos.createdAt,
      }).from(customMemos)
        .where(eq(customMemos.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  // إنشاء مذكرة جديدة
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      memoNumber: z.string().min(1),
      memoDate: z.string(),
      subject: z.string().min(1),
      content: z.string().optional(),
      memoType: z.enum(["internal", "external", "circular", "directive"]).default("internal"),
      fromDepartment: z.string().optional(),
      toDepartment: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      responseRequired: z.boolean().default(false),
      responseDeadline: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customMemos).values({
        ...input,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, success: true };
    }),

  // تحديث مذكرة
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      subject: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "sent", "received", "archived"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customMemos).set(data).where(eq(customMemos.id, id));
      return { success: true };
    }),

  // حذف مذكرة
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customMemos).where(eq(customMemos.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Note Categories Router
// ============================================
export const noteCategoriesRouter = router({
  list: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      return await db.select({
        id: noteCategories.id,
        businessId: noteCategories.businessId,
        name: noteCategories.name,
        color: noteCategories.color,
        icon: noteCategories.icon,
        createdAt: noteCategories.createdAt,
      }).from(noteCategories)
        .where(eq(noteCategories.businessId, input.businessId))
        .orderBy(asc(noteCategories.name));
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      name: z.string().min(1),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(noteCategories).values(input);
      return { id: result[0].insertId, success: true };
    }),
});




// ============================================
// Import new tables
// ============================================
import {
  customSubSystems,
  customTreasuries,
  customIntermediaryAccounts,
  customReceiptVouchers,
  customPaymentVouchers,
  customReconciliations,
  customTreasuryTransfers,
} from "../drizzle/schema";

// ============================================
// Custom Sub Systems Router
// ============================================
export const customSubSystemsRouter = router({
  list: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      return await db.select({
        id: customSubSystems.id,
        businessId: customSubSystems.businessId,
        code: customSubSystems.code,
        nameAr: customSubSystems.nameAr,
        nameEn: customSubSystems.nameEn,
        description: customSubSystems.description,
        color: customSubSystems.color,
        icon: customSubSystems.icon,
        isActive: customSubSystems.isActive,
        createdAt: customSubSystems.createdAt,
      }).from(customSubSystems)
        .where(eq(customSubSystems.businessId, input.businessId))
        .orderBy(asc(customSubSystems.code));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return null;
      
      const result = await db.select({
        id: customSubSystems.id,
        businessId: customSubSystems.businessId,
        code: customSubSystems.code,
        nameAr: customSubSystems.nameAr,
        nameEn: customSubSystems.nameEn,
        description: customSubSystems.description,
        color: customSubSystems.color,
        icon: customSubSystems.icon,
        isActive: customSubSystems.isActive,
        createdAt: customSubSystems.createdAt,
      }).from(customSubSystems)
        .where(eq(customSubSystems.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  stats: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      // Get all sub systems
      const subSystems = await db.select({
        id: customSubSystems.id,
        nameAr: customSubSystems.nameAr,
      }).from(customSubSystems)
        .where(eq(customSubSystems.businessId, input.businessId));
      
      const stats = await Promise.all(subSystems.map(async (sys) => {
        const treasuries = await db.select({
          id: customTreasuries.id,
        }).from(customTreasuries)
          .where(eq(customTreasuries.subSystemId, sys.id));
        
        const receipts = await db.select({
          id: customReceiptVouchers.id,
          amount: customReceiptVouchers.amount,
        }).from(customReceiptVouchers)
          .where(and(
            eq(customReceiptVouchers.subSystemId, sys.id),
            eq(customReceiptVouchers.status, "confirmed")
          ));
        
        const payments = await db.select({
          id: customPaymentVouchers.id,
          amount: customPaymentVouchers.amount,
        }).from(customPaymentVouchers)
          .where(and(
            eq(customPaymentVouchers.subSystemId, sys.id),
            eq(customPaymentVouchers.status, "confirmed")
          ));
        
        const totalReceipts = receipts.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
        const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
        
        return {
          subSystemId: sys.id,
          treasuries: treasuries.length,
          receipts: receipts.length,
          payments: payments.length,
          balance: totalReceipts - totalPayments,
        };
      }));
      
      return stats;
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customSubSystems).values({
        ...input,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customSubSystems).set(data).where(eq(customSubSystems.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customSubSystems).where(eq(customSubSystems.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Custom Treasuries Router
// ============================================
export const customTreasuriesRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      subSystemId: z.number().optional(),
      treasuryType: z.enum(["cash", "bank", "wallet", "exchange"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      let conditions = [eq(customTreasuries.businessId, input.businessId)];
      if (input.subSystemId) {
        conditions.push(eq(customTreasuries.subSystemId, input.subSystemId));
      }
      if (input.treasuryType) {
        conditions.push(eq(customTreasuries.treasuryType, input.treasuryType));
      }
      
      return await db.select({
        id: customTreasuries.id,
        businessId: customTreasuries.businessId,
        subSystemId: customTreasuries.subSystemId,
        code: customTreasuries.code,
        nameAr: customTreasuries.nameAr,
        nameEn: customTreasuries.nameEn,
        treasuryType: customTreasuries.treasuryType,
        bankName: customTreasuries.bankName,
        accountNumber: customTreasuries.accountNumber,
        currency: customTreasuries.currency,
        openingBalance: customTreasuries.openingBalance,
        currentBalance: customTreasuries.currentBalance,
        isActive: customTreasuries.isActive,
        createdAt: customTreasuries.createdAt,
      }).from(customTreasuries)
        .where(and(...conditions))
        .orderBy(asc(customTreasuries.code));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return null;
      
      const result = await db.select({
        id: customTreasuries.id,
        businessId: customTreasuries.businessId,
        subSystemId: customTreasuries.subSystemId,
        code: customTreasuries.code,
        nameAr: customTreasuries.nameAr,
        nameEn: customTreasuries.nameEn,
        treasuryType: customTreasuries.treasuryType,
        bankName: customTreasuries.bankName,
        accountNumber: customTreasuries.accountNumber,
        iban: customTreasuries.iban,
        swiftCode: customTreasuries.swiftCode,
        walletProvider: customTreasuries.walletProvider,
        walletNumber: customTreasuries.walletNumber,
        currency: customTreasuries.currency,
        openingBalance: customTreasuries.openingBalance,
        currentBalance: customTreasuries.currentBalance,
        description: customTreasuries.description,
        isActive: customTreasuries.isActive,
        createdAt: customTreasuries.createdAt,
      }).from(customTreasuries)
        .where(eq(customTreasuries.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      treasuryType: z.enum(["cash", "bank", "wallet", "exchange"]),
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      iban: z.string().optional(),
      swiftCode: z.string().optional(),
      walletProvider: z.string().optional(),
      walletNumber: z.string().optional(),
      currency: z.string().default("SAR"),
      openingBalance: z.string().default("0"),
      currentBalance: z.string().default("0"),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customTreasuries).values({
        ...input,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      treasuryType: z.enum(["cash", "bank", "wallet", "exchange"]).optional(),
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      iban: z.string().optional(),
      swiftCode: z.string().optional(),
      walletProvider: z.string().optional(),
      walletNumber: z.string().optional(),
      currency: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customTreasuries).set(data).where(eq(customTreasuries.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customTreasuries).where(eq(customTreasuries.id, input.id));
      return { success: true };
    }),

  updateBalance: protectedProcedure
    .input(z.object({
      id: z.number(),
      amount: z.string(),
      operation: z.enum(["add", "subtract"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const treasury = await db.select({
        id: customTreasuries.id,
        currentBalance: customTreasuries.currentBalance,
      }).from(customTreasuries)
        .where(eq(customTreasuries.id, input.id))
        .limit(1);
      
      if (!treasury[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Treasury not found' });
      }
      
      const currentBalance = parseFloat(treasury[0].currentBalance || "0");
      const amount = parseFloat(input.amount);
      const newBalance = input.operation === "add" 
        ? currentBalance + amount 
        : currentBalance - amount;
      
      await db.update(customTreasuries)
        .set({ currentBalance: newBalance.toString() })
        .where(eq(customTreasuries.id, input.id));
      
      return { success: true, newBalance };
    }),
});

// ============================================
// Custom Intermediary Accounts Router
// ============================================
export const customIntermediaryAccountsRouter = router({
  list: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      return await db.select({
        id: customIntermediaryAccounts.id,
        businessId: customIntermediaryAccounts.businessId,
        fromSubSystemId: customIntermediaryAccounts.fromSubSystemId,
        toSubSystemId: customIntermediaryAccounts.toSubSystemId,
        code: customIntermediaryAccounts.code,
        nameAr: customIntermediaryAccounts.nameAr,
        nameEn: customIntermediaryAccounts.nameEn,
        currency: customIntermediaryAccounts.currency,
        currentBalance: customIntermediaryAccounts.currentBalance,
        isActive: customIntermediaryAccounts.isActive,
        createdAt: customIntermediaryAccounts.createdAt,
      }).from(customIntermediaryAccounts)
        .where(eq(customIntermediaryAccounts.businessId, input.businessId))
        .orderBy(asc(customIntermediaryAccounts.code));
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      fromSubSystemId: z.number(),
      toSubSystemId: z.number(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      currency: z.string().default("SAR"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customIntermediaryAccounts).values(input);
      return { id: result[0].insertId, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customIntermediaryAccounts).set(data).where(eq(customIntermediaryAccounts.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customIntermediaryAccounts).where(eq(customIntermediaryAccounts.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Custom Receipt Vouchers Router
// ============================================
export const customReceiptVouchersRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      subSystemId: z.number().optional(),
      status: z.enum(["draft", "confirmed", "cancelled"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      let conditions = [eq(customReceiptVouchers.businessId, input.businessId)];
      if (input.subSystemId) {
        conditions.push(eq(customReceiptVouchers.subSystemId, input.subSystemId));
      }
      if (input.status) {
        conditions.push(eq(customReceiptVouchers.status, input.status));
      }
      
      return await db.select({
        id: customReceiptVouchers.id,
        businessId: customReceiptVouchers.businessId,
        subSystemId: customReceiptVouchers.subSystemId,
        voucherNumber: customReceiptVouchers.voucherNumber,
        voucherDate: customReceiptVouchers.voucherDate,
        amount: customReceiptVouchers.amount,
        currency: customReceiptVouchers.currency,
        sourceType: customReceiptVouchers.sourceType,
        sourceName: customReceiptVouchers.sourceName,
        treasuryId: customReceiptVouchers.treasuryId,
        description: customReceiptVouchers.description,
        status: customReceiptVouchers.status,
        isReconciled: customReceiptVouchers.isReconciled,
        createdAt: customReceiptVouchers.createdAt,
      }).from(customReceiptVouchers)
        .where(and(...conditions))
        .orderBy(desc(customReceiptVouchers.voucherDate));
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      voucherDate: z.string(),
      amount: z.string(),
      currency: z.string().default("SAR"),
      sourceType: z.enum(["person", "entity", "intermediary", "other"]),
      sourceName: z.string().optional(),
      sourceIntermediaryId: z.number().optional(),
      treasuryId: z.number(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Generate voucher number
      const count = await db.select({ count: sql<number>`count(*)` })
        .from(customReceiptVouchers)
        .where(eq(customReceiptVouchers.businessId, input.businessId));
      const voucherNumber = `RV-${String(count[0].count + 1).padStart(6, '0')}`;
      
      const result = await db.insert(customReceiptVouchers).values({
        ...input,
        voucherNumber,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, voucherNumber, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      voucherDate: z.string().optional(),
      amount: z.string().optional(),
      sourceType: z.enum(["person", "entity", "intermediary", "other"]).optional(),
      sourceName: z.string().optional(),
      sourceIntermediaryId: z.number().optional(),
      treasuryId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customReceiptVouchers).set(data).where(eq(customReceiptVouchers.id, id));
      return { success: true };
    }),

  confirm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get voucher
      const voucher = await db.select({
        id: customReceiptVouchers.id,
        treasuryId: customReceiptVouchers.treasuryId,
        amount: customReceiptVouchers.amount,
      }).from(customReceiptVouchers)
        .where(eq(customReceiptVouchers.id, input.id))
        .limit(1);
      
      if (!voucher[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voucher not found' });
      }
      
      // Update treasury balance
      const treasury = await db.select({
        id: customTreasuries.id,
        currentBalance: customTreasuries.currentBalance,
      }).from(customTreasuries)
        .where(eq(customTreasuries.id, voucher[0].treasuryId))
        .limit(1);
      
      if (treasury[0]) {
        const currentBalance = parseFloat(treasury[0].currentBalance || "0");
        const amount = parseFloat(voucher[0].amount);
        await db.update(customTreasuries)
          .set({ currentBalance: (currentBalance + amount).toString() })
          .where(eq(customTreasuries.id, voucher[0].treasuryId));
      }
      
      // Update voucher status
      await db.update(customReceiptVouchers)
        .set({ status: "confirmed" })
        .where(eq(customReceiptVouchers.id, input.id));
      
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customReceiptVouchers).where(eq(customReceiptVouchers.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Custom Payment Vouchers Router
// ============================================
export const customPaymentVouchersRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      subSystemId: z.number().optional(),
      status: z.enum(["draft", "confirmed", "cancelled"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      let conditions = [eq(customPaymentVouchers.businessId, input.businessId)];
      if (input.subSystemId) {
        conditions.push(eq(customPaymentVouchers.subSystemId, input.subSystemId));
      }
      if (input.status) {
        conditions.push(eq(customPaymentVouchers.status, input.status));
      }
      
      return await db.select({
        id: customPaymentVouchers.id,
        businessId: customPaymentVouchers.businessId,
        subSystemId: customPaymentVouchers.subSystemId,
        voucherNumber: customPaymentVouchers.voucherNumber,
        voucherDate: customPaymentVouchers.voucherDate,
        amount: customPaymentVouchers.amount,
        currency: customPaymentVouchers.currency,
        treasuryId: customPaymentVouchers.treasuryId,
        destinationType: customPaymentVouchers.destinationType,
        destinationName: customPaymentVouchers.destinationName,
        description: customPaymentVouchers.description,
        status: customPaymentVouchers.status,
        isReconciled: customPaymentVouchers.isReconciled,
        createdAt: customPaymentVouchers.createdAt,
      }).from(customPaymentVouchers)
        .where(and(...conditions))
        .orderBy(desc(customPaymentVouchers.voucherDate));
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      voucherDate: z.string(),
      amount: z.string(),
      currency: z.string().default("SAR"),
      treasuryId: z.number(),
      destinationType: z.enum(["person", "entity", "intermediary", "other"]),
      destinationName: z.string().optional(),
      destinationIntermediaryId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Generate voucher number
      const count = await db.select({ count: sql<number>`count(*)` })
        .from(customPaymentVouchers)
        .where(eq(customPaymentVouchers.businessId, input.businessId));
      const voucherNumber = `PV-${String(count[0].count + 1).padStart(6, '0')}`;
      
      const result = await db.insert(customPaymentVouchers).values({
        ...input,
        voucherNumber,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, voucherNumber, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      voucherDate: z.string().optional(),
      amount: z.string().optional(),
      treasuryId: z.number().optional(),
      destinationType: z.enum(["person", "entity", "intermediary", "other"]).optional(),
      destinationName: z.string().optional(),
      destinationIntermediaryId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customPaymentVouchers).set(data).where(eq(customPaymentVouchers.id, id));
      return { success: true };
    }),

  confirm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get voucher
      const voucher = await db.select({
        id: customPaymentVouchers.id,
        treasuryId: customPaymentVouchers.treasuryId,
        amount: customPaymentVouchers.amount,
      }).from(customPaymentVouchers)
        .where(eq(customPaymentVouchers.id, input.id))
        .limit(1);
      
      if (!voucher[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voucher not found' });
      }
      
      // Update treasury balance
      const treasury = await db.select({
        id: customTreasuries.id,
        currentBalance: customTreasuries.currentBalance,
      }).from(customTreasuries)
        .where(eq(customTreasuries.id, voucher[0].treasuryId))
        .limit(1);
      
      if (treasury[0]) {
        const currentBalance = parseFloat(treasury[0].currentBalance || "0");
        const amount = parseFloat(voucher[0].amount);
        await db.update(customTreasuries)
          .set({ currentBalance: (currentBalance - amount).toString() })
          .where(eq(customTreasuries.id, voucher[0].treasuryId));
      }
      
      // Update voucher status
      await db.update(customPaymentVouchers)
        .set({ status: "confirmed" })
        .where(eq(customPaymentVouchers.id, input.id));
      
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customPaymentVouchers).where(eq(customPaymentVouchers.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Inter-System Transfers Router
// ============================================
export const customTransfersRouter = router({
  // إنشاء تحويل بين نظامين فرعيين
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      fromSubSystemId: z.number(),
      toSubSystemId: z.number(),
      fromTreasuryId: z.number(),
      toTreasuryId: z.number(),
      amount: z.string(),
      currency: z.string().default("SAR"),
      description: z.string().optional(),
      transferDate: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // 1. البحث عن أو إنشاء الحساب الوسيط
      let intermediaryAccount = await db.select({
        id: customIntermediaryAccounts.id,
      }).from(customIntermediaryAccounts)
        .where(and(
          eq(customIntermediaryAccounts.businessId, input.businessId),
          eq(customIntermediaryAccounts.fromSubSystemId, input.fromSubSystemId),
          eq(customIntermediaryAccounts.toSubSystemId, input.toSubSystemId)
        ))
        .limit(1);
      
      let intermediaryId: number;
      
      if (!intermediaryAccount[0]) {
        // إنشاء حساب وسيط جديد
        const fromSystem = await db.select({ id: customSubSystems.id, nameAr: customSubSystems.nameAr }).from(customSubSystems).where(eq(customSubSystems.id, input.fromSubSystemId)).limit(1);
        const toSystem = await db.select({ id: customSubSystems.id, nameAr: customSubSystems.nameAr }).from(customSubSystems).where(eq(customSubSystems.id, input.toSubSystemId)).limit(1);
        
        const code = `INT-${input.fromSubSystemId}-${input.toSubSystemId}`;
        const nameAr = `حساب وسيط: ${fromSystem[0]?.nameAr || 'نظام'} → ${toSystem[0]?.nameAr || 'نظام'}`;
        
        const newAccount = await db.insert(customIntermediaryAccounts).values({
          businessId: input.businessId,
          fromSubSystemId: input.fromSubSystemId,
          toSubSystemId: input.toSubSystemId,
          code,
          nameAr,
          currency: input.currency,
        });
        intermediaryId = newAccount[0].insertId;
      } else {
        intermediaryId = intermediaryAccount[0].id;
      }
      
      // 2. إنشاء سند صرف في النظام المصدر
      const paymentCount = await db.select({ count: sql<number>`count(*)` })
        .from(customPaymentVouchers)
        .where(eq(customPaymentVouchers.businessId, input.businessId));
      const paymentNumber = `PV-${String(paymentCount[0].count + 1).padStart(6, '0')}`;
      
      const paymentResult = await db.insert(customPaymentVouchers).values({
        businessId: input.businessId,
        subSystemId: input.fromSubSystemId,
        voucherNumber: paymentNumber,
        voucherDate: input.transferDate,
        amount: input.amount,
        currency: input.currency,
        destinationType: "intermediary",
        destinationIntermediaryId: intermediaryId,
        destinationName: `تحويل إلى نظام فرعي`,
        treasuryId: input.fromTreasuryId,
        description: input.description || `تحويل بين الأنظمة الفرعية`,
        status: "confirmed",
        isReconciled: false,
        createdBy: ctx.user?.id,
      });
      
      // 3. إنشاء سند قبض في النظام المستقبل
      const receiptCount = await db.select({ count: sql<number>`count(*)` })
        .from(customReceiptVouchers)
        .where(eq(customReceiptVouchers.businessId, input.businessId));
      const receiptNumber = `RV-${String(receiptCount[0].count + 1).padStart(6, '0')}`;
      
      const receiptResult = await db.insert(customReceiptVouchers).values({
        businessId: input.businessId,
        subSystemId: input.toSubSystemId,
        voucherNumber: receiptNumber,
        voucherDate: input.transferDate,
        amount: input.amount,
        currency: input.currency,
        sourceType: "intermediary",
        sourceIntermediaryId: intermediaryId,
        sourceName: `تحويل من نظام فرعي`,
        treasuryId: input.toTreasuryId,
        description: input.description || `تحويل بين الأنظمة الفرعية`,
        status: "confirmed",
        isReconciled: false,
        createdBy: ctx.user?.id,
      });
      
      // 4. تحديث أرصدة الخزائن
      const fromTreasury = await db.select({ id: customTreasuries.id, currentBalance: customTreasuries.currentBalance }).from(customTreasuries).where(eq(customTreasuries.id, input.fromTreasuryId)).limit(1);
      const toTreasury = await db.select({ id: customTreasuries.id, currentBalance: customTreasuries.currentBalance }).from(customTreasuries).where(eq(customTreasuries.id, input.toTreasuryId)).limit(1);
      
      if (fromTreasury[0]) {
        const newBalance = parseFloat(fromTreasury[0].currentBalance || "0") - parseFloat(input.amount);
        await db.update(customTreasuries)
          .set({ currentBalance: newBalance.toString() })
          .where(eq(customTreasuries.id, input.fromTreasuryId));
      }
      
      if (toTreasury[0]) {
        const newBalance = parseFloat(toTreasury[0].currentBalance || "0") + parseFloat(input.amount);
        await db.update(customTreasuries)
          .set({ currentBalance: newBalance.toString() })
          .where(eq(customTreasuries.id, input.toTreasuryId));
      }
      
      return {
        success: true,
        paymentVoucherId: paymentResult[0].insertId,
        paymentVoucherNumber: paymentNumber,
        receiptVoucherId: receiptResult[0].insertId,
        receiptVoucherNumber: receiptNumber,
        intermediaryAccountId: intermediaryId,
      };
    }),

  // قائمة التحويلات بين الأنظمة
  list: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      // جلب سندات الصرف التي تمت إلى حسابات وسيطة
      let conditions = [
        eq(customPaymentVouchers.businessId, input.businessId),
        eq(customPaymentVouchers.destinationType, "intermediary")
      ];
      
      if (input.subSystemId) {
        conditions.push(eq(customPaymentVouchers.subSystemId, input.subSystemId));
      }
      
      const outgoingTransfers = await db.select({
        id: customPaymentVouchers.id,
        voucherNumber: customPaymentVouchers.voucherNumber,
        voucherDate: customPaymentVouchers.voucherDate,
        amount: customPaymentVouchers.amount,
        currency: customPaymentVouchers.currency,
        destinationIntermediaryId: customPaymentVouchers.destinationIntermediaryId,
        status: customPaymentVouchers.status,
      }).from(customPaymentVouchers)
        .where(and(...conditions))
        .orderBy(desc(customPaymentVouchers.voucherDate));
      
      // جلب سندات القبض من حسابات وسيطة
      let receiptConditions = [
        eq(customReceiptVouchers.businessId, input.businessId),
        eq(customReceiptVouchers.sourceType, "intermediary")
      ];
      
      if (input.subSystemId) {
        receiptConditions.push(eq(customReceiptVouchers.subSystemId, input.subSystemId));
      }
      
      const incomingTransfers = await db.select({
        id: customReceiptVouchers.id,
        voucherNumber: customReceiptVouchers.voucherNumber,
        voucherDate: customReceiptVouchers.voucherDate,
        amount: customReceiptVouchers.amount,
        currency: customReceiptVouchers.currency,
        sourceIntermediaryId: customReceiptVouchers.sourceIntermediaryId,
        status: customReceiptVouchers.status,
      }).from(customReceiptVouchers)
        .where(and(...receiptConditions))
        .orderBy(desc(customReceiptVouchers.voucherDate));
      
      return {
        outgoing: outgoingTransfers,
        incoming: incomingTransfers,
      };
    }),

  // جلب التحويلات غير المطابقة
  getUnreconciled: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return { outgoing: [], incoming: [] };
      
      let paymentConditions = [
        eq(customPaymentVouchers.businessId, input.businessId),
        eq(customPaymentVouchers.destinationType, "intermediary"),
        eq(customPaymentVouchers.status, "confirmed"),
        eq(customPaymentVouchers.isReconciled, false)
      ];
      
      if (input.subSystemId) {
        paymentConditions.push(eq(customPaymentVouchers.subSystemId, input.subSystemId));
      }
      
      const outgoing = await db.select({
        id: customPaymentVouchers.id,
        voucherNumber: customPaymentVouchers.voucherNumber,
        voucherDate: customPaymentVouchers.voucherDate,
        amount: customPaymentVouchers.amount,
        destinationIntermediaryId: customPaymentVouchers.destinationIntermediaryId,
      }).from(customPaymentVouchers)
        .where(and(...paymentConditions));
      
      let receiptConditions = [
        eq(customReceiptVouchers.businessId, input.businessId),
        eq(customReceiptVouchers.sourceType, "intermediary"),
        eq(customReceiptVouchers.status, "confirmed"),
        eq(customReceiptVouchers.isReconciled, false)
      ];
      
      if (input.subSystemId) {
        receiptConditions.push(eq(customReceiptVouchers.subSystemId, input.subSystemId));
      }
      
      const incoming = await db.select({
        id: customReceiptVouchers.id,
        voucherNumber: customReceiptVouchers.voucherNumber,
        voucherDate: customReceiptVouchers.voucherDate,
        amount: customReceiptVouchers.amount,
        sourceIntermediaryId: customReceiptVouchers.sourceIntermediaryId,
      }).from(customReceiptVouchers)
        .where(and(...receiptConditions));
      
      return { outgoing, incoming };
    }),
});

// ============================================
// Custom Reconciliations Router
// ============================================
export const customReconciliationsRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      status: z.enum(["pending", "confirmed", "rejected"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      let conditions = [eq(customReconciliations.businessId, input.businessId)];
      if (input.status) {
        conditions.push(eq(customReconciliations.status, input.status));
      }
      
      return await db.select({
        id: customReconciliations.id,
        businessId: customReconciliations.businessId,
        paymentVoucherId: customReconciliations.paymentVoucherId,
        receiptVoucherId: customReconciliations.receiptVoucherId,
        amount: customReconciliations.amount,
        currency: customReconciliations.currency,
        confidenceScore: customReconciliations.confidenceScore,
        status: customReconciliations.status,
        createdAt: customReconciliations.createdAt,
      }).from(customReconciliations)
        .where(and(...conditions))
        .orderBy(desc(customReconciliations.createdAt));
    }),

  autoReconcile: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get unreconciled payment vouchers with intermediary destination
      const payments = await db.select({
        id: customPaymentVouchers.id,
        voucherDate: customPaymentVouchers.voucherDate,
        amount: customPaymentVouchers.amount,
        currency: customPaymentVouchers.currency,
        destinationIntermediaryId: customPaymentVouchers.destinationIntermediaryId,
      }).from(customPaymentVouchers)
        .where(and(
          eq(customPaymentVouchers.businessId, input.businessId),
          eq(customPaymentVouchers.status, "confirmed"),
          eq(customPaymentVouchers.isReconciled, false),
          eq(customPaymentVouchers.destinationType, "intermediary")
        ));
      
      // Get unreconciled receipt vouchers with intermediary source
      const receipts = await db.select({
        id: customReceiptVouchers.id,
        voucherDate: customReceiptVouchers.voucherDate,
        amount: customReceiptVouchers.amount,
        currency: customReceiptVouchers.currency,
        sourceIntermediaryId: customReceiptVouchers.sourceIntermediaryId,
      }).from(customReceiptVouchers)
        .where(and(
          eq(customReceiptVouchers.businessId, input.businessId),
          eq(customReceiptVouchers.status, "confirmed"),
          eq(customReceiptVouchers.isReconciled, false),
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
// Custom Parties Router (إدارة الأطراف)
// ============================================
export const customPartiesRouter = router({
  // قائمة الأطراف
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
