# 📋 المهمة 8: تحسين معالجة الأخطاء (Error Handling)

## 🎯 الهدف
إنشاء نظام موحد لمعالجة الأخطاء في التطبيق مع رسائل خطأ واضحة ومترجمة بالعربية.

---

## 📁 الفرع
```
feature/task8-error-handling
```

---

## ✅ الملفات المسموح إنشاؤها/تعديلها (فقط)
```
server/utils/errors.ts (جديد)
server/utils/errorMessages.ts (جديد)
server/middleware/errorHandler.ts (جديد)
```

---

## 🚫 الملفات الممنوع تعديلها
```
❌ drizzle/schema.ts
❌ server/db.ts
❌ server/*Router.ts
❌ client/**/*
❌ docs/**/*
```

---

## 📝 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task8-error-handling
git pull origin feature/task8-error-handling
```

### الخطوة 2: إنشاء ملف رسائل الأخطاء

**الملف:** `server/utils/errorMessages.ts`

```typescript
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
```

### الخطوة 3: إنشاء ملف الأخطاء المخصصة

**الملف:** `server/utils/errors.ts`

```typescript
/**
 * @fileoverview أخطاء مخصصة للنظام
 * @module errors
 */

import { TRPCError } from "@trpc/server";
import { ErrorMessages, ErrorMessageKey, ErrorSubKey } from "./errorMessages";

type Language = "ar" | "en";

/**
 * الحصول على رسالة الخطأ بلغة محددة
 */
export function getErrorMessage<T extends ErrorMessageKey>(
  category: T,
  key: ErrorSubKey<T>,
  lang: Language = "ar"
): string {
  const messages = ErrorMessages[category] as Record<string, { ar: string; en: string }>;
  return messages[key as string]?.[lang] || "خطأ غير معروف";
}

/**
 * خطأ مخصص للنظام
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * خطأ التحقق من الصحة
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

/**
 * خطأ عدم وجود العنصر
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id 
      ? `${resource} برقم ${id} غير موجود`
      : `${resource} غير موجود`;
    super(message, "NOT_FOUND", 404, { resource, id });
  }
}

/**
 * خطأ التعارض
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "CONFLICT", 409, details);
  }
}

/**
 * خطأ عدم الصلاحية
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "غير مصرح لك بالوصول") {
    super(message, "UNAUTHORIZED", 401);
  }
}

/**
 * خطأ ممنوع
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "ليس لديك صلاحية لهذه العملية") {
    super(message, "FORBIDDEN", 403);
  }
}

/**
 * خطأ الرصيد غير الكافي
 */
export class InsufficientBalanceError extends AppError {
  constructor(
    required: number,
    available: number,
    currency: string = "SAR"
  ) {
    super(
      `الرصيد غير كافي. المطلوب: ${required} ${currency}، المتاح: ${available} ${currency}`,
      "INSUFFICIENT_BALANCE",
      400,
      { required, available, currency }
    );
  }
}

/**
 * تحويل AppError إلى TRPCError
 */
export function toTRPCError(error: AppError): TRPCError {
  const codeMap: Record<number, TRPCError["code"]> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    500: "INTERNAL_SERVER_ERROR",
  };

  return new TRPCError({
    code: codeMap[error.statusCode] || "INTERNAL_SERVER_ERROR",
    message: error.message,
    cause: error,
  });
}

/**
 * معالج الأخطاء للـ tRPC
 */
export function handleError(error: unknown): never {
  if (error instanceof AppError) {
    throw toTRPCError(error);
  }
  
  if (error instanceof TRPCError) {
    throw error;
  }

  // خطأ غير متوقع
  console.error("Unexpected error:", error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "حدث خطأ داخلي في النظام",
  });
}
```

### الخطوة 4: إنشاء Middleware لمعالجة الأخطاء

**الملف:** `server/middleware/errorHandler.ts`

```typescript
/**
 * @fileoverview Middleware لمعالجة الأخطاء
 * @module errorHandler
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

/**
 * Middleware لمعالجة الأخطاء في Express
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // تسجيل الخطأ
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // إذا كان خطأ مخصص
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  // خطأ غير متوقع
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "حدث خطأ داخلي في النظام",
    },
  });
}

/**
 * Middleware للأخطاء غير المعالجة
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `المسار ${req.path} غير موجود`,
    },
  });
}

/**
 * معالج الأخطاء غير المتوقعة
 */
export function setupGlobalErrorHandlers(): void {
  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason: unknown) => {
    console.error("Unhandled Rejection:", reason);
  });
}
```

### الخطوة 5: التحقق من الصحة
```bash
npx tsc --noEmit
```

### الخطوة 6: Commit والرفع
```bash
git add server/utils/errors.ts server/utils/errorMessages.ts server/middleware/errorHandler.ts
git commit -m "feat(errors): إضافة نظام موحد لمعالجة الأخطاء مع رسائل عربية"
git push origin feature/task8-error-handling
```

---

## 📊 معايير القبول

| المعيار | الحالة |
|:---|:---:|
| ملف errorMessages.ts مكتمل | ⬜ |
| ملف errors.ts مكتمل | ⬜ |
| ملف errorHandler.ts مكتمل | ⬜ |
| رسائل عربية لجميع الأخطاء | ⬜ |
| رسائل إنجليزية لجميع الأخطاء | ⬜ |
| لا أخطاء TypeScript | ⬜ |
| Commit message صحيح | ⬜ |

---

## ⏱️ الوقت المتوقع
2-3 ساعات

---

## 📞 عند الانتهاء
أخبر المنسق بأن المهمة 8 جاهزة للدمج.
