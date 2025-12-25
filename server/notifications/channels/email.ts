// server/notifications/channels/email.ts

import { Notification, NotificationRecipient, NotificationResult } from '../types';
import { logger } from '../../utils/logger';

interface EmailConfig {
  from: string;
  replyTo?: string;
  smtpHost?: string;
  smtpPort?: number;
}

class EmailChannel {
  private config: EmailConfig;
  private queue: Array<{ notification: Notification; recipient: NotificationRecipient }> = [];

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      replyTo: process.env.EMAIL_REPLY_TO,
      smtpHost: process.env.SMTP_HOST,
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      ...config,
    };
  }

  async send(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult> {
    if (!recipient.email) {
      return {
        success: false,
        notificationId: notification.id,
        channel: 'email',
        recipient: 'unknown',
        error: 'Email address is required',
      };
    }

    try {
      // في الإنتاج، استخدم مكتبة مثل nodemailer
      // هنا نقوم بمحاكاة الإرسال
      const emailData = {
        from: this.config.from,
        to: recipient.email,
        subject: notification.titleAr,
        html: this.buildEmailHtml(notification),
        text: notification.messageAr,
      };

      // محاكاة الإرسال
      logger.debug('Sending email', emailData);

      return {
        success: true,
        notificationId: notification.id,
        channel: 'email',
        recipient: recipient.email,
      };
    } catch (error) {
      return {
        success: false,
        notificationId: notification.id,
        channel: 'email',
        recipient: recipient.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildEmailHtml(notification: Notification): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f5f5f5; }
          .footer { padding: 10px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${notification.titleAr}</h1>
          </div>
          <div class="content">
            <p>${notification.messageAr}</p>
          </div>
          <div class="footer">
            <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailChannel = new EmailChannel();
