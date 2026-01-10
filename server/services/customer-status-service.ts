/**
 * Customer Status Service
 * خدمة تحديث حالة العملاء بناءً على الديون والفوترة
 * 
 * تحديث حالة المشترك تلقائياً:
 * - active: إذا كان الرصيد <= 0
 * - suspended: إذا كان الرصيد > 0 و <= حد التعليق
 * - disconnected: إذا كان الرصيد > حد الفصل
 */

import { getDb } from "../db";
import { logger } from "../utils/logger";
import { customersEnhanced, invoicesEnhanced, paymentsEnhanced } from "../../drizzle/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { notificationService } from "../notifications/notification-service";

interface CustomerStatusResult {
  customerId: number;
  oldStatus: string;
  newStatus: string;
  balanceDue: number;
  updated: boolean;
  notificationSent: boolean;
}

interface UpdateStatusResult {
  totalProcessed: number;
  totalUpdated: number;
  notificationsSent: number;
  errors: Array<{ customerId: number; error: string }>;
}

export class CustomerStatusService {
  /**
   * تحديث حالة عميل واحد
   */
  async updateCustomerStatus(
    customerId: number,
    options?: {
      suspendThreshold?: number; // حد التعليق (مثلاً 500 ريال)
      disconnectThreshold?: number; // حد الفصل (مثلاً 1000 ريال)
      sendNotification?: boolean;
    }
  ): Promise<CustomerStatusResult> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const suspendThreshold = options?.suspendThreshold || 500;
    const disconnectThreshold = options?.disconnectThreshold || 1000;
    const sendNotification = options?.sendNotification !== false;

    try {
      // 1. جلب بيانات العميل
      const [customer] = await db
        .select()
        .from(customersEnhanced)
        .where(eq(customersEnhanced.id, customerId))
        .limit(1);

      if (!customer) {
        throw new Error(`العميل ${customerId} غير موجود`);
      }

      const oldStatus = customer.status || "active";

      // 2. حساب إجمالي الديون
      const balanceDue = await this.calculateBalanceDue(customerId, db);

      // 3. تحديد الحالة الجديدة
      let newStatus: string;
      if (balanceDue <= 0) {
        newStatus = "active";
      } else if (balanceDue > 0 && balanceDue <= suspendThreshold) {
        newStatus = "suspended";
      } else if (balanceDue > suspendThreshold && balanceDue <= disconnectThreshold) {
        newStatus = "suspended"; // تعليق متقدم
      } else {
        newStatus = "disconnected";
      }

      // 4. تحديث الحالة إذا تغيرت
      let updated = false;
      if (oldStatus !== newStatus) {
        await db
          .update(customersEnhanced)
          .set({
            status: newStatus as any,
            balanceDue: balanceDue.toString(),
            updatedAt: new Date(),
          })
          .where(eq(customersEnhanced.id, customerId));

        updated = true;

        // 5. تسجيل تغيير الحالة
        await this.logStatusChange(customerId, oldStatus, newStatus, balanceDue, db);

        // 6. إرسال إشعار للعميل
        let notificationSent = false;
        if (sendNotification && (customer.phone || customer.email)) {
          try {
            await this.sendStatusChangeNotification(customer, oldStatus, newStatus, balanceDue);
            notificationSent = true;
          } catch (notificationError: any) {
            logger.error("Failed to send status change notification", {
              customerId,
              error: notificationError.message,
            });
          }
        }

        return {
          customerId,
          oldStatus,
          newStatus,
          balanceDue,
          updated: true,
          notificationSent,
        };
      }

      // تحديث balanceDue حتى لو لم تتغير الحالة
      if (parseFloat(customer.balanceDue || "0") !== balanceDue) {
        await db
          .update(customersEnhanced)
          .set({
            balanceDue: balanceDue.toString(),
            updatedAt: new Date(),
          })
          .where(eq(customersEnhanced.id, customerId));
      }

      return {
        customerId,
        oldStatus,
        newStatus: oldStatus,
        balanceDue,
        updated: false,
        notificationSent: false,
      };
    } catch (error: any) {
      logger.error("Error updating customer status", {
        customerId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * تحديث حالة جميع العملاء
   */
  async updateAllCustomersStatus(
    businessId: number,
    options?: {
      suspendThreshold?: number;
      disconnectThreshold?: number;
      sendNotification?: boolean;
    }
  ): Promise<UpdateStatusResult> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result: UpdateStatusResult = {
      totalProcessed: 0,
      totalUpdated: 0,
      notificationsSent: 0,
      errors: [],
    };

    try {
      // جلب جميع العملاء النشطين
      const customers = await db
        .select({ id: customersEnhanced.id })
        .from(customersEnhanced)
        .where(
          and(
            eq(customersEnhanced.businessId, businessId),
            eq(customersEnhanced.isActive, true)
          )
        );

      for (const customer of customers) {
        try {
          const statusResult = await this.updateCustomerStatus(customer.id, options);
          result.totalProcessed++;

          if (statusResult.updated) {
            result.totalUpdated++;
          }

          if (statusResult.notificationSent) {
            result.notificationsSent++;
          }
        } catch (error: any) {
          result.errors.push({
            customerId: customer.id,
            error: error.message,
          });
        }
      }

      logger.info("Customer status update completed", {
        businessId,
        ...result,
      });

      return result;
    } catch (error: any) {
      logger.error("Error updating all customers status", {
        businessId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * حساب إجمالي الديون للعميل
   */
  private async calculateBalanceDue(customerId: number, db: any): Promise<number> {
    try {
      // حساب إجمالي الفواتير غير المدفوعة
      const unpaidInvoices = await db.execute(sql`
        SELECT COALESCE(SUM(i.total_amount::numeric), 0)::numeric as total_invoices,
               COALESCE(SUM(p.amount::numeric), 0)::numeric as total_payments
        FROM invoices_enhanced i
        LEFT JOIN payments_enhanced p ON p.invoice_id = i.id
        WHERE i.customer_id = ${customerId}
          AND i.status != 'paid'
      `);

      const row = unpaidInvoices.rows?.[0] || {};
      const totalInvoices = parseFloat(row.total_invoices || "0");
      const totalPayments = parseFloat(row.total_payments || "0");

      const balanceDue = totalInvoices - totalPayments;

      return Math.max(0, balanceDue); // لا يمكن أن يكون سالب
    } catch (error: any) {
      logger.error("Error calculating balance due", {
        customerId,
        error: error.message,
      });
      return 0;
    }
  }

  /**
   * تسجيل تغيير الحالة
   */
  private async logStatusChange(
    customerId: number,
    oldStatus: string,
    newStatus: string,
    balanceDue: number,
    db: any
  ): Promise<void> {
    try {
      // ✅ حفظ سجل تغيير الحالة في جدول customer_status_history
      // ملاحظة: يحتاج إنشاء جدول customer_status_history إذا لم يكن موجوداً
      await db.execute(sql`
        INSERT INTO customer_status_history (
          customer_id, old_status, new_status, balance_due, changed_at, changed_by
        ) VALUES (
          ${customerId},
          ${oldStatus},
          ${newStatus},
          ${balanceDue},
          NOW(),
          NULL
        )
      `);
    } catch (error: any) {
      // إذا لم يكن الجدول موجوداً، نكتفي بتسجيل الخطأ
      logger.warn("Could not log status change (table may not exist)", {
        customerId,
        error: error.message,
      });
    }
  }

  /**
   * إرسال إشعار تغيير الحالة
   */
  private async sendStatusChangeNotification(
    customer: any,
    oldStatus: string,
    newStatus: string,
    balanceDue: number
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      active: "تم تفعيل خدمتك بنجاح",
      suspended: `تم تعليق خدمتك بسبب وجود رصيد مستحق: ${balanceDue.toFixed(2)} ريال. يرجى السداد لإعادة تفعيل الخدمة.`,
      disconnected: `تم فصل خدمتك بسبب وجود رصيد مستحق: ${balanceDue.toFixed(2)} ريال. يرجى السداد فوراً لإعادة الخدمة.`,
    };

    const message = statusMessages[newStatus] || "تم تحديث حالة خدمتك";

    const recipients: any[] = [];
    if (customer.phone) {
      recipients.push({ phone: customer.phone });
    }
    if (customer.email) {
      recipients.push({ email: customer.email });
    }

    if (recipients.length > 0) {
      await notificationService.send({
        businessId: customer.businessId,
        channels: ["sms", "whatsapp", "email"],
        recipients,
        template: "status_change",
        data: {
          customerName: customer.fullName,
          oldStatus,
          newStatus,
          balanceDue: balanceDue.toFixed(2),
          message,
        },
      });
    }
  }
}

// Export singleton instance
export const customerStatusService = new CustomerStatusService();

// Export default
export default customerStatusService;
