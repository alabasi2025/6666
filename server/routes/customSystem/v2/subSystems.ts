/**
 * النظام المخصص v2.2.0 - SubSystems Router
 * إدارة الأنظمة الفرعية مع دعم الحسابات الافتراضية
 */

import { Router } from "express";
import { db } from "../../../db";
import {
  customSubSystems,
  type InsertCustomSubSystem,
} from "../../../../drizzle/schema";
import { customAccounts } from "../../../../drizzle/schemas/customSystemV2";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

/**
 * GET /api/custom-system/v2/sub-systems
 * الحصول على جميع الأنظمة الفرعية
 */
router.get("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { isActive } = req.query;

    let query = db
      .select()
      .from(customSubSystems)
      .where(eq(customSubSystems.businessId, businessId));

    if (isActive !== undefined) {
      query = query.where(eq(customSubSystems.isActive, isActive === "true"));
    }

    const subSystems = await query.orderBy(customSubSystems.nameAr);

    res.json(subSystems);
  } catch (error) {
    console.error("خطأ في جلب الأنظمة الفرعية:", error);
    res.status(500).json({ error: "فشل في جلب الأنظمة الفرعية" });
  }
});

/**
 * GET /api/custom-system/v2/sub-systems/:id
 * الحصول على نظام فرعي محدد
 */
router.get("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const subSystemId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(subSystemId)) {
      return res.status(400).json({ error: "معرف النظام الفرعي غير صحيح" });
    }

    const [subSystem] = await db
      .select()
      .from(customSubSystems)
      .where(
        and(
          eq(customSubSystems.id, subSystemId),
          eq(customSubSystems.businessId, businessId)
        )
      )
      .limit(1);

    if (!subSystem) {
      return res.status(404).json({ error: "النظام الفرعي غير موجود" });
    }

    res.json(subSystem);
  } catch (error) {
    console.error("خطأ في جلب النظام الفرعي:", error);
    res.status(500).json({ error: "فشل في جلب النظام الفرعي" });
  }
});

/**
 * POST /api/custom-system/v2/sub-systems
 * إنشاء نظام فرعي جديد
 */
router.post("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      nameAr,
      nameEn,
      code,
      description,
      color,
      icon,
      isActive,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!nameAr) {
      return res.status(400).json({ error: "اسم النظام بالعربية مطلوب" });
    }
    if (!code) {
      return res.status(400).json({ error: "كود النظام مطلوب" });
    }

    // إنشاء النظام الفرعي
    const newSubSystem: InsertCustomSubSystem = {
      businessId,
      code,
      nameAr,
      nameEn: nameEn || null,
      description: description || null,
      color: color || null,
      icon: icon || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: userId,
    };

    const [result] = await db.insert(customSubSystems).values(newSubSystem);
    const subSystemId = result.insertId;

    // جلب النظام الفرعي المُنشأ
    const [created] = await db
      .select()
      .from(customSubSystems)
      .where(eq(customSubSystems.id, subSystemId))
      .limit(1);

    res.status(201).json(created);
  } catch (error) {
    console.error("خطأ في إنشاء النظام الفرعي:", error);
    res.status(500).json({ error: "فشل في إنشاء النظام الفرعي" });
  }
});

/**
 * PUT /api/custom-system/v2/sub-systems/:id
 * تحديث نظام فرعي
 */
router.put("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const subSystemId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(subSystemId)) {
      return res.status(400).json({ error: "معرف النظام الفرعي غير صحيح" });
    }

    // التحقق من وجود النظام الفرعي
    const [existing] = await db
      .select()
      .from(customSubSystems)
      .where(
        and(
          eq(customSubSystems.id, subSystemId),
          eq(customSubSystems.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "النظام الفرعي غير موجود" });
    }

    const {
      nameAr,
      nameEn,
      code,
      description,
      color,
      icon,
      isActive,
    } = req.body;

    // تحديث بيانات النظام الفرعي
    const updateData: Partial<InsertCustomSubSystem> = {};
    if (nameAr) updateData.nameAr = nameAr;
    if (nameEn !== undefined) updateData.nameEn = nameEn || null;
    if (code) updateData.code = code;
    if (description !== undefined) updateData.description = description || null;
    if (color !== undefined) updateData.color = color || null;
    if (icon !== undefined) updateData.icon = icon || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db
      .update(customSubSystems)
      .set(updateData)
      .where(
        and(
          eq(customSubSystems.id, subSystemId),
          eq(customSubSystems.businessId, businessId)
        )
      );

    // جلب النظام الفرعي المحدث
    const [updated] = await db
      .select()
      .from(customSubSystems)
      .where(eq(customSubSystems.id, subSystemId))
      .limit(1);

    res.json(updated);
  } catch (error) {
    console.error("خطأ في تحديث النظام الفرعي:", error);
    res.status(500).json({ error: "فشل في تحديث النظام الفرعي" });
  }
});

/**
 * DELETE /api/custom-system/v2/sub-systems/:id
 * حذف نظام فرعي
 */
router.delete("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const subSystemId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(subSystemId)) {
      return res.status(400).json({ error: "معرف النظام الفرعي غير صحيح" });
    }

    // التحقق من وجود النظام الفرعي
    const [existing] = await db
      .select()
      .from(customSubSystems)
      .where(
        and(
          eq(customSubSystems.id, subSystemId),
          eq(customSubSystems.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "النظام الفرعي غير موجود" });
    }

    // التحقق من عدم وجود حسابات مرتبطة
    const [hasAccounts] = await db
      .select()
      .from(customAccounts)
      .where(eq(customAccounts.subSystemId, subSystemId))
      .limit(1);

    if (hasAccounts) {
      return res.status(400).json({
        error: "لا يمكن حذف نظام فرعي يحتوي على حسابات مرتبطة",
      });
    }

    // حذف النظام الفرعي
    await db
      .delete(customSubSystems)
      .where(
        and(
          eq(customSubSystems.id, subSystemId),
          eq(customSubSystems.businessId, businessId)
        )
      );

    res.json({ message: "تم حذف النظام الفرعي بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف النظام الفرعي:", error);
    res.status(500).json({ error: "فشل في حذف النظام الفرعي" });
  }
});

/**
 * GET /api/custom-system/v2/sub-systems/:id/accounts
 * الحصول على حسابات نظام فرعي محدد
 */
router.get("/:id/accounts", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const subSystemId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(subSystemId)) {
      return res.status(400).json({ error: "معرف النظام الفرعي غير صحيح" });
    }

    // التحقق من وجود النظام الفرعي
    const [subSystem] = await db
      .select()
      .from(customSubSystems)
      .where(
        and(
          eq(customSubSystems.id, subSystemId),
          eq(customSubSystems.businessId, businessId)
        )
      )
      .limit(1);

    if (!subSystem) {
      return res.status(404).json({ error: "النظام الفرعي غير موجود" });
    }

    // جلب الحسابات
    const accounts = await db
      .select()
      .from(customAccounts)
      .where(eq(customAccounts.subSystemId, subSystemId))
      .orderBy(customAccounts.accountCode);

    res.json(accounts);
  } catch (error) {
    console.error("خطأ في جلب حسابات النظام الفرعي:", error);
    res.status(500).json({ error: "فشل في جلب حسابات النظام الفرعي" });
  }
});

/**
 * POST /api/custom-system/v2/sub-systems/:id/set-default-account
 * تعيين حساب افتراضي لنظام فرعي
 */
router.post("/:id/set-default-account", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const subSystemId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(subSystemId)) {
      return res.status(400).json({ error: "معرف النظام الفرعي غير صحيح" });
    }

    const { accountType, accountId } = req.body;

    if (!accountType || !accountId) {
      return res.status(400).json({ error: "نوع الحساب ومعرف الحساب مطلوبان" });
    }

    // التحقق من وجود النظام الفرعي
    const [subSystem] = await db
      .select()
      .from(customSubSystems)
      .where(
        and(
          eq(customSubSystems.id, subSystemId),
          eq(customSubSystems.businessId, businessId)
        )
      )
      .limit(1);

    if (!subSystem) {
      return res.status(404).json({ error: "النظام الفرعي غير موجود" });
    }

    // التحقق من وجود الحساب
    const [account] = await db
      .select()
      .from(customAccounts)
      .where(
        and(
          eq(customAccounts.id, accountId),
          eq(customAccounts.businessId, businessId)
        )
      )
      .limit(1);

    if (!account) {
      return res.status(404).json({ error: "الحساب غير موجود" });
    }

    // Note: This endpoint is deprecated as customSubSystems doesn't have default account fields
    // Use customAccounts with subSystemId instead
    return res.status(400).json({ error: "هذه الميزة غير مدعومة في الإصدار الحالي" });

    await db
      .update(customSubSystems)
      .set(updateData)
      .where(
        and(
          eq(customSubSystems.id, subSystemId),
          eq(customSubSystems.businessId, businessId)
        )
      );

    // جلب النظام الفرعي المحدث
    const [updated] = await db
      .select()
      .from(customSubSystems)
      .where(eq(customSubSystems.id, subSystemId))
      .limit(1);

    res.json(updated);
  } catch (error) {
    console.error("خطأ في تعيين الحساب الافتراضي:", error);
    res.status(500).json({ error: "فشل في تعيين الحساب الافتراضي" });
  }
});

export default router;
