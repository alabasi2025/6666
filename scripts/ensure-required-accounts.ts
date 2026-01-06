/**
 * سكريبت للتحقق من وجود الحسابات المحاسبية المطلوبة وإنشائها
 * Script to verify and create required accounting accounts
 */

import { getDb } from "../server/db";
import { accounts, fiscalPeriods } from "../drizzle/schemas/accounting";
import { eq, and } from "drizzle-orm";
import { logger } from "../server/utils/logger";

// الحسابات المطلوبة لمحرك القيود التلقائي
const REQUIRED_ACCOUNTS = [
  {
    code: "1100",
    nameAr: "النقدية",
    nameEn: "Cash",
    systemModule: "finance",
    nature: "debit",
    isCashAccount: true,
  },
  {
    code: "1110",
    nameAr: "البنك",
    nameEn: "Bank",
    systemModule: "finance",
    nature: "debit",
    isBankAccount: true,
  },
  {
    code: "1200",
    nameAr: "العملاء",
    nameEn: "Customers",
    systemModule: "customers",
    nature: "debit",
  },
  {
    code: "4100",
    nameAr: "الإيرادات",
    nameEn: "Revenue",
    systemModule: "billing",
    nature: "credit",
  },
  {
    code: "4200",
    nameAr: "إيرادات مسبقة الدفع",
    nameEn: "Prepaid Revenue",
    systemModule: "billing",
    nature: "credit",
  },
  {
    code: "2100",
    nameAr: "الموردون",
    nameEn: "Suppliers",
    systemModule: "procurement",
    nature: "credit",
  },
  {
    code: "5100",
    nameAr: "مخزون",
    nameEn: "Inventory",
    systemModule: "inventory",
    nature: "debit",
  },
  {
    code: "6100",
    nameAr: "تكلفة البضاعة المباعة",
    nameEn: "Cost of Goods Sold",
    systemModule: "inventory",
    nature: "debit",
  },
  {
    code: "7100",
    nameAr: "مصروفات الرواتب",
    nameEn: "Salaries Expense",
    systemModule: "hr",
    nature: "debit",
  },
  {
    code: "7200",
    nameAr: "مصروفات الإهلاك",
    nameEn: "Depreciation Expense",
    systemModule: "assets",
    nature: "debit",
  },
  {
    code: "1300",
    nameAr: "إهلاك متراكم",
    nameEn: "Accumulated Depreciation",
    systemModule: "assets",
    nature: "credit",
  },
  {
    code: "1400",
    nameAr: "ودائع العملاء",
    nameEn: "Customer Deposits",
    systemModule: "customers",
    nature: "credit",
  },
];

/**
 * التحقق من وجود حساب محاسبي
 */
async function accountExists(
  db: any,
  businessId: number,
  code: string
): Promise<boolean> {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.businessId, businessId), eq(accounts.code, code)))
    .limit(1);

  return !!account;
}

/**
 * إنشاء حساب محاسبي
 */
async function createAccount(
  db: any,
  businessId: number,
  accountData: typeof REQUIRED_ACCOUNTS[0],
  createdBy: number = 1
): Promise<number> {
  const [result] = await db
    .insert(accounts)
    .values({
      businessId,
      code: accountData.code,
      nameAr: accountData.nameAr,
      nameEn: accountData.nameEn,
      systemModule: accountData.systemModule,
      nature: accountData.nature,
      isCashAccount: accountData.isCashAccount || false,
      isBankAccount: accountData.isBankAccount || false,
      isActive: true,
      level: 1,
      accountType: "main",
    })
    .returning({ id: accounts.id });

  return result.id;
}

/**
 * التحقق من وجود فترة محاسبية نشطة
 */
async function ensureActiveFiscalPeriod(
  db: any,
  businessId: number
): Promise<number> {
  const [period] = await db
    .select()
    .from(fiscalPeriods)
    .where(
      and(
        eq(fiscalPeriods.businessId, businessId),
        eq(fiscalPeriods.isActive, true)
      )
    )
    .limit(1);

  if (period) {
    return period.id;
  }

  // إنشاء فترة محاسبية جديدة للعام الحالي
  const currentYear = new Date().getFullYear();
  const [newPeriod] = await db
    .insert(fiscalPeriods)
    .values({
      businessId,
      year: currentYear,
      period: 1,
      nameAr: `الفترة المحاسبية ${currentYear}`,
      nameEn: `Fiscal Period ${currentYear}`,
      startDate: new Date(`${currentYear}-01-01`),
      endDate: new Date(`${currentYear}-12-31`),
      status: "open",
      isActive: true,
    })
    .returning({ id: fiscalPeriods.id });

  logger.info(`تم إنشاء فترة محاسبية جديدة: ${currentYear}`);
  return newPeriod.id;
}

/**
 * التحقق من جميع الحسابات المطلوبة وإنشاؤها
 */
export async function ensureRequiredAccounts(
  businessId: number = 1,
  createdBy: number = 1
): Promise<{
  success: boolean;
  created: number;
  existing: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("قاعدة البيانات غير متاحة");
  }

  let created = 0;
  let existing = 0;
  const errors: string[] = [];

  try {
    // التحقق من الفترة المحاسبية
    await ensureActiveFiscalPeriod(db, businessId);

    // التحقق من كل حساب
    for (const accountData of REQUIRED_ACCOUNTS) {
      try {
        const exists = await accountExists(db, businessId, accountData.code);
        if (exists) {
          existing++;
          logger.info(
            `✓ الحساب ${accountData.code} (${accountData.nameAr}) موجود بالفعل`
          );
        } else {
          await createAccount(db, businessId, accountData, createdBy);
          created++;
          logger.info(
            `✓ تم إنشاء الحساب ${accountData.code} (${accountData.nameAr})`
          );
        }
      } catch (error: any) {
        const errorMsg = `خطأ في الحساب ${accountData.code}: ${error.message}`;
        errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    return {
      success: errors.length === 0,
      created,
      existing,
      errors,
    };
  } catch (error: any) {
    logger.error(`خطأ عام: ${error.message}`);
    throw error;
  }
}

// تشغيل السكريبت مباشرة إذا تم استدعاؤه من سطر الأوامر
if (require.main === module) {
  ensureRequiredAccounts()
    .then((result) => {
      console.log("\n=== نتائج التحقق من الحسابات ===");
      console.log(`تم إنشاء: ${result.created} حساب`);
      console.log(`موجود بالفعل: ${result.existing} حساب`);
      if (result.errors.length > 0) {
        console.log(`\nأخطاء:`);
        result.errors.forEach((err) => console.log(`  - ${err}`));
      }
      console.log(`\nالحالة: ${result.success ? "✓ نجح" : "✗ فشل"}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("خطأ:", error);
      process.exit(1);
    });
}

