import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

async function testConnection() {
  console.log("=".repeat(60));
  console.log("🔍 فحص اتصال قاعدة البيانات PostgreSQL");
  console.log("=".repeat(60));
  
  // Check if DATABASE_URL is set
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:774424555@localhost:5432/666666";
  
  console.log("\n1️⃣ فحص متغير البيئة DATABASE_URL:");
  if (process.env.DATABASE_URL) {
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`   ✅ DATABASE_URL محدد: ${maskedUrl}`);
  } else {
    console.log("   ⚠️ DATABASE_URL غير محدد - استخدام الإعدادات الافتراضية");
    console.log(`   📋 الاتصال الافتراضي: postgresql://postgres:****@localhost:5432/666666`);
  }
  
  // Parse URL to get details
  try {
    const url = new URL(dbUrl);
    console.log("\n2️⃣ تفاصيل الاتصال:");
    console.log(`   - البروتوكول (Protocol): ${url.protocol.replace(':', '')}`);
    console.log(`   - المضيف (Host): ${url.hostname}`);
    console.log(`   - المنفذ (Port): ${url.port || '5432 (default)'}`);
    console.log(`   - قاعدة البيانات (Database): ${url.pathname.replace('/', '')}`);
    console.log(`   - المستخدم (User): ${url.username}`);
  } catch (e) {
    console.log("   ⚠️ تعذر تحليل عنوان URL");
  }
  
  // Test actual connection
  console.log("\n3️⃣ اختبار الاتصال الفعلي:");
  let pool: Pool | null = null;
  try {
    pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 5000,
    });
    
    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();
    
    console.log("   ✅ تم الاتصال بقاعدة البيانات بنجاح!");
    console.log(`   🕐 وقت الخادم: ${result.rows[0].current_time}`);
    console.log(`   📦 إصدار PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    
    // Check database name
    const dbNameResult = await pool.query('SELECT current_database() as db_name');
    console.log(`   💾 قاعدة البيانات: ${dbNameResult.rows[0].db_name}`);
    
    // Check tables count
    console.log("\n4️⃣ فحص الجداول:");
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tablesResult.rows[0].table_count);
    console.log(`   ✅ عدد الجداول: ${tableCount}`);
    
    if (tableCount > 0) {
      // Get sample tables
      const sampleTables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name 
        LIMIT 10
      `);
      console.log(`   📋 عينة من الجداول (أول 10):`);
      sampleTables.rows.forEach((row: any, index: number) => {
        console.log(`      ${index + 1}. ${row.table_name}`);
      });
    }
    
    // Test Drizzle connection
    console.log("\n5️⃣ اختبار Drizzle ORM:");
    const db = drizzle(pool);
    await db.execute(sql`SELECT 1 as test`);
    console.log("   ✅ Drizzle ORM يعمل بشكل صحيح!");
    
    // Check encoding
    const encodingResult = await pool.query("SHOW client_encoding");
    console.log(`   📝 Encoding: ${encodingResult.rows[0].client_encoding}`);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ جميع الاختبارات نجحت!");
    console.log("=".repeat(60));
    process.exit(0);
    
  } catch (error: any) {
    console.log("   ❌ فشل الاتصال بقاعدة البيانات");
    console.log(`   🔴 الخطأ: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log("\n   💡 الحل المقترح:");
      console.log("   - تأكد من أن خادم PostgreSQL يعمل");
      console.log("   - تحقق من صحة المضيف والمنفذ (افتراضي: localhost:5432)");
      console.log("   - تحقق من أن PostgreSQL Service يعمل: Get-Service postgresql*");
    } else if (error.code === '28P01') {
      console.log("\n   💡 الحل المقترح:");
      console.log("   - تحقق من صحة اسم المستخدم وكلمة المرور");
      console.log("   - تأكد من إعدادات pg_hba.conf");
    } else if (error.code === '3D000') {
      console.log("\n   💡 الحل المقترح:");
      console.log("   - قاعدة البيانات غير موجودة، قم بإنشائها أولاً:");
      console.log("   - CREATE DATABASE 666666;");
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.log("\n   💡 الحل المقترح:");
      console.log("   - تحقق من إعدادات الشبكة");
      console.log("   - تأكد من أن PostgreSQL Service يعمل");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("❌ فشل الاتصال");
    console.log("=".repeat(60));
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

testConnection();

