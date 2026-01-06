-- Migration: Transition Support System Tables (PostgreSQL)
-- Date: 2024-12-29
-- Description: Create tables for Transition Support management

-- ============================================
-- 1. مراقبة استهلاك الدعم
-- ============================================
CREATE TABLE IF NOT EXISTS transition_support_monitoring (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  total_consumption DECIMAL(15,3) DEFAULT 0.000,
  supported_consumption DECIMAL(15,3) DEFAULT 0.000,
  transition_consumption DECIMAL(15,3) DEFAULT 0.000,
  total_amount DECIMAL(18,2) DEFAULT 0.00,
  support_amount DECIMAL(18,2) DEFAULT 0.00,
  customer_amount DECIMAL(18,2) DEFAULT 0.00,
  consumption_trend VARCHAR(20) CHECK (consumption_trend IN ('increasing', 'stable', 'decreasing')),
  support_utilization DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'exceeded')),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transition_monitoring_business ON transition_support_monitoring(business_id);
CREATE INDEX IF NOT EXISTS idx_transition_monitoring_customer ON transition_support_monitoring(customer_id);
CREATE INDEX IF NOT EXISTS idx_transition_monitoring_year_month ON transition_support_monitoring(year, month);
CREATE INDEX IF NOT EXISTS idx_transition_monitoring_status ON transition_support_monitoring(status);

-- ============================================
-- 2. الإشعارات الاستباقية
-- ============================================
CREATE TABLE IF NOT EXISTS transition_support_notifications (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('quota_warning', 'quota_exceeded', 'consumption_increase', 'support_ending', 'custom')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  template_id INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  send_via VARCHAR(20) DEFAULT 'all' CHECK (send_via IN ('sms', 'email', 'whatsapp', 'push', 'all')),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  metadata JSONB,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transition_notifications_business ON transition_support_notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_transition_notifications_customer ON transition_support_notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_transition_notifications_type ON transition_support_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_transition_notifications_status ON transition_support_notifications(status);

-- ============================================
-- 3. تعديلات الفوترة
-- ============================================
CREATE TABLE IF NOT EXISTS transition_support_billing_adjustments (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  invoice_id INTEGER,
  adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('support_reduction', 'support_extension', 'consumption_limit', 'tariff_change', 'custom')),
  original_amount DECIMAL(18,2) NOT NULL,
  adjusted_amount DECIMAL(18,2) NOT NULL,
  adjustment_amount DECIMAL(18,2) NOT NULL,
  applied_rules JSONB,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'applied', 'reversed', 'cancelled')),
  effective_date DATE,
  applied_at TIMESTAMP,
  reversed_at TIMESTAMP,
  reason TEXT,
  approved_by INTEGER,
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transition_adjustments_business ON transition_support_billing_adjustments(business_id);
CREATE INDEX IF NOT EXISTS idx_transition_adjustments_customer ON transition_support_billing_adjustments(customer_id);
CREATE INDEX IF NOT EXISTS idx_transition_adjustments_invoice ON transition_support_billing_adjustments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transition_adjustments_status ON transition_support_billing_adjustments(status);

-- ============================================
-- 4. التنبيهات
-- ============================================
CREATE TABLE IF NOT EXISTS transition_support_alerts (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('quota_threshold', 'consumption_spike', 'support_exhaustion', 'billing_anomaly', 'custom')),
  severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(18,2),
  current_value DECIMAL(18,2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  acknowledged_by INTEGER,
  resolved_by INTEGER,
  resolution TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transition_alerts_business ON transition_support_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_transition_alerts_customer ON transition_support_alerts(customer_id);
CREATE INDEX IF NOT EXISTS idx_transition_alerts_type ON transition_support_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_transition_alerts_severity ON transition_support_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_transition_alerts_status ON transition_support_alerts(status);

-- ============================================
-- 5. قواعد المرحلة الانتقالية
-- ============================================
CREATE TABLE IF NOT EXISTS transition_support_rules (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('consumption_limit', 'support_reduction', 'tariff_adjustment', 'notification_trigger', 'custom')),
  conditions JSONB,
  actions JSONB,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transition_rules_business ON transition_support_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_transition_rules_type ON transition_support_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_transition_rules_active ON transition_support_rules(is_active);

