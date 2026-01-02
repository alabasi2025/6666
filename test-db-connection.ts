import "dotenv/config";

async function testConnection() {
  console.log("=".repeat(50));
  console.log("فحص اتصال قاعدة البيانات - Database Connection Test");
  console.log("=".repeat(50));
  
  // Check if DATABASE_URL is set
  const dbUrl = process.env.DATABASE_URL;
  
  console.log("\n1. فحص متغير البيئة DATABASE_URL:");
  if (!dbUrl) {
    console.log("   ❌ DATABASE_URL غير محدد (not set)");
    console.log("   ℹ️  المشروع يعمل في وضع العرض التجريبي (DEMO_MODE)");
    console.log("\n   لتفعيل قاعدة البيانات، أنشئ ملف .env وأضف:");
    console.log("   DATABASE_URL=mysql://user:password@host:port/database");
    return;
  }
  
  // Mask password in URL for display
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`   ✅ DATABASE_URL محدد: ${maskedUrl}`);
  
  // Parse URL to get details
  try {
    const url = new URL(dbUrl);
    console.log("\n2. تفاصيل الاتصال:");
    console.log(`   - البروتوكول (Protocol): ${url.protocol.replace(':', '')}`);
    console.log(`   - المضيف (Host): ${url.hostname}`);
    console.log(`   - المنفذ (Port): ${url.port || '3306 (default)'}`);
    console.log(`   - قاعدة البيانات (Database): ${url.pathname.replace('/', '')}`);
    console.log(`   - المستخدم (User): ${url.username}`);
  } catch (e) {
    console.log("   ⚠️ تعذر تحليل عنوان URL");
  }
  
  // Test actual connection
  console.log("\n3. اختبار الاتصال الفعلي:");
  try {
    const { drizzle } = await import("drizzle-orm/mysql2");
    const { sql } = await import("drizzle-orm");
    
    const db = drizzle(dbUrl);
    await db.execute(sql`SELECT 1 as test`);
    console.log("   ✅ تم الاتصال بقاعدة البيانات بنجاح!");
    
    // Check tables
    console.log("\n4. فحص الجداول:");
    const tables = await db.execute(sql`SHOW TABLES`);
    console.log(`   ✅ عدد الجداول: ${(tables as any)[0]?.length || 0}`);
    
  } catch (error: any) {
    console.log("   ❌ فشل الاتصال بقاعدة البيانات");
    console.log(`   الخطأ: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log("\n   💡 الحل المقترح:");
      console.log("   - تأكد من أن خادم MySQL يعمل");
      console.log("   - تحقق من صحة المضيف والمنفذ");
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("\n   💡 الحل المقترح:");
      console.log("   - تحقق من صحة اسم المستخدم وكلمة المرور");
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log("\n   💡 الحل المقترح:");
      console.log("   - قاعدة البيانات غير موجودة، قم بإنشائها أولاً");
    }
  }
  
  console.log("\n" + "=".repeat(50));
}

testConnection();
