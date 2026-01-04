/**
 * ملف seed للبيانات الافتراضية
 * يتم تشغيله تلقائياً عند بدء النظام لأول مرة
 */

import { db } from './db';
import { users, roles, permissions, rolePermissions } from '../drizzle/schema';
import { hashPassword } from './auth';
import { eq, sql } from 'drizzle-orm';
import { logger } from './utils/logger';

/**
 * البيانات الافتراضية
 */
const DEFAULT_DATA = {
  // المستخدم الافتراضي
  admin: {
    phone: '0500000000',
    password: 'admin123',
    name: 'المدير العام',
    email: 'admin@system.local',
    role: 'super_admin' as const
  },
  
  // الأدوار الافتراضية
  roles: [
    {
      name: 'super_admin',
      displayName: 'مدير النظام',
      description: 'صلاحيات كاملة على النظام',
      isActive: true
    },
    {
      name: 'admin',
      displayName: 'مدير',
      description: 'صلاحيات إدارية',
      isActive: true
    },
    {
      name: 'manager',
      displayName: 'مدير محطة',
      description: 'إدارة محطة واحدة',
      isActive: true
    },
    {
      name: 'accountant',
      displayName: 'محاسب',
      description: 'الوصول للعمليات المالية',
      isActive: true
    },
    {
      name: 'technician',
      displayName: 'فني',
      description: 'الوصول للعمليات الفنية',
      isActive: true
    },
    {
      name: 'collector',
      displayName: 'محصل',
      description: 'تحصيل الفواتير',
      isActive: true
    },
    {
      name: 'user',
      displayName: 'مستخدم',
      description: 'صلاحيات أساسية',
      isActive: true
    }
  ],
  
  // الصلاحيات الافتراضية
  permissions: [
    // Core
    { module: 'core', name: 'view_dashboard', displayName: 'عرض لوحة التحكم', description: 'الوصول للوحة التحكم الرئيسية' },
    { module: 'core', name: 'manage_users', displayName: 'إدارة المستخدمين', description: 'إضافة وتعديل المستخدمين' },
    { module: 'core', name: 'manage_roles', displayName: 'إدارة الأدوار', description: 'إدارة الأدوار والصلاحيات' },
    { module: 'core', name: 'manage_settings', displayName: 'إدارة الإعدادات', description: 'تعديل إعدادات النظام' },
    { module: 'core', name: 'manage_organization', displayName: 'إدارة الهيكل التنظيمي', description: 'إدارة الفروع والأقسام' },
    
    // Billing
    { module: 'billing', name: 'view_invoices', displayName: 'عرض الفواتير', description: 'الاطلاع على الفواتير' },
    { module: 'billing', name: 'create_invoices', displayName: 'إنشاء فواتير', description: 'إنشاء فواتير جديدة' },
    { module: 'billing', name: 'edit_invoices', displayName: 'تعديل الفواتير', description: 'تعديل الفواتير الموجودة' },
    { module: 'billing', name: 'delete_invoices', displayName: 'حذف الفواتير', description: 'حذف الفواتير' },
    { module: 'billing', name: 'approve_invoices', displayName: 'اعتماد الفواتير', description: 'اعتماد الفواتير' },
    
    // Payments
    { module: 'billing', name: 'view_payments', displayName: 'عرض المدفوعات', description: 'الاطلاع على المدفوعات' },
    { module: 'billing', name: 'receive_payments', displayName: 'استلام مدفوعات', description: 'تسجيل مدفوعات جديدة' },
    { module: 'billing', name: 'refund_payments', displayName: 'استرداد مدفوعات', description: 'عمل استرداد للمدفوعات' },
    
    // Customers
    { module: 'customers', name: 'view_customers', displayName: 'عرض العملاء', description: 'الاطلاع على بيانات العملاء' },
    { module: 'customers', name: 'create_customers', displayName: 'إضافة عملاء', description: 'إضافة عملاء جدد' },
    { module: 'customers', name: 'edit_customers', displayName: 'تعديل العملاء', description: 'تعديل بيانات العملاء' },
    { module: 'customers', name: 'delete_customers', displayName: 'حذف العملاء', description: 'حذف العملاء' },
    
    // Operations
    { module: 'operations', name: 'view_work_orders', displayName: 'عرض أوامر العمل', description: 'الاطلاع على أوامر العمل' },
    { module: 'operations', name: 'create_work_orders', displayName: 'إنشاء أوامر عمل', description: 'إنشاء أوامر عمل جديدة' },
    { module: 'operations', name: 'assign_work_orders', displayName: 'تعيين أوامر العمل', description: 'تعيين أوامر العمل للفنيين' },
    { module: 'operations', name: 'complete_work_orders', displayName: 'إتمام أوامر العمل', description: 'إغلاق أوامر العمل' },
    
    // Inventory
    { module: 'inventory', name: 'view_inventory', displayName: 'عرض المخزون', description: 'الاطلاع على المخزون' },
    { module: 'inventory', name: 'manage_inventory', displayName: 'إدارة المخزون', description: 'إضافة وتعديل المخزون' },
    { module: 'inventory', name: 'create_purchase_orders', displayName: 'إنشاء طلبات شراء', description: 'إنشاء طلبات شراء جديدة' },
    
    // Finance
    { module: 'finance', name: 'view_accounts', displayName: 'عرض الحسابات', description: 'الاطلاع على الحسابات' },
    { module: 'finance', name: 'create_journal_entries', displayName: 'إنشاء قيود', description: 'إنشاء قيود يومية' },
    { module: 'finance', name: 'view_reports', displayName: 'عرض التقارير المالية', description: 'الاطلاع على التقارير المالية' },
    
    // Reports
    { module: 'reports', name: 'view_all_reports', displayName: 'عرض جميع التقارير', description: 'الوصول لجميع التقارير' },
    { module: 'reports', name: 'export_reports', displayName: 'تصدير التقارير', description: 'تصدير التقارير لملفات' }
  ]
};

/**
 * التحقق من وجود بيانات في الجدول
 */
async function hasData(table: any): Promise<boolean> {
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(table);
    return result[0].count > 0;
  } catch (error) {
    logger.error('[Seed] Error checking table data', { error });
    return false;
  }
}

/**
 * إنشاء المستخدم الافتراضي
 */
async function seedAdminUser() {
  try {
    // التحقق من وجود مستخدمين
    const hasUsers = await hasData(users);
    if (hasUsers) {
      logger.info('[Seed] Users already exist, skipping admin user creation');
      return;
    }
    
    logger.info('[Seed] Creating default admin user...');
    
    const hashedPassword = await hashPassword(DEFAULT_DATA.admin.password);
    const openId = `local_${DEFAULT_DATA.admin.phone}_${Date.now()}`;
    
    await db.insert(users).values({
      openId,
      phone: DEFAULT_DATA.admin.phone,
      password: hashedPassword,
      name: DEFAULT_DATA.admin.name,
      email: DEFAULT_DATA.admin.email,
      role: DEFAULT_DATA.admin.role,
      loginMethod: 'local',
      isActive: true
    });
    
    logger.info('[Seed] ✅ Admin user created successfully', {
      phone: DEFAULT_DATA.admin.phone,
      password: DEFAULT_DATA.admin.password,
      role: DEFAULT_DATA.admin.role
    });
    
    console.log('\n===========================================');
    console.log('✅ تم إنشاء المستخدم الافتراضي بنجاح!');
    console.log('===========================================');
    console.log(`📱 رقم الهاتف: ${DEFAULT_DATA.admin.phone}`);
    console.log(`🔑 كلمة المرور: ${DEFAULT_DATA.admin.password}`);
    console.log(`👤 الدور: ${DEFAULT_DATA.admin.role}`);
    console.log('===========================================\n');
    
  } catch (error) {
    logger.error('[Seed] Error creating admin user', { error });
    throw error;
  }
}

/**
 * إنشاء الأدوار الافتراضية
 */
async function seedRoles() {
  try {
    // التحقق من وجود أدوار
    const hasRoles = await hasData(roles);
    if (hasRoles) {
      logger.info('[Seed] Roles already exist, skipping');
      return;
    }
    
    logger.info('[Seed] Creating default roles...');
    
    await db.insert(roles).values(DEFAULT_DATA.roles);
    
    logger.info('[Seed] ✅ Roles created successfully', {
      count: DEFAULT_DATA.roles.length
    });
    
  } catch (error) {
    logger.error('[Seed] Error creating roles', { error });
    throw error;
  }
}

/**
 * إنشاء الصلاحيات الافتراضية
 */
async function seedPermissions() {
  try {
    // التحقق من وجود صلاحيات
    const hasPermissions = await hasData(permissions);
    if (hasPermissions) {
      logger.info('[Seed] Permissions already exist, skipping');
      return;
    }
    
    logger.info('[Seed] Creating default permissions...');
    
    await db.insert(permissions).values(DEFAULT_DATA.permissions);
    
    logger.info('[Seed] ✅ Permissions created successfully', {
      count: DEFAULT_DATA.permissions.length
    });
    
  } catch (error) {
    logger.error('[Seed] Error creating permissions', { error });
    throw error;
  }
}

/**
 * ربط الصلاحيات بالأدوار
 */
async function seedRolePermissions() {
  try {
    // التحقق من وجود ربط
    const hasRolePermissions = await hasData(rolePermissions);
    if (hasRolePermissions) {
      logger.info('[Seed] Role permissions already exist, skipping');
      return;
    }
    
    logger.info('[Seed] Assigning permissions to roles...');
    
    // جلب جميع الأدوار والصلاحيات
    const allRoles = await db.select().from(roles);
    const allPermissions = await db.select().from(permissions);
    
    // super_admin يحصل على جميع الصلاحيات
    const superAdminRole = allRoles.find(r => r.name === 'super_admin');
    if (superAdminRole) {
      const superAdminPermissions = allPermissions.map(p => ({
        roleId: superAdminRole.id,
        permissionId: p.id
      }));
      await db.insert(rolePermissions).values(superAdminPermissions);
    }
    
    // admin يحصل على معظم الصلاحيات (ما عدا إدارة الأدوار)
    const adminRole = allRoles.find(r => r.name === 'admin');
    if (adminRole) {
      const adminPermissions = allPermissions
        .filter(p => p.name !== 'manage_roles')
        .map(p => ({
          roleId: adminRole.id,
          permissionId: p.id
        }));
      await db.insert(rolePermissions).values(adminPermissions);
    }
    
    // manager يحصل على صلاحيات المحطة
    const managerRole = allRoles.find(r => r.name === 'manager');
    if (managerRole) {
      const managerPermissions = allPermissions
        .filter(p => 
          p.module === 'operations' ||
          p.module === 'customers' ||
          p.module === 'billing' ||
          p.name === 'view_dashboard'
        )
        .map(p => ({
          roleId: managerRole.id,
          permissionId: p.id
        }));
      await db.insert(rolePermissions).values(managerPermissions);
    }
    
    // accountant يحصل على الصلاحيات المالية
    const accountantRole = allRoles.find(r => r.name === 'accountant');
    if (accountantRole) {
      const accountantPermissions = allPermissions
        .filter(p => 
          p.module === 'finance' ||
          p.module === 'billing' ||
          p.name === 'view_dashboard'
        )
        .map(p => ({
          roleId: accountantRole.id,
          permissionId: p.id
        }));
      await db.insert(rolePermissions).values(accountantPermissions);
    }
    
    // technician يحصل على صلاحيات العمليات
    const technicianRole = allRoles.find(r => r.name === 'technician');
    if (technicianRole) {
      const technicianPermissions = allPermissions
        .filter(p => 
          p.module === 'operations' ||
          p.name === 'view_dashboard' ||
          p.name === 'view_customers'
        )
        .map(p => ({
          roleId: technicianRole.id,
          permissionId: p.id
        }));
      await db.insert(rolePermissions).values(technicianPermissions);
    }
    
    // collector يحصل على صلاحيات التحصيل
    const collectorRole = allRoles.find(r => r.name === 'collector');
    if (collectorRole) {
      const collectorPermissions = allPermissions
        .filter(p => 
          p.name === 'view_dashboard' ||
          p.name === 'view_customers' ||
          p.name === 'view_invoices' ||
          p.name === 'view_payments' ||
          p.name === 'receive_payments'
        )
        .map(p => ({
          roleId: collectorRole.id,
          permissionId: p.id
        }));
      await db.insert(rolePermissions).values(collectorPermissions);
    }
    
    logger.info('[Seed] ✅ Role permissions assigned successfully');
    
  } catch (error) {
    logger.error('[Seed] Error assigning role permissions', { error });
    throw error;
  }
}

/**
 * تشغيل جميع عمليات Seed
 */
export async function runSeed() {
  try {
    logger.info('[Seed] Starting database seeding...');
    
    await seedAdminUser();
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();
    
    logger.info('[Seed] ✅ Database seeding completed successfully!');
    
    return { success: true };
    
  } catch (error) {
    logger.error('[Seed] Database seeding failed', { error });
    return { success: false, error };
  }
}

/**
 * تشغيل Seed عند استدعاء الملف مباشرة
 */
if (require.main === module) {
  runSeed()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ تم إنشاء البيانات الافتراضية بنجاح!\n');
        process.exit(0);
      } else {
        console.error('\n❌ فشل إنشاء البيانات الافتراضية!\n');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ خطأ:', error);
      process.exit(1);
    });
}
