import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const accountingRouter = router({
  // ============================================
  // Chart of Accounts - دليل الحسابات
  // ============================================
  accounts: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        systemModule: z.string().optional(),
        accountType: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAccounts(input.businessId || 1);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const account = await db.getAccountById(input.id);
        if (!account) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الحساب غير موجود" });
        }
        return account;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        level: z.number().optional(),
        systemModule: z.enum([
          "assets", "maintenance", "inventory", "procurement",
          "customers", "billing", "scada", "projects",
          "hr", "operations", "finance", "general"
        ]),
        accountType: z.enum(["main", "sub", "detail"]).optional(),
        nature: z.enum(["debit", "credit"]),
        isParent: z.boolean().optional(),
        isCashAccount: z.boolean().optional(),
        isBankAccount: z.boolean().optional(),
        currency: z.string().optional(),
        openingBalance: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAccount({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        level: z.number().optional(),
        systemModule: z.enum([
          "assets", "maintenance", "inventory", "procurement",
          "customers", "billing", "scada", "projects",
          "hr", "operations", "finance", "general"
        ]).optional(),
        accountType: z.enum(["main", "sub", "detail"]).optional(),
        nature: z.enum(["debit", "credit"]).optional(),
        isParent: z.boolean().optional(),
        isActive: z.boolean().optional(),
        isCashAccount: z.boolean().optional(),
        isBankAccount: z.boolean().optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAccount(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAccount(input.id);
        return { success: true };
      }),

    getTree: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAccountsTree(input.businessId || 1);
      }),
  }),

  // ============================================
  // Journal Entries - القيود اليومية
  // ============================================
  journalEntries: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return await db.getJournalEntries(input.businessId || 1, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const entry = await db.getJournalEntryById(input.id);
        if (!entry) {
          throw new TRPCError({ code: "NOT_FOUND", message: "القيد غير موجود" });
        }
        return entry;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        branchId: z.number().optional(),
        entryDate: z.string(),
        periodId: z.number(),
        type: z.enum([
          "manual", "auto", "opening", "closing", "adjustment",
          "invoice", "payment", "receipt", "transfer", "depreciation"
        ]).optional(),
        sourceModule: z.string().optional(),
        sourceId: z.number().optional(),
        description: z.string().optional(),
        lines: z.array(z.object({
          accountId: z.number(),
          debit: z.string().optional(),
          credit: z.string().optional(),
          description: z.string().optional(),
          costCenterId: z.number().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createJournalEntry({
          ...input,
          businessId: input.businessId || 1,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        entryDate: z.string().optional(),
        description: z.string().optional(),
        lines: z.array(z.object({
          id: z.number().optional(),
          accountId: z.number(),
          debit: z.string().optional(),
          credit: z.string().optional(),
          description: z.string().optional(),
          costCenterId: z.number().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateJournalEntry(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteJournalEntry(input.id);
        return { success: true };
      }),

    post: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.postJournalEntry(input.id, ctx.user?.id || 1);
        return { success: true };
      }),

    reverse: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const newId = await db.reverseJournalEntry(input.id, ctx.user?.id || 1, input.reason);
        return { success: true, newId };
      }),
  }),

  // ============================================
  // Fiscal Periods - الفترات المحاسبية
  // ============================================
  fiscalPeriods: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        year: z.number().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFiscalPeriods(input.businessId || 1, input);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        year: z.number(),
        period: z.number(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createFiscalPeriod({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    close: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.closeFiscalPeriod(input.id, ctx.user?.id || 1);
        return { success: true };
      }),

    reopen: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.reopenFiscalPeriod(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Cost Centers - مراكز التكلفة
  // ============================================
  costCenters: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCostCenters(input.businessId || 1);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        type: z.string().optional(),
        managerId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCostCenter({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        type: z.string().optional(),
        managerId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCostCenter(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCostCenter(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Reports - التقارير
  // ============================================
  reports: router({
    trialBalance: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        asOfDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTrialBalance(input.businessId || 1, input);
      }),

    generalLedger: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        accountId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getGeneralLedger(input.businessId || 1, input);
      }),

    incomeStatement: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getIncomeStatement(input.businessId || 1, input);
      }),

    balanceSheet: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        asOfDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getBalanceSheet(input.businessId || 1, input);
      }),
  }),

  // ============================================
  // Dashboard Stats - إحصائيات لوحة التحكم
  // ============================================
  dashboardStats: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAccountingDashboardStats(input.businessId || 1);
    }),
});
