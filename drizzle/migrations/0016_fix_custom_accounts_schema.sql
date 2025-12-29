-- Migration: إصلاح عدم تطابق schema جدول custom_accounts
-- التاريخ: 2025-01-XX
-- الوصف: إعادة تسمية الأعمدة الموجودة وإضافة الحقول المفقودة لتتوافق مع customSystemV2.ts

-- الخطوة 1: إعادة تسمية الأعمدة الموجودة
ALTER TABLE `custom_accounts`
  CHANGE COLUMN `account_number` `account_code` varchar(50) NOT NULL,
  CHANGE COLUMN `account_name` `account_name_ar` varchar(255) NOT NULL,
  CHANGE COLUMN `parent_id` `parent_account_id` int;

-- الخطوة 2: إضافة الحقول الجديدة (مع تجاهل الأخطاء إذا كانت موجودة بالفعل)
ALTER TABLE `custom_accounts`
  ADD COLUMN IF NOT EXISTS `account_name_en` varchar(255) AFTER `account_name_ar`,
  ADD COLUMN IF NOT EXISTS `sub_system_id` int AFTER `business_id`,
  ADD COLUMN IF NOT EXISTS `level` int NOT NULL DEFAULT 1 AFTER `parent_account_id`,
  ADD COLUMN IF NOT EXISTS `allow_manual_entry` boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS `requires_cost_center` boolean NOT NULL DEFAULT false;

-- الخطوة 3: إضافة indexes (مع تجاهل الأخطاء إذا كانت موجودة بالفعل)
CREATE INDEX IF NOT EXISTS `ca_account_code_idx` ON `custom_accounts` (`account_code`);
CREATE INDEX IF NOT EXISTS `ca_sub_system_idx` ON `custom_accounts` (`sub_system_id`);
CREATE INDEX IF NOT EXISTS `ca_parent_account_idx` ON `custom_accounts` (`parent_account_id`);
CREATE INDEX IF NOT EXISTS `ca_level_idx` ON `custom_accounts` (`level`);

-- ملاحظة: MySQL لا يدعم IF NOT EXISTS في ALTER TABLE ADD COLUMN
-- إذا فشل التطبيق، قم بتشغيل الأوامر التالية يدوياً بعد التحقق من وجود الأعمدة:

-- للتحقق من وجود الأعمدة:
-- DESCRIBE `custom_accounts`;

-- إذا كانت الأعمدة موجودة بالفعل، استخدم:
-- ALTER TABLE `custom_accounts`
--   ADD COLUMN `account_name_en` varchar(255) AFTER `account_name_ar`,
--   ADD COLUMN `sub_system_id` int AFTER `business_id`,
--   ADD COLUMN `level` int NOT NULL DEFAULT 1 AFTER `parent_account_id`,
--   ADD COLUMN `allow_manual_entry` boolean NOT NULL DEFAULT true,
--   ADD COLUMN `requires_cost_center` boolean NOT NULL DEFAULT false;

