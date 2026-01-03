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
import { eq, and, inArray } from "drizzle-orm";

const router = Router();

async function ensureDefaultAccountSubTypes(businessId: number) {
  // اقرأ الأكواد الحالية
  const existing = await db
    .select({
      id: customAccountSubTypes.id,
      code: customAccountSubTypes.code,
      nameAr: customAccountSubTypes.nameAr,
    })
    .from(customAccountSubTypes)
    .where(eq(customAccountSubTypes.businessId, businessId));

  const codeToRow = new Map(existing.map((r) => [r.code, r]));

  // 1) تحويل atm -> exchange للحفاظ على نفس الـ id إذا لم يكن exchange موجوداً
  if (codeToRow.has("atm") && !codeToRow.has("exchange")) {
    const atmRow = codeToRow.get("atm")!;
    await db
      .update(customAccountSubTypes)
      .set({
        code: "exchange",
        nameAr: "صراف",
        nameEn: "Exchange",
        icon: "credit-card",
        color: "#f59e0b",
        displayOrder: 4,
      })
      .where(and(eq(customAccountSubTypes.businessId, businessId), eq(customAccountSubTypes.id, atmRow.id)));

    codeToRow.delete("atm");
    codeToRow.set("exchange", { ...atmRow, code: "exchange", nameAr: "صراف" });
  }

  // 2) توحيد اسم/إعدادات exchange (وأي atm متبقٍ)
  if (codeToRow.has("exchange") || codeToRow.has("atm")) {
    await db
      .update(customAccountSubTypes)
      .set({
        nameAr: "صراف",
        nameEn: "Exchange",
        icon: "credit-card",
        color: "#f59e0b",
        displayOrder: 4,
        accountType: "asset",
        allowMultipleCurrencies: false,
        requiresParty: false,
        isActive: true,
      })
      .where(
        and(
          eq(customAccountSubTypes.businessId, businessId),
          inArray(customAccountSubTypes.code, ["exchange", "atm"])
        )
      );
  }

  // 3) إدراج الأنواع المطلوبة إذا كانت ناقصة
  const required: Array<InsertCustomAccountSubType> = [
    {
      businessId,
      accountType: "asset",
      code: "warehouse",
      nameAr: "مخزن",
      nameEn: "Warehouse",
      isActive: true,
      allowMultipleCurrencies: true,
      requiresParty: false,
      icon: "boxes",
      color: "#0ea5e9",
      displayOrder: 5,
    },
    {
      businessId,
      accountType: "liability",
      code: "supplier",
      nameAr: "مورد",
      nameEn: "Supplier",
      isActive: true,
      allowMultipleCurrencies: true,
      requiresParty: true,
      icon: "truck",
      color: "#f97316",
      displayOrder: 6,
    },
    {
      businessId,
      accountType: "revenue",
      code: "customer",
      nameAr: "عميل",
      nameEn: "Customer",
      isActive: true,
      allowMultipleCurrencies: true,
      requiresParty: true,
      icon: "users",
      color: "#3b82f6",
      displayOrder: 7,
    },
    {
      businessId,
      accountType: "asset",
      code: "general",
      nameAr: "عام",
      nameEn: "General",
      isActive: true,
      allowMultipleCurrencies: false,
      requiresParty: false,
      icon: "layers",
      color: "#94a3b8",
      displayOrder: 8,
    },
  ];

  const missing = required.filter((r) => !codeToRow.has(r.code));
  if (missing.length > 0) {
    // إدراج دفعة واحدة، وإن تعارضت بسبب unique key سنعيد المحاولة بشكل فردي
    try {
      await db.insert(customAccountSubTypes).values(missing);
    } catch {
      for (const row of missing) {
        try {
          await db.insert(customAccountSubTypes).values(row);
        } catch {
          // تجاهل أي تعارض (قد تكون أُضيفت بالتزامن)
        }
      }
    }
  }
}

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

    // ضمان وجود الأنواع القياسية (صراف/مورد/عميل/مخزن/عام...) وترقية البيانات القديمة (atm)
    await ensureDefaultAccountSubTypes(businessId);

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


