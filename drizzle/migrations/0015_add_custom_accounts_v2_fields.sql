-- Migration: إضافة الحقول الجديدة لجدول custom_accounts في v2.2.0
-- التاريخ: 2025-01-XX

-- ملاحظة: يجب تشغيل هذا الـ migration يدوياً إذا فشل التطبيق التلقائي
-- يمكنك تشغيله من خلال MySQL client أو phpMyAdmin

-- إضافة الحقول الجديدة (مع تجاهل الأخطاء إذا كانت موجودة بالفعل)
ALTER TABLE `custom_accounts`
  ADD COLUMN `account_name_en` varchar(255) AFTER `account_name_ar`,
  ADD COLUMN `sub_system_id` int AFTER `business_id`,
  ADD COLUMN `parent_account_id` int AFTER `parent_id`,
  ADD COLUMN `level` int NOT NULL DEFAULT 1 AFTER `parent_account_id`,
  ADD COLUMN `allow_manual_entry` boolean NOT NULL DEFAULT true,
  ADD COLUMN `requires_cost_center` boolean NOT NULL DEFAULT false;

-- إضافة indexes (مع تجاهل الأخطاء إذا كانت موجودة بالفعل)
CREATE INDEX `ca_account_code_idx` ON `custom_accounts` (`account_code`);
CREATE INDEX `ca_sub_system_idx` ON `custom_accounts` (`sub_system_id`);
CREATE INDEX `ca_parent_account_idx` ON `custom_accounts` (`parent_account_id`);
CREATE INDEX `ca_level_idx` ON `custom_accounts` (`level`);
