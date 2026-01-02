# 📋 المهمة 1: استبدال console.log بنظام Logger

> **الفرع:** `feature/task1-console-logs`  
> **الأولوية:** عالية  
> **الوقت المتوقع:** 2-3 ساعات  
> **المسؤول:** _______________

---

## 🎯 الهدف

استبدال جميع استخدامات `console.log` في ملفات **Server** فقط بنظام Logger احترافي.

---

## ⚠️ تحذير مهم - لا تعدل هذه الملفات

**لتجنب التعارض مع المهام الأخرى، لا تعدل أي ملف في:**
- ❌ `client/` (مجلد Frontend بالكامل)
- ❌ `drizzle/schema.ts`

**فقط عدّل ملفات:**
- ✅ `server/` (ما عدا الملفات المستثناة أدناه)
- ✅ `create-admin.ts`

---

## 📝 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والانتقال للفرع

```bash
# استنساخ المستودع
git clone https://github.com/alabasi2025/6666.git
cd 6666

# الانتقال للفرع المخصص لهذه المهمة
git checkout feature/task1-console-logs

# التأكد من أنك على الفرع الصحيح
git branch
# يجب أن ترى: * feature/task1-console-logs
```

---

### الخطوة 2: إنشاء ملف Logger

أنشئ ملف جديد: `server/utils/logger.ts`

```typescript
/**
 * نظام التسجيل (Logger) الموحد
 * يستبدل console.log بنظام احترافي
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    
    if (this.isDevelopment) {
      // في بيئة التطوير، نعرض بشكل مقروء
      const colors = {
        debug: '\x1b[36m',  // cyan
        info: '\x1b[32m',   // green
        warn: '\x1b[33m',   // yellow
        error: '\x1b[31m',  // red
      };
      const reset = '\x1b[0m';
      
      console.log(`${colors[entry.level]}${prefix}${reset} ${entry.message}`);
      if (entry.data) {
        console.log(entry.data);
      }
    } else {
      // في بيئة الإنتاج، نخرج JSON للتحليل
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.output(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    this.output(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: unknown): void {
    this.output(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: unknown): void {
    this.output(this.formatMessage('error', message, data));
  }
}

export const logger = Logger.getInstance();
```

---

### الخطوة 3: قائمة الملفات المطلوب تعديلها

| # | الملف | عدد console.log | الإجراء |
|:---:|:---|:---:|:---|
| 1 | `create-admin.ts` | 7 | استبدال |
| 2 | `server/_core/index.ts` | 3 | استبدال |
| 3 | `server/db.ts` | ~10 | استبدال |
| 4 | `server/routers.ts` | ~5 | استبدال |
| 5 | `server/billingRouter.ts` | ~3 | استبدال |
| 6 | `server/customSystemRouter.ts` | ~5 | استبدال |
| 7 | `server/hrRouter.ts` | ~3 | استبدال |
| 8 | `server/dieselRouter.ts` | ~3 | استبدال |

---

### الخطوة 4: كيفية الاستبدال

#### مثال 1: رسائل المعلومات

```typescript
// ❌ قبل
console.log("🔌 Connecting to database...");

// ✅ بعد
import { logger } from './utils/logger';
logger.info("Connecting to database...");
```

#### مثال 2: رسائل النجاح

```typescript
// ❌ قبل
console.log("✅ Admin user created successfully!");

// ✅ بعد
logger.info("Admin user created successfully!");
```

#### مثال 3: رسائل مع بيانات

```typescript
// ❌ قبل
console.log("User data:", userData);

// ✅ بعد
logger.info("User data", { userData });
```

#### مثال 4: رسائل الخطأ

```typescript
// ❌ قبل
console.log("Error:", error.message);

// ✅ بعد
logger.error("Operation failed", { error: error.message });
```

#### مثال 5: رسائل التحذير

```typescript
// ❌ قبل
console.log(`Port ${preferredPort} is busy, using port ${port} instead`);

// ✅ بعد
logger.warn(`Port ${preferredPort} is busy, using port ${port} instead`);
```

---

### الخطوة 5: تعديل ملف create-admin.ts

افتح الملف `create-admin.ts` وعدّله كالتالي:

```typescript
// في بداية الملف، أضف:
import { logger } from './server/utils/logger';

// ثم استبدل كل console.log:

// السطر 14
// قبل: console.log("🔌 Connecting to database...");
// بعد:
logger.info("Connecting to database...");

// السطر 20
// قبل: console.log("✅ Connected to database");
// بعد:
logger.info("Connected to database");

// السطر 28
// قبل: console.log("ℹ️ Admin user already exists:", adminUsers[0].phone);
// بعد:
logger.info("Admin user already exists", { phone: adminUsers[0].phone });

// السطر 33
// قبل: console.log("📝 Creating admin user...");
// بعد:
logger.info("Creating admin user...");

// السطر 47
// قبل: console.log("✅ Admin user created successfully!");
// بعد:
logger.info("Admin user created successfully!");

// السطر 48-49
// قبل: console.log("📱 Phone: 0500000000");
//       console.log("🔑 Password: admin123");
// بعد:
logger.info("Admin credentials", { phone: "0500000000", password: "admin123" });
```

---

### الخطوة 6: تعديل ملف server/_core/index.ts

```typescript
// في بداية الملف، أضف:
import { logger } from '../utils/logger';

// السطر 133
// قبل: console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
// بعد:
logger.warn(`Port ${preferredPort} is busy, using port ${port} instead`);

// السطر 138
// قبل: console.log(`Server running on http://${host}:${port}/`);
// بعد:
logger.info(`Server running on http://${host}:${port}/`);

// السطر 139
// قبل: console.log(`Security: helmet enabled, rate limiting active`);
// بعد:
logger.info("Security: helmet enabled, rate limiting active");
```

---

### الخطوة 7: البحث عن جميع console.log المتبقية

```bash
# ابحث عن جميع console.log في ملفات server
grep -rn "console.log" server/ --include="*.ts"

# عدّل كل واحدة حسب السياق
```

---

### الخطوة 8: التحقق من الكود

```bash
# تأكد من عدم وجود أخطاء TypeScript
npx tsc --noEmit

# تأكد من عدم وجود console.log متبقية
grep -rn "console.log" server/ --include="*.ts" | wc -l
# يجب أن يكون الناتج: 0
```

---

### الخطوة 9: Commit والرفع

```bash
# إضافة الملفات المعدلة
git add server/utils/logger.ts
git add server/_core/index.ts
git add server/db.ts
git add server/routers.ts
git add server/billingRouter.ts
git add server/customSystemRouter.ts
git add server/hrRouter.ts
git add server/dieselRouter.ts
git add create-admin.ts

# Commit
git commit -m "feat(server): replace console.log with Logger system

- Add server/utils/logger.ts with professional logging
- Replace all console.log in server files
- Support debug, info, warn, error levels
- JSON output in production, colored in development"

# رفع التغييرات
git push origin feature/task1-console-logs
```

---

### الخطوة 10: إبلاغ المنسق

بعد الانتهاء، أبلغ المنسق بأن المهمة مكتملة وجاهزة للدمج.

---

## ✅ قائمة التحقق النهائية

- [ ] أنشأت ملف `server/utils/logger.ts`
- [ ] استبدلت جميع `console.log` في `create-admin.ts`
- [ ] استبدلت جميع `console.log` في `server/_core/index.ts`
- [ ] استبدلت جميع `console.log` في `server/db.ts`
- [ ] استبدلت جميع `console.log` في `server/routers.ts`
- [ ] استبدلت جميع `console.log` في ملفات Router الأخرى
- [ ] تحققت من عدم وجود أخطاء TypeScript
- [ ] تحققت من عدم وجود `console.log` متبقية في server/
- [ ] عملت Commit برسالة واضحة
- [ ] رفعت التغييرات للفرع
- [ ] أبلغت المنسق

---

## 📞 في حالة وجود مشاكل

إذا واجهت أي مشكلة:
1. لا تعدل ملفات خارج نطاق المهمة
2. تواصل مع المنسق فوراً
3. لا تدمج الفرع بنفسك

---

**تاريخ الإنشاء:** 25 ديسمبر 2025  
**المنسق:** Manus AI
