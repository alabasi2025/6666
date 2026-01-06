-- Migration: STS System Tables (PostgreSQL)
-- Date: 2024-12-29
-- Description: Create tables for STS (Smart Token System) management

-- ============================================
-- 1. عدادات STS
-- ============================================
CREATE TABLE IF NOT EXISTS sts_meters (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER,
  meter_number VARCHAR(100) NOT NULL UNIQUE,
  meter_type VARCHAR(50),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  installation_date DATE,
  location TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned')),
  last_token_date TIMESTAMP,
  total_tokens_generated INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sts_meters_business ON sts_meters(business_id);
CREATE INDEX IF NOT EXISTS idx_sts_meters_customer ON sts_meters(customer_id);
CREATE INDEX IF NOT EXISTS idx_sts_meters_number ON sts_meters(meter_number);
CREATE INDEX IF NOT EXISTS idx_sts_meters_status ON sts_meters(status);

-- ============================================
-- 2. إعدادات API
-- ============================================
CREATE TABLE IF NOT EXISTS sts_api_config (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  api_name VARCHAR(100) NOT NULL,
  api_url VARCHAR(255),
  api_key VARCHAR(255),
  api_secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  config JSONB,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sts_api_config_business ON sts_api_config(business_id);
CREATE INDEX IF NOT EXISTS idx_sts_api_config_active ON sts_api_config(is_active);

-- ============================================
-- 3. طلبات الشحن
-- ============================================
CREATE TABLE IF NOT EXISTS sts_charge_requests (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  meter_id INTEGER NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  units DECIMAL(15,3),
  request_status VARCHAR(20) DEFAULT 'pending' CHECK (request_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_date TIMESTAMP,
  error_message TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sts_charge_requests_business ON sts_charge_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_sts_charge_requests_customer ON sts_charge_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_sts_charge_requests_meter ON sts_charge_requests(meter_id);
CREATE INDEX IF NOT EXISTS idx_sts_charge_requests_status ON sts_charge_requests(request_status);

-- ============================================
-- 4. التوكنات
-- ============================================
CREATE TABLE IF NOT EXISTS sts_tokens (
  id SERIAL PRIMARY KEY,
  charge_request_id INTEGER NOT NULL,
  meter_id INTEGER NOT NULL,
  token_number VARCHAR(100) NOT NULL UNIQUE,
  token_code VARCHAR(100),
  amount DECIMAL(18,2) NOT NULL,
  units DECIMAL(15,3) NOT NULL,
  token_status VARCHAR(20) DEFAULT 'generated' CHECK (token_status IN ('generated', 'sent', 'used', 'expired', 'cancelled')),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  used_at TIMESTAMP,
  expiry_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sts_tokens_charge_request ON sts_tokens(charge_request_id);
CREATE INDEX IF NOT EXISTS idx_sts_tokens_meter ON sts_tokens(meter_id);
CREATE INDEX IF NOT EXISTS idx_sts_tokens_number ON sts_tokens(token_number);
CREATE INDEX IF NOT EXISTS idx_sts_tokens_status ON sts_tokens(token_status);

-- ============================================
-- 5. المعاملات
-- ============================================
CREATE TABLE IF NOT EXISTS sts_transactions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  meter_id INTEGER NOT NULL,
  token_id INTEGER,
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('charge', 'token_generation', 'token_usage', 'refund')),
  amount DECIMAL(18,2),
  units DECIMAL(15,3),
  transaction_status VARCHAR(20) DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'completed', 'failed', 'cancelled')),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sts_transactions_business ON sts_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_sts_transactions_meter ON sts_transactions(meter_id);
CREATE INDEX IF NOT EXISTS idx_sts_transactions_token ON sts_transactions(token_id);
CREATE INDEX IF NOT EXISTS idx_sts_transactions_status ON sts_transactions(transaction_status);

