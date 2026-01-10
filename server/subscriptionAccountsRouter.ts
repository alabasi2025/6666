/**
 * @fileoverview Router لحسابات المشترك (Subscription Accounts)
 * @module subscriptionAccountsRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بحسابات المشترك
 * بما في ذلك إنشاء حسابات المشترك، ربط العدادات، وإدارة الحسابات حسب النوع
 * (STS, IoT, Regular, Government Support)
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires drizzle-orm - للتعامل مع قاعدة البيانات
 * @requires ./_core/trpc - لإنشاء الـ API endpoints
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2026-01-10
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure, createPermissionProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { 
  subscriptionAccounts,
  customersEnhanced,
  metersEnhanced,
  invoicesEnhanced,
  paymentsEnhanced,
  customerWallets,
  tariffs
} from "../drizzle/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { logger } from "./utils/logger";

/**
 * Router لحسابات المشترك
 */
export const subscriptionAccountsRouter = router({
  
  /**
   * الحصول على جميع حسابات المشترك لعميل محدد
   */
  getByCustomer: publicProcedure
    .input(z.object({
      customerId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const accounts = await db.select({
        id: subscriptionAccounts.id,
        accountNumber: subscriptionAccounts.accountNumber,
        accountType: subscriptionAccounts.accountType,
        accountName: subscriptionAccounts.accountName,
        serviceType: subscriptionAccounts.serviceType,
        balance: subscriptionAccounts.balance,
        balanceDue: subscriptionAccounts.balanceDue,
        status: subscriptionAccounts.status,
        activationDate: subscriptionAccounts.activationDate,
        // إحصائيات
        metersCount: sql<number>`(
          SELECT COUNT(*)::INTEGER 
          FROM meters_enhanced 
          WHERE subscription_account_id = ${subscriptionAccounts.id}
        )`,
        invoicesCount: sql<number>`(
          SELECT COUNT(*)::INTEGER 
          FROM invoices_enhanced 
          WHERE subscription_account_id = ${subscriptionAccounts.id}
        )`,
        unpaidInvoicesCount: sql<number>`(
          SELECT COUNT(*)::INTEGER 
          FROM invoices_enhanced 
          WHERE subscription_account_id = ${subscriptionAccounts.id}
          AND status != 'paid'
        )`,
      })
      .from(subscriptionAccounts)
      .where(eq(subscriptionAccounts.customerId, input.customerId))
      .orderBy(desc(subscriptionAccounts.createdAt));
      
      return accounts;
    }),
  
  /**
   * الحصول على حساب مشترك محدد
   */
  get: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [account] = await db.select({
        id: subscriptionAccounts.id,
        businessId: subscriptionAccounts.businessId,
        customerId: subscriptionAccounts.customerId,
        accountNumber: subscriptionAccounts.accountNumber,
        accountType: subscriptionAccounts.accountType,
        accountName: subscriptionAccounts.accountName,
        tariffId: subscriptionAccounts.tariffId,
        serviceType: subscriptionAccounts.serviceType,
        balance: subscriptionAccounts.balance,
        balanceDue: subscriptionAccounts.balanceDue,
        creditLimit: subscriptionAccounts.creditLimit,
        depositAmount: subscriptionAccounts.depositAmount,
        paymentMode: subscriptionAccounts.paymentMode,
        billingCycle: subscriptionAccounts.billingCycle,
        status: subscriptionAccounts.status,
        supportType: subscriptionAccounts.supportType,
        supportPercentage: subscriptionAccounts.supportPercentage,
        maxSupportAmount: subscriptionAccounts.maxSupportAmount,
        monthlyQuota: subscriptionAccounts.monthlyQuota,
        stsMeterId: subscriptionAccounts.stsMeterId,
        iotDeviceId: subscriptionAccounts.iotDeviceId,
        activationDate: subscriptionAccounts.activationDate,
        expirationDate: subscriptionAccounts.expirationDate,
        notes: subscriptionAccounts.notes,
        customerName: customersEnhanced.fullName,
      })
      .from(subscriptionAccounts)
      .leftJoin(customersEnhanced, eq(subscriptionAccounts.customerId, customersEnhanced.id))
      .where(eq(subscriptionAccounts.id, input.id));
      
      if (!account) {
        throw new Error("حساب المشترك غير موجود");
      }
      
      return account;
    }),
  
  /**
   * إنشاء حساب مشترك جديد
   */
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      customerId: z.number(),
      accountType: z.enum(['sts', 'iot', 'regular', 'government_support']),
      accountName: z.string().optional(),
      tariffId: z.number().optional(),
      serviceType: z.enum(['electricity', 'water', 'gas']).default('electricity'),
      paymentMode: z.enum(['prepaid', 'postpaid', 'hybrid']).default('prepaid'),
      billingCycle: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),
      creditLimit: z.string().optional(),
      depositAmount: z.string().optional(),
      // بيانات خاصة بالدعم الحكومي
      supportType: z.string().optional(),
      supportPercentage: z.string().optional(),
      maxSupportAmount: z.string().optional(),
      monthlyQuota: z.string().optional(),
      // ربط مع STS/IoT
      stsMeterId: z.number().optional(),
      iotDeviceId: z.string().optional(),
      activationDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // التحقق من وجود العميل
      const [customer] = await db.select({ id: customersEnhanced.id })
        .from(customersEnhanced)
        .where(eq(customersEnhanced.id, input.customerId));
      
      if (!customer) {
        throw new Error("العميل غير موجود");
      }
      
      // توليد رقم حساب فريد
      const accountNumber = `SUB-${input.customerId}-${Date.now()}`;
      
      // إنشاء حساب المشترك
      const [result] = await db.insert(subscriptionAccounts).values({
        businessId: input.businessId,
        customerId: input.customerId,
        accountNumber,
        accountType: input.accountType,
        accountName: input.accountName || `حساب ${input.accountType}`,
        tariffId: input.tariffId || null,
        serviceType: input.serviceType,
        paymentMode: input.paymentMode,
        billingCycle: input.billingCycle,
        creditLimit: input.creditLimit || "0",
        depositAmount: input.depositAmount || "0",
        status: 'active',
        supportType: input.supportType || null,
        supportPercentage: input.supportPercentage || null,
        maxSupportAmount: input.maxSupportAmount || null,
        monthlyQuota: input.monthlyQuota || null,
        stsMeterId: input.stsMeterId || null,
        iotDeviceId: input.iotDeviceId || null,
        activationDate: input.activationDate ? new Date(input.activationDate) : new Date(),
        notes: input.notes || null,
        createdBy: ctx.user?.id || null,
      }).returning({ id: subscriptionAccounts.id });
      
      logger.info("[SubscriptionAccounts] Created new subscription account", {
        id: result.id,
        accountNumber,
        customerId: input.customerId,
        accountType: input.accountType,
      });
      
      return { 
        success: true, 
        id: result.id, 
        accountNumber 
      };
    }),
  
  /**
   * تحديث حساب مشترك
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      accountName: z.string().optional(),
      tariffId: z.number().optional(),
      creditLimit: z.string().optional(),
      depositAmount: z.string().optional(),
      paymentMode: z.enum(['prepaid', 'postpaid', 'hybrid']).optional(),
      billingCycle: z.enum(['monthly', 'quarterly', 'annual']).optional(),
      status: z.enum(['active', 'suspended', 'closed', 'pending']).optional(),
      supportType: z.string().optional(),
      supportPercentage: z.string().optional(),
      maxSupportAmount: z.string().optional(),
      monthlyQuota: z.string().optional(),
      expirationDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...updates } = input;
      const updateData: any = {};
      
      if (updates.accountName !== undefined) updateData.accountName = updates.accountName;
      if (updates.tariffId !== undefined) updateData.tariffId = updates.tariffId;
      if (updates.creditLimit !== undefined) updateData.creditLimit = updates.creditLimit;
      if (updates.depositAmount !== undefined) updateData.depositAmount = updates.depositAmount;
      if (updates.paymentMode !== undefined) updateData.paymentMode = updates.paymentMode;
      if (updates.billingCycle !== undefined) updateData.billingCycle = updates.billingCycle;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.supportType !== undefined) updateData.supportType = updates.supportType;
      if (updates.supportPercentage !== undefined) updateData.supportPercentage = updates.supportPercentage;
      if (updates.maxSupportAmount !== undefined) updateData.maxSupportAmount = updates.maxSupportAmount;
      if (updates.monthlyQuota !== undefined) updateData.monthlyQuota = updates.monthlyQuota;
      if (updates.expirationDate !== undefined) updateData.expirationDate = updates.expirationDate ? new Date(updates.expirationDate) : null;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      updateData.updatedAt = new Date();
      
      await db.update(subscriptionAccounts)
        .set(updateData)
        .where(eq(subscriptionAccounts.id, id));
      
      return { success: true };
    }),
  
  /**
   * ربط عداد بحساب مشترك
   */
  linkMeter: protectedProcedure
    .input(z.object({
      subscriptionAccountId: z.number(),
      meterId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // التحقق من وجود حساب المشترك
      const [account] = await db.select({ id: subscriptionAccounts.id, customerId: subscriptionAccounts.customerId })
        .from(subscriptionAccounts)
        .where(eq(subscriptionAccounts.id, input.subscriptionAccountId));
      
      if (!account) {
        throw new Error("حساب المشترك غير موجود");
      }
      
      // تحديث العداد
      await db.update(metersEnhanced)
        .set({ 
          subscriptionAccountId: input.subscriptionAccountId,
          customerId: account.customerId, // للتوافق مع الكود القديم
        })
        .where(eq(metersEnhanced.id, input.meterId));
      
      logger.info("[SubscriptionAccounts] Linked meter to subscription account", {
        subscriptionAccountId: input.subscriptionAccountId,
        meterId: input.meterId,
      });
      
      return { success: true };
    }),
  
  /**
   * فك ربط عداد من حساب مشترك
   */
  unlinkMeter: protectedProcedure
    .input(z.object({
      meterId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(metersEnhanced)
        .set({ subscriptionAccountId: null })
        .where(eq(metersEnhanced.id, input.meterId));
      
      return { success: true };
    }),
  
  /**
   * الحصول على العدادات المرتبطة بحساب مشترك
   */
  getMeters: publicProcedure
    .input(z.object({
      subscriptionAccountId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const meters = await db.select({
        id: metersEnhanced.id,
        meterNumber: metersEnhanced.meterNumber,
        serialNumber: metersEnhanced.serialNumber,
        meterType: metersEnhanced.meterType,
        category: metersEnhanced.category,
        currentReading: metersEnhanced.currentReading,
        balance: metersEnhanced.balance,
        balanceDue: metersEnhanced.balanceDue,
        status: metersEnhanced.status,
        installationDate: metersEnhanced.installationDate,
      })
      .from(metersEnhanced)
      .where(eq(metersEnhanced.subscriptionAccountId, input.subscriptionAccountId))
      .orderBy(desc(metersEnhanced.createdAt));
      
      return meters;
    }),
  
  /**
   * الحصول على الفواتير المرتبطة بحساب مشترك
   */
  getInvoices: publicProcedure
    .input(z.object({
      subscriptionAccountId: z.number(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let whereClause = eq(invoicesEnhanced.subscriptionAccountId, input.subscriptionAccountId);
      
      if (input.status) {
        whereClause = and(whereClause, eq(invoicesEnhanced.status, input.status)) as any;
      }
      
      const invoices = await db.select({
        id: invoicesEnhanced.id,
        invoiceNo: invoicesEnhanced.invoiceNo,
        invoiceDate: invoicesEnhanced.invoiceDate,
        dueDate: invoicesEnhanced.dueDate,
        totalAmount: invoicesEnhanced.totalAmount,
        paidAmount: invoicesEnhanced.paidAmount,
        balanceDue: invoicesEnhanced.balanceDue,
        status: invoicesEnhanced.status,
      })
      .from(invoicesEnhanced)
      .where(whereClause)
      .orderBy(desc(invoicesEnhanced.createdAt));
      
      return invoices;
    }),
  
  /**
   * الحصول على المدفوعات المرتبطة بحساب مشترك
   */
  getPayments: publicProcedure
    .input(z.object({
      subscriptionAccountId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const payments = await db.select({
        id: paymentsEnhanced.id,
        paymentNumber: paymentsEnhanced.paymentNumber,
        paymentDate: paymentsEnhanced.paymentDate,
        amount: paymentsEnhanced.amount,
        status: paymentsEnhanced.status,
      })
      .from(paymentsEnhanced)
      .where(eq(paymentsEnhanced.subscriptionAccountId, input.subscriptionAccountId))
      .orderBy(desc(paymentsEnhanced.createdAt));
      
      return payments;
    }),
  
  /**
   * تحديث رصيد حساب المشترك
   */
  updateBalance: protectedProcedure
    .input(z.object({
      subscriptionAccountId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // حساب balance_due من الفواتير غير المدفوعة باستخدام select
      const invoicesData = await db.select({
        totalBalanceDue: sql<number>`COALESCE(SUM(${invoicesEnhanced.balanceDue}::DECIMAL), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(${invoicesEnhanced.paidAmount}::DECIMAL), 0)`,
      })
      .from(invoicesEnhanced)
      .where(
        and(
          eq(invoicesEnhanced.subscriptionAccountId, input.subscriptionAccountId),
          sql`${invoicesEnhanced.status} != 'paid'`
        )
      );
      
      const balanceDue = parseFloat(invoicesData[0]?.totalBalanceDue?.toString() || "0");
      
      // حساب balance من المدفوعات باستخدام select
      const paymentsData = await db.select({
        totalAmount: sql<number>`COALESCE(SUM(${paymentsEnhanced.amount}::DECIMAL), 0)`,
      })
      .from(paymentsEnhanced)
      .where(
        and(
          eq(paymentsEnhanced.subscriptionAccountId, input.subscriptionAccountId),
          eq(paymentsEnhanced.status, 'completed')
        )
      );
      
      const balance = parseFloat(paymentsData[0]?.totalAmount?.toString() || "0");
      
      // تحديث رصيد حساب المشترك
      await db.update(subscriptionAccounts)
        .set({
          balance: balance.toFixed(2),
          balanceDue: balanceDue.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionAccounts.id, input.subscriptionAccountId));
      
      return { 
        success: true, 
        balance, 
        balanceDue 
      };
    }),
  
  /**
   * حذف حساب مشترك (soft delete - تغيير الحالة إلى closed)
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // التحقق من وجود فواتير غير مدفوعة باستخدام select
      const unpaidInvoicesData = await db.select({
        count: sql<number>`COUNT(*)::INTEGER`,
      })
      .from(invoicesEnhanced)
      .where(
        and(
          eq(invoicesEnhanced.subscriptionAccountId, input.id),
          sql`${invoicesEnhanced.status} != 'paid'`
        )
      );
      
      const count = parseInt(unpaidInvoicesData[0]?.count?.toString() || "0");
      
      if (count > 0) {
        throw new Error(`لا يمكن إغلاق حساب المشترك. يوجد ${count} فاتورة غير مدفوعة`);
      }
      
      // تغيير الحالة إلى closed
      await db.update(subscriptionAccounts)
        .set({
          status: 'closed',
          updatedAt: new Date(),
        })
        .where(eq(subscriptionAccounts.id, input.id));
      
      return { success: true };
    }),
});
