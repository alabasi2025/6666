/**
 * @fileoverview مكون النص المترجم
 * @description يوفر طريقة سهلة لعرض النصوص المترجمة
 */

import React, { type ElementType, type ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { useTranslation } from '../hooks/useTranslation';
import type { TranslationNamespace } from '../types';

/**
 * خصائص مكون النص المترجم
 */
interface TranslatedTextProps {
  /** مفتاح الترجمة */
  i18nKey: string;
  /** مساحة الاسم */
  ns?: TranslationNamespace;
  /** المتغيرات للاستبدال */
  values?: Record<string, string | number>;
  /** القيمة الافتراضية */
  defaultValue?: string;
  /** العدد للجمع */
  count?: number;
  /** العنصر المحيط */
  as?: ElementType;
  /** الأنماط الإضافية */
  className?: string;
  /** المكونات للاستبدال في الترجمة */
  components?: Record<string, React.ReactElement>;
  /** الأبناء (للترجمات المعقدة) */
  children?: ReactNode;
}

/**
 * مكون النص المترجم
 * يستخدم لعرض النصوص المترجمة بطريقة تصريحية
 */
export function TranslatedText({
  i18nKey,
  ns = 'common',
  values,
  defaultValue,
  count,
  as: Component = 'span',
  className,
  components,
  children,
}: TranslatedTextProps) {
  const { t } = useTranslation(ns);

  // إذا كانت هناك مكونات للاستبدال، استخدم Trans
  if (components || children) {
    return (
      <Trans
        i18nKey={i18nKey}
        ns={ns}
        values={values}
        count={count}
        defaults={defaultValue}
        components={components}
      >
        {children}
      </Trans>
    );
  }

  // خلاف ذلك، استخدم الترجمة البسيطة
  const translatedText = t(i18nKey, {
    ns,
    variables: values,
    defaultValue,
    count,
  });

  return <Component className={className}>{translatedText}</Component>;
}

/**
 * خصائص مكون الفقرة المترجمة
 */
interface TranslatedParagraphProps extends Omit<TranslatedTextProps, 'as'> {}

/**
 * مكون الفقرة المترجمة
 */
export function TranslatedParagraph(props: TranslatedParagraphProps) {
  return <TranslatedText {...props} as="p" />;
}

/**
 * خصائص مكون العنوان المترجم
 */
interface TranslatedHeadingProps extends Omit<TranslatedTextProps, 'as'> {
  /** مستوى العنوان */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * مكون العنوان المترجم
 */
export function TranslatedHeading({
  level = 1,
  ...props
}: TranslatedHeadingProps) {
  const Tag = `h${level}` as ElementType;
  return <TranslatedText {...props} as={Tag} />;
}

/**
 * خصائص مكون الزر المترجم
 */
interface TranslatedButtonProps extends Omit<TranslatedTextProps, 'as'> {
  /** نوع الزر */
  type?: 'button' | 'submit' | 'reset';
  /** معطل */
  disabled?: boolean;
  /** callback عند النقر */
  onClick?: () => void;
}

/**
 * مكون الزر المترجم
 */
export function TranslatedButton({
  i18nKey,
  ns = 'common',
  values,
  defaultValue,
  className,
  type = 'button',
  disabled,
  onClick,
}: TranslatedButtonProps) {
  const { t } = useTranslation(ns);

  const translatedText = t(i18nKey, {
    ns,
    variables: values,
    defaultValue,
  });

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {translatedText}
    </button>
  );
}

/**
 * خصائص مكون التسمية المترجمة
 */
interface TranslatedLabelProps extends Omit<TranslatedTextProps, 'as'> {
  /** معرف الحقل المرتبط */
  htmlFor?: string;
  /** مطلوب */
  required?: boolean;
}

/**
 * مكون التسمية المترجمة
 */
export function TranslatedLabel({
  i18nKey,
  ns = 'common',
  values,
  defaultValue,
  className,
  htmlFor,
  required,
}: TranslatedLabelProps) {
  const { t } = useTranslation(ns);

  const translatedText = t(i18nKey, {
    ns,
    variables: values,
    defaultValue,
  });

  return (
    <label htmlFor={htmlFor} className={className}>
      {translatedText}
      {required && <span className="text-red-500 mr-1">*</span>}
    </label>
  );
}

/**
 * خصائص مكون الرابط المترجم
 */
interface TranslatedLinkProps extends Omit<TranslatedTextProps, 'as'> {
  /** الرابط */
  href: string;
  /** فتح في نافذة جديدة */
  external?: boolean;
}

/**
 * مكون الرابط المترجم
 */
export function TranslatedLink({
  i18nKey,
  ns = 'common',
  values,
  defaultValue,
  className,
  href,
  external,
}: TranslatedLinkProps) {
  const { t } = useTranslation(ns);

  const translatedText = t(i18nKey, {
    ns,
    variables: values,
    defaultValue,
  });

  return (
    <a
      href={href}
      className={className}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {translatedText}
    </a>
  );
}

/**
 * خصائص مكون الرسالة المترجمة
 */
interface TranslatedMessageProps extends Omit<TranslatedTextProps, 'as'> {
  /** نوع الرسالة */
  type?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * مكون الرسالة المترجمة
 */
export function TranslatedMessage({
  i18nKey,
  ns = 'common',
  values,
  defaultValue,
  className,
  type = 'info',
}: TranslatedMessageProps) {
  const { t } = useTranslation(ns);

  const translatedText = t(i18nKey, {
    ns,
    variables: values,
    defaultValue,
  });

  const typeClasses = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div
      className={`p-3 rounded-md border ${typeClasses[type]} ${className || ''}`}
      role="alert"
    >
      {translatedText}
    </div>
  );
}

export default TranslatedText;
