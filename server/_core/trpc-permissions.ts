// server/_core/trpc-permissions.ts
// Middleware للتحقق من الصلاحيات في tRPC

import { TRPCError } from "@trpc/server";
import { permissionChecker } from "../permissions/permission-checker";
import { ResourceType, PermissionAction } from "../permissions/types";
import type { TrpcContext } from "./context";
import { logger } from "../utils/logger";

/**
 * إنشاء middleware للتحقق من صلاحية معينة
 */
export function requirePermission(resource: ResourceType, action: PermissionAction) {
  return async (opts: { ctx: TrpcContext; next: any }) => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ 
        code: "UNAUTHORIZED", 
        message: "يجب تسجيل الدخول أولاً" 
      });
    }

    // ✅ الحصول على صلاحيات المستخدم من قاعدة البيانات
    const { getDb } = await import("../db");
    const { roles, userRoles, rolePermissions, permissions } = await import("../../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");
    
    const db = await getDb();
    let userRole = ctx.user.role || 'viewer';
    const additionalPermissions: string[] = [];
    const deniedPermissions: string[] = [];

    if (db) {
      try {
        // جلب أدوار المستخدم من جدول user_roles
        const userRolesList = await db
          .select({
            roleName: roles.name,
            roleId: roles.id,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, ctx.user.id));

        // استخدام أول دور إذا كان موجوداً
        if (userRolesList.length > 0) {
          userRole = userRolesList[0].roleName || userRole;
          
          // جلب صلاحيات الدور من role_permissions
          const rolePerms = await db
            .select({
              permissionSlug: permissions.slug,
            })
            .from(rolePermissions)
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(eq(rolePermissions.roleId, userRolesList[0].roleId));

          // إضافة صلاحيات الدور (سيتم التحقق منها في permissionChecker)
          rolePerms.forEach((perm: any) => {
            if (perm.permissionSlug) {
              additionalPermissions.push(perm.permissionSlug);
            }
          });
        }

        // يمكن إضافة منطق لجلب صلاحيات إضافية مخصصة أو مرفوضة من جداول إضافية هنا
      } catch (error: any) {
        // في حالة الخطأ، نستخدم role من user كـ fallback
        logger.warn('Failed to load user permissions from database', {
          userId: ctx.user.id,
          error: error.message,
        });
      }
    }
    
    // تعيين صلاحيات المستخدم في permissionChecker
    permissionChecker.setUserPermissions(
      ctx.user.id,
      userRole,
      additionalPermissions,
      deniedPermissions
    );

    // التحقق من الصلاحية
    const result = permissionChecker.check(ctx.user.id, resource, action);

    if (!result.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: result.reason || "ليس لديك الصلاحية المطلوبة",
        cause: {
          requiredPermission: result.requiredPermission,
        },
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  };
}

/**
 * إنشاء middleware للتحقق من صلاحيات متعددة (AND)
 */
export function requireAllPermissions(
  permissions: Array<{ resource: ResourceType; action: PermissionAction }>
) {
  return async (opts: { ctx: TrpcContext; next: any }) => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ 
        code: "UNAUTHORIZED", 
        message: "يجب تسجيل الدخول أولاً" 
      });
    }

    // ✅ جلب صلاحيات المستخدم من قاعدة البيانات
    const { getDb } = await import("../db");
    const { roles, userRoles } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    const db = await getDb();
    let userRole = ctx.user.role || 'viewer';

    if (db) {
      try {
        const userRolesList = await db
          .select({ roleName: roles.name })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, ctx.user.id))
          .limit(1);

        if (userRolesList.length > 0) {
          userRole = userRolesList[0].roleName || userRole;
        }
      } catch (error: any) {
        logger.warn('Failed to load user role from database', {
          userId: ctx.user.id,
          error: error.message,
        });
      }
    }

    permissionChecker.setUserPermissions(ctx.user.id, userRole, [], []);

    const result = permissionChecker.checkAll(ctx.user.id, permissions);

    if (!result.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: result.reason || "ليس لديك الصلاحيات المطلوبة",
        cause: {
          requiredPermission: result.requiredPermission,
        },
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  };
}

/**
 * إنشاء middleware للتحقق من صلاحيات متعددة (OR)
 */
export function requireAnyPermission(
  permissions: Array<{ resource: ResourceType; action: PermissionAction }>
) {
  return async (opts: { ctx: TrpcContext; next: any }) => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ 
        code: "UNAUTHORIZED", 
        message: "يجب تسجيل الدخول أولاً" 
      });
    }

    // ✅ جلب صلاحيات المستخدم من قاعدة البيانات
    const { getDb } = await import("../db");
    const { roles, userRoles } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    const db = await getDb();
    let userRole = ctx.user.role || 'viewer';

    if (db) {
      try {
        const userRolesList = await db
          .select({ roleName: roles.name })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, ctx.user.id))
          .limit(1);

        if (userRolesList.length > 0) {
          userRole = userRolesList[0].roleName || userRole;
        }
      } catch (error: any) {
        logger.warn('Failed to load user role from database', {
          userId: ctx.user.id,
          error: error.message,
        });
      }
    }

    permissionChecker.setUserPermissions(ctx.user.id, userRole, [], []);

    const result = permissionChecker.checkAny(ctx.user.id, permissions);

    if (!result.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: result.reason || "ليس لديك أي من الصلاحيات المطلوبة",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  };
}

