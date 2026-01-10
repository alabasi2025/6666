/**
 * Mobile Apps Router
 * نظام تطبيقات الجوال
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import {
  mobileApps,
  mobileAppScreens,
  mobileAppFeatures,
  mobileAppPermissions,
  userMobileAppAccess,
} from "../drizzle/schemas/mobile-apps";
import { eq, and, desc, like, or } from "drizzle-orm";

export const mobileAppsRouter = router({
  // ============================================
  // Apps Management - إدارة التطبيقات
  // ============================================

  /**
   * الحصول على قائمة التطبيقات
   */
  getApps: protectedProcedure
    .input(
      z.object({
        businessId: z.number(),
        appType: z.enum(["customer", "employee"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(mobileApps).where(eq(mobileApps.businessId, input.businessId));

      if (input.appType) {
        query = query.where(eq(mobileApps.appType, input.appType));
      }

      return await query.orderBy(desc(mobileApps.createdAt));
    }),

  /**
   * الحصول على تطبيق محدد
   */
  getApp: protectedProcedure
    .input(z.object({ appId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [app] = await db
        .select()
        .from(mobileApps)
        .where(eq(mobileApps.id, input.appId))
        .limit(1);

      if (!app) throw new Error("App not found");

      return app;
    }),

  /**
   * إنشاء تطبيق جديد
   */
  createApp: protectedProcedure
    .input(
      z.object({
        businessId: z.number(),
        appType: z.enum(["customer", "employee"]),
        appName: z.string(),
        appVersion: z.string().optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(mobileApps).values({
        businessId: input.businessId,
        appType: input.appType,
        appName: input.appName,
        appVersion: input.appVersion,
        config: input.config ? JSON.stringify(input.config) : null,
        isActive: true,
      });

      return { id: result.insertId, success: true };
    }),

  /**
   * تحديث تطبيق
   */
  updateApp: protectedProcedure
    .input(
      z.object({
        appId: z.number(),
        appName: z.string().optional(),
        appVersion: z.string().optional(),
        isActive: z.boolean().optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {};
      if (input.appName) updateData.appName = input.appName;
      if (input.appVersion) updateData.appVersion = input.appVersion;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.config) updateData.config = JSON.stringify(input.config);

      await db
        .update(mobileApps)
        .set(updateData)
        .where(eq(mobileApps.id, input.appId));

      return { success: true };
    }),

  // ============================================
  // Screens Management - إدارة الشاشات
  // ============================================

  /**
   * الحصول على قائمة الشاشات
   */
  getScreens: protectedProcedure
    .input(
      z.object({
        appId: z.number(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(mobileAppScreens)
        .where(eq(mobileAppScreens.appId, input.appId));

      if (input.isActive !== undefined) {
        query = query.where(eq(mobileAppScreens.isActive, input.isActive));
      }

      return await query.orderBy(mobileAppScreens.orderIndex);
    }),

  /**
   * الحصول على شاشة محددة
   */
  getScreen: protectedProcedure
    .input(z.object({ screenId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [screen] = await db
        .select()
        .from(mobileAppScreens)
        .where(eq(mobileAppScreens.id, input.screenId))
        .limit(1);

      if (!screen) throw new Error("Screen not found");

      return screen;
    }),

  /**
   * إنشاء شاشة جديدة
   */
  createScreen: protectedProcedure
    .input(
      z.object({
        appId: z.number(),
        screenCode: z.string(),
        screenNameAr: z.string(),
        screenNameEn: z.string().optional(),
        screenType: z.enum(["dashboard", "list", "detail", "form", "map", "profile"]),
        routePath: z.string().optional(),
        icon: z.string().optional(),
        orderIndex: z.number().default(0),
        permissions: z.array(z.string()).optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(mobileAppScreens).values({
        appId: input.appId,
        screenCode: input.screenCode,
        screenNameAr: input.screenNameAr,
        screenNameEn: input.screenNameEn,
        screenType: input.screenType,
        routePath: input.routePath,
        icon: input.icon,
        orderIndex: input.orderIndex,
        permissions: input.permissions ? JSON.stringify(input.permissions) : null,
        config: input.config ? JSON.stringify(input.config) : null,
        isActive: true,
      });

      return { id: result.insertId, success: true };
    }),

  /**
   * تحديث شاشة
   */
  updateScreen: protectedProcedure
    .input(
      z.object({
        screenId: z.number(),
        screenNameAr: z.string().optional(),
        screenNameEn: z.string().optional(),
        screenType: z.enum(["dashboard", "list", "detail", "form", "map", "profile"]).optional(),
        routePath: z.string().optional(),
        icon: z.string().optional(),
        orderIndex: z.number().optional(),
        isActive: z.boolean().optional(),
        permissions: z.array(z.string()).optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {};
      if (input.screenNameAr) updateData.screenNameAr = input.screenNameAr;
      if (input.screenNameEn) updateData.screenNameEn = input.screenNameEn;
      if (input.screenType) updateData.screenType = input.screenType;
      if (input.routePath) updateData.routePath = input.routePath;
      if (input.icon) updateData.icon = input.icon;
      if (input.orderIndex !== undefined) updateData.orderIndex = input.orderIndex;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.permissions) updateData.permissions = JSON.stringify(input.permissions);
      if (input.config) updateData.config = JSON.stringify(input.config);

      await db
        .update(mobileAppScreens)
        .set(updateData)
        .where(eq(mobileAppScreens.id, input.screenId));

      return { success: true };
    }),

  /**
   * حذف شاشة
   */
  deleteScreen: protectedProcedure
    .input(z.object({ screenId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(mobileAppScreens).where(eq(mobileAppScreens.id, input.screenId));

      return { success: true };
    }),

  // ============================================
  // Features Management - إدارة الوظائف
  // ============================================

  /**
   * الحصول على قائمة الوظائف
   */
  getFeatures: protectedProcedure
    .input(
      z.object({
        appId: z.number(),
        screenId: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(mobileAppFeatures)
        .where(eq(mobileAppFeatures.appId, input.appId));

      if (input.screenId) {
        query = query.where(eq(mobileAppFeatures.screenId, input.screenId));
      }

      if (input.isActive !== undefined) {
        query = query.where(eq(mobileAppFeatures.isActive, input.isActive));
      }

      return await query;
    }),

  /**
   * إنشاء وظيفة جديدة
   */
  createFeature: protectedProcedure
    .input(
      z.object({
        appId: z.number(),
        screenId: z.number().optional(),
        featureCode: z.string(),
        featureNameAr: z.string(),
        featureNameEn: z.string().optional(),
        featureType: z.enum(["action", "view", "form_field", "button", "menu_item"]),
        permissionCode: z.string().optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(mobileAppFeatures).values({
        appId: input.appId,
        screenId: input.screenId || null,
        featureCode: input.featureCode,
        featureNameAr: input.featureNameAr,
        featureNameEn: input.featureNameEn,
        featureType: input.featureType,
        permissionCode: input.permissionCode,
        config: input.config ? JSON.stringify(input.config) : null,
        isActive: true,
      });

      return { id: result.insertId, success: true };
    }),

  /**
   * تحديث وظيفة
   */
  updateFeature: protectedProcedure
    .input(
      z.object({
        featureId: z.number(),
        featureNameAr: z.string().optional(),
        featureNameEn: z.string().optional(),
        featureType: z.enum(["action", "view", "form_field", "button", "menu_item"]).optional(),
        permissionCode: z.string().optional(),
        isActive: z.boolean().optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {};
      if (input.featureNameAr) updateData.featureNameAr = input.featureNameAr;
      if (input.featureNameEn) updateData.featureNameEn = input.featureNameEn;
      if (input.featureType) updateData.featureType = input.featureType;
      if (input.permissionCode) updateData.permissionCode = input.permissionCode;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.config) updateData.config = JSON.stringify(input.config);

      await db
        .update(mobileAppFeatures)
        .set(updateData)
        .where(eq(mobileAppFeatures.id, input.featureId));

      return { success: true };
    }),

  // ============================================
  // Permissions Management - إدارة الصلاحيات
  // ============================================

  /**
   * الحصول على قائمة الصلاحيات
   */
  getPermissions: protectedProcedure
    .input(z.object({ appId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(mobileAppPermissions)
        .where(eq(mobileAppPermissions.appId, input.appId))
        .orderBy(mobileAppPermissions.permissionCode);
    }),

  /**
   * إنشاء صلاحية جديدة
   */
  createPermission: protectedProcedure
    .input(
      z.object({
        appId: z.number(),
        permissionCode: z.string(),
        permissionNameAr: z.string(),
        permissionNameEn: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(mobileAppPermissions).values({
        appId: input.appId,
        permissionCode: input.permissionCode,
        permissionNameAr: input.permissionNameAr,
        permissionNameEn: input.permissionNameEn,
        description: input.description,
        isActive: true,
      });

      return { id: result.insertId, success: true };
    }),

  // ============================================
  // User Access Management - إدارة وصول المستخدمين
  // ============================================

  /**
   * الحصول على وصول مستخدم
   */
  getUserAccess: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        appId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(userMobileAppAccess)
        .where(eq(userMobileAppAccess.userId, input.userId));

      if (input.appId) {
        query = query.where(eq(userMobileAppAccess.appId, input.appId));
      }

      return await query;
    }),

  /**
   * منح وصول لمستخدم
   */
  grantAccess: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        appId: z.number(),
        grantedPermissions: z.array(z.string()).optional(),
        deniedPermissions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من وجود وصول سابق
      const [existing] = await db
        .select()
        .from(userMobileAppAccess)
        .where(
          and(
            eq(userMobileAppAccess.userId, input.userId),
            eq(userMobileAppAccess.appId, input.appId)
          )
        )
        .limit(1);

      if (existing) {
        // تحديث الوصول الموجود
        const updateData: any = {
          isActive: true,
        };
        if (input.grantedPermissions) {
          updateData.grantedPermissions = JSON.stringify(input.grantedPermissions);
        }
        if (input.deniedPermissions) {
          updateData.deniedPermissions = JSON.stringify(input.deniedPermissions);
        }

        await db
          .update(userMobileAppAccess)
          .set(updateData)
          .where(eq(userMobileAppAccess.id, existing.id));
      } else {
        // إنشاء وصول جديد
        await db.insert(userMobileAppAccess).values({
          userId: input.userId,
          appId: input.appId,
          grantedPermissions: input.grantedPermissions
            ? JSON.stringify(input.grantedPermissions)
            : null,
          deniedPermissions: input.deniedPermissions
            ? JSON.stringify(input.deniedPermissions)
            : null,
          isActive: true,
        });
      }

      return { success: true };
    }),

  /**
   * سحب وصول من مستخدم
   */
  revokeAccess: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        appId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(userMobileAppAccess)
        .set({ isActive: false })
        .where(
          and(
            eq(userMobileAppAccess.userId, input.userId),
            eq(userMobileAppAccess.appId, input.appId)
          )
        );

      return { success: true };
    }),

  /**
   * الحصول على جميع المستخدمين الذين لديهم وصول
   */
  getUsersWithAccess: protectedProcedure
    .input(z.object({ appId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(userMobileAppAccess)
        .where(
          and(
            eq(userMobileAppAccess.appId, input.appId),
            eq(userMobileAppAccess.isActive, true)
          )
        );
    }),
});

