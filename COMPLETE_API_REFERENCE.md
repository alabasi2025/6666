# 📚 مرجع API الكامل - Complete API Reference

**تاريخ الإنشاء:** 6 يناير 2026  
**الحالة:** ✅ جميع APIs جاهزة

---

## 🎯 **نظرة عامة**

تم إضافة **API endpoints** لجميع المحركات الخمسة:

| المحرك | API Endpoints | الحالة |
|--------|---------------|--------|
| محرك القيود | مرتبط تلقائياً | ✅ |
| محرك التسوية | 7 endpoints | ✅ |
| محرك التسعير | 4 endpoints | ✅ |
| محرك الجدولة | 2 endpoints | ✅ |
| محرك الإسناد | 3 endpoints | ✅ |

**الإجمالي:** 16+ API endpoint ✅

---

## 📋 **1. محرك التسعير - Pricing Engine**

### **حساب السعر**
```typescript
trpc.pricing.calculate.query({
  businessId: 1,
  meterType: "sts", // "traditional" | "sts" | "iot"
  usageType: "residential", // "residential" | "commercial" | "industrial"
})

// Response:
{
  subscriptionFee: 7000,
  depositAmount: 0,
  depositRequired: false,
  total: 7000,
  ruleId?: 123
}
```

### **جلب قواعد التسعير**
```typescript
trpc.pricing.rules.list.query({
  businessId: 1,
  activeOnly: true
})

// Response: PricingRule[]
```

### **إنشاء قاعدة تسعير**
```typescript
trpc.pricing.rules.create.mutate({
  businessId: 1,
  meterType: "iot",
  usageType: "residential",
  subscriptionFee: 6000,
  depositAmount: 30000,
  depositRequired: true,
  notes: "قاعدة جديدة"
})

// Response: { id: 123, success: true }
```

### **تحديث قاعدة تسعير**
```typescript
trpc.pricing.rules.update.mutate({
  id: 123,
  subscriptionFee: 6500,
  depositAmount: 35000,
  active: true
})

// Response: { success: true }
```

---

## 📋 **2. محرك التسوية - Reconciliation Engine**

### **إنشاء حساب وسيط**
```typescript
trpc.reconciliation.clearingAccounts.create.mutate({
  businessId: 1,
  code: "1200-CLR",
  nameAr: "وسيط العملاء",
  parentAccountId: 1200
})

// Response: { id: 456, success: true }
```

### **تسجيل حركة في حساب وسيط**
```typescript
trpc.reconciliation.entries.record.mutate({
  businessId: 1,
  clearingAccountId: 456,
  entryDate: "2026-01-06",
  description: "تحصيل نقدي",
  debit: 50000,
  sourceModule: "billing",
  sourceId: 789
})

// Response: { id: 101, success: true }
```

### **جلب الحركات غير المطابقة**
```typescript
trpc.reconciliation.entries.getUnmatched.query({
  businessId: 1,
  clearingAccountId: 456,
  startDate: "2026-01-01", // optional
  endDate: "2026-01-31" // optional
})

// Response: ClearingEntry[]
```

### **مطابقة 1:1**
```typescript
trpc.reconciliation.match.oneToOne.mutate({
  entry1Id: 101,
  entry2Id: 102
})

// Response: { matched: true }
```

### **مطابقة 1:N**
```typescript
trpc.reconciliation.match.oneToMany.mutate({
  entryId: 101,
  entryIds: [102, 103, 104]
})

// Response: { matched: true }
```

### **مطابقة N:M**
```typescript
trpc.reconciliation.match.manyToMany.mutate({
  entryIds1: [101, 102],
  entryIds2: [103, 104, 105]
})

// Response: { matched: true }
```

### **تسوية الحركات المطابقة**
```typescript
trpc.reconciliation.reconcile.mutate({
  businessId: 1,
  matchedEntryIds: [101, 102, 103],
  description: "تسوية يومية"
})

// Response: { id: 201, success: true }
```

---

## 📋 **3. محرك الجدولة الوقائية - Preventive Scheduling**

### **جدولة الصيانة الوقائية**
```typescript
trpc.preventiveScheduling.schedule.mutate({
  businessId: 1
})

// Response:
{
  scheduled: 5,
  workOrderIds: [301, 302, 303, 304, 305]
}
```

### **جلب الخطط المستحقة لأصل**
```typescript
trpc.preventiveScheduling.getDuePlans.query({
  assetId: 50
})

// Response: PMPlan[]
```

---

## 📋 **4. محرك الإسناد الذكي - Smart Assignment**

### **إسناد مهمة طارئة**
```typescript
trpc.smartAssignment.assignEmergency.mutate({
  businessId: 1,
  operationId: 401, // أو workOrderId
  taskLatitude: 24.7136,
  taskLongitude: 46.6753,
  taskType: "emergency",
  maxDistance: 20 // كيلومتر
})

// Response:
{
  workerId: 5,
  workerName: "أحمد محمد",
  distance: 2.5,
  estimatedArrivalTime: 5 // دقائق
}
```

### **جلب الفنيين الأقرب**
```typescript
trpc.smartAssignment.getNearest.query({
  businessId: 1,
  latitude: 24.7136,
  longitude: 46.6753,
  limit: 5
})

// Response:
[
  { workerId: 5, nameAr: "أحمد محمد", distance: 2.5 },
  { workerId: 8, nameAr: "محمد علي", distance: 3.2 },
  ...
]
```

### **إعادة إسناد مهمة**
```typescript
trpc.smartAssignment.reassign.mutate({
  operationId: 401,
  reason: "رفض الفني",
  excludeWorkerId: 5 // optional
})

// Response: AssignmentResult | null
```

---

## 🔗 **5. محرك القيود - Auto Journal Engine**

**ملاحظة:** محرك القيود مرتبط تلقائياً بإنشاء الفواتير والمدفوعات. لا يحتاج API endpoints منفصلة.

**الربط التلقائي:**
- ✅ `trpc.invoice.create` → ينشئ قيد تلقائياً
- ✅ `trpc.customerSystem.createPayment` → ينشئ قيد تلقائياً

---

## 📊 **ملخص API Endpoints**

| المحرك | Endpoint | النوع | الوصف |
|--------|----------|-------|-------|
| **التسعير** | `pricing.calculate` | Query | حساب السعر |
| **التسعير** | `pricing.rules.list` | Query | جلب القواعد |
| **التسعير** | `pricing.rules.create` | Mutation | إنشاء قاعدة |
| **التسعير** | `pricing.rules.update` | Mutation | تحديث قاعدة |
| **التسوية** | `reconciliation.clearingAccounts.create` | Mutation | إنشاء حساب وسيط |
| **التسوية** | `reconciliation.entries.record` | Mutation | تسجيل حركة |
| **التسوية** | `reconciliation.entries.getUnmatched` | Query | جلب غير المطابقة |
| **التسوية** | `reconciliation.match.oneToOne` | Mutation | مطابقة 1:1 |
| **التسوية** | `reconciliation.match.oneToMany` | Mutation | مطابقة 1:N |
| **التسوية** | `reconciliation.match.manyToMany` | Mutation | مطابقة N:M |
| **التسوية** | `reconciliation.reconcile` | Mutation | تسوية الحركات |
| **الجدولة** | `preventiveScheduling.schedule` | Mutation | جدولة PM |
| **الجدولة** | `preventiveScheduling.getDuePlans` | Query | الخطط المستحقة |
| **الإسناد** | `smartAssignment.assignEmergency` | Mutation | إسناد طارئ |
| **الإسناد** | `smartAssignment.getNearest` | Query | الفنيين الأقرب |
| **الإسناد** | `smartAssignment.reassign` | Mutation | إعادة إسناد |

---

## ✅ **الخلاصة**

```
✅ جميع المحركات الخمسة: مكتملة
✅ API Endpoints: 16+ endpoint جاهز
✅ الربط بالأنظمة: مكتمل 100%
✅ Cron Jobs: 15 مهمة مجدولة

الإجمالي: 100% ✅
```

---

**آخر تحديث:** 6 يناير 2026  
**الحالة:** ✅ **جميع APIs جاهزة للاستخدام**

