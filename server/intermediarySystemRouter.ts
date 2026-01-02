/**
 * نظام الوسيط - Intermediary System Router
 * إدارة الحسابات الوسيطة بين الأنظمة الفرعية
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and, asc, desc, sql, or, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  intermediaryAccounts,
  intermediaryAccountSubSystems,
  intermediaryAccountMovements,
  intermediaryReconciliations,
  intermediaryDailySummary,
  customSubSystems,
} from "../drizzle/schema";

// ============================================
// Intermediary Accounts Router
// ============================================

export const intermediaryAccountsRouter = router({
  /**
   * قائمة الحسابات الوسيطة
   */
  list: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      accountType: z.enum(["transfer", "settlement", "clearing", "suspense", "other"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let conditions = [eq(intermediaryAccounts.businessId, input.businessId)];
      
      if (input.accountType) {
        conditions.push(eq(intermediaryAccounts.accountType, input.accountType));
      }
      if (input.isActive !== undefined) {
        conditions.push(eq(intermediaryAccounts.isActive, input.isActive));
      }

      const accounts = await db.select({
        id: intermediaryAccounts.id,
        businessId: intermediaryAccounts.businessId,
        code: intermediaryAccounts.code,
        nameAr: intermediaryAccounts.nameAr,
        nameEn: intermediaryAccounts.nameEn,
        description: intermediaryAccounts.description,
        balance: intermediaryAccounts.balance,
        currency: intermediaryAccounts.currency,
        accountType: intermediaryAccounts.accountType,
        mustBeZero: intermediaryAccounts.mustBeZero,
        alertOnBalance: intermediaryAccounts.alertOnBalance,
        alertThreshold: intermediaryAccounts.alertThreshold,
        isActive: intermediaryAccounts.isActive,
        createdAt: intermediaryAccounts.createdAt,
      }).from(intermediaryAccounts)
        .where(and(...conditions))
        .orderBy(asc(intermediaryAccounts.code));

      // جلب الأنظمة الفرعية المرتبطة بكل حساب
      const accountsWithSubSystems = await Promise.all(accounts.map(async (account) => {
        const linkedSubSystems = await db.select({
          id: intermediaryAccountSubSystems.id,
          subSystemId: intermediaryAccountSubSystems.subSystemId,
          canDebit: intermediaryAccountSubSystems.canDebit,
          canCredit: intermediaryAccountSubSystems.canCredit,
          maxTransactionAmount: intermediaryAccountSubSystems.maxTransactionAmount,
          subSystemName: customSubSystems.nameAr,
          subSystemCode: customSubSystems.code,
        }).from(intermediaryAccountSubSystems)
          .leftJoin(customSubSystems, eq(intermediaryAccountSubSystems.subSystemId, customSubSystems.id))
          .where(eq(intermediaryAccountSubSystems.intermediaryAccountId, account.id));

        return {
          ...account,
          linkedSubSystems,
        };
      }));

      return accountsWithSubSystems;
    }),

  /**
   * جلب حساب وسيط بالمعرف
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const result = await db.select().from(intermediaryAccounts)
        .where(eq(intermediaryAccounts.id, input.id))
        .limit(1);

      if (!result[0]) return null;

      // جلب الأنظمة الفرعية المرتبطة
      const linkedSubSystems = await db.select({
        id: intermediaryAccountSubSystems.id,
        subSystemId: intermediaryAccountSubSystems.subSystemId,
        canDebit: intermediaryAccountSubSystems.canDebit,
        canCredit: intermediaryAccountSubSystems.canCredit,
        maxTransactionAmount: intermediaryAccountSubSystems.maxTransactionAmount,
        subSystemName: customSubSystems.nameAr,
        subSystemCode: customSubSystems.code,
      }).from(intermediaryAccountSubSystems)
        .leftJoin(customSubSystems, eq(intermediaryAccountSubSystems.subSystemId, customSubSystems.id))
        .where(eq(intermediaryAccountSubSystems.intermediaryAccountId, input.id));

      return {
        ...result[0],
        linkedSubSystems,
      };
    }),

  /**
   * إنشاء حساب وسيط جديد
   */
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      code: z.string(),
      nameAr: z.string(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      currency: z.string().default("SAR"),
      accountType: z.enum(["transfer", "settlement", "clearing", "suspense", "other"]).default("transfer"),
      mustBeZero: z.boolean().default(true),
      alertOnBalance: z.boolean().default(true),
      alertThreshold: z.string().default("0"),
      // الأنظمة الفرعية المرتبطة
      linkedSubSystems: z.array(z.object({
        subSystemId: z.number(),
        canDebit: z.boolean().default(true),
        canCredit: z.boolean().default(true),
        maxTransactionAmount: z.string().optional(),
      })).min(2, "يجب ربط الحساب بنظامين فرعيين على الأقل"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const { linkedSubSystems, ...accountData } = input;

      // إنشاء الحساب الوسيط
      const result = await db.insert(intermediaryAccounts).values({
        ...accountData,
        createdBy: ctx.user?.id,
      });

      const accountId = result[0].insertId;

      // ربط الأنظمة الفرعية
      for (const subSystem of linkedSubSystems) {
        await db.insert(intermediaryAccountSubSystems).values({
          intermediaryAccountId: accountId,
          subSystemId: subSystem.subSystemId,
          canDebit: subSystem.canDebit,
          canCredit: subSystem.canCredit,
          maxTransactionAmount: subSystem.maxTransactionAmount,
        });
      }

      return { id: accountId, success: true };
    }),

  /**
   * تحديث حساب وسيط
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      currency: z.string().optional(),
      accountType: z.enum(["transfer", "settlement", "clearing", "suspense", "other"]).optional(),
      mustBeZero: z.boolean().optional(),
      alertOnBalance: z.boolean().optional(),
      alertThreshold: z.string().optional(),
      isActive: z.boolean().optional(),
      // تحديث الأنظمة الفرعية المرتبطة
      linkedSubSystems: z.array(z.object({
        subSystemId: z.number(),
        canDebit: z.boolean().default(true),
        canCredit: z.boolean().default(true),
        maxTransactionAmount: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const { id, linkedSubSystems, ...updateData } = input;

      // تحديث بيانات الحساب
      if (Object.keys(updateData).length > 0) {
        await db.update(intermediaryAccounts).set(updateData).where(eq(intermediaryAccounts.id, id));
      }

      // تحديث الأنظمة الفرعية المرتبطة إذا تم تمريرها
      if (linkedSubSystems) {
        // حذف الروابط القديمة
        await db.delete(intermediaryAccountSubSystems)
          .where(eq(intermediaryAccountSubSystems.intermediaryAccountId, id));

        // إضافة الروابط الجديدة
        for (const subSystem of linkedSubSystems) {
          await db.insert(intermediaryAccountSubSystems).values({
            intermediaryAccountId: id,
            subSystemId: subSystem.subSystemId,
            canDebit: subSystem.canDebit,
            canCredit: subSystem.canCredit,
            maxTransactionAmount: subSystem.maxTransactionAmount,
          });
        }
      }

      return { success: true };
    }),

  /**
   * حذف حساب وسيط
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // التحقق من عدم وجود حركات
      const movements = await db.select({ count: sql<number>`count(*)` })
        .from(intermediaryAccountMovements)
        .where(eq(intermediaryAccountMovements.intermediaryAccountId, input.id));

      if (movements[0].count > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'لا يمكن حذف الحساب لوجود حركات مرتبطة به',
        });
      }

      // حذف الروابط
      await db.delete(intermediaryAccountSubSystems)
        .where(eq(intermediaryAccountSubSystems.intermediaryAccountId, input.id));

      // حذف الحساب
      await db.delete(intermediaryAccounts).where(eq(intermediaryAccounts.id, input.id));

      return { success: true };
    }),

  /**
   * إحصائيات الحسابات الوسيطة
   */
  stats: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // إجمالي الحسابات
      const totalAccounts = await db.select({ count: sql<number>`count(*)` })
        .from(intermediaryAccounts)
        .where(eq(intermediaryAccounts.businessId, input.businessId));

      // الحسابات النشطة
      const activeAccounts = await db.select({ count: sql<number>`count(*)` })
        .from(intermediaryAccounts)
        .where(and(
          eq(intermediaryAccounts.businessId, input.businessId),
          eq(intermediaryAccounts.isActive, true)
        ));

      // الحسابات ذات رصيد غير صفري
      const nonZeroBalanceAccounts = await db.select({ count: sql<number>`count(*)` })
        .from(intermediaryAccounts)
        .where(and(
          eq(intermediaryAccounts.businessId, input.businessId),
          sql`${intermediaryAccounts.balance} != 0`
        ));

      // إجمالي الأرصدة المعلقة
      const totalPendingBalance = await db.select({
        total: sql<string>`COALESCE(SUM(ABS(${intermediaryAccounts.balance})), 0)`,
      }).from(intermediaryAccounts)
        .where(and(
          eq(intermediaryAccounts.businessId, input.businessId),
          sql`${intermediaryAccounts.balance} != 0`
        ));

      return {
        totalAccounts: totalAccounts[0].count,
        activeAccounts: activeAccounts[0].count,
        nonZeroBalanceAccounts: nonZeroBalanceAccounts[0].count,
        totalPendingBalance: totalPendingBalance[0].total || "0",
      };
    }),
});

// ============================================
// Intermediary Movements Router
// ============================================

export const intermediaryMovementsRouter = router({
  /**
   * قائمة حركات حساب وسيط
   */
  list: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      intermediaryAccountId: z.number().optional(),
      subSystemId: z.number().optional(),
      movementType: z.enum(["debit", "credit"]).optional(),
      isReconciled: z.boolean().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let conditions = [eq(intermediaryAccountMovements.businessId, input.businessId)];

      if (input.intermediaryAccountId) {
        conditions.push(eq(intermediaryAccountMovements.intermediaryAccountId, input.intermediaryAccountId));
      }
      if (input.subSystemId) {
        conditions.push(eq(intermediaryAccountMovements.subSystemId, input.subSystemId));
      }
      if (input.movementType) {
        conditions.push(eq(intermediaryAccountMovements.movementType, input.movementType));
      }
      if (input.isReconciled !== undefined) {
        conditions.push(eq(intermediaryAccountMovements.isReconciled, input.isReconciled));
      }

      const movements = await db.select({
        id: intermediaryAccountMovements.id,
        intermediaryAccountId: intermediaryAccountMovements.intermediaryAccountId,
        subSystemId: intermediaryAccountMovements.subSystemId,
        movementType: intermediaryAccountMovements.movementType,
        amount: intermediaryAccountMovements.amount,
        currency: intermediaryAccountMovements.currency,
        balanceBefore: intermediaryAccountMovements.balanceBefore,
        balanceAfter: intermediaryAccountMovements.balanceAfter,
        referenceType: intermediaryAccountMovements.referenceType,
        referenceId: intermediaryAccountMovements.referenceId,
        referenceNumber: intermediaryAccountMovements.referenceNumber,
        description: intermediaryAccountMovements.description,
        isReconciled: intermediaryAccountMovements.isReconciled,
        reconciledWith: intermediaryAccountMovements.reconciledWith,
        createdAt: intermediaryAccountMovements.createdAt,
        // معلومات الحساب الوسيط
        accountName: intermediaryAccounts.nameAr,
        accountCode: intermediaryAccounts.code,
        // معلومات النظام الفرعي
        subSystemName: customSubSystems.nameAr,
        subSystemCode: customSubSystems.code,
      }).from(intermediaryAccountMovements)
        .leftJoin(intermediaryAccounts, eq(intermediaryAccountMovements.intermediaryAccountId, intermediaryAccounts.id))
        .leftJoin(customSubSystems, eq(intermediaryAccountMovements.subSystemId, customSubSystems.id))
        .where(and(...conditions))
        .orderBy(desc(intermediaryAccountMovements.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return movements;
    }),

  /**
   * إنشاء حركة جديدة
   */
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      intermediaryAccountId: z.number(),
      subSystemId: z.number(),
      movementType: z.enum(["debit", "credit"]),
      amount: z.string(),
      currency: z.string().default("SAR"),
      referenceType: z.enum(["receipt_voucher", "payment_voucher", "transfer", "adjustment", "manual"]).optional(),
      referenceId: z.number().optional(),
      referenceNumber: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // التحقق من صلاحية النظام الفرعي
      const permission = await db.select()
        .from(intermediaryAccountSubSystems)
        .where(and(
          eq(intermediaryAccountSubSystems.intermediaryAccountId, input.intermediaryAccountId),
          eq(intermediaryAccountSubSystems.subSystemId, input.subSystemId)
        ))
        .limit(1);

      if (!permission[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'النظام الفرعي غير مرتبط بهذا الحساب الوسيط',
        });
      }

      // التحقق من صلاحية نوع الحركة
      if (input.movementType === "debit" && !permission[0].canDebit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'النظام الفرعي لا يملك صلاحية الإضافة (مدين) لهذا الحساب',
        });
      }
      if (input.movementType === "credit" && !permission[0].canCredit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'النظام الفرعي لا يملك صلاحية الخصم (دائن) لهذا الحساب',
        });
      }

      // جلب الرصيد الحالي
      const account = await db.select({ balance: intermediaryAccounts.balance })
        .from(intermediaryAccounts)
        .where(eq(intermediaryAccounts.id, input.intermediaryAccountId))
        .limit(1);

      const currentBalance = parseFloat(account[0]?.balance || "0");
      const amount = parseFloat(input.amount);
      const newBalance = input.movementType === "debit" 
        ? currentBalance + amount 
        : currentBalance - amount;

      // إنشاء الحركة
      const result = await db.insert(intermediaryAccountMovements).values({
        businessId: input.businessId,
        intermediaryAccountId: input.intermediaryAccountId,
        subSystemId: input.subSystemId,
        movementType: input.movementType,
        amount: input.amount,
        currency: input.currency,
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        referenceNumber: input.referenceNumber,
        description: input.description,
        createdBy: ctx.user?.id,
      });

      // تحديث رصيد الحساب
      await db.update(intermediaryAccounts)
        .set({ balance: newBalance.toString() })
        .where(eq(intermediaryAccounts.id, input.intermediaryAccountId));

      return { id: result[0].insertId, newBalance: newBalance.toString(), success: true };
    }),

  /**
   * الحركات غير المسواة
   */
  unreconciled: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      intermediaryAccountId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let conditions = [
        eq(intermediaryAccountMovements.businessId, input.businessId),
        eq(intermediaryAccountMovements.isReconciled, false),
      ];

      if (input.intermediaryAccountId) {
        conditions.push(eq(intermediaryAccountMovements.intermediaryAccountId, input.intermediaryAccountId));
      }

      const movements = await db.select({
        id: intermediaryAccountMovements.id,
        intermediaryAccountId: intermediaryAccountMovements.intermediaryAccountId,
        subSystemId: intermediaryAccountMovements.subSystemId,
        movementType: intermediaryAccountMovements.movementType,
        amount: intermediaryAccountMovements.amount,
        currency: intermediaryAccountMovements.currency,
        referenceNumber: intermediaryAccountMovements.referenceNumber,
        description: intermediaryAccountMovements.description,
        createdAt: intermediaryAccountMovements.createdAt,
        accountName: intermediaryAccounts.nameAr,
        subSystemName: customSubSystems.nameAr,
      }).from(intermediaryAccountMovements)
        .leftJoin(intermediaryAccounts, eq(intermediaryAccountMovements.intermediaryAccountId, intermediaryAccounts.id))
        .leftJoin(customSubSystems, eq(intermediaryAccountMovements.subSystemId, customSubSystems.id))
        .where(and(...conditions))
        .orderBy(asc(intermediaryAccountMovements.createdAt));

      // تجميع حسب الحساب الوسيط
      const grouped: Record<number, {
        accountId: number;
        accountName: string;
        debits: typeof movements;
        credits: typeof movements;
      }> = {};

      for (const movement of movements) {
        if (!grouped[movement.intermediaryAccountId]) {
          grouped[movement.intermediaryAccountId] = {
            accountId: movement.intermediaryAccountId,
            accountName: movement.accountName || "",
            debits: [],
            credits: [],
          };
        }
        if (movement.movementType === "debit") {
          grouped[movement.intermediaryAccountId].debits.push(movement);
        } else {
          grouped[movement.intermediaryAccountId].credits.push(movement);
        }
      }

      return Object.values(grouped);
    }),
});

// ============================================
// Intermediary Reconciliations Router
// ============================================

export const intermediaryReconciliationsRouter = router({
  /**
   * تسوية حركتين
   */
  reconcile: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      intermediaryAccountId: z.number(),
      debitMovementId: z.number(),
      creditMovementId: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // جلب الحركتين
      const debitMovement = await db.select()
        .from(intermediaryAccountMovements)
        .where(eq(intermediaryAccountMovements.id, input.debitMovementId))
        .limit(1);

      const creditMovement = await db.select()
        .from(intermediaryAccountMovements)
        .where(eq(intermediaryAccountMovements.id, input.creditMovementId))
        .limit(1);

      if (!debitMovement[0] || !creditMovement[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'الحركة غير موجودة' });
      }

      // التحقق من أن الحركتين متقابلتين
      if (debitMovement[0].movementType !== "debit" || creditMovement[0].movementType !== "credit") {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'يجب أن تكون الحركة الأولى مدينة والثانية دائنة',
        });
      }

      // التحقق من تطابق المبلغ
      if (debitMovement[0].amount !== creditMovement[0].amount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'المبالغ غير متطابقة',
        });
      }

      // إنشاء التسوية
      const result = await db.insert(intermediaryReconciliations).values({
        businessId: input.businessId,
        intermediaryAccountId: input.intermediaryAccountId,
        debitMovementId: input.debitMovementId,
        debitSubSystemId: debitMovement[0].subSystemId,
        creditMovementId: input.creditMovementId,
        creditSubSystemId: creditMovement[0].subSystemId,
        amount: debitMovement[0].amount,
        currency: debitMovement[0].currency,
        notes: input.notes,
        reconciledBy: ctx.user?.id,
      });

      // تحديث حالة الحركتين
      const now = new Date();
      await db.update(intermediaryAccountMovements)
        .set({
          isReconciled: true,
          reconciledWith: input.creditMovementId,
          reconciledAt: now,
          reconciledBy: ctx.user?.id,
        })
        .where(eq(intermediaryAccountMovements.id, input.debitMovementId));

      await db.update(intermediaryAccountMovements)
        .set({
          isReconciled: true,
          reconciledWith: input.debitMovementId,
          reconciledAt: now,
          reconciledBy: ctx.user?.id,
        })
        .where(eq(intermediaryAccountMovements.id, input.creditMovementId));

      return { id: result[0].insertId, success: true };
    }),

  /**
   * قائمة التسويات
   */
  list: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      intermediaryAccountId: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let conditions = [eq(intermediaryReconciliations.businessId, input.businessId)];

      if (input.intermediaryAccountId) {
        conditions.push(eq(intermediaryReconciliations.intermediaryAccountId, input.intermediaryAccountId));
      }

      return await db.select({
        id: intermediaryReconciliations.id,
        intermediaryAccountId: intermediaryReconciliations.intermediaryAccountId,
        debitMovementId: intermediaryReconciliations.debitMovementId,
        debitSubSystemId: intermediaryReconciliations.debitSubSystemId,
        creditMovementId: intermediaryReconciliations.creditMovementId,
        creditSubSystemId: intermediaryReconciliations.creditSubSystemId,
        amount: intermediaryReconciliations.amount,
        currency: intermediaryReconciliations.currency,
        notes: intermediaryReconciliations.notes,
        createdAt: intermediaryReconciliations.createdAt,
        accountName: intermediaryAccounts.nameAr,
      }).from(intermediaryReconciliations)
        .leftJoin(intermediaryAccounts, eq(intermediaryReconciliations.intermediaryAccountId, intermediaryAccounts.id))
        .where(and(...conditions))
        .orderBy(desc(intermediaryReconciliations.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  /**
   * تسوية تلقائية
   */
  autoReconcile: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      intermediaryAccountId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let conditions = [
        eq(intermediaryAccountMovements.businessId, input.businessId),
        eq(intermediaryAccountMovements.isReconciled, false),
      ];

      if (input.intermediaryAccountId) {
        conditions.push(eq(intermediaryAccountMovements.intermediaryAccountId, input.intermediaryAccountId));
      }

      // جلب الحركات غير المسواة
      const movements = await db.select()
        .from(intermediaryAccountMovements)
        .where(and(...conditions))
        .orderBy(asc(intermediaryAccountMovements.createdAt));

      // تجميع حسب الحساب الوسيط
      const byAccount: Record<number, { debits: typeof movements; credits: typeof movements }> = {};
      
      for (const m of movements) {
        if (!byAccount[m.intermediaryAccountId]) {
          byAccount[m.intermediaryAccountId] = { debits: [], credits: [] };
        }
        if (m.movementType === "debit") {
          byAccount[m.intermediaryAccountId].debits.push(m);
        } else {
          byAccount[m.intermediaryAccountId].credits.push(m);
        }
      }

      let reconciledCount = 0;

      // محاولة التسوية التلقائية
      for (const [accountId, { debits, credits }] of Object.entries(byAccount)) {
        for (const debit of debits) {
          // البحث عن حركة دائنة بنفس المبلغ
          const matchingCredit = credits.find(c => 
            c.amount === debit.amount && 
            !c.isReconciled &&
            c.subSystemId !== debit.subSystemId // من نظام فرعي مختلف
          );

          if (matchingCredit) {
            // إنشاء التسوية
            await db.insert(intermediaryReconciliations).values({
              businessId: input.businessId,
              intermediaryAccountId: parseInt(accountId),
              debitMovementId: debit.id,
              debitSubSystemId: debit.subSystemId,
              creditMovementId: matchingCredit.id,
              creditSubSystemId: matchingCredit.subSystemId,
              amount: debit.amount,
              currency: debit.currency,
              notes: "تسوية تلقائية",
              reconciledBy: ctx.user?.id,
            });

            // تحديث الحركتين
            const now = new Date();
            await db.update(intermediaryAccountMovements)
              .set({
                isReconciled: true,
                reconciledWith: matchingCredit.id,
                reconciledAt: now,
                reconciledBy: ctx.user?.id,
              })
              .where(eq(intermediaryAccountMovements.id, debit.id));

            await db.update(intermediaryAccountMovements)
              .set({
                isReconciled: true,
                reconciledWith: debit.id,
                reconciledAt: now,
                reconciledBy: ctx.user?.id,
              })
              .where(eq(intermediaryAccountMovements.id, matchingCredit.id));

            // تحديث حالة الحركة الدائنة في المصفوفة
            matchingCredit.isReconciled = true;
            debit.isReconciled = true;
            reconciledCount++;
          }
        }
      }

      return { reconciledCount, success: true };
    }),
});

// ============================================
// Main Intermediary System Router
// ============================================

export const intermediarySystemRouter = router({
  accounts: intermediaryAccountsRouter,
  movements: intermediaryMovementsRouter,
  reconciliations: intermediaryReconciliationsRouter,
});
