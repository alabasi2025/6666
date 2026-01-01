import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/666666";
  console.log("Connecting to", dbUrl.replace(/:([^:@]+)@/, ":****@"));

  const conn = await mysql.createConnection(dbUrl);
  await conn.execute("ALTER TABLE custom_accounts MODIFY account_type VARCHAR(50) NOT NULL");
  console.log("✅ تم تعديل عمود account_type ليقبل القيم المخصصة (VARCHAR(50))");
  await conn.end();
}

main().catch((err) => {
  console.error("❌ خطأ أثناء التعديل:", err.message);
  process.exit(1);
});

