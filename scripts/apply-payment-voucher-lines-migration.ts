import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL غير موجود. تأكد من وجوده في ملف .env");
    process.exit(1);
  }

  let url: URL;
  try {
    url = new URL(dbUrl);
  } catch {
    console.error("❌ DATABASE_URL غير صحيح (لا يمكن تحليله)");
    process.exit(1);
  }

  const host = url.hostname;
  const port = url.port ? parseInt(url.port, 10) : 3306;
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);

  const dbFromUrl = url.pathname.replace("/", "");
  const argDb = process.argv[2];
  const targetDb = (argDb && !argDb.startsWith("-") ? argDb : dbFromUrl) || "6666";

  if (!/^[a-zA-Z0-9_]+$/.test(targetDb)) {
    console.error("❌ اسم قاعدة البيانات غير صالح:", targetDb);
    process.exit(1);
  }

  console.log("=".repeat(70));
  console.log("🔧 تطبيق Migration: custom_payment_voucher_lines");
  console.log("=".repeat(70));
  console.log(`Host: ${host}:${port}`);
  console.log(`User: ${user}`);
  console.log(`Target DB: ${targetDb}`);

  // 1) Ensure DB exists
  const adminConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: false,
  });

  await adminConn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await adminConn.end();

  // 2) Connect to target DB
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database: targetDb,
    multipleStatements: false,
  });

  // 3) Apply migrations (idempotent)
  const migrationFiles = [
    "0020_payment_voucher_lines.sql",
    "0021_payment_voucher_lines_add_analytic_account.sql",
    "0022_payment_voucher_lines_add_analytic_treasury.sql",
    "0023_payment_voucher_add_edit_count.sql",
  ];

  for (const file of migrationFiles) {
    const migrationPath = path.join(process.cwd(), "drizzle", "migrations", file);
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ ملف المايجريشن غير موجود: ${migrationPath}`);
      await conn.end();
      process.exit(1);
    }

    const sqlText = fs.readFileSync(migrationPath, "utf8");

    const cleanedSql = sqlText
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    const statements = cleanedSql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`\n📄 [${file}] تنفيذ ${statements.length} أمر SQL...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;
      try {
        await conn.execute(stmt);
        console.log(`✓ (${i + 1}/${statements.length}) OK`);
      } catch (err: any) {
        const code = err?.code as string | undefined;
        // Skip if already applied
        if (code === "ER_DUP_FIELDNAME" || code === "ER_DUP_KEYNAME") {
          console.log(`⚠ (${i + 1}/${statements.length}) تخطي (موجود بالفعل)`);
          continue;
        }
        console.error(`❌ (${i + 1}/${statements.length}) فشل: ${err?.message || err}`);
        await conn.end();
        process.exit(1);
      }
    }
  }

  // 4) Verify table + analytic column
  const [rows] = await conn.execute(
    "SHOW TABLES LIKE 'custom_payment_voucher_lines'"
  );

  const found =
    Array.isArray(rows) && rows.length > 0
      ? Object.values(rows[0] as any)[0]
      : null;

  if (!found) {
    console.error("❌ لم يتم العثور على الجدول بعد التنفيذ!");
    await conn.end();
    process.exit(1);
  }

  const [colRows] = await conn.execute(
    "SHOW COLUMNS FROM custom_payment_voucher_lines LIKE 'analytic_account_id'"
  );
  const analyticColumnExists = Array.isArray(colRows) && colRows.length > 0;

  if (!analyticColumnExists) {
    console.error("❌ تم إنشاء الجدول لكن عمود analytic_account_id غير موجود!");
    await conn.end();
    process.exit(1);
  }

  const [treasColRows] = await conn.execute(
    "SHOW COLUMNS FROM custom_payment_voucher_lines LIKE 'analytic_treasury_id'"
  );
  const analyticTreasuryColumnExists = Array.isArray(treasColRows) && treasColRows.length > 0;

  if (!analyticTreasuryColumnExists) {
    console.error("❌ تم إنشاء الجدول لكن عمود analytic_treasury_id غير موجود!");
    await conn.end();
    process.exit(1);
  }

  console.log(
    `\n✅ تم تجهيز الجدول بنجاح: ${found} (analytic_account_id + analytic_treasury_id موجودين)`
  );
  await conn.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ خطأ غير متوقع:", e);
  process.exit(1);
});


