import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  customAccounts, customTransactions, customNotes, customMemos, noteCategories,
  InsertCustomAccount, InsertCustomTransaction, InsertCustomNote, InsertCustomMemo
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
      if (!db) return [];
      
      return await db.select()
        .from(customAccounts)
        .where(eq(customAccounts.businessId, input.businessId))
        .orderBy(asc(customAccounts.accountNumber));
    }),

  // الحصول على حساب بالمعرف
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const result = await db.select()
        .from(customAccounts)
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
      if (!db) return [];
      
      let query = db.select()
        .from(customTransactions)
        .where(eq(customTransactions.businessId, input.businessId))
        .orderBy(desc(customTransactions.transactionDate))
        .limit(input.limit);
      
      if (input.accountId) {
        query = db.select()
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customTransactions).values({
        ...input,
        createdBy: ctx.user?.id,
      });
      
      // تحديث رصيد الحساب
      const account = await db.select().from(customAccounts).where(eq(customAccounts.id, input.accountId)).limit(1);
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
      if (!db) return [];
      
      return await db.select()
        .from(customNotes)
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
      if (!db) return null;
      
      const result = await db.select()
        .from(customNotes)
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
      if (!db) return [];
      
      let conditions = [eq(customMemos.businessId, input.businessId)];
      if (input.status) {
        conditions.push(eq(customMemos.status, input.status));
      }
      
      return await db.select()
        .from(customMemos)
        .where(and(...conditions))
        .orderBy(desc(customMemos.memoDate));
    }),

  // الحصول على مذكرة بالمعرف
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const result = await db.select()
        .from(customMemos)
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
      if (!db) return [];
      
      return await db.select()
        .from(noteCategories)
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
      if (!db) return [];
      
      return await db.select()
        .from(customSubSystems)
        .where(eq(customSubSystems.businessId, input.businessId))
        .orderBy(asc(customSubSystems.code));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const result = await db.select()
        .from(customSubSystems)
        .where(eq(customSubSystems.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  stats: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      // Get all sub systems
      const subSystems = await db.select()
        .from(customSubSystems)
        .where(eq(customSubSystems.businessId, input.businessId));
      
      const stats = await Promise.all(subSystems.map(async (sys) => {
        const treasuries = await db.select()
          .from(customTreasuries)
          .where(eq(customTreasuries.subSystemId, sys.id));
        
        const receipts = await db.select()
          .from(customReceiptVouchers)
          .where(and(
            eq(customReceiptVouchers.subSystemId, sys.id),
            eq(customReceiptVouchers.status, "confirmed")
          ));
        
        const payments = await db.select()
          .from(customPaymentVouchers)
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customSubSystems).set(data).where(eq(customSubSystems.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
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
      if (!db) return [];
      
      let conditions = [eq(customTreasuries.businessId, input.businessId)];
      if (input.subSystemId) {
        conditions.push(eq(customTreasuries.subSystemId, input.subSystemId));
      }
      if (input.treasuryType) {
        conditions.push(eq(customTreasuries.treasuryType, input.treasuryType));
      }
      
      return await db.select()
        .from(customTreasuries)
        .where(and(...conditions))
        .orderBy(asc(customTreasuries.code));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const result = await db.select()
        .from(customTreasuries)
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customTreasuries).set(data).where(eq(customTreasuries.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const treasury = await db.select()
        .from(customTreasuries)
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
      if (!db) return [];
      
      return await db.select()
        .from(customIntermediaryAccounts)
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customIntermediaryAccounts).set(data).where(eq(customIntermediaryAccounts.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
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
      if (!db) return [];
      
      let conditions = [eq(customReceiptVouchers.businessId, input.businessId)];
      if (input.subSystemId) {
        conditions.push(eq(customReceiptVouchers.subSystemId, input.subSystemId));
      }
      if (input.status) {
        conditions.push(eq(customReceiptVouchers.status, input.status));
      }
      
      return await db.select()
        .from(customReceiptVouchers)
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customReceiptVouchers).set(data).where(eq(customReceiptVouchers.id, id));
      return { success: true };
    }),

  confirm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get voucher
      const voucher = await db.select()
        .from(customReceiptVouchers)
        .where(eq(customReceiptVouchers.id, input.id))
        .limit(1);
      
      if (!voucher[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voucher not found' });
      }
      
      // Update treasury balance
      const treasury = await db.select()
        .from(customTreasuries)
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
      if (!db) return [];
      
      let conditions = [eq(customPaymentVouchers.businessId, input.businessId)];
      if (input.subSystemId) {
        conditions.push(eq(customPaymentVouchers.subSystemId, input.subSystemId));
      }
      if (input.status) {
        conditions.push(eq(customPaymentVouchers.status, input.status));
      }
      
      return await db.select()
        .from(customPaymentVouchers)
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customPaymentVouchers).set(data).where(eq(customPaymentVouchers.id, id));
      return { success: true };
    }),

  confirm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get voucher
      const voucher = await db.select()
        .from(customPaymentVouchers)
        .where(eq(customPaymentVouchers.id, input.id))
        .limit(1);
      
      if (!voucher[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voucher not found' });
      }
      
      // Update treasury balance
      const treasury = await db.select()
        .from(customTreasuries)
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customPaymentVouchers).where(eq(customPaymentVouchers.id, input.id));
      return { success: true };
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
      if (!db) return [];
      
      let conditions = [eq(customReconciliations.businessId, input.businessId)];
      if (input.status) {
        conditions.push(eq(customReconciliations.status, input.status));
      }
      
      return await db.select()
        .from(customReconciliations)
        .where(and(...conditions))
        .orderBy(desc(customReconciliations.createdAt));
    }),

  autoReconcile: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get unreconciled payment vouchers with intermediary destination
      const payments = await db.select()
        .from(customPaymentVouchers)
        .where(and(
          eq(customPaymentVouchers.businessId, input.businessId),
          eq(customPaymentVouchers.status, "confirmed"),
          eq(customPaymentVouchers.isReconciled, false),
          eq(customPaymentVouchers.destinationType, "intermediary")
        ));
      
      // Get unreconciled receipt vouchers with intermediary source
      const receipts = await db.select()
        .from(customReceiptVouchers)
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const reconciliation = await db.select()
        .from(customReconciliations)
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
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.update(customReconciliations)
        .set({ status: "rejected" })
        .where(eq(customReconciliations.id, input.id));
      
      return { success: true };
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
});
