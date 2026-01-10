import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { permissionChecker } from "../permissions/permission-checker";
import { enforceDataIsolation, requireBusinessId } from './data-isolation';

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // تعيين صلاحيات المستخدم في permissionChecker
  const userRole = ctx.user.role || 'viewer';
  permissionChecker.setUserPermissions(ctx.user.id, userRole, [], []);

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Procedure مع فرض عزل البيانات تلقائياً
 * يفرض أن جميع الاستعلامات تتضمن businessId المستخدم
 */
export const isolatedProcedure = protectedProcedure.use(
  enforceDataIsolation<{ businessId?: number }>()
);

/**
 * Procedure محمي بصلاحية معينة
 * يستخدم نظام الصلاحيات المتقدم
 */
export function createPermissionProcedure(resource: string, action: string) {
  return protectedProcedure.use(
    t.middleware(async opts => {
      const { ctx, next } = opts;

      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
      }

      const userRole = ctx.user.role || 'viewer';
      permissionChecker.setUserPermissions(ctx.user.id, userRole, [], []);

      const permissionId = `${resource}:${action}`;
      const result = permissionChecker.checkById(ctx.user.id, permissionId);

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
    })
  );
}
