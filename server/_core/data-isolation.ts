// server/_core/data-isolation.ts
// نظام عزل البيانات بين الشركات (Multi-tenant Isolation)

import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./trpc";
import { logger } from "../utils/logger";

/**
 * التحقق من أن المستخدم لديه businessId
 */
export function requireBusinessId(ctx: TrpcContext): number {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "يجب تسجيل الدخول أولاً",
    });
  }

  const businessId = ctx.user.businessId;
  if (!businessId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "المستخدم غير مرتبط بشركة. يرجى الاتصال بالمسؤول",
    });
  }

  return businessId;
}

/**
 * التحقق من أن businessId في input يطابق businessId المستخدم
 */
export function validateBusinessId(
  ctx: TrpcContext,
  inputBusinessId: number | undefined
): number {
  const userBusinessId = requireBusinessId(ctx);

  // إذا لم يتم تمرير businessId في input، نستخدم businessId المستخدم
  if (!inputBusinessId) {
    return userBusinessId;
  }

  // إذا تم تمرير businessId مختلف، نرفض الطلب
  if (inputBusinessId !== userBusinessId) {
    logger.warn("Business ID mismatch", {
      userId: ctx.user?.id,
      userBusinessId,
      inputBusinessId,
    });

    throw new TRPCError({
      code: "FORBIDDEN",
      message: "ليس لديك صلاحية للوصول إلى بيانات هذه الشركة",
    });
  }

  return userBusinessId;
}

/**
 * إضافة businessId تلقائياً إلى input إذا لم يكن موجوداً
 */
export function enforceBusinessId<T extends { businessId?: number }>(
  ctx: TrpcContext,
  input: T
): T & { businessId: number } {
  const businessId = requireBusinessId(ctx);

  return {
    ...input,
    businessId: input.businessId || businessId,
  };
}

/**
 * Middleware لفرض العزل التلقائي للبيانات
 */
export function enforceDataIsolation<T extends { businessId?: number }>() {
  return async (opts: {
    ctx: TrpcContext;
    input: T;
    next: (opts: { ctx: TrpcContext; input: T & { businessId: number } }) => Promise<any>;
  }) => {
    const { ctx, input, next } = opts;

    // فرض businessId
    const enforcedInput = enforceBusinessId(ctx, input);

    // التحقق من أن businessId صحيح
    validateBusinessId(ctx, enforcedInput.businessId);

    return next({
      ctx,
      input: enforcedInput,
    });
  };
}

/**
 * التحقق من أن المستخدم يمكنه الوصول إلى مورد معين
 */
export async function validateResourceAccess(
  ctx: TrpcContext,
  resourceBusinessId: number | null | undefined,
  resourceName: string = "المورد"
): Promise<void> {
  const userBusinessId = requireBusinessId(ctx);

  if (resourceBusinessId === null || resourceBusinessId === undefined) {
    // إذا كان المورد غير مرتبط بشركة، نسمح بالوصول فقط للمديرين
    if (ctx.user?.role !== "super_admin" && ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `ليس لديك صلاحية للوصول إلى ${resourceName} غير المرتبط بشركة`,
      });
    }
    return;
  }

  if (resourceBusinessId !== userBusinessId) {
    logger.warn("Resource access denied", {
      userId: ctx.user?.id,
      userBusinessId,
      resourceBusinessId,
      resourceName,
    });

    throw new TRPCError({
      code: "FORBIDDEN",
      message: `ليس لديك صلاحية للوصول إلى ${resourceName} الخاص بشركة أخرى`,
    });
  }
}

/**
 * فلترة النتائج بناءً على businessId
 */
export function filterByBusinessId<T extends { businessId?: number | null }>(
  items: T[],
  businessId: number
): T[] {
  return items.filter((item) => {
    // السماح بالعناصر المرتبطة بشركة المستخدم
    if (item.businessId === businessId) {
      return true;
    }

    // السماح بالعناصر غير المرتبطة بشركة فقط للمديرين (في middleware)
    // هنا نرجع false لأننا لا نعرف دور المستخدم
    return false;
  });
}

