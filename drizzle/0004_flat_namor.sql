CREATE TABLE `equipment_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipment_id` int NOT NULL,
	`movement_type` enum('checkout','return','transfer','maintenance','retire') NOT NULL,
	`from_holder_id` int,
	`to_holder_id` int,
	`operation_id` int,
	`movement_date` timestamp NOT NULL DEFAULT (now()),
	`condition_before` enum('excellent','good','fair','poor'),
	`condition_after` enum('excellent','good','fair','poor'),
	`notes` text,
	`recorded_by` int,
	CONSTRAINT `equipment_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`equipment_code` varchar(30) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`equipment_type` enum('tool','vehicle','device','safety','measuring') NOT NULL,
	`serial_number` varchar(100),
	`model` varchar(100),
	`brand` varchar(100),
	`status` enum('available','in_use','maintenance','retired','lost') DEFAULT 'available',
	`current_holder_id` int,
	`assigned_team_id` int,
	`purchase_date` date,
	`purchase_cost` decimal(12,2),
	`warranty_end` date,
	`last_maintenance` date,
	`next_maintenance` date,
	`condition` enum('excellent','good','fair','poor') DEFAULT 'good',
	`notes` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_equipment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_operations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`station_id` int,
	`operation_number` varchar(30) NOT NULL,
	`operation_type` enum('installation','maintenance','inspection','disconnection','reconnection','meter_reading','collection','repair','replacement') NOT NULL,
	`status` enum('draft','scheduled','assigned','in_progress','waiting_customer','on_hold','completed','cancelled','rejected') DEFAULT 'draft',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`description` text,
	`reference_type` varchar(50),
	`reference_id` int,
	`customer_id` int,
	`asset_id` int,
	`location_lat` decimal(10,8),
	`location_lng` decimal(11,8),
	`address` text,
	`scheduled_date` date,
	`scheduled_time` varchar(10),
	`started_at` timestamp,
	`completed_at` timestamp,
	`assigned_team_id` int,
	`assigned_worker_id` int,
	`estimated_duration` int,
	`actual_duration` int,
	`notes` text,
	`completion_notes` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_operations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`branch_id` int,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`team_type` enum('installation','maintenance','inspection','collection','mixed') DEFAULT 'mixed',
	`leader_id` int,
	`max_members` int DEFAULT 10,
	`current_members` int DEFAULT 0,
	`status` enum('active','inactive','on_leave') DEFAULT 'active',
	`working_area` text,
	`notes` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_workers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`user_id` int,
	`employee_number` varchar(30) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`phone` varchar(50),
	`email` varchar(255),
	`team_id` int,
	`worker_type` enum('technician','engineer','supervisor','driver','helper') DEFAULT 'technician',
	`specialization` varchar(100),
	`skills` json,
	`status` enum('available','busy','on_leave','inactive') DEFAULT 'available',
	`current_location_lat` decimal(10,8),
	`current_location_lng` decimal(11,8),
	`last_location_update` timestamp,
	`hire_date` date,
	`daily_rate` decimal(10,2),
	`operation_rate` decimal(10,2),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_workers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspection_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`code` varchar(30) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`operation_type` varchar(50),
	`items` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspection_checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspection_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspection_id` int NOT NULL,
	`checklist_item_id` int,
	`item_name` varchar(255) NOT NULL,
	`is_passed` boolean,
	`score` decimal(5,2),
	`notes` text,
	`photo_url` varchar(500),
	CONSTRAINT `inspection_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`operation_id` int NOT NULL,
	`inspection_number` varchar(30) NOT NULL,
	`inspection_type` enum('quality','safety','completion','periodic') NOT NULL,
	`inspector_id` int,
	`inspection_date` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','passed','failed','conditional') DEFAULT 'pending',
	`overall_score` decimal(5,2),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installation_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operation_id` int NOT NULL,
	`customer_id` int,
	`meter_serial_number` varchar(100),
	`meter_type` enum('smart','traditional','prepaid'),
	`seal_number` varchar(50),
	`seal_color` varchar(30),
	`seal_type` varchar(50),
	`breaker_type` varchar(50),
	`breaker_capacity` varchar(20),
	`breaker_brand` varchar(50),
	`cable_length` decimal(10,2),
	`cable_type` varchar(50),
	`cable_size` varchar(20),
	`initial_reading` decimal(15,3),
	`installation_date` date,
	`installation_time` varchar(10),
	`technician_id` int,
	`notes` text,
	`customer_signature` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `installation_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installation_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installation_id` int,
	`operation_id` int NOT NULL,
	`photo_type` enum('meter_front','meter_reading','seal','breaker','wiring','location','customer_premises','before_installation','after_installation'),
	`photo_url` varchar(500) NOT NULL,
	`caption` varchar(200),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`captured_at` timestamp,
	`uploaded_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `installation_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_request_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` int NOT NULL,
	`item_id` int NOT NULL,
	`requested_qty` decimal(12,3) NOT NULL,
	`approved_qty` decimal(12,3),
	`issued_qty` decimal(12,3),
	`returned_qty` decimal(12,3),
	`unit` varchar(20),
	`notes` text,
	CONSTRAINT `material_request_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`request_number` varchar(30) NOT NULL,
	`operation_id` int,
	`worker_id` int,
	`team_id` int,
	`warehouse_id` int,
	`request_date` date NOT NULL,
	`status` enum('pending','approved','issued','returned','cancelled') DEFAULT 'pending',
	`notes` text,
	`approved_by` int,
	`approved_at` timestamp,
	`issued_by` int,
	`issued_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `material_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operation_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operation_id` int NOT NULL,
	`approval_level` int DEFAULT 1,
	`approver_id` int,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`decision_date` timestamp,
	`notes` text,
	`signature_url` varchar(500),
	CONSTRAINT `operation_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operation_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`operation_id` int NOT NULL,
	`worker_id` int NOT NULL,
	`payment_type` enum('fixed','per_operation','commission','hourly') DEFAULT 'per_operation',
	`base_amount` decimal(12,2) DEFAULT '0',
	`bonus_amount` decimal(12,2) DEFAULT '0',
	`deduction_amount` decimal(12,2) DEFAULT '0',
	`net_amount` decimal(12,2) DEFAULT '0',
	`status` enum('calculated','approved','paid') DEFAULT 'calculated',
	`calculated_at` timestamp NOT NULL DEFAULT (now()),
	`approved_by` int,
	`approved_at` timestamp,
	`paid_at` timestamp,
	CONSTRAINT `operation_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operation_status_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operation_id` int NOT NULL,
	`from_status` varchar(30),
	`to_status` varchar(30) NOT NULL,
	`changed_by` int,
	`changed_at` timestamp NOT NULL DEFAULT (now()),
	`reason` text,
	`notes` text,
	CONSTRAINT `operation_status_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `period_settlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`settlement_number` varchar(30) NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`total_operations` int DEFAULT 0,
	`total_amount` decimal(15,2) DEFAULT '0',
	`total_bonuses` decimal(15,2) DEFAULT '0',
	`total_deductions` decimal(15,2) DEFAULT '0',
	`net_amount` decimal(15,2) DEFAULT '0',
	`status` enum('draft','approved','paid') DEFAULT 'draft',
	`approved_by` int,
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `period_settlements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settlement_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settlement_id` int NOT NULL,
	`worker_id` int NOT NULL,
	`operations_count` int DEFAULT 0,
	`base_amount` decimal(12,2) DEFAULT '0',
	`bonuses` decimal(12,2) DEFAULT '0',
	`deductions` decimal(12,2) DEFAULT '0',
	`net_amount` decimal(12,2) DEFAULT '0',
	`payment_method` enum('cash','bank_transfer','check'),
	`payment_reference` varchar(100),
	`paid_at` timestamp,
	CONSTRAINT `settlement_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worker_incentives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`worker_id` int NOT NULL,
	`business_id` int NOT NULL,
	`incentive_type` enum('bonus','commission','penalty','allowance') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`reason` text,
	`reference_type` varchar(50),
	`reference_id` int,
	`status` enum('pending','approved','paid','cancelled') DEFAULT 'pending',
	`approved_by` int,
	`approved_at` timestamp,
	`paid_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `worker_incentives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worker_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`worker_id` int NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`accuracy` decimal(10,2),
	`speed` decimal(10,2),
	`heading` decimal(5,2),
	`altitude` decimal(10,2),
	`battery_level` int,
	`is_moving` boolean DEFAULT false,
	`operation_id` int,
	`recorded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `worker_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worker_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`worker_id` int NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`total_operations` int DEFAULT 0,
	`completed_operations` int DEFAULT 0,
	`on_time_operations` int DEFAULT 0,
	`avg_completion_time` decimal(10,2),
	`customer_rating` decimal(3,2),
	`quality_score` decimal(5,2),
	`attendance_rate` decimal(5,2),
	`notes` text,
	`evaluated_by` int,
	`evaluated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `worker_performance_id` PRIMARY KEY(`id`)
);
