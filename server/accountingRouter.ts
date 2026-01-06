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
        return await db.getAccounts(input.businessId || 1, {
          systemModule: input.systemModule,
          accountType: input.accountType,
          isActive: input.isActive,
        });
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
        linkedEntityType: z.string().nullable().optional(),
        linkedEntityId: z.number().nullable().optional(),
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
  // ============================================
  journalEntries: router({
    /**
     * استرجاع قائمة القيود اليومية
     * 
     * @procedure list
     * @description يسترجع قائمة القيود اليومية مع إمكانية الفلترة
     * حسب الفترة المحاسبية، النوع، الحالة، أو نطاق التاريخ.
     * 
     * @param {object} input - معاملات الفلترة
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.periodId] - معرف الفترة المحاسبية
     * @param {string} [input.type] - نوع القيد
     * @param {string} [input.status] - حالة القيد
     * @param {string} [input.startDate] - تاريخ البداية للفلترة
     * @param {string} [input.endDate] - تاريخ النهاية للفلترة
     * @param {number} [input.limit=100] - الحد الأقصى للنتائج
     * 
     * @returns {Promise<JournalEntry[]>} قائمة القيود اليومية
     * 
     * @example
     * // استرجاع القيود لفترة محددة
     * const entries = await trpc.accounting.journalEntries.list({
     *   businessId: 1,
     *   periodId: 12,
     *   limit: 50
     * });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return await db.getJournalEntries(input.businessId || 1, input);
      }),

    /**
     * استرجاع قيد يومي بواسطة المعرف
     * 
     * @procedure getById
     * @description يسترجع بيانات قيد يومي محدد مع تفاصيل البنود.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.id - معرف القيد المطلوب
     * 
     * @returns {Promise<JournalEntry>} بيانات القيد مع البنود
     * 
     * @throws {TRPCError} NOT_FOUND - إذا كان القيد غير موجود
     * 
     * @example
     * // استرجاع قيد بمعرف محدد
     * const entry = await trpc.accounting.journalEntries.getById({ id: 1001 });
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const entry = await db.getJournalEntryById(input.id);
        if (!entry) {
          throw new TRPCError({ code: "NOT_FOUND", message: "القيد غير موجود" });
        }
        return entry;
      }),

    /**
     * إنشاء قيد يومي جديد
     * 
     * @procedure create
     * @description ينشئ قيد يومي جديد مع بنوده. يجب أن يكون القيد متوازن
     * (مجموع المدين = مجموع الدائن).
     * 
     * @param {object} input - بيانات القيد الجديد
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.branchId] - معرف الفرع
     * @param {string} input.entryDate - تاريخ القيد
     * @param {number} input.periodId - معرف الفترة المحاسبية
     * @param {string} [input.type] - نوع القيد (manual|auto|opening|closing|etc)
     * @param {string} [input.sourceModule] - الوحدة المصدر
     * @param {number} [input.sourceId] - معرف المستند المصدر
     * @param {string} [input.description] - وصف القيد
     * @param {Array} input.lines - بنود القيد
     * @param {number} input.lines[].accountId - معرف الحساب
     * @param {string} [input.lines[].debit] - المبلغ المدين
     * @param {string} [input.lines[].credit] - المبلغ الدائن
     * @param {string} [input.lines[].description] - وصف البند
     * @param {number} [input.lines[].costCenterId] - معرف مركز التكلفة
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف القيد
     * 
     * @throws {TRPCError} BAD_REQUEST - إذا كان القيد غير متوازن
     * 
     * @example
     * // إنشاء قيد يومي
     * const result = await trpc.accounting.journalEntries.create({
     *   entryDate: "2024-01-15",
     *   periodId: 1,
     *   description: "قيد مبيعات نقدية",
     *   lines: [
     *     { accountId: 1101, debit: "1000" },
     *     { accountId: 4101, credit: "1000" }
     *   ]
     * });
     */
    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        branchId: z.number().optional(),
        entryDate: z.string(),
        periodId: z.number(),
        type: z.enum([
          "manual", "auto", "opening", "closing", "adjustment",
          "invoice", "payment", "receipt", "transfer", "depreciation"
        ]).optional(),
        sourceModule: z.string().optional(),
        sourceId: z.number().optional(),
        description: z.string().optional(),
        lines: z.array(z.object({
          accountId: z.number(),
          debit: z.string().optional(),
          credit: z.string().optional(),
          description: z.string().optional(),
          costCenterId: z.number().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createJournalEntry({
          ...input,
          businessId: input.businessId || 1,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),

    /**
     * تحديث قيد يومي موجود
     * 
     * @procedure update
     * @description يحدث بيانات قيد يومي موجود. لا يمكن تحديث القيود المرحلة.
     * 
     * @param {object} input - بيانات التحديث
     * @param {number} input.id - معرف القيد المراد تحديثه
     * @param {string} [input.entryDate] - تاريخ القيد الجديد
     * @param {string} [input.description] - الوصف الجديد
     * @param {Array} [input.lines] - بنود القيد المحدثة
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @throws {TRPCError} FORBIDDEN - إذا كان القيد مرحل
     * 
     * @example
     * // تحديث وصف قيد
     * await trpc.accounting.journalEntries.update({
     *   id: 1001,
     *   description: "قيد مبيعات نقدية - معدل"
     * });
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        entryDate: z.string().optional(),
        description: z.string().optional(),
        lines: z.array(z.object({
          id: z.number().optional(),
          accountId: z.number(),
          debit: z.string().optional(),
          credit: z.string().optional(),
          description: z.string().optional(),
          costCenterId: z.number().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateJournalEntry(id, data);
        return { success: true };
      }),

    /**
     * حذف قيد يومي
     * 
     * @procedure delete
     * @description يحذف قيد يومي. لا يمكن حذف القيود المرحلة.
     * 
     * @param {object} input - معاملات الحذف
     * @param {number} input.id - معرف القيد المراد حذفه
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @throws {TRPCError} FORBIDDEN - إذا كان القيد مرحل
     * 
     * @example
     * // حذف قيد
     * await trpc.accounting.journalEntries.delete({ id: 1001 });
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteJournalEntry(input.id);
        return { success: true };
      }),

    /**
     * ترحيل قيد يومي
     * 
     * @procedure post
     * @description يرحل قيد يومي إلى دفتر الأستاذ. بعد الترحيل لا يمكن
     * تعديل أو حذف القيد.
     * 
     * @param {object} input - معاملات الترحيل
     * @param {number} input.id - معرف القيد المراد ترحيله
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @throws {TRPCError} BAD_REQUEST - إذا كان القيد مرحل مسبقاً
     * 
     * @example
     * // ترحيل قيد
     * await trpc.accounting.journalEntries.post({ id: 1001 });
     */
    post: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.postJournalEntry(input.id, ctx.user?.id || 1);
        return { success: true };
      }),

    /**
     * عكس قيد يومي
     * 
     * @procedure reverse
     * @description ينشئ قيد عكسي لقيد موجود. يستخدم لإلغاء أثر قيد مرحل.
     * 
     * @param {object} input - معاملات العكس
     * @param {number} input.id - معرف القيد المراد عكسه
     * @param {string} [input.reason] - سبب العكس
     * 
     * @returns {Promise<{success: boolean, newId: number}>} نتيجة العملية مع معرف القيد العكسي
     * 
     * @example
     * // عكس قيد
     * const result = await trpc.accounting.journalEntries.reverse({
     *   id: 1001,
     *   reason: "خطأ في تسجيل المبلغ"
     * });
     */
    reverse: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const newId = await db.reverseJournalEntry(input.id, ctx.user?.id || 1, input.reason);
        return { success: true, newId };
      }),
  }),

  // ============================================
  // Fiscal Periods - الفترات المحاسبية
  // ============================================
  fiscalPeriods: router({
    /**
     * استرجاع قائمة الفترات المحاسبية
     * 
     * @procedure list
     * @description يسترجع قائمة الفترات المحاسبية مع إمكانية الفلترة
     * حسب السنة أو الحالة.
     * 
     * @param {object} input - معاملات الفلترة
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.year] - السنة المالية
     * @param {string} [input.status] - حالة الفترة
     * 
     * @returns {Promise<FiscalPeriod[]>} قائمة الفترات المحاسبية
     * 
     * @example
     * // استرجاع فترات سنة 2024
     * const periods = await trpc.accounting.fiscalPeriods.list({
     *   businessId: 1,
     *   year: 2024
     * });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        year: z.number().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFiscalPeriods(input.businessId || 1, input);
      }),

    /**
     * إنشاء فترة محاسبية جديدة
     * 
     * @procedure create
     * @description ينشئ فترة محاسبية جديدة مع تحديد تواريخ البداية والنهاية.
     * 
     * @param {object} input - بيانات الفترة الجديدة
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} input.year - السنة المالية
     * @param {number} input.period - رقم الفترة
     * @param {string} input.nameAr - اسم الفترة بالعربية
     * @param {string} [input.nameEn] - اسم الفترة بالإنجليزية
     * @param {string} input.startDate - تاريخ بداية الفترة
     * @param {string} input.endDate - تاريخ نهاية الفترة
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف الفترة
     * 
     * @example
     * // إنشاء فترة شهرية
     * const result = await trpc.accounting.fiscalPeriods.create({
     *   year: 2024,
     *   period: 1,
     *   nameAr: "يناير 2024",
     *   startDate: "2024-01-01",
     *   endDate: "2024-01-31"
     * });
     */
    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        year: z.number(),
        period: z.number(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createFiscalPeriod({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    /**
     * إغلاق فترة محاسبية
     * 
     * @procedure close
     * @description يغلق فترة محاسبية. بعد الإغلاق لا يمكن إضافة قيود جديدة للفترة.
     * 
     * @param {object} input - معاملات الإغلاق
     * @param {number} input.id - معرف الفترة المراد إغلاقها
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // إغلاق فترة
     * await trpc.accounting.fiscalPeriods.close({ id: 12 });
     */
    close: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.closeFiscalPeriod(input.id, ctx.user?.id || 1);
        return { success: true };
      }),

    /**
     * إعادة فتح فترة محاسبية
     * 
     * @procedure reopen
     * @description يعيد فتح فترة محاسبية مغلقة للسماح بإضافة قيود.
     * 
     * @param {object} input - معاملات إعادة الفتح
     * @param {number} input.id - معرف الفترة المراد إعادة فتحها
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // إعادة فتح فترة
     * await trpc.accounting.fiscalPeriods.reopen({ id: 12 });
     */
    reopen: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.reopenFiscalPeriod(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Cost Centers - مراكز التكلفة
  // ============================================
  costCenters: router({
    /**
     * استرجاع قائمة مراكز التكلفة
     * 
     * @procedure list
     * @description يسترجع قائمة مراكز التكلفة للشركة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * 
     * @returns {Promise<CostCenter[]>} قائمة مراكز التكلفة
     * 
     * @example
     * // استرجاع مراكز التكلفة
     * const centers = await trpc.accounting.costCenters.list({ businessId: 1 });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCostCenters(input.businessId || 1);
      }),

    /**
     * إنشاء مركز تكلفة جديد
     * 
     * @procedure create
     * @description ينشئ مركز تكلفة جديد مع إمكانية ربطه بمركز أب.
     * 
     * @param {object} input - بيانات مركز التكلفة الجديد
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {string} input.code - رمز مركز التكلفة
     * @param {string} input.nameAr - الاسم بالعربية
     * @param {string} [input.nameEn] - الاسم بالإنجليزية
     * @param {number} [input.parentId] - معرف المركز الأب
     * @param {string} [input.type] - نوع المركز
     * @param {number} [input.managerId] - معرف المدير المسؤول
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف المركز
     * 
     * @example
     * // إنشاء مركز تكلفة
     * const result = await trpc.accounting.costCenters.create({
     *   code: "CC001",
     *   nameAr: "قسم المبيعات",
     *   type: "department"
     * });
     */
    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        type: z.string().optional(),
        managerId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCostCenter({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    /**
     * تحديث مركز تكلفة
     * 
     * @procedure update
     * @description يحدث بيانات مركز تكلفة موجود.
     * 
     * @param {object} input - بيانات التحديث
     * @param {number} input.id - معرف المركز المراد تحديثه
     * @param {string} [input.code] - الرمز الجديد
     * @param {string} [input.nameAr] - الاسم العربي الجديد
     * @param {string} [input.nameEn] - الاسم الإنجليزي الجديد
     * @param {number} [input.parentId] - معرف المركز الأب الجديد
     * @param {string} [input.type] - النوع الجديد
     * @param {number} [input.managerId] - معرف المدير الجديد
     * @param {boolean} [input.isActive] - حالة النشاط
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // تحديث مركز تكلفة
     * await trpc.accounting.costCenters.update({
     *   id: 1,
     *   nameAr: "قسم المبيعات والتسويق"
     * });
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        type: z.string().optional(),
        managerId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCostCenter(id, data);
        return { success: true };
      }),

    /**
     * حذف مركز تكلفة
     * 
     * @procedure delete
     * @description يحذف مركز تكلفة. يجب التأكد من عدم وجود قيود مرتبطة.
     * 
     * @param {object} input - معاملات الحذف
     * @param {number} input.id - معرف المركز المراد حذفه
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // حذف مركز تكلفة
     * await trpc.accounting.costCenters.delete({ id: 1 });
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCostCenter(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Reports - التقارير
  // ============================================
  reports: router({
    /**
     * تقرير ميزان المراجعة
     * 
     * @procedure trialBalance
     * @description يولد تقرير ميزان المراجعة الذي يعرض أرصدة جميع الحسابات
     * في تاريخ محدد أو لفترة محاسبية معينة.
     * 
     * @param {object} input - معاملات التقرير
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.periodId] - معرف الفترة المحاسبية
     * @param {string} [input.asOfDate] - التاريخ المطلوب
     * 
     * @returns {Promise<TrialBalanceReport>} تقرير ميزان المراجعة
     * 
     * @example
     * // استخراج ميزان المراجعة
     * const report = await trpc.accounting.reports.trialBalance({
     *   businessId: 1,
     *   asOfDate: "2024-12-31"
     * });
     */
    trialBalance: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        asOfDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTrialBalance(input.businessId || 1, input);
      }),

    /**
     * تقرير دفتر الأستاذ العام
     * 
     * @procedure generalLedger
     * @description يولد تقرير دفتر الأستاذ العام الذي يعرض جميع الحركات
     * على حساب معين أو جميع الحسابات في فترة زمنية محددة.
     * 
     * @param {object} input - معاملات التقرير
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.accountId] - معرف الحساب (اختياري لجميع الحسابات)
     * @param {string} [input.startDate] - تاريخ البداية
     * @param {string} [input.endDate] - تاريخ النهاية
     * 
     * @returns {Promise<GeneralLedgerReport>} تقرير دفتر الأستاذ
     * 
     * @example
     * // استخراج دفتر الأستاذ لحساب معين
     * const report = await trpc.accounting.reports.generalLedger({
     *   businessId: 1,
     *   accountId: 1101,
     *   startDate: "2024-01-01",
     *   endDate: "2024-12-31"
     * });
     */
    generalLedger: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        accountId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getGeneralLedger(input.businessId || 1, input);
      }),

    /**
     * تقرير قائمة الدخل
     * 
     * @procedure incomeStatement
     * @description يولد تقرير قائمة الدخل (الأرباح والخسائر) الذي يعرض
     * الإيرادات والمصروفات وصافي الربح لفترة محددة.
     * 
     * @param {object} input - معاملات التقرير
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.periodId] - معرف الفترة المحاسبية
     * @param {string} [input.startDate] - تاريخ البداية
     * @param {string} [input.endDate] - تاريخ النهاية
     * 
     * @returns {Promise<IncomeStatementReport>} تقرير قائمة الدخل
     * 
     * @example
     * // استخراج قائمة الدخل
     * const report = await trpc.accounting.reports.incomeStatement({
     *   businessId: 1,
     *   startDate: "2024-01-01",
     *   endDate: "2024-12-31"
     * });
     */
    incomeStatement: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getIncomeStatement(input.businessId || 1, input);
      }),

    /**
     * تقرير الميزانية العمومية
     * 
     * @procedure balanceSheet
     * @description يولد تقرير الميزانية العمومية (قائمة المركز المالي)
     * الذي يعرض الأصول والخصوم وحقوق الملكية في تاريخ محدد.
     * 
     * @param {object} input - معاملات التقرير
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {string} [input.asOfDate] - التاريخ المطلوب
     * 
     * @returns {Promise<BalanceSheetReport>} تقرير الميزانية العمومية
     * 
     * @example
     * // استخراج الميزانية العمومية
     * const report = await trpc.accounting.reports.balanceSheet({
     *   businessId: 1,
     *   asOfDate: "2024-12-31"
     * });
     */
    balanceSheet: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        asOfDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getBalanceSheet(input.businessId || 1, input);
      }),
  }),

  // ============================================
  // Dashboard Stats - إحصائيات لوحة التحكم
  // ============================================
  /**
   * إحصائيات لوحة التحكم المحاسبية
   * 
   * @procedure dashboardStats
   * @description يسترجع إحصائيات ملخصة للنظام المحاسبي تشمل
   * إجمالي الأصول، الخصوم، الإيرادات، المصروفات، وصافي الربح.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
   * 
   * @returns {Promise<AccountingDashboardStats>} إحصائيات لوحة التحكم
   * 
   * @example
   * // استرجاع إحصائيات لوحة التحكم
   * const stats = await trpc.accounting.dashboardStats({ businessId: 1 });
   */
  dashboardStats: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAccountingDashboardStats(input.businessId || 1);
    }),
});
