import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function checkTables() {
  const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("🔌 الاتصال بقاعدة البيانات PostgreSQL...\n");

    // الحصول على قائمة الجداول
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log(`✅ تم العثور على ${tables.length} جدول في قاعدة البيانات:\n`);
    
    // عرض الجداول في أعمدة
    const columns = 3;
    for (let i = 0; i < tables.length; i += columns) {
      const row = tables.slice(i, i + columns);
      console.log(row.map(t => `  ${(i + row.indexOf(t) + 1).toString().padStart(3, ' ')}. ${t.padEnd(35)}`).join(''));
    }

    // الحصول على عدد الصفوف في كل جدول
    console.log("\n\n📊 عدد الصفوف في كل جدول:\n");
    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${table}";`);
        const count = countResult.rows[0].count;
        console.log(`  ${table.padEnd(50)} : ${count} صف`);
      } catch (error: any) {
        console.log(`  ${table.padEnd(50)} : خطأ - ${error.message}`);
      }
    }

    // التحقق من وجود جدول migrations
    const migrationsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '__drizzle_migrations';
    `);

    if (parseInt(migrationsResult.rows[0].count) > 0) {
      const migrationsCount = await pool.query(`SELECT COUNT(*) as count FROM __drizzle_migrations;`);
      console.log(`\n✅ جدول migrations موجود: ${migrationsCount.rows[0].count} migration`);
    } else {
      console.log("\n⚠️  جدول migrations غير موجود");
    }

    await pool.end();
    console.log("\n🎉 تم التحقق بنجاح!");
  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("⚠️  تأكد من أن PostgreSQL يعمل على المنفذ 5432");
    } else if (error.code === "28P01") {
      console.error("⚠️  كلمة المرور غير صحيحة");
    } else if (error.code === "3D000") {
      console.error("⚠️  قاعدة البيانات غير موجودة");
    }
    process.exit(1);
  }
}

checkTables();

