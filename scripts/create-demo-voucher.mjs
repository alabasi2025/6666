import mysql from "mysql2/promise";

async function main() {
  const url = "mysql://root:@localhost:3306/666666?charset=utf8mb4";
  const conn = await mysql.createConnection(url);

  try {
    await conn.beginTransaction();

    const voucherNumber = `PV-DEMO-${Date.now()}`;
    const insertVoucherSql =
      "INSERT INTO custom_payment_vouchers (business_id, sub_system_id, voucher_number, voucher_date, amount, currency, currency_id, treasury_id, destination_type, destination_name, status, created_at, updated_at) VALUES (1, 1, ?, CURDATE(), ?, 'SAR', 1, 2, 'person', 'Test Person', 'confirmed', NOW(), NOW())";

    const [res] = await conn.query(insertVoucherSql, [voucherNumber, 150.0]);
    const voucherId = res.insertId;

    const insertLineSql =
      "INSERT INTO custom_payment_voucher_lines (business_id, payment_voucher_id, line_order, account_id, description, amount, created_at) VALUES (1, ?, ?, ?, ?, ?, NOW())";

    const lines = [
      { order: 1, accountId: 1, amount: 100.0, desc: "مصروف نقدي" },
      { order: 2, accountId: 2, amount: 50.0, desc: "مصروف إضافي" },
    ];

    for (const l of lines) {
      await conn.query(insertLineSql, [
        voucherId,
        l.order,
        l.accountId,
        l.desc,
        l.amount,
      ]);
    }

    await conn.commit();

    const [rows] = await conn.query(
      "SELECT id, voucher_number, status, amount, voucher_date FROM custom_payment_vouchers WHERE id = ?",
      [voucherId],
    );
    const [lineRows] = await conn.query(
      "SELECT payment_voucher_id, line_order, account_id, amount, description FROM custom_payment_voucher_lines WHERE payment_voucher_id = ?",
      [voucherId],
    );

    console.log("Voucher created", { voucherId, voucherNumber });
    console.log("Header:", rows);
    console.log("Lines:", lineRows);
  } catch (error) {
    await conn.rollback();
    console.error("Failed:", error);
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error("Fatal:", error);
});
import mysql from "mysql2/promise";

async function main() {
  const url = "mysql://root:@localhost:3306/666666?charset=utf8mb4";
  const conn = await mysql.createConnection(url);

  try {
    await conn.beginTransaction();

    const voucherNumber = `PV-DEMO-${Date.now()}`;
    const insertVoucherSql =
      "INSERT INTO custom_payment_vouchers (business_id, sub_system_id, voucher_number, voucher_date, amount, currency, currency_id, treasury_id, destination_type, destination_name, status, created_at, updated_at) VALUES (1, 1, ?, CURDATE(), ?, 'SAR', 1, 2, 'person', 'Test Person', 'confirmed', NOW(), NOW())";

    const [res] = await conn.query(insertVoucherSql, [voucherNumber, 150.0]);
    const voucherId = res.insertId;

    const insertLineSql =
      "INSERT INTO custom_payment_voucher_lines (business_id, payment_voucher_id, line_order, account_id, description, amount, created_at) VALUES (1, ?, ?, ?, ?, ?, NOW())";

    const lines = [
      { order: 1, accountId: 1, amount: 100.0, desc: "مصروف نقدي" },
      { order: 2, accountId: 2, amount: 50.0, desc: "مصروف إضافي" },
    ];

    for (const l of lines) {
      await conn.query(insertLineSql, [
        voucherId,
        l.order,
        l.accountId,
        l.desc,
        l.amount,
      ]);
    }

    await conn.commit();

    const [rows] = await conn.query(
      "SELECT id, voucher_number, status, amount, voucher_date FROM custom_payment_vouchers WHERE id = ?",
      [voucherId],
    );
    const [lineRows] = await conn.query(
      "SELECT payment_voucher_id, line_order, account_id, amount, description FROM custom_payment_voucher_lines WHERE payment_voucher_id = ?",
      [voucherId],
    );

    console.log("Voucher created", { voucherId, voucherNumber });
    console.log("Header:", rows);
    console.log("Lines:", lineRows);
  } catch (error) {
    await conn.rollback();
    console.error("Failed:", error);
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error("Fatal:", error);
});

