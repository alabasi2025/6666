/**
 * @fileoverview Router لنظام إدارة الأصول الثابتة
 * @module assetsRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بإدارة الأصول الثابتة
 * بما في ذلك تسجيل الأصول، فئات الأصول، حركات الأصول، حساب الإهلاك،
 * وإدارة المحطات.
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

export const assetsRouter = router({
  // ============================================
  // Asset Categories - فئات الأصول
  // ============================================
  categories: router({
    /**
     * استرجاع قائمة فئات الأصول
     * 
     * @procedure list
     * @description يسترجع قائمة فئات الأصول المعرفة في النظام مع إعدادات
     * الإهلاك الخاصة بكل فئة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * 
     * @returns {Promise<AssetCategory[]>} قائمة فئات الأصول
     * 
     * @example
     * const categories = await trpc.assets.categories.list({ businessId: 1 });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAssetCategories(input.businessId || 1);
      }),

    /**
     * إنشاء فئة أصول جديدة
     * 
     * @procedure create
     * @description ينشئ فئة أصول جديدة مع تحديد طريقة الإهلاك والعمر الإنتاجي
     * ونسبة القيمة المتبقية.
     * 
     * @param {object} input - بيانات الفئة الجديدة
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {string} input.code - رمز الفئة (فريد)
     * @param {string} input.nameAr - اسم الفئة بالعربية
     * @param {string} [input.nameEn] - اسم الفئة بالإنجليزية
     * @param {number} [input.parentId] - معرف الفئة الأب
     * @param {string} [input.depreciationMethod] - طريقة الإهلاك (straight_line|declining_balance|units_of_production)
     * @param {number} [input.usefulLife] - العمر الإنتاجي بالسنوات
     * @param {string} [input.salvagePercentage] - نسبة القيمة المتبقية
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف الفئة
     * 
     * @example
     * const result = await trpc.assets.categories.create({
     *   code: "VEH",
     *   nameAr: "المركبات",
     *   depreciationMethod: "straight_line",
     *   usefulLife: 5,
     *   salvagePercentage: "10"
     * });
     */
    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
        usefulLife: z.number().optional(),
        salvagePercentage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAssetCategory({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    /**
     * تحديث فئة أصول
     * 
     * @procedure update
     * @description يحدث بيانات فئة أصول موجودة بما في ذلك إعدادات الإهلاك.
     * 
     * @param {object} input - بيانات التحديث
     * @param {number} input.id - معرف الفئة المراد تحديثها
     * @param {string} [input.code] - الرمز الجديد
     * @param {string} [input.nameAr] - الاسم العربي الجديد
     * @param {string} [input.nameEn] - الاسم الإنجليزي الجديد
     * @param {number} [input.parentId] - معرف الفئة الأب الجديد
     * @param {string} [input.depreciationMethod] - طريقة الإهلاك الجديدة
     * @param {number} [input.usefulLife] - العمر الإنتاجي الجديد
     * @param {string} [input.salvagePercentage] - نسبة القيمة المتبقية الجديدة
     * @param {boolean} [input.isActive] - حالة النشاط
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * await trpc.assets.categories.update({
     *   id: 1,
     *   usefulLife: 7
     * });
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
        usefulLife: z.number().optional(),
        salvagePercentage: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAssetCategory(id, data);
        return { success: true };
      }),

    /**
     * حذف فئة أصول
     * 
     * @procedure delete
     * @description يحذف فئة أصول. يجب التأكد من عدم وجود أصول مرتبطة بالفئة.
     * 
     * @param {object} input - معاملات الحذف
     * @param {number} input.id - معرف الفئة المراد حذفها
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @throws {TRPCError} CONFLICT - إذا كانت الفئة مرتبطة بأصول
     * 
     * @example
     * await trpc.assets.categories.delete({ id: 1 });
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAssetCategory(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Assets - الأصول الثابتة
  // ============================================
  /**
   * استرجاع قائمة الأصول الثابتة
   * 
   * @procedure list
   * @description يسترجع قائمة الأصول الثابتة مع إمكانية الفلترة حسب المحطة،
   * الفئة، الحالة، أو البحث النصي.
   * 
   * @param {object} input - معاملات الفلترة
   * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
   * @param {number} [input.stationId] - معرف المحطة للفلترة
   * @param {number} [input.categoryId] - معرف الفئة للفلترة
   * @param {string} [input.status] - حالة الأصل للفلترة
   * @param {string} [input.search] - نص البحث
   * 
   * @returns {Promise<Asset[]>} قائمة الأصول المطابقة
   * 
   * @example
   * const assets = await trpc.assets.list({
   *   businessId: 1,
   *   status: "active"
   * });
   */
  list: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
      stationId: z.number().optional(),
      categoryId: z.number().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAssets(input.businessId || 1, input);
    }),

  /**
   * استرجاع أصل بواسطة المعرف
   * 
   * @procedure getById
   * @description يسترجع بيانات أصل محدد مع تفاصيله الكاملة.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} input.id - معرف الأصل المطلوب
   * 
   * @returns {Promise<Asset>} بيانات الأصل
   * 
   * @throws {TRPCError} NOT_FOUND - إذا كان الأصل غير موجود
   * 
   * @example
   * const asset = await trpc.assets.getById({ id: 101 });
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const asset = await db.getAssetById(input.id);
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الأصل غير موجود" });
      }
      return asset;
    }),

  /**
   * إنشاء أصل ثابت جديد
   * 
   * @procedure create
   * @description يسجل أصل ثابت جديد في النظام مع كافة بياناته التفصيلية
   * بما في ذلك معلومات الشراء والإهلاك والموقع.
   * 
   * @param {object} input - بيانات الأصل الجديد
   * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
   * @param {number} [input.branchId] - معرف الفرع
   * @param {number} [input.stationId] - معرف المحطة
   * @param {number} input.categoryId - معرف فئة الأصل
   * @param {string} input.code - رمز الأصل (فريد)
   * @param {string} input.nameAr - اسم الأصل بالعربية
   * @param {string} [input.nameEn] - اسم الأصل بالإنجليزية
   * @param {string} [input.description] - وصف الأصل
   * @param {string} [input.serialNumber] - الرقم التسلسلي
   * @param {string} [input.model] - الموديل
   * @param {string} [input.manufacturer] - الشركة المصنعة
   * @param {string} [input.purchaseDate] - تاريخ الشراء
   * @param {string} [input.commissionDate] - تاريخ التشغيل
   * @param {string} [input.purchaseCost] - تكلفة الشراء
   * @param {string} [input.currentValue] - القيمة الحالية
   * @param {string} [input.salvageValue] - القيمة المتبقية
   * @param {number} [input.usefulLife] - العمر الإنتاجي
   * @param {string} [input.depreciationMethod] - طريقة الإهلاك
   * @param {string} [input.status] - حالة الأصل (active|maintenance|disposed|transferred|idle)
   * @param {string} [input.location] - الموقع
   * @param {string} [input.warrantyExpiry] - تاريخ انتهاء الضمان
   * @param {number} [input.supplierId] - معرف المورد
   * @param {string} [input.image] - صورة الأصل
   * @param {object} [input.specifications] - المواصفات الفنية
   * 
   * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف الأصل
   * 
   * @example
   * const result = await trpc.assets.create({
   *   categoryId: 1,
   *   code: "VEH-001",
   *   nameAr: "سيارة تويوتا كامري",
   *   purchaseDate: "2024-01-15",
   *   purchaseCost: "85000",
   *   status: "active"
   * });
   */
  create: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
      branchId: z.number().optional(),
      stationId: z.number().optional(),
      categoryId: z.number(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      serialNumber: z.string().optional(),
      model: z.string().optional(),
      manufacturer: z.string().optional(),
      purchaseDate: z.string().optional(),
      commissionDate: z.string().optional(),
      purchaseCost: z.string().optional(),
      currentValue: z.string().optional(),
      salvageValue: z.string().optional(),
      usefulLife: z.number().optional(),
      depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
      status: z.enum(["active", "maintenance", "disposed", "transferred", "idle"]).optional(),
      location: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      supplierId: z.number().optional(),
      image: z.string().optional(),
      specifications: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createAsset({
        ...input,
        businessId: input.businessId || 1,
        createdBy: ctx.user?.id || 1,
      });
      return { success: true, id };
    }),

  /**
   * تحديث بيانات أصل ثابت
   * 
   * @procedure update
   * @description يحدث بيانات أصل ثابت موجود. يمكن تحديث أي من الحقول المتاحة.
   * 
   * @param {object} input - بيانات التحديث
   * @param {number} input.id - معرف الأصل المراد تحديثه
   * @param {number} [input.branchId] - معرف الفرع الجديد
   * @param {number} [input.stationId] - معرف المحطة الجديد
   * @param {number} [input.categoryId] - معرف الفئة الجديد
   * @param {string} [input.code] - الرمز الجديد
   * @param {string} [input.nameAr] - الاسم العربي الجديد
   * @param {string} [input.nameEn] - الاسم الإنجليزي الجديد
   * @param {string} [input.description] - الوصف الجديد
   * @param {string} [input.serialNumber] - الرقم التسلسلي الجديد
   * @param {string} [input.model] - الموديل الجديد
   * @param {string} [input.manufacturer] - الشركة المصنعة الجديدة
   * @param {string} [input.purchaseDate] - تاريخ الشراء الجديد
   * @param {string} [input.commissionDate] - تاريخ التشغيل الجديد
   * @param {string} [input.purchaseCost] - تكلفة الشراء الجديدة
   * @param {string} [input.currentValue] - القيمة الحالية الجديدة
   * @param {string} [input.salvageValue] - القيمة المتبقية الجديدة
   * @param {number} [input.usefulLife] - العمر الإنتاجي الجديد
   * @param {string} [input.depreciationMethod] - طريقة الإهلاك الجديدة
   * @param {string} [input.status] - الحالة الجديدة
   * @param {string} [input.location] - الموقع الجديد
   * @param {string} [input.warrantyExpiry] - تاريخ انتهاء الضمان الجديد
   * @param {number} [input.supplierId] - معرف المورد الجديد
   * @param {string} [input.image] - الصورة الجديدة
   * @param {object} [input.specifications] - المواصفات الفنية الجديدة
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   * 
   * @example
   * await trpc.assets.update({
   *   id: 101,
   *   status: "maintenance"
   * });
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      branchId: z.number().optional(),
      stationId: z.number().optional(),
      categoryId: z.number().optional(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      serialNumber: z.string().optional(),
      model: z.string().optional(),
      manufacturer: z.string().optional(),
      purchaseDate: z.string().optional(),
      commissionDate: z.string().optional(),
      purchaseCost: z.string().optional(),
      currentValue: z.string().optional(),
      salvageValue: z.string().optional(),
      usefulLife: z.number().optional(),
      depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
      status: z.enum(["active", "maintenance", "disposed", "transferred", "idle"]).optional(),
      location: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      supplierId: z.number().optional(),
      image: z.string().optional(),
      specifications: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAsset(id, data);
      return { success: true };
    }),

  /**
   * حذف أصل ثابت
   * 
   * @procedure delete
   * @description يحذف أصل ثابت من النظام. يفضل استخدام التصرف (disposal)
   * بدلاً من الحذف للحفاظ على السجلات التاريخية.
   * 
   * @param {object} input - معاملات الحذف
   * @param {number} input.id - معرف الأصل المراد حذفه
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   * 
   * @example
   * await trpc.assets.delete({ id: 101 });
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteAsset(input.id);
      return { success: true };
    }),

  // ============================================
  // Asset Movements - حركات الأصول
  // ============================================
  movements: router({
    /**
     * استرجاع قائمة حركات الأصول
     * 
     * @procedure list
     * @description يسترجع سجل حركات الأصول مع إمكانية الفلترة حسب الأصل
     * أو نوع الحركة.
     * 
     * @param {object} input - معاملات الفلترة
     * @param {number} [input.assetId] - معرف الأصل للفلترة
     * @param {number} [input.businessId] - معرف الشركة
     * @param {string} [input.movementType] - نوع الحركة للفلترة
     * 
     * @returns {Promise<AssetMovement[]>} قائمة حركات الأصول
     * 
     * @example
     * const movements = await trpc.assets.movements.list({
     *   assetId: 101
     * });
     */
    list: protectedProcedure
      .input(z.object({
        assetId: z.number().optional(),
        businessId: z.number().optional(),
        movementType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAssetMovements(input);
      }),

    /**
     * تسجيل حركة أصل جديدة
     * 
     * @procedure create
     * @description يسجل حركة جديدة على أصل مثل النقل، الصيانة، إعادة التقييم،
     * أو التصرف.
     * 
     * @param {object} input - بيانات الحركة
     * @param {number} input.assetId - معرف الأصل
     * @param {string} input.movementType - نوع الحركة (purchase|transfer|maintenance|upgrade|revaluation|impairment|disposal|depreciation)
     * @param {string} input.movementDate - تاريخ الحركة
     * @param {number} [input.fromBranchId] - معرف الفرع المصدر
     * @param {number} [input.toBranchId] - معرف الفرع الهدف
     * @param {number} [input.fromStationId] - معرف المحطة المصدر
     * @param {number} [input.toStationId] - معرف المحطة الهدف
     * @param {string} [input.amount] - قيمة الحركة
     * @param {string} [input.description] - وصف الحركة
     * @param {string} [input.referenceType] - نوع المرجع
     * @param {number} [input.referenceId] - معرف المرجع
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف الحركة
     * 
     * @example
     * const result = await trpc.assets.movements.create({
     *   assetId: 101,
     *   movementType: "transfer",
     *   movementDate: "2024-06-01",
     *   fromStationId: 1,
     *   toStationId: 2,
     *   description: "نقل السيارة للمحطة الجديدة"
     * });
     */
    create: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        movementType: z.enum([
          "purchase", "transfer", "maintenance", "upgrade",
          "revaluation", "impairment", "disposal", "depreciation"
        ]),
        movementDate: z.string(),
        fromBranchId: z.number().optional(),
        toBranchId: z.number().optional(),
        fromStationId: z.number().optional(),
        toStationId: z.number().optional(),
        amount: z.string().optional(),
        description: z.string().optional(),
        referenceType: z.string().optional(),
        referenceId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createAssetMovement({
          ...input,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),
  }),

  // ============================================
  // Depreciation - الإهلاك
  // ============================================
  depreciation: router({
    /**
     * حساب الإهلاك للأصول
     * 
     * @procedure calculate
     * @description يحسب الإهلاك الدوري للأصول المحددة أو جميع الأصول
     * وينشئ قيود الإهلاك المحاسبية.
     * 
     * @param {object} input - معاملات الحساب
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.periodId] - معرف الفترة المحاسبية
     * @param {number[]} [input.assetIds] - قائمة معرفات الأصول المحددة
     * 
     * @returns {Promise<DepreciationResult>} نتيجة حساب الإهلاك
     * 
     * @example
     * const result = await trpc.assets.depreciation.calculate({
     *   businessId: 1,
     *   periodId: 12
     * });
     */
    calculate: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        assetIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.calculateDepreciation({
          businessId: input.businessId || 1,
          periodId: input.periodId,
          assetIds: input.assetIds,
          userId: ctx.user?.id || 1,
        });
        return result;
      }),

    /**
     * استرجاع سجل الإهلاك
     * 
     * @procedure getHistory
     * @description يسترجع سجل الإهلاك التاريخي لأصل محدد أو جميع الأصول.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} [input.assetId] - معرف الأصل
     * @param {number} [input.businessId] - معرف الشركة
     * @param {number} [input.year] - السنة المالية
     * 
     * @returns {Promise<DepreciationHistory[]>} سجل الإهلاك
     * 
     * @example
     * const history = await trpc.assets.depreciation.getHistory({
     *   assetId: 101,
     *   year: 2024
     * });
     */
    getHistory: protectedProcedure
      .input(z.object({
        assetId: z.number().optional(),
        businessId: z.number().optional(),
        year: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getDepreciationHistory(input);
      }),
  }),

  // ============================================
  // Dashboard Stats - إحصائيات لوحة التحكم
  // ============================================
  /**
   * إحصائيات لوحة تحكم الأصول
   * 
   * @procedure dashboardStats
   * @description يسترجع إحصائيات ملخصة لنظام الأصول تشمل إجمالي الأصول،
   * القيمة الدفترية، الإهلاك المتراكم، وتوزيع الأصول حسب الحالة.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
   * 
   * @returns {Promise<AssetDashboardStats>} إحصائيات لوحة التحكم
   * 
   * @example
   * const stats = await trpc.assets.dashboardStats({ businessId: 1 });
   */
  dashboardStats: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAssetDashboardStats(input.businessId || 1);
    }),

  // ============================================
  // Stations - المحطات (للقوائم المنسدلة)
  // ============================================
  stations: router({
    /**
     * استرجاع قائمة المحطات
     * 
     * @procedure list
     * @description يسترجع قائمة المحطات المتاحة لاستخدامها في القوائم المنسدلة
     * عند تسجيل أو نقل الأصول.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * 
     * @returns {Promise<Station[]>} قائمة المحطات
     * 
     * @example
     * const stations = await trpc.assets.stations.list({ businessId: 1 });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getStations(input.businessId || 1);
      }),
  }),
});
