-- Migration: Government Support System Tables
-- Date: 2024-12-29
-- Description: Create tables for Government Support management

-- ============================================
-- 1. بيانات الدعم للمشتركين
-- ============================================
CREATE TABLE IF NOT EXISTS `government_support_customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `support_type` enum('electricity','water','gas','mixed') DEFAULT 'electricity',
  `support_category` enum('low_income','disabled','elderly','widow','orphan','other') DEFAULT NULL,
  `support_percentage` decimal(5,2) DEFAULT 0.00,
  `max_support_amount` decimal(18,2) DEFAULT NULL,
  `monthly_quota` decimal(15,3) DEFAULT NULL,
  `remaining_quota` decimal(15,3) DEFAULT 0.000,
  `total_consumption` decimal(15,3) DEFAULT 0.000,
  `supported_consumption` decimal(15,3) DEFAULT 0.000,
  `unsupported_consumption` decimal(15,3) DEFAULT 0.000,
  `total_support_amount` decimal(18,2) DEFAULT 0.00,
  `current_month_support` decimal(18,2) DEFAULT 0.00,
  `status` enum('active','suspended','expired','cancelled') DEFAULT 'active',
  `is_active` tinyint(1) DEFAULT 1,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `last_quota_reset` date DEFAULT NULL,
  `approval_number` varchar(100) DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_gov_support_customers_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. الحصص الشهرية
-- ============================================
CREATE TABLE IF NOT EXISTS `government_support_quotas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `quota_type` enum('national','regional','category','individual') DEFAULT 'national',
  `category` varchar(50) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `total_quota` decimal(15,3) NOT NULL,
  `allocated_quota` decimal(15,3) DEFAULT 0.000,
  `used_quota` decimal(15,3) DEFAULT 0.000,
  `remaining_quota` decimal(15,3) DEFAULT 0.000,
  `total_budget` decimal(18,2) NOT NULL,
  `allocated_budget` decimal(18,2) DEFAULT 0.00,
  `used_budget` decimal(18,2) DEFAULT 0.00,
  `remaining_budget` decimal(18,2) DEFAULT 0.00,
  `status` enum('draft','active','closed','cancelled') DEFAULT 'draft',
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_year_month` (`year`, `month`),
  KEY `idx_quota_type` (`quota_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. تتبع استهلاك الدعم
-- ============================================
CREATE TABLE IF NOT EXISTS `government_support_consumption` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `support_customer_id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `total_consumption` decimal(15,3) NOT NULL,
  `supported_consumption` decimal(15,3) DEFAULT 0.000,
  `unsupported_consumption` decimal(15,3) DEFAULT 0.000,
  `total_amount` decimal(18,2) NOT NULL,
  `support_amount` decimal(18,2) DEFAULT 0.00,
  `customer_amount` decimal(18,2) DEFAULT 0.00,
  `quota_used` decimal(15,3) DEFAULT 0.000,
  `quota_remaining` decimal(15,3) DEFAULT NULL,
  `status` enum('pending','calculated','approved','paid','cancelled') DEFAULT 'pending',
  `calculation_date` timestamp NULL DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_support_customer_id` (`support_customer_id`),
  KEY `idx_year_month` (`year`, `month`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_gov_support_consumption_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_gov_support_consumption_support` FOREIGN KEY (`support_customer_id`) REFERENCES `government_support_customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. تقارير صندوق الدعم
-- ============================================
CREATE TABLE IF NOT EXISTS `government_support_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `report_type` enum('daily','monthly','quarterly','yearly','custom') NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `total_customers` int(11) DEFAULT 0,
  `active_customers` int(11) DEFAULT 0,
  `total_consumption` decimal(15,3) DEFAULT 0.000,
  `supported_consumption` decimal(15,3) DEFAULT 0.000,
  `total_support_amount` decimal(18,2) DEFAULT 0.00,
  `total_budget` decimal(18,2) DEFAULT 0.00,
  `budget_utilization` decimal(5,2) DEFAULT 0.00,
  `report_data` json DEFAULT NULL,
  `status` enum('draft','generated','approved','published') DEFAULT 'draft',
  `generated_by` int(11) DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_report_type` (`report_type`),
  KEY `idx_year_month` (`year`, `month`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. إعدادات الدعم
-- ============================================
CREATE TABLE IF NOT EXISTS `government_support_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json','date') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_business_setting_key` (`business_id`, `setting_key`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

