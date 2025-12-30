-- Migration: إضافة نظام أنواع الحسابات القابلة للتخصيص
-- Date: 2025-12-31
-- Description: تحويل أنواع الحسابات من ENUM ثابت إلى نظام مخصص قابل للتوسع

-- 1. إنشاء جدول أنواع الحسابات المخصصة
CREATE TABLE IF NOT EXISTS `custom_account_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_id` INT NOT NULL,
  
  -- معلومات النوع
  `type_code` VARCHAR(50) NOT NULL,
  `type_name_ar` VARCHAR(100) NOT NULL,
  `type_name_en` VARCHAR(100),
  
  -- الوصف والتنسيق
  `description` TEXT,
  `color` VARCHAR(20),
  `icon` VARCHAR(50),
  
  -- الترتيب والإعدادات
  `display_order` INT DEFAULT 0 NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE NOT NULL,
  `is_system_type` BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- التتبع
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  -- الفهارس
  INDEX `cat_business_idx` (`business_id`),
  INDEX `cat_type_code_idx` (`type_code`),
  UNIQUE INDEX `cat_business_code_unique` (`business_id`, `type_code`),
  INDEX `cat_is_active_idx` (`is_active`),
  INDEX `cat_display_order_idx` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. إدراج الأنواع الافتراضية (النظامية)
INSERT INTO `custom_account_types` 
  (`business_id`, `type_code`, `type_name_ar`, `type_name_en`, `color`, `icon`, `display_order`, `is_active`, `is_system_type`)
VALUES
  (1, 'asset', 'أصول', 'Assets', '#10b981', 'TrendingUp', 1, TRUE, TRUE),
  (1, 'liability', 'التزامات', 'Liabilities', '#ef4444', 'TrendingDown', 2, TRUE, TRUE),
  (1, 'equity', 'حقوق ملكية', 'Equity', '#8b5cf6', 'Users', 3, TRUE, TRUE),
  (1, 'revenue', 'إيرادات', 'Revenue', '#3b82f6', 'ArrowUpCircle', 4, TRUE, TRUE),
  (1, 'expense', 'مصروفات', 'Expenses', '#f59e0b', 'ArrowDownCircle', 5, TRUE, TRUE);

-- 3. تعديل جدول custom_accounts
-- إضافة عمود account_type_id
ALTER TABLE `custom_accounts` 
  ADD COLUMN `account_type_id` INT AFTER `account_type`,
  ADD INDEX `ca_account_type_id_idx` (`account_type_id`);

-- 4. تحديث البيانات الموجودة - ربط الحسابات بالأنواع الجديدة
UPDATE `custom_accounts` ca
INNER JOIN `custom_account_types` cat 
  ON ca.account_type = cat.type_code AND ca.business_id = cat.business_id
SET ca.account_type_id = cat.id;

-- 5. تعديل جدول custom_account_sub_types أيضاً
ALTER TABLE `custom_account_sub_types`
  ADD COLUMN `account_type_id` INT AFTER `account_type`,
  ADD INDEX `cast_account_type_id_idx` (`account_type_id`);

-- 6. تحديث البيانات في custom_account_sub_types
UPDATE `custom_account_sub_types` cast
INNER JOIN `custom_account_types` cat 
  ON cast.account_type = cat.type_code AND cast.business_id = cat.business_id
SET cast.account_type_id = cat.id;

-- ملاحظة: لم نحذف عمود account_type القديم للحفاظ على التوافقية
-- يمكن حذفه لاحقاً بعد التأكد من عمل النظام الجديد
