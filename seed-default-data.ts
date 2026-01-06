import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import {
  users,
  businesses,
  branches,
  stations,
  roles,
  userRoles,
  customSubSystems,
} from "./drizzle/schema";

const connectionString = process.env.DATABASE_URL || "postgresql://energy_user:energy_password@localhost:5432/energy_management";

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function seed() {
  console.log("🌱 بدء إنشاء البيانات الافتراضية...\n");

  try {
    // 1. إنشاء الشركة الافتراضية
    console.log("📦 إنشاء الشركة الافتراضية...");
    const [business] = await db.insert(businesses).values({
      code: "DEFAULT",
      nameAr: "الشركة الافتراضية",
      nameEn: "Default Company",
      type: "subsidiary",
      systemType: "both",
      address: "العنوان الافتراضي",
      phone: "0500000000",
      email: "info@default.com",
      currency: "YER",
      isActive: true,
    }).returning();
    console.log(`   ✅ تم إنشاء الشركة: ${business.nameAr} (ID: ${business.id})`);

    // 2. إنشاء الفرع الافتراضي
    console.log("🏢 إنشاء الفرع الافتراضي...");
    const [branch] = await db.insert(branches).values({
      businessId: business.id,
      nameAr: "الفرع الرئيسي",
      nameEn: "Main Branch",
      code: "MAIN",
      type: "local",
      address: "العنوان الرئيسي",
      phone: "0500000001",
      isActive: true,
    }).returning();
    console.log(`   ✅ تم إنشاء الفرع: ${branch.nameAr} (ID: ${branch.id})`);

    // 3. إنشاء المحطة الافتراضية
    console.log("⚡ إنشاء المحطة الافتراضية...");
    const [station] = await db.insert(stations).values({
      businessId: business.id,
      branchId: branch.id,
      nameAr: "المحطة الرئيسية",
      nameEn: "Main Station",
      code: "ST-001",
      type: "solar",
      address: "عنوان المحطة",
      capacity: "1000",
      isActive: true,
    }).returning();
    console.log(`   ✅ تم إنشاء المحطة: ${station.nameAr} (ID: ${station.id})`);

    // 4. إنشاء الدور الافتراضي (مدير النظام)
    console.log("👤 إنشاء دور مدير النظام...");
    const [adminRole] = await db.insert(roles).values({
      businessId: business.id,
      code: "ADMIN",
      nameAr: "مدير النظام",
      nameEn: "System Admin",
      description: "صلاحيات كاملة على النظام",
      level: 1,
      isSystem: true,
      isActive: true,
    }).returning();
    console.log(`   ✅ تم إنشاء الدور: ${adminRole.nameAr} (ID: ${adminRole.id})`);

    // 5. إنشاء المستخدم الافتراضي
    console.log("🔐 إنشاء المستخدم الافتراضي...");
    const hashedPassword = await bcrypt.hash("Admin@123456", 10);
    const [adminUser] = await db.insert(users).values({
      openId: randomUUID(),
      phone: "0500000000",
      password: hashedPassword,
      name: "مدير النظام",
      nameAr: "مدير النظام",
      email: "admin@default.com",
      role: "super_admin",
      businessId: business.id,
      branchId: branch.id,
      isActive: true,
    }).returning();
    console.log(`   ✅ تم إنشاء المستخدم: ${adminUser.name} (هاتف: ${adminUser.phone})`);

    // 6. ربط المستخدم بالدور
    await db.insert(userRoles).values({
      userId: adminUser.id,
      roleId: adminRole.id,
    });
    console.log("   ✅ تم ربط المستخدم بدور مدير النظام");

    // 7. إنشاء النظام الفرعي الافتراضي في النظام المخصص
    console.log("🔧 إنشاء النظام الفرعي الافتراضي...");
    const [subSystem] = await db.insert(customSubSystems).values({
      businessId: business.id,
      code: "DEFAULT-001",
      nameAr: "النظام الفرعي الافتراضي",
      nameEn: "Default Sub System",
      color: "#3B82F6",
      icon: "building",
      isActive: true,
    }).returning();
    console.log(`   ✅ تم إنشاء النظام الفرعي: ${subSystem.nameAr} (ID: ${subSystem.id})`);

    // 8. إنشاء أنواع الحسابات والعملات عبر SQL مباشر
    console.log("📊 إنشاء أنواع الحسابات والعملات...");
    
    // أنواع الحسابات النظامية
    const accountTypes = [
      { code: 'ASSETS', name_ar: 'أصول', name_en: 'Assets', nature: 'debit', is_system: true },
      { code: 'LIABILITIES', name_ar: 'خصوم', name_en: 'Liabilities', nature: 'credit', is_system: true },
      { code: 'EQUITY', name_ar: 'حقوق ملكية', name_en: 'Equity', nature: 'credit', is_system: true },
      { code: 'REVENUE', name_ar: 'إيرادات', name_en: 'Revenue', nature: 'credit', is_system: true },
      { code: 'EXPENSES', name_ar: 'مصروفات', name_en: 'Expenses', nature: 'debit', is_system: true },
      { code: 'PROJECTS', name_ar: 'مشاريع', name_en: 'Projects', nature: 'debit', is_system: false },
      { code: 'PARTNERS', name_ar: 'شركاء', name_en: 'Partners', nature: 'credit', is_system: false },
    ];

    for (const type of accountTypes) {
      await pool.query(`
        INSERT INTO custom_account_types (business_id, sub_system_id, code, name_ar, name_en, nature, is_system)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [business.id, subSystem.id, type.code, type.name_ar, type.name_en, type.nature, type.is_system]);
      console.log(`   ✅ تم إنشاء نوع الحساب: ${type.name_ar}`);
    }

    // أنواع الحسابات الفرعية
    const subTypes = [
      { code: 'GENERAL', name_ar: 'عام', name_en: 'General', is_vault: false },
      { code: 'CASH', name_ar: 'صندوق', name_en: 'Cash Box', is_vault: true },
      { code: 'BANK', name_ar: 'بنك', name_en: 'Bank', is_vault: true },
      { code: 'EWALLET', name_ar: 'محفظة إلكترونية', name_en: 'E-Wallet', is_vault: true },
      { code: 'ATM', name_ar: 'صراف آلي', name_en: 'ATM', is_vault: true },
      { code: 'WAREHOUSE', name_ar: 'مخزن', name_en: 'Warehouse', is_vault: false },
      { code: 'SUPPLIER', name_ar: 'مورد', name_en: 'Supplier', is_vault: false },
      { code: 'CUSTOMER', name_ar: 'عميل', name_en: 'Customer', is_vault: false },
    ];

    for (const subType of subTypes) {
      await pool.query(`
        INSERT INTO custom_account_sub_types (business_id, sub_system_id, code, name_ar, name_en, is_vault)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [business.id, subSystem.id, subType.code, subType.name_ar, subType.name_en, subType.is_vault]);
      console.log(`   ✅ تم إنشاء النوع الفرعي: ${subType.name_ar}`);
    }

    // العملات
    const currencies = [
      { code: 'YER', name_ar: 'ريال يمني', name_en: 'Yemeni Rial', symbol: '﷼', exchange_rate: 1.00, is_default: true },
      { code: 'SAR', name_ar: 'ريال سعودي', name_en: 'Saudi Riyal', symbol: '﷼', exchange_rate: 150.00, is_default: false },
      { code: 'USD', name_ar: 'دولار أمريكي', name_en: 'US Dollar', symbol: '$', exchange_rate: 530.00, is_default: false },
    ];

    for (const curr of currencies) {
      await pool.query(`
        INSERT INTO custom_currencies (business_id, sub_system_id, code, name_ar, name_en, symbol, exchange_rate, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
      `, [business.id, subSystem.id, curr.code, curr.name_ar, curr.name_en, curr.symbol, curr.exchange_rate, curr.is_default]);
      console.log(`   ✅ تم إنشاء العملة: ${curr.name_ar}`);
    }

    console.log("\n✅ تم إنشاء جميع البيانات الافتراضية بنجاح!");
    console.log("\n📋 ملخص البيانات المنشأة:");
    console.log("   • شركة واحدة: الشركة الافتراضية");
    console.log("   • فرع واحد: الفرع الرئيسي");
    console.log("   • محطة واحدة: المحطة الرئيسية");
    console.log("   • مستخدم مدير (هاتف: 0500000000 / كلمة المرور: Admin@123456)");
    console.log("   • نظام فرعي واحد: النظام الفرعي الافتراضي");
    console.log("   • 7 أنواع حسابات (5 نظامية + 2 مخصصة)");
    console.log("   • 8 أنواع حسابات فرعية");
    console.log("   • 3 عملات (ريال يمني، ريال سعودي، دولار أمريكي)");

  } catch (error) {
    console.error("❌ خطأ في إنشاء البيانات:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
