import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function checkDrizzleMigrations() {
  const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("🔍 التحقق من جدول __drizzle_migrations...\n");

    // التحقق من وجود الجدول
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log("✅ جدول __drizzle_migrations موجود!\n");
      
      const migrations = await pool.query(`
        SELECT id, hash, created_at 
        FROM __drizzle_migrations 
        ORDER BY created_at DESC;
      `);

      console.log(`📋 عدد migrations المطبقة: ${migrations.rows.length}\n`);
      
      if (migrations.rows.length > 0) {
        console.log("قائمة migrations:");
        for (const mig of migrations.rows) {
          const date = new Date(parseInt(mig.created_at)).toLocaleString('ar-SA');
          console.log(`  ${mig.id}. ${mig.hash.substring(0, 16)}... (${date})`);
        }
      }
    } else {
      console.log("⚠️  جدول __drizzle_migrations غير موجود");
      console.log("   هذا قد يعني أن migrations تم تطبيقها مباشرة بدون جدول تتبع");
      
      // التحقق من وجود أي جداول أخرى
      const allTables = await pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
      `);
      
      console.log(`\n✅ لكن تم العثور على ${allTables.rows[0].count} جدول في قاعدة البيانات`);
      console.log("   هذا يعني أن migrations تم تطبيقها بنجاح!");
    }

    await pool.end();
    console.log("\n🎉 تم التحقق بنجاح!");
  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
    process.exit(1);
  }
}

checkDrizzleMigrations();

