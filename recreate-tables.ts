import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function recreateTables() {
  const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("🗑️  حذف جميع الجداول...");
    
    // الحصول على قائمة الجداول
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%'
      ORDER BY table_name;
    `);

    // حذف جميع الجداول
    for (const row of tables.rows) {
      const tableName = row.table_name;
      try {
        await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        console.log(`  ✅ تم حذف ${tableName}`);
      } catch (error: any) {
        console.log(`  ⚠️  خطأ في حذف ${tableName}: ${error.message}`);
      }
    }

    await pool.end();
    console.log("\n✅ تم حذف جميع الجداول بنجاح!");
    console.log("💡 الآن يمكنك تشغيل: pnpm drizzle-kit migrate");
  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
    process.exit(1);
  }
}

recreateTables();

