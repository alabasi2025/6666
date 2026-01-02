import "dotenv/config";
import { getDb, testDatabaseConnection } from "./server/db";
import { sql } from "drizzle-orm";

async function checkDatabaseStatus() {
  console.log("=".repeat(60));
  console.log("📊 تقرير فحص اتصال قاعدة البيانات");
  console.log("=".repeat(60));
  
  // 1. فحص متغير البيئة
  console.log("\n1️⃣  فحص متغير البيئة DATABASE_URL:");
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("   ❌ DATABASE_URL غير محدد");
    console.log("   ℹ️  النظام يعمل في وضع Demo Mode");
    return;
  }
  
  // إخفاء كلمة المرور
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`   ✅ DATABASE_URL محدد: ${maskedUrl}`);
  
  // تحليل URL
  try {
    const url = new URL(dbUrl);
    console.log("\n2️⃣  تفاصيل الاتصال:");
    console.log(`   📌 البروتوكول: ${url.protocol.replace(':', '')}`);
    console.log(`   📌 المضيف: ${url.hostname}`);
    console.log(`   📌 المنفذ: ${url.port || '3306 (افتراضي)'}`);
    console.log(`   📌 قاعدة البيانات: ${url.pathname.replace('/', '') || '(غير محدد)'}`);
    console.log(`   📌 المستخدم: ${url.username || '(غير محدد)'}`);
  } catch (e) {
    console.log("   ⚠️  تعذر تحليل عنوان URL");
  }
  
  // 3. اختبار الاتصال
  console.log("\n3️⃣  اختبار الاتصال:");
  const connectionResult = await testDatabaseConnection();
  
  if (connectionResult) {
    console.log("   ✅ الاتصال بقاعدة البيانات ناجح!");
    
    // 4. فحص الجداول
    try {
      const db = await getDb();
      if (db) {
        console.log("\n4️⃣  فحص الجداول:");
        const tablesResult = await db.execute(sql`SHOW TABLES`);
        const tables = (tablesResult as any)[0] || [];
        const tableNames = Object.values(tables).map((t: any) => Object.values(t)[0]).filter(Boolean);
        
        console.log(`   ✅ عدد الجداول: ${tableNames.length}`);
        if (tableNames.length > 0) {
          console.log(`   📋 الجداول الموجودة (أول 10):`);
          tableNames.slice(0, 10).forEach((name: string, i: number) => {
            console.log(`      ${i + 1}. ${name}`);
          });
          if (tableNames.length > 10) {
            console.log(`      ... و ${tableNames.length - 10} جدول آخر`);
          }
        }
        
        // 5. فحص جدول المستخدمين
        console.log("\n5️⃣  فحص جدول المستخدمين:");
        try {
          const usersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
          const userCount = (usersResult as any)[0]?.[0]?.count || 0;
          console.log(`   ✅ عدد المستخدمين: ${userCount}`);
        } catch (e: any) {
          console.log(`   ⚠️  جدول users غير موجود أو غير قابل للوصول: ${e.message}`);
        }
      }
    } catch (error: any) {
      console.log(`   ⚠️  خطأ في فحص الجداول: ${error.message}`);
    }
  } else {
    console.log("   ❌ فشل الاتصال بقاعدة البيانات");
    console.log("\n💡 الحلول المقترحة:");
    console.log("   1. تأكد من أن خادم MySQL يعمل");
    console.log("   2. تحقق من صحة بيانات الاتصال (المضيف، المنفذ، اسم المستخدم، كلمة المرور)");
    console.log("   3. تأكد من وجود قاعدة البيانات المحددة");
    console.log("   4. تحقق من صلاحيات المستخدم للوصول إلى قاعدة البيانات");
  }
  
  console.log("\n" + "=".repeat(60));
}

checkDatabaseStatus().catch(console.error);

