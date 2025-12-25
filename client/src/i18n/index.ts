/**
 * @fileoverview ملف التصدير الرئيسي لنظام الترجمة (i18n)
 * @description يصدر جميع المكونات والأدوات والأنواع المتعلقة بالترجمة
 */

// تصدير الإعدادات
export { default as i18n } from './config';
export {
  localeConfig,
  localesInfo,
  supportedLocalesList,
  resources,
  defaultNS,
  namespaces,
  getDirection,
  getLocaleInfo,
  isValidLocale,
  getOppositeLocale,
} from './config';

// تصدير الأنواع
export type {
  SupportedLocale,
  Direction,
  LocaleInfo,
  LocaleConfig,
  TranslationNamespace,
  TranslationOptions,
  LocaleContextValue,
  CommonTranslations,
  AuthTranslations,
  VoucherTranslations,
  PartyTranslations,
  TreasuryTranslations,
  ErrorTranslations,
  AllTranslations,
  TranslationResources,
} from './types';

// تصدير الـ Hooks
export { useTranslation, useMultiTranslation } from './hooks/useTranslation';
export {
  useLocale,
  useDirection,
  useIsRTL,
  useLocaleInfo,
} from './hooks/useLocale';

// تصدير المكونات
export {
  LanguageSwitcher,
  LanguageToggleButton,
  LanguageToggleIcon,
} from './components/LanguageSwitcher';
export {
  TranslatedText,
  TranslatedParagraph,
  TranslatedHeading,
  TranslatedButton,
  TranslatedLabel,
  TranslatedLink,
  TranslatedMessage,
} from './components/TranslatedText';

// تصدير الأدوات المساعدة
export {
  getStoredLocale,
  setStoredLocale,
  getLocaleDirection,
  formatNumber,
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  arabicToEnglishNumbers,
  englishToArabicNumbers,
  translate,
  changeLanguage,
  getCurrentLocale,
  isI18nReady,
  createTranslationKey,
  parseTranslationKey,
  getMissingKeys,
} from './utils';

// تصدير افتراضي للإعدادات
export { default } from './config';
