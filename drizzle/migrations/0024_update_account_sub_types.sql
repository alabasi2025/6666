-- ============================================================================
-- 0024_update_account_sub_types.sql
-- الهدف: إعادة تسمية نوع "صراف آلي" إلى "صراف" (exchange) وإضافة الأنواع الفرعية المطلوبة
--         (مورد، عميل، مخزن، عام) مع ربطها بأنواع الحسابات المناسبة.
-- ملاحظة: يحافظ على التوافق ويمنع التكرار عبر التحقق قبل الإدراج.
-- ============================================================================

-- 1) إعادة تسمية "atm" إلى "exchange" إن لم يكن الكود موجوداً مسبقاً لنفس الـ business
UPDATE `custom_account_sub_types` cst
SET cst.`code` = 'exchange'
WHERE cst.`code` = 'atm'
  AND NOT EXISTS (
    SELECT 1 FROM `custom_account_sub_types` c2
    WHERE c2.`business_id` = cst.`business_id`
      AND c2.`code` = 'exchange'
  );

-- توحيد الاسم/الأيقونة/اللون لـ exchange (وأي سجل متبقٍ بـ atm)
UPDATE `custom_account_sub_types`
SET `name_ar` = 'صراف',
    `name_en` = 'Exchange',
    `icon` = 'credit-card',
    `color` = '#f59e0b'
WHERE `code` IN ('exchange', 'atm');

-- 2) إدراج الأنواع الجديدة إذا لم تكن موجودة لكل business

-- مورد (liability) - يحتاج طرف
INSERT INTO `custom_account_sub_types`
  (`business_id`, `account_type`, `account_type_id`, `code`, `name_ar`, `name_en`, `is_active`,
   `allow_multiple_currencies`, `requires_party`, `icon`, `color`, `display_order`)
SELECT DISTINCT
  b.`id`,
  'liability',
  cat.`id`,
  'supplier',
  'مورد',
  'Supplier',
  TRUE,
  TRUE,
  TRUE,
  'truck',
  '#f97316',
  5
FROM `businesses` b
LEFT JOIN `custom_account_types` cat
  ON cat.`business_id` = b.`id` AND cat.`type_code` = 'liability'
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_account_sub_types` s
  WHERE s.`business_id` = b.`id` AND s.`code` = 'supplier'
);

-- عميل (asset) - يحتاج طرف
INSERT INTO `custom_account_sub_types`
  (`business_id`, `account_type`, `account_type_id`, `code`, `name_ar`, `name_en`, `is_active`,
   `allow_multiple_currencies`, `requires_party`, `icon`, `color`, `display_order`)
SELECT DISTINCT
  b.`id`,
  'asset',
  cat.`id`,
  'customer',
  'عميل',
  'Customer',
  TRUE,
  TRUE,
  TRUE,
  'users',
  '#3b82f6',
  6
FROM `businesses` b
LEFT JOIN `custom_account_types` cat
  ON cat.`business_id` = b.`id` AND cat.`type_code` = 'asset'
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_account_sub_types` s
  WHERE s.`business_id` = b.`id` AND s.`code` = 'customer'
);

-- مخزن (asset)
INSERT INTO `custom_account_sub_types`
  (`business_id`, `account_type`, `account_type_id`, `code`, `name_ar`, `name_en`, `is_active`,
   `allow_multiple_currencies`, `requires_party`, `icon`, `color`, `display_order`)
SELECT DISTINCT
  b.`id`,
  'asset',
  cat.`id`,
  'store',
  'مخزن',
  'Store',
  TRUE,
  TRUE,
  FALSE,
  'boxes',
  '#0ea5e9',
  7
FROM `businesses` b
LEFT JOIN `custom_account_types` cat
  ON cat.`business_id` = b.`id` AND cat.`type_code` = 'asset'
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_account_sub_types` s
  WHERE s.`business_id` = b.`id` AND s.`code` = 'store'
);

-- عام (asset)
INSERT INTO `custom_account_sub_types`
  (`business_id`, `account_type`, `account_type_id`, `code`, `name_ar`, `name_en`, `is_active`,
   `allow_multiple_currencies`, `requires_party`, `icon`, `color`, `display_order`)
SELECT DISTINCT
  b.`id`,
  'asset',
  cat.`id`,
  'general',
  'عام',
  'General',
  TRUE,
  FALSE,
  FALSE,
  'layers',
  '#94a3b8',
  8
FROM `businesses` b
LEFT JOIN `custom_account_types` cat
  ON cat.`business_id` = b.`id` AND cat.`type_code` = 'asset'
WHERE NOT EXISTS (
  SELECT 1 FROM `custom_account_sub_types` s
  WHERE s.`business_id` = b.`id` AND s.`code` = 'general'
);

-- ============================================================================
-- نهاية الميجريشن
-- ============================================================================

