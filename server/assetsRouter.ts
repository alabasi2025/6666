import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const assetsRouter = router({
  // ============================================
  // Asset Categories - فئات الأصول
  // ============================================
  categories: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAssetCategories(input.businessId || 1);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
        usefulLife: z.number().optional(),
        salvagePercentage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAssetCategory({
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
        depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
        usefulLife: z.number().optional(),
        salvagePercentage: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAssetCategory(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAssetCategory(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Assets - الأصول الثابتة
  // ============================================
  list: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
      stationId: z.number().optional(),
      categoryId: z.number().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAssets(input.businessId || 1, input);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const asset = await db.getAssetById(input.id);
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الأصل غير موجود" });
      }
      return asset;
    }),

  create: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
      branchId: z.number().optional(),
      stationId: z.number().optional(),
      categoryId: z.number(),
      code: z.string().min(1),
      nameAr: z.string().min(1),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      serialNumber: z.string().optional(),
      model: z.string().optional(),
      manufacturer: z.string().optional(),
      purchaseDate: z.string().optional(),
      commissionDate: z.string().optional(),
      purchaseCost: z.string().optional(),
      currentValue: z.string().optional(),
      salvageValue: z.string().optional(),
      usefulLife: z.number().optional(),
      depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
      status: z.enum(["active", "maintenance", "disposed", "transferred", "idle"]).optional(),
      location: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      supplierId: z.number().optional(),
      image: z.string().optional(),
      specifications: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createAsset({
        ...input,
        businessId: input.businessId || 1,
        createdBy: ctx.user?.id || 1,
      });
      return { success: true, id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      branchId: z.number().optional(),
      stationId: z.number().optional(),
      categoryId: z.number().optional(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      serialNumber: z.string().optional(),
      model: z.string().optional(),
      manufacturer: z.string().optional(),
      purchaseDate: z.string().optional(),
      commissionDate: z.string().optional(),
      purchaseCost: z.string().optional(),
      currentValue: z.string().optional(),
      salvageValue: z.string().optional(),
      usefulLife: z.number().optional(),
      depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
      status: z.enum(["active", "maintenance", "disposed", "transferred", "idle"]).optional(),
      location: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      supplierId: z.number().optional(),
      image: z.string().optional(),
      specifications: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAsset(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteAsset(input.id);
      return { success: true };
    }),

  // ============================================
  // Asset Movements - حركات الأصول
  // ============================================
  movements: router({
    list: protectedProcedure
      .input(z.object({
        assetId: z.number().optional(),
        businessId: z.number().optional(),
        movementType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAssetMovements(input);
      }),

    create: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        movementType: z.enum([
          "purchase", "transfer", "maintenance", "upgrade",
          "revaluation", "impairment", "disposal", "depreciation"
        ]),
        movementDate: z.string(),
        fromBranchId: z.number().optional(),
        toBranchId: z.number().optional(),
        fromStationId: z.number().optional(),
        toStationId: z.number().optional(),
        amount: z.string().optional(),
        description: z.string().optional(),
        referenceType: z.string().optional(),
        referenceId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createAssetMovement({
          ...input,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),
  }),

  // ============================================
  // Depreciation - الإهلاك
  // ============================================
  depreciation: router({
    calculate: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        assetIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.calculateDepreciation({
          businessId: input.businessId || 1,
          periodId: input.periodId,
          assetIds: input.assetIds,
          userId: ctx.user?.id || 1,
        });
        return result;
      }),

    getHistory: protectedProcedure
      .input(z.object({
        assetId: z.number().optional(),
        businessId: z.number().optional(),
        year: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getDepreciationHistory(input);
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
      return await db.getAssetDashboardStats(input.businessId || 1);
    }),

  // ============================================
  // Stations - المحطات (للقوائم المنسدلة)
  // ============================================
  stations: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getStations(input.businessId || 1);
      }),
  }),
});
