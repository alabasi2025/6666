/**
 * @fileoverview أدوات مساعدة لنظام الترجمة
 * @description وظائف مساعدة للتعامل مع الترجمة واللغات
 */

import type { SupportedLocale, Direction, TranslationNamespace } from './types';
import { localeConfig, localesInfo, isValidLocale } from './config';
import i18n from './config';

/**
 * الحصول على اللغة المحفوظة في التخزين المحلي
 * @returns اللغة المحفوظة أو الافتراضية
 */
export function getStoredLocale(): SupportedLocale {
  const stored = localStorage.getItem(localeConfig.storageKey);
  if (stored && isValidLocale(stored)) {
    return stored;
  }
  return localeConfig.defaultLocale;
}

/**
 * حفظ اللغة في التخزين المحلي
 * @param locale - اللغة للحفظ
 */
export function setStoredLocale(locale: SupportedLocale): void {
  localStorage.setItem(localeConfig.storageKey, locale);
}

/**
 * الحصول على اتجاه الكتابة للغة
 * @param locale - رمز اللغة
 * @returns اتجاه الكتابة
 */
export function getLocaleDirection(locale: SupportedLocale): Direction {
  return localesInfo[locale]?.direction || 'rtl';
}

/**
 * تنسيق الأرقام حسب اللغة
 * @param value - الرقم
 * @param locale - اللغة
 * @param options - خيارات التنسيق
 * @returns الرقم المنسق
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale = 'ar',
  options?: Intl.NumberFormatOptions
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeCode, options).format(value);
}

/**
 * تنسيق العملة حسب اللغة
 * @param value - المبلغ
 * @param currency - رمز العملة
 * @param locale - اللغة
 * @returns المبلغ المنسق
 */
export function formatCurrency(
  value: number,
  currency: string = 'SAR',
  locale: SupportedLocale = 'ar'
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * تنسيق التاريخ حسب اللغة
 * @param date - التاريخ
 * @param locale - اللغة
 * @param options - خيارات التنسيق
 * @returns التاريخ المنسق
 */
export function formatDate(
  date: Date | string | number,
  locale: SupportedLocale = 'ar',
  options?: Intl.DateTimeFormatOptions
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * تنسيق الوقت حسب اللغة
 * @param date - التاريخ/الوقت
 * @param locale - اللغة
 * @param options - خيارات التنسيق
 * @returns الوقت المنسق
 */
export function formatTime(
  date: Date | string | number,
  locale: SupportedLocale = 'ar',
  options?: Intl.DateTimeFormatOptions
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(dateObj);
}

/**
 * تنسيق التاريخ والوقت حسب اللغة
 * @param date - التاريخ/الوقت
 * @param locale - اللغة
 * @returns التاريخ والوقت المنسق
 */
export function formatDateTime(
  date: Date | string | number,
  locale: SupportedLocale = 'ar'
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * تنسيق التاريخ النسبي (منذ...)
 * @param date - التاريخ
 * @param locale - اللغة
 * @returns التاريخ النسبي
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: SupportedLocale = 'ar'
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });

  if (diffYear > 0) return rtf.format(-diffYear, 'year');
  if (diffMonth > 0) return rtf.format(-diffMonth, 'month');
  if (diffWeek > 0) return rtf.format(-diffWeek, 'week');
  if (diffDay > 0) return rtf.format(-diffDay, 'day');
  if (diffHour > 0) return rtf.format(-diffHour, 'hour');
  if (diffMin > 0) return rtf.format(-diffMin, 'minute');
  return rtf.format(-diffSec, 'second');
}

/**
 * تحويل الأرقام العربية إلى إنجليزية
 * @param str - النص
 * @returns النص مع أرقام إنجليزية
 */
export function arabicToEnglishNumbers(str: string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str;
  arabicNumbers.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), index.toString());
  });
  return result;
}

/**
 * تحويل الأرقام الإنجليزية إلى عربية
 * @param str - النص
 * @returns النص مع أرقام عربية
 */
export function englishToArabicNumbers(str: string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str;
  for (let i = 0; i <= 9; i++) {
    result = result.replace(new RegExp(i.toString(), 'g'), arabicNumbers[i]);
  }
  return result;
}

/**
 * الحصول على ترجمة مباشرة (خارج React)
 * @param key - مفتاح الترجمة
 * @param ns - مساحة الاسم
 * @param options - خيارات إضافية
 * @returns النص المترجم
 */
export function translate(
  key: string,
  ns: TranslationNamespace = 'common',
  options?: Record<string, unknown>
): string {
  return i18n.t(key, { ns, ...options }) as string;
}

/**
 * تغيير اللغة برمجياً
 * @param locale - اللغة الجديدة
 */
export async function changeLanguage(locale: SupportedLocale): Promise<void> {
  if (isValidLocale(locale)) {
    await i18n.changeLanguage(locale);
    setStoredLocale(locale);
    
    // تحديث اتجاه الصفحة
    const direction = getLocaleDirection(locale);
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }
}

/**
 * الحصول على اللغة الحالية
 * @returns اللغة الحالية
 */
export function getCurrentLocale(): SupportedLocale {
  const lang = i18n.language;
  return isValidLocale(lang) ? lang : localeConfig.defaultLocale;
}

/**
 * التحقق من جاهزية نظام الترجمة
 * @returns هل النظام جاهز
 */
export function isI18nReady(): boolean {
  return i18n.isInitialized;
}

/**
 * إنشاء مفتاح ترجمة من مساحة اسم ومفتاح
 * @param ns - مساحة الاسم
 * @param key - المفتاح
 * @returns المفتاح الكامل
 */
export function createTranslationKey(ns: TranslationNamespace, key: string): string {
  return `${ns}:${key}`;
}

/**
 * تقسيم مفتاح ترجمة إلى مساحة اسم ومفتاح
 * @param fullKey - المفتاح الكامل
 * @returns مساحة الاسم والمفتاح
 */
export function parseTranslationKey(fullKey: string): {
  ns: TranslationNamespace;
  key: string;
} {
  const [ns, ...keyParts] = fullKey.split(':');
  return {
    ns: (ns as TranslationNamespace) || 'common',
    key: keyParts.join(':') || fullKey,
  };
}

/**
 * الحصول على قائمة المفاتيح المفقودة (للتطوير)
 * @returns قائمة المفاتيح المفقودة
 */
export function getMissingKeys(): string[] {
  // هذه الوظيفة للتطوير فقط
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }
  
  // يمكن تنفيذ منطق تتبع المفاتيح المفقودة هنا
  return [];
}
