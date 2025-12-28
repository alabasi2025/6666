CREATE TABLE `custom_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`sub_system_id` int,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`category_type` enum('income','expense','both') NOT NULL,
	`parent_id` int,
	`level` int DEFAULT 1,
	`color` varchar(20),
	`icon` varchar(50),
	`description` text,
	`linked_account_id` int,
	`is_active` boolean DEFAULT true,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `cc_code_idx` UNIQUE(`business_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `custom_parties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`sub_system_id` int,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`party_type` enum('customer','supplier','employee','partner','government','other') NOT NULL,
	`phone` varchar(50),
	`mobile` varchar(50),
	`email` varchar(255),
	`address` text,
	`city` varchar(100),
	`country` varchar(100) DEFAULT 'Saudi Arabia',
	`tax_number` varchar(50),
	`commercial_register` varchar(50),
	`credit_limit` decimal(18,2) DEFAULT '0',
	`current_balance` decimal(18,2) DEFAULT '0',
	`currency` varchar(10) DEFAULT 'SAR',
	`contact_person` varchar(255),
	`notes` text,
	`tags` json,
	`is_active` boolean DEFAULT true,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_parties_id` PRIMARY KEY(`id`),
	CONSTRAINT `cp_code_idx` UNIQUE(`business_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `custom_party_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`party_id` int NOT NULL,
	`transaction_type` enum('receipt','payment','invoice','credit_note','debit_note','adjustment') NOT NULL,
	`transaction_date` date NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`balance_before` decimal(18,2) NOT NULL,
	`balance_after` decimal(18,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'SAR',
	`reference_type` varchar(50),
	`reference_id` int,
	`reference_number` varchar(50),
	`description` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_party_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`sub_system_id` int,
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text,
	`setting_type` enum('string','number','boolean','json') DEFAULT 'string',
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_treasury_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`treasury_id` int NOT NULL,
	`movement_type` enum('receipt','payment','transfer_in','transfer_out','adjustment','opening') NOT NULL,
	`movement_date` date NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`balance_before` decimal(18,2) NOT NULL,
	`balance_after` decimal(18,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'SAR',
	`reference_type` varchar(50),
	`reference_id` int,
	`reference_number` varchar(50),
	`description` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_treasury_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` MODIFY COLUMN `destination_type` enum('person','entity','intermediary','party','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` MODIFY COLUMN `source_type` enum('person','entity','intermediary','party','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` ADD `party_id` int;--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` ADD `category_id` int;--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` ADD `payment_method` enum('cash','check','transfer','card','wallet','other') DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` ADD `check_number` varchar(50);--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` ADD `check_date` date;--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` ADD `check_bank` varchar(100);--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` ADD `bank_reference` varchar(100);--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` ADD `party_id` int;--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` ADD `category_id` int;--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` ADD `payment_method` enum('cash','check','transfer','card','wallet','other') DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` ADD `check_number` varchar(50);--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` ADD `check_date` date;--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` ADD `check_bank` varchar(100);--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` ADD `bank_reference` varchar(100);--> statement-breakpoint
ALTER TABLE `custom_payment_vouchers` ADD CONSTRAINT `cpv_number_idx` UNIQUE(`business_id`,`sub_system_id`,`voucher_number`);--> statement-breakpoint
ALTER TABLE `custom_receipt_vouchers` ADD CONSTRAINT `crv_number_idx` UNIQUE(`business_id`,`sub_system_id`,`voucher_number`);--> statement-breakpoint
ALTER TABLE `custom_sub_systems` ADD CONSTRAINT `css_code_idx` UNIQUE(`business_id`,`code`);--> statement-breakpoint
ALTER TABLE `custom_treasuries` ADD CONSTRAINT `ct_code_idx` UNIQUE(`business_id`,`code`);--> statement-breakpoint
CREATE INDEX `cc_business_idx` ON `custom_categories` (`business_id`);--> statement-breakpoint
CREATE INDEX `cc_parent_idx` ON `custom_categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `cc_type_idx` ON `custom_categories` (`business_id`,`category_type`);--> statement-breakpoint
CREATE INDEX `cp_business_idx` ON `custom_parties` (`business_id`);--> statement-breakpoint
CREATE INDEX `cp_subsystem_idx` ON `custom_parties` (`sub_system_id`);--> statement-breakpoint
CREATE INDEX `cp_party_type_idx` ON `custom_parties` (`business_id`,`party_type`);--> statement-breakpoint
CREATE INDEX `cp_name_idx` ON `custom_parties` (`name_ar`);--> statement-breakpoint
CREATE INDEX `cpt_party_idx` ON `custom_party_transactions` (`party_id`);--> statement-breakpoint
CREATE INDEX `cpt_date_idx` ON `custom_party_transactions` (`transaction_date`);--> statement-breakpoint
CREATE INDEX `cpt_type_idx` ON `custom_party_transactions` (`transaction_type`);--> statement-breakpoint
CREATE INDEX `cpt_ref_idx` ON `custom_party_transactions` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE INDEX `cpt_party_date_idx` ON `custom_party_transactions` (`party_id`,`transaction_date`);--> statement-breakpoint
CREATE INDEX `ctm_treasury_idx` ON `custom_treasury_movements` (`treasury_id`);--> statement-breakpoint
CREATE INDEX `ctm_date_idx` ON `custom_treasury_movements` (`movement_date`);--> statement-breakpoint
CREATE INDEX `ctm_type_idx` ON `custom_treasury_movements` (`movement_type`);--> statement-breakpoint
CREATE INDEX `ctm_ref_idx` ON `custom_treasury_movements` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE INDEX `ctm_treasury_date_idx` ON `custom_treasury_movements` (`treasury_id`,`movement_date`);--> statement-breakpoint
CREATE INDEX `cpv_business_idx` ON `custom_payment_vouchers` (`business_id`);--> statement-breakpoint
CREATE INDEX `cpv_subsystem_idx` ON `custom_payment_vouchers` (`sub_system_id`);--> statement-breakpoint
CREATE INDEX `cpv_treasury_idx` ON `custom_payment_vouchers` (`treasury_id`);--> statement-breakpoint
CREATE INDEX `cpv_party_idx` ON `custom_payment_vouchers` (`party_id`);--> statement-breakpoint
CREATE INDEX `cpv_category_idx` ON `custom_payment_vouchers` (`category_id`);--> statement-breakpoint
CREATE INDEX `cpv_date_idx` ON `custom_payment_vouchers` (`voucher_date`);--> statement-breakpoint
CREATE INDEX `crv_business_idx` ON `custom_receipt_vouchers` (`business_id`);--> statement-breakpoint
CREATE INDEX `crv_subsystem_idx` ON `custom_receipt_vouchers` (`sub_system_id`);--> statement-breakpoint
CREATE INDEX `crv_treasury_idx` ON `custom_receipt_vouchers` (`treasury_id`);--> statement-breakpoint
CREATE INDEX `crv_party_idx` ON `custom_receipt_vouchers` (`party_id`);--> statement-breakpoint
CREATE INDEX `crv_category_idx` ON `custom_receipt_vouchers` (`category_id`);--> statement-breakpoint
CREATE INDEX `crv_date_idx` ON `custom_receipt_vouchers` (`voucher_date`);--> statement-breakpoint
CREATE INDEX `css_business_idx` ON `custom_sub_systems` (`business_id`);--> statement-breakpoint
CREATE INDEX `ct_business_idx` ON `custom_treasuries` (`business_id`);--> statement-breakpoint
CREATE INDEX `ct_subsystem_idx` ON `custom_treasuries` (`sub_system_id`);--> statement-breakpoint
CREATE INDEX `ct_type_idx` ON `custom_treasuries` (`treasury_type`);