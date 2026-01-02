/**
 * @fileoverview رسائل الأخطاء المترجمة للنظام
 * @module errorMessages
 */

export const ErrorMessages = {
  // أخطاء عامة
  GENERAL: {
    INTERNAL_ERROR: {
      ar: "حدث خطأ داخلي في النظام",
      en: "Internal server error"
    },
    UNAUTHORIZED: {
      ar: "غير مصرح لك بالوصول",
      en: "Unauthorized access"
    },
    FORBIDDEN: {
      ar: "ليس لديك صلاحية لهذه العملية",
      en: "Access forbidden"
    },
    NOT_FOUND: {
      ar: "العنصر المطلوب غير موجود",
      en: "Resource not found"
    },
    VALIDATION_ERROR: {
      ar: "البيانات المدخلة غير صحيحة",
      en: "Validation error"
    },
    CONFLICT: {
      ar: "تعارض في البيانات",
      en: "Data conflict"
    },
  },

  // أخطاء المصادقة
  AUTH: {
    INVALID_CREDENTIALS: {
      ar: "اسم المستخدم أو كلمة المرور غير صحيحة",
      en: "Invalid username or password"
    },
    SESSION_EXPIRED: {
      ar: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
      en: "Session expired, please login again"
    },
    ACCOUNT_LOCKED: {
      ar: "تم قفل الحساب بسبب محاولات تسجيل دخول فاشلة متعددة",
      en: "Account locked due to multiple failed login attempts"
    },
    TOKEN_INVALID: {
      ar: "رمز المصادقة غير صالح",
      en: "Invalid authentication token"
    },
  },

  // أخطاء الأطراف
  PARTIES: {
    NOT_FOUND: {
      ar: "الطرف غير موجود",
      en: "Party not found"
    },
    CODE_EXISTS: {
      ar: "كود الطرف موجود مسبقاً",
      en: "Party code already exists"
    },
    HAS_TRANSACTIONS: {
      ar: "لا يمكن حذف الطرف لوجود حركات مرتبطة به",
      en: "Cannot delete party with existing transactions"
    },
    INVALID_TYPE: {
      ar: "نوع الطرف غير صحيح",
      en: "Invalid party type"
    },
  },

  // أخطاء التصنيفات
  CATEGORIES: {
    NOT_FOUND: {
      ar: "التصنيف غير موجود",
      en: "Category not found"
    },
    CODE_EXISTS: {
      ar: "كود التصنيف موجود مسبقاً",
      en: "Category code already exists"
    },
    HAS_CHILDREN: {
      ar: "لا يمكن حذف التصنيف لوجود تصنيفات فرعية",
      en: "Cannot delete category with child categories"
    },
    CIRCULAR_REFERENCE: {
      ar: "لا يمكن تعيين التصنيف كتابع لنفسه",
      en: "Circular reference detected"
    },
  },

  // أخطاء الخزائن
  TREASURIES: {
    NOT_FOUND: {
      ar: "الخزينة غير موجودة",
      en: "Treasury not found"
    },
    INSUFFICIENT_BALANCE: {
      ar: "الرصيد غير كافي",
      en: "Insufficient balance"
    },
    ALREADY_CLOSED: {
      ar: "الخزينة مغلقة",
      en: "Treasury is closed"
    },
    TRANSFER_SAME_TREASURY: {
      ar: "لا يمكن التحويل لنفس الخزينة",
      en: "Cannot transfer to the same treasury"
    },
  },

  // أخطاء السندات
  VOUCHERS: {
    NOT_FOUND: {
      ar: "السند غير موجود",
      en: "Voucher not found"
    },
    ALREADY_POSTED: {
      ar: "السند مرحّل مسبقاً",
      en: "Voucher already posted"
    },
    CANNOT_EDIT_POSTED: {
      ar: "لا يمكن تعديل سند مرحّل",
      en: "Cannot edit posted voucher"
    },
    INVALID_AMOUNT: {
      ar: "المبلغ غير صحيح",
      en: "Invalid amount"
    },
    MISSING_TREASURY: {
      ar: "يجب تحديد الخزينة",
      en: "Treasury is required"
    },
  },

  // أخطاء الحسابات
  ACCOUNTS: {
    NOT_FOUND: {
      ar: "الحساب غير موجود",
      en: "Account not found"
    },
    CODE_EXISTS: {
      ar: "رقم الحساب موجود مسبقاً",
      en: "Account code already exists"
    },
    HAS_ENTRIES: {
      ar: "لا يمكن حذف الحساب لوجود قيود مرتبطة به",
      en: "Cannot delete account with existing entries"
    },
    INVALID_PARENT: {
      ar: "الحساب الأب غير صحيح",
      en: "Invalid parent account"
    },
  },

  // أخطاء الأصول
  ASSETS: {
    NOT_FOUND: {
      ar: "الأصل غير موجود",
      en: "Asset not found"
    },
    ALREADY_DISPOSED: {
      ar: "الأصل تم استبعاده مسبقاً",
      en: "Asset already disposed"
    },
    INVALID_DEPRECIATION: {
      ar: "بيانات الإهلاك غير صحيحة",
      en: "Invalid depreciation data"
    },
  },

  // أخطاء المخزون
  INVENTORY: {
    NOT_FOUND: {
      ar: "الصنف غير موجود",
      en: "Item not found"
    },
    INSUFFICIENT_STOCK: {
      ar: "الكمية المتاحة غير كافية",
      en: "Insufficient stock"
    },
    NEGATIVE_QUANTITY: {
      ar: "الكمية لا يمكن أن تكون سالبة",
      en: "Quantity cannot be negative"
    },
  },

  // أخطاء قاعدة البيانات
  DATABASE: {
    CONNECTION_ERROR: {
      ar: "خطأ في الاتصال بقاعدة البيانات",
      en: "Database connection error"
    },
    QUERY_ERROR: {
      ar: "خطأ في تنفيذ الاستعلام",
      en: "Query execution error"
    },
    TRANSACTION_ERROR: {
      ar: "خطأ في المعاملة",
      en: "Transaction error"
    },
  },
} as const;

export type ErrorMessageKey = keyof typeof ErrorMessages;
export type ErrorSubKey<T extends ErrorMessageKey> = keyof typeof ErrorMessages[T];
