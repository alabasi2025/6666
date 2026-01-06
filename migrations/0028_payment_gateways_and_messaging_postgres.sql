-- Migration: Payment Gateways and Messaging System Tables (PostgreSQL)
-- Date: 2024-12-29
-- Description: Create tables for Payment Gateways and SMS/WhatsApp integration

-- ============================================
-- 1. بوابات الدفع
-- ============================================
CREATE TABLE IF NOT EXISTS payment_gateways (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  gateway_name VARCHAR(100) NOT NULL,
  gateway_type VARCHAR(20) DEFAULT 'credit_card' CHECK (gateway_type IN ('credit_card', 'bank_transfer', 'wallet', 'crypto', 'other')),
  api_key VARCHAR(255),
  api_secret VARCHAR(255),
  merchant_id VARCHAR(100),
  webhook_secret VARCHAR(255),
  api_url VARCHAR(255),
  test_mode BOOLEAN DEFAULT false,
  sandbox_api_key VARCHAR(255),
  sandbox_api_secret VARCHAR(255),
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_gateways_business ON payment_gateways(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_active ON payment_gateways(is_active);

-- ============================================
-- 2. معاملات الدفع
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  invoice_id INTEGER,
  gateway_id INTEGER NOT NULL,
  transaction_number VARCHAR(100) NOT NULL UNIQUE,
  gateway_transaction_id VARCHAR(100),
  amount DECIMAL(18,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'SAR',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  payment_method VARCHAR(50),
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),
  request_data JSONB,
  response_data JSONB,
  webhook_received BOOLEAN DEFAULT false,
  webhook_data JSONB,
  error_message TEXT,
  error_code VARCHAR(50),
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  failed_at TIMESTAMP,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_business ON payment_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON payment_transactions(gateway_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_number ON payment_transactions(transaction_number);

-- ============================================
-- 3. إعدادات البوابة
-- ============================================
CREATE TABLE IF NOT EXISTS payment_gateway_config (
  id SERIAL PRIMARY KEY,
  gateway_id INTEGER NOT NULL,
  business_id INTEGER NOT NULL,
  config_key VARCHAR(100) NOT NULL,
  config_value TEXT,
  config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_gateway_config_gateway ON payment_gateway_config(gateway_id);

-- ============================================
-- 4. استقبال Webhooks
-- ============================================
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id SERIAL PRIMARY KEY,
  gateway_id INTEGER NOT NULL,
  transaction_id INTEGER,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  signature VARCHAR(255),
  is_valid BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  error_message TEXT,
  ip_address VARCHAR(50),
  user_agent VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_gateway ON payment_webhooks(gateway_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_transaction ON payment_webhooks(transaction_id);

-- ============================================
-- 5. قوالب الرسائل
-- ============================================
CREATE TABLE IF NOT EXISTS sms_templates (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('invoice', 'payment_reminder', 'payment_confirmation', 'reading_notification', 'custom')),
  channel VARCHAR(20) DEFAULT 'sms' CHECK (channel IN ('sms', 'whatsapp', 'email', 'all')),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sms_templates_business ON sms_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_type ON sms_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_sms_templates_channel ON sms_templates(channel);

-- ============================================
-- 6. الرسائل المرسلة
-- ============================================
CREATE TABLE IF NOT EXISTS sms_messages (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  template_id INTEGER,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('invoice', 'payment_reminder', 'payment_confirmation', 'reading_notification', 'custom')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email')),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  provider VARCHAR(100),
  provider_message_id VARCHAR(100),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  error_message TEXT,
  error_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sms_messages_business ON sms_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_customer ON sms_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_template ON sms_messages(template_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON sms_messages(status);
CREATE INDEX IF NOT EXISTS idx_sms_messages_channel ON sms_messages(channel);

-- ============================================
-- 7. مقدمي الخدمة
-- ============================================
CREATE TABLE IF NOT EXISTS sms_providers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('sms', 'whatsapp', 'email', 'all')),
  api_key VARCHAR(255),
  api_secret VARCHAR(255),
  account_sid VARCHAR(255),
  auth_token VARCHAR(255),
  from_number VARCHAR(50),
  from_email VARCHAR(255),
  whatsapp_number VARCHAR(50),
  api_url VARCHAR(255),
  webhook_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sms_providers_business ON sms_providers(business_id);
CREATE INDEX IF NOT EXISTS idx_sms_providers_active ON sms_providers(is_active);

-- ============================================
-- 8. سجل التسليم
-- ============================================
CREATE TABLE IF NOT EXISTS sms_delivery_log (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'read', 'undelivered')),
  provider_status VARCHAR(100),
  provider_message_id VARCHAR(100),
  status_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT,
  error_code VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sms_delivery_log_message ON sms_delivery_log(message_id);

