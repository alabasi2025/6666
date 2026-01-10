-- Migration: ACREL Integration
-- تكامل عدادات ACREL IoT-EMS

-- ============================================
-- 1. جدول عدادات ACREL
-- ============================================
CREATE TABLE `acrel_meters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_id` INT NOT NULL,
  `meter_id` INT NULL COMMENT 'ربط بـ meters_enhanced',
  `acrel_meter_id` VARCHAR(100) NOT NULL UNIQUE COMMENT 'معرف العداد في منصة ACREL',
  `meter_number` VARCHAR(50) NULL,
  `meter_type` ENUM('ADL200', 'ADW300') NOT NULL COMMENT 'ADL200: مشتركين، ADW300: مراقبة',
  `phase_type` ENUM('single', 'three') NOT NULL COMMENT 'single: سنجل فاز، three: ثري فاز',
  `connection_type` ENUM('wifi', 'rs485', 'mqtt') DEFAULT 'wifi',
  `network_id` VARCHAR(100) NULL COMMENT 'معرف شبكة WiFi',
  `payment_mode` ENUM('postpaid', 'prepaid', 'credit') DEFAULT 'postpaid' COMMENT 'نوع الدفع',
  `credit_limit` DECIMAL(18,2) NULL COMMENT 'حد الائتمان (ريال)',
  `current_balance` DECIMAL(18,2) DEFAULT 0 COMMENT 'الرصيد الحالي (للمسبق الدفع)',
  `current_debt` DECIMAL(18,2) DEFAULT 0 COMMENT 'الدين الحالي (للائتمان)',
  `ct_type` ENUM('built_in', 'external') NULL COMMENT 'نوع محولات التيار (للـ ADW300)',
  `ct_info` JSON NULL COMMENT 'معلومات محولات التيار',
  `status` ENUM('online', 'offline', 'maintenance') DEFAULT 'offline',
  `last_seen` TIMESTAMP NULL COMMENT 'آخر اتصال',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_business_id` (`business_id`),
  INDEX `idx_meter_id` (`meter_id`),
  INDEX `idx_acrel_meter_id` (`acrel_meter_id`),
  INDEX `idx_meter_type` (`meter_type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='عدادات ACREL';

-- ============================================
-- 2. جدول قراءات عدادات ACREL
-- ============================================
CREATE TABLE `acrel_readings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `acrel_meter_id` INT NOT NULL,
  `reading_date` TIMESTAMP NOT NULL,
  -- Single Phase (ADL200)
  `voltage` DECIMAL(10,2) NULL,
  `current` DECIMAL(10,3) NULL,
  `power` DECIMAL(15,3) NULL,
  `energy` DECIMAL(18,3) NULL,
  `frequency` DECIMAL(5,2) NULL,
  `power_factor` DECIMAL(5,3) NULL,
  -- Three Phase (ADW300)
  `voltage_l1` DECIMAL(10,2) NULL,
  `voltage_l2` DECIMAL(10,2) NULL,
  `voltage_l3` DECIMAL(10,2) NULL,
  `voltage_avg` DECIMAL(10,2) NULL,
  `current_l1` DECIMAL(10,3) NULL,
  `current_l2` DECIMAL(10,3) NULL,
  `current_l3` DECIMAL(10,3) NULL,
  `current_avg` DECIMAL(10,3) NULL,
  `power_l1` DECIMAL(15,3) NULL,
  `power_l2` DECIMAL(15,3) NULL,
  `power_l3` DECIMAL(15,3) NULL,
  `power_total` DECIMAL(15,3) NULL,
  -- الطاقة (ADW300)
  `exported_energy` DECIMAL(18,3) NULL COMMENT 'الطاقة المصدرة',
  `imported_energy` DECIMAL(18,3) NULL COMMENT 'الطاقة المستوردة',
  `total_energy` DECIMAL(18,3) NULL COMMENT 'إجمالي الطاقة',
  -- محولات التيار (ADW300)
  `ct1_ratio` DECIMAL(10,2) NULL,
  `ct2_ratio` DECIMAL(10,2) NULL,
  `ct3_ratio` DECIMAL(10,2) NULL,
  -- حساسات الحرارة (ADW300)
  `temperature1` DECIMAL(5,2) NULL,
  `temperature2` DECIMAL(5,2) NULL,
  `temperature3` DECIMAL(5,2) NULL,
  `temperature4` DECIMAL(5,2) NULL,
  -- التسرب (ADW300)
  `leakage_current` DECIMAL(10,3) NULL,
  -- القاطع (ADW300)
  `breaker_status` VARCHAR(20) NULL,
  `breaker_status_raw` INT NULL,
  -- البيانات الخام
  `raw_data` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_acrel_meter_id` (`acrel_meter_id`),
  INDEX `idx_reading_date` (`reading_date`),
  FOREIGN KEY (`acrel_meter_id`) REFERENCES `acrel_meters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='قراءات عدادات ACREL';

-- ============================================
-- 3. جدول سجل أوامر ACREL
-- ============================================
CREATE TABLE `acrel_command_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `acrel_meter_id` INT NOT NULL,
  `command_type` VARCHAR(50) NOT NULL COMMENT 'نوع الأمر: disconnect, reconnect, setTariff, etc',
  `command_id` VARCHAR(100) NULL COMMENT 'معرف الأمر من ACREL',
  `status` ENUM('pending', 'executed', 'failed') DEFAULT 'pending',
  `request_data` JSON NULL,
  `response_data` JSON NULL,
  `error` TEXT NULL,
  `created_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `executed_at` TIMESTAMP NULL,
  INDEX `idx_acrel_meter_id` (`acrel_meter_id`),
  INDEX `idx_command_type` (`command_type`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`acrel_meter_id`) REFERENCES `acrel_meters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='سجل أوامر ACREL';

-- ============================================
-- 4. جدول التعرفات المتعددة (مشترك ACREL و STS)
-- ============================================
CREATE TABLE `multi_tariff_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meter_id` INT NOT NULL COMMENT 'معرف العداد (acrel_meter_id أو sts_meter_id)',
  `meter_type` ENUM('acrel', 'sts') NOT NULL,
  `tariff_data` JSON NOT NULL COMMENT 'جدول التعرفات (حتى 8 تعرفات)',
  `effective_date` TIMESTAMP NULL COMMENT 'تاريخ التفعيل',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_meter_id` (`meter_id`),
  INDEX `idx_meter_type` (`meter_type`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جداول التعرفات المتعددة';

-- ============================================
-- 5. تحديث جدول meters_enhanced للربط مع ACREL
-- ============================================
ALTER TABLE `meters_enhanced` 
ADD COLUMN `external_integration_type` ENUM('none', 'acrel', 'sts') DEFAULT 'none' COMMENT 'نوع التكامل الخارجي',
ADD COLUMN `acrel_meter_id` VARCHAR(100) NULL COMMENT 'معرف عداد ACREL',
ADD COLUMN `acrel_meter_type` ENUM('ADL200', 'ADW300') NULL,
ADD COLUMN `sts_meter_id` VARCHAR(100) NULL COMMENT 'معرف عداد STS',
ADD COLUMN `payment_mode` ENUM('postpaid', 'prepaid', 'credit') DEFAULT 'postpaid',
ADD COLUMN `credit_limit` DECIMAL(18,2) NULL,
ADD COLUMN `ct_info` JSON NULL COMMENT 'معلومات محولات التيار للـ ADW300',
ADD INDEX `idx_external_integration_type` (`external_integration_type`),
ADD INDEX `idx_acrel_meter_id` (`acrel_meter_id`),
ADD INDEX `idx_payment_mode` (`payment_mode`);

-- ============================================
-- 6. تحديث جدول sts_meters
-- ============================================
ALTER TABLE `sts_meters` 
ADD COLUMN `payment_mode` ENUM('postpaid', 'prepaid', 'credit') DEFAULT 'prepaid' AFTER `status`,
ADD COLUMN `credit_limit` DECIMAL(18,2) NULL AFTER `payment_mode`,
ADD COLUMN `current_balance` DECIMAL(18,2) DEFAULT 0 AFTER `credit_limit`,
ADD COLUMN `remaining_kwh` DECIMAL(15,3) DEFAULT 0 AFTER `current_balance` COMMENT 'الكيلوهات المتبقية';

-- ============================================
-- 7. تحديث جدول sts_charge_requests
-- ============================================
ALTER TABLE `sts_charge_requests` 
ADD COLUMN `kwh_generated` DECIMAL(15,3) NULL AFTER `amount` COMMENT 'الكيلوهات المولدة من المبلغ';

-- ============================================
-- 8. جدول سجل أوامر STS (إذا لم يكن موجود)
-- ============================================
CREATE TABLE IF NOT EXISTS `sts_command_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sts_meter_id` INT NOT NULL,
  `command_type` VARCHAR(50) NOT NULL,
  `command_id` VARCHAR(100) NULL,
  `status` ENUM('pending', 'executed', 'failed') DEFAULT 'pending',
  `request_data` JSON NULL,
  `response_data` JSON NULL,
  `error` TEXT NULL,
  `created_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `executed_at` TIMESTAMP NULL,
  INDEX `idx_sts_meter_id` (`sts_meter_id`),
  INDEX `idx_command_type` (`command_type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='سجل أوامر STS';

