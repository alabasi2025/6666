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
// Combined Custom System Router
// ============================================
export const customSystemRouter = router({
  accounts: customAccountsRouter,
  transactions: customTransactionsRouter,
  notes: customNotesRouter,
  memos: customMemosRouter,
  categories: noteCategoriesRouter,
});
