import express from "express";
import { eq, and, or, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { customAccountTypes } from "../../../../drizzle/schemas/customSystemV2";
import type { InsertCustomAccountType } from "../../../../drizzle/schemas/customSystemV2";

const router = express.Router();

/**
 * GET /api/custom-system/v2/account-types
 * الحصول على جميع أنواع الحسابات
 */
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { subSystemId, includeInactive } = req.query;

    // بناء شروط البحث
    const conditions = [eq(customAccountTypes.businessId, businessId)];

    // فلترة حسب النظام الفرعي
    if (subSystemId) {
      const subSystemIdValue = parseInt(String(subSystemId));
      if (!isNaN(subSystemIdValue)) {
        // عرض الأنواع المرتبطة بالنظام الفرعي أو الأنواع العامة (NULL)
        conditions.push(
          or(
            eq(customAccountTypes.subSystemId, subSystemIdValue),
            isNull(customAccountTypes.subSystemId)
          )
        );
      }
    }

    // فلترة حسب الحالة النشطة
    if (!includeInactive || includeInactive === "false") {
      conditions.push(eq(customAccountTypes.isActive, true));
    }

    const accountTypes = await db
      .select()
      .from(customAccountTypes)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(customAccountTypes.displayOrder, customAccountTypes.typeNameAr);

    res.json(accountTypes);
  } catch (error) {
    console.error("خطأ في جلب أنواع الحسابات:", error);
    res.status(500).json({ error: "فشل في جلب أنواع الحسابات" });
  }
});

/**
 * GET /api/custom-system/v2/account-types/:id
 * الحصول على نوع حساب محدد
 */
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
    const businessId = req.user?.businessId;
    const typeId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(typeId)) {
      return res.status(400).json({ error: "معرف النوع غير صحيح" });
    }

    const [accountType] = await db
      .select()
      .from(customAccountTypes)
      .where(
        and(
          eq(customAccountTypes.id, typeId),
          eq(customAccountTypes.businessId, businessId)
        )
      )
      .limit(1);

    if (!accountType) {
      return res.status(404).json({ error: "نوع الحساب غير موجود" });
    }

    res.json(accountType);
  } catch (error) {
    console.error("خطأ في جلب نوع الحساب:", error);
    res.status(500).json({ error: "فشل في جلب نوع الحساب" });
  }
});

/**
 * POST /api/custom-system/v2/account-types
 * إضافة نوع حساب جديد
 */
router.post("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
    const businessId = req.user?.businessId;
    const userId = req.user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      typeCode,
      typeNameAr,
      typeNameEn,
      description,
      color,
      icon,
      displayOrder,
      isActive,
      subSystemId,
    } = req.body;

    if (!typeCode || !typeNameAr) {
      return res.status(400).json({ error: "كود النوع والاسم العربي مطلوبان" });
    }

    const [existing] = await db
      .select()
      .from(customAccountTypes)
      .where(
        and(
          eq(customAccountTypes.businessId, businessId),
          eq(customAccountTypes.typeCode, typeCode)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "كود النوع موجود مسبقاً" });
    }

    const newAccountType: InsertCustomAccountType = {
      businessId,
      typeCode,
      typeNameAr,
      typeNameEn: typeNameEn || null,
      description: description || null,
      color: color || null,
      icon: icon || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      isSystemType: false,
      subSystemId: subSystemId || null,
      createdBy: userId || null,
    };

    const [result] = await db
      .insert(customAccountTypes)
      .values(newAccountType)
      .$returningId();

    res.status(201).json({
      message: "تم إضافة نوع الحساب بنجاح",
      id: result.id,
    });
  } catch (error) {
    console.error("خطأ في إضافة نوع الحساب:", error);
    res.status(500).json({ error: "فشل في إضافة نوع الحساب" });
  }
});

/**
 * PUT /api/custom-system/v2/account-types/:id
 * تحديث نوع حساب
 */
router.put("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
    const businessId = req.user?.businessId;
    const typeId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(typeId)) {
      return res.status(400).json({ error: "معرف النوع غير صحيح" });
    }

    const [accountType] = await db
      .select()
      .from(customAccountTypes)
      .where(
        and(
          eq(customAccountTypes.id, typeId),
          eq(customAccountTypes.businessId, businessId)
        )
      )
      .limit(1);

    if (!accountType) {
      return res.status(404).json({ error: "نوع الحساب غير موجود" });
    }

    if (accountType.isSystemType) {
      return res.status(400).json({ error: "لا يمكن تعديل الأنواع النظامية" });
    }

    const {
      typeCode,
      typeNameAr,
      typeNameEn,
      description,
      color,
      icon,
      displayOrder,
      isActive,
      subSystemId,
    } = req.body;

    if (typeCode && typeCode !== accountType.typeCode) {
      const [existing] = await db
        .select()
        .from(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.businessId, businessId),
            eq(customAccountTypes.typeCode, typeCode)
          )
        )
        .limit(1);

      if (existing) {
        return res.status(400).json({ error: "كود النوع موجود مسبقاً" });
      }
    }

    await db
      .update(customAccountTypes)
      .set({
        typeCode: typeCode || accountType.typeCode,
        typeNameAr: typeNameAr || accountType.typeNameAr,
        typeNameEn: typeNameEn !== undefined ? typeNameEn : accountType.typeNameEn,
        description: description !== undefined ? description : accountType.description,
        color: color !== undefined ? color : accountType.color,
        icon: icon !== undefined ? icon : accountType.icon,
        displayOrder: displayOrder !== undefined ? displayOrder : accountType.displayOrder,
        isActive: isActive !== undefined ? isActive : accountType.isActive,
        subSystemId: subSystemId !== undefined ? subSystemId : accountType.subSystemId,
      })
      .where(eq(customAccountTypes.id, typeId));

    res.json({ message: "تم تحديث نوع الحساب بنجاح" });
  } catch (error) {
    console.error("خطأ في تحديث نوع الحساب:", error);
    res.status(500).json({ error: "فشل في تحديث نوع الحساب" });
  }
});

/**
 * DELETE /api/custom-system/v2/account-types/:id
 * حذف نوع حساب
 */
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
    const businessId = req.user?.businessId;
    const typeId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(typeId)) {
      return res.status(400).json({ error: "معرف النوع غير صحيح" });
    }

    const [accountType] = await db
      .select()
      .from(customAccountTypes)
      .where(
        and(
          eq(customAccountTypes.id, typeId),
          eq(customAccountTypes.businessId, businessId)
        )
      )
      .limit(1);

    if (!accountType) {
      return res.status(404).json({ error: "نوع الحساب غير موجود" });
    }

    if (accountType.isSystemType) {
      return res.status(400).json({ error: "لا يمكن حذف الأنواع النظامية" });
    }

    await db
      .delete(customAccountTypes)
      .where(eq(customAccountTypes.id, typeId));

    res.json({ message: "تم حذف نوع الحساب بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف نوع الحساب:", error);
    res.status(500).json({ error: "فشل في حذف نوع الحساب" });
  }
});

export default router;
