/**
 * @fileoverview إعدادات نظام الترجمة (i18n)
 * @description تهيئة وإعدادات i18next للتطبيق
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { SupportedLocale, LocaleInfo, LocaleConfig } from './types';

// استيراد ملفات الترجمة العربية
import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arVoucher from './locales/ar/voucher.json';
import arParty from './locales/ar/party.json';
import arTreasury from './locales/ar/treasury.json';
import arErrors from './locales/ar/errors.json';

// استيراد ملفات الترجمة الإنجليزية
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enVoucher from './locales/en/voucher.json';
import enParty from './locales/en/party.json';
import enTreasury from './locales/en/treasury.json';
import enErrors from './locales/en/errors.json';

/**
 * إعدادات اللغة الافتراضية
 */
export const localeConfig: LocaleConfig = {
  defaultLocale: 'ar',
  supportedLocales: ['ar', 'en'],
  fallbackLocale: 'ar',
  storageKey: 'energy-system-locale',
};

/**
 * معلومات اللغات المدعومة
 */
export const localesInfo: Record<SupportedLocale, LocaleInfo> = {
  ar: {
    code: 'ar',
    nativeName: 'العربية',
    englishName: 'Arabic',
    direction: 'rtl',
    flag: '🇸🇦',
  },
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
};

/**
 * قائمة اللغات المدعومة
 */
export const supportedLocalesList: LocaleInfo[] = Object.values(localesInfo);

/**
 * موارد الترجمة
 */
export const resources = {
  ar: {
    common: arCommon,
    auth: arAuth,
    voucher: arVoucher,
    party: arParty,
    treasury: arTreasury,
    errors: arErrors,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    voucher: enVoucher,
    party: enParty,
    treasury: enTreasury,
    errors: enErrors,
  },
};

/**
 * مساحات الأسماء الافتراضية
 */
export const defaultNS = 'common';
export const namespaces = ['common', 'auth', 'voucher', 'party', 'treasury', 'errors'] as const;

/**
 * تهيئة i18next
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    ns: namespaces,
    lng: localeConfig.defaultLocale,
    fallbackLng: localeConfig.fallbackLocale,
    supportedLngs: localeConfig.supportedLocales,
    
    interpolation: {
      escapeValue: false, // React يقوم بالتهرب تلقائياً
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: localeConfig.storageKey,
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
    
    // إعدادات إضافية
    returnNull: false,
    returnEmptyString: false,
    returnObjects: true,
    
    // تسجيل المفاتيح المفقودة (للتطوير فقط)
    saveMissing: false,
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${lng}/${ns}/${key}`);
      }
    },
  });

/**
 * الحصول على اتجاه الكتابة للغة
 */
export const getDirection = (locale: SupportedLocale): 'rtl' | 'ltr' => {
  return localesInfo[locale]?.direction || 'rtl';
};

/**
 * الحصول على معلومات اللغة
 */
export const getLocaleInfo = (locale: SupportedLocale): LocaleInfo => {
  return localesInfo[locale] || localesInfo.ar;
};

/**
 * التحقق من صحة رمز اللغة
 */
export const isValidLocale = (locale: string): locale is SupportedLocale => {
  return localeConfig.supportedLocales.includes(locale as SupportedLocale);
};

/**
 * الحصول على اللغة المعاكسة
 */
export const getOppositeLocale = (locale: SupportedLocale): SupportedLocale => {
  return locale === 'ar' ? 'en' : 'ar';
};

export default i18n;
