-- Create custom_account_types table
CREATE TABLE IF NOT EXISTS custom_account_types (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL,
  sub_system_id INT,
  type_code VARCHAR(50) NOT NULL,
  type_name_ar VARCHAR(100) NOT NULL,
  type_name_en VARCHAR(100),
  description TEXT,
  color VARCHAR(20),
  icon VARCHAR(50),
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_system_type BOOLEAN DEFAULT FALSE NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS cat_business_idx ON custom_account_types(business_id);
CREATE INDEX IF NOT EXISTS cat_type_code_idx ON custom_account_types(type_code);
CREATE UNIQUE INDEX IF NOT EXISTS cat_business_code_unique ON custom_account_types(business_id, type_code);
CREATE INDEX IF NOT EXISTS cat_is_active_idx ON custom_account_types(is_active);
CREATE INDEX IF NOT EXISTS cat_display_order_idx ON custom_account_types(display_order);

-- Insert default account types
INSERT INTO custom_account_types (business_id, type_code, type_name_ar, type_name_en, color, icon, display_order, is_active, is_system_type)
SELECT 1, 'asset', 'أصول', 'Assets', '#10b981', 'TrendingUp', 1, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM custom_account_types WHERE business_id = 1 AND type_code = 'asset');

INSERT INTO custom_account_types (business_id, type_code, type_name_ar, type_name_en, color, icon, display_order, is_active, is_system_type)
SELECT 1, 'liability', 'التزامات', 'Liabilities', '#ef4444', 'TrendingDown', 2, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM custom_account_types WHERE business_id = 1 AND type_code = 'liability');

INSERT INTO custom_account_types (business_id, type_code, type_name_ar, type_name_en, color, icon, display_order, is_active, is_system_type)
SELECT 1, 'equity', 'حقوق ملكية', 'Equity', '#8b5cf6', 'Users', 3, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM custom_account_types WHERE business_id = 1 AND type_code = 'equity');

INSERT INTO custom_account_types (business_id, type_code, type_name_ar, type_name_en, color, icon, display_order, is_active, is_system_type)
SELECT 1, 'revenue', 'إيرادات', 'Revenue', '#3b82f6', 'ArrowUpCircle', 4, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM custom_account_types WHERE business_id = 1 AND type_code = 'revenue');

INSERT INTO custom_account_types (business_id, type_code, type_name_ar, type_name_en, color, icon, display_order, is_active, is_system_type)
SELECT 1, 'expense', 'مصروفات', 'Expenses', '#f59e0b', 'ArrowDownCircle', 5, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM custom_account_types WHERE business_id = 1 AND type_code = 'expense');
