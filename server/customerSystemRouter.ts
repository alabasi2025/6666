
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

  // ============================================
  // قراءات العدادات - Meter Readings
  // ============================================
  getMeterReadings: publicProcedure
    .input(z.object({
      billingPeriodId: z.number().optional(),
      meterId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const offset = (input.page - 1) * input.limit;
      let whereClause = undefined;
      
      if (input.billingPeriodId) {
        whereClause = eq(meterReadingsEnhanced.billingPeriodId, input.billingPeriodId);
      }
      if (input.meterId) {
        whereClause = whereClause 
          ? and(whereClause, eq(meterReadingsEnhanced.meterId, input.meterId))
          : eq(meterReadingsEnhanced.meterId, input.meterId);
      }
      
      const result = await db.select().from(meterReadingsEnhanced)
        .where(whereClause)
        .orderBy(desc(meterReadingsEnhanced.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      const total = await db.select({ count: sql<number>`count(*)` }).from(meterReadingsEnhanced).where(whereClause);
      return { data: result, total: total[0].count };
    }),

  createMeterReading: publicProcedure
    .input(z.object({
      meterId: z.number(),
      billingPeriodId: z.number(),
      currentReading: z.string(),
      previousReading: z.string().optional(),
      readingDate: z.string(),
      readingType: z.enum(["actual", "estimated", "adjusted"]).default("actual"),
      isEstimated: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const consumption = parseFloat(input.currentReading) - parseFloat(input.previousReading || "0");
      
      const result = await db.insert(meterReadingsEnhanced).values({
        ...input,
        consumption: consumption.toString(),
        status: "entered",
      });
      
      // Update meter current reading
      await db.update(metersEnhanced).set({
        currentReading: input.currentReading,
        previousReading: input.previousReading,
      }).where(eq(metersEnhanced.id, input.meterId));
      
      return { success: true, id: result[0].insertId };
    }),

  approveReading: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      await db.update(meterReadingsEnhanced).set({
        status: "approved",
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(meterReadingsEnhanced.id, input.id));
      return { success: true };
    }),

  // ============================================
  // الفواتير - Invoices
  // ============================================
  getInvoices: publicProcedure
    .input(z.object({
      businessId: z.number().optional(),
      customerId: z.number().optional(),
      billingPeriodId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const offset = (input.page - 1) * input.limit;
      let whereClause = undefined;
      
      if (input.businessId) {
        whereClause = eq(invoicesEnhanced.businessId, input.businessId);
      }
      if (input.customerId) {
        whereClause = whereClause 
          ? and(whereClause, eq(invoicesEnhanced.customerId, input.customerId))
          : eq(invoicesEnhanced.customerId, input.customerId);
      }
      
      const result = await db.select().from(invoicesEnhanced)
        .where(whereClause)
        .orderBy(desc(invoicesEnhanced.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      const total = await db.select({ count: sql<number>`count(*)` }).from(invoicesEnhanced).where(whereClause);
      return { data: result, total: total[0].count };
    }),

  calculateInvoices: publicProcedure
    .input(z.object({
      billingPeriodId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      // Get approved readings for this period
      const readings = await db.select().from(meterReadingsEnhanced)
        .where(and(
          eq(meterReadingsEnhanced.billingPeriodId, input.billingPeriodId),
          eq(meterReadingsEnhanced.status, "approved")
        ));
      
      let invoiceCount = 0;
      
      for (const reading of readings) {
        // Get meter and customer info
        const meter = await db.select().from(metersEnhanced).where(eq(metersEnhanced.id, reading.meterId));
        if (!meter[0] || !meter[0].customerId) continue;
        
        // Get tariff
        const tariff = meter[0].tariffId 
          ? await db.select().from(tariffs).where(eq(tariffs.id, meter[0].tariffId))
          : null;
        
        const consumption = parseFloat(reading.consumption || "0");
        let consumptionAmount = 0;
        
        if (tariff && tariff[0]) {
          const t = tariff[0];
          const tier1Limit = parseFloat(t.tier1Limit || "0");
          const tier2Limit = parseFloat(t.tier2Limit || "0");
          const tier3Limit = parseFloat(t.tier3Limit || "0");
          const tier1Rate = parseFloat(t.tier1Rate || "0");
          const tier2Rate = parseFloat(t.tier2Rate || "0");
          const tier3Rate = parseFloat(t.tier3Rate || "0");
          const tier4Rate = parseFloat(t.tier4Rate || "0");
          
          if (consumption <= tier1Limit) {
            consumptionAmount = consumption * tier1Rate;
          } else if (consumption <= tier2Limit) {
            consumptionAmount = tier1Limit * tier1Rate + (consumption - tier1Limit) * tier2Rate;
          } else if (consumption <= tier3Limit) {
            consumptionAmount = tier1Limit * tier1Rate + (tier2Limit - tier1Limit) * tier2Rate + (consumption - tier2Limit) * tier3Rate;
          } else {
            consumptionAmount = tier1Limit * tier1Rate + (tier2Limit - tier1Limit) * tier2Rate + (tier3Limit - tier2Limit) * tier3Rate + (consumption - tier3Limit) * tier4Rate;
          }
          
          consumptionAmount += parseFloat(t.baseCharge || "0");
        }
        
        const vatRate = tariff && tariff[0] ? parseFloat(tariff[0].vatRate || "15") : 15;
        const vatAmount = consumptionAmount * (vatRate / 100);
        const totalAmount = consumptionAmount + vatAmount;
        
        // Create invoice
        const invoiceNo = `INV-${Date.now()}-${invoiceCount}`;
        await db.insert(invoicesEnhanced).values({
          businessId: meter[0].businessId,
          customerId: meter[0].customerId,
          meterId: meter[0].id,
          billingPeriodId: input.billingPeriodId,
          meterReadingId: reading.id,
          invoiceNo,
          invoiceDate: new Date().toISOString().split("T")[0],
          meterNumber: meter[0].meterNumber,
          previousReading: reading.previousReading,
          currentReading: reading.currentReading,
          totalConsumptionKWH: reading.consumption,
          consumptionAmount: consumptionAmount.toFixed(2),
          vatRate: vatRate.toString(),
          vatAmount: vatAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          finalAmount: totalAmount.toFixed(2),
          balanceDue: totalAmount.toFixed(2),
          status: "generated",
          invoiceType: "final",
        });
        
        invoiceCount++;
      }
      
      return { success: true, count: invoiceCount };
    }),

  approveInvoice: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      await db.update(invoicesEnhanced).set({
        status: "approved",
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(invoicesEnhanced.id, input.id));
      return { success: true };
    }),

  // ============================================
  // المدفوعات - Payments
  // ============================================
  getPayments: publicProcedure
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
      let whereClause = undefined;
      
      if (input.businessId) {
        whereClause = eq(paymentsEnhanced.businessId, input.businessId);
      }
      if (input.customerId) {
        whereClause = whereClause 
          ? and(whereClause, eq(paymentsEnhanced.customerId, input.customerId))
          : eq(paymentsEnhanced.customerId, input.customerId);
      }
      
      const result = await db.select().from(paymentsEnhanced)
        .where(whereClause)
        .orderBy(desc(paymentsEnhanced.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      const total = await db.select({ count: sql<number>`count(*)` }).from(paymentsEnhanced).where(whereClause);
      return { data: result, total: total[0].count };
    }),

  createPayment: publicProcedure
    .input(z.object({
      businessId: z.number(),
      customerId: z.number(),
      invoiceId: z.number().optional(),
      amount: z.string(),
      paymentMethod: z.enum(["cash", "bank_transfer", "card", "check", "online"]).default("cash"),
      referenceNo: z.string().optional(),
      paymentDate: z.string(),
      notes: z.string().optional(),
      collectedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const paymentNo = `PAY-${Date.now()}`;
      const result = await db.insert(paymentsEnhanced).values({
        ...input,
        paymentNo,
        status: "completed",
      });
      
      // Update invoice if specified
      if (input.invoiceId) {
        const invoice = await db.select().from(invoicesEnhanced).where(eq(invoicesEnhanced.id, input.invoiceId));
        if (invoice[0]) {
          const newPaidAmount = parseFloat(invoice[0].paidAmount || "0") + parseFloat(input.amount);
          const newBalanceDue = parseFloat(invoice[0].finalAmount || "0") - newPaidAmount;
          const newStatus = newBalanceDue <= 0 ? "paid" : "partial";
          
          await db.update(invoicesEnhanced).set({
            paidAmount: newPaidAmount.toFixed(2),
            balanceDue: Math.max(0, newBalanceDue).toFixed(2),
            status: newStatus,
          }).where(eq(invoicesEnhanced.id, input.invoiceId));
        }
      }
      
      // Update customer balance
      const customer = await db.select().from(customersEnhanced).where(eq(customersEnhanced.id, input.customerId));
      if (customer[0]) {
        const newBalance = parseFloat(customer[0].balanceDue || "0") - parseFloat(input.amount);
        await db.update(customersEnhanced).set({
          balanceDue: Math.max(0, newBalance).toFixed(2),
        }).where(eq(customersEnhanced.id, input.customerId));
      }
      
      return { success: true, id: result[0].insertId, paymentNo };
    }),

  // ============================================
  // إحصائيات لوحة التحكم - Dashboard Stats
  // ============================================
  getDashboardStats: publicProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const whereClause = input.businessId ? eq(customersEnhanced.businessId, input.businessId) : undefined;
      
      const totalCustomers = await db.select({ count: sql<number>`count(*)` }).from(customersEnhanced).where(whereClause);
      const activeCustomers = await db.select({ count: sql<number>`count(*)` }).from(customersEnhanced).where(and(whereClause, eq(customersEnhanced.status, "active")));
      const totalMeters = await db.select({ count: sql<number>`count(*)` }).from(metersEnhanced);
      const activeMeters = await db.select({ count: sql<number>`count(*)` }).from(metersEnhanced).where(eq(metersEnhanced.status, "active"));
      const pendingInvoices = await db.select({ count: sql<number>`count(*)` }).from(invoicesEnhanced).where(eq(invoicesEnhanced.status, "generated"));
      const totalRevenue = await db.select({ sum: sql<number>`COALESCE(SUM(paid_amount), 0)` }).from(paymentsEnhanced);
      const totalDue = await db.select({ sum: sql<number>`COALESCE(SUM(balance_due), 0)` }).from(invoicesEnhanced);
      
      return {
        totalCustomers: totalCustomers[0].count,
        activeCustomers: activeCustomers[0].count,
        totalMeters: totalMeters[0].count,
        activeMeters: activeMeters[0].count,
        pendingInvoices: pendingInvoices[0].count,
        totalRevenue: totalRevenue[0].sum || 0,
        totalDue: totalDue[0].sum || 0,
      };
    }),
});

