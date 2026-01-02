/**
 * النظام المخصص v2.2.0 - Currencies Router
 * إدارة العملات في النظام المخصص
 */

import { Router } from "express";
import { db } from "../../../db";
import {
  customCurrencies,
  customExchangeRates,
  type InsertCustomCurrency,
  type InsertCustomExchangeRate,
} from "../../../../drizzle/schemas/customSystemV2";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

const parsePositiveDecimalOrNull = (value: unknown) => {
  // undefined => not provided (useful for PUT)
  if (value === undefined) return undefined;
  // null/"" => explicit null
  if (value === null || value === "") return null;

  const num = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(num)) return { error: "قيمة غير صحيحة" } as const;
  if (num <= 0) return { error: "يجب أن تكون القيمة أكبر من صفر" } as const;

  return String(num);
};

const validateRateRange = ({
  currentRate,
  minRate,
  maxRate,
}: {
  currentRate: string | null;
  minRate: string | null;
  maxRate: string | null;
}) => {
  const toNum = (v: string | null) => (v === null ? null : Number(v));

  const c = toNum(currentRate);
  const min = toNum(minRate);
  const max = toNum(maxRate);

  if (min !== null && max !== null && min > max) {
    return "الحد الأدنى لا يمكن أن يكون أكبر من الحد الأعلى";
  }
  if (c !== null && min !== null && c < min) {
    return "السعر الحالي أقل من الحد الأدنى";
  }
  if (c !== null && max !== null && c > max) {
    return "السعر الحالي أعلى من الحد الأعلى";
  }
  return null;
};

/**
 * GET /api/custom-system/v2/currencies
 * الحصول على جميع العملات
 */
router.get("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const currencies = await db
      .select()
      .from(customCurrencies)
      .where(eq(customCurrencies.businessId, businessId))
      .orderBy(customCurrencies.displayOrder, customCurrencies.nameAr);

    res.json(currencies);
  } catch (error) {
    console.error("خطأ في جلب العملات:", error);
    res.status(500).json({ error: "فشل في جلب العملات" });
  }
});

/**
 * GET /api/custom-system/v2/currencies/active
 * الحصول على العملات النشطة فقط
 */
router.get("/active", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const currencies = await db
      .select()
      .from(customCurrencies)
      .where(
        and(
          eq(customCurrencies.businessId, businessId),
          eq(customCurrencies.isActive, true)
        )
      )
      .orderBy(customCurrencies.displayOrder, customCurrencies.nameAr);

    res.json(currencies);
  } catch (error) {
    console.error("خطأ في جلب العملات النشطة:", error);
    res.status(500).json({ error: "فشل في جلب العملات النشطة" });
  }
});

/**
 * GET /api/custom-system/v2/currencies/base
 * الحصول على العملة الأساسية
 */
router.get("/base", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const [baseCurrency] = await db
      .select()
      .from(customCurrencies)
      .where(
        and(
          eq(customCurrencies.businessId, businessId),
          eq(customCurrencies.isBaseCurrency, true)
        )
      )
      .limit(1);

    if (!baseCurrency) {
      return res.status(404).json({ error: "العملة الأساسية غير موجودة" });
    }

    res.json(baseCurrency);
  } catch (error) {
    console.error("خطأ في جلب العملة الأساسية:", error);
    res.status(500).json({ error: "فشل في جلب العملة الأساسية" });
  }
});

/**
 * GET /api/custom-system/v2/currencies/:id
 * الحصول على عملة محددة
 */
router.get("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const currencyId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(currencyId)) {
      return res.status(400).json({ error: "معرف العملة غير صحيح" });
    }

    const [currency] = await db
      .select()
      .from(customCurrencies)
      .where(
        and(
          eq(customCurrencies.id, currencyId),
          eq(customCurrencies.businessId, businessId)
        )
      )
      .limit(1);

    if (!currency) {
      return res.status(404).json({ error: "العملة غير موجودة" });
    }

    res.json(currency);
  } catch (error) {
    console.error("خطأ في جلب العملة:", error);
    res.status(500).json({ error: "فشل في جلب العملة" });
  }
});

/**
 * POST /api/custom-system/v2/currencies
 * إنشاء عملة جديدة
 */
router.post("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      code,
      nameAr,
      nameEn,
      symbol,
      isBaseCurrency,
      isActive,
      decimalPlaces,
      displayOrder,
      notes,
      currentRate,
      minRate,
      maxRate,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!code || !nameAr) {
      return res.status(400).json({ error: "الكود والاسم بالعربية مطلوبان" });
    }

    // Normalize & validate rates (مقابل العملة الأساسية)
    const normalizedCurrentRate = parsePositiveDecimalOrNull(currentRate);
    const normalizedMinRate = parsePositiveDecimalOrNull(minRate);
    const normalizedMaxRate = parsePositiveDecimalOrNull(maxRate);

    if ((normalizedCurrentRate as any)?.error) {
      return res.status(400).json({ error: `السعر الحالي: ${(normalizedCurrentRate as any).error}` });
    }
    if ((normalizedMinRate as any)?.error) {
      return res.status(400).json({ error: `الحد الأدنى: ${(normalizedMinRate as any).error}` });
    }
    if ((normalizedMaxRate as any)?.error) {
      return res.status(400).json({ error: `الحد الأعلى: ${(normalizedMaxRate as any).error}` });
    }

    // التحقق من عدم تكرار الكود
    const [existing] = await db
      .select()
      .from(customCurrencies)
      .where(
        and(
          eq(customCurrencies.businessId, businessId),
          eq(customCurrencies.code, code)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "كود العملة موجود مسبقاً" });
    }

    // إذا كانت عملة أساسية، إلغاء العملة الأساسية السابقة
    if (isBaseCurrency) {
      await db
        .update(customCurrencies)
        .set({ isBaseCurrency: false })
        .where(
          and(
            eq(customCurrencies.businessId, businessId),
            eq(customCurrencies.isBaseCurrency, true)
          )
        );
    }

    const willBeBaseCurrency = Boolean(isBaseCurrency);
    const finalCurrentRate = willBeBaseCurrency ? "1.000000" : (normalizedCurrentRate ?? null);
    const finalMinRate = willBeBaseCurrency ? "1.000000" : (normalizedMinRate ?? null);
    const finalMaxRate = willBeBaseCurrency ? "1.000000" : (normalizedMaxRate ?? null);

    const rangeError = validateRateRange({
      currentRate: finalCurrentRate,
      minRate: finalMinRate,
      maxRate: finalMaxRate,
    });
    if (rangeError) {
      return res.status(400).json({ error: rangeError });
    }

    const newCurrency: InsertCustomCurrency = {
      businessId,
      code: code.toUpperCase(),
      nameAr,
      nameEn: nameEn || null,
      symbol: symbol || null,
      isBaseCurrency: isBaseCurrency || false,
      isActive: isActive !== undefined ? isActive : true,
      decimalPlaces: decimalPlaces || 2,
      displayOrder: displayOrder || 0,
      notes: notes || null,
      currentRate: finalCurrentRate,
      minRate: finalMinRate,
      maxRate: finalMaxRate,
      createdBy: userId,
    };

    const [result] = await db.insert(customCurrencies).values(newCurrency);

    const [created] = await db
      .select()
      .from(customCurrencies)
      .where(eq(customCurrencies.id, result.insertId))
      .limit(1);

    res.status(201).json(created);
  } catch (error) {
    console.error("خطأ في إنشاء العملة:", error);
    res.status(500).json({ error: "فشل في إنشاء العملة" });
  }
});

/**
 * PUT /api/custom-system/v2/currencies/:id
 * تحديث عملة
 */
router.put("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const currencyId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(currencyId)) {
      return res.status(400).json({ error: "معرف العملة غير صحيح" });
    }

    // التحقق من وجود العملة
    const [existing] = await db
      .select()
      .from(customCurrencies)
      .where(
        and(
          eq(customCurrencies.id, currencyId),
          eq(customCurrencies.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "العملة غير موجودة" });
    }

    const {
      code,
      nameAr,
      nameEn,
      symbol,
      isBaseCurrency,
      isActive,
      decimalPlaces,
      displayOrder,
      notes,
      currentRate,
      minRate,
      maxRate,
    } = req.body;

    // التحقق من عدم تكرار الكود
    if (code && code !== existing.code) {
      const [duplicate] = await db
        .select()
        .from(customCurrencies)
        .where(
          and(
            eq(customCurrencies.businessId, businessId),
            eq(customCurrencies.code, code)
          )
        )
        .limit(1);

      if (duplicate) {
        return res.status(400).json({ error: "كود العملة موجود مسبقاً" });
      }
    }

    // إذا كانت عملة أساسية، إلغاء العملة الأساسية السابقة
    if (isBaseCurrency && !existing.isBaseCurrency) {
      await db
        .update(customCurrencies)
        .set({ isBaseCurrency: false })
        .where(
          and(
            eq(customCurrencies.businessId, businessId),
            eq(customCurrencies.isBaseCurrency, true)
          )
        );
    }

    const updateData: Partial<InsertCustomCurrency> = {};
    if (code) updateData.code = code.toUpperCase();
    if (nameAr) updateData.nameAr = nameAr;
    if (nameEn !== undefined) updateData.nameEn = nameEn || null;
    if (symbol !== undefined) updateData.symbol = symbol || null;
    if (isBaseCurrency !== undefined) updateData.isBaseCurrency = isBaseCurrency;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (decimalPlaces !== undefined) updateData.decimalPlaces = decimalPlaces;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (notes !== undefined) updateData.notes = notes || null;

    const normalizedCurrentRate = parsePositiveDecimalOrNull(currentRate);
    const normalizedMinRate = parsePositiveDecimalOrNull(minRate);
    const normalizedMaxRate = parsePositiveDecimalOrNull(maxRate);

    if ((normalizedCurrentRate as any)?.error) {
      return res.status(400).json({ error: `السعر الحالي: ${(normalizedCurrentRate as any).error}` });
    }
    if ((normalizedMinRate as any)?.error) {
      return res.status(400).json({ error: `الحد الأدنى: ${(normalizedMinRate as any).error}` });
    }
    if ((normalizedMaxRate as any)?.error) {
      return res.status(400).json({ error: `الحد الأعلى: ${(normalizedMaxRate as any).error}` });
    }

    if (normalizedCurrentRate !== undefined) updateData.currentRate = normalizedCurrentRate;
    if (normalizedMinRate !== undefined) updateData.minRate = normalizedMinRate;
    if (normalizedMaxRate !== undefined) updateData.maxRate = normalizedMaxRate;

    // Validate final state (existing + updates)
    const finalIsBase = isBaseCurrency !== undefined ? Boolean(isBaseCurrency) : Boolean(existing.isBaseCurrency);
    const finalCurrentRate =
      finalIsBase ? "1.000000" : (updateData.currentRate ?? existing.currentRate ?? null);
    const finalMinRate =
      finalIsBase ? "1.000000" : (updateData.minRate ?? existing.minRate ?? null);
    const finalMaxRate =
      finalIsBase ? "1.000000" : (updateData.maxRate ?? existing.maxRate ?? null);

    if (finalIsBase) {
      updateData.currentRate = "1.000000";
      updateData.minRate = "1.000000";
      updateData.maxRate = "1.000000";
    }

    const rangeError = validateRateRange({
      currentRate: finalCurrentRate,
      minRate: finalMinRate,
      maxRate: finalMaxRate,
    });
    if (rangeError) {
      return res.status(400).json({ error: rangeError });
    }

    await db
      .update(customCurrencies)
      .set(updateData)
      .where(
        and(
          eq(customCurrencies.id, currencyId),
          eq(customCurrencies.businessId, businessId)
        )
      );

    const [updated] = await db
      .select()
      .from(customCurrencies)
      .where(eq(customCurrencies.id, currencyId))
      .limit(1);

    res.json(updated);
  } catch (error) {
    console.error("خطأ في تحديث العملة:", error);
    res.status(500).json({ error: "فشل في تحديث العملة" });
  }
});

/**
 * DELETE /api/custom-system/v2/currencies/:id
 * حذف عملة
 */
router.delete("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const currencyId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(currencyId)) {
      return res.status(400).json({ error: "معرف العملة غير صحيح" });
    }

    // التحقق من وجود العملة
    const [existing] = await db
      .select()
      .from(customCurrencies)
      .where(
        and(
          eq(customCurrencies.id, currencyId),
          eq(customCurrencies.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "العملة غير موجودة" });
    }

    // منع حذف العملة الأساسية
    if (existing.isBaseCurrency) {
      return res.status(400).json({ error: "لا يمكن حذف العملة الأساسية" });
    }

    // TODO: التحقق من عدم استخدام العملة في أي حسابات أو معاملات

    await db
      .delete(customCurrencies)
      .where(
        and(
          eq(customCurrencies.id, currencyId),
          eq(customCurrencies.businessId, businessId)
        )
      );

    res.json({ message: "تم حذف العملة بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف العملة:", error);
    res.status(500).json({ error: "فشل في حذف العملة" });
  }
});

/**
 * GET /api/custom-system/v2/currencies/:id/exchange-rates
 * الحصول على أسعار الصرف لعملة محددة
 */
router.get("/:id/exchange-rates", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const currencyId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(currencyId)) {
      return res.status(400).json({ error: "معرف العملة غير صحيح" });
    }

    const rates = await db
      .select()
      .from(customExchangeRates)
      .where(
        and(
          eq(customExchangeRates.businessId, businessId),
          eq(customExchangeRates.fromCurrencyId, currencyId)
        )
      )
      .orderBy(desc(customExchangeRates.effectiveDate));

    res.json(rates);
  } catch (error) {
    console.error("خطأ في جلب أسعار الصرف:", error);
    res.status(500).json({ error: "فشل في جلب أسعار الصرف" });
  }
});

export default router;
