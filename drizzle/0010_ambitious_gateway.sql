CREATE TABLE `diesel_pipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`station_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`pipe_material` enum('iron','plastic','copper','stainless_steel') DEFAULT 'iron',
	`diameter` decimal(6,2),
	`length` decimal(8,2),
	`condition` enum('good','fair','poor','needs_replacement') DEFAULT 'good',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diesel_pipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diesel_pump_meters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`station_id` int,
	`supplier_id` int,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`pump_type` enum('supplier','intake','output') NOT NULL,
	`serial_number` varchar(100),
	`current_reading` decimal(15,2) DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diesel_pump_meters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diesel_pump_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`pump_meter_id` int NOT NULL,
	`task_id` int,
	`reading_date` datetime NOT NULL,
	`reading_value` decimal(15,2) NOT NULL,
	`reading_type` enum('before','after') NOT NULL,
	`reading_image` text,
	`quantity` decimal(10,2),
	`recorded_by` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diesel_pump_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diesel_receiving_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`station_id` int NOT NULL,
	`task_number` varchar(50) NOT NULL,
	`task_date` date NOT NULL,
	`employee_id` int NOT NULL,
	`tanker_id` int NOT NULL,
	`supplier_id` int NOT NULL,
	`task_status` enum('pending','started','at_supplier','loading','returning','at_station','unloading','completed','cancelled') DEFAULT 'pending',
	`start_time` datetime,
	`arrival_at_supplier_time` datetime,
	`loading_start_time` datetime,
	`loading_end_time` datetime,
	`departure_from_supplier_time` datetime,
	`arrival_at_station_time` datetime,
	`unloading_start_time` datetime,
	`unloading_end_time` datetime,
	`completion_time` datetime,
	`supplier_pump_id` int,
	`supplier_pump_reading_before` decimal(15,2),
	`supplier_pump_reading_after` decimal(15,2),
	`supplier_pump_reading_before_image` text,
	`supplier_pump_reading_after_image` text,
	`supplier_invoice_number` varchar(50),
	`supplier_invoice_image` text,
	`supplier_invoice_amount` decimal(18,2),
	`quantity_from_supplier` decimal(10,2),
	`compartment1_quantity` decimal(10,2),
	`compartment2_quantity` decimal(10,2),
	`intake_pump_id` int,
	`intake_pump_reading_before` decimal(15,2),
	`intake_pump_reading_after` decimal(15,2),
	`intake_pump_reading_before_image` text,
	`intake_pump_reading_after_image` text,
	`quantity_received_at_station` decimal(10,2),
	`receiving_tank_id` int,
	`quantity_difference` decimal(10,2),
	`difference_notes` text,
	`notes` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diesel_receiving_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diesel_suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`phone` varchar(50),
	`address` text,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`contact_person` varchar(100),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diesel_suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diesel_tank_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`station_id` int NOT NULL,
	`movement_date` datetime NOT NULL,
	`movement_type` enum('receiving','transfer','consumption','adjustment') NOT NULL,
	`from_tank_id` int,
	`to_tank_id` int,
	`quantity` decimal(10,2) NOT NULL,
	`task_id` int,
	`output_pump_id` int,
	`output_pump_reading_before` decimal(15,2),
	`output_pump_reading_after` decimal(15,2),
	`generator_id` int,
	`notes` text,
	`recorded_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diesel_tank_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diesel_tank_openings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tank_id` int NOT NULL,
	`opening_number` int NOT NULL,
	`position` enum('top','bottom','side') NOT NULL,
	`usage` enum('inlet','outlet','ventilation','measurement','cleaning') NOT NULL,
	`diameter` decimal(6,2),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diesel_tank_openings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diesel_tankers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`plate_number` varchar(20) NOT NULL,
	`capacity` decimal(10,2) NOT NULL,
	`compartment1_capacity` decimal(10,2),
	`compartment2_capacity` decimal(10,2),
	`driver_name` varchar(100),
	`driver_phone` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diesel_tankers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diesel_tanks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`station_id` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`tank_type` enum('receiving','main','pre_output','generator') NOT NULL,
	`tank_material` enum('plastic','iron','stainless_steel','fiberglass') DEFAULT 'plastic',
	`brand` varchar(100),
	`color` varchar(50),
	`capacity` decimal(10,2) NOT NULL,
	`height` decimal(8,2),
	`diameter` decimal(8,2),
	`dead_stock` decimal(10,2) DEFAULT '0',
	`effective_capacity` decimal(10,2),
	`current_level` decimal(10,2) DEFAULT '0',
	`min_level` decimal(10,2) DEFAULT '0',
	`openings_count` int DEFAULT 1,
	`linked_generator_id` int,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diesel_tanks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generator_diesel_consumption` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`station_id` int NOT NULL,
	`generator_id` int NOT NULL,
	`consumption_date` date NOT NULL,
	`rocket_tank_id` int,
	`start_level` decimal(10,2),
	`end_level` decimal(10,2),
	`quantity_consumed` decimal(10,2) NOT NULL,
	`running_hours` decimal(8,2),
	`consumption_rate` decimal(8,2),
	`notes` text,
	`recorded_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generator_diesel_consumption_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `station_diesel_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`station_id` int NOT NULL,
	`has_intake_pump` boolean DEFAULT false,
	`has_output_pump` boolean DEFAULT false,
	`intake_pump_has_meter` boolean DEFAULT false,
	`output_pump_has_meter` boolean DEFAULT false,
	`notes` text,
	`configured_by` int,
	`configured_at` timestamp DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `station_diesel_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `station_diesel_config_station_id_unique` UNIQUE(`station_id`)
);
--> statement-breakpoint
CREATE TABLE `station_diesel_path` (
	`id` int AUTO_INCREMENT NOT NULL,
	`config_id` int NOT NULL,
	`sequence_order` int NOT NULL,
	`element_type` enum('receiving_tank','pipe','intake_pump','main_tank','pre_output_tank','output_pump','generator_tank') NOT NULL,
	`tank_id` int,
	`pump_id` int,
	`pipe_id` int,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `station_diesel_path_id` PRIMARY KEY(`id`)
);
