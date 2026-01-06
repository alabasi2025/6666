# 🚀 محركات النظام الأساسية - Core Engines

**تاريخ الإنشاء:** 6 يناير 2026  
**الحالة:** ✅ **جاهز للاستخدام**

---

## 📋 **نظرة عامة**

هذا المجلد يحتوي على المحركات الخمسة الأساسية للنظام:

1. **محرك القيود المحاسبية التلقائي** (Auto Journal Engine)
2. **محرك التسوية المرن** (Reconciliation Engine)
3. **محرك التسعير المرن** (Pricing Engine)
4. **محرك الجدولة الوقائية** (Preventive Scheduling Engine)
5. **محرك الإسناد الذكي** (Smart Assignment Engine)

---

## 📁 **الملفات**

### **المحركات:**

| الملف | الوصف | الحالة |
|------|-------|--------|
| `auto-journal-engine.ts` | محرك القيود المحاسبية التلقائي | ✅ |
| `reconciliation-engine.ts` | محرك التسوية المرن | ✅ |
| `pricing-engine.ts` | محرك التسعير المرن | ✅ |
| `preventive-scheduling-engine.ts` | محرك الجدولة الوقائية | ✅ |
| `smart-assignment-engine.ts` | محرك الإسناد الذكي | ✅ |

### **الأنظمة المساعدة:**

| الملف | الوصف | الحالة |
|------|-------|--------|
| `cron-jobs.ts` | نظام Cron Jobs | ✅ |
| `engines-validation.ts` | نظام فحص الصحة | ✅ |

---

## 🚀 **الاستخدام السريع**

### **1. محرك القيود المحاسبية:**

```typescript
import { AutoJournalEngine } from "./core/auto-journal-engine";

// عند إنشاء فاتورة
await AutoJournalEngine.onInvoiceCreated({
  invoiceId: 123,
  businessId: 1,
  customerId: 456,
  amount: 1000,
  createdBy: 1,
});

// عند استلام دفعة
await AutoJournalEngine.onPaymentReceived({
  paymentId: 789,
  businessId: 1,
  customerId: 456,
  amount: 500,
  paymentMethod: "cash",
  createdBy: 1,
});
```

### **2. محرك التسعير:**

```typescript
import { PricingEngine } from "./core/pricing-engine";

// حساب السعر
const pricing = await PricingEngine.calculate(
  1, // businessId
  "sts", // meterType
  "residential" // usageType
);

console.log(pricing.subscriptionFee); // رسوم الاشتراك
console.log(pricing.depositAmount); // مبلغ التأمين
```

### **3. محرك الإسناد:**

```typescript
import { SmartAssignmentEngine } from "./core/smart-assignment-engine";

// إسناد مهمة طارئة
const assignment = await SmartAssignmentEngine.assignEmergencyTask({
  businessId: 1,
  taskLatitude: 24.7136,
  taskLongitude: 46.6753,
  taskType: "emergency",
});

console.log(assignment.assignedWorkerId); // الفني المخصص
console.log(assignment.distance); // المسافة بالكيلومتر
```

### **4. محرك الجدولة:**

```typescript
import { PreventiveSchedulingEngine } from "./core/preventive-scheduling-engine";

// جدولة الصيانة الوقائية
const result = await PreventiveSchedulingEngine.schedulePreventiveMaintenance(
  1, // businessId
  1 // userId
);

console.log(result.scheduled); // عدد أوامر العمل المجدولة
```

### **5. محرك التسوية:**

```typescript
import { ReconciliationEngine } from "./core/reconciliation-engine";

// إنشاء حساب وسيط
const accountId = await ReconciliationEngine.createClearingAccount({
  businessId: 1,
  code: "3000",
  nameAr: "حساب وسيط للتحصيلات",
  parentAccountId: 100,
});

// تسجيل حركة
const entryId = await ReconciliationEngine.recordClearingEntry({
  businessId: 1,
  clearingAccountId: accountId,
  entryDate: new Date(),
  description: "تحصيل من عميل",
  debit: 1000,
  sourceModule: "billing",
  sourceId: 123,
  createdBy: 1,
});
```

---

## 🏥 **فحص الصحة**

```typescript
import { EnginesValidator } from "./core/engines-validation";

// فحص صحة جميع المحركات
const health = await EnginesValidator.validateAll(1); // businessId

console.log(health.overall); // "healthy" | "degraded" | "unhealthy"
console.log(health.engines); // تفاصيل كل محرك
```

**أو عبر API:**

```typescript
const health = await trpc.health.engines.query({ businessId: 1 });
```

---

## ⏰ **Cron Jobs**

يتم تشغيل Cron Jobs تلقائياً عند بدء السيرفر:

```typescript
// في server/_core/index.ts
import { CronJobsManager } from "./core/cron-jobs";

// بعد بدء السيرفر
CronJobsManager.start();
```

**المهام المجدولة:**
- ✅ فوترة تلقائية (يومياً 00:00)
- ✅ شحن الدعم (يومياً 01:00)
- ✅ حساب الإهلاك (شهرياً)
- ✅ الصيانة الوقائية (يومياً 02:00)
- ✅ تذكير بالمدفوعات (يومياً 09:00)
- ... و 10 مهام أخرى

---

## 📊 **API Endpoints**

جميع المحركات متاحة عبر tRPC:

### **Pricing:**
```typescript
trpc.pricing.calculate({...})
trpc.pricing.rules.list({...})
trpc.pricing.rules.create({...})
```

### **Reconciliation:**
```typescript
trpc.reconciliation.clearingAccounts.create({...})
trpc.reconciliation.entries.record({...})
trpc.reconciliation.match.oneToOne({...})
```

### **Preventive Scheduling:**
```typescript
trpc.preventiveScheduling.schedule({...})
trpc.preventiveScheduling.getDuePlans({...})
```

### **Smart Assignment:**
```typescript
trpc.smartAssignment.assignEmergency({...})
trpc.smartAssignment.getNearest({...})
trpc.smartAssignment.reassign({...})
```

### **Health Check:**
```typescript
trpc.health.engines.query({ businessId: 1 })
```

---

## 🧪 **الاختبارات**

```bash
# اختبارات الوحدة
npm test engines.test.ts

# اختبارات التكامل
npm test engines-integration.test.ts
```

---

## 📚 **التوثيق الكامل**

- 📄 `ENGINES_COMPLETION_REPORT.md` - تقرير شامل
- 📄 `USAGE_EXAMPLES.md` - أمثلة الاستخدام
- 📄 `QUICK_START_GUIDE.md` - دليل البدء السريع
- 📄 `TESTING_REPORT.md` - تقرير الاختبارات

---

## ✅ **متطلبات التشغيل**

### **1. الحسابات المحاسبية المطلوبة:**

قبل استخدام محرك القيود، تأكد من وجود الحسابات التالية:

```bash
cd 6666-main
npx tsx scripts/ensure-required-accounts.ts
```

**الحسابات المطلوبة:**
- `1100` - النقدية
- `1110` - البنك
- `1200` - العملاء
- `4100` - الإيرادات
- `4200` - إيرادات مسبقة الدفع
- `2100` - الموردون
- `5100` - المخزون
- `6100` - تكلفة البضاعة المباعة
- `7100` - مصروفات الرواتب
- `7200` - مصروفات الإهلاك
- `1300` - إهلاك متراكم
- `1400` - ودائع العملاء

### **2. الفترة المحاسبية:**

يجب أن تكون هناك فترة محاسبية نشطة. السكريبت أعلاه ينشئها تلقائياً.

---

## 🔧 **استكشاف الأخطاء**

### **مشكلة: "الحسابات المطلوبة غير موجودة"**

**الحل:**
```bash
npx tsx scripts/ensure-required-accounts.ts
```

### **مشكلة: "لا توجد فترة محاسبية نشطة"**

**الحل:**
السكريبت أعلاه ينشئ فترة محاسبية تلقائياً.

### **مشكلة: "محرك الإسناد لا يعمل"**

**التحقق:**
- تأكد من وجود فنيين متاحين مع مواقع GPS
- استخدم health check للتحقق من الحالة

---

## 📝 **ملاحظات مهمة**

1. **محرك القيود:** يعمل تلقائياً عند إنشاء الفواتير والمدفوعات
2. **محرك الإسناد:** يعمل تلقائياً عند إنشاء عمليات طارئة
3. **محرك الجدولة:** يعمل تلقائياً عبر Cron Job يومياً
4. **محرك التسعير:** يحتاج قواعد تسعير (يمكن استخدام القيم الافتراضية)
5. **محرك التسوية:** يحتاج حسابات وسيطة (اختياري)

---

## 🎯 **الخطوات التالية**

1. ✅ تشغيل سكريبت التحقق من الحسابات
2. ✅ فحص صحة المحركات عبر health endpoint
3. ✅ إعداد قواعد التسعير (اختياري)
4. ✅ إعداد خطط الصيانة الوقائية (اختياري)

---

**آخر تحديث:** 6 يناير 2026  
**الحالة:** ✅ **جاهز للاستخدام**

