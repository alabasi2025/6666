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
import { dieselRouter } from "./dieselRouter";
import { logger } from './utils/logger';

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
          logger.debug("[Login] Setting cookie", {
            name: COOKIE_NAME,
            tokenLength: sessionToken.length,
            options: cookieOptions,
            maxAge: ONE_YEAR_MS,
          });
        }
        
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        if (process.env.NODE_ENV === 'development') {
          logger.debug("[Login] Cookie set successfully, returning user", { id: user.id, name: user.name, role: user.role });
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
        logger.debug("[Business.list] Called by user", { userId: ctx.user?.id, userName: ctx.user?.name });
      }
      const businesses = await db.getBusinesses();
      if (process.env.NODE_ENV === 'development') {
        logger.debug("[Business.list] Returning", { count: businesses.length });
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
        systemType: z.enum(["energy", "custom", "both"]).default("both"),
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
        systemType: z.enum(["energy", "custom", "both"]).optional(),
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
