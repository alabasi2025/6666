-- Migration: STS System Tables
-- Date: 2024-12-29
-- Description: Create tables for STS (Smart Token System) meters management

-- ============================================
-- 1. إعدادات API مقدم خدمة STS
-- ============================================
CREATE TABLE IF NOT EXISTS `sts_api_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `provider_name` varchar(100) NOT NULL,
  `api_url` varchar(255) NOT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `api_secret` varchar(255) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `timeout` int(11) DEFAULT 30000,
  `retry_attempts` int(11) DEFAULT 3,
  `retry_delay` int(11) DEFAULT 1000,
  `is_active` tinyint(1) DEFAULT 1,
  `last_test_date` timestamp NULL DEFAULT NULL,
  `last_test_result` enum('success','failed','pending') DEFAULT NULL,
  `last_test_message` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. عدادات STS
-- ============================================
CREATE TABLE IF NOT EXISTS `sts_meters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `meter_id` int(11) DEFAULT NULL,
  `sts_meter_number` varchar(50) NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive','faulty','disconnected') DEFAULT 'active',
  `is_active` tinyint(1) DEFAULT 1,
  `current_balance` decimal(18,2) DEFAULT 0.00,
  `total_consumption` decimal(15,3) DEFAULT 0.000,
  `last_token_date` timestamp NULL DEFAULT NULL,
  `api_provider` varchar(100) DEFAULT NULL,
  `api_config_id` int(11) DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sts_meter_number` (`business_id`, `sts_meter_number`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_meter_id` (`meter_id`),
  KEY `idx_api_config_id` (`api_config_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_sts_meters_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sts_meters_api_config` FOREIGN KEY (`api_config_id`) REFERENCES `sts_api_config` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. طلبات الشحن
-- ============================================
CREATE TABLE IF NOT EXISTS `sts_charge_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `sts_meter_id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `request_number` varchar(50) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
  `api_request_id` varchar(100) DEFAULT NULL,
  `api_request_data` json DEFAULT NULL,
  `api_response_data` json DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `error_code` varchar(50) DEFAULT NULL,
  `requested_by` int(11) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_request_number` (`request_number`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_sts_meter_id` (`sts_meter_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_sts_charge_requests_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sts_charge_requests_meter` FOREIGN KEY (`sts_meter_id`) REFERENCES `sts_meters` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. التوكنات المُنشأة
-- ============================================
CREATE TABLE IF NOT EXISTS `sts_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `sts_meter_id` int(11) NOT NULL,
  `charge_request_id` int(11) NOT NULL,
  `token_number` varchar(50) NOT NULL,
  `token_code` text DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `units` decimal(15,3) DEFAULT NULL,
  `status` enum('generated','sent','used','expired','cancelled') DEFAULT 'generated',
  `used_at` timestamp NULL DEFAULT NULL,
  `used_by` int(11) DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `sent_via` enum('sms','email','whatsapp','print','manual') DEFAULT NULL,
  `sent_to` varchar(255) DEFAULT NULL,
  `expiry_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_token_number` (`token_number`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_sts_meter_id` (`sts_meter_id`),
  KEY `idx_charge_request_id` (`charge_request_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_sts_tokens_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sts_tokens_meter` FOREIGN KEY (`sts_meter_id`) REFERENCES `sts_meters` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sts_tokens_charge_request` FOREIGN KEY (`charge_request_id`) REFERENCES `sts_charge_requests` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. معاملات STS
-- ============================================
CREATE TABLE IF NOT EXISTS `sts_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sts_meter_id` int(11) NOT NULL,
  `charge_request_id` int(11) DEFAULT NULL,
  `token_id` int(11) DEFAULT NULL,
  `transaction_type` enum('charge','disconnect','reconnect','tariff_change','balance_inquiry') NOT NULL,
  `amount` decimal(18,2) DEFAULT NULL,
  `units` decimal(15,3) DEFAULT NULL,
  `balance_before` decimal(18,2) DEFAULT NULL,
  `balance_after` decimal(18,2) DEFAULT NULL,
  `status` enum('pending','success','failed','cancelled') DEFAULT 'pending',
  `api_transaction_id` varchar(100) DEFAULT NULL,
  `api_request_data` json DEFAULT NULL,
  `api_response_data` json DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `error_code` varchar(50) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_sts_meter_id` (`sts_meter_id`),
  KEY `idx_charge_request_id` (`charge_request_id`),
  KEY `idx_token_id` (`token_id`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_sts_transactions_meter` FOREIGN KEY (`sts_meter_id`) REFERENCES `sts_meters` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sts_transactions_charge_request` FOREIGN KEY (`charge_request_id`) REFERENCES `sts_charge_requests` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sts_transactions_token` FOREIGN KEY (`token_id`) REFERENCES `sts_tokens` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

