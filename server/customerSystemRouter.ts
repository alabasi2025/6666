
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { 
  areas, squares, cabinets, tariffs, feeTypes,
  customersEnhanced, customerWallets, customerTransactionsNew,
  metersEnhanced, billingPeriods, meterReadingsEnhanced,
  invoicesEnhanced, invoiceFees, cashboxes, paymentMethodsNew,
  paymentsEnhanced, receipts, prepaidCodes,
  customerStations, customerBranches,
  financialTransfers, financialTransferDetails,
  subscriptionRequests, materialSpecifications, materialSpecificationItems,
  materialIssuances, materialIssuanceItems,
  meterInventoryItems, meterSeals, meterBreakers, complaints
} from "../drizzle/schemas";
import { stations, branches, subscriptionAccounts } from "../drizzle/schema";
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
      branchId: z.number().optional(),
      stationId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const customerNo = `C-${Date.now()}`;
      const [result] = await db.insert(customersEnhanced).values({
        ...input,
        customerNo,
        status: "active",
        isActive: true,
      }).returning({ id: customersEnhanced.id });
      
      if (!result?.id) {
        throw new Error("Failed to create customer");
      }
      
      // إنشاء محفظة للعميل تلقائياً
      await db.insert(customerWallets).values({
        customerId: result.id,
        balance: "0",
      });
      
      return { success: true, id: result.id };
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
      branchId: z.number().optional(),
      stationId: z.number().optional(),
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
      // الحقول الجديدة
      branchId: z.number().optional(),
      areaId: z.number().optional(),
      squareId: z.number().optional(),
      cabinetId: z.number().optional(),
      address: z.string().optional(),
      location: z.string().optional(),
      neighborhood: z.string().optional(),
      establishmentName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(metersEnhanced).values({
        ...input,
        status: "not_installed",
        currentReading: input.previousReading || "0",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: metersEnhanced.id });
      
      if (!result?.id) {
        throw new Error("Failed to create meter");
      }
      
      return { success: true, id: result.id };
    }),

  linkMeterToCustomer: publicProcedure
    .input(z.object({
      meterId: z.number(),
      customerId: z.number(),
      subscriptionAccountId: z.number().optional(), // ✅ الحقل الجديد - حساب المشترك
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // ✅ إذا تم تمرير subscriptionAccountId، استخدمه مباشرة
      // إذا لم يتم تمريره، ابحث عن حساب المشترك الافتراضي للعميل
      let subscriptionAccountId = input.subscriptionAccountId;
      
      if (!subscriptionAccountId) {
        const [account] = await db
          .select({ id: subscriptionAccounts.id })
          .from(subscriptionAccounts)
          .where(and(
            eq(subscriptionAccounts.customerId, input.customerId),
            eq(subscriptionAccounts.accountType, 'regular'),
            eq(subscriptionAccounts.status, 'active')
          ))
          .limit(1);
        
        if (account) {
          subscriptionAccountId = account.id;
        }
      }
      
      await db.update(metersEnhanced).set({
        customerId: input.customerId, // للتوافق مع الكود القديم
        subscriptionAccountId: subscriptionAccountId || null, // ✅ الحقل الرئيسي الجديد
        status: "active",
        updatedAt: new Date(),
      }).where(eq(metersEnhanced.id, input.meterId));
      
      return { success: true, subscriptionAccountId };
    }),

  /**
   * تحديث موقع العداد (GPS)
   */
  updateMeterLocation: publicProcedure
    .input(z.object({
      meterId: z.number(),
      latitude: z.number(),
      longitude: z.number(),
      address: z.string().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(metersEnhanced)
        .set({
          latitude: input.latitude.toString(),
          longitude: input.longitude.toString(),
          address: input.address || undefined,
          location: input.location || undefined,
          updatedAt: new Date(),
        })
        .where(eq(metersEnhanced.id, input.meterId));

      return { success: true };
    }),

  /**
   * الحصول على العدادات حسب الموقع (في نطاق معين)
   */
  getMetersByLocation: publicProcedure
    .input(z.object({
      businessId: z.number(),
      centerLatitude: z.number(),
      centerLongitude: z.number(),
      radiusKm: z.number().default(5), // نصف القطر بالكيلومترات
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // حساب العدادات ضمن النطاق باستخدام Haversine formula
      // نستخدم تقريب بسيط: 1 درجة = ~111 كم
      const latDelta = input.radiusKm / 111;
      const lonDelta = input.radiusKm / (111 * Math.cos(input.centerLatitude * Math.PI / 180));

      const minLat = input.centerLatitude - latDelta;
      const maxLat = input.centerLatitude + latDelta;
      const minLon = input.centerLongitude - lonDelta;
      const maxLon = input.centerLongitude + lonDelta;

      const meters = await db.select()
        .from(metersEnhanced)
        .where(
          and(
            eq(metersEnhanced.businessId, input.businessId),
            sql`${metersEnhanced.latitude} IS NOT NULL`,
            sql`${metersEnhanced.longitude} IS NOT NULL`,
            sql`CAST(${metersEnhanced.latitude} AS DECIMAL) >= ${minLat}`,
            sql`CAST(${metersEnhanced.latitude} AS DECIMAL) <= ${maxLat}`,
            sql`CAST(${metersEnhanced.longitude} AS DECIMAL) >= ${minLon}`,
            sql`CAST(${metersEnhanced.longitude} AS DECIMAL) <= ${maxLon}`
          )
        );

      // حساب المسافة الفعلية لكل عداد
      const metersWithDistance = meters.map(meter => {
        const lat1 = input.centerLatitude;
        const lon1 = input.centerLongitude;
        const lat2 = parseFloat(meter.latitude || "0");
        const lon2 = parseFloat(meter.longitude || "0");

        // Haversine formula
        const R = 6371; // نصف قطر الأرض بالكيلومترات
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return {
          ...meter,
          distance: distance.toFixed(2),
        };
      });

      // تصفية العدادات ضمن النطاق وترتيبها حسب المسافة
      const filteredMeters = metersWithDistance
        .filter(m => parseFloat(m.distance) <= input.radiusKm)
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

      return { 
        data: filteredMeters,
        total: filteredMeters.length,
      };
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
      
      const code = input.code || `TAR-${Date.now()}`;
      const [result] = await db.insert(tariffs).values({
        businessId: input.businessId,
        code,
        name: input.name,
        nameEn: input.nameEn || null,
        description: input.description || null,
        tariffType: input.meterType || "standard",
        serviceType: input.meterType || "electricity",
        fixedCharge: input.baseCharge || "0",
        vatRate: input.vatRate || "15",
        effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: tariffs.id });
      
      if (!result?.id) {
        throw new Error("Failed to create tariff");
      }
      
      return { success: true, id: result.id };
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
      
      const [result] = await db.insert(billingPeriods).values({
        businessId: input.businessId,
        projectId: null,
        name: input.name,
        periodNumber: input.periodNumber || null,
        month: input.month || null,
        year: input.year || null,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : new Date(),
        status: "pending", // period_status
        readingStartDate: input.readingStartDate ? new Date(input.readingStartDate) : null,
        readingEndDate: input.readingEndDate ? new Date(input.readingEndDate) : null,
        billingDate: input.billingDate ? new Date(input.billingDate) : null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        totalMeters: 0,
        readMeters: 0,
        billedMeters: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: billingPeriods.id });
      
      if (!result?.id) {
        throw new Error("Failed to create billing period");
      }
      
      return { success: true, id: result.id };
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
      
      const [result] = await db.insert(meterReadingsEnhanced).values({
        meterId: input.meterId,
        billingPeriodId: input.billingPeriodId,
        currentReading: input.currentReading,
        previousReading: input.previousReading || null,
        consumption: consumption.toString(),
        readingDate: input.readingDate ? new Date(input.readingDate) : new Date(),
        readingType: input.readingType || "actual", // reading_type
        status: "entered", // reading_status
        isEstimated: input.isEstimated || false,
        images: null,
        notes: input.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: meterReadingsEnhanced.id });
      
      if (!result?.id) {
        throw new Error("Failed to create meter reading");
      }
      
      // Update meter current reading
      await db.update(metersEnhanced).set({
        currentReading: input.currentReading,
        previousReading: input.previousReading || null,
        updatedAt: new Date(),
      }).where(eq(metersEnhanced.id, input.meterId));
      
      return { success: true, id: result.id };
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
      
      // إنشاء قيد محاسبي تلقائي
      try {
        const paymentId = result[0].insertId;
        const { AutoJournalEngine } = await import("./core/auto-journal-engine");
        
        await AutoJournalEngine.onPaymentReceived({
          id: paymentId,
          businessId: input.businessId,
          customerId: input.customerId,
          invoiceId: input.invoiceId,
          amount: parseFloat(input.amount),
          paymentMethod: input.paymentMethod === "cash" ? "cash" : input.paymentMethod === "bank_transfer" ? "bank" : "card",
          paymentDate: new Date(input.paymentDate),
          createdBy: input.collectedBy,
        });
      } catch (error: any) {
        // لا نرمي الخطأ - نكتفي بتسجيله
        console.error("Failed to create auto journal entry for payment", error);
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

  // ============================================
  // الربط الإداري - Organizational Linking
  // ============================================

  /**
   * ربط عميل بعدة محطات
   */
  linkCustomerToStations: publicProcedure
    .input(z.object({
      customerId: z.number(),
      stationIds: z.array(z.number()),
      primaryStationId: z.number().optional(),
      linkedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // حذف الروابط السابقة
      await db.delete(customerStations).where(eq(customerStations.customerId, input.customerId));

      // إضافة الروابط الجديدة
      for (const stationId of input.stationIds) {
        await db.insert(customerStations).values({
          customerId: input.customerId,
          stationId: stationId,
          isPrimary: input.primaryStationId === stationId,
          linkedBy: input.linkedBy,
        });
      }

      // تحديث المحطة الأساسية في customers_enhanced
      if (input.primaryStationId) {
        await db.update(customersEnhanced)
          .set({ stationId: input.primaryStationId })
          .where(eq(customersEnhanced.id, input.customerId));
      }

      return { success: true };
    }),

  /**
   * ربط عميل بعدة فروع
   */
  linkCustomerToBranches: publicProcedure
    .input(z.object({
      customerId: z.number(),
      branchIds: z.array(z.number()),
      primaryBranchId: z.number().optional(),
      linkedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // حذف الروابط السابقة
      await db.delete(customerBranches).where(eq(customerBranches.customerId, input.customerId));

      // إضافة الروابط الجديدة
      for (const branchId of input.branchIds) {
        await db.insert(customerBranches).values({
          customerId: input.customerId,
          branchId: branchId,
          isPrimary: input.primaryBranchId === branchId,
          linkedBy: input.linkedBy,
        });
      }

      // تحديث الفرع الأساسي في customers_enhanced
      if (input.primaryBranchId) {
        await db.update(customersEnhanced)
          .set({ branchId: input.primaryBranchId })
          .where(eq(customersEnhanced.id, input.customerId));
      }

      return { success: true };
    }),

  /**
   * الحصول على محطات العميل
   */
  getCustomerStations: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.select({
        id: customerStations.id,
        customerId: customerStations.customerId,
        stationId: customerStations.stationId,
        isPrimary: customerStations.isPrimary,
        linkedAt: customerStations.linkedAt,
        linkedBy: customerStations.linkedBy,
        station: stations,
      })
        .from(customerStations)
        .leftJoin(stations, eq(customerStations.stationId, stations.id))
        .where(eq(customerStations.customerId, input.customerId));

      return result;
    }),

  /**
   * الحصول على فروع العميل
   */
  getCustomerBranches: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.select({
        id: customerBranches.id,
        customerId: customerBranches.customerId,
        branchId: customerBranches.branchId,
        isPrimary: customerBranches.isPrimary,
        linkedAt: customerBranches.linkedAt,
        linkedBy: customerBranches.linkedBy,
        branch: branches,
      })
        .from(customerBranches)
        .leftJoin(branches, eq(customerBranches.branchId, branches.id))
        .where(eq(customerBranches.customerId, input.customerId));

      return result;
    }),

  /**
   * الحصول على العملاء المتاحين للربط بعداد (نفس الفرع/المحطة)
   */
  getAvailableCustomersForMeter: publicProcedure
    .input(z.object({
      meterId: z.number(),
      businessId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // الحصول على الفرع التابع له العداد
      const meter = await db.select({ branchId: metersEnhanced.branchId })
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, input.meterId))
        .limit(1);

      if (!meter[0] || !meter[0].branchId) {
        // إذا لم يكن هناك فرع، أرجع جميع العملاء
        return await db.select().from(customersEnhanced)
          .where(eq(customersEnhanced.businessId, input.businessId));
      }

      const branchId = meter[0].branchId;

      // الحصول على العملاء المرتبطين بنفس الفرع
      const customers = await db.select({
        customer: customersEnhanced,
      })
        .from(customerBranches)
        .innerJoin(customersEnhanced, eq(customerBranches.customerId, customersEnhanced.id))
        .where(and(
          eq(customerBranches.branchId, branchId),
          eq(customersEnhanced.businessId, input.businessId)
        ));

      // أيضاً العملاء الذين لهم نفس الفرع مباشرة في customers_enhanced
      const directCustomers = await db.select()
        .from(customersEnhanced)
        .where(and(
          eq(customersEnhanced.branchId, branchId),
          eq(customersEnhanced.businessId, input.businessId)
        ));

      // دمج النتائج وتجنب التكرار
      const allCustomers = new Map();
      customers.forEach(({ customer }) => {
        allCustomers.set(customer.id, customer);
      });
      directCustomers.forEach((customer) => {
        allCustomers.set(customer.id, customer);
      });

      return Array.from(allCustomers.values());
    }),

  /**
   * الحصول على العدادات المتاحة للربط بعميل (نفس الفرع/المحطة)
   */
  getAvailableMetersForCustomer: publicProcedure
    .input(z.object({
      customerId: z.number(),
      businessId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // الحصول على الفروع المرتبطة بالعميل
      const customerBranchesList = await db.select({ branchId: customerBranches.branchId })
        .from(customerBranches)
        .where(eq(customerBranches.customerId, input.customerId));

      // الحصول على الفرع الأساسي للعميل
      const customer = await db.select({ branchId: customersEnhanced.branchId })
        .from(customersEnhanced)
        .where(eq(customersEnhanced.id, input.customerId))
        .limit(1);

      const branchIds = new Set<number>();
      if (customer[0]?.branchId) {
        branchIds.add(customer[0].branchId);
      }
      customerBranchesList.forEach((cb) => {
        if (cb.branchId) branchIds.add(cb.branchId);
      });

      if (branchIds.size === 0) {
        // إذا لم يكن هناك فروع مرتبطة، أرجع جميع العدادات
        return await db.select().from(metersEnhanced)
          .where(eq(metersEnhanced.businessId, input.businessId));
      }

      // الحصول على العدادات المرتبطة بنفس الفروع
      return await db.select().from(metersEnhanced)
        .where(and(
          eq(metersEnhanced.businessId, input.businessId),
          inArray(metersEnhanced.branchId, Array.from(branchIds))
        ));
    }),

  // ============================================
  // محفظة العميل - Customer Wallet
  // ============================================

  /**
   * الحصول على محفظة عميل
   */
  getWallet: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const wallet = await db.select()
        .from(customerWallets)
        .where(eq(customerWallets.customerId, input.customerId))
        .limit(1);

      if (!wallet[0]) {
        // إنشاء محفظة جديدة إذا لم تكن موجودة
        const [newWallet] = await db.insert(customerWallets).values({
          customerId: input.customerId,
          balance: "0",
        });
        return newWallet;
      }

      return wallet[0];
    }),

  /**
   * الحصول على رصيد المحفظة
   */
  getWalletBalance: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const wallet = await db.select({ balance: customerWallets.balance })
        .from(customerWallets)
        .where(eq(customerWallets.customerId, input.customerId))
        .limit(1);

      return { balance: wallet[0]?.balance || "0" };
    }),

  /**
   * شحن المحفظة (يدوي أو من محفظة خارجية)
   */
  chargeWallet: publicProcedure
    .input(z.object({
      customerId: z.number(),
      amount: z.number().positive(),
      description: z.string().optional(),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // الحصول على المحفظة الحالية
      const wallet = await db.select()
        .from(customerWallets)
        .where(eq(customerWallets.customerId, input.customerId))
        .limit(1);

      if (!wallet[0]) {
        // إنشاء محفظة جديدة إذا لم تكن موجودة
        const [newWallet] = await db.insert(customerWallets).values({
          customerId: input.customerId,
          balance: "0",
        });
        wallet.push(newWallet);
      }

      const currentBalance = parseFloat(wallet[0]?.balance || "0");
      const newBalance = currentBalance + input.amount;

      // تحديث رصيد المحفظة
      await db.update(customerWallets)
        .set({
          balance: newBalance.toString(),
          lastTransactionDate: new Date(),
        })
        .where(eq(customerWallets.customerId, input.customerId));

      // تسجيل المعاملة
      await db.insert(customerTransactionsNew).values({
        customerId: input.customerId,
        walletId: wallet[0]?.id,
        transactionType: "charge",
        amount: input.amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description || `شحن المحفظة بمبلغ ${input.amount} ر.س`,
        createdBy: input.createdBy,
      });

      return { success: true, newBalance };
    }),

  /**
   * سحب من المحفظة (للسداد على حساب عداد)
   */
  withdrawFromWallet: publicProcedure
    .input(z.object({
      customerId: z.number(),
      amount: z.number().positive(),
      meterId: z.number().optional(),
      description: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // الحصول على المحفظة الحالية
      const wallet = await db.select()
        .from(customerWallets)
        .where(eq(customerWallets.customerId, input.customerId))
        .limit(1);

      if (!wallet[0]) {
        throw new Error("المحفظة غير موجودة");
      }

      const currentBalance = parseFloat(wallet[0].balance || "0");
      
      if (currentBalance < input.amount) {
        throw new Error("الرصيد غير كافي");
      }

      const newBalance = currentBalance - input.amount;

      // تحديث رصيد المحفظة
      await db.update(customerWallets)
        .set({
          balance: newBalance.toString(),
          lastTransactionDate: new Date(),
        })
        .where(eq(customerWallets.customerId, input.customerId));

      // تسجيل المعاملة
      await db.insert(customerTransactionsNew).values({
        customerId: input.customerId,
        walletId: wallet[0].id,
        transactionType: "withdrawal",
        amount: input.amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        referenceType: input.meterId ? "meter" : undefined,
        referenceId: input.meterId,
        description: input.description || `سحب من المحفظة بمبلغ ${input.amount} ر.س${input.meterId ? ` (للسداد على حساب العداد ${input.meterId})` : ""}`,
        createdBy: input.createdBy,
      });

      // إذا كان السحب لسداد عداد، تحديث رصيد العداد
      if (input.meterId) {
        const meter = await db.select({ balance: metersEnhanced.balance })
          .from(metersEnhanced)
          .where(eq(metersEnhanced.id, input.meterId))
          .limit(1);

        if (meter[0]) {
          const meterBalance = parseFloat(meter[0].balance || "0");
          const newMeterBalance = meterBalance - input.amount;
          
          await db.update(metersEnhanced)
            .set({ balance: newMeterBalance.toString() })
            .where(eq(metersEnhanced.id, input.meterId));
        }
      }

      return { success: true, newBalance };
    }),

  /**
   * الحصول على سجل معاملات المحفظة
   */
  getWalletTransactions: publicProcedure
    .input(z.object({
      customerId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
      transactionType: z.enum(["payment", "refund", "charge", "adjustment", "deposit", "withdrawal"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;
      let whereClause = eq(customerTransactionsNew.customerId, input.customerId);

      if (input.transactionType) {
        whereClause = and(
          whereClause,
          eq(customerTransactionsNew.transactionType, input.transactionType)
        );
      }

      const transactions = await db.select()
        .from(customerTransactionsNew)
        .where(whereClause)
        .orderBy(desc(customerTransactionsNew.createdAt))
        .limit(input.limit)
        .offset(offset);

      const total = await db.select({ count: sql<number>`count(*)` })
        .from(customerTransactionsNew)
        .where(whereClause);

      return {
        data: transactions,
        total: total[0].count,
        page: input.page,
        limit: input.limit,
      };
    }),

  /**
   * ربط محفظة خارجية (STC Pay, Apple Pay, إلخ)
   */
  linkExternalWallet: publicProcedure
    .input(z.object({
      customerId: z.number(),
      walletType: z.enum(["stc_pay", "apple_pay", "google_pay", "mada", "other"]),
      walletIdentifier: z.string(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      // ✅ تنفيذ الربط مع المحافظ الخارجية
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "قاعدة البيانات غير متاحة",
          });
        }

        // التحقق من وجود العميل
        const [customer] = await db
          .select({ id: customersEnhanced.id })
          .from(customersEnhanced)
          .where(eq(customersEnhanced.id, input.customerId))
          .limit(1);

        if (!customer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "العميل غير موجود",
          });
        }

        // حفظ معلومات الربط في metadata الخاص بالمحفظة
        // يمكن إنشاء جدول customer_external_wallets لاحقاً
        const walletMetadata = {
          externalWallets: {
            [input.walletType]: {
              identifier: input.walletIdentifier,
              linkedAt: new Date().toISOString(),
              metadata: input.metadata || {},
            },
          },
        };

        // تحديث metadata محفظة العميل
        await db
          .update(customerWallets)
          .set({
            metadata: walletMetadata as any,
            updatedAt: new Date(),
          })
          .where(eq(customerWallets.customerId, input.customerId));

        return {
          success: true,
          message: `تم ربط محفظة ${input.walletType} بنجاح`,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في ربط المحفظة الخارجية",
        });
      }
    }),

  /**
   * شحن من محفظة خارجية
   */
  chargeFromExternalWallet: publicProcedure
    .input(z.object({
      customerId: z.number(),
      walletType: z.enum(["stc_pay", "apple_pay", "google_pay", "mada", "other"]),
      amount: z.number().positive(),
      transactionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // ✅ تنفيذ الشحن من المحافظ الخارجية
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "قاعدة البيانات غير متاحة",
          });
        }

        // التحقق من وجود العميل
        const [customer] = await db
          .select({ id: customersEnhanced.id })
          .from(customersEnhanced)
          .where(eq(customersEnhanced.id, input.customerId))
          .limit(1);

        if (!customer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "العميل غير موجود",
          });
        }

        // التحقق من ربط المحفظة الخارجية
        const [wallet] = await db
          .select({ metadata: customerWallets.metadata })
          .from(customerWallets)
          .where(eq(customerWallets.customerId, input.customerId))
          .limit(1);

        if (!wallet?.metadata) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "المحفظة الخارجية غير مربوطة",
          });
        }

        const metadata = typeof wallet.metadata === 'string' 
          ? JSON.parse(wallet.metadata) 
          : wallet.metadata;

        const externalWallet = metadata?.externalWallets?.[input.walletType];
        if (!externalWallet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `محفظة ${input.walletType} غير مربوطة`,
          });
        }

        // ✅ التحقق من المعاملة الخارجية عبر API المحفظة
        // ملاحظة: يحتاج تكامل مع APIs المحافظ الخارجية
        // مثال للتكامل المستقبلي:
        // const paymentService = getPaymentService(input.walletType);
        // const verified = await paymentService.verifyTransaction(input.transactionId);
        // if (!verified) {
        //   throw new TRPCError({ code: "BAD_REQUEST", message: "المعاملة غير صحيحة" });
        // }
        // حالياً: نعتبر المعاملة صحيحة إذا كان transactionId موجوداً
        if (!input.transactionId || input.transactionId.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "معرّف المعاملة مطلوب",
          });
        }

        // استخدام chargeWallet بعد التحقق
        // يمكن استدعاء mutation chargeWallet هنا
        // أو تنفيذ الشحن مباشرة:

        await db
          .update(customerWallets)
          .set({
            balance: sql`${customerWallets.balance} + ${input.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(customerWallets.customerId, input.customerId));

        // تسجيل المعاملة
        await db.insert(customerTransactionsNew).values({
          customerId: input.customerId,
          transactionType: 'deposit',
          amount: input.amount,
          description: `شحن من ${input.walletType}`,
          reference: input.transactionId,
          status: 'completed',
          metadata: {
            walletType: input.walletType,
            externalTransactionId: input.transactionId,
          } as any,
        });

        return {
          success: true,
          message: `تم الشحن بنجاح من ${input.walletType}`,
          amount: input.amount,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الشحن من المحفظة الخارجية",
        });
      }
    }),

  // ============================================
  // حساب العداد - Meter Account
  // ============================================

  /**
   * الحصول على حساب العداد (الرصيد والمستحقات)
   */
  getMeterAccount: publicProcedure
    .input(z.object({ meterId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // الحصول على بيانات العداد
      const meter = await db.select()
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, input.meterId))
        .limit(1);

      if (!meter[0]) {
        throw new Error("العداد غير موجود");
      }

      // الحصول على إجمالي الفواتير
      const invoices = await db.select({
        totalAmount: sql<number>`COALESCE(SUM(${invoicesEnhanced.totalAmount}), 0)`,
        paidAmount: sql<number>`COALESCE(SUM(${invoicesEnhanced.paidAmount}), 0)`,
        balanceDue: sql<number>`COALESCE(SUM(${invoicesEnhanced.balanceDue}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
        .from(invoicesEnhanced)
        .where(eq(invoicesEnhanced.meterId, input.meterId));

      // الحصول على إجمالي المدفوعات
      const payments = await db.select({
        totalAmount: sql<number>`COALESCE(SUM(${paymentsEnhanced.amount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
        .from(paymentsEnhanced)
        .where(eq(paymentsEnhanced.meterId, input.meterId));

      return {
        meter: meter[0],
        balance: parseFloat(meter[0].balance || "0"),
        balanceDue: parseFloat(meter[0].balanceDue || "0"),
        invoicesTotal: parseFloat(invoices[0]?.totalAmount?.toString() || "0"),
        invoicesPaid: parseFloat(invoices[0]?.paidAmount?.toString() || "0"),
        invoicesDue: parseFloat(invoices[0]?.balanceDue?.toString() || "0"),
        invoicesCount: parseInt(invoices[0]?.count?.toString() || "0"),
        paymentsTotal: parseFloat(payments[0]?.totalAmount?.toString() || "0"),
        paymentsCount: parseInt(payments[0]?.count?.toString() || "0"),
      };
    }),

  /**
   * الحصول على سجل معاملات العداد (الفواتير والمدفوعات)
   */
  getMeterTransactions: publicProcedure
    .input(z.object({
      meterId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
      transactionType: z.enum(["invoice", "payment", "adjustment", "all"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;
      const transactions: any[] = [];

      // جلب الفواتير
      if (input.transactionType === "all" || input.transactionType === "invoice") {
        const invoices = await db.select({
          id: invoicesEnhanced.id,
          transactionType: sql<string>`'invoice'`,
          transactionNumber: invoicesEnhanced.invoiceNumber,
          date: invoicesEnhanced.invoiceDate,
          amount: invoicesEnhanced.totalAmount,
          balanceBefore: invoicesEnhanced.previousBalanceDue,
          balanceAfter: invoicesEnhanced.balanceDue,
          description: sql<string>`CONCAT('فاتورة رقم ', ${invoicesEnhanced.invoiceNumber})`,
          status: invoicesEnhanced.status,
          createdAt: invoicesEnhanced.createdAt,
        })
          .from(invoicesEnhanced)
          .where(eq(invoicesEnhanced.meterId, input.meterId))
          .orderBy(desc(invoicesEnhanced.createdAt))
          .limit(input.limit)
          .offset(offset);

        transactions.push(...invoices.map((inv: any) => ({
          ...inv,
          id: `invoice_${inv.id}`,
        })));
      }

      // جلب المدفوعات
      if (input.transactionType === "all" || input.transactionType === "payment") {
        const payments = await db.select({
          id: paymentsEnhanced.id,
          transactionType: sql<string>`'payment'`,
          transactionNumber: paymentsEnhanced.paymentNumber,
          date: paymentsEnhanced.paymentDate,
          amount: paymentsEnhanced.amount,
          balanceBefore: paymentsEnhanced.balanceDueBefore,
          balanceAfter: paymentsEnhanced.balanceDueAfter,
          description: sql<string>`CONCAT('دفعة رقم ', ${paymentsEnhanced.paymentNumber})`,
          status: paymentsEnhanced.status,
          createdAt: paymentsEnhanced.createdAt,
        })
          .from(paymentsEnhanced)
          .where(eq(paymentsEnhanced.meterId, input.meterId))
          .orderBy(desc(paymentsEnhanced.createdAt))
          .limit(input.limit)
          .offset(offset);

        transactions.push(...payments.map((pay: any) => ({
          ...pay,
          id: `payment_${pay.id}`,
        })));
      }

      // ترتيب حسب التاريخ
      transactions.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA;
      });

      // الحصول على العدد الإجمالي
      let totalCount = 0;
      if (input.transactionType === "all" || input.transactionType === "invoice") {
        const invoiceCount = await db.select({ count: sql<number>`COUNT(*)` })
          .from(invoicesEnhanced)
          .where(eq(invoicesEnhanced.meterId, input.meterId));
        totalCount += parseInt(invoiceCount[0]?.count?.toString() || "0");
      }
      if (input.transactionType === "all" || input.transactionType === "payment") {
        const paymentCount = await db.select({ count: sql<number>`COUNT(*)` })
          .from(paymentsEnhanced)
          .where(eq(paymentsEnhanced.meterId, input.meterId));
        totalCount += parseInt(paymentCount[0]?.count?.toString() || "0");
      }

      return {
        data: transactions.slice(0, input.limit),
        total: totalCount,
        page: input.page,
        limit: input.limit,
      };
    }),

  /**
   * تحديث رصيد العداد يدوياً (للتعديلات)
   */
  updateMeterBalance: publicProcedure
    .input(z.object({
      meterId: z.number(),
      amount: z.number(),
      operation: z.enum(["add", "subtract", "set"]),
      description: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // الحصول على العداد الحالي
      const meter = await db.select({ balance: metersEnhanced.balance })
        .from(metersEnhanced)
        .where(eq(metersEnhanced.id, input.meterId))
        .limit(1);

      if (!meter[0]) {
        throw new Error("العداد غير موجود");
      }

      const currentBalance = parseFloat(meter[0].balance || "0");
      let newBalance: number;

      switch (input.operation) {
        case "add":
          newBalance = currentBalance + input.amount;
          break;
        case "subtract":
          newBalance = currentBalance - input.amount;
          break;
        case "set":
          newBalance = input.amount;
          break;
      }

      // تحديث رصيد العداد
      await db.update(metersEnhanced)
        .set({ balance: newBalance.toString() })
        .where(eq(metersEnhanced.id, input.meterId));

      // تسجيل التعديل في جدول المعاملات (إذا كان موجوداً)
      // يمكن إضافة جدول `meter_transactions` أو استخدام `customerTransactionsNew` مع `referenceType: "meter"` و `referenceId: meterId`

      return { success: true, oldBalance: currentBalance, newBalance };
    }),

  // ============================================
  // الترحيل المالي/المحاسبي - Financial Transfers
  // ============================================

  /**
   * الحصول على قائمة الترحيبات المالية
   */
  getFinancialTransfers: publicProcedure
    .input(z.object({
      businessId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]).optional(),
      transferType: z.enum(["sales", "collections", "both"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;
      let whereClause = eq(financialTransfers.businessId, input.businessId);

      if (input.status) {
        whereClause = and(whereClause, eq(financialTransfers.status, input.status));
      }

      if (input.transferType) {
        whereClause = and(whereClause, eq(financialTransfers.transferType, input.transferType));
      }

      const transfers = await db.select()
        .from(financialTransfers)
        .where(whereClause)
        .orderBy(desc(financialTransfers.transferDate))
        .limit(input.limit)
        .offset(offset);

      const total = await db.select({ count: sql<number>`COUNT(*)` })
        .from(financialTransfers)
        .where(whereClause);

      return {
        data: transfers,
        total: total[0].count,
        page: input.page,
        limit: input.limit,
      };
    }),

  /**
   * الحصول على تفاصيل ترحيل مالي
   */
  getFinancialTransferDetails: publicProcedure
    .input(z.object({ transferId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const transfer = await db.select()
        .from(financialTransfers)
        .where(eq(financialTransfers.id, input.transferId))
        .limit(1);

      if (!transfer[0]) {
        throw new Error("الترحيل غير موجود");
      }

      const details = await db.select()
        .from(financialTransferDetails)
        .where(eq(financialTransferDetails.transferId, input.transferId));

      return {
        transfer: transfer[0],
        details,
      };
    }),

  /**
   * إنشاء ترحيل مالي جديد (للمبيعات أو التحصيلات)
   */
  createFinancialTransfer: publicProcedure
    .input(z.object({
      businessId: z.number(),
      transferType: z.enum(["sales", "collections", "both"]),
      transferDate: z.string(), // ISO date string
      periodStartDate: z.string().optional(),
      periodEndDate: z.string().optional(),
      salesAccountId: z.number().optional(),
      collectionsAccountId: z.number().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // إنشاء رقم ترحيل
      const transferNumber = `TRF-${Date.now()}`;

      // حساب إجمالي المبيعات (الفواتير)
      let salesTotal = 0;
      let salesCount = 0;
      if (input.transferType === "sales" || input.transferType === "both") {
        let salesWhereClause = eq(invoicesEnhanced.businessId, input.businessId);
        
        if (input.periodStartDate && input.periodEndDate) {
          salesWhereClause = and(
            salesWhereClause,
            gte(invoicesEnhanced.invoiceDate, input.periodStartDate),
            lte(invoicesEnhanced.invoiceDate, input.periodEndDate)
          );
        }

        const salesResult = await db.select({
          total: sql<number>`COALESCE(SUM(${invoicesEnhanced.totalAmount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
          .from(invoicesEnhanced)
          .where(salesWhereClause);

        salesTotal = parseFloat(salesResult[0]?.total?.toString() || "0");
        salesCount = parseInt(salesResult[0]?.count?.toString() || "0");
      }

      // حساب إجمالي التحصيلات (المدفوعات)
      let collectionsTotal = 0;
      let collectionsCount = 0;
      if (input.transferType === "collections" || input.transferType === "both") {
        let collectionsWhereClause = eq(paymentsEnhanced.businessId, input.businessId);
        
        if (input.periodStartDate && input.periodEndDate) {
          collectionsWhereClause = and(
            collectionsWhereClause,
            gte(paymentsEnhanced.paymentDate, input.periodStartDate),
            lte(paymentsEnhanced.paymentDate, input.periodEndDate)
          );
        } else {
          // إذا لم تحدد فترة، استخدم تاريخ اليوم فقط (للترحيل اليومي)
          const today = new Date().toISOString().split('T')[0];
          collectionsWhereClause = and(
            collectionsWhereClause,
            eq(paymentsEnhanced.paymentDate, today)
          );
        }

        const collectionsResult = await db.select({
          total: sql<number>`COALESCE(SUM(${paymentsEnhanced.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
          .from(paymentsEnhanced)
          .where(collectionsWhereClause);

        collectionsTotal = parseFloat(collectionsResult[0]?.total?.toString() || "0");
        collectionsCount = parseInt(collectionsResult[0]?.count?.toString() || "0");
      }

      // إنشاء الترحيل
      const [transfer] = await db.insert(financialTransfers).values({
        businessId: input.businessId,
        transferNumber,
        transferType: input.transferType,
        transferDate: input.transferDate,
        periodStartDate: input.periodStartDate || null,
        periodEndDate: input.periodEndDate || null,
        salesTotalAmount: salesTotal.toString(),
        salesCount,
        salesAccountId: input.salesAccountId || null,
        collectionsTotalAmount: collectionsTotal.toString(),
        collectionsCount,
        collectionsAccountId: input.collectionsAccountId || null,
        status: "pending",
        notes: input.notes || null,
      });

      // حفظ تفاصيل الفواتير المرحلة
      if ((input.transferType === "sales" || input.transferType === "both") && salesCount > 0) {
        let salesWhereClause = eq(invoicesEnhanced.businessId, input.businessId);
        if (input.periodStartDate && input.periodEndDate) {
          salesWhereClause = and(
            salesWhereClause,
            gte(invoicesEnhanced.invoiceDate, input.periodStartDate),
            lte(invoicesEnhanced.invoiceDate, input.periodEndDate)
          );
        }

        const invoices = await db.select({ id: invoicesEnhanced.id, totalAmount: invoicesEnhanced.totalAmount })
          .from(invoicesEnhanced)
          .where(salesWhereClause);

        for (const invoice of invoices) {
          await db.insert(financialTransferDetails).values({
            transferId: transfer.insertId,
            referenceType: "invoice",
            referenceId: invoice.id,
            amount: invoice.totalAmount || "0",
          });
        }
      }

      // حفظ تفاصيل المدفوعات المرحلة
      if ((input.transferType === "collections" || input.transferType === "both") && collectionsCount > 0) {
        let collectionsWhereClause = eq(paymentsEnhanced.businessId, input.businessId);
        if (input.periodStartDate && input.periodEndDate) {
          collectionsWhereClause = and(
            collectionsWhereClause,
            gte(paymentsEnhanced.paymentDate, input.periodStartDate),
            lte(paymentsEnhanced.paymentDate, input.periodEndDate)
          );
        } else {
          const today = new Date().toISOString().split('T')[0];
          collectionsWhereClause = and(
            collectionsWhereClause,
            eq(paymentsEnhanced.paymentDate, today)
          );
        }

        const payments = await db.select({ id: paymentsEnhanced.id, amount: paymentsEnhanced.amount })
          .from(paymentsEnhanced)
          .where(collectionsWhereClause);

        for (const payment of payments) {
          await db.insert(financialTransferDetails).values({
            transferId: transfer.insertId,
            referenceType: "payment",
            referenceId: payment.id,
            amount: payment.amount || "0",
          });
        }
      }

      return { success: true, id: transfer.insertId, transferNumber };
    }),

  /**
   * تأكيد الترحيل (نقله إلى النظام المالي)
   */
  confirmFinancialTransfer: publicProcedure
    .input(z.object({
      transferId: z.number(),
      journalEntryId: z.number().optional(), // رقم القيد المحاسبي في النظام المالي
      transferredBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(financialTransfers)
        .set({
          status: "completed",
          journalEntryId: input.journalEntryId || null,
          transferredBy: input.transferredBy || null,
          transferredAt: new Date(),
        })
        .where(eq(financialTransfers.id, input.transferId));

      return { success: true };
    }),

  /**
   * إلغاء الترحيل
   */
  cancelFinancialTransfer: publicProcedure
    .input(z.object({ transferId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(financialTransfers)
        .set({ status: "cancelled" })
        .where(eq(financialTransfers.id, input.transferId));

      return { success: true };
    }),

  /**
   * تحديث حالة الترحيل المالي
   */
  updateTransferStatus: publicProcedure
    .input(z.object({
      transferId: z.number(),
      status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]),
      errorMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(financialTransfers)
        .set({
          status: input.status,
          errorMessage: input.errorMessage || null,
          updatedAt: new Date(),
        })
        .where(eq(financialTransfers.id, input.transferId));

      return { success: true };
    }),

  /**
   * ترحيل المبيعات (الفواتير) - wrapper مريح
   */
  transferSales: publicProcedure
    .input(z.object({
      businessId: z.number(),
      transferDate: z.string(),
      periodStartDate: z.string().optional(),
      periodEndDate: z.string().optional(),
      salesAccountId: z.number().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // استخدام createFinancialTransfer مع transferType = "sales"
      const transferNumber = `TRF-SALES-${Date.now()}`;

      let salesWhereClause = eq(invoicesEnhanced.businessId, input.businessId);
      
      if (input.periodStartDate && input.periodEndDate) {
        salesWhereClause = and(
          salesWhereClause,
          gte(invoicesEnhanced.invoiceDate, input.periodStartDate),
          lte(invoicesEnhanced.invoiceDate, input.periodEndDate)
        );
      }

      const salesResult = await db.select({
        total: sql<number>`COALESCE(SUM(${invoicesEnhanced.totalAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
        .from(invoicesEnhanced)
        .where(salesWhereClause);

      const salesTotal = parseFloat(salesResult[0]?.total?.toString() || "0");
      const salesCount = parseInt(salesResult[0]?.count?.toString() || "0");

      const [transfer] = await db.insert(financialTransfers).values({
        businessId: input.businessId,
        transferNumber,
        transferType: "sales",
        transferDate: input.transferDate,
        periodStartDate: input.periodStartDate || null,
        periodEndDate: input.periodEndDate || null,
        salesTotalAmount: salesTotal.toString(),
        salesCount,
        salesAccountId: input.salesAccountId || null,
        collectionsTotalAmount: "0",
        collectionsCount: 0,
        status: "pending",
        notes: input.notes || null,
      });

      if (salesCount > 0) {
        const invoices = await db.select({ id: invoicesEnhanced.id, totalAmount: invoicesEnhanced.totalAmount })
          .from(invoicesEnhanced)
          .where(salesWhereClause);

        for (const invoice of invoices) {
          await db.insert(financialTransferDetails).values({
            transferId: transfer.insertId,
            referenceType: "invoice",
            referenceId: invoice.id,
            amount: invoice.totalAmount || "0",
          });
        }
      }

      return { success: true, id: transfer.insertId, transferNumber, salesTotal, salesCount };
    }),

  /**
   * ترحيل التحصيلات (المدفوعات) - wrapper مريح
   */
  transferCollections: publicProcedure
    .input(z.object({
      businessId: z.number(),
      transferDate: z.string(),
      periodStartDate: z.string().optional(),
      periodEndDate: z.string().optional(),
      collectionsAccountId: z.number().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const transferNumber = `TRF-COLL-${Date.now()}`;

      let collectionsWhereClause = eq(paymentsEnhanced.businessId, input.businessId);
      
      if (input.periodStartDate && input.periodEndDate) {
        collectionsWhereClause = and(
          collectionsWhereClause,
          gte(paymentsEnhanced.paymentDate, input.periodStartDate),
          lte(paymentsEnhanced.paymentDate, input.periodEndDate)
        );
      } else {
        // إذا لم تحدد فترة، استخدم تاريخ اليوم فقط (للترحيل اليومي)
        const today = new Date().toISOString().split('T')[0];
        collectionsWhereClause = and(
          collectionsWhereClause,
          eq(paymentsEnhanced.paymentDate, today)
        );
      }

      const collectionsResult = await db.select({
        total: sql<number>`COALESCE(SUM(${paymentsEnhanced.amount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
        .from(paymentsEnhanced)
        .where(collectionsWhereClause);

      const collectionsTotal = parseFloat(collectionsResult[0]?.total?.toString() || "0");
      const collectionsCount = parseInt(collectionsResult[0]?.count?.toString() || "0");

      const [transfer] = await db.insert(financialTransfers).values({
        businessId: input.businessId,
        transferNumber,
        transferType: "collections",
        transferDate: input.transferDate,
        periodStartDate: input.periodStartDate || null,
        periodEndDate: input.periodEndDate || null,
        salesTotalAmount: "0",
        salesCount: 0,
        collectionsTotalAmount: collectionsTotal.toString(),
        collectionsCount,
        collectionsAccountId: input.collectionsAccountId || null,
        status: "pending",
        notes: input.notes || null,
      });

      if (collectionsCount > 0) {
        const payments = await db.select({ id: paymentsEnhanced.id, amount: paymentsEnhanced.amount })
          .from(paymentsEnhanced)
          .where(collectionsWhereClause);

        for (const payment of payments) {
          await db.insert(financialTransferDetails).values({
            transferId: transfer.insertId,
            referenceType: "payment",
            referenceId: payment.id,
            amount: payment.amount || "0",
          });
        }
      }

      return { success: true, id: transfer.insertId, transferNumber, collectionsTotal, collectionsCount };
    }),

  // ============================================
  // طلبات الاشتراك - Subscription Requests
  // ============================================

  /**
   * الحصول على قائمة طلبات الاشتراك
   */
  getSubscriptionRequests: publicProcedure
    .input(z.object({
      businessId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["pending", "registered", "material_specified", "material_issued", "installation_assigned", "completed", "cancelled"]).optional(),
      stationId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;
      let whereClause = eq(subscriptionRequests.businessId, input.businessId);

      if (input.status) {
        whereClause = and(whereClause, eq(subscriptionRequests.status, input.status));
      }

      if (input.stationId) {
        whereClause = and(whereClause, eq(subscriptionRequests.stationId, input.stationId));
      }

      const requests = await db.select()
        .from(subscriptionRequests)
        .where(whereClause)
        .orderBy(desc(subscriptionRequests.requestDate))
        .limit(input.limit)
        .offset(offset);

      const total = await db.select({ count: sql<number>`COUNT(*)` })
        .from(subscriptionRequests)
        .where(whereClause);

      return {
        data: requests,
        total: total[0].count,
        page: input.page,
        limit: input.limit,
      };
    }),

  /**
   * إنشاء طلب اشتراك جديد
   */
  createSubscriptionRequest: publicProcedure
    .input(z.object({
      businessId: z.number(),
      stationId: z.number(),
      customerName: z.string().optional(),
      customerMobile: z.string().optional(),
      customerAddress: z.string().optional(),
      serviceType: z.enum(["electricity", "water", "gas"]).default("electricity"),
      meterCategory: z.enum(["offline", "sts", "iot", "any"]).default("offline"),
      requestDate: z.string(), // ISO date string
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const requestNumber = `SUB-${Date.now()}`;

      const [request] = await db.insert(subscriptionRequests).values({
        businessId: input.businessId,
        requestNumber,
        stationId: input.stationId,
        customerName: input.customerName || null,
        customerMobile: input.customerMobile || null,
        customerAddress: input.customerAddress || null,
        serviceType: input.serviceType,
        meterCategory: input.meterCategory,
        requestDate: input.requestDate,
        status: "pending",
        notes: input.notes || null,
      });

      return { success: true, id: request.insertId, requestNumber };
    }),

  /**
   * تسجيل بيانات العميل (من قبل المدير)
   */
  registerSubscriptionRequest: publicProcedure
    .input(z.object({
      requestId: z.number(),
      customerId: z.number(), // العميل الذي تم إنشاؤه
      registeredBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(subscriptionRequests)
        .set({
          status: "registered",
          registeredBy: input.registeredBy,
          registeredAt: new Date(),
        })
        .where(eq(subscriptionRequests.id, input.requestId));

      return { success: true };
    }),

  // ============================================
  // تحديد المواد - Material Specifications
  // ============================================

  /**
   * الحصول على تحديدات المواد
   */
  getMaterialSpecifications: publicProcedure
    .input(z.object({
      subscriptionRequestId: z.number().optional(),
      operationId: z.number().optional(),
      status: z.enum(["draft", "approved", "issued"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let whereClause: any = true;

      if (input.subscriptionRequestId) {
        whereClause = and(whereClause, eq(materialSpecifications.subscriptionRequestId, input.subscriptionRequestId));
      }

      if (input.operationId) {
        whereClause = and(whereClause, eq(materialSpecifications.operationId, input.operationId));
      }

      if (input.status) {
        whereClause = and(whereClause, eq(materialSpecifications.status, input.status));
      }

      const specifications = await db.select()
        .from(materialSpecifications)
        .where(whereClause)
        .orderBy(desc(materialSpecifications.specificationDate));

      // جلب البنود لكل تحديد
      const specificationsWithItems = await Promise.all(
        specifications.map(async (spec) => {
          const items = await db.select()
            .from(materialSpecificationItems)
            .where(eq(materialSpecificationItems.specificationId, spec.id));

          return { ...spec, items };
        })
      );

      return specificationsWithItems;
    }),

  /**
   * إنشاء تحديد مواد جديد
   */
  createMaterialSpecification: publicProcedure
    .input(z.object({
      subscriptionRequestId: z.number(),
      operationId: z.number().optional(),
      specifiedBy: z.number(),
      specificationDate: z.string(), // ISO date string
      items: z.array(z.object({
        itemId: z.number(),
        requestedQty: z.string(),
        unit: z.string().optional(),
        notes: z.string().optional(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [specification] = await db.insert(materialSpecifications).values({
        subscriptionRequestId: input.subscriptionRequestId,
        operationId: input.operationId || null,
        specifiedBy: input.specifiedBy,
        specificationDate: input.specificationDate,
        status: "draft",
        notes: input.notes || null,
      });

      // إضافة البنود
      for (const item of input.items) {
        await db.insert(materialSpecificationItems).values({
          specificationId: specification.insertId,
          itemId: item.itemId,
          requestedQty: item.requestedQty,
          unit: item.unit || null,
          notes: item.notes || null,
        });
      }

      // تحديث حالة طلب الاشتراك
      await db.update(subscriptionRequests)
        .set({
          status: "material_specified",
          materialSpecifiedBy: input.specifiedBy,
          materialSpecifiedAt: new Date(),
        })
        .where(eq(subscriptionRequests.id, input.subscriptionRequestId));

      return { success: true, id: specification.insertId };
    }),

  // ============================================
  // ربط العداد بالمخزن - Meter Inventory Items
  // ============================================

  /**
   * الحصول على أصناف العداد من المخزن
   */
  getMeterInventoryItems: publicProcedure
    .input(z.object({ meterId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const items = await db.select()
        .from(meterInventoryItems)
        .where(eq(meterInventoryItems.meterId, input.meterId))
        .orderBy(desc(meterInventoryItems.installationDate));

      return items;
    }),

  /**
   * ربط صنف من المخزن بالعداد
   */
  linkInventoryItemToMeter: publicProcedure
    .input(z.object({
      meterId: z.number(),
      itemId: z.number(),
      itemType: z.enum(["meter", "ct", "cable", "seal", "breaker", "other"]),
      quantity: z.string().default("1"),
      unitCost: z.string().optional(),
      installationDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const totalCost = input.unitCost && input.quantity 
        ? (parseFloat(input.unitCost) * parseFloat(input.quantity)).toString()
        : null;

      const [item] = await db.insert(meterInventoryItems).values({
        meterId: input.meterId,
        itemId: input.itemId,
        itemType: input.itemType,
        quantity: input.quantity,
        unitCost: input.unitCost || null,
        totalCost: totalCost || null,
        installationDate: input.installationDate || null,
        status: "installed",
        notes: input.notes || null,
      });

      return { success: true, id: item.insertId };
    }),

  // ============================================
  // الختومات - Meter Seals
  // ============================================

  /**
   * الحصول على ختومات العداد
   */
  getMeterSeals: publicProcedure
    .input(z.object({ meterId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const seals = await db.select()
        .from(meterSeals)
        .where(eq(meterSeals.meterId, input.meterId))
        .orderBy(desc(meterSeals.installationDate));

      return seals;
    }),

  /**
   * إضافة ختم للعداد
   */
  addMeterSeal: publicProcedure
    .input(z.object({
      meterId: z.number(),
      sealName: z.string().optional(),
      sealColor: z.string().optional(),
      sealNumber: z.string(),
      sealType: z.string().optional(),
      installationDate: z.string().optional(),
      installedBy: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [seal] = await db.insert(meterSeals).values({
        meterId: input.meterId,
        sealName: input.sealName || null,
        sealColor: input.sealColor || null,
        sealNumber: input.sealNumber,
        sealType: input.sealType || null,
        installationDate: input.installationDate || null,
        installedBy: input.installedBy || null,
        status: "installed",
        notes: input.notes || null,
      });

      return { success: true, id: seal.insertId };
    }),

  // ============================================
  // القواطع - Meter Breakers
  // ============================================

  /**
   * الحصول على قواطع العداد
   */
  getMeterBreakers: publicProcedure
    .input(z.object({ meterId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const breakers = await db.select()
        .from(meterBreakers)
        .where(eq(meterBreakers.meterId, input.meterId))
        .orderBy(desc(meterBreakers.installationDate));

      return breakers;
    }),

  /**
   * إضافة قاطع للعداد
   */
  addMeterBreaker: publicProcedure
    .input(z.object({
      meterId: z.number(),
      breakerType: z.string().optional(),
      breakerCapacity: z.string().optional(),
      breakerBrand: z.string().optional(),
      breakerModel: z.string().optional(),
      serialNumber: z.string().optional(),
      installationDate: z.string().optional(),
      installedBy: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [breaker] = await db.insert(meterBreakers).values({
        meterId: input.meterId,
        breakerType: input.breakerType || null,
        breakerCapacity: input.breakerCapacity || null,
        breakerBrand: input.breakerBrand || null,
        breakerModel: input.breakerModel || null,
        serialNumber: input.serialNumber || null,
        installationDate: input.installationDate || null,
        installedBy: input.installedBy || null,
        status: "installed",
        notes: input.notes || null,
      });

      return { success: true, id: breaker.insertId };
    }),

  // ============================================
  // الشكاوى - Complaints
  // ============================================

  /**
   * الحصول على قائمة الشكاوى
   */
  getComplaints: publicProcedure
    .input(z.object({
      businessId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["new", "in_progress", "resolved", "closed", "cancelled"]).optional(),
      complaintType: z.enum(["billing", "reading", "meter_issue", "service_quality", "payment", "disconnection", "connection", "other"]).optional(),
      customerId: z.number().optional(),
      meterId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;
      let whereClause = eq(complaints.businessId, input.businessId);

      if (input.status) {
        whereClause = and(whereClause, eq(complaints.status, input.status));
      }

      if (input.complaintType) {
        whereClause = and(whereClause, eq(complaints.complaintType, input.complaintType));
      }

      if (input.customerId) {
        whereClause = and(whereClause, eq(complaints.customerId, input.customerId));
      }

      if (input.meterId) {
        whereClause = and(whereClause, eq(complaints.meterId, input.meterId));
      }

      const complaintsList = await db.select()
        .from(complaints)
        .where(whereClause)
        .orderBy(desc(complaints.createdAt))
        .limit(input.limit)
        .offset(offset);

      const total = await db.select({ count: sql<number>`COUNT(*)` })
        .from(complaints)
        .where(whereClause);

      return {
        data: complaintsList,
        total: total[0].count,
        page: input.page,
        limit: input.limit,
      };
    }),

  /**
   * إنشاء شكوى جديدة
   */
  createComplaint: publicProcedure
    .input(z.object({
      businessId: z.number(),
      customerId: z.number().optional(),
      meterId: z.number().optional(),
      complaintType: z.enum(["billing", "reading", "meter_issue", "service_quality", "payment", "disconnection", "connection", "other"]),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      subject: z.string(),
      description: z.string(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const complaintNumber = `COMP-${Date.now()}`;

      const [complaint] = await db.insert(complaints).values({
        businessId: input.businessId,
        complaintNumber,
        customerId: input.customerId || null,
        meterId: input.meterId || null,
        complaintType: input.complaintType,
        priority: input.priority,
        subject: input.subject,
        description: input.description,
        status: "new",
        createdBy: input.createdBy || null,
      });

      return { success: true, id: complaint.insertId, complaintNumber };
    }),

  /**
   * تحديث حالة الشكوى
   */
  updateComplaintStatus: publicProcedure
    .input(z.object({
      complaintId: z.number(),
      status: z.enum(["new", "in_progress", "resolved", "closed", "cancelled"]),
      resolution: z.string().optional(),
      resolvedBy: z.number().optional(),
      assignedTo: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {
        status: input.status,
        assignedTo: input.assignedTo || undefined,
      };

      if (input.status === "resolved" || input.status === "closed") {
        updateData.resolution = input.resolution || null;
        updateData.resolvedBy = input.resolvedBy || null;
        updateData.resolvedAt = new Date();
      }

      await db.update(complaints)
        .set(updateData)
        .where(eq(complaints.id, input.complaintId));

      return { success: true };
    }),

  // ============================================
  // إصدار المواد - Material Issuances
  // ============================================
  
  /**
   * الحصول على قائمة إصدارات المواد
   */
  getMaterialIssuances: publicProcedure
    .input(z.object({
      businessId: z.number(),
      warehouseId: z.number().optional(),
      subscriptionRequestId: z.number().optional(),
      operationId: z.number().optional(),
      status: z.enum(["pending", "issued", "returned", "cancelled"]).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;
      let whereClause = eq(materialIssuances.businessId, input.businessId);

      if (input.warehouseId) {
        whereClause = and(whereClause, eq(materialIssuances.warehouseId, input.warehouseId));
      }

      if (input.subscriptionRequestId) {
        whereClause = and(whereClause, eq(materialIssuances.subscriptionRequestId, input.subscriptionRequestId));
      }

      if (input.operationId) {
        whereClause = and(whereClause, eq(materialIssuances.operationId, input.operationId));
      }

      if (input.status) {
        whereClause = and(whereClause, eq(materialIssuances.status, input.status));
      }

      const issuancesList = await db.select()
        .from(materialIssuances)
        .where(whereClause)
        .orderBy(desc(materialIssuances.issuanceDate))
        .limit(input.limit)
        .offset(offset);

      // Get items for each issuance
      const issuancesWithItems = await Promise.all(
        issuancesList.map(async (issuance) => {
          const items = await db.select()
            .from(materialIssuanceItems)
            .where(eq(materialIssuanceItems.issuanceId, issuance.id));
          return { ...issuance, items };
        })
      );

      const total = await db.select({ count: sql`count(*)` })
        .from(materialIssuances)
        .where(whereClause);

      return {
        data: issuancesWithItems,
        total: total[0].count,
        page: input.page,
        limit: input.limit,
      };
    }),

  /**
   * إنشاء إصدار مواد جديد
   */
  createMaterialIssuance: publicProcedure
    .input(z.object({
      businessId: z.number(),
      warehouseId: z.number(),
      subscriptionRequestId: z.number().optional(),
      materialRequestId: z.number().optional(),
      specificationId: z.number().optional(),
      operationId: z.number().optional(),
      issuedBy: z.number(),
      issuanceDate: z.string(),
      items: z.array(z.object({
        itemId: z.number(),
        quantity: z.number(),
        unitCost: z.number().optional(),
        notes: z.string().optional(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const issuanceNumber = `ISS-${Date.now()}`;

      const [issuance] = await db.insert(materialIssuances).values({
        businessId: input.businessId,
        issuanceNumber,
        subscriptionRequestId: input.subscriptionRequestId || null,
        materialRequestId: input.materialRequestId || null,
        specificationId: input.specificationId || null,
        operationId: input.operationId || null,
        warehouseId: input.warehouseId,
        issuedBy: input.issuedBy,
        issuanceDate: input.issuanceDate,
        status: "issued",
        notes: input.notes || null,
      }).returning({ id: materialIssuances.id });

      // Insert items
      for (const item of input.items) {
        const totalCost = item.unitCost ? item.quantity * item.unitCost : null;
        await db.insert(materialIssuanceItems).values({
          issuanceId: issuance.id,
          itemId: item.itemId,
          quantity: item.quantity.toString(),
          unitCost: item.unitCost?.toString() || null,
          totalCost: totalCost?.toString() || null,
          notes: item.notes || null,
        });
      }

      // Update subscription request if linked
      if (input.subscriptionRequestId) {
        await db.update(subscriptionRequests)
          .set({
            status: "material_issued",
            materialIssuedAt: new Date(),
          })
          .where(eq(subscriptionRequests.id, input.subscriptionRequestId));
      }

      return { success: true, id: issuance.id, issuanceNumber };
    }),

  /**
   * تحديث حالة إصدار المواد
   */
  updateMaterialIssuanceStatus: publicProcedure
    .input(z.object({
      issuanceId: z.number(),
      status: z.enum(["pending", "issued", "returned", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(materialIssuances)
        .set({ status: input.status })
        .where(eq(materialIssuances.id, input.issuanceId));

      return { success: true };
    }),

  // ============================================
  // الإيصالات - Receipts
  // ============================================

  getReceipts: publicProcedure
    .input(z.object({
      businessId: z.number(),
      paymentId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;
      let whereClause = eq(receipts.businessId, input.businessId);

      if (input.paymentId) {
        whereClause = and(whereClause, eq(receipts.paymentId, input.paymentId));
      }

      const receiptsList = await db.select()
        .from(receipts)
        .where(whereClause)
        .orderBy(desc(receipts.issueDate))
        .limit(input.limit)
        .offset(offset);

      const total = await db.select({ count: sql`count(*)` })
        .from(receipts)
        .where(whereClause);

      return { data: receiptsList, total: total[0].count, page: input.page, limit: input.limit };
    }),

  generateReceipt: publicProcedure
    .input(z.object({
      businessId: z.number(),
      paymentId: z.number(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const receiptNumber = `REC-${Date.now()}`;
      const [receipt] = await db.insert(receipts).values({
        businessId: input.businessId,
        paymentId: input.paymentId,
        receiptNumber,
        issueDate: new Date().toISOString().split('T')[0],
        description: input.description || null,
      }).returning({ id: receipts.id });

      return { success: true, id: receipt.id, receiptNumber };
    }),

  // ============================================
  // أكواد الشحن المسبق - Prepaid Codes
  // ============================================

  getPrepaidCodes: publicProcedure
    .input(z.object({
      businessId: z.number(),
      status: z.enum(["active", "used", "expired", "cancelled"]).optional(),
      meterId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;
      let whereClause = eq(prepaidCodes.businessId, input.businessId);

      if (input.status) {
        whereClause = and(whereClause, eq(prepaidCodes.status, input.status));
      }

      if (input.meterId) {
        whereClause = and(whereClause, eq(prepaidCodes.meterId, input.meterId));
      }

      const codes = await db.select()
        .from(prepaidCodes)
        .where(whereClause)
        .orderBy(desc(prepaidCodes.createdAt))
        .limit(input.limit)
        .offset(offset);

      const total = await db.select({ count: sql`count(*)` })
        .from(prepaidCodes)
        .where(whereClause);

      return { data: codes, total: total[0].count, page: input.page, limit: input.limit };
    }),

  generatePrepaidCodes: publicProcedure
    .input(z.object({
      businessId: z.number(),
      amount: z.number().positive(),
      count: z.number().min(1).max(1000),
      expiryDays: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const codes: string[] = [];
      const expiresAt = input.expiryDays 
        ? new Date(Date.now() + input.expiryDays * 24 * 60 * 60 * 1000) 
        : null;

      for (let i = 0; i < input.count; i++) {
        const code = `PREP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.push(code);
        
        await db.insert(prepaidCodes).values({
          businessId: input.businessId,
          code,
          amount: input.amount.toString(),
          status: "active",
          expiresAt,
        });
      }

      return { success: true, count: codes.length, codes };
    }),

  usePrepaidCode: publicProcedure
    .input(z.object({
      code: z.string(),
      meterId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [code] = await db.select()
        .from(prepaidCodes)
        .where(eq(prepaidCodes.code, input.code))
        .limit(1);

      if (!code) throw new Error("الكود غير موجود");
      if (code.status !== "active") throw new Error("الكود غير صالح للاستخدام");
      if (code.expiresAt && new Date(code.expiresAt) < new Date()) throw new Error("الكود منتهي الصلاحية");

      await db.update(prepaidCodes)
        .set({ status: "used", meterId: input.meterId, usedAt: new Date() })
        .where(eq(prepaidCodes.id, code.id));

      await db.update(metersEnhanced)
        .set({ balance: sql`${metersEnhanced.balance} + ${parseFloat(code.amount)}` })
        .where(eq(metersEnhanced.id, input.meterId));

      return { success: true, amount: parseFloat(code.amount) };
    }),

  cancelPrepaidCode: publicProcedure
    .input(z.object({ codeId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(prepaidCodes)
        .set({ status: "cancelled" })
        .where(eq(prepaidCodes.id, input.codeId));

      return { success: true };
    }),

  // ============================================
  // تحديث حالة العملاء - Customer Status Management
  // ============================================

  /**
   * تحديث حالة عميل واحد
   */
  updateCustomerStatus: publicProcedure
    .input(z.object({
      customerId: z.number(),
      suspendThreshold: z.number().optional(),
      disconnectThreshold: z.number().optional(),
      sendNotification: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { customerStatusService } = await import("../services/customer-status-service");
      
      const result = await customerStatusService.updateCustomerStatus(input.customerId, {
        suspendThreshold: input.suspendThreshold,
        disconnectThreshold: input.disconnectThreshold,
        sendNotification: input.sendNotification !== false,
      });

      return result;
    }),

  /**
   * تحديث حالة جميع العملاء
   */
  updateAllCustomersStatus: publicProcedure
    .input(z.object({
      businessId: z.number(),
      suspendThreshold: z.number().optional(),
      disconnectThreshold: z.number().optional(),
      sendNotification: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { customerStatusService } = await import("../services/customer-status-service");
      
      const result = await customerStatusService.updateAllCustomersStatus(input.businessId, {
        suspendThreshold: input.suspendThreshold,
        disconnectThreshold: input.disconnectThreshold,
        sendNotification: input.sendNotification !== false,
      });

      return result;
    }),

  /**
   * الحصول على تاريخ تغييرات حالة العميل
   */
  getCustomerStatusHistory: publicProcedure
    .input(z.object({
      customerId: z.number(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // ✅ جلب تاريخ تغييرات الحالة من جدول customer_status_history
        const result = await db.execute(sql`
          SELECT 
            id, customer_id, old_status, new_status, balance_due, 
            changed_at, changed_by
          FROM customer_status_history
          WHERE customer_id = ${input.customerId}
          ORDER BY changed_at DESC
          LIMIT ${input.limit || 50}
        `);

        return {
          data: result.rows || [],
          total: (result.rows || []).length,
        };
      } catch (error: any) {
        // إذا لم يكن الجدول موجوداً، نرجع مصفوفة فارغة
        return {
          data: [],
          total: 0,
        };
      }
    }),

  /**
   * الحصول على تفاصيل حالة العميل (مع الديون)
   */
  getCustomerStatus: publicProcedure
    .input(z.object({
      customerId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // جلب بيانات العميل
      const [customer] = await db
        .select()
        .from(customersEnhanced)
        .where(eq(customersEnhanced.id, input.customerId))
        .limit(1);

      if (!customer) {
        throw new Error("العميل غير موجود");
      }

      // حساب إجمالي الديون
      const balanceDueResult = await db.execute(sql`
        SELECT 
          COALESCE(SUM(i.total_amount::numeric), 0)::numeric as total_invoices,
          COALESCE(SUM(p.amount::numeric), 0)::numeric as total_payments
        FROM invoices_enhanced i
        LEFT JOIN payments_enhanced p ON p.invoice_id = i.id
        WHERE i.customer_id = ${input.customerId}
          AND i.status != 'paid'
      `);

      const row = balanceDueResult.rows?.[0] || {};
      const totalInvoices = parseFloat(row.total_invoices || "0");
      const totalPayments = parseFloat(row.total_payments || "0");
      const balanceDue = Math.max(0, totalInvoices - totalPayments);

      return {
        customerId: customer.id,
        status: customer.status || "active",
        balanceDue,
        totalInvoices,
        totalPayments,
        updatedAt: customer.updatedAt,
      };
    }),
});


