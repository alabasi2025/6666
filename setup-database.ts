import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import mysql from "mysql2/promise";

async function setupDatabase() {
  console.log("=".repeat(60));
  console.log("🔧 إعداد قاعدة البيانات");
  console.log("=".repeat(60));

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("\n❌ DATABASE_URL غير محدد في ملف .env");
    console.log("\n💡 أضف السطر التالي إلى ملف .env:");
    console.log("DATABASE_URL=mysql://root:password@localhost:3306/666666");
    return;
  }

  // تحليل URL
  let url: URL;
  try {
    url = new URL(dbUrl);
  } catch (e) {
    console.log("❌ DATABASE_URL غير صحيح");
    return;
  }

  const host = url.hostname;
  const port = parseInt(url.port || "3306");
  const user = url.username;
  const password = url.password;
  const database = url.pathname.replace("/", "");

  console.log(`\n📌 معلومات الاتصال:`);
  console.log(`   - المضيف: ${host}`);
  console.log(`   - المنفذ: ${port}`);
  console.log(`   - المستخدم: ${user}`);
  console.log(`   - قاعدة البيانات: ${database}`);

  // الاتصال بدون تحديد قاعدة البيانات لإنشائها
  console.log(`\n1️⃣  الاتصال بخادم MySQL...`);
  let connection: mysql.Connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });
    console.log("   ✅ تم الاتصال بنجاح");
  } catch (error: any) {
    console.log(`   ❌ فشل الاتصال: ${error.message}`);
    console.log("\n💡 تأكد من:");
    console.log("   - أن خادم MySQL يعمل");
    console.log("   - صحة بيانات الاتصال (المضيف، المنفذ، المستخدم، كلمة المرور)");
    return;
  }

  // إنشاء قاعدة البيانات إذا لم تكن موجودة
  console.log(`\n2️⃣  التحقق من وجود قاعدة البيانات '${database}'...`);
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`   ✅ قاعدة البيانات '${database}' جاهزة`);
  } catch (error: any) {
    console.log(`   ❌ خطأ في إنشاء قاعدة البيانات: ${error.message}`);
    await connection.end();
    return;
  }

  await connection.end();

  // الاتصال بقاعدة البيانات وإنشاء الجداول
  console.log(`\n3️⃣  الاتصال بقاعدة البيانات...`);
  let db;
  try {
    db = drizzle(dbUrl);
    await db.execute(sql`SELECT 1`);
    console.log("   ✅ تم الاتصال بقاعدة البيانات بنجاح");
  } catch (error: any) {
    console.log(`   ❌ فشل الاتصال: ${error.message}`);
    return;
  }

  // فحص الجداول الموجودة
  console.log(`\n4️⃣  فحص الجداول الموجودة...`);
  try {
    const tablesResult = await db.execute(sql`SHOW TABLES`);
    const tables = (tablesResult as any)[0] || [];
    const tableNames = Object.values(tables).map((t: any) => Object.values(t)[0]).filter(Boolean);
    
    if (tableNames.length > 0) {
      console.log(`   ℹ️  يوجد ${tableNames.length} جدول موجود`);
      console.log(`   📋 الجداول: ${tableNames.slice(0, 5).join(", ")}${tableNames.length > 5 ? "..." : ""}`);
    } else {
      console.log("   ℹ️  لا توجد جداول - ستحتاج لتشغيل migrations");
    }
  } catch (error: any) {
    console.log(`   ⚠️  خطأ في فحص الجداول: ${error.message}`);
  }

  console.log(`\n5️⃣  تشغيل Migrations...`);
  console.log("   💡 قم بتشغيل الأمر التالي لإنشاء الجداول:");
  console.log("   pnpm db:push");
  console.log("\n   أو يدوياً:");
  console.log("   drizzle-kit generate");
  console.log("   drizzle-kit migrate");

  console.log("\n" + "=".repeat(60));
  console.log("✅ إعداد قاعدة البيانات مكتمل!");
  console.log("=".repeat(60));
}

setupDatabase().catch(console.error);

