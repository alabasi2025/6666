SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- إنشاء جدول custom_treasuries
CREATE TABLE IF NOT EXISTS `custom_treasuries` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `business_id` INT NOT NULL,
  `sub_system_id` INT NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name_ar` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255),
  `treasury_type` ENUM('cash','bank','wallet','exchange') NOT NULL,
  `account_id` INT,
  `bank_name` VARCHAR(255),
  `account_number` VARCHAR(100),
  `iban` VARCHAR(50),
  `swift_code` VARCHAR(20),
  `wallet_provider` VARCHAR(100),
  `wallet_number` VARCHAR(100),
  `currency` VARCHAR(10) DEFAULT 'SAR',
  `opening_balance` DECIMAL(18,2) DEFAULT 0.00,
  `current_balance` DECIMAL(18,2) DEFAULT 0.00,
  `description` TEXT,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `ct_business_idx` (`business_id`),
  INDEX `ct_subsystem_idx` (`sub_system_id`),
  INDEX `ct_type_idx` (`treasury_type`),
  INDEX `ct_account_idx` (`account_id`),
  UNIQUE KEY `ct_code_idx` (`business_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول custom_treasury_currencies (many-to-many)
CREATE TABLE IF NOT EXISTS `custom_treasury_currencies` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `business_id` INT NOT NULL,
  `treasury_id` INT NOT NULL,
  `currency_id` INT NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `opening_balance` DECIMAL(15,2) DEFAULT 0.00,
  `current_balance` DECIMAL(15,2) DEFAULT 0.00,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_treasury_id` (`treasury_id`),
  INDEX `idx_currency_id` (`currency_id`),
  INDEX `idx_business_id` (`business_id`),
  UNIQUE KEY `unique_treasury_currency` (`treasury_id`, `currency_id`),
  FOREIGN KEY (`treasury_id`) REFERENCES `custom_treasuries`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`currency_id`) REFERENCES `custom_currencies`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

