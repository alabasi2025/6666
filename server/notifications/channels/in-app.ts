// server/notifications/channels/in-app.ts

import { Notification, NotificationRecipient, NotificationResult } from '../types';

interface InAppNotification {
  id: string;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

class InAppChannel {
  private notifications: Map<number, InAppNotification[]> = new Map();

  async send(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult> {
    if (!recipient.userId) {
      return {
        success: false,
        notificationId: notification.id,
        channel: 'in-app',
        recipient: 'unknown',
        error: 'User ID is required for in-app notifications',
      };
    }

    const inAppNotification: InAppNotification = {
      id: notification.id,
      userId: recipient.userId,
      type: notification.type,
      title: notification.titleAr,
      message: notification.messageAr,
      data: notification.data,
      read: false,
      createdAt: new Date(),
    };

    // تخزين الإشعار
    const userNotifications = this.notifications.get(recipient.userId) || [];
    userNotifications.unshift(inAppNotification);
    
    // الاحتفاظ بآخر 100 إشعار فقط
    if (userNotifications.length > 100) {
      userNotifications.pop();
    }
    
    this.notifications.set(recipient.userId, userNotifications);

    return {
      success: true,
      notificationId: notification.id,
      channel: 'in-app',
      recipient: `user:${recipient.userId}`,
    };
  }

  getNotifications(userId: number, unreadOnly = false): InAppNotification[] {
    const notifications = this.notifications.get(userId) || [];
    return unreadOnly ? notifications.filter((n) => !n.read) : notifications;
  }

  markAsRead(userId: number, notificationId: string): boolean {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  markAllAsRead(userId: number): number {
    const notifications = this.notifications.get(userId);
    if (!notifications) return 0;

    let count = 0;
    for (const notification of notifications) {
      if (!notification.read) {
        notification.read = true;
        count++;
      }
    }
    return count;
  }

  getUnreadCount(userId: number): number {
    const notifications = this.notifications.get(userId) || [];
    return notifications.filter((n) => !n.read).length;
  }

  deleteNotification(userId: number, notificationId: string): boolean {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const index = notifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  clearAll(userId: number): void {
    this.notifications.delete(userId);
  }
}

export const inAppChannel = new InAppChannel();
