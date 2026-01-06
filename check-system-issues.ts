import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function checkIssues() {
  const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("🔍 فحص المشاكل المحتملة...\n");

    // 1. التحقق من الاتصال
    console.log("1️⃣ التحقق من الاتصال بقاعدة البيانات...");
    await pool.query("SELECT 1");
    console.log("   ✅ الاتصال يعمل بشكل صحيح\n");

    // 2. التحقق من الجداول التي لديها مشاكل
    console.log("2️⃣ التحقق من الجداول التي لديها مشاكل في الأعمدة...\n");
    
    const problematicTables = ["custom_accounts", "custom_treasuries", "users"];
    
    for (const table of problematicTables) {
      try {
        const columns = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position;
        `, [table]);

        console.log(`📋 ${table}:`);
        const enumColumns = columns.rows.filter(col => col.column_name === "_enum_");
        if (enumColumns.length > 0) {
          console.log(`   ⚠️  مشكلة: يوجد عمود "_enum_" غير صحيح`);
          console.log(`   💡 يجب استبداله بالعمود الصحيح`);
        }
        
        // التحقق من الأعمدة المطلوبة
        const columnNames = columns.rows.map(c => c.column_name);
        if (table === "users" && !columnNames.includes("role")) {
          console.log(`   ⚠️  مشكلة: عمود "role" غير موجود`);
        }
        if (table === "custom_accounts" && !columnNames.includes("account_number")) {
          console.log(`   ⚠️  مشكلة: عمود "account_number" غير موجود`);
        }
        if (table === "custom_treasuries" && !columnNames.includes("treasury_type")) {
          console.log(`   ⚠️  مشكلة: عمود "treasury_type" غير موجود`);
        }
        
        console.log(`   ✅ عدد الأعمدة: ${columns.rows.length}`);
        console.log("");
      } catch (error: any) {
        console.log(`   ❌ خطأ: ${error.message}\n`);
      }
    }

    // 3. التحقق من البيانات
    console.log("3️⃣ التحقق من البيانات...\n");
    const dataCheck = await pool.query(`
      SELECT 
        'businesses' as table_name, COUNT(*) as count FROM businesses
      UNION ALL
      SELECT 'branches', COUNT(*) FROM branches
      UNION ALL
      SELECT 'users', COUNT(*) FROM users
      UNION ALL
      SELECT 'custom_sub_systems', COUNT(*) FROM custom_sub_systems;
    `);

    for (const row of dataCheck.rows) {
      console.log(`   ${row.table_name}: ${row.count} صف`);
    }

    // 4. التحقق من الأخطاء المحتملة في البيانات
    console.log("\n4️⃣ التحقق من الأخطاء في البيانات...\n");
    
    // التحقق من null values في أعمدة required
    const nullChecks = await pool.query(`
      SELECT COUNT(*) as null_count 
      FROM users 
      WHERE "openId" IS NULL;
    `);
    
    if (parseInt(nullChecks.rows[0].null_count) > 0) {
      console.log(`   ⚠️  يوجد ${nullChecks.rows[0].null_count} صف في users بدون openId`);
    } else {
      console.log(`   ✅ جميع المستخدمين لديهم openId`);
    }

    await pool.end();
    console.log("\n✅ تم الفحص بنجاح!");
  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("⚠️  PostgreSQL غير متاح");
    }
    process.exit(1);
  }
}

checkIssues();

