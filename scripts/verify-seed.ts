/**
 * سكريبت للتحقق من نجاح seed البيانات الافتراضية
 */

import { db } from '../server/db';
import { users, roles, permissions, rolePermissions } from '../drizzle/schema';
import { sql, eq } from 'drizzle-orm';
import { logger } from '../server/utils/logger';

async function verifySeed() {
  console.log('\n🔍 التحقق من البيانات الافتراضية...\n');
  console.log('='.repeat(50));
  
  let allGood = true;
  
  try {
    // 1. المستخدمين
    const usersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const usersCount = Number(usersResult[0].count);
    
    if (usersCount === 0) {
      console.log('❌ المستخدمين: 0 (لا يوجد مستخدمين!)');
      allGood = false;
    } else {
      console.log(`✅ المستخدمين: ${usersCount}`);
    }
    
    // 2. الأدوار
    const rolesResult = await db.select({ count: sql<number>`count(*)` }).from(roles);
    const rolesCount = Number(rolesResult[0].count);
    
    if (rolesCount < 7) {
      console.log(`⚠️  الأدوار: ${rolesCount} (المتوقع: 7)`);
      allGood = false;
    } else {
      console.log(`✅ الأدوار: ${rolesCount}`);
    }
    
    // 3. الصلاحيات
    const permsResult = await db.select({ count: sql<number>`count(*)` }).from(permissions);
    const permsCount = Number(permsResult[0].count);
    
    if (permsCount < 30) {
      console.log(`⚠️  الصلاحيات: ${permsCount} (المتوقع: 30+)`);
      allGood = false;
    } else {
      console.log(`✅ الصلاحيات: ${permsCount}`);
    }
    
    // 4. ربط الصلاحيات
    const rolePermsResult = await db.select({ count: sql<number>`count(*)` }).from(rolePermissions);
    const rolePermsCount = Number(rolePermsResult[0].count);
    
    if (rolePermsCount === 0) {
      console.log('❌ روابط الصلاحيات: 0 (لا يوجد روابط!)');
      allGood = false;
    } else {
      console.log(`✅ روابط الصلاحيات: ${rolePermsCount}`);
    }
    
    console.log('='.repeat(50));
    
    // 5. المستخدم الافتراضي
    const adminUser = await db.select().from(users).where(eq(users.phone, '0500000000')).limit(1);
    
    if (adminUser.length > 0) {
      console.log('\n✅ المستخدم الافتراضي موجود:');
      console.log(`   📱 الهاتف: ${adminUser[0].phone}`);
      console.log(`   👤 الاسم: ${adminUser[0].name}`);
      console.log(`   🔑 الدور: ${adminUser[0].role}`);
      console.log(`   ✓  نشط: ${adminUser[0].isActive ? 'نعم' : 'لا'}`);
    } else {
      console.log('\n❌ المستخدم الافتراضي غير موجود!');
      console.log('   قم بتشغيل: pnpm tsx server/seed.ts');
      allGood = false;
    }
    
    // 6. تفاصيل الأدوار
    console.log('\n📋 الأدوار المتاحة:');
    const allRoles = await db.select().from(roles);
    
    for (const role of allRoles) {
      // عد صلاحيات كل دور
      const rolePerms = await db
        .select({ count: sql<number>`count(*)` })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, role.id));
      
      const permCount = Number(rolePerms[0].count);
      console.log(`   ${role.displayName} (${role.name}): ${permCount} صلاحية`);
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (allGood) {
      console.log('\n✅ جميع الفحوصات نجحت! النظام جاهز للاستخدام.\n');
      console.log('🔐 بيانات تسجيل الدخول:');
      console.log('   📱 رقم الهاتف: 0500000000');
      console.log('   🔑 كلمة المرور: admin123\n');
      return true;
    } else {
      console.log('\n❌ بعض الفحوصات فشلت!');
      console.log('   قم بتشغيل: pnpm tsx server/seed.ts\n');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ خطأ أثناء التحقق:', error);
    console.log('\nتأكد من:');
    console.log('   1. تشغيل قاعدة البيانات');
    console.log('   2. صحة DATABASE_URL في .env');
    console.log('   3. تشغيل migrations: pnpm db:push\n');
    return false;
  }
}

// تشغيل التحقق
if (require.main === module) {
  verifySeed()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('خطأ:', error);
      process.exit(1);
    });
}

export { verifySeed };
