/**
 * Email Channel
 * قناة إرسال إشعارات عبر Email
 */

import { Notification, NotificationRecipient, NotificationResult } from '../types';
import { logger } from '../../utils/logger';
import { getDb } from '../../db';
import { messagingLogs } from '../../../drizzle/schema';
import * as nodemailer from 'nodemailer';

interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'aws-ses' | 'local';
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
  apiKey?: string; // for SendGrid/AWS SES
}

class EmailChannel {
  private config: EmailConfig;
  private transporter: nodemailer.Transporter | null = null;

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      provider: (process.env.EMAIL_PROVIDER as any) || 'smtp',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      apiKey: process.env.SENDGRID_API_KEY,
      ...config,
    };

    // Initialize SMTP transporter
    if (this.config.provider === 'smtp' && this.config.user && this.config.password) {
      try {
        this.transporter = nodemailer.createTransport({
          host: this.config.host,
          port: this.config.port,
          secure: this.config.secure,
          auth: {
            user: this.config.user,
            pass: this.config.password,
          },
        });
        logger.info('Email SMTP transporter initialized', { 
          host: this.config.host, 
          port: this.config.port 
        });
      } catch (error) {
        logger.error('Failed to initialize Email transporter', { error });
      }
    }
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
      const subject = notification.titleAr;
      const html = this.formatEmailHTML(notification);

      let messageId: string | undefined;

      if (this.transporter) {
        // ✅ إرسال فعلي عبر SMTP
        logger.info('Sending Email via SMTP', { to: recipient.email, subject });
        const result = await this.transporter.sendMail({
          from: this.config.from,
          to: recipient.email,
          subject: subject,
          html: html,
        });
        messageId = result.messageId;
        logger.info('Email sent successfully', { to: recipient.email, messageId: result.messageId });
      } else {
        // محاكاة الإرسال (للتطوير)
        logger.warn('Email not configured - simulating send', { to: recipient.email, subject });
        messageId = `simulated-email-${Date.now()}`;
      }

      // ✅ حفظ في قاعدة البيانات
      await this.logMessage({
        channel: 'email',
        recipient: recipient.email,
        message: html,
        subject,
        status: 'sent',
        messageId,
        provider: this.config.provider,
        businessId: (recipient as any).businessId,
      });

      return {
        success: true,
        notificationId: notification.id,
        channel: 'email',
        recipient: recipient.email,
        messageId,
      };
    } catch (error: any) {
      logger.error('Email send failed', { to: recipient.email, error: error.message });
      
      // حفظ الخطأ
      await this.logMessage({
        channel: 'email',
        recipient: recipient.email,
        message: this.formatEmailHTML(notification),
        subject: notification.titleAr,
        status: 'failed',
        error: error.message,
        provider: this.config.provider,
        businessId: (recipient as any).businessId,
      });

      return {
        success: false,
        notificationId: notification.id,
        channel: 'email',
        recipient: recipient.email,
        error: error.message,
      };
    }
  }

  /**
   * إرسال فاتورة عبر Email مع مرفق PDF
   */
  async sendInvoice(email: string, invoiceData: {
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    dueDate: string;
    pdfPath?: string;
  }): Promise<boolean> {
    try {
      const subject = `فاتورة رقم ${invoiceData.invoiceNumber}`;
      const html = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
    .amount { font-size: 24px; font-weight: bold; color: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧾 فاتورة جديدة</h1>
    </div>
    <div class="content">
      <p>عزيزي <strong>${invoiceData.customerName}</strong>،</p>
      <p>تم إصدار فاتورة جديدة لكم:</p>
      <ul>
        <li><strong>رقم الفاتورة:</strong> ${invoiceData.invoiceNumber}</li>
        <li><strong>المبلغ المستحق:</strong> <span class="amount">${invoiceData.totalAmount.toFixed(2)} ريال</span></li>
        <li><strong>تاريخ الاستحقاق:</strong> ${invoiceData.dueDate}</li>
      </ul>
      <p>يرجى السداد في الموعد المحدد.</p>
      ${invoiceData.pdfPath ? '<p><em>تجدون الفاتورة مرفقة في الملف المرفق.</em></p>' : ''}
    </div>
    <div class="footer">
      <p>شكراً لكم على تعاملكم معنا</p>
    </div>
  </div>
</body>
</html>
      `;

      if (this.transporter) {
        const mailOptions: any = {
          from: this.config.from,
          to: email,
          subject: subject,
          html: html,
        };

        // إرفاق PDF إن وجد
        if (invoiceData.pdfPath) {
          mailOptions.attachments = [{
            filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
            path: invoiceData.pdfPath
          }];
        }

        const result = await this.transporter.sendMail(mailOptions);
        
        await this.logMessage({
          channel: 'email',
          recipient: email,
          message: html,
          subject,
          status: 'sent',
          messageId: result.messageId,
          provider: this.config.provider,
          metadata: { type: 'invoice', invoiceNumber: invoiceData.invoiceNumber }
        });
        
        logger.info('Email invoice sent', { to: email, messageId: result.messageId });
        return true;
      } else {
        logger.warn('Email not configured - simulated', { to: email });
        return true;
      }
    } catch (error: any) {
      logger.error('Failed to send Email invoice', { error: error.message });
      return false;
    }
  }

  /**
   * اختبار الاتصال بـ SMTP
   */
  async testConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!this.transporter) {
        return { 
          success: false, 
          error: 'Email not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in environment variables.' 
        };
      }

      // اختبار الاتصال
      await this.transporter.verify();
      return { 
        success: true, 
        message: `Connected to SMTP server ${this.config.host}:${this.config.port}` 
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
    subject: string;
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
      
      // محاولة الحصول من العميل إذا كان email موجود
      if (!data.businessId && data.recipient) {
        try {
          const { customersEnhanced } = await import("../../../drizzle/schemas/billing-enhanced");
          const { eq } = await import("drizzle-orm");
          const [customer] = await db
            .select({ businessId: customersEnhanced.businessId })
            .from(customersEnhanced)
            .where(eq(customersEnhanced.email, data.recipient))
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
        subject: data.subject,
        status: data.status,
        messageId: data.messageId,
        provider: data.provider,
        error: data.error,
        metadata: data.metadata,
        sentAt: data.status === 'sent' ? new Date() : null,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log Email message', { error });
    }
  }

  /**
   * تنسيق HTML للبريد الإلكتروني
   */
  private formatEmailHTML(notification: Notification): string {
    const title = notification.titleAr;
    const message = notification.messageAr;
    
    return `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <p>${message}</p>
    </div>
    <div class="footer">
      <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
      <p>© 2026 نظام إدارة الطاقة</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

export const emailChannel = new EmailChannel();
