-- ============================================================================
-- إصلاح الجداول المفقودة في النظام المخصص
-- Missing Tables Fix for Custom System
-- التاريخ: 2 يناير 2026
-- ============================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================================
-- 1. جدول custom_transactions (إذا لم يكن موجوداً)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `custom_transactions` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `business_id` INT NOT NULL,
  `transaction_number` VARCHAR(50) NOT NULL,
  `transaction_date` DATE NOT NULL,
  `account_id` INT NOT NULL,
  `transaction_type` ENUM('debit', 'credit') NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) DEFAULT 'SAR',
  `description` TEXT,
  `reference_type` VARCHAR(50),
  `reference_id` INT,
  `notes` TEXT,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `ctx_business_idx` (`business_id`),
  INDEX `ctx_account_idx` (`account_id`),
  INDEX `ctx_date_idx` (`transaction_date`),
  INDEX `ctx_type_idx` (`transaction_type`),
  INDEX `ctx_reference_idx` (`reference_type`, `reference_id`),
  UNIQUE INDEX `ctx_number_unique` (`business_id`, `transaction_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. جدول custom_treasury_movements (إذا لم يكن موجوداً)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `custom_treasury_movements` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `business_id` INT NOT NULL,
  `sub_system_id` INT NOT NULL,
  `treasury_id` INT NOT NULL,
  `currency_id` INT NOT NULL,
  `movement_date` DATE NOT NULL,
  `movement_type` ENUM('in','out','transfer','opening','closing','adjustment') NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `exchange_rate` DECIMAL(18,6) DEFAULT 1.000000,
  `amount_in_base_currency` DECIMAL(18,2),
  `reference_type` VARCHAR(50),
  `reference_id` INT,
  `party_id` INT,
  `from_treasury_id` INT,
  `to_treasury_id` INT,
  `description` TEXT,
  `notes` TEXT,
  `status` ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` INT,
  `approved_at` TIMESTAMP NULL,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `ctm_business_idx` (`business_id`),
  INDEX `ctm_subsystem_idx` (`sub_system_id`),
  INDEX `ctm_treasury_idx` (`treasury_id`),
  INDEX `ctm_currency_idx` (`currency_id`),
  INDEX `ctm_date_idx` (`movement_date`),
  INDEX `ctm_type_idx` (`movement_type`),
  INDEX `ctm_status_idx` (`status`),
  INDEX `ctm_party_idx` (`party_id`),
  INDEX `ctm_reference_idx` (`reference_type`, `reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. إضافة Foreign Keys (اختياري - قد يفشل إذا كانت البيانات غير متسقة)
-- ============================================================================

-- Foreign Keys لـ custom_transactions
ALTER TABLE `custom_transactions`
  ADD CONSTRAINT `fk_ctx_business` 
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctx_account` 
    FOREIGN KEY (`account_id`) REFERENCES `custom_accounts`(`id`) ON DELETE CASCADE;

-- Foreign Keys لـ custom_treasury_movements
ALTER TABLE `custom_treasury_movements`
  ADD CONSTRAINT `fk_ctm_business` 
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctm_treasury` 
    FOREIGN KEY (`treasury_id`) REFERENCES `custom_treasuries`(`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctm_currency` 
    FOREIGN KEY (`currency_id`) REFERENCES `custom_currencies`(`id`) ON DELETE RESTRICT;

-- Foreign Keys لـ custom_treasury_currencies (إذا لم تكن موجودة)
ALTER TABLE `custom_treasury_currencies`
  ADD CONSTRAINT `fk_ctc_treasury` 
    FOREIGN KEY (`treasury_id`) REFERENCES `custom_treasuries`(`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctc_currency` 
    FOREIGN KEY (`currency_id`) REFERENCES `custom_currencies`(`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_ctc_business` 
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE;

-- ============================================================================
-- تم الانتهاء
-- ============================================================================
SELECT 'تم إنشاء/تحديث الجداول بنجاح!' as message;

