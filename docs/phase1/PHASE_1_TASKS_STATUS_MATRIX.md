# Phase 1 Tasks Status Matrix (Audited)

- **Generated at**: `2026-01-06T02:42:06.717Z`
- **Blueprint source**: `C:\Users\admin\Downloads\systems-blueprint-main\PHASE_1_DETAILED(1).md`
- **Blueprint total lines**: 17060
- **Extracted items**: 321
- **Checklist source**: `F:\666666\6666-main\PHASE_1_TASKS_CHECKLIST.md`
- **Legend**: ✅ منفذ، ⚠️ منفذ جزئياً، ❌ غير منفذ، ⏸️ يحتاج مراجعة
- **Status counts**: ✅ 65 | ⚠️ 35 | ❌ 221 | ⏸️ 0

---

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 1: بناء الأساس المعماري (Platform Core) > ✅ المهام الفرعية: > 1.1: تصميم وتنفيذ بنية متعددة المستأجرين (Multi-Tenant Architecture)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 1.1.1 | ✅ | bullet | تصميم مخطط قاعدة البيانات (Schema) - 3 أيام | 45 | `drizzle/schema.ts`<br/>`server/db-modules/business.ts`<br/>`server/routers.ts` |  |
| 1.1.2 | ✅ | bullet | إنشاء جدول المحطات (Stations) - يومان | 46 | `drizzle/schema.ts`<br/>`server/db-modules/business.ts`<br/>`server/routers.ts` |  |
| 1.1.3 | ✅ | bullet | إنشاء جدول المشتركين (Subscribers) - يومان | 47 | `drizzle/schema.ts`<br/>`server/db-modules/business.ts`<br/>`server/routers.ts` |  |
| 1.1.4 | ✅ | bullet | إنشاء جدول العدادات (Meters) - يومان | 48 | `drizzle/schema.ts`<br/>`server/db-modules/business.ts`<br/>`server/routers.ts` |  |
| 1.1.5 | ✅ | bullet | إنشاء جداول الفواتير والدفعات - يومان | 49 | `drizzle/schema.ts`<br/>`server/db-modules/business.ts`<br/>`server/routers.ts` |  |
| 1.1.6 | ⚠️ | bullet | تطبيق سياسات الأمان والعزل - يوم | 50 | `drizzle/schema.ts`<br/>`server/db-modules/business.ts`<br/>`server/routers.ts` |  |
| 1.1.7 | ✅ | bullet | توثيق مخطط قاعدة البيانات - يوم | 51 | `drizzle/schema.ts`<br/>`server/db-modules/business.ts`<br/>`server/routers.ts` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 1: بناء الأساس المعماري (Platform Core) > ✅ المهام الفرعية: > 1.2: إنشاء نظام لإدارة المستخدمين والصلاحيات

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 1.2.1 | ✅ | bullet | إنشاء جدول المستخدمين (Users) - يوم | 67 | `drizzle/schema.ts`<br/>`server/auth.ts`<br/>`server/permissions/*`<br/>`client/src/pages/Login.tsx`<br/>`client/src/pages/users/UsersManagement.tsx` |  |
| 1.2.2 | ✅ | bullet | إنشاء جدول الأدوار (Roles) - يوم | 68 | `drizzle/schema.ts`<br/>`server/auth.ts`<br/>`server/permissions/*`<br/>`client/src/pages/Login.tsx`<br/>`client/src/pages/users/UsersManagement.tsx` |  |
| 1.2.3 | ✅ | bullet | إنشاء جدول الصلاحيات (Permissions) - يوم | 69 | `drizzle/schema.ts`<br/>`server/auth.ts`<br/>`server/permissions/*`<br/>`client/src/pages/Login.tsx`<br/>`client/src/pages/users/UsersManagement.tsx` |  |
| 1.2.4 | ✅ | bullet | بناء نظام المصادقة (Authentication) - 3 أيام | 70 | `drizzle/schema.ts`<br/>`server/auth.ts`<br/>`server/permissions/*`<br/>`client/src/pages/Login.tsx`<br/>`client/src/pages/users/UsersManagement.tsx` |  |
| 1.2.5 | ⚠️ | bullet | بناء نظام التفويض (Authorization) - يومان | 71 | `drizzle/schema.ts`<br/>`server/auth.ts`<br/>`server/permissions/*`<br/>`client/src/pages/Login.tsx`<br/>`client/src/pages/users/UsersManagement.tsx` |  |
| 1.2.6 | ✅ | bullet | تطوير شاشة تسجيل الدخول - يوم | 72 | `drizzle/schema.ts`<br/>`server/auth.ts`<br/>`server/permissions/*`<br/>`client/src/pages/Login.tsx`<br/>`client/src/pages/users/UsersManagement.tsx` |  |
| 1.2.7 | ✅ | bullet | تطوير شاشة إدارة المستخدمين - يومان | 73 | `drizzle/schema.ts`<br/>`server/auth.ts`<br/>`server/permissions/*`<br/>`client/src/pages/Login.tsx`<br/>`client/src/pages/users/UsersManagement.tsx` |  |
| 1.2.8 | ❌ | bullet | تطوير شاشة إدارة الأدوار والصلاحيات - يوم | 74 | `drizzle/schema.ts`<br/>`server/auth.ts`<br/>`server/permissions/*`<br/>`client/src/pages/Login.tsx`<br/>`client/src/pages/users/UsersManagement.tsx` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 1: بناء الأساس المعماري (Platform Core) > ✅ المهام الفرعية: > 1.3: تطوير الواجهات الأساسية لإدارة المحطات

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 1.3.1 | ✅ | bullet | تطوير لوحة التحكم الرئيسية (Dashboard) - يومان | 83 | `client/src/pages/Dashboard.tsx`<br/>`client/src/pages/organization/Businesses.tsx`<br/>`client/src/pages/organization/Branches.tsx`<br/>`client/src/pages/organization/Stations.tsx` |  |
| 1.3.2 | ✅ | bullet | تطوير شاشة إنشاء محطة جديدة - يوم | 84 | `client/src/pages/Dashboard.tsx`<br/>`client/src/pages/organization/Businesses.tsx`<br/>`client/src/pages/organization/Branches.tsx`<br/>`client/src/pages/organization/Stations.tsx` |  |
| 1.3.3 | ✅ | bullet | تطوير شاشة عرض المحطات - يوم | 85 | `client/src/pages/Dashboard.tsx`<br/>`client/src/pages/organization/Businesses.tsx`<br/>`client/src/pages/organization/Branches.tsx`<br/>`client/src/pages/organization/Stations.tsx` |  |
| 1.3.4 | ⚠️ | bullet | تطوير شاشة إعدادات المحطة - يوم | 86 | `client/src/pages/Dashboard.tsx`<br/>`client/src/pages/organization/Businesses.tsx`<br/>`client/src/pages/organization/Branches.tsx`<br/>`client/src/pages/organization/Stations.tsx` | إعدادات المحطة موجودة ضمن نموذج إنشاء/تعديل المحطة، لكن لا شاشة إعدادات متقدمة منفصلة. |
| 1.3.5 | ⚠️ | bullet | تطوير نظام التنقل بين المحطات - يوم | 87 | `client/src/pages/Dashboard.tsx`<br/>`client/src/pages/organization/Businesses.tsx`<br/>`client/src/pages/organization/Branches.tsx`<br/>`client/src/pages/organization/Stations.tsx` |  |
| 1.3.6 | ✅ | bullet | إضافة عرض الإحصائيات السريعة - يوم | 88 | `client/src/pages/Dashboard.tsx`<br/>`client/src/pages/organization/Businesses.tsx`<br/>`client/src/pages/organization/Branches.tsx`<br/>`client/src/pages/organization/Stations.tsx` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 1: بناء الأساس المعماري (Platform Core) > ✅ المهام الفرعية: > 1.4: بناء الوحدة الأساسية لإدارة المشتركين والعدادات

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 1.4.1 | ✅ | bullet | تطوير شاشة "بحث وإدارة المشتركين" - يومان | 97 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |
| 1.4.2 | ✅ | bullet | تطوير شاشة "ملف المشترك" - يومان | 98 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |
| 1.4.3 | ✅ | bullet | تطوير شاشة إضافة مشترك جديد - يوم | 99 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |
| 1.4.4 | ✅ | bullet | تطوير شاشة "إضافة/تعديل عداد" - يوم | 100 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |
| 1.4.5 | ✅ | bullet | تطوير نموذج بيانات العدادات - يومان | 101 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |
| 1.4.6 | ⚠️ | bullet | إضافة عرض الرصيد/الدين - يوم | 102 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |
| 1.4.7 | ❌ | bullet | إضافة سجل الفواتير/الشحنات - يوم | 103 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |
| 1.4.8 | ✅ | bullet | إضافة خيارات البحث والفلترة - يوم | 104 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |
| 1.4.9 | ✅ | bullet | إضافة خيارات التصدير - يوم | 105 | `server/billingRouter.ts`<br/>`client/src/pages/billing/customers/CustomersManagement.tsx`<br/>`client/src/pages/customers/CustomerDetails.tsx` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 2: أتمتة عمليات العدادات التقليدية > ✅ المهام الفرعية: > 2.1: بناء واجهة إدخال القراءات اليدوية

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 2.1.1 | ❌ | bullet | تطوير تطبيق جوال (Mobile App) - 3 أيام | 123 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |
| 2.1.2 | ✅ | bullet | واجهة بسيطة لإدخال القراءات - يوم | 124 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |
| 2.1.3 | ✅ | bullet | البحث عن المشترك - يوم | 125 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |
| 2.1.4 | ✅ | bullet | إدخال القراءة الحالية - يوم | 126 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |
| 2.1.5 | ❌ | bullet | التقاط صورة من العداد - يوم | 127 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |
| 2.1.6 | ⚠️ | bullet | التحقق من صحة القراءة - يوم | 128 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |
| 2.1.7 | ✅ | bullet | حساب الفرق تلقائياً - يوم | 129 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |
| 2.1.8 | ✅ | bullet | حفظ القراءة مع البيانات - يوم | 130 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |
| 2.1.9 | ❌ | bullet | تقرير يومي للموظف - يوم | 131 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/MeterReadingsManagement.tsx` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 2: أتمتة عمليات العدادات التقليدية > ✅ المهام الفرعية: > 2.2: تطوير وحدة الفوترة الدورية التلقائية

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 2.2.1 | ✅ | bullet | تصميم منطق الفوترة - يومان | 140 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/InvoicesManagement.tsx` |  |
| 2.2.2 | ❌ | bullet | برمجة وظيفة مجدولة (Cron Job) - يومان | 141 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/InvoicesManagement.tsx` |  |
| 2.2.3 | ⚠️ | bullet | حساب الاستهلاك تلقائياً - يوم | 142 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/InvoicesManagement.tsx` |  |
| 2.2.4 | ✅ | bullet | حساب المبلغ المستحق - يوم | 143 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/InvoicesManagement.tsx` |  |
| 2.2.5 | ⚠️ | bullet | إضافة الرسوم والضرائب - يوم | 144 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/InvoicesManagement.tsx` |  |
| 2.2.6 | ✅ | bullet | إنشاء سجل الفاتورة - يوم | 145 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/InvoicesManagement.tsx` |  |
| 2.2.7 | ✅ | bullet | تحديث حالة المشترك - يوم | 146 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/InvoicesManagement.tsx` |  |
| 2.2.8 | ⚠️ | bullet | معالجة الأخطاء والاستثناءات - يوم | 147 | `server/billingRouter.ts`<br/>`client/src/pages/billing/invoicing/InvoicesManagement.tsx` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 2: أتمتة عمليات العدادات التقليدية > ✅ المهام الفرعية: > 2.3: بناء وحدة التكامل مع بوابات الدفع الإلكترونية

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 2.3.1 | ⚠️ | bullet | اختيار بوابات الدفع - يوم | 156 | `drizzle/schema.ts`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`server/billingRouter.ts` |  |
| 2.3.2 | ⚠️ | bullet | بناء API للتكامل - 3 أيام | 157 | `drizzle/schema.ts`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`server/billingRouter.ts` |  |
| 2.3.3 | ❌ | bullet | إنشاء معاملات الدفع - يومان | 158 | `drizzle/schema.ts`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`server/billingRouter.ts` | لا يوجد نموذج معاملات بوابة دفع/ويبهوكس؛ الموجود حالياً تسجيل يدوي للمدفوعات. |
| 2.3.4 | ❌ | bullet | التعامل مع الدفعات الناجحة - يومان | 159 | `drizzle/schema.ts`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`server/billingRouter.ts` | لا يوجد Webhook/Handler لنجاح الدفع من بوابة دفع. |
| 2.3.5 | ❌ | bullet | التعامل مع الدفعات الفاشلة - يوم | 160 | `drizzle/schema.ts`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`server/billingRouter.ts` | لا يوجد مسار دفعات فاشلة/Refunds مرتبط ببوابة دفع. |
| 2.3.6 | ✅ | bullet | تسجيل المدفوعات - يوم | 161 | `drizzle/schema.ts`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`server/billingRouter.ts` |  |
| 2.3.7 | ✅ | bullet | إنشاء إيصالات الدفع - يوم | 162 | `drizzle/schema.ts`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`server/billingRouter.ts` |  |
| 2.3.8 | ❌ | bullet | نظام التحقق من الدفع - يومان | 163 | `drizzle/schema.ts`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`server/billingRouter.ts` | لا يوجد نظام تحقق Payment Verification من مزود خارجي. |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 2: أتمتة عمليات العدادات التقليدية > ✅ المهام الفرعية: > 2.4: بناء وحدة التكامل مع SMS و WhatsApp

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 2.4.1 | ⚠️ | bullet | اختيار خدمة SMS - يوم | 172 | `server/notifications/*`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`drizzle/schema.ts` |  |
| 2.4.2 | ❌ | bullet | اختيار خدمة WhatsApp - يوم | 173 | `server/notifications/*`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`drizzle/schema.ts` | لا توجد قناة WhatsApp في server/notifications/channels. |
| 2.4.3 | ⚠️ | bullet | بناء API للتكامل - يومان | 174 | `server/notifications/*`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`drizzle/schema.ts` |  |
| 2.4.4 | ⚠️ | bullet | برمجة قالب الرسالة - يوم | 175 | `server/notifications/*`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`drizzle/schema.ts` |  |
| 2.4.5 | ❌ | bullet | إرسال الفاتورة تلقائياً - يوم | 176 | `server/notifications/*`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`drizzle/schema.ts` | لا يوجد إرسال فواتير تلقائي عبر SMS/WhatsApp. |
| 2.4.6 | ❌ | bullet | إرسال تذكيرات - يوم | 177 | `server/notifications/*`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`drizzle/schema.ts` | لا يوجد تذكير مجدول للمتأخرات. |
| 2.4.7 | ⚠️ | bullet | إرسال تأكيد الدفع - يوم | 178 | `server/notifications/*`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`drizzle/schema.ts` |  |
| 2.4.8 | ⚠️ | bullet | نظام إعادة المحاولة - يوم | 179 | `server/notifications/*`<br/>`client/src/pages/developer/Integrations.tsx`<br/>`drizzle/schema.ts` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 3: أتمتة عمليات عدادات الدفع المسبق (STS) > ✅ المهام الفرعية: > 3.1: تطوير وحدة التكامل مع API مقدم خدمة STS

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.1.1 | ❌ | bullet | الحصول على توثيق API - يوم | 197 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.2 | ❌ | bullet | بناء Client للتكامل - يومان | 198 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.3 | ❌ | bullet | اختبار الاتصال - يوم | 199 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.4 | ❌ | bullet | بناء وظيفة إنشاء طلب شحن - يومان | 200 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.5 | ❌ | bullet | استقبال التوكن - يوم | 201 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.6 | ❌ | bullet | التحقق من حالة الشحن - يوم | 202 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.7 | ❌ | bullet | إلغاء الشحن - يوم | 203 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.8 | ❌ | bullet | معالجة الأخطاء - يوم | 204 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 3: أتمتة عمليات عدادات الدفع المسبق (STS) > ✅ المهام الفرعية: > 3.2: تطوير واجهة "شحن الرصيد"

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.2.1 | ⚠️ | bullet | تطوير صفحة الشحن - يومان | 213 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.2 | ⚠️ | bullet | إدخال المبلغ المطلوب - يوم | 214 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.3 | ⚠️ | bullet | اختيار طريقة الدفع - يوم | 215 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.4 | ⚠️ | bullet | معالجة الدفع - يومان | 216 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.5 | ❌ | bullet | عرض التوكن - يوم | 217 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.6 | ❌ | bullet | خيار نسخ التوكن - يوم | 218 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.7 | ❌ | bullet | إرسال التوكن عبر SMS - يوم | 219 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.8 | ❌ | bullet | إرسال التوكن عبر Email - يوم | 220 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 3: أتمتة عمليات عدادات الدفع المسبق (STS) > ✅ المهام الفرعية: > 3.3: برمجة منطق الأتمتة الفوري

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.3.1 | ⚠️ | bullet | تصميم سير العملية - يوم | 229 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.2 | ❌ | bullet | الدفع الناجح → استدعاء API - يوم | 230 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.3 | ❌ | bullet | استقبال التوكن من API - يوم | 231 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.4 | ❌ | bullet | إرسال التوكن للعميل - يوم | 232 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.5 | ⚠️ | bullet | تسجيل العملية - يوم | 233 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.6 | ⚠️ | bullet | معالجة الأخطاء - يوم | 234 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.7 | ⚠️ | bullet | تسجيل العملية المالية - يوم | 235 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.8 | ❌ | bullet | إشعار المحاسب - يوم | 236 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 4: بناء وحدة الربط المحاسبي التلقائي > ✅ المهام الفرعية: > 4.1: تصميم شجرة الحسابات

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 4.1.1 | ✅ | bullet | تصميم شجرة الحسابات - يومان | 254 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.1.2 | ✅ | bullet | إنشاء حسابات الأصول - يوم | 255 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.1.3 | ✅ | bullet | إنشاء حسابات الإيرادات - يوم | 256 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.1.4 | ✅ | bullet | إنشاء حسابات الرسوم والضرائب - يوم | 257 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.1.5 | ✅ | bullet | توثيق شجرة الحسابات - يوم | 258 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 4: بناء وحدة الربط المحاسبي التلقائي > ✅ المهام الفرعية: > 4.2: برمجة آلية إنشاء القيود المحاسبية التلقائية

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 4.2.1 | ✅ | bullet | تصميم منطق القيد - يوم | 267 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2.2 | ✅ | bullet | قيد الدفع من عداد تقليدي - يومان | 268 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2.3 | ⚠️ | bullet | قيد الشحن من عداد STS - يومان | 269 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2.4 | ✅ | bullet | إضافة الرسوم والضرائب - يوم | 270 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2.5 | ✅ | bullet | تسجيل التفاصيل - يوم | 271 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2.6 | ✅ | bullet | معالجة الأخطاء - يوم | 272 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2.7 | ✅ | bullet | التحقق من التوازن - يوم | 273 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 4: بناء وحدة الربط المحاسبي التلقائي > ✅ المهام الفرعية: > 4.3: تطوير واجهة لعرض قيود اليومية

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 4.3.1 | ✅ | bullet | تطوير شاشة عرض القيود - يومان | 282 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.3.2 | ✅ | bullet | تفاصيل القيد - يوم | 283 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.3.3 | ✅ | bullet | البحث والفلترة - يوم | 284 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.3.4 | ✅ | bullet | التصديق على القيود - يوم | 285 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.3.5 | ✅ | bullet | تصدير القيود - يوم | 286 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.3.6 | ✅ | bullet | تقرير يومي - يوم | 287 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |

## 📋 ملف المهام الشامل - المرحلة 1 > المهمة 4: بناء وحدة الربط المحاسبي التلقائي > ✅ المهام الفرعية: > 4.4: تطوير واجهة "مطابقة الإيداعات البنكية"

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 4.4.1 | ⚠️ | bullet | تطوير شاشة المطابقة - يومان | 296 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.4.2 | ✅ | bullet | عرض الإيداعات غير المطابقة - يوم | 297 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.4.3 | ✅ | bullet | عرض الفواتير المفتوحة - يوم | 298 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.4.4 | ✅ | bullet | ربط يدوي - يوم | 299 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.4.5 | ✅ | bullet | إنشاء قيد تلقائي - يوم | 300 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.4.6 | ✅ | bullet | تقرير المطابقة - يوم | 301 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |

## ملحق: تحليل وتصميم التكامل مع منصة ACREL للعدادات الذكية (IoT) > ACREL IoT Integration Module - Strategic Analysis > 📋 المهام المطلوبة: > المهمة 1: الحصول على وصول للـ API والتوثيق

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 1.1 | ❌ | table | تقديم طلب رسمي لـ Acrel \| طلب وثائق API \| عالية جداً \| يوم | 395 |  |  |
| 1.2 | ❌ | table | الحصول على API Keys \| مفاتيح الوصول \| عالية جداً \| يومان | 396 |  |  |
| 1.3 | ❌ | table | الحصول على بيئة اختبار \| Sandbox/Testing Environment \| عالية جداً \| يومان | 397 |  |  |
| 1.4 | ❌ | table | دراسة التوثيق \| فهم شامل للـ API \| عالية جداً \| 3 أيام | 398 |  |  |
| 1.5 | ❌ | table | اختبار الاتصال الأساسي \| التحقق من الوصول \| عالية جداً \| يوم | 399 |  |  |

## ملحق: تحليل وتصميم التكامل مع منصة ACREL للعدادات الذكية (IoT) > ACREL IoT Integration Module - Strategic Analysis > 📋 المهام المطلوبة: > المهمة 2: بناء وظائف "استقبال البيانات" (Data Ingestion)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 2.1 | ❌ | table | بناء وظيفة getMeterReadings() \| جلب قراءة عداد ADL200 \| عالية جداً \| يومان | 415 |  |  |
| 2.2 | ❌ | table | بناء وظيفة getInfrastructureMetrics() \| جلب بيانات عدادات ADW300 \| عالية جداً \| يومان | 416 |  |  |
| 2.3 | ❌ | table | برمجة مزامنة دورية (Periodic Sync) \| جلب البيانات كل بضع دقائق \| عالية جداً \| 3 أيام | 417 |  |  |
| 2.4 | ❌ | table | تطبيق Webhooks (إن أمكن) \| استقبال البيانات فوراً \| عالية \| يومان | 418 |  |  |
| 2.5 | ❌ | table | تخزين البيانات التاريخية \| حفظ البيانات للتحليل \| عالية \| يوم | 419 |  |  |
| 2.6 | ❌ | table | معالجة الأخطاء والاتصال \| إعادة محاولة في حالة الفشل \| عالية \| يوم | 420 |  |  |
| 2.7 | ❌ | table | مراقبة صحة الاتصال \| تنبيهات عند فشل المزامنة \| متوسطة \| يوم | 421 |  |  |

## جلب بيانات البنية التحتية > المهمة 3: بناء وظائف "إرسال الأوامر" (Command & Control)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.1 | ❌ | table | بناء وظيفة disconnectMeter() \| فصل الخدمة عن مشترك \| عالية جداً \| يومان | 459 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2 | ❌ | table | بناء وظيفة reconnectMeter() \| إعادة توصيل الخدمة \| عالية جداً \| يومان | 460 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3 | ❌ | table | بناء وظيفة setTariff() \| تغيير التعرفة عن بعد \| عالية \| يومان | 461 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.4 | ❌ | table | نظام تسجيل الأوامر \| تسجيل جميع الأوامر المرسلة \| عالية \| يوم | 462 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.5 | ❌ | table | نظام التحقق من تنفيذ الأمر \| التأكد من تنفيذ الأمر بنجاح \| عالية \| يوم | 463 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.6 | ❌ | table | معالجة الأخطاء والإعادة \| إعادة محاولة في حالة الفشل \| عالية \| يوم | 464 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.7 | ❌ | table | نظام الموافقات (Approvals) \| موافقة يدوية قبل تنفيذ أوامر حساسة \| عالية \| يوم | 465 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## تغيير التعرفة > المهمة 4: دمج بيانات IoT في عمليات النظام

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 4.1 | ❌ | table | ربط الفوترة ببيانات ADL200 \| استخدام القراءات الفعلية \| عالية جداً \| يومان | 507 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2 | ❌ | table | برمجة منطق الفصل التلقائي \| فصل تلقائي للمتأخرين \| عالية جداً \| يومان | 508 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.3 | ❌ | table | برمجة منطق الوصل التلقائي \| وصل تلقائي عند السداد \| عالية جداً \| يومان | 509 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.4 | ❌ | table | تطوير لوحة تحكم المحطة \| عرض البيانات الحية من ADW300 \| عالية جداً \| 3 أيام | 510 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.5 | ❌ | table | بناء نظام التنبيهات \| إشعارات عند حدوث مشاكل \| عالية \| يومان | 511 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.6 | ❌ | table | تطوير تقارير الأداء \| تقارير شاملة للأداء \| متوسطة \| يومان | 512 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |

## تغيير التعرفة > 📊 الشاشات والتقارير المطلوبة:

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 1 | ❌ | table | لوحة تحكم المحطة (Station Dashboard) \| عرض البيانات الحية \| عالية جداً | 602 |  |  |
| 2 | ❌ | table | إدارة الفصل والوصل (Disconnect/Reconnect) \| واجهة للفصل والوصل \| عالية جداً | 603 |  |  |
| 3 | ❌ | table | سجل الأوامر (Commands Log) \| تاريخ جميع الأوامر \| عالية | 604 |  |  |
| 4 | ❌ | table | نظام التنبيهات (Alerts System) \| عرض التنبيهات \| عالية | 605 |  |  |
| 5 | ❌ | table | تقرير الأداء اليومي (Daily Performance Report) \| ملخص الأداء \| عالية | 606 |  |  |
| 6 | ❌ | table | تقرير الأداء الشهري (Monthly Performance Report) \| تحليل شامل \| متوسطة | 607 |  |  |
| 7 | ❌ | table | تقرير الإيرادات (Revenue Report) \| تحليل الإيرادات \| عالية | 608 |  |  |
| 8 | ❌ | table | مراقبة صحة الاتصال (Connection Health) \| حالة الاتصال مع Acrel \| متوسطة | 609 |  |  |

## تحديث حرج: تصحيح وتعميق فهم قدرات عدادات ACREL (WiFi + MQTT) > Critical Update: Advanced ACREL Meters Capabilities - WiFi & MQTT > 🔧 المهام المحدثة والمحسنة: > المهمة 3.1 (محدثة): الحصول على الوثائق الكاملة

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.1.1 | ❌ | table | وثائق API الكاملة \| جميع endpoints \| عالية جداً \| يوم | 765 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.2 | ❌ | table | توثيق بروتوكول MQTT \| بنية المواضيع والرسائل \| عالية جداً \| يوم | 766 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.3 | ❌ | table | قائمة الأوامر المدعومة \| جميع الأوامر المتاحة \| عالية جداً \| يوم | 767 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.4 | ❌ | table | صيغ البيانات (JSON) \| أمثلة على كل رسالة \| عالية جداً \| يوم | 768 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.5 | ❌ | table | أكواد الأخطاء \| معاني جميع الأخطاء \| عالية \| يوم | 769 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.1.6 | ❌ | table | حدود الأداء \| الحد الأقصى للرسائل \| عالية \| يوم | 770 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## تحديث حرج: تصحيح وتعميق فهم قدرات عدادات ACREL (WiFi + MQTT) > Critical Update: Advanced ACREL Meters Capabilities - WiFi & MQTT > 🔧 المهام المحدثة والمحسنة: > المهمة 3.2 (محسّنة): تطوير مستمع MQTT

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.2.1 | ⚠️ | table | إعداد MQTT Client \| مكتبة MQTT \| عالية جداً \| يوم | 780 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.2 | ⚠️ | table | الاتصال بخادم Acrel \| Connection Setup \| عالية جداً \| يوم | 781 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.3 | ⚠️ | table | الاشتراك في مواضيع البيانات \| Subscribe to Topics \| عالية جداً \| يوم | 782 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.4 | ⚠️ | table | معالجة الرسائل الواردة \| Parse & Process \| عالية جداً \| يومان | 783 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.5 | ❌ | table | تخزين البيانات في قاعدة البيانات \| Real-time Storage \| عالية جداً \| يوم | 784 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.6 | ❌ | table | التعامل مع فقدان الاتصال \| Reconnection Logic \| عالية \| يوم | 785 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2.7 | ❌ | table | تسجيل الأخطاء والتنبيهات \| Logging & Alerts \| عالية \| يوم | 786 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## تحديث حرج: تصحيح وتعميق فهم قدرات عدادات ACREL (WiFi + MQTT) > Critical Update: Advanced ACREL Meters Capabilities - WiFi & MQTT > 🔧 المهام المحدثة والمحسنة: > المهمة 3.3 (محسّنة): تطوير ناشر أوامر MQTT

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.3.1 | ⚠️ | table | بناء AcrelService Class \| خدمة مركزية \| عالية جداً \| يوم | 824 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.2 | ❌ | table | وظيفة disconnect() \| فصل الخدمة \| عالية جداً \| يوم | 825 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.3 | ❌ | table | وظيفة reconnect() \| إعادة الخدمة \| عالية جداً \| يوم | 826 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.4 | ❌ | table | وظيفة setTariff() \| تغيير التعرفة \| عالية \| يوم | 827 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.5 | ⚠️ | table | وظيفة getReading() \| قراءة فورية \| عالية \| يوم | 828 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.6 | ⚠️ | table | نظام تأكيد الأوامر \| Command Acknowledgment \| عالية \| يوم | 829 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3.7 | ⚠️ | table | معالجة الأخطاء \| Error Handling \| عالية \| يوم | 830 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## تحديث حرج: تصحيح وتعميق فهم قدرات عدادات ACREL (WiFi + MQTT) > Critical Update: Advanced ACREL Meters Capabilities - WiFi & MQTT > 🔧 المهام المحدثة والمحسنة: > المهمة 3.4 (جديدة): تطوير وحدة تحليل جودة الطاقة

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.4.1 | ❌ | table | حساب مؤشرات الجودة \| THD, Unbalance, etc \| عالية \| يومان | 876 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.4.2 | ❌ | table | تطوير لوحة تحكم فنية \| Dashboard للمهندسين \| عالية \| يومان | 877 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.4.3 | ❌ | table | رسوم بيانية التوافقيات \| Harmonics Charts \| عالية \| يوم | 878 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.4.4 | ❌ | table | تنبيهات جودة الطاقة \| Quality Alerts \| عالية \| يوم | 879 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.4.5 | ❌ | table | تقارير جودة الطاقة \| Quality Reports \| متوسطة \| يوم | 880 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.4.6 | ❌ | table | توصيات التحسين \| Recommendations \| متوسطة \| يوم | 881 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## تحديث حرج: تصحيح وتعميق فهم قدرات عدادات ACREL (WiFi + MQTT) > Critical Update: Advanced ACREL Meters Capabilities - WiFi & MQTT > 🔧 المهام المحدثة والمحسنة: > المهمة 3.5 (جديدة): دعم الميزات الإضافية

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.5.1 | ❌ | table | اجتماع تحليل الميزات \| مناقشة الميزات الجديدة \| عالية جداً \| يوم | 897 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.5.2 | ❌ | table | توثيق الميزات \| توثيق شامل \| عالية جداً \| يوم | 898 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.5.3 | ❌ | table | تطوير الدعم البرمجي \| Implementation \| عالية جداً \| يومان | 899 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.5.4 | ❌ | table | اختبار الميزات \| Testing \| عالية \| يوم | 900 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.5.5 | ❌ | table | توثيق المستخدم \| User Documentation \| متوسطة \| يوم | 901 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## تحديث معماري حرج: منصة ACREL IoT-EMS محلية (On-Premise) > Critical Architecture Update: On-Premise ACREL IoT-EMS > 🎯 المهام المحدثة للمرحلة 1: > المهمة 1: فهم API منصة ACREL IoT-EMS (محدثة)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 1.1 | ❌ | table | الحصول على وثائق API \| توثيق كامل للـ API \| عالية جداً \| يوم | 1117 |  |  |
| 1.2 | ❌ | table | الحصول على بيئة اختبار \| Access to Test Environment \| عالية جداً \| يوم | 1118 |  |  |
| 1.3 | ❌ | table | دراسة الـ API \| فهم شامل للـ Endpoints \| عالية جداً \| 3 أيام | 1119 |  |  |
| 1.4 | ❌ | table | اختبار الاتصال \| Test Connection \| عالية جداً \| يوم | 1120 |  |  |
| 1.5 | ❌ | table | توثيق الـ API \| توثيق داخلي \| عالية \| يوم | 1121 |  |  |

## تحديث معماري حرج: منصة ACREL IoT-EMS محلية (On-Premise) > Critical Architecture Update: On-Premise ACREL IoT-EMS > 🎯 المهام المحدثة للمرحلة 1: > المهمة 2: بناء SDK/Client للتكامل (جديدة)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 2.1 | ❌ | table | بناء AcrelClient Class \| عميل للتكامل مع API \| عالية جداً \| يومان | 1134 |  |  |
| 2.2 | ❌ | table | وظائف جلب البيانات \| getData(), getDevices(), etc \| عالية جداً \| يومان | 1135 |  |  |
| 2.3 | ❌ | table | وظائف التحكم \| controlRelay(), setTariff(), etc \| عالية جداً \| يومان | 1136 |  |  |
| 2.4 | ❌ | table | معالجة الأخطاء \| Error Handling \| عالية \| يوم | 1137 |  |  |
| 2.5 | ❌ | table | نظام إعادة المحاولة \| Retry Logic \| عالية \| يوم | 1138 |  |  |
| 2.6 | ❌ | table | التخزين المؤقت (Caching) \| Caching Layer \| متوسطة \| يوم | 1139 |  |  |

## تحديث معماري حرج: منصة ACREL IoT-EMS محلية (On-Premise) > Critical Architecture Update: On-Premise ACREL IoT-EMS > 🎯 المهام المحدثة للمرحلة 1: > المهمة 3: بناء Webhook Endpoint (جديدة)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.1 | ❌ | table | بناء Webhook Endpoint \| استقبال الإشعارات \| عالية جداً \| يوم | 1186 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2 | ❌ | table | التحقق من التوقيع \| Signature Verification \| عالية \| يوم | 1187 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.3 | ❌ | table | معالجة الإنذارات \| Process Alarms \| عالية جداً \| يومان | 1188 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.4 | ❌ | table | توجيه الإشعارات \| Route Notifications \| عالية \| يوم | 1189 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.5 | ❌ | table | تسجيل الأحداث \| Event Logging \| عالية \| يوم | 1190 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |

## تحديث معماري حرج: منصة ACREL IoT-EMS محلية (On-Premise) > Critical Architecture Update: On-Premise ACREL IoT-EMS > 🎯 المهام المحدثة للمرحلة 1: > المهمة 4: ربط الفوترة بالتحكم (محدثة)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 4.1 | ❌ | table | منطق الفصل التلقائي \| Automatic Disconnection \| عالية جداً \| يومان | 1226 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2 | ❌ | table | منطق الوصل التلقائي \| Automatic Reconnection \| عالية جداً \| يومان | 1227 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.3 | ❌ | table | نظام الموافقات \| Approval System \| عالية \| يوم | 1228 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.4 | ❌ | table | تسجيل الأوامر \| Command Logging \| عالية \| يوم | 1229 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.5 | ❌ | table | التحقق من تنفيذ الأمر \| Command Verification \| عالية \| يوم | 1230 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |

## تحديث معماري حرج: منصة ACREL IoT-EMS محلية (On-Premise) > Critical Architecture Update: On-Premise ACREL IoT-EMS > 🎯 المهام المحدثة للمرحلة 1: > المهمة 5: استكشاف التقارير المتاحة (جديدة)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 5.1 | ❌ | table | استكشاف التقارير \| Explore Available Reports \| متوسطة \| يوم | 1293 |  |  |
| 5.2 | ❌ | table | توثيق التقارير \| Document Reports \| متوسطة \| يوم | 1294 |  |  |
| 5.3 | ❌ | table | اختبار التقارير \| Test Reports \| متوسطة \| يوم | 1295 |  |  |
| 5.4 | ❌ | table | تحديد الفجوات \| Identify Gaps \| متوسطة \| يوم | 1296 |  |  |
| 5.5 | ❌ | table | تخطيط التقارير الإضافية \| Plan Custom Reports \| متوسطة \| يوم | 1297 |  |  |

## المهمة 6: إدارة الدعم الحكومي والحصص المدعومة > 📋 المهام الفرعية: > 6.1: تعديل ملف المشترك لدعم البرامج المدعومة

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 6.1.1 | ❌ | bullet | إضافة حقول جديدة في قاعدة البيانات | 1448 |  |  |
| 6.1.2 | ❌ | bullet | تطوير واجهة إدارة الدعم | 1457 |  |  |
| 6.1.3 | ❌ | bullet | إضافة تحقق من البيانات | 1463 |  |  |

## API لتحديث الدعم > 6.2: بناء وحدة التحكم في حصص الاستهلاك (Quota Control Module)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 6.2.1 | ❌ | bullet | برمجة Scheduled Job | 1510 |  |  |
| 6.2.2 | ❌ | bullet | منطق الشحن الشهري | 1515 |  |  |
| 6.2.3 | ❌ | bullet | معالجة الأخطاء والاستثناءات | 1520 |  |  |
| 6.2.4 | ❌ | bullet | تسجيل العمليات | 1525 |  |  |

## جدولة المهمة > 6.3: أتمتة إعداد تقارير صندوق الدعم

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 6.3.1 | ❌ | bullet | جمع بيانات الاستهلاك | 1636 |  |  |
| 6.3.2 | ❌ | bullet | إنشاء التقارير | 1641 |  |  |
| 6.3.3 | ❌ | bullet | إرسال التقارير | 1646 |  |  |
| 6.3.4 | ❌ | bullet | تسجيل العمليات | 1651 |  |  |

## جدولة المهمة > 6.4: دمج آلية الشحن الإضافي

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 6.4.1 | ❌ | bullet | تعديل واجهة شحن الرصيد | 1790 |  |  |
| 6.4.2 | ❌ | bullet | معالجة الدفع الإضافي | 1795 |  |  |
| 6.4.3 | ❌ | bullet | تحديث الحصة | 1800 |  |  |

## جدولة المهمة > 📊 الشاشات المطلوبة:

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 6.1 | ❌ | table | إدارة الدعم \| إضافة/تعديل برنامج الدعم \| عالية جداً | 1878 |  |  |
| 6.2 | ❌ | table | ملف المشترك - قسم الدعم \| عرض/تعديل بيانات الدعم \| عالية جداً | 1879 |  |  |
| 6.3 | ❌ | table | تقارير الدعم \| عرض تقارير الاستهلاك \| عالية | 1880 |  |  |
| 6.4 | ❌ | table | سجل الشحن \| عرض سجل عمليات الشحن \| متوسطة | 1881 |  |  |
| 6.5 | ❌ | table | الشحن الإضافي \| شراء رصيد إضافي \| عالية | 1882 |  |  |
| 7.1 | ❌ | table | لوحة مراقبة الدعم \| عرض حالة جميع المشتركين المدعومين \| عالية جداً | 2370 |  |  |
| 7.2 | ❌ | table | تفاصيل المشترك \| عرض الاستهلاك والديون \| عالية جداً | 2371 |  |  |
| 7.3 | ❌ | table | تقارير الديون \| تقارير الديون المتراكمة \| عالية | 2372 |  |  |
| 7.4 | ❌ | table | سجل الإشعارات \| عرض الإشعارات المرسلة \| متوسطة | 2373 |  |  |
| 7.5 | ❌ | table | تقارير الصندوق \| تقارير الاستهلاك المدعوم \| عالية | 2374 |  |  |

## المهمة 7: دعم المرحلة الانتقالية للمشتركين المدعومين على العدادات التقليدية > 📋 المهام الفرعية: > 7.1: لوحة مراقبة استهلاك الدعم (Subsidy Consumption Dashboard)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 7.1.1 | ❌ | bullet | تصميم قاعدة البيانات | 1979 |  |  |
| 7.1.2 | ❌ | bullet | واجهة اللوحة | 1984 |  |  |
| 7.1.3 | ❌ | bullet | مؤشرات بصرية | 1994 |  |  |
| 7.1.4 | ❌ | bullet | وظائف إضافية | 2002 |  |  |

## API للحصول على بيانات اللوحة > 7.2: نظام الإشعارات الاستباقية (Proactive Notification System)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 7.2.1 | ❌ | bullet | برمجة مهمة مجدولة يومية | 2106 |  |  |
| 7.2.2 | ❌ | bullet | إشعارات اقتراب انتهاء الحصة (90%) | 2112 |  |  |
| 7.2.3 | ❌ | bullet | إشعارات التجاوز (&gt; 100%) | 2117 |  |  |
| 7.2.4 | ❌ | bullet | تنبيهات داخلية للموظفين | 2122 |  |  |

## جدولة المهمة > 7.3: تكييف نظام الفوترة للتعامل مع الديون

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 7.3.1 | ❌ | bullet | فصل الاستهلاك | 2250 |  |  |
| 7.3.2 | ❌ | bullet | إنشاء فواتير منفصلة | 2254 |  |  |
| 7.3.3 | ❌ | bullet | تتبع المديونية | 2258 |  |  |
| 7.3.4 | ❌ | bullet | تقارير الديون | 2263 |  |  |

## المهمة 8: بناء وحدة إدارة المخزون الشاملة > 📋 المهام الفرعية: > 8.1: كتالوج الأصناف (Item Catalog)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.1.1 | ✅ | bullet | تصميم جدول الأصناف | 2485 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.1.2 | ✅ | bullet | واجهة إضافة أصناف جديدة | 2495 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.1.3 | ✅ | bullet | تقارير الأصناف | 2501 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |

## API لإضافة صنف جديد > 8.2: إدارة المخزون المتقدمة (Advanced Inventory Management)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.2.1 | ❌ | bullet | جدول تتبع الأصناف الفردية | 2553 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.2 | ❌ | bullet | واجهة استقبال المخزون | 2563 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.3 | ❌ | bullet | واجهة الصرف من المخزون | 2569 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.4 | ✅ | bullet | تقارير المخزون | 2575 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |

## API لصرف مخزون > 8.3: إدارة أوامر الشراء (Purchase Order Management)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.3.1 | ✅ | bullet | إنشاء أمر شراء | 2698 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.3.2 | ✅ | bullet | تتبع أمر الشراء | 2704 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.3.3 | ⚠️ | bullet | استقبال أمر الشراء | 2709 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |

## API لإنشاء أمر شراء > 8.4: تطبيق الفني الميداني (Field Technician App)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.4.1 | ❌ | bullet | قائمة المهام | 2774 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.4.2 | ❌ | bullet | توثيق التركيب | 2779 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.4.3 | ❌ | bullet | تحديث الحالة | 2786 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.4.4 | ❌ | bullet | التوقيع الرقمي | 2791 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |

## API لتحديث حالة التركيب > 📊 الشاشات المطلوبة:

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.1 | ❌ | table | كتالوج الأصناف \| إدارة الأصناف المخزنية \| عالية جداً | 2878 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2 | ❌ | table | استقبال المخزون \| مسح واستقبال الأصناف \| عالية جداً | 2879 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.3 | ❌ | table | صرف المخزون \| صرف الأصناف للمحطات \| عالية جداً | 2880 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.4 | ❌ | table | تقارير المخزون \| حالة المخزون الحالية \| عالية | 2881 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.5 | ❌ | table | أوامر الشراء \| إدارة أوامر الشراء \| عالية | 2882 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.6 | ❌ | table | تطبيق الفني \| توثيق التركيب الميداني \| عالية جداً | 2883 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |

## المهمة 9: وحدة إدارة الصيانة والاستبدال > 📋 المهام الفرعية: > 9.1: نموذج طلب الصيانة (Maintenance Work Order)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 9.1.1 | ✅ | bullet | تصميم قاعدة البيانات | 2971 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.1.2 | ✅ | bullet | واجهة إنشاء الطلب | 2983 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.1.3 | ✅ | bullet | واجهة إدارة الطلبات | 2990 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |

## API لإسناد طلب صيانة > 9.2: تحديث تطبيق الفني الميداني (Field Technician App Enhancement)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 9.2.1 | ❌ | bullet | قائمة طلبات الصيانة | 3086 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.2.2 | ❌ | bullet | واجهة الاستبدال | 3091 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.2.3 | ❌ | bullet | توثيق الاستبدال | 3098 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.2.4 | ❌ | bullet | إدارة المخزون الميداني | 3104 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |

## API لتحديث المكون (استبدال) > 9.3: منطق التحديث التلقائي (Automatic Update Logic)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 9.3.1 | ❌ | bullet | تحديث ملف المشترك | 3193 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.3.2 | ❌ | bullet | تحديث سجلات المخزون | 3198 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.3.3 | ❌ | bullet | تحديث السجلات المحاسبية | 3203 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.3.4 | ❌ | bullet | إرسال إشعارات | 3208 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |

## API لتحديث المكون (استبدال) > 9.4: إدارة المكونات التالفة (Defective Components Management)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 9.4.1 | ❌ | bullet | تسجيل المكونات التالفة | 3284 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.4.2 | ❌ | bullet | تقييم المكونات التالفة | 3289 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.4.3 | ❌ | bullet | إدارة المخزون التالف | 3294 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.4.4 | ❌ | bullet | تقارير المكونات التالفة | 3299 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |

## API لتحديث المكون (استبدال) > 📊 الشاشات المطلوبة:

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 9.1 | ❌ | table | طلبات الصيانة \| إنشاء وإدارة الطلبات \| عالية جداً | 3310 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.2 | ❌ | table | تطبيق الفني - الصيانة \| توثيق الاستبدال \| عالية جداً | 3311 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.3 | ❌ | table | سجل الاستبدال \| تاريخ الاستبدالات \| عالية | 3312 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.4 | ❌ | table | المكونات التالفة \| إدارة المكونات التالفة \| متوسطة | 3313 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.5 | ❌ | table | تقارير الصيانة \| تقارير الصيانة والتكاليف \| عالية | 3314 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |

## API لصرف المواد > 📊 الشاشات المطلوبة (تحديث):

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 7.2 | ❌ | table | إدارة المخزون \| إضافة شاشات STS \| عالية جداً | 3917 |  |  |
| 8.3 | ❌ | table | تطبيق الفني \| تسليم الشاشة \| عالية جداً | 3918 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 9.2 | ❌ | table | الصيانة \| استبدال الشاشة \| عالية جداً | 3919 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |

## مثال على البيانات الأولية > 8.2.2: واجهة إدارة قواعد التسعير (Pricing Rules Management)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.2.2.1 | ❌ | bullet | عرض جميع قواعس التسعير | 4081 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.2.2 | ❌ | bullet | إضافة قاعدة تسعير جديدة | 4082 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.2.3 | ❌ | bullet | تعديل قاعدة تسعير موجودة | 4083 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.2.4 | ❌ | bullet | تفعيل/تعطيل قاعدة تسعير | 4084 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.2.5 | ❌ | bullet | عرض السجل التاريخي للتغييرات | 4085 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |

## API لتحديث قاعدة تسعير > 8.2.5: واجهة التسجيل المحدثة (Updated Registration Interface)

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.2.5.1 | ❌ | bullet | عند اختيار "نوع العداد" و "نوع الاستخدام"، يعرض النظام التكاليف تلقائياً | 4434 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.5.2 | ❌ | bullet | إخفاء حقول التأمين إذا كان نوع العداد STS | 4435 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.5.3 | ❌ | bullet | عرض تفصيل الفاتورة قبل الحفظ | 4436 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.5.4 | ❌ | bullet | تأكيد المستخدم قبل إنشاء الفاتورة | 4437 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |

## API لتحديث قاعدة تسعير > 📊 الشاشات المطلوبة (تحديث):

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.2.1 | ❌ | table | إدارة قواعس التسعير \| إنشاء وتعديل القواعس \| عالية جداً | 4473 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.2 | ❌ | table | نموذج التسجيل المحدث \| عرض التكاليف تلقائياً \| عالية جداً | 4474 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2.3 | ❌ | table | تفصيل الفاتورة \| عرض بنود الفاتورة \| عالية | 4475 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |

## API لعرض إحصائيات المستودعات > 📊 الشاشات المطلوبة (تحديث):

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 10.4 | ❌ | table | معالج استبدال العداد \| تقدير واستبدال تلقائي \| عالية جداً | 5049 |  |  |
| 10.5 | ❌ | table | معالج ترقية الاشتراك \| ترقية ذكية مع إلغاء تأمين \| عالية جداً | 5050 |  |  |
| 7.4 | ❌ | table | إدارة المستودعات \| نقل الأصناف بين المستودعات \| عالية | 5051 |  |  |
| 7.5 | ❌ | table | إحصائيات المستودعات \| عرض حالة المخزون \| متوسطة | 5052 |  |  |

## API لإتمام أمر العمل > 🔄 التحديثات الحاسمة من المراجعات (Critical Updates - Files 13, 14, 15) > تحديث 1: إعادة هيكلة وتنظيم المهام على الأنظمة الصحيحة > **النظام 1: نظام إدارة المخزون (Inventory Management System)**

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 7.1 | ❌ | table | كتالوج الأصناف \| تطوير كتالوج شامل (عدادات، شاشات STS، أختام، قواطع) | 5651 |  |  |
| 7.2 | ❌ | table | إدارة المخزون \| شاشة إدارة المخزون مع تتبع الرقم التسلسلي | 5652 |  |  |
| 7.3 | ❌ | table | طلب وصرف المواد \| شاشة رقمية لطلب وصرف المواد | 5653 |  |  |
| 7.4 | ❌ | table | المستودعات الافتراضية \| إنشاء مستودعات (جديد، مستعمل، تالف) | 5654 |  |  |

## API لإتمام أمر العمل > 🔄 التحديثات الحاسمة من المراجعات (Critical Updates - Files 13, 14, 15) > تحديث 1: إعادة هيكلة وتنظيم المهام على الأنظمة الصحيحة > **النظام 2: نظام إدارة علاقات العملاء والفوترة (CRM & Billing System)**

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 1.3 | ❌ | table | إدارة المحطات \| واجهات أساسية لإدارة المحطات (المستأجرين) | 5664 |  |  |
| 1.4 | ❌ | table | إدارة المشتركين \| وحدة أساسية لإدارة ملفات المشتركين والعدادات | 5665 |  |  |
| 2.1 | ❌ | table | فوترة العدادات التقليدية \| أتمتة الفوترة (وظيفة مجدولة) | 5666 |  |  |
| 2.3 | ❌ | table | بوابات الدفع الإلكتروني \| وحدة التكامل مع بوابات الدفع | 5667 |  |  |
| 2.4 | ❌ | table | SMS/WhatsApp \| وحدة التكامل مع خدمات الإشعارات | 5668 |  |  |
| 8.1 | ❌ | table | نموذج طلب الاشتراك \| نموذج رقمي (استبدال العقد الورقي) | 5669 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 8.2 | ❌ | table | محرك التسعير \| محرك تسعير مرن لحساب الرسوم والتأمين | 5670 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 9.1 | ❌ | table | ربط التأمين \| ربط مبلغ التأمين بملف المشترك المالي | 5671 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |
| 9.2 | ❌ | table | مراقبة المديونية \| نظام مراقبة المديونية مقابل التأمين | 5672 | `server/maintenanceRouter.ts`<br/>`client/src/pages/maintenance/*` |  |

## API لإتمام أمر العمل > 🔄 التحديثات الحاسمة من المراجعات (Critical Updates - Files 13, 14, 15) > تحديث 1: إعادة هيكلة وتنظيم المهام على الأنظمة الصحيحة > **النظام 3: نظام إدارة الصيانة الميدانية (Field Service Management System)**

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 8.3 | ❌ | table | تطبيق الفني الميداني \| تطوير تطبيق الفني مع سير عمل التركيب الجديد | 5682 | `server/inventoryRouter.ts`<br/>`client/src/pages/inventory/*` |  |
| 10.1 | ❌ | table | نموذج طلب الصيانة \| نموذج طلب صيانة/استبدال (أمر العمل) | 5683 |  |  |
| 10.2 | ❌ | table | سير عمل الاستبدال \| تحديث التطبيق لدعم سير عمل الاستبدال والصيانة | 5684 |  |  |
| 10.4 | ❌ | table | معالج الاستبدال \| دمج معالج استبدال العداد التالف (مع حساب الاستهلاك التقديري) | 5685 |  |  |
| 10.5 | ❌ | table | معالج الترقية \| دمج معالج ترقية نوع الاشتراك | 5686 |  |  |

## API لإتمام أمر العمل > 🔄 التحديثات الحاسمة من المراجعات (Critical Updates - Files 13, 14, 15) > تحديث 1: إعادة هيكلة وتنظيم المهام على الأنظمة الصحيحة > **النظام 4: النظام المحاسبي المتكامل (Integrated Accounting System)**

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 4.1 | ❌ | table | شجرة الحسابات \| تصميم شجرة حسابات شاملة (40+ حساب) | 5696 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.2 | ❌ | table | محرك القيود \| برمجة آلية إنشاء القيود (فردية ومجمعة) | 5697 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.3 | ❌ | table | عرض القيود \| واجهة عرض قيود اليومية | 5698 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |
| 4.4 | ❌ | table | مطابقة البنك \| واجهة مطابقة الإيداعات البنكية | 5699 | `server/accountingRouter.ts`<br/>`client/src/pages/accounting/*`<br/>`server/customSystemRouter.ts`<br/>`client/src/pages/custom/*` |  |

## API لإتمام أمر العمل > 🔄 التحديثات الحاسمة من المراجعات (Critical Updates - Files 13, 14, 15) > تحديث 1: إعادة هيكلة وتنظيم المهام على الأنظمة الصحيحة > **النظام 5: وحدات التكامل مع الأنظمة الخارجية (Integration Modules)**

| ID | Status | Type | Task | Blueprint line | Evidence | Notes |
|---:|:------:|:-----|:-----|--------------:|:---------|:------|
| 3.1 | ❌ | table | تكامل STS \| وحدة التكامل مع النظام الوسيط لعدادات STS | 5709 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 3.2 | ❌ | table | تكامل IoT \| وحدة التكامل مع منصة Acrel IoT-EMS | 5710 | `drizzle/schema.ts`<br/>`server/customerSystemRouter.ts` |  |
| 5 | ❌ | table | الدعم الحكومي \| وحدة إدارة الدعم الحكومي | 5711 |  |  |
