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
  | 'business'
  | 'area'
  | 'square'
  | 'cabinet'
  | 'tariff'
  | 'fee_type'
  | 'customer'
  | 'meter'
  | 'meter_reading'
  | 'invoice'
  | 'payment'
  | 'billing_period'
  | 'cashbox'
  | 'payment_method';
