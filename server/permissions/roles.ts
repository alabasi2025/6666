// server/permissions/roles.ts

import { Role } from './types';
import { AllPermissions } from './permissions';

/**
 * الأدوار الافتراضية في النظام
 */
export const SystemRoles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    nameAr: 'مدير النظام',
    description: 'Full access to all system features',
    descriptionAr: 'صلاحيات كاملة لجميع ميزات النظام',
    permissions: AllPermissions.map((p) => p.id),
    isSystem: true,
    level: 1,
  },
  {
    id: 'admin',
    name: 'Administrator',
    nameAr: 'مدير',
    description: 'Administrative access with some restrictions',
    descriptionAr: 'صلاحيات إدارية مع بعض القيود',
    permissions: AllPermissions
      .filter((p) => !['business:manage', 'role:delete', 'role:create'].includes(p.id))
      .map((p) => p.id),
    isSystem: true,
    level: 2,
  },
  {
    id: 'accountant',
    name: 'Accountant',
    nameAr: 'محاسب',
    description: 'Access to financial operations',
    descriptionAr: 'صلاحيات العمليات المالية',
    permissions: [
      'voucher:create', 'voucher:read', 'voucher:update', 'voucher:export',
      'party:read', 'party:create', 'party:update',
      'treasury:read',
      'category:read',
      'report:view', 'report:export',
    ],
    isSystem: true,
    level: 3,
  },
  {
    id: 'cashier',
    name: 'Cashier',
    nameAr: 'أمين صندوق',
    description: 'Access to cash operations',
    descriptionAr: 'صلاحيات عمليات الصندوق',
    permissions: [
      'voucher:create', 'voucher:read',
      'party:read',
      'treasury:read',
      'category:read',
    ],
    isSystem: true,
    level: 4,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    nameAr: 'مشاهد',
    description: 'Read-only access',
    descriptionAr: 'صلاحيات القراءة فقط',
    permissions: [
      'voucher:read',
      'party:read',
      'treasury:read',
      'category:read',
      'report:view',
    ],
    isSystem: true,
    level: 5,
  },
];

/**
 * الحصول على دور بالمعرف
 */
export function getRole(id: string): Role | undefined {
  return SystemRoles.find((r) => r.id === id);
}

/**
 * الحصول على جميع الأدوار
 */
export function getAllRoles(): Role[] {
  return [...SystemRoles];
}

/**
 * التحقق من أن الدور يملك صلاحية معينة
 */
export function roleHasPermission(roleId: string, permissionId: string): boolean {
  const role = getRole(roleId);
  return role ? role.permissions.includes(permissionId) : false;
}

/**
 * الحصول على صلاحيات دور معين
 */
export function getRolePermissions(roleId: string): string[] {
  const role = getRole(roleId);
  return role ? [...role.permissions] : [];
}

/**
 * مقارنة مستوى دورين
 */
export function compareRoleLevels(roleId1: string, roleId2: string): number {
  const role1 = getRole(roleId1);
  const role2 = getRole(roleId2);
  
  if (!role1 || !role2) return 0;
  return role1.level - role2.level;
}
