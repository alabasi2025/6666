/**
 * سكريبت لإضافة بيانات تجريبية لقواعد التسعير
 * Script to add demo pricing rules
 */

import { getDb } from "../server/db";
import { pricingRules } from "../drizzle/schemas/pricing";
import { eq, and } from "drizzle-orm";
import { logger } from "../server/utils/logger";

const DEMO_RULES = [
  {
    businessId: 1,
    meterType: "sts" as const,
    usageType: "residential" as const,
    subscriptionFee: 50,
    depositAmount: 0,
    depositRequired: false,
    active: true,
    notes: "STS سكني - بدون تأمين",
    createdBy: 1,
  },
  {
    businessId: 1,
    meterType: "traditional" as const,
    usageType: "residential" as const,
    subscriptionFee: 30,
    depositAmount: 500,
    depositRequired: true,
    active: true,
    notes: "تقليدي سكني - مع تأمين",
    createdBy: 1,
  },
  {
    businessId: 1,
    meterType: "sts" as const,
    usageType: "commercial" as const,
    subscriptionFee: 100,
    depositAmount: 0,
    depositRequired: false,
    active: true,
    notes: "STS تجاري - بدون تأمين",
    createdBy: 1,
  },
  {
    businessId: 1,
    meterType: "traditional" as const,
    usageType: "commercial" as const,
    subscriptionFee: 80,
    depositAmount: 1000,
    depositRequired: true,
    active: true,
    notes: "تقليدي تجاري - مع تأمين",
    createdBy: 1,
  },
  {
    businessId: 1,
    meterType: "iot" as const,
    usageType: "residential" as const,
    subscriptionFee: 75,
    depositAmount: 0,
    depositRequired: false,
    active: true,
    notes: "IoT سكني - بدون تأمين",
    createdBy: 1,
  },
];

export async function addDemoPricingRules() {
  const db = await getDb();
  if (!db) {
    throw new Error("قاعدة البيانات غير متاحة");
  }

  try {
    let added = 0;
    let skipped = 0;

    for (const rule of DEMO_RULES) {
      // التحقق من وجود قاعدة مشابهة
      const existing = await db
        .select()
        .from(pricingRules)
        .where(
          eq(pricingRules.businessId, rule.businessId)
        )
        .limit(1);
      
      const matching = existing.find(
        (r) => r.meterType === rule.meterType && r.usageType === rule.usageType
      );

      if (matching) {
        skipped++;
        logger.info(`تم تخطي القاعدة: ${rule.meterType} - ${rule.usageType}`);
        continue;
      }

      await db.insert(pricingRules).values(rule);
      added++;
      logger.info(`تم إضافة قاعدة: ${rule.meterType} - ${rule.usageType}`);
    }

    return {
      success: true,
      added,
      skipped,
    };
  } catch (error: any) {
    logger.error(`خطأ في إضافة قواعد التسعير: ${error.message}`);
    throw error;
  }
}

// تشغيل السكريبت مباشرة
if (require.main === module) {
  addDemoPricingRules()
    .then((result) => {
      console.log("\n=== نتائج إضافة قواعد التسعير ===");
      console.log(`تم إضافة: ${result.added} قاعدة`);
      console.log(`تم تخطي: ${result.skipped} قاعدة`);
      console.log(`\nالحالة: ${result.success ? "✓ نجح" : "✗ فشل"}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("خطأ:", error);
      process.exit(1);
    });
}

