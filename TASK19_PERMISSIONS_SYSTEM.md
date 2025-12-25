# 📋 المهمة 19: إنشاء نظام الصلاحيات

## 🎯 الهدف
إنشاء نظام صلاحيات متقدم يدعم الأدوار والصلاحيات المخصصة.

## 📁 الفرع
```
feature/task19-permissions-system
```

## ⏱️ الوقت المتوقع
4-5 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/permissions/
├── types.ts              # أنواع TypeScript
├── roles.ts              # تعريف الأدوار
├── permissions.ts        # تعريف الصلاحيات
├── permission-checker.ts # فحص الصلاحيات
├── permission-middleware.ts # Middleware
├── permission-utils.ts   # أدوات مساعدة
└── index.ts              # ملف التصدير
```

## 🚫 الملفات الممنوع تعديلها
- `server/*Router.ts`
- `drizzle/schema.ts`
- `client/src/**/*`

---

## 📝 خطوات التنفيذ

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task19-permissions-system
```

### الخطوة 2: إنشاء المجلد
```bash
mkdir -p server/permissions
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
// server/permissions/types.ts

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'approve' | 'manage';

export interface Permission {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  resource: string;
  action: PermissionAction;
}

export interface Role {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  permissions: string[]; // Permission IDs
  isSystem: boolean;
  level: number; // 1 = highest (admin), 10 = lowest
}

export interface UserPermissions {
  userId: number;
  roleId: string;
  additionalPermissions: string[];
  deniedPermissions: string[];
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPermission?: string;
}

export interface PermissionContext {
  userId: number;
  businessId: number;
  roleId: string;
  resourceOwnerId?: number;
}

export type ResourceType = 
  | 'voucher'
  | 'party'
  | 'treasury'
  | 'category'
  | 'subSystem'
  | 'user'
  | 'role'
  | 'report'
  | 'settings'
  | 'business';
```

### الخطوة 4: إنشاء ملف permissions.ts
```typescript
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
```

### الخطوة 5: إنشاء ملف roles.ts
```typescript
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
```

### الخطوة 6: إنشاء ملف permission-checker.ts
```typescript
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
```

### الخطوة 7: إنشاء ملف permission-middleware.ts
```typescript
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
```

### الخطوة 8: إنشاء ملف permission-utils.ts
```typescript
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
```

### الخطوة 9: إنشاء ملف index.ts
```typescript
// server/permissions/index.ts

export * from './types';
export * from './permissions';
export * from './roles';
export * from './permission-checker';
export * from './permission-middleware';
export * from './permission-utils';

export { permissionChecker } from './permission-checker';
```

### الخطوة 10: رفع التغييرات
```bash
git add server/permissions/
git commit -m "feat(permissions): إضافة نظام الصلاحيات

- إضافة تعريف الصلاحيات لجميع الموارد
- إضافة الأدوار الافتراضية (مدير النظام، مدير، محاسب، أمين صندوق، مشاهد)
- إضافة PermissionChecker للتحقق من الصلاحيات
- إضافة Middleware للحماية
- إضافة أدوات مساعدة"

git push origin feature/task19-permissions-system
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/permissions/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `permissions.ts`
- [ ] إنشاء ملف `roles.ts`
- [ ] إنشاء ملف `permission-checker.ts`
- [ ] إنشاء ملف `permission-middleware.ts`
- [ ] إنشاء ملف `permission-utils.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
