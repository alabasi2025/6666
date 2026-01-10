# 📋 ملخص شامل لجميع ما تم التخطيط له اليوم
## Complete Day Summary - All Planned Features

---

## ✅ ما تم إنجازه اليوم (Completed Today)

### 1. **نظام تطبيقات الجوال (Mobile Apps System)** ✅✅✅
- ✅ Database Schema (`drizzle/schemas/mobile-apps.ts`) - 5 جداول
- ✅ Backend Router (`server/mobileAppsRouter.ts`) - 20+ procedures
- ✅ Frontend Pages (5 صفحات):
  - `MobileAppsManagement.tsx` - إدارة التطبيقات
  - `CustomerAppScreens.tsx` - إدارة 9 شاشات تطبيق العميل
  - `EmployeeAppScreens.tsx` - إدارة 13 شاشة تطبيق الموظف
  - `MobileAppPermissions.tsx` - إدارة الصلاحيات (11 للعميل، 17 للموظف)
  - `UserMobileAccess.tsx` - إدارة وصول المستخدمين
- ✅ Navigation Integration في `Dashboard.tsx`
- ✅ Seed Data (`server/seed-mobile-apps.ts`)
- ✅ Migration (تم إنشاؤه)
- ✅ Seed Data (تم تشغيله)

---

## 📋 ما تم التخطيط له - نظام العملاء والفوترة

### 🔴 الأولوية العالية جداً (Critical Priority)

#### 1. **الربط الإداري (Organizational Linking)** 🔴🔴🔴
**السبب:** أساسي لربط العملاء بالعدادات بشكل صحيح

**قاعدة البيانات:**
- [ ] إضافة `branch_id` و `station_id` إلى `customers_enhanced`
- [ ] إضافة `branch_id` إلى `meters_enhanced`
- [ ] إنشاء جدول `customer_stations` (many-to-many)
- [ ] إنشاء جدول `customer_branches` (many-to-many) - اختياري

**Backend:**
- [ ] Router procedures:
  - `linkCustomerToStations` - ربط عميل بعدة محطات
  - `linkCustomerToBranches` - ربط عميل بعدة فروع
  - `getCustomerStations` - الحصول على محطات العميل
  - `getCustomerBranches` - الحصول على فروع العميل
  - `getAvailableCustomersForMeter` - العملاء المتاحين للربط (نفس الفرع/المحطة)
  - `getAvailableMetersForCustomer` - العدادات المتاحة للربط (نفس الفرع/المحطة)

**Frontend:**
- [ ] تحديث `CustomersManagement.tsx`: إضافة تحديد المحطات/الفروع
- [ ] تحديث `MetersManagement.tsx`: إضافة تحديد الفرع
- [ ] تحديث `MetersManagement.tsx`: إضافة "ربط العداد بحساب عميل" (مع فلترة حسب الفرع/المحطة)

---

#### 2. **حقول العداد الأساسية (Basic Meter Fields)** 🔴🔴
**السبب:** بيانات أساسية مطلوبة لكل عداد

**قاعدة البيانات:**
- [ ] إضافة `address` (text) إلى `meters_enhanced`
- [ ] إضافة `location` (varchar) إلى `meters_enhanced`
- [ ] إضافة `neighborhood` (varchar) إلى `meters_enhanced`
- [ ] إضافة `establishment_name` (varchar) إلى `meters_enhanced`
- [ ] إضافة `area_id` و `square_id` إلى `meters_enhanced` (إذا لم يكونا موجودين)
- [ ] إضافة `latitude` و `longitude` إلى `meters_enhanced` (للميزة الخرائط)

**Frontend:**
- [ ] تحديث `MetersManagement.tsx`: إضافة حقول العنوان والموقع والجوار واسم المنشأة
- [ ] تحديث `MetersManagement.tsx`: إضافة ربط بالمنطقة والمربع والطبلات

---

#### 3. **محفظة العميل (Customer Wallet)** 🔴🔴
**السبب:** ميزة أساسية للعملاء

**قاعدة البيانات:**
- ✅ جدول `customer_wallets` موجود
- ✅ يتم إنشاء محفظة تلقائياً عند إنشاء عميل

**Backend:**
- [ ] Router procedures في `customerSystemRouter`:
  - `getWallet` - الحصول على محفظة عميل
  - `getWalletBalance` - الحصول على رصيد المحفظة
  - `chargeWallet` - شحن المحفظة (يدوي أو من محفظة خارجية)
  - `withdrawFromWallet` - سحب من المحفظة (للسداد على حساب عداد)
  - `getWalletTransactions` - سجل معاملات المحفظة
  - `linkExternalWallet` - ربط محفظة خارجية (STC Pay, Apple Pay, إلخ)
  - `chargeFromExternalWallet` - شحن من محفظة خارجية

**Frontend:**
- [ ] إنشاء `CustomerWallets.tsx`:
  - عرض قائمة محافظ العملاء مع الرصيد
  - عرض تفاصيل محفظة عميل مع سجل المعاملات
  - نموذج شحن المحفظة (يدوي)
  - نموذج سحب من المحفظة (للسداد على حساب عداد)
  - ربط محفظة خارجية
  - شحن من محفظة خارجية
  - فلترة وبحث

---

#### 4. **حساب العداد (Meter Account)** 🔴🔴
**السبب:** الحساب الذي يتأثر بالفوترة والسداد

**قاعدة البيانات:**
- ✅ حقول `balance` و `balanceDue` موجودة في `meters_enhanced`

**Backend:**
- [ ] Router procedures:
  - `getMeterAccount` - عرض حساب العداد
  - `getMeterTransactions` - معاملات حساب العداد
  - `updateMeterBalance` - تحديث رصيد العداد

**Frontend:**
- [ ] تحديث `MetersManagement.tsx`: إضافة قسم "حساب العداد"
- [ ] عرض الرصيد والمتأخرات
- [ ] عرض سجل المعاملات

---

#### 5. **الترحيل المالي/المحاسبي (Financial Transfers)** 🔴🔴
**السبب:** مطلوب للربط مع النظام المحاسبي

**قاعدة البيانات:**
- [ ] إنشاء جدول `financial_transfers`:
  - `id`, `business_id`, `transfer_type` (enum: "sales", "collections")
  - `period_id`, `total_amount`, `status` (enum: "pending", "transferred", "failed")
  - `transferred_at`, `target_account_code`, `notes`
  - `created_at`, `updated_at`

**Backend:**
- [ ] Router procedures:
  - `createFinancialTransfer` - إنشاء ترحيل
  - `getFinancialTransfers` - قائمة الترحيلات
  - `transferSales` - ترحيل المبيعات (نهاية الفترة - كل 10 أيام)
  - `transferCollections` - ترحيل التحصيلات (يومي - نهاية كل يوم)
  - `updateTransferStatus` - تحديث حالة الترحيل
  - `getTransferStats` - إحصائيات الترحيلات

**Frontend:**
- [ ] إنشاء `FinancialTransfersManagement.tsx`:
  - عرض قائمة الترحيلات مع فلترة
  - إنشاء ترحيل جديد
  - عرض تفاصيل الترحيل
  - إعدادات الحسابات المستهدفة في النظام المالي

---

### 🟡 الأولوية المتوسطة (Medium Priority)

#### 6. **آلية تركيب العداد (Installation Workflow)** 🟡
**السبب:** العملية الأساسية للنظام

**قاعدة البيانات:**
- [ ] إنشاء جدول `subscription_requests`:
  - `id`, `business_id`, `customer_id`, `station_id`
  - `request_date`, `status` (enum: "pending", "approved", "rejected", "in_progress", "completed")
  - `approved_by`, `approved_at`, `notes`
  - `created_at`, `updated_at`
- [ ] إنشاء جدول `material_specifications`:
  - `id`, `request_id`, `item_id`, `quantity`, `specifications` (json)
  - `created_at`
- [ ] إنشاء جدول `material_issuances`:
  - `id`, `specification_id`, `warehouse_id`, `issued_quantity`, `issued_at`
  - `issued_by`, `notes`

**Backend:**
- [ ] Router procedures:
  - `createSubscriptionRequest` - إنشاء طلب اشتراك
  - `getSubscriptionRequests` - قائمة طلبات الاشتراك
  - `approveSubscriptionRequest` - الموافقة على الطلب
  - `createMaterialSpecification` - تحديد المواد المطلوبة
  - `getMaterialSpecifications` - قائمة المواد المحددة
  - `issueMaterials` - صرف المواد من المخزن
  - `completeInstallation` - إتمام التركيب (ربط بـ field_operations)

**Frontend:**
- [ ] إنشاء `SubscriptionRequests.tsx`:
  - قائمة طلبات الاشتراك مع فلترة
  - إنشاء طلب جديد
  - الموافقة على الطلب
  - تحديد المواد المطلوبة
  - صرف المواد من المخزن
  - إتمام التركيب

---

#### 7. **الختومات والقواطع (Seals & Breakers)** 🟡
**السبب:** مطلوب لتسجيل تفاصيل التركيب

**قاعدة البيانات:**
- [ ] إنشاء جدول `meter_seals`:
  - `id`, `meter_id`, `seal_name`, `seal_color`, `seal_number`
  - `installation_date`, `notes`, `created_at`, `updated_at`
- [ ] إنشاء جدول `meter_breakers`:
  - `id`, `meter_id`, `breaker_type`, `breaker_capacity`, `breaker_brand`
  - `breaker_model`, `installation_date`, `notes`
  - `created_at`, `updated_at`

**Backend:**
- [ ] Router procedures:
  - `getMeterSeals` - الحصول على ختومات العداد
  - `addMeterSeal` - إضافة ختم (يمكن إضافة أكثر من ختم)
  - `updateMeterSeal` - تحديث ختم
  - `removeMeterSeal` - حذف ختم
  - `getMeterBreakers` - الحصول على قواطع العداد
  - `addMeterBreaker` - إضافة قاطع
  - `updateMeterBreaker` - تحديث قاطع
  - `removeMeterBreaker` - حذف قاطع

**Frontend:**
- [ ] تحديث `MetersManagement.tsx`: إضافة قسم "الختومات والقواطع"
- [ ] إضافة/تعديل/حذف ختم (دعم ختمات متعددة)
- [ ] إضافة/تعديل/حذف قاطع

---

#### 8. **الربط بالمخزن (Inventory Integration)** 🟡
**السبب:** ربط العداد بالمواد من المخزن

**قاعدة البيانات:**
- [ ] إنشاء جدول `meter_inventory_items`:
  - `id`, `meter_id`, `inventory_item_id`, `item_type` (enum: "meter", "seal", "breaker", "other")
  - `quantity`, `serial_number`, `installation_date`, `notes`
  - `created_at`, `updated_at`

**Backend:**
- [ ] Router procedures:
  - `getMetersFromInventory` - الحصول على العدادات من المخزن
    - **فلترة حسب نوع الحساب:**
      - حساب STS: فقط عدادات STS (`externalIntegrationType: "sts"`)
      - حساب IoT (ACREL): فقط عدادات ACREL (`externalIntegrationType: "acrel"`)
      - حساب Offline: فقط العدادات العادية (`externalIntegrationType: "none"`)
      - حساب الدعم الحكومي: **جميع أنواع العدادات** (STS, IoT, Offline)
  - `linkMeterFromInventory` - ربط عداد من المخزن (نقل من المخزن إلى التركيب)
  - `getMeterInventoryItems` - الحصول على المواد المرتبطة بالعداد
  - `addMeterInventoryItem` - إضافة مادة مرتبطة بالعداد
  - `removeMeterInventoryItem` - إزالة مادة مرتبطة بالعداد

**Frontend:**
- [ ] تحديث `MetersManagement.tsx`: إضافة "إضافة عداد من المخزن"
- [ ] فلترة العدادات حسب نوع الحساب:
  - حساب STS: فقط عدادات STS
  - حساب IoT (ACREL): فقط عدادات ACREL
  - حساب Offline: فقط العدادات العادية
  - حساب الدعم الحكومي: جميع أنواع العدادات

---

#### 9. **آلية تبديل العداد (Replacement Workflow)** 🟡
**السبب:** عملية شائعة ومطلوبة

**قاعدة البيانات:**
- [ ] إنشاء جدول `meter_replacements`:
  - `id`, `business_id`, `meter_id` (العداد القديم), `new_meter_id` (العداد الجديد)
  - `replacement_reason`, `replacement_date`, `status` (enum: "pending", "approved", "in_progress", "completed")
  - `old_meter_status` (enum: "damaged", "defective", "obsolete", "other")
  - `approved_by`, `completed_by`, `completed_at`, `notes`
  - `created_at`, `updated_at`

**Backend:**
- [ ] Router procedures:
  - `createReplacementRequest` - إنشاء طلب تبديل
  - `getReplacementRequests` - قائمة طلبات التبديل
  - `approveReplacement` - الموافقة على التبديل
  - `selectNewMeter` - اختيار عداد جديد من المخزن
  - `completeReplacement` - إتمام التبديل
  - `returnDamagedMeter` - إرجاع العداد التالف إلى "مخزن التالف"

**Frontend:**
- [ ] تحديث `MeterReplacementWizard.tsx`:
  - ربط بـ `meter_replacements` table
  - اختيار عداد جديد من المخزن
  - إرجاع العداد التالف إلى مخزن التالف
  - إتمام العملية كجزء من field_operations

---

#### 10. **آلية إلغاء الاشتراك (Cancellation/Disconnection Workflow)** 🟡
**السبب:** إكمال دورة حياة الاشتراك

**قاعدة البيانات:**
- [ ] إنشاء جدول `subscription_cancellations`:
  - `id`, `business_id`, `customer_id`, `meter_id`
  - `cancellation_reason`, `cancellation_date`, `status` (enum: "pending", "approved", "disconnected", "completed")
  - `approved_by`, `disconnected_by`, `disconnected_at`, `notes`
  - `created_at`, `updated_at`

**Backend:**
- [ ] Router procedures:
  - `createCancellationRequest` - إنشاء طلب إلغاء اشتراك
  - `getCancellationRequests` - قائمة طلبات الإلغاء
  - `approveCancellation` - الموافقة على الإلغاء
  - `disconnectMeter` - فصل العداد (استخدام `disconnectMeter()` للـ IoT/STS)
  - `returnMeterToInventory` - إرجاع العداد إلى "مخزن المستخدم" (لإعادة الاستخدام)
  - `completeCancellation` - إتمام الإلغاء (ربط بـ field_operations)

**Frontend:**
- [ ] إنشاء `SubscriptionCancellations.tsx`:
  - قائمة طلبات الإلغاء
  - إنشاء طلب إلغاء جديد
  - الموافقة على الإلغاء
  - فصل العداد
  - إرجاع العداد إلى المخزن
  - إتمام العملية

---

#### 11. **الشكاوى (Complaints)** 🟡
**السبب:** ميزة مهمة لكن ليست حرجة

**قاعدة البيانات:**
- [ ] إنشاء جدول `complaints`:
  - `id`, `business_id`, `customer_id`, `meter_id`, `invoice_id`
  - `complaint_type` (enum: "billing", "service", "technical", "other")
  - `subject`, `description`, `status` (enum: "open", "in_progress", "resolved", "closed")
  - `priority` (enum: "low", "medium", "high", "urgent")
  - `assigned_to`, `resolved_by`, `resolved_at`, `resolution_notes`
  - `attachments` (json) - ملفات/صور مرفقة
  - `created_at`, `updated_at`

**Backend:**
- [ ] Router procedures:
  - `getComplaints` - قائمة الشكاوى مع فلترة
  - `getComplaint` - تفاصيل شكوى
  - `createComplaint` - إنشاء شكوى جديدة
  - `updateComplaint` - تحديث شكوى
  - `updateComplaintStatus` - تحديث حالة الشكوى
  - `assignComplaint` - تعيين شكوى لموظف
  - `resolveComplaint` - حل الشكوى
  - `getComplaintStats` - إحصائيات الشكاوى

**Frontend:**
- [ ] إنشاء `ComplaintsManagement.tsx`:
  - جدول قائمة الشكاوى مع فلترة وبحث
  - نموذج إنشاء/تعديل شكوى
  - عرض تفاصيل الشكوى
  - تحديث حالة الشكوى
  - تعيين الشكوى لموظف
  - حل الشكوى مع ملاحظات
  - إرفاق ملفات/صور

---

#### 12. **أكواد الشحن المسبق (Prepaid Codes)** 🟡
**السبب:** ميزة مفيدة لكن ليست أساسية

**قاعدة البيانات:**
- ✅ جدول `prepaid_codes` موجود في `billing-enhanced.ts`

**Backend:**
- [ ] Router procedures:
  - `generatePrepaidCode` - إنشاء كود شحن مسبق
  - `getPrepaidCodes` - قائمة أكواد الشحن
  - `validatePrepaidCode` - التحقق من صحة الكود
  - `usePrepaidCode` - استخدام الكود (شحن حساب عداد)
  - `getPrepaidCodeStats` - إحصائيات الأكواد

**Frontend:**
- [ ] إنشاء `PrepaidCodesManagement.tsx`:
  - قائمة أكواد الشحن مع فلترة
  - إنشاء كود جديد
  - عرض تفاصيل الكود
  - استخدام الكود

---

#### 13. **الإيصالات (Receipts)** 🟡
**السبب:** ميزة مفيدة لكن ليست أساسية

**قاعدة البيانات:**
- ✅ جدول `receipts` موجود في `billing-enhanced.ts`

**Backend:**
- [ ] Router procedures:
  - `generateReceipt` - إنشاء إيصال
  - `getReceipts` - قائمة الإيصالات
  - `getReceipt` - تفاصيل إيصال
  - `printReceipt` - طباعة إيصال (PDF)
  - `getReceiptStats` - إحصائيات الإيصالات

**Frontend:**
- [ ] إنشاء `ReceiptsManagement.tsx`:
  - قائمة الإيصالات مع فلترة
  - عرض تفاصيل الإيصال
  - طباعة الإيصال (PDF)
  - تحميل الإيصال

---

#### 14. **ميزة الخرائط (Maps Integration)** 🟡
**السبب:** تحسين تجربة المستخدم

**قاعدة البيانات:**
- [ ] إضافة `latitude` و `longitude` إلى `meters_enhanced` (تم ذكره في #2)
- [ ] إضافة `latitude` و `longitude` إلى `customers_enhanced`

**Backend:**
- [ ] Router procedures:
  - `updateMeterLocation` - تحديث موقع العداد
  - `updateCustomerLocation` - تحديث موقع العميل
  - `getMetersByLocation` - الحصول على العدادات حسب الموقع
  - `getCustomerLocation` - الحصول على موقع العميل
  - `getMeterInstallationMap` - الحصول على بيانات الخريطة للتركيب:
    - موقع العميل
    - موقع الطبلة المرتبط بها
    - معلومات العداد

**Frontend:**
- [ ] تحديث `MetersManagement.tsx`: إضافة خريطة
- [ ] عرض موقع العداد والكابينة على الخريطة
- [ ] عرض موقع العميل على الخريطة
- [ ] تحديث الموقع من تطبيق الموظف (GPS)
- [ ] عرض المهام على الخريطة في تطبيق الموظف
- [ ] إنشاء `MapComponent.tsx` (مكون الخريطة):
  - استخدام مكتبة خرائط (Google Maps, Leaflet, Mapbox)
  - عرض موقع العميل (marker)
  - عرض موقع الطبلة (marker)
  - رسم خط بينهما (اختياري)
  - تفاصيل عند النقر على الموقع

---

## 📊 ملخص الأولويات

### المرحلة 1: الأساسيات (Foundation) - 2-3 أسابيع
1. ✅ الربط الإداري (Organizational Linking)
2. ✅ حقول العداد الأساسية (Basic Meter Fields)

### المرحلة 2: الحسابات المالية (Financial Accounts) - 2-3 أسابيع
3. ✅ محفظة العميل (Customer Wallet)
4. ✅ حساب العداد (Meter Account)
5. ✅ الترحيل المالي/المحاسبي (Financial Transfers)

### المرحلة 3: آليات العمل (Workflows) - 3-4 أسابيع
6. ✅ آلية تركيب العداد (Installation Workflow)
7. ✅ الختومات والقواطع (Seals & Breakers)
8. ✅ الربط بالمخزن (Inventory Integration)
9. ✅ آلية تبديل العداد (Replacement Workflow)
10. ✅ آلية إلغاء الاشتراك (Cancellation Workflow)

### المرحلة 4: الميزات الإضافية (Additional Features) - 2-3 أسابيع
11. ✅ الشكاوى (Complaints)
12. ✅ أكواد الشحن المسبق (Prepaid Codes)
13. ✅ الإيصالات (Receipts)
14. ✅ ميزة الخرائط (Maps Integration)

---

## 📝 ملاحظات مهمة

### 1. **الترابط بين الميزات**
- **الربط الإداري** يجب أن يكون أولاً (يعتمد عليه كل شيء)
- **حساب العداد** يعتمد على **الربط الإداري**
- **آلية التركيب** تعتمد على **الربط بالمخزن** و **الربط الإداري**
- **ميزة الخرائط** تعتمد على **آلية التركيب**

### 2. **البيانات الموجودة**
- ✅ `customer_wallets` table موجود
- ✅ `prepaid_codes` table موجود
- ✅ `receipts` table موجود
- ✅ `meters_enhanced.balance` و `balanceDue` موجودان
- ✅ `field_operations` table موجود (يمكن استخدامه للتركيبات والاستبدالات)
- ✅ `materialRequests` و `materialRequestItems` موجودان في `field-ops.ts`

### 3. **التوافق مع الأنظمة الموجودة**
- ✅ `MeterReplacementWizard.tsx` موجود - يحتاج تحديث فقط
- ✅ `disconnectMeter()` موجود في ACREL و STS - يمكن استخدامه مباشرة
- ✅ `field_operations` موجود - يحتاج تحديث فقط

### 4. **الأولويات حسب الحاجة**
- إذا كان النظام يعمل حالياً، يمكن تأجيل الميزات المتوسطة/المنخفضة
- التركيز على الميزات الحرجة أولاً

---

## 📈 تقدير الوقت الإجمالي

- **المرحلة 1:** 2-3 أسابيع
- **المرحلة 2:** 2-3 أسابيع
- **المرحلة 3:** 3-4 أسابيع
- **المرحلة 4:** 2-3 أسابيع

**الإجمالي:** 9-13 أسبوع (2.5 - 3.5 شهر)

---

## 📁 الملفات المرجعية

1. **`REORGANIZATION_PLAN.md`** - الخطة التفصيلية لإعادة التنظيم
2. **`EXISTING_FEATURES_AUDIT.md`** - فحص الميزات الموجودة
3. **`IMPLEMENTATION_RECOMMENDATIONS.md`** - اقتراحات التنفيذ
4. **`BILLING_SYSTEM_TODO.md`** - قائمة المهام
5. **`COMPLETE_PLAN_SUMMARY.md`** - هذا الملف (الملخص الشامل)
6. **`MOBILE_APPS_SYSTEM_COMPLETE.md`** - ملخص نظام تطبيقات الجوال

---

**تاريخ الإنشاء:** 2024
**آخر تحديث:** 2024

