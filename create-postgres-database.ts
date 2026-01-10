import "dotenv/config";
import { Pool } from "pg";

async function createDatabase() {
  console.log("=".repeat(60));
  console.log("🔧 إنشاء قاعدة البيانات PostgreSQL");
  console.log("=".repeat(60));

  // استخدام المنفذ 5433 (PostgreSQL 18)
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:774424555@localhost:5433/postgres";
  const targetDbName = "666666";

  // الاتصال بقاعدة البيانات الافتراضية 'postgres' لإنشاء قاعدة البيانات الجديدة
  const adminPool = new Pool({
    connectionString: dbUrl.replace(/\/[^\/]+$/, "/postgres"),
  });

  try {
    console.log(`\n1️⃣  الاتصال بخادم PostgreSQL...`);
    await adminPool.query("SELECT 1");
    console.log("   ✅ تم الاتصال بنجاح");

    // التحقق من وجود قاعدة البيانات
    console.log(`\n2️⃣  التحقق من وجود قاعدة البيانات "${targetDbName}"...`);
    const checkResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`   ⚠️  قاعدة البيانات "${targetDbName}" موجودة بالفعل`);
      console.log(`   💡 يمكنك استخدام: DROP DATABASE IF EXISTS ${targetDbName}; لحذفها`);
    } else {
      // إنشاء قاعدة البيانات
      console.log(`\n3️⃣  إنشاء قاعدة البيانات "${targetDbName}"...`);
      await adminPool.query(`CREATE DATABASE "${targetDbName}" ENCODING 'UTF8'`);
      console.log(`   ✅ تم إنشاء قاعدة البيانات "${targetDbName}" بنجاح`);

      // ضبط الترميز
      const targetPool = new Pool({
        connectionString: dbUrl.replace(/\/[^\/]+$/, `/${targetDbName}`),
      });

      console.log(`\n4️⃣  ضبط إعدادات قاعدة البيانات...`);
      await targetPool.query("SET client_encoding TO 'UTF8'");
      await targetPool.query("SET timezone TO 'UTC'");
      console.log("   ✅ تم ضبط الترميز UTF-8 والمنطقة الزمنية UTC");

      await targetPool.end();
    }

    await adminPool.end();
    console.log(`\n✅ اكتمل الإعداد بنجاح!`);
    console.log(`\n📝 معلومات الاتصال:`);
    console.log(`   DATABASE_URL=postgresql://postgres:774424555@localhost:5433/${targetDbName}`);
  } catch (error: any) {
    console.log(`\n❌ خطأ أثناء إنشاء قاعدة البيانات:`);
    console.log(`   ${error.message}`);
    
    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 تأكد من أن خادم PostgreSQL يعمل");
      console.log("   Windows: Get-Service postgresql*");
    } else if (error.code === "28P01") {
      console.log("\n💡 تأكد من صحة اسم المستخدم وكلمة المرور");
    } else if (error.message.includes("already exists")) {
      console.log(`\n✅ قاعدة البيانات "${targetDbName}" موجودة بالفعل`);
    }
    
    await adminPool.end();
    process.exit(1);
  }
}

createDatabase();
