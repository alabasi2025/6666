-- Migration: Payment Gateways and Messaging System Tables
-- Date: 2024-12-29
-- Description: Create tables for Payment Gateways and SMS/WhatsApp integration

-- ============================================
-- 1. بوابات الدفع
-- ============================================
CREATE TABLE IF NOT EXISTS `payment_gateways` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `gateway_name` varchar(100) NOT NULL,
  `gateway_type` enum('credit_card','bank_transfer','wallet','crypto','other') DEFAULT 'credit_card',
  `api_key` varchar(255) DEFAULT NULL,
  `api_secret` varchar(255) DEFAULT NULL,
  `merchant_id` varchar(100) DEFAULT NULL,
  `webhook_secret` varchar(255) DEFAULT NULL,
  `api_url` varchar(255) DEFAULT NULL,
  `test_mode` tinyint(1) DEFAULT 0,
  `sandbox_api_key` varchar(255) DEFAULT NULL,
  `sandbox_api_secret` varchar(255) DEFAULT NULL,
  `config` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_default` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. معاملات الدفع
-- ============================================
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `gateway_id` int(11) NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `gateway_transaction_id` varchar(100) DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `status` enum('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `card_last4` varchar(4) DEFAULT NULL,
  `card_brand` varchar(50) DEFAULT NULL,
  `request_data` json DEFAULT NULL,
  `response_data` json DEFAULT NULL,
  `webhook_received` tinyint(1) DEFAULT 0,
  `webhook_data` json DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `error_code` varchar(50) DEFAULT NULL,
  `initiated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_transaction_number` (`transaction_number`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_gateway_id` (`gateway_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_payment_transactions_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payment_transactions_gateway` FOREIGN KEY (`gateway_id`) REFERENCES `payment_gateways` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. إعدادات البوابة
-- ============================================
CREATE TABLE IF NOT EXISTS `payment_gateway_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gateway_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `config_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_encrypted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gateway_id` (`gateway_id`),
  CONSTRAINT `fk_payment_gateway_config_gateway` FOREIGN KEY (`gateway_id`) REFERENCES `payment_gateways` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. استقبال Webhooks
-- ============================================
CREATE TABLE IF NOT EXISTS `payment_webhooks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gateway_id` int(11) NOT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `event_type` varchar(100) NOT NULL,
  `payload` json NOT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `is_valid` tinyint(1) DEFAULT 0,
  `processed` tinyint(1) DEFAULT 0,
  `processed_at` timestamp NULL DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gateway_id` (`gateway_id`),
  KEY `idx_transaction_id` (`transaction_id`),
  CONSTRAINT `fk_payment_webhooks_gateway` FOREIGN KEY (`gateway_id`) REFERENCES `payment_gateways` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payment_webhooks_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. قوالب الرسائل
-- ============================================
CREATE TABLE IF NOT EXISTS `sms_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `template_type` enum('invoice','payment_reminder','payment_confirmation','reading_notification','custom') NOT NULL,
  `channel` enum('sms','whatsapp','email','all') DEFAULT 'sms',
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `variables` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_default` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_template_type` (`template_type`),
  KEY `idx_channel` (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. الرسائل المرسلة
-- ============================================
CREATE TABLE IF NOT EXISTS `sms_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `message_type` enum('invoice','payment_reminder','payment_confirmation','reading_notification','custom') NOT NULL,
  `channel` enum('sms','whatsapp','email') NOT NULL,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('pending','sent','delivered','failed','read') DEFAULT 'pending',
  `provider` varchar(100) DEFAULT NULL,
  `provider_message_id` varchar(100) DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `error_code` varchar(50) DEFAULT NULL,
  `retry_count` int(11) DEFAULT 0,
  `max_retries` int(11) DEFAULT 3,
  `next_retry_at` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_status` (`status`),
  KEY `idx_channel` (`channel`),
  CONSTRAINT `fk_sms_messages_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sms_messages_template` FOREIGN KEY (`template_id`) REFERENCES `sms_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. مقدمي الخدمة
-- ============================================
CREATE TABLE IF NOT EXISTS `sms_providers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `provider_name` varchar(100) NOT NULL,
  `provider_type` enum('sms','whatsapp','email','all') NOT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `api_secret` varchar(255) DEFAULT NULL,
  `account_sid` varchar(255) DEFAULT NULL,
  `auth_token` varchar(255) DEFAULT NULL,
  `from_number` varchar(50) DEFAULT NULL,
  `from_email` varchar(255) DEFAULT NULL,
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `api_url` varchar(255) DEFAULT NULL,
  `webhook_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_default` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. سجل التسليم
-- ============================================
CREATE TABLE IF NOT EXISTS `sms_delivery_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message_id` int(11) NOT NULL,
  `status` enum('sent','delivered','failed','read','undelivered') NOT NULL,
  `provider_status` varchar(100) DEFAULT NULL,
  `provider_message_id` varchar(100) DEFAULT NULL,
  `status_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `error_message` text DEFAULT NULL,
  `error_code` varchar(50) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_message_id` (`message_id`),
  CONSTRAINT `fk_sms_delivery_log_message` FOREIGN KEY (`message_id`) REFERENCES `sms_messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

