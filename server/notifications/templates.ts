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
