-- Migration: Transition Support System Tables
-- Date: 2024-12-29
-- Description: Create tables for Transition Support management

-- ============================================
-- 1. مراقبة استهلاك الدعم
-- ============================================
CREATE TABLE IF NOT EXISTS `transition_support_monitoring` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `total_consumption` decimal(15,3) DEFAULT 0.000,
  `supported_consumption` decimal(15,3) DEFAULT 0.000,
  `transition_consumption` decimal(15,3) DEFAULT 0.000,
  `total_amount` decimal(18,2) DEFAULT 0.00,
  `support_amount` decimal(18,2) DEFAULT 0.00,
  `customer_amount` decimal(18,2) DEFAULT 0.00,
  `consumption_trend` enum('increasing','stable','decreasing') DEFAULT NULL,
  `support_utilization` decimal(5,2) DEFAULT NULL,
  `status` enum('normal','warning','critical','exceeded') DEFAULT 'normal',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_year_month` (`year`, `month`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_transition_monitoring_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. الإشعارات الاستباقية
-- ============================================
CREATE TABLE IF NOT EXISTS `transition_support_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `notification_type` enum('quota_warning','quota_exceeded','consumption_increase','support_ending','custom') NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `status` enum('pending','sent','delivered','failed','read') DEFAULT 'pending',
  `send_via` enum('sms','email','whatsapp','push','all') DEFAULT 'all',
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_notification_type` (`notification_type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_transition_notifications_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. تعديلات الفوترة
-- ============================================
CREATE TABLE IF NOT EXISTS `transition_support_billing_adjustments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `adjustment_type` enum('support_reduction','support_extension','consumption_limit','tariff_change','custom') NOT NULL,
  `original_amount` decimal(18,2) NOT NULL,
  `adjusted_amount` decimal(18,2) NOT NULL,
  `adjustment_amount` decimal(18,2) NOT NULL,
  `applied_rules` json DEFAULT NULL,
  `status` enum('draft','applied','reversed','cancelled') DEFAULT 'draft',
  `effective_date` date DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT NULL,
  `reversed_at` timestamp NULL DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_invoice_id` (`invoice_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_transition_adjustments_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. التنبيهات
-- ============================================
CREATE TABLE IF NOT EXISTS `transition_support_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `alert_type` enum('quota_threshold','consumption_spike','support_exhaustion','billing_anomaly','custom') NOT NULL,
  `severity` enum('info','warning','error','critical') DEFAULT 'warning',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `threshold_value` decimal(18,2) DEFAULT NULL,
  `current_value` decimal(18,2) DEFAULT NULL,
  `status` enum('active','acknowledged','resolved','dismissed') DEFAULT 'active',
  `triggered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `acknowledged_by` int(11) DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_alert_type` (`alert_type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_transition_alerts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. قواعد المرحلة الانتقالية
-- ============================================
CREATE TABLE IF NOT EXISTS `transition_support_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `rule_name` varchar(255) NOT NULL,
  `rule_type` enum('consumption_limit','support_reduction','tariff_adjustment','notification_trigger','custom') NOT NULL,
  `conditions` json DEFAULT NULL,
  `actions` json DEFAULT NULL,
  `priority` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_rule_type` (`rule_type`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

