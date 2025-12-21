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

export const billingRouter = router({
  // ==================== المناطق ====================
  getAreas: publicProcedure.query(async () => {
    const db = await getDb();
    return await db.select().from(areas).orderBy(desc(areas.createdAt));
  }),

  createArea: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    const [result] = await db.insert(areas).values(input);
    return { id: result.insertId };
  }),

  updateArea: publicProcedure.input(z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    const { id, ...data } = input;
    await db.update(areas).set(data).where(eq(areas.id, id));
    return { success: true };
  }),

  deleteArea: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(areas).where(eq(areas.id, input.id));
    return { success: true };
  }),

  // ==================== المربعات ====================
  getSquares: publicProcedure.query(async () => {
    const db = await getDb();
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

  createSquare: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    areaId: z.number(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
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
    const { id, ...data } = input;
    await db.update(squares).set(data).where(eq(squares.id, id));
    return { success: true };
  }),

  deleteSquare: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(squares).where(eq(squares.id, input.id));
    return { success: true };
  }),

  // ==================== الكابينات ====================
  getCabinets: publicProcedure.query(async () => {
    const db = await getDb();
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

  createCabinet: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    squareId: z.number(),
    cabinetType: z.enum(["main", "sub", "distribution"]).optional(),
    capacity: z.number().optional(),
    location: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
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
    const { id, ...data } = input;
    await db.update(cabinets).set(data).where(eq(cabinets.id, id));
    return { success: true };
  }),

  deleteCabinet: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(cabinets).where(eq(cabinets.id, input.id));
    return { success: true };
  }),

  // ==================== التعرفة ====================
  getTariffs: publicProcedure.query(async () => {
    const db = await getDb();
    return await db.select().from(tariffs).orderBy(desc(tariffs.createdAt));
  }),

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
    const { id, ...data } = input;
    await db.update(tariffs).set(data).where(eq(tariffs.id, id));
    return { success: true };
  }),

  deleteTariff: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(tariffs).where(eq(tariffs.id, input.id));
    return { success: true };
  }),

  // ==================== أنواع الرسوم ====================
  getFeeTypes: publicProcedure.query(async () => {
    const db = await getDb();
    return await db.select().from(feeTypes).orderBy(desc(feeTypes.createdAt));
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
    const { id, ...data } = input;
    await db.update(feeTypes).set(data).where(eq(feeTypes.id, id));
    return { success: true };
  }),

  deleteFeeType: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(feeTypes).where(eq(feeTypes.id, input.id));
    return { success: true };
  }),

  // ==================== الصناديق ====================
  getCashboxes: publicProcedure.query(async () => {
    const db = await getDb();
    return await db.select().from(cashboxes).orderBy(desc(cashboxes.createdAt));
  }),

  createCashbox: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    cashboxType: z.enum(["main", "branch"]).optional(),
    openingBalance: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
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
    const { id, ...data } = input;
    await db.update(cashboxes).set(data).where(eq(cashboxes.id, id));
    return { success: true };
  }),

  deleteCashbox: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(cashboxes).where(eq(cashboxes.id, input.id));
    return { success: true };
  }),

  // ==================== طرق الدفع ====================
  getPaymentMethods: publicProcedure.query(async () => {
    const db = await getDb();
    return await db.select().from(paymentMethodsNew).orderBy(desc(paymentMethodsNew.createdAt));
  }),

  createPaymentMethod: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    nameEn: z.string().optional(),
    methodType: z.enum(["cash", "card", "bank_transfer", "check", "online"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
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
    const { id, ...data } = input;
    await db.update(paymentMethodsNew).set(data).where(eq(paymentMethodsNew.id, id));
    return { success: true };
  }),

  deletePaymentMethod: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(paymentMethodsNew).where(eq(paymentMethodsNew.id, input.id));
    return { success: true };
  }),

  // ==================== العملاء ====================
  getCustomers: publicProcedure.query(async () => {
    const db = await getDb();
    const result = await db.select().from(customersEnhanced).orderBy(desc(customersEnhanced.createdAt));
    return result;
  }),

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
    const { id, ...data } = input;
    await db.update(customersEnhanced).set(data).where(eq(customersEnhanced.id, id));
    return { success: true };
  }),

  deleteCustomer: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(customersEnhanced).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

  toggleCustomerStatus: publicProcedure.input(z.object({
    id: z.number(),
    isActive: z.boolean(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.update(customersEnhanced).set({ isActive: input.isActive }).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

  resetCustomerPassword: publicProcedure.input(z.object({
    id: z.number(),
    newPassword: z.string(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.update(customersEnhanced).set({ password: input.newPassword }).where(eq(customersEnhanced.id, input.id));
    return { success: true };
  }),

  // ==================== العدادات ====================
  getMeters: publicProcedure.query(async () => {
    const db = await getDb();
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
    const { id, ...data } = input;
    await db.update(metersEnhanced).set(data).where(eq(metersEnhanced.id, id));
    return { success: true };
  }),

  deleteMeter: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(metersEnhanced).where(eq(metersEnhanced.id, input.id));
    return { success: true };
  }),

  linkMeterToCustomer: publicProcedure.input(z.object({
    meterId: z.number(),
    customerId: z.number(),
    installationDate: z.string().optional(),
    initialReading: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    const updateData: any = { customerId: input.customerId };
    if (input.installationDate) updateData.installationDate = new Date(input.installationDate);
    if (input.initialReading !== undefined) updateData.lastReading = input.initialReading;
    await db.update(metersEnhanced).set(updateData).where(eq(metersEnhanced.id, input.meterId));
    return { success: true };
  }),

  // ==================== فترات الفوترة ====================
  getBillingPeriods: publicProcedure.query(async () => {
    const db = await getDb();
    return await db.select().from(billingPeriods).orderBy(desc(billingPeriods.createdAt));
  }),

  createBillingPeriod: publicProcedure.input(z.object({
    code: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    dueDate: z.string(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
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
    const { id, ...data } = input;
    await db.update(billingPeriods).set(data).where(eq(billingPeriods.id, id));
    return { success: true };
  }),

  updateBillingPeriodStatus: publicProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "active", "reading_phase", "billing_phase", "closed"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.update(billingPeriods).set({ status: input.status }).where(eq(billingPeriods.id, input.id));
    return { success: true };
  }),

  deleteBillingPeriod: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.delete(billingPeriods).where(eq(billingPeriods.id, input.id));
    return { success: true };
  }),

  // ==================== قراءات العدادات ====================
  getMeterReadings: publicProcedure.query(async () => {
    const db = await getDb();
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

  createMeterReading: publicProcedure.input(z.object({
    meterId: z.number(),
    billingPeriodId: z.number(),
    currentReading: z.string(),
    readingDate: z.string(),
    readingType: z.enum(["manual", "automatic", "estimated"]).optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    // الحصول على القراءة السابقة
    const [meter] = await db.select().from(metersEnhanced).where(eq(metersEnhanced.id, input.meterId));
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

  approveReadings: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    for (const id of input.ids) {
      await db.update(meterReadingsEnhanced).set({ 
        isApproved: true, 
        status: "approved",
        approvedAt: new Date().toISOString(),
      }).where(eq(meterReadingsEnhanced.id, id));
      
      // تحديث آخر قراءة في العداد
      const [reading] = await db.select().from(meterReadingsEnhanced).where(eq(meterReadingsEnhanced.id, id));
      if (reading) {
        await db.update(metersEnhanced).set({
          lastReading: reading.currentReading,
          lastReadingDate: reading.readingDate,
        }).where(eq(metersEnhanced.id, reading.meterId));
      }
    }
    return { success: true };
  }),

  rejectReadings: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    for (const id of input.ids) {
      await db.update(meterReadingsEnhanced).set({ status: "rejected" }).where(eq(meterReadingsEnhanced.id, id));
    }
    return { success: true };
  }),

  // ==================== الفواتير ====================
  getInvoices: publicProcedure.query(async () => {
    const db = await getDb();
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

  generateInvoices: publicProcedure.input(z.object({
    billingPeriodId: z.number(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    
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
    const [period] = await db.select().from(billingPeriods).where(eq(billingPeriods.id, input.billingPeriodId));
    
    // الحصول على التعرفة
    const allTariffs = await db.select().from(tariffs).where(eq(tariffs.isActive, true));
    
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

  approveInvoices: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    for (const id of input.ids) {
      await db.update(invoicesEnhanced).set({ 
        isApproved: true, 
        status: "approved",
      }).where(eq(invoicesEnhanced.id, id));
    }
    return { success: true };
  }),

  sendInvoices: publicProcedure.input(z.object({
    ids: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    for (const id of input.ids) {
      await db.update(invoicesEnhanced).set({ status: "sent" }).where(eq(invoicesEnhanced.id, id));
    }
    return { success: true };
  }),

  // ==================== المدفوعات ====================
  getPayments: publicProcedure.query(async () => {
    const db = await getDb();
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
    
    const receiptNumber = `RCP-${Date.now()}`;
    
    const [result] = await db.insert(paymentsEnhanced).values({
      ...input,
      receiptNumber,
      status: "completed",
    });
    
    // تحديث الفاتورة إذا تم تحديدها
    if (input.invoiceId) {
      const [invoice] = await db.select().from(invoicesEnhanced).where(eq(invoicesEnhanced.id, input.invoiceId));
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
      const [cashbox] = await db.select().from(cashboxes).where(eq(cashboxes.id, input.cashboxId));
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
