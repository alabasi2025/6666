// server/notifications/notification-service.ts

import { 
  Notification, 
  NotificationRecipient, 
  NotificationResult,
  SendNotificationOptions,
  NotificationType,
  NotificationChannelType
} from './types';
import { inAppChannel } from './channels/in-app';
import { emailChannel } from './channels/email';
import { smsChannel } from './channels/sms';
import { whatsappChannel } from './channels/whatsapp';
import { getTemplate, renderTemplate } from './templates';

class NotificationService {
  private channels = {
    'in-app': inAppChannel,
    'email': emailChannel,
    'sms': smsChannel,
    'whatsapp': whatsappChannel,
  };

  /**
   * إرسال إشعار
   */
  async send(
    type: NotificationType,
    title: string,
    titleAr: string,
    message: string,
    messageAr: string,
    recipients: NotificationRecipient[],
    options: SendNotificationOptions = {}
  ): Promise<NotificationResult[]> {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      titleAr,
      message,
      messageAr,
      channels: options.channels || ['in-app'],
      recipients,
      scheduledAt: options.scheduledAt,
      createdAt: new Date(),
      status: 'pending',
    };

    const results: NotificationResult[] = [];

    for (const recipient of recipients) {
      for (const channelName of notification.channels) {
        const channel = this.channels[channelName as keyof typeof this.channels];
        if (channel) {
          const result = await channel.send(notification, recipient);
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * إرسال إشعار باستخدام قالب
   */
  async sendFromTemplate(
    templateId: string,
    recipients: NotificationRecipient[],
    variables: Record<string, string>,
    options: SendNotificationOptions = {}
  ): Promise<NotificationResult[]> {
    const template = getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const { title: titleEn, message: messageEn } = renderTemplate(template, variables, 'en');
    const { title: titleAr, message: messageAr } = renderTemplate(template, variables, 'ar');

    return this.send(
      'info',
      titleEn,
      titleAr,
      messageEn,
      messageAr,
      recipients,
      { ...options, channels: options.channels || template.channels }
    );
  }

  /**
   * الحصول على إشعارات المستخدم
   */
  getUserNotifications(userId: number, unreadOnly = false) {
    return inAppChannel.getNotifications(userId, unreadOnly);
  }

  /**
   * إرسال فاتورة تلقائياً عبر SMS/WhatsApp
   */
  async sendInvoice(
    invoiceId: number,
    customerPhone: string,
    invoiceNumber: string,
    totalAmount: string,
    dueDate: string,
    channels: NotificationChannelType[] = ['sms', 'whatsapp']
  ): Promise<NotificationResult[]> {
    const titleAr = "فاتورة جديدة";
    const messageAr = `عزيزي العميل، تم إصدار فاتورة جديدة برقم ${invoiceNumber} بمبلغ ${totalAmount} ريال. تاريخ الاستحقاق: ${dueDate}`;

    return this.send(
      'info',
      'New Invoice',
      titleAr,
      `New invoice ${invoiceNumber} for ${totalAmount} SAR. Due date: ${dueDate}`,
      messageAr,
      [{ phone: customerPhone }],
      { channels }
    );
  }

  /**
   * إرسال تذكير بالدفع
   */
  async sendPaymentReminder(
    customerPhone: string,
    invoiceNumber: string,
    amount: string,
    daysOverdue: number,
    channels: NotificationChannelType[] = ['sms', 'whatsapp']
  ): Promise<NotificationResult[]> {
    const titleAr = "تذكير بالدفع";
    const messageAr = daysOverdue > 0
      ? `تذكير: فاتورة ${invoiceNumber} متأخرة ${daysOverdue} يوم. المبلغ المستحق: ${amount} ريال. يرجى السداد في أقرب وقت.`
      : `تذكير: فاتورة ${invoiceNumber} مستحقة اليوم. المبلغ: ${amount} ريال. يرجى السداد.`;

    return this.send(
      'warning',
      'Payment Reminder',
      titleAr,
      `Reminder: Invoice ${invoiceNumber} ${daysOverdue > 0 ? `overdue ${daysOverdue} days` : 'due today'}. Amount: ${amount} SAR.`,
      messageAr,
      [{ phone: customerPhone }],
      { channels }
    );
  }

  /**
   * إرسال تأكيد الدفع
   */
  async sendPaymentConfirmation(
    customerPhone: string,
    invoiceNumber: string,
    paidAmount: string,
    paymentDate: string,
    channels: NotificationChannelType[] = ['sms', 'whatsapp']
  ): Promise<NotificationResult[]> {
    const titleAr = "تأكيد الدفع";
    const messageAr = `تم استلام دفعتك بنجاح. رقم الفاتورة: ${invoiceNumber}، المبلغ: ${paidAmount} ريال، تاريخ الدفع: ${paymentDate}. شكراً لك.`;

    return this.send(
      'success',
      'Payment Confirmation',
      titleAr,
      `Payment confirmed. Invoice: ${invoiceNumber}, Amount: ${paidAmount} SAR, Date: ${paymentDate}. Thank you.`,
      messageAr,
      [{ phone: customerPhone }],
      { channels }
    );
  }

  /**
   * إرسال مع إعادة المحاولة
   */
  async sendWithRetry(
    type: NotificationType,
    title: string,
    titleAr: string,
    message: string,
    messageAr: string,
    recipients: NotificationRecipient[],
    options: SendNotificationOptions & { maxRetries?: number; retryDelay?: number } = {}
  ): Promise<NotificationResult[]> {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000; // 1 second
    let lastResults: NotificationResult[] = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const results = await this.send(type, title, titleAr, message, messageAr, recipients, options);
        
        // التحقق من النجاح
        const allSucceeded = results.every(r => r.success);
        if (allSucceeded) {
          return results;
        }

        lastResults = results;

        // إذا لم تكن المحاولة الأخيرة، انتظر ثم أعد المحاولة
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

    return lastResults;
  }

  /**
   * تحديد إشعار كمقروء
   */
  markAsRead(userId: number, notificationId: string): boolean {
    return inAppChannel.markAsRead(userId, notificationId);
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  markAllAsRead(userId: number): number {
    return inAppChannel.markAllAsRead(userId);
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  getUnreadCount(userId: number): number {
    return inAppChannel.getUnreadCount(userId);
  }

  /**
   * حذف إشعار
   */
  deleteNotification(userId: number, notificationId: string): boolean {
    return inAppChannel.deleteNotification(userId, notificationId);
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const notificationService = new NotificationService();
