# 📋 المهمة 4: إضافة فهارس قاعدة البيانات (Database Indexes)

## 🎯 الهدف
إضافة فهارس (Indexes) لتحسين أداء الاستعلامات في قاعدة البيانات.

---

## 📁 الملفات المسموح تعديلها

| الملف | نوع التعديل |
|:---|:---|
| `drizzle/schema.ts` | إضافة فهارس فقط (لا تعديل على الجداول) |

---

## 🚫 الملفات الممنوع تعديلها (لتجنب التعارض)

| الملف | السبب |
|:---|:---|
| `server/*.ts` | المهمة 3 تعمل عليها |
| `client/src/**/*.tsx` | المهمة 2 تعمل عليها |
| أي ملف آخر | خارج نطاق المهمة |

---

## 📋 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والتبديل للفرع

```bash
# استنساخ المستودع
gh repo clone alabasi2025/6666
cd 6666

# التبديل للفرع المخصص
git checkout feature/task4-database-indexes
git pull origin feature/task4-database-indexes
```

---

### الخطوة 2: فهم بنية الفهارس في Drizzle

في Drizzle ORM، يتم إضافة الفهارس باستخدام الدالة `index()` أو `uniqueIndex()`:

```typescript
import { index, uniqueIndex } from "drizzle-orm/mysql-core";

// مثال على جدول مع فهارس
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  businessId: int("business_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // فهرس فريد على البريد الإلكتروني
  emailIdx: uniqueIndex("email_idx").on(table.email),
  // فهرس عادي على business_id
  businessIdx: index("business_idx").on(table.businessId),
  // فهرس مركب
  businessCreatedIdx: index("business_created_idx").on(table.businessId, table.createdAt),
}));
```

---

### الخطوة 3: الجداول التي تحتاج فهارس

#### 3.1 جدول custom_parties (الأطراف)

```typescript
export const customParties = mysqlTable("custom_parties", {
  // ... الحقول الموجودة
}, (table) => ({
  businessIdx: index("cp_business_idx").on(table.businessId),
  subSystemIdx: index("cp_subsystem_idx").on(table.subSystemId),
  codeIdx: uniqueIndex("cp_code_idx").on(table.businessId, table.code),
  partyTypeIdx: index("cp_party_type_idx").on(table.businessId, table.partyType),
  nameIdx: index("cp_name_idx").on(table.nameAr),
}));
```

#### 3.2 جدول custom_categories (التصنيفات)

```typescript
export const customCategories = mysqlTable("custom_categories", {
  // ... الحقول الموجودة
}, (table) => ({
  businessIdx: index("cc_business_idx").on(table.businessId),
  parentIdx: index("cc_parent_idx").on(table.parentId),
  codeIdx: uniqueIndex("cc_code_idx").on(table.businessId, table.code),
  typeIdx: index("cc_type_idx").on(table.businessId, table.categoryType),
}));
```

#### 3.3 جدول custom_treasury_movements (حركات الخزينة)

```typescript
export const customTreasuryMovements = mysqlTable("custom_treasury_movements", {
  // ... الحقول الموجودة
}, (table) => ({
  treasuryIdx: index("ctm_treasury_idx").on(table.treasuryId),
  dateIdx: index("ctm_date_idx").on(table.movementDate),
  typeIdx: index("ctm_type_idx").on(table.movementType),
  refIdx: index("ctm_ref_idx").on(table.referenceType, table.referenceId),
  treasuryDateIdx: index("ctm_treasury_date_idx").on(table.treasuryId, table.movementDate),
}));
```

#### 3.4 جدول custom_party_transactions (حركات الأطراف)

```typescript
export const customPartyTransactions = mysqlTable("custom_party_transactions", {
  // ... الحقول الموجودة
}, (table) => ({
  partyIdx: index("cpt_party_idx").on(table.partyId),
  dateIdx: index("cpt_date_idx").on(table.transactionDate),
  typeIdx: index("cpt_type_idx").on(table.transactionType),
  refIdx: index("cpt_ref_idx").on(table.referenceType, table.referenceId),
  partyDateIdx: index("cpt_party_date_idx").on(table.partyId, table.transactionDate),
}));
```

#### 3.5 جدول custom_receipt_vouchers (سندات القبض)

```typescript
export const customReceiptVouchers = mysqlTable("custom_receipt_vouchers", {
  // ... الحقول الموجودة
}, (table) => ({
  businessIdx: index("crv_business_idx").on(table.businessId),
  subSystemIdx: index("crv_subsystem_idx").on(table.subSystemId),
  treasuryIdx: index("crv_treasury_idx").on(table.treasuryId),
  partyIdx: index("crv_party_idx").on(table.partyId),
  categoryIdx: index("crv_category_idx").on(table.categoryId),
  dateIdx: index("crv_date_idx").on(table.voucherDate),
  numberIdx: uniqueIndex("crv_number_idx").on(table.businessId, table.subSystemId, table.voucherNumber),
}));
```

#### 3.6 جدول custom_payment_vouchers (سندات الصرف)

```typescript
export const customPaymentVouchers = mysqlTable("custom_payment_vouchers", {
  // ... الحقول الموجودة
}, (table) => ({
  businessIdx: index("cpv_business_idx").on(table.businessId),
  subSystemIdx: index("cpv_subsystem_idx").on(table.subSystemId),
  treasuryIdx: index("cpv_treasury_idx").on(table.treasuryId),
  partyIdx: index("cpv_party_idx").on(table.partyId),
  categoryIdx: index("cpv_category_idx").on(table.categoryId),
  dateIdx: index("cpv_date_idx").on(table.voucherDate),
  numberIdx: uniqueIndex("cpv_number_idx").on(table.businessId, table.subSystemId, table.voucherNumber),
}));
```

#### 3.7 جدول custom_treasuries (الخزائن)

```typescript
export const customTreasuries = mysqlTable("custom_treasuries", {
  // ... الحقول الموجودة
}, (table) => ({
  businessIdx: index("ct_business_idx").on(table.businessId),
  subSystemIdx: index("ct_subsystem_idx").on(table.subSystemId),
  typeIdx: index("ct_type_idx").on(table.treasuryType),
  codeIdx: uniqueIndex("ct_code_idx").on(table.businessId, table.code),
}));
```

#### 3.8 جدول custom_sub_systems (الأنظمة الفرعية)

```typescript
export const customSubSystems = mysqlTable("custom_sub_systems", {
  // ... الحقول الموجودة
}, (table) => ({
  businessIdx: index("css_business_idx").on(table.businessId),
  codeIdx: uniqueIndex("css_code_idx").on(table.businessId, table.code),
}));
```

---

### الخطوة 4: تطبيق التعديلات

1. افتح ملف `drizzle/schema.ts`
2. ابحث عن كل جدول من الجداول المذكورة
3. أضف الفهارس كما هو موضح في الأمثلة
4. تأكد من استيراد `index` و `uniqueIndex` من `drizzle-orm/mysql-core`

---

### الخطوة 5: التحقق من الكود

```bash
# تحقق من صحة TypeScript
npx tsc --noEmit

# أو إذا كان هناك script
npm run type-check
```

---

### الخطوة 6: رفع التغييرات

```bash
# إضافة الملفات المعدلة
git add drizzle/schema.ts

# إنشاء commit
git commit -m "perf(db): إضافة فهارس لتحسين أداء الاستعلامات

✅ إضافة فهارس لجدول custom_parties
✅ إضافة فهارس لجدول custom_categories
✅ إضافة فهارس لجدول custom_treasury_movements
✅ إضافة فهارس لجدول custom_party_transactions
✅ إضافة فهارس لجدول custom_receipt_vouchers
✅ إضافة فهارس لجدول custom_payment_vouchers
✅ إضافة فهارس لجدول custom_treasuries
✅ إضافة فهارس لجدول custom_sub_systems"

# رفع التغييرات
git push origin feature/task4-database-indexes
```

---

## ✅ قائمة التحقق النهائية

| # | المهمة | الحالة |
|:---:|:---|:---:|
| 1 | استنساخ المستودع | ⬜ |
| 2 | التبديل للفرع الصحيح | ⬜ |
| 3 | إضافة فهارس custom_parties | ⬜ |
| 4 | إضافة فهارس custom_categories | ⬜ |
| 5 | إضافة فهارس custom_treasury_movements | ⬜ |
| 6 | إضافة فهارس custom_party_transactions | ⬜ |
| 7 | إضافة فهارس custom_receipt_vouchers | ⬜ |
| 8 | إضافة فهارس custom_payment_vouchers | ⬜ |
| 9 | إضافة فهارس custom_treasuries | ⬜ |
| 10 | إضافة فهارس custom_sub_systems | ⬜ |
| 11 | التحقق من صحة TypeScript | ⬜ |
| 12 | رفع التغييرات | ⬜ |

---

## 📊 الفهارس المطلوبة (ملخص)

| الجدول | عدد الفهارس |
|:---|:---:|
| custom_parties | 5 |
| custom_categories | 4 |
| custom_treasury_movements | 5 |
| custom_party_transactions | 5 |
| custom_receipt_vouchers | 7 |
| custom_payment_vouchers | 7 |
| custom_treasuries | 4 |
| custom_sub_systems | 2 |
| **المجموع** | **39** |

---

## ⚠️ ملاحظات مهمة

1. **لا تعدل أي شيء غير الفهارس** - فقط أضف الفهارس للجداول الموجودة
2. **استخدم أسماء فريدة للفهارس** - استخدم البادئة المقترحة (cp_, cc_, ctm_, etc.)
3. **تأكد من استيراد الدوال** - `index` و `uniqueIndex`
4. **لا تعدل هيكل الجداول** - فقط أضف الفهارس

---

## 🎯 الوقت المتوقع

**2-3 ساعات**
