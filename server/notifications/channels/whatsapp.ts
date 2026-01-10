/**
 * WhatsApp Channel
 * قناة إرسال إشعارات عبر WhatsApp
 */

import { Notification, NotificationRecipient, NotificationResult } from '../types';
import { logger } from '../../utils/logger';
import { getDb } from '../../db';
import { messagingLogs } from '../../../drizzle/schema';

interface WhatsAppConfig {
  provider: 'twilio' | 'infobip' | 'local';
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  apiKey?: string;
}

class WhatsAppChannel {
  private config: WhatsAppConfig;
  private twilioClient: any;

  constructor(config?: Partial<WhatsAppConfig>) {
    this.config = {
      provider: (process.env.WHATSAPP_PROVIDER as any) || 'local',
      accountSid: process.env.WHATSAPP_ACCOUNT_SID,
      authToken: process.env.WHATSAPP_AUTH_TOKEN,
      fromNumber: process.env.WHATSAPP_FROM_NUMBER || 'whatsapp:+14155238886',
      apiKey: process.env.WHATSAPP_API_KEY,
      ...config,
    };

    // Initialize Twilio WhatsApp if configured
    if (this.config.provider === 'twilio' && this.config.accountSid && this.config.authToken) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(this.config.accountSid, this.config.authToken);
        logger.info('Twilio WhatsApp client initialized');
      } catch (error) {
        logger.error('Failed to initialize Twilio WhatsApp', { error });
      }
    }
  }

  async send(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult> {
    if (!recipient.phone) {
      return {
        success: false,
        notificationId: notification.id,
        channel: 'whatsapp',
        recipient: 'unknown',
        error: 'Phone number is required',
      };
    }

    try {
      // تنسيق رقم الهاتف (يجب أن يبدأ بـ whatsapp:)
      const formattedPhone = `whatsapp:${recipient.phone.startsWith('+') ? recipient.phone : '+966' + recipient.phone.replace(/^0+/, '')}`;

      // تنسيق الرسالة
      const message = this.formatWhatsAppMessage(notification);

      let messageId: string | undefined;

      if (this.twilioClient) {
        // ✅ إرسال فعلي عبر Twilio WhatsApp
        logger.info('Sending WhatsApp via Twilio', { to: formattedPhone });
        const result = await this.twilioClient.messages.create({
          from: this.config.fromNumber,
          to: formattedPhone,
          body: message
        });
        messageId = result.sid;
        logger.info('WhatsApp sent successfully', { to: formattedPhone, sid: result.sid });
      } else {
        // محاكاة الإرسال (للتطوير)
        logger.warn('WhatsApp not configured - simulating send', { to: formattedPhone });
        messageId = `simulated-wa-${Date.now()}`;
      }

      // ✅ حفظ في قاعدة البيانات
      await this.logMessage({
        channel: 'whatsapp',
        recipient: formattedPhone,
        message,
        status: 'sent',
        messageId,
        provider: this.config.provider,
        businessId: (recipient as any).businessId,
      });

      return {
        success: true,
        notificationId: notification.id,
        channel: 'whatsapp',
        recipient: formattedPhone,
        messageId,
      };
    } catch (error: any) {
      logger.error('WhatsApp send failed', {
        error: error.message,
        recipient: recipient.phone
      });

      // حفظ الخطأ
      await this.logMessage({
        channel: 'whatsapp',
        recipient: recipient.phone,
        message: this.formatWhatsAppMessage(notification),
        status: 'failed',
        error: error.message,
        provider: this.config.provider,
      });

      return {
        success: false,
        notificationId: notification.id,
        channel: 'whatsapp',
        recipient: recipient.phone,
        error: error.message,
      };
    }
  }

  private formatWhatsAppMessage(notification: Notification): string {
    const title = notification.titleAr;
    const message = notification.messageAr;
    
    return `*${title}*\n\n${message}`;
  }

  /**
   * إرسال فاتورة عبر WhatsApp
   */
  async sendInvoice(phone: string, invoiceData: {
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    dueDate: string;
  }): Promise<boolean> {
    try {
      const message = `
*فاتورة جديدة* 🧾

عزيزي ${invoiceData.customerName},

تم إصدار فاتورة جديدة:
📋 رقم الفاتورة: ${invoiceData.invoiceNumber}
💰 المبلغ: ${invoiceData.totalAmount.toFixed(2)} ريال
📅 تاريخ الاستحقاق: ${invoiceData.dueDate}

يرجى السداد في الموعد المحدد.

شكراً لكم.
      `.trim();

      const formattedPhone = `whatsapp:${phone.startsWith('+') ? phone : '+966' + phone}`;

      if (this.twilioClient) {
        // ✅ إرسال فعلي عبر Twilio WhatsApp
        const result = await this.twilioClient.messages.create({
          from: this.config.fromNumber,
          to: formattedPhone,
          body: message
        });
        
        await this.logMessage({
          channel: 'whatsapp',
          recipient: formattedPhone,
          message,
          status: 'sent',
          messageId: result.sid,
          provider: this.config.provider,
          metadata: { type: 'invoice', invoiceNumber: invoiceData.invoiceNumber }
        });
        
        logger.info('WhatsApp invoice sent', { to: formattedPhone, sid: result.sid });
        return true;
      } else {
        logger.warn('WhatsApp not configured - simulated', { to: formattedPhone });
        return true;
      }
    } catch (error: any) {
      logger.error('Failed to send WhatsApp invoice', { error: error.message });
      return false;
    }
  }

  /**
   * إرسال تذكير دفع عبر WhatsApp
   */
  async sendPaymentReminder(phone: string, reminderData: {
    customerName: string;
    invoiceNumber: string;
    totalAmount: number;
    daysOverdue: number;
  }): Promise<boolean> {
    try {
      const message = `
*تذكير بالدفع* ⚠️

عزيزي ${reminderData.customerName},

لديك فاتورة متأخرة:
📋 رقم الفاتورة: ${reminderData.invoiceNumber}
💰 المبلغ: ${reminderData.totalAmount.toFixed(2)} ريال
⏰ متأخرة منذ: ${reminderData.daysOverdue} يوم

يرجى السداد في أقرب وقت لتجنب أي إجراءات.

شكراً لكم.
      `.trim();

      const formattedPhone = `whatsapp:${phone.startsWith('+') ? phone : '+966' + phone}`;

      if (this.twilioClient) {
        // ✅ إرسال فعلي عبر Twilio WhatsApp
        const result = await this.twilioClient.messages.create({
          from: this.config.fromNumber,
          to: formattedPhone,
          body: message
        });
        
        await this.logMessage({
          channel: 'whatsapp',
          recipient: formattedPhone,
          message,
          status: 'sent',
          messageId: result.sid,
          provider: this.config.provider,
          metadata: { type: 'payment_reminder', invoiceNumber: reminderData.invoiceNumber }
        });
        
        logger.info('WhatsApp reminder sent', { to: formattedPhone, sid: result.sid });
        return true;
      } else {
        logger.warn('WhatsApp not configured - simulated', { to: formattedPhone });
        return true;
      }
    } catch (error: any) {
      logger.error('Failed to send WhatsApp reminder', { error: error.message });
      return false;
    }
  }

  /**
   * إرسال تأكيد دفع عبر WhatsApp
   */
  async sendPaymentConfirmation(phone: string, paymentData: {
    customerName: string;
    amount: number;
    invoiceNumber?: string;
    receiptNumber: string;
  }): Promise<boolean> {
    try {
      const message = `
*تأكيد الدفع* ✅

عزيزي ${paymentData.customerName},

تم استلام دفعتكم بنجاح:
💵 المبلغ: ${paymentData.amount.toFixed(2)} ريال
🧾 رقم الإيصال: ${paymentData.receiptNumber}
${paymentData.invoiceNumber ? `📋 الفاتورة: ${paymentData.invoiceNumber}` : ''}

شكراً لكم على سرعة السداد.
      `.trim();

      const formattedPhone = `whatsapp:${phone.startsWith('+') ? phone : '+966' + phone}`;

      if (this.twilioClient) {
        // ✅ إرسال فعلي عبر Twilio WhatsApp
        const result = await this.twilioClient.messages.create({
          from: this.config.fromNumber,
          to: formattedPhone,
          body: message
        });
        
        await this.logMessage({
          channel: 'whatsapp',
          recipient: formattedPhone,
          message,
          status: 'sent',
          messageId: result.sid,
          provider: this.config.provider,
          metadata: { type: 'payment_confirmation', receiptNumber: paymentData.receiptNumber }
        });
        
        logger.info('WhatsApp confirmation sent', { to: formattedPhone, sid: result.sid });
        return true;
      } else {
        logger.warn('WhatsApp not configured - simulated', { to: formattedPhone });
        return true;
      }
    } catch (error: any) {
      logger.error('Failed to send WhatsApp confirmation', { error: error.message });
      return false;
    }
  }

  /**
   * اختبار الاتصال بـ Twilio WhatsApp
   */
  async testConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!this.twilioClient) {
        return { 
          success: false, 
          error: 'WhatsApp not configured. Please set WHATSAPP_ACCOUNT_SID and WHATSAPP_AUTH_TOKEN.' 
        };
      }

      // اختبار بسيط: جلب معلومات الحساب
      const account = await this.twilioClient.api.accounts(this.config.accountSid).fetch();
      return { 
        success: true, 
        message: `Connected to Twilio WhatsApp. Account SID: ${account.sid}, Status: ${account.status}` 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * حفظ سجل الرسالة في قاعدة البيانات
   */
  private async logMessage(data: {
    channel: string;
    recipient: string;
    message: string;
    status: string;
    messageId?: string;
    provider: string;
    error?: string;
    metadata?: any;
    businessId?: number;
  }): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      // ✅ الحصول على businessId من recipient metadata أو استخدام القيمة الافتراضية
      let businessId = data.businessId || 1;
      
      // محاولة الحصول من العميل إذا كان phone موجود
      if (!data.businessId && data.recipient) {
        try {
          const cleanPhone = data.recipient.replace(/^whatsapp:/, '').replace(/^\+966/, '0');
          const { customersEnhanced } = await import("../../../drizzle/schemas/billing-enhanced");
          const { eq } = await import("drizzle-orm");
          const [customer] = await db
            .select({ businessId: customersEnhanced.businessId })
            .from(customersEnhanced)
            .where(eq(customersEnhanced.mobileNo, cleanPhone))
            .limit(1);
          if (customer) {
            businessId = customer.businessId;
          }
        } catch (err) {
          // نستخدم القيمة الافتراضية
        }
      }

      await db.insert(messagingLogs).values({
        businessId,
        channel: data.channel,
        recipient: data.recipient,
        message: data.message,
        status: data.status,
        messageId: data.messageId,
        provider: data.provider,
        error: data.error,
        metadata: data.metadata,
        sentAt: data.status === 'sent' ? new Date() : null,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log WhatsApp message', { error });
    }
  }
}

/**
 * ✅ التحقق من توقيع Moyasar
 */
function verifyMoyasarSignature(payload: any, signature: string): boolean {
  try {
    const { MoyasarGateway } = require('../../developer/integrations/payment-gateways/moyasar');
    const secret = process.env.MOYASAR_WEBHOOK_SECRET || '';
    const gateway = new MoyasarGateway({
      apiKey: '',
      webhookSecret: secret,
      testMode: process.env.NODE_ENV === 'development',
    });
    return gateway.verifyWebhookSignature(payload, signature);
  } catch (error: any) {
    logger.error('Failed to verify Moyasar signature', { error: error.message });
    // في بيئة التطوير، نسمح بالتمرير
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    return false;
  }
}

/**
 * ✅ التحقق من توقيع Sadad
 */
function verifySadadSignature(payload: any, signature: string): boolean {
  try {
    const { SadadGateway } = require('../../developer/integrations/payment-gateways/sadad');
    const secret = process.env.SADAD_WEBHOOK_SECRET || '';
    const gateway = new SadadGateway({
      merchantId: '',
      terminalId: '',
      apiKey: '',
      secretKey: secret,
      testMode: process.env.NODE_ENV === 'development',
    });
    return gateway.verifyWebhookSignature(payload, signature);
  } catch (error: any) {
    logger.error('Failed to verify Sadad signature', { error: error.message });
    // في بيئة التطوير، نسمح بالتمرير
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    return false;
  }
}

export const whatsappChannel = new WhatsAppChannel();

