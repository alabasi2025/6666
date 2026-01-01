-- إنشاء جدول custom_treasury_currencies لربط الخزائن بالعملات المتعددة
CREATE TABLE IF NOT EXISTS `custom_treasury_currencies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `business_id` INT NOT NULL,
  `treasury_id` INT NOT NULL,
  `currency_id` INT NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `opening_balance` DECIMAL(15,2) DEFAULT 0.00,
  `current_balance` DECIMAL(15,2) DEFAULT 0.00,
  `created_by` INT NULL,
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

-- نقل البيانات الموجودة من custom_treasuries إلى custom_treasury_currencies
-- سيتم تنفيذ هذا فقط للخزائن التي لديها عملة محددة
INSERT INTO `custom_treasury_currencies` 
  (`business_id`, `treasury_id`, `currency_id`, `is_default`, `opening_balance`, `current_balance`, `created_at`)
SELECT 
  t.business_id,
  t.id as treasury_id,
  c.id as currency_id,
  1 as is_default,
  t.opening_balance,
  t.current_balance,
  t.created_at
FROM `custom_treasuries` t
JOIN `custom_currencies` c ON c.code = t.currency AND c.business_id = t.business_id
WHERE t.currency IS NOT NULL AND t.currency != ''
ON DUPLICATE KEY UPDATE 
  opening_balance = VALUES(opening_balance),
  current_balance = VALUES(current_balance);
