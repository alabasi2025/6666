# النظام المخصص v2.2.0 - تعليمات النشر

## نظرة عامة

هذا المستند يحتوي على تعليمات مفصلة لنشر النظام المخصص v2.2.0 على البيئة الإنتاجية.

---

## المرحلة 5: الرفع إلى GitHub

### الخطوة 1: إعداد Git Repository

تأكد من أنك في مجلد المشروع الصحيح:

```bash
cd /tmp/6666-work
```

### الخطوة 2: فحص الملفات المعدلة

```bash
git status
```

يجب أن ترى الملفات التالية:

**Database:**
- `drizzle/schemas/customSystemV2.ts`
- `drizzle/schemas/customSystemV2_modifications.ts`
- `drizzle/migrations/0014_custom_system_v2.sql`

**Backend:**
- `server/routes/customSystem/v2/currencies.ts`
- `server/routes/customSystem/v2/exchangeRates.ts`
- `server/routes/customSystem/v2/accounts.ts`
- `server/routes/customSystem/v2/subSystems.ts`
- `server/routes/customSystem/v2/journalEntries.ts`
- `server/routes/customSystem/v2/operations.ts`
- `server/routes/customSystem/v2/receiptsPayments.ts`
- `server/routes/customSystem/v2/index.ts`
- `server/routes/customSystem/v2/API_DOCUMENTATION.md`

**Frontend:**
- `client/src/pages/CustomSystem/v2/CurrenciesPage.tsx`
- `client/src/pages/CustomSystem/v2/ExchangeRatesPage.tsx`
- `client/src/pages/CustomSystem/v2/AccountsPage.tsx`
- `client/src/pages/CustomSystem/v2/JournalEntriesPage.tsx`
- `client/src/pages/CustomSystem/v2/OperationsPage.tsx`
- `client/src/pages/CustomSystem/v2/index.ts`
- `client/src/pages/CustomSystem/v2/README.md`

**Documentation:**
- `TESTING_CHECKLIST.md`
- `DEPLOYMENT_INSTRUCTIONS.md`

### الخطوة 3: إضافة الملفات إلى Git

```bash
git add drizzle/schemas/customSystemV2.ts
git add drizzle/schemas/customSystemV2_modifications.ts
git add drizzle/migrations/0014_custom_system_v2.sql
git add server/routes/customSystem/v2/
git add client/src/pages/CustomSystem/v2/
git add TESTING_CHECKLIST.md
git add DEPLOYMENT_INSTRUCTIONS.md
```

### الخطوة 4: Commit التغييرات

```bash
git commit -m "feat: النظام المخصص v2.2.0 - نظام محاسبي بالقيد المزدوج

- إضافة 7 جداول جديدة للنظام المحاسبي
- تعديل 3 جداول موجودة
- حذف 3 جداول قديمة
- إضافة 46 API endpoint جديد
- إضافة 5 صفحات Frontend
- دعم متعدد العملات
- القيود اليومية التلقائية
- شاشة العمليات الموحدة

Files changed: 21
Lines added: ~7,700
"
```

### الخطوة 5: Push إلى GitHub

```bash
git push origin main
```

أو إذا كنت تعمل على branch منفصل:

```bash
git push origin feature/custom-system-v2
```

---

## المرحلة 6: الدمج والنشر على جهاز المستخدم

### الخطوة 1: Pull التغييرات من GitHub

على جهاز المستخدم (Windows):

```bash
cd C:\Users\qbas\33333\6666
git pull origin main
```

### الخطوة 2: تثبيت Dependencies (إذا لزم الأمر)

```bash
# Backend
pnpm install

# Frontend
cd client
pnpm install
cd ..
```

### الخطوة 3: تشغيل Database Migration

**مهم جداً:** قبل تشغيل Migration، تأكد من عمل Backup لقاعدة البيانات!

```bash
# Backup قاعدة البيانات
# (استخدم أداة Backup الخاصة بـ PostgreSQL)

# تشغيل Migration
pnpm drizzle-kit push
```

أو إذا كنت تستخدم migration files:

```bash
pnpm drizzle-kit migrate
```

### الخطوة 4: التحقق من Database Migration

افتح PostgreSQL client وتحقق من:

1. **الجداول الجديدة:**
   - `customCurrencies`
   - `customExchangeRates`
   - `customAccountSubTypes`
   - `customAccountCurrencies`
   - `customAccountBalances`
   - `customJournalEntries`
   - `customJournalEntryLines`

2. **الجداول المعدلة:**
   - `customAccounts` (تحقق من الأعمدة الجديدة)
   - `customSubSystems` (تحقق من الأعمدة الجديدة)
   - `customReceipts` (تحقق من الأعمدة الجديدة)

3. **الجداول المحذوفة:**
   - `customTransactions` (يجب أن تكون محذوفة)
   - `customTreasuries` (يجب أن تكون محذوفة)
   - `customTreasuryMovements` (يجب أن تكون محذوفة)

4. **البيانات الأولية:**
   - تحقق من وجود العملات الأساسية في `customCurrencies`

### الخطوة 5: تحديث Backend Routes

تأكد من تسجيل الـ routers الجديدة في ملف الـ routes الرئيسي:

**ملف:** `server/index.ts` أو `server/app.ts`

```typescript
import customSystemV2Router from "./routes/customSystem/v2";

// في ملف الـ routes
app.use("/api/custom-system/v2", customSystemV2Router);
```

### الخطوة 6: تحديث Frontend Routes

أضف الصفحات الجديدة إلى ملف الـ routes:

**ملف:** `client/src/App.tsx` أو `client/src/routes/index.tsx`

```typescript
import {
  CurrenciesPage,
  ExchangeRatesPage,
  AccountsPage,
  JournalEntriesPage,
  OperationsPage,
} from "./pages/CustomSystem/v2";

// في ملف الـ routes
<Route path="/custom-system/v2/currencies" element={<CurrenciesPage />} />
<Route path="/custom-system/v2/exchange-rates" element={<ExchangeRatesPage />} />
<Route path="/custom-system/v2/accounts" element={<AccountsPage />} />
<Route path="/custom-system/v2/journal-entries" element={<JournalEntriesPage />} />
<Route path="/custom-system/v2/operations" element={<OperationsPage />} />
```

### الخطوة 7: تحديث Navigation Menu

أضف روابط الصفحات الجديدة إلى القائمة الجانبية:

**ملف:** `client/src/components/Navigation.tsx` أو مكان القائمة

```typescript
{
  title: "النظام المخصص v2",
  icon: <AccountBalanceIcon />,
  items: [
    {
      title: "شاشة العمليات",
      path: "/custom-system/v2/operations",
      icon: <OperationsIcon />,
    },
    {
      title: "القيود اليومية",
      path: "/custom-system/v2/journal-entries",
      icon: <DescriptionIcon />,
    },
    {
      title: "الحسابات",
      path: "/custom-system/v2/accounts",
      icon: <AccountTreeIcon />,
    },
    {
      title: "العملات",
      path: "/custom-system/v2/currencies",
      icon: <AttachMoneyIcon />,
    },
    {
      title: "أسعار الصرف",
      path: "/custom-system/v2/exchange-rates",
      icon: <CurrencyExchangeIcon />,
    },
  ],
}
```

### الخطوة 8: Build المشروع

```bash
# Build Backend
pnpm build

# Build Frontend
cd client
pnpm build
cd ..
```

### الخطوة 9: إعادة تشغيل الخادم

```bash
# إيقاف الخادم الحالي
# (استخدم Ctrl+C أو أداة إدارة العمليات)

# تشغيل الخادم الجديد
pnpm start
```

أو إذا كنت تستخدم PM2:

```bash
pm2 restart all
```

---

## الاختبار النهائي

### 1. اختبار Backend API

استخدم Postman أو أي أداة API testing:

**اختبار العملات:**
```
GET http://localhost:3000/api/custom-system/v2/currencies
```

**اختبار إنشاء عملة:**
```
POST http://localhost:3000/api/custom-system/v2/currencies
Body: {
  "currencyCode": "USD",
  "currencyNameAr": "دولار أمريكي",
  "currencySymbol": "$",
  "isBaseCurrency": false,
  "isActive": true
}
```

**اختبار القيود اليومية:**
```
GET http://localhost:3000/api/custom-system/v2/journal-entries
```

### 2. اختبار Frontend UI

افتح المتصفح وانتقل إلى:

```
http://localhost:3000/custom-system/v2/operations
```

**اختبر:**
1. صفحة العمليات الموحدة
2. إنشاء سند قبض
3. إنشاء سند صرف
4. إنشاء تحويل
5. عرض القيود اليومية
6. إنشاء قيد يومي يدوي
7. ترحيل قيد
8. عكس قيد

### 3. اختبار القيد المزدوج

**سيناريو كامل:**

1. أنشئ حسابين:
   - حساب الصندوق (أصول)
   - حساب العملاء (أصول)

2. أنشئ سند قبض:
   - من: العملاء
   - إلى: الصندوق
   - المبلغ: 1000 ريال

3. تحقق من:
   - إنشاء قيد يومي تلقائي
   - القيد متوازن (مدين = دائن)
   - تحديث رصيد الصندوق (+1000)
   - تحديث رصيد العملاء (-1000)

4. اعكس القيد وتحقق من:
   - إنشاء قيد عكسي
   - عودة الأرصدة إلى ما كانت عليه

---

## استكشاف الأخطاء

### مشكلة: Migration فشل

**الحل:**
1. تحقق من اتصال قاعدة البيانات
2. تحقق من صلاحيات المستخدم
3. تحقق من عدم وجود constraints تمنع الحذف
4. راجع ملف Migration للتأكد من صحته

### مشكلة: API لا يعمل

**الحل:**
1. تحقق من تسجيل الـ routers في ملف الـ routes الرئيسي
2. تحقق من إعادة تشغيل الخادم
3. راجع logs الخادم للأخطاء
4. تحقق من CORS settings

### مشكلة: Frontend لا يعرض الصفحات

**الحل:**
1. تحقق من تسجيل الـ routes في ملف الـ routes الرئيسي
2. تحقق من build الـ Frontend
3. راجع console المتصفح للأخطاء
4. تحقق من AuthContext

### مشكلة: القيود غير متوازنة

**الحل:**
1. راجع منطق إنشاء القيود في الـ Backend
2. تحقق من حسابات المدين والدائن
3. تحقق من أسعار الصرف
4. راجع الـ validation في الـ Frontend

---

## الصيانة والتحديثات المستقبلية

### إضافة عملة جديدة

1. أضف العملة من صفحة العملات
2. أضف سعر الصرف من صفحة أسعار الصرف
3. ربط العملة بالحسابات المطلوبة

### إضافة حساب جديد

1. حدد نوع الحساب (أصول، التزامات، إلخ)
2. حدد رمز الحساب (يجب أن يكون فريداً)
3. ربط الحساب بالعملات المدعومة
4. ربط الحساب بنظام فرعي (اختياري)

### إنشاء قيد يومي

1. حدد رقم القيد والتاريخ
2. أضف سطور القيد (مدين ودائن)
3. تأكد من التوازن (مدين = دائن)
4. احفظ كمسودة
5. رحّل القيد لتحديث الأرصدة

### عكس قيد يومي

1. افتح القيد المطلوب
2. انقر على "عكس"
3. حدد تاريخ العكس
4. أدخل سبب العكس
5. تأكيد

---

## الدعم الفني

إذا واجهت أي مشاكل، يرجى:

1. مراجعة ملف `TESTING_CHECKLIST.md`
2. مراجعة ملف `API_DOCUMENTATION.md`
3. مراجعة ملف `README.md` في مجلد Frontend
4. التواصل مع فريق التطوير

---

## الإصدار

**Version:** 2.2.0  
**Release Date:** 2025-01-01  
**Status:** Production Ready

---

## الخلاصة

اتبع الخطوات أعلاه بعناية لضمان نشر ناجح للنظام المخصص v2.2.0. تأكد من عمل Backup لقاعدة البيانات قبل تشغيل Migration، واختبر جميع الوظائف بعد النشر.
