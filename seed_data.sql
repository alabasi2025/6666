-- تعيين الترميز
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- إضافة عملاء في جدول customers_enhanced
INSERT INTO customers_enhanced (business_id, full_name, mobile_no, phone, email, address, national_id, customer_type, service_tier, cust_status, balance_due) VALUES
(1, 'محمد أحمد العمري', '0501234567', '0112345678', 'mohammed@email.com', 'الرياض - حي النخيل', '1234567890', 'residential', 'basic', 'active', 1250.50),
(1, 'شركة الفجر التجارية', '0551234567', '0112345679', 'info@alfajr.com', 'جدة - حي الروضة', '3001234567', 'commercial', 'premium', 'active', -5420.00),
(1, 'مصنع النور للصناعات', '0561234567', '0138765432', 'contact@alnoor-factory.com', 'الدمام - المنطقة الصناعية', '3101234567', 'industrial', 'vip', 'active', 45000.00),
(1, 'وزارة التعليم - فرع جدة', '0571234567', '0126543210', 'jeddah@moe.gov.sa', 'جدة - حي الصفا', '7001234567', 'government', 'premium', 'active', 0.00),
(1, 'مزرعة الخير الزراعية', '0559876543', '0163456789', 'alkhair.farm@email.com', 'القصيم - بريدة', '4101234567', 'residential', 'basic', 'suspended', 890.25),
(1, 'فندق النجوم الذهبية', '0541234567', '0114567890', 'info@goldenstars.com', 'الرياض - طريق الملك فهد', '3201234567', 'commercial', 'vip', 'active', 12500.00),
(1, 'مستشفى الشفاء', '0531234567', '0125678901', 'admin@alshifa.com', 'جدة - حي الحمراء', '3301234567', 'commercial', 'vip', 'active', 8750.00),
(1, 'جامعة الملك سعود', '0521234567', '0116789012', 'info@ksu.edu.sa', 'الرياض - الدرعية', '7101234567', 'government', 'premium', 'active', 0.00),
(1, 'أحمد سعيد الغامدي', '0511234567', '0117890123', 'ahmed.ghamdi@email.com', 'الطائف - حي الشهداء', '1345678901', 'residential', 'basic', 'active', 450.75),
(1, 'شركة البناء الحديث', '0591234567', '0118901234', 'info@modernbuild.com', 'الرياض - حي العليا', '3401234567', 'commercial', 'premium', 'active', -2300.00);

-- إضافة عدادات في جدول meters_enhanced
INSERT INTO meters_enhanced (business_id, customer_id, meter_no, meter_type, meter_status, installation_date, last_reading, last_reading_date) VALUES
(1, 1, 'MTR-001-001', 'single_phase', 'active', '2024-01-15', 1250.5, '2025-12-15'),
(1, 1, 'MTR-001-002', 'single_phase', 'active', '2024-02-20', 890.3, '2025-12-15'),
(1, 2, 'MTR-002-001', 'three_phase', 'active', '2024-01-10', 5420.8, '2025-12-15'),
(1, 2, 'MTR-002-002', 'three_phase', 'active', '2024-01-10', 3200.5, '2025-12-15'),
(1, 2, 'MTR-002-003', 'three_phase', 'active', '2024-03-05', 2100.2, '2025-12-15'),
(1, 3, 'MTR-003-001', 'industrial', 'active', '2023-06-01', 45000.0, '2025-12-15'),
(1, 3, 'MTR-003-002', 'industrial', 'active', '2023-06-01', 38500.5, '2025-12-15'),
(1, 3, 'MTR-003-003', 'industrial', 'active', '2023-08-15', 28000.3, '2025-12-15'),
(1, 4, 'MTR-004-001', 'three_phase', 'active', '2023-01-01', 8920.0, '2025-12-15'),
(1, 5, 'MTR-005-001', 'single_phase', 'suspended', '2024-05-10', 1200.0, '2025-11-15');

-- إضافة تعريفات الأسعار
INSERT INTO tariffs (business_id, code, name_ar, name_en, tariff_type, unit_price, fixed_charge, is_active) VALUES
(1, 'RES-01', 'سكني عادي', 'Residential Standard', 'residential', 0.18, 10.00, 1),
(1, 'COM-01', 'تجاري عادي', 'Commercial Standard', 'commercial', 0.25, 50.00, 1),
(1, 'IND-01', 'صناعي', 'Industrial', 'industrial', 0.15, 100.00, 1),
(1, 'GOV-01', 'حكومي', 'Government', 'government', 0.12, 0.00, 1);

-- إضافة موظفين
INSERT INTO employees (business_id, employee_no, full_name_ar, full_name_en, department_id, job_title_id, email, phone, hire_date, status) VALUES
(1, 'EMP-001', 'خالد محمد السعيد', 'Khalid Mohammed Alsaeed', 1, 1, 'khalid@company.com', '0501111111', '2023-01-15', 'active'),
(1, 'EMP-002', 'سارة أحمد العتيبي', 'Sara Ahmed Alotaibi', 1, 2, 'sara@company.com', '0502222222', '2023-03-01', 'active'),
(1, 'EMP-003', 'عبدالله فهد الدوسري', 'Abdullah Fahad Aldosari', 2, 3, 'abdullah@company.com', '0503333333', '2022-06-15', 'active'),
(1, 'EMP-004', 'نورة سعد القحطاني', 'Noura Saad Alqahtani', 2, 4, 'noura@company.com', '0504444444', '2024-01-10', 'active'),
(1, 'EMP-005', 'فيصل عبدالرحمن الشمري', 'Faisal Abdulrahman Alshammari', 3, 5, 'faisal@company.com', '0505555555', '2023-09-01', 'active');
