import "dotenv/config";
import { getDb } from "./server/db";
import { sql } from "drizzle-orm";
import fs from "fs";

async function applyMissingTables() {
  console.log("=".repeat(60));
  console.log("🔧 تطبيق إصلاح الجداول المفقودة");
  console.log("=".repeat(60));
  
  const db = await getDb();
  if (!db) {
    console.log("❌ قاعدة البيانات غير متصلة");
    process.exit(1);
  }
  
  console.log("✅ متصل بقاعدة البيانات\n");
  
  // قراءة ملف SQL
  const sqlContent = fs.readFileSync("fix-missing-tables.sql", "utf8");
  
  // تقسيم إلى جمل SQL
  // إزالة التعليقات أولاً
  const cleanedContent = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
  
  const statements = cleanedContent
    .split(";")
    .map(s => s.trim())
    .filter(s => 
      s.length > 10 && 
      !s.startsWith("SET NAMES") &&
      !s.startsWith("SELECT")
    );
  
  console.log(`📝 عدد الجمل SQL للتنفيذ: ${statements.length}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const statement of statements) {
    const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
    
    try {
      await db.execute(sql.raw(statement));
      
      // تحديد نوع العملية
      if (statement.includes("CREATE TABLE")) {
        const match = statement.match(/CREATE TABLE.*?`(\w+)`/);
        const tableName = match ? match[1] : "unknown";
        console.log(`✅ CREATE TABLE: ${tableName}`);
      } else if (statement.includes("ALTER TABLE") && statement.includes("ADD CONSTRAINT")) {
        const match = statement.match(/ALTER TABLE\s+`(\w+)`/);
        const tableName = match ? match[1] : "unknown";
        console.log(`✅ ADD CONSTRAINT: ${tableName}`);
      } else {
        console.log(`✅ تنفيذ: ${preview}...`);
      }
      
      successCount++;
    } catch (e: any) {
      // تجاهل الأخطاء المعروفة (الجداول موجودة بالفعل أو constraints موجودة)
      if (
        e.message?.includes("already exists") || 
        e.message?.includes("Duplicate") ||
        e.message?.includes("duplicate key name")
      ) {
        console.log(`⚠️  موجود بالفعل: ${preview}...`);
      } else {
        console.log(`❌ خطأ: ${preview}...`);
        console.log(`   التفاصيل: ${e.message}`);
        errorCount++;
      }
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log(`📊 النتائج:`);
  console.log(`   ✅ نجح: ${successCount}`);
  console.log(`   ❌ فشل: ${errorCount}`);
  console.log("=".repeat(60));
  
  // التحقق من الجداول
  console.log("\n🔍 التحقق من الجداول المنشأة:");
  
  const tablesToCheck = ["custom_transactions", "custom_treasury_movements"];
  
  for (const table of tablesToCheck) {
    try {
      const result = await db.execute(sql.raw(`SHOW TABLES LIKE '${table}'`));
      const exists = (result as any)[0].length > 0;
      
      if (exists) {
        const count = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
        const rowCount = (count as any)[0][0].count;
        console.log(`   ✅ ${table}: موجود (${rowCount} سجل)`);
      } else {
        console.log(`   ❌ ${table}: غير موجود`);
      }
    } catch (e: any) {
      console.log(`   ⚠️  ${table}: ${e.message}`);
    }
  }
  
  console.log("\n🎉 تم تطبيق الإصلاحات!");
}

applyMissingTables().catch(console.error);

