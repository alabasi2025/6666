import "dotenv/config";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function checkUsers() {
  console.log("=".repeat(70));
  console.log("👤 فحص المستخدمين في قاعدة البيانات");
  console.log("=".repeat(70));

  const pool = new Pool({
    host: "localhost",
    port: 5433,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("\n🔌 الاتصال بقاعدة البيانات...");
    await pool.query("SELECT version()");
    console.log("   ✅ تم الاتصال بنجاح\n");

    // الحصول على قائمة المستخدمين
    console.log("📊 المستخدمون الموجودون في قاعدة البيانات:\n");
    
    const usersResult = await pool.query(`
      SELECT 
        id,
        phone,
        name,
        name_ar,
        email,
        role,
        is_active,
        "loginMethod" as login_method,
        "createdAt" as created_at
      FROM users
      ORDER BY id
    `);

    if (usersResult.rows.length === 0) {
      console.log("   ⚠️  لا توجد مستخدمين في قاعدة البيانات");
      console.log("\n💡 سيتم إنشاء مستخدم افتراضي عند بدء السيرفر:");
      console.log("   📱 رقم الهاتف: 0500000000");
      console.log("   🔑 كلمة المرور: 123456 (أو من متغير DEFAULT_ADMIN_PASSWORD)");
      console.log("   👤 الدور: super_admin");
    } else {
      console.log(`   📊 عدد المستخدمين: ${usersResult.rows.length}\n`);
      console.log("┌────┬──────────────┬─────────────────────┬───────────────┬────────────────┐");
      console.log("│ ID │ رقم الهاتف   │ الاسم               │ الدور         │ الحالة         │");
      console.log("├────┼──────────────┼─────────────────────┼───────────────┼────────────────┤");
      
      for (const user of usersResult.rows) {
        const id = String(user.id).padStart(3);
        const phone = (user.phone || "N/A").padEnd(13);
        const name = ((user.name_ar || user.name || "بدون اسم").substring(0, 19)).padEnd(19);
        const role = (user.role || "N/A").padEnd(13);
        const status = user.is_active ? "✅ نشط" : "❌ غير نشط";
        console.log(`│ ${id} │ ${phone} │ ${name} │ ${role} │ ${status.padEnd(14)} │`);
      }
      
      console.log("└────┴──────────────┴─────────────────────┴───────────────┴────────────────┘");

      // عرض بيانات تفصيلية للمستخدمين
      console.log("\n📋 بيانات تفصيلية للمستخدمين:\n");
      
      for (const user of usersResult.rows) {
        console.log(`   👤 المستخدم #${user.id}:`);
        console.log(`      📱 رقم الهاتف: ${user.phone || "N/A"}`);
        console.log(`      📛 الاسم: ${user.name_ar || user.name || "بدون اسم"}`);
        if (user.email) {
          console.log(`      📧 البريد: ${user.email}`);
        }
        console.log(`      👔 الدور: ${user.role || "N/A"}`);
        console.log(`      🔐 طريقة الدخول: ${user.login_method || "N/A"}`);
        console.log(`      ✅ الحالة: ${user.is_active ? "نشط" : "غير نشط"}`);
        console.log(`      📅 تاريخ الإنشاء: ${user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : "N/A"}`);
        console.log("");
      }
    }

    // عرض المستخدمين المديرين
    console.log("🔑 المستخدمون المديرون:\n");
    const adminResult = await pool.query(`
      SELECT id, phone, name, name_ar, role
      FROM users
      WHERE role IN ('admin', 'super_admin')
      ORDER BY role DESC, id
    `);

    if (adminResult.rows.length === 0) {
      console.log("   ⚠️  لا توجد مستخدمين مديرين");
      console.log("   💡 سيتم إنشاء مستخدم مدير افتراضي عند بدء السيرفر");
    } else {
      for (const admin of adminResult.rows) {
        console.log(`   👔 ${admin.role === 'super_admin' ? '⭐' : '🔑'} ${(admin.name_ar || admin.name || "بدون اسم").padEnd(25)} (${admin.phone || "N/A"})`);
      }
    }

    await pool.end();

    console.log("\n" + "=".repeat(70));
    console.log("📝 ملخص:");
    console.log("=".repeat(70));
    console.log("1️⃣  قاعدة البيانات PostgreSQL:");
    console.log("   👤 المستخدم: postgres");
    console.log("   🔑 كلمة المرور: 774424555");
    console.log("   🗄️  قاعدة البيانات: 666666");
    console.log("   📍 المنفذ: 5433 (PostgreSQL 18)");
    
    console.log("\n2️⃣  مستخدمي النظام (Application Users):");
    if (usersResult.rows.length > 0) {
      const adminUsers = usersResult.rows.filter(u => u.role === 'admin' || u.role === 'super_admin');
      if (adminUsers.length > 0) {
        console.log("   ✅ يوجد مستخدمين مديرين:");
        adminUsers.forEach(admin => {
          console.log(`      📱 ${admin.phone || "N/A"} - ${admin.name_ar || admin.name || "بدون اسم"} (${admin.role})`);
        });
      } else {
        console.log("   ⚠️  لا يوجد مستخدمين مديرين");
        console.log("   💡 سيتم إنشاء مستخدم افتراضي عند بدء السيرفر:");
        console.log("      📱 رقم الهاتف: 0500000000");
        console.log("      🔑 كلمة المرور: 123456");
      }
    } else {
      console.log("   ⚠️  لا يوجد مستخدمين في قاعدة البيانات");
      console.log("   💡 سيتم إنشاء مستخدم افتراضي عند بدء السيرفر:");
      console.log("      📱 رقم الهاتف: 0500000000");
      console.log("      🔑 كلمة المرور: 123456");
    }

    console.log("\n✅ اكتمل الفحص");

  } catch (error: any) {
    console.error("\n❌ خطأ أثناء الفحص:", error.message);
    await pool.end();
    process.exit(1);
  }
}

checkUsers();
