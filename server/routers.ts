import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Admin procedure - requires admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'يجب أن تكون مديراً للوصول إلى هذه الميزة' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  // Authentication
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Business Management
  business: router({
    list: protectedProcedure.query(async () => {
      return await db.getBusinesses();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBusinessById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["holding", "subsidiary", "branch"]).default("subsidiary"),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        taxNumber: z.string().optional(),
        currency: z.string().default("SAR"),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createBusiness(input);
        return { id, success: true };
      }),
  }),

  // Branch Management
  branch: router({
    list: protectedProcedure
      .input(z.object({ businessId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getBranches(input?.businessId);
      }),
    
    create: adminProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["main", "regional", "local"]).default("local"),
        address: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createBranch(input);
        return { id, success: true };
      }),
  }),

  // Station Management
  station: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        branchId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getStations(input?.businessId, input?.branchId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getStationById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum([
          "generation", "transmission", "distribution", "substation",
          "solar", "wind", "hydro", "thermal", "nuclear", "storage"
        ]),
        status: z.enum(["operational", "maintenance", "offline", "construction", "decommissioned"]).default("operational"),
        capacity: z.number().optional(),
        capacityUnit: z.string().default("MW"),
        voltageLevel: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createStation({
          ...input,
          capacity: input.capacity?.toString(),
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
        });
        return { id, success: true };
      }),
  }),

  // User Management
  user: router({
    list: adminProcedure
      .input(z.object({ businessId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllUsers(input?.businessId);
      }),
  }),

  // Account Management (Chart of Accounts)
  account: router({
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAccounts(input.businessId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAccountById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
        nature: z.enum(["debit", "credit"]),
        isParent: z.boolean().default(false),
        isCashAccount: z.boolean().default(false),
        isBankAccount: z.boolean().default(false),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAccount(input);
        return { id, success: true };
      }),
  }),

  // Asset Management
  asset: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        categoryId: z.number().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAssets(input.businessId, {
          stationId: input.stationId,
          categoryId: input.categoryId,
          status: input.status,
        });
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAssetById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
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
        purchaseCost: z.number().optional(),
        usefulLife: z.number().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createAsset({
          ...input,
          purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
          purchaseCost: input.purchaseCost?.toString(),
          createdBy: ctx.user.id,
        });
        
        await db.createAuditLog({
          businessId: input.businessId,
          userId: ctx.user.id,
          action: 'create',
          module: 'assets',
          entityType: 'asset',
          entityId: id,
          newValues: input,
        });
        
        return { id, success: true };
      }),
  }),

  // Work Order Management
  workOrder: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        type: z.string().optional(),
        stationId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getWorkOrders(input.businessId, {
          status: input.status,
          type: input.type,
          stationId: input.stationId,
        });
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getWorkOrderById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        type: z.enum(["preventive", "corrective", "emergency", "inspection", "calibration"]),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        assetId: z.number().optional(),
        equipmentId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        scheduledStart: z.string().optional(),
        scheduledEnd: z.string().optional(),
        assignedTo: z.number().optional(),
        estimatedHours: z.number().optional(),
        estimatedCost: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const orderNumber = await db.getNextSequence(input.businessId, 'WO');
        
        const id = await db.createWorkOrder({
          ...input,
          orderNumber,
          requestedBy: ctx.user.id,
          requestedDate: new Date(),
          scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : null,
          scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : null,
          estimatedHours: input.estimatedHours?.toString(),
          estimatedCost: input.estimatedCost?.toString(),
          createdBy: ctx.user.id,
        });
        
        await db.createAuditLog({
          businessId: input.businessId,
          userId: ctx.user.id,
          action: 'create',
          module: 'maintenance',
          entityType: 'work_order',
          entityId: id,
          newValues: { ...input, orderNumber },
        });
        
        return { id, orderNumber, success: true };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum([
          "draft", "pending", "approved", "assigned", "in_progress",
          "on_hold", "completed", "cancelled", "closed"
        ]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateWorkOrderStatus(input.id, input.status, ctx.user.id);
        
        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'update_status',
          module: 'maintenance',
          entityType: 'work_order',
          entityId: input.id,
          newValues: { status: input.status },
        });
        
        return { success: true };
      }),
  }),

  // Customer Management
  customer: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        type: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCustomers(input.businessId, {
          status: input.status,
          type: input.type,
          search: input.search,
        });
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["residential", "commercial", "industrial", "government", "agricultural"]).default("residential"),
        idType: z.enum(["national_id", "iqama", "passport", "cr"]).optional(),
        idNumber: z.string().optional(),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const accountNumber = await db.getNextSequence(input.businessId, 'CUST');
        
        const id = await db.createCustomer({
          ...input,
          accountNumber,
        });
        
        await db.createAuditLog({
          businessId: input.businessId,
          userId: ctx.user.id,
          action: 'create',
          module: 'customers',
          entityType: 'customer',
          entityId: id,
          newValues: { ...input, accountNumber },
        });
        
        return { id, accountNumber, success: true };
      }),
  }),

  // Invoice Management
  invoice: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        customerId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getInvoices(input.businessId, {
          status: input.status,
          customerId: input.customerId,
        });
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        customerId: z.number(),
        meterId: z.number().optional(),
        invoiceDate: z.string(),
        dueDate: z.string(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        consumption: z.number().optional(),
        consumptionAmount: z.number().optional(),
        fixedCharges: z.number().optional(),
        taxAmount: z.number().optional(),
        otherCharges: z.number().optional(),
        discountAmount: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const invoiceNumber = await db.getNextSequence(input.businessId, 'INV');
        
        const totalAmount = (input.consumptionAmount || 0) + 
                           (input.fixedCharges || 0) + 
                           (input.taxAmount || 0) + 
                           (input.otherCharges || 0) - 
                           (input.discountAmount || 0);
        
        const id = await db.createInvoice({
          ...input,
          invoiceNumber,
          invoiceDate: new Date(input.invoiceDate),
          dueDate: new Date(input.dueDate),
          periodStart: input.periodStart ? new Date(input.periodStart) : null,
          periodEnd: input.periodEnd ? new Date(input.periodEnd) : null,
          consumption: input.consumption?.toString(),
          consumptionAmount: input.consumptionAmount?.toString(),
          fixedCharges: input.fixedCharges?.toString(),
          taxAmount: input.taxAmount?.toString(),
          otherCharges: input.otherCharges?.toString(),
          discountAmount: input.discountAmount?.toString(),
          totalAmount: totalAmount.toString(),
          balanceDue: totalAmount.toString(),
          createdBy: ctx.user.id,
        });
        
        return { id, invoiceNumber, success: true };
      }),
  }),

  // Equipment Management (SCADA)
  equipment: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getEquipment(input.businessId, input.stationId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number(),
        assetId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum([
          "transformer", "generator", "switchgear", "breaker", "relay",
          "meter", "sensor", "inverter", "battery", "panel", "cable", "motor"
        ]),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        serialNumber: z.string().optional(),
        ratedCapacity: z.number().optional(),
        capacityUnit: z.string().optional(),
        voltageRating: z.string().optional(),
        currentRating: z.string().optional(),
        isControllable: z.boolean().default(false),
        isMonitored: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createEquipment({
          ...input,
          ratedCapacity: input.ratedCapacity?.toString(),
        });
        return { id, success: true };
      }),
  }),

  // Alert Management
  alert: router({
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActiveAlerts(input.businessId);
      }),
    
    acknowledge: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.acknowledgeAlert(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Project Management
  project: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getProjects(input.businessId, {
          status: input.status,
        });
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        type: z.enum([
          "construction", "expansion", "maintenance", "upgrade",
          "installation", "decommission", "study"
        ]),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        managerId: z.number().optional(),
        startDate: z.string().optional(),
        plannedEndDate: z.string().optional(),
        budget: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const code = await db.getNextSequence(input.businessId, 'PRJ');
        
        const id = await db.createProject({
          ...input,
          code,
          budget: input.budget?.toString(),
          startDate: input.startDate ? new Date(input.startDate) : null,
          plannedEndDate: input.plannedEndDate ? new Date(input.plannedEndDate) : null,
          createdBy: ctx.user.id,
        });
        
        return { id, code, success: true };
      }),
  }),

  // Dashboard
  dashboard: router({
    stats: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDashboardStats(input.businessId);
      }),
  }),

  // Inventory
  inventory: router({
    items: router({
      list: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          categoryId: z.number().optional(),
          search: z.string().optional(),
        }))
        .query(async ({ input }) => {
          return await db.getItems(input.businessId, {
            categoryId: input.categoryId,
            search: input.search,
          });
        }),
      
      create: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          categoryId: z.number().optional(),
          code: z.string().min(1),
          nameAr: z.string().min(1),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          type: z.enum(["spare_part", "consumable", "raw_material", "finished_good"]).default("spare_part"),
          unit: z.string().min(1),
          barcode: z.string().optional(),
          minStock: z.number().optional(),
          maxStock: z.number().optional(),
          reorderPoint: z.number().optional(),
          standardCost: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createItem({
            ...input,
            minStock: input.minStock?.toString(),
            maxStock: input.maxStock?.toString(),
            reorderPoint: input.reorderPoint?.toString(),
            standardCost: input.standardCost?.toString(),
          });
          return { id, success: true };
        }),
    }),
    
    suppliers: router({
      list: protectedProcedure
        .input(z.object({ businessId: z.number() }))
        .query(async ({ input }) => {
          return await db.getSuppliers(input.businessId);
        }),
      
      create: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          code: z.string().min(1),
          nameAr: z.string().min(1),
          nameEn: z.string().optional(),
          type: z.enum(["manufacturer", "distributor", "contractor", "service_provider"]).optional(),
          contactPerson: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          taxNumber: z.string().optional(),
          paymentTerms: z.number().default(30),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createSupplier(input);
          return { id, success: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
