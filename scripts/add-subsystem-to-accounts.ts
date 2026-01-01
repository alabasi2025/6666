import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/666666";
  console.log("Connecting to", dbUrl.replace(/:([^:@]+)@/, ":****@"));
  const conn = await mysql.createConnection(dbUrl);

  // إضافة العمود إذا لم يكن موجوداً
  const [cols] = await conn.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'custom_accounts' AND COLUMN_NAME = 'sub_system_id'`
  );
  if ((cols as any[]).length === 0) {
    console.log("Adding sub_system_id column...");
    await conn.execute(`ALTER TABLE custom_accounts ADD COLUMN sub_system_id INT NULL`);
  } else {
    console.log("sub_system_id already exists");
  }

  // إضافة فهرس إذا لم يكن موجوداً
  const [idx] = await conn.execute(
    `SELECT INDEX_NAME FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'custom_accounts' AND INDEX_NAME = 'ca_sub_system_idx'`
  );
  if ((idx as any[]).length === 0) {
    console.log("Adding index ca_sub_system_idx...");
    await conn.execute(`CREATE INDEX ca_sub_system_idx ON custom_accounts(sub_system_id)`);
  } else {
    console.log("Index ca_sub_system_idx already exists");
  }

  await conn.end();
  console.log("✅ Done");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

