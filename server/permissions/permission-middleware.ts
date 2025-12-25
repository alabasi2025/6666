// server/permissions/permission-middleware.ts

import { Request, Response, NextFunction } from 'express';
import { permissionChecker } from './permission-checker';
import { ResourceType, PermissionAction } from './types';

/**
 * Middleware للتحقق من صلاحية معينة
 */
export function requirePermission(resource: ResourceType, action: PermissionAction) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'غير مصرح',
        message: 'يجب تسجيل الدخول أولاً',
      });
    }

    const result = permissionChecker.check(user.id, resource, action);
    
    if (!result.allowed) {
      return res.status(403).json({
        error: 'غير مسموح',
        message: result.reason,
        requiredPermission: result.requiredPermission,
      });
    }

    next();
  };
}

/**
 * Middleware للتحقق من صلاحيات متعددة (AND)
 */
export function requireAllPermissions(
  permissions: Array<{ resource: ResourceType; action: PermissionAction }>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'غير مصرح',
        message: 'يجب تسجيل الدخول أولاً',
      });
    }

    const result = permissionChecker.checkAll(user.id, permissions);
    
    if (!result.allowed) {
      return res.status(403).json({
        error: 'غير مسموح',
        message: result.reason,
        requiredPermission: result.requiredPermission,
      });
    }

    next();
  };
}

/**
 * Middleware للتحقق من صلاحيات متعددة (OR)
 */
export function requireAnyPermission(
  permissions: Array<{ resource: ResourceType; action: PermissionAction }>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'غير مصرح',
        message: 'يجب تسجيل الدخول أولاً',
      });
    }

    const result = permissionChecker.checkAny(user.id, permissions);
    
    if (!result.allowed) {
      return res.status(403).json({
        error: 'غير مسموح',
        message: result.reason,
      });
    }

    next();
  };
}

/**
 * Middleware للتحقق من أن المستخدم مدير
 */
export function requireAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'غير مصرح',
        message: 'يجب تسجيل الدخول أولاً',
      });
    }

    if (!permissionChecker.isAdmin(user.id)) {
      return res.status(403).json({
        error: 'غير مسموح',
        message: 'هذه العملية تتطلب صلاحيات المدير',
      });
    }

    next();
  };
}

/**
 * Middleware للتحقق من أن المستخدم مدير النظام
 */
export function requireSuperAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'غير مصرح',
        message: 'يجب تسجيل الدخول أولاً',
      });
    }

    if (!permissionChecker.isSuperAdmin(user.id)) {
      return res.status(403).json({
        error: 'غير مسموح',
        message: 'هذه العملية تتطلب صلاحيات مدير النظام',
      });
    }

    next();
  };
}
