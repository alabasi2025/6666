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
import { getTemplate, renderTemplate } from './templates';

class NotificationService {
  private channels = {
    'in-app': inAppChannel,
    'email': emailChannel,
    'sms': smsChannel,
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
