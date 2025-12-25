// server/notifications/channels/sms.ts

import { Notification, NotificationRecipient, NotificationResult } from '../types';

interface SmsConfig {
  provider: 'twilio' | 'nexmo' | 'local';
  apiKey?: string;
  apiSecret?: string;
  fromNumber?: string;
}

class SmsChannel {
  private config: SmsConfig;

  constructor(config?: Partial<SmsConfig>) {
    this.config = {
      provider: 'local',
      apiKey: process.env.SMS_API_KEY,
      apiSecret: process.env.SMS_API_SECRET,
      fromNumber: process.env.SMS_FROM_NUMBER,
      ...config,
    };
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

      // محاكاة الإرسال
      console.log('Sending SMS:', {
        to: recipient.phone,
        message,
      });

      return {
        success: true,
        notificationId: notification.id,
        channel: 'sms',
        recipient: recipient.phone,
      };
    } catch (error) {
      return {
        success: false,
        notificationId: notification.id,
        channel: 'sms',
        recipient: recipient.phone,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
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
