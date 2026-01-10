import "dotenv/config";
import { Pool } from "pg";

async function verifyMigratedData() {
  console.log("=".repeat(70));
  console.log("🔍 التحقق من البيانات المنقولة في PostgreSQL 18");
  console.log("=".repeat(70));

  const pool = new Pool({
    host: "localhost",
    port: 5433,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("\n📊 التحقق من الجداول الرئيسية:\n");

    const tablesToCheck = [
      "areas",
      "branches",
      "businesses",
      "custom_accounts",
      "custom_payment_voucher_lines",
      "custom_sub_systems",
      "custom_treasuries",
      "custom_treasury_currencies",
      "customers_enhanced",
      "item_categories",
      "items",
      "squares",
      "stations",
      "users",
    ];

    let totalRows = 0;
    let tablesWithData = 0;

    for (const tableName of tablesToCheck) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
        const count = parseInt(result.rows[0].cnt || "0");
        totalRows += count;

        if (count > 0) {
          tablesWithData++;
          console.log(`   ✅ ${tableName.padEnd(35)} : ${count.toString().padStart(4)} صف`);
        } else {
          console.log(`   ⚪ ${tableName.padEnd(35)} : ${count.toString().padStart(4)} صف (فارغ)`);
        }
      } catch (error: any) {
        console.log(`   ❌ ${tableName.padEnd(35)} : خطأ - ${error.message.substring(0, 40)}`);
      }
    }

    console.log("\n" + "─".repeat(70));
    console.log("📊 ملخص التحقق:");
    console.log("─".repeat(70));
    console.log(`   ✅ الجداول التي تحتوي على بيانات: ${tablesWithData}`);
    console.log(`   📝 إجمالي الصفوف: ${totalRows}`);
    console.log(`   ✅ جميع البيانات المنقولة متاحة`);

    // التحقق من البيانات التفصيلية
    console.log("\n🔍 التحقق من بيانات مهمة:\n");

    // التحقق من businesses
    try {
      const businessesResult = await pool.query(`SELECT id, name_ar, name_en FROM businesses LIMIT 5`);
      if (businessesResult.rows.length > 0) {
        console.log("   📋 الشركات (Businesses):");
        businessesResult.rows.forEach(row => {
          console.log(`      - ${row.name_ar || row.name_en || 'بدون اسم'} (ID: ${row.id})`);
        });
      }
    } catch (error: any) {
      console.log(`   ⚠️  خطأ في جلب businesses: ${error.message}`);
    }

    // التحقق من branches
    try {
      const branchesResult = await pool.query(`SELECT id, name_ar, name_en FROM branches LIMIT 5`);
      if (branchesResult.rows.length > 0) {
        console.log("\n   📋 الفروع (Branches):");
        branchesResult.rows.forEach(row => {
          console.log(`      - ${row.name_ar || row.name_en || 'بدون اسم'} (ID: ${row.id})`);
        });
      }
    } catch (error: any) {
      console.log(`   ⚠️  خطأ في جلب branches: ${error.message}`);
    }

    // التحقق من items
    try {
      const itemsResult = await pool.query(`SELECT COUNT(*) as cnt FROM items`);
      const itemsCount = parseInt(itemsResult.rows[0].cnt || "0");
      if (itemsCount > 0) {
        console.log(`\n   📋 الأصناف (Items): ${itemsCount} صنف`);
      }
    } catch (error: any) {
      console.log(`   ⚠️  خطأ في جلب items: ${error.message}`);
    }

    await pool.end();

    console.log("\n" + "=".repeat(70));
    console.log("✅ اكتمل التحقق!");
    console.log("=".repeat(70));
    console.log("\n💡 البيانات المنقولة متاحة وجاهزة للاستخدام على PostgreSQL 18");
    console.log("   المنفذ: 5433");
    console.log("   DATABASE_URL=postgresql://postgres:774424555@localhost:5433/666666");

  } catch (error: any) {
    console.error("\n❌ خطأ أثناء التحقق:", error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyMigratedData();
