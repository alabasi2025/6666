/**
 * @fileoverview Hook لإدارة اللغة
 * @description يوفر وظائف إدارة اللغة واتجاه الكتابة
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLocale, Direction, LocaleInfo, LocaleContextValue } from '../types';
import {
  localeConfig,
  localesInfo,
  supportedLocalesList,
  getDirection,
  getLocaleInfo,
  getOppositeLocale,
  isValidLocale,
} from '../config';

/**
 * Hook لإدارة اللغة
 * @returns قيم وأدوات إدارة اللغة
 */
export function useLocale(): LocaleContextValue {
  const { i18n } = useTranslation();

  /**
   * اللغة الحالية
   */
  const locale = useMemo((): SupportedLocale => {
    const currentLang = i18n.language;
    return isValidLocale(currentLang) ? currentLang : localeConfig.defaultLocale;
  }, [i18n.language]);

  /**
   * اتجاه الكتابة الحالي
   */
  const direction = useMemo((): Direction => {
    return getDirection(locale);
  }, [locale]);

  /**
   * التحقق من اللغة العربية (RTL)
   */
  const isRTL = useMemo((): boolean => {
    return direction === 'rtl';
  }, [direction]);

  /**
   * معلومات اللغة الحالية
   */
  const localeInfo = useMemo((): LocaleInfo => {
    return getLocaleInfo(locale);
  }, [locale]);

  /**
   * قائمة اللغات المدعومة
   */
  const supportedLocales = useMemo((): LocaleInfo[] => {
    return supportedLocalesList;
  }, []);

  /**
   * تغيير اللغة
   */
  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      if (isValidLocale(newLocale) && newLocale !== locale) {
        i18n.changeLanguage(newLocale);
        localStorage.setItem(localeConfig.storageKey, newLocale);
      }
    },
    [i18n, locale]
  );

  /**
   * تبديل اللغة بين العربية والإنجليزية
   */
  const toggleLocale = useCallback(() => {
    const newLocale = getOppositeLocale(locale);
    setLocale(newLocale);
  }, [locale, setLocale]);

  /**
   * تحديث اتجاه الصفحة عند تغيير اللغة
   */
  useEffect(() => {
    // تحديث اتجاه الصفحة
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
    
    // تحديث خاصية اتجاه الكتابة في body
    document.body.style.direction = direction;
    
    // إضافة/إزالة class للـ RTL
    if (isRTL) {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, [direction, locale, isRTL]);

  return {
    locale,
    direction,
    setLocale,
    toggleLocale,
    isRTL,
    localeInfo,
    supportedLocales,
  };
}

/**
 * Hook للحصول على اتجاه الكتابة فقط
 * @returns اتجاه الكتابة الحالي
 */
export function useDirection(): Direction {
  const { direction } = useLocale();
  return direction;
}

/**
 * Hook للتحقق من RTL
 * @returns هل اللغة الحالية RTL
 */
export function useIsRTL(): boolean {
  const { isRTL } = useLocale();
  return isRTL;
}

/**
 * Hook للحصول على معلومات اللغة
 * @returns معلومات اللغة الحالية
 */
export function useLocaleInfo(): LocaleInfo {
  const { localeInfo } = useLocale();
  return localeInfo;
}

export default useLocale;
