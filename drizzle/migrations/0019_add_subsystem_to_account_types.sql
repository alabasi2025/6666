-- Migration: Add sub_system_id to custom_account_types
-- Date: 2025-12-31
-- Description: ربط أنواع الحسابات بالأنظمة الفرعية

-- إضافة حقل sub_system_id
ALTER TABLE `custom_account_types` 
ADD COLUMN `sub_system_id` INT NULL AFTER `business_id`;

-- إضافة index للبحث السريع
CREATE INDEX `cat_sub_system_idx` ON `custom_account_types` (`sub_system_id`);

-- تحديث الأنواع الافتراضية لتكون عامة (null = للجميع)
UPDATE `custom_account_types` SET `sub_system_id` = NULL WHERE `is_system_type` = 1;
