import "dotenv/config";
import { getDb } from "./server/db.js";
import { registerUser } from "./server/auth.js";
import { logger } from "./server/utils/logger.js";

async function createDefaultAdmin() {
  console.log("=".repeat(70));
  console.log("👤 إنشاء مستخدم مدير افتراضي");
  console.log("=".repeat(70));

  try {
    const db = await getDb();
    if (!db) {
      console.log("\n❌ قاعدة البيانات غير متاحة");
      console.log("   💡 تأكد من أن PostgreSQL يعمل وأن DATABASE_URL صحيح");
      process.exit(1);
    }

    console.log("\n1️⃣  التحقق من المستخدمين المديرين الموجودين...");
    
    // التحقق من وجود مستخدمين مديرين
    const adminUsers = await db.execute(`
      SELECT id, phone, name, name_ar, role 
      FROM users 
      WHERE role IN ('admin', 'super_admin')
      LIMIT 1
    `);

    if ((adminUsers.rows as any[]).length > 0) {
      const admin = (adminUsers.rows as any[])[0];
      console.log(`   ✅ يوجد مستخدم مدير موجود بالفعل:`);
      console.log(`      📱 رقم الهاتف: ${admin.phone || "N/A"}`);
      console.log(`      📛 الاسم: ${admin.name_ar || admin.name || "بدون اسم"}`);
      console.log(`      👔 الدور: ${admin.role}`);
      console.log("\n💡 إذا كنت تريد إنشاء مستخدم جديد، استخدم:");
      console.log("   pnpm tsx server/auth.ts (بعد إضافة دالة createUser)");
      process.exit(0);
    }

    console.log("   ⚠️  لا يوجد مستخدمين مديرين");

    // إنشاء المستخدم الافتراضي
    console.log("\n2️⃣  إنشاء مستخدم مدير افتراضي...");
    
    const adminPhone = process.env.DEFAULT_ADMIN_PHONE || "0500000000";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "123456";
    const adminName = process.env.DEFAULT_ADMIN_NAME || "مدير النظام";

    console.log(`   📱 رقم الهاتف: ${adminPhone}`);
    console.log(`   🔑 كلمة المرور: ${adminPassword}`);
    console.log(`   📛 الاسم: ${adminName}`);
    console.log(`   👔 الدور: super_admin`);

    const result = await registerUser({
      phone: adminPhone,
      password: adminPassword,
      name: adminName,
      role: "super_admin",
    });

    if (result.success) {
      console.log("\n✅ تم إنشاء المستخدم المدير بنجاح!");
      console.log("\n" + "=".repeat(70));
      console.log("📋 بيانات الدخول:");
      console.log("=".repeat(70));
      console.log(`   📱 رقم الهاتف: ${adminPhone}`);
      console.log(`   🔑 كلمة المرور: ${adminPassword}`);
      console.log(`   👔 الدور: super_admin`);
      console.log("=".repeat(70));
      
      console.log("\n💡 يمكنك الآن تسجيل الدخول باستخدام هذه البيانات");
      console.log("   في صفحة تسجيل الدخول: http://localhost:8000");
      
      process.exit(0);
    } else {
      console.log(`\n❌ فشل إنشاء المستخدم: ${result.error}`);
      
      if (result.error?.includes("مسجل مسبقاً")) {
        console.log("\n💡 المستخدم موجود بالفعل. جرب:");
        console.log("   1. تسجيل الدخول بالرقم وكلمة المرور أعلاه");
        console.log("   2. أو غيّر DEFAULT_ADMIN_PHONE في ملف .env");
      }
      
      process.exit(1);
    }

  } catch (error: any) {
    console.error("\n❌ خطأ أثناء إنشاء المستخدم:", error.message);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 تأكد من:");
      console.error("   - PostgreSQL 18 يعمل على المنفذ 5433");
      console.error("   - قاعدة البيانات 666666 موجودة");
    } else if (error.message.includes("duplicate") || error.message.includes("unique")) {
      console.error("\n💡 المستخدم موجود بالفعل");
      console.error("   جرب تسجيل الدخول أو استخدم رقم هاتف آخر");
    }
    
    process.exit(1);
  }
}

createDefaultAdmin();
