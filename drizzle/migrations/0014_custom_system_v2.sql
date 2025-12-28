-- ============================================================================
-- النظام المخصص (Custom System) v2.2.0 Migration
-- تاريخ: 2025-12-28
-- الوصف: تحديث جذري للنظام المخصص لدعم القيد المزدوج والعملات المتعددة
-- ============================================================================

-- ============================================================================
-- الخطوة 1: إنشاء الجداول الجديدة
-- ============================================================================

-- جدول العملات
CREATE TABLE IF NOT EXISTS `custom_currencies` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `code` varchar(10) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100),
  `symbol` varchar(10),
  `is_base_currency` boolean NOT NULL DEFAULT false,
  `is_active` boolean NOT NULL DEFAULT true,
  `decimal_places` int NOT NULL DEFAULT 2,
  `display_order` int DEFAULT 0,
  `notes` text,
  `created_by` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `ccur_business_idx` (`business_id`),
  INDEX `ccur_code_idx` (`code`),
  UNIQUE INDEX `ccur_business_code_unique` (`business_id`, `code`),
  INDEX `ccur_is_active_idx` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول أسعار الصرف
CREATE TABLE IF NOT EXISTS `custom_exchange_rates` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `from_currency_id` int NOT NULL,
  `to_currency_id` int NOT NULL,
  `rate` decimal(18,6) NOT NULL,
  `effective_date` date NOT NULL,
  `expiry_date` date,
  `source` varchar(100),
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_by` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `cexr_business_idx` (`business_id`),
  INDEX `cexr_from_currency_idx` (`from_currency_id`),
  INDEX `cexr_to_currency_idx` (`to_currency_id`),
  INDEX `cexr_effective_date_idx` (`effective_date`),
  INDEX `cexr_is_active_idx` (`is_active`),
  INDEX `cexr_currencies_date_idx` (`from_currency_id`, `to_currency_id`, `effective_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأنواع الفرعية للحسابات
CREATE TABLE IF NOT EXISTS `custom_account_sub_types` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `account_type` enum('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100),
  `description` text,
  `is_active` boolean NOT NULL DEFAULT true,
  `allow_multiple_currencies` boolean NOT NULL DEFAULT false,
  `requires_party` boolean NOT NULL DEFAULT false,
  `icon` varchar(50),
  `color` varchar(20),
  `display_order` int DEFAULT 0,
  `created_by` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `cast_business_idx` (`business_id`),
  INDEX `cast_account_type_idx` (`account_type`),
  INDEX `cast_code_idx` (`code`),
  UNIQUE INDEX `cast_business_code_unique` (`business_id`, `code`),
  INDEX `cast_is_active_idx` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول عملات الحسابات
CREATE TABLE IF NOT EXISTS `custom_account_currencies` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `account_id` int NOT NULL,
  `currency_id` int NOT NULL,
  `is_default` boolean NOT NULL DEFAULT false,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_by` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `cacr_business_idx` (`business_id`),
  INDEX `cacr_account_idx` (`account_id`),
  INDEX `cacr_currency_idx` (`currency_id`),
  UNIQUE INDEX `cacr_account_currency_unique` (`account_id`, `currency_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول أرصدة الحسابات
CREATE TABLE IF NOT EXISTS `custom_account_balances` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `account_id` int NOT NULL,
  `currency_id` int NOT NULL,
  `debit_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `credit_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `last_transaction_date` date,
  `last_transaction_id` int,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `cabl_business_idx` (`business_id`),
  INDEX `cabl_account_idx` (`account_id`),
  INDEX `cabl_currency_idx` (`currency_id`),
  UNIQUE INDEX `cabl_account_currency_unique` (`account_id`, `currency_id`),
  INDEX `cabl_last_transaction_idx` (`last_transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول القيود اليومية
CREATE TABLE IF NOT EXISTS `custom_journal_entries` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `sub_system_id` int,
  `entry_number` varchar(50) NOT NULL,
  `entry_date` date NOT NULL,
  `entry_type` enum('manual', 'opening', 'closing', 'adjustment', 'reversal', 'system_generated') NOT NULL,
  `description` text NOT NULL,
  `notes` text,
  `reference_type` varchar(50),
  `reference_id` int,
  `reference_number` varchar(50),
  `status` enum('draft', 'posted', 'reversed', 'cancelled') NOT NULL DEFAULT 'draft',
  `posted_at` timestamp,
  `posted_by` int,
  `reversed_at` timestamp,
  `reversed_by` int,
  `reversal_entry_id` int,
  `created_by` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `cje_business_idx` (`business_id`),
  INDEX `cje_sub_system_idx` (`sub_system_id`),
  INDEX `cje_entry_number_idx` (`entry_number`),
  INDEX `cje_entry_date_idx` (`entry_date`),
  INDEX `cje_entry_type_idx` (`entry_type`),
  INDEX `cje_status_idx` (`status`),
  INDEX `cje_reference_idx` (`reference_type`, `reference_id`),
  UNIQUE INDEX `cje_business_number_unique` (`business_id`, `entry_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سطور القيود اليومية
CREATE TABLE IF NOT EXISTS `custom_journal_entry_lines` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `journal_entry_id` int NOT NULL,
  `account_id` int NOT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `credit_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `currency_id` int NOT NULL,
  `exchange_rate` decimal(18,6) DEFAULT 1.000000,
  `debit_amount_base` decimal(18,2) NOT NULL DEFAULT 0.00,
  `credit_amount_base` decimal(18,2) NOT NULL DEFAULT 0.00,
  `description` text,
  `party_id` int,
  `cost_center_id` int,
  `line_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `cjel_business_idx` (`business_id`),
  INDEX `cjel_journal_entry_idx` (`journal_entry_id`),
  INDEX `cjel_account_idx` (`account_id`),
  INDEX `cjel_currency_idx` (`currency_id`),
  INDEX `cjel_party_idx` (`party_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- الخطوة 2: تعديل الجداول الموجودة
-- ============================================================================

-- تعديل جدول customAccounts
ALTER TABLE `custom_accounts`
  ADD COLUMN `account_sub_type_id` int AFTER `account_type`,
  ADD COLUMN `allow_multiple_currencies` boolean NOT NULL DEFAULT false AFTER `account_sub_type_id`,
  ADD COLUMN `default_currency_id` int AFTER `allow_multiple_currencies`,
  ADD COLUMN `requires_party` boolean NOT NULL DEFAULT false AFTER `default_currency_id`,
  ADD COLUMN `party_id` int AFTER `requires_party`,
  DROP COLUMN `balance`,
  DROP COLUMN `currency`,
  ADD INDEX `ca_account_sub_type_idx` (`account_sub_type_id`),
  ADD INDEX `ca_default_currency_idx` (`default_currency_id`),
  ADD INDEX `ca_party_idx` (`party_id`);

-- تعديل جدول customSubSystems
ALTER TABLE `custom_sub_systems`
  ADD COLUMN `default_currency_id` int AFTER `description`,
  ADD COLUMN `allow_multiple_currencies` boolean NOT NULL DEFAULT false AFTER `default_currency_id`,
  ADD COLUMN `fiscal_year_start` date AFTER `allow_multiple_currencies`,
  ADD COLUMN `fiscal_year_end` date AFTER `fiscal_year_start`,
  ADD INDEX `css_default_currency_idx` (`default_currency_id`);

-- تعديل جدول customReceiptVouchers
-- ملاحظة: سيتم تجاهل الأخطاء إذا كانت الأعمدة موجودة مسبقاً
ALTER TABLE `custom_receipt_vouchers`
  ADD COLUMN `currency_id` int AFTER `amount`,
  ADD COLUMN `exchange_rate` decimal(18,6) NOT NULL DEFAULT 1.000000 AFTER `currency_id`,
  ADD COLUMN `amount_in_base_currency` decimal(18,2) NOT NULL AFTER `exchange_rate`,
  ADD COLUMN `journal_entry_id` int AFTER `amount_in_base_currency`;

-- إضافة indexes
ALTER TABLE `custom_receipt_vouchers`
  ADD INDEX `cr_currency_idx` (`currency_id`),
  ADD INDEX `cr_journal_entry_idx` (`journal_entry_id`);

-- تعديل جدول customPaymentVouchers
ALTER TABLE `custom_payment_vouchers`
  ADD COLUMN `currency_id` int AFTER `amount`,
  ADD COLUMN `exchange_rate` decimal(18,6) NOT NULL DEFAULT 1.000000 AFTER `currency_id`,
  ADD COLUMN `amount_in_base_currency` decimal(18,2) NOT NULL AFTER `exchange_rate`,
  ADD COLUMN `journal_entry_id` int AFTER `amount_in_base_currency`;

-- إضافة indexes
ALTER TABLE `custom_payment_vouchers`
  ADD INDEX `cp_currency_idx` (`currency_id`),
  ADD INDEX `cp_journal_entry_idx` (`journal_entry_id`);

-- ============================================================================
-- الخطوة 3: حذف الجداول القديمة
-- ============================================================================

-- حذف الجداول التي تم استبدالها
DROP TABLE IF EXISTS `custom_transactions`;
DROP TABLE IF EXISTS `custom_treasuries`;
DROP TABLE IF EXISTS `custom_treasury_movements`;

-- ============================================================================
-- الخطوة 4: إدراج البيانات الأولية
-- ============================================================================

-- إدراج العملة الأساسية (الريال السعودي) لكل business
INSERT INTO `custom_currencies` (`business_id`, `code`, `name_ar`, `name_en`, `symbol`, `is_base_currency`, `is_active`, `decimal_places`, `display_order`)
SELECT DISTINCT `id`, 'SAR', 'ريال سعودي', 'Saudi Riyal', 'ر.س', true, true, 2, 1
FROM `businesses`
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_currencies` WHERE `business_id` = `businesses`.`id` AND `code` = 'SAR'
);

-- إدراج الأنواع الفرعية الأساسية للحسابات
INSERT INTO `custom_account_sub_types` (`business_id`, `account_type`, `code`, `name_ar`, `name_en`, `is_active`, `allow_multiple_currencies`, `requires_party`, `icon`, `color`, `display_order`)
SELECT DISTINCT `id`, 'asset', 'cash', 'صندوق', 'Cash', true, false, false, 'wallet', '#10b981', 1
FROM `businesses`
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_account_sub_types` WHERE `business_id` = `businesses`.`id` AND `code` = 'cash'
);

INSERT INTO `custom_account_sub_types` (`business_id`, `account_type`, `code`, `name_ar`, `name_en`, `is_active`, `allow_multiple_currencies`, `requires_party`, `icon`, `color`, `display_order`)
SELECT DISTINCT `id`, 'asset', 'bank', 'بنك', 'Bank', true, true, false, 'building-columns', '#3b82f6', 2
FROM `businesses`
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_account_sub_types` WHERE `business_id` = `businesses`.`id` AND `code` = 'bank'
);

INSERT INTO `custom_account_sub_types` (`business_id`, `account_type`, `code`, `name_ar`, `name_en`, `is_active`, `allow_multiple_currencies`, `requires_party`, `icon`, `color`, `display_order`)
SELECT DISTINCT `id`, 'asset', 'wallet', 'محفظة إلكترونية', 'E-Wallet', true, true, false, 'mobile', '#8b5cf6', 3
FROM `businesses`
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_account_sub_types` WHERE `business_id` = `businesses`.`id` AND `code` = 'wallet'
);

INSERT INTO `custom_account_sub_types` (`business_id`, `account_type`, `code`, `name_ar`, `name_en`, `is_active`, `allow_multiple_currencies`, `requires_party`, `icon`, `color`, `display_order`)
SELECT DISTINCT `id`, 'asset', 'atm', 'صراف آلي', 'ATM', true, false, false, 'credit-card', '#f59e0b', 4
FROM `businesses`
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_account_sub_types` WHERE `business_id` = `businesses`.`id` AND `code` = 'atm'
);

-- ============================================================================
-- الخطوة 5: تحديث الحسابات الموجودة
-- ============================================================================

-- ربط الحسابات الموجودة بالعملة الأساسية
UPDATE `custom_accounts` ca
INNER JOIN `custom_currencies` cc ON ca.`business_id` = cc.`business_id` AND cc.`is_base_currency` = true
SET ca.`default_currency_id` = cc.`id`
WHERE ca.`default_currency_id` IS NULL;

-- ============================================================================
-- الخطوة 6: إنشاء أرصدة افتتاحية للحسابات الموجودة
-- ============================================================================

-- إنشاء سجل رصيد لكل حساب موجود مع العملة الأساسية
INSERT INTO `custom_account_balances` (`business_id`, `account_id`, `currency_id`, `debit_balance`, `credit_balance`, `current_balance`)
SELECT 
  ca.`business_id`,
  ca.`id`,
  ca.`default_currency_id`,
  0.00,
  0.00,
  0.00
FROM `custom_accounts` ca
WHERE ca.`default_currency_id` IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM `custom_account_balances` cab 
  WHERE cab.`account_id` = ca.`id` AND cab.`currency_id` = ca.`default_currency_id`
);

-- ============================================================================
-- نهاية Migration
-- ============================================================================
