/**
 * تصدير البيانات من قاعدة البيانات إلى ملف Seed (نسخة مبسطة)
 * Export Database Data to Seed File (Simplified Version)
 */

import { getDb } from "./db";
import { logger } from "./utils/logger";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function exportDatabaseToSeed(businessId: number = 1) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    logger.info("[Export] Starting database export to seed file...");

    const seedData: any = {
      itemCategories: [],
      items: [],
      tariffs: [],
      feeTypes: [],
      paymentMethods: [],
      defectiveComponents: [],
      areas: [],
      squares: [],
      cabinets: [],
    };

    // دالة مساعدة للتعامل مع الأخطاء
    const safeQuery = async (queryFn: () => Promise<any>, defaultValue: any[] = []) => {
      try {
        const result = await queryFn();
        return result.rows || result || defaultValue;
      } catch (error: any) {
        logger.warn(`[Export] Query failed: ${error.message}`);
        return defaultValue;
      }
    };

    // 1. تصدير فئات الأصناف
    logger.info("[Export] Exporting item categories...");
    const categories = await safeQuery(async () => {
      return await db.execute(
        sql`SELECT id, code, name_ar, name_en, parent_id, is_active 
            FROM item_categories 
            WHERE business_id = ${businessId}`
      );
    });
    seedData.itemCategories = categories.map((cat: any) => ({
      code: cat.code,
      nameAr: cat.name_ar,
      nameEn: cat.name_en,
      parentId: cat.parent_id,
      isActive: cat.is_active,
    }));

    // 2. تصدير الأصناف
    logger.info("[Export] Exporting items...");
    const items = await safeQuery(async () => {
      return await db.execute(
        sql`SELECT 
            i.id, i.code, i.name_ar, i.name_en, i.type, i.unit,
            i.standard_cost, i.min_stock, i.reorder_point, i.specifications,
            c.code as category_code
           FROM items i
           LEFT JOIN item_categories c ON i.category_id = c.id
           WHERE i.business_id = ${businessId}`
      );
    });
    seedData.items = items.map((item: any) => ({
      code: item.code,
      nameAr: item.name_ar,
      nameEn: item.name_en,
      type: item.type,
      unit: item.unit,
      categoryCode: item.category_code,
      standardCost: item.standard_cost?.toString() || "0",
      minStock: item.min_stock?.toString() || "0",
      reorderPoint: item.reorder_point?.toString() || "0",
      specifications: item.specifications ? (typeof item.specifications === 'string' ? JSON.parse(item.specifications) : item.specifications) : {},
    }));

    // 3. تصدير التعرفات (محاولة camelCase أولاً، ثم snake_case)
    logger.info("[Export] Exporting tariffs...");
    const tariffs = await safeQuery(async () => {
      try {
        return await db.execute(
          sql`SELECT code, name, "nameEn", "tariffType", "serviceType",
                  slabs, "fixedCharge", description, "isActive"
              FROM tariffs 
              WHERE "businessId" = ${businessId}`
        );
      } catch {
        return await db.execute(
          sql`SELECT code, name, name_en, tariff_type, service_type,
                  slabs, fixed_charge, description, is_active
              FROM tariffs 
              WHERE business_id = ${businessId}`
        );
      }
    });
    seedData.tariffs = tariffs.map((tariff: any) => ({
      code: tariff.code,
      name: tariff.name,
      nameEn: tariff.nameEn || tariff.name_en,
      tariffType: tariff.tariffType || tariff.tariff_type,
      serviceType: tariff.serviceType || tariff.service_type,
      slabs: tariff.slabs ? (typeof tariff.slabs === 'string' ? JSON.parse(tariff.slabs) : tariff.slabs) : [],
      fixedCharge: (tariff.fixedCharge || tariff.fixed_charge)?.toString() || "0",
      description: tariff.description,
      isActive: tariff.isActive !== undefined ? tariff.isActive : tariff.is_active,
    }));

    // 4. تصدير أنواع الرسوم
    logger.info("[Export] Exporting fee types...");
    const feeTypes = await safeQuery(async () => {
      try {
        return await db.execute(
          sql`SELECT code, name, "nameEn", "feeType", amount,
                  "isRecurring", description, "isActive"
              FROM fee_types 
              WHERE "businessId" = ${businessId}`
        );
      } catch {
        return await db.execute(
          sql`SELECT code, name, name_en, fee_type, amount,
                  is_recurring, description, is_active
              FROM fee_types 
              WHERE business_id = ${businessId}`
        );
      }
    });
    seedData.feeTypes = feeTypes.map((fee: any) => ({
      code: fee.code,
      name: fee.name,
      nameEn: fee.nameEn || fee.name_en,
      feeType: fee.feeType || fee.fee_type,
      amount: fee.amount?.toString() || "0",
      isRecurring: fee.isRecurring !== undefined ? fee.isRecurring : fee.is_recurring,
      description: fee.description,
      isActive: fee.isActive !== undefined ? fee.isActive : fee.is_active,
    }));

    // 5. تصدير طرق الدفع
    logger.info("[Export] Exporting payment methods...");
    const paymentMethods = await safeQuery(async () => {
      try {
        return await db.execute(
          sql`SELECT code, name, "nameEn", "methodType", "isActive"
              FROM payment_methods_new 
              WHERE "businessId" = ${businessId}`
        );
      } catch {
        return await db.execute(
          sql`SELECT code, name, name_en, method_type, is_active
              FROM payment_methods_new 
              WHERE business_id = ${businessId}`
        );
      }
    });
    seedData.paymentMethods = paymentMethods.map((pm: any) => ({
      code: pm.code,
      name: pm.name,
      nameEn: pm.nameEn || pm.name_en,
      methodType: pm.methodType || pm.method_type,
      isActive: pm.isActive !== undefined ? pm.isActive : pm.is_active,
    }));

    // 6. تصدير القطع المعيبة
    logger.info("[Export] Exporting defective components...");
    const defectiveComponents = await safeQuery(async () => {
      return await db.execute(
        sql`SELECT component_type, serial_number, defect_reason,
                defect_category, severity, assessment_status, disposition
            FROM defective_components 
            WHERE business_id = ${businessId}`
      );
    });
    seedData.defectiveComponents = defectiveComponents.map((comp: any) => ({
      componentType: comp.component_type,
      serialNumber: comp.serial_number,
      defectReason: comp.defect_reason,
      defectCategory: comp.defect_category,
      severity: comp.severity,
      assessmentStatus: comp.assessment_status,
      disposition: comp.disposition,
    }));

    // 7. تصدير المناطق
    logger.info("[Export] Exporting areas...");
    const areas = await safeQuery(async () => {
      return await db.execute(
        sql`SELECT code, name, name_en, description, address, is_active
            FROM areas 
            WHERE business_id = ${businessId}`
      );
    });
    seedData.areas = areas.map((area: any) => ({
      code: area.code,
      name: area.name,
      nameEn: area.name_en,
      description: area.description,
      address: area.address,
      isActive: area.is_active,
    }));

    // 8. تصدير المربعات
    logger.info("[Export] Exporting squares...");
    const squares = await safeQuery(async () => {
      return await db.execute(
        sql`SELECT s.code, s.name, s.name_en, s.description, s.is_active,
                a.code as area_code
            FROM squares s
            LEFT JOIN areas a ON s.area_id = a.id
            WHERE s.business_id = ${businessId}`
      );
    });
    seedData.squares = squares.map((square: any) => ({
      code: square.code,
      name: square.name,
      nameEn: square.name_en,
      description: square.description,
      areaCode: square.area_code,
      isActive: square.is_active,
    }));

    // 9. تصدير الكبائن
    logger.info("[Export] Exporting cabinets...");
    const cabinets = await safeQuery(async () => {
      return await db.execute(
        sql`SELECT c.code, c.name, c.name_en, c.cabinet_type, c.is_active,
                s.code as square_code
            FROM cabinets c
            LEFT JOIN squares s ON c.square_id = s.id
            WHERE c.business_id = ${businessId}`
      );
    });
    seedData.cabinets = cabinets.map((cabinet: any) => ({
      code: cabinet.code,
      name: cabinet.name,
      nameEn: cabinet.name_en,
      cabinetType: cabinet.cabinet_type,
      squareCode: cabinet.square_code,
      isActive: cabinet.is_active,
    }));

    // إنشاء ملف Seed
    const seedFilePath = path.join(process.cwd(), "server", "seed-from-db.ts");
    const seedFileContent = `/**
 * ملف Seed من قاعدة البيانات
 * تم إنشاؤه تلقائياً من البيانات الموجودة في قاعدة البيانات
 * Generated automatically from database data
 * 
 * تاريخ الإنشاء: ${new Date().toISOString()}
 */

import { getDb } from "./db";
import { logger } from "./utils/logger";
import { sql } from "drizzle-orm";

const SEED_DATA = ${JSON.stringify(seedData, null, 2)};

export async function seedFromDatabase(businessId: number = 1) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    logger.info("[Seed] Starting seed from database export...");

    // إنشاء فئات الأصناف
    for (const category of SEED_DATA.itemCategories) {
      await db.execute(
        sql\`INSERT INTO item_categories (business_id, code, name_ar, name_en, parent_id, is_active)
             VALUES (\${businessId}, \${category.code}, \${category.nameAr}, \${category.nameEn}, \${category.parentId}, \${category.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en\`
      );
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.itemCategories.length} item categories\`);

    // إنشاء الأصناف
    for (const item of SEED_DATA.items) {
      const [category] = await db.execute(
        sql\`SELECT id FROM item_categories WHERE business_id = \${businessId} AND code = \${item.categoryCode}\`
      );
      const categoryId = (category.rows as any[])[0]?.id;
      
      if (categoryId) {
        await db.execute(
          sql\`INSERT INTO items (business_id, category_id, code, name_ar, name_en, type, unit,
                                  standard_cost, min_stock, reorder_point, specifications, is_active)
               VALUES (\${businessId}, \${categoryId}, \${item.code}, \${item.nameAr}, \${item.nameEn}, \${item.type}, \${item.unit},
                       \${item.standardCost}, \${item.minStock}, \${item.reorderPoint}, \${JSON.stringify(item.specifications)}, true)
               ON CONFLICT (business_id, code) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en\`
        );
      }
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.items.length} items\`);

    // إنشاء التعرفات
    for (const tariff of SEED_DATA.tariffs) {
      await db.execute(
        sql\`INSERT INTO tariffs (business_id, code, name, name_en, tariff_type, service_type,
                                slabs, fixed_charge, description, is_active)
             VALUES (\${businessId}, \${tariff.code}, \${tariff.name}, \${tariff.nameEn}, \${tariff.tariffType}, \${tariff.serviceType},
                     \${JSON.stringify(tariff.slabs)}, \${tariff.fixedCharge}, \${tariff.description || null}, \${tariff.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en\`
      );
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.tariffs.length} tariffs\`);

    // إنشاء أنواع الرسوم
    for (const feeType of SEED_DATA.feeTypes) {
      await db.execute(
        sql\`INSERT INTO fee_types (business_id, code, name, name_en, fee_type, amount,
                                    is_recurring, description, is_active)
             VALUES (\${businessId}, \${feeType.code}, \${feeType.name}, \${feeType.nameEn}, \${feeType.feeType}, \${feeType.amount},
                     \${feeType.isRecurring}, \${feeType.description || null}, \${feeType.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en\`
      );
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.feeTypes.length} fee types\`);

    // إنشاء طرق الدفع
    for (const paymentMethod of SEED_DATA.paymentMethods) {
      await db.execute(
        sql\`INSERT INTO payment_methods_new (business_id, code, name, name_en, method_type, is_active)
             VALUES (\${businessId}, \${paymentMethod.code}, \${paymentMethod.name}, \${paymentMethod.nameEn}, \${paymentMethod.methodType}, \${paymentMethod.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en\`
      );
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.paymentMethods.length} payment methods\`);

    // إنشاء القطع المعيبة
    for (const component of SEED_DATA.defectiveComponents) {
      await db.execute(
        sql\`INSERT INTO defective_components (business_id, component_type, serial_number,
                                               defect_reason, defect_category, severity,
                                               assessment_status, disposition, reported_by)
             VALUES (\${businessId}, \${component.componentType}, \${component.serialNumber}, \${component.defectReason},
                     \${component.defectCategory}, \${component.severity}, \${component.assessmentStatus},
                     \${component.disposition}, 1)
             ON CONFLICT DO NOTHING\`
      );
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.defectiveComponents.length} defective components\`);

    // إنشاء المناطق
    for (const area of SEED_DATA.areas) {
      await db.execute(
        sql\`INSERT INTO areas (business_id, code, name, name_en, description, address, is_active)
             VALUES (\${businessId}, \${area.code}, \${area.name}, \${area.nameEn}, \${area.description || null}, \${area.address || null}, \${area.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en\`
      );
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.areas.length} areas\`);

    // إنشاء المربعات
    for (const square of SEED_DATA.squares) {
      const [area] = await db.execute(
        sql\`SELECT id FROM areas WHERE business_id = \${businessId} AND code = \${square.areaCode}\`
      );
      const areaId = (area.rows as any[])[0]?.id;
      
      if (areaId) {
        await db.execute(
          sql\`INSERT INTO squares (business_id, area_id, code, name, name_en, description, is_active)
               VALUES (\${businessId}, \${areaId}, \${square.code}, \${square.name}, \${square.nameEn}, \${square.description || null}, \${square.isActive ?? true})
               ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en\`
        );
      }
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.squares.length} squares\`);

    // إنشاء الكبائن
    for (const cabinet of SEED_DATA.cabinets) {
      const [square] = await db.execute(
        sql\`SELECT id FROM squares WHERE business_id = \${businessId} AND code = \${cabinet.squareCode}\`
      );
      const squareId = (square.rows as any[])[0]?.id;
      
      if (squareId) {
        await db.execute(
          sql\`INSERT INTO cabinets (business_id, square_id, code, name, name_en, cabinet_type, is_active)
               VALUES (\${businessId}, \${squareId}, \${cabinet.code}, \${cabinet.name}, \${cabinet.nameEn}, \${cabinet.cabinetType}, \${cabinet.isActive ?? true})
               ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en\`
        );
      }
    }
    logger.info(\`[Seed] ✅ Created \${SEED_DATA.cabinets.length} cabinets\`);

    logger.info("[Seed] ✅ Database seed completed successfully!");
    return { success: true };

  } catch (error: any) {
    logger.error("[Seed] Database seed failed", { error: error.message });
    return { success: false, error: error.message };
  }
}

// تشغيل عند استدعاء الملف مباشرة
if (import.meta.url === \`file://\${process.argv[1]}\` || process.argv[1]?.endsWith('seed-from-db.ts')) {
  const businessId = parseInt(process.argv[2]) || 1;
  seedFromDatabase(businessId)
    .then((result) => {
      if (result.success) {
        console.log("\\n✅ تم إنشاء البيانات بنجاح!\\n");
        process.exit(0);
      } else {
        console.error("\\n❌ فشل إنشاء البيانات!\\n");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\\n❌ خطأ:", error);
      process.exit(1);
    });
}
`;

    fs.writeFileSync(seedFilePath, seedFileContent, "utf-8");

    logger.info("[Export] ✅ Database export completed successfully!");
    console.log("\n===========================================");
    console.log("✅ تم تصدير البيانات من قاعدة البيانات بنجاح!");
    console.log("===========================================");
    console.log(`📁 الملف: ${seedFilePath}`);
    console.log("\n📊 البيانات المصدرة:");
    console.log(`   • ${seedData.itemCategories.length} فئة أصناف`);
    console.log(`   • ${seedData.items.length} صنف`);
    console.log(`   • ${seedData.tariffs.length} تعرفة`);
    console.log(`   • ${seedData.feeTypes.length} نوع رسوم`);
    console.log(`   • ${seedData.paymentMethods.length} طريقة دفع`);
    console.log(`   • ${seedData.defectiveComponents.length} قطعة معيبة`);
    console.log(`   • ${seedData.areas.length} منطقة`);
    console.log(`   • ${seedData.squares.length} مربع`);
    console.log(`   • ${seedData.cabinets.length} كابينة`);
    console.log("===========================================\n");

    return { success: true, filePath: seedFilePath };

  } catch (error: any) {
    logger.error("[Export] Database export failed", { error: error.message });
    console.error("\n❌ خطأ في تصدير البيانات:", error);
    return { success: false, error: error.message };
  }
}

// تشغيل عند استدعاء الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('export-db-to-seed-simple.ts')) {
  const businessId = parseInt(process.argv[2]) || 1;
  exportDatabaseToSeed(businessId)
    .then((result) => {
      if (result.success) {
        console.log("\n✅ تم تصدير البيانات بنجاح!\n");
        process.exit(0);
      } else {
        console.error("\n❌ فشل تصدير البيانات!\n");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n❌ خطأ:", error);
      process.exit(1);
    });
}


