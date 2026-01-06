# خطة تنفيذ المهام الحرجة - Critical Tasks Implementation Plan

**تاريخ الإنشاء:** 29 ديسمبر 2024  
**الغرض:** توثيق أماكن إضافة المهام الحرجة المتبقية في النظام

---

## 📍 المهمة 3: أتمتة عدادات STS (Smart Token System)

### البنية المقترحة:

#### 1. قاعدة البيانات (Database)
**الموقع:** `drizzle/schemas/sts.ts` (ملف جديد)

**الجداول المطلوبة:**
- `sts_meters` - عدادات STS
- `sts_transactions` - معاملات الشحن
- `sts_tokens` - التوكنات المُنشأة
- `sts_api_config` - إعدادات API مقدم الخدمة
- `sts_charge_requests` - طلبات الشحن
- `sts_charge_responses` - استجابات الشحن

#### 2. Backend API
**الموقع:** `server/stsRouter.ts` (ملف جديد)

**الـ Routers المطلوبة:**
```typescript
sts: router({
  // إدارة العدادات STS
  meters: router({
    list: protectedProcedure.query(...),
    create: protectedProcedure.mutation(...),
    update: protectedProcedure.mutation(...),
    linkToCustomer: protectedProcedure.mutation(...),
  }),
  
  // شحن الرصيد
  charging: router({
    createCharge: protectedProcedure.mutation(...),
    getToken: protectedProcedure.query(...),
    verifyCharge: protectedProcedure.mutation(...),
  }),
  
  // التكامل مع API مقدم الخدمة
  api: router({
    testConnection: adminProcedure.mutation(...),
    syncMeters: adminProcedure.mutation(...),
    getMeterStatus: protectedProcedure.query(...),
  }),
  
  // التقارير
  reports: router({
    getChargingHistory: protectedProcedure.query(...),
    getTokenUsage: protectedProcedure.query(...),
  }),
})
```

**التسجيل في:** `server/routers.ts`
```typescript
import { stsRouter } from "./stsRouter";

export const appRouter = router({
  // ... existing routers
  sts: stsRouter,
});
```

#### 3. Frontend Pages
**الموقع:** `client/src/pages/sts/` (مجلد جديد)

**الصفحات المطلوبة:**
- `STSManagement.tsx` - إدارة عدادات STS
- `STSCharging.tsx` - شاشة شحن الرصيد
- `STSTokens.tsx` - عرض وإدارة التوكنات
- `STSIntegration.tsx` - إعدادات التكامل مع API
- `STSReports.tsx` - تقارير الشحن

#### 4. إضافة في القائمة الجانبية
**الموقع:** `client/src/pages/Dashboard.tsx`

```typescript
// في القائمة الجانبية
{
  name: "عدادات STS",
  icon: Smartphone,
  path: "/dashboard/sts",
  children: [
    { name: "إدارة العدادات", path: "/dashboard/sts/meters" },
    { name: "شحن الرصيد", path: "/dashboard/sts/charging" },
    { name: "التوكنات", path: "/dashboard/sts/tokens" },
    { name: "إعدادات API", path: "/dashboard/sts/integration" },
    { name: "التقارير", path: "/dashboard/sts/reports" },
  ]
}
```

---

## 📍 المهمة 6: إدارة الدعم الحكومي (Government Support)

### البنية المقترحة:

#### 1. قاعدة البيانات (Database)
**الموقع:** `drizzle/schemas/government-support.ts` (ملف جديد)

**الجداول المطلوبة:**
- `government_support_customers` - بيانات الدعم للمشتركين
- `government_support_quotas` - الحصص الشهرية
- `government_support_consumption` - استهلاك الدعم
- `government_support_reports` - تقارير صندوق الدعم
- `government_support_settings` - إعدادات الدعم

#### 2. Backend API
**الموقع:** `server/governmentSupportRouter.ts` (ملف جديد)

**الـ Routers المطلوبة:**
```typescript
governmentSupport: router({
  // إدارة بيانات الدعم
  customers: router({
    list: protectedProcedure.query(...),
    update: protectedProcedure.mutation(...),
    getQuota: protectedProcedure.query(...),
  }),
  
  // إدارة الحصص
  quotas: router({
    list: protectedProcedure.query(...),
    create: adminProcedure.mutation(...),
    update: adminProcedure.mutation(...),
    calculateMonthly: adminProcedure.mutation(...),
  }),
  
  // تتبع الاستهلاك
  consumption: router({
    track: protectedProcedure.mutation(...),
    getHistory: protectedProcedure.query(...),
    getRemaining: protectedProcedure.query(...),
  }),
  
  // التقارير
  reports: router({
    getMonthlyReport: protectedProcedure.query(...),
    getFundReport: adminProcedure.query(...),
    exportReport: adminProcedure.query(...),
  }),
})
```

**التسجيل في:** `server/routers.ts`
```typescript
import { governmentSupportRouter } from "./governmentSupportRouter";

export const appRouter = router({
  // ... existing routers
  governmentSupport: governmentSupportRouter,
});
```

#### 3. Frontend Pages
**الموقع:** `client/src/pages/government-support/` (مجلد جديد)

**الصفحات المطلوبة:**
- `GovernmentSupportDashboard.tsx` - لوحة تحكم الدعم
- `SupportCustomers.tsx` - إدارة بيانات الدعم للمشتركين
- `QuotasManagement.tsx` - إدارة الحصص الشهرية
- `ConsumptionTracking.tsx` - تتبع استهلاك الدعم
- `SupportReports.tsx` - تقارير صندوق الدعم

#### 4. إضافة في القائمة الجانبية
**الموقع:** `client/src/pages/Dashboard.tsx`

```typescript
// في القائمة الجانبية - تحت Customers
{
  name: "الدعم الحكومي",
  icon: Shield,
  path: "/dashboard/government-support",
  children: [
    { name: "لوحة التحكم", path: "/dashboard/government-support/dashboard" },
    { name: "بيانات الدعم", path: "/dashboard/government-support/customers" },
    { name: "الحصص", path: "/dashboard/government-support/quotas" },
    { name: "تتبع الاستهلاك", path: "/dashboard/government-support/consumption" },
    { name: "التقارير", path: "/dashboard/government-support/reports" },
  ]
}
```

---

## 📍 المهمة 7: دعم المرحلة الانتقالية (Transition Support)

### البنية المقترحة:

#### 1. قاعدة البيانات (Database)
**الموقع:** `drizzle/schemas/transition-support.ts` (ملف جديد)

**الجداول المطلوبة:**
- `transition_support_monitoring` - مراقبة استهلاك الدعم
- `transition_support_notifications` - الإشعارات الاستباقية
- `transition_support_billing_adjustments` - تعديلات الفوترة
- `transition_support_alerts` - التنبيهات

#### 2. Backend API
**الموقع:** `server/transitionSupportRouter.ts` (ملف جديد)

**الـ Routers المطلوبة:**
```typescript
transitionSupport: router({
  // لوحة المراقبة
  monitoring: router({
    getDashboard: protectedProcedure.query(...),
    getConsumptionTrend: protectedProcedure.query(...),
    getAlerts: protectedProcedure.query(...),
  }),
  
  // الإشعارات
  notifications: router({
    list: protectedProcedure.query(...),
    create: adminProcedure.mutation(...),
    send: adminProcedure.mutation(...),
  }),
  
  // تعديلات الفوترة
  billing: router({
    adjustInvoice: adminProcedure.mutation(...),
    getAdjustments: protectedProcedure.query(...),
    applyTransitionRules: adminProcedure.mutation(...),
  }),
})
```

**التسجيل في:** `server/routers.ts`
```typescript
import { transitionSupportRouter } from "./transitionSupportRouter";

export const appRouter = router({
  // ... existing routers
  transitionSupport: transitionSupportRouter,
});
```

#### 3. Frontend Pages
**الموقع:** `client/src/pages/transition-support/` (مجلد جديد)

**الصفحات المطلوبة:**
- `TransitionDashboard.tsx` - لوحة مراقبة استهلاك الدعم
- `NotificationsManagement.tsx` - إدارة الإشعارات
- `BillingAdjustments.tsx` - تعديلات الفوترة
- `AlertsManagement.tsx` - إدارة التنبيهات

#### 4. إضافة في القائمة الجانبية
**الموقع:** `client/src/pages/Dashboard.tsx`

```typescript
// في القائمة الجانبية - تحت Customers
{
  name: "المرحلة الانتقالية",
  icon: TrendingUp,
  path: "/dashboard/transition-support",
  children: [
    { name: "لوحة المراقبة", path: "/dashboard/transition-support/dashboard" },
    { name: "الإشعارات", path: "/dashboard/transition-support/notifications" },
    { name: "تعديلات الفوترة", path: "/dashboard/transition-support/billing" },
    { name: "التنبيهات", path: "/dashboard/transition-support/alerts" },
  ]
}
```

---

## 📍 المهمة 5: تكامل ACREL IoT

### البنية المقترحة:

#### 1. قاعدة البيانات (Database)
**الموقع:** `drizzle/schemas/acrel-iot.ts` (ملف جديد)

**الجداول المطلوبة:**
- `acrel_devices` - أجهزة ACREL
- `acrel_readings` - قراءات ACREL
- `acrel_commands` - الأوامر المرسلة
- `acrel_api_config` - إعدادات API
- `acrel_sync_log` - سجل المزامنة

#### 2. Backend API
**الموقع:** `server/acrelRouter.ts` (ملف جديد)  
**أو إضافة في:** `server/scadaRouter.ts` (توسيع الموجود)

**الـ Routers المطلوبة:**
```typescript
acrel: router({
  // إدارة الأجهزة
  devices: router({
    list: protectedProcedure.query(...),
    sync: adminProcedure.mutation(...),
    getStatus: protectedProcedure.query(...),
  }),
  
  // القراءات
  readings: router({
    getLatest: protectedProcedure.query(...),
    getHistory: protectedProcedure.query(...),
    sync: adminProcedure.mutation(...),
  }),
  
  // الأوامر
  commands: router({
    disconnect: adminProcedure.mutation(...),
    reconnect: adminProcedure.mutation(...),
    setTariff: adminProcedure.mutation(...),
    getStatus: protectedProcedure.query(...),
  }),
  
  // التكامل
  integration: router({
    testConnection: adminProcedure.mutation(...),
    configure: adminProcedure.mutation(...),
    webhook: publicProcedure.mutation(...),
  }),
})
```

**التسجيل في:** `server/routers.ts`
```typescript
import { acrelRouter } from "./acrelRouter";

export const appRouter = router({
  // ... existing routers
  acrel: acrelRouter,
  // أو إضافة في scada router
});
```

#### 3. Frontend Pages
**الموقع:** `client/src/pages/scada/acrel/` (مجلد جديد تحت SCADA)

**الصفحات المطلوبة:**
- `AcrelDevices.tsx` - إدارة أجهزة ACREL
- `AcrelReadings.tsx` - قراءات ACREL
- `AcrelCommands.tsx` - إرسال الأوامر
- `AcrelIntegration.tsx` - إعدادات التكامل

#### 4. إضافة في القائمة الجانبية
**الموقع:** `client/src/pages/Dashboard.tsx`

```typescript
// في القائمة الجانبية - تحت SCADA
{
  name: "ACREL IoT",
  icon: Wifi,
  path: "/dashboard/scada/acrel",
  children: [
    { name: "الأجهزة", path: "/dashboard/scada/acrel/devices" },
    { name: "القراءات", path: "/dashboard/scada/acrel/readings" },
    { name: "الأوامر", path: "/dashboard/scada/acrel/commands" },
    { name: "التكامل", path: "/dashboard/scada/acrel/integration" },
  ]
}
```

---

## 📍 المهمة 2.3: تكامل بوابات الدفع (Payment Gateways)

### البنية المقترحة:

#### 1. قاعدة البيانات (Database)
**الموقع:** `drizzle/schemas/payment-gateways.ts` (ملف جديد)

**الجداول المطلوبة:**
- `payment_gateways` - بوابات الدفع
- `payment_transactions` - معاملات الدفع
- `payment_gateway_config` - إعدادات البوابة
- `payment_webhooks` - استقبال Webhooks

#### 2. Backend API
**الموقع:** `server/paymentGatewaysRouter.ts` (ملف جديد)  
**أو إضافة في:** `server/customerSystemRouter.ts` (توسيع الموجود)

**الـ Routers المطلوبة:**
```typescript
paymentGateways: router({
  // إدارة البوابات
  gateways: router({
    list: protectedProcedure.query(...),
    configure: adminProcedure.mutation(...),
    test: adminProcedure.mutation(...),
  }),
  
  // المعاملات
  transactions: router({
    create: protectedProcedure.mutation(...),
    getStatus: protectedProcedure.query(...),
    handleSuccess: publicProcedure.mutation(...),
    handleFailure: publicProcedure.mutation(...),
  }),
  
  // التحقق
  verification: router({
    verify: protectedProcedure.mutation(...),
    webhook: publicProcedure.mutation(...),
  }),
})
```

**التسجيل في:** `server/routers.ts`
```typescript
import { paymentGatewaysRouter } from "./paymentGatewaysRouter";

export const appRouter = router({
  // ... existing routers
  paymentGateways: paymentGatewaysRouter,
});
```

#### 3. Frontend Pages
**الموقع:** `client/src/pages/payments/gateways/` (مجلد جديد)

**الصفحات المطلوبة:**
- `PaymentGateways.tsx` - إدارة بوابات الدفع
- `PaymentProcessing.tsx` - معالجة الدفع
- `PaymentTransactions.tsx` - سجل المعاملات

#### 4. إضافة في القائمة الجانبية
**الموقع:** `client/src/pages/Dashboard.tsx`

```typescript
// في القائمة الجانبية - تحت Customers
{
  name: "بوابات الدفع",
  icon: CreditCard,
  path: "/dashboard/payments/gateways",
  children: [
    { name: "إدارة البوابات", path: "/dashboard/payments/gateways" },
    { name: "المعاملات", path: "/dashboard/payments/gateways/transactions" },
  ]
}
```

---

## 📍 المهمة 2.4: تكامل SMS/WhatsApp

### البنية المقترحة:

#### 1. قاعدة البيانات (Database)
**الموقع:** `drizzle/schemas/messaging.ts` (ملف جديد)  
**أو إضافة في:** `drizzle/schemas/notifications.ts` (توسيع الموجود)

**الجداول المطلوبة:**
- `sms_templates` - قوالب الرسائل
- `sms_messages` - الرسائل المرسلة
- `sms_providers` - مقدمي الخدمة
- `sms_delivery_log` - سجل التسليم

#### 2. Backend API
**الموقع:** `server/messagingRouter.ts` (ملف جديد)  
**أو إضافة في:** `server/notifications/` (توسيع الموجود)

**الـ Routers المطلوبة:**
```typescript
messaging: router({
  // القوالب
  templates: router({
    list: protectedProcedure.query(...),
    create: adminProcedure.mutation(...),
    update: adminProcedure.mutation(...),
  }),
  
  // الإرسال
  send: router({
    invoice: protectedProcedure.mutation(...),
    reminder: protectedProcedure.mutation(...),
    paymentConfirmation: protectedProcedure.mutation(...),
    custom: protectedProcedure.mutation(...),
  }),
  
  // إعادة المحاولة
  retry: router({
    list: protectedProcedure.query(...),
    retry: adminProcedure.mutation(...),
  }),
})
```

**التسجيل في:** `server/routers.ts`
```typescript
import { messagingRouter } from "./messagingRouter";

export const appRouter = router({
  // ... existing routers
  messaging: messagingRouter,
});
```

#### 3. Frontend Pages
**الموقع:** `client/src/pages/messaging/` (مجلد جديد)

**الصفحات المطلوبة:**
- `MessagingTemplates.tsx` - إدارة قوالب الرسائل
- `MessagingHistory.tsx` - سجل الرسائل
- `MessagingSettings.tsx` - إعدادات الإرسال

#### 4. إضافة في القائمة الجانبية
**الموقع:** `client/src/pages/Dashboard.tsx`

```typescript
// في القائمة الجانبية - تحت Settings أو Customers
{
  name: "الرسائل",
  icon: MessageSquare,
  path: "/dashboard/messaging",
  children: [
    { name: "القوالب", path: "/dashboard/messaging/templates" },
    { name: "سجل الرسائل", path: "/dashboard/messaging/history" },
    { name: "الإعدادات", path: "/dashboard/messaging/settings" },
  ]
}
```

---

## 📍 المهمة 2.2: تفعيل المهام المجدولة (Cron Jobs)

### البنية المقترحة:

#### 1. Backend
**الموقع:** `server/core/cron-jobs.ts` (ملف موجود - يحتاج تفعيل)

**المهام المطلوبة:**
```typescript
// تفعيل المهام الموجودة:
- generateInvoices (الفوترة التلقائية)
- calculateDepreciation (حساب الإهلاك)
- sendReminders (إرسال التذكيرات)
- syncAcrelData (مزامنة بيانات ACREL)
- processSTSCharges (معالجة شحنات STS)
```

**التفعيل:** استخدام مكتبة مثل `node-cron` أو `bull`

#### 2. إعدادات
**الموقع:** `server/core/cron-config.ts` (ملف جديد)

```typescript
export const cronConfig = {
  generateInvoices: {
    schedule: '0 0 1 * *', // أول يوم من كل شهر
    enabled: true,
  },
  // ... other jobs
};
```

---

## 📊 ملخص البنية المقترحة

### الملفات الجديدة المطلوبة:

#### Backend (server/):
1. `stsRouter.ts` - أتمتة عدادات STS
2. `governmentSupportRouter.ts` - إدارة الدعم الحكومي
3. `transitionSupportRouter.ts` - دعم المرحلة الانتقالية
4. `acrelRouter.ts` - تكامل ACREL IoT
5. `paymentGatewaysRouter.ts` - تكامل بوابات الدفع
6. `messagingRouter.ts` - تكامل SMS/WhatsApp
7. `core/cron-config.ts` - إعدادات المهام المجدولة

#### Frontend (client/src/pages/):
1. `sts/` - مجلد عدادات STS (5 صفحات)
2. `government-support/` - مجلد الدعم الحكومي (5 صفحات)
3. `transition-support/` - مجلد المرحلة الانتقالية (4 صفحات)
4. `scada/acrel/` - مجلد ACREL (4 صفحات)
5. `payments/gateways/` - مجلد بوابات الدفع (3 صفحات)
6. `messaging/` - مجلد الرسائل (3 صفحات)

#### Database (drizzle/schemas/):
1. `sts.ts` - جداول STS
2. `government-support.ts` - جداول الدعم الحكومي
3. `transition-support.ts` - جداول المرحلة الانتقالية
4. `acrel-iot.ts` - جداول ACREL
5. `payment-gateways.ts` - جداول بوابات الدفع
6. `messaging.ts` - جداول الرسائل

---

## 🎯 خطة التنفيذ المقترحة

### المرحلة 1: البنية الأساسية
1. إنشاء جداول قاعدة البيانات
2. إنشاء الـ Routers الأساسية
3. إضافة في `routers.ts`

### المرحلة 2: الواجهات الأساسية
1. إنشاء الصفحات الأساسية
2. إضافة في القائمة الجانبية
3. ربط الصفحات بالـ API

### المرحلة 3: الوظائف المتقدمة
1. التكاملات الخارجية
2. المهام المجدولة
3. التقارير

---

**ملاحظة:** يمكن البدء بأي مهمة حسب الأولوية. جميع المهام تتبع نفس النمط المعماري الموجود في النظام.

