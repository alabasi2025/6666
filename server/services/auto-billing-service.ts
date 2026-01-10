/**
 * Auto-Billing Service
 * خدمة الفوترة التلقائية للعدادات التقليدية
 */

import { logger } from '../utils/logger';
import { getDb } from '../db';
import { eq, and, lt, sql, desc } from 'drizzle-orm';
import { metersEnhanced, meterReadingsEnhanced, invoicesEnhanced, customersEnhanced } from '../../drizzle/schema';
import { AutoJournalEngine } from '../core/auto-journal-engine';
import { smsChannel } from '../notifications/channels/sms';
import { whatsappChannel } from '../notifications/channels/whatsapp';
import { emailChannel } from '../notifications/channels/email';

interface AutoBillingResult {
  success: number;
  failed: number;
  errors: Array<{ meterId: number; error: string }>;
  invoicesCreated: number[];
}

class AutoBillingService {
  /**
   * تنفيذ الفوترة التلقائية لجميع العدادات التقليدية
   */
  async run(): Promise<AutoBillingResult> {
    logger.info('Starting auto-billing process...');
    
    const result: AutoBillingResult = {
      success: 0,
      failed: 0,
      errors: [],
      invoicesCreated: [],
    };

    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // جلب جميع العدادات التقليدية النشطة مع subscriptionAccountId
      const metersData = await db
        .select({
          id: metersEnhanced.id,
          businessId: metersEnhanced.businessId,
          customerId: metersEnhanced.customerId,
          subscriptionAccountId: metersEnhanced.subscriptionAccountId,
          meterNumber: metersEnhanced.meterNumber,
          tariffId: metersEnhanced.tariffId,
          category: metersEnhanced.category,
          isActive: metersEnhanced.isActive,
          customerId: customersEnhanced.id,
          customerFullName: customersEnhanced.fullName,
          customerPhone: customersEnhanced.phone,
          customerEmail: customersEnhanced.email,
        })
        .from(metersEnhanced)
        .leftJoin(customersEnhanced, eq(metersEnhanced.customerId, customersEnhanced.id))
        .where(and(
          eq(metersEnhanced.category, 'traditional'),
          eq(metersEnhanced.isActive, true)
        ));

      // تحويل البيانات إلى تنسيق متوافق مع الكود الموجود
      const meters = metersData.map(m => ({
        id: m.id,
        businessId: m.businessId,
        customerId: m.customerId,
        subscriptionAccountId: m.subscriptionAccountId,
        meterNumber: m.meterNumber,
        tariffId: m.tariffId,
        category: m.category,
        isActive: m.isActive,
        customer: m.customerId ? {
          id: m.customerId,
          fullName: m.customerFullName,
          phone: m.customerPhone,
          email: m.customerEmail,
        } : null,
      }));

      logger.info(`Found ${meters.length} traditional meters for auto-billing`);

      for (const meter of meters) {
        try {
          await this.billMeter(meter, db);
          result.success++;
        } catch (error: any) {
          logger.error(`Failed to bill meter ${meter.id}`, { error: error.message });
          result.failed++;
          result.errors.push({
            meterId: meter.id,
            error: error.message,
          });
        }
      }

      logger.info('Auto-billing process completed', {
        success: result.success,
        failed: result.failed,
        total: meters.length
      });

      return result;
    } catch (error: any) {
      logger.error('Auto-billing process failed', { error: error.message });
      throw error;
    }
  }

  /**
   * فوترة عداد واحد
   */
  private async billMeter(meter: any, db: any): Promise<number | null> {
    try {
      // 1. التحقق من وجود قراءة حديثة (خلال آخر 10 أيام)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const [lastReading] = await db
        .select()
        .from(meterReadingsEnhanced)
        .where(eq(meterReadingsEnhanced.meterId, meter.id))
        .orderBy(desc(meterReadingsEnhanced.readingDate))
        .limit(1);

      if (!lastReading) {
        logger.warn(`No readings found for meter ${meter.id}`, { meterId: meter.id });
        return null;
      }

      // التحقق من عدم وجود فاتورة حديثة (لتجنب التكرار)
      const [existingInvoice] = await db
        .select({ id: invoicesEnhanced.id })
        .from(invoicesEnhanced)
        .where(and(
          eq(invoicesEnhanced.meterId, meter.id),
          sql`${invoicesEnhanced.invoiceDate}::date > ${tenDaysAgo}::date`
        ))
        .orderBy(desc(invoicesEnhanced.createdAt))
        .limit(1);

      if (existingInvoice) {
        logger.info(`Meter ${meter.id} already has recent invoice`, { 
          invoiceId: existingInvoice.id 
        });
        return null;
      }

      // 2. جلب القراءة السابقة
      const [previousReading] = await db
        .select()
        .from(meterReadingsEnhanced)
        .where(and(
          eq(meterReadingsEnhanced.meterId, meter.id),
          lt(meterReadingsEnhanced.id, lastReading.id)
        ))
        .orderBy(desc(meterReadingsEnhanced.readingDate))
        .limit(1);

      if (!previousReading) {
        logger.warn(`No previous reading for meter ${meter.id}`);
        return null;
      }

      // 3. حساب الاستهلاك
      const currentReadingValue = parseFloat(lastReading.currentReading?.toString() || "0");
      const previousReadingValue = parseFloat(previousReading.currentReading?.toString() || "0");
      const consumption = currentReadingValue - previousReadingValue;
      
      if (consumption < 0) {
        logger.error(`Invalid consumption for meter ${meter.id}`, {
          current: currentReadingValue,
          previous: previousReadingValue,
          consumption
        });
        return null;
      }

      // 4. حساب التعرفة والمبلغ
      // ✅ جلب التعرفة من جدول التعرفات
      let unitPrice = 0.18; // سعر افتراضي
      let fixedCharge = 0;
      let vatRate = 15;
      
      if (meter.tariffId) {
        try {
          const { tariffs } = await import("../../drizzle/schemas/billing-enhanced");
          const { eq, and, gte, lte } = await import("drizzle-orm");
          
          const [tariff] = await db
            .select({
              id: tariffs.id,
              slabs: tariffs.slabs,
              fixedCharge: tariffs.fixedCharge,
              vatRate: tariffs.vatRate,
            })
            .from(tariffs)
            .where(and(
              eq(tariffs.id, meter.tariffId),
              eq(tariffs.isActive, true)
            ))
            .limit(1);
          
          if (tariff) {
            // استخدام حاسبة الاستهلاك للحصول على السعر الصحيح
            const { calculateConsumption } = await import("../utils/consumption-calculator");
            const consumptionResult = await calculateConsumption(
              meter.id,
              consumption,
              {
                billingPeriodId: undefined, // Auto-billing قد لا يكون مربوط بفترة معينة
              }
            );
            
            unitPrice = consumptionResult.consumptionAmount / consumption || unitPrice;
            fixedCharge = parseFloat(tariff.fixedCharge?.toString() || "0");
            vatRate = parseFloat(tariff.vatRate?.toString() || "15");
          }
        } catch (tariffError: any) {
          logger.error('Failed to get tariff from database', {
            meterId: meter.id,
            tariffId: meter.tariffId,
            error: tariffError.message,
          });
          // نستخدم القيم الافتراضية
        }
      }
      
      const baseAmount = consumption * unitPrice;
      
      // 5. حساب الرسوم والضرائب
      const serviceFee = 5; // رسوم خدمة ثابتة
      const subtotal = baseAmount + serviceFee;
      const vat = subtotal * 0.15; // ضريبة القيمة المضافة 15%
      const totalAmount = subtotal + vat;

      // 6. إنشاء الفاتورة مع subscriptionAccountId (العمليات تحدث على حساب المشترك)
      const invoiceNumber = `INV-${Date.now()}`;
      const [invoice] = await db.insert(invoicesEnhanced).values({
        businessId: meter.businessId,
        customerId: meter.customerId, // للتوافق مع الكود القديم
        subscriptionAccountId: meter.subscriptionAccountId || null, // الحقل الرئيسي - العمليات تحدث على حساب المشترك
        meterId: meter.id,
        invoiceNo: invoiceNumber,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 يوم
        periodStart: previousReading.readingDate ? new Date(previousReading.readingDate) : null,
        periodEnd: lastReading.readingDate ? new Date(lastReading.readingDate) : null,
        meterNumber: meter.meterNumber || null,
        previousReading: previousReadingValue.toString(),
        currentReading: currentReadingValue.toString(),
        totalConsumptionKWH: consumption.toString(),
        priceKwh: unitPrice.toString(),
        consumptionAmount: baseAmount.toFixed(2),
        totalFees: serviceFee.toFixed(2),
        vatRate: "15",
        vatAmount: vat.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        previousBalanceDue: "0",
        finalAmount: totalAmount.toFixed(2),
        paidAmount: "0",
        balanceDue: totalAmount.toFixed(2),
        status: 'draft',
        meterReadingId: lastReading.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: invoicesEnhanced.id });

      logger.info(`Invoice created for meter ${meter.id}`, {
        invoiceId: invoice.id,
        invoiceNumber,
        subscriptionAccountId: meter.subscriptionAccountId,
        consumption,
        totalAmount
      });

      // 7. إنشاء قيد محاسبي تلقائي
      try {
        await AutoJournalEngine.onInvoiceCreated(invoice);
      } catch (error: any) {
        logger.error('Failed to create journal entry', { error: error.message });
        // لا نرمي الخطأ - الفاتورة تم إنشاؤها بنجاح
      }

      // 8. إرسال الفاتورة للعميل
      if (meter.customer) {
        await this.sendInvoiceNotification(meter.customer, {
          invoiceNumber,
          customerName: meter.customer.nameAr,
          totalAmount,
          dueDate: invoice.dueDate.toISOString().split('T')[0],
        });
      }

      return invoice.id;
    } catch (error: any) {
      logger.error(`Failed to bill meter ${meter.id}`, { error: error.message });
      throw error;
    }
  }

  /**
   * إرسال إشعار بالفاتورة
   */
  private async sendInvoiceNotification(customer: any, invoiceData: any): Promise<void> {
    try {
      // إرسال عبر جميع القنوات (SMS + WhatsApp + Email)
      const promises = [];

      if (customer.phone) {
        // SMS
        promises.push(
          smsChannel.send(
            {
              id: Date.now(),
              type: 'invoice',
              titleAr: 'فاتورة جديدة',
              messageAr: `فاتورة رقم ${invoiceData.invoiceNumber} بمبلغ ${invoiceData.totalAmount} ريال`,
              priority: 'normal',
              createdAt: new Date(),
            },
            { phone: customer.phone }
          )
        );

        // WhatsApp
        promises.push(
          whatsappChannel.sendInvoice(customer.phone, invoiceData)
        );
      }

      if (customer.email) {
        // Email
        promises.push(
          emailChannel.sendInvoice(customer.email, invoiceData)
        );
      }

      await Promise.allSettled(promises);
      logger.info('Invoice notifications sent', { customerId: customer.id });
    } catch (error: any) {
      logger.error('Failed to send invoice notifications', { error: error.message });
      // لا نرمي الخطأ - الإرسال فشل لكن الفاتورة موجودة
    }
  }
}

export default new AutoBillingService();
