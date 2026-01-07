-- ضبط الترميز
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- 1) الأنظمة الفرعية
UPDATE custom_sub_systems
  SET name_ar = 'الفرع الأول',
      description = 'النظام الفرعي للفرع الأول'
WHERE code = 'FR-001';

UPDATE custom_sub_systems
  SET name_ar = 'الفرع الثاني',
      description = 'النظام الفرعي للفرع الثاني'
WHERE code = 'FR-002';

UPDATE custom_sub_systems
  SET name_ar = 'فرع العباسي الرئيسي',
      description = 'النظام الفرعي الرئيسي لشركة العباسي'
WHERE code = 'FR-003';

UPDATE custom_sub_systems
  SET name_ar = 'فرع العباسي الشخصي',
      description = 'النظام الفرعي الشخصي لشركة العباسي'
WHERE code = 'FR-004';

-- 2) الفروع
UPDATE branches SET name_ar = 'الفرع الأول' WHERE id = 1;
UPDATE branches SET name_ar = 'الفرع الثاني' WHERE id = 2;
UPDATE branches SET name_ar = 'فرع العباسي الرئيسي' WHERE id = 3;
UPDATE branches SET name_ar = 'فرع العباسي الشخصي' WHERE id = 4;

-- 3) أنواع الحسابات الفرعية
UPDATE custom_account_sub_types SET name_ar = 'نقدية' WHERE code = 'cash';
UPDATE custom_account_sub_types SET name_ar = 'بنك' WHERE code = 'bank';
UPDATE custom_account_sub_types SET name_ar = 'محفظة' WHERE code = 'wallet';
UPDATE custom_account_sub_types SET name_ar = 'صرف' WHERE code = 'exchange';
UPDATE custom_account_sub_types SET name_ar = 'مستودع' WHERE code = 'warehouse';
UPDATE custom_account_sub_types SET name_ar = 'عام' WHERE code = 'general';
UPDATE custom_account_sub_types SET name_ar = 'مورد' WHERE code = 'supplier';
UPDATE custom_account_sub_types SET name_ar = 'عميل' WHERE code = 'customer';

-- 4) العملات
UPDATE custom_currencies SET name_ar = 'ريال يمني' WHERE code = 'YER';
UPDATE custom_currencies SET name_ar = 'ريال سعودي' WHERE code = 'SAR';
UPDATE custom_currencies SET name_ar = 'دولار أمريكي' WHERE code = 'USD';

-- 5) الحسابات الرئيسية
UPDATE custom_accounts SET account_name_ar = 'الصندوق الرئيسي - العباسي' WHERE account_code = '1000';
UPDATE custom_accounts SET account_name_ar = 'صندوق التحصيل الرئيسي' WHERE account_code = '1001';
UPDATE custom_accounts SET account_name_ar = 'الحساب البنكي الرئيسي' WHERE account_code = '1002';
UPDATE custom_accounts SET account_name_ar = 'أموال التحصيل والتوريد' WHERE account_code = '1003';
UPDATE custom_accounts SET account_name_ar = 'أموال التحصيل والتوريد - الدهيمية' WHERE account_code = '10031';
UPDATE custom_accounts SET account_name_ar = 'أموال التحصيل والتوريد - الغليل' WHERE account_code = '10032';
UPDATE custom_accounts SET account_name_ar = 'أموال التحصيل والتوريد - الصبالية' WHERE account_code = '10033';

-- 6) المستخدمون (للتأكد)
UPDATE users SET name = 'مدير النظام' WHERE id = 1;
UPDATE users SET name = 'مستخدم تجريبي' WHERE id = 2;


