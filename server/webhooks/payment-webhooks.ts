/**
 * Payment Gateway Webhooks
 * معالجات Webhooks لبوابات الدفع
 */

import { Request, Response } from "express";
import { getDb } from "../db";
import { logger } from "../utils/logger";
import { AutoJournalEngine } from "../core/auto-journal-engine";

/**
 * Webhook لاستقبال تأكيدات الدفع من Moyasar
 */
export async function moyasarWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;
    logger.info("Moyasar webhook received", { payload });

    // التحقق من التوقيع (Signature Verification)
    const signature = req.headers["x-moyasar-signature"] as string;
    if (!verifyMoyasarSignature(payload, signature)) {
      logger.warn("Invalid Moyasar webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // معالجة حسب نوع الحدث
    switch (payload.type) {
      case "payment_paid":
        await handlePaymentSuccess(payload.data);
        break;
      case "payment_failed":
        await handlePaymentFailure(payload.data);
        break;
      case "payment_refunded":
        await handlePaymentRefund(payload.data);
        break;
      default:
        logger.warn("Unknown Moyasar event type", { type: payload.type });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error("Error processing Moyasar webhook", { error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Webhook لاستقبال تأكيدات الدفع من Sadad
 */
export async function sadadWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;
    logger.info("Sadad webhook received", { payload });

    // التحقق من التوقيع
    const signature = req.headers["x-sadad-signature"] as string;
    if (!verifySadadSignature(payload, signature)) {
      logger.warn("Invalid Sadad webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // معالجة الدفع
    await handlePaymentSuccess(payload);

    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error("Error processing Sadad webhook", { error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * معالجة دفعة ناجحة
 */
async function handlePaymentSuccess(paymentData: any) {
  const db = getDb();

  try {
    // جلب بيانات الدفعة من قاعدة البيانات
    const [payment] = await db.execute(
      `SELECT * FROM payment_transactions WHERE transaction_id = ?`,
      [paymentData.id]
    );

    if ((payment as any[]).length === 0) {
      logger.warn("Payment transaction not found", { transactionId: paymentData.id });
      return;
    }

    const paymentRecord = (payment as any[])[0];

    // تحديث حالة المعاملة
    await db.execute(
      `UPDATE payment_transactions SET
        status = 'completed',
        completed_at = NOW(),
        gateway_response = ?
      WHERE transaction_id = ?`,
      [JSON.stringify(paymentData), paymentData.id]
    );

    // تحديث حالة الفاتورة
    if (paymentRecord.invoice_id) {
      await db.execute(
        `UPDATE invoices_enhanced SET
          status = 'paid',
          paid_at = NOW(),
          paid_amount = paid_amount + ?
        WHERE id = ?`,
        [paymentData.amount / 100, paymentRecord.invoice_id] // Moyasar uses cents
      );
    }

    // إنشاء سجل دفع
    const [paymentResult] = await db.execute(
      `INSERT INTO payments (
        business_id, customer_id, invoice_id, amount,
        payment_method, payment_date, reference_number, notes
      ) VALUES (?, ?, ?, ?, 'online', NOW(), ?, ?)`,
      [
        paymentRecord.business_id,
        paymentRecord.customer_id,
        paymentRecord.invoice_id,
        paymentData.amount / 100,
        paymentData.id,
        `دفع عبر ${paymentData.source?.type || 'بطاقة'}`
      ]
    );

    // إنشاء قيد محاسبي تلقائي
    try {
      await AutoJournalEngine.onPaymentReceived({
        id: (paymentResult as any).insertId,
        businessId: paymentRecord.business_id,
        customerId: paymentRecord.customer_id,
        invoiceId: paymentRecord.invoice_id,
        amount: paymentData.amount / 100,
        paymentMethod: "bank",
        paymentDate: new Date(),
        createdBy: 1, // System
      });
    } catch (error: any) {
      logger.error("Failed to create auto journal entry for payment", {
        error: error.message,
      });
      // لا نرمي الخطأ - الدفع نجح لكن القيد فشل
    }

    // ✅ إرسال إشعار للعميل
    try {
      const { notificationService } = await import("../notifications/notification-service");
      
      // جلب بيانات العميل
      const [customerRows] = await db.execute(
        "SELECT phone, email, full_name FROM customers_enhanced WHERE id = ?",
        [paymentRecord.customer_id]
      );
      const customer = (customerRows as any[])[0];
      
      if (customer) {
        const invoiceNumber = paymentRecord.invoice_id 
          ? await db.execute("SELECT invoice_no FROM invoices_enhanced WHERE id = ?", [paymentRecord.invoice_id])
            .then(([rows]: any) => (rows as any[])[0]?.invoice_no || `INV-${paymentRecord.invoice_id}`)
          : undefined;
        
        const amount = paymentData.amount / 100; // تحويل من هللة إلى ريال
        const paymentDate = new Date().toISOString().split("T")[0];
        
        // إرسال تأكيد الدفع
        await notificationService.sendPaymentConfirmation(
          customer.phone || customer.email,
          invoiceNumber,
          amount,
          paymentDate,
          ['sms', 'whatsapp', 'email']
        );
        
        logger.info("Payment confirmation sent", {
          transactionId: paymentData.id,
          customerId: paymentRecord.customer_id,
          channels: ['sms', 'whatsapp', 'email'],
        });
      }
    } catch (notificationError: any) {
      logger.error("Failed to send payment confirmation notification", {
        transactionId: paymentData.id,
        error: notificationError.message,
      });
      // لا نرمي الخطأ - الدفع نجح لكن الإشعار فشل
    }
    
    logger.info("Payment processed successfully", {
      transactionId: paymentData.id,
      amount: paymentData.amount / 100,
    });

  } catch (error: any) {
    logger.error("Error handling payment success", {
      error: error.message,
      paymentData,
    });
    throw error;
  }
}

/**
 * معالجة دفعة فاشلة
 */
async function handlePaymentFailure(paymentData: any) {
  const db = getDb();

  try {
    // تحديث حالة المعاملة
    await db.execute(
      `UPDATE payment_transactions SET
        status = 'failed',
        failed_at = NOW(),
        failure_reason = ?,
        gateway_response = ?
      WHERE transaction_id = ?`,
      [
        paymentData.source?.message || "فشل الدفع",
        JSON.stringify(paymentData),
        paymentData.id
      ]
    );

    logger.info("Payment failed", {
      transactionId: paymentData.id,
      reason: paymentData.source?.message,
    });

    // ✅ إرسال إشعار للعميل بفشل الدفع
    try {
      const { notificationService } = await import("../notifications/notification-service");
      
      // جلب بيانات المعاملة والعميل
      const [transactionRows] = await db.execute(
        `SELECT pt.*, c.phone, c.email, c.full_name 
         FROM payment_transactions pt
         LEFT JOIN customers_enhanced c ON pt.customer_id = c.id
         WHERE pt.gateway_transaction_id = ? OR pt.id = ?`,
        [paymentData.id, paymentData.id]
      );
      const transaction = (transactionRows as any[])[0];
      
      if (transaction && (transaction.phone || transaction.email)) {
        const failureReason = paymentData.source?.message || paymentData.failure_message || "فشل الدفع";
        const amount = (transaction.amount || paymentData.amount / 100).toString();
        
        // إرسال إشعار بفشل الدفع
        await notificationService.send({
          businessId: transaction.business_id || 1,
          channels: ['sms', 'whatsapp', 'email'],
          recipients: [
            transaction.phone || transaction.email || '',
          ],
          template: 'payment_failed',
          data: {
            invoiceNumber: transaction.invoice_id ? `INV-${transaction.invoice_id}` : undefined,
            amount,
            reason: failureReason,
            transactionNumber: transaction.transaction_number,
          },
        });
        
        logger.info("Payment failure notification sent", {
          transactionId: paymentData.id,
          customerId: transaction.customer_id,
        });
      }
    } catch (notificationError: any) {
      logger.error("Failed to send payment failure notification", {
        transactionId: paymentData.id,
        error: notificationError.message,
      });
      // لا نرمي الخطأ
    }

  } catch (error: any) {
    logger.error("Error handling payment failure", {
      error: error.message,
      paymentData,
    });
  }
}

/**
 * معالجة استرداد مبلغ
 */
async function handlePaymentRefund(paymentData: any) {
  const db = getDb();

  try {
    // تسجيل الاسترداد
    await db.execute(
      `INSERT INTO payment_refunds (
        payment_transaction_id, refund_amount, refund_reason,
        refunded_at, gateway_refund_id
      ) VALUES (?, ?, ?, NOW(), ?)`,
      [
        paymentData.id,
        paymentData.amount_refunded / 100,
        paymentData.refund_reason,
        paymentData.refund_id
      ]
    );

    logger.info("Payment refunded", {
      transactionId: paymentData.id,
      amount: paymentData.amount_refunded / 100,
    });

  } catch (error: any) {
    logger.error("Error handling payment refund", {
      error: error.message,
      paymentData,
    });
  }
}

/**
 * التحقق من توقيع Moyasar
 */
function verifyMoyasarSignature(payload: any, signature: string): boolean {
  // ✅ تنفيذ التحقق الفعلي باستخدام HMAC SHA256
  const secret = process.env.MOYASAR_WEBHOOK_SECRET;
  
  if (!secret) {
    logger.warn('Moyasar webhook secret not configured - accepting in development mode only');
    // في بيئة التطوير فقط، نقبل بدون secret
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    return false;
  }

  try {
    const { MoyasarGateway } = require('../developer/integrations/payment-gateways/moyasar');
    return MoyasarGateway.verifyWebhookSignature(payload, signature, secret);
  } catch (error: any) {
    logger.error('Error verifying Moyasar signature', { error: error.message });
    
    // Fallback: التحقق اليدوي
    try {
      const crypto = require('crypto');
      const payloadString = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload);
      
      const hash = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');
      
      return hash.toLowerCase() === signature.toLowerCase();
    } catch (fallbackError: any) {
      logger.error('Fallback signature verification failed', { error: fallbackError.message });
      return false;
    }
  }
}

/**
 * التحقق من توقيع Sadad
 */
function verifySadadSignature(payload: any, signature: string): boolean {
  // ✅ تنفيذ التحقق الفعلي
  const secret = process.env.SADAD_WEBHOOK_SECRET;
  
  if (!secret) {
    logger.warn('Sadad webhook secret not configured - accepting in development mode only');
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    return false;
  }

  try {
    const { SadadGateway } = require('../developer/integrations/payment-gateways/sadad');
    return SadadGateway.verifyWebhookSignature(payload, signature, secret);
  } catch (error: any) {
    logger.error('Error verifying Sadad signature', { error: error.message });
    
    // Fallback: التحقق اليدوي
    try {
      const crypto = require('crypto');
      const payloadString = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload);
      
      const hash = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');
      
      return hash.toLowerCase() === signature.toLowerCase();
    } catch (fallbackError: any) {
      logger.error('Fallback signature verification failed', { error: fallbackError.message });
      return false;
    }
  }
}

