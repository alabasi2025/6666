# 📋 قائمة مهام نظام العملاء والفوترة
## Customers & Billing System TODO List

---

## ✅ ما تم إنجازه (Completed)

1. ✅ **نظام تطبيقات الجوال** - تم إكماله بالكامل
   - Database Schema
   - Backend Router
   - Frontend Pages (5 صفحات)
   - Seed Data

---

## 🔴 الأولوية العالية (High Priority) - يجب البدء بها

### 1. **الربط الإداري (Organizational Linking)** 🔴🔴🔴
**السبب:** أساسي لربط العملاء بالعدادات بشكل صحيح

#### قاعدة البيانات:
- [ ] إضافة `branch_id` و `station_id` إلى `customers_enhanced`
- [ ] إضافة `branch_id` إلى `meters_enhanced`
- [ ] إنشاء جدول `customer_stations` (many-to-many)
- [ ] إنشاء جدول `customer_branches` (many-to-many) - اختياري

#### Backend:
- [ ] Router procedures في `billingRouter` أو `customerSystemRouter`:
  - `linkCustomerToStations` - ربط عميل بعدة محطات
  - `getCustomerStations` - الحصول على محطات العميل
  - `getAvailableCustomersForMeter` - العملاء المتاحين للربط (نفس الفرع/المحطة)
  - `getAvailableMetersForCustomer` - العدادات المتاحة للربط

#### Frontend:
- [ ] تحديث `CustomersManagement.tsx`: إضافة تحديد المحطات/الفروع
- [ ] تحديث `MetersManagement.tsx`: إضافة تحديد الفرع
- [ ] تحديث `MetersManagement.tsx`: إضافة "ربط العداد بحساب عميل" (مع فلترة)

---

### 2. **حقول العداد الأساسية** 🔴🔴
**السبب:** بيانات أساسية مطلوبة لكل عداد

#### قاعدة البيانات:
- [ ] إضافة `address` (text) إلى `meters_enhanced`
- [ ] إضافة `location` (varchar) إلى `meters_enhanced`
- [ ] إضافة `neighborhood` (varchar) إلى `meters_enhanced`
- [ ] إضافة `establishment_name` (varchar) إلى `meters_enhanced`
- [ ] إضافة `area_id` و `square_id` إلى `meters_enhanced` (إذا لم يكونا موجودين)

#### Frontend:
- [ ] تحديث `MetersManagement.tsx`: إضافة حقول العنوان والموقع والجوار واسم المنشأة
- [ ] تحديث `MetersManagement.tsx`: إضافة ربط بالمنطقة والمربع والطبلات

---

### 3. **محفظة العميل (Customer Wallet)** 🔴🔴
**السبب:** ميزة أساسية للعملاء

#### Backend:
- [ ] Router procedures في `customerSystemRouter`:
  - `getWallet` - الحصول على محفظة عميل
  - `getWalletBalance` - الحصول على رصيد المحفظة
  - `chargeWallet` - شحن المحفظة
  - `withdrawFromWallet` - سحب من المحفظة
  - `getWalletTransactions` - سجل معاملات المحفظة

#### Frontend:
- [ ] إنشاء `CustomerWallets.tsx`:
  - عرض قائمة محافظ العملاء
  - عرض تفاصيل محفظة مع سجل المعاملات
  - نموذج شحن المحفظة
  - نموذج سحب من المحفظة

---

### 4. **حساب العداد (Meter Account)** 🔴🔴
**السبب:** الحساب الذي يتأثر بالفوترة والسداد

#### Backend:
- [ ] Router procedures:
  - `getMeterAccount` - عرض حساب العداد
  - `getMeterTransactions` - معاملات حساب العداد
  - `updateMeterBalance` - تحديث رصيد العداد

#### Frontend:
- [ ] تحديث `MetersManagement.tsx`: إضافة قسم "حساب العداد"
- [ ] عرض الرصيد والمتأخرات
- [ ] عرض سجل المعاملات

---

### 5. **الترحيل المالي/المحاسبي (Financial Transfers)** 🔴🔴
**السبب:** مطلوب للربط مع النظام المحاسبي

#### قاعدة البيانات:
- [ ] إنشاء جدول `financial_transfers`:
  - `id`, `business_id`, `transfer_type` (enum: "sales", "collections")
  - `period_id`, `total_amount`, `status` (enum: "pending", "transferred", "failed")
  - `transferred_at`, `target_account_code`, `notes`
  - `created_at`, `updated_at`

#### Backend:
- [ ] Router procedures:
  - `createFinancialTransfer` - إنشاء ترحيل
  - `getFinancialTransfers` - قائمة الترحيلات
  - `transferSales` - ترحيل المبيعات (نهاية الفترة)
  - `transferCollections` - ترحيل التحصيلات (يومي)
  - `updateTransferStatus` - تحديث حالة الترحيل

#### Frontend:
- [ ] إنشاء `FinancialTransfersManagement.tsx`:
  - عرض قائمة الترحيلات
  - إنشاء ترحيل جديد
  - عرض تفاصيل الترحيل

---

## 🟡 الأولوية المتوسطة (Medium Priority)

### 6. **آلية تركيب العداد (Installation Workflow)** 🟡
**السبب:** العملية الأساسية للنظام

#### قاعدة البيانات:
- [ ] إنشاء جدول `subscription_requests`:
  - `id`, `business_id`, `customer_id`, `station_id`
  - `request_date`, `status` (enum: "pending", "approved", "rejected")
  - `approved_by`, `approved_at`, `notes`
- [ ] إنشاء جدول `material_specifications`:
  - `id`, `request_id`, `item_id`, `quantity`, `specifications` (json)
- [ ] إنشاء جدول `material_issuances`:
  - `id`, `specification_id`, `warehouse_id`, `issued_quantity`, `issued_at`

#### Backend:
- [ ] Router procedures:
  - `createSubscriptionRequest` - إنشاء طلب اشتراك
  - `approveSubscriptionRequest` - الموافقة على الطلب
  - `createMaterialSpecification` - تحديد المواد
  - `issueMaterials` - صرف المواد
  - `completeInstallation` - إتمام التركيب

#### Frontend:
- [ ] إنشاء `SubscriptionRequests.tsx`:
  - قائمة طلبات الاشتراك
  - إنشاء طلب جديد
  - تحديد المواد
  - صرف المواد
  - إتمام التركيب

---

### 7. **الختومات والقواطع (Seals & Breakers)** 🟡
**السبب:** مطلوب لتسجيل تفاصيل التركيب

#### قاعدة البيانات:
- [ ] إنشاء جدول `meter_seals`:
  - `id`, `meter_id`, `seal_name`, `seal_color`, `seal_number`
  - `installation_date`, `notes`
- [ ] إنشاء جدول `meter_breakers`:
  - `id`, `meter_id`, `breaker_type`, `breaker_capacity`, `breaker_brand`
  - `installation_date`, `notes`

#### Backend:
- [ ] Router procedures:
  - `getMeterSeals` - الحصول على ختومات العداد
  - `addMeterSeal` - إضافة ختم
  - `getMeterBreakers` - الحصول على قواطع العداد
  - `addMeterBreaker` - إضافة قاطع

#### Frontend:
- [ ] تحديث `MetersManagement.tsx`: إضافة قسم "الختومات والقواطع"
- [ ] إضافة/تعديل/حذف ختم
- [ ] إضافة/تعديل/حذف قاطع

---

### 8. **الربط بالمخزن (Inventory Integration)** 🟡
**السبب:** ربط العداد بالمواد من المخزن

#### قاعدة البيانات:
- [ ] إنشاء جدول `meter_inventory_items`:
  - `id`, `meter_id`, `inventory_item_id`, `item_type` (enum: "meter", "seal", "breaker", "other")
  - `quantity`, `serial_number`, `installation_date`, `notes`

#### Backend:
- [ ] Router procedures:
  - `getMetersFromInventory` - الحصول على العدادات من المخزن (مع فلترة حسب نوع الحساب)
  - `linkMeterFromInventory` - ربط عداد من المخزن
  - `getMeterInventoryItems` - الحصول على المواد المرتبطة بالعداد

#### Frontend:
- [ ] تحديث `MetersManagement.tsx`: إضافة "إضافة عداد من المخزن"
- [ ] فلترة العدادات حسب نوع الحساب:
  - حساب STS: فقط عدادات STS
  - حساب IoT (ACREL): فقط عدادات ACREL
  - حساب Offline: فقط العدادات العادية
  - حساب الدعم الحكومي: جميع أنواع العدادات

---

### 9. **الشكاوى (Complaints)** 🟡
**السبب:** ميزة مهمة لكن ليست حرجة

#### قاعدة البيانات:
- [ ] إنشاء جدول `complaints`:
  - `id`, `business_id`, `customer_id`, `meter_id`, `invoice_id`
  - `complaint_type` (enum: "billing", "service", "technical", "other")
  - `subject`, `description`, `status` (enum: "open", "in_progress", "resolved", "closed")
  - `priority` (enum: "low", "medium", "high", "urgent")
  - `assigned_to`, `resolved_by`, `resolved_at`, `resolution_notes`

#### Backend:
- [ ] Router procedures:
  - `getComplaints` - قائمة الشكاوى
  - `createComplaint` - إنشاء شكوى
  - `updateComplaintStatus` - تحديث حالة الشكوى
  - `assignComplaint` - تعيين شكوى لموظف
  - `resolveComplaint` - حل الشكوى

#### Frontend:
- [ ] إنشاء `ComplaintsManagement.tsx`:
  - قائمة الشكاوى مع فلترة
  - إنشاء شكوى جديدة
  - عرض تفاصيل الشكوى
  - تحديث حالة الشكوى

---

### 10. **ميزة الخرائط (Maps Integration)** 🟡
**السبب:** تحسين تجربة المستخدم

#### قاعدة البيانات:
- [ ] إضافة `latitude` و `longitude` إلى `meters_enhanced`
- [ ] إضافة `latitude` و `longitude` إلى `customers_enhanced`

#### Backend:
- [ ] Router procedures:
  - `updateMeterLocation` - تحديث موقع العداد
  - `getMetersByLocation` - الحصول على العدادات حسب الموقع

#### Frontend:
- [ ] تحديث `MetersManagement.tsx`: إضافة خريطة
- [ ] عرض موقع العداد والكابينة على الخريطة
- [ ] تحديث الموقع من تطبيق الموظف

---

## 📊 ملخص الأولويات

### المرحلة 1: الأساسيات (Foundation) - 2-3 أسابيع
1. ✅ الربط الإداري
2. ✅ حقول العداد الأساسية

### المرحلة 2: الحسابات المالية (Financial Accounts) - 2-3 أسابيع
3. ✅ محفظة العميل
4. ✅ حساب العداد
5. ✅ الترحيل المالي/المحاسبي

### المرحلة 3: آليات العمل (Workflows) - 3-4 أسابيع
6. ✅ آلية تركيب العداد
7. ✅ الختومات والقواطع
8. ✅ الربط بالمخزن

### المرحلة 4: الميزات الإضافية (Additional Features) - 2-3 أسابيع
9. ✅ الشكاوى
10. ✅ ميزة الخرائط

---

**تاريخ الإنشاء:** 2024
**آخر تحديث:** 2024

