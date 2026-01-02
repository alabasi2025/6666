/**
 * @fileoverview Hook للترجمة
 * @description يوفر وظائف الترجمة للمكونات
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { TranslationNamespace, TranslationOptions } from '../types';

/**
 * Hook مخصص للترجمة
 * @param namespace - مساحة الاسم الافتراضية
 * @returns دوال وخصائص الترجمة
 */
export function useTranslation(namespace: TranslationNamespace = 'common') {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  /**
   * ترجمة مفتاح مع خيارات
   * @param key - مفتاح الترجمة
   * @param options - خيارات الترجمة
   * @returns النص المترجم
   */
  const translate = (
    key: string,
    options?: TranslationOptions
  ): string => {
    const { ns, variables, defaultValue, count } = options || {};
    
    return t(key, {
      ns: ns || namespace,
      defaultValue,
      count,
      ...variables,
    }) as string;
  };

  /**
   * ترجمة مفتاح من مساحة اسم محددة
   * @param ns - مساحة الاسم
   * @param key - مفتاح الترجمة
   * @param variables - المتغيرات
   * @returns النص المترجم
   */
  const translateFrom = (
    ns: TranslationNamespace,
    key: string,
    variables?: Record<string, string | number>
  ): string => {
    return t(key, { ns, ...variables }) as string;
  };

  /**
   * التحقق من وجود مفتاح ترجمة
   * @param key - مفتاح الترجمة
   * @param ns - مساحة الاسم (اختياري)
   * @returns هل المفتاح موجود
   */
  const exists = (key: string, ns?: TranslationNamespace): boolean => {
    return i18n.exists(key, { ns: ns || namespace });
  };

  /**
   * الحصول على اللغة الحالية
   */
  const currentLanguage = i18n.language;

  /**
   * التحقق من اللغة العربية
   */
  const isArabic = currentLanguage === 'ar';

  /**
   * التحقق من اللغة الإنجليزية
   */
  const isEnglish = currentLanguage === 'en';

  return {
    t: translate,
    translate,
    translateFrom,
    exists,
    i18n,
    ready,
    currentLanguage,
    isArabic,
    isEnglish,
  };
}

/**
 * Hook للترجمة من مساحات أسماء متعددة
 * @param namespaces - قائمة مساحات الأسماء
 * @returns دوال الترجمة
 */
export function useMultiTranslation(namespaces: TranslationNamespace[]) {
  const { t, i18n, ready } = useI18nTranslation(namespaces);

  /**
   * ترجمة مفتاح مع تحديد مساحة الاسم
   * @param ns - مساحة الاسم
   * @param key - مفتاح الترجمة
   * @param variables - المتغيرات
   * @returns النص المترجم
   */
  const translate = (
    ns: TranslationNamespace,
    key: string,
    variables?: Record<string, string | number>
  ): string => {
    return t(`${ns}:${key}`, variables) as string;
  };

  return {
    t: translate,
    translate,
    i18n,
    ready,
  };
}

export default useTranslation;
