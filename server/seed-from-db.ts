/**
 * ملف Seed من قاعدة البيانات
 * تم إنشاؤه تلقائياً من البيانات الموجودة في قاعدة البيانات
 * Generated automatically from database data
 * 
 * تاريخ الإنشاء: 2026-01-07T01:25:23.133Z
 */

import { getDb } from "./db";
import { logger } from "./utils/logger";
import { sql } from "drizzle-orm";

const SEED_DATA = {
  "itemCategories": [],
  "items": [],
  "tariffs": [],
  "feeTypes": [],
  "paymentMethods": [],
  "defectiveComponents": [],
  "areas": [],
  "squares": [],
  "cabinets": []
};

export async function seedFromDatabase(businessId: number = 1) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    logger.info("[Seed] Starting seed from database export...");

    // إنشاء فئات الأصناف
    for (const category of SEED_DATA.itemCategories) {
      await db.execute(
        sql`INSERT INTO item_categories (business_id, code, name_ar, name_en, parent_id, is_active)
             VALUES (${businessId}, ${category.code}, ${category.nameAr}, ${category.nameEn}, ${category.parentId}, ${category.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en`
      );
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.itemCategories.length} item categories`);

    // إنشاء الأصناف
    for (const item of SEED_DATA.items) {
      const [category] = await db.execute(
        sql`SELECT id FROM item_categories WHERE business_id = ${businessId} AND code = ${item.categoryCode}`
      );
      const categoryId = (category.rows as any[])[0]?.id;
      
      if (categoryId) {
        await db.execute(
          sql`INSERT INTO items (business_id, category_id, code, name_ar, name_en, type, unit,
                                  standard_cost, min_stock, reorder_point, specifications, is_active)
               VALUES (${businessId}, ${categoryId}, ${item.code}, ${item.nameAr}, ${item.nameEn}, ${item.type}, ${item.unit},
                       ${item.standardCost}, ${item.minStock}, ${item.reorderPoint}, ${JSON.stringify(item.specifications)}, true)
               ON CONFLICT (business_id, code) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en`
        );
      }
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.items.length} items`);

    // إنشاء التعرفات
    for (const tariff of SEED_DATA.tariffs) {
      await db.execute(
        sql`INSERT INTO tariffs (business_id, code, name, name_en, tariff_type, service_type,
                                slabs, fixed_charge, description, is_active)
             VALUES (${businessId}, ${tariff.code}, ${tariff.name}, ${tariff.nameEn}, ${tariff.tariffType}, ${tariff.serviceType},
                     ${JSON.stringify(tariff.slabs)}, ${tariff.fixedCharge}, ${tariff.description || null}, ${tariff.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en`
      );
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.tariffs.length} tariffs`);

    // إنشاء أنواع الرسوم
    for (const feeType of SEED_DATA.feeTypes) {
      await db.execute(
        sql`INSERT INTO fee_types (business_id, code, name, name_en, fee_type, amount,
                                    is_recurring, description, is_active)
             VALUES (${businessId}, ${feeType.code}, ${feeType.name}, ${feeType.nameEn}, ${feeType.feeType}, ${feeType.amount},
                     ${feeType.isRecurring}, ${feeType.description || null}, ${feeType.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en`
      );
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.feeTypes.length} fee types`);

    // إنشاء طرق الدفع
    for (const paymentMethod of SEED_DATA.paymentMethods) {
      await db.execute(
        sql`INSERT INTO payment_methods_new (business_id, code, name, name_en, method_type, is_active)
             VALUES (${businessId}, ${paymentMethod.code}, ${paymentMethod.name}, ${paymentMethod.nameEn}, ${paymentMethod.methodType}, ${paymentMethod.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en`
      );
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.paymentMethods.length} payment methods`);

    // إنشاء القطع المعيبة
    for (const component of SEED_DATA.defectiveComponents) {
      await db.execute(
        sql`INSERT INTO defective_components (business_id, component_type, serial_number,
                                               defect_reason, defect_category, severity,
                                               assessment_status, disposition, reported_by)
             VALUES (${businessId}, ${component.componentType}, ${component.serialNumber}, ${component.defectReason},
                     ${component.defectCategory}, ${component.severity}, ${component.assessmentStatus},
                     ${component.disposition}, 1)
             ON CONFLICT DO NOTHING`
      );
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.defectiveComponents.length} defective components`);

    // إنشاء المناطق
    for (const area of SEED_DATA.areas) {
      await db.execute(
        sql`INSERT INTO areas (business_id, code, name, name_en, description, address, is_active)
             VALUES (${businessId}, ${area.code}, ${area.name}, ${area.nameEn}, ${area.description || null}, ${area.address || null}, ${area.isActive ?? true})
             ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en`
      );
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.areas.length} areas`);

    // إنشاء المربعات
    for (const square of SEED_DATA.squares) {
      const [area] = await db.execute(
        sql`SELECT id FROM areas WHERE business_id = ${businessId} AND code = ${square.areaCode}`
      );
      const areaId = (area.rows as any[])[0]?.id;
      
      if (areaId) {
        await db.execute(
          sql`INSERT INTO squares (business_id, area_id, code, name, name_en, description, is_active)
               VALUES (${businessId}, ${areaId}, ${square.code}, ${square.name}, ${square.nameEn}, ${square.description || null}, ${square.isActive ?? true})
               ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en`
        );
      }
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.squares.length} squares`);

    // إنشاء الكبائن
    for (const cabinet of SEED_DATA.cabinets) {
      const [square] = await db.execute(
        sql`SELECT id FROM squares WHERE business_id = ${businessId} AND code = ${cabinet.squareCode}`
      );
      const squareId = (square.rows as any[])[0]?.id;
      
      if (squareId) {
        await db.execute(
          sql`INSERT INTO cabinets (business_id, square_id, code, name, name_en, cabinet_type, is_active)
               VALUES (${businessId}, ${squareId}, ${cabinet.code}, ${cabinet.name}, ${cabinet.nameEn}, ${cabinet.cabinetType}, ${cabinet.isActive ?? true})
               ON CONFLICT (business_id, code) DO UPDATE SET name = EXCLUDED.name, name_en = EXCLUDED.name_en`
        );
      }
    }
    logger.info(`[Seed] ✅ Created ${SEED_DATA.cabinets.length} cabinets`);

    logger.info("[Seed] ✅ Database seed completed successfully!");
    return { success: true };

  } catch (error: any) {
    logger.error("[Seed] Database seed failed", { error: error.message });
    return { success: false, error: error.message };
  }
}

// تشغيل عند استدعاء الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed-from-db.ts')) {
  const businessId = parseInt(process.argv[2]) || 1;
  seedFromDatabase(businessId)
    .then((result) => {
      if (result.success) {
        console.log("\n✅ تم إنشاء البيانات بنجاح!\n");
        process.exit(0);
      } else {
        console.error("\n❌ فشل إنشاء البيانات!\n");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n❌ خطأ:", error);
      process.exit(1);
    });
}
