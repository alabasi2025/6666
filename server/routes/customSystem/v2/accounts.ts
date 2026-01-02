/**
 * النظام المخصص v2.2.0 - Accounts Router
 * إدارة الحسابات مع دعم متعدد العملات والأرصدة
 */

import { Router } from "express";
import { getDb } from "../../../db";
import {
  customAccounts,
  customAccountTypes,
  customAccountSubTypes,
  customAccountCurrencies,
  customAccountBalances,
  customCurrencies,
  customJournalEntries,
  customJournalEntryLines,
  type InsertCustomAccount,
  type InsertCustomAccountCurrency,
} from "../../../../drizzle/schemas/customSystemV2";
import { eq, and, desc, sql, isNull, or } from "drizzle-orm";

const router = Router();

/**
 * GET /api/custom-system/v2/accounts
 * الحصول على جميع الحسابات
 */
router.get("/", async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:25',message:'GET /accounts - Entry',data:{businessId:req.user?.businessId,queryParams:req.query},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { subSystemId, accountType, isActive } = req.query;

    // بناء شروط البحث
    const conditions = [eq(customAccounts.businessId, businessId)];

    // فلترة حسب النظام الفرعي إن تم تمريره (حصر الحسابات على هذا النظام فقط)
    if (subSystemId) {
      const subSystemIdValue = parseInt(String(subSystemId));
      if (!isNaN(subSystemIdValue)) {
        conditions.push(eq(customAccounts.subSystemId, subSystemIdValue));
      }
    }

    if (accountType) {
      conditions.push(eq(customAccounts.accountType, String(accountType)));
    }

    if (isActive !== undefined) {
      conditions.push(eq(customAccounts.isActive, isActive === "true"));
    }

    console.log("[Accounts API] جلب الحسابات:", {
      businessId,
      subSystemId,
      accountType,
      isActive,
      conditionsCount: conditions.length
    });
    
    // استخدام getDb() بدلاً من db للتأكد من الاتصال
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ 
        error: "فشل في الاتصال بقاعدة البيانات",
        details: "DATABASE_URL غير موجود أو الاتصال فشل"
      });
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:68',message:'GET /accounts - Before select query',data:{conditionsCount:conditions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const accounts = await db
      .select({
        id: customAccounts.id,
        businessId: customAccounts.businessId,
        subSystemId: customAccounts.subSystemId,
        accountCode: customAccounts.accountCode,
        accountNameAr: customAccounts.accountNameAr,
        accountNameEn: customAccounts.accountNameEn,
        accountType: customAccounts.accountType,
        accountTypeId: customAccounts.accountTypeId,
        accountSubTypeId: customAccounts.accountSubTypeId,
        parentAccountId: customAccounts.parentAccountId,
        level: customAccounts.level,
        description: customAccounts.description,
        isActive: customAccounts.isActive,
        allowManualEntry: customAccounts.allowManualEntry,
        requiresCostCenter: customAccounts.requiresCostCenter,
        createdAt: customAccounts.createdAt,
        updatedAt: customAccounts.updatedAt,
      })
      .from(customAccounts)
      .where(and(...conditions))
      .orderBy(customAccounts.accountCode);
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:72',message:'GET /accounts - After select query',data:{accountsCount:accounts.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    console.log("[Accounts API] تم جلب", accounts.length, "حساب");
    res.json(accounts);
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:76',message:'GET /accounts - Error caught',data:{errorMessage:error.message,errorCode:error.code,sql:error.sql},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    console.error("خطأ في جلب الحسابات:", error);
    console.error("تفاصيل الخطأ:", {
      message: error.message,
      code: error.code,
      sql: error.sql,
      stack: error.stack,
      cause: error.cause,
      databaseUrl: process.env.DATABASE_URL ? "موجود" : "غير موجود"
    });
    
    // إرجاع رسالة خطأ واضحة
    const errorMessage = error.message || "خطأ غير معروف";
    const errorDetails = error.sql || errorMessage;
    
    res.status(500).json({ 
      error: "فشل في جلب الحسابات", 
      details: errorMessage,
      query: errorDetails
    });
  }
});

/**
 * GET /api/custom-system/v2/accounts/statement
 * كشف حساب لحساب محدد داخل نظام فرعي
 */
router.get("/statement", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const accountId = parseInt(String(req.query.accountId ?? ""));
    const subSystemId = req.query.subSystemId ? parseInt(String(req.query.subSystemId)) : undefined;
    const fromDate = req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined;
    const toDate = req.query.toDate ? new Date(String(req.query.toDate)) : undefined;

    if (!accountId || Number.isNaN(accountId)) {
      return res.status(400).json({ error: "accountId مطلوب" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }

    const conditions = [
      eq(customJournalEntryLines.accountId, accountId),
      eq(customJournalEntries.businessId, businessId),
    ];

    if (subSystemId && !Number.isNaN(subSystemId)) {
      conditions.push(eq(customJournalEntries.subSystemId, subSystemId));
    }

    if (fromDate) {
      conditions.push(sql`${customJournalEntries.entryDate} >= ${fromDate}`);
    }
    if (toDate) {
      conditions.push(sql`${customJournalEntries.entryDate} <= ${toDate}`);
    }

    const rows = await db
      .select({
        id: customJournalEntryLines.id,
        entryId: customJournalEntries.id,
        entryNumber: customJournalEntries.entryNumber,
        entryDate: customJournalEntries.entryDate,
        referenceType: customJournalEntries.referenceType,
        referenceId: customJournalEntries.referenceId,
        description: customJournalEntryLines.description,
        debit: customJournalEntryLines.debitAmountBase,
        credit: customJournalEntryLines.creditAmountBase,
        status: customJournalEntries.status,
      })
      .from(customJournalEntryLines)
      .innerJoin(customJournalEntries, eq(customJournalEntryLines.journalEntryId, customJournalEntries.id))
      .where(and(...conditions))
      .orderBy(customJournalEntries.entryDate, customJournalEntryLines.id);

    let runningBalance = 0;
    const statement = rows.map((row) => {
      const debit = parseFloat(String(row.debit));
      const credit = parseFloat(String(row.credit));
      runningBalance += debit - credit;
      return {
        id: row.id,
        entryId: row.entryId,
        entryNumber: row.entryNumber,
        entryDate: row.entryDate,
        referenceType: row.referenceType,
        referenceId: row.referenceId,
        description: row.description,
        debit,
        credit,
        balance: runningBalance,
        status: row.status,
      };
    });

    res.json({ accountId, subSystemId: subSystemId ?? null, statement });
  } catch (error) {
    console.error("[Accounts API] statement error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب كشف الحساب" });
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

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }

    // جلب الحساب
    const [account] = await db
      .select({
        id: customAccounts.id,
        businessId: customAccounts.businessId,
        subSystemId: customAccounts.subSystemId,
        accountCode: customAccounts.accountCode,
        accountNameAr: customAccounts.accountNameAr,
        accountNameEn: customAccounts.accountNameEn,
        accountType: customAccounts.accountType,
        accountTypeId: customAccounts.accountTypeId,
        accountSubTypeId: customAccounts.accountSubTypeId,
        parentAccountId: customAccounts.parentAccountId,
        level: customAccounts.level,
        description: customAccounts.description,
        isActive: customAccounts.isActive,
        allowManualEntry: customAccounts.allowManualEntry,
        requiresCostCenter: customAccounts.requiresCostCenter,
        createdAt: customAccounts.createdAt,
        updatedAt: customAccounts.updatedAt,
      })
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
      .select({
        id: customAccountCurrencies.id,
        currencyId: customAccountCurrencies.currencyId,
        code: customCurrencies.code,
        nameAr: customCurrencies.nameAr,
        nameEn: customCurrencies.nameEn,
        isDefault: customAccountCurrencies.isDefault,
        isActive: customAccountCurrencies.isActive,
      })
      .from(customAccountCurrencies)
      .leftJoin(customCurrencies, eq(customAccountCurrencies.currencyId, customCurrencies.id))
      .where(eq(customAccountCurrencies.accountId, accountId));

    // جلب الأرصدة
    const balances = await db
      .select()
      .from(customAccountBalances)
      .where(eq(customAccountBalances.accountId, accountId));

    const hasTransactions = balances.length > 0;

    // إذا لم يكن accountType موجوداً لكن يوجد accountTypeId، نجلب typeCode المقابل
    let finalAccountType = account.accountType;
    if (!finalAccountType && account.accountTypeId) {
      const [typeRow] = await db
        .select()
        .from(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.id, account.accountTypeId),
            eq(customAccountTypes.businessId, businessId)
          )
        )
        .limit(1);
      if (typeRow?.typeCode) {
        finalAccountType = typeRow.typeCode;
      }
    }

    res.json({ ...account, accountType: finalAccountType, currencies, balances, hasTransactions });
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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:160',message:'POST /accounts - Entry',data:{businessId:req.user?.businessId,userId:req.user?.id,bodyKeys:Object.keys(req.body)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
      subSystemId,
      accountCode, // سيتم تحويله إلى accountNumber
      accountNameAr, // سيتم تحويله إلى accountName
      accountNameEn,
      accountType,
      accountSubTypeId,
      parentAccountId, // سيتم تحويله إلى parentId
      level,
      accountLevel, // قادم من الواجهة (main/sub)
      description,
      isActive,
      allowManualEntry,
      requiresCostCenter,
      // requiresParty, // غير موجود في قاعدة البيانات حالياً
      currencies,
    } = req.body;
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:189',message:'POST /accounts - Parsed body data',data:{subSystemId,accountCode,accountNameAr,accountType,parentAccountId,level,hasCurrencies:!!currencies},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // التحقق من الحقول المطلوبة
    if (!accountCode || !accountNameAr || !accountType) {
      return res.status(400).json({
        error: "رمز الحساب، الاسم بالعربية، ونوع الحساب مطلوبة",
      });
    }

    // جلب نوع الحساب المخصص (إن وجد) لربط accountTypeId
    let accountTypeId: number | null = null;
    if (accountType) {
      const [typeRow] = await db
        .select()
        .from(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.businessId, businessId),
            eq(customAccountTypes.typeCode, accountType)
          )
        )
        .limit(1);
      accountTypeId = typeRow?.id || null;
    }

    // التحقق من عدم تكرار رمز الحساب
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:198',message:'POST /accounts - Before duplicate check',data:{businessId,accountCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
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
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:208',message:'POST /accounts - After duplicate check',data:{existingFound:!!existing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (existing) {
      return res.status(400).json({ error: "رمز الحساب موجود مسبقاً" });
    }

    // إنشاء الحساب باستخدام الأعمدة الفعلية
    const resolvedLevel = accountLevel === "sub" ? 2 : accountLevel === "main" ? 1 : level || 1;

    const newAccount: any = {
      businessId,
      subSystemId: subSystemId || null,
      accountCode,
      accountNameAr,
      accountNameEn: accountNameEn || null,
      accountType,
      accountTypeId,
      accountSubTypeId: accountSubTypeId || null,
      parentAccountId: parentAccountId || null,
      level: resolvedLevel,
      description: description || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: userId,
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:231',message:'POST /accounts - Before insert',data:{newAccountKeys:Object.keys(newAccount),accountNumber:newAccount.accountNumber,accountName:newAccount.accountName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const result = await db.insert(customAccounts).values(newAccount);
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:233',message:'POST /accounts - After insert',data:{resultType:typeof result,isArray:Array.isArray(result),resultKeys:result?Object.keys(result):[],insertId:Array.isArray(result)?result[0]?.insertId:(result as any)?.insertId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // في Drizzle مع MySQL، insertId موجود في result[0].insertId
    let accountId: number | undefined;
    if (Array.isArray(result) && result.length > 0) {
      accountId = (result[0] as any)?.insertId;
    } else if ((result as any)?.insertId) {
      accountId = (result as any).insertId;
    }

    if (!accountId) {
      // إذا لم يكن insertId متاحاً، نجلب آخر حساب تم إضافته بنفس الرمز
      const [created] = await db
        .select()
        .from(customAccounts)
        .where(
          and(
            eq(customAccounts.businessId, businessId),
            eq(customAccounts.accountCode, accountCode)
          )
        )
        .orderBy(desc(customAccounts.id))
        .limit(1);
      
      if (!created) {
        console.error("فشل في الحصول على معرف الحساب المُنشأ. Result:", result);
        throw new Error("فشل في الحصول على معرف الحساب المُنشأ");
      }
      
      accountId = created.id;

      // إضافة العملات إذا تم تحديدها
      if (currencies && currencies.length > 0) {
        const currencyValues: InsertCustomAccountCurrency[] = currencies.map((curr: any) => ({
          businessId,
          accountId: created.id,
          currencyId: curr.currencyId,
          isDefault: curr.isDefault || false,
        }));

        await db.insert(customAccountCurrencies).values(currencyValues);
      }

      return res.status(201).json(created);
    }

    // إضافة العملات إذا تم تحديدها (مرة واحدة فقط)
    if (currencies && currencies.length > 0 && accountId) {
      const currencyValues: InsertCustomAccountCurrency[] = currencies.map((curr: any) => ({
        businessId,
        accountId: accountId,
        currencyId: curr.currencyId,
        isDefault: curr.isDefault || false,
      }));
      
      await db.insert(customAccountCurrencies).values(currencyValues);
    }

    // جلب الحساب المُنشأ
    const [created] = await db
      .select()
      .from(customAccounts)
      .where(eq(customAccounts.id, accountId!))
      .limit(1);

    if (!created) {
      console.error("فشل في جلب الحساب المُنشأ. accountId:", accountId);
      throw new Error("فشل في جلب الحساب المُنشأ");
    }

    res.status(201).json(created);
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7a8c2091-2dd7-4e94-8295-a31512164037',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounts.ts:316',message:'POST /accounts - Error caught',data:{errorMessage:error.message,errorCode:error.code,sql:error.sql,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("خطأ في إنشاء الحساب:", error);
    console.error("تفاصيل الخطأ:", {
      message: error.message,
      code: error.code,
      sql: error.sql,
      stack: error.stack
    });
    res.status(500).json({ error: "فشل في إنشاء الحساب", details: error.message });
  }
});

/**
 * PUT /api/custom-system/v2/accounts/:id
 * تحديث حساب
 */
router.put("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
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
      parentAccountId,
      level,
      accountLevel, // قادم من الواجهة (main/sub)
      accountSubTypeId,
      description,
      isActive,
      currencies,
    } = req.body;

    // تحديث بيانات الحساب
    // ملاحظة: استخدام الأعمدة الموجودة في الجدول الفعلي حتى يتم تطبيق migration 0016
    const updateData: any = {};
    if (subSystemId !== undefined) updateData.subSystemId = subSystemId || null;
    if (accountNameAr) updateData.accountNameAr = accountNameAr;
    if (accountNameEn !== undefined) updateData.accountNameEn = accountNameEn || null;
    if (accountType) {
      updateData.accountType = accountType;

      // تحديث accountTypeId ليتوافق مع النوع المخصص
      const [typeRow] = await db
        .select()
        .from(customAccountTypes)
        .where(
          and(
            eq(customAccountTypes.businessId, businessId),
            eq(customAccountTypes.typeCode, accountType)
          )
        )
        .limit(1);
      updateData.accountTypeId = typeRow?.id || null;
    }
    if (accountSubTypeId !== undefined) updateData.accountSubTypeId = accountSubTypeId || null;
    if (parentAccountId !== undefined) updateData.parentAccountId = parentAccountId || null;
    if (accountSubTypeId !== undefined) updateData.accountSubTypeId = accountSubTypeId || null;

    if (accountLevel !== undefined) {
      updateData.level = accountLevel === "sub" ? 2 : 1;
    } else if (level !== undefined) {
      updateData.level = level;
    }
    if (description !== undefined) updateData.description = description || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    // if (allowManualEntry !== undefined) updateData.allowManualEntry = allowManualEntry; // غير موجود في الجدول الفعلي حالياً
    // if (requiresCostCenter !== undefined) updateData.requiresCostCenter = requiresCostCenter; // غير موجود في الجدول الفعلي حالياً
    // if (requiresParty !== undefined) updateData.requiresParty = requiresParty; // غير موجود في قاعدة البيانات حالياً

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
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
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
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
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
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
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
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
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
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
    
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const subTypes = await db
      .select()
      .from(customAccountSubTypes)
      .where(eq(customAccountSubTypes.businessId, businessId))
      .orderBy(customAccountSubTypes.accountType, customAccountSubTypes.nameAr);

    res.json(subTypes);
  } catch (error) {
    console.error("خطأ في جلب الأنواع الفرعية:", error);
    res.status(500).json({ error: "فشل في جلب الأنواع الفرعية" });
  }
});

export default router;
