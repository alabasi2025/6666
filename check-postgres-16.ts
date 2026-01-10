import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function checkPostgres16() {
  console.log("=".repeat(60));
  console.log("🔍 فحص PostgreSQL 16 (المنفذ 5432)");
  console.log("=".repeat(60));

  const adminPool16 = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "postgres",
  });

  try {
    console.log("\n🔌 محاولة الاتصال بـ PostgreSQL على المنفذ 5432...");
    await adminPool16.query("SELECT version()");
    console.log("   ✅ تم الاتصال بنجاح\n");

    // الحصول على قائمة قواعد البيانات
    console.log("📊 قواعد البيانات الموجودة على PostgreSQL 16:\n");
    const result = await adminPool16.query(`
      SELECT 
        datname as "اسم قاعدة البيانات",
        pg_size_pretty(pg_database_size(datname)) as "الحجم"
      FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname
    `);

    if (result.rows.length === 0) {
      console.log("   ⚠️  لا توجد قواعد بيانات غير النظام");
    } else {
      for (const row of result.rows) {
        console.log(`   - ${row["اسم قاعدة البيانات"]} (${row["الحجم"]})`);
      }
    }

    // التحقق من وجود قاعدة البيانات 666666
    console.log("\n🔍 التحقق من قاعدة البيانات '666666' على PostgreSQL 16:");
    const checkResult = await adminPool16.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      ["666666"]
    );

    if (checkResult.rows.length > 0) {
      console.log("   ✅ قاعدة البيانات '666666' موجودة على PostgreSQL 16");
      
      // التحقق من الجداول
      const tablesPool = new Pool({
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "774424555",
        database: "666666",
      });

      try {
        const tablesResult = await tablesPool.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);

        const tableCount = parseInt(tablesResult.rows[0].count);
        console.log(`   📊 عدد الجداول: ${tableCount}`);
        
        if (tableCount > 0) {
          console.log("   ✅ قاعدة البيانات تحتوي على بيانات!");
          
          // عرض بعض أسماء الجداول
          const tableNamesResult = await tablesPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
            LIMIT 10
          `);
          
          console.log("\n   📋 بعض أسماء الجداول:");
          for (const row of tableNamesResult.rows) {
            console.log(`      - ${row.table_name}`);
          }
        }

        await tablesPool.end();
      } catch (error: any) {
        console.log(`   ❌ خطأ في الاتصال بقاعدة البيانات: ${error.message}`);
      }
    } else {
      console.log("   ❌ قاعدة البيانات '666666' غير موجودة على PostgreSQL 16");
    }

    await adminPool16.end();
    console.log("\n✅ اكتمل الفحص");
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      console.log("\n   ℹ️  PostgreSQL 16 غير قيد التشغيل أو غير متاح على المنفذ 5432");
      console.log("   (هذا طبيعي إذا كان PostgreSQL 18 فقط هو القيد التشغيل)");
    } else {
      console.error("\n❌ خطأ:", error.message);
    }
    process.exit(0); // لا نريد إيقاف البرنامج إذا كان 16 متوقف
  }
}

checkPostgres16();
