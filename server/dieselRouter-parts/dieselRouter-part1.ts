import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";

/**
 * @fileoverview Router لنظام إدارة استهلاك الديزل
 * @module dieselRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بنظام استهلاك الديزل
 * بما في ذلك إدارة الموردين، الوايتات (الصهاريج)، خزانات المحطات،
 * طرمبات العدادات، مهام الاستلام، حركات التحويل، والتقارير.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires ./db - للتعامل مع قاعدة البيانات
 * @requires ./storage - لتخزين الملفات والصور
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================
// نظام استهلاك الديزل - Diesel Consumption System
// ============================================

export const dieselRouter = router({
  // ============================================
  /**
   * @namespace suppliers
   * @description إدارة موردي الديزل - يتيح تسجيل وتعديل وحذف الموردين
   * مع تتبع بيانات الاتصال والموقع الجغرافي.
   */
  // موردي الديزل - Diesel Suppliers
  // ============================================
  
  suppliers: router({
    /**
     * استرجاع قائمة موردي الديزل
     * 
     * @procedure list
     * @description يسترجع قائمة موردي الديزل مع إمكانية الفلترة حسب حالة النشاط.
     * 
     * @param {object} [input] - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة
     * @param {boolean} [input.isActive] - حالة النشاط للفلترة
     * 
     * @returns {Promise<DieselSupplier[]>} قائمة الموردين
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselSuppliers(input?.businessId, input?.isActive);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const supplier = await db.getDieselSupplierById(input.id);
        if (!supplier) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المورد غير موجود" });
        }
        return supplier;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        contactPerson: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          latitude: input.latitude?.toString() ?? null,
          longitude: input.longitude?.toString() ?? null,
        };
        return db.createDieselSupplier(data as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        contactPerson: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, latitude, longitude, ...rest } = input;
        const data: any = { ...rest };
        if (latitude !== undefined) data.latitude = latitude.toString();
        if (longitude !== undefined) data.longitude = longitude.toString();
        return db.updateDieselSupplier(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselSupplier(input.id);
      }),
  }),

  // ============================================
  /**
   * @namespace tankers
   * @description إدارة الوايتات (صهاريج الديزل) - يتيح تسجيل الصهاريج
   * مع تحديد السعة والمقصورات وبيانات السائق.
   */
  // الوايتات (صهاريج الديزل) - Diesel Tankers
  // ============================================
  
  tankers: router({
    /**
     * استرجاع قائمة الوايتات (الصهاريج)
     * 
     * @procedure list
     * @description يسترجع قائمة صهاريج الديزل مع بيانات السعة والسائقين.
     * 
     * @param {object} [input] - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة
     * @param {boolean} [input.isActive] - حالة النشاط للفلترة
     * 
     * @returns {Promise<DieselTanker[]>} قائمة الصهاريج
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselTankers(input?.businessId, input?.isActive);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const tanker = await db.getDieselTankerById(input.id);
        if (!tanker) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الوايت غير موجود" });
        }
        return tanker;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string().min(1),
        plateNumber: z.string().min(1),
        capacity: z.number(),
        compartment1Capacity: z.number().optional(),
        compartment2Capacity: z.number().optional(),
        driverName: z.string().optional(),
        driverPhone: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          capacity: input.capacity.toString(),
          compartment1Capacity: input.compartment1Capacity?.toString() ?? null,
          compartment2Capacity: input.compartment2Capacity?.toString() ?? null,
        };
        return db.createDieselTanker(data as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        plateNumber: z.string().optional(),
        capacity: z.number().optional(),
        compartment1Capacity: z.number().optional(),
        compartment2Capacity: z.number().optional(),
        driverName: z.string().optional(),
        driverPhone: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, capacity, compartment1Capacity, compartment2Capacity, ...rest } = input;
        const data: any = { ...rest };
        if (capacity !== undefined) data.capacity = capacity.toString();
        if (compartment1Capacity !== undefined) data.compartment1Capacity = compartment1Capacity.toString();
        if (compartment2Capacity !== undefined) data.compartment2Capacity = compartment2Capacity.toString();
        return db.updateDieselTanker(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselTanker(input.id);
      }),
  }),

  // ============================================
  /**
   * @namespace tanks
   * @description إدارة خزانات المحطة - يتيح تسجيل خزانات الاستقبال والرئيسية
   * والروكت والمولدات مع تتبع المستويات والسعات.
   */
  // خزانات المحطة - Station Tanks
  // ============================================
  
  tanks: router({
    /**
     * استرجاع قائمة خزانات المحطة
     * 
     * @procedure list
     * @description يسترجع قائمة خزانات الديزل في المحطات مع مستوياتها الحالية.
     * 
     * @param {object} [input] - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة
     * @param {number} [input.stationId] - معرف المحطة للفلترة
     * @param {string} [input.type] - نوع الخزان (receiving|main|rocket|generator)
     * @param {boolean} [input.isActive] - حالة النشاط للفلترة
     * 
     * @returns {Promise<DieselTank[]>} قائمة الخزانات
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        type: z.enum(["receiving", "main", "rocket", "generator"]).optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselTanks(input?.businessId, input?.stationId, input?.type, input?.isActive);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const tank = await db.getDieselTankById(input.id);
        if (!tank) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الخزان غير موجود" });
        }
        return tank;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["receiving", "main", "rocket", "generator"]),
        capacity: z.number(),
        currentLevel: z.number().default(0),
        minLevel: z.number().default(0),
        linkedGeneratorId: z.number().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          capacity: input.capacity.toString(),
          currentLevel: input.currentLevel.toString(),
          minLevel: input.minLevel.toString(),
        };
        return db.createDieselTank(data as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        type: z.enum(["receiving", "main", "rocket", "generator"]).optional(),
        capacity: z.number().optional(),
        currentLevel: z.number().optional(),
        minLevel: z.number().optional(),
        linkedGeneratorId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, capacity, currentLevel, minLevel, ...rest } = input;
        const data: any = { ...rest };
        if (capacity !== undefined) data.capacity = capacity.toString();
        if (currentLevel !== undefined) data.currentLevel = currentLevel.toString();
        if (minLevel !== undefined) data.minLevel = minLevel.toString();
        return db.updateDieselTank(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselTank(input.id);
      }),

    updateLevel: protectedProcedure
      .input(z.object({
        id: z.number(),
        newLevel: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateDieselTankLevel(input.id, input.newLevel);
      }),
  }),

