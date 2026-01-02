-- ============================================================================
-- إضافة حقول أسعار الصرف للعملات
-- تاريخ: 2025-01-XX
-- الوصف: إضافة الحقول current_rate, max_rate, min_rate مقابل YER
-- ============================================================================

ALTER TABLE `custom_currencies`
  ADD COLUMN `current_rate` decimal(18,6) NULL,
  ADD COLUMN `max_rate` decimal(18,6) NULL,
  ADD COLUMN `min_rate` decimal(18,6) NULL;

