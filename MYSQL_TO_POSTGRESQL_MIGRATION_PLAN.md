# خطة التحويل من MySQL إلى PostgreSQL

## الوضع الحالي

### ✅ تم التحويل بالفعل:
1. **`billing-enhanced.ts`** - ✅ PostgreSQL
2. **`schema.ts` الرئيسي** - ✅ PostgreSQL
3. **إعدادات المشروع:**
   - `drizzle.config.ts`: `dialect: "postgresql"` ✅
   - `db.ts`: `drizzle-orm/node-postgres` ✅
   - `DATABASE_URL`: PostgreSQL ✅

### ⚠️ يحتاج للتحويل (28 ملف):

#### ملفات schemas/ التي تستخدم mysqlTable:
1. `mobile-apps.ts`
2. `acrel.ts`
3. `approvals.ts`
4. `defective-components.ts`
5. `serial-numbers.ts`
6. `users.ts`
7. `transition-support.ts`
8. `sts.ts`
9. `settings.ts`
10. `scada.ts`
11. `projects.ts`
12. `procurement.ts`
13. `government-support.ts`
14. `organization.ts`
15. `messaging.ts`
16. `personal-finance.ts`
17. `maintenance.ts`
18. `payment-gateways.ts`
19. `inventory.ts`
20. `hr.ts`
21. `field-ops.ts`
22. `diesel.ts`
23. `developer.ts`
24. `customers.ts`
25. `custom-tables.ts`
26. `custom-system.ts`
27. `accounting.ts`
28. `assets.ts`

#### ملفات types (4 ملفات):
1. `types-1.ts`
2. `types-2.ts`
3. `types-3.ts`
4. `types-4.ts`

## خطة التحويل

### الخيار 1: التحويل التدريجي (موصى به)
تحويل الملفات حسب الأولوية:

**المرحلة 1 - الأساسية (عالية الأولوية):**
1. ✅ `billing-enhanced.ts` - تم
2. `organization.ts` - الهيكل التنظيمي
3. `users.ts` - المستخدمين
4. `accounting.ts` - المحاسبة
5. `assets.ts` - الأصول

**المرحلة 2 - المتوسطة:**
6. `inventory.ts` - المخازن
7. `customers.ts` - العملاء (القديم)
8. `procurement.ts` - المشتريات
9. `maintenance.ts` - الصيانة
10. `field-ops.ts` - العمليات الميدانية

**المرحلة 3 - التكاملات:**
11. `acrel.ts` - ACREL
12. `sts.ts` - STS
13. `payment-gateways.ts` - بوابات الدفع
14. `messaging.ts` - الرسائل

**المرحلة 4 - النظم الفرعية:**
15. `scada.ts`
16. `projects.ts`
17. `hr.ts`
18. `diesel.ts`
19. `government-support.ts`
20. `transition-support.ts`

**المرحلة 5 - المساعدة:**
21. `custom-system.ts`
22. `custom-tables.ts`
23. `personal-finance.ts`
24. `approvals.ts`
25. `defective-components.ts`
26. `serial-numbers.ts`
27. `settings.ts`
28. `developer.ts`
29. `mobile-apps.ts`
30. `types-*.ts`

### الخيار 2: الحل السريع (غير موصى به)
- تعليق استيراد ملفات schemas/ من schema.ts
- الاعتماد فقط على schema.ts الرئيسي
- **المشكلة:** سيؤدي إلى أخطاء في الكود الذي يستخدم هذه الجداول

## التحويلات المطلوبة

### تغييرات Imports:
```typescript
// قبل (MySQL)
import { mysqlTable, varchar, int, ... } from "drizzle-orm/mysql-core";

// بعد (PostgreSQL)
import { pgTable, varchar, integer, serial, ... } from "drizzle-orm/pg-core";
```

### تغييرات الأنواع:
| MySQL | PostgreSQL |
|-------|------------|
| `mysqlTable` | `pgTable` |
| `mysqlEnum` | `varchar` (مع قيود) أو `pgEnum` (مع تعريف منفصل) |
| `int().autoincrement()` | `serial()` |
| `int()` | `integer()` |
| `decimal()` | `numeric()` |
| `json()` | `jsonb()` |
| `.onUpdateNow()` | **حذف** (غير مدعوم) |

### تعريف ENUMs في PostgreSQL:
```typescript
// يجب تعريف ENUMs قبل استخدامها
export const userRoleEnum = pgEnum("user_role", ["admin", "user", "manager"]);

// ثم استخدامها
export const users = pgTable("users", {
  role: userRoleEnum("role").default("user")
});
```

## الإجراءات المطلوبة

### 1. قبل البدء:
- ✅ نسخ احتياطي من قاعدة البيانات
- ✅ التأكد من أن PostgreSQL يعمل
- ✅ التأكد من DATABASE_URL صحيح

### 2. بعد التحويل:
1. تشغيل `pnpm drizzle-kit generate` لتوليد migrations
2. تشغيل `pnpm drizzle-kit push` لتطبيق التغييرات
3. اختبار النظام بالكامل

### 3. التحقق:
```bash
# التحقق من عدم وجود mysqlTable
grep -r "mysqlTable" drizzle/schemas/

# التحقق من عدم وجود mysql-core
grep -r "mysql-core" drizzle/schemas/
```

## الحالة الحالية

- ✅ المشروع يعمل على PostgreSQL
- ✅ `billing-enhanced.ts` تم تحويله
- ✅ `schema.ts` الرئيسي PostgreSQL
- ⚠️ 28 ملف schemas/ لا يزال MySQL
- ⚠️ سيؤدي إلى أخطاء runtime عند الاستخدام

## التوصية

**يجب تحويل جميع ملفات schemas/ إلى PostgreSQL في أقرب وقت ممكن!**

البديل المؤقت: تعطيل الملفات غير المستخدمة حتى يتم تحويلها.

