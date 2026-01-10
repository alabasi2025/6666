// server/utils/consumption-calculator.ts
// حاسبة الاستهلاك التلقائية المحسنة

import { getDb } from "../db";
import { tariffs, metersEnhanced, customersEnhanced, billingPeriods, meterReadingsEnhanced } from "../../drizzle/schema";
import { eq, and, gte, lte, asc, desc, sql } from "drizzle-orm";
import { logger } from "./logger";

export interface ConsumptionCalculationResult {
  consumption: number;
  consumptionAmount: number;
  breakdown: Array<{
    tier: string;
    units: number;
    rate: number;
    amount: number;
  }>;
  baseCharge: number;
  totalBeforeFees: number;
  warnings: string[];
}

export interface TariffTier {
  fromUnit: number;
  toUnit: number;
  pricePerUnit: number;
  tierName?: string;
}

/**
 * حساب الاستهلاك التلقائي المحسن
 * يدعم التعريفات المتعددة (Tiers) والتعريفات التراكمية
 */
export async function calculateConsumption(
  meterId: number,
  consumption: number,
  options?: {
    billingPeriodId?: number;
    useCumulative?: boolean;
    includeHistory?: boolean;
  }
): Promise<ConsumptionCalculationResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const warnings: string[] = [];
  let consumptionAmount = 0;
  const breakdown: Array<{
    tier: string;
    units: number;
    rate: number;
    amount: number;
  }> = [];

  // الحصول على معلومات العداد والعميل
  const [meter] = await db.select({
    id: metersEnhanced.id,
    customerId: metersEnhanced.customerId,
    serviceType: metersEnhanced.serviceType,
    tariffId: metersEnhanced.tariffId,
    businessId: metersEnhanced.businessId,
  })
  .from(metersEnhanced)
  .where(eq(metersEnhanced.id, meterId));

  if (!meter || !meter.customerId) {
    throw new Error("العداد أو العميل غير موجود");
  }

  // الحصول على فئة العميل
  const [customer] = await db.select({
    category: customersEnhanced.category,
  })
  .from(customersEnhanced)
  .where(eq(customersEnhanced.id, meter.customerId));

  const customerCategory = customer?.category || "residential";

  // الحصول على التعرفة
  let applicableTariffs: TariffTier[] = [];

  if (meter.tariffId) {
    // استخدام التعرفة المخصصة للعداد
    const [customTariff] = await db.select({
      id: tariffs.id,
      fromUnit: tariffs.fromUnit,
      toUnit: tariffs.toUnit,
      pricePerUnit: tariffs.pricePerUnit,
    })
    .from(tariffs)
    .where(and(
      eq(tariffs.id, meter.tariffId),
      eq(tariffs.isActive, true)
    ));

    if (customTariff) {
      applicableTariffs = [{
        fromUnit: parseFloat(customTariff.fromUnit?.toString() || "0"),
        toUnit: parseFloat(customTariff.toUnit?.toString() || "999999"),
        pricePerUnit: parseFloat(customTariff.pricePerUnit?.toString() || "0"),
        tierName: "مخصص",
      }];
    }
  }

  // إذا لم توجد تعرفة مخصصة، البحث عن التعرفة العامة
  if (applicableTariffs.length === 0) {
    const generalTariffs = await db.select({
      id: tariffs.id,
      fromUnit: tariffs.fromUnit,
      toUnit: tariffs.toUnit,
      pricePerUnit: tariffs.pricePerUnit,
    })
    .from(tariffs)
    .where(and(
      eq(tariffs.serviceType, meter.serviceType || "electricity"),
      eq(tariffs.customerCategory, customerCategory),
      eq(tariffs.isActive, true)
    ))
    .orderBy(tariffs.fromUnit);

    applicableTariffs = generalTariffs.map(t => ({
      fromUnit: parseFloat(t.fromUnit?.toString() || "0"),
      toUnit: parseFloat(t.toUnit?.toString() || "999999"),
      pricePerUnit: parseFloat(t.pricePerUnit?.toString() || "0"),
      tierName: `${t.fromUnit}-${t.toUnit}`,
    }));
  }

  // إذا لم توجد تعرفة، استخدام سعر افتراضي
  if (applicableTariffs.length === 0) {
    warnings.push("لم يتم العثور على تعرفة مناسبة، سيتم استخدام السعر الافتراضي");
    applicableTariffs = [{
      fromUnit: 0,
      toUnit: 999999,
      pricePerUnit: 0.18, // سعر افتراضي
      tierName: "افتراضي",
    }];
  }

  // حساب الاستهلاك حسب التعرفة التراكمية
  let remainingConsumption = consumption;
  let cumulativeConsumption = 0;

  // ✅ إذا كان الاستهلاك التراكمي مفعّل، حساب الاستهلاك التراكمي من بداية السنة
  if (options?.useCumulative && options?.billingPeriodId) {
    cumulativeConsumption = await getCumulativeConsumption(meterId, options.billingPeriodId);
  }

  // تطبيق التعرفة التراكمية
  for (const tariff of applicableTariffs) {
    if (remainingConsumption <= 0) break;

    const tierStart = Math.max(tariff.fromUnit, cumulativeConsumption);
    const tierEnd = tariff.toUnit;
    const tierCapacity = tierEnd - tierStart + 1;

    if (tierStart > tierEnd) continue;

    const unitsInTier = Math.min(remainingConsumption, tierCapacity);
    const tierAmount = unitsInTier * tariff.pricePerUnit;

    consumptionAmount += tierAmount;

    breakdown.push({
      tier: tariff.tierName || `${tariff.fromUnit}-${tariff.toUnit}`,
      units: unitsInTier,
      rate: tariff.pricePerUnit,
      amount: tierAmount,
    });

    remainingConsumption -= unitsInTier;
    cumulativeConsumption += unitsInTier;
  }

  // إذا بقي استهلاك غير محسوب، استخدام آخر سعر
  if (remainingConsumption > 0 && applicableTariffs.length > 0) {
    const lastTariff = applicableTariffs[applicableTariffs.length - 1];
    const remainingAmount = remainingConsumption * lastTariff.pricePerUnit;
    consumptionAmount += remainingAmount;

    breakdown.push({
      tier: `${lastTariff.tierName || "إضافي"}`,
      units: remainingConsumption,
      rate: lastTariff.pricePerUnit,
      amount: remainingAmount,
    });

    warnings.push(`تم استخدام آخر سعر للاستهلاك المتبقي (${remainingConsumption} وحدة)`);
  }

  // ✅ حساب الرسوم الأساسية - جلب من التعرفة
  let baseCharge = 0;
  if (meter.tariffId) {
    try {
      const [tariff] = await db
        .select({ fixedCharge: tariffs.fixedCharge })
        .from(tariffs)
        .where(eq(tariffs.id, meter.tariffId))
        .limit(1);
      
      if (tariff && tariff.fixedCharge) {
        baseCharge = parseFloat(tariff.fixedCharge.toString());
      }
    } catch (err) {
      // نستخدم 0 كقيمة افتراضية
    }
  }

  // التحقق من الاستهلاك غير الطبيعي
  if (consumption === 0) {
    warnings.push("الاستهلاك صفر - يرجى التحقق من القراءة");
  } else if (consumption > 10000) {
    warnings.push(`الاستهلاك عالي جداً (${consumption} كيلوواط) - يرجى التحقق`);
  }

  return {
    consumption,
    consumptionAmount,
    breakdown,
    baseCharge,
    totalBeforeFees: consumptionAmount + baseCharge,
    warnings,
  };
}

/**
 * حساب الاستهلاك التراكمي من بداية السنة
 */
export async function getCumulativeConsumption(
  meterId: number,
  currentBillingPeriodId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // ✅ تنفيذ حساب الاستهلاك التراكمي
  // جلب جميع القراءات من بداية السنة حتى الفترة الحالية
  try {
    // جلب معلومات الفترة الحالية
    const [billingPeriod] = await db
      .select({ 
        startDate: billingPeriods.startDate,
        year: sql<number>`EXTRACT(YEAR FROM ${billingPeriods.startDate})`,
      })
      .from(billingPeriods)
      .where(eq(billingPeriods.id, currentBillingPeriodId))
      .limit(1);

    if (!billingPeriod) {
      return 0;
    }

    const yearStart = new Date(`${billingPeriod.year}-01-01`);
    
    // جلب جميع القراءات من بداية السنة حتى الفترة الحالية
    const readings = await db
      .select({
        consumption: meterReadingsEnhanced.consumption,
      })
      .from(meterReadingsEnhanced)
      .where(and(
        eq(meterReadingsEnhanced.meterId, meterId),
        sql`${meterReadingsEnhanced.readingDate} >= ${yearStart}`,
        sql`${meterReadingsEnhanced.billingPeriodId} <= ${currentBillingPeriodId}`,
        sql`${meterReadingsEnhanced.isApproved} = true`
      ))
      .orderBy(asc(meterReadingsEnhanced.readingDate));

    // جمع الاستهلاك
    const totalConsumption = readings.reduce((sum, reading) => {
      const consumption = parseFloat(reading.consumption?.toString() || "0");
      return sum + consumption;
    }, 0);

    return totalConsumption;
  } catch (error: any) {
    logger.error('Failed to calculate cumulative consumption', {
      meterId,
      billingPeriodId: currentBillingPeriodId,
      error: error.message,
    });
    return 0;
  }
}

/**
 * حساب متوسط الاستهلاك من آخر N قراءات
 */
export async function getAverageConsumption(
  meterId: number,
  numberOfReadings: number = 3
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // ✅ تنفيذ حساب المتوسط
  // جلب آخر N قراءات وحساب المتوسط
  try {
    const readings = await db
      .select({
        consumption: meterReadingsEnhanced.consumption,
      })
      .from(meterReadingsEnhanced)
      .where(and(
        eq(meterReadingsEnhanced.meterId, meterId),
        sql`${meterReadingsEnhanced.isApproved} = true`
      ))
      .orderBy(desc(meterReadingsEnhanced.readingDate))
      .limit(numberOfReadings);

    if (readings.length === 0) {
      return 0;
    }

    // حساب المتوسط
    const totalConsumption = readings.reduce((sum, reading) => {
      const consumption = parseFloat(reading.consumption?.toString() || "0");
      return sum + consumption;
    }, 0);

    return totalConsumption / readings.length;
  } catch (error: any) {
    logger.error('Failed to calculate average consumption', {
      meterId,
      numberOfReadings,
      error: error.message,
    });
    return 0;
  }
}

