-- Migration: Organizational Linking and Meter Basic Fields
-- Date: 2024
-- Description: Add branch_id and station_id to customers_enhanced and meters_enhanced
--              Add address, location, neighborhood, establishment_name, area_id, square_id, latitude, longitude to meters_enhanced
--              Create customer_stations and customer_branches tables for many-to-many relationships

-- Add branch_id and station_id to customers_enhanced
ALTER TABLE `customers_enhanced` 
ADD COLUMN `branch_id` INT NULL AFTER `project_id`,
ADD COLUMN `station_id` INT NULL AFTER `branch_id`,
ADD COLUMN `latitude` DECIMAL(10, 8) NULL AFTER `national_id`,
ADD COLUMN `longitude` DECIMAL(11, 8) NULL AFTER `latitude`;

-- Add branch_id, area_id, square_id, and address fields to meters_enhanced
ALTER TABLE `meters_enhanced`
ADD COLUMN `branch_id` INT NULL AFTER `customer_id`,
ADD COLUMN `area_id` INT NULL AFTER `cabinet_id`,
ADD COLUMN `square_id` INT NULL AFTER `area_id`,
ADD COLUMN `address` TEXT NULL AFTER `category`,
ADD COLUMN `location` VARCHAR(255) NULL AFTER `address`,
ADD COLUMN `neighborhood` VARCHAR(255) NULL AFTER `location`,
ADD COLUMN `establishment_name` VARCHAR(255) NULL AFTER `neighborhood`,
ADD COLUMN `latitude` DECIMAL(10, 8) NULL AFTER `establishment_name`,
ADD COLUMN `longitude` DECIMAL(11, 8) NULL AFTER `latitude`;

-- Create customer_stations table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS `customer_stations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `station_id` INT NOT NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `linked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `linked_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_customer_stations_customer_id` (`customer_id`),
  INDEX `idx_customer_stations_station_id` (`station_id`),
  UNIQUE KEY `unique_customer_station` (`customer_id`, `station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create customer_branches table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS `customer_branches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `branch_id` INT NOT NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `linked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `linked_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_customer_branches_customer_id` (`customer_id`),
  INDEX `idx_customer_branches_branch_id` (`branch_id`),
  UNIQUE KEY `unique_customer_branch` (`customer_id`, `branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

