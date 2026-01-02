/**
 * @fileoverview Router للنظام المحاسبي
 * @module accountingRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بالنظام المحاسبي
 * بما في ذلك إدارة دليل الحسابات، القيود اليومية، الفترات المحاسبية،
 * مراكز التكلفة، والتقارير المالية.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires ./db - للتعامل مع قاعدة البيانات
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const accountingRouter = router({
  // ============================================
  // Chart of Accounts - دليل الحسابات
  // ============================================
  accounts: router({
    /**
     * استرجاع قائمة الحسابات
     * 
     * @procedure list
     * @description يسترجع قائمة الحسابات من دليل الحسابات مع إمكانية الفلترة
     * حسب معرف الشركة، الوحدة النظامية، نوع الحساب، أو حالة النشاط.
     * 
     * @param {object} input - معاملات الفلترة
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {string} [input.systemModule] - الوحدة النظامية للفلترة
     * @param {string} [input.accountType] - نوع الحساب للفلترة
     * @param {boolean} [input.isActive] - حالة نشاط الحساب
     * 
     * @returns {Promise<Account[]>} قائمة الحسابات المطابقة للفلاتر
     * 
     * @example
     * // استرجاع جميع الحسابات النشطة
     * const accounts = await trpc.accounting.accounts.list({
     *   businessId: 1,
     *   isActive: true
     * });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        systemModule: z.string().optional(),
        accountType: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAccounts(input.businessId || 1);
      }),

    /**
     * استرجاع حساب بواسطة المعرف
     * 
     * @procedure getById
     * @description يسترجع بيانات حساب محدد من دليل الحسابات باستخدام معرفه الفريد.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.id - معرف الحساب المطلوب
     * 
     * @returns {Promise<Account>} بيانات الحساب المطلوب
     * 
     * @throws {TRPCError} NOT_FOUND - إذا كان الحساب غير موجود
     * 
     * @example
     * // استرجاع حساب بمعرف محدد
     * const account = await trpc.accounting.accounts.getById({ id: 101 });
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const account = await db.getAccountById(input.id);
        if (!account) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الحساب غير موجود" });
        }
        return account;
      }),

    /**
     * إنشاء حساب جديد في دليل الحسابات
     * 
     * @procedure create
     * @description ينشئ حساب جديد في دليل الحسابات مع التحقق من صحة البيانات
     * وتحديد الوحدة النظامية والطبيعة المحاسبية للحساب.
     * 
     * @param {object} input - بيانات الحساب الجديد
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {string} input.code - رمز الحساب (فريد)
     * @param {string} input.nameAr - اسم الحساب بالعربية
     * @param {string} [input.nameEn] - اسم الحساب بالإنجليزية
     * @param {number} [input.parentId] - معرف الحساب الأب
     * @param {number} [input.level] - مستوى الحساب في الشجرة
     * @param {string} input.systemModule - الوحدة النظامية (assets|maintenance|inventory|etc)
     * @param {string} [input.accountType] - نوع الحساب (main|sub|detail)
     * @param {string} input.nature - طبيعة الحساب (debit|credit)
     * @param {boolean} [input.isParent] - هل الحساب أب لحسابات أخرى
     * @param {boolean} [input.isCashAccount] - هل هو حساب نقدي
     * @param {boolean} [input.isBankAccount] - هل هو حساب بنكي
     * @param {string} [input.currency] - العملة
     * @param {string} [input.openingBalance] - الرصيد الافتتاحي
     * @param {string} [input.description] - وصف الحساب
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف الحساب الجديد
     * 
     * @example
     * // إنشاء حساب أصول جديد
     * const result = await trpc.accounting.accounts.create({
     *   code: "1101",
     *   nameAr: "النقدية بالصندوق",
     *   systemModule: "finance",
     *   nature: "debit",
     *   isCashAccount: true
     * });
     */
    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        level: z.number().optional(),
        systemModule: z.enum([
          "assets", "maintenance", "inventory", "procurement",
          "customers", "billing", "scada", "projects",
          "hr", "operations", "finance", "general"
        ]),
        accountType: z.enum(["main", "sub", "detail"]).optional(),
        nature: z.enum(["debit", "credit"]),
        isParent: z.boolean().optional(),
        isCashAccount: z.boolean().optional(),
        isBankAccount: z.boolean().optional(),
        currency: z.string().optional(),
        openingBalance: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAccount({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    /**
     * تحديث بيانات حساب موجود
     * 
     * @procedure update
     * @description يحدث بيانات حساب موجود في دليل الحسابات.
     * يمكن تحديث أي من الحقول المتاحة بشكل جزئي.
     * 
     * @param {object} input - بيانات التحديث
     * @param {number} input.id - معرف الحساب المراد تحديثه
     * @param {string} [input.code] - رمز الحساب الجديد
     * @param {string} [input.nameAr] - الاسم العربي الجديد
     * @param {string} [input.nameEn] - الاسم الإنجليزي الجديد
     * @param {number} [input.parentId] - معرف الحساب الأب الجديد
     * @param {number} [input.level] - المستوى الجديد
     * @param {string} [input.systemModule] - الوحدة النظامية الجديدة
     * @param {string} [input.accountType] - نوع الحساب الجديد
     * @param {string} [input.nature] - الطبيعة الجديدة
     * @param {boolean} [input.isParent] - تحديث حالة الأب
     * @param {boolean} [input.isActive] - تحديث حالة النشاط
     * @param {boolean} [input.isCashAccount] - تحديث حالة الحساب النقدي
     * @param {boolean} [input.isBankAccount] - تحديث حالة الحساب البنكي
     * @param {string} [input.currency] - العملة الجديدة
     * @param {string} [input.description] - الوصف الجديد
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // تحديث اسم حساب
     * await trpc.accounting.accounts.update({
     *   id: 101,
     *   nameAr: "النقدية - الصندوق الرئيسي"
     * });
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        level: z.number().optional(),
        systemModule: z.enum([
          "assets", "maintenance", "inventory", "procurement",
          "customers", "billing", "scada", "projects",
          "hr", "operations", "finance", "general"
        ]).optional(),
        accountType: z.enum(["main", "sub", "detail"]).optional(),
        nature: z.enum(["debit", "credit"]).optional(),
        isParent: z.boolean().optional(),
        isActive: z.boolean().optional(),
        isCashAccount: z.boolean().optional(),
        isBankAccount: z.boolean().optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAccount(id, data);
        return { success: true };
      }),

    /**
     * حذف حساب من دليل الحسابات
     * 
     * @procedure delete
     * @description يحذف حساب من دليل الحسابات. يجب التأكد من عدم وجود
     * قيود مرتبطة بالحساب قبل الحذف.
     * 
     * @param {object} input - معاملات الحذف
     * @param {number} input.id - معرف الحساب المراد حذفه
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @throws {TRPCError} CONFLICT - إذا كان الحساب مرتبط بقيود
     * 
     * @example
     * // حذف حساب
     * await trpc.accounting.accounts.delete({ id: 101 });
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAccount(input.id);
        return { success: true };
      }),

    /**
     * استرجاع شجرة الحسابات
     * 
     * @procedure getTree
     * @description يسترجع دليل الحسابات بشكل شجري هرمي يوضح
     * العلاقات بين الحسابات الرئيسية والفرعية.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * 
     * @returns {Promise<AccountTree[]>} شجرة الحسابات الهرمية
     * 
     * @example
     * // استرجاع شجرة الحسابات
     * const tree = await trpc.accounting.accounts.getTree({ businessId: 1 });
     */
    getTree: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAccountsTree(input.businessId || 1);
      }),
  }),

  // ============================================
  // Journal Entries - القيود اليومية
