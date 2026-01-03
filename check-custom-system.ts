import "dotenv/config";
import { getDb } from "./server/db";
import { sql } from "drizzle-orm";

async function checkCustomSystem() {
  console.log("=".repeat(60));
  console.log("🔍 فحص النظام المخصص - Custom System Inspection");
  console.log("=".repeat(60));
  
  const db = await getDb();
  if (!db) {
    console.log("❌ قاعدة البيانات غير متصلة");
    process.exit(1);
  }
  
  console.log("✅ متصل بقاعدة البيانات\n");
  
  // 1. فحص الجداول المخصصة
  console.log("1️⃣  فحص الجداول المخصصة (Custom Tables):");
  const allTables = await db.execute(sql.raw("SHOW TABLES"));
  const tablesList = (allTables as any)[0].map((t: any) => Object.values(t)[0]);
  
  const customTables = tablesList.filter((t: string) => t.startsWith("custom_"));
  console.log(`   📋 عدد الجداول المخصصة: ${customTables.length}`);
  
  if (customTables.length > 0) {
    console.log("\n   الجداول الموجودة:");
    customTables.forEach((table: string, i: number) => {
      console.log(`      ${i + 1}. ${table}`);
    });
  }
  
  // 2. فحص الجداول المطلوبة
  console.log("\n2️⃣  فحص الجداول المطلوبة:");
  const requiredTables = [
    "custom_accounts",
    "custom_transactions",
    "custom_notes",
    "custom_memos",
    "custom_parties",
    "custom_categories",
    "custom_currencies",
    "custom_treasuries",
    "custom_treasury_currencies",
    "custom_treasury_movements",
    "custom_settings"
  ];
  
  let missingTables: string[] = [];
  for (const table of requiredTables) {
    const exists = tablesList.includes(table);
    const status = exists ? "✅" : "❌";
    console.log(`   ${status} ${table}`);
    if (!exists) {
      missingTables.push(table);
    }
  }
  
  if (missingTables.length > 0) {
    console.log(`\n   ⚠️  جداول مفقودة: ${missingTables.length}`);
    console.log("   💡 قد تحتاج إلى تشغيل migrations أو إنشاء الجداول");
  }
  
  // 3. فحص البيانات في الجداول الموجودة
  console.log("\n3️⃣  فحص البيانات:");
  
  const tablesToCheck = customTables.filter(t => 
    !t.includes("_log") && !t.includes("_history")
  );
  
  for (const table of tablesToCheck.slice(0, 10)) {
    try {
      const count = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
      const rowCount = (count as any)[0][0].count;
      console.log(`   📊 ${table}: ${rowCount} سجل`);
    } catch (e: any) {
      console.log(`   ⚠️  ${table}: خطأ - ${e.message}`);
    }
  }
  
  // 4. فحص Foreign Keys للجداول المهمة
  if (tablesList.includes("custom_treasury_currencies")) {
    console.log("\n4️⃣  فحص Foreign Keys:");
    try {
      const fks = await db.execute(sql.raw(`
        SELECT 
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'custom_treasury_currencies'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `));
      
      const fkList = (fks as any)[0];
      if (fkList.length > 0) {
        console.log(`   ✅ عدد Foreign Keys: ${fkList.length}`);
        fkList.forEach((fk: any) => {
          console.log(`      - ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      } else {
        console.log("   ⚠️  لا توجد Foreign Keys محددة");
      }
    } catch (e: any) {
      console.log(`   ⚠️  خطأ في فحص Foreign Keys: ${e.message}`);
    }
  }
  
  console.log("\n" + "=".repeat(60));
}

checkCustomSystem().catch(console.error);

