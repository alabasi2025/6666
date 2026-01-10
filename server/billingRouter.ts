
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
import { router, publicProcedure, protectedProcedure, createPermissionProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { 
  areas, squares, cabinets, tariffs, feeTypes,
  customersEnhanced, customerWallets, metersEnhanced,
  billingPeriods, meterReadingsEnhanced, invoicesEnhanced,
  invoiceFees, cashboxes, paymentMethodsNew, paymentsEnhanced, receipts,
  subscriptionAccounts
} from "../drizzle/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { logger } from "./utils/logger";

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
  createArea: createPermissionProcedure("area", "create").input(z.object({
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
  updateArea: createPermissionProcedure("area", "update").input(z.object({
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
  deleteArea: createPermissionProcedure("area", "delete").input(z.object({ id: z.number() })).mutation(async ({ input }) => {
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

  // ==================== التعرفة ====================
  /**
   * استرجاع قائمة التعرفة
   * 
   * @procedure getTariffs
   * @description يسترجع قائمة شرائح التعرفة المعرفة في النظام.
   * 
   * @returns {Promise<Tariff[]>} قائمة التعرفة
   */
  getTariffs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: tariffs.id,
      code: tariffs.code,
      name: tariffs.name,
      serviceType: tariffs.serviceType,
      customerCategory: tariffs.customerCategory,
      fromUnit: tariffs.fromUnit,
      toUnit: tariffs.toUnit,
      pricePerUnit: tariffs.pricePerUnit,
      fixedCharge: tariffs.fixedCharge,
      isActive: tariffs.isActive,
      createdAt: tariffs.createdAt,
    }).from(tariffs).orderBy(desc(tariffs.createdAt));
  }),

  /**
   * إنشاء شريحة تعرفة جديدة
   * 
   * @procedure createTariff
   * @description ينشئ شريحة تعرفة جديدة مع تحديد نطاق الاستهلاك والسعر.
   * 
   * @param {object} input - بيانات التعرفة
   * @param {string} input.code - رمز التعرفة
   * @param {string} input.name - اسم التعرفة
   * @param {string} input.serviceType - نوع الخدمة (electricity|water|gas)
   * @param {string} input.customerCategory - فئة العميل
   * @param {number} input.fromUnit - بداية الشريحة
   * @param {number} input.toUnit - نهاية الشريحة
   * @param {string} input.pricePerUnit - سعر الوحدة
   * @param {string} [input.fixedCharge] - الرسوم الثابتة
   * 
   * @returns {Promise<{id: number}>} معرف التعرفة الجديدة
   */
  createTariff: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    serviceType: z.enum(["electricity", "water", "gas"]),
    customerCategory: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]),
    fromUnit: z.number(),
    toUnit: z.number(),
    pricePerUnit: z.string(),
    fixedCharge: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(tariffs).values(input);
    return { id: result.insertId };
  }),

  updateTariff: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    serviceType: z.enum(["electricity", "water", "gas"]).optional(),
    customerCategory: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]).optional(),
    fromUnit: z.number().optional(),
    toUnit: z.number().optional(),
    pricePerUnit: z.string().optional(),
    fixedCharge: z.string().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(tariffs).set(data).where(eq(tariffs.id, id));
    return { success: true };
  }),

  deleteTariff: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(tariffs).where(eq(tariffs.id, input.id));
    return { success: true };
  }),

  // ==================== أنواع الرسوم ====================
  /**
   * استرجاع أنواع الرسوم
   * 
   * @procedure getFeeTypes
   * @description يسترجع قائمة أنواع الرسوم الإضافية المعرفة في النظام.
   * 
   * @returns {Promise<FeeType[]>} قائمة أنواع الرسوم
   */
  getFeeTypes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: feeTypes.id,
      code: feeTypes.code,
      name: feeTypes.name,
      nameEn: feeTypes.nameEn,
      feeType: feeTypes.feeType,
      amount: feeTypes.amount,
      isRequired: feeTypes.isRequired,
      isActive: feeTypes.isActive,
      createdAt: feeTypes.createdAt,
    }).from(feeTypes).orderBy(desc(feeTypes.createdAt));
  }),

  createFeeType: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    feeType: z.enum(["fixed", "percentage"]),
    amount: z.string(),
    isRequired: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(feeTypes).values(input);
    return { id: result.insertId };
  }),

  updateFeeType: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    feeType: z.enum(["fixed", "percentage"]).optional(),
    amount: z.string().optional(),
    isRequired: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(feeTypes).set(data).where(eq(feeTypes.id, id));
    return { success: true };
  }),

  deleteFeeType: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(feeTypes).where(eq(feeTypes.id, input.id));
    return { success: true };
  }),

  // ==================== الصناديق ====================
  /**
   * استرجاع قائمة الصناديق
   * 
   * @procedure getCashboxes
   * @description يسترجع قائمة صناديق النقد مع أرصدتها الحالية.
   * 
   * @returns {Promise<Cashbox[]>} قائمة الصناديق
   */
  getCashboxes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: cashboxes.id,
      code: cashboxes.code,
      name: cashboxes.name,
      nameEn: cashboxes.nameEn,
      cashboxType: cashboxes.cashboxType,
      openingBalance: cashboxes.openingBalance,
      currentBalance: cashboxes.currentBalance,
      isActive: cashboxes.isActive,
      createdAt: cashboxes.createdAt,
    }).from(cashboxes).orderBy(desc(cashboxes.createdAt));
  }),

  /**
   * إنشاء صندوق نقد جديد
   * 
   * @procedure createCashbox
   * @description ينشئ صندوق نقد جديد مع تحديد الرصيد الافتتاحي.
   * 
   * @param {object} input - بيانات الصندوق
   * @param {string} input.code - رمز الصندوق
   * @param {string} input.name - اسم الصندوق
   * @param {string} [input.nameEn] - الاسم بالإنجليزية
   * @param {string} [input.cashboxType] - نوع الصندوق (main|branch)
   * @param {string} [input.openingBalance] - الرصيد الافتتاحي
   * 
   * @returns {Promise<{id: number}>} معرف الصندوق الجديد
   */
  createCashbox: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    cashboxType: z.enum(["main", "branch"]).optional(),
    openingBalance: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(cashboxes).values({ ...input, currentBalance: input.openingBalance || "0" });
    return { id: result.insertId };
  }),

  updateCashbox: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    cashboxType: z.enum(["main", "branch"]).optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(cashboxes).set(data).where(eq(cashboxes.id, id));
    return { success: true };
  }),

  deleteCashbox: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(cashboxes).where(eq(cashboxes.id, input.id));
    return { success: true };
  }),

  // ==================== طرق الدفع ====================
  /**
   * استرجاع طرق الدفع
   * 
   * @procedure getPaymentMethods
   * @description يسترجع قائمة طرق الدفع المتاحة في النظام.
   * 
   * @returns {Promise<PaymentMethod[]>} قائمة طرق الدفع
   */
  getPaymentMethods: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: paymentMethodsNew.id,
      code: paymentMethodsNew.code,
      name: paymentMethodsNew.name,
      nameEn: paymentMethodsNew.nameEn,
      methodType: paymentMethodsNew.methodType,
      isActive: paymentMethodsNew.isActive,
      createdAt: paymentMethodsNew.createdAt,
    }).from(paymentMethodsNew).orderBy(desc(paymentMethodsNew.createdAt));
  }),

  /**
   * إنشاء طريقة دفع جديدة
   * 
   * @procedure createPaymentMethod
   * @description ينشئ طريقة دفع جديدة في النظام.
   * 
   * @param {object} input - بيانات طريقة الدفع
   * @param {string} input.code - رمز طريقة الدفع
   * @param {string} input.name - اسم طريقة الدفع
   * @param {string} [input.nameEn] - الاسم بالإنجليزية
   * @param {string} input.methodType - نوع الطريقة (cash|card|bank_transfer|check|online)
   * 
   * @returns {Promise<{id: number}>} معرف طريقة الدفع الجديدة
   */
  createPaymentMethod: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    methodType: z.enum(["cash", "card", "bank_transfer", "check", "online"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(paymentMethodsNew).values(input);
    return { id: result.insertId };
  }),

  updatePaymentMethod: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    methodType: z.enum(["cash", "card", "bank_transfer", "check", "online"]).optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(paymentMethodsNew).set(data).where(eq(paymentMethodsNew.id, id));
    return { success: true };
  }),

  deletePaymentMethod: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(paymentMethodsNew).where(eq(paymentMethodsNew.id, input.id));
    return { success: true };
  }),

  // ==================== العملاء ====================
  /**
   * استرجاع قائمة العملاء
   * 
   * @procedure getCustomers
   * @description يسترجع قائمة العملاء المسجلين في النظام.
   * 
   * @returns {Promise<Customer[]>} قائمة العملاء
   */
  getCustomers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: customersEnhanced.id,
      accountNumber: customersEnhanced.accountNumber,
      fullName: customersEnhanced.fullName,
      fullNameEn: customersEnhanced.fullNameEn,
      customerType: customersEnhanced.customerType,
      category: customersEnhanced.category,
      phone: customersEnhanced.phone,
      phone2: customersEnhanced.phone2,
      email: customersEnhanced.email,
      nationalId: customersEnhanced.nationalId,
      address: customersEnhanced.address,
      status: customersEnhanced.status,
      balance: customersEnhanced.balance,
      balanceDue: customersEnhanced.balanceDue,
      isActive: customersEnhanced.isActive,
      createdAt: customersEnhanced.createdAt,
    }).from(customersEnhanced).orderBy(desc(customersEnhanced.createdAt));
    return result;
  }),

  /**
   * الحصول على عميل محدد
   */
  getCustomerById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [customer] = await db.select({
        id: customersEnhanced.id,
        accountNumber: customersEnhanced.accountNumber,
        fullName: customersEnhanced.fullName,
        fullNameEn: customersEnhanced.fullNameEn,
        customerType: customersEnhanced.customerType,
        category: customersEnhanced.category,
        serviceTier: customersEnhanced.serviceTier,
        phone: customersEnhanced.phone,
        phone2: customersEnhanced.phone2,
        mobileNo: customersEnhanced.mobileNo,
        email: customersEnhanced.email,
        nationalId: customersEnhanced.nationalId,
        address: customersEnhanced.address,
        status: customersEnhanced.status,
        balance: customersEnhanced.balance,
        balanceDue: customersEnhanced.balanceDue,
        isActive: customersEnhanced.isActive,
        createdAt: customersEnhanced.createdAt,
        updatedAt: customersEnhanced.updatedAt,
      }).from(customersEnhanced).where(eq(customersEnhanced.id, input.id));
      
      if (!customer) {
        throw new Error("العميل غير موجود");
      }
      
      return customer;
    }),

  /**
   * إنشاء عميل جديد
   * 
   * @procedure createCustomer
   * @description يسجل عميل جديد في النظام مع إنشاء محفظة له تلقائياً.
   * 
   * @param {object} input - بيانات العميل
   * @param {string} input.accountNumber - رقم الحساب
   * @param {string} input.fullName - الاسم الكامل
   * @param {string} [input.fullNameEn] - الاسم بالإنجليزية
   * @param {string} input.customerType - نوع العميل (individual|company|organization)
   * @param {string} input.category - فئة العميل (residential|commercial|industrial|governmental|agricultural)
   * @param {string} input.phone - رقم الهاتف
   * @param {string} [input.phone2] - رقم هاتف إضافي
   * @param {string} [input.email] - البريد الإلكتروني
   * @param {string} [input.nationalId] - رقم الهوية
   * @param {string} [input.address] - العنوان
   * 
   * @returns {Promise<{id: number}>} معرف العميل الجديد
   */
  createCustomer: publicProcedure.input(z.object({
    businessId: z.number().optional(),
    accountNumber: z.string(),
    fullName: z.string(),
    fullNameEn: z.string().optional(),
    customerType: z.enum(["individual", "company", "organization"]),
    category: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]),
    serviceTier: z.enum(["basic", "premium", "vip"]).optional(),
    phone: z.string(),
    phone2: z.string().optional(),
    email: z.string().optional(),
    nationalId: z.string().optional(),
    address: z.string().optional(),
    branchId: z.number().optional(),
    stationId: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // ✅ إضافة businessId إذا لم يكن موجوداً
    const businessId = input.businessId || ctx?.businessId || 1;
    
    const result = await db.insert(customersEnhanced).values({
      ...input,
      businessId,
      status: "active",
      balance: "0",
      balanceDue: "0",
      isActive: true,
    }).returning({ id: customersEnhanced.id });
    
    const customerId = result[0]?.id;
    if (!customerId) throw new Error("Failed to create customer");
    
    // إنشاء محفظة للعميل
    await db.insert(customerWallets).values({ customerId, balance: "0" });
    return { id: customerId };
  }),

  updateCustomer: publicProcedure.input(z.object({
    id: z.number(),
    accountNumber: z.string().optional(),
    fullName: z.string().optional(),
    fullNameEn: z.string().optional(),
    customerType: z.enum(["individual", "company", "organization"]).optional(),
    category: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]).optional(),
    serviceTier: z.enum(["basic", "premium", "vip"]).optional(),
    phone: z.string().optional(),
    phone2: z.string().optional(),
    email: z.string().optional(),
    nationalId: z.string().optional(),
    address: z.string().optional(),
    branchId: z.number().optional(),
    stationId: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(customersEnhanced).set(data).where(eq(customersEnhanced.id, id));
    return { success: true };
  }),

  deleteCustomer: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(customersEnhanced).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

  toggleCustomerStatus: publicProcedure.input(z.object({
    id: z.number(),
    isActive: z.boolean(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(customersEnhanced).set({ isActive: input.isActive }).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

  resetCustomerPassword: publicProcedure.input(z.object({
    id: z.number(),
    newPassword: z.string(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(customersEnhanced).set({ password: input.newPassword }).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

  // ==================== العدادات ====================
  /**
   * استرجاع قائمة العدادات
   * 
   * @procedure getMeters
   * @description يسترجع قائمة العدادات مع بيانات العملاء المرتبطين.
   * 
   * @returns {Promise<Meter[]>} قائمة العدادات
   */
  /**
   * استرجاع قائمة العدادات
   * 
   * @procedure getMeters
   * @description يسترجع قائمة العدادات مع بيانات العملاء وحسابات المشترك المرتبطين.
   * 
   * @param {object} [input] - معاملات البحث
   * @param {number} [input.customerId] - معرف العميل
   * @param {number} [input.subscriptionAccountId] - معرف حساب المشترك
   * @param {string} [input.status] - حالة العداد
   * 
   * @returns {Promise<Meter[]>} قائمة العدادات
   */
  getMeters: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      subscriptionAccountId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let whereClause: any = undefined;
      
      if (input?.customerId) {
        whereClause = eq(metersEnhanced.customerId, input.customerId);
      }
      
      if (input?.subscriptionAccountId) {
        whereClause = whereClause 
          ? and(whereClause, eq(metersEnhanced.subscriptionAccountId, input.subscriptionAccountId))
          : eq(metersEnhanced.subscriptionAccountId, input.subscriptionAccountId);
      }
      
      if (input?.status) {
        whereClause = whereClause 
          ? and(whereClause, eq(metersEnhanced.status, input.status))
          : eq(metersEnhanced.status, input.status);
      }
      
      const result = await db.select({
        id: metersEnhanced.id,
        meterNumber: metersEnhanced.meterNumber,
        serialNumber: metersEnhanced.serialNumber,
        customerId: metersEnhanced.customerId,
        subscriptionAccountId: metersEnhanced.subscriptionAccountId,
        customerName: customersEnhanced.fullName,
        cabinetId: metersEnhanced.cabinetId,
        tariffId: metersEnhanced.tariffId,
        meterType: metersEnhanced.meterType,
        category: metersEnhanced.category,
        status: metersEnhanced.status,
        balance: metersEnhanced.balance,
        balanceDue: metersEnhanced.balanceDue,
        currentReading: metersEnhanced.currentReading,
        previousReading: metersEnhanced.previousReading,
        installationDate: metersEnhanced.installationDate,
        createdAt: metersEnhanced.createdAt,
      }).from(metersEnhanced)
        .leftJoin(customersEnhanced, eq(metersEnhanced.customerId, customersEnhanced.id))
        .where(whereClause)
        .orderBy(desc(metersEnhanced.createdAt));
      
      return result;
    }),

  /**
   * إنشاء عداد جديد
   * 
   * @procedure createMeter
   * @description يسجل عداد جديد في النظام.
   * 
   * @param {object} input - بيانات العداد
   * @param {string} input.meterNumber - رقم العداد
   * @param {string} [input.serialNumber] - الرقم التسلسلي
   * @param {number} [input.customerId] - معرف العميل
   * @param {number} [input.cabinetId] - معرف الكابينة
   * @param {string} input.serviceType - نوع الخدمة (electricity|water|gas)
   * @param {string} [input.meterType] - نوع العداد
   * @param {string} [input.connectionType] - نوع التوصيل
   * @param {string} [input.installationDate] - تاريخ التركيب
   * @param {string} [input.initialReading] - القراءة الأولية
   * @param {number} [input.multiplier] - معامل الضرب
   * @param {boolean} [input.isIot] - هل هو عداد ذكي
   * 
   * @returns {Promise<{id: number}>} معرف العداد الجديد
   */
  createMeter: publicProcedure.input(z.object({
    meterNumber: z.string(),
    serialNumber: z.string().optional(),
    customerId: z.number().optional(),
    cabinetId: z.number().optional(),
    serviceType: z.enum(["electricity", "water", "gas"]),
    meterType: z.enum(["single_phase", "three_phase", "smart", "prepaid"]).optional(),
    connectionType: z.enum(["residential", "commercial", "industrial"]).optional(),
    installationDate: z.string().optional(),
    initialReading: z.string().optional(),
    multiplier: z.number().optional(),
    isIot: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(metersEnhanced).values({
      ...input,
      lastReading: input.initialReading || "0",
    });
    return { id: result.insertId };
  }),

  updateMeter: publicProcedure.input(z.object({
    id: z.number(),
    meterNumber: z.string().optional(),
    serialNumber: z.string().optional(),
    customerId: z.number().optional(),
    cabinetId: z.number().optional(),
    serviceType: z.enum(["electricity", "water", "gas"]).optional(),
    meterType: z.enum(["single_phase", "three_phase", "smart", "prepaid"]).optional(),
    connectionType: z.enum(["residential", "commercial", "industrial"]).optional(),
    status: z.enum(["active", "inactive", "disconnected", "removed"]).optional(),
    multiplier: z.number().optional(),
    isIot: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(metersEnhanced).set(data).where(eq(metersEnhanced.id, id));
    return { success: true };
  }),

  deleteMeter: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(metersEnhanced).where(eq(metersEnhanced.id, input.id));
    return { success: true };
  }),

  /**
   * ربط عداد بعميل
   * 
   * @procedure linkMeterToCustomer
   * @description يربط عداد موجود بعميل محدد.
   * 
   * @param {object} input - بيانات الربط
   * @param {number} input.meterId - معرف العداد
   * @param {number} input.customerId - معرف العميل
   * @param {string} [input.installationDate] - تاريخ التركيب
   * @param {number} [input.initialReading] - القراءة الأولية
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  linkMeterToCustomer: publicProcedure.input(z.object({
    meterId: z.number(),
    customerId: z.number(),
    installationDate: z.string().optional(),
    initialReading: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const updateData: any = { customerId: input.customerId };
    if (input.installationDate) updateData.installationDate = new Date(input.installationDate);
    if (input.initialReading !== undefined) updateData.lastReading = input.initialReading;
    await db.update(metersEnhanced).set(updateData).where(eq(metersEnhanced.id, input.meterId));
    return { success: true };
  }),

  // ==================== فترات الفوترة ====================
  /**
   * استرجاع فترات الفوترة
   * 
   * @procedure getBillingPeriods
   * @description يسترجع قائمة فترات الفوترة المعرفة في النظام.
   * 
   * @returns {Promise<BillingPeriod[]>} قائمة فترات الفوترة
   */
  getBillingPeriods: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select({
      id: billingPeriods.id,
      code: billingPeriods.code,
      name: billingPeriods.name,
      startDate: billingPeriods.startDate,
      endDate: billingPeriods.endDate,
      dueDate: billingPeriods.dueDate,
      status: billingPeriods.status,
      createdAt: billingPeriods.createdAt,
    }).from(billingPeriods).orderBy(desc(billingPeriods.createdAt));
  }),

  /**
   * إنشاء فترة فوترة جديدة
   * 
   * @procedure createBillingPeriod
   * @description ينشئ فترة فوترة جديدة مع تحديد تواريخ البداية والنهاية والاستحقاق.
   * 
   * @param {object} input - بيانات الفترة
   * @param {string} input.code - رمز الفترة
   * @param {string} input.name - اسم الفترة
   * @param {string} input.startDate - تاريخ البداية
   * @param {string} input.endDate - تاريخ النهاية
   * @param {string} input.dueDate - تاريخ الاستحقاق
   * 
   * @returns {Promise<{id: number}>} معرف الفترة الجديدة
   */
  createBillingPeriod: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    dueDate: z.string(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(billingPeriods).values({ ...input, status: "pending" });
    return { id: result.insertId };
  }),

  updateBillingPeriod: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    dueDate: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(billingPeriods).set(data).where(eq(billingPeriods.id, id));
    return { success: true };
  }),

  updateBillingPeriodStatus: publicProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "active", "reading_phase", "billing_phase", "closed"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(billingPeriods).set({ status: input.status }).where(eq(billingPeriods.id, input.id));
    return { success: true };
  }),

  deleteBillingPeriod: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(billingPeriods).where(eq(billingPeriods.id, input.id));
    return { success: true };
  }),

  // ==================== قراءات العدادات ====================
  /**
   * استرجاع قراءات العدادات
   * 
   * @procedure getMeterReadings
   * @description يسترجع قائمة قراءات العدادات مع بيانات العملاء والفترات.
   * 
   * @returns {Promise<MeterReading[]>} قائمة القراءات
   */
  getMeterReadings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: meterReadingsEnhanced.id,
      meterId: meterReadingsEnhanced.meterId,
      meterNumber: invoicesEnhanced.meterNumber,
      customerName: customersEnhanced.fullName,
      billingPeriodId: meterReadingsEnhanced.billingPeriodId,
      billingPeriodName: billingPeriods.name,
      previousReading: meterReadingsEnhanced.previousReading,
      currentReading: meterReadingsEnhanced.currentReading,
      consumption: meterReadingsEnhanced.consumption,
      readingDate: meterReadingsEnhanced.readingDate,
      readingType: meterReadingsEnhanced.readingType,
      status: meterReadingsEnhanced.status,
      notes: meterReadingsEnhanced.notes,
      isApproved: meterReadingsEnhanced.isApproved,
      approvedBy: meterReadingsEnhanced.approvedBy,
      approvedAt: meterReadingsEnhanced.approvedAt,
    }).from(meterReadingsEnhanced)
      .leftJoin(metersEnhanced, eq(meterReadingsEnhanced.meterId, metersEnhanced.id))
      .leftJoin(customersEnhanced, eq(metersEnhanced.customerId, customersEnhanced.id))
      .leftJoin(billingPeriods, eq(meterReadingsEnhanced.billingPeriodId, billingPeriods.id))
      .orderBy(desc(meterReadingsEnhanced.createdAt));
    return result;
  }),

  /**
   * تسجيل قراءة عداد
   * 
   * @procedure createMeterReading
   * @description يسجل قراءة جديدة لعداد مع حساب الاستهلاك تلقائياً.
   * 
   * @param {object} input - بيانات القراءة
   * @param {number} input.meterId - معرف العداد
   * @param {number} input.billingPeriodId - معرف فترة الفوترة
   * @param {string} input.currentReading - القراءة الحالية
   * @param {string} input.readingDate - تاريخ القراءة
   * @param {string} [input.readingType] - نوع القراءة (manual|automatic|estimated)
   * @param {string} [input.notes] - ملاحظات
   * 
   * @returns {Promise<{id: number}>} معرف القراءة الجديدة
   */
  createMeterReading: createPermissionProcedure("meter_reading", "create").input(z.object({
    meterId: z.number(),
    billingPeriodId: z.number(),
    currentReading: z.string(),
    readingDate: z.string(),
    readingType: z.enum(["manual", "automatic", "estimated"]).optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // الحصول على القراءة السابقة ومعلومات العداد
    const [meter] = await db.select({
      id: metersEnhanced.id,
      lastReading: metersEnhanced.lastReading,
      meterCapacity: metersEnhanced.meterCapacity,
      customerId: metersEnhanced.customerId,
    }).from(metersEnhanced).where(eq(metersEnhanced.id, input.meterId));
    
    if (!meter) {
      throw new Error("العداد غير موجود");
    }
    
    const previousReading = parseFloat(meter.lastReading || "0");
    const currentReading = parseFloat(input.currentReading);
    const consumption = currentReading - previousReading;
    
    // التحقق من صحة القراءة
    const validationWarnings: string[] = [];
    const validationErrors: string[] = [];
    
    // 1. التحقق من أن القراءة الحالية أكبر من السابقة
    if (currentReading < previousReading) {
      validationErrors.push("القراءة الحالية أقل من القراءة السابقة");
    }
    
    // 2. التحقق من الاستهلاك غير الطبيعي (أكثر من 3 أضعاف المتوسط)
    if (previousReading > 0) {
      // الحصول على متوسط الاستهلاك من آخر 3 قراءات
      const recentReadings = await db.select({
        consumption: meterReadingsEnhanced.consumption,
      })
      .from(meterReadingsEnhanced)
      .where(eq(meterReadingsEnhanced.meterId, input.meterId))
      .orderBy(desc(meterReadingsEnhanced.readingDate))
      .limit(3);
      
      if (recentReadings.length > 0) {
        const avgConsumption = recentReadings.reduce((sum, r) => 
          sum + parseFloat(r.consumption || "0"), 0
        ) / recentReadings.length;
        
        if (consumption > avgConsumption * 3 && consumption > 0) {
          validationWarnings.push(`الاستهلاك (${consumption.toFixed(2)}) أعلى بكثير من المتوسط (${avgConsumption.toFixed(2)})`);
        }
      }
    }
    
    // 3. التحقق من أن القراءة لا تتجاوز سعة العداد
    if (meter.meterCapacity && currentReading > parseFloat(meter.meterCapacity)) {
      validationWarnings.push(`القراءة تتجاوز سعة العداد (${meter.meterCapacity})`);
    }
    
    // 4. التحقق من الاستهلاك الصفري (قد يكون خطأ)
    if (consumption === 0 && input.readingType !== "estimated") {
      validationWarnings.push("الاستهلاك صفر - يرجى التحقق من القراءة");
    }
    
    // 5. التحقق من الاستهلاك السلبي
    if (consumption < 0) {
      validationErrors.push("الاستهلاك لا يمكن أن يكون سالباً");
    }
    
    // إذا كانت هناك أخطاء، لا نسمح بحفظ القراءة
    if (validationErrors.length > 0) {
      throw new Error(`أخطاء في التحقق: ${validationErrors.join(", ")}`);
    }
    
      // حفظ القراءة مع التحذيرات
      const [result] = await db.insert(meterReadingsEnhanced).values({
        meterId: input.meterId,
        billingPeriodId: input.billingPeriodId,
        currentReading: input.currentReading,
        previousReading: previousReading.toString(),
        consumption: consumption.toString(),
        readingDate: input.readingDate ? new Date(input.readingDate) : new Date(),
        readingType: input.readingType || "actual",
        status: validationWarnings.length > 0 ? "pending_review" : "pending",
        isEstimated: input.isEstimated || false,
        isApproved: false,
        images: null,
        notes: validationWarnings.length > 0 
          ? `${input.notes || ""}\n[تحذيرات: ${validationWarnings.join(", ")}]`.trim()
          : input.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: meterReadingsEnhanced.id });
    
    if (!result?.id) {
      throw new Error("Failed to create meter reading");
    }
    
    return { 
      id: result.id,
      warnings: validationWarnings,
      consumption: consumption.toString(),
    };
  }),

  /**
   * اعتماد القراءات
   * 
   * @procedure approveReadings
   * @description يعتمد مجموعة من قراءات العدادات ويحدث آخر قراءة في العداد.
   * 
   * @param {object} input - معاملات الاعتماد
   * @param {number[]} input.ids - قائمة معرفات القراءات
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  approveReadings: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(meterReadingsEnhanced).set({ 
        isApproved: true, 
        status: "approved",
        approvedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(meterReadingsEnhanced.id, id));
      
      // تحديث آخر قراءة في العداد
      const [reading] = await db.select({
        id: meterReadingsEnhanced.id,
        meterId: meterReadingsEnhanced.meterId,
        currentReading: meterReadingsEnhanced.currentReading,
        readingDate: meterReadingsEnhanced.readingDate,
      }).from(meterReadingsEnhanced).where(eq(meterReadingsEnhanced.id, id));
      if (reading) {
        await db.update(metersEnhanced).set({
          currentReading: reading.currentReading?.toString() || "0",
          previousReading: reading.currentReading?.toString() || "0", // TODO: يجب تحديث previousReading بشكل صحيح
          updatedAt: new Date(),
        }).where(eq(metersEnhanced.id, reading.meterId));
      }
    }
    return { success: true };
  }),

  /**
   * رفض القراءات
   * 
   * @procedure rejectReadings
   * @description يرفض مجموعة من قراءات العدادات.
   * 
   * @param {object} input - معاملات الرفض
   * @param {number[]} input.ids - قائمة معرفات القراءات
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  rejectReadings: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(meterReadingsEnhanced).set({ status: "rejected" }).where(eq(meterReadingsEnhanced.id, id));
    }
    return { success: true };
  }),

  // ==================== الفواتير ====================
  /**
   * استرجاع قائمة الفواتير
   * 
   * @procedure getInvoices
   * @description يسترجع قائمة الفواتير مع بيانات العملاء وفترات الفوترة.
   * 
   * @returns {Promise<Invoice[]>} قائمة الفواتير
   */
  /**
   * استرجاع قائمة الفواتير
   * 
   * @procedure getInvoices
   * @description يسترجع قائمة الفواتير مع بيانات العملاء وحسابات المشترك وفترات الفوترة.
   * 
   * @param {object} [input] - معاملات البحث
   * @param {number} [input.customerId] - معرف العميل
   * @param {number} [input.subscriptionAccountId] - معرف حساب المشترك
   * @param {number} [input.meterId] - معرف العداد
   * @param {string} [input.status] - حالة الفاتورة
   * 
   * @returns {Promise<Invoice[]>} قائمة الفواتير
   */
  getInvoices: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      subscriptionAccountId: z.number().optional(),
      meterId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let whereClause: any = undefined;
      
      if (input?.customerId) {
        whereClause = eq(invoicesEnhanced.customerId, input.customerId);
      }
      
      if (input?.subscriptionAccountId) {
        whereClause = whereClause 
          ? and(whereClause, eq(invoicesEnhanced.subscriptionAccountId, input.subscriptionAccountId))
          : eq(invoicesEnhanced.subscriptionAccountId, input.subscriptionAccountId);
      }
      
      if (input?.meterId) {
        whereClause = whereClause 
          ? and(whereClause, eq(invoicesEnhanced.meterId, input.meterId))
          : eq(invoicesEnhanced.meterId, input.meterId);
      }
      
      if (input?.status) {
        whereClause = whereClause 
          ? and(whereClause, eq(invoicesEnhanced.status, input.status))
          : eq(invoicesEnhanced.status, input.status);
      }
      
      const result = await db.select({
        id: invoicesEnhanced.id,
        invoiceNumber: invoicesEnhanced.invoiceNo,
        customerId: invoicesEnhanced.customerId, // للتوافق مع الكود القديم
        subscriptionAccountId: invoicesEnhanced.subscriptionAccountId, // ✅ الحقل الجديد - العمليات تحدث على حساب المشترك
        subscriptionAccountNumber: subscriptionAccounts.accountNumber,
        subscriptionAccountName: subscriptionAccounts.accountName,
        subscriptionAccountType: subscriptionAccounts.accountType,
        customerName: customersEnhanced.fullName,
        accountNumber: customersEnhanced.accountNumber,
        meterId: invoicesEnhanced.meterId,
        meterNumber: invoicesEnhanced.meterNumber,
        billingPeriodId: invoicesEnhanced.billingPeriodId,
        billingPeriodName: billingPeriods.name,
        previousReading: invoicesEnhanced.previousReading,
        currentReading: invoicesEnhanced.currentReading,
        consumption: invoicesEnhanced.totalConsumptionKWH,
        consumptionAmount: invoicesEnhanced.consumptionAmount,
        feesAmount: invoicesEnhanced.totalFees,
        totalAmount: invoicesEnhanced.totalAmount,
        paidAmount: invoicesEnhanced.paidAmount,
        remainingAmount: invoicesEnhanced.balanceDue,
        balanceDue: invoicesEnhanced.balanceDue,
        status: invoicesEnhanced.status,
        dueDate: invoicesEnhanced.dueDate,
        issueDate: invoicesEnhanced.invoiceDate,
        invoiceDate: invoicesEnhanced.invoiceDate,
        isPaid: sql<boolean>`COALESCE(${invoicesEnhanced.balanceDue}, 0) <= 0`,
        isApproved: sql<boolean>`${invoicesEnhanced.status} = 'approved' OR ${invoicesEnhanced.status} = 'sent'`,
      }).from(invoicesEnhanced)
        .leftJoin(customersEnhanced, eq(invoicesEnhanced.customerId, customersEnhanced.id))
        .leftJoin(subscriptionAccounts, eq(invoicesEnhanced.subscriptionAccountId, subscriptionAccounts.id))
        .leftJoin(billingPeriods, eq(invoicesEnhanced.billingPeriodId, billingPeriods.id))
        .where(whereClause)
        .orderBy(desc(invoicesEnhanced.createdAt));
      
      return result;
    }),

  /**
   * توليد الفواتير
   * 
   * @procedure generateInvoices
   * @description يولد فواتير لجميع القراءات المعتمدة في فترة فوترة محددة
   * مع حساب قيمة الاستهلاك حسب التعرفة.
   * 
   * @param {object} input - معاملات التوليد
   * @param {number} input.billingPeriodId - معرف فترة الفوترة
   * 
   * @returns {Promise<{success: boolean, invoicesCreated: number}>} نتيجة العملية مع عدد الفواتير
   */
  generateInvoices: createPermissionProcedure("invoice", "create").input(z.object({
    billingPeriodId: z.number(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // ✅ تحديث حالة العملاء بعد إنشاء الفواتير
    const { customerStatusService } = await import("../services/customer-status-service");
    
    try {
      // التحقق من وجود فترة الفوترة
      const [period] = await db.select({
        id: billingPeriods.id,
        businessId: billingPeriods.businessId,
        code: billingPeriods.code,
        name: billingPeriods.name,
        dueDate: billingPeriods.dueDate,
      }).from(billingPeriods).where(eq(billingPeriods.id, input.billingPeriodId));
      
      if (!period) {
        throw new Error("فترة الفوترة غير موجودة");
      }
      
      // الحصول على القراءات المعتمدة لهذه الفترة مع حساب المشترك
      const readings = await db.select({
        id: meterReadingsEnhanced.id,
        meterId: meterReadingsEnhanced.meterId,
        customerId: metersEnhanced.customerId, // للتوافق مع الكود القديم
        subscriptionAccountId: metersEnhanced.subscriptionAccountId, // الحقل الجديد - العمليات تحدث على حساب المشترك
        previousReading: meterReadingsEnhanced.previousReading,
        currentReading: meterReadingsEnhanced.currentReading,
        consumption: meterReadingsEnhanced.consumption,
        customerCategory: customersEnhanced.category,
        serviceType: metersEnhanced.serviceType,
      }).from(meterReadingsEnhanced)
        .leftJoin(metersEnhanced, eq(meterReadingsEnhanced.meterId, metersEnhanced.id))
        .leftJoin(customersEnhanced, eq(metersEnhanced.customerId, customersEnhanced.id))
        .where(and(
          eq(meterReadingsEnhanced.billingPeriodId, input.billingPeriodId),
          eq(meterReadingsEnhanced.isApproved, true)
        ));
      
      if (readings.length === 0) {
        return { success: true, invoicesCreated: 0, message: "لا توجد قراءات معتمدة لهذه الفترة" };
      }
    
    // الحصول على التعرفة
    const allTariffs = await db.select({
      id: tariffs.id,
      serviceType: tariffs.serviceType,
      customerCategory: tariffs.customerCategory,
      fromUnit: tariffs.fromUnit,
      toUnit: tariffs.toUnit,
      pricePerUnit: tariffs.pricePerUnit,
    }).from(tariffs).where(eq(tariffs.isActive, true));
    
      let invoicesCreated = 0;
      const errors: Array<{ readingId: number; error: string }> = [];
      
      for (const reading of readings) {
        try {
          // التحقق من البيانات الأساسية
          if (!reading.meterId) {
            errors.push({ 
              readingId: reading.id, 
              error: "بيانات القراءة غير مكتملة (عداد مفقود)" 
            });
            continue;
          }
          
          // الحصول على معلومات العداد مع حساب المشترك
          const [meterInfo] = await db.select({
            id: metersEnhanced.id,
            customerId: metersEnhanced.customerId,
            subscriptionAccountId: metersEnhanced.subscriptionAccountId,
            externalIntegrationType: metersEnhanced.externalIntegrationType,
            paymentMode: metersEnhanced.paymentMode,
            creditLimit: metersEnhanced.creditLimit,
            balanceDue: metersEnhanced.balanceDue,
          })
          .from(metersEnhanced)
          .where(eq(metersEnhanced.id, reading.meterId));
          
          if (!meterInfo) {
            errors.push({ 
              readingId: reading.id, 
              error: "العداد غير موجود" 
            });
            continue;
          }
          
          // ✅ التحقق من وجود حساب المشترك (مطلوب للعمليات المالية)
          if (!meterInfo.subscriptionAccountId) {
            errors.push({ 
              readingId: reading.id, 
              error: "العداد غير مرتبط بحساب مشترك. يرجى ربط العداد بحساب مشترك أولاً" 
            });
            continue;
          }
          
          // التحقق من وجود العميل (للتوافق مع الكود القديم)
          if (!meterInfo.customerId) {
            // محاولة الحصول على العميل من حساب المشترك
            const [accountInfo] = await db.select({
              customerId: subscriptionAccounts.customerId,
            })
            .from(subscriptionAccounts)
            .where(eq(subscriptionAccounts.id, meterInfo.subscriptionAccountId));
            
            if (!accountInfo) {
              errors.push({ 
                readingId: reading.id, 
                error: "حساب المشترك غير موجود" 
              });
              continue;
            }
          }
          
          if (!reading.consumption || parseFloat(reading.consumption) <= 0) {
            errors.push({ 
              readingId: reading.id, 
              error: "الاستهلاك غير صالح" 
            });
            continue;
          }
      
      // ✅ التحقق من نوع الدفع وحد الائتمان من حساب المشترك (بدلاً من العداد)
      const [subscriptionAccountInfo] = await db.select({
        id: subscriptionAccounts.id,
        customerId: subscriptionAccounts.customerId,
        creditLimit: subscriptionAccounts.creditLimit,
        balanceDue: subscriptionAccounts.balanceDue,
        paymentMode: subscriptionAccounts.paymentMode,
      })
      .from(subscriptionAccounts)
      .where(eq(subscriptionAccounts.id, meterInfo.subscriptionAccountId));
      
      if (!subscriptionAccountInfo) {
        errors.push({ 
          readingId: reading.id, 
          error: "حساب المشترك غير موجود" 
        });
        continue;
      }
      
      // استخدام customerId من حساب المشترك إذا لم يكن موجوداً في العداد
      if (!meterInfo.customerId && subscriptionAccountInfo.customerId) {
        meterInfo.customerId = subscriptionAccountInfo.customerId;
      }

      // ✅ التحقق من حد الائتمان من حساب المشترك (بدلاً من العداد)
      if (subscriptionAccountInfo?.paymentMode === "credit" || subscriptionAccountInfo?.paymentMode === "postpaid") {
        if (subscriptionAccountInfo.creditLimit) {
          const currentDebt = parseFloat(subscriptionAccountInfo.balanceDue?.toString() || "0");
          const creditLimit = parseFloat(subscriptionAccountInfo.creditLimit.toString());
          const estimatedInvoiceAmount = parseFloat(reading.consumption || "0") * 0.18; // تقدير أولي
          
          if (currentDebt + estimatedInvoiceAmount > creditLimit) {
            errors.push({
              readingId: reading.id,
              error: `تم الوصول لحد الائتمان (${creditLimit.toFixed(2)} ر.س). الدين الحالي: ${currentDebt.toFixed(2)} ر.س`
            });
            continue;
          }
        }
      }

      // حساب قيمة الاستهلاك حسب التعرفة (محسّن)
      const consumption = parseFloat(reading.consumption || "0");
      
      // التحقق من وجود جدول تعرفات متعددة
      let multiTariffSchedule = null;
      if (meterInfo?.externalIntegrationType === "acrel" || meterInfo?.externalIntegrationType === "sts") {
        const [schedule] = await db.execute(
          `SELECT * FROM multi_tariff_schedules 
           WHERE meter_id = ? AND meter_type = ? AND is_active = true 
           ORDER BY effective_date DESC LIMIT 1`,
          [reading.meterId, meterInfo.externalIntegrationType]
        ) as any[];
        
        if (schedule && schedule.length > 0) {
          multiTariffSchedule = schedule[0];
        }
      }

      let consumptionAmount = 0;

      // إذا كان هناك جدول تعرفات متعددة، حساب حسب التعرفة الزمنية
      if (multiTariffSchedule && multiTariffSchedule.tariff_data) {
        const tariffData = typeof multiTariffSchedule.tariff_data === 'string' 
          ? JSON.parse(multiTariffSchedule.tariff_data) 
          : multiTariffSchedule.tariff_data;
        
        // ✅ حساب الاستهلاك حسب التعرفات المتعددة (8 تعرفات)
        // محاولة حساب الاستهلاك حسب الوقت الفعلي للقراءات
        try {
          // إذا كانت هناك قراءات مفصلة بوقت، نستخدمها
          // وإلا نستخدم متوسط السعر المرجح حسب الفترة الزمنية
          const activeTariffs = tariffData.filter((t: any) => t.isActive !== false);
          
          if (activeTariffs.length === 0) {
            // لا توجد تعرفات نشطة، استخدام متوسط السعر
            const avgPrice = tariffData.reduce((sum: number, t: any) => sum + (t.pricePerKWH || 0), 0) / tariffData.length;
            consumptionAmount = consumption * avgPrice;
          } else if (activeTariffs.length === 1) {
            // تعرفة واحدة نشطة
            consumptionAmount = consumption * (activeTariffs[0].pricePerKWH || 0);
          } else {
            // توزيع الاستهلاك حسب الفترات الزمنية للتعرفات
            // ملاحظة: هذا تقريب. للحصول على حساب دقيق، نحتاج قراءات مفصلة بوقت
            const totalHours = 24 * 30; // افتراض 30 يوم (مثال)
            let weightedSum = 0;
            let totalWeight = 0;
            
            for (const tariff of activeTariffs) {
              // حساب عدد الساعات لكل تعرفة
              const startTimeStr = tariff.startTime || "00:00";
              const endTimeStr = tariff.endTime || "23:59";
              
              const startParts = startTimeStr.split(':');
              const endParts = endTimeStr.split(':');
              const startMinutes = parseInt(startParts[0] || "0", 10) * 60 + parseInt(startParts[1] || "0", 10);
              const endMinutes = parseInt(endParts[0] || "23", 10) * 60 + parseInt(endParts[1] || "59", 10);
              
              let hoursInTariff = (endMinutes - startMinutes) / 60;
              
              // إذا كانت التعرفة تمتد على يومين (مثل 22:00 - 06:00)
              if (hoursInTariff < 0) {
                hoursInTariff = 24 + hoursInTariff;
              }
              
              // حساب الوزن النسبي (عدد الساعات / 24)
              const weight = hoursInTariff / 24;
              weightedSum += (tariff.pricePerKWH || 0) * weight;
              totalWeight += weight;
            }
            
            // حساب السعر المتوسط المرجح
            const weightedAvgPrice = totalWeight > 0 ? weightedSum / totalWeight : 
              activeTariffs.reduce((sum: number, t: any) => sum + (t.pricePerKWH || 0), 0) / activeTariffs.length;
            
            consumptionAmount = consumption * weightedAvgPrice;
            
            // إضافة تحذير إذا كان الحساب تقريبياً
            logger.info('Time-based tariff calculation (approximation)', {
              meterId: reading.meterId,
              consumption,
              weightedAvgPrice,
              tariffsCount: activeTariffs.length,
            });
          }
        } catch (calculationError: any) {
          logger.error('Failed to calculate time-based consumption', {
            meterId: reading.meterId,
            error: calculationError.message,
          });
          // Fallback: استخدام متوسط السعر
          const avgPrice = tariffData.reduce((sum: number, t: any) => sum + (t.pricePerKWH || 0), 0) / tariffData.length;
          consumptionAmount = consumption * avgPrice;
        }
      } else {
        // استخدام حاسبة الاستهلاك المحسنة (التعرفة العادية)
        const { calculateConsumption } = await import("./utils/consumption-calculator");
        const consumptionResult = await calculateConsumption(
          reading.meterId,
          consumption,
          {
            billingPeriodId: input.billingPeriodId,
            useCumulative: true, // استخدام التعرفة التراكمية
            includeHistory: true,
          }
        );
        consumptionAmount = consumptionResult.consumptionAmount;
      }
      
      // إضافة تحذيرات إلى ملاحظات الفاتورة
      const invoiceNotes = consumptionResult.warnings.length > 0
        ? `تحذيرات: ${consumptionResult.warnings.join(", ")}`
        : undefined;
      
      // الحصول على الرسوم المطلوبة (Required Fees)
      const requiredFees = await db.select({
        id: feeTypes.id,
        code: feeTypes.code,
        name: feeTypes.name,
        feeType: feeTypes.feeType,
        amount: feeTypes.amount,
      })
      .from(feeTypes)
      .where(and(
        eq(feeTypes.isActive, true),
        eq(feeTypes.isRecurring, true)
      ));
      
      // حساب الرسوم
      let totalFeesAmount = 0;
      const feesToInsert: Array<{ invoiceId: number; feeTypeId: number; amount: string; description?: string }> = [];
      
      for (const fee of requiredFees) {
        let feeAmount = 0;
        
        if (fee.feeType === "fixed") {
          feeAmount = parseFloat(fee.amount || "0");
        } else if (fee.feeType === "percentage") {
          feeAmount = consumptionAmount * (parseFloat(fee.amount || "0") / 100);
        } else if (fee.feeType === "per_unit") {
          feeAmount = consumption * parseFloat(fee.amount || "0");
        }
        
        totalFeesAmount += feeAmount;
        feesToInsert.push({
          invoiceId: 0, // سيتم تحديثه بعد إدراج الفاتورة
          feeTypeId: fee.id,
          amount: feeAmount.toFixed(2),
          description: fee.name,
        });
      }
      
      // حساب الضريبة (VAT) - افتراضياً 15%
      const vatRate = 15; // يمكن جلبها من الإعدادات
      const vatAmount = (consumptionAmount + totalFeesAmount) * (vatRate / 100);
      
      // حساب الإجمالي
      const subtotal = consumptionAmount + totalFeesAmount;
      const totalAmount = subtotal + vatAmount;
      
      const invoiceNumber = `INV-${period.code}-${Date.now()}-${invoicesCreated}`;
      
      // ✅ إدراج الفاتورة مع حساب المشترك (العمليات تحدث على حساب المشترك)
      const invoiceResult = await db.insert(invoicesEnhanced).values({
        businessId: period.businessId || 1,
        invoiceNo: invoiceNumber,
        customerId: meterInfo.customerId || null, // للتوافق مع الكود القديم
        subscriptionAccountId: meterInfo.subscriptionAccountId, // الحقل الرئيسي - العمليات تحدث على حساب المشترك
        meterId: reading.meterId,
        billingPeriodId: input.billingPeriodId,
        meterReadingId: reading.id,
        previousReading: reading.previousReading?.toString() || "0",
        currentReading: reading.currentReading?.toString() || "0",
        totalConsumptionKWH: reading.consumption?.toString() || "0",
        consumptionAmount: consumptionAmount.toFixed(2),
        totalFees: totalFeesAmount.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        paidAmount: "0",
        balanceDue: totalAmount.toFixed(2),
        status: "draft",
        invoiceDate: new Date(),
        dueDate: period.dueDate || new Date(),
        notes: invoiceNotes || null,
      }).returning({ id: invoicesEnhanced.id });
      
      const invoiceId = invoiceResult[0]?.id;
      
      if (!invoiceId) {
        errors.push({ 
          readingId: reading.id, 
          error: "فشل إنشاء الفاتورة" 
        });
        continue;
      }
      
      // إدراج الرسوم المرتبطة بالفاتورة
      for (const fee of feesToInsert) {
        await db.insert(invoiceFees).values({
          invoiceId,
          feeTypeId: fee.feeTypeId,
          amount: fee.amount,
          description: fee.description || null,
        });
      }
      
      // ✅ تحديث رصيد حساب المشترك (balance_due) بعد إنشاء الفاتورة
      if (meterInfo.subscriptionAccountId) {
        try {
          await db.execute(sql`
            UPDATE subscription_accounts 
            SET balance_due = COALESCE(balance_due, 0) + ${totalAmount.toFixed(2)}::DECIMAL,
                updated_at = NOW()
            WHERE id = ${meterInfo.subscriptionAccountId}
          `);
        } catch (balanceError: any) {
          // تجاهل الخطأ - لا نوقف عملية الفوترة
          logger.warn("Failed to update subscription account balance after invoice creation", {
            subscriptionAccountId: meterInfo.subscriptionAccountId,
            invoiceId,
            error: balanceError.message,
          });
        }
      }
      
      invoicesCreated++;
      
      // ✅ تحديث حالة العميل بعد إنشاء الفاتورة (من حساب المشترك)
      if (meterInfo.customerId) {
        try {
          await customerStatusService.updateCustomerStatus(meterInfo.customerId, {
            sendNotification: false, // لا نرسل إشعارات بعد عند إنشاء الفواتير
          });
        } catch (statusError: any) {
          logger.warn("Failed to update customer status after invoice creation", {
            customerId: meterInfo.customerId,
            invoiceId,
            error: statusError.message,
          });
          // لا نفشل عملية الفوترة بسبب خطأ في تحديث الحالة
        }
      }
    } catch (error: any) {
          errors.push({ 
            readingId: reading.id, 
            error: error.message || "خطأ غير معروف في توليد الفاتورة" 
          });
          // الاستمرار في معالجة القراءات الأخرى
          continue;
        }
      }
      
      // ✅ تحديث حالة جميع العملاء المتأثرين بعد إنشاء جميع الفواتير
      try {
        const businessId = period.businessId || ctx?.businessId || 1;
        const statusUpdateResult = await customerStatusService.updateAllCustomersStatus(businessId, {
          sendNotification: true, // نرسل إشعارات للتغييرات النهائية
        });
        logger.info("Customer status updated after invoice generation", {
          businessId,
          totalProcessed: statusUpdateResult.totalProcessed,
          totalUpdated: statusUpdateResult.totalUpdated,
          notificationsSent: statusUpdateResult.notificationsSent,
        });
      } catch (statusError: any) {
        logger.error("Failed to update all customers status after invoice generation", {
          error: statusError.message,
        });
        // لا نفشل عملية الفوترة بسبب خطأ في تحديث الحالة
      }
      
      return { 
        success: true, 
        invoicesCreated, 
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length > 0 
          ? `تم إنشاء ${invoicesCreated} فاتورة مع ${errors.length} خطأ`
          : `تم إنشاء ${invoicesCreated} فاتورة بنجاح`
      };
    } catch (error: any) {
      // معالجة الأخطاء العامة
      throw new Error(`فشل توليد الفواتير: ${error.message}`);
    }
  }),

  /**
   * اعتماد الفواتير
   * 
   * @procedure approveInvoices
   * @description يعتمد مجموعة من الفواتير.
   * 
   * @param {object} input - معاملات الاعتماد
   * @param {number[]} input.ids - قائمة معرفات الفواتير
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  approveInvoices: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(invoicesEnhanced).set({ 
        isApproved: true, 
        status: "approved",
      }).where(eq(invoicesEnhanced.id, id));
    }
    return { success: true };
  }),

  /**
   * إرسال الفواتير
   * 
   * @procedure sendInvoices
   * @description يحدث حالة الفواتير إلى "مرسلة".
   * 
   * @param {object} input - معاملات الإرسال
   * @param {number[]} input.ids - قائمة معرفات الفواتير
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   */
  sendInvoices: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const id of input.ids) {
      await db.update(invoicesEnhanced).set({ status: "sent" }).where(eq(invoicesEnhanced.id, id));
    }
    return { success: true };
  }),

  // ==================== المدفوعات ====================
  /**
   * استرجاع قائمة المدفوعات
   * 
   * @procedure getPayments
   * @description يسترجع قائمة المدفوعات مع بيانات العملاء والفواتير.
   * 
   * @returns {Promise<Payment[]>} قائمة المدفوعات
   */
  /**
   * استرجاع قائمة المدفوعات
   * 
   * @procedure getPayments
   * @description يسترجع قائمة المدفوعات مع بيانات العملاء وحسابات المشترك والفواتير.
   * 
   * @param {object} [input] - معاملات البحث
   * @param {number} [input.customerId] - معرف العميل
   * @param {number} [input.subscriptionAccountId] - معرف حساب المشترك
   * @param {number} [input.invoiceId] - معرف الفاتورة
   * @param {string} [input.status] - حالة الدفعة
   * 
   * @returns {Promise<Payment[]>} قائمة المدفوعات
   */
  getPayments: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      subscriptionAccountId: z.number().optional(),
      invoiceId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let whereClause: any = undefined;
      
      if (input?.customerId) {
        whereClause = eq(paymentsEnhanced.customerId, input.customerId);
      }
      
      if (input?.subscriptionAccountId) {
        whereClause = whereClause 
          ? and(whereClause, eq(paymentsEnhanced.subscriptionAccountId, input.subscriptionAccountId))
          : eq(paymentsEnhanced.subscriptionAccountId, input.subscriptionAccountId);
      }
      
      if (input?.invoiceId) {
        whereClause = whereClause 
          ? and(whereClause, eq(paymentsEnhanced.invoiceId, input.invoiceId))
          : eq(paymentsEnhanced.invoiceId, input.invoiceId);
      }
      
      if (input?.status) {
        whereClause = whereClause 
          ? and(whereClause, eq(paymentsEnhanced.status, input.status))
          : eq(paymentsEnhanced.status, input.status);
      }
      
      const result = await db.select({
        id: paymentsEnhanced.id,
        paymentNumber: paymentsEnhanced.paymentNumber,
        receiptNumber: receipts.receiptNumber,
        customerId: paymentsEnhanced.customerId, // للتوافق مع الكود القديم
        subscriptionAccountId: paymentsEnhanced.subscriptionAccountId, // ✅ الحقل الجديد - العمليات تحدث على حساب المشترك
        subscriptionAccountNumber: subscriptionAccounts.accountNumber,
        subscriptionAccountName: subscriptionAccounts.accountName,
        subscriptionAccountType: subscriptionAccounts.accountType,
        customerName: customersEnhanced.fullName,
        accountNumber: customersEnhanced.accountNumber,
        invoiceId: paymentsEnhanced.invoiceId,
        invoiceNumber: invoicesEnhanced.invoiceNo,
        amount: paymentsEnhanced.amount,
        paymentMethodId: paymentsEnhanced.paymentMethodId,
        paymentDate: paymentsEnhanced.paymentDate,
        referenceNumber: paymentsEnhanced.referenceNumber,
        cashboxId: paymentsEnhanced.cashboxId,
        cashboxName: cashboxes.name,
        status: paymentsEnhanced.status,
        notes: paymentsEnhanced.notes,
        createdAt: paymentsEnhanced.createdAt,
      }).from(paymentsEnhanced)
        .leftJoin(customersEnhanced, eq(paymentsEnhanced.customerId, customersEnhanced.id))
        .leftJoin(subscriptionAccounts, eq(paymentsEnhanced.subscriptionAccountId, subscriptionAccounts.id))
        .leftJoin(invoicesEnhanced, eq(paymentsEnhanced.invoiceId, invoicesEnhanced.id))
        .leftJoin(cashboxes, eq(paymentsEnhanced.cashboxId, cashboxes.id))
        .leftJoin(receipts, eq(paymentsEnhanced.id, receipts.paymentId))
        .where(whereClause)
        .orderBy(desc(paymentsEnhanced.createdAt));
      
      return result;
    }),

  /**
   * تسجيل دفعة جديدة
   * 
   * @procedure createPayment
   * @description يسجل دفعة جديدة مع تحديث رصيد الفاتورة والصندوق وإنشاء إيصال.
   * 
   * @param {object} input - بيانات الدفعة
   * @param {number} input.customerId - معرف العميل
   * @param {number} [input.invoiceId] - معرف الفاتورة
   * @param {string} input.amount - المبلغ
   * @param {string} input.paymentMethod - طريقة الدفع
   * @param {string} input.paymentDate - تاريخ الدفع
   * @param {string} [input.referenceNumber] - رقم المرجع
   * @param {number} [input.cashboxId] - معرف الصندوق
   * @param {number} [input.bankId] - معرف البنك
   * @param {string} [input.notes] - ملاحظات
   * 
   * @returns {Promise<{id: number, receiptNumber: string}>} معرف الدفعة ورقم الإيصال
   */
  createPayment: publicProcedure.input(z.object({
    businessId: z.number().optional(),
    customerId: z.number(),
    invoiceId: z.number().optional(),
    amount: z.string(),
    paymentMethod: z.enum(["cash", "card", "bank_transfer", "check", "online"]),
    paymentDate: z.string(),
    referenceNumber: z.string().optional(),
    cashboxId: z.number().optional(),
    bankId: z.number().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const businessId = input.businessId || ctx?.businessId || 1;
    
    const receiptNumber = `RCP-${Date.now()}`;
    
    // ✅ الحصول على subscriptionAccountId من الفاتورة أو العداد أو العميل
    let subscriptionAccountId: number | null = null;
    
    if (input.invoiceId) {
      const [invoice] = await db.select({
        id: invoicesEnhanced.id,
        subscriptionAccountId: invoicesEnhanced.subscriptionAccountId,
        customerId: invoicesEnhanced.customerId,
        paidAmount: invoicesEnhanced.paidAmount,
        totalAmount: invoicesEnhanced.totalAmount,
      }).from(invoicesEnhanced).where(eq(invoicesEnhanced.id, input.invoiceId));
      
      if (invoice) {
        subscriptionAccountId = invoice.subscriptionAccountId || null;
        
        // تحديث الفاتورة
        const newPaidAmount = parseFloat(invoice.paidAmount || "0") + parseFloat(input.amount);
        const newRemainingAmount = parseFloat(invoice.totalAmount || "0") - newPaidAmount;
        const isPaid = newRemainingAmount <= 0;
        
        await db.update(invoicesEnhanced).set({
          paidAmount: newPaidAmount.toFixed(2),
          balanceDue: Math.max(0, newRemainingAmount).toFixed(2),
          status: isPaid ? "paid" : "partial",
        }).where(eq(invoicesEnhanced.id, input.invoiceId));
        
        // ✅ تحديث رصيد حساب المشترك من الفاتورة بعد الدفع
        if (subscriptionAccountId) {
          await db.execute(sql`
            UPDATE subscription_accounts 
            SET balance_due = GREATEST(0, COALESCE(balance_due, 0) - ${input.amount}::DECIMAL),
                updated_at = NOW()
            WHERE id = ${subscriptionAccountId}
          `);
        }
      }
    }
    
    // إذا لم يكن هناك subscriptionAccountId من الفاتورة، جربه من العميل
    if (!subscriptionAccountId && input.customerId) {
      const [account] = await db.select({ id: subscriptionAccounts.id })
        .from(subscriptionAccounts)
        .where(and(
          eq(subscriptionAccounts.customerId, input.customerId),
          eq(subscriptionAccounts.status, 'active')
        ))
        .orderBy(desc(subscriptionAccounts.createdAt))
        .limit(1);
      
      if (account) {
        subscriptionAccountId = account.id;
      }
    }
    
    // ✅ البحث عن payment method حسب الكود (cash, card, bank_transfer, إلخ)
    let paymentMethodId: number | null = null;
    if (input.paymentMethod) {
      try {
        const [paymentMethod] = await db.select({ id: paymentMethodsNew.id })
          .from(paymentMethodsNew)
          .where(and(
            eq(paymentMethodsNew.businessId, businessId),
            eq(paymentMethodsNew.code, input.paymentMethod),
            eq(paymentMethodsNew.isActive, true)
          ))
          .limit(1);
        
        if (paymentMethod) {
          paymentMethodId = paymentMethod.id;
        } else {
          // إذا لم يوجد، حاول البحث حسب methodType
          const [paymentMethodByType] = await db.select({ id: paymentMethodsNew.id })
            .from(paymentMethodsNew)
            .where(and(
              eq(paymentMethodsNew.businessId, businessId),
              eq(paymentMethodsNew.methodType, input.paymentMethod),
              eq(paymentMethodsNew.isActive, true)
            ))
            .limit(1);
          
          if (paymentMethodByType) {
            paymentMethodId = paymentMethodByType.id;
          }
        }
      } catch (error: any) {
        logger.warn("Failed to find payment method", { 
          paymentMethod: input.paymentMethod, 
          error: error.message 
        });
        // نتابع بدون paymentMethodId
      }
    }

    // ✅ إدراج المدفوعة مع subscriptionAccountId (العمليات تحدث على حساب المشترك)
    const paymentResult = await db.insert(paymentsEnhanced).values({
      businessId: businessId,
      customerId: input.customerId, // للتوافق مع الكود القديم
      subscriptionAccountId: subscriptionAccountId, // الحقل الرئيسي - العمليات تحدث على حساب المشترك
      invoiceId: input.invoiceId || null,
      paymentNumber: paymentNumber,
      amount: input.amount,
      paymentMethodId: paymentMethodId,
      paymentDate: new Date(input.paymentDate),
      referenceNumber: input.referenceNumber || null,
      cashboxId: input.cashboxId || null,
      status: "completed",
      notes: input.notes || null,
    }).returning({ id: paymentsEnhanced.id });
    
    const paymentId = paymentResult[0]?.id;
    
    // تحديث رصيد الصندوق
    if (input.cashboxId && input.paymentMethod === "cash") {
      const [cashbox] = await db.select({
        id: cashboxes.id,
        balance: cashboxes.balance,
      }).from(cashboxes).where(eq(cashboxes.id, input.cashboxId));
      if (cashbox) {
        const newBalance = parseFloat(cashbox.balance?.toString() || "0") + parseFloat(input.amount);
        await db.update(cashboxes).set({ balance: newBalance.toFixed(2) }).where(eq(cashboxes.id, input.cashboxId));
      }
    }
    
    // ✅ تحديث رصيد حساب المشترك (balance) بعد الدفع
    if (subscriptionAccountId) {
      try {
        await db.execute(sql`
          UPDATE subscription_accounts 
          SET balance = COALESCE(balance, 0) + ${input.amount}::DECIMAL,
              balance_due = GREATEST(0, COALESCE(balance_due, 0) - ${input.amount}::DECIMAL),
              updated_at = NOW()
          WHERE id = ${subscriptionAccountId}
        `);
        
        logger.info("[Billing] Updated subscription account balance after payment", {
          subscriptionAccountId,
          amount: input.amount,
          paymentId,
        });
      } catch (balanceError: any) {
        logger.warn("Failed to update subscription account balance after payment", {
          subscriptionAccountId,
          paymentId,
          error: balanceError.message,
        });
      }
    }
    
    // إنشاء إيصال
    if (paymentId) {
      await db.insert(receipts).values({
        businessId: businessId,
        paymentId: paymentId,
        receiptNumber: receiptNumber,
        issueDate: new Date(input.paymentDate),
        description: input.notes || null,
      });
    }
    
    return { id: paymentId, receiptNumber };
  }),
});
