-- Migration: Add analytic account id to payment voucher lines
-- Purpose: Store the analytic (child) account linked to the selected chart account.

ALTER TABLE `custom_payment_voucher_lines`
  ADD COLUMN `analytic_account_id` int DEFAULT NULL,
  ADD KEY `cpvl_analytic_account_idx` (`analytic_account_id`);


