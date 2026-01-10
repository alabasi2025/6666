/**
 * Migration Script: تحويل البيانات الموجودة إلى نظام Subscription Accounts
 * 
 * هذا السكربت يقوم بـ:
 * 1. إنشاء حسابات مشترك افتراضية للعملاء الموجودين
 * 2. ربط العدادات الموجودة بحسابات المشترك
 * 3. ربط الفواتير الموجودة بحسابات المشترك
 * 4. ربط المدفوعات الموجودة بحسابات المشترك
 * 
 * استخدام:
 * pnpm tsx scripts/migrate-to-subscription-accounts.ts
 */

import "dotenv/config";
import { getDb } from "../server/db.js";
import { 
  subscriptionAccounts, 
  customersEnhanced, 
  metersEnhanced, 
  invoicesEnhanced, 
  paymentsEnhanced 
} from "../drizzle/schema.js";
import { eq, sql, and, isNotNull } from "drizzle-orm";
import { logger } from "../server/utils/logger.js";

async function migrateToSubscriptionAccounts() {
  console.log("=".repeat(60));
  console.log("🔄 بدء عملية Migration إلى Subscription Accounts");
  console.log("=".repeat(60));

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // الخطوة 1: إنشاء حسابات مشترك افتراضية للعملاء الموجودين
    console.log("\n📝 الخطوة 1: إنشاء حسابات مشترك افتراضية للعملاء...");
    
    const activeCustomers = await db
      .select({ 
        id: customersEnhanced.id, 
        businessId: customersEnhanced.businessId,
        fullName: customersEnhanced.fullName 
      })
      .from(customersEnhanced)
      .where(eq(customersEnhanced.isActive, true));

    console.log(`   - عدد العملاء النشطين: ${activeCustomers.length}`);

    let accountsCreated = 0;
    for (const customer of activeCustomers) {
      // التحقق من وجود حساب مشترك بالفعل
      const existingAccount = await db
        .select({ id: subscriptionAccounts.id })
        .from(subscriptionAccounts)
        .where(and(
          eq(subscriptionAccounts.customerId, customer.id),
          eq(subscriptionAccounts.accountType, 'regular')
        ))
        .limit(1);

      if (existingAccount.length > 0) {
        console.log(`   ⏭️  العميل ${customer.id} لديه حساب مشترك بالفعل - تم التخطي`);
        continue;
      }

      // إنشاء حساب مشترك افتراضي
      const accountNumber = `SUB-${customer.id}-${Date.now()}`;
      await db.insert(subscriptionAccounts).values({
        businessId: customer.businessId || 1,
        customerId: customer.id,
        accountNumber,
        accountType: 'regular',
        accountName: `حساب المشترك الرئيسي - ${customer.fullName}`,
        serviceType: 'electricity',
        paymentMode: 'postpaid',
        billingCycle: 'monthly',
        status: 'active',
        activationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      accountsCreated++;
      console.log(`   ✅ تم إنشاء حساب مشترك للعميل ${customer.id}: ${accountNumber}`);
    }

    console.log(`\n✅ تم إنشاء ${accountsCreated} حساب مشترك جديد`);

    // الخطوة 2: ربط العدادات الموجودة بحسابات المشترك
    console.log("\n📝 الخطوة 2: ربط العدادات الموجودة بحسابات المشترك...");
    
    const metersToLink = await db
      .select({
        id: metersEnhanced.id,
        customerId: metersEnhanced.customerId,
        subscriptionAccountId: metersEnhanced.subscriptionAccountId,
      })
      .from(metersEnhanced)
      .where(and(
        isNotNull(metersEnhanced.customerId),
        sql`${metersEnhanced.subscriptionAccountId} IS NULL`
      ));

    console.log(`   - عدد العدادات التي تحتاج ربط: ${metersToLink.length}`);

    let metersLinked = 0;
    for (const meter of metersToLink) {
      if (!meter.customerId) continue;

      // البحث عن حساب المشترك للعميل
      const [account] = await db
        .select({ id: subscriptionAccounts.id })
        .from(subscriptionAccounts)
        .where(and(
          eq(subscriptionAccounts.customerId, meter.customerId),
          eq(subscriptionAccounts.accountType, 'regular')
        ))
        .limit(1);

      if (!account) {
        console.log(`   ⚠️  لم يتم العثور على حساب مشترك للعداد ${meter.id} - العميل ${meter.customerId}`);
        continue;
      }

      // ربط العداد بحساب المشترك
      await db
        .update(metersEnhanced)
        .set({ 
          subscriptionAccountId: account.id,
          updatedAt: new Date(),
        })
        .where(eq(metersEnhanced.id, meter.id));

      metersLinked++;
    }

    console.log(`\n✅ تم ربط ${metersLinked} عداد بحسابات المشترك`);

    // الخطوة 3: ربط الفواتير الموجودة بحسابات المشترك
    console.log("\n📝 الخطوة 3: ربط الفواتير الموجودة بحسابات المشترك...");
    
    const invoicesToLink = await db
      .select({
        id: invoicesEnhanced.id,
        meterId: invoicesEnhanced.meterId,
        customerId: invoicesEnhanced.customerId,
        subscriptionAccountId: invoicesEnhanced.subscriptionAccountId,
      })
      .from(invoicesEnhanced)
      .where(sql`${invoicesEnhanced.subscriptionAccountId} IS NULL`);

    console.log(`   - عدد الفواتير التي تحتاج ربط: ${invoicesToLink.length}`);

    let invoicesLinked = 0;
    for (const invoice of invoicesToLink) {
      let accountId: number | null = null;

      // محاولة الحصول على حساب المشترك من العداد
      if (invoice.meterId) {
        const [meter] = await db
          .select({ subscriptionAccountId: metersEnhanced.subscriptionAccountId })
          .from(metersEnhanced)
          .where(eq(metersEnhanced.id, invoice.meterId))
          .limit(1);

        if (meter?.subscriptionAccountId) {
          accountId = meter.subscriptionAccountId;
        }
      }

      // إذا لم يُجد من العداد، جرب من العميل
      if (!accountId && invoice.customerId) {
        const [account] = await db
          .select({ id: subscriptionAccounts.id })
          .from(subscriptionAccounts)
          .where(and(
            eq(subscriptionAccounts.customerId, invoice.customerId),
            eq(subscriptionAccounts.accountType, 'regular')
          ))
          .limit(1);

        if (account) {
          accountId = account.id;
        }
      }

      if (accountId) {
        await db
          .update(invoicesEnhanced)
          .set({ 
            subscriptionAccountId: accountId,
            updatedAt: new Date(),
          })
          .where(eq(invoicesEnhanced.id, invoice.id));

        invoicesLinked++;
      }
    }

    console.log(`\n✅ تم ربط ${invoicesLinked} فاتورة بحسابات المشترك`);

    // الخطوة 4: ربط المدفوعات الموجودة بحسابات المشترك
    console.log("\n📝 الخطوة 4: ربط المدفوعات الموجودة بحسابات المشترك...");
    
    const paymentsToLink = await db
      .select({
        id: paymentsEnhanced.id,
        invoiceId: paymentsEnhanced.invoiceId,
        meterId: paymentsEnhanced.meterId,
        customerId: paymentsEnhanced.customerId,
        subscriptionAccountId: paymentsEnhanced.subscriptionAccountId,
      })
      .from(paymentsEnhanced)
      .where(sql`${paymentsEnhanced.subscriptionAccountId} IS NULL`);

    console.log(`   - عدد المدفوعات التي تحتاج ربط: ${paymentsToLink.length}`);

    let paymentsLinked = 0;
    for (const payment of paymentsToLink) {
      let accountId: number | null = null;

      // محاولة الحصول على حساب المشترك من الفاتورة
      if (payment.invoiceId) {
        const [invoice] = await db
          .select({ subscriptionAccountId: invoicesEnhanced.subscriptionAccountId })
          .from(invoicesEnhanced)
          .where(eq(invoicesEnhanced.id, payment.invoiceId))
          .limit(1);

        if (invoice?.subscriptionAccountId) {
          accountId = invoice.subscriptionAccountId;
        }
      }

      // إذا لم يُجد من الفاتورة، جرب من العداد
      if (!accountId && payment.meterId) {
        const [meter] = await db
          .select({ subscriptionAccountId: metersEnhanced.subscriptionAccountId })
          .from(metersEnhanced)
          .where(eq(metersEnhanced.id, payment.meterId))
          .limit(1);

        if (meter?.subscriptionAccountId) {
          accountId = meter.subscriptionAccountId;
        }
      }

      // إذا لم يُجد من العداد، جرب من العميل
      if (!accountId && payment.customerId) {
        const [account] = await db
          .select({ id: subscriptionAccounts.id })
          .from(subscriptionAccounts)
          .where(and(
            eq(subscriptionAccounts.customerId, payment.customerId),
            eq(subscriptionAccounts.accountType, 'regular')
          ))
          .limit(1);

        if (account) {
          accountId = account.id;
        }
      }

      if (accountId) {
        await db
          .update(paymentsEnhanced)
          .set({ 
            subscriptionAccountId: accountId,
            updatedAt: new Date(),
          })
          .where(eq(paymentsEnhanced.id, payment.id));

        paymentsLinked++;
      }
    }

    console.log(`\n✅ تم ربط ${paymentsLinked} دفعة بحسابات المشترك`);

    // ملخص النتائج
    console.log("\n" + "=".repeat(60));
    console.log("✅ Migration اكتمل بنجاح!");
    console.log("=".repeat(60));
    console.log(`📊 الملخص:`);
    console.log(`   - حسابات مشترك جديدة: ${accountsCreated}`);
    console.log(`   - عدادات مربوطة: ${metersLinked}`);
    console.log(`   - فواتير مربوطة: ${invoicesLinked}`);
    console.log(`   - مدفوعات مربوطة: ${paymentsLinked}`);
    console.log("=".repeat(60));

    logger.info("Migration to Subscription Accounts completed successfully", {
      accountsCreated,
      metersLinked,
      invoicesLinked,
      paymentsLinked,
    });

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ خطأ أثناء Migration:", error.message);
    logger.error("Migration to Subscription Accounts failed", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// تشغيل Migration
migrateToSubscriptionAccounts();
