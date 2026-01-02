ALTER TABLE `accounts` ADD `system_module` enum('assets','maintenance','inventory','procurement','customers','billing','scada','projects','hr','operations','finance','general') NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `account_type` enum('main','sub','detail') DEFAULT 'detail';--> statement-breakpoint
ALTER TABLE `accounts` ADD `linked_entity_type` varchar(50);--> statement-breakpoint
ALTER TABLE `accounts` ADD `linked_entity_id` int;--> statement-breakpoint
ALTER TABLE `accounts` DROP COLUMN `type`;