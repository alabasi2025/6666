# 🏗️ هيكل حسابات المشترك - Subscription Accounts Architecture

**التاريخ:** الجمعة، 10 يناير 2026

---

## 📋 **المتطلبات**

### **الهيكل المطلوب:**

```
1. حساب العميل (Customer Account) - المستوى الأعلى
   │
   ├─→ حسابات المشترك (Subscription Accounts) - متعددة
   │     │
   │     ├─→ حساب مشترك STS
   │     ├─→ حساب مشترك IoT
   │     ├─→ حساب مشترك عادي (Regular)
   │     └─→ حساب مشترك دعم حكومي (Government Support)
   │           │
   │           └─→ العدادات (Meters) - مرتبطة بحساب المشترك
   │
   └─→ المحفظة (Wallet) - مرتبطة بحساب العميل

العمليات (السداد، الاستهلاك، الفواتير) تحدث على حسابات المشترك
```

---

## 🎯 **الهيكل الحالي vs الهيكل المطلوب**

### **الهيكل الحالي:**
```
customers_enhanced (حساب العميل)
  └─→ metersEnhanced (العدادات) - مرتبطة مباشرة بالعميل
        └─→ invoicesEnhanced (الفواتير) - مرتبطة بالعداد مباشرة
```

### **الهيكل المطلوب:**
```
customers_enhanced (حساب العميل)
  │
  ├─→ subscription_accounts (حسابات المشترك) - جدول جديد
  │     │
  │     ├─→ account_type: 'sts' | 'iot' | 'regular' | 'government_support'
  │     │
  │     └─→ metersEnhanced (العدادات) - مرتبطة بحساب المشترك
  │           │
  │           └─→ invoicesEnhanced (الفواتير) - مرتبطة بحساب المشترك
  │
  └─→ customer_wallets (المحفظة) - موجود بالفعل
```

---

## 📊 **جدول حسابات المشترك (Subscription Accounts)**

### **الجدول المقترح:**

```sql
CREATE TABLE subscription_accounts (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers_enhanced(id),
  
  -- معلومات الحساب
  account_number VARCHAR(50) UNIQUE NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'sts', 'iot', 'regular', 'government_support'
  account_name VARCHAR(255), -- اسم اختياري للحساب (مثل: "حساب المنزل الرئيسي")
  
  -- إعدادات الحساب
  tariff_id INTEGER REFERENCES tariffs(id),
  service_type VARCHAR(50) DEFAULT 'electricity', -- 'electricity', 'water', 'gas'
  
  -- الربط المحاسبي
  accounting_account_id INTEGER REFERENCES accounts(id),
  
  -- المبالغ المالية
  balance DECIMAL(18,2) DEFAULT 0, -- الرصيد الحالي
  balance_due DECIMAL(18,2) DEFAULT 0, -- المستحقات
  credit_limit DECIMAL(18,2) DEFAULT 0, -- حد الائتمان (للأنواع الائتمانية)
  deposit_amount DECIMAL(18,2) DEFAULT 0, -- مبلغ التأمين
  
  -- إعدادات الدفع
  payment_mode VARCHAR(50) DEFAULT 'prepaid', -- 'prepaid', 'postpaid', 'hybrid'
  billing_cycle VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual'
  
  -- حالة الحساب
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'closed', 'pending'
  
  -- بيانات خاصة بالنوع
  -- للدعم الحكومي
  support_type VARCHAR(50), -- 'low_income', 'disabled', 'elderly', etc.
  support_percentage DECIMAL(5,2),
  max_support_amount DECIMAL(18,2),
  monthly_quota DECIMAL(15,3),
  
  -- لـ STS
  sts_meter_id INTEGER REFERENCES sts_meters(id),
  
  -- لـ IoT
  iot_device_id VARCHAR(100),
  
  -- معلومات إضافية
  activation_date DATE,
  expiration_date DATE,
  notes TEXT,
  
  -- التتبع
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- فهارس
  INDEX idx_customer_id (customer_id),
  INDEX idx_account_type (account_type),
  INDEX idx_status (status),
  INDEX idx_account_number (account_number)
);
```

---

## 🔄 **التغييرات المطلوبة**

### **1. تحديث جدول العدادات (metersEnhanced)**

```typescript
// إضافة حقل subscription_account_id
export const metersEnhanced = pgTable("meters_enhanced", {
  // ... الحقول الموجودة
  customerId: integer("customer_id"), // يبقى للتوافق مع الكود القديم (deprecated)
  subscriptionAccountId: integer("subscription_account_id").references(() => subscriptionAccounts.id), // جديد - الحقل الرئيسي
  // ... باقي الحقول
});
```

### **2. تحديث جدول الفواتير (invoicesEnhanced)**

```typescript
// إضافة حقل subscription_account_id
export const invoicesEnhanced = pgTable("invoices_enhanced", {
  // ... الحقول الموجودة
  customerId: integer("customer_id"), // يبقى للربط السريع
  subscriptionAccountId: integer("subscription_account_id").references(() => subscriptionAccounts.id), // جديد - الحقل الرئيسي
  meterId: integer("meter_id"), // يبقى
  // ... باقي الحقول
});
```

### **3. تحديث جدول المدفوعات (paymentsEnhanced)**

```typescript
// إضافة حقل subscription_account_id
export const paymentsEnhanced = pgTable("payments_enhanced", {
  // ... الحقول الموجودة
  customerId: integer("customer_id"), // يبقى للربط السريع
  subscriptionAccountId: integer("subscription_account_id").references(() => subscriptionAccounts.id), // جديد - الحقل الرئيسي
  invoiceId: integer("invoice_id"), // يبقى
  // ... باقي الحقول
});
```

---

## 📝 **خطة التطبيق**

### **المرحلة 1: إنشاء جدول حسابات المشترك**

1. ✅ إنشاء migration لجدول `subscription_accounts`
2. ✅ تحديث schema.ts
3. ✅ إنشاء APIs لإدارة حسابات المشترك

### **المرحلة 2: تحديث الجداول الموجودة**

1. ✅ تحديث `metersEnhanced` - إضافة `subscription_account_id`
2. ✅ تحديث `invoicesEnhanced` - إضافة `subscription_account_id`
3. ✅ تحديث `paymentsEnhanced` - إضافة `subscription_account_id`

### **المرحلة 3: Migration البيانات الموجودة**

1. ✅ إنشاء حساب مشترك افتراضي لكل عميل موجود
2. ✅ ربط العدادات الموجودة بحسابات المشترك
3. ✅ ربط الفواتير الموجودة بحسابات المشترك
4. ✅ ربط المدفوعات الموجودة بحسابات المشترك

### **المرحلة 4: تحديث APIs والواجهات**

1. ✅ تحديث APIs لاستخدام `subscription_account_id`
2. ✅ تحديث الواجهات لتعرض حسابات المشترك
3. ✅ إضافة إمكانية إنشاء حسابات مشترك جديدة
4. ✅ إضافة إمكانية ربط/فك ربط العدادات

---

## 🔧 **كود التنفيذ**

### **الخطوة 1: إنشاء Migration**

```typescript
// migrations/0031_subscription_accounts.ts
export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('subscription_accounts')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('business_id', 'integer', (col) => col.notNull())
    .addColumn('customer_id', 'integer', (col) => 
      col.notNull().references('customers_enhanced.id').onDelete('restrict')
    )
    .addColumn('account_number', 'varchar(50)', (col) => col.notNull().unique())
    .addColumn('account_type', 'varchar(50)', (col) => col.notNull())
    // ... باقي الأعمدة
    .execute();
}
```

### **الخطوة 2: تحديث Schema**

```typescript
// drizzle/schema.ts
export const subscriptionAccounts = pgTable("subscription_accounts", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id").notNull().references(() => customersEnhanced.id),
  accountNumber: varchar("account_number", { length: 50 }).notNull().unique(),
  accountType: varchar("account_type", { length: 50 }).notNull(),
  // ... باقي الحقول
});
```

---

## ✅ **الخلاصة**

### **المطلوب:**
1. ✅ إنشاء جدول `subscription_accounts`
2. ✅ تحديث `metersEnhanced` - إضافة `subscription_account_id`
3. ✅ تحديث `invoicesEnhanced` - إضافة `subscription_account_id`
4. ✅ تحديث `paymentsEnhanced` - إضافة `subscription_account_id`
5. ✅ إنشاء APIs لإدارة حسابات المشترك
6. ✅ Migration البيانات الموجودة
7. ✅ تحديث الواجهات

**الحالة:** ⚠️ **يحتاج تنفيذ**

---

**تاريخ الإنشاء:** الجمعة، 10 يناير 2026
