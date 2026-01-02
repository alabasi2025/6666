import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

async function checkStructure() {
  console.log("=".repeat(60));
  console.log("🔍 فحص بنية الجداول في قاعدة البيانات");
  console.log("=".repeat(60));

  const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/666666";
  
  try {
    const db = drizzle(dbUrl);
    
    // فحص بنية جدول custom_accounts
    console.log("\n1️⃣  بنية جدول custom_accounts:");
    console.log("-".repeat(60));
    const accountsColumns = await db.execute(sql`DESCRIBE custom_accounts`);
    (accountsColumns as any)[0].forEach((col: any) => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default || 'NULL'}`);
    });

    // فحص بنية جدول custom_account_sub_types
    console.log("\n2️⃣  بنية جدول custom_account_sub_types:");
    console.log("-".repeat(60));
    const subTypesColumns = await db.execute(sql`DESCRIBE custom_account_sub_types`);
    (subTypesColumns as any)[0].forEach((col: any) => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default || 'NULL'}`);
    });

    // فحص بنية جدول custom_account_types
    console.log("\n3️⃣  بنية جدول custom_account_types:");
    console.log("-".repeat(60));
    const typesResult = await db.execute(sql`SHOW TABLES LIKE 'custom_account_types'`);
    if ((typesResult as any)[0].length > 0) {
      const typesColumns = await db.execute(sql`DESCRIBE custom_account_types`);
      (typesColumns as any)[0].forEach((col: any) => {
        console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default || 'NULL'}`);
      });
    } else {
      console.log("   ⚠️  الجدول custom_account_types غير موجود");
    }

    console.log("\n" + "=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ خطأ:", error.message);
  }
}

checkStructure();

