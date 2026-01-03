import "dotenv/config";
import { getDb } from "./server/db";
import { sql } from "drizzle-orm";

(async () => {
  const db = await getDb();
  if (!db) {
    console.log("❌ قاعدة البيانات غير متصلة");
    process.exit(1);
  }

  console.log("✅ الاتصال بقاعدة البيانات ناجح");
  
  // فحص وجود الجدول
  const tables = await db.execute(sql.raw("SHOW TABLES LIKE 'custom_treasuries'"));
  console.log("\n📋 جدول custom_treasuries:", (tables as any)[0]);
  
  if (!Array.isArray((tables as any)[0]) || (tables as any)[0].length === 0) {
    console.log("⚠️  الجدول غير موجود");
    process.exit(0);
  }
  
  // عرض بنية الجدول
  const desc = await db.execute(sql.raw("DESCRIBE custom_treasuries"));
  console.log("\n📊 بنية جدول custom_treasuries:");
  console.table((desc as any)[0]);
  
  // عرض عدد السجلات
  const count = await db.execute(sql.raw("SELECT COUNT(*) as count FROM custom_treasuries"));
  console.log("\n📈 عدد الخزائن:", (count as any)[0][0].count);
})().catch((e) => {
  console.error("❌ خطأ:", e.message);
});




