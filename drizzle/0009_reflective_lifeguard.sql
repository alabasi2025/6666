CREATE TABLE `areas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`project_id` int,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`description` text,
	`address` text,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `areas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billing_periods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`project_id` int,
	`name` varchar(100) NOT NULL,
	`period_number` int,
	`month` int,
	`year` int,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`period_status` enum('pending','active','reading_phase','billing_phase','closed') DEFAULT 'pending',
	`reading_start_date` date,
	`reading_end_date` date,
	`billing_date` date,
	`due_date` date,
	`total_meters` int DEFAULT 0,
	`read_meters` int DEFAULT 0,
	`billed_meters` int DEFAULT 0,
	`created_by` int,
	`closed_by` int,
	`closed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billing_periods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cabinets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`square_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`cabinet_type` enum('main','sub','distribution') DEFAULT 'distribution',
	`capacity` int,
	`current_load` int DEFAULT 0,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cabinets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashboxes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`branch_id` int,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`balance` decimal(18,2) DEFAULT '0',
	`currency` varchar(10) DEFAULT 'SAR',
	`assigned_to` int,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cashboxes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_transactions_new` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`wallet_id` int,
	`trans_type` enum('payment','refund','charge','adjustment','deposit','withdrawal') NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`balance_before` decimal(18,2),
	`balance_after` decimal(18,2),
	`reference_type` varchar(50),
	`reference_id` int,
	`description` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_transactions_new_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`balance` decimal(18,2) DEFAULT '0',
	`currency` varchar(10) DEFAULT 'SAR',
	`last_transaction_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers_enhanced` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`project_id` int,
	`full_name` varchar(255) NOT NULL,
	`mobile_no` varchar(50),
	`phone` varchar(50),
	`email` varchar(255),
	`address` text,
	`national_id` varchar(50),
	`customer_type` enum('residential','commercial','industrial','government') DEFAULT 'residential',
	`service_tier` enum('basic','premium','vip') DEFAULT 'basic',
	`cust_status` enum('active','inactive','suspended','closed') DEFAULT 'active',
	`balance_due` decimal(18,2) DEFAULT '0',
	`user_id` int,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_enhanced_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`description` text,
	`fee_type` enum('fixed','percentage','per_unit') DEFAULT 'fixed',
	`amount` decimal(18,2) DEFAULT '0',
	`is_recurring` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fee_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_fees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_id` int NOT NULL,
	`fee_type_id` int NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_fees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices_enhanced` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`meter_id` int,
	`meter_reading_id` int,
	`billing_period_id` int,
	`invoice_no` varchar(50) NOT NULL,
	`invoice_date` date NOT NULL,
	`due_date` date,
	`period_start` date,
	`period_end` date,
	`meter_number` varchar(50),
	`previous_reading` decimal(15,3),
	`current_reading` decimal(15,3),
	`total_consumption_kwh` decimal(15,3),
	`price_kwh` decimal(10,4),
	`consumption_amount` decimal(18,2) DEFAULT '0',
	`fixed_charges` decimal(18,2) DEFAULT '0',
	`total_fees` decimal(18,2) DEFAULT '0',
	`vat_rate` decimal(5,2) DEFAULT '15',
	`vat_amount` decimal(18,2) DEFAULT '0',
	`total_amount` decimal(18,2) DEFAULT '0',
	`previous_balance_due` decimal(18,2) DEFAULT '0',
	`final_amount` decimal(18,2) DEFAULT '0',
	`paid_amount` decimal(18,2) DEFAULT '0',
	`balance_due` decimal(18,2) DEFAULT '0',
	`invoice_status` enum('generated','partial','approved','locked','paid','cancelled') DEFAULT 'generated',
	`invoice_type` enum('partial','final') DEFAULT 'final',
	`approved_by` int,
	`approved_at` timestamp,
	`created_by` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_enhanced_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meter_readings_enhanced` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meter_id` int NOT NULL,
	`billing_period_id` int NOT NULL,
	`current_reading` decimal(15,3) NOT NULL,
	`previous_reading` decimal(15,3),
	`consumption` decimal(15,3),
	`reading_date` date NOT NULL,
	`reading_type` enum('actual','estimated','adjusted') DEFAULT 'actual',
	`reading_status` enum('entered','approved','locked','disputed') DEFAULT 'entered',
	`is_estimated` boolean DEFAULT false,
	`images` json,
	`read_by` int,
	`approved_by` int,
	`approved_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meter_readings_enhanced_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meters_enhanced` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`customer_id` int,
	`cabinet_id` int,
	`tariff_id` int,
	`project_id` int,
	`meter_number` varchar(50) NOT NULL,
	`serial_number` varchar(100),
	`meter_type` enum('electricity','water','gas') DEFAULT 'electricity',
	`brand` varchar(100),
	`model` varchar(100),
	`meter_category` enum('offline','iot','code') DEFAULT 'offline',
	`current_reading` decimal(15,3) DEFAULT '0',
	`previous_reading` decimal(15,3) DEFAULT '0',
	`balance` decimal(18,2) DEFAULT '0',
	`balance_due` decimal(18,2) DEFAULT '0',
	`installation_date` date,
	`installation_status` enum('new','used','not_installed') DEFAULT 'new',
	`sign_number` varchar(50),
	`sign_color` varchar(50),
	`meter_status` enum('active','inactive','maintenance','faulty','not_installed') DEFAULT 'active',
	`is_active` boolean DEFAULT true,
	`iot_device_id` varchar(100),
	`last_sync_time` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meters_enhanced_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods_new` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`method_type` enum('cash','card','bank_transfer','check','online','sadad','wallet') DEFAULT 'cash',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_new_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments_enhanced` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`meter_id` int,
	`invoice_id` int,
	`cashbox_id` int,
	`payment_method_id` int,
	`payment_number` varchar(50) NOT NULL,
	`payment_date` date NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`balance_due_before` decimal(18,2),
	`balance_due_after` decimal(18,2),
	`payer_name` varchar(255),
	`reference_number` varchar(100),
	`payment_status` enum('pending','completed','failed','refunded') DEFAULT 'completed',
	`notes` text,
	`received_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_enhanced_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prepaid_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`meter_id` int,
	`code` varchar(100) NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`prepaid_status` enum('active','used','expired','cancelled') DEFAULT 'active',
	`used_at` timestamp,
	`expires_at` timestamp,
	`generated_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prepaid_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `prepaid_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`payment_id` int NOT NULL,
	`receipt_number` varchar(50) NOT NULL,
	`issue_date` date NOT NULL,
	`description` text,
	`printed_by` int,
	`printed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `receipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `squares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`area_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`description` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `squares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tariffs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`description` text,
	`tariff_type` enum('standard','custom','promotional','contract') DEFAULT 'standard',
	`service_type` enum('electricity','water','gas') DEFAULT 'electricity',
	`slabs` json,
	`fixed_charge` decimal(18,2) DEFAULT '0',
	`vat_rate` decimal(5,2) DEFAULT '15',
	`effective_from` date,
	`effective_to` date,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tariffs_id` PRIMARY KEY(`id`)
);
