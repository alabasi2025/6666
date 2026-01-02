
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
/**
 * @namespace customMemosRouter
 * @description Router لإدارة المذكرات الداخلية والخارجية - يتيح إنشاء
 * وإرسال واستقبال المذكرات بين الأقسام مع تتبع الحالة.
 */
// Custom Memos Router
// ============================================
export const customMemosRouter = router({
  /**
   * استرجاع قائمة المذكرات
   * 
   * @procedure list
   * @description يسترجع قائمة المذكرات مع إمكانية الفلترة حسب الحالة.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} input.businessId - معرف الشركة
   * @param {string} [input.status] - حالة المذكرة (draft|sent|received|archived)
   * 
   * @returns {Promise<CustomMemo[]>} قائمة المذكرات
   */
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
        accountId: customTreasuries.accountId,
        currency: customTreasuries.currency,
        openingBalance: customTreasuries.openingBalance,
        currentBalance: customTreasuries.currentBalance,
        bankName: customTreasuries.bankName,
        accountNumber: customTreasuries.accountNumber,
        iban: customTreasuries.iban,
        swiftCode: customTreasuries.swiftCode,
        walletProvider: customTreasuries.walletProvider,
        walletNumber: customTreasuries.walletNumber,
        description: customTreasuries.description,
        status: customTreasuries.status,
        createdAt: customTreasuries.createdAt,
        updatedAt: customTreasuries.updatedAt,
      }).from(customTreasuries)
        .where(and(...conditions))
        .orderBy(desc(customTreasuries.createdAt));
    }),
});
