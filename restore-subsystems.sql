SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- استعادة أسماء ووصف الأنظمة الفرعية من النسخة السليمة
UPDATE custom_sub_systems
  SET name_ar = 'أعمال الحديدة',
      description = 'نظام إدارة أعمال الحديدة'
WHERE code = 'FR-001';

UPDATE custom_sub_systems
  SET name_ar = 'حسابات محمدي والعباسي',
      description = 'نظام حسابات محمدي والعباسي'
WHERE code = 'FR-002';

UPDATE custom_sub_systems
  SET name_ar = 'العباسي الرئيسي',
      description = 'النظام الرئيسي للعباسي'
WHERE code = 'FR-003';

UPDATE custom_sub_systems
  SET name_ar = 'العباسي شخصي',
      description = 'النظام الشخصي للعباسي'
WHERE code = 'FR-004';

-- استعادة أسماء الفروع
UPDATE branches SET name_ar = 'أعمال الحديدة'            WHERE id = 1;
UPDATE branches SET name_ar = 'حسابات محمدي والعباسي'    WHERE id = 2;
UPDATE branches SET name_ar = 'العباسي الرئيسي'          WHERE id = 3;
UPDATE branches SET name_ar = 'العباسي شخصي'              WHERE id = 4;

