/**
 * @fileoverview أنواع TypeScript لنظام الترجمة (i18n)
 * @description تعريفات الأنواع المستخدمة في نظام الترجمة متعدد اللغات
 */

/**
 * اللغات المدعومة في النظام
 */
export type SupportedLocale = 'ar' | 'en';

/**
 * اتجاه الكتابة
 */
export type Direction = 'rtl' | 'ltr';

/**
 * معلومات اللغة
 */
export interface LocaleInfo {
  /** رمز اللغة */
  code: SupportedLocale;
  /** اسم اللغة بلغتها الأصلية */
  nativeName: string;
  /** اسم اللغة بالإنجليزية */
  englishName: string;
  /** اتجاه الكتابة */
  direction: Direction;
  /** رمز العلم (اختياري) */
  flag?: string;
}

/**
 * إعدادات اللغة
 */
export interface LocaleConfig {
  /** اللغة الافتراضية */
  defaultLocale: SupportedLocale;
  /** اللغات المدعومة */
  supportedLocales: SupportedLocale[];
  /** اللغة الاحتياطية */
  fallbackLocale: SupportedLocale;
  /** مفتاح التخزين المحلي */
  storageKey: string;
}

/**
 * مساحات أسماء الترجمة
 */
export type TranslationNamespace = 
  | 'common'
  | 'auth'
  | 'voucher'
  | 'party'
  | 'treasury'
  | 'errors';

/**
 * خيارات الترجمة
 */
export interface TranslationOptions {
  /** مساحة الاسم */
  ns?: TranslationNamespace;
  /** المتغيرات للاستبدال */
  variables?: Record<string, string | number>;
  /** القيمة الافتراضية */
  defaultValue?: string;
  /** العدد للجمع */
  count?: number;
}

/**
 * سياق اللغة
 */
export interface LocaleContextValue {
  /** اللغة الحالية */
  locale: SupportedLocale;
  /** اتجاه الكتابة الحالي */
  direction: Direction;
  /** تغيير اللغة */
  setLocale: (locale: SupportedLocale) => void;
  /** تبديل اللغة */
  toggleLocale: () => void;
  /** التحقق من اللغة العربية */
  isRTL: boolean;
  /** معلومات اللغة الحالية */
  localeInfo: LocaleInfo;
  /** قائمة اللغات المدعومة */
  supportedLocales: LocaleInfo[];
}

/**
 * ترجمات عامة
 */
export interface CommonTranslations {
  app: {
    name: string;
    welcome: string;
    description: string;
  };
  actions: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    print: string;
    refresh: string;
    close: string;
    confirm: string;
    back: string;
    next: string;
    submit: string;
    reset: string;
    view: string;
    download: string;
    upload: string;
  };
  messages: {
    success: string;
    error: string;
    confirm: string;
    loading: string;
    noData: string;
    noResults: string;
    required: string;
    invalid: string;
    saved: string;
    deleted: string;
    updated: string;
    created: string;
  };
  labels: {
    name: string;
    description: string;
    date: string;
    time: string;
    status: string;
    type: string;
    amount: string;
    total: string;
    notes: string;
    actions: string;
    details: string;
    settings: string;
    profile: string;
    logout: string;
  };
  pagination: {
    previous: string;
    next: string;
    first: string;
    last: string;
    page: string;
    of: string;
    showing: string;
    entries: string;
    perPage: string;
  };
  table: {
    noData: string;
    loading: string;
    error: string;
    empty: string;
    selectAll: string;
    selected: string;
  };
  form: {
    required: string;
    optional: string;
    invalid: string;
    minLength: string;
    maxLength: string;
    min: string;
    max: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  time: {
    today: string;
    yesterday: string;
    tomorrow: string;
    now: string;
    ago: string;
    in: string;
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
  };
}

/**
 * ترجمات المصادقة
 */
export interface AuthTranslations {
  login: {
    title: string;
    subtitle: string;
    username: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    submit: string;
    noAccount: string;
    register: string;
  };
  logout: {
    title: string;
    message: string;
    confirm: string;
    cancel: string;
  };
  register: {
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    submit: string;
    hasAccount: string;
    login: string;
  };
  errors: {
    invalidCredentials: string;
    userNotFound: string;
    passwordMismatch: string;
    emailExists: string;
    weakPassword: string;
    sessionExpired: string;
    unauthorized: string;
  };
  messages: {
    loginSuccess: string;
    logoutSuccess: string;
    registerSuccess: string;
    passwordChanged: string;
  };
}

/**
 * ترجمات السندات
 */
export interface VoucherTranslations {
  titles: {
    list: string;
    create: string;
    edit: string;
    view: string;
    receipt: string;
    payment: string;
  };
  fields: {
    voucherNumber: string;
    voucherType: string;
    date: string;
    amount: string;
    party: string;
    treasury: string;
    description: string;
    reference: string;
    status: string;
    createdBy: string;
    createdAt: string;
  };
  types: {
    receipt: string;
    payment: string;
    transfer: string;
    adjustment: string;
  };
  status: {
    draft: string;
    pending: string;
    approved: string;
    rejected: string;
    cancelled: string;
  };
  actions: {
    approve: string;
    reject: string;
    print: string;
    export: string;
  };
  messages: {
    created: string;
    updated: string;
    deleted: string;
    approved: string;
    rejected: string;
    printed: string;
  };
}

/**
 * ترجمات الأطراف
 */
export interface PartyTranslations {
  titles: {
    list: string;
    create: string;
    edit: string;
    view: string;
    customers: string;
    suppliers: string;
  };
  fields: {
    name: string;
    code: string;
    type: string;
    phone: string;
    email: string;
    address: string;
    balance: string;
    creditLimit: string;
    notes: string;
    status: string;
  };
  types: {
    customer: string;
    supplier: string;
    both: string;
  };
  status: {
    active: string;
    inactive: string;
    blocked: string;
  };
  messages: {
    created: string;
    updated: string;
    deleted: string;
    activated: string;
    deactivated: string;
  };
}

/**
 * ترجمات الخزائن
 */
export interface TreasuryTranslations {
  titles: {
    list: string;
    create: string;
    edit: string;
    view: string;
    main: string;
    branch: string;
  };
  fields: {
    name: string;
    code: string;
    type: string;
    balance: string;
    currency: string;
    branch: string;
    manager: string;
    status: string;
    openingBalance: string;
    currentBalance: string;
  };
  types: {
    cash: string;
    bank: string;
    safe: string;
  };
  status: {
    active: string;
    inactive: string;
    closed: string;
  };
  messages: {
    created: string;
    updated: string;
    deleted: string;
    opened: string;
    closed: string;
  };
}

/**
 * ترجمات الأخطاء
 */
export interface ErrorTranslations {
  general: {
    unknown: string;
    network: string;
    server: string;
    timeout: string;
    notFound: string;
    forbidden: string;
    unauthorized: string;
    badRequest: string;
    conflict: string;
    validation: string;
  };
  form: {
    required: string;
    invalid: string;
    minLength: string;
    maxLength: string;
    min: string;
    max: string;
    email: string;
    phone: string;
    unique: string;
    mismatch: string;
  };
  api: {
    fetchFailed: string;
    createFailed: string;
    updateFailed: string;
    deleteFailed: string;
    uploadFailed: string;
    downloadFailed: string;
  };
  auth: {
    invalidCredentials: string;
    sessionExpired: string;
    accountLocked: string;
    accountDisabled: string;
    permissionDenied: string;
  };
  business: {
    insufficientBalance: string;
    limitExceeded: string;
    duplicateEntry: string;
    invalidOperation: string;
    recordInUse: string;
  };
}

/**
 * جميع الترجمات
 */
export interface AllTranslations {
  common: CommonTranslations;
  auth: AuthTranslations;
  voucher: VoucherTranslations;
  party: PartyTranslations;
  treasury: TreasuryTranslations;
  errors: ErrorTranslations;
}

/**
 * موارد الترجمة
 */
export type TranslationResources = {
  [K in SupportedLocale]: AllTranslations;
};
