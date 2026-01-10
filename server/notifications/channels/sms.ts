// server/notifications/channels/sms.ts

import { Notification, NotificationRecipient, NotificationResult } from '../types';
import { logger } from '../../utils/logger';
import { getDb } from '../../db';
import { messagingLogs } from '../../../drizzle/schema';

interface SmsConfig {
  provider: 'twilio' | 'unifonic' | 'nexmo' | 'local';
  apiKey?: string;
  apiSecret?: string;
  fromNumber?: string;
}

class SmsChannel {
  private config: SmsConfig;
  private twilioClient: any;

  constructor(config?: Partial<SmsConfig>) {
    this.config = {
      provider: (process.env.SMS_PROVIDER as any) || 'local',
      apiKey: process.env.SMS_API_KEY,
      apiSecret: process.env.SMS_API_SECRET,
      fromNumber: process.env.SMS_FROM_NUMBER,
      ...config,
    };

    // Initialize Twilio if configured
    if (this.config.provider === 'twilio' && this.config.apiKey && this.config.apiSecret) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(this.config.apiKey, this.config.apiSecret);
        logger.info('Twilio SMS client initialized');
      } catch (error) {
        logger.error('Failed to initialize Twilio', { error });
      }
    }
  }

  async send(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult> {
    if (!recipient.phone) {
      return {
        success: false,
        notificationId: notification.id,
        channel: 'sms',
        recipient: 'unknown',
        error: 'Phone number is required',
      };
    }

    try {
      // تنسيق الرسالة للـ SMS (حد 160 حرف)
      const message = this.formatSmsMessage(notification);
      
      // تنسيق رقم الهاتف (إضافة +966 إذا لم يكن موجوداً)
      const phoneNumber = recipient.phone.startsWith('+') 
        ? recipient.phone 
        : `+966${recipient.phone.replace(/^0+/, '')}`;

      let result: any;
      let messageId: string | undefined;

      if (this.twilioClient) {
        // ✅ إرسال فعلي عبر Twilio
        logger.info('Sending SMS via Twilio', { to: phoneNumber });
        result = await this.twilioClient.messages.create({
          body: message,
          from: this.config.fromNumber,
          to: phoneNumber,
        });
        messageId = result.sid;
        logger.info('SMS sent successfully', { to: phoneNumber, sid: result.sid });
      } else {
        // محاكاة الإرسال (للتطوير)
        logger.warn('SMS not configured - simulating send', { to: phoneNumber, message });
        messageId = `simulated-${Date.now()}`;
      }

      // ✅ حفظ في قاعدة البيانات
      await this.logMessage({
        channel: 'sms',
        recipient: phoneNumber,
        message,
        status: 'sent',
        messageId,
        provider: this.config.provider,
        businessId: (recipient as any).businessId,
      });

      return {
        success: true,
        notificationId: notification.id,
        channel: 'sms',
        recipient: phoneNumber,
        messageId,
      };
    } catch (error: any) {
      logger.error('SMS send failed', { to: recipient.phone, error: error.message });
      
      // حفظ الخطأ في قاعدة البيانات
      await this.logMessage({
        channel: 'sms',
        recipient: recipient.phone,
        message: this.formatSmsMessage(notification),
        status: 'failed',
        error: error.message,
        provider: this.config.provider,
      });

      return {
        success: false,
        notificationId: notification.id,
        channel: 'sms',
        recipient: recipient.phone,
        error: error.message,
      };
    }
  }

  /**
   * اختبار الاتصال بـ Twilio
   */
  async testConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!this.twilioClient) {
        return { 
          success: false, 
          error: 'SMS not configured. Please set SMS_PROVIDER, SMS_API_KEY, SMS_API_SECRET in environment variables.' 
        };
      }

      // اختبار بسيط: جلب معلومات الحساب
      const account = await this.twilioClient.api.accounts(this.config.apiKey).fetch();
      return { 
        success: true, 
        message: `Connected to Twilio. Account SID: ${account.sid}, Status: ${account.status}` 
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
          const { customersEnhanced } = await import("../../../drizzle/schemas/billing-enhanced");
          const { eq } = await import("drizzle-orm");
          const [customer] = await db
            .select({ businessId: customersEnhanced.businessId })
            .from(customersEnhanced)
            .where(eq(customersEnhanced.mobileNo, data.recipient))
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
        sentAt: data.status === 'sent' ? new Date() : null,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log SMS message', { error });
    }
  }

  private formatSmsMessage(notification: Notification): string {
    const title = notification.titleAr;
    const message = notification.messageAr;
    const fullMessage = `${title}: ${message}`;

    // اقتطاع الرسالة إذا كانت أطول من 160 حرف
    if (fullMessage.length > 160) {
      return fullMessage.substring(0, 157) + '...';
    }
    return fullMessage;
  }
}

export const smsChannel = new SmsChannel();
