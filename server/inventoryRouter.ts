import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const inventoryRouter = router({
  // ============================================
  // Warehouses - المستودعات
  // ============================================
  warehouses: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        branchId: z.number().optional(),
        type: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getWarehouses(input.businessId || 1, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const warehouse = await db.getWarehouseById(input.id);
        if (!warehouse) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المستودع غير موجود" });
        }
        return warehouse;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["main", "spare_parts", "consumables", "transit", "quarantine"]).optional(),
        address: z.string().optional(),
        managerId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createWarehouse({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        type: z.enum(["main", "spare_parts", "consumables", "transit", "quarantine"]).optional(),
        address: z.string().optional(),
        managerId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateWarehouse(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWarehouse(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Item Categories - فئات الأصناف
  // ============================================
  categories: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getItemCategories(input.businessId || 1);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        inventoryAccountId: z.number().optional(),
        cogsAccountId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createItemCategory({
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
        inventoryAccountId: z.number().optional(),
        cogsAccountId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateItemCategory(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteItemCategory(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Items - الأصناف
  // ============================================
  items: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        categoryId: z.number().optional(),
        type: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getItems(input.businessId || 1, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const item = await db.getItemById(input.id);
        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الصنف غير موجود" });
        }
        return item;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        categoryId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["spare_part", "consumable", "raw_material", "finished_good"]).optional(),
        unit: z.string().min(1),
        barcode: z.string().optional(),
        minStock: z.string().optional(),
        maxStock: z.string().optional(),
        reorderPoint: z.string().optional(),
        reorderQty: z.string().optional(),
        standardCost: z.string().optional(),
        image: z.string().optional(),
        specifications: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createItem({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["spare_part", "consumable", "raw_material", "finished_good"]).optional(),
        unit: z.string().optional(),
        barcode: z.string().optional(),
        minStock: z.string().optional(),
        maxStock: z.string().optional(),
        reorderPoint: z.string().optional(),
        reorderQty: z.string().optional(),
        standardCost: z.string().optional(),
        image: z.string().optional(),
        specifications: z.any().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateItem(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteItem(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Stock Balances - أرصدة المخزون
  // ============================================
  stockBalances: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        warehouseId: z.number().optional(),
        itemId: z.number().optional(),
        belowMin: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getStockBalances(input);
      }),

    getByItem: protectedProcedure
      .input(z.object({
        itemId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getStockBalancesByItem(input.itemId);
      }),

    getByWarehouse: protectedProcedure
      .input(z.object({
        warehouseId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getStockBalancesByWarehouse(input.warehouseId);
      }),
  }),

  // ============================================
  // Stock Movements - حركات المخزون
  // ============================================
  movements: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        warehouseId: z.number().optional(),
        itemId: z.number().optional(),
        movementType: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return await db.getStockMovements(input.businessId || 1, input);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        itemId: z.number(),
        warehouseId: z.number(),
        movementType: z.enum([
          "receipt", "issue", "transfer_in", "transfer_out",
          "adjustment_in", "adjustment_out", "return", "scrap"
        ]),
        movementDate: z.string(),
        documentType: z.string().optional(),
        documentId: z.number().optional(),
        documentNumber: z.string().optional(),
        quantity: z.string(),
        unitCost: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createStockMovement({
          ...input,
          businessId: input.businessId || 1,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),

    transfer: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        itemId: z.number(),
        fromWarehouseId: z.number(),
        toWarehouseId: z.number(),
        quantity: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.transferStock({
          ...input,
          businessId: input.businessId || 1,
          userId: ctx.user?.id || 1,
        });
        return { success: true, ...result };
      }),

    adjust: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        itemId: z.number(),
        warehouseId: z.number(),
        adjustmentType: z.enum(["in", "out"]),
        quantity: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.adjustStock({
          ...input,
          businessId: input.businessId || 1,
          userId: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),
  }),

  // ============================================
  // Suppliers - الموردين
  // ============================================
  suppliers: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        type: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSuppliers(input.businessId || 1);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const supplier = await db.getSupplierById(input.id);
        if (!supplier) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المورد غير موجود" });
        }
        return supplier;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["manufacturer", "distributor", "contractor", "service_provider"]).optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        taxNumber: z.string().optional(),
        paymentTerms: z.number().optional(),
        creditLimit: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createSupplier({
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
        type: z.enum(["manufacturer", "distributor", "contractor", "service_provider"]).optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        taxNumber: z.string().optional(),
        paymentTerms: z.number().optional(),
        creditLimit: z.string().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSupplier(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSupplier(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Purchase Orders - أوامر الشراء
  // ============================================
  purchaseOrders: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        supplierId: z.number().optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return await db.getPurchaseOrders(input.businessId || 1, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "أمر الشراء غير موجود" });
        }
        return order;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        branchId: z.number().optional(),
        supplierId: z.number(),
        orderDate: z.string(),
        deliveryDate: z.string().optional(),
        warehouseId: z.number().optional(),
        paymentTerms: z.number().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
        terms: z.string().optional(),
        items: z.array(z.object({
          itemId: z.number(),
          quantity: z.string(),
          unitPrice: z.string(),
          taxRate: z.string().optional(),
          discount: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createPurchaseOrder({
          ...input,
          businessId: input.businessId || 1,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum([
          "draft", "pending", "approved", "sent", "partial_received",
          "received", "cancelled", "closed"
        ]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updatePurchaseOrderStatus(input.id, input.status, ctx.user?.id || 1);
        return { success: true };
      }),

    receive: protectedProcedure
      .input(z.object({
        id: z.number(),
        items: z.array(z.object({
          itemId: z.number(),
          receivedQty: z.string(),
        })),
        warehouseId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.receivePurchaseOrder({
          ...input,
          userId: ctx.user?.id || 1,
        });
        return { success: true };
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
      return await db.getInventoryDashboardStats(input.businessId || 1);
    }),
});
