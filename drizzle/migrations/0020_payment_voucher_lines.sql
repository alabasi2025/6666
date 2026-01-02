-- Migration: Add payment voucher line items table
-- Purpose: Support splitting one payment voucher amount across multiple accounts/cost centers.

CREATE TABLE IF NOT EXISTS `custom_payment_voucher_lines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `business_id` int NOT NULL,
  `payment_voucher_id` int NOT NULL,
  `line_order` int NOT NULL DEFAULT 0,
  `account_type` varchar(50) DEFAULT NULL,
  `account_sub_type_id` int DEFAULT NULL,
  `account_id` int NOT NULL,
  `cost_center_id` int DEFAULT NULL,
  `description` text,
  `amount` decimal(18,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cpvl_business_idx` (`business_id`),
  KEY `cpvl_voucher_idx` (`payment_voucher_id`),
  KEY `cpvl_account_idx` (`account_id`),
  KEY `cpvl_cost_center_idx` (`cost_center_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


