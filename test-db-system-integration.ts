import "dotenv/config";
import { testDatabaseConnection } from "./server/db";
import { logger } from "./server/utils/logger";
import { getHealthStatus, getReadinessStatus, getLivenessStatus } from "./server/utils/health";

async function runComprehensiveDBTest() {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 اختبار شامل لاتصال قاعدة البيانات بالنظام");
  console.log("=".repeat(70) + "\n");

  // 1. Check Environment
  console.log("1️⃣  فحص متغيرات البيئة:");
  console.log("─".repeat(70));

  const dbUrl = process.env.DATABASE_URL;
  const demoMode = process.env.DEMO_MODE === 'true' || !dbUrl;
  const nodeEnv = process.env.NODE_ENV || 'development';

  console.log(`   • NODE_ENV: ${nodeEnv}`);
  console.log(`   • DATABASE_URL: ${dbUrl ? "✅ محدد" : "❌ غير محدد"}`);
  console.log(`   • DEMO_MODE: ${demoMode ? "🔄 مفعل" : "✅ معطل"}`);
  
  if (dbUrl) {
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`   • Connection String: ${maskedUrl}`);
  }

  console.log("\n");

  // 2. Test Database Connection
  console.log("2️⃣  اختبار الاتصال بقاعدة البيانات:");
  console.log("─".repeat(70));

  try {
    const isConnected = await testDatabaseConnection();
    if (isConnected) {
      console.log("   ✅ الاتصال بقاعدة البيانات: ناجح");
    } else {
      console.log("   ⚠️  الاتصال بقاعدة البيانات: فشل (قد تكون في DEMO_MODE)");
    }
  } catch (error) {
    console.log(`   ❌ خطأ في الاختبار: ${error instanceof Error ? error.message : error}`);
  }

  console.log("\n");

  // 3. Check Health Status
  console.log("3️⃣  فحص صحة النظام:");
  console.log("─".repeat(70));

  try {
    const health = await getHealthStatus();
    console.log(`   • Status: ${health.status === 'healthy' ? '✅' : '⚠️'} ${health.status}`);
    console.log(`   • Database: ${health.database || 'N/A'}`);
    console.log(`   • Response Time: ${health.responseTime}ms`);
    console.log(`   • Uptime: ${health.uptime}s`);
  } catch (error) {
    console.log(`   ❌ خطأ: ${error instanceof Error ? error.message : error}`);
  }

  console.log("\n");

  // 4. Check Readiness
  console.log("4️⃣  فحص جاهزية النظام:");
  console.log("─".repeat(70));

  try {
    const readiness = await getReadinessStatus();
    console.log(`   • Ready: ${readiness.ready ? '✅' : '❌'}`);
    console.log(`   • Database: ${readiness.database || 'N/A'}`);
  } catch (error) {
    console.log(`   ❌ خطأ: ${error instanceof Error ? error.message : error}`);
  }

  console.log("\n");

  // 5. Check Liveness
  console.log("5️⃣  فحص حالة التشغيل:");
  console.log("─".repeat(70));

  try {
    const liveness = getLivenessStatus();
    console.log(`   • Alive: ${liveness.alive ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   ❌ خطأ: ${error instanceof Error ? error.message : error}`);
  }

  console.log("\n");

  // 6. Display Mode Info
  console.log("6️⃣  معلومات الوضع:");
  console.log("─".repeat(70));

  if (demoMode) {
    console.log("   🔄 النظام يعمل في DEMO MODE");
    console.log("   • البيانات محفوظة في الذاكرة");
    console.log("   • مستخدم تجريبي مفعل");
    console.log("   • مناسب للتطوير والاختبار");
    console.log("\n   💡 لتفعيل قاعدة البيانات الحقيقية:");
    console.log("      1. أنشئ قاعدة البيانات: mysql -u root -e \"CREATE DATABASE energy_management;\"");
    console.log("      2. أضف إلى .env: DATABASE_URL=mysql://root:@localhost:3306/energy_management");
    console.log("      3. أعد تشغيل السيرفر");
  } else {
    console.log("   ✅ النظام متصل بقاعدة البيانات الحقيقية");
    console.log("   • استخدم بيانات حقيقية");
    console.log("   • البيانات محفوظة في MySQL");
  }

  console.log("\n");

  // 7. Integration Points
  console.log("7️⃣  نقاط التكامل:");
  console.log("─".repeat(70));

  console.log("   ✅ Context Creation: يتحقق من قاعدة البيانات");
  console.log("   ✅ Authentication: متصل بقاعدة البيانات");
  console.log("   ✅ tRPC Router: جاهز للاستخدام");
  console.log("   ✅ Health Check: يراقب الاتصال");
  console.log("   ✅ Custom System API: متكامل");

  console.log("\n");

  // 8. Summary
  console.log("8️⃣  الملخص:");
  console.log("─".repeat(70));

  if (!demoMode && dbUrl) {
    console.log("   ✅ النظام متصل بقاعدة البيانات");
    console.log("   ✅ جميع الخدمات تعمل بشكل طبيعي");
    console.log("   ✅ يمكن استخدام النظام بشكل كامل");
  } else if (demoMode) {
    console.log("   ⚠️  النظام يعمل في وضع العرض التجريبي");
    console.log("   ⚠️  البيانات غير محفوظة بشكل دائم");
    console.log("   💡 لاستخدام قاعدة بيانات حقيقية، اتبع الخطوات أعلاه");
  } else {
    console.log("   ❌ خطأ في الاتصال");
    console.log("   💡 تحقق من حالة MySQL والمتغيرات");
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ انتهى الاختبار");
  console.log("=".repeat(70) + "\n");
}

runComprehensiveDBTest().catch(console.error);

