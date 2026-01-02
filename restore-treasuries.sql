SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DELETE FROM custom_treasuries;

INSERT INTO custom_treasuries
  (business_id, sub_system_id, code, name_ar, name_en, treasury_type, bank_name, account_number, iban, swift_code, wallet_provider, wallet_number, currency, opening_balance, current_balance, description, is_active, created_by, created_at, updated_at, accountId)
VALUES
  (1,1,'TR-001','صندوق التحصيل والتوريد الدهمية','Collection and Supply Treasury - Dhamiya','cash',NULL,NULL,NULL,NULL,NULL,NULL,'YER',0,0,'صندوق التحصيل والتوريد الدهمية',1,1,'2025-12-28 23:46:13','2026-01-01 00:12:27',NULL),
  (1,1,'TR-002','صندوق التحصيل والتوريد الصبالي','Collection and Supply Treasury - Sabali','cash',NULL,NULL,NULL,NULL,NULL,NULL,'YER',0,0,'صندوق التحصيل والتوريد الصبالي',1,1,'2025-12-28 23:46:13','2026-01-01 00:03:58',NULL),
  (1,1,'TR-003','صندوق غليل','Ghalil Treasury','cash',NULL,NULL,NULL,NULL,NULL,NULL,'YER',0,0,'صندوق غليل',1,1,'2025-12-28 23:46:13','2026-01-01 00:04:08',NULL),
  (1,1,'21','بنك','','bank',NULL,NULL,NULL,NULL,NULL,NULL,'YER',0,0,'',1,1,'2026-01-01 00:04:29','2026-01-01 00:12:16',NULL),
  (1,1,'55','محفظة','','wallet',NULL,NULL,NULL,NULL,NULL,NULL,'YER',0,0,'',1,1,'2026-01-01 00:04:45','2026-01-01 00:11:59',NULL),
  (1,1,'88','صراف','','exchange',NULL,NULL,NULL,NULL,NULL,NULL,'YER',0,0,'',1,1,'2026-01-01 00:05:01','2026-01-01 00:05:01',NULL);


