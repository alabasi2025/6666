/**
 * النظام المخصص v2.2.0 - Accounts Router
 * إدارة الحسابات مع دعم متعدد العملات والأرصدة
 */

import { Router } from "express";
import { db } from "../../../db";
import {
  customAccounts,
  customAccountSubTypes,
  customAccountCurrencies,
  customAccountBalances,
  customCurrencies,
  type InsertCustomAccount,
  type InsertCustomAccountCurrency,
} from "../../../../drizzle/schemas/customSystemV2";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

/**
 * GET /api/custom-system/v2/accounts
 * الحصول على جميع الحسابات
 */
router.get("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { subSystemId, accountType, isActive } = req.query;

    let query = db
      .select()
      .from(customAccounts)
      .where(eq(customAccounts.businessId, businessId));

    if (subSystemId) {
      query = query.where(eq(customAccounts.subSystemId, parseInt(String(subSystemId))));
    }

    if (accountType) {
      query = query.where(eq(customAccounts.accountType, String(accountType)));
    }

    if (isActive !== undefined) {
      query = query.where(eq(customAccounts.isActive, isActive === "true"));
    }

    const accounts = await query.orderBy(customAccounts.accountCode);

    res.json(accounts);
  } catch (error) {
    console.error("خطأ في جلب الحسابات:", error);
    res.status(500).json({ error: "فشل في جلب الحسابات" });
  }
});

/**
 * GET /api/custom-system/v2/accounts/:id
 * الحصول على حساب محدد مع تفاصيله
 */
router.get("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const accountId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(accountId)) {
      return res.status(400).json({ error: "معرف الحساب غير صحيح" });
    }

    // جلب الحساب
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

    // جلب العملات المرتبطة
    const currencies = await db
      .select()
      .from(customAccountCurrencies)
      .where(eq(customAccountCurrencies.accountId, accountId));

    // جلب الأرصدة
    const balances = await db
      .select()
      .from(customAccountBalances)
      .where(eq(customAccountBalances.accountId, accountId));

    res.json({ ...account, currencies, balances });
  } catch (error) {
    console.error("خطأ في جلب الحساب:", error);
    res.status(500).json({ error: "فشل في جلب الحساب" });
  }
});

/**
 * POST /api/custom-system/v2/accounts
 * إنشاء حساب جديد
 */
router.post("/", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.id;

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const {
      subSystemId,
      accountCode,
      accountNameAr,
      accountNameEn,
      accountType,
      accountSubTypeId,
      parentAccountId,
      level,
      description,
      isActive,
      allowManualEntry,
      requiresCostCenter,
      requiresParty,
      currencies,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!accountCode || !accountNameAr || !accountType) {
      return res.status(400).json({
        error: "رمز الحساب، الاسم بالعربية، ونوع الحساب مطلوبة",
      });
    }

    // التحقق من عدم تكرار رمز الحساب
    const [existing] = await db
      .select()
      .from(customAccounts)
      .where(
        and(
          eq(customAccounts.businessId, businessId),
          eq(customAccounts.accountCode, accountCode)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "رمز الحساب موجود مسبقاً" });
    }

    // إنشاء الحساب
    const newAccount: InsertCustomAccount = {
      businessId,
      subSystemId: subSystemId || null,
      accountCode,
      accountNameAr,
      accountNameEn: accountNameEn || null,
      accountType,
      accountSubTypeId: accountSubTypeId || null,
      parentAccountId: parentAccountId || null,
      level: level || 1,
      description: description || null,
      isActive: isActive !== undefined ? isActive : true,
      allowManualEntry: allowManualEntry !== undefined ? allowManualEntry : true,
      requiresCostCenter: requiresCostCenter || false,
      requiresParty: requiresParty || false,
      createdBy: userId,
    };

    const [result] = await db.insert(customAccounts).values(newAccount);
    const accountId = result.insertId;

    // إضافة العملات إذا تم تحديدها
    if (currencies && currencies.length > 0) {
      const currencyValues: InsertCustomAccountCurrency[] = currencies.map((curr: any) => ({
        businessId,
        accountId,
        currencyId: curr.currencyId,
        isDefault: curr.isDefault || false,
      }));

      await db.insert(customAccountCurrencies).values(currencyValues);
    }

    // جلب الحساب المُنشأ
    const [created] = await db
      .select()
      .from(customAccounts)
      .where(eq(customAccounts.id, accountId))
      .limit(1);

    res.status(201).json(created);
  } catch (error) {
    console.error("خطأ في إنشاء الحساب:", error);
    res.status(500).json({ error: "فشل في إنشاء الحساب" });
  }
});

/**
 * PUT /api/custom-system/v2/accounts/:id
 * تحديث حساب
 */
router.put("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const accountId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(accountId)) {
      return res.status(400).json({ error: "معرف الحساب غير صحيح" });
    }

    // التحقق من وجود الحساب
    const [existing] = await db
      .select()
      .from(customAccounts)
      .where(
        and(
          eq(customAccounts.id, accountId),
          eq(customAccounts.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "الحساب غير موجود" });
    }

    const {
      subSystemId,
      accountNameAr,
      accountNameEn,
      accountType,
      accountSubTypeId,
      parentAccountId,
      level,
      description,
      isActive,
      allowManualEntry,
      requiresCostCenter,
      requiresParty,
      currencies,
    } = req.body;

    // تحديث بيانات الحساب
    const updateData: Partial<InsertCustomAccount> = {};
    if (subSystemId !== undefined) updateData.subSystemId = subSystemId || null;
    if (accountNameAr) updateData.accountNameAr = accountNameAr;
    if (accountNameEn !== undefined) updateData.accountNameEn = accountNameEn || null;
    if (accountType) updateData.accountType = accountType;
    if (accountSubTypeId !== undefined) updateData.accountSubTypeId = accountSubTypeId || null;
    if (parentAccountId !== undefined) updateData.parentAccountId = parentAccountId || null;
    if (level !== undefined) updateData.level = level;
    if (description !== undefined) updateData.description = description || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (allowManualEntry !== undefined) updateData.allowManualEntry = allowManualEntry;
    if (requiresCostCenter !== undefined) updateData.requiresCostCenter = requiresCostCenter;
    if (requiresParty !== undefined) updateData.requiresParty = requiresParty;

    await db
      .update(customAccounts)
      .set(updateData)
      .where(
        and(
          eq(customAccounts.id, accountId),
          eq(customAccounts.businessId, businessId)
        )
      );

    // تحديث العملات إذا تم تحديدها
    if (currencies) {
      // حذف العملات القديمة
      await db
        .delete(customAccountCurrencies)
        .where(eq(customAccountCurrencies.accountId, accountId));

      // إضافة العملات الجديدة
      if (currencies.length > 0) {
        const currencyValues: InsertCustomAccountCurrency[] = currencies.map((curr: any) => ({
          businessId,
          accountId,
          currencyId: curr.currencyId,
          isDefault: curr.isDefault || false,
        }));

        await db.insert(customAccountCurrencies).values(currencyValues);
      }
    }

    // جلب الحساب المحدث
    const [updated] = await db
      .select()
      .from(customAccounts)
      .where(eq(customAccounts.id, accountId))
      .limit(1);

    res.json(updated);
  } catch (error) {
    console.error("خطأ في تحديث الحساب:", error);
    res.status(500).json({ error: "فشل في تحديث الحساب" });
  }
});

/**
 * DELETE /api/custom-system/v2/accounts/:id
 * حذف حساب
 */
router.delete("/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const accountId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(accountId)) {
      return res.status(400).json({ error: "معرف الحساب غير صحيح" });
    }

    // التحقق من وجود الحساب
    const [existing] = await db
      .select()
      .from(customAccounts)
      .where(
        and(
          eq(customAccounts.id, accountId),
          eq(customAccounts.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "الحساب غير موجود" });
    }

    // التحقق من عدم وجود حسابات فرعية
    const [hasChildren] = await db
      .select()
      .from(customAccounts)
      .where(eq(customAccounts.parentAccountId, accountId))
      .limit(1);

    if (hasChildren) {
      return res.status(400).json({ error: "لا يمكن حذف حساب يحتوي على حسابات فرعية" });
    }

    // التحقق من عدم وجود معاملات
    const [hasBalances] = await db
      .select()
      .from(customAccountBalances)
      .where(eq(customAccountBalances.accountId, accountId))
      .limit(1);

    if (hasBalances) {
      return res.status(400).json({ error: "لا يمكن حذف حساب يحتوي على معاملات" });
    }

    // حذف العملات المرتبطة
    await db
      .delete(customAccountCurrencies)
      .where(eq(customAccountCurrencies.accountId, accountId));

    // حذف الحساب
    await db
      .delete(customAccounts)
      .where(
        and(
          eq(customAccounts.id, accountId),
          eq(customAccounts.businessId, businessId)
        )
      );

    res.json({ message: "تم حذف الحساب بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف الحساب:", error);
    res.status(500).json({ error: "فشل في حذف الحساب" });
  }
});

/**
 * GET /api/custom-system/v2/accounts/:id/balances
 * الحصول على أرصدة حساب محدد
 */
router.get("/:id/balances", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const accountId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(accountId)) {
      return res.status(400).json({ error: "معرف الحساب غير صحيح" });
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

    // جلب الأرصدة
    const balances = await db
      .select()
      .from(customAccountBalances)
      .where(eq(customAccountBalances.accountId, accountId));

    res.json(balances);
  } catch (error) {
    console.error("خطأ في جلب الأرصدة:", error);
    res.status(500).json({ error: "فشل في جلب الأرصدة" });
  }
});

/**
 * POST /api/custom-system/v2/accounts/:id/currencies
 * إضافة عملة لحساب
 */
router.post("/:id/currencies", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const accountId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(accountId)) {
      return res.status(400).json({ error: "معرف الحساب غير صحيح" });
    }

    const { currencyId, isDefault } = req.body;

    if (!currencyId) {
      return res.status(400).json({ error: "معرف العملة مطلوب" });
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

    // التحقق من عدم تكرار العملة
    const [existing] = await db
      .select()
      .from(customAccountCurrencies)
      .where(
        and(
          eq(customAccountCurrencies.accountId, accountId),
          eq(customAccountCurrencies.currencyId, currencyId)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "العملة مضافة مسبقاً لهذا الحساب" });
    }

    // إذا كانت العملة افتراضية، إلغاء الافتراضية من العملات الأخرى
    if (isDefault) {
      await db
        .update(customAccountCurrencies)
        .set({ isDefault: false })
        .where(eq(customAccountCurrencies.accountId, accountId));
    }

    // إضافة العملة
    const newCurrency: InsertCustomAccountCurrency = {
      businessId,
      accountId,
      currencyId,
      isDefault: isDefault || false,
    };

    await db.insert(customAccountCurrencies).values(newCurrency);

    res.status(201).json({ message: "تم إضافة العملة بنجاح" });
  } catch (error) {
    console.error("خطأ في إضافة العملة:", error);
    res.status(500).json({ error: "فشل في إضافة العملة" });
  }
});

/**
 * DELETE /api/custom-system/v2/accounts/:id/currencies/:currencyId
 * حذف عملة من حساب
 */
router.delete("/:id/currencies/:currencyId", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const accountId = parseInt(req.params.id);
    const currencyId = parseInt(req.params.currencyId);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(accountId) || isNaN(currencyId)) {
      return res.status(400).json({ error: "معرفات غير صحيحة" });
    }

    // التحقق من عدم وجود معاملات بهذه العملة
    const [hasBalances] = await db
      .select()
      .from(customAccountBalances)
      .where(
        and(
          eq(customAccountBalances.accountId, accountId),
          eq(customAccountBalances.currencyId, currencyId)
        )
      )
      .limit(1);

    if (hasBalances) {
      return res.status(400).json({ error: "لا يمكن حذف عملة تحتوي على معاملات" });
    }

    // حذف العملة
    await db
      .delete(customAccountCurrencies)
      .where(
        and(
          eq(customAccountCurrencies.accountId, accountId),
          eq(customAccountCurrencies.currencyId, currencyId)
        )
      );

    res.json({ message: "تم حذف العملة بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف العملة:", error);
    res.status(500).json({ error: "فشل في حذف العملة" });
  }
});

/**
 * GET /api/custom-system/v2/accounts/sub-types
 * الحصول على أنواع الحسابات الفرعية
 */
router.get("/sub-types", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const subTypes = await db
      .select()
      .from(customAccountSubTypes)
      .where(eq(customAccountSubTypes.businessId, businessId))
      .orderBy(customAccountSubTypes.accountType, customAccountSubTypes.subTypeNameAr);

    res.json(subTypes);
  } catch (error) {
    console.error("خطأ في جلب الأنواع الفرعية:", error);
    res.status(500).json({ error: "فشل في جلب الأنواع الفرعية" });
  }
});

export default router;
