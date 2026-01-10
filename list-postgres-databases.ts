import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function listDatabases() {
  console.log("=".repeat(60));
  console.log("📋 قائمة قواعد البيانات الموجودة على PostgreSQL");
  console.log("=".repeat(60));

  // استخدام المنفذ 5433 لـ PostgreSQL 18
  const adminPool = new Pool({
    host: "localhost",
    port: 5433,
    user: "postgres",
    password: "774424555",
    database: "postgres", // الاتصال بقاعدة البيانات الافتراضية
  });

  try {
    console.log("\n🔌 الاتصال بخادم PostgreSQL 18...");
    await adminPool.query("SELECT 1");
    console.log("   ✅ تم الاتصال بنجاح\n");

    // الحصول على قائمة قواعد البيانات
    console.log("📊 قواعد البيانات الموجودة:\n");
    const result = await adminPool.query(`
      SELECT 
        datname as "اسم قاعدة البيانات",
        pg_size_pretty(pg_database_size(datname)) as "الحجم",
        datcollate as "الترتيب",
        datctype as "الترميز"
      FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname
    `);

    if (result.rows.length === 0) {
      console.log("   ⚠️  لا توجد قواعد بيانات غير النظام");
    } else {
      console.log("┌─────────────────────────────────────────────────────────────────┐");
      console.log("│ اسم قاعدة البيانات       │ الحجم      │ الترميز                │");
      console.log("├─────────────────────────────────────────────────────────────────┤");
      
      for (const row of result.rows) {
        const dbName = row["اسم قاعدة البيانات"].padEnd(25);
        const size = row["الحجم"].padEnd(12);
        const encoding = row["الترميز"].padEnd(20);
        console.log(`│ ${dbName} │ ${size} │ ${encoding} │`);
      }
      
      console.log("└─────────────────────────────────────────────────────────────────┘");
    }

    // التحقق من وجود قاعدة البيانات 666666
    console.log("\n🔍 التحقق من قاعدة البيانات '666666':");
    const checkResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      ["666666"]
    );

    if (checkResult.rows.length > 0) {
      console.log("   ✅ قاعدة البيانات '666666' موجودة");
      
      // التحقق من الجداول
      const tablesPool = new Pool({
        host: "localhost",
        port: 5433,
        user: "postgres",
        password: "774424555",
        database: "666666",
      });

      const tablesResult = await tablesPool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      const tableCount = parseInt(tablesResult.rows[0].count);
      console.log(`   📊 عدد الجداول: ${tableCount}`);
      
      if (tableCount === 0) {
        console.log("   ⚠️  قاعدة البيانات فارغة (لا توجد جداول)");
      } else {
        console.log("   ✅ قاعدة البيانات تحتوي على جداول");
      }

      await tablesPool.end();
    } else {
      console.log("   ❌ قاعدة البيانات '666666' غير موجودة");
    }

    // البحث عن قواعد بيانات أخرى محتملة
    console.log("\n🔍 البحث عن قواعد بيانات محتملة:");
    const searchTerms = ["energy", "management", "666", "system"];
    const searchResult = await adminPool.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false
      AND (
        LOWER(datname) LIKE '%energy%' OR
        LOWER(datname) LIKE '%management%' OR
        LOWER(datname) LIKE '%666%' OR
        LOWER(datname) LIKE '%system%'
      )
    `);

    if (searchResult.rows.length > 0) {
      console.log("   تم العثور على قواعد بيانات ذات صلة:");
      for (const row of searchResult.rows) {
        console.log(`   - ${row.datname}`);
      }
    } else {
      console.log("   لا توجد قواعد بيانات أخرى ذات صلة");
    }

    await adminPool.end();
    console.log("\n✅ اكتمل الفحص");
  } catch (error: any) {
    console.error("\n❌ خطأ أثناء الفحص:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("   ⚠️  تأكد من أن PostgreSQL يعمل على المنفذ 5433");
    } else if (error.code === "28P01") {
      console.error("   ⚠️  كلمة المرور غير صحيحة");
    }
    await adminPool.end();
    process.exit(1);
  }
}

listDatabases();
