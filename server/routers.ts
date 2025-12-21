import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as auth from "./auth";
import { fieldOpsRouter } from "./fieldOpsRouter";
import { hrRouter } from "./hrRouter";
import { customSystemRouter } from "./customSystemRouter";
import { customerSystemRouter } from "./customerSystemRouter";
import { billingRouter } from "./billingRouter";
import { assetsRouter } from "./assetsRouter";
import { accountingRouter } from "./accountingRouter";
import { inventoryRouter } from "./inventoryRouter";
import { maintenanceRouter } from "./maintenanceRouter";
import { projectsRouter } from "./projectsRouter";
import { scadaRouter } from "./scadaRouter";

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
    me: publicProcedure.query(opts => {
      // In development mode or when no user is logged in, return a demo user
      const isDevelopment = process.env.NODE_ENV === 'development';
      const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;
      
      // If user is logged in, return the user
      if (opts.ctx.user) {
        return opts.ctx.user;
      }
      
      // In development or DEMO_MODE, return a demo user for easier testing
      if (isDevelopment || DEMO_MODE) {
        return {
          id: 1,
          openId: 'demo_user_001',
          name: 'مستخدم تجريبي',
          role: 'super_admin',
          email: null,
          phone: null,
          password: null,
          avatar: null,
          loginMethod: null,
          businessId: null,
          branchId: null,
          stationId: null,
          departmentId: null,
          jobTitle: null,
          isActive: true,
          employeeId: null,
          nameAr: null,
          lastSignedIn: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      
      return null;
    }),
    
    loginWithPhone: publicProcedure
      .input(z.object({
        phone: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        // وضع تجريبي - السماح بالدخول بدون قاعدة بيانات
        const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;
        
        if (DEMO_MODE) {
          // مستخدم تجريبي افتراضي
          const demoUser = {
            id: 1,
            openId: 'demo_user_001',
            name: 'مستخدم تجريبي',
            phone: input.phone,
            role: 'super_admin' as const,
          };
          
          const sessionToken = await sdk.createSessionToken(demoUser.openId, { 
            name: demoUser.name,
            expiresInMs: ONE_YEAR_MS 
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          
          return { success: true, user: { id: demoUser.id, name: demoUser.name, role: demoUser.role } };
        }
        
        // استخدام نظام المصادقة الجديد مع bcrypt
        const result = await auth.loginUser(input.phone, input.password);
        
        if (!result.success || !result.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: result.error || 'فشل تسجيل الدخول' });
        }
        
        const user = result.user;
        
        // إنشاء جلسة JWT صحيحة
        const sessionToken = await sdk.createSessionToken(user.openId, { 
          name: user.name || user.phone || '',
          expiresInMs: ONE_YEAR_MS 
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        
        if (process.env.NODE_ENV === 'development') {
          console.log("[Login] Setting cookie:", {
            name: COOKIE_NAME,
            tokenLength: sessionToken.length,
            options: cookieOptions,
            maxAge: ONE_YEAR_MS,
          });
        }
        
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        if (process.env.NODE_ENV === 'development') {
          console.log("[Login] Cookie set successfully, returning user:", { id: user.id, name: user.name, role: user.role });
        }
        
        return { success: true, user: { id: user.id, name: user.name, role: user.role } };
      }),
    
    // تسجيل مستخدم جديد
    register: publicProcedure
      .input(z.object({
        phone: z.string().min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'),
        password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
        name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
        email: z.string().email('البريد الإلكتروني غير صالح').optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;
        
        if (DEMO_MODE) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'التسجيل غير متاح في الوضع التجريبي' });
        }
        
        const result = await auth.registerUser({
          phone: input.phone,
          password: input.password,
          name: input.name,
          email: input.email,
          role: 'user',
        });
        
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error || 'فشل التسجيل' });
        }
        
        return { success: true, userId: result.userId };
      }),
    
    // تغيير كلمة المرور
    changePassword: protectedProcedure
      .input(z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await auth.changePassword(ctx.user.id, input.oldPassword, input.newPassword);
        
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error || 'فشل تغيير كلمة المرور' });
        }
        
        return { success: true };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Business Management
  business: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Business.list] Called by user:", ctx.user?.id, ctx.user?.name);
      }
      const businesses = await db.getBusinesses();
      if (process.env.NODE_ENV === 'development') {
        console.log("[Business.list] Returning", businesses.length, "businesses");
      }
      return businesses;
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
        systemType: z.enum(["energy", "custom"]).default("energy"),
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
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(1).optional(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        type: z.enum(["holding", "subsidiary", "branch"]).optional(),
        systemType: z.enum(["energy", "custom"]).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        taxNumber: z.string().optional(),
        commercialRegister: z.string().optional(),
        currency: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateBusiness(id, data);
        return { id, success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBusiness(input.id);
        return { id: input.id, success: true };
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
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(1).optional(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        type: z.enum(["main", "regional", "local"]).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateBranch(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteBranch(input.id);
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

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(1).optional(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        type: z.enum([
          "generation", "transmission", "distribution", "substation",
          "solar", "wind", "hydro", "thermal", "nuclear", "storage"
        ]).optional(),
        status: z.enum(["operational", "maintenance", "offline", "construction", "decommissioned"]).optional(),
        capacity: z.number().optional(),
        capacityUnit: z.string().optional(),
        voltageLevel: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateStation(id, {
          ...data,
          capacity: data.capacity?.toString(),
          latitude: data.latitude?.toString(),
          longitude: data.longitude?.toString(),
        });
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteStation(input.id);
        return { success: true };
      }),
  }),

  // User Management
  user: router({
    list: adminProcedure
      .input(z.object({ businessId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllUsers(input?.businessId);
      }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        phone: z.string().min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'),
        password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
        name: z.string().min(2, 'الاسم مطلوب'),
        email: z.string().email().optional().nullable(),
        role: z.enum(['user', 'admin', 'super_admin']).default('user'),
        businessId: z.number().optional().nullable(),
        branchId: z.number().optional().nullable(),
        stationId: z.number().optional().nullable(),
        departmentId: z.number().optional().nullable(),
        jobTitle: z.string().optional().nullable(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const result = await auth.registerUser({
          phone: input.phone,
          password: input.password,
          name: input.name,
          email: input.email || undefined,
          role: input.role,
        });
        
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error || 'فشل إنشاء المستخدم' });
        }
        
        // Update additional fields if provided
        if (result.userId && (input.businessId || input.branchId || input.stationId || input.departmentId || input.jobTitle)) {
          await db.updateUser(result.userId, {
            businessId: input.businessId,
            branchId: input.branchId,
            stationId: input.stationId,
            departmentId: input.departmentId,
            jobTitle: input.jobTitle,
          });
        }
        
        return { success: true, userId: result.userId };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(2).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(10).optional(),
        role: z.enum(['user', 'admin', 'super_admin']).optional(),
        businessId: z.number().optional().nullable(),
        branchId: z.number().optional().nullable(),
        stationId: z.number().optional().nullable(),
        departmentId: z.number().optional().nullable(),
        jobTitle: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateUser(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Prevent self-deletion
        if (input.id === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'لا يمكنك حذف حسابك الخاص' });
        }
        await db.deleteUser(input.id);
        return { success: true };
      }),
    
    toggleActive: adminProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        // Prevent self-deactivation
        if (input.id === ctx.user.id && !input.isActive) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'لا يمكنك تعطيل حسابك الخاص' });
        }
        await db.updateUser(input.id, { isActive: input.isActive });
        return { success: true };
      }),
    
    resetPassword: adminProcedure
      .input(z.object({
        id: z.number(),
        newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
      }))
      .mutation(async ({ input }) => {
        const result = await auth.resetPassword(input.id, input.newPassword);
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error || 'فشل إعادة تعيين كلمة المرور' });
        }
        return { success: true };
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
        systemModule: z.enum(["assets", "maintenance", "inventory", "procurement", "customers", "billing", "scada", "projects", "hr", "operations", "finance", "general"]),
        accountType: z.enum(["main", "sub", "detail"]).default("detail"),
        nature: z.enum(["debit", "credit"]),
        isParent: z.boolean().default(false),
        isCashAccount: z.boolean().default(false),
        isBankAccount: z.boolean().default(false),
        description: z.string().optional(),
        linkedEntityType: z.string().optional(),
        linkedEntityId: z.number().optional(),
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

  // ============================================
  // Developer System - نظام المطور
  // ============================================
  developer: router({
    // Dashboard Stats
    dashboardStats: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDeveloperDashboardStats(input.businessId);
      }),

    // Integrations
    integrations: router({
      list: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          type: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .query(async ({ input }) => {
          return await db.getIntegrations(input.businessId, {
            type: input.type,
            isActive: input.isActive,
          });
        }),

      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return await db.getIntegrationById(input.id);
        }),

      create: adminProcedure
        .input(z.object({
          businessId: z.number(),
          code: z.string().min(1),
          nameAr: z.string().min(1),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          integrationType: z.enum(["payment_gateway", "sms", "whatsapp", "email", "iot", "erp", "crm", "scada", "gis", "weather", "maps", "other"]),
          category: z.enum(["local", "international", "internal"]).default("local"),
          provider: z.string().optional(),
          baseUrl: z.string().optional(),
          apiVersion: z.string().optional(),
          authType: z.enum(["api_key", "oauth2", "basic", "hmac", "jwt", "none"]).default("api_key"),
          webhookUrl: z.string().optional(),
          rateLimitPerMinute: z.number().default(60),
          timeoutSeconds: z.number().default(30),
          retryAttempts: z.number().default(3),
        }))
        .mutation(async ({ input, ctx }) => {
          const id = await db.createIntegration({
            ...input,
            createdBy: ctx.user.id,
          });
          return { id, success: true };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          baseUrl: z.string().optional(),
          apiVersion: z.string().optional(),
          isActive: z.boolean().optional(),
          isPrimary: z.boolean().optional(),
          priority: z.number().optional(),
          webhookUrl: z.string().optional(),
          rateLimitPerMinute: z.number().optional(),
          timeoutSeconds: z.number().optional(),
          retryAttempts: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateIntegration(id, data);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteIntegration(input.id);
          return { success: true };
        }),

      // Integration Configs
      getConfigs: protectedProcedure
        .input(z.object({ integrationId: z.number() }))
        .query(async ({ input }) => {
          return await db.getIntegrationConfigs(input.integrationId);
        }),

      setConfig: adminProcedure
        .input(z.object({
          integrationId: z.number(),
          key: z.string().min(1),
          value: z.string(),
          isEncrypted: z.boolean().default(false),
          valueType: z.enum(["string", "number", "boolean", "json"]).default("string"),
        }))
        .mutation(async ({ input }) => {
          await db.setIntegrationConfig(input.integrationId, input.key, input.value, {
            isEncrypted: input.isEncrypted,
            valueType: input.valueType,
          });
          return { success: true };
        }),

      // Integration Logs
      getLogs: protectedProcedure
        .input(z.object({ integrationId: z.number(), limit: z.number().default(100) }))
        .query(async ({ input }) => {
          return await db.getIntegrationLogs(input.integrationId, input.limit);
        }),
    }),

    // Events System
    events: router({
      list: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          eventType: z.string().optional(),
          status: z.string().optional(),
          limit: z.number().default(100),
        }))
        .query(async ({ input }) => {
          return await db.getSystemEvents(input.businessId, input);
        }),

      create: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          eventType: z.string().min(1),
          eventSource: z.string().min(1),
          aggregateType: z.string().optional(),
          aggregateId: z.number().optional(),
          payload: z.any(),
          metadata: z.any().optional(),
          correlationId: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createSystemEvent({
            ...input,
            payload: JSON.stringify(input.payload),
            metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          });
          return { id, success: true };
        }),

      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["pending", "processing", "completed", "failed"]),
          errorMessage: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          await db.updateEventStatus(input.id, input.status, input.errorMessage);
          return { success: true };
        }),
    }),

    // Event Subscriptions
    subscriptions: router({
      list: protectedProcedure
        .input(z.object({ businessId: z.number(), eventType: z.string().optional() }))
        .query(async ({ input }) => {
          return await db.getEventSubscriptions(input.businessId, input.eventType);
        }),

      create: adminProcedure
        .input(z.object({
          businessId: z.number(),
          subscriberName: z.string().min(1),
          eventType: z.string().min(1),
          handlerType: z.enum(["webhook", "queue", "function", "email", "sms"]),
          handlerConfig: z.any(),
          filterExpression: z.any().optional(),
          priority: z.number().default(0),
          maxRetries: z.number().default(3),
          retryDelaySeconds: z.number().default(60),
        }))
        .mutation(async ({ input, ctx }) => {
          const id = await db.createEventSubscription({
            ...input,
            handlerConfig: JSON.stringify(input.handlerConfig),
            filterExpression: input.filterExpression ? JSON.stringify(input.filterExpression) : null,
            createdBy: ctx.user.id,
          });
          return { id, success: true };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          isActive: z.boolean().optional(),
          priority: z.number().optional(),
          maxRetries: z.number().optional(),
          retryDelaySeconds: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateEventSubscription(id, data);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteEventSubscription(input.id);
          return { success: true };
        }),
    }),

    // API Keys
    apiKeys: router({
      list: protectedProcedure
        .input(z.object({ businessId: z.number() }))
        .query(async ({ input }) => {
          return await db.getApiKeys(input.businessId);
        }),

      create: adminProcedure
        .input(z.object({
          businessId: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          permissions: z.any().optional(),
          allowedIps: z.array(z.string()).optional(),
          allowedOrigins: z.array(z.string()).optional(),
          rateLimitPerMinute: z.number().default(60),
          rateLimitPerDay: z.number().default(10000),
          expiresAt: z.date().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          // Generate API key
          const keyPrefix = 'ems_' + Math.random().toString(36).substring(2, 8);
          const keySecret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
          const fullKey = `${keyPrefix}_${keySecret}`;
          
          // Hash the key for storage
          const crypto = await import('crypto');
          const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

          const id = await db.createApiKey({
            ...input,
            keyHash,
            keyPrefix,
            permissions: input.permissions ? JSON.stringify(input.permissions) : null,
            allowedIps: input.allowedIps ? JSON.stringify(input.allowedIps) : null,
            allowedOrigins: input.allowedOrigins ? JSON.stringify(input.allowedOrigins) : null,
            createdBy: ctx.user.id,
          });

          // Return the full key only once (it won't be retrievable later)
          return { id, apiKey: fullKey, success: true };
        }),

      revoke: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.revokeApiKey(input.id);
          return { success: true };
        }),

      getLogs: protectedProcedure
        .input(z.object({ businessId: z.number(), apiKeyId: z.number().optional(), limit: z.number().default(100) }))
        .query(async ({ input }) => {
          return await db.getApiLogs(input.businessId, { apiKeyId: input.apiKeyId, limit: input.limit });
        }),
    }),

    // AI Models
    ai: router({
      models: router({
        list: protectedProcedure
          .input(z.object({ businessId: z.number(), modelType: z.string().optional() }))
          .query(async ({ input }) => {
            return await db.getAiModels(input.businessId, input.modelType);
          }),

        getById: protectedProcedure
          .input(z.object({ id: z.number() }))
          .query(async ({ input }) => {
            return await db.getAiModelById(input.id);
          }),

        create: adminProcedure
          .input(z.object({
            businessId: z.number(),
            code: z.string().min(1),
            nameAr: z.string().min(1),
            nameEn: z.string().optional(),
            description: z.string().optional(),
            modelType: z.enum(["consumption_forecast", "fault_detection", "load_optimization", "anomaly_detection", "demand_prediction", "maintenance_prediction", "customer_churn", "fraud_detection", "price_optimization", "other"]),
            provider: z.enum(["internal", "openai", "azure", "google", "aws", "custom"]).default("internal"),
            modelVersion: z.string().optional(),
            endpoint: z.string().optional(),
            inputSchema: z.any().optional(),
            outputSchema: z.any().optional(),
          }))
          .mutation(async ({ input, ctx }) => {
            const id = await db.createAiModel({
              ...input,
              inputSchema: input.inputSchema ? JSON.stringify(input.inputSchema) : null,
              outputSchema: input.outputSchema ? JSON.stringify(input.outputSchema) : null,
              createdBy: ctx.user.id,
            });
            return { id, success: true };
          }),

        update: adminProcedure
          .input(z.object({
            id: z.number(),
            nameAr: z.string().optional(),
            nameEn: z.string().optional(),
            description: z.string().optional(),
            modelVersion: z.string().optional(),
            endpoint: z.string().optional(),
            isActive: z.boolean().optional(),
            accuracy: z.number().optional(),
          }))
          .mutation(async ({ input }) => {
            const { id, accuracy, ...data } = input;
            await db.updateAiModel(id, {
              ...data,
              accuracy: accuracy?.toString(),
            });
            return { success: true };
          }),
      }),

      predictions: router({
        list: protectedProcedure
          .input(z.object({
            businessId: z.number(),
            modelId: z.number().optional(),
            predictionType: z.string().optional(),
            limit: z.number().default(100),
          }))
          .query(async ({ input }) => {
            return await db.getAiPredictions(input.businessId, input);
          }),

        create: protectedProcedure
          .input(z.object({
            modelId: z.number(),
            businessId: z.number(),
            predictionType: z.string().min(1),
            targetEntity: z.string().optional(),
            targetEntityId: z.number().optional(),
            inputData: z.any(),
            prediction: z.any(),
            confidence: z.number().optional(),
            predictionDate: z.string(),
            validFrom: z.date().optional(),
            validTo: z.date().optional(),
          }))
          .mutation(async ({ input }) => {
            const id = await db.createAiPrediction({
              ...input,
              inputData: JSON.stringify(input.inputData),
              prediction: JSON.stringify(input.prediction),
              confidence: input.confidence?.toString(),
              predictionDate: new Date(input.predictionDate),
            });
            return { id, success: true };
          }),

        verify: protectedProcedure
          .input(z.object({
            id: z.number(),
            actualValue: z.any(),
          }))
          .mutation(async ({ input, ctx }) => {
            await db.verifyPrediction(input.id, input.actualValue, ctx.user.id);
            return { success: true };
          }),
      }),
    }),

    // Technical Alerts
    alerts: router({
      rules: router({
        list: protectedProcedure
          .input(z.object({ businessId: z.number(), category: z.string().optional() }))
          .query(async ({ input }) => {
            return await db.getTechnicalAlertRules(input.businessId, input.category);
          }),

        create: adminProcedure
          .input(z.object({
            businessId: z.number(),
            code: z.string().min(1),
            nameAr: z.string().min(1),
            nameEn: z.string().optional(),
            description: z.string().optional(),
            category: z.enum(["performance", "security", "availability", "integration", "database", "api", "system"]),
            severity: z.enum(["info", "warning", "error", "critical"]).default("warning"),
            condition: z.any(),
            threshold: z.number().optional(),
            comparisonOperator: z.enum(["gt", "gte", "lt", "lte", "eq", "neq"]).optional(),
            evaluationPeriodMinutes: z.number().default(5),
            cooldownMinutes: z.number().default(15),
            notificationChannels: z.any().optional(),
            escalationRules: z.any().optional(),
          }))
          .mutation(async ({ input, ctx }) => {
            const id = await db.createTechnicalAlertRule({
              ...input,
              condition: JSON.stringify(input.condition),
              threshold: input.threshold?.toString(),
              notificationChannels: input.notificationChannels ? JSON.stringify(input.notificationChannels) : null,
              escalationRules: input.escalationRules ? JSON.stringify(input.escalationRules) : null,
              createdBy: ctx.user.id,
            });
            return { id, success: true };
          }),

        update: adminProcedure
          .input(z.object({
            id: z.number(),
            nameAr: z.string().optional(),
            nameEn: z.string().optional(),
            description: z.string().optional(),
            severity: z.enum(["info", "warning", "error", "critical"]).optional(),
            threshold: z.number().optional(),
            isActive: z.boolean().optional(),
          }))
          .mutation(async ({ input }) => {
            const { id, threshold, ...data } = input;
            await db.updateTechnicalAlertRule(id, {
              ...data,
              threshold: threshold?.toString(),
            });
            return { success: true };
          }),
      }),

      list: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          status: z.string().optional(),
          severity: z.string().optional(),
          limit: z.number().default(100),
        }))
        .query(async ({ input }) => {
          return await db.getTechnicalAlerts(input.businessId, input);
        }),

      acknowledge: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          await db.acknowledgeTechnicalAlert(input.id, ctx.user.id);
          return { success: true };
        }),

      resolve: protectedProcedure
        .input(z.object({ id: z.number(), notes: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
          await db.resolveTechnicalAlert(input.id, ctx.user.id, input.notes);
          return { success: true };
        }),
    }),

    // Performance Metrics
    metrics: router({
      record: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          metricType: z.enum(["response_time", "throughput", "error_rate", "cpu_usage", "memory_usage", "disk_usage", "network_io", "db_connections", "active_users", "api_calls", "queue_size", "cache_hit_rate"]),
          source: z.string().optional(),
          value: z.number(),
          unit: z.string().optional(),
          tags: z.any().optional(),
        }))
        .mutation(async ({ input }) => {
          await db.recordPerformanceMetric({
            ...input,
            value: input.value.toString(),
            tags: input.tags ? JSON.stringify(input.tags) : null,
          });
          return { success: true };
        }),

      get: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          metricType: z.string(),
          hours: z.number().default(24),
        }))
        .query(async ({ input }) => {
          return await db.getPerformanceMetrics(input.businessId, input.metricType, input.hours);
        }),
    }),

    // Webhooks
    webhooks: router({
      list: protectedProcedure
        .input(z.object({ integrationId: z.number(), limit: z.number().default(100) }))
        .query(async ({ input }) => {
          return await db.getIncomingWebhooks(input.integrationId, input.limit);
        }),
    }),
  }),

  // Field Operations System
  fieldOps: fieldOpsRouter,

  // HR System - نظام الموارد البشرية
  hr: hrRouter,

  // Custom System - النظام المخصص
  customSystem: customSystemRouter,
  customerSystem: customerSystemRouter,
  billing: billingRouter,
  // Asset Management System - نظام إدارة الأصول
  assets: assetsRouter,
  // Accounting System - النظام المحاسبي
  accounting: accountingRouter,
  // Inventory System - نظام المخزون
  inventory: inventoryRouter,
  // Maintenance System - نظام الصيانة
  maintenance: maintenanceRouter,
  // Projects System - نظام المشاريع
  projects: projectsRouter,
  // SCADA System - نظام المراقبة والتحكم
  scada: scadaRouter,
});

export type AppRouter = typeof appRouter;
