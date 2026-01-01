import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { sql, eq, or, isNull } from "drizzle-orm";
import { customAccountTypes } from "./drizzle/schemas/customSystemV2";

async function checkAccountTypes() {
  console.log("=".repeat(60));
  console.log("🔍 فحص أنواع الحسابات في قاعدة البيانات");
  console.log("=".repeat(60));

  const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/666666";
  
  try {
    const db = drizzle(dbUrl);
    
    // اختبار الاتصال
    console.log("\n1️⃣  اختبار الاتصال بقاعدة البيانات...");
    await db.execute(sql`SELECT 1`);
    console.log("   ✅ تم الاتصال بنجاح");

    // جلب جميع أنواع الحسابات
    console.log("\n2️⃣  جلب جميع أنواع الحسابات...");
    const allTypes = await db
      .select()
      .from(customAccountTypes)
      .orderBy(customAccountTypes.displayOrder, customAccountTypes.typeNameAr);
    
    console.log(`   ✅ تم العثور على ${allTypes.length} نوع حساب`);
    
    if (allTypes.length === 0) {
      console.log("\n   ⚠️  لا توجد أنواع حسابات في قاعدة البيانات");
      return;
    }

    // عرض جميع الأنواع
    console.log("\n3️⃣  قائمة أنواع الحسابات:");
    console.log("-".repeat(60));
    allTypes.forEach((type, index) => {
      console.log(`\n   ${index + 1}. ${type.typeNameAr} (${type.typeCode})`);
      console.log(`      - ID: ${type.id}`);
      console.log(`      - Business ID: ${type.businessId}`);
      console.log(`      - Sub System ID: ${type.subSystemId || "NULL (عام)"}`);
      console.log(`      - نشط: ${type.isActive ? "نعم" : "لا"}`);
      console.log(`      - نوع النظام: ${type.isSystemType ? "نظامي" : "مخصص"}`);
      console.log(`      - الترتيب: ${type.displayOrder}`);
    });

    // فحص الأنواع حسب النظام الفرعي
    console.log("\n4️⃣  فحص الأنواع حسب النظام الفرعي:");
    console.log("-".repeat(60));
    
    // الأنواع العامة (subSystemId = NULL)
    const generalTypes = allTypes.filter(t => t.subSystemId === null);
    console.log(`\n   الأنواع العامة (subSystemId = NULL): ${generalTypes.length}`);
    generalTypes.forEach(t => {
      console.log(`      - ${t.typeNameAr} (${t.typeCode})`);
    });

    // الأنواع المخصصة لكل نظام فرعي
    const subSystemIds = [...new Set(allTypes.map(t => t.subSystemId).filter(id => id !== null))];
    console.log(`\n   الأنواع المخصصة للأنظمة الفرعية: ${subSystemIds.length} نظام`);
    
    for (const subSystemId of subSystemIds) {
      const types = allTypes.filter(t => t.subSystemId === subSystemId);
      console.log(`\n   النظام الفرعي ID: ${subSystemId} (${types.length} نوع)`);
      types.forEach(t => {
        console.log(`      - ${t.typeNameAr} (${t.typeCode})`);
      });
    }

    // فحص نظام "أعمال الحديدة" (subSystemId = 1)
    console.log("\n5️⃣  فحص أنواع نظام 'أعمال الحديدة' (subSystemId = 1):");
    console.log("-".repeat(60));
    
    const ironWorksTypes = await db
      .select()
      .from(customAccountTypes)
      .where(
        or(
          eq(customAccountTypes.subSystemId, 1),
          isNull(customAccountTypes.subSystemId)
        )
      )
      .orderBy(customAccountTypes.displayOrder, customAccountTypes.typeNameAr);
    
    console.log(`   ✅ تم العثور على ${ironWorksTypes.length} نوع`);
    ironWorksTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type.typeNameAr} (${type.typeCode}) - ${type.subSystemId ? `نظام فرعي ${type.subSystemId}` : "عام"}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ اكتمل الفحص بنجاح");
    console.log("=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ خطأ في فحص قاعدة البيانات:");
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   كود الخطأ: ${error.code}`);
    }
  }
}

checkAccountTypes();


