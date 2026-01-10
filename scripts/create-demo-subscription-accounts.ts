/**
 * سكريبت لإضافة بيانات تجريبية - حسابات المشترك
 * Script to create demo data - Subscription Accounts
 */

import "dotenv/config";
import { getDb } from "../server/db.js";
import { 
  customersEnhanced, 
  subscriptionAccounts,
  metersEnhanced,
  billingPeriods,
  meterReadingsEnhanced,
  invoicesEnhanced,
  paymentsEnhanced,
  customerWallets
} from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { logger } from "../server/utils/logger.js";

async function createDemoData() {
  console.log("=".repeat(70));
  console.log("📝 إنشاء بيانات تجريبية - حسابات المشترك");
  console.log("=".repeat(70));

  try {
    const db = await getDb();
    if (!db) {
      console.error("\n❌ قاعدة البيانات غير متاحة");
      process.exit(1);
    }

    console.log("\n1️⃣  التحقق من وجود بيانات تجريبية...");

    // التحقق من وجود عملاء
    const existingCustomers = await db.select({ 
      id: customersEnhanced.id,
      fullName: customersEnhanced.fullName 
    })
    .from(customersEnhanced)
    .limit(5);

    if (existingCustomers.length === 0) {
      console.log("\n2️⃣  إنشاء عميل تجريبي...");
      
      // إنشاء عميل تجريبي
      const [customerResult] = await db.insert(customersEnhanced).values({
        businessId: 1,
        accountNumber: `CUST-DEMO-${Date.now()}`,
        fullName: "أحمد محمد علي",
        fullNameEn: "Ahmed Mohammed Ali",
        customerType: "individual",
        category: "residential",
        serviceTier: "basic",
        phone: "0501234567",
        email: "ahmed@example.com",
        nationalId: "1234567890",
        address: "الرياض، حي النخيل",
        status: "active",
        balance: "0",
        balanceDue: "0",
        isActive: true,
      }).returning({ id: customersEnhanced.id });

      const customerId = customerResult.id;
      console.log(`   ✅ تم إنشاء العميل: ID=${customerId}, Name=أحمد محمد علي`);

      // إنشاء حساب مشترك تجريبي
      console.log("\n3️⃣  إنشاء حساب مشترك تجريبي...");
      const accountNumber = `SUB-${customerId}-${Date.now()}`;
      const [accountResult] = await db.insert(subscriptionAccounts).values({
        businessId: 1,
        customerId: customerId,
        accountNumber,
        accountType: 'regular',
        accountName: 'حساب المشترك الرئيسي',
        serviceType: 'electricity',
        paymentMode: 'prepaid',
        billingCycle: 'monthly',
        creditLimit: '1000',
        depositAmount: '500',
        status: 'active',
        activationDate: new Date(),
      }).returning({ id: subscriptionAccounts.id });

      const subscriptionAccountId = accountResult.id;
      console.log(`   ✅ تم إنشاء حساب المشترك: ID=${subscriptionAccountId}, Number=${accountNumber}`);

      // إنشاء عداد تجريبي
      console.log("\n4️⃣  إنشاء عداد تجريبي...");
      const [meterResult] = await db.insert(metersEnhanced).values({
        businessId: 1,
        customerId: customerId,
        subscriptionAccountId: subscriptionAccountId,
        meterNumber: `MTR-${Date.now()}`,
        serialNumber: `SN-${Date.now()}`,
        meterType: "single_phase",
        category: "offline",
        currentReading: "1000",
        previousReading: "0",
        balance: "0",
        balanceDue: "0",
        status: "active",
        isActive: true,
        installationDate: new Date(),
      }).returning({ id: metersEnhanced.id });

      const meterId = meterResult.id;
      console.log(`   ✅ تم إنشاء العداد: ID=${meterId}, Number=${meterResult.meterNumber}`);

      // إنشاء فترة فوترة تجريبية
      console.log("\n5️⃣  إنشاء فترة فوترة تجريبية...");
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const [periodResult] = await db.insert(billingPeriods).values({
        businessId: 1,
        name: `فترة ${periodStart.toLocaleDateString('ar-SA')}`,
        startDate: periodStart,
        endDate: periodEnd,
        status: "active",
      }).returning({ id: billingPeriods.id });

      const billingPeriodId = periodResult.id;
      console.log(`   ✅ تم إنشاء فترة الفوترة: ID=${billingPeriodId}`);

      // إنشاء قراءة عداد تجريبية
      console.log("\n6️⃣  إنشاء قراءة عداد تجريبية...");
      const [readingResult] = await db.insert(meterReadingsEnhanced).values({
        meterId: meterId,
        billingPeriodId: billingPeriodId,
        readingDate: new Date(),
        previousReading: "0",
        currentReading: "1000",
        consumption: "1000",
        status: "confirmed",
      }).returning({ id: meterReadingsEnhanced.id });

      const readingId = readingResult.id;
      console.log(`   ✅ تم إنشاء القراءة: ID=${readingId}, Consumption=1000`);

      // إنشاء فاتورة تجريبية
      console.log("\n7️⃣  إنشاء فاتورة تجريبية...");
      const invoiceNo = `INV-${Date.now()}`;
      const consumptionAmount = 1000 * 0.3; // 0.3 ريال لكل كيلووات
      const vatAmount = consumptionAmount * 0.15;
      const totalAmount = consumptionAmount + vatAmount;

      const [invoiceResult] = await db.insert(invoicesEnhanced).values({
        businessId: 1,
        customerId: customerId,
        subscriptionAccountId: subscriptionAccountId,
        meterId: meterId,
        meterReadingId: readingId,
        billingPeriodId: billingPeriodId,
        invoiceNo,
        invoiceDate: new Date(),
        dueDate: periodEnd,
        periodStart,
        periodEnd,
        meterNumber: meterResult.meterNumber || "",
        previousReading: "0",
        currentReading: "1000",
        totalConsumptionKWH: "1000",
        priceKwh: "0.3",
        consumptionAmount: consumptionAmount.toFixed(2),
        fixedCharges: "50",
        totalFees: "0",
        vatRate: "15",
        vatAmount: vatAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        previousBalanceDue: "0",
        finalAmount: totalAmount.toFixed(2),
        paidAmount: "0",
        balanceDue: totalAmount.toFixed(2),
        status: "generated",
      }).returning({ id: invoicesEnhanced.id });

      const invoiceId = invoiceResult.id;
      console.log(`   ✅ تم إنشاء الفاتورة: ID=${invoiceId}, Number=${invoiceNo}, Amount=${totalAmount.toFixed(2)}`);

      // تحديث رصيد حساب المشترك
      await db.update(subscriptionAccounts)
        .set({ 
          balanceDue: totalAmount.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionAccounts.id, subscriptionAccountId));
      console.log(`   ✅ تم تحديث رصيد حساب المشترك: balanceDue=${totalAmount.toFixed(2)}`);

      // إنشاء دفعة تجريبية
      console.log("\n8️⃣  إنشاء دفعة تجريبية...");
      const paymentNumber = `PAY-${Date.now()}`;
      const paymentAmount = 150;

      const [paymentResult] = await db.insert(paymentsEnhanced).values({
        businessId: 1,
        customerId: customerId,
        subscriptionAccountId: subscriptionAccountId,
        invoiceId: invoiceId,
        paymentNumber,
        paymentDate: new Date(),
        amount: paymentAmount.toFixed(2),
        paymentMethodId: 1, // نقد
        status: "completed",
        referenceNumber: `REF-${Date.now()}`,
      }).returning({ id: paymentsEnhanced.id });

      const paymentId = paymentResult.id;
      console.log(`   ✅ تم إنشاء الدفعة: ID=${paymentId}, Number=${paymentNumber}, Amount=${paymentAmount}`);

      // تحديث الفاتورة
      const remainingAmount = totalAmount - paymentAmount;
      await db.update(invoicesEnhanced)
        .set({
          paidAmount: paymentAmount.toFixed(2),
          balanceDue: remainingAmount > 0 ? remainingAmount.toFixed(2) : "0",
          status: remainingAmount <= 0 ? "paid" : "partial",
        })
        .where(eq(invoicesEnhanced.id, invoiceId));
      console.log(`   ✅ تم تحديث الفاتورة: paidAmount=${paymentAmount}, balanceDue=${remainingAmount.toFixed(2)}`);

      // تحديث رصيد حساب المشترك بعد الدفعة
      const [currentAccount] = await db.select({
        balanceDue: subscriptionAccounts.balanceDue,
        balance: subscriptionAccounts.balance,
      })
      .from(subscriptionAccounts)
      .where(eq(subscriptionAccounts.id, subscriptionAccountId));

      const newBalanceDue = Math.max(0, parseFloat(currentAccount?.balanceDue?.toString() || "0") - paymentAmount);
      const newBalance = parseFloat(currentAccount?.balance?.toString() || "0") + paymentAmount;

      await db.update(subscriptionAccounts)
        .set({
          balance: newBalance.toFixed(2),
          balanceDue: newBalanceDue.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionAccounts.id, subscriptionAccountId));
      console.log(`   ✅ تم تحديث رصيد حساب المشترك: balance=${newBalance.toFixed(2)}, balanceDue=${newBalanceDue.toFixed(2)}`);

      console.log("\n" + "=".repeat(70));
      console.log("✅ تم إنشاء البيانات التجريبية بنجاح!");
      console.log("=".repeat(70));
      console.log("\n📋 البيانات المنشأة:");
      console.log(`   👤 العميل: ID=${customerId}, Name=أحمد محمد علي`);
      console.log(`   💳 حساب المشترك: ID=${subscriptionAccountId}, Number=${accountNumber}`);
      console.log(`   📊 العداد: ID=${meterId}, Number=${meterResult.meterNumber}`);
      console.log(`   📄 الفاتورة: ID=${invoiceId}, Number=${invoiceNo}, Amount=${totalAmount.toFixed(2)}`);
      console.log(`   💰 الدفعة: ID=${paymentId}, Number=${paymentNumber}, Amount=${paymentAmount}`);
      console.log("\n🔗 الروابط للاختبار:");
      console.log(`   http://localhost:8000/dashboard/billing/customers/${customerId}`);
      console.log(`   http://localhost:8000/dashboard/billing/subscription-accounts/${customerId}`);
      console.log(`   http://localhost:8000/dashboard/billing/invoices`);
      console.log(`   http://localhost:8000/dashboard/billing/payments`);
      console.log("=".repeat(70));

      logger.info("[Demo] Created demo subscription accounts data", {
        customerId,
        subscriptionAccountId,
        meterId,
        invoiceId,
        paymentId,
      });

    } else {
      console.log(`   ✅ يوجد ${existingCustomers.length} عميل موجود`);
      
      // استخدام أول عميل موجود
      const customerId = existingCustomers[0].id;
      console.log(`\n2️⃣  استخدام العميل الموجود: ID=${customerId}, Name=${existingCustomers[0].fullName}`);

      // التحقق من وجود حساب مشترك للعميل
      const existingAccounts = await db.select({ id: subscriptionAccounts.id })
        .from(subscriptionAccounts)
        .where(eq(subscriptionAccounts.customerId, customerId));

      console.log(`   ✅ يوجد ${existingAccounts.length} حساب مشترك موجود`);

      if (existingAccounts.length === 0) {
        // إنشاء حساب مشترك
        console.log("\n3️⃣  إنشاء حساب مشترك تجريبي...");
        const accountNumber = `SUB-${customerId}-${Date.now()}`;
        const [accountResult] = await db.insert(subscriptionAccounts).values({
          businessId: 1,
          customerId: customerId,
          accountNumber,
          accountType: 'regular',
          accountName: 'حساب المشترك الرئيسي',
          serviceType: 'electricity',
          paymentMode: 'prepaid',
          billingCycle: 'monthly',
          creditLimit: '1000',
          depositAmount: '500',
          status: 'active',
          activationDate: new Date(),
        }).returning({ id: subscriptionAccounts.id });

        const subscriptionAccountId = accountResult.id;
        console.log(`   ✅ تم إنشاء حساب المشترك: ID=${subscriptionAccountId}, Number=${accountNumber}`);

        // إنشاء عداد تجريبي
        console.log("\n4️⃣  إنشاء عداد تجريبي...");
        const [meterResult] = await db.insert(metersEnhanced).values({
          businessId: 1,
          customerId: customerId,
          subscriptionAccountId: subscriptionAccountId,
          meterNumber: `MTR-${Date.now()}`,
          serialNumber: `SN-${Date.now()}`,
          meterType: "single_phase",
          category: "offline",
          currentReading: "1500",
          previousReading: "1000",
          balance: "0",
          balanceDue: "0",
          status: "active",
          isActive: true,
          installationDate: new Date(),
        }).returning({ id: metersEnhanced.id });

        const meterId = meterResult.id;
        console.log(`   ✅ تم إنشاء العداد: ID=${meterId}, Number=${meterResult.meterNumber}`);

        console.log("\n" + "=".repeat(70));
        console.log("✅ تم إنشاء البيانات بنجاح!");
        console.log("=".repeat(70));
        console.log(`\n🔗 الروابط للاختبار:`);
        console.log(`   http://localhost:8000/dashboard/billing/customers/${customerId}`);
        console.log(`   http://localhost:8000/dashboard/billing/subscription-accounts/${customerId}`);
        console.log("=".repeat(70));
      } else {
        const subscriptionAccountId = existingAccounts[0].id;
        
        // التحقق من وجود عدادات
        const existingMeters = await db.select({ id: metersEnhanced.id })
          .from(metersEnhanced)
          .where(eq(metersEnhanced.subscriptionAccountId, subscriptionAccountId));

        if (existingMeters.length === 0) {
          console.log("\n3️⃣  إنشاء عداد تجريبي...");
          const [meterResult] = await db.insert(metersEnhanced).values({
            businessId: 1,
            customerId: customerId,
            subscriptionAccountId: subscriptionAccountId,
            meterNumber: `MTR-${Date.now()}`,
            serialNumber: `SN-${Date.now()}`,
            meterType: "single_phase",
            category: "offline",
            currentReading: "1500",
            previousReading: "1000",
            balance: "0",
            balanceDue: "0",
            status: "active",
            isActive: true,
            installationDate: new Date(),
          }).returning({ id: metersEnhanced.id });

          const meterId = meterResult.id;
          console.log(`   ✅ تم إنشاء العداد: ID=${meterId}, Number=${meterResult.meterNumber}`);

          console.log("\n" + "=".repeat(70));
          console.log("✅ تم إنشاء العداد بنجاح!");
          console.log("=".repeat(70));
        } else {
          console.log(`   ✅ يوجد ${existingMeters.length} عداد موجود`);
        }

        // إنشاء حساب مشترك إضافي من نوع مختلف
        console.log("\n4️⃣  إنشاء حساب مشترك إضافي (STS)...");
        const accountNumber2 = `SUB-${customerId}-STS-${Date.now()}`;
        const [accountResult2] = await db.insert(subscriptionAccounts).values({
          businessId: 1,
          customerId: customerId,
          accountNumber: accountNumber2,
          accountType: 'sts',
          accountName: 'حساب STS',
          serviceType: 'electricity',
          paymentMode: 'prepaid',
          billingCycle: 'monthly',
          creditLimit: '2000',
          depositAmount: '1000',
          status: 'active',
          activationDate: new Date(),
        }).returning({ id: subscriptionAccounts.id });

        const subscriptionAccountId2 = accountResult2.id;
        console.log(`   ✅ تم إنشاء حساب STS: ID=${subscriptionAccountId2}, Number=${accountNumber2}`);

        // التحقق من وجود فواتير ومدفوعات
        const existingInvoices = await db.select({ id: invoicesEnhanced.id })
          .from(invoicesEnhanced)
          .where(eq(invoicesEnhanced.customerId, customerId));

        const existingPayments = await db.select({ id: paymentsEnhanced.id })
          .from(paymentsEnhanced)
          .where(eq(paymentsEnhanced.customerId, customerId));

        if (existingInvoices.length === 0 || existingPayments.length === 0) {
          // إنشاء فترة فوترة
          console.log("\n5️⃣  إنشاء فترة فوترة تجريبية...");
          const periodStart = new Date();
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          const [periodResult] = await db.insert(billingPeriods).values({
            businessId: 1,
            name: `فترة ${periodStart.toLocaleDateString('ar-SA')}`,
            startDate: periodStart,
            endDate: periodEnd,
            status: "active",
          }).returning({ id: billingPeriods.id });

          const billingPeriodId = periodResult.id;
          console.log(`   ✅ تم إنشاء فترة الفوترة: ID=${billingPeriodId}`);

          // إنشاء قراءة عداد
          if (existingMeters.length > 0) {
            const meterId = existingMeters[0].id;
            console.log("\n6️⃣  إنشاء قراءة عداد تجريبية...");
            const [readingResult] = await db.insert(meterReadingsEnhanced).values({
              meterId: meterId,
              billingPeriodId: billingPeriodId,
              readingDate: new Date(),
              previousReading: "1000",
              currentReading: "2500",
              consumption: "1500",
              status: "confirmed",
            }).returning({ id: meterReadingsEnhanced.id });

            const readingId = readingResult.id;
            console.log(`   ✅ تم إنشاء القراءة: ID=${readingId}, Consumption=1500`);

            // إنشاء فاتورة
            if (existingInvoices.length === 0) {
              console.log("\n7️⃣  إنشاء فاتورة تجريبية...");
              const invoiceNo = `INV-${Date.now()}`;
              const consumptionAmount = 1500 * 0.3; // 0.3 ريال لكل كيلووات
              const vatAmount = consumptionAmount * 0.15;
              const totalAmount = consumptionAmount + vatAmount + 50; // + رسوم ثابتة

              const [invoiceResult] = await db.insert(invoicesEnhanced).values({
                businessId: 1,
                customerId: customerId,
                subscriptionAccountId: subscriptionAccountId,
                meterId: meterId,
                meterReadingId: readingId,
                billingPeriodId: billingPeriodId,
                invoiceNo,
                invoiceDate: new Date(),
                dueDate: periodEnd,
                periodStart,
                periodEnd,
                meterNumber: (await db.select({ meterNumber: metersEnhanced.meterNumber }).from(metersEnhanced).where(eq(metersEnhanced.id, meterId)).limit(1))[0]?.meterNumber || "",
                previousReading: "1000",
                currentReading: "2500",
                totalConsumptionKWH: "1500",
                priceKwh: "0.3",
                consumptionAmount: consumptionAmount.toFixed(2),
                fixedCharges: "50",
                totalFees: "0",
                vatRate: "15",
                vatAmount: vatAmount.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
                previousBalanceDue: "0",
                finalAmount: totalAmount.toFixed(2),
                paidAmount: "0",
                balanceDue: totalAmount.toFixed(2),
                status: "generated",
              }).returning({ id: invoicesEnhanced.id });

              const invoiceId = invoiceResult.id;
              console.log(`   ✅ تم إنشاء الفاتورة: ID=${invoiceId}, Number=${invoiceNo}, Amount=${totalAmount.toFixed(2)}`);

              // تحديث رصيد حساب المشترك
              await db.update(subscriptionAccounts)
                .set({ 
                  balanceDue: totalAmount.toFixed(2),
                  updatedAt: new Date(),
                })
                .where(eq(subscriptionAccounts.id, subscriptionAccountId));

              // إنشاء دفعة
              if (existingPayments.length === 0) {
                console.log("\n8️⃣  إنشاء دفعة تجريبية...");
                const paymentNumber = `PAY-${Date.now()}`;
                const paymentAmount = 200;

                const [paymentResult] = await db.insert(paymentsEnhanced).values({
                  businessId: 1,
                  customerId: customerId,
                  subscriptionAccountId: subscriptionAccountId,
                  invoiceId: invoiceId,
                  paymentNumber,
                  paymentDate: new Date(),
                  amount: paymentAmount.toFixed(2),
                  paymentMethodId: 1, // نقد
                  status: "completed",
                  referenceNumber: `REF-${Date.now()}`,
                }).returning({ id: paymentsEnhanced.id });

                const paymentId = paymentResult.id;
                console.log(`   ✅ تم إنشاء الدفعة: ID=${paymentId}, Number=${paymentNumber}, Amount=${paymentAmount}`);

                // تحديث الفاتورة
                const remainingAmount = totalAmount - paymentAmount;
                await db.update(invoicesEnhanced)
                  .set({
                    paidAmount: paymentAmount.toFixed(2),
                    balanceDue: remainingAmount > 0 ? remainingAmount.toFixed(2) : "0",
                    status: remainingAmount <= 0 ? "paid" : "partial",
                  })
                  .where(eq(invoicesEnhanced.id, invoiceId));

                // تحديث رصيد حساب المشترك
                const [currentAccount] = await db.select({
                  balanceDue: subscriptionAccounts.balanceDue,
                  balance: subscriptionAccounts.balance,
                })
                .from(subscriptionAccounts)
                .where(eq(subscriptionAccounts.id, subscriptionAccountId));

                const newBalanceDue = Math.max(0, parseFloat(currentAccount?.balanceDue?.toString() || "0") - paymentAmount);
                const newBalance = parseFloat(currentAccount?.balance?.toString() || "0") + paymentAmount;

                await db.update(subscriptionAccounts)
                  .set({
                    balance: newBalance.toFixed(2),
                    balanceDue: newBalanceDue.toFixed(2),
                    updatedAt: new Date(),
                  })
                  .where(eq(subscriptionAccounts.id, subscriptionAccountId));

                console.log(`   ✅ تم تحديث رصيد حساب المشترك: balance=${newBalance.toFixed(2)}, balanceDue=${newBalanceDue.toFixed(2)}`);
              }
            }
          }
        }

        console.log("\n" + "=".repeat(70));
        console.log("✅ تم إنشاء البيانات الإضافية بنجاح!");
        console.log("=".repeat(70));
        console.log(`\n📋 البيانات المتاحة:`);
        console.log(`   👤 العميل: ID=${customerId}, Name=${existingCustomers[0].fullName}`);
        console.log(`   💳 حسابات المشترك: ${existingAccounts.length + 1} حساب`);
        console.log(`\n🔗 الروابط للاختبار:`);
        console.log(`   http://localhost:8000/dashboard/billing/customers/${customerId}`);
        console.log(`   http://localhost:8000/dashboard/billing/subscription-accounts/${customerId}`);
        console.log(`   http://localhost:8000/dashboard/billing/invoices`);
        console.log(`   http://localhost:8000/dashboard/billing/payments`);
        console.log("=".repeat(70));
      }
    }

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ خطأ أثناء إنشاء البيانات:", error.message);
    console.error(error.stack);
    logger.error("[Demo] Failed to create demo data", { error: error.message });
    process.exit(1);
  }
}

createDemoData();
