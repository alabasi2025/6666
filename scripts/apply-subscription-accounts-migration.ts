import "dotenv/config";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
  console.log("=".repeat(70));
  console.log("🔄 تطبيق Migration لحسابات المشترك");
  console.log("=".repeat(70));

  const pool = new Pool({
    host: "localhost",
    port: 5433,
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("\n1️⃣  قراءة ملف Migration...");
    const migrationPath = path.join(__dirname, "../drizzle/migrations/0032_subscription_accounts.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
    console.log("   ✅ تم قراءة ملف Migration");

    console.log("\n2️⃣  تطبيق Migration...");
    
    // تقسيم SQL إلى أقسام رئيسية
    const sections = migrationSQL.split(/-- =+.*?=+.*?--/).filter(s => s.trim().length > 0);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // القسم 1: إنشاء جدول subscription_accounts
    console.log("\n   📋 إنشاء جدول subscription_accounts...");
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS subscription_accounts (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL,
          customer_id INTEGER NOT NULL REFERENCES customers_enhanced(id) ON DELETE RESTRICT,
          account_number VARCHAR(50) UNIQUE NOT NULL,
          account_type VARCHAR(50) NOT NULL,
          account_name VARCHAR(255),
          tariff_id INTEGER,
          service_type VARCHAR(50) DEFAULT 'electricity',
          accounting_account_id INTEGER,
          balance DECIMAL(18,2) DEFAULT 0,
          balance_due DECIMAL(18,2) DEFAULT 0,
          credit_limit DECIMAL(18,2) DEFAULT 0,
          deposit_amount DECIMAL(18,2) DEFAULT 0,
          payment_mode VARCHAR(50) DEFAULT 'prepaid',
          billing_cycle VARCHAR(50) DEFAULT 'monthly',
          status VARCHAR(50) DEFAULT 'active',
          support_type VARCHAR(50),
          support_percentage DECIMAL(5,2),
          max_support_amount DECIMAL(18,2),
          monthly_quota DECIMAL(15,3),
          sts_meter_id INTEGER,
          iot_device_id VARCHAR(100),
          activation_date DATE,
          expiration_date DATE,
          notes TEXT,
          created_by INTEGER,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log("      ✅ تم إنشاء الجدول");
      successCount++;
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("      ⚠️  الجدول موجود بالفعل");
        skippedCount++;
      } else {
        console.error(`      ❌ خطأ: ${error.message.substring(0, 60)}`);
        errorCount++;
      }
    }

    // إنشاء الفهارس
    console.log("\n   📋 إنشاء الفهارس...");
    const indexes = [
      { name: "subscription_accounts_customer_id_idx", sql: "CREATE INDEX IF NOT EXISTS subscription_accounts_customer_id_idx ON subscription_accounts(customer_id)" },
      { name: "subscription_accounts_account_type_idx", sql: "CREATE INDEX IF NOT EXISTS subscription_accounts_account_type_idx ON subscription_accounts(account_type)" },
      { name: "subscription_accounts_account_number_idx", sql: "CREATE INDEX IF NOT EXISTS subscription_accounts_account_number_idx ON subscription_accounts(account_number)" },
      { name: "subscription_accounts_status_idx", sql: "CREATE INDEX IF NOT EXISTS subscription_accounts_status_idx ON subscription_accounts(status)" },
      { name: "subscription_accounts_business_id_idx", sql: "CREATE INDEX IF NOT EXISTS subscription_accounts_business_id_idx ON subscription_accounts(business_id)" },
    ];

    for (const idx of indexes) {
      try {
        await pool.query(idx.sql);
        console.log(`      ✅ ${idx.name}`);
        successCount++;
      } catch (error: any) {
        if (error.message.includes("already exists")) {
          skippedCount++;
        } else {
          console.error(`      ❌ ${idx.name}: ${error.message.substring(0, 40)}`);
          errorCount++;
        }
      }
    }

    // القسم 2: إضافة subscription_account_id للعدادات
    console.log("\n   📋 إضافة subscription_account_id للعدادات...");
    try {
      // التحقق من وجود العمود أولاً
      const columnExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'meters_enhanced' 
          AND column_name = 'subscription_account_id'
        )
      `);
      
      if (!columnExists.rows[0].exists) {
        await pool.query(`
          ALTER TABLE meters_enhanced 
          ADD COLUMN subscription_account_id INTEGER REFERENCES subscription_accounts(id) ON DELETE SET NULL
        `);
        console.log("      ✅ تم إضافة العمود");
        successCount++;
      } else {
        console.log("      ⚠️  العمود موجود بالفعل");
        skippedCount++;
      }
    } catch (error: any) {
      console.error(`      ❌ خطأ: ${error.message.substring(0, 60)}`);
      errorCount++;
    }

    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS meters_subscription_account_id_idx ON meters_enhanced(subscription_account_id)`);
      console.log("      ✅ تم إنشاء الفهرس");
      successCount++;
    } catch (error: any) {
      skippedCount++;
    }

    // القسم 3: إضافة subscription_account_id للفواتير
    console.log("\n   📋 إضافة subscription_account_id للفواتير...");
    try {
      const columnExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'invoices_enhanced' 
          AND column_name = 'subscription_account_id'
        )
      `);
      
      if (!columnExists.rows[0].exists) {
        await pool.query(`
          ALTER TABLE invoices_enhanced 
          ADD COLUMN subscription_account_id INTEGER REFERENCES subscription_accounts(id) ON DELETE SET NULL
        `);
        console.log("      ✅ تم إضافة العمود");
        successCount++;
      } else {
        console.log("      ⚠️  العمود موجود بالفعل");
        skippedCount++;
      }
    } catch (error: any) {
      console.error(`      ❌ خطأ: ${error.message.substring(0, 60)}`);
      errorCount++;
    }

    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS invoices_subscription_account_id_idx ON invoices_enhanced(subscription_account_id)`);
      console.log("      ✅ تم إنشاء الفهرس");
      successCount++;
    } catch (error: any) {
      skippedCount++;
    }

    // القسم 4: إضافة subscription_account_id للمدفوعات
    console.log("\n   📋 إضافة subscription_account_id للمدفوعات...");
    try {
      const columnExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'payments_enhanced' 
          AND column_name = 'subscription_account_id'
        )
      `);
      
      if (!columnExists.rows[0].exists) {
        await pool.query(`
          ALTER TABLE payments_enhanced 
          ADD COLUMN subscription_account_id INTEGER REFERENCES subscription_accounts(id) ON DELETE SET NULL
        `);
        console.log("      ✅ تم إضافة العمود");
        successCount++;
      } else {
        console.log("      ⚠️  العمود موجود بالفعل");
        skippedCount++;
      }
    } catch (error: any) {
      console.error(`      ❌ خطأ: ${error.message.substring(0, 60)}`);
      errorCount++;
    }

    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS payments_subscription_account_id_idx ON payments_enhanced(subscription_account_id)`);
      console.log("      ✅ تم إنشاء الفهرس");
      successCount++;
    } catch (error: any) {
      skippedCount++;
    }

    console.log(`\n   ✅ تم تطبيق ${successCount} عملية بنجاح`);
    if (skippedCount > 0) {
      console.log(`   ⚠️  تم تخطي ${skippedCount} عملية (موجودة بالفعل)`);
    }
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} عملية فشلت`);
    }

    console.log("\n3️⃣  التحقق من الجدول...");
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription_accounts'
      )
    `);

    if (tableCheck.rows[0].exists) {
      console.log("   ✅ جدول subscription_accounts موجود");
      
      // التحقق من الأعمدة
      const columnsCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'subscription_accounts'
        ORDER BY ordinal_position
      `);
      
      console.log(`   ✅ عدد الأعمدة: ${columnsCheck.rows.length}`);
    } else {
      throw new Error("❌ جدول subscription_accounts غير موجود بعد Migration");
    }

    console.log("\n4️⃣  Migration البيانات الموجودة...");
    
    // إنشاء حسابات مشترك افتراضية للعملاء الموجودين
    console.log("\n   📋 إنشاء حسابات مشترك افتراضية للعملاء...");
    try {
      const result = await pool.query(`
        INSERT INTO subscription_accounts (
          business_id,
          customer_id,
          account_number,
          account_type,
          account_name,
          service_type,
          status,
          activation_date,
          created_at,
          updated_at
        )
        SELECT 
          business_id,
          id,
          'SUB-' || id || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER,
          'regular',
          'حساب المشترك الرئيسي',
          'electricity',
          CASE 
            WHEN status = 'active' THEN 'active'
            WHEN status = 'suspended' THEN 'suspended'
            ELSE 'pending'
          END,
          COALESCE((SELECT MIN(created_at)::DATE FROM meters_enhanced WHERE customer_id = customers_enhanced.id LIMIT 1), CURRENT_DATE),
          NOW(),
          NOW()
        FROM customers_enhanced
        WHERE is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM subscription_accounts WHERE subscription_accounts.customer_id = customers_enhanced.id
        )
      `);
      console.log(`      ✅ تم إنشاء ${result.rowCount || 0} حساب مشترك`);
      successCount++;
    } catch (error: any) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        console.log("      ⚠️  حسابات المشترك موجودة بالفعل");
        skippedCount++;
      } else {
        console.error(`      ❌ خطأ: ${error.message.substring(0, 60)}`);
        errorCount++;
      }
    }

    // ربط العدادات الموجودة بحسابات المشترك
    console.log("\n   📋 ربط العدادات بحسابات المشترك...");
    try {
      const result = await pool.query(`
        UPDATE meters_enhanced m
        SET subscription_account_id = (
          SELECT id 
          FROM subscription_accounts 
          WHERE customer_id = m.customer_id 
          AND account_type = 'regular'
          ORDER BY id
          LIMIT 1
        )
        WHERE customer_id IS NOT NULL 
        AND subscription_account_id IS NULL
        AND EXISTS (
          SELECT 1 FROM subscription_accounts WHERE customer_id = m.customer_id
        )
      `);
      console.log(`      ✅ تم ربط ${result.rowCount || 0} عداد`);
      successCount++;
    } catch (error: any) {
      console.error(`      ❌ خطأ: ${error.message.substring(0, 60)}`);
      errorCount++;
    }

    // ربط الفواتير الموجودة بحسابات المشترك
    console.log("\n   📋 ربط الفواتير بحسابات المشترك...");
    try {
      const result = await pool.query(`
        UPDATE invoices_enhanced i
        SET subscription_account_id = (
          SELECT subscription_account_id
          FROM meters_enhanced
          WHERE id = i.meter_id
          AND subscription_account_id IS NOT NULL
          LIMIT 1
        )
        WHERE meter_id IS NOT NULL 
        AND subscription_account_id IS NULL
        AND EXISTS (
          SELECT 1 FROM meters_enhanced WHERE id = i.meter_id AND subscription_account_id IS NOT NULL
        )
      `);
      console.log(`      ✅ تم ربط ${result.rowCount || 0} فاتورة`);
      successCount++;
    } catch (error: any) {
      console.error(`      ❌ خطأ: ${error.message.substring(0, 60)}`);
      errorCount++;
    }

    // ربط المدفوعات الموجودة بحسابات المشترك
    console.log("\n   📋 ربط المدفوعات بحسابات المشترك...");
    try {
      const result = await pool.query(`
        UPDATE payments_enhanced p
        SET subscription_account_id = COALESCE(
          (SELECT subscription_account_id FROM invoices_enhanced WHERE id = p.invoice_id AND subscription_account_id IS NOT NULL LIMIT 1),
          (SELECT subscription_account_id FROM meters_enhanced WHERE id = p.meter_id AND subscription_account_id IS NOT NULL LIMIT 1),
          (SELECT id FROM subscription_accounts WHERE customer_id = p.customer_id AND account_type = 'regular' ORDER BY id LIMIT 1)
        )
        WHERE customer_id IS NOT NULL 
        AND subscription_account_id IS NULL
      `);
      console.log(`      ✅ تم ربط ${result.rowCount || 0} دفعة`);
      successCount++;
    } catch (error: any) {
      console.error(`      ❌ خطأ: ${error.message.substring(0, 60)}`);
      errorCount++;
    }

    console.log("\n5️⃣  التحقق من البيانات المنقولة...");
    const accountsCount = await pool.query(`SELECT COUNT(*) as cnt FROM subscription_accounts`);
    const accountsCountNum = parseInt(accountsCount.rows[0].cnt || "0");
    console.log(`   ✅ عدد حسابات المشترك: ${accountsCountNum}`);

    const metersLinked = await pool.query(`
      SELECT COUNT(*) as cnt 
      FROM meters_enhanced 
      WHERE subscription_account_id IS NOT NULL
    `);
    const metersLinkedNum = parseInt(metersLinked.rows[0].cnt || "0");
    console.log(`   ✅ عدد العدادات المرتبطة: ${metersLinkedNum}`);

    const invoicesLinked = await pool.query(`
      SELECT COUNT(*) as cnt 
      FROM invoices_enhanced 
      WHERE subscription_account_id IS NOT NULL
    `);
    const invoicesLinkedNum = parseInt(invoicesLinked.rows[0].cnt || "0");
    console.log(`   ✅ عدد الفواتير المرتبطة: ${invoicesLinkedNum}`);

    const paymentsLinked = await pool.query(`
      SELECT COUNT(*) as cnt 
      FROM payments_enhanced 
      WHERE subscription_account_id IS NOT NULL
    `);
    const paymentsLinkedNum = parseInt(paymentsLinked.rows[0].cnt || "0");
    console.log(`   ✅ عدد المدفوعات المرتبطة: ${paymentsLinkedNum}`);

    await pool.end();

    console.log("\n" + "=".repeat(70));
    console.log("✅ تم تطبيق Migration بنجاح!");
    console.log("=".repeat(70));
    console.log("\n📊 ملخص:");
    console.log(`   ✅ حسابات المشترك: ${accountsCountNum}`);
    console.log(`   ✅ عدادات مرتبطة: ${metersLinkedNum}`);
    console.log(`   ✅ فواتير مرتبطة: ${invoicesLinkedNum}`);
    console.log(`   ✅ مدفوعات مرتبطة: ${paymentsLinkedNum}`);

    console.log("\n💡 الخطوات التالية:");
    console.log("   1. تحديث APIs لاستخدام subscription_account_id");
    console.log("   2. تحديث الواجهات لعرض حسابات المشترك");
    console.log("   3. اختبار النظام");

  } catch (error: any) {
    console.error("\n❌ خطأ أثناء تطبيق Migration:", error.message);
    await pool.end();
    process.exit(1);
  }
}

applyMigration();
