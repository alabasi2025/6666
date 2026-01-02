import "dotenv/config";
import { getDb } from "./server/db";
import { sql } from "drizzle-orm";
import fs from "fs";

(async () => {
  console.log("🚀 إنشاء جداول الخزائن...");
  
  const db = await getDb();
  if (!db) {
    console.log("❌ قاعدة البيانات غير متصلة");
    process.exit(1);
  }

  console.log("✅ متصل بقاعدة البيانات");
  
  // قراءة ملف SQL
  const sqlContent = fs.readFileSync("create-treasuries-table.sql", "utf8");
  
  // تقسيم وتنفيذ كل جملة SQL
  const statements = sqlContent
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));
  
  for (const statement of statements) {
    try {
      await db.execute(sql.raw(statement));
      console.log("✅ نُفّذ:", statement.substring(0, 50) + "...");
    } catch (e: any) {
      if (e.message?.includes("already exists") || e.message?.includes("Duplicate")) {
        console.log("⚠️  الجدول موجود بالفعل:", statement.substring(0, 50) + "...");
      } else {
        console.error("❌ خطأ:", e.message);
      }
    }
  }
  
  console.log("\n✅ تم إنشاء الجداول بنجاح!");
  
  // التحقق
  const check = await db.execute(sql.raw("SHOW TABLES LIKE 'custom_treasuries'"));
  console.log("📋 جدول custom_treasuries:", (check as any)[0].length > 0 ? "✅ موجود" : "❌ غير موجود");
})();

