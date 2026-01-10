# MySQL Schemas Archive

## ⚠️ تحذير مهم

هذا المجلد يحتوي على ملفات schema القديمة التي كانت تستخدم MySQL.

**تم نقل جميع الجداول إلى PostgreSQL في الملف الرئيسي: `drizzle/schema.ts`**

## الملفات المؤرشفة

جميع الملفات التي كانت تستخدم:
- `mysqlTable`
- `mysqlEnum`
- `drizzle-orm/mysql-core`

تم استبدالها بنسخ PostgreSQL في `schema.ts` الرئيسي.

## كيفية الاستخدام الآن

بدلاً من:
```typescript
import { users } from "../drizzle/schemas/users";
```

استخدم:
```typescript
import { users } from "../drizzle/schema";
```

## الملفات المحولة

✅ جميع الجداول موجودة في `drizzle/schema.ts` بصيغة PostgreSQL
✅ `billing-enhanced.ts` - تم تحويله بشكل منفصل
✅ `mobile-apps.ts` - تم تحويله بشكل منفصل

## ملاحظات

- **لا تستخدم** ملفات هذا المجلد
- هذه الملفات محفوظة **للمرجع فقط**
- يمكن حذف هذا المجلد بأكمله بعد التأكد من عمل النظام

## تاريخ الأرشفة

التاريخ: 2026-01-08
السبب: التحويل الكامل من MySQL إلى PostgreSQL

