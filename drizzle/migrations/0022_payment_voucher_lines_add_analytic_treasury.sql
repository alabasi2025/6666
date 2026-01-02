-- Migration: Add analytic treasury id to payment voucher lines
-- Purpose: Store the linked treasury (cash/bank/wallet/exchange) associated with the selected chart account.

ALTER TABLE `custom_payment_voucher_lines`
  ADD COLUMN `analytic_treasury_id` int DEFAULT NULL,
  ADD KEY `cpvl_analytic_treasury_idx` (`analytic_treasury_id`);


