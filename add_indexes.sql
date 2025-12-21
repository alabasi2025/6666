-- =====================================================
-- سكريبت إضافة الفهارس لنظام إدارة الطاقة
-- تاريخ الإنشاء: 2025-12-21
-- =====================================================

-- =====================================================
-- 1. جدول الأصول (assets) - 7 فهارس
-- =====================================================
CREATE INDEX idx_assets_station_id ON assets(station_id);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_branch_id ON assets(branch_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_purchase_date ON assets(purchase_date);
-- الفهارس الفريدة - قد تفشل إذا وجدت قيم مكررة أو NULL
CREATE INDEX idx_assets_serial_number ON assets(serial_number);
CREATE INDEX idx_assets_barcode ON assets(barcode);

-- =====================================================
-- 2. جدول حركات الأصول (asset_movements) - 5 فهارس
-- =====================================================
CREATE INDEX idx_asset_movements_asset_id ON asset_movements(asset_id);
CREATE INDEX idx_asset_movements_type ON asset_movements(movement_type);
CREATE INDEX idx_asset_movements_date ON asset_movements(movement_date);
CREATE INDEX idx_asset_movements_from_station ON asset_movements(from_station_id);
CREATE INDEX idx_asset_movements_to_station ON asset_movements(to_station_id);

-- =====================================================
-- 3. جدول فئات الأصول (asset_categories) - 2 فهارس
-- =====================================================
CREATE INDEX idx_asset_categories_parent_id ON asset_categories(parent_id);
CREATE INDEX idx_asset_categories_code ON asset_categories(code);

-- =====================================================
-- 4. جدول العملاء (customers) - 7 فهارس
-- =====================================================
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);
CREATE INDEX idx_customers_station_id ON customers(station_id);
CREATE INDEX idx_customers_account_number ON customers(account_number);
CREATE INDEX idx_customers_id_number ON customers(id_number);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_type ON customers(type);

-- =====================================================
-- 5. جدول العدادات (meters) - 5 فهارس
-- =====================================================
CREATE INDEX idx_meters_business_id ON meters(business_id);
CREATE INDEX idx_meters_customer_id ON meters(customer_id);
CREATE INDEX idx_meters_meter_number ON meters(meter_number);
CREATE INDEX idx_meters_status ON meters(status);
CREATE INDEX idx_meters_type ON meters(type);

-- =====================================================
-- 6. جدول أوامر العمل (work_orders) - 9 فهارس
-- =====================================================
CREATE INDEX idx_work_orders_business_id ON work_orders(business_id);
CREATE INDEX idx_work_orders_branch_id ON work_orders(branch_id);
CREATE INDEX idx_work_orders_station_id ON work_orders(station_id);
CREATE INDEX idx_work_orders_asset_id ON work_orders(asset_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);
CREATE INDEX idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX idx_work_orders_order_number ON work_orders(order_number);
CREATE INDEX idx_work_orders_scheduled_start ON work_orders(scheduled_start);

-- =====================================================
-- 7. جدول الفواتير (invoices) - 6 فهارس
-- =====================================================
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_meter_id ON invoices(meter_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- =====================================================
-- 8. جدول المحطات (stations) - 4 فهارس
-- =====================================================
CREATE INDEX idx_stations_branch_id ON stations(branch_id);
CREATE INDEX idx_stations_type ON stations(type);
CREATE INDEX idx_stations_status ON stations(status);
CREATE INDEX idx_stations_code ON stations(code);

-- =====================================================
-- نهاية السكريبت - المجموع: 45 فهرس
-- =====================================================
