-- Fix user names encoding
-- Update users table with correct Arabic names

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update user names (adjust these based on actual names)
UPDATE users SET name = 'مدير النظام' WHERE phone = '0500000000' AND name LIKE '%?%';
UPDATE users SET name = 'مستخدم تجريبي' WHERE phone IS NULL AND name LIKE '%?%';

-- If you know the actual names, update them here
-- UPDATE users SET name = 'الاسم الصحيح' WHERE id = 1;
-- UPDATE users SET name = 'الاسم الصحيح' WHERE id = 2;

