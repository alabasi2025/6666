
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  customAccounts, customTransactions, customNotes, customMemos, noteCategories,
  InsertCustomAccount, InsertCustomTransaction, InsertCustomNote, InsertCustomMemo,
  customParties, customCategories, customTreasuryMovements, customPartyTransactions, customSettings,
  InsertCustomParty, InsertCustomCategory, InsertCustomTreasuryMovement, InsertCustomPartyTransaction, InsertCustomSetting
} from "../drizzle/schema";
import { eq, and, desc, asc, like, sql } from "drizzle-orm";

    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      voucherDate: z.string(),
      amount: z.string(),
      currency: z.string().default("SAR"),
      treasuryId: z.number(),
      destinationType: z.enum(["person", "entity", "intermediary", "other"]),
      destinationName: z.string().optional(),
      destinationIntermediaryId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Generate voucher number
      const count = await db.select({ count: sql<number>`count(*)` })
        .from(customPaymentVouchers)
        .where(eq(customPaymentVouchers.businessId, input.businessId));
      const voucherNumber = `PV-${String(count[0].count + 1).padStart(6, '0')}`;
      
      const result = await db.insert(customPaymentVouchers).values({
        ...input,
        voucherNumber,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, voucherNumber, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      voucherDate: z.string().optional(),
      amount: z.string().optional(),
      treasuryId: z.number().optional(),
      destinationType: z.enum(["person", "entity", "intermediary", "other"]).optional(),
      destinationName: z.string().optional(),
      destinationIntermediaryId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customPaymentVouchers).set(data).where(eq(customPaymentVouchers.id, id));
      return { success: true };
    }),

  confirm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get voucher
      const voucher = await db.select({
        id: customPaymentVouchers.id,
        treasuryId: customPaymentVouchers.treasuryId,
        amount: customPaymentVouchers.amount,
      }).from(customPaymentVouchers)
        .where(eq(customPaymentVouchers.id, input.id))
        .limit(1);
      
      if (!voucher[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voucher not found' });
      }
      
      // Update treasury balance
      const treasury = await db.select({
        id: customTreasuries.id,
        currentBalance: customTreasuries.currentBalance,
      }).from(customTreasuries)
        .where(eq(customTreasuries.id, voucher[0].treasuryId))
        .limit(1);
      
      if (treasury[0]) {
        const currentBalance = parseFloat(treasury[0].currentBalance || "0");
        const amount = parseFloat(voucher[0].amount);
        await db.update(customTreasuries)
          .set({ currentBalance: (currentBalance - amount).toString() })
          .where(eq(customTreasuries.id, voucher[0].treasuryId));
      }
      
      // Update voucher status
      await db.update(customPaymentVouchers)
        .set({ status: "confirmed" })
        .where(eq(customPaymentVouchers.id, input.id));
      
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customPaymentVouchers).where(eq(customPaymentVouchers.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Inter-System Transfers Router
// ============================================
export const customTransfersRouter = router({
  // إنشاء تحويل بين نظامين فرعيين
  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      fromSubSystemId: z.number(),
      toSubSystemId: z.number(),
      fromTreasuryId: z.number(),
      toTreasuryId: z.number(),
      amount: z.string(),
      currency: z.string().default("SAR"),
      description: z.string().optional(),
      transferDate: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // 1. البحث عن أو إنشاء الحساب الوسيط
      let intermediaryAccount = await db.select({
        id: customIntermediaryAccounts.id,
      }).from(customIntermediaryAccounts)
        .where(and(
          eq(customIntermediaryAccounts.businessId, input.businessId),
          eq(customIntermediaryAccounts.fromSubSystemId, input.fromSubSystemId),
          eq(customIntermediaryAccounts.toSubSystemId, input.toSubSystemId)
        ))
        .limit(1);
      
      let intermediaryId: number;
      
      if (!intermediaryAccount[0]) {
        // إنشاء حساب وسيط جديد
        const fromSystem = await db.select({ id: customSubSystems.id, nameAr: customSubSystems.nameAr }).from(customSubSystems).where(eq(customSubSystems.id, input.fromSubSystemId)).limit(1);
        const toSystem = await db.select({ id: customSubSystems.id, nameAr: customSubSystems.nameAr }).from(customSubSystems).where(eq(customSubSystems.id, input.toSubSystemId)).limit(1);
        
        const code = `INT-${input.fromSubSystemId}-${input.toSubSystemId}`;
        const nameAr = `حساب وسيط: ${fromSystem[0]?.nameAr || 'نظام'} → ${toSystem[0]?.nameAr || 'نظام'}`;
        
        const newAccount = await db.insert(customIntermediaryAccounts).values({
          businessId: input.businessId,
          fromSubSystemId: input.fromSubSystemId,
          toSubSystemId: input.toSubSystemId,
          code,
          nameAr,
          currency: input.currency,
        });
        intermediaryId = newAccount[0].insertId;
      } else {
        intermediaryId = intermediaryAccount[0].id;
      }
      
      // 2. إنشاء سند صرف في النظام المصدر
      const paymentCount = await db.select({ count: sql<number>`count(*)` })
        .from(customPaymentVouchers)
        .where(eq(customPaymentVouchers.businessId, input.businessId));
      const paymentNumber = `PV-${String(paymentCount[0].count + 1).padStart(6, '0')}`;
      
      const paymentResult = await db.insert(customPaymentVouchers).values({
        businessId: input.businessId,
        subSystemId: input.fromSubSystemId,
        voucherNumber: paymentNumber,
        voucherDate: input.transferDate,
        amount: input.amount,
        currency: input.currency,
        destinationType: "intermediary",
        destinationIntermediaryId: intermediaryId,
        destinationName: `تحويل إلى نظام فرعي`,
        treasuryId: input.fromTreasuryId,
        description: input.description || `تحويل بين الأنظمة الفرعية`,
        status: "confirmed",
        isReconciled: false,
        createdBy: ctx.user?.id,
      });
      
      // 3. إنشاء سند قبض في النظام المستقبل
      const receiptCount = await db.select({ count: sql<number>`count(*)` })
        .from(customReceiptVouchers)
        .where(eq(customReceiptVouchers.businessId, input.businessId));
      const receiptNumber = `RV-${String(receiptCount[0].count + 1).padStart(6, '0')}`;
      
      const receiptResult = await db.insert(customReceiptVouchers).values({
        businessId: input.businessId,
        subSystemId: input.toSubSystemId,
        voucherNumber: receiptNumber,
        voucherDate: input.transferDate,
        amount: input.amount,
        currency: input.currency,
        sourceType: "intermediary",
        sourceIntermediaryId: intermediaryId,
        sourceName: `تحويل من نظام فرعي`,
        treasuryId: input.toTreasuryId,
        description: input.description || `تحويل بين الأنظمة الفرعية`,
        status: "confirmed",
        isReconciled: false,
        createdBy: ctx.user?.id,
      });
      
      // 4. تحديث أرصدة الخزائن
      const fromTreasury = await db.select({ id: customTreasuries.id, currentBalance: customTreasuries.currentBalance }).from(customTreasuries).where(eq(customTreasuries.id, input.fromTreasuryId)).limit(1);
      const toTreasury = await db.select({ id: customTreasuries.id, currentBalance: customTreasuries.currentBalance }).from(customTreasuries).where(eq(customTreasuries.id, input.toTreasuryId)).limit(1);
      
      if (fromTreasury[0]) {
        const newBalance = parseFloat(fromTreasury[0].currentBalance || "0") - parseFloat(input.amount);
        await db.update(customTreasuries)
          .set({ currentBalance: newBalance.toString() })
          .where(eq(customTreasuries.id, input.fromTreasuryId));
      }
      
      if (toTreasury[0]) {
        const newBalance = parseFloat(toTreasury[0].currentBalance || "0") + parseFloat(input.amount);
        await db.update(customTreasuries)
          .set({ currentBalance: newBalance.toString() })
          .where(eq(customTreasuries.id, input.toTreasuryId));
      }
      
      return {
        success: true,
        paymentVoucherId: paymentResult[0].insertId,
        paymentVoucherNumber: paymentNumber,
        receiptVoucherId: receiptResult[0].insertId,
        receiptVoucherNumber: receiptNumber,
        intermediaryAccountId: intermediaryId,
      };
    }),

  // قائمة التحويلات بين الأنظمة
  list: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      // جلب سندات الصرف التي تمت إلى حسابات وسيطة
      let conditions = [
        eq(customPaymentVouchers.businessId, input.businessId),
        eq(customPaymentVouchers.destinationType, "intermediary")
      ];
      
      if (input.subSystemId) {
        conditions.push(eq(customPaymentVouchers.subSystemId, input.subSystemId));
      }
      
      const outgoingTransfers = await db.select({
        id: customPaymentVouchers.id,
        voucherNumber: customPaymentVouchers.voucherNumber,
        voucherDate: customPaymentVouchers.voucherDate,
        amount: customPaymentVouchers.amount,
        currency: customPaymentVouchers.currency,
        destinationIntermediaryId: customPaymentVouchers.destinationIntermediaryId,
        status: customPaymentVouchers.status,
      }).from(customPaymentVouchers)
        .where(and(...conditions))
        .orderBy(desc(customPaymentVouchers.voucherDate));
      
      // جلب سندات القبض من حسابات وسيطة
      let receiptConditions = [
        eq(customReceiptVouchers.businessId, input.businessId),
        eq(customReceiptVouchers.sourceType, "intermediary")
      ];
      
      if (input.subSystemId) {
        receiptConditions.push(eq(customReceiptVouchers.subSystemId, input.subSystemId));
      }
      
      const incomingTransfers = await db.select({
        id: customReceiptVouchers.id,
        voucherNumber: customReceiptVouchers.voucherNumber,
        voucherDate: customReceiptVouchers.voucherDate,
        amount: customReceiptVouchers.amount,
        currency: customReceiptVouchers.currency,
        sourceIntermediaryId: customReceiptVouchers.sourceIntermediaryId,
        status: customReceiptVouchers.status,
      }).from(customReceiptVouchers)
        .where(and(...receiptConditions))
        .orderBy(desc(customReceiptVouchers.voucherDate));
      
      return {
        outgoing: outgoingTransfers,
        incoming: incomingTransfers,
      };
    }),

  // جلب التحويلات غير المطابقة
  getUnreconciled: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return { outgoing: [], incoming: [] };
      
      let paymentConditions = [
        eq(customPaymentVouchers.businessId, input.businessId),
        eq(customPaymentVouchers.destinationType, "intermediary"),
        eq(customPaymentVouchers.status, "confirmed"),
        eq(customPaymentVouchers.isReconciled, false)
      ];
      
      if (input.subSystemId) {
        paymentConditions.push(eq(customPaymentVouchers.subSystemId, input.subSystemId));
      }
      
      const outgoing = await db.select({
        id: customPaymentVouchers.id,
        voucherNumber: customPaymentVouchers.voucherNumber,
        voucherDate: customPaymentVouchers.voucherDate,
        amount: customPaymentVouchers.amount,
        destinationIntermediaryId: customPaymentVouchers.destinationIntermediaryId,
      }).from(customPaymentVouchers)
        .where(and(...paymentConditions));
      
      let receiptConditions = [
        eq(customReceiptVouchers.businessId, input.businessId),
        eq(customReceiptVouchers.sourceType, "intermediary"),
        eq(customReceiptVouchers.status, "confirmed"),
        eq(customReceiptVouchers.isReconciled, false)
      ];
      
      if (input.subSystemId) {
        receiptConditions.push(eq(customReceiptVouchers.subSystemId, input.subSystemId));
      }
      
      const incoming = await db.select({
        id: customReceiptVouchers.id,
        voucherNumber: customReceiptVouchers.voucherNumber,
        voucherDate: customReceiptVouchers.voucherDate,
        amount: customReceiptVouchers.amount,
        sourceIntermediaryId: customReceiptVouchers.sourceIntermediaryId,
      }).from(customReceiptVouchers)
        .where(and(...receiptConditions));
      
      return { outgoing, incoming };
    }),
});

// ============================================
// Custom Reconciliations Router
// ============================================
export const customReconciliationsRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      status: z.enum(["pending", "confirmed", "rejected"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      let conditions = [eq(customReconciliations.businessId, input.businessId)];
      if (input.status) {
        conditions.push(eq(customReconciliations.status, input.status));
      }
      
      return await db.select({
        id: customReconciliations.id,
        businessId: customReconciliations.businessId,
        paymentVoucherId: customReconciliations.paymentVoucherId,
        receiptVoucherId: customReconciliations.receiptVoucherId,
        amount: customReconciliations.amount,
        currency: customReconciliations.currency,
        confidenceScore: customReconciliations.confidenceScore,
        status: customReconciliations.status,
        createdAt: customReconciliations.createdAt,
      }).from(customReconciliations)
        .where(and(...conditions))
        .orderBy(desc(customReconciliations.createdAt));
    }),

  autoReconcile: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get unreconciled payment vouchers with intermediary destination
      const payments = await db.select({
        id: customPaymentVouchers.id,
        voucherDate: customPaymentVouchers.voucherDate,
        amount: customPaymentVouchers.amount,
        currency: customPaymentVouchers.currency,
        destinationIntermediaryId: customPaymentVouchers.destinationIntermediaryId,
      }).from(customPaymentVouchers)
        .where(and(
          eq(customPaymentVouchers.businessId, input.businessId),
          eq(customPaymentVouchers.status, "confirmed"),
          eq(customPaymentVouchers.isReconciled, false),
          eq(customPaymentVouchers.destinationType, "intermediary")
        ));
      
      // Get unreconciled receipt vouchers with intermediary source
      const receipts = await db.select({
        id: customReceiptVouchers.id,
        voucherDate: customReceiptVouchers.voucherDate,
        amount: customReceiptVouchers.amount,
        currency: customReceiptVouchers.currency,
        sourceIntermediaryId: customReceiptVouchers.sourceIntermediaryId,
      }).from(customReceiptVouchers)
        .where(and(
          eq(customReceiptVouchers.businessId, input.businessId),
          eq(customReceiptVouchers.status, "confirmed"),
          eq(customReceiptVouchers.isReconciled, false),
