/**
 * النظام المخصص v2.2.0 - Exchange Rates Router
 * إدارة أسعار الصرف بين العملات
 */

import { Router } from "express";
import { db } from "../../../db";
import {
  customExchangeRates,
  customCurrencies,
  type InsertCustomExchangeRate,
} from "../../../../drizzle/schemas/customSystemV2";
import { eq, and, desc, lte, gte, or, isNull, sql } from "drizzle-orm";

const router = Router();

/**
 * GET /api/custom-system/v2/exchange-rates
 * الحصول على جميع أسعار الصرف
 */
router.get("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { activeOnly } = req.query;

    let query = db
      .select()
      .from(customExchangeRates)
      .where(eq(customExchangeRates.businessId, businessId));

    if (activeOnly === "true") {
      query = query.where(eq(customExchangeRates.isActive, true));
    }

    const rates = await query.orderBy(desc(customExchangeRates.effectiveDate));

    res.json(rates);
  } catch (error) {
    console.error("خطأ في جلب أسعار الصرف:", error);
    res.status(500).json({ error: "فشل في جلب أسعار الصرف" });
  }
});

/**
 * GET /api/custom-system/v2/exchange-rates/current
 * الحصول على أسعار الصرف الحالية (السارية اليوم)
 */
router.get("/current", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const today = new Date().toISOString().split("T")[0];

    const rates = await db
      .select()
      .from(customExchangeRates)
      .where(
        and(
          eq(customExchangeRates.businessId, businessId),
          eq(customExchangeRates.isActive, true),
          lte(customExchangeRates.effectiveDate, today),
          or(
            isNull(customExchangeRates.expiryDate),
            gte(customExchangeRates.expiryDate, today)
          )
        )
      )
      .orderBy(desc(customExchangeRates.effectiveDate));

    res.json(rates);
  } catch (error) {
    console.error("خطأ في جلب أسعار الصرف الحالية:", error);
    res.status(500).json({ error: "فشل في جلب أسعار الصرف الحالية" });
  }
});

/**
 * GET /api/custom-system/v2/exchange-rates/rate
 * الحصول على سعر الصرف بين عملتين في تاريخ محدد
 */
router.get("/rate", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { fromCurrencyId, toCurrencyId, date } = req.query;

    if (!fromCurrencyId || !toCurrencyId) {
      return res.status(400).json({ error: "معرفات العملات مطلوبة" });
    }

    const targetDate = date ? String(date) : new Date().toISOString().split("T")[0];

    // إذا كانت العملتان متطابقتان، السعر = 1
    if (fromCurrencyId === toCurrencyId) {
      return res.json({ rate: 1.0, date: targetDate });
    }

    // البحث عن سعر الصرف المباشر
    const [directRate] = await db
      .select()
      .from(customExchangeRates)
      .where(
        and(
          eq(customExchangeRates.businessId, businessId),
          eq(customExchangeRates.fromCurrencyId, parseInt(String(fromCurrencyId))),
          eq(customExchangeRates.toCurrencyId, parseInt(String(toCurrencyId))),
          eq(customExchangeRates.isActive, true),
          lte(customExchangeRates.effectiveDate, targetDate),
          or(
            isNull(customExchangeRates.expiryDate),
            gte(customExchangeRates.expiryDate, targetDate)
          )
        )
      )
      .orderBy(desc(customExchangeRates.effectiveDate))
      .limit(1);

    if (directRate) {
      return res.json({
        rate: parseFloat(directRate.rate),
        date: targetDate,
        effectiveDate: directRate.effectiveDate,
        source: directRate.source,
      });
    }

    // البحث عن سعر الصرف العكسي
    const [reverseRate] = await db
      .select()
      .from(customExchangeRates)
      .where(
        and(
          eq(customExchangeRates.businessId, businessId),
          eq(customExchangeRates.fromCurrencyId, parseInt(String(toCurrencyId))),
          eq(customExchangeRates.toCurrencyId, parseInt(String(fromCurrencyId))),
          eq(customExchangeRates.isActive, true),
          lte(customExchangeRates.effectiveDate, targetDate),
          or(
            isNull(customExchangeRates.expiryDate),
            gte(customExchangeRates.expiryDate, targetDate)
          )
        )
      )
      .orderBy(desc(customExchangeRates.effectiveDate))
      .limit(1);

    if (reverseRate) {
      const rate = 1 / parseFloat(reverseRate.rate);
      return res.json({
        rate: rate,
        date: targetDate,
        effectiveDate: reverseRate.effectiveDate,
        source: reverseRate.source,
        isReverse: true,
      });
    }

    // لم يتم العثور على سعر صرف
    return res.status(404).json({ error: "سعر الصرف غير متوفر" });
  } catch (error) {
    console.error("خطأ في جلب سعر الصرف:", error);
    res.status(500).json({ error: "فشل في جلب سعر الصرف" });
  }
});

/**
 * GET /api/custom-system/v2/exchange-rates/:id
 * الحصول على سعر صرف محدد
 */
router.get("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const rateId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(rateId)) {
      return res.status(400).json({ error: "معرف سعر الصرف غير صحيح" });
    }

    const [rate] = await db
      .select()
      .from(customExchangeRates)
      .where(
        and(
          eq(customExchangeRates.id, rateId),
          eq(customExchangeRates.businessId, businessId)
        )
      )
      .limit(1);

    if (!rate) {
      return res.status(404).json({ error: "سعر الصرف غير موجود" });
    }

    res.json(rate);
  } catch (error) {
    console.error("خطأ في جلب سعر الصرف:", error);
    res.status(500).json({ error: "فشل في جلب سعر الصرف" });
  }
});

/**
 * POST /api/custom-system/v2/exchange-rates
 * إنشاء سعر صرف جديد
 */
router.post("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      fromCurrencyId,
      toCurrencyId,
      rate,
      effectiveDate,
      expiryDate,
      source,
      isActive,
      notes,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!fromCurrencyId || !toCurrencyId || !rate || !effectiveDate) {
      return res.status(400).json({
        error: "العملة المصدر، العملة الهدف، السعر، وتاريخ السريان مطلوبة",
      });
    }

    // التحقق من أن العملتين مختلفتان
    if (fromCurrencyId === toCurrencyId) {
      return res.status(400).json({ error: "لا يمكن تحويل العملة إلى نفسها" });
    }

    // التحقق من وجود العملات
    const [fromCurrency] = await db
      .select()
      .from(customCurrencies)
      .where(
        and(
          eq(customCurrencies.id, fromCurrencyId),
          eq(customCurrencies.businessId, businessId)
        )
      )
      .limit(1);

    const [toCurrency] = await db
      .select()
      .from(customCurrencies)
      .where(
        and(
          eq(customCurrencies.id, toCurrencyId),
          eq(customCurrencies.businessId, businessId)
        )
      )
      .limit(1);

    if (!fromCurrency || !toCurrency) {
      return res.status(404).json({ error: "إحدى العملات غير موجودة" });
    }

    const newRate: InsertCustomExchangeRate = {
      businessId,
      fromCurrencyId,
      toCurrencyId,
      rate: String(rate),
      effectiveDate,
      expiryDate: expiryDate || null,
      source: source || null,
      isActive: isActive !== undefined ? isActive : true,
      notes: notes || null,
      createdBy: userId,
    };

    const [result] = await db.insert(customExchangeRates).values(newRate);

    const [created] = await db
      .select()
      .from(customExchangeRates)
      .where(eq(customExchangeRates.id, result.insertId))
      .limit(1);

    res.status(201).json(created);
  } catch (error) {
    console.error("خطأ في إنشاء سعر الصرف:", error);
    res.status(500).json({ error: "فشل في إنشاء سعر الصرف" });
  }
});

/**
 * PUT /api/custom-system/v2/exchange-rates/:id
 * تحديث سعر صرف
 */
router.put("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const rateId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(rateId)) {
      return res.status(400).json({ error: "معرف سعر الصرف غير صحيح" });
    }

    // التحقق من وجود سعر الصرف
    const [existing] = await db
      .select()
      .from(customExchangeRates)
      .where(
        and(
          eq(customExchangeRates.id, rateId),
          eq(customExchangeRates.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "سعر الصرف غير موجود" });
    }

    const {
      rate,
      effectiveDate,
      expiryDate,
      source,
      isActive,
      notes,
    } = req.body;

    const updateData: Partial<InsertCustomExchangeRate> = {};
    if (rate !== undefined) updateData.rate = String(rate);
    if (effectiveDate) updateData.effectiveDate = effectiveDate;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate || null;
    if (source !== undefined) updateData.source = source || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (notes !== undefined) updateData.notes = notes || null;

    await db
      .update(customExchangeRates)
      .set(updateData)
      .where(
        and(
          eq(customExchangeRates.id, rateId),
          eq(customExchangeRates.businessId, businessId)
        )
      );

    const [updated] = await db
      .select()
      .from(customExchangeRates)
      .where(eq(customExchangeRates.id, rateId))
      .limit(1);

    res.json(updated);
  } catch (error) {
    console.error("خطأ في تحديث سعر الصرف:", error);
    res.status(500).json({ error: "فشل في تحديث سعر الصرف" });
  }
});

/**
 * DELETE /api/custom-system/v2/exchange-rates/:id
 * حذف سعر صرف
 */
router.delete("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const rateId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(rateId)) {
      return res.status(400).json({ error: "معرف سعر الصرف غير صحيح" });
    }

    // التحقق من وجود سعر الصرف
    const [existing] = await db
      .select()
      .from(customExchangeRates)
      .where(
        and(
          eq(customExchangeRates.id, rateId),
          eq(customExchangeRates.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "سعر الصرف غير موجود" });
    }

    await db
      .delete(customExchangeRates)
      .where(
        and(
          eq(customExchangeRates.id, rateId),
          eq(customExchangeRates.businessId, businessId)
        )
      );

    res.json({ message: "تم حذف سعر الصرف بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف سعر الصرف:", error);
    res.status(500).json({ error: "فشل في حذف سعر الصرف" });
  }
});

export default router;
