import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function createDatabase() {
  // الاتصال بقاعدة البيانات الافتراضية postgres لإنشاء قاعدة جديدة
  // استخدام المنفذ 5433 لـ PostgreSQL 18
  const adminPool = new Pool({
    host: "localhost",
    port: 5433,
    user: "postgres",
    password: "774424555",
    database: "postgres", // الاتصال بقاعدة البيانات الافتراضية
  });

  try {
    console.log("🔌 الاتصال بـ PostgreSQL...");
    
    // التحقق من وجود قاعدة البيانات
    const checkResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      ["666666"]
    );

    if (checkResult.rows.length > 0) {
      console.log("✅ قاعدة البيانات 666666 موجودة بالفعل");
    } else {
      // إنشاء قاعدة البيانات
      await adminPool.query('CREATE DATABASE "666666" ENCODING \'UTF8\'');
      console.log("✅ تم إنشاء قاعدة البيانات 666666 بنجاح");
    }

    // الاتصال بقاعدة البيانات الجديدة للتحقق
    const testPool = new Pool({
      host: "localhost",
      port: 5433,
      user: "postgres",
      password: "774424555",
      database: "666666",
    });

    const testResult = await testPool.query("SELECT version()");
    console.log("✅ الاتصال بقاعدة البيانات 666666 ناجح");
    console.log(`📊 إصدار PostgreSQL: ${testResult.rows[0].version}`);

    await testPool.end();
    await adminPool.end();
    
    console.log("\n🎉 تم الإعداد بنجاح!");
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء قاعدة البيانات:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("⚠️  تأكد من أن PostgreSQL يعمل على المنفذ 5433");
    } else if (error.code === "28P01") {
      console.error("⚠️  كلمة المرور غير صحيحة");
    }
    process.exit(1);
  }
}

createDatabase();


