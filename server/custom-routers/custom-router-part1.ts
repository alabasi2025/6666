
/**
 * @fileoverview Router للنظام المخصص والحسابات الخاصة
 * @module customSystemRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بالنظام المخصص
 * بما في ذلك إدارة الحسابات المخصصة، الحركات المالية، الملاحظات، المذكرات،
 * الأطراف، الفئات، حركات الخزينة، والإعدادات.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires drizzle-orm - للتعامل مع قاعدة البيانات
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

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
/**
 * @namespace customAccountsRouter
 * @description Router لإدارة الحسابات المخصصة - يتيح إنشاء وتعديل وحذف
 * الحسابات المالية المخصصة مع تتبع الأرصدة والحركات.
 */
// Custom Accounts Router
// ============================================
export const customAccountsRouter = router({
  /**
   * استرجاع قائمة الحسابات المخصصة
   * 
   * @procedure list
   * @description يسترجع قائمة الحسابات المخصصة للشركة مرتبة حسب رقم الحساب.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} input.businessId - معرف الشركة
   * 
   * @returns {Promise<CustomAccount[]>} قائمة الحسابات
   */
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

  /**
   * استرجاع حساب بواسطة المعرف
   * 
   * @procedure getById
   * @description يسترجع بيانات حساب مخصص محدد.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} input.id - معرف الحساب
   * 
   * @returns {Promise<CustomAccount|null>} بيانات الحساب
   */
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

  /**
   * إنشاء حساب مخصص جديد
   * 
   * @procedure create
   * @description ينشئ حساب مخصص جديد مع تحديد نوعه وعملته.
   * 
   * @param {object} input - بيانات الحساب
   * @param {number} input.businessId - معرف الشركة
   * @param {string} input.accountNumber - رقم الحساب
   * @param {string} input.accountName - اسم الحساب
   * @param {string} input.accountType - نوع الحساب (asset|liability|equity|revenue|expense)
   * @param {number} [input.parentId] - معرف الحساب الأب
   * @param {string} [input.currency] - العملة (افتراضي: SAR)
   * @param {string} [input.description] - وصف الحساب
   * 
   * @returns {Promise<{id: number, success: boolean}>} نتيجة العملية
   */
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

  /**
   * تحديث حساب مخصص
   * 
   * @procedure update
   * @description يحدث بيانات حساب مخصص موجود.
   * 
   * @param {object} input - بيانات التحديث
   * @param {number} input.id - معرف الحساب
   * @param {string} [input.accountNumber] - رقم الحساب الجديد
   * @param {string} [input.accountName] - اسم الحساب الجديد
   * @param {string} [input.accountType] - نوع الحساب الجديد
   * @param {string} [input.description] - الوصف الجديد
   * @param {boolean} [input.isActive] - حالة النشاط
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
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

  /**
   * حذف حساب مخصص
   * 
   * @procedure delete
   * @description يحذف حساب مخصص من النظام.
   * 
   * @param {object} input - معاملات الحذف
   * @param {number} input.id - معرف الحساب
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
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
/**
 * @namespace customTransactionsRouter
 * @description Router لإدارة الحركات المالية المخصصة - يتيح تسجيل
 * الحركات المدينة والدائنة وتحديث أرصدة الحسابات تلقائياً.
 */
// Custom Transactions Router
// ============================================
export const customTransactionsRouter = router({
  /**
   * استرجاع قائمة الحركات المالية
   * 
   * @procedure list
   * @description يسترجع قائمة الحركات المالية مع إمكانية الفلترة حسب الحساب.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} input.businessId - معرف الشركة
   * @param {number} [input.accountId] - معرف الحساب للفلترة
   * @param {number} [input.limit] - الحد الأقصى للنتائج (افتراضي: 50)
   * 
   * @returns {Promise<CustomTransaction[]>} قائمة الحركات
   */
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

  /**
   * تسجيل حركة مالية جديدة
   * 
   * @procedure create
   * @description يسجل حركة مالية جديدة ويحدث رصيد الحساب تلقائياً.
   * 
   * @param {object} input - بيانات الحركة
   * @param {number} input.businessId - معرف الشركة
   * @param {string} input.transactionNumber - رقم الحركة
   * @param {string} input.transactionDate - تاريخ الحركة
   * @param {number} input.accountId - معرف الحساب
   * @param {string} input.transactionType - نوع الحركة (debit|credit)
   * @param {string} input.amount - المبلغ
   * @param {string} [input.description] - وصف الحركة
   * 
   * @returns {Promise<{id: number, success: boolean}>} نتيجة العملية
   */
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
/**
 * @namespace customNotesRouter
 * @description Router لإدارة الملاحظات - يتيح إنشاء وتنظيم الملاحظات
 * مع دعم التصنيفات والأولويات والألوان والأرشفة.
 */
// Custom Notes Router
// ============================================
export const customNotesRouter = router({
  /**
   * استرجاع قائمة الملاحظات
   * 
   * @procedure list
   * @description يسترجع قائمة الملاحظات مع إمكانية الفلترة حسب الفئة والأرشفة.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} input.businessId - معرف الشركة
   * @param {string} [input.category] - فئة الملاحظة للفلترة
   * @param {boolean} [input.isArchived] - حالة الأرشفة (افتراضي: false)
   * 
   * @returns {Promise<CustomNote[]>} قائمة الملاحظات
   */
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
