import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function checkPostgres16Database() {
  console.log("=".repeat(60));
  console.log("🔍 فحص قاعدة البيانات على PostgreSQL 16 (المنفذ 5432)");
  console.log("=".repeat(60));

  const adminPool16 = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "postgres",
  });

  try {
    console.log("\n🔌 محاولة الاتصال بـ PostgreSQL 16 على المنفذ 5432...");
    await adminPool16.query("SELECT version()");
    console.log("   ✅ تم الاتصال بنجاح\n");

    // فحص قواعد البيانات
    console.log("📊 قواعد البيانات الموجودة:\n");
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

    // التحقق من قاعدة البيانات 666666
    console.log("\n🔍 التحقق من قاعدة البيانات '666666' على PostgreSQL 16:");
    const checkResult = await adminPool16.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      ["666666"]
    );

    if (checkResult.rows.length > 0) {
      console.log("   ✅ قاعدة البيانات '666666' موجودة على PostgreSQL 16");
      
      const tablesPool = new Pool({
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "774424555",
        database: "666666",
      });

      try {
        // عدد الجداول
        const tablesResult = await tablesPool.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);

        const tableCount = parseInt(tablesResult.rows[0].count);
        console.log(`   📊 عدد الجداول: ${tableCount}`);
        
        if (tableCount > 0) {
          console.log("   ✅ قاعدة البيانات تحتوي على جداول!");
          
          // عرض بعض الجداول مع عدد الصفوف
          const tableInfoResult = await tablesPool.query(`
            SELECT 
              table_name,
              (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public'
            ORDER BY table_name
            LIMIT 10
          `);
          
          console.log("\n   📋 بعض الجداول:");
          for (const row of tableInfoResult.rows) {
            // محاولة جلب عدد الصفوف
            try {
              const countResult = await tablesPool.query(`SELECT COUNT(*) as cnt FROM "${row.table_name}"`);
              const rowCount = countResult.rows[0]?.cnt || 0;
              console.log(`      - ${row.table_name} (${rowCount} صف)`);
            } catch {
              console.log(`      - ${row.table_name}`);
            }
          }
        }

        await tablesPool.end();
      } catch (error: any) {
        console.log(`   ❌ خطأ: ${error.message}`);
      }
    } else {
      console.log("   ❌ قاعدة البيانات '666666' غير موجودة على PostgreSQL 16");
    }

    await adminPool16.end();
    console.log("\n✅ اكتمل الفحص");
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      console.log("\n   ❌ PostgreSQL 16 غير قيد التشغيل على المنفذ 5432");
      console.log("   💡 يجب تشغيل PostgreSQL 16 للوصول إلى قاعدة البيانات الأصلية");
    } else {
      console.error("\n❌ خطأ:", error.message);
    }
    process.exit(0);
  }
}

checkPostgres16Database();
