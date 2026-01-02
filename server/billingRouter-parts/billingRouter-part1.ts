
/**
 * @fileoverview Router لنظام الفوترة والتحصيل
 * @module billingRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بنظام الفوترة والتحصيل
 * بما في ذلك إدارة المناطق والمربعات والكابينات، التعرفة، العملاء، العدادات،
 * فترات الفوترة، القراءات، الفواتير، والمدفوعات.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires drizzle-orm - للتعامل مع قاعدة البيانات
 * @requires ./_core/trpc - لإنشاء الـ API endpoints
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { 
  areas, squares, cabinets, tariffs, feeTypes,
  customersEnhanced, customerWallets, metersEnhanced,
  billingPeriods, meterReadingsEnhanced, invoicesEnhanced,
  invoiceFees, cashboxes, paymentMethodsNew, paymentsEnhanced, receipts
} from "../drizzle/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

/**
 * @fileoverview Router لنظام الفوترة والتحصيل
 * @module billingRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بنظام الفوترة
 * بما في ذلك إدارة العملاء، العدادات، القراءات، الفواتير، المدفوعات،
 * الشرائح، والتقارير.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires ./db - للتعامل مع قاعدة البيانات
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * @fileoverview Router لنظام الفوترة والتحصيل
 * @module billingRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بنظام الفوترة
 * بما في ذلك إدارة العملاء، العدادات، القراءات، الفواتير، المدفوعات،
 * الشرائح، والتقارير.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires ./db - للتعامل مع قاعدة البيانات
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

export const billingRouter = router({
  // ==================== المناطق ====================
  /**
   * استرجاع قائمة المناطق
   * 
   * @procedure getAreas
   * @description يسترجع قائمة المناطق الجغرافية المعرفة في النظام مرتبة حسب تاريخ الإنشاء.
   * 
   * @returns {Promise<Area[]>} قائمة المناطق
   * 
   * @example
   * const areas = await trpc.billing.getAreas();
   */
  getAreas: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: areas.id,
      code: areas.code,
      name: areas.name,
      nameEn: areas.nameEn,
      description: areas.description,
      createdAt: areas.createdAt,
    }).from(areas).orderBy(desc(areas.createdAt));
  }),

  /**
   * إنشاء منطقة جديدة
   * 
   * @procedure createArea
   * @description ينشئ منطقة جغرافية جديدة في النظام.
   * 
   * @param {object} input - بيانات المنطقة
   * @param {string} input.code - رمز المنطقة
   * @param {string} input.name - اسم المنطقة بالعربية
   * @param {string} [input.nameEn] - اسم المنطقة بالإنجليزية
   * @param {string} [input.description] - وصف المنطقة
   * 
   * @returns {Promise<{id: number}>} معرف المنطقة الجديدة
   * 
   * @example
   * const result = await trpc.billing.createArea({ code: "A01", name: "المنطقة الشمالية" });
   */
  createArea: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(areas).values(input);
    return { id: result.insertId };
  }),

  /**
   * تحديث منطقة
   * 
   * @procedure updateArea
   * @description يحدث بيانات منطقة موجودة.
   * 
   * @param {object} input - بيانات التحديث
   * @param {number} input.id - معرف المنطقة
   * @param {string} [input.code] - الرمز الجديد
   * @param {string} [input.name] - الاسم الجديد
   * @param {string} [input.nameEn] - الاسم الإنجليزي الجديد
   * @param {string} [input.description] - الوصف الجديد
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  updateArea: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(areas).set(data).where(eq(areas.id, id));
    return { success: true };
  }),

  /**
   * حذف منطقة
   * 
   * @procedure deleteArea
   * @description يحذف منطقة من النظام.
   * 
   * @param {object} input - معاملات الحذف
   * @param {number} input.id - معرف المنطقة
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  deleteArea: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(areas).where(eq(areas.id, input.id));
    return { success: true };
  }),

  // ==================== المربعات ====================
  /**
   * استرجاع قائمة المربعات
   * 
   * @procedure getSquares
   * @description يسترجع قائمة المربعات مع بيانات المناطق المرتبطة بها.
   * 
   * @returns {Promise<Square[]>} قائمة المربعات
   */
  getSquares: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: squares.id,
      code: squares.code,
      name: squares.name,
      nameEn: squares.nameEn,
      areaId: squares.areaId,
      areaName: areas.name,
      description: squares.description,
      createdAt: squares.createdAt,
    }).from(squares)
      .leftJoin(areas, eq(squares.areaId, areas.id))
      .orderBy(desc(squares.createdAt));
    return result;
  }),

  /**
   * إنشاء مربع جديد
   * 
   * @procedure createSquare
   * @description ينشئ مربع جديد ضمن منطقة محددة.
   * 
   * @param {object} input - بيانات المربع
   * @param {string} input.code - رمز المربع
   * @param {string} input.name - اسم المربع
   * @param {string} [input.nameEn] - الاسم بالإنجليزية
   * @param {number} input.areaId - معرف المنطقة
   * @param {string} [input.description] - وصف المربع
   * 
   * @returns {Promise<{id: number}>} معرف المربع الجديد
   */
  createSquare: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    areaId: z.number(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(squares).values(input);
    return { id: result.insertId };
  }),

  updateSquare: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    areaId: z.number().optional(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(squares).set(data).where(eq(squares.id, id));
    return { success: true };
  }),

  deleteSquare: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(squares).where(eq(squares.id, input.id));
    return { success: true };
  }),

  // ==================== الكابينات ====================
  /**
   * استرجاع قائمة الكابينات
   * 
   * @procedure getCabinets
   * @description يسترجع قائمة الكابينات الكهربائية مع بيانات المربعات والمناطق.
   * 
   * @returns {Promise<Cabinet[]>} قائمة الكابينات
   */
  getCabinets: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: cabinets.id,
      code: cabinets.code,
      name: cabinets.name,
      squareId: cabinets.squareId,
      squareName: squares.name,
      areaName: areas.name,
      cabinetType: cabinets.cabinetType,
      capacity: cabinets.capacity,
      location: cabinets.location,
      status: cabinets.status,
      createdAt: cabinets.createdAt,
    }).from(cabinets)
      .leftJoin(squares, eq(cabinets.squareId, squares.id))
      .leftJoin(areas, eq(squares.areaId, areas.id))
      .orderBy(desc(cabinets.createdAt));
    return result;
  }),

  /**
   * إنشاء كابينة جديدة
   * 
   * @procedure createCabinet
   * @description ينشئ كابينة كهربائية جديدة ضمن مربع محدد.
   * 
   * @param {object} input - بيانات الكابينة
   * @param {string} input.code - رمز الكابينة
   * @param {string} input.name - اسم الكابينة
   * @param {number} input.squareId - معرف المربع
   * @param {string} [input.cabinetType] - نوع الكابينة (main|sub|distribution)
   * @param {number} [input.capacity] - السعة
   * @param {string} [input.location] - الموقع
   * 
   * @returns {Promise<{id: number}>} معرف الكابينة الجديدة
   */
  createCabinet: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    squareId: z.number(),
    cabinetType: z.enum(["main", "sub", "distribution"]).optional(),
    capacity: z.number().optional(),
    location: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(cabinets).values(input);
    return { id: result.insertId };
  }),

  updateCabinet: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    squareId: z.number().optional(),
    cabinetType: z.enum(["main", "sub", "distribution"]).optional(),
    capacity: z.number().optional(),
    location: z.string().optional(),
    status: z.enum(["active", "inactive", "maintenance"]).optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(cabinets).set(data).where(eq(cabinets.id, id));
    return { success: true };
  }),

  deleteCabinet: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(cabinets).where(eq(cabinets.id, input.id));
    return { success: true };
  }),

