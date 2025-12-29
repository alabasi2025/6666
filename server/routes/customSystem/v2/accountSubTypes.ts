/**
 * النظام المخصص v2.2.0 - Account Sub Types Router
 * إدارة الأنواع الفرعية للحسابات
 */

import { Router } from "express";
import { db } from "../../../db";
import {
  customAccountSubTypes,
  type InsertCustomAccountSubType,
} from "../../../../drizzle/schemas/customSystemV2";
import { eq, and } from "drizzle-orm";

const router = Router();

/**
 * GET /api/custom-system/v2/account-sub-types
 * الحصول على جميع الأنواع الفرعية
 */
router.get("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { accountType, isActive } = req.query;

    let query = db
      .select()
      .from(customAccountSubTypes)
      .where(eq(customAccountSubTypes.businessId, businessId));

    if (accountType) {
      query = query.where(eq(customAccountSubTypes.accountType, String(accountType)));
    }

    if (isActive !== undefined) {
      query = query.where(eq(customAccountSubTypes.isActive, isActive === "true"));
    }

    const subTypes = await query.orderBy(customAccountSubTypes.displayOrder, customAccountSubTypes.nameAr);

    res.json(subTypes);
  } catch (error) {
    console.error("خطأ في جلب الأنواع الفرعية:", error);
    res.status(500).json({ error: "فشل في جلب الأنواع الفرعية" });
  }
});

export default router;


