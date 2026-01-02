# تصميم نظام أنواع الحسابات القابلة للتخصيص

## المشكلة الحالية
أنواع الحسابات محددة بشكل ثابت في قاعدة البيانات:
- asset (أصول)
- liability (التزامات)
- equity (حقوق ملكية)
- revenue (إيرادات)
- expense (مصروفات)

## الحل المقترح
إنشاء جدول جديد `custom_account_types` يسمح بإضافة أنواع مخصصة

### البنية الجديدة

#### جدول: custom_account_types
```sql
CREATE TABLE custom_account_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  
  -- معلومات النوع
  type_code VARCHAR(50) NOT NULL,           -- مثل: "iron_works", "personal_accounts"
  type_name_ar VARCHAR(100) NOT NULL,       -- مثل: "أعمال الحديدة", "حسابات شخصية"
  type_name_en VARCHAR(100),                -- مثل: "Iron Works", "Personal Accounts"
  
  -- الوصف
  description TEXT,
  color VARCHAR(20),                        -- لون مميز للنوع
  icon VARCHAR(50),                         -- أيقونة مميزة
  
  -- الترتيب والإعدادات
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_system_type BOOLEAN DEFAULT FALSE,     -- للأنواع الافتراضية (لا يمكن حذفها)
  
  -- التتبع
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- الفهارس
  INDEX (business_id),
  INDEX (type_code),
  UNIQUE INDEX (business_id, type_code)
);
```

#### تعديل جدول: custom_accounts
```sql
ALTER TABLE custom_accounts
  MODIFY COLUMN account_type VARCHAR(50),  -- تغيير من ENUM إلى VARCHAR
  ADD COLUMN account_type_id INT,          -- ربط بجدول الأنواع
  ADD INDEX (account_type_id);
```

### خطة الترحيل (Migration)
1. إنشاء جدول `custom_account_types`
2. إضافة الأنواع الافتراضية (الخمسة الموجودة حالياً)
3. تعديل عمود `account_type` في `custom_accounts`
4. ترحيل البيانات الموجودة

### الأنواع الافتراضية
```json
[
  {
    "type_code": "asset",
    "type_name_ar": "أصول",
    "type_name_en": "Assets",
    "is_system_type": true,
    "display_order": 1
  },
  {
    "type_code": "liability",
    "type_name_ar": "التزامات",
    "type_name_en": "Liabilities",
    "is_system_type": true,
    "display_order": 2
  },
  {
    "type_code": "equity",
    "type_name_ar": "حقوق ملكية",
    "type_name_en": "Equity",
    "is_system_type": true,
    "display_order": 3
  },
  {
    "type_code": "revenue",
    "type_name_ar": "إيرادات",
    "type_name_en": "Revenue",
    "is_system_type": true,
    "display_order": 4
  },
  {
    "type_code": "expense",
    "type_name_ar": "مصروفات",
    "type_name_en": "Expenses",
    "is_system_type": true,
    "display_order": 5
  }
]
```

### API Endpoints
```typescript
// إدارة أنواع الحسابات
POST   /api/custom/account-types          // إنشاء نوع جديد
GET    /api/custom/account-types          // قائمة الأنواع
GET    /api/custom/account-types/:id      // تفاصيل نوع
PUT    /api/custom/account-types/:id      // تحديث نوع
DELETE /api/custom/account-types/:id      // حذف نوع (فقط الأنواع غير النظامية)
```

### الواجهة
- صفحة إدارة أنواع الحسابات في إعدادات النظام
- إمكانية إضافة/تعديل/حذف الأنواع المخصصة
- عند إضافة حساب جديد، يتم اختيار النوع من القائمة الديناميكية
