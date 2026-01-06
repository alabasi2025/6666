# 📖 أمثلة الاستخدام - Usage Examples

**تاريخ الإنشاء:** 6 يناير 2026  
**الحالة:** ✅ أمثلة عملية جاهزة

---

## 🎯 **نظرة عامة**

هذا الملف يحتوي على أمثلة عملية لاستخدام جميع المحركات الخمسة.

---

## 1️⃣ **محرك التسعير - Pricing Engine**

### **مثال 1: حساب سعر اشتراك جديد**

```typescript
// حساب سعر لعميل جديد يريد عداد STS سكني
const pricing = await trpc.pricing.calculate.query({
  businessId: 1,
  meterType: "sts",
  usageType: "residential"
});

console.log(`رسوم الاشتراك: ${pricing.subscriptionFee} ريال`);
console.log(`التأمين: ${pricing.depositAmount} ريال`);
console.log(`المجموع: ${pricing.total} ريال`);
// Output:
// رسوم الاشتراك: 7000 ريال
// التأمين: 0 ريال
// المجموع: 7000 ريال
```

### **مثال 2: إنشاء قاعدة تسعير مخصصة**

```typescript
// إنشاء قاعدة تسعير جديدة للعدادات IoT التجارية
const result = await trpc.pricing.rules.create.mutate({
  businessId: 1,
  meterType: "iot",
  usageType: "commercial",
  subscriptionFee: 15000,
  depositAmount: 60000,
  depositRequired: true,
  notes: "قاعدة خاصة للعملاء التجاريين الكبار"
});

console.log(`تم إنشاء قاعدة التسعير برقم: ${result.id}`);
```

### **مثال 3: تحديث قاعدة تسعير**

```typescript
// تحديث رسوم الاشتراك
await trpc.pricing.rules.update.mutate({
  id: 123,
  subscriptionFee: 8000, // زيادة من 7000 إلى 8000
  notes: "تحديث الأسعار - يناير 2026"
});
```

---

## 2️⃣ **محرك التسوية - Reconciliation Engine**

### **مثال 1: إنشاء حساب وسيط**

```typescript
// إنشاء حساب وسيط للعملاء
const clearingAccount = await trpc.reconciliation.clearingAccounts.create.mutate({
  businessId: 1,
  code: "1200-CLR",
  nameAr: "وسيط العملاء",
  parentAccountId: 1200 // حساب العملاء الأصلي
});

console.log(`تم إنشاء الحساب الوسيط برقم: ${clearingAccount.id}`);
```

### **مثال 2: تسجيل حركة في حساب وسيط**

```typescript
// تسجيل تحصيل نقدي في حساب وسيط العملاء
const entry = await trpc.reconciliation.entries.record.mutate({
  businessId: 1,
  clearingAccountId: clearingAccount.id,
  entryDate: "2026-01-06",
  description: "تحصيل نقدي من العميل #123",
  debit: 50000,
  sourceModule: "billing",
  sourceId: paymentId
});

console.log(`تم تسجيل الحركة برقم: ${entry.id}`);
```

### **مثال 3: مطابقة وتسوية**

```typescript
// 1. جلب الحركات غير المطابقة
const unmatched = await trpc.reconciliation.entries.getUnmatched.query({
  businessId: 1,
  clearingAccountId: clearingAccount.id,
  startDate: "2026-01-01",
  endDate: "2026-01-31"
});

// 2. مطابقة 1:1
const isMatched = await trpc.reconciliation.match.oneToOne.mutate({
  entry1Id: unmatched[0].entryId,
  entry2Id: unmatched[1].entryId
});

if (isMatched.matched) {
  // 3. تسوية الحركات المطابقة
  const reconciliation = await trpc.reconciliation.reconcile.mutate({
    businessId: 1,
    matchedEntryIds: [unmatched[0].entryId, unmatched[1].entryId],
    description: "تسوية يومية - 6 يناير 2026"
  });
  
  console.log(`تم التسوية برقم: ${reconciliation.id}`);
}
```

---

## 3️⃣ **محرك الجدولة الوقائية - Preventive Scheduling**

### **مثال 1: جدولة الصيانة الوقائية**

```typescript
// جدولة جميع أعمال الصيانة الوقائية المستحقة
const result = await trpc.preventiveScheduling.schedule.mutate({
  businessId: 1
});

console.log(`تم جدولة ${result.scheduled} أمر عمل`);
console.log(`أرقام أوامر العمل: ${result.workOrderIds.join(", ")}`);
// Output:
// تم جدولة 5 أمر عمل
// أرقام أوامر العمل: 301, 302, 303, 304, 305
```

### **مثال 2: فحص الخطط المستحقة لأصل**

```typescript
// فحص الخطط المستحقة لمولد معين
const duePlans = await trpc.preventiveScheduling.getDuePlans.query({
  assetId: 50 // معرف المولد
});

console.log(`عدد الخطط المستحقة: ${duePlans.length}`);
duePlans.forEach(plan => {
  console.log(`- ${plan.nameAr} (${plan.frequency})`);
});
```

---

## 4️⃣ **محرك الإسناد الذكي - Smart Assignment**

### **مثال 1: إسناد مهمة طارئة**

```typescript
// إسناد مهمة طارئة (انقطاع كهرباء) للفني الأقرب
const assignment = await trpc.smartAssignment.assignEmergency.mutate({
  businessId: 1,
  operationId: 401,
  taskLatitude: 24.7136, // موقع المهمة
  taskLongitude: 46.6753,
  taskType: "emergency",
  maxDistance: 20 // 20 كيلومتر كحد أقصى
});

if (assignment) {
  console.log(`تم إسناد المهمة للفني: ${assignment.workerName}`);
  console.log(`المسافة: ${assignment.distance.toFixed(2)} كم`);
  console.log(`وقت الوصول المتوقع: ${assignment.estimatedArrivalTime} دقيقة`);
} else {
  console.log("لا يوجد فني متاح ضمن المسافة المحددة");
}
```

### **مثال 2: جلب الفنيين الأقرب**

```typescript
// جلب 5 فنيين أقرب لمهمة معينة
const nearest = await trpc.smartAssignment.getNearest.query({
  businessId: 1,
  latitude: 24.7136,
  longitude: 46.6753,
  limit: 5
});

console.log("الفنيين الأقرب:");
nearest.forEach((worker, index) => {
  console.log(`${index + 1}. ${worker.nameAr} - ${worker.distance.toFixed(2)} كم`);
});
```

### **مثال 3: إعادة إسناد مهمة**

```typescript
// إعادة إسناد مهمة بعد رفض الفني
const reassignment = await trpc.smartAssignment.reassign.mutate({
  operationId: 401,
  reason: "الفني غير متاح",
  excludeWorkerId: 5 // استثناء الفني السابق
});

if (reassignment) {
  console.log(`تم إعادة الإسناد للفني: ${reassignment.workerName}`);
}
```

---

## 5️⃣ **محرك القيود - Auto Journal Engine**

### **مثال 1: إنشاء فاتورة (مع قيد تلقائي)**

```typescript
// إنشاء فاتورة - سيتم إنشاء قيد محاسبي تلقائياً
const invoice = await trpc.invoice.create.mutate({
  businessId: 1,
  customerId: 123,
  invoiceDate: "2026-01-06",
  dueDate: "2026-02-06",
  consumptionAmount: 500,
  fixedCharges: 100,
  taxAmount: 75,
  totalAmount: 675,
  // ... باقي البيانات
});

// القيد المحاسبي تم إنشاؤه تلقائياً:
// مدين: ح/ العملاء (1200) = 675
// دائن: ح/ إيرادات الكهرباء (4100) = 675
```

### **مثال 2: استلام دفعة (مع قيد تلقائي)**

```typescript
// استلام دفعة نقدية - سيتم إنشاء قيد محاسبي تلقائياً
const payment = await trpc.customerSystem.createPayment.mutate({
  businessId: 1,
  customerId: 123,
  invoiceId: 456,
  amount: "500",
  paymentMethod: "cash",
  paymentDate: "2026-01-06",
  collectedBy: userId
});

// القيد المحاسبي تم إنشاؤه تلقائياً:
// مدين: ح/ النقدية (1100) = 500
// دائن: ح/ العملاء (1200) = 500
```

---

## 🔄 **أمثلة متكاملة**

### **مثال: عملية تركيب عداد جديد كاملة**

```typescript
// 1. حساب السعر
const pricing = await trpc.pricing.calculate.query({
  businessId: 1,
  meterType: "sts",
  usageType: "residential"
});

// 2. إنشاء فاتورة
const invoice = await trpc.invoice.create.mutate({
  businessId: 1,
  customerId: customerId,
  totalAmount: pricing.total,
  // ... باقي البيانات
});

// 3. إنشاء عملية تركيب
const operation = await trpc.fieldOps.operations.create.mutate({
  businessId: 1,
  operationType: "installation",
  priority: "high",
  title: "تركيب عداد STS جديد",
  locationLat: 24.7136,
  locationLng: 46.6753,
  // ... باقي البيانات
});

// 4. إسناد تلقائي (إذا كانت طارئة)
if (operation.priority === "urgent") {
  await trpc.smartAssignment.assignEmergency.mutate({
    businessId: 1,
    operationId: operation.id,
    taskLatitude: 24.7136,
    taskLongitude: 46.6753,
    taskType: "installation"
  });
}
```

---

## ✅ **الخلاصة**

جميع الأمثلة أعلاه جاهزة للاستخدام مباشرة. يمكنك نسخها وتعديلها حسب احتياجاتك.

**ملاحظة:** تأكد من:
- وجود البيانات المطلوبة في قاعدة البيانات
- صحة معرفات الشركات والعملاء
- تفعيل Cron Jobs للجدولة الوقائية

---

**آخر تحديث:** 6 يناير 2026

