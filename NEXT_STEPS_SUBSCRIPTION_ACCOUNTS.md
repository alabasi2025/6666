# 🚀 الخطوات التالية - حسابات المشترك
## Next Steps for Subscription Accounts

**التاريخ:** الجمعة، 10 يناير 2026

---

## ✅ **ما تم إنجازه (Completed)**

1. ✅ **Schema محدث** - جدول subscription_accounts مع جميع الحقول
2. ✅ **Migration تم تطبيقه** - الجدول والأعمدة موجودة
3. ✅ **APIs جاهزة** - subscriptionAccountsRouter مع جميع العمليات
4. ✅ **Router الرئيسي محدث** - subscriptionAccounts مضاف إلى appRouter

---

## ⏳ **ما يحتاج إنجاز (Pending)**

### **1. تحديث APIs الموجودة** 🔧

#### **أولوية عالية (Priority 1):**

##### **1.1: تحديث generateInvoices في billingRouter.ts**
```typescript
// بدلاً من:
customerId: meter.customerId

// استخدم:
subscriptionAccountId: meter.subscriptionAccountId
```

**الملف:** `server/billingRouter.ts`  
**الدالة:** `generateInvoices` (خط 1245-1772)

##### **1.2: تحديث createPayment في billingRouter.ts**
```typescript
// تحديث رصيد حساب المشترك بدلاً من رصيد العميل مباشرة
if (input.invoiceId) {
  const [invoice] = await db.select({ subscriptionAccountId, ... })
    .from(invoicesEnhanced)
    .where(eq(invoicesEnhanced.id, input.invoiceId));
  
  if (invoice?.subscriptionAccountId) {
    // تحديث رصيد حساب المشترك
    await db.update(subscriptionAccounts)
      .set({ balance: sql`balance + ${input.amount}` })
      .where(eq(subscriptionAccounts.id, invoice.subscriptionAccountId));
  }
}
```

**الملف:** `server/billingRouter.ts`  
**الدالة:** `createPayment` (خط 1706-1771)

##### **1.3: تحديث linkMeterToCustomer في customerSystemRouter.ts**
```typescript
// تغيير الاسم والمنطق
linkMeterToSubscriptionAccount: publicProcedure
  .input(z.object({
    meterId: z.number(),
    subscriptionAccountId: z.number(), // بدلاً من customerId
  }))
  .mutation(async ({ input }) => {
    // ربط العداد بحساب المشترك
    await db.update(metersEnhanced).set({
      subscriptionAccountId: input.subscriptionAccountId,
    }).where(eq(metersEnhanced.id, input.meterId));
  })
```

**الملف:** `server/customerSystemRouter.ts`  
**الدالة:** `linkMeterToCustomer` (خط 202-217)

---

### **2. إنشاء/تحديث الواجهات** 🎨

#### **أولوية عالية (Priority 1):**

##### **2.1: صفحة إدارة حسابات المشترك (جديد)**
**الملف:** `client/src/pages/billing/subscription-accounts/SubscriptionAccountsManagement.tsx`

**المكونات المطلوبة:**
- عرض قائمة حسابات المشترك لعميل محدد
- إضافة حساب مشترك جديد (مع اختيار النوع)
- ربط/فك ربط العدادات
- عرض الفواتير والمدفوعات لكل حساب
- تحديث رصيد الحساب

##### **2.2: تحديث صفحة تفاصيل العميل**
**الملف:** `client/src/pages/billing/customers/CustomerDetails.tsx`

**التحديثات المطلوبة:**
- إضافة قسم "حسابات المشترك" يعرض جميع حسابات المشترك للعميل
- إضافة زر "إضافة حساب مشترك"
- عند النقر على حساب مشترك → عرض التفاصيل والعدادات والفواتير

##### **2.3: تحديث صفحة العدادات**
**الملف:** `client/src/pages/billing/meters/MetersManagement.tsx`

**التحديثات المطلوبة:**
- عرض حساب المشترك المرتبط بالعداد
- إمكانية تغيير حساب المشترك المرتبط
- عند إنشاء عداد جديد → ربطه بحساب مشترك

---

#### **أولوية متوسطة (Priority 2):**

##### **2.4: تحديث صفحة الفواتير**
**الملف:** `client/src/pages/billing/invoicing/InvoicesManagement.tsx`

**التحديثات:**
- إضافة عمود "حساب المشترك" في الجدول
- فلترة حسب حساب المشترك
- عند إنشاء فاتورة → اختيار حساب المشترك

##### **2.5: تحديث صفحة المدفوعات**
**الملف:** `client/src/pages/billing/payments/PaymentsManagement.tsx`

**التحديثات:**
- إضافة عمود "حساب المشترك" في الجدول
- عند تحصيل دفعة → اختيار حساب المشترك

---

### **3. تحديث Navigation** 🧭

#### **إضافة إلى القائمة:**

**الملف:** `client/src/pages/Dashboard.tsx`

```typescript
{
  id: "subscription-accounts",
  title: "حسابات المشترك",
  icon: CreditCard,
  path: "/dashboard/billing/subscription-accounts",
  parent: "billing" // أو إضافة تحت customers-management
}
```

---

## 📋 **قائمة الملفات المطلوبة**

### **جديد:**
1. ⏳ `client/src/pages/billing/subscription-accounts/SubscriptionAccountsManagement.tsx`
2. ✅ `server/subscriptionAccountsRouter.ts` (تم)
3. ✅ `drizzle/migrations/0032_subscription_accounts.sql` (تم)
4. ✅ `scripts/apply-subscription-accounts-migration.ts` (تم)

### **تحديث:**
1. ⏳ `server/billingRouter.ts` - تحديث `generateInvoices`, `createPayment`
2. ⏳ `server/customerSystemRouter.ts` - تحديث `linkMeterToCustomer`, `createMeter`
3. ⏳ `server/services/auto-billing-service.ts` - تحديث `billMeter`
4. ⏳ `client/src/pages/billing/customers/CustomerDetails.tsx` - إضافة قسم حسابات المشترك
5. ⏳ `client/src/pages/billing/meters/MetersManagement.tsx` - عرض حساب المشترك
6. ⏳ `client/src/pages/billing/invoicing/InvoicesManagement.tsx` - عرض حساب المشترك
7. ⏳ `client/src/pages/billing/payments/PaymentsManagement.tsx` - عرض حساب المشترك
8. ⏳ `client/src/pages/Dashboard.tsx` - إضافة إلى القائمة

---

## 🎯 **الخطوات العملية للتطبيق**

### **الخطوة 1: تحديث generateInvoices**
```typescript
// في server/billingRouter.ts - generateInvoices
// بدلاً من:
customerId: meter.customerId,

// استخدم:
subscriptionAccountId: meter.subscriptionAccountId,
// مع التحقق من وجود subscriptionAccountId
```

### **الخطوة 2: تحديث createPayment**
```typescript
// في server/billingRouter.ts - createPayment
// بعد تحديث الفاتورة، تحديث رصيد حساب المشترك:
if (invoice?.subscriptionAccountId) {
  await trpc.subscriptionAccounts.updateBalance.mutate({
    subscriptionAccountId: invoice.subscriptionAccountId,
  });
}
```

### **الخطوة 3: إنشاء صفحة SubscriptionAccountsManagement**
```typescript
// client/src/pages/billing/subscription-accounts/SubscriptionAccountsManagement.tsx
// استخدام:
const accounts = trpc.subscriptionAccounts.getByCustomer.useQuery({ customerId });
const createMutation = trpc.subscriptionAccounts.create.useMutation();
// ...
```

---

## ✅ **الحالة الحالية**

### **Backend:**
- ✅ Schema: 100%
- ✅ Migration: 100%
- ✅ APIs: 100%
- ⏳ Integration: 30% (يحتاج تحديث APIs الموجودة)

### **Frontend:**
- ⏳ Pages: 0% (يحتاج إنشاء)
- ⏳ Integration: 0% (يحتاج تحديث الصفحات الموجودة)

---

**الخطوة التالية:** تحديث `generateInvoices` و `createPayment` في `billingRouter.ts`

---

**تاريخ الإنشاء:** الجمعة، 10 يناير 2026
