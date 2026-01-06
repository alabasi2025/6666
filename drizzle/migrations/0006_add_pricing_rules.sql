-- Migration: Add pricing_rules table
-- Date: 2026-01-06
-- Description: جدول قواعد التسعير للمحرك المرن

CREATE TABLE IF NOT EXISTS `pricing_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `meter_type` varchar(20) NOT NULL COMMENT 'نوع العداد: traditional, sts, iot',
  `usage_type` varchar(20) NOT NULL COMMENT 'نوع الاستخدام: residential, commercial, industrial',
  `subscription_fee` decimal(18,2) NOT NULL COMMENT 'رسوم الاشتراك',
  `deposit_amount` decimal(18,2) DEFAULT '0.00' COMMENT 'مبلغ التأمين',
  `deposit_required` tinyint(1) DEFAULT 1 COMMENT 'هل التأمين مطلوب',
  `active` tinyint(1) DEFAULT 1 COMMENT 'هل القاعدة نشطة',
  `notes` varchar(500) DEFAULT NULL COMMENT 'ملاحظات',
  `created_by` int(11) DEFAULT NULL COMMENT 'منشئ القاعدة',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_meter_usage` (`business_id`, `meter_type`, `usage_type`),
  KEY `idx_active` (`active`),
  CONSTRAINT `fk_pricing_rules_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='قواعد التسعير';

-- Insert default pricing rules
INSERT INTO `pricing_rules` (`business_id`, `meter_type`, `usage_type`, `subscription_fee`, `deposit_amount`, `deposit_required`, `active`, `notes`) VALUES
(1, 'traditional', 'residential', 5000.00, 35000.00, 1, 1, 'قاعدة افتراضية - عداد تقليدي سكني'),
(1, 'traditional', 'commercial', 10000.00, 50000.00, 1, 1, 'قاعدة افتراضية - عداد تقليدي تجاري'),
(1, 'sts', 'residential', 7000.00, 0.00, 0, 1, 'قاعدة افتراضية - STS سكني (لا تأمين)'),
(1, 'sts', 'commercial', 12000.00, 0.00, 0, 1, 'قاعدة افتراضية - STS تجاري (لا تأمين)'),
(1, 'iot', 'residential', 6000.00, 30000.00, 1, 1, 'قاعدة افتراضية - IoT سكني'),
(1, 'iot', 'commercial', 11000.00, 45000.00, 1, 1, 'قاعدة افتراضية - IoT تجاري');

