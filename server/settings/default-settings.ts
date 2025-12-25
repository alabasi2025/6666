// server/settings/default-settings.ts

import { SettingDefinition } from './types';

export const DefaultSettings: SettingDefinition[] = [
  // إعدادات عامة
  {
    key: 'app.language',
    name: 'Default Language',
    nameAr: 'اللغة الافتراضية',
    description: 'Default application language',
    descriptionAr: 'اللغة الافتراضية للتطبيق',
    type: 'string',
    scope: 'business',
    defaultValue: 'ar',
    category: 'general',
    options: [
      { value: 'ar', label: 'Arabic', labelAr: 'العربية' },
      { value: 'en', label: 'English', labelAr: 'الإنجليزية' },
    ],
  },
  {
    key: 'app.timezone',
    name: 'Timezone',
    nameAr: 'المنطقة الزمنية',
    description: 'Application timezone',
    descriptionAr: 'المنطقة الزمنية للتطبيق',
    type: 'string',
    scope: 'business',
    defaultValue: 'Asia/Riyadh',
    category: 'general',
  },
  {
    key: 'app.dateFormat',
    name: 'Date Format',
    nameAr: 'تنسيق التاريخ',
    description: 'Date display format',
    descriptionAr: 'تنسيق عرض التاريخ',
    type: 'string',
    scope: 'business',
    defaultValue: 'DD/MM/YYYY',
    category: 'general',
    options: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', labelAr: 'يوم/شهر/سنة' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', labelAr: 'شهر/يوم/سنة' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', labelAr: 'سنة-شهر-يوم' },
    ],
  },

  // إعدادات العملة
  {
    key: 'currency.default',
    name: 'Default Currency',
    nameAr: 'العملة الافتراضية',
    description: 'Default currency for transactions',
    descriptionAr: 'العملة الافتراضية للمعاملات',
    type: 'string',
    scope: 'business',
    defaultValue: 'SAR',
    category: 'currency',
    options: [
      { value: 'SAR', label: 'Saudi Riyal', labelAr: 'ريال سعودي' },
      { value: 'USD', label: 'US Dollar', labelAr: 'دولار أمريكي' },
      { value: 'EUR', label: 'Euro', labelAr: 'يورو' },
      { value: 'AED', label: 'UAE Dirham', labelAr: 'درهم إماراتي' },
    ],
  },
  {
    key: 'currency.decimals',
    name: 'Decimal Places',
    nameAr: 'الخانات العشرية',
    description: 'Number of decimal places for amounts',
    descriptionAr: 'عدد الخانات العشرية للمبالغ',
    type: 'number',
    scope: 'business',
    defaultValue: 2,
    category: 'currency',
    validation: { min: 0, max: 4 },
  },

  // إعدادات السندات
  {
    key: 'voucher.autoNumber',
    name: 'Auto Numbering',
    nameAr: 'الترقيم التلقائي',
    description: 'Enable automatic voucher numbering',
    descriptionAr: 'تفعيل الترقيم التلقائي للسندات',
    type: 'boolean',
    scope: 'business',
    defaultValue: true,
    category: 'voucher',
  },
  {
    key: 'voucher.numberPrefix',
    name: 'Number Prefix',
    nameAr: 'بادئة الرقم',
    description: 'Prefix for voucher numbers',
    descriptionAr: 'بادئة أرقام السندات',
    type: 'string',
    scope: 'business',
    defaultValue: 'V',
    category: 'voucher',
    validation: { maxLength: 5 },
  },
  {
    key: 'voucher.requireApproval',
    name: 'Require Approval',
    nameAr: 'يتطلب موافقة',
    description: 'Require approval for vouchers',
    descriptionAr: 'طلب موافقة على السندات',
    type: 'boolean',
    scope: 'business',
    defaultValue: false,
    category: 'voucher',
  },
  {
    key: 'voucher.approvalThreshold',
    name: 'Approval Threshold',
    nameAr: 'حد الموافقة',
    description: 'Amount threshold requiring approval',
    descriptionAr: 'المبلغ الذي يتطلب موافقة',
    type: 'number',
    scope: 'business',
    defaultValue: 10000,
    category: 'voucher',
    validation: { min: 0 },
  },

  // إعدادات التقارير
  {
    key: 'report.defaultFormat',
    name: 'Default Format',
    nameAr: 'التنسيق الافتراضي',
    description: 'Default report export format',
    descriptionAr: 'تنسيق التصدير الافتراضي للتقارير',
    type: 'string',
    scope: 'user',
    defaultValue: 'pdf',
    category: 'report',
    options: [
      { value: 'pdf', label: 'PDF', labelAr: 'PDF' },
      { value: 'excel', label: 'Excel', labelAr: 'Excel' },
      { value: 'csv', label: 'CSV', labelAr: 'CSV' },
    ],
  },
  {
    key: 'report.pageSize',
    name: 'Page Size',
    nameAr: 'حجم الصفحة',
    description: 'Default page size for reports',
    descriptionAr: 'حجم الصفحة الافتراضي للتقارير',
    type: 'string',
    scope: 'user',
    defaultValue: 'A4',
    category: 'report',
    options: [
      { value: 'A4', label: 'A4', labelAr: 'A4' },
      { value: 'A3', label: 'A3', labelAr: 'A3' },
      { value: 'Letter', label: 'Letter', labelAr: 'Letter' },
    ],
  },

  // إعدادات الإشعارات
  {
    key: 'notification.email',
    name: 'Email Notifications',
    nameAr: 'إشعارات البريد',
    description: 'Enable email notifications',
    descriptionAr: 'تفعيل إشعارات البريد الإلكتروني',
    type: 'boolean',
    scope: 'user',
    defaultValue: true,
    category: 'notification',
  },
  {
    key: 'notification.sms',
    name: 'SMS Notifications',
    nameAr: 'إشعارات SMS',
    description: 'Enable SMS notifications',
    descriptionAr: 'تفعيل إشعارات الرسائل النصية',
    type: 'boolean',
    scope: 'user',
    defaultValue: false,
    category: 'notification',
  },
  {
    key: 'notification.inApp',
    name: 'In-App Notifications',
    nameAr: 'إشعارات التطبيق',
    description: 'Enable in-app notifications',
    descriptionAr: 'تفعيل الإشعارات داخل التطبيق',
    type: 'boolean',
    scope: 'user',
    defaultValue: true,
    category: 'notification',
  },

  // إعدادات الأمان
  {
    key: 'security.sessionTimeout',
    name: 'Session Timeout',
    nameAr: 'مهلة الجلسة',
    description: 'Session timeout in minutes',
    descriptionAr: 'مهلة انتهاء الجلسة بالدقائق',
    type: 'number',
    scope: 'system',
    defaultValue: 60,
    category: 'security',
    validation: { min: 5, max: 1440 },
  },
  {
    key: 'security.maxLoginAttempts',
    name: 'Max Login Attempts',
    nameAr: 'محاولات تسجيل الدخول',
    description: 'Maximum failed login attempts',
    descriptionAr: 'الحد الأقصى لمحاولات تسجيل الدخول الفاشلة',
    type: 'number',
    scope: 'system',
    defaultValue: 5,
    category: 'security',
    validation: { min: 3, max: 10 },
  },
  {
    key: 'security.passwordMinLength',
    name: 'Min Password Length',
    nameAr: 'طول كلمة المرور',
    description: 'Minimum password length',
    descriptionAr: 'الحد الأدنى لطول كلمة المرور',
    type: 'number',
    scope: 'system',
    defaultValue: 8,
    category: 'security',
    validation: { min: 6, max: 32 },
  },
];

/**
 * الحصول على إعداد بالمفتاح
 */
export function getSettingDefinition(key: string): SettingDefinition | undefined {
  return DefaultSettings.find((s) => s.key === key);
}

/**
 * الحصول على الإعدادات حسب الفئة
 */
export function getSettingsByCategory(category: string): SettingDefinition[] {
  return DefaultSettings.filter((s) => s.category === category);
}

/**
 * الحصول على الإعدادات حسب النطاق
 */
export function getSettingsByScope(scope: string): SettingDefinition[] {
  return DefaultSettings.filter((s) => s.scope === scope);
}

/**
 * الحصول على جميع الفئات
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(DefaultSettings.map((s) => s.category)));
}
