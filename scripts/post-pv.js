import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection("mysql://root:@localhost:3306/666666?charset=utf8mb4");
  const vid = 3; // voucher id
  const [v] = await conn.query(
    "SELECT id,voucher_number,voucher_date,business_id,sub_system_id,amount,currency_id,currency,treasury_id,description FROM custom_payment_vouchers WHERE id=?",
    [vid]
  );
  if (!v.length) throw new Error("voucher not found");
  const voucher = v[0];
  const [lines] = await conn.query(
    "SELECT account_id,amount,description FROM custom_payment_voucher_lines WHERE payment_voucher_id=?",
    [vid]
  );
  if (!lines.length) throw new Error("no lines");
  const [trea] = await conn.query(
    "SELECT account_id FROM custom_treasuries WHERE id=?",
    [voucher.treasury_id]
  );
  const treasuryAcc = trea[0]?.account_id;
  const currencyId = voucher.currency_id || 1;

  await conn.beginTransaction();
  const entryNumber = `PV-JE-${voucher.voucher_number || voucher.id}`;
  const [entryRes] = await conn.query(
    "INSERT INTO custom_journal_entries (business_id, sub_system_id, entry_number, entry_date, entry_type, description, reference_type, reference_id, reference_number, status, posted_at) VALUES (?,?,?,?,?,?,?,?,?, 'posted', NOW())",
    [
      voucher.business_id,
      voucher.sub_system_id,
      entryNumber,
      voucher.voucher_date,
      "system_generated",
      voucher.description || "Ø³Ù†Ø¯ ØµØ±Ù",
      "payment_voucher",
      voucher.id,
      voucher.voucher_number,
    ]
  );
  const jeId = entryRes.insertId;
  let order = 1;
  for (const l of lines) {
    const amt = parseFloat(l.amount || "0");
    await conn.query(
      "INSERT INTO custom_journal_entry_lines (business_id,journal_entry_id,account_id,debit_amount,credit_amount,currency_id,exchange_rate,debit_amount_base,credit_amount_base,description,line_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [voucher.business_id, jeId, l.account_id, amt, 0, currencyId, 1, amt, 0, l.description, order++]
    );
  }
  if (treasuryAcc) {
    const amt = parseFloat(voucher.amount || "0");
    await conn.query(
      "INSERT INTO custom_journal_entry_lines (business_id,journal_entry_id,account_id,debit_amount,credit_amount,currency_id,exchange_rate,debit_amount_base,credit_amount_base,description,line_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [voucher.business_id, jeId, treasuryAcc, 0, amt, currencyId, 1, 0, amt, voucher.description || `ØµØ±Ù Ù…Ù† Ø®Ø²ÙŠÙ†Ø© ${voucher.treasury_id}`, order++]
    );
  }
  await conn.query("UPDATE custom_payment_vouchers SET journal_entry_id=? WHERE id=?", [jeId, vid]);
  await conn.commit();

  const [rows] = await conn.query("SELECT journal_entry_id FROM custom_payment_vouchers WHERE id=?", [vid]);
  const [jel] = await conn.query(
    "SELECT account_id,debit_amount,credit_amount FROM custom_journal_entry_lines WHERE journal_entry_id=?",
    [jeId]
  );
  console.log({ journalEntryId: rows[0].journal_entry_id, lines: jel });
  await conn.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
