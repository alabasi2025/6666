CREATE TABLE `custom_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`account_number` varchar(50) NOT NULL,
	`account_name` varchar(255) NOT NULL,
	`account_type` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`parent_id` int,
	`balance` decimal(15,2) DEFAULT '0',
	`currency` varchar(10) DEFAULT 'SAR',
	`description` text,
	`is_active` boolean DEFAULT true,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_memos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`memo_number` varchar(50) NOT NULL,
	`memo_date` date NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text,
	`memo_type` enum('internal','external','circular','directive') DEFAULT 'internal',
	`from_department` varchar(255),
	`to_department` varchar(255),
	`status` enum('draft','sent','received','archived') DEFAULT 'draft',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`attachments` json,
	`response_required` boolean DEFAULT false,
	`response_deadline` date,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_memos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`category` varchar(100),
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`color` varchar(20),
	`is_pinned` boolean DEFAULT false,
	`is_archived` boolean DEFAULT false,
	`tags` json,
	`attachments` json,
	`reminder_date` timestamp NULL DEFAULT NULL,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`transaction_number` varchar(50) NOT NULL,
	`transaction_date` date NOT NULL,
	`account_id` int NOT NULL,
	`transaction_type` enum('debit','credit') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`description` text,
	`reference_type` varchar(50),
	`reference_id` int,
	`attachments` json,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `note_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20),
	`icon` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `note_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `businesses` ADD `system_type` enum('energy','custom') DEFAULT 'energy' NOT NULL;