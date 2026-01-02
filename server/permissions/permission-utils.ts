// server/permissions/permission-utils.ts

import { Permission, Role, ResourceType, PermissionAction } from './types';
import { AllPermissions } from './permissions';
import { SystemRoles } from './roles';

/**
 * تصدير الصلاحيات كـ JSON
 */
export function exportPermissionsAsJson(): string {
  return JSON.stringify(AllPermissions, null, 2);
}

/**
 * تصدير الأدوار كـ JSON
 */
export function exportRolesAsJson(): string {
  return JSON.stringify(SystemRoles, null, 2);
}

/**
 * إنشاء معرف صلاحية
 */
export function createPermissionId(resource: ResourceType, action: PermissionAction): string {
  return `${resource}:${action}`;
}

/**
 * تحليل معرف صلاحية
 */
export function parsePermissionId(id: string): { resource: string; action: string } | null {
  const parts = id.split(':');
  if (parts.length !== 2) return null;
  return { resource: parts[0], action: parts[1] };
}

/**
 * الحصول على وصف الصلاحية بالعربية
 */
export function getPermissionDescriptionAr(resource: ResourceType, action: PermissionAction): string {
  const resources: Record<string, string> = {
    voucher: 'السندات',
    party: 'الأطراف',
    treasury: 'الخزائن',
    category: 'الفئات',
    subSystem: 'الأنظمة الفرعية',
    user: 'المستخدمين',
    role: 'الأدوار',
    report: 'التقارير',
    settings: 'الإعدادات',
    business: 'الشركة',
  };

  const actions: Record<string, string> = {
    create: 'إنشاء',
    read: 'عرض',
    update: 'تعديل',
    delete: 'حذف',
    export: 'تصدير',
    import: 'استيراد',
    approve: 'اعتماد',
    manage: 'إدارة',
  };

  return `${actions[action] || action} ${resources[resource] || resource}`;
}

/**
 * تجميع الصلاحيات للعرض
 */
export function getPermissionsForDisplay(): Array<{
  resource: string;
  resourceAr: string;
  permissions: Array<{
    id: string;
    action: string;
    nameAr: string;
  }>;
}> {
  const resources: Record<string, string> = {
    voucher: 'السندات',
    party: 'الأطراف',
    treasury: 'الخزائن',
    category: 'الفئات',
    subSystem: 'الأنظمة الفرعية',
    user: 'المستخدمين',
    role: 'الأدوار',
    report: 'التقارير',
    settings: 'الإعدادات',
    business: 'الشركة',
  };

  const grouped: Record<string, Permission[]> = {};
  
  for (const perm of AllPermissions) {
    if (!grouped[perm.resource]) {
      grouped[perm.resource] = [];
    }
    grouped[perm.resource].push(perm);
  }

  return Object.entries(grouped).map(([resource, perms]) => ({
    resource,
    resourceAr: resources[resource] || resource,
    permissions: perms.map((p) => ({
      id: p.id,
      action: p.action,
      nameAr: p.nameAr,
    })),
  }));
}
