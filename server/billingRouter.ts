// @ts-nocheck
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
      isActive: customersEnhanced.isActive,
      createdAt: customersEnhanced.createdAt,
    }).from(customersEnhanced).orderBy(desc(customersEnhanced.createdAt));
    return result;
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
    accountNumber: z.string(),
    fullName: z.string(),
    fullNameEn: z.string().optional(),
    customerType: z.enum(["individual", "company", "organization"]),
    category: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]),
    phone: z.string(),
    phone2: z.string().optional(),
    email: z.string().optional(),
    nationalId: z.string().optional(),
    address: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(customersEnhanced).values(input);
    // إنشاء محفظة للعميل
    await db.insert(customerWallets).values({ customerId: result.insertId, balance: "0" });
    return { id: result.insertId };
  }),

  updateCustomer: publicProcedure.input(z.object({
    id: z.number(),
    accountNumber: z.string().optional(),
    fullName: z.string().optional(),
    fullNameEn: z.string().optional(),
    customerType: z.enum(["individual", "company", "organization"]).optional(),
    category: z.enum(["residential", "commercial", "industrial", "governmental", "agricultural"]).optional(),
    phone: z.string().optional(),
    phone2: z.string().optional(),
    email: z.string().optional(),
    nationalId: z.string().optional(),
    address: z.string().optional(),
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
  getMeters: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: metersEnhanced.id,
      meterNumber: invoicesEnhanced.meterNumber,
      serialNumber: metersEnhanced.serialNumber,
      customerId: metersEnhanced.customerId,
      customerName: customersEnhanced.fullName,
      
      cabinetId: metersEnhanced.cabinetId,
      serviceType: metersEnhanced.serviceType,
      meterType: metersEnhanced.meterType,
      connectionType: metersEnhanced.connectionType,
      status: metersEnhanced.status,
      installationDate: metersEnhanced.installationDate,
      lastReading: metersEnhanced.lastReading,
      lastReadingDate: metersEnhanced.lastReadingDate,
      multiplier: metersEnhanced.multiplier,
      isIot: metersEnhanced.isIot,
      createdAt: metersEnhanced.createdAt,
    }).from(metersEnhanced)
      .leftJoin(customersEnhanced, eq(metersEnhanced.customerId, customersEnhanced.id))
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
  createMeterReading: publicProcedure.input(z.object({
    meterId: z.number(),
    billingPeriodId: z.number(),
    currentReading: z.string(),
    readingDate: z.string(),
    readingType: z.enum(["manual", "automatic", "estimated"]).optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // الحصول على القراءة السابقة
    const [meter] = await db.select({
      id: metersEnhanced.id,
      lastReading: metersEnhanced.lastReading,
    }).from(metersEnhanced).where(eq(metersEnhanced.id, input.meterId));
    const previousReading = meter?.lastReading || "0";
    const consumption = (parseFloat(input.currentReading) - parseFloat(previousReading)).toString();
    
    const [result] = await db.insert(meterReadingsEnhanced).values({
      ...input,
      previousReading,
      consumption,
      status: "pending",
      isApproved: false,
    });
    
    return { id: result.insertId };
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
        approvedAt: new Date().toISOString(),
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
          lastReading: reading.currentReading,
          lastReadingDate: reading.readingDate,
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
  getInvoices: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: invoicesEnhanced.id,
      invoiceNumber: invoicesEnhanced.invoiceNo,
      customerId: invoicesEnhanced.customerId,
      customerName: customersEnhanced.fullName,
      
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
      status: invoicesEnhanced.status,
      dueDate: invoicesEnhanced.dueDate,
      issueDate: invoicesEnhanced.invoiceDate,
      
      
    }).from(invoicesEnhanced)
      .leftJoin(customersEnhanced, eq(invoicesEnhanced.customerId, customersEnhanced.id))
      
      .leftJoin(billingPeriods, eq(invoicesEnhanced.billingPeriodId, billingPeriods.id))
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
  generateInvoices: publicProcedure.input(z.object({
    billingPeriodId: z.number(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // الحصول على القراءات المعتمدة لهذه الفترة
    const readings = await db.select({
      id: meterReadingsEnhanced.id,
      meterId: meterReadingsEnhanced.meterId,
      customerId: metersEnhanced.customerId,
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
    
    // الحصول على فترة الفوترة
    const [period] = await db.select({
      id: billingPeriods.id,
      code: billingPeriods.code,
      name: billingPeriods.name,
      dueDate: billingPeriods.dueDate,
    }).from(billingPeriods).where(eq(billingPeriods.id, input.billingPeriodId));
    
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
    
    for (const reading of readings) {
      if (!reading.customerId || !reading.meterId) continue;
      
      // حساب قيمة الاستهلاك حسب التعرفة
      const consumption = parseFloat(reading.consumption || "0");
      let consumptionAmount = 0;
      
      // البحث عن التعرفة المناسبة
      const applicableTariffs = allTariffs.filter(t => 
        t.serviceType === reading.serviceType && 
        t.customerCategory === reading.customerCategory
      ).sort((a, b) => a.fromUnit - b.fromUnit);
      
      let remainingConsumption = consumption;
      for (const tariff of applicableTariffs) {
        if (remainingConsumption <= 0) break;
        const unitsInTier = Math.min(remainingConsumption, tariff.toUnit - tariff.fromUnit + 1);
        consumptionAmount += unitsInTier * parseFloat(tariff.pricePerUnit);
        remainingConsumption -= unitsInTier;
      }
      
      // إذا لم توجد تعرفة، استخدم سعر افتراضي
      if (consumptionAmount === 0 && consumption > 0) {
        consumptionAmount = consumption * 0.18; // سعر افتراضي
      }
      
      const totalAmount = consumptionAmount;
      const invoiceNumber = `INV-${period.code}-${Date.now()}`;
      
      await db.insert(invoicesEnhanced).values({
        invoiceNumber,
        customerId: reading.customerId,
        meterId: reading.meterId,
        billingPeriodId: input.billingPeriodId,
        meterReadingId: reading.id,
        previousReading: reading.previousReading,
        currentReading: reading.currentReading,
        consumption: reading.consumption,
        consumptionAmount: consumptionAmount.toFixed(2),
        feesAmount: "0",
        totalAmount: totalAmount.toFixed(2),
        paidAmount: "0",
        remainingAmount: totalAmount.toFixed(2),
        status: "draft",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: period.dueDate,
        isPaid: false,
        isApproved: false,
      });
      
      invoicesCreated++;
    }
    
    return { success: true, invoicesCreated };
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
  getPayments: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select({
      id: paymentsEnhanced.id,
      paymentNumber: paymentsEnhanced.paymentNumber,
      customerId: paymentsEnhanced.customerId,
      customerName: customersEnhanced.fullName,
      
      invoiceId: paymentsEnhanced.invoiceId,
      invoiceNumber: invoicesEnhanced.invoiceNo,
      amount: paymentsEnhanced.amount,
      paymentMethodId: paymentsEnhanced.paymentMethodId,
      paymentDate: paymentsEnhanced.paymentDate,
      referenceNumber: paymentsEnhanced.referenceNumber,
      cashboxId: paymentsEnhanced.cashboxId,
      cashboxName: cashboxes.name,
      notes: paymentsEnhanced.notes,
      createdAt: paymentsEnhanced.createdAt,
    }).from(paymentsEnhanced)
      .leftJoin(customersEnhanced, eq(paymentsEnhanced.customerId, customersEnhanced.id))
      .leftJoin(invoicesEnhanced, eq(paymentsEnhanced.invoiceId, invoicesEnhanced.id))
      .leftJoin(cashboxes, eq(paymentsEnhanced.cashboxId, cashboxes.id))
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
    customerId: z.number(),
    invoiceId: z.number().optional(),
    amount: z.string(),
    paymentMethod: z.enum(["cash", "card", "bank_transfer", "check", "online"]),
    paymentDate: z.string(),
    referenceNumber: z.string().optional(),
    cashboxId: z.number().optional(),
    bankId: z.number().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const receiptNumber = `RCP-${Date.now()}`;
    
    const [result] = await db.insert(paymentsEnhanced).values({
      ...input,
      receiptNumber,
      status: "completed",
    });
    
    // تحديث الفاتورة إذا تم تحديدها
    if (input.invoiceId) {
      const [invoice] = await db.select({
        id: invoicesEnhanced.id,
        paidAmount: invoicesEnhanced.paidAmount,
        totalAmount: invoicesEnhanced.totalAmount,
      }).from(invoicesEnhanced).where(eq(invoicesEnhanced.id, input.invoiceId));
      if (invoice) {
        const newPaidAmount = parseFloat(invoice.paidAmount || "0") + parseFloat(input.amount);
        const newRemainingAmount = parseFloat(invoice.totalAmount) - newPaidAmount;
        const isPaid = newRemainingAmount <= 0;
        
        await db.update(invoicesEnhanced).set({
          paidAmount: newPaidAmount.toFixed(2),
          remainingAmount: Math.max(0, newRemainingAmount).toFixed(2),
          isPaid,
          status: isPaid ? "paid" : "partial",
        }).where(eq(invoicesEnhanced.id, input.invoiceId));
      }
    }
    
    // تحديث رصيد الصندوق
    if (input.cashboxId && input.paymentMethod === "cash") {
      const [cashbox] = await db.select({
        id: cashboxes.id,
        currentBalance: cashboxes.currentBalance,
      }).from(cashboxes).where(eq(cashboxes.id, input.cashboxId));
      if (cashbox) {
        const newBalance = parseFloat(cashbox.currentBalance || "0") + parseFloat(input.amount);
        await db.update(cashboxes).set({ currentBalance: newBalance.toFixed(2) }).where(eq(cashboxes.id, input.cashboxId));
      }
    }
    
    // إنشاء إيصال
    await db.insert(receipts).values({
      receiptNumber,
      paymentId: result.insertId,
      customerId: input.customerId,
      amount: input.amount,
      receiptDate: input.paymentDate,
    });
    
    return { id: result.insertId, receiptNumber };
  }),
});
