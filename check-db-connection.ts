import "dotenv/config";
import { testDatabaseConnection } from "./server/db.js";

async function checkConnection() {
  console.log("=".repeat(60));
  console.log("🔍 فحص اتصال قاعدة البيانات");
  console.log("=".repeat(60));
  
  // عرض معلومات الاتصال (بدون كلمة المرور)
  // PostgreSQL 18 يستخدم المنفذ 5433 (PostgreSQL 16 يستخدم 5432)
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:774424555@localhost:5433/666666";
  const url = new URL(dbUrl);
  console.log(`\n📌 معلومات الاتصال:`);
  console.log(`   - نوع قاعدة البيانات: PostgreSQL`);
  console.log(`   - المضيف: ${url.hostname}`);
  console.log(`   - المنفذ: ${url.port || "5433"}`);
  console.log(`   - المستخدم: ${url.username}`);
  console.log(`   - قاعدة البيانات: ${url.pathname.replace("/", "")}`);
  
  console.log(`\n🔌 محاولة الاتصال...`);
  
  try {
    const isConnected = await testDatabaseConnection();
    
    if (isConnected) {
      console.log("\n✅ نجح الاتصال بقاعدة البيانات!");
      console.log("   - حالة الاتصال: نشط");
      console.log("   - الترميز: UTF-8");
      process.exit(0);
    } else {
      console.log("\n❌ فشل الاتصال بقاعدة البيانات");
      console.log("\n💡 تأكد من:");
      console.log("   - أن خادم PostgreSQL يعمل");
      console.log("   - صحة بيانات الاتصال (المضيف، المنفذ، المستخدم، كلمة المرور)");
      console.log("   - أن قاعدة البيانات موجودة");
      console.log("\n📝 للتحقق من حالة PostgreSQL:");
      console.log("   Windows: Get-Service postgresql*");
      console.log("   أو: pg_isready -h localhost -p 5433");
      process.exit(1);
    }
  } catch (error: any) {
    console.log(`\n❌ خطأ أثناء الاتصال:`);
    console.log(`   ${error.message}`);
    console.log("\n💡 الأسباب المحتملة:");
    if (error.message.includes("ECONNREFUSED")) {
      console.log("   - خادم PostgreSQL غير قيد التشغيل");
    } else if (error.message.includes("password authentication failed")) {
      console.log("   - كلمة المرور غير صحيحة");
    } else if (error.message.includes("database") && error.message.includes("does not exist")) {
      console.log("   - قاعدة البيانات غير موجودة");
    } else if (error.message.includes("timeout")) {
      console.log("   - انتهت مهلة الاتصال (Timeout)");
    }
    process.exit(1);
  }
}

checkConnection();
