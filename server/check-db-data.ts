/**
 * التحقق من البيانات الموجودة في قاعدة البيانات
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";

async function checkDatabaseData() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    console.log("\n===========================================");
    console.log("فحص البيانات الموجودة في قاعدة البيانات");
    console.log("===========================================\n");

    // التحقق من الجداول
    const tables = [
      "item_categories",
      "items",
      "tariffs",
      "fee_types",
      "payment_methods_new",
      "defective_components",
      "areas",
      "squares",
      "cabinets",
      "acrel_meters",
      "sts_meters",
    ];

    for (const table of tables) {
      try {
        const result = await db.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(table)} WHERE business_id = 1`
        );
        const count = (result.rows as any[])[0]?.count || 0;
        console.log(`✅ ${table}: ${count} سجل`);
      } catch (error: any) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }

    console.log("\n===========================================\n");

  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
  }
}

checkDatabaseData();


