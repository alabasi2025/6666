import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function verifyData() {
  const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("🔍 التحقق من البيانات المنقولة...\n");

    const tablesToCheck = [
      "businesses",
      "branches",
      "users",
      "custom_sub_systems",
      "custom_payment_voucher_lines",
      "custom_treasury_currencies",
    ];

    for (const table of tablesToCheck) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM "${table}";`);
      const count = parseInt(result.rows[0].count);
      
      if (count > 0) {
        console.log(`✅ ${table}: ${count} صف`);
        
        // عرض عينة من البيانات
        const sample = await pool.query(`SELECT * FROM "${table}" LIMIT 3;`);
        if (sample.rows.length > 0) {
          const columns = Object.keys(sample.rows[0]);
          console.log(`   الأعمدة: ${columns.slice(0, 5).join(", ")}${columns.length > 5 ? "..." : ""}`);
        }
      } else {
        console.log(`⚠️  ${table}: فارغ`);
      }
    }

    await pool.end();
    console.log("\n🎉 تم التحقق بنجاح!");
  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
    process.exit(1);
  }
}

verifyData();

