import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function checkMigrations() {
  const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("🔍 التحقق من جدول migrations...\n");

    // التحقق من وجود جدول migrations بأسماء مختلفة
    const migrationsTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%migration%' OR table_name LIKE '%drizzle%')
      ORDER BY table_name;
    `);

    if (migrationsTables.rows.length > 0) {
      console.log("✅ تم العثور على جداول migrations:");
      for (const row of migrationsTables.rows) {
        const tableName = row.table_name;
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}";`);
        const count = countResult.rows[0].count;
        console.log(`  - ${tableName}: ${count} migration`);
        
        if (count > 0) {
          const migrations = await pool.query(`SELECT * FROM "${tableName}" ORDER BY created_at DESC LIMIT 5;`);
          console.log(`    آخر migrations:`);
          for (const mig of migrations.rows) {
            console.log(`      • ${mig.hash || mig.id || 'N/A'}`);
          }
        }
      }
    } else {
      console.log("⚠️  لم يتم العثور على جدول migrations");
      console.log("   هذا قد يكون طبيعي إذا كانت migrations جديدة");
    }

    // التحقق من بعض الجداول المهمة
    console.log("\n\n🔍 التحقق من بعض الجداول المهمة:\n");
    const importantTables = ['users', 'businesses', 'branches', 'stations', 'accounts'];
    
    for (const table of importantTables) {
      try {
        const result = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position
          LIMIT 5;
        `, [table]);
        
        if (result.rows.length > 0) {
          console.log(`✅ ${table}:`);
          for (const col of result.rows) {
            console.log(`   - ${col.column_name} (${col.data_type})`);
          }
        } else {
          console.log(`❌ ${table}: الجدول غير موجود`);
        }
      } catch (error: any) {
        console.log(`⚠️  ${table}: خطأ - ${error.message}`);
      }
    }

    await pool.end();
    console.log("\n🎉 تم التحقق بنجاح!");
  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
    process.exit(1);
  }
}

checkMigrations();

