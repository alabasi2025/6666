-- Migration: Government Support System Tables (PostgreSQL)
-- Date: 2024-12-29
-- Description: Create tables for Government Support management

-- ============================================
-- 1. عملاء الدعم الحكومي
-- ============================================
CREATE TABLE IF NOT EXISTS government_customers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  national_id VARCHAR(50),
  support_category VARCHAR(100),
  eligibility_status VARCHAR(50) DEFAULT 'pending' CHECK (eligibility_status IN ('pending', 'approved', 'rejected', 'suspended')),
  approval_date DATE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gov_customers_business ON government_customers(business_id);
CREATE INDEX IF NOT EXISTS idx_gov_customers_customer ON government_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_gov_customers_status ON government_customers(eligibility_status);

-- ============================================
-- 2. برامج الدعم
-- ============================================
CREATE TABLE IF NOT EXISTS support_programs (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  program_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  budget_amount DECIMAL(18,2),
  allocated_amount DECIMAL(18,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_programs_business ON support_programs(business_id);
CREATE INDEX IF NOT EXISTS idx_support_programs_status ON support_programs(status);

-- ============================================
-- 3. حصص العملاء
-- ============================================
CREATE TABLE IF NOT EXISTS customer_quotas (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  program_id INTEGER NOT NULL,
  quota_amount DECIMAL(18,2) NOT NULL,
  consumed_amount DECIMAL(18,2) DEFAULT 0.00,
  remaining_amount DECIMAL(18,2),
  quota_period VARCHAR(50),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'exhausted', 'expired', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_quotas_business ON customer_quotas(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_quotas_customer ON customer_quotas(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_quotas_program ON customer_quotas(program_id);
CREATE INDEX IF NOT EXISTS idx_customer_quotas_status ON customer_quotas(status);

-- ============================================
-- 4. استهلاك الحصص
-- ============================================
CREATE TABLE IF NOT EXISTS quota_consumption (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  quota_id INTEGER NOT NULL,
  invoice_id INTEGER,
  consumption_amount DECIMAL(18,2) NOT NULL,
  consumption_date DATE NOT NULL,
  consumption_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quota_consumption_business ON quota_consumption(business_id);
CREATE INDEX IF NOT EXISTS idx_quota_consumption_customer ON quota_consumption(customer_id);
CREATE INDEX IF NOT EXISTS idx_quota_consumption_quota ON quota_consumption(quota_id);
CREATE INDEX IF NOT EXISTS idx_quota_consumption_date ON quota_consumption(consumption_date);

-- ============================================
-- 5. تقارير الدعم
-- ============================================
CREATE TABLE IF NOT EXISTS support_reports (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  report_period VARCHAR(50),
  report_data JSONB,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generated_by INTEGER,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_reports_business ON support_reports(business_id);
CREATE INDEX IF NOT EXISTS idx_support_reports_type ON support_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_support_reports_period ON support_reports(report_period);

