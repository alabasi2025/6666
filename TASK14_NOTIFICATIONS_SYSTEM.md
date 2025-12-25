# 📋 المهمة 14: إنشاء نظام Notifications

## 🎯 الهدف
إنشاء نظام إشعارات متكامل يدعم أنواع متعددة من الإشعارات (داخلية، بريد إلكتروني، SMS).

## 📁 الفرع
```
feature/task14-notifications-system
```

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/notifications/
├── types.ts              # أنواع TypeScript
├── notification-service.ts # خدمة الإشعارات الرئيسية
├── channels/
│   ├── in-app.ts         # الإشعارات الداخلية
│   ├── email.ts          # إشعارات البريد الإلكتروني
│   └── sms.ts            # إشعارات SMS
├── templates.ts          # قوالب الإشعارات
├── notification-queue.ts # طابور الإشعارات
└── index.ts              # ملف التصدير
```

## 🚫 الملفات الممنوع تعديلها
- `server/*Router.ts`
- `drizzle/schema.ts`
- `client/src/**/*`

---

## 📝 خطوات التنفيذ

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task14-notifications-system
```

### الخطوة 2: إنشاء المجلدات
```bash
mkdir -p server/notifications/channels
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
// server/notifications/types.ts

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  channels: NotificationChannel[];
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
  channels: NotificationChannel[];
  variables: string[];
}

export interface SendNotificationOptions {
  template?: string;
  variables?: Record<string, string>;
  channels?: NotificationChannel[];
  scheduledAt?: Date;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationChannel {
  send(notification: Notification, recipient: NotificationRecipient): Promise<boolean>;
  getName(): string;
}

export interface NotificationResult {
  success: boolean;
  notificationId: string;
  channel: string;
  recipient: string;
  error?: string;
}
```

### الخطوة 4: إنشاء ملف templates.ts
```typescript
// server/notifications/templates.ts

import { NotificationTemplate } from './types';

export const NotificationTemplates: Record<string, NotificationTemplate> = {
  // إشعارات النظام المخصص
  VOUCHER_CREATED: {
    id: 'voucher_created',
    name: 'سند جديد',
    titleTemplate: 'New Voucher Created',
    titleTemplateAr: 'تم إنشاء سند جديد',
    messageTemplate: 'A new {{voucherType}} voucher #{{voucherNumber}} has been created for {{amount}}',
    messageTemplateAr: 'تم إنشاء سند {{voucherType}} جديد رقم #{{voucherNumber}} بمبلغ {{amount}}',
    channels: ['in-app', 'email'],
    variables: ['voucherType', 'voucherNumber', 'amount'],
  },

  PAYMENT_RECEIVED: {
    id: 'payment_received',
    name: 'دفعة مستلمة',
    titleTemplate: 'Payment Received',
    titleTemplateAr: 'تم استلام دفعة',
    messageTemplate: 'Payment of {{amount}} received from {{partyName}}',
    messageTemplateAr: 'تم استلام دفعة بمبلغ {{amount}} من {{partyName}}',
    channels: ['in-app', 'email'],
    variables: ['amount', 'partyName'],
  },

  LOW_BALANCE_ALERT: {
    id: 'low_balance_alert',
    name: 'تنبيه رصيد منخفض',
    titleTemplate: 'Low Balance Alert',
    titleTemplateAr: 'تنبيه: رصيد منخفض',
    messageTemplate: 'Treasury {{treasuryName}} balance is below {{threshold}}. Current balance: {{currentBalance}}',
    messageTemplateAr: 'رصيد الخزينة {{treasuryName}} أقل من {{threshold}}. الرصيد الحالي: {{currentBalance}}',
    channels: ['in-app', 'email', 'sms'],
    variables: ['treasuryName', 'threshold', 'currentBalance'],
  },

  USER_WELCOME: {
    id: 'user_welcome',
    name: 'ترحيب بمستخدم جديد',
    titleTemplate: 'Welcome to the System',
    titleTemplateAr: 'مرحباً بك في النظام',
    messageTemplate: 'Hello {{userName}}, welcome to our system. Your account has been created successfully.',
    messageTemplateAr: 'مرحباً {{userName}}، أهلاً بك في نظامنا. تم إنشاء حسابك بنجاح.',
    channels: ['email'],
    variables: ['userName'],
  },

  PASSWORD_RESET: {
    id: 'password_reset',
    name: 'إعادة تعيين كلمة المرور',
    titleTemplate: 'Password Reset Request',
    titleTemplateAr: 'طلب إعادة تعيين كلمة المرور',
    messageTemplate: 'Click the link to reset your password: {{resetLink}}. This link expires in {{expiresIn}}.',
    messageTemplateAr: 'اضغط على الرابط لإعادة تعيين كلمة المرور: {{resetLink}}. ينتهي الرابط خلال {{expiresIn}}.',
    channels: ['email'],
    variables: ['resetLink', 'expiresIn'],
  },

  TASK_ASSIGNED: {
    id: 'task_assigned',
    name: 'مهمة جديدة',
    titleTemplate: 'New Task Assigned',
    titleTemplateAr: 'تم تعيين مهمة جديدة',
    messageTemplate: 'You have been assigned a new task: {{taskTitle}}. Due date: {{dueDate}}',
    messageTemplateAr: 'تم تعيين مهمة جديدة لك: {{taskTitle}}. تاريخ الاستحقاق: {{dueDate}}',
    channels: ['in-app', 'email'],
    variables: ['taskTitle', 'dueDate'],
  },

  APPROVAL_REQUIRED: {
    id: 'approval_required',
    name: 'موافقة مطلوبة',
    titleTemplate: 'Approval Required',
    titleTemplateAr: 'موافقة مطلوبة',
    messageTemplate: '{{documentType}} #{{documentNumber}} requires your approval.',
    messageTemplateAr: '{{documentType}} رقم #{{documentNumber}} يحتاج موافقتك.',
    channels: ['in-app', 'email', 'push'],
    variables: ['documentType', 'documentNumber'],
  },
};

export function getTemplate(templateId: string): NotificationTemplate | undefined {
  return NotificationTemplates[templateId];
}

export function renderTemplate(
  template: NotificationTemplate,
  variables: Record<string, string>,
  language: 'en' | 'ar' = 'ar'
): { title: string; message: string } {
  const titleTemplate = language === 'ar' ? template.titleTemplateAr : template.titleTemplate;
  const messageTemplate = language === 'ar' ? template.messageTemplateAr : template.messageTemplate;

  let title = titleTemplate;
  let message = messageTemplate;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    title = title.replace(new RegExp(placeholder, 'g'), value);
    message = message.replace(new RegExp(placeholder, 'g'), value);
  }

  return { title, message };
}
```

### الخطوة 5: إنشاء ملف channels/in-app.ts
```typescript
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
```

### الخطوة 6: إنشاء ملف channels/email.ts
```typescript
// server/notifications/channels/email.ts

import { Notification, NotificationRecipient, NotificationResult } from '../types';

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
      console.log('Sending email:', emailData);

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
```

### الخطوة 7: إنشاء ملف channels/sms.ts
```typescript
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
```

### الخطوة 8: إنشاء ملف notification-service.ts
```typescript
// server/notifications/notification-service.ts

import { 
  Notification, 
  NotificationRecipient, 
  NotificationResult,
  SendNotificationOptions,
  NotificationType,
  NotificationChannel as Channel
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
      { ...options, channels: options.channels || template.channels as any }
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
```

### الخطوة 9: إنشاء ملف index.ts
```typescript
// server/notifications/index.ts

export * from './types';
export * from './templates';
export * from './notification-service';
export * from './channels/in-app';
export * from './channels/email';
export * from './channels/sms';

export { notificationService } from './notification-service';
```

### الخطوة 10: رفع التغييرات
```bash
git add server/notifications/
git commit -m "feat(notifications): إضافة نظام إشعارات متكامل

- إضافة قنوات متعددة (in-app, email, sms)
- إضافة قوالب إشعارات جاهزة
- إضافة خدمة إشعارات موحدة
- دعم اللغة العربية والإنجليزية"

git push origin feature/task14-notifications-system
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/notifications/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `templates.ts`
- [ ] إنشاء ملف `channels/in-app.ts`
- [ ] إنشاء ملف `channels/email.ts`
- [ ] إنشاء ملف `channels/sms.ts`
- [ ] إنشاء ملف `notification-service.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
