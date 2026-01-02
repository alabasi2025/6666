
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { 
  areas, squares, cabinets, tariffs, feeTypes,
  customersEnhanced, customerWallets, customerTransactionsNew,
  metersEnhanced, billingPeriods, meterReadingsEnhanced,
  invoicesEnhanced, invoiceFees, cashboxes, paymentMethodsNew,
  paymentsEnhanced, receipts, prepaidCodes
} from "../drizzle/schema";
import { eq, desc, and, sql, like, gte, lte, inArray } from "drizzle-orm";

// ============================================
// نظام العملاء والفوترة - Customer & Billing System Router
// ============================================

export const customerSystemRouter = router({
  // ============================================
  // العملاء - Customers
  // ============================================
    getCustomers: publicProcedure
    .input(z.object({
      businessId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const params = input || { page: 1, limit: 20 };
      const offset = (params.page - 1) * params.limit;
      let whereClause = params.businessId ? eq(customersEnhanced.businessId, params.businessId) : undefined;
      
      if (params.search) {
        whereClause = and(
          whereClause,
          like(customersEnhanced.fullName, `%${params.search}%`)
        );
      }
      
      const result = await db.select().from(customersEnhanced)
        .where(whereClause)
        .orderBy(desc(customersEnhanced.createdAt))
        .limit(params.limit)
        .offset(offset);
      
      const total = await db.select({ count: sql<number>`count(*)` }).from(customersEnhanced).where(whereClause);
      return { data: result, total: total[0].count, page: params.page, limit: params.limit };
    }),


  createCustomer: publicProcedure
    .input(z.object({
      businessId: z.number(),
      fullName: z.string(),
      mobileNo: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      nationalId: z.string().optional(),
      customerType: z.enum(["residential", "commercial", "industrial", "government"]).default("residential"),
      serviceTier: z.enum(["basic", "premium", "vip"]).default("basic"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const customerNo = `C-${Date.now()}`;
      const result = await db.insert(customersEnhanced).values({
        ...input,
        customerNo,
        status: "active",
      });
      return { success: true, id: result[0].insertId };
    }),

  updateCustomer: publicProcedure
    .input(z.object({
      id: z.number(),
      fullName: z.string().optional(),
      mobileNo: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      nationalId: z.string().optional(),
      customerType: z.enum(["residential", "commercial", "industrial", "government"]).optional(),
      serviceTier: z.enum(["basic", "premium", "vip"]).optional(),
      status: z.enum(["active", "inactive", "suspended", "closed"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(customersEnhanced).set(data).where(eq(customersEnhanced.id, id));
      return { success: true };
    }),

  deleteCustomer: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      await db.delete(customersEnhanced).where(eq(customersEnhanced.id, input.id));
      return { success: true };
    }),

  // ============================================
  // العدادات - Meters
  // ============================================
  getMeters: publicProcedure
    .input(z.object({
      businessId: z.number().optional(),
      customerId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const offset = (input.page - 1) * input.limit;
      let whereClause = input.businessId ? eq(metersEnhanced.businessId, input.businessId) : undefined;
      
      if (input.customerId) {
        whereClause = and(whereClause, eq(metersEnhanced.customerId, input.customerId));
      }
      
      const result = await db.select().from(metersEnhanced)
        .where(whereClause)
        .orderBy(desc(metersEnhanced.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      const total = await db.select({ count: sql<number>`count(*)` }).from(metersEnhanced).where(whereClause);
      return { data: result, total: total[0].count, page: input.page, limit: input.limit };
    }),

  createMeter: publicProcedure
    .input(z.object({
      businessId: z.number(),
      meterNumber: z.string(),
      serialNumber: z.string().optional(),
      meterType: z.enum(["electricity", "water", "gas"]).default("electricity"),
      category: z.enum(["offline", "iot", "code"]).default("offline"),
      brand: z.string().optional(),
      model: z.string().optional(),
      tariffId: z.number().optional(),
      installationStatus: z.enum(["new", "used", "not_installed"]).default("new"),
      previousReading: z.string().optional(),
      signNumber: z.string().optional(),
      signColor: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(metersEnhanced).values({
        ...input,
        status: "not_installed",
        currentReading: input.previousReading || "0",
      });
      return { success: true, id: result[0].insertId };
    }),

  linkMeterToCustomer: publicProcedure
    .input(z.object({
      meterId: z.number(),
      customerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      await db.update(metersEnhanced).set({
        customerId: input.customerId,
        status: "active",
      }).where(eq(metersEnhanced.id, input.meterId));
      return { success: true };
    }),

  // ============================================
  // التعرفة - Tariffs
  // ============================================
  getTariffs: publicProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const result = await db.select().from(tariffs)
        .where(input.businessId ? eq(tariffs.businessId, input.businessId) : undefined)
        .orderBy(desc(tariffs.createdAt));
      
      return { data: result };
    }),

  createTariff: publicProcedure
    .input(z.object({
      businessId: z.number(),
      name: z.string(),
      code: z.string().optional(),
      description: z.string().optional(),
      meterType: z.enum(["electricity", "water", "gas"]).default("electricity"),
      customerType: z.string().optional(),
      baseCharge: z.string().optional(),
      tier1Limit: z.string().optional(),
      tier1Rate: z.string().optional(),
      tier2Limit: z.string().optional(),
      tier2Rate: z.string().optional(),
      tier3Limit: z.string().optional(),
      tier3Rate: z.string().optional(),
      tier4Rate: z.string().optional(),
      vatRate: z.string().optional(),
      effectiveFrom: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(tariffs).values({
        ...input,
        isActive: true,
      });
      return { success: true, id: result[0].insertId };
    }),

  // ============================================
  // فترات الفوترة - Billing Periods
  // ============================================
  getBillingPeriods: publicProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const result = await db.select().from(billingPeriods)
        .where(input.businessId ? eq(billingPeriods.businessId, input.businessId) : undefined)
        .orderBy(desc(billingPeriods.createdAt));
      
      return { data: result };
    }),

  createBillingPeriod: publicProcedure
    .input(z.object({
      businessId: z.number(),
      name: z.string(),
      periodNumber: z.number().optional(),
      month: z.number().optional(),
      year: z.number().optional(),
      startDate: z.string(),
      endDate: z.string(),
      readingStartDate: z.string().optional(),
      readingEndDate: z.string().optional(),
      billingDate: z.string().optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(billingPeriods).values({
        ...input,
        status: "pending",
      });
      return { success: true, id: result[0].insertId };
    }),

  updateBillingPeriodStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "active", "reading_phase", "billing_phase", "closed"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      await db.update(billingPeriods).set({ status: input.status }).where(eq(billingPeriods.id, input.id));
      return { success: true };
    }),

