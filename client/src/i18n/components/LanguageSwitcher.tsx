/**
 * @fileoverview مكون تبديل اللغة
 * @description يوفر واجهة لتبديل اللغة بين العربية والإنجليزية
 */

import React from 'react';
import { useLocale } from '../hooks/useLocale';
import type { SupportedLocale } from '../types';

/**
 * خصائص مكون تبديل اللغة
 */
interface LanguageSwitcherProps {
  /** نوع العرض */
  variant?: 'button' | 'dropdown' | 'toggle' | 'icon';
  /** حجم المكون */
  size?: 'sm' | 'md' | 'lg';
  /** إظهار الأيقونة */
  showIcon?: boolean;
  /** إظهار اسم اللغة */
  showLabel?: boolean;
  /** إظهار العلم */
  showFlag?: boolean;
  /** الأنماط الإضافية */
  className?: string;
  /** callback عند تغيير اللغة */
  onChange?: (locale: SupportedLocale) => void;
}

/**
 * أحجام المكون
 */
const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

/**
 * مكون تبديل اللغة
 */
export function LanguageSwitcher({
  variant = 'button',
  size = 'md',
  showIcon = true,
  showLabel = true,
  showFlag = false,
  className = '',
  onChange,
}: LanguageSwitcherProps) {
  const { locale, toggleLocale, setLocale, supportedLocales, localeInfo } = useLocale();

  /**
   * معالجة تغيير اللغة
   */
  const handleChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    onChange?.(newLocale);
  };

  /**
   * معالجة التبديل
   */
  const handleToggle = () => {
    toggleLocale();
    onChange?.(locale === 'ar' ? 'en' : 'ar');
  };

  /**
   * أيقونة اللغة
   */
  const LanguageIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );

  /**
   * عرض زر بسيط
   */
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`
          inline-flex items-center gap-2 rounded-md border border-gray-300
          bg-white hover:bg-gray-50 transition-colors
          dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700
          ${sizeClasses[size]}
          ${className}
        `}
        aria-label={`Switch to ${locale === 'ar' ? 'English' : 'العربية'}`}
      >
        {showIcon && <LanguageIcon />}
        {showFlag && <span>{localeInfo.flag}</span>}
        {showLabel && (
          <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
        )}
      </button>
    );
  }

  /**
   * عرض قائمة منسدلة
   */
  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block ${className}`}>
        <select
          value={locale}
          onChange={(e) => handleChange(e.target.value as SupportedLocale)}
          className={`
            appearance-none rounded-md border border-gray-300
            bg-white hover:bg-gray-50 cursor-pointer
            dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700
            pr-8 ${sizeClasses[size]}
          `}
          aria-label="Select language"
        >
          {supportedLocales.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {showFlag ? `${lang.flag} ` : ''}
              {lang.nativeName}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    );
  }

  /**
   * عرض مفتاح تبديل
   */
  if (variant === 'toggle') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className={`text-sm ${locale === 'ar' ? 'font-bold' : 'text-gray-500'}`}>
          العربية
        </span>
        <button
          type="button"
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
            ${locale === 'en' ? 'bg-blue-600' : 'bg-gray-300'}
          `}
          role="switch"
          aria-checked={locale === 'en'}
          aria-label="Toggle language"
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${locale === 'en' ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        <span className={`text-sm ${locale === 'en' ? 'font-bold' : 'text-gray-500'}`}>
          English
        </span>
      </div>
    );
  }

  /**
   * عرض أيقونة فقط
   */
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`
          inline-flex items-center justify-center rounded-full
          hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
          ${size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2'}
          ${className}
        `}
        aria-label={`Switch to ${locale === 'ar' ? 'English' : 'العربية'}`}
        title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        {showFlag ? (
          <span className="text-xl">{localeInfo.flag}</span>
        ) : (
          <LanguageIcon />
        )}
      </button>
    );
  }

  return null;
}

/**
 * مكون زر تبديل اللغة البسيط
 */
export function LanguageToggleButton({
  className = '',
  onChange,
}: Pick<LanguageSwitcherProps, 'className' | 'onChange'>) {
  return (
    <LanguageSwitcher
      variant="button"
      size="md"
      showIcon={true}
      showLabel={true}
      className={className}
      onChange={onChange}
    />
  );
}

/**
 * مكون أيقونة تبديل اللغة
 */
export function LanguageToggleIcon({
  className = '',
  onChange,
}: Pick<LanguageSwitcherProps, 'className' | 'onChange'>) {
  return (
    <LanguageSwitcher
      variant="icon"
      size="md"
      showFlag={true}
      className={className}
      onChange={onChange}
    />
  );
}

export default LanguageSwitcher;
