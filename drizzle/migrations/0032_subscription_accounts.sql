-- Migration: Subscription Accounts System
-- Date: 2026-01-10
-- Description: Create subscription_accounts table and update related tables

-- ============================================
-- 1. إنشاء جدول حسابات المشترك
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_accounts (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers_enhanced(id) ON DELETE RESTRICT,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'sts', 'iot', 'regular', 'government_support'
  account_name VARCHAR(255),
  tariff_id INTEGER,
  service_type VARCHAR(50) DEFAULT 'electricity', -- 'electricity', 'water', 'gas'
  accounting_account_id INTEGER,
  balance DECIMAL(18,2) DEFAULT 0,
  balance_due DECIMAL(18,2) DEFAULT 0,
  credit_limit DECIMAL(18,2) DEFAULT 0,
  deposit_amount DECIMAL(18,2) DEFAULT 0,
  payment_mode VARCHAR(50) DEFAULT 'prepaid', -- 'prepaid', 'postpaid', 'hybrid'
  billing_cycle VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'closed', 'pending'
  -- بيانات خاصة بالدعم الحكومي
  support_type VARCHAR(50),
  support_percentage DECIMAL(5,2),
  max_support_amount DECIMAL(18,2),
  monthly_quota DECIMAL(15,3),
  -- ربط مع STS
  sts_meter_id INTEGER,
  -- ربط مع IoT
  iot_device_id VARCHAR(100),
  -- معلومات إضافية
  activation_date DATE,
  expiration_date DATE,
  notes TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS subscription_accounts_customer_id_idx ON subscription_accounts(customer_id);
CREATE INDEX IF NOT EXISTS subscription_accounts_account_type_idx ON subscription_accounts(account_type);
CREATE INDEX IF NOT EXISTS subscription_accounts_account_number_idx ON subscription_accounts(account_number);
CREATE INDEX IF NOT EXISTS subscription_accounts_status_idx ON subscription_accounts(status);
CREATE INDEX IF NOT EXISTS subscription_accounts_business_id_idx ON subscription_accounts(business_id);

-- ============================================
-- 2. إضافة subscription_account_id للعدادات
-- ============================================
ALTER TABLE meters_enhanced 
ADD COLUMN IF NOT EXISTS subscription_account_id INTEGER REFERENCES subscription_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS meters_subscription_account_id_idx ON meters_enhanced(subscription_account_id);

-- ============================================
-- 3. إضافة subscription_account_id للفواتير
-- ============================================
ALTER TABLE invoices_enhanced 
ADD COLUMN IF NOT EXISTS subscription_account_id INTEGER REFERENCES subscription_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS invoices_subscription_account_id_idx ON invoices_enhanced(subscription_account_id);

-- ============================================
-- 4. إضافة subscription_account_id للمدفوعات
-- ============================================
ALTER TABLE payments_enhanced 
ADD COLUMN IF NOT EXISTS subscription_account_id INTEGER REFERENCES subscription_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS payments_subscription_account_id_idx ON payments_enhanced(subscription_account_id);

-- ============================================
-- 5. Migration البيانات الموجودة
-- ============================================

-- 5.1: إنشاء حسابات مشترك افتراضية للعملاء الموجودين
INSERT INTO subscription_accounts (
  business_id,
  customer_id,
  account_number,
  account_type,
  account_name,
  service_type,
  status,
  activation_date,
  created_at,
  updated_at
)
SELECT 
  business_id,
  id,
  'SUB-' || id || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER,
  'regular',
  'حساب المشترك الرئيسي',
  'electricity',
  CASE 
    WHEN status = 'active' THEN 'active'
    WHEN status = 'suspended' THEN 'suspended'
    ELSE 'pending'
  END,
  COALESCE((SELECT MIN(created_at)::DATE FROM meters_enhanced WHERE customer_id = customers_enhanced.id), CURRENT_DATE),
  NOW(),
  NOW()
FROM customers_enhanced
WHERE is_active = true
ON CONFLICT (account_number) DO NOTHING;

-- 5.2: ربط العدادات الموجودة بحسابات المشترك
UPDATE meters_enhanced m
SET subscription_account_id = (
  SELECT id 
  FROM subscription_accounts 
  WHERE customer_id = m.customer_id 
  AND account_type = 'regular'
  ORDER BY id
  LIMIT 1
)
WHERE customer_id IS NOT NULL 
AND subscription_account_id IS NULL;

-- 5.3: ربط الفواتير الموجودة بحسابات المشترك (عبر العداد)
UPDATE invoices_enhanced i
SET subscription_account_id = (
  SELECT subscription_account_id
  FROM meters_enhanced
  WHERE id = i.meter_id
  AND subscription_account_id IS NOT NULL
  LIMIT 1
)
WHERE meter_id IS NOT NULL 
AND subscription_account_id IS NULL;

-- 5.4: ربط المدفوعات الموجودة بحسابات المشترك
UPDATE payments_enhanced p
SET subscription_account_id = COALESCE(
  (SELECT subscription_account_id FROM invoices_enhanced WHERE id = p.invoice_id AND subscription_account_id IS NOT NULL LIMIT 1),
  (SELECT subscription_account_id FROM meters_enhanced WHERE id = p.meter_id AND subscription_account_id IS NOT NULL LIMIT 1),
  (SELECT id FROM subscription_accounts WHERE customer_id = p.customer_id AND account_type = 'regular' ORDER BY id LIMIT 1)
)
WHERE customer_id IS NOT NULL 
AND subscription_account_id IS NULL;

-- ============================================
-- 6. تحديث رصيد حسابات المشترك من الفواتير والمدفوعات
-- ============================================

-- تحديث balance_due لحسابات المشترك من الفواتير
UPDATE subscription_accounts sa
SET balance_due = COALESCE((
  SELECT SUM(balance_due::DECIMAL)
  FROM invoices_enhanced
  WHERE subscription_account_id = sa.id
  AND status != 'paid'
), 0)
WHERE EXISTS (
  SELECT 1 FROM invoices_enhanced WHERE subscription_account_id = sa.id
);

-- تحديث balance لحسابات المشترك من المدفوعات
UPDATE subscription_accounts sa
SET balance = COALESCE((
  SELECT SUM(amount::DECIMAL)
  FROM payments_enhanced
  WHERE subscription_account_id = sa.id
  AND status = 'completed'
), 0)
WHERE EXISTS (
  SELECT 1 FROM payments_enhanced WHERE subscription_account_id = sa.id
);

-- ============================================
-- تم الانتهاء من Migration
-- ============================================
