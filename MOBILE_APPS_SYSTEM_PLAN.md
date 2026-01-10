# 📱 نظام تطبيقات الجوال - Mobile Apps System Plan

## 🎯 الهدف

إنشاء نظام شامل لإدارة تطبيقات الجوال (تطبيق العميل وتطبيق الموظف) مع تحديد الشاشات والوظائف والصلاحيات لكل تطبيق.

---

## 📊 الهيكل المقترح

```
📁 نظام تطبيقات الجوال
│
├─ 📱 تطبيق العميل (Customer App)
│  ├─ الشاشات والوظائف
│  ├─ الصلاحيات
│  └─ الإعدادات
│
└─ 👷 تطبيق الموظف (Employee/Field Worker App)
   ├─ الشاشات والوظائف
   ├─ الصلاحيات
   └─ الإعدادات
```

---

## 📱 تطبيق العميل (Customer App)

### **الشاشات الرئيسية:**

#### 1. **لوحة التحكم (Dashboard)**
- **الوظائف:**
  - عرض الرصيد المستحق
  - عرض آخر فاتورة
  - عرض آخر قراءة
  - إشعارات (فواتير جديدة، تنبيهات)
  - إحصائيات سريعة (الاستهلاك الشهري، المدفوعات)

#### 2. **الفواتير (Invoices)**
- **الوظائف:**
  - قائمة الفواتير (مع فلترة حسب الحالة)
  - تفاصيل الفاتورة
  - تحميل الفاتورة (PDF)
  - مشاركة الفاتورة
  - دفع الفاتورة (ربط ببوابة الدفع)

#### 3. **المدفوعات (Payments)**
- **الوظائف:**
  - سجل المدفوعات
  - تفاصيل الدفعة
  - تحميل الإيصال (PDF)
  - دفع فاتورة (من قائمة الفواتير)

#### 4. **العدادات (Meters)**
- **الوظائف:**
  - قائمة العدادات المرتبطة بالعميل
  - تفاصيل العداد (القراءة الحالية، الاستهلاك)
  - سجل القراءات
  - إشعارات (قراءة منخفضة، عطل)

#### 5. **القراءات (Readings)**
- **الوظائف:**
  - عرض القراءات السابقة
  - إدخال قراءة يدوية (إذا كان مسموحاً)
  - مقارنة الاستهلاك (شهري/سنوي)

#### 6. **المحفظة (Wallet)**
- **الوظائف:**
  - عرض رصيد المحفظة
  - شحن المحفظة (ربط ببوابة الدفع)
  - سجل معاملات المحفظة
  - استخدام المحفظة للدفع

#### 7. **الشكاوى (Complaints)**
- **الوظائف:**
  - تقديم شكوى جديدة
  - متابعة الشكاوى
  - تفاصيل الشكوى
  - إرفاق صور/ملفات

#### 8. **الملف الشخصي (Profile)**
- **الوظائف:**
  - عرض/تعديل البيانات الشخصية
  - تغيير كلمة المرور
  - إعدادات الإشعارات
  - اللغة والواجهة

#### 9. **الإشعارات (Notifications)**
- **الوظائف:**
  - قائمة الإشعارات
  - قراءة/عدم قراءة
  - حذف الإشعارات
  - إعدادات الإشعارات

---

## 👷 تطبيق الموظف (Employee/Field Worker App)

### **الشاشات الرئيسية:**

#### 1. **لوحة التحكم (Dashboard)**
- **الوظائف:**
  - المهام المخصصة اليوم
  - المهام المعلقة
  - الإحصائيات (المهام المكتملة، المتبقية)
  - الخريطة (موقع الموظف، المهام القريبة)

#### 2. **المهام (Tasks/Operations)**
- **الوظائف:**
  - قائمة المهام المخصصة
  - تفاصيل المهمة
  - بدء/إيقاف المهمة
  - تحديث حالة المهمة
  - إضافة ملاحظات
  - رفع صور/ملفات

#### 3. **القراءات (Meter Readings)**
- **الوظائف:**
  - قائمة العدادات المطلوب قراءتها
  - إدخال قراءة (يدوي/مسح QR)
  - رفع صورة للعداد
  - إدخال ملاحظات
  - تحديد الموقع (GPS)

#### 4. **التركيبات (Installations)**
- **الوظائف:**
  - قائمة عمليات التركيب المخصصة
  - تفاصيل عملية التركيب
  - تسجيل بيانات التركيب:
    - بيانات العداد
    - الختومات (رقم، لون)
    - القواطع
    - القراءة الأولية
    - الصور (قبل/بعد)
  - تحديد موقع العميل (GPS)
  - إتمام التركيب

#### 5. **الاستبدالات (Replacements)**
- **الوظائف:**
  - قائمة عمليات الاستبدال
  - تفاصيل العملية
  - تسجيل:
    - العداد القديم (التالف)
    - العداد الجديد
    - سبب الاستبدال
    - الصور
  - إتمام الاستبدال

#### 6. **الفصل/الربط (Disconnection/Reconnection)**
- **الوظائف:**
  - قائمة عمليات الفصل/الربط
  - تفاصيل العملية
  - تسجيل:
    - سبب الفصل/الربط
    - حالة العداد
    - الصور
  - إتمام العملية

#### 7. **الصيانة (Maintenance)**
- **الوظائف:**
  - قائمة أعمال الصيانة
  - تفاصيل العمل
  - تسجيل:
    - نوع الصيانة
    - الأجزاء المستبدلة
    - الوقت المستغرق
    - الصور
  - إتمام الصيانة

#### 8. **الفحص الميداني (Field Inspection)**
- **الوظائف:**
  - قائمة عمليات الفحص
  - نموذج الفحص
  - تسجيل:
    - نتائج الفحص
    - الصور
    - الملاحظات
  - إتمام الفحص

#### 9. **التحصيل (Collection)**
- **الوظائف:**
  - قائمة الفواتير المستحقة
  - تحصيل المدفوعات
  - إصدار إيصال (PDF)
  - تحديث حالة الفاتورة

#### 10. **المواد (Materials)**
- **الوظائف:**
  - طلب مواد
  - قائمة المواد المطلوبة
  - استلام مواد
  - إرجاع مواد

#### 11. **الموقع (Location/GPS)**
- **الوظائف:**
  - تتبع الموقع الحالي
  - عرض المهام على الخريطة
  - التنقل إلى موقع المهمة
  - تسجيل موقع عند إتمام المهمة

#### 12. **الملف الشخصي (Profile)**
- **الوظائف:**
  - عرض/تعديل البيانات الشخصية
  - تغيير كلمة المرور
  - إعدادات الإشعارات
  - اللغة والواجهة

#### 13. **الإشعارات (Notifications)**
- **الوظائف:**
  - قائمة الإشعارات
  - إشعارات المهام الجديدة
  - إشعارات التحديثات
  - إعدادات الإشعارات

---

## 🔐 نظام الصلاحيات

### **تطبيق العميل:**

| الصلاحية | الوصف |
|---------|-------|
| `customer:view_dashboard` | عرض لوحة التحكم |
| `customer:view_invoices` | عرض الفواتير |
| `customer:view_payments` | عرض المدفوعات |
| `customer:view_meters` | عرض العدادات |
| `customer:view_readings` | عرض القراءات |
| `customer:view_wallet` | عرض المحفظة |
| `customer:charge_wallet` | شحن المحفظة |
| `customer:pay_invoice` | دفع الفاتورة |
| `customer:create_complaint` | تقديم شكوى |
| `customer:view_complaints` | عرض الشكاوى |
| `customer:update_profile` | تحديث الملف الشخصي |

### **تطبيق الموظف:**

| الصلاحية | الوصف |
|---------|-------|
| `worker:view_dashboard` | عرض لوحة التحكم |
| `worker:view_tasks` | عرض المهام |
| `worker:start_task` | بدء مهمة |
| `worker:complete_task` | إتمام مهمة |
| `worker:read_meter` | قراءة عداد |
| `worker:install_meter` | تركيب عداد |
| `worker:replace_meter` | استبدال عداد |
| `worker:disconnect_meter` | فصل عداد |
| `worker:reconnect_meter` | ربط عداد |
| `worker:maintain_meter` | صيانة عداد |
| `worker:inspect_meter` | فحص عداد |
| `worker:collect_payment` | تحصيل دفعة |
| `worker:request_materials` | طلب مواد |
| `worker:receive_materials` | استلام مواد |
| `worker:update_location` | تحديث الموقع |
| `worker:upload_photos` | رفع صور |
| `worker:update_profile` | تحديث الملف الشخصي |

---

## 🗄️ قاعدة البيانات

### **جداول جديدة:**

#### 1. **`mobile_apps`**
```sql
CREATE TABLE mobile_apps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_id INT NOT NULL,
  app_type ENUM('customer', 'employee') NOT NULL,
  app_name VARCHAR(255) NOT NULL,
  app_version VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. **`mobile_app_screens`**
```sql
CREATE TABLE mobile_app_screens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  app_id INT NOT NULL,
  screen_code VARCHAR(100) NOT NULL,
  screen_name_ar VARCHAR(255) NOT NULL,
  screen_name_en VARCHAR(255),
  screen_type VARCHAR(50), -- 'dashboard', 'list', 'detail', 'form', 'map'
  route_path VARCHAR(255),
  icon VARCHAR(100),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSON, -- ['customer:view_invoices', ...]
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. **`mobile_app_features`**
```sql
CREATE TABLE mobile_app_features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  app_id INT NOT NULL,
  screen_id INT,
  feature_code VARCHAR(100) NOT NULL,
  feature_name_ar VARCHAR(255) NOT NULL,
  feature_name_en VARCHAR(255),
  feature_type VARCHAR(50), -- 'action', 'view', 'form_field'
  permission_code VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 4. **`mobile_app_permissions`**
```sql
CREATE TABLE mobile_app_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  app_id INT NOT NULL,
  permission_code VARCHAR(100) NOT NULL,
  permission_name_ar VARCHAR(255) NOT NULL,
  permission_name_en VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. **`user_mobile_app_access`**
```sql
CREATE TABLE user_mobile_app_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  app_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  granted_permissions JSON, -- ['customer:view_invoices', ...]
  denied_permissions JSON,
  last_access_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔌 Backend Router

### **`mobileAppsRouter.ts`**

```typescript
export const mobileAppsRouter = router({
  // Apps Management
  getApps: protectedProcedure.query(...),
  getApp: protectedProcedure.input(z.object({ appId: z.number() })).query(...),
  createApp: protectedProcedure.input(...).mutation(...),
  updateApp: protectedProcedure.input(...).mutation(...),
  
  // Screens Management
  getScreens: protectedProcedure.input(z.object({ appId: z.number() })).query(...),
  getScreen: protectedProcedure.input(...).query(...),
  createScreen: protectedProcedure.input(...).mutation(...),
  updateScreen: protectedProcedure.input(...).mutation(...),
  
  // Features Management
  getFeatures: protectedProcedure.input(z.object({ appId: z.number(), screenId: z.number().optional() })).query(...),
  createFeature: protectedProcedure.input(...).mutation(...),
  updateFeature: protectedProcedure.input(...).mutation(...),
  
  // Permissions Management
  getPermissions: protectedProcedure.input(z.object({ appId: z.number() })).query(...),
  createPermission: protectedProcedure.input(...).mutation(...),
  
  // User Access
  getUserAccess: protectedProcedure.input(z.object({ userId: z.number(), appId: z.number() })).query(...),
  grantAccess: protectedProcedure.input(...).mutation(...),
  revokeAccess: protectedProcedure.input(...).mutation(...),
  
  // App Configuration
  getAppConfig: protectedProcedure.input(z.object({ appId: z.number() })).query(...),
  updateAppConfig: protectedProcedure.input(...).mutation(...),
});
```

---

## 🎨 Frontend Pages

### **1. `MobileAppsManagement.tsx`**
- قائمة التطبيقات (تطبيق العميل، تطبيق الموظف)
- إعدادات كل تطبيق
- تفعيل/تعطيل التطبيق

### **2. `CustomerAppScreens.tsx`**
- إدارة شاشات تطبيق العميل
- إضافة/تعديل/حذف شاشة
- تحديد الصلاحيات لكل شاشة

### **3. `EmployeeAppScreens.tsx`**
- إدارة شاشات تطبيق الموظف
- إضافة/تعديل/حذف شاشة
- تحديد الصلاحيات لكل شاشة

### **4. `MobileAppPermissions.tsx`**
- إدارة صلاحيات التطبيقات
- ربط الصلاحيات بالشاشات والوظائف

### **5. `UserMobileAccess.tsx`**
- إدارة وصول المستخدمين للتطبيقات
- منح/سحب الصلاحيات
- عرض سجل الوصول

---

## 📋 قائمة المهام

### **قاعدة البيانات:**
- [ ] إنشاء جدول `mobile_apps`
- [ ] إنشاء جدول `mobile_app_screens`
- [ ] إنشاء جدول `mobile_app_features`
- [ ] إنشاء جدول `mobile_app_permissions`
- [ ] إنشاء جدول `user_mobile_app_access`
- [ ] إنشاء Migration

### **Backend:**
- [ ] إنشاء `mobileAppsRouter.ts`
- [ ] إضافة Router إلى `routers.ts`
- [ ] إنشاء Service layer (اختياري)

### **Frontend:**
- [ ] إنشاء `MobileAppsManagement.tsx`
- [ ] إنشاء `CustomerAppScreens.tsx`
- [ ] إنشاء `EmployeeAppScreens.tsx`
- [ ] إنشاء `MobileAppPermissions.tsx`
- [ ] إنشاء `UserMobileAccess.tsx`
- [ ] إضافة القسم إلى `Dashboard.tsx`

### **Seed Data:**
- [ ] Seed بيانات تطبيق العميل (الشاشات، الوظائف، الصلاحيات)
- [ ] Seed بيانات تطبيق الموظف (الشاشات، الوظائف، الصلاحيات)

---

**تاريخ الإنشاء:** 2024
**الحالة:** 📋 مخطط

