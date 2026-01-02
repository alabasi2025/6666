import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/666666";
  console.log("Connecting to", dbUrl.replace(/:([^:@]+)@/, ":****@"));
  const conn = await mysql.createConnection(dbUrl);

  // 1) accounts: account_sub_type_id
  const [accCols] = await conn.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'custom_accounts' AND COLUMN_NAME = 'account_sub_type_id'`
  );
  if ((accCols as any[]).length === 0) {
    console.log("Adding column custom_accounts.account_sub_type_id...");
    await conn.execute(`ALTER TABLE custom_accounts ADD COLUMN account_sub_type_id INT NULL AFTER account_type_id`);
    await conn.execute(`CREATE INDEX ca_sub_type_idx ON custom_accounts(account_sub_type_id)`);
  } else {
    console.log("custom_accounts.account_sub_type_id already exists");
  }

  // 2) treasuries: account_id
  const [treCols] = await conn.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'custom_treasuries' AND COLUMN_NAME = 'account_id'`
  );
  if ((treCols as any[]).length === 0) {
    console.log("Adding column custom_treasuries.account_id...");
    await conn.execute(`ALTER TABLE custom_treasuries ADD COLUMN account_id INT NULL AFTER treasury_type`);
    await conn.execute(`CREATE INDEX ct_account_idx ON custom_treasuries(account_id)`);
  } else {
    console.log("custom_treasuries.account_id already exists");
  }

  await conn.end();
  console.log("✅ Done");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

