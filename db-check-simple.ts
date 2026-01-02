import "dotenv/config";

async function checkDB() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 فحص اتصال قاعدة البيانات - Database Connection Check");
  console.log("=".repeat(60) + "\n");

  // 1. Check DATABASE_URL
  console.log("1️⃣  فحص متغير البيئة:");
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log("   ❌ DATABASE_URL غير محدد");
    console.log("   ℹ️  النظام يعمل في وضع Demo Mode (بدون قاعدة بيانات)\n");
    return;
  }

  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`   ✅ DATABASE_URL = ${maskedUrl}\n`);

  // 2. Parse connection details
  console.log("2️⃣  تفاصيل الاتصال:");
  try {
    const url = new URL(dbUrl);
    console.log(`   • البروتوكول: ${url.protocol.replace(':', '')}`);
    console.log(`   • المضيف: ${url.hostname}`);
    console.log(`   • المنفذ: ${url.port || '3306'}`);
    console.log(`   • قاعدة البيانات: ${url.pathname.replace('/', '')}`);
    console.log(`   • المستخدم: ${url.username}\n`);
  } catch (e) {
    console.log("   ⚠️  خطأ في تحليل URL\n");
    return;
  }

  // 3. Test connection
  console.log("3️⃣  اختبار الاتصال:");
  try {
    const { drizzle } = await import("drizzle-orm/mysql2");
    const { sql } = await import("drizzle-orm");
    
    const db = drizzle(dbUrl);
    await db.execute(sql`SELECT 1 as connected`);
    console.log("   ✅ الاتصال بقاعدة البيانات ناجح!\n");

    // 4. Check tables
    console.log("4️⃣  فحص الجداول:");
    try {
      const tablesResult = await db.execute(sql`SHOW TABLES`);
      const tables = (tablesResult as any)[0] || [];
      const tableCount = Array.isArray(tables) ? tables.length : Object.keys(tables).length;
      console.log(`   ✅ عدد الجداول: ${tableCount}\n`);

      if (tableCount > 0) {
        console.log("5️⃣  الجداول الموجودة (أول 10):");
        const tableNames = Array.isArray(tables) 
          ? tables.slice(0, 10)
          : Object.keys(tables).slice(0, 10);
        tableNames.forEach((t: any, i: number) => {
          const name = typeof t === 'string' ? t : Object.values(t as any)[0];
          console.log(`      ${i + 1}. ${name}`);
        });
      }
    } catch (e: any) {
      console.log(`   ⚠️  خطأ: ${e.message}`);
    }

  } catch (error: any) {
    console.log("   ❌ فشل الاتصال بقاعدة البيانات");
    console.log(`   الخطأ: ${error.message}\n`);
    
    console.log("💡 الحلول المقترحة:");
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.log("   • تأكد من أن خادم MySQL يعمل");
      console.log("   • على Windows، شغّل: Start-Service MySQL");
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("   • تحقق من صحة اسم المستخدم وكلمة المرور");
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log("   • قاعدة البيانات غير موجودة، قم بإنشاء قاعدة جديدة");
    }
  }

  console.log("\n" + "=".repeat(60));
}

checkDB().catch(console.error);

