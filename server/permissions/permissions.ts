// server/permissions/permissions.ts

import { Permission, ResourceType, PermissionAction } from './types';

/**
 * توليد صلاحيات لمورد معين
 */
function generateResourcePermissions(
  resource: ResourceType,
  nameEn: string,
  nameAr: string
): Permission[] {
  const actions: Array<{ action: PermissionAction; en: string; ar: string }> = [
    { action: 'create', en: 'Create', ar: 'إنشاء' },
    { action: 'read', en: 'View', ar: 'عرض' },
    { action: 'update', en: 'Edit', ar: 'تعديل' },
    { action: 'delete', en: 'Delete', ar: 'حذف' },
    { action: 'export', en: 'Export', ar: 'تصدير' },
  ];

  return actions.map((a) => ({
    id: `${resource}:${a.action}`,
    name: `${a.en} ${nameEn}`,
    nameAr: `${a.ar} ${nameAr}`,
    description: `Permission to ${a.action} ${nameEn.toLowerCase()}`,
    descriptionAr: `صلاحية ${a.ar} ${nameAr}`,
    resource,
    action: a.action,
  }));
}

/**
 * جميع الصلاحيات في النظام
 */
export const AllPermissions: Permission[] = [
  // صلاحيات السندات
  ...generateResourcePermissions('voucher', 'Vouchers', 'السندات'),
  {
    id: 'voucher:approve',
    name: 'Approve Vouchers',
    nameAr: 'اعتماد السندات',
    description: 'Permission to approve vouchers',
    descriptionAr: 'صلاحية اعتماد السندات',
    resource: 'voucher',
    action: 'approve',
  },

  // صلاحيات الأطراف
  ...generateResourcePermissions('party', 'Parties', 'الأطراف'),

  // صلاحيات الخزائن
  ...generateResourcePermissions('treasury', 'Treasuries', 'الخزائن'),
  {
    id: 'treasury:manage',
    name: 'Manage Treasury Transfers',
    nameAr: 'إدارة التحويلات',
    description: 'Permission to manage treasury transfers',
    descriptionAr: 'صلاحية إدارة التحويلات بين الخزائن',
    resource: 'treasury',
    action: 'manage',
  },

  // صلاحيات الفئات
  ...generateResourcePermissions('category', 'Categories', 'الفئات'),

  // صلاحيات الأنظمة الفرعية
  ...generateResourcePermissions('subSystem', 'Sub Systems', 'الأنظمة الفرعية'),

  // صلاحيات المستخدمين
  ...generateResourcePermissions('user', 'Users', 'المستخدمين'),
  {
    id: 'user:manage',
    name: 'Manage Users',
    nameAr: 'إدارة المستخدمين',
    description: 'Permission to manage user accounts',
    descriptionAr: 'صلاحية إدارة حسابات المستخدمين',
    resource: 'user',
    action: 'manage',
  },

  // صلاحيات الأدوار
  ...generateResourcePermissions('role', 'Roles', 'الأدوار'),

  // صلاحيات التقارير
  {
    id: 'report:view',
    name: 'View Reports',
    nameAr: 'عرض التقارير',
    description: 'Permission to view reports',
    descriptionAr: 'صلاحية عرض التقارير',
    resource: 'report',
    action: 'read',
  },
  {
    id: 'report:export',
    name: 'Export Reports',
    nameAr: 'تصدير التقارير',
    description: 'Permission to export reports',
    descriptionAr: 'صلاحية تصدير التقارير',
    resource: 'report',
    action: 'export',
  },

  // صلاحيات الإعدادات
  {
    id: 'settings:view',
    name: 'View Settings',
    nameAr: 'عرض الإعدادات',
    description: 'Permission to view settings',
    descriptionAr: 'صلاحية عرض الإعدادات',
    resource: 'settings',
    action: 'read',
  },
  {
    id: 'settings:manage',
    name: 'Manage Settings',
    nameAr: 'إدارة الإعدادات',
    description: 'Permission to manage settings',
    descriptionAr: 'صلاحية إدارة الإعدادات',
    resource: 'settings',
    action: 'manage',
  },

  // صلاحيات الشركة
  {
    id: 'business:manage',
    name: 'Manage Business',
    nameAr: 'إدارة الشركة',
    description: 'Permission to manage business settings',
    descriptionAr: 'صلاحية إدارة إعدادات الشركة',
    resource: 'business',
    action: 'manage',
  },
];

/**
 * الحصول على صلاحية بالمعرف
 */
export function getPermission(id: string): Permission | undefined {
  return AllPermissions.find((p) => p.id === id);
}

/**
 * الحصول على صلاحيات مورد معين
 */
export function getResourcePermissions(resource: ResourceType): Permission[] {
  return AllPermissions.filter((p) => p.resource === resource);
}

/**
 * تجميع الصلاحيات حسب المورد
 */
export function groupPermissionsByResource(): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {};
  
  for (const permission of AllPermissions) {
    if (!grouped[permission.resource]) {
      grouped[permission.resource] = [];
    }
    grouped[permission.resource].push(permission);
  }
  
  return grouped;
}
