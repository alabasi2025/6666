# 📋 المهمة 3: تحسين استعلامات select() بتحديد الأعمدة

> **الفرع:** `feature/task3-select-columns`  
> **الأولوية:** متوسطة  
> **الوقت المتوقع:** 3-4 ساعات  
> **المسؤول:** _______________

---

## 🎯 الهدف

تحسين أداء قاعدة البيانات بتحديد الأعمدة المطلوبة في استعلامات `select()` بدلاً من جلب جميع الأعمدة (`SELECT *`).

---

## ⚠️ تحذير مهم - لا تعدل هذه الملفات

**لتجنب التعارض مع المهام الأخرى، لا تعدل أي ملف في:**
- ❌ `client/` (مجلد Frontend بالكامل)
- ❌ `server/_core/index.ts`
- ❌ `server/utils/` (إذا وُجد)
- ❌ `create-admin.ts`

**فقط عدّل ملفات:**
- ✅ `drizzle/schema.ts` (فقط إذا احتجت إضافة types)
- ✅ `server/db.ts`
- ✅ `server/*Router.ts` (جميع ملفات Router)

---

## 📝 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والانتقال للفرع

```bash
# استنساخ المستودع
git clone https://github.com/alabasi2025/6666.git
cd 6666

# الانتقال للفرع المخصص لهذه المهمة
git checkout feature/task3-select-columns

# التأكد من أنك على الفرع الصحيح
git branch
# يجب أن ترى: * feature/task3-select-columns
```

---

### الخطوة 2: فهم المشكلة

#### المشكلة الحالية:

```typescript
// ❌ جلب جميع الأعمدة (غير فعال)
const users = await db.select().from(users);
// هذا يعادل: SELECT * FROM users
// يجلب 20+ عمود حتى لو احتجت 3 فقط!
```

#### الحل:

```typescript
// ✅ جلب الأعمدة المطلوبة فقط (فعال)
const users = await db.select({
  id: users.id,
  name: users.name,
  email: users.email,
}).from(users);
// هذا يعادل: SELECT id, name, email FROM users
```

---

### الخطوة 3: البحث عن جميع select() بدون أعمدة

```bash
# عرض جميع الاستعلامات التي تحتاج تحسين
grep -rn "\.select()" server/ --include="*.ts" | grep -v "select({" | head -50
```

---

### الخطوة 4: قائمة الملفات المطلوب تعديلها

| # | الملف | عدد select() | الأولوية |
|:---:|:---|:---:|:---:|
| 1 | `server/db.ts` | ~50 | عالية |
| 2 | `server/routers.ts` | ~30 | عالية |
| 3 | `server/billingRouter.ts` | ~20 | عالية |
| 4 | `server/customSystemRouter.ts` | ~25 | عالية |
| 5 | `server/hrRouter.ts` | ~15 | متوسطة |
| 6 | `server/dieselRouter.ts` | ~15 | متوسطة |
| 7 | `server/fieldOpsRouter.ts` | ~10 | متوسطة |
| 8 | `server/scadaRouter.ts` | ~10 | متوسطة |
| 9 | `server/projectsRouter.ts` | ~10 | متوسطة |
| 10 | `server/developerRouter.ts` | ~10 | منخفضة |

---

### الخطوة 5: قواعد تحديد الأعمدة

#### القاعدة 1: استعلامات القوائم (List)

للقوائم، جلب الأعمدة الأساسية فقط:

```typescript
// ❌ قبل
const customers = await db.select().from(customers);

// ✅ بعد - للقائمة
const customers = await db.select({
  id: customers.id,
  code: customers.code,
  nameAr: customers.nameAr,
  phone: customers.phone,
  status: customers.status,
  createdAt: customers.createdAt,
}).from(customers);
```

#### القاعدة 2: استعلامات التفاصيل (getById)

للتفاصيل، يمكن جلب المزيد من الأعمدة:

```typescript
// ❌ قبل
const customer = await db.select().from(customers).where(eq(customers.id, id));

// ✅ بعد - للتفاصيل (يمكن جلب كل الأعمدة المهمة)
const customer = await db.select({
  id: customers.id,
  code: customers.code,
  nameAr: customers.nameAr,
  nameEn: customers.nameEn,
  phone: customers.phone,
  email: customers.email,
  address: customers.address,
  city: customers.city,
  taxNumber: customers.taxNumber,
  creditLimit: customers.creditLimit,
  currentBalance: customers.currentBalance,
  status: customers.status,
  notes: customers.notes,
  createdAt: customers.createdAt,
  updatedAt: customers.updatedAt,
}).from(customers).where(eq(customers.id, id));
```

#### القاعدة 3: استعلامات الإحصائيات

```typescript
// ❌ قبل
const allCustomers = await db.select().from(customers);
const count = allCustomers.length;

// ✅ بعد - استخدم count() مباشرة
import { count } from 'drizzle-orm';
const result = await db.select({ count: count() }).from(customers);
const totalCount = result[0].count;
```

#### القاعدة 4: استعلامات التحقق (exists)

```typescript
// ❌ قبل
const existing = await db.select().from(users).where(eq(users.email, email));
if (existing.length > 0) { ... }

// ✅ بعد - جلب id فقط للتحقق
const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
if (existing.length > 0) { ... }
```

#### القاعدة 5: استعلامات مع Join

```typescript
// ❌ قبل
const orders = await db.select()
  .from(orders)
  .leftJoin(customers, eq(orders.customerId, customers.id));

// ✅ بعد - حدد الأعمدة من كلا الجدولين
const orders = await db.select({
  orderId: orders.id,
  orderNumber: orders.orderNumber,
  orderDate: orders.orderDate,
  totalAmount: orders.totalAmount,
  customerName: customers.nameAr,
  customerPhone: customers.phone,
}).from(orders)
  .leftJoin(customers, eq(orders.customerId, customers.id));
```

---

### الخطوة 6: تعديل ملف server/db.ts

هذا الملف يحتوي على أكثر الاستعلامات. ابدأ به:

```bash
# عرض جميع select() في db.ts
grep -n "\.select()" server/db.ts | head -30
```

لكل استعلام:
1. حدد الغرض (قائمة؟ تفاصيل؟ تحقق؟)
2. حدد الأعمدة المطلوبة
3. عدّل الاستعلام

**مثال من db.ts:**

```typescript
// ❌ قبل (السطر ~150)
export async function getBusinesses(userId: number) {
  return db.select().from(businesses).where(eq(businesses.userId, userId));
}

// ✅ بعد
export async function getBusinesses(userId: number) {
  return db.select({
    id: businesses.id,
    nameAr: businesses.nameAr,
    nameEn: businesses.nameEn,
    logo: businesses.logo,
    status: businesses.status,
    createdAt: businesses.createdAt,
  }).from(businesses).where(eq(businesses.userId, userId));
}
```

---

### الخطوة 7: تعديل ملف server/customSystemRouter.ts

```bash
grep -n "\.select()" server/customSystemRouter.ts | head -20
```

**مثال:**

```typescript
// ❌ قبل
const treasuries = await db.select()
  .from(customTreasuries)
  .where(eq(customTreasuries.businessId, businessId));

// ✅ بعد
const treasuries = await db.select({
  id: customTreasuries.id,
  code: customTreasuries.code,
  nameAr: customTreasuries.nameAr,
  treasuryType: customTreasuries.treasuryType,
  currentBalance: customTreasuries.currentBalance,
  status: customTreasuries.status,
}).from(customTreasuries)
  .where(eq(customTreasuries.businessId, businessId));
```

---

### الخطوة 8: تعديل ملفات Router الأخرى

كرر نفس العملية لكل ملف Router:

```bash
# billingRouter.ts
grep -n "\.select()" server/billingRouter.ts

# hrRouter.ts
grep -n "\.select()" server/hrRouter.ts

# dieselRouter.ts
grep -n "\.select()" server/dieselRouter.ts

# وهكذا...
```

---

### الخطوة 9: التحقق من الكود

```bash
# تأكد من عدم وجود أخطاء TypeScript
npx tsc --noEmit

# عد select() بدون أعمدة المتبقية
grep -rn "\.select()" server/ --include="*.ts" | grep -v "select({" | wc -l
# الهدف: أقل من 20 (بعض الحالات قد تحتاج SELECT *)
```

---

### الخطوة 10: Commit والرفع

```bash
# إضافة الملفات المعدلة
git add server/db.ts
git add server/routers.ts
git add server/billingRouter.ts
git add server/customSystemRouter.ts
git add server/hrRouter.ts
git add server/dieselRouter.ts
git add server/fieldOpsRouter.ts
git add server/scadaRouter.ts
git add server/projectsRouter.ts
git add server/developerRouter.ts

# Commit
git commit -m "perf(server): optimize select() queries with specific columns

- Specify columns in list queries for better performance
- Reduce data transfer from database
- Improve query efficiency across all routers
- ~80% reduction in unnecessary data fetching"

# رفع التغييرات
git push origin feature/task3-select-columns
```

---

### الخطوة 11: إبلاغ المنسق

بعد الانتهاء، أبلغ المنسق بأن المهمة مكتملة وجاهزة للدمج.

---

## ✅ قائمة التحقق النهائية

- [ ] انتقلت للفرع الصحيح `feature/task3-select-columns`
- [ ] حسّنت استعلامات `server/db.ts`
- [ ] حسّنت استعلامات `server/routers.ts`
- [ ] حسّنت استعلامات `server/billingRouter.ts`
- [ ] حسّنت استعلامات `server/customSystemRouter.ts`
- [ ] حسّنت استعلامات `server/hrRouter.ts`
- [ ] حسّنت استعلامات `server/dieselRouter.ts`
- [ ] حسّنت استعلامات Router الأخرى
- [ ] تحققت من عدم وجود أخطاء TypeScript (`tsc --noEmit`)
- [ ] عدد `select()` بدون أعمدة أقل من 20
- [ ] عملت Commit برسالة واضحة
- [ ] رفعت التغييرات للفرع
- [ ] أبلغت المنسق

---

## 📊 جدول تتبع التقدم

| الملف | قبل | بعد | الحالة |
|:---|:---:|:---:|:---:|
| db.ts | 50 | <5 | ⬜ |
| routers.ts | 30 | <3 | ⬜ |
| billingRouter.ts | 20 | <2 | ⬜ |
| customSystemRouter.ts | 25 | <3 | ⬜ |
| hrRouter.ts | 15 | <2 | ⬜ |
| dieselRouter.ts | 15 | <2 | ⬜ |
| fieldOpsRouter.ts | 10 | <1 | ⬜ |
| scadaRouter.ts | 10 | <1 | ⬜ |
| projectsRouter.ts | 10 | <1 | ⬜ |
| developerRouter.ts | 10 | <1 | ⬜ |
| **المجموع** | **~195** | **<20** | ⬜ |

---

## 💡 نصائح إضافية

### 1. استخدم الـ Aliases للوضوح

```typescript
const result = await db.select({
  customerId: customers.id,        // alias واضح
  customerName: customers.nameAr,
  orderTotal: orders.totalAmount,
}).from(orders)
  .leftJoin(customers, eq(orders.customerId, customers.id));
```

### 2. أنشئ Types للنتائج

```typescript
// في أعلى الملف
type CustomerListItem = {
  id: number;
  code: string;
  nameAr: string;
  phone: string | null;
  status: string;
};

// في الدالة
const customers: CustomerListItem[] = await db.select({
  id: customers.id,
  code: customers.code,
  nameAr: customers.nameAr,
  phone: customers.phone,
  status: customers.status,
}).from(customers);
```

### 3. لا تحسّن استعلامات getById كثيراً

استعلامات التفاصيل (getById) يمكن أن تجلب معظم الأعمدة لأنها:
- تُستدعى مرة واحدة لسجل واحد
- المستخدم يتوقع رؤية كل التفاصيل

---

## 📞 في حالة وجود مشاكل

إذا واجهت أي مشكلة:
1. لا تعدل ملفات خارج نطاق المهمة (client/, create-admin.ts)
2. إذا كان الاستعلام معقداً جداً، اتركه كما هو ووثّق السبب
3. تواصل مع المنسق فوراً
4. لا تدمج الفرع بنفسك

---

**تاريخ الإنشاء:** 25 ديسمبر 2025  
**المنسق:** Manus AI
