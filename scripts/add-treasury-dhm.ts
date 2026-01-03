import "dotenv/config";
import { and, eq, like } from "drizzle-orm";
import { customSubSystems, customTreasuries, customTreasuryCurrencies } from "../drizzle/schema";
import {
  customAccounts as v2Accounts,
  customCurrencies as v2Currencies,
} from "../drizzle/schemas/customSystemV2";
import { getDb } from "../server/db";

/**
 * Script: add-treasury-dhm
 * الهدف: إنشاء خزينة "صندوق التحصيل والتوريد الدهمية" في النظام الفرعي "أعمال الحديدة"
 * مع ربطها بالحساب الفرعي المقابل وإضافة العملة الافتراضية.
 */
async function main() {
  const businessId = 1;
  const treasuryNameAr = "صندوق التحصيل والتوريد الدهمية";
  const treasuryCode = "CASH-DHM-01";

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 1) العثور على النظام الفرعي "أعمال الحديدة"
  const [subSystem] = await db
    .select()
    .from(customSubSystems)
    .where(
      and(
        eq(customSubSystems.businessId, businessId),
        like(customSubSystems.nameAr, "%الحديدة%")
      )
    )
    .limit(1);
  if (!subSystem) {
    throw new Error('لم يتم العثور على النظام الفرعي "أعمال الحديدة"');
  }

  // 2) العثور على الحساب الفرعي المطلوب
  const [account] = await db
    .select()
    .from(v2Accounts)
    .where(
      and(
        eq(v2Accounts.businessId, businessId),
        like(v2Accounts.accountNameAr, "%التحصيل والتوريد الدهمية%")
      )
    )
    .limit(1);
  if (!account) {
    throw new Error('لم يتم العثور على الحساب "صندوق التحصيل والتوريد الدهمية"');
  }

  // 3) اختيار العملة (YER إن وجدت وإلا SAR)
  const [yer] = await db
    .select()
    .from(v2Currencies)
    .where(and(eq(v2Currencies.businessId, businessId), eq(v2Currencies.code, "YER")))
    .limit(1);
  const [sar] = await db
    .select()
    .from(v2Currencies)
    .where(and(eq(v2Currencies.businessId, businessId), eq(v2Currencies.code, "SAR")))
    .limit(1);
  const currency = yer || sar;
  if (!currency) {
    throw new Error("لم يتم العثور على أي عملة (YER أو SAR)");
  }

  // 4) التحقق من وجود خزينة بنفس الاسم أو الكود
  const existing = await db
    .select()
    .from(customTreasuries)
    .where(
      and(
        eq(customTreasuries.businessId, businessId),
        like(customTreasuries.nameAr, treasuryNameAr)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    console.log("الخزينة موجودة مسبقاً، لن يتم التكرار.");
    return;
  }

  // 5) إنشاء الخزينة
  const insertRes = await db.insert(customTreasuries).values({
    businessId,
    subSystemId: subSystem.id,
    code: treasuryCode,
    nameAr: treasuryNameAr,
    nameEn: "Dhm Collection Treasury",
    treasuryType: "cash",
    accountId: account.id,
    currency: currency.code,
    openingBalance: "0",
    currentBalance: "0",
    description: "صندوق التحصيل والتوريد - الدهمية",
  });
  const treasuryId = insertRes[0].insertId;

  // 6) ربط العملة بالخزينة
  await db.insert(customTreasuryCurrencies).values({
    businessId,
    treasuryId,
    currencyId: currency.id,
    isDefault: true,
    openingBalance: "0",
    currentBalance: "0",
  });

  console.log(
    `✅ تم إنشاء الخزينة '${treasuryNameAr}' في النظام الفرعي '${subSystem.nameAr}' وربطها بالحساب '${account.accountNameAr}' (عملة: ${currency.code})`
  );
}

main().catch((err) => {
  console.error("❌ فشل إنشاء الخزينة:", err.message);
  process.exit(1);
});

