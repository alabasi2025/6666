
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

        subSystemId: customTreasuries.subSystemId,
        code: customTreasuries.code,
        nameAr: customTreasuries.nameAr,
        nameEn: customTreasuries.nameEn,
        treasuryType: customTreasuries.treasuryType,
        bankName: customTreasuries.bankName,
        accountNumber: customTreasuries.accountNumber,
        currency: customTreasuries.currency,
        openingBalance: customTreasuries.openingBalance,
        currentBalance: customTreasuries.currentBalance,
        isActive: customTreasuries.isActive,
        createdAt: customTreasuries.createdAt,
      }).from(customTreasuries)
        .where(and(...conditions))
        .orderBy(asc(customTreasuries.code));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return null;
      
      const result = await db.select({
        id: customTreasuries.id,
        businessId: customTreasuries.businessId,
        subSystemId: customTreasuries.subSystemId,
        code: customTreasuries.code,
        nameAr: customTreasuries.nameAr,
        nameEn: customTreasuries.nameEn,
        treasuryType: customTreasuries.treasuryType,
        bankName: customTreasuries.bankName,
        accountNumber: customTreasuries.accountNumber,
        iban: customTreasuries.iban,
        swiftCode: customTreasuries.swiftCode,
        walletProvider: customTreasuries.walletProvider,
        walletNumber: customTreasuries.walletNumber,
        currency: customTreasuries.currency,
        openingBalance: customTreasuries.openingBalance,
        currentBalance: customTreasuries.currentBalance,
        description: customTreasuries.description,
        isActive: customTreasuries.isActive,
        createdAt: customTreasuries.createdAt,
      }).from(customTreasuries)
        .where(eq(customTreasuries.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      treasuryType: z.enum(["cash", "bank", "wallet", "exchange"]),
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      iban: z.string().optional(),
      swiftCode: z.string().optional(),
      walletProvider: z.string().optional(),
      walletNumber: z.string().optional(),
      currency: z.string().default("SAR"),
      openingBalance: z.string().default("0"),
      currentBalance: z.string().default("0"),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customTreasuries).values({
        ...input,
        createdBy: ctx.user?.id,
      });
      return { id: result[0].insertId, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      treasuryType: z.enum(["cash", "bank", "wallet", "exchange"]).optional(),
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      iban: z.string().optional(),
      swiftCode: z.string().optional(),
      walletProvider: z.string().optional(),
      walletNumber: z.string().optional(),
      currency: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customTreasuries).set(data).where(eq(customTreasuries.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customTreasuries).where(eq(customTreasuries.id, input.id));
      return { success: true };
    }),

  updateBalance: protectedProcedure
    .input(z.object({
      id: z.number(),
      amount: z.string(),
      operation: z.enum(["add", "subtract"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const treasury = await db.select({
        id: customTreasuries.id,
        currentBalance: customTreasuries.currentBalance,
      }).from(customTreasuries)
        .where(eq(customTreasuries.id, input.id))
        .limit(1);
      
      if (!treasury[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Treasury not found' });
      }
      
      const currentBalance = parseFloat(treasury[0].currentBalance || "0");
      const amount = parseFloat(input.amount);
      const newBalance = input.operation === "add" 
        ? currentBalance + amount 
        : currentBalance - amount;
      
      await db.update(customTreasuries)
        .set({ currentBalance: newBalance.toString() })
        .where(eq(customTreasuries.id, input.id));
      
      return { success: true, newBalance };
    }),
});

// ============================================
// Custom Intermediary Accounts Router
// ============================================
export const customIntermediaryAccountsRouter = router({
  list: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      return await db.select({
        id: customIntermediaryAccounts.id,
        businessId: customIntermediaryAccounts.businessId,
        fromSubSystemId: customIntermediaryAccounts.fromSubSystemId,
        toSubSystemId: customIntermediaryAccounts.toSubSystemId,
        code: customIntermediaryAccounts.code,
        nameAr: customIntermediaryAccounts.nameAr,
        nameEn: customIntermediaryAccounts.nameEn,
        currency: customIntermediaryAccounts.currency,
        currentBalance: customIntermediaryAccounts.currentBalance,
        isActive: customIntermediaryAccounts.isActive,
        createdAt: customIntermediaryAccounts.createdAt,
      }).from(customIntermediaryAccounts)
        .where(eq(customIntermediaryAccounts.businessId, input.businessId))
        .orderBy(asc(customIntermediaryAccounts.code));
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      fromSubSystemId: z.number(),
      toSubSystemId: z.number(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      currency: z.string().default("SAR"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const result = await db.insert(customIntermediaryAccounts).values(input);
      return { id: result[0].insertId, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customIntermediaryAccounts).set(data).where(eq(customIntermediaryAccounts.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customIntermediaryAccounts).where(eq(customIntermediaryAccounts.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Custom Receipt Vouchers Router
// ============================================
export const customReceiptVouchersRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      subSystemId: z.number().optional(),
      status: z.enum(["draft", "confirmed", "cancelled"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      let conditions = [eq(customReceiptVouchers.businessId, input.businessId)];
      if (input.subSystemId) {
        conditions.push(eq(customReceiptVouchers.subSystemId, input.subSystemId));
      }
      if (input.status) {
        conditions.push(eq(customReceiptVouchers.status, input.status));
      }
      
      return await db.select({
        id: customReceiptVouchers.id,
        businessId: customReceiptVouchers.businessId,
        subSystemId: customReceiptVouchers.subSystemId,
        voucherNumber: customReceiptVouchers.voucherNumber,
        voucherDate: customReceiptVouchers.voucherDate,
        amount: customReceiptVouchers.amount,
        currency: customReceiptVouchers.currency,
        sourceType: customReceiptVouchers.sourceType,
        sourceName: customReceiptVouchers.sourceName,
        treasuryId: customReceiptVouchers.treasuryId,
        description: customReceiptVouchers.description,
        status: customReceiptVouchers.status,
        isReconciled: customReceiptVouchers.isReconciled,
        createdAt: customReceiptVouchers.createdAt,
      }).from(customReceiptVouchers)
        .where(and(...conditions))
        .orderBy(desc(customReceiptVouchers.voucherDate));
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      subSystemId: z.number().optional(),
      voucherDate: z.string(),
      amount: z.string(),
      currency: z.string().default("SAR"),
      sourceType: z.enum(["person", "entity", "intermediary", "other"]),
      sourceName: z.string().optional(),
      sourceIntermediaryId: z.number().optional(),
      treasuryId: z.number(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Generate voucher number
      const count = await db.select({ count: sql<number>`count(*)` })
        .from(customReceiptVouchers)
        .where(eq(customReceiptVouchers.businessId, input.businessId));
      const voucherNumber = `RV-${String(count[0].count + 1).padStart(6, '0')}`;
      
      const result = await db.insert(customReceiptVouchers).values({
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
      sourceType: z.enum(["person", "entity", "intermediary", "other"]).optional(),
      sourceName: z.string().optional(),
      sourceIntermediaryId: z.number().optional(),
      treasuryId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const { id, ...data } = input;
      await db.update(customReceiptVouchers).set(data).where(eq(customReceiptVouchers.id, id));
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
        id: customReceiptVouchers.id,
        treasuryId: customReceiptVouchers.treasuryId,
        amount: customReceiptVouchers.amount,
      }).from(customReceiptVouchers)
        .where(eq(customReceiptVouchers.id, input.id))
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
          .set({ currentBalance: (currentBalance + amount).toString() })
          .where(eq(customTreasuries.id, voucher[0].treasuryId));
      }
      
      // Update voucher status
      await db.update(customReceiptVouchers)
        .set({ status: "confirmed" })
        .where(eq(customReceiptVouchers.id, input.id));
      
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      await db.delete(customReceiptVouchers).where(eq(customReceiptVouchers.id, input.id));
      return { success: true };
    }),
});

// ============================================
// Custom Payment Vouchers Router
// ============================================
export const customPaymentVouchersRouter = router({
  list: protectedProcedure
    .input(z.object({ 
      businessId: z.number(),
      subSystemId: z.number().optional(),
      status: z.enum(["draft", "confirmed", "cancelled"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      if (!db) return [];
      
      let conditions = [eq(customPaymentVouchers.businessId, input.businessId)];
      if (input.subSystemId) {
        conditions.push(eq(customPaymentVouchers.subSystemId, input.subSystemId));
      }
      if (input.status) {
        conditions.push(eq(customPaymentVouchers.status, input.status));
      }
      
      return await db.select({
        id: customPaymentVouchers.id,
        businessId: customPaymentVouchers.businessId,
        subSystemId: customPaymentVouchers.subSystemId,
        voucherNumber: customPaymentVouchers.voucherNumber,
        voucherDate: customPaymentVouchers.voucherDate,
        amount: customPaymentVouchers.amount,
        currency: customPaymentVouchers.currency,
        treasuryId: customPaymentVouchers.treasuryId,
        destinationType: customPaymentVouchers.destinationType,
        destinationName: customPaymentVouchers.destinationName,
        description: customPaymentVouchers.description,
        status: customPaymentVouchers.status,
        isReconciled: customPaymentVouchers.isReconciled,
        createdAt: customPaymentVouchers.createdAt,
      }).from(customPaymentVouchers)
        .where(and(...conditions))
        .orderBy(desc(customPaymentVouchers.voucherDate));
