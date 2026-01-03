import "dotenv/config";
import { getDb } from "./server/db";
import { accounts } from "./drizzle/schema";
import { sql, eq, and, asc } from "drizzle-orm";

async function checkAccounts() {
  console.log("=".repeat(60));
  console.log("📊 فحص دليل الحسابات - Chart of Accounts Check");
  console.log("=".repeat(60));

  try {
    const db = await getDb();
    if (!db) {
      console.log("   ❌ لا يمكن الاتصال بقاعدة البيانات");
      return;
    }

    // 1. إحصائيات عامة
    console.log("\n1️⃣  إحصائيات عامة:");
    const totalCount = await db.execute(sql`SELECT COUNT(*) as count FROM accounts`);
    const total = (totalCount as any)[0]?.[0]?.count || 0;
    console.log(`   📌 إجمالي الحسابات: ${total}`);

    const activeCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM accounts WHERE is_active = 1`
    );
    const active = (activeCount as any)[0]?.[0]?.count || 0;
    console.log(`   ✅ الحسابات النشطة: ${active}`);
    console.log(`   ⚠️  الحسابات غير النشطة: ${total - active}`);

    // 2. الحسابات حسب النظام
    console.log("\n2️⃣  الحسابات حسب النظام (System Module):");
    const byModule = await db.execute(
      sql`SELECT system_module, COUNT(*) as count 
          FROM accounts 
          WHERE is_active = 1 
          GROUP BY system_module 
          ORDER BY count DESC`
    );
    const modules = (byModule as any)[0] || [];
    if (modules.length > 0) {
      modules.forEach((row: any) => {
        const module = Object.values(row)[0];
        const count = Object.values(row)[1];
        console.log(`   📦 ${module}: ${count} حساب`);
      });
    }

    // 3. الحسابات حسب النوع
    console.log("\n3️⃣  الحسابات حسب النوع (Account Type):");
    const byType = await db.execute(
      sql`SELECT account_type, COUNT(*) as count 
          FROM accounts 
          WHERE is_active = 1 
          GROUP BY account_type 
          ORDER BY count DESC`
    );
    const types = (byType as any)[0] || [];
    if (types.length > 0) {
      types.forEach((row: any) => {
        const type = Object.values(row)[0];
        const count = Object.values(row)[1];
        console.log(`   📋 ${type}: ${count} حساب`);
      });
    }

    // 4. الحسابات حسب الطبيعة
    console.log("\n4️⃣  الحسابات حسب الطبيعة (Nature):");
    const byNature = await db.execute(
      sql`SELECT nature, COUNT(*) as count 
          FROM accounts 
          WHERE is_active = 1 
          GROUP BY nature`
    );
    const natures = (byNature as any)[0] || [];
    if (natures.length > 0) {
      natures.forEach((row: any) => {
        const nature = Object.values(row)[0];
        const count = Object.values(row)[1];
        const natureAr = nature === "debit" ? "مدين" : "دائن";
        console.log(`   💰 ${natureAr} (${nature}): ${count} حساب`);
      });
    }

    // 5. الحسابات الرئيسية (Parent Accounts)
    console.log("\n5️⃣  الحسابات الرئيسية:");
    const parentCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM accounts WHERE is_parent = 1 AND is_active = 1`
    );
    const parents = (parentCount as any)[0]?.[0]?.count || 0;
    console.log(`   📂 عدد الحسابات الرئيسية: ${parents}`);

    // 6. الحسابات حسب المستوى
    console.log("\n6️⃣  الحسابات حسب المستوى (Level):");
    const byLevel = await db.execute(
      sql`SELECT level, COUNT(*) as count 
          FROM accounts 
          WHERE is_active = 1 
          GROUP BY level 
          ORDER BY level ASC`
    );
    const levels = (byLevel as any)[0] || [];
    if (levels.length > 0) {
      levels.forEach((row: any) => {
        const level = Object.values(row)[0];
        const count = Object.values(row)[1];
        console.log(`   📊 المستوى ${level}: ${count} حساب`);
      });
    }

    // 7. الحسابات النقدية والمصرفية
    console.log("\n7️⃣  الحسابات الخاصة:");
    const cashCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM accounts WHERE is_cash_account = 1 AND is_active = 1`
    );
    const cash = (cashCount as any)[0]?.[0]?.count || 0;
    console.log(`   💵 الحسابات النقدية: ${cash}`);

    const bankCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM accounts WHERE is_bank_account = 1 AND is_active = 1`
    );
    const bank = (bankCount as any)[0]?.[0]?.count || 0;
    console.log(`   🏦 الحسابات المصرفية: ${bank}`);

    // 8. عرض أول 10 حسابات
    console.log("\n8️⃣  عينة من الحسابات (أول 10):");
    const sampleAccounts = await db
      .select({
        id: accounts.id,
        code: accounts.code,
        nameAr: accounts.nameAr,
        nameEn: accounts.nameEn,
        systemModule: accounts.systemModule,
        accountType: accounts.accountType,
        nature: accounts.nature,
        level: accounts.level,
        currentBalance: accounts.currentBalance,
      })
      .from(accounts)
      .where(eq(accounts.isActive, true))
      .orderBy(asc(accounts.code))
      .limit(10);

    if (sampleAccounts.length > 0) {
      sampleAccounts.forEach((acc, index) => {
        console.log(`   ${index + 1}. [${acc.code}] ${acc.nameAr || acc.nameEn}`);
        console.log(`      النظام: ${acc.systemModule} | النوع: ${acc.accountType} | الطبيعة: ${acc.nature === "debit" ? "مدين" : "دائن"} | المستوى: ${acc.level}`);
        console.log(`      الرصيد الحالي: ${acc.currentBalance || "0.00"}`);
      });
    } else {
      console.log("   ⚠️  لا توجد حسابات في قاعدة البيانات");
    }

    // 9. فحص الحسابات المرتبطة بكيانات
    console.log("\n9️⃣  الحسابات المرتبطة بكيانات:");
    const linkedCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM accounts WHERE linked_entity_type IS NOT NULL AND is_active = 1`
    );
    const linked = (linkedCount as any)[0]?.[0]?.count || 0;
    console.log(`   🔗 عدد الحسابات المرتبطة: ${linked}`);

    if (linked > 0) {
      const linkedByType = await db.execute(
        sql`SELECT linked_entity_type, COUNT(*) as count 
            FROM accounts 
            WHERE linked_entity_type IS NOT NULL AND is_active = 1 
            GROUP BY linked_entity_type`
      );
      const linkedTypes = (linkedByType as any)[0] || [];
      linkedTypes.forEach((row: any) => {
        const type = Object.values(row)[0];
        const count = Object.values(row)[1];
        console.log(`      - ${type}: ${count} حساب`);
      });
    }

    // 10. فحص الأخطاء المحتملة
    console.log("\n🔟 فحص الأخطاء المحتملة:");
    
    // حسابات بدون كود
    const noCode = await db.execute(
      sql`SELECT COUNT(*) as count FROM accounts WHERE (code IS NULL OR code = '') AND is_active = 1`
    );
    const noCodeCount = (noCode as any)[0]?.[0]?.count || 0;
    if (noCodeCount > 0) {
      console.log(`   ⚠️  حسابات بدون كود: ${noCodeCount}`);
    }

    // حسابات بدون اسم عربي
    const noNameAr = await db.execute(
      sql`SELECT COUNT(*) as count FROM accounts WHERE (name_ar IS NULL OR name_ar = '') AND is_active = 1`
    );
    const noNameArCount = (noNameAr as any)[0]?.[0]?.count || 0;
    if (noNameArCount > 0) {
      console.log(`   ⚠️  حسابات بدون اسم عربي: ${noNameArCount}`);
    }

    // حسابات بدون parentId ولكن isParent = true
    const orphanParents = await db.execute(
      sql`SELECT COUNT(*) as count FROM accounts WHERE parent_id IS NULL AND is_parent = 1 AND is_active = 1`
    );
    const orphanParentsCount = (orphanParents as any)[0]?.[0]?.count || 0;
    if (orphanParentsCount > 0) {
      console.log(`   ⚠️  حسابات رئيسية بدون parent_id: ${orphanParentsCount}`);
    }

    if (noCodeCount === 0 && noNameArCount === 0 && orphanParentsCount === 0) {
      console.log("   ✅ لا توجد أخطاء محتملة");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ تم فحص دليل الحسابات الأساسي بنجاح");
    console.log("=".repeat(60));

    // ============================================
    // فحص الحسابات المخصصة (Custom Accounts)
    // ============================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 فحص الحسابات المخصصة - Custom Accounts Check");
    console.log("=".repeat(60));

    // 1. إحصائيات عامة للحسابات المخصصة
    console.log("\n1️⃣  إحصائيات عامة (Custom Accounts):");
    const customTotalCount = await db.execute(sql`SELECT COUNT(*) as count FROM custom_accounts`);
    const customTotal = (customTotalCount as any)[0]?.[0]?.count || 0;
    console.log(`   📌 إجمالي الحسابات المخصصة: ${customTotal}`);

    const customActiveCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM custom_accounts WHERE is_active = 1`
    );
    const customActive = (customActiveCount as any)[0]?.[0]?.count || 0;
    console.log(`   ✅ الحسابات المخصصة النشطة: ${customActive}`);
    console.log(`   ⚠️  الحسابات المخصصة غير النشطة: ${customTotal - customActive}`);

    // 2. الحسابات المخصصة حسب النوع
    if (customTotal > 0) {
      console.log("\n2️⃣  الحسابات المخصصة حسب النوع:");
      const customByType = await db.execute(
        sql`SELECT account_type, COUNT(*) as count 
            FROM custom_accounts 
            WHERE is_active = 1 
            GROUP BY account_type 
            ORDER BY count DESC`
      );
      const customTypes = (customByType as any)[0] || [];
      if (customTypes.length > 0) {
        customTypes.forEach((row: any) => {
          const type = Object.values(row)[0];
          const count = Object.values(row)[1];
          const typeAr: Record<string, string> = {
            asset: "أصول",
            liability: "خصوم",
            equity: "حقوق ملكية",
            revenue: "إيرادات",
            expense: "مصروفات"
          };
          console.log(`   📋 ${typeAr[type as string] || type}: ${count} حساب`);
        });
      }

      // 3. الحسابات المخصصة حسب النظام الفرعي
      console.log("\n3️⃣  الحسابات المخصصة حسب النظام الفرعي:");
      const customBySubSystem = await db.execute(
        sql`SELECT sub_system_id, COUNT(*) as count 
            FROM custom_accounts 
            WHERE is_active = 1 AND sub_system_id IS NOT NULL
            GROUP BY sub_system_id 
            ORDER BY count DESC`
      );
      const customSubSystems = (customBySubSystem as any)[0] || [];
      if (customSubSystems.length > 0) {
        customSubSystems.forEach((row: any) => {
          const subSystemId = Object.values(row)[0];
          const count = Object.values(row)[1];
          console.log(`   📦 النظام الفرعي ${subSystemId}: ${count} حساب`);
        });
      } else {
        console.log("   ⚠️  لا توجد حسابات مرتبطة بنظام فرعي");
      }

      // 4. عرض عينة من الحسابات المخصصة
      console.log("\n4️⃣  عينة من الحسابات المخصصة (أول 10):");
      const sampleCustomAccounts = await db.execute(
        sql`SELECT id, account_code, account_name_ar, account_name_en, account_name, account_type, 
                   sub_system_id, level, balance 
            FROM custom_accounts 
            WHERE is_active = 1 
            ORDER BY account_code ASC 
            LIMIT 10`
      );
      
      const customAccountsList = (sampleCustomAccounts as any)[0] || [];
      if (customAccountsList.length > 0) {
        customAccountsList.forEach((acc: any, index: number) => {
          const code = acc.account_code || acc.account_number || 'N/A';
          const nameAr = acc.account_name_ar || acc.account_name || 'بدون اسم';
          const nameEn = acc.account_name_en || '';
          const type = acc.account_type || 'N/A';
          const level = acc.level || 'N/A';
          const subSystem = acc.sub_system_id || 'غير محدد';
          const balance = acc.balance || "0.00";
          
          console.log(`   ${index + 1}. [${code}] ${nameAr}${nameEn ? ` (${nameEn})` : ''}`);
          console.log(`      النوع: ${type} | المستوى: ${level} | النظام الفرعي: ${subSystem}`);
          console.log(`      الرصيد: ${balance}`);
        });
      }
    } else {
      console.log("\n   ⚠️  لا توجد حسابات مخصصة في قاعدة البيانات");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ تم فحص جميع الحسابات بنجاح");
    console.log("=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ خطأ أثناء فحص دليل الحسابات:");
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   كود الخطأ: ${error.code}`);
    }
  }
}

checkAccounts().catch(console.error);

