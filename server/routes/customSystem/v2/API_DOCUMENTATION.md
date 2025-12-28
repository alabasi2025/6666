# النظام المخصص v2.2.0 - توثيق API

## نظرة عامة

هذا التوثيق يشمل جميع endpoints الخاصة بالنظام المخصص v2.2.0 والذي يتضمن:
- نظام محاسبي بالقيد المزدوج
- دعم متعدد العملات
- القيود اليومية التلقائية
- شاشة العمليات الموحدة

**Base URL:** `/api/custom-system/v2`

---

## 1. العملات (Currencies)

### 1.1 الحصول على جميع العملات
```
GET /currencies
```

**Query Parameters:**
- `isActive` (optional): true/false

**Response:**
```json
[
  {
    "id": 1,
    "businessId": 1,
    "currencyCode": "SAR",
    "currencyNameAr": "ريال سعودي",
    "currencyNameEn": "Saudi Riyal",
    "currencySymbol": "ر.س",
    "isBaseCurrency": true,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### 1.2 الحصول على عملة محددة
```
GET /currencies/:id
```

### 1.3 إنشاء عملة جديدة
```
POST /currencies
```

**Body:**
```json
{
  "currencyCode": "USD",
  "currencyNameAr": "دولار أمريكي",
  "currencyNameEn": "US Dollar",
  "currencySymbol": "$",
  "isBaseCurrency": false,
  "isActive": true
}
```

### 1.4 تحديث عملة
```
PUT /currencies/:id
```

### 1.5 حذف عملة
```
DELETE /currencies/:id
```

---

## 2. أسعار الصرف (Exchange Rates)

### 2.1 الحصول على جميع أسعار الصرف
```
GET /exchange-rates
```

**Query Parameters:**
- `fromCurrencyId` (optional)
- `toCurrencyId` (optional)
- `effectiveDate` (optional)

### 2.2 الحصول على سعر صرف محدد
```
GET /exchange-rates/:id
```

### 2.3 الحصول على سعر الصرف الفعال
```
GET /exchange-rates/effective
```

**Query Parameters:**
- `fromCurrencyId` (required)
- `toCurrencyId` (required)
- `effectiveDate` (optional, default: today)

**Response:**
```json
{
  "id": 1,
  "rate": "3.75",
  "effectiveDate": "2025-01-01",
  "fromCurrency": { "code": "SAR", "name": "ريال سعودي" },
  "toCurrency": { "code": "USD", "name": "دولار أمريكي" }
}
```

### 2.4 إنشاء سعر صرف جديد
```
POST /exchange-rates
```

**Body:**
```json
{
  "fromCurrencyId": 1,
  "toCurrencyId": 2,
  "rate": "3.75",
  "effectiveDate": "2025-01-01",
  "notes": "سعر الصرف الرسمي"
}
```

### 2.5 تحديث سعر صرف
```
PUT /exchange-rates/:id
```

### 2.6 حذف سعر صرف
```
DELETE /exchange-rates/:id
```

---

## 3. الحسابات (Accounts)

### 3.1 الحصول على جميع الحسابات
```
GET /accounts
```

**Query Parameters:**
- `subSystemId` (optional)
- `accountType` (optional): asset, liability, equity, revenue, expense
- `isActive` (optional): true/false

### 3.2 الحصول على حساب محدد
```
GET /accounts/:id
```

**Response:**
```json
{
  "id": 1,
  "accountCode": "1010",
  "accountNameAr": "الصندوق",
  "accountType": "asset",
  "isActive": true,
  "currencies": [
    { "currencyId": 1, "isDefault": true }
  ],
  "balances": [
    {
      "currencyId": 1,
      "debitBalance": "10000.00",
      "creditBalance": "5000.00",
      "currentBalance": "5000.00"
    }
  ]
}
```

### 3.3 إنشاء حساب جديد
```
POST /accounts
```

**Body:**
```json
{
  "subSystemId": 1,
  "accountCode": "1010",
  "accountNameAr": "الصندوق",
  "accountNameEn": "Cash",
  "accountType": "asset",
  "level": 1,
  "description": "حساب الصندوق الرئيسي",
  "isActive": true,
  "allowManualEntry": true,
  "currencies": [
    { "currencyId": 1, "isDefault": true }
  ]
}
```

### 3.4 تحديث حساب
```
PUT /accounts/:id
```

### 3.5 حذف حساب
```
DELETE /accounts/:id
```

### 3.6 الحصول على أرصدة حساب
```
GET /accounts/:id/balances
```

### 3.7 إضافة عملة لحساب
```
POST /accounts/:id/currencies
```

**Body:**
```json
{
  "currencyId": 2,
  "isDefault": false
}
```

### 3.8 حذف عملة من حساب
```
DELETE /accounts/:id/currencies/:currencyId
```

### 3.9 الحصول على الأنواع الفرعية للحسابات
```
GET /accounts/sub-types
```

---

## 4. الأنظمة الفرعية (Sub Systems)

### 4.1 الحصول على جميع الأنظمة الفرعية
```
GET /sub-systems
```

**Query Parameters:**
- `isActive` (optional): true/false

### 4.2 الحصول على نظام فرعي محدد
```
GET /sub-systems/:id
```

### 4.3 إنشاء نظام فرعي جديد
```
POST /sub-systems
```

**Body:**
```json
{
  "systemNameAr": "نظام المبيعات",
  "systemNameEn": "Sales System",
  "description": "نظام إدارة المبيعات",
  "defaultReceiptAccountId": 1,
  "defaultPaymentAccountId": 2,
  "isActive": true
}
```

### 4.4 تحديث نظام فرعي
```
PUT /sub-systems/:id
```

### 4.5 حذف نظام فرعي
```
DELETE /sub-systems/:id
```

### 4.6 الحصول على حسابات نظام فرعي
```
GET /sub-systems/:id/accounts
```

### 4.7 تعيين حساب افتراضي
```
POST /sub-systems/:id/set-default-account
```

**Body:**
```json
{
  "accountType": "receipt",
  "accountId": 1
}
```

---

## 5. القيود اليومية (Journal Entries)

### 5.1 الحصول على جميع القيود اليومية
```
GET /journal-entries
```

**Query Parameters:**
- `subSystemId` (optional)
- `status` (optional): draft, posted, reversed
- `entryType` (optional): manual, system_generated, reversal
- `startDate` (optional)
- `endDate` (optional)

### 5.2 الحصول على قيد يومي محدد
```
GET /journal-entries/:id
```

**Response:**
```json
{
  "id": 1,
  "entryNumber": "JE-001",
  "entryDate": "2025-01-01",
  "entryType": "manual",
  "description": "قيد افتتاحي",
  "status": "posted",
  "lines": [
    {
      "accountId": 1,
      "debitAmount": "10000.00",
      "creditAmount": "0.00",
      "currencyId": 1,
      "description": "رصيد افتتاحي"
    },
    {
      "accountId": 2,
      "debitAmount": "0.00",
      "creditAmount": "10000.00",
      "currencyId": 1,
      "description": "رصيد افتتاحي"
    }
  ]
}
```

### 5.3 إنشاء قيد يومي جديد
```
POST /journal-entries
```

**Body:**
```json
{
  "subSystemId": 1,
  "entryNumber": "JE-001",
  "entryDate": "2025-01-01",
  "entryType": "manual",
  "description": "قيد افتتاحي",
  "lines": [
    {
      "accountId": 1,
      "debitAmount": 10000,
      "creditAmount": 0,
      "currencyId": 1,
      "exchangeRate": 1,
      "description": "رصيد افتتاحي"
    },
    {
      "accountId": 2,
      "debitAmount": 0,
      "creditAmount": 10000,
      "currencyId": 1,
      "exchangeRate": 1,
      "description": "رصيد افتتاحي"
    }
  ]
}
```

**ملاحظة:** يجب أن يكون مجموع المدين = مجموع الدائن

### 5.4 تحديث قيد يومي
```
PUT /journal-entries/:id
```

**ملاحظة:** يمكن تحديث القيود ذات الحالة `draft` فقط

### 5.5 ترحيل قيد يومي
```
POST /journal-entries/:id/post
```

**الوظيفة:**
- تحديث حالة القيد إلى `posted`
- تحديث أرصدة الحسابات المرتبطة

### 5.6 عكس قيد يومي
```
POST /journal-entries/:id/reverse
```

**Body:**
```json
{
  "reversalDate": "2025-01-15",
  "reversalReason": "تصحيح خطأ"
}
```

**الوظيفة:**
- إنشاء قيد عكسي جديد (عكس المدين والدائن)
- تحديث حالة القيد الأصلي إلى `reversed`
- تحديث الأرصدة

### 5.7 حذف قيد يومي
```
DELETE /journal-entries/:id
```

**ملاحظة:** يمكن حذف القيود ذات الحالة `draft` فقط

---

## 6. العمليات الموحدة (Operations)

### 6.1 إنشاء سند قبض
```
POST /operations/receipt
```

**Body:**
```json
{
  "subSystemId": 1,
  "receiptNumber": "REC-001",
  "receiptDate": "2025-01-01",
  "fromAccountId": 5,
  "toAccountId": 1,
  "amount": 5000,
  "currencyId": 1,
  "exchangeRate": 1,
  "description": "سند قبض من عميل",
  "notes": "ملاحظات إضافية"
}
```

**الوظيفة:**
- إنشاء سند قبض
- إنشاء قيد يومي تلقائي (مدين: toAccount، دائن: fromAccount)
- ترحيل القيد وتحديث الأرصدة

### 6.2 إنشاء سند صرف
```
POST /operations/payment
```

**Body:**
```json
{
  "subSystemId": 1,
  "paymentNumber": "PAY-001",
  "paymentDate": "2025-01-01",
  "fromAccountId": 1,
  "toAccountId": 6,
  "amount": 3000,
  "currencyId": 1,
  "exchangeRate": 1,
  "description": "سند صرف لمورد",
  "notes": "ملاحظات إضافية"
}
```

**الوظيفة:**
- إنشاء سند صرف
- إنشاء قيد يومي تلقائي (مدين: toAccount، دائن: fromAccount)
- ترحيل القيد وتحديث الأرصدة

### 6.3 إنشاء تحويل بين حسابين
```
POST /operations/transfer
```

**Body:**
```json
{
  "subSystemId": 1,
  "transferNumber": "TRF-001",
  "transferDate": "2025-01-01",
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 2000,
  "currencyId": 1,
  "exchangeRate": 1,
  "description": "تحويل من الصندوق إلى البنك",
  "notes": "ملاحظات إضافية"
}
```

**الوظيفة:**
- إنشاء قيد يومي تلقائي (مدين: toAccount، دائن: fromAccount)
- ترحيل القيد وتحديث الأرصدة

### 6.4 الحصول على آخر العمليات
```
GET /operations/recent
```

**Query Parameters:**
- `limit` (optional, default: 20)

---

## 7. سندات القبض والصرف (Receipts & Payments)

### 7.1 الحصول على جميع سندات القبض
```
GET /receipts
```

**Query Parameters:**
- `subSystemId` (optional)
- `status` (optional): draft, approved, cancelled
- `startDate` (optional)
- `endDate` (optional)

### 7.2 الحصول على سند قبض محدد
```
GET /receipts/:id
```

**Response:**
```json
{
  "id": 1,
  "receiptNumber": "REC-001",
  "receiptDate": "2025-01-01",
  "fromAccountId": 5,
  "toAccountId": 1,
  "amount": "5000.00",
  "currencyId": 1,
  "status": "approved",
  "journalEntry": {
    "id": 1,
    "entryNumber": "REC-REC-001",
    "status": "posted"
  },
  "journalEntryLines": [...]
}
```

### 7.3 تحديث سند قبض
```
PUT /receipts/:id
```

**ملاحظة:** يمكن تحديث السندات ذات الحالة `draft` فقط

### 7.4 حذف سند قبض
```
DELETE /receipts/:id
```

**ملاحظة:** يمكن حذف السندات ذات الحالة `draft` فقط

### 7.5 الحصول على جميع سندات الصرف
```
GET /payments
```

### 7.6 الحصول على سند صرف محدد
```
GET /payments/:id
```

### 7.7 تحديث سند صرف
```
PUT /payments/:id
```

### 7.8 حذف سند صرف
```
DELETE /payments/:id
```

---

## حالات الأخطاء الشائعة

### 400 Bad Request
```json
{
  "error": "رسالة الخطأ بالعربية"
}
```

### 404 Not Found
```json
{
  "error": "العنصر غير موجود"
}
```

### 500 Internal Server Error
```json
{
  "error": "فشل في تنفيذ العملية"
}
```

---

## ملاحظات مهمة

1. **القيد المزدوج:** جميع العمليات المالية تنشئ قيود يومية متوازنة (مدين = دائن)

2. **متعدد العملات:** يمكن للحسابات دعم عملات متعددة، ويتم تحويل المبالغ تلقائياً باستخدام أسعار الصرف

3. **الأرصدة التلقائية:** يتم تحديث أرصدة الحسابات تلقائياً عند ترحيل القيود

4. **الحماية:** لا يمكن تعديل أو حذف القيود والسندات المرحلة/المعتمدة

5. **العكس:** يمكن عكس القيود المرحلة عبر إنشاء قيد عكسي جديد

6. **التدقيق:** جميع العمليات تسجل `createdBy`, `createdAt`, `postedBy`, `postedAt`

---

## أمثلة على سيناريوهات الاستخدام

### سيناريو 1: قبض نقدي من عميل

```javascript
// 1. إنشاء سند قبض
POST /api/custom-system/v2/operations/receipt
{
  "receiptNumber": "REC-001",
  "receiptDate": "2025-01-01",
  "fromAccountId": 5,  // حساب العملاء
  "toAccountId": 1,     // حساب الصندوق
  "amount": 5000,
  "currencyId": 1,
  "description": "قبض من العميل أحمد"
}

// النتيجة:
// - سند قبض معتمد
// - قيد يومي مرحل: مدين الصندوق 5000، دائن العملاء 5000
// - تحديث الأرصدة تلقائياً
```

### سيناريو 2: صرف نقدي لمورد

```javascript
// 1. إنشاء سند صرف
POST /api/custom-system/v2/operations/payment
{
  "paymentNumber": "PAY-001",
  "paymentDate": "2025-01-01",
  "fromAccountId": 1,   // حساب الصندوق
  "toAccountId": 6,     // حساب الموردين
  "amount": 3000,
  "currencyId": 1,
  "description": "صرف للمورد محمد"
}

// النتيجة:
// - سند صرف معتمد
// - قيد يومي مرحل: مدين الموردين 3000، دائن الصندوق 3000
// - تحديث الأرصدة تلقائياً
```

### سيناريو 3: تحويل من الصندوق إلى البنك

```javascript
// 1. إنشاء تحويل
POST /api/custom-system/v2/operations/transfer
{
  "transferNumber": "TRF-001",
  "transferDate": "2025-01-01",
  "fromAccountId": 1,   // حساب الصندوق
  "toAccountId": 2,     // حساب البنك
  "amount": 10000,
  "currencyId": 1,
  "description": "إيداع في البنك"
}

// النتيجة:
// - قيد يومي مرحل: مدين البنك 10000، دائن الصندوق 10000
// - تحديث الأرصدة تلقائياً
```

### سيناريو 4: قيد يومي يدوي متعدد السطور

```javascript
// 1. إنشاء قيد يومي
POST /api/custom-system/v2/journal-entries
{
  "entryNumber": "JE-001",
  "entryDate": "2025-01-01",
  "entryType": "manual",
  "description": "قيد توزيع مصروفات",
  "lines": [
    {
      "accountId": 10,  // مصروفات رواتب
      "debitAmount": 20000,
      "creditAmount": 0,
      "currencyId": 1,
      "description": "رواتب يناير"
    },
    {
      "accountId": 11,  // مصروفات إيجار
      "debitAmount": 5000,
      "creditAmount": 0,
      "currencyId": 1,
      "description": "إيجار يناير"
    },
    {
      "accountId": 1,   // الصندوق
      "debitAmount": 0,
      "creditAmount": 25000,
      "currencyId": 1,
      "description": "إجمالي المصروفات"
    }
  ]
}

// 2. ترحيل القيد
POST /api/custom-system/v2/journal-entries/1/post

// النتيجة:
// - قيد يومي مرحل
// - تحديث أرصدة الحسابات الثلاثة
```

---

## الإصدار

**Version:** 2.2.0  
**Last Updated:** 2025-01-01  
**Status:** Production Ready
