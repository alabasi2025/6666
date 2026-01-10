# 📋 خطة تطبيق حسابات المشترك - Implementation Plan
## Subscription Accounts Implementation Plan

**التاريخ:** الجمعة، 10 يناير 2026

---

## ✅ **ما تم إنجازه حتى الآن**

### 1. ✅ تحديث Schema (drizzle/schema.ts)
- ✅ إنشاء جدول `subscriptionAccounts` مع جميع الحقول المطلوبة
- ✅ تحديث `metersEnhanced` - إضافة `subscriptionAccountId`
- ✅ تحديث `invoicesEnhanced` - إضافة `subscriptionAccountId`
- ✅ تحديث `paymentsEnhanced` - إضافة `subscriptionAccountId`
- ✅ إضافة Types للجدول الجديد

---

## 📝 **الخطوات التالية (TODO)**

### **المرحلة 1: إنشاء Migration**

#### **الخطوة 1.1: إنشاء جدول subscription_accounts**
```sql
CREATE TABLE subscription_accounts (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers_enhanced(id),
  account_number VARCHAR(50) UNIQUE NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'sts', 'iot', 'regular', 'government_support'
  account_name VARCHAR(255),
  tariff_id INTEGER,
  service_type VARCHAR(50) DEFAULT 'electricity',
  accounting_account_id INTEGER,
  balance DECIMAL(18,2) DEFAULT 0,
  balance_due DECIMAL(18,2) DEFAULT 0,
  credit_limit DECIMAL(18,2) DEFAULT 0,
  deposit_amount DECIMAL(18,2) DEFAULT 0,
  payment_mode VARCHAR(50) DEFAULT 'prepaid',
  billing_cycle VARCHAR(50) DEFAULT 'monthly',
  status VARCHAR(50) DEFAULT 'active',
  -- بيانات خاصة بالدعم الحكومي
  support_type VARCHAR(50),
  support_percentage DECIMAL(5,2),
  max_support_amount DECIMAL(18,2),
  monthly_quota DECIMAL(15,3),
  -- ربط مع STS
  sts_meter_id INTEGER,
  -- ربط مع IoT
  iot_device_id VARCHAR(100),
  -- معلومات إضافية
  activation_date DATE,
  expiration_date DATE,
  notes TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX subscription_accounts_customer_id_idx ON subscription_accounts(customer_id);
CREATE INDEX subscription_accounts_account_type_idx ON subscription_accounts(account_type);
CREATE INDEX subscription_accounts_account_number_idx ON subscription_accounts(account_number);
```

#### **الخطوة 1.2: إضافة الأعمدة للجداول الموجودة**
```sql
-- إضافة subscription_account_id للعدادات
ALTER TABLE meters_enhanced 
ADD COLUMN subscription_account_id INTEGER REFERENCES subscription_accounts(id);

CREATE INDEX meters_subscription_account_id_idx ON meters_enhanced(subscription_account_id);

-- إضافة subscription_account_id للفواتير
ALTER TABLE invoices_enhanced 
ADD COLUMN subscription_account_id INTEGER REFERENCES subscription_accounts(id);

CREATE INDEX invoices_subscription_account_id_idx ON invoices_enhanced(subscription_account_id);

-- إضافة subscription_account_id للمدفوعات
ALTER TABLE payments_enhanced 
ADD COLUMN subscription_account_id INTEGER REFERENCES subscription_accounts(id);

CREATE INDEX payments_subscription_account_id_idx ON payments_enhanced(subscription_account_id);
```

---

### **المرحلة 2: Migration البيانات الموجودة**

#### **الخطوة 2.1: إنشاء حسابات مشترك افتراضية للعملاء الموجودين**
```sql
-- لكل عميل موجود، إنشاء حساب مشترك عادي افتراضي
INSERT INTO subscription_accounts (
  business_id,
  customer_id,
  account_number,
  account_type,
  account_name,
  status,
  activation_date,
  created_at,
  updated_at
)
SELECT 
  business_id,
  id,
  'SUB-' || id || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER,
  'regular',
  'حساب المشترك الرئيسي',
  'active',
  CURRENT_DATE,
  NOW(),
  NOW()
FROM customers_enhanced
WHERE is_active = true;
```

#### **الخطوة 2.2: ربط العدادات الموجودة بحسابات المشترك**
```sql
-- ربط العدادات الموجودة بحسابات المشترك
UPDATE meters_enhanced m
SET subscription_account_id = (
  SELECT id 
  FROM subscription_accounts 
  WHERE customer_id = m.customer_id 
  AND account_type = 'regular'
  LIMIT 1
)
WHERE customer_id IS NOT NULL;
```

#### **الخطوة 2.3: ربط الفواتير الموجودة بحسابات المشترك**
```sql
-- ربط الفواتير الموجودة بحسابات المشترك (عبر العداد)
UPDATE invoices_enhanced i
SET subscription_account_id = (
  SELECT subscription_account_id
  FROM meters_enhanced
  WHERE id = i.meter_id
  LIMIT 1
)
WHERE meter_id IS NOT NULL;
```

#### **الخطوة 2.4: ربط المدفوعات الموجودة بحسابات المشترك**
```sql
-- ربط المدفوعات الموجودة بحسابات المشترك (عبر الفاتورة أو العداد)
UPDATE payments_enhanced p
SET subscription_account_id = COALESCE(
  (SELECT subscription_account_id FROM invoices_enhanced WHERE id = p.invoice_id LIMIT 1),
  (SELECT subscription_account_id FROM meters_enhanced WHERE id = p.meter_id LIMIT 1),
  (SELECT id FROM subscription_accounts WHERE customer_id = p.customer_id AND account_type = 'regular' LIMIT 1)
)
WHERE customer_id IS NOT NULL;
```

---

### **المرحلة 3: إنشاء APIs**

#### **الخطوة 3.1: إنشاء Router لحسابات المشترك**
```typescript
// server/subscriptionAccountsRouter.ts
export const subscriptionAccountsRouter = router({
  // الحصول على جميع حسابات المشترك لعميل
  getByCustomer: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      // ...
    }),
  
  // إنشاء حساب مشترك جديد
  create: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      accountType: z.enum(['sts', 'iot', 'regular', 'government_support']),
      // ... باقي الحقول
    }))
    .mutation(async ({ input }) => {
      // ...
    }),
  
  // ربط عداد بحساب مشترك
  linkMeter: protectedProcedure
    .input(z.object({
      subscriptionAccountId: z.number(),
      meterId: z.number(),
    }))
    .mutation(async ({ input }) => {
      // ...
    }),
});
```

---

### **المرحلة 4: تحديث APIs الموجودة**

#### **الخطوة 4.1: تحديث APIs الفواتير**
- تحديث `generateInvoices` لاستخدام `subscriptionAccountId` بدلاً من `customerId`
- تحديث `createInvoice` لاستخدام `subscriptionAccountId`

#### **الخطوة 4.2: تحديث APIs المدفوعات**
- تحديث `createPayment` لاستخدام `subscriptionAccountId`
- تحديث رصيد حساب المشترك بدلاً من رصيد العميل مباشرة

#### **الخطوة 4.3: تحديث APIs العدادات**
- تحديث `linkMeterToCustomer` لتصبح `linkMeterToSubscriptionAccount`
- تحديث `createMeter` ليربط مباشرة بحساب المشترك

---

### **المرحلة 5: تحديث الواجهات**

#### **الخطوة 5.1: صفحة إدارة حسابات المشترك**
- `SubscriptionAccountsManagement.tsx` - عرض وإدارة حسابات المشترك للعميل
- إمكانية إنشاء حساب مشترك جديد
- إمكانية ربط/فك ربط العدادات

#### **الخطوة 5.2: تحديث صفحة العملاء**
- عرض حسابات المشترك في صفحة تفاصيل العميل
- إضافة زر "إضافة حساب مشترك"

#### **الخطوة 5.3: تحديث صفحة العدادات**
- عرض حساب المشترك المرتبط بالعداد
- إمكانية تغيير الحساب المرتبط

---

## 🔧 **الملفات المطلوب إنشاؤها/تحديثها**

### **جديد:**
1. ✅ `drizzle/schema.ts` - تحديث (تم)
2. ⏳ `migrations/0031_subscription_accounts.sql` - إنشاء migration
3. ⏳ `server/subscriptionAccountsRouter.ts` - APIs جديدة
4. ⏳ `scripts/migrate-to-subscription-accounts.ts` - Migration script للبيانات
5. ⏳ `client/src/pages/billing/subscription-accounts/SubscriptionAccountsManagement.tsx` - واجهة جديدة

### **تحديث:**
1. ⏳ `server/billingRouter.ts` - تحديث APIs الفواتير
2. ⏳ `server/billingRouter.ts` - تحديث APIs المدفوعات
3. ⏳ `server/customerSystemRouter.ts` - تحديث APIs العدادات
4. ⏳ `server/services/auto-billing-service.ts` - تحديث لتوليد الفواتير
5. ⏳ `client/src/pages/billing/customers/CustomerDetails.tsx` - عرض حسابات المشترك

---

## ⚠️ **ملاحظات مهمة**

### **1. التوافق مع الكود القديم:**
- تم الاحتفاظ بـ `customerId` في الجداول للتوافق
- سيتم استخدام `subscriptionAccountId` تدريجياً
- يمكن إزالة `customerId` لاحقاً بعد التحقق من أن كل شيء يعمل

### **2. البيانات الموجودة:**
- سيتم إنشاء حساب مشترك افتراضي لكل عميل موجود
- سيتم ربط العدادات والفواتير والمدفوعات تلقائياً

### **3. الأداء:**
- تم إضافة indexes على `subscription_account_id` لتحسين الأداء
- يمكن إضافة composite indexes لاحقاً حسب الحاجة

---

## 📊 **الهيكل النهائي**

```
Customer (customers_enhanced)
  │
  ├─→ Subscription Account 1 (STS)
  │     └─→ Meter 1
  │           └─→ Invoice 1
  │                 └─→ Payment 1
  │
  ├─→ Subscription Account 2 (IoT)
  │     └─→ Meter 2
  │           └─→ Invoice 2
  │
  ├─→ Subscription Account 3 (Regular)
  │     └─→ Meter 3
  │           └─→ Invoice 3
  │
  └─→ Subscription Account 4 (Government Support)
        └─→ Meter 4
              └─→ Invoice 4
                    └─→ Payment 2

Wallet (customer_wallets) → مرتبط بالعميل مباشرة
```

---

## ✅ **الحالة الحالية**

- ✅ Schema محدث
- ✅ Migration script موجود (`scripts/migrate-to-subscription-accounts.ts`)
- ✅ APIs موجودة (`server/subscriptionAccountsRouter.ts`)
- ✅ الواجهات موجودة (`client/src/pages/billing/subscription-accounts/SubscriptionAccountsManagement.tsx`)
- ✅ تحديث `linkMeterToCustomer` لاستخدام `subscriptionAccountId`

**الخطوة التالية:** تشغيل migration script للبيانات الموجودة

---

**تاريخ الإنشاء:** الجمعة، 10 يناير 2026
