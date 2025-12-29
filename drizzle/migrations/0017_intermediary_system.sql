-- نظام الوسيط - Intermediary System
-- Migration: 0017_intermediary_system.sql

-- 1. جدول الحسابات الوسيطة المحسنة
CREATE TABLE IF NOT EXISTS `intermediary_accounts` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255),
  `description` text,
  `balance` decimal(18,2) DEFAULT '0',
  `currency` varchar(10) DEFAULT 'SAR',
  `account_type` enum('transfer', 'settlement', 'clearing', 'suspense', 'other') DEFAULT 'transfer',
  `must_be_zero` boolean DEFAULT true,
  `alert_on_balance` boolean DEFAULT true,
  `alert_threshold` decimal(18,2) DEFAULT '0',
  `is_active` boolean DEFAULT true,
  `created_by` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_intermediary_accounts_business` (`business_id`),
  INDEX `idx_intermediary_accounts_code` (`code`)
);

-- 2. جدول ربط الحسابات الوسيطة بالأنظمة الفرعية
CREATE TABLE IF NOT EXISTS `intermediary_account_sub_systems` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `intermediary_account_id` int NOT NULL,
  `sub_system_id` int NOT NULL,
  `can_debit` boolean DEFAULT true,
  `can_credit` boolean DEFAULT true,
  `max_transaction_amount` decimal(18,2),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_intermediary_sub_systems_account` (`intermediary_account_id`),
  INDEX `idx_intermediary_sub_systems_sub_system` (`sub_system_id`),
  UNIQUE KEY `unique_account_sub_system` (`intermediary_account_id`, `sub_system_id`)
);

-- 3. جدول حركات الحسابات الوسيطة
CREATE TABLE IF NOT EXISTS `intermediary_account_movements` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `intermediary_account_id` int NOT NULL,
  `sub_system_id` int NOT NULL,
  `movement_type` enum('debit', 'credit') NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `balance_before` decimal(18,2),
  `balance_after` decimal(18,2),
  `reference_type` enum('receipt_voucher', 'payment_voucher', 'transfer', 'adjustment', 'manual'),
  `reference_id` int,
  `reference_number` varchar(50),
  `description` text,
  `is_reconciled` boolean DEFAULT false,
  `reconciled_with` int,
  `reconciled_at` timestamp,
  `reconciled_by` int,
  `created_by` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_movements_business` (`business_id`),
  INDEX `idx_movements_account` (`intermediary_account_id`),
  INDEX `idx_movements_sub_system` (`sub_system_id`),
  INDEX `idx_movements_reconciled` (`is_reconciled`)
);

-- 4. جدول تسويات الحسابات الوسيطة
CREATE TABLE IF NOT EXISTS `intermediary_reconciliations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `intermediary_account_id` int NOT NULL,
  `debit_movement_id` int NOT NULL,
  `debit_sub_system_id` int NOT NULL,
  `credit_movement_id` int NOT NULL,
  `credit_sub_system_id` int NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `notes` text,
  `reconciled_by` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_reconciliations_business` (`business_id`),
  INDEX `idx_reconciliations_account` (`intermediary_account_id`)
);

-- 5. جدول الملخص اليومي
CREATE TABLE IF NOT EXISTS `intermediary_daily_summary` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `business_id` int NOT NULL,
  `intermediary_account_id` int NOT NULL,
  `summary_date` timestamp NOT NULL,
  `opening_balance` decimal(18,2) DEFAULT '0',
  `closing_balance` decimal(18,2) DEFAULT '0',
  `total_debit` decimal(18,2) DEFAULT '0',
  `total_credit` decimal(18,2) DEFAULT '0',
  `debit_count` int DEFAULT 0,
  `credit_count` int DEFAULT 0,
  `pending_debit` decimal(18,2) DEFAULT '0',
  `pending_credit` decimal(18,2) DEFAULT '0',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_daily_summary_business` (`business_id`),
  INDEX `idx_daily_summary_account` (`intermediary_account_id`),
  INDEX `idx_daily_summary_date` (`summary_date`)
);
