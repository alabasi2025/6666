-- Migration: Insert default account types with proper UTF-8 encoding
-- Created: 2025-12-31

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

INSERT INTO custom_account_types 
(business_id, type_code, type_name_ar, type_name_en, color, icon, display_order, is_active, is_system_type)
VALUES
(1, 'asset', 'أصول', 'Assets', '#10b981', 'TrendingUp', 1, 1, 1),
(1, 'liability', 'التزامات', 'Liabilities', '#ef4444', 'TrendingDown', 2, 1, 1),
(1, 'equity', 'حقوق ملكية', 'Equity', '#8b5cf6', 'Users', 3, 1, 1),
(1, 'revenue', 'إيرادات', 'Revenue', '#3b82f6', 'ArrowUpCircle', 4, 1, 1),
(1, 'expense', 'مصروفات', 'Expenses', '#f59e0b', 'ArrowDownCircle', 5, 1, 1);
