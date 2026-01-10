// server/notifications/types.ts

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannelType = 'in-app' | 'email' | 'sms' | 'whatsapp' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  channels: NotificationChannelType[];
  recipients: NotificationRecipient[];
  scheduledAt?: Date;
  createdAt: Date;
  status: NotificationStatus;
}

export interface NotificationRecipient {
  userId?: number;
  email?: string;
  phone?: string;
  name?: string;
}

export interface NotificationResult {
  success: boolean;
  notificationId: string;
  channel: NotificationChannelType;
  recipient: string;
  error?: string;
  sentAt?: Date;
}

export interface SendNotificationOptions {
  channels?: NotificationChannelType[];
  scheduledAt?: Date;
  priority?: 'low' | 'normal' | 'high';
  maxRetries?: number;
  retryDelay?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  titleTemplate: string;
  titleTemplateAr: string;
  messageTemplate: string;
  messageTemplateAr: string;
  channels: NotificationChannelType[];
  variables: string[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  channels: NotificationChannelType[];
  recipients: NotificationRecipient[];
  data?: Record<string, unknown>;
  scheduledAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  status: NotificationStatus;
}

export interface NotificationRecipient {
  userId?: number;
  email?: string;
  phone?: string;
  deviceToken?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  titleTemplate: string;
  titleTemplateAr: string;
  messageTemplate: string;
  messageTemplateAr: string;
  channels: NotificationChannelType[];
  variables: string[];
}

export interface SendNotificationOptions {
  template?: string;
  variables?: Record<string, string>;
  channels?: NotificationChannelType[];
  scheduledAt?: Date;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationChannel {
  send(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult>;
  getName(): string;
}

export interface NotificationResult {
  success: boolean;
  notificationId: string;
  channel: string;
  recipient: string;
  error?: string;
}
