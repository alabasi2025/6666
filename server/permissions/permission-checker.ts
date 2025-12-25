// server/permissions/permission-checker.ts

import { PermissionCheckResult, PermissionContext, ResourceType, PermissionAction } from './types';
import { getRole, roleHasPermission } from './roles';
import { getPermission } from './permissions';

class PermissionChecker {
  private userPermissions: Map<number, {
    roleId: string;
    additional: string[];
    denied: string[];
  }> = new Map();

  /**
   * تعيين صلاحيات مستخدم
   */
  setUserPermissions(
    userId: number,
    roleId: string,
    additional: string[] = [],
    denied: string[] = []
  ): void {
    this.userPermissions.set(userId, { roleId, additional, denied });
  }

  /**
   * فحص صلاحية معينة
   */
  check(
    userId: number,
    resource: ResourceType,
    action: PermissionAction
  ): PermissionCheckResult {
    const permissionId = `${resource}:${action}`;
    const userPerms = this.userPermissions.get(userId);

    if (!userPerms) {
      return {
        allowed: false,
        reason: 'المستخدم غير موجود',
        requiredPermission: permissionId,
      };
    }

    // التحقق من الصلاحيات المرفوضة
    if (userPerms.denied.includes(permissionId)) {
      return {
        allowed: false,
        reason: 'الصلاحية مرفوضة صراحة',
        requiredPermission: permissionId,
      };
    }

    // التحقق من الصلاحيات الإضافية
    if (userPerms.additional.includes(permissionId)) {
      return { allowed: true };
    }

    // التحقق من صلاحيات الدور
    if (roleHasPermission(userPerms.roleId, permissionId)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'ليس لديك الصلاحية المطلوبة',
      requiredPermission: permissionId,
    };
  }

  /**
   * فحص صلاحية بالمعرف
   */
  checkById(userId: number, permissionId: string): PermissionCheckResult {
    const permission = getPermission(permissionId);
    if (!permission) {
      return {
        allowed: false,
        reason: 'الصلاحية غير موجودة',
        requiredPermission: permissionId,
      };
    }

    return this.check(userId, permission.resource as ResourceType, permission.action);
  }

  /**
   * فحص صلاحيات متعددة (AND)
   */
  checkAll(
    userId: number,
    permissions: Array<{ resource: ResourceType; action: PermissionAction }>
  ): PermissionCheckResult {
    for (const perm of permissions) {
      const result = this.check(userId, perm.resource, perm.action);
      if (!result.allowed) {
        return result;
      }
    }
    return { allowed: true };
  }

  /**
   * فحص صلاحيات متعددة (OR)
   */
  checkAny(
    userId: number,
    permissions: Array<{ resource: ResourceType; action: PermissionAction }>
  ): PermissionCheckResult {
    for (const perm of permissions) {
      const result = this.check(userId, perm.resource, perm.action);
      if (result.allowed) {
        return { allowed: true };
      }
    }
    return {
      allowed: false,
      reason: 'ليس لديك أي من الصلاحيات المطلوبة',
    };
  }

  /**
   * الحصول على جميع صلاحيات المستخدم
   */
  getUserPermissions(userId: number): string[] {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return [];

    const role = getRole(userPerms.roleId);
    if (!role) return userPerms.additional;

    const allPerms = new Set([...role.permissions, ...userPerms.additional]);
    
    // إزالة الصلاحيات المرفوضة
    for (const denied of userPerms.denied) {
      allPerms.delete(denied);
    }

    return Array.from(allPerms);
  }

  /**
   * التحقق من أن المستخدم مدير
   */
  isAdmin(userId: number): boolean {
    const userPerms = this.userPermissions.get(userId);
    return userPerms?.roleId === 'super_admin' || userPerms?.roleId === 'admin';
  }

  /**
   * التحقق من أن المستخدم مدير النظام
   */
  isSuperAdmin(userId: number): boolean {
    const userPerms = this.userPermissions.get(userId);
    return userPerms?.roleId === 'super_admin';
  }
}

export const permissionChecker = new PermissionChecker();
