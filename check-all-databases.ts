import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function checkAllDatabases() {
  console.log("=".repeat(70));
  console.log("🔍 فحص شامل لجميع قواعد البيانات على PostgreSQL");
  console.log("=".repeat(70));

  // فحص PostgreSQL 18 (المنفذ 5433)
  console.log("\n" + "─".repeat(70));
  console.log("1️⃣  PostgreSQL 18 (المنفذ 5433)");
  console.log("─".repeat(70));

  const pool18 = new Pool({
    host: "localhost",
    port: 5433,
    user: "postgres",
    password: "774424555",
    database: "postgres",
  });

  try {
    const versionResult = await pool18.query("SELECT version()");
    console.log(`   ✅ متصل: ${versionResult.rows[0].version.split(',')[0]}`);

    const dbsResult = await pool18.query(`
      SELECT 
        datname as "اسم قاعدة البيانات",
        pg_size_pretty(pg_database_size(datname)) as "الحجم",
        datcollate as "الترتيب"
      FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname
    `);

    if (dbsResult.rows.length === 0) {
      console.log("   ⚠️  لا توجد قواعد بيانات");
    } else {
      console.log(`\n   📊 عدد قواعد البيانات: ${dbsResult.rows.length}\n`);
      for (const row of dbsResult.rows) {
        const dbName = row["اسم قاعدة البيانات"];
        const size = row["الحجم"];
        
        // فحص عدد الجداول
        try {
          const tablesPool = new Pool({
            host: "localhost",
            port: 5433,
            user: "postgres",
            password: "774424555",
            database: dbName,
          });

          const tablesCount = await tablesPool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
          `);

          const tableCount = parseInt(tablesCount.rows[0].count);
          
          // محاولة جلب عدد الصفوف في بعض الجداول
          let totalRows = 0;
          if (tableCount > 0) {
            try {
              const sampleTable = await tablesPool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                LIMIT 1
              `);
              
              if (sampleTable.rows.length > 0) {
                const firstTable = sampleTable.rows[0].table_name;
                const rowCountResult = await tablesPool.query(`SELECT COUNT(*) as cnt FROM "${firstTable}"`);
                totalRows = parseInt(rowCountResult.rows[0]?.cnt || 0);
              }
            } catch {}
          }

          console.log(`   📁 ${dbName.padEnd(25)} │ الحجم: ${size.padEnd(12)} │ الجداول: ${tableCount.toString().padStart(4)} │ البيانات: ${totalRows > 0 ? '✅' : '⚪'}`);
          
          await tablesPool.end();
        } catch (error: any) {
          console.log(`   📁 ${dbName.padEnd(25)} │ الحجم: ${size.padEnd(12)} │ خطأ في الفحص`);
        }
      }
    }

    await pool18.end();
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      console.log("   ❌ غير متاح (المنفذ 5433)");
    } else {
      console.log(`   ❌ خطأ: ${error.message}`);
    }
  }

  // فحص PostgreSQL 16 (المنفذ 5432)
  console.log("\n" + "─".repeat(70));
  console.log("2️⃣  PostgreSQL 16 (المنفذ 5432)");
  console.log("─".repeat(70));

  const pool16 = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "postgres",
  });

  try {
    const versionResult = await pool16.query("SELECT version()");
    console.log(`   ✅ متصل: ${versionResult.rows[0].version.split(',')[0]}`);

    const dbsResult = await pool16.query(`
      SELECT 
        datname as "اسم قاعدة البيانات",
        pg_size_pretty(pg_database_size(datname)) as "الحجم",
        datcollate as "الترتيب"
      FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname
    `);

    if (dbsResult.rows.length === 0) {
      console.log("   ⚠️  لا توجد قواعد بيانات");
    } else {
      console.log(`\n   📊 عدد قواعد البيانات: ${dbsResult.rows.length}\n`);
      for (const row of dbsResult.rows) {
        const dbName = row["اسم قاعدة البيانات"];
        const size = row["الحجم"];
        
        // فحص عدد الجداول
        try {
          const tablesPool = new Pool({
            host: "localhost",
            port: 5432,
            user: "postgres",
            password: "774424555",
            database: dbName,
          });

          const tablesCount = await tablesPool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
          `);

          const tableCount = parseInt(tablesCount.rows[0].count);
          
          // محاولة جلب عدد الصفوف في بعض الجداول
          let totalRows = 0;
          let hasData = false;
          if (tableCount > 0) {
            try {
              const sampleTable = await tablesPool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                LIMIT 5
              `);
              
              for (const tableRow of sampleTable.rows) {
                try {
                  const rowCountResult = await tablesPool.query(`SELECT COUNT(*) as cnt FROM "${tableRow.table_name}"`);
                  const count = parseInt(rowCountResult.rows[0]?.cnt || 0);
                  totalRows += count;
                  if (count > 0) hasData = true;
                } catch {}
              }
            } catch {}
          }

          const dataStatus = hasData ? '✅ يحتوي على بيانات' : (tableCount > 0 ? '⚪ فارغة' : '⚪ بدون جداول');
          console.log(`   📁 ${dbName.padEnd(25)} │ الحجم: ${size.padEnd(12)} │ الجداول: ${tableCount.toString().padStart(4)} │ ${dataStatus}`);
          
          await tablesPool.end();
        } catch (error: any) {
          console.log(`   📁 ${dbName.padEnd(25)} │ الحجم: ${size.padEnd(12)} │ خطأ في الفحص: ${error.message}`);
        }
      }
    }

    await pool16.end();
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      console.log("   ❌ غير متاح (PostgreSQL 16 غير قيد التشغيل)");
      console.log("   💡 لتشغيله: Start-Service -Name 'postgresql-x64-16'");
    } else {
      console.log(`   ❌ خطأ: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ اكتمل الفحص");
  console.log("=".repeat(70));
}

checkAllDatabases().catch(console.error);
