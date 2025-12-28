# النظام المخصص v2.2.0 - Frontend Documentation

## نظرة عامة

هذا المجلد يحتوي على جميع صفحات واجهة المستخدم للنظام المخصص v2.2.0، والذي يتضمن:
- نظام محاسبي بالقيد المزدوج
- دعم متعدد العملات
- القيود اليومية التلقائية
- شاشة العمليات الموحدة

## الصفحات

### 1. CurrenciesPage.tsx
**الوصف:** صفحة إدارة العملات

**المميزات:**
- عرض جميع العملات في جدول
- إضافة عملة جديدة
- تعديل عملة موجودة
- حذف عملة (مع التحقق من عدم وجود معاملات)
- تحديد العملة الأساسية
- تفعيل/إلغاء تفعيل العملات

**API Endpoints:**
- `GET /api/custom-system/v2/currencies`
- `POST /api/custom-system/v2/currencies`
- `PUT /api/custom-system/v2/currencies/:id`
- `DELETE /api/custom-system/v2/currencies/:id`

---

### 2. ExchangeRatesPage.tsx
**الوصف:** صفحة إدارة أسعار الصرف

**المميزات:**
- عرض جميع أسعار الصرف
- إضافة سعر صرف جديد
- تعديل سعر صرف موجود
- حذف سعر صرف
- تحديد تاريخ السريان والانتهاء
- دعم 6 منازل عشرية للدقة

**API Endpoints:**
- `GET /api/custom-system/v2/exchange-rates`
- `POST /api/custom-system/v2/exchange-rates`
- `PUT /api/custom-system/v2/exchange-rates/:id`
- `DELETE /api/custom-system/v2/exchange-rates/:id`

---

### 3. AccountsPage.tsx
**الوصف:** صفحة إدارة الحسابات

**المميزات:**
- عرض جميع الحسابات مع فلترة حسب النوع
- إضافة حساب جديد
- تعديل حساب موجود
- حذف حساب (مع التحقق من عدم وجود معاملات)
- دعم 5 أنواع حسابات: أصول، التزامات، حقوق ملكية، إيرادات، مصروفات
- ربط الحساب بعملات متعددة
- تحديد المستوى الهرمي للحساب
- ربط بنظام فرعي

**API Endpoints:**
- `GET /api/custom-system/v2/accounts`
- `POST /api/custom-system/v2/accounts`
- `PUT /api/custom-system/v2/accounts/:id`
- `DELETE /api/custom-system/v2/accounts/:id`

---

### 4. JournalEntriesPage.tsx
**الوصف:** صفحة إدارة القيود اليومية

**المميزات:**
- عرض جميع القيود اليومية
- إنشاء قيد يومي جديد (متعدد السطور)
- تعديل قيد يومي (فقط المسودات)
- ترحيل قيد يومي (تحديث الأرصدة)
- عكس قيد يومي (إنشاء قيد عكسي)
- حذف قيد يومي (فقط المسودات)
- عرض تفاصيل القيد
- التحقق من توازن القيد (مدين = دائن)
- دعم 3 أنواع قيود: يدوي، تلقائي، عكس
- دعم 3 حالات: مسودة، مرحّل، معكوس

**API Endpoints:**
- `GET /api/custom-system/v2/journal-entries`
- `GET /api/custom-system/v2/journal-entries/:id`
- `POST /api/custom-system/v2/journal-entries`
- `PUT /api/custom-system/v2/journal-entries/:id`
- `POST /api/custom-system/v2/journal-entries/:id/post`
- `POST /api/custom-system/v2/journal-entries/:id/reverse`
- `DELETE /api/custom-system/v2/journal-entries/:id`

---

### 5. OperationsPage.tsx
**الوصف:** شاشة العمليات الموحدة (سند قبض، سند صرف، تحويل)

**المميزات:**
- 3 أنواع عمليات: سند قبض، سند صرف، تحويل بين حسابين
- واجهة موحدة لجميع العمليات
- إنشاء قيد يومي تلقائي لكل عملية
- ترحيل تلقائي للقيد
- تحديث تلقائي للأرصدة
- دعم متعدد العملات مع سعر الصرف
- عرض آخر العمليات

**API Endpoints:**
- `POST /api/custom-system/v2/operations/receipt`
- `POST /api/custom-system/v2/operations/payment`
- `POST /api/custom-system/v2/operations/transfer`
- `GET /api/custom-system/v2/operations/recent`

---

## التكامل مع النظام

### إضافة Routes

يجب إضافة الصفحات إلى ملف الـ Routes الرئيسي:

```typescript
import {
  CurrenciesPage,
  ExchangeRatesPage,
  AccountsPage,
  JournalEntriesPage,
  OperationsPage,
} from "./pages/CustomSystem/v2";

// في ملف Routes
<Route path="/custom-system/v2/currencies" element={<CurrenciesPage />} />
<Route path="/custom-system/v2/exchange-rates" element={<ExchangeRatesPage />} />
<Route path="/custom-system/v2/accounts" element={<AccountsPage />} />
<Route path="/custom-system/v2/journal-entries" element={<JournalEntriesPage />} />
<Route path="/custom-system/v2/operations" element={<OperationsPage />} />
```

### إضافة Navigation Menu

يجب إضافة روابط الصفحات إلى القائمة الجانبية:

```typescript
{
  title: "النظام المخصص v2",
  items: [
    {
      title: "شاشة العمليات",
      path: "/custom-system/v2/operations",
      icon: <OperationsIcon />,
    },
    {
      title: "القيود اليومية",
      path: "/custom-system/v2/journal-entries",
      icon: <JournalIcon />,
    },
    {
      title: "الحسابات",
      path: "/custom-system/v2/accounts",
      icon: <AccountIcon />,
    },
    {
      title: "العملات",
      path: "/custom-system/v2/currencies",
      icon: <CurrencyIcon />,
    },
    {
      title: "أسعار الصرف",
      path: "/custom-system/v2/exchange-rates",
      icon: <ExchangeIcon />,
    },
  ],
}
```

---

## المتطلبات

### Dependencies

```json
{
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "axios": "^1.x",
  "react": "^18.x",
  "react-router-dom": "^6.x"
}
```

### Context

يجب توفر `AuthContext` الذي يحتوي على:
- `user`: معلومات المستخدم الحالي
- `user.businessId`: معرف النشاط التجاري

---

## الميزات التقنية

### 1. إدارة الحالة
- استخدام React Hooks (useState, useEffect)
- إدارة محلية للحالة (Local State Management)

### 2. معالجة الأخطاء
- عرض رسائل الأخطاء باللغة العربية
- التحقق من صحة البيانات قبل الإرسال
- معالجة أخطاء الشبكة

### 3. واجهة المستخدم
- تصميم متجاوب (Responsive Design)
- دعم RTL (Right-to-Left)
- استخدام Material-UI Components
- رسائل نجاح وفشل واضحة

### 4. الأداء
- تحميل البيانات عند الحاجة
- تحديث تلقائي بعد العمليات
- تقليل عدد الطلبات للـ API

---

## سيناريوهات الاستخدام

### سيناريو 1: إضافة عملة جديدة
1. فتح صفحة العملات
2. النقر على "إضافة عملة"
3. إدخال البيانات (الرمز، الاسم، الرمز المختصر)
4. تحديد إذا كانت عملة أساسية
5. حفظ

### سيناريو 2: إنشاء حساب جديد
1. فتح صفحة الحسابات
2. النقر على "إضافة حساب"
3. إدخال البيانات (الرمز، الاسم، النوع)
4. إضافة العملات المدعومة
5. حفظ

### سيناريو 3: إنشاء سند قبض
1. فتح شاشة العمليات
2. النقر على بطاقة "سند قبض"
3. اختيار الحساب المدين (الدافع)
4. اختيار الحساب الدائن (المستلم)
5. إدخال المبلغ والعملة
6. حفظ (يتم إنشاء القيد اليومي وترحيله تلقائياً)

### سيناريو 4: إنشاء قيد يومي يدوي
1. فتح صفحة القيود اليومية
2. النقر على "إضافة قيد يومي"
3. إدخال البيانات الأساسية
4. إضافة سطور القيد (مدين ودائن)
5. التأكد من التوازن (مدين = دائن)
6. حفظ كمسودة
7. ترحيل القيد (تحديث الأرصدة)

---

## الإصدار

**Version:** 2.2.0  
**Last Updated:** 2025-01-01  
**Status:** Production Ready

---

## الملاحظات

1. جميع الصفحات تدعم RTL (Right-to-Left)
2. جميع النصوص باللغة العربية
3. التحقق من الصلاحيات يتم على مستوى الـ Backend
4. يجب التأكد من وجود `AuthContext` قبل استخدام الصفحات
5. جميع العمليات المالية تنشئ قيود يومية متوازنة
6. لا يمكن تعديل أو حذف القيود المرحلة
7. يمكن عكس القيود المرحلة فقط
