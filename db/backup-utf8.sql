-- MySQL dump 10.13  Distrib 8.4.6, for Win64 (x86_64)
--
-- Host: localhost    Database: 666666
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__drizzle_migrations`
--

DROP TABLE IF EXISTS `__drizzle_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__drizzle_migrations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hash` mediumtext NOT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__drizzle_migrations`
--

LOCK TABLES `__drizzle_migrations` WRITE;
/*!40000 ALTER TABLE `__drizzle_migrations` DISABLE KEYS */;
INSERT INTO `__drizzle_migrations` VALUES (1,'b2ba62d710cdddf493918b34e3027d8daafcd82800723f5e9164371bc1740b6b',1766074152661),(2,'651271fb8d2b51c10090043b618f761cc1731026adfb53542f481e2f4fba2b59',1766074550724),(3,'a1a3cd3753655076338271a4dcc9b27518c48d582df4190cc7d3193dd483d701',1766081698261),(4,'2f811d2f22eb74e7d399543f65dee42f47cfb06d10285d267249d337950beb4f',1766082983907),(5,'23ce8820bd26c8713281252621fc701723118a2f35993950c8ee3776e2d4d5dd',1766084103699),(6,'ee5cbb65a69570238c08f6ac9b728260a789d7a5c417e531005998d37b1b2054',1766085186081),(7,'fded2155112f14483e004ff82d840f8a8167c987bba1a07289e5fe5753dd3deb',1766085494949),(8,'40f40167d788beb3fb5d79be983c84c2432ada70e6d174d197cc440be83e6d44',1766088889243),(9,'60a4e149387a830f32dace2293368860f17ae1d5d170ca6cd44cf63dcd84483d',1766090188492),(10,'21718087dcdf38b731565366e288f69fdaa7dc3f1a326239e1079bc951c8ed6e',1766092091610),(11,'d71f923b9c9daf307711442ddfe9d34e4f1e871743952f0df16d9940c7cd97f3',1766361156039),(12,'6adc2737db97f0d5310e5987cdd702024215186eef195018ee8f47c2bd034e99',1766366189245),(13,'2ddc41d3a27d992a13322ead61e229811b1ff59a33bfc0ae8e7b7f1a1e875695',1766532097894),(14,'09476a041440f8275025b32ccfc21158adc80c2a358e81358a03ff4c165f2574',1766725934163);
/*!40000 ALTER TABLE `__drizzle_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `nature` enum('debit','credit') NOT NULL,
  `is_parent` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `is_cash_account` tinyint(1) DEFAULT 0,
  `is_bank_account` tinyint(1) DEFAULT 0,
  `currency` varchar(10) DEFAULT 'SAR',
  `opening_balance` decimal(18,2) DEFAULT 0.00,
  `current_balance` decimal(18,2) DEFAULT 0.00,
  `description` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `system_module` enum('assets','maintenance','inventory','procurement','customers','billing','scada','projects','hr','operations','finance','general') NOT NULL,
  `account_type` enum('main','sub','detail') DEFAULT 'detail',
  `linked_entity_type` varchar(50) DEFAULT NULL,
  `linked_entity_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_models`
--

DROP TABLE IF EXISTS `ai_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_models` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(200) NOT NULL,
  `name_en` varchar(200) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `model_type` enum('consumption_forecast','fault_detection','load_optimization','anomaly_detection','demand_prediction','maintenance_prediction','customer_churn','fraud_detection','price_optimization','other') NOT NULL,
  `provider` enum('internal','openai','azure','google','aws','custom') DEFAULT 'internal',
  `model_version` varchar(50) DEFAULT NULL,
  `endpoint` varchar(500) DEFAULT NULL,
  `input_schema` longtext DEFAULT NULL CHECK (json_valid(`input_schema`)),
  `output_schema` longtext DEFAULT NULL CHECK (json_valid(`output_schema`)),
  `accuracy` decimal(5,2) DEFAULT NULL,
  `last_trained_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `training_data_count` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `config` longtext DEFAULT NULL CHECK (json_valid(`config`)),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_models`
--

LOCK TABLES `ai_models` WRITE;
/*!40000 ALTER TABLE `ai_models` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_predictions`
--

DROP TABLE IF EXISTS `ai_predictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_predictions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `prediction_type` varchar(50) NOT NULL,
  `target_entity` varchar(50) DEFAULT NULL,
  `target_entity_id` int(11) DEFAULT NULL,
  `input_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`input_data`)),
  `prediction` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`prediction`)),
  `confidence` decimal(5,2) DEFAULT NULL,
  `prediction_date` date NOT NULL,
  `valid_from` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `valid_to` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `actual_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`actual_value`)),
  `accuracy` decimal(5,2) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verified_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `verified_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_predictions`
--

LOCK TABLES `ai_predictions` WRITE;
/*!40000 ALTER TABLE `ai_predictions` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_predictions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) DEFAULT NULL,
  `equipment_id` int(11) DEFAULT NULL,
  `sensor_id` int(11) DEFAULT NULL,
  `alert_type` enum('info','warning','critical','emergency') NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `value` decimal(15,4) DEFAULT NULL,
  `threshold` decimal(15,4) DEFAULT NULL,
  `status` enum('active','acknowledged','resolved','escalated') DEFAULT 'active',
  `triggered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `acknowledged_by` int(11) DEFAULT NULL,
  `acknowledged_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `resolution` text DEFAULT NULL,
  `work_order_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `key_hash` varchar(255) NOT NULL,
  `key_prefix` varchar(20) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `allowed_ips` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_ips`)),
  `allowed_origins` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_origins`)),
  `rate_limit_per_minute` int(11) DEFAULT 60,
  `rate_limit_per_day` int(11) DEFAULT 10000,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_used_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `usage_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_keys`
--

LOCK TABLES `api_keys` WRITE;
/*!40000 ALTER TABLE `api_keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `api_logs`
--

DROP TABLE IF EXISTS `api_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `api_key_id` int(11) DEFAULT NULL,
  `business_id` int(11) NOT NULL,
  `endpoint` varchar(500) NOT NULL,
  `method` varchar(10) NOT NULL,
  `request_headers` longtext DEFAULT NULL CHECK (json_valid(`request_headers`)),
  `request_body` longtext DEFAULT NULL CHECK (json_valid(`request_body`)),
  `response_status` int(11) DEFAULT NULL,
  `response_time` int(11) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `error_message` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_logs`
--

LOCK TABLES `api_logs` WRITE;
/*!40000 ALTER TABLE `api_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_categories`
--

DROP TABLE IF EXISTS `asset_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `depreciation_method` enum('straight_line','declining_balance','units_of_production') DEFAULT 'straight_line',
  `useful_life` int(11) DEFAULT NULL,
  `salvage_percentage` decimal(5,2) DEFAULT 0.00,
  `asset_account_id` int(11) DEFAULT NULL,
  `depreciation_account_id` int(11) DEFAULT NULL,
  `accumulated_dep_account_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_categories`
--

LOCK TABLES `asset_categories` WRITE;
/*!40000 ALTER TABLE `asset_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_movements`
--

DROP TABLE IF EXISTS `asset_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` int(11) NOT NULL,
  `movement_type` enum('purchase','transfer','maintenance','upgrade','revaluation','impairment','disposal','depreciation') NOT NULL,
  `movement_date` date NOT NULL,
  `from_branch_id` int(11) DEFAULT NULL,
  `to_branch_id` int(11) DEFAULT NULL,
  `from_station_id` int(11) DEFAULT NULL,
  `to_station_id` int(11) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_movements`
--

LOCK TABLES `asset_movements` WRITE;
/*!40000 ALTER TABLE `asset_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `commission_date` date DEFAULT NULL,
  `purchase_cost` decimal(18,2) DEFAULT 0.00,
  `current_value` decimal(18,2) DEFAULT 0.00,
  `accumulated_depreciation` decimal(18,2) DEFAULT 0.00,
  `salvage_value` decimal(18,2) DEFAULT 0.00,
  `useful_life` int(11) DEFAULT NULL,
  `depreciation_method` enum('straight_line','declining_balance','units_of_production') DEFAULT NULL,
  `status` enum('active','maintenance','disposed','transferred','idle') DEFAULT 'active',
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `purchase_order_id` int(11) DEFAULT NULL,
  `parent_asset_id` int(11) DEFAULT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  `specifications` longtext DEFAULT NULL CHECK (json_valid(`specifications`)),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `check_in_location` varchar(255) DEFAULT NULL,
  `check_in_latitude` decimal(10,8) DEFAULT NULL,
  `check_in_longitude` decimal(11,8) DEFAULT NULL,
  `check_in_method` enum('manual','biometric','gps','qr_code') DEFAULT 'manual',
  `check_out_time` datetime DEFAULT NULL,
  `check_out_location` varchar(255) DEFAULT NULL,
  `check_out_latitude` decimal(10,8) DEFAULT NULL,
  `check_out_longitude` decimal(11,8) DEFAULT NULL,
  `check_out_method` enum('manual','biometric','gps','qr_code') DEFAULT 'manual',
  `total_hours` decimal(5,2) DEFAULT NULL,
  `overtime_hours` decimal(5,2) DEFAULT 0.00,
  `late_minutes` int(11) DEFAULT 0,
  `early_leave_minutes` int(11) DEFAULT 0,
  `status` enum('present','absent','late','half_day','leave','holiday','weekend') DEFAULT 'present',
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `module` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `old_values` longtext DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_periods`
--

DROP TABLE IF EXISTS `billing_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_periods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `period_number` int(11) DEFAULT NULL,
  `month` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `period_status` enum('pending','active','reading_phase','billing_phase','closed') DEFAULT 'pending',
  `reading_start_date` date DEFAULT NULL,
  `reading_end_date` date DEFAULT NULL,
  `billing_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `total_meters` int(11) DEFAULT 0,
  `read_meters` int(11) DEFAULT 0,
  `billed_meters` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `closed_by` int(11) DEFAULT NULL,
  `closed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_periods`
--

LOCK TABLES `billing_periods` WRITE;
/*!40000 ALTER TABLE `billing_periods` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `type` enum('main','regional','local') NOT NULL DEFAULT 'local',
  `parent_id` int(11) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Saudi Arabia',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,1,'BR001','الفرع الرئيسي',NULL,'main',NULL,NULL,NULL,NULL,'Saudi Arabia',NULL,NULL,NULL,NULL,NULL,1,'2025-12-28 21:01:25','2025-12-28 21:01:25'),(2,1,'BR002','الدهمية',NULL,'local',NULL,NULL,NULL,NULL,'Saudi Arabia',NULL,NULL,NULL,NULL,NULL,1,'2025-12-28 21:01:44','2025-12-28 21:01:44'),(3,1,'BR003','غليل',NULL,'local',NULL,NULL,NULL,NULL,'Saudi Arabia',NULL,NULL,NULL,NULL,NULL,1,'2025-12-28 21:02:15','2025-12-28 21:02:15'),(4,1,'BR004','الصبالية',NULL,'local',NULL,NULL,NULL,NULL,'Saudi Arabia',NULL,NULL,NULL,NULL,NULL,1,'2025-12-28 21:02:50','2025-12-28 21:02:50');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `businesses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `type` enum('holding','subsidiary','branch') NOT NULL DEFAULT 'subsidiary',
  `parent_id` int(11) DEFAULT NULL,
  `logo` mediumtext DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `tax_number` varchar(50) DEFAULT NULL,
  `commercial_register` varchar(50) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `fiscal_year_start` int(11) DEFAULT 1,
  `timezone` varchar(50) DEFAULT 'Asia/Riyadh',
  `is_active` tinyint(1) DEFAULT 1,
  `settings` longtext DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `system_type` enum('energy','custom','both') NOT NULL DEFAULT 'both',
  PRIMARY KEY (`id`),
  UNIQUE KEY `businesses_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES (1,'BR001','شركة العباسي',NULL,'holding',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SAR',1,'Asia/Riyadh',1,NULL,'2025-12-28 20:58:00','2025-12-28 18:00:02','both'),(2,'BR002','العباسي1',NULL,'subsidiary',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SAR',1,'Asia/Riyadh',1,NULL,'2025-12-28 21:00:51','2025-12-28 21:00:51','both');
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabinets`
--

DROP TABLE IF EXISTS `cabinets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabinets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `square_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `cabinet_type` enum('main','sub','distribution') DEFAULT 'distribution',
  `capacity` int(11) DEFAULT NULL,
  `current_load` int(11) DEFAULT 0,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinets`
--

LOCK TABLES `cabinets` WRITE;
/*!40000 ALTER TABLE `cabinets` DISABLE KEYS */;
/*!40000 ALTER TABLE `cabinets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cashboxes`
--

DROP TABLE IF EXISTS `cashboxes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cashboxes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `balance` decimal(18,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'SAR',
  `assigned_to` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cashboxes`
--

LOCK TABLES `cashboxes` WRITE;
/*!40000 ALTER TABLE `cashboxes` DISABLE KEYS */;
/*!40000 ALTER TABLE `cashboxes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cost_centers`
--

DROP TABLE IF EXISTS `cost_centers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cost_centers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `type` enum('station','department','project','activity') DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cost_centers`
--

LOCK TABLES `cost_centers` WRITE;
/*!40000 ALTER TABLE `cost_centers` DISABLE KEYS */;
/*!40000 ALTER TABLE `cost_centers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_account_balances`
--

DROP TABLE IF EXISTS `custom_account_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_account_balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `debit_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `credit_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `last_transaction_date` date DEFAULT NULL,
  `last_transaction_id` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cabl_account_currency_unique` (`account_id`,`currency_id`),
  KEY `cabl_business_idx` (`business_id`),
  KEY `cabl_account_idx` (`account_id`),
  KEY `cabl_currency_idx` (`currency_id`),
  KEY `cabl_last_transaction_idx` (`last_transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_account_balances`
--

LOCK TABLES `custom_account_balances` WRITE;
/*!40000 ALTER TABLE `custom_account_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_account_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_account_currencies`
--

DROP TABLE IF EXISTS `custom_account_currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_account_currencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cacr_account_currency_unique` (`account_id`,`currency_id`),
  KEY `cacr_business_idx` (`business_id`),
  KEY `cacr_account_idx` (`account_id`),
  KEY `cacr_currency_idx` (`currency_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_account_currencies`
--

LOCK TABLES `custom_account_currencies` WRITE;
/*!40000 ALTER TABLE `custom_account_currencies` DISABLE KEYS */;
INSERT INTO `custom_account_currencies` VALUES (4,1,20,1,1,1,NULL,'2026-01-01 08:16:54'),(5,1,20,2,0,1,NULL,'2026-01-01 08:16:54'),(6,1,20,3,0,1,NULL,'2026-01-01 08:16:54'),(7,1,21,1,1,1,NULL,'2026-01-01 08:17:19'),(8,1,21,2,0,1,NULL,'2026-01-01 08:17:19'),(9,1,21,3,0,1,NULL,'2026-01-01 08:17:19'),(16,1,19,1,1,1,NULL,'2026-01-01 12:04:48'),(17,1,19,2,0,1,NULL,'2026-01-01 12:04:48'),(18,1,19,3,0,1,NULL,'2026-01-01 12:04:48'),(19,1,18,1,1,1,NULL,'2026-01-02 03:30:32'),(20,1,18,2,0,1,NULL,'2026-01-02 03:30:32'),(21,1,18,3,0,1,NULL,'2026-01-02 03:30:32');
/*!40000 ALTER TABLE `custom_account_currencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_account_sub_types`
--

DROP TABLE IF EXISTS `custom_account_sub_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_account_sub_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `account_type` enum('asset','liability','equity','revenue','expense') NOT NULL,
  `account_type_id` int(11) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `allow_multiple_currencies` tinyint(1) NOT NULL DEFAULT 0,
  `requires_party` tinyint(1) NOT NULL DEFAULT 0,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cast_business_code_unique` (`business_id`,`code`),
  KEY `cast_business_idx` (`business_id`),
  KEY `cast_account_type_idx` (`account_type`),
  KEY `cast_code_idx` (`code`),
  KEY `cast_is_active_idx` (`is_active`),
  KEY `cast_account_type_id_idx` (`account_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_account_sub_types`
--

LOCK TABLES `custom_account_sub_types` WRITE;
/*!40000 ALTER TABLE `custom_account_sub_types` DISABLE KEYS */;
INSERT INTO `custom_account_sub_types` VALUES (1,1,'asset',1,'cash','صندوق','Cash',NULL,1,0,0,NULL,NULL,1,NULL,'2025-12-29 00:44:15','2025-12-31 00:55:57'),(2,1,'asset',1,'bank','بنك','Bank',NULL,1,0,0,NULL,NULL,2,NULL,'2025-12-29 00:44:15','2025-12-31 00:55:57'),(3,1,'asset',1,'wallet','محفظة','Wallet',NULL,1,0,0,NULL,NULL,3,NULL,'2025-12-29 00:44:15','2025-12-31 00:55:57'),(4,1,'asset',1,'exchange','صراف','Exchange',NULL,1,0,0,NULL,NULL,4,NULL,'2025-12-29 00:44:15','2025-12-31 00:55:57'),(5,1,'asset',1,'warehouse','مخزن','Warehouse',NULL,1,0,0,NULL,NULL,5,NULL,'2025-12-29 00:44:15','2025-12-31 00:55:57'),(6,1,'asset',1,'general','عام','General',NULL,1,0,0,NULL,NULL,6,NULL,'2025-12-29 00:44:15','2025-12-31 00:55:57'),(7,1,'liability',2,'supplier','مورد','Supplier',NULL,1,0,0,NULL,NULL,1,NULL,'2025-12-29 00:44:15','2025-12-31 00:55:57'),(11,1,'revenue',4,'customer','عميل','Customer',NULL,1,0,0,NULL,NULL,1,NULL,'2025-12-29 00:44:39','2025-12-31 00:55:57');
/*!40000 ALTER TABLE `custom_account_sub_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_account_types`
--

DROP TABLE IF EXISTS `custom_account_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_account_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) DEFAULT NULL,
  `type_code` varchar(50) NOT NULL,
  `type_name_ar` varchar(100) NOT NULL,
  `type_name_en` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_system_type` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cat_business_code_unique` (`business_id`,`type_code`),
  KEY `cat_business_idx` (`business_id`),
  KEY `cat_type_code_idx` (`type_code`),
  KEY `cat_is_active_idx` (`is_active`),
  KEY `cat_display_order_idx` (`display_order`),
  KEY `cat_sub_system_idx` (`sub_system_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_account_types`
--

LOCK TABLES `custom_account_types` WRITE;
/*!40000 ALTER TABLE `custom_account_types` DISABLE KEYS */;
INSERT INTO `custom_account_types` VALUES (1,1,NULL,'asset','أصول','Assets',NULL,'#10b981','TrendingUp',1,1,1,NULL,'2025-12-31 01:54:39','2025-12-31 01:54:39'),(2,1,NULL,'liability','التزامات','Liabilities',NULL,'#ef4444','TrendingDown',2,1,1,NULL,'2025-12-31 01:54:39','2025-12-31 01:54:39'),(3,1,NULL,'equity','حقوق ملكية','Equity',NULL,'#8b5cf6','Users',3,1,1,NULL,'2025-12-31 01:54:39','2025-12-31 01:54:39'),(4,1,NULL,'revenue','إيرادات','Revenue',NULL,'#3b82f6','ArrowUpCircle',4,1,1,NULL,'2025-12-31 01:54:39','2025-12-31 01:54:39'),(5,1,NULL,'expense','مصروفات','Expenses',NULL,'#f59e0b','ArrowDownCircle',5,1,1,NULL,'2025-12-31 01:54:39','2025-12-31 01:54:39'),(8,1,2,'rrrrrrrr','rrr','','','#3b82f6','',0,1,0,2,'2025-12-31 02:07:12','2025-12-31 02:07:12'),(9,1,1,'employee_works','أعمال الموظفين','Employee Works','','#3b82f6','Users',6,1,0,2,'2025-12-31 02:11:28','2025-12-31 02:11:28'),(10,1,3,'5555','521515','','','#3b82f6','',6,1,0,1,'2025-12-31 20:51:23','2025-12-31 20:51:23'),(11,1,4,'99','6666','','','#3b82f6','',6,1,0,1,'2025-12-31 20:56:41','2025-12-31 20:56:41');
/*!40000 ALTER TABLE `custom_account_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_accounts`
--

DROP TABLE IF EXISTS `custom_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `account_code` varchar(50) NOT NULL,
  `account_name_ar` varchar(255) NOT NULL,
  `account_name_en` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_type` varchar(50) NOT NULL,
  `account_type_id` int(11) DEFAULT NULL,
  `parent_account_id` int(11) DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT 1,
  `account_sub_type_id` int(11) DEFAULT NULL,
  `allow_multiple_currencies` tinyint(1) NOT NULL DEFAULT 0,
  `default_currency_id` int(11) DEFAULT NULL,
  `requires_party` tinyint(1) NOT NULL DEFAULT 0,
  `party_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `allow_manual_entry` tinyint(1) NOT NULL DEFAULT 1,
  `requires_cost_center` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sub_system_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ca_business_code_unique` (`business_id`,`account_code`),
  KEY `ca_account_sub_type_idx` (`account_sub_type_id`),
  KEY `ca_default_currency_idx` (`default_currency_id`),
  KEY `ca_party_idx` (`party_id`),
  KEY `ca_account_code_idx` (`account_code`),
  KEY `ca_parent_account_idx` (`parent_account_id`),
  KEY `ca_level_idx` (`level`),
  KEY `ca_account_type_id_idx` (`account_type_id`),
  KEY `ca_sub_system_idx` (`sub_system_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_accounts`
--

LOCK TABLES `custom_accounts` WRITE;
/*!40000 ALTER TABLE `custom_accounts` DISABLE KEYS */;
INSERT INTO `custom_accounts` VALUES (11,1,'88','265',NULL,'','','99',11,NULL,2,5,0,NULL,0,NULL,NULL,NULL,1,1,0,1,'2025-12-31 20:58:11','2025-12-31 23:59:38',4),(18,1,'1001','صندوق',NULL,'','','employee_works',9,NULL,2,1,0,NULL,0,NULL,NULL,NULL,1,1,0,1,'2025-12-31 23:56:58','2025-12-31 23:56:58',1),(19,1,'1002','صراف',NULL,'','','employee_works',9,NULL,2,4,0,NULL,0,NULL,NULL,NULL,1,1,0,1,'2025-12-31 23:57:19','2026-01-01 12:04:48',1),(20,1,'1003','بنك',NULL,'','','employee_works',9,NULL,2,2,0,NULL,0,NULL,NULL,NULL,1,1,0,1,'2025-12-31 23:57:47','2025-12-31 23:57:47',1),(21,1,'1004','محفظة',NULL,'','','employee_works',9,NULL,2,3,0,NULL,0,NULL,NULL,NULL,1,1,0,1,'2025-12-31 23:58:05','2025-12-31 23:58:15',1),(22,1,'1005','111111111',NULL,'','','employee_works',9,NULL,1,NULL,0,NULL,0,NULL,NULL,NULL,1,1,0,1,'2025-12-31 23:58:29','2025-12-31 23:58:29',1);
/*!40000 ALTER TABLE `custom_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_categories`
--

DROP TABLE IF EXISTS `custom_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `category_type` enum('income','expense','both') NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `color` varchar(20) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `linked_account_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cc_code_idx` (`business_id`,`code`),
  KEY `cc_business_idx` (`business_id`),
  KEY `cc_parent_idx` (`parent_id`),
  KEY `cc_type_idx` (`business_id`,`category_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_categories`
--

LOCK TABLES `custom_categories` WRITE;
/*!40000 ALTER TABLE `custom_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_currencies`
--

DROP TABLE IF EXISTS `custom_currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_currencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(10) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `symbol` varchar(10) DEFAULT NULL,
  `is_base_currency` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `decimal_places` int(11) NOT NULL DEFAULT 2,
  `current_rate` decimal(18,6) DEFAULT NULL COMMENT 'السعر الحالي مقابل YER',
  `max_rate` decimal(18,6) DEFAULT NULL COMMENT 'أعلى سعر صرف (سقف علوي)',
  `min_rate` decimal(18,6) DEFAULT NULL COMMENT 'أدنى سعر صرف (سقف سفلي)',
  `display_order` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ccur_business_code_unique` (`business_id`,`code`),
  KEY `ccur_business_idx` (`business_id`),
  KEY `ccur_code_idx` (`code`),
  KEY `ccur_is_active_idx` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_currencies`
--

LOCK TABLES `custom_currencies` WRITE;
/*!40000 ALTER TABLE `custom_currencies` DISABLE KEYS */;
INSERT INTO `custom_currencies` VALUES (1,1,'YER','ريال يمني','Yemeni Riyal','ر.ي',1,1,2,1.000000,1.000000,1.000000,1,NULL,NULL,'2025-12-29 00:28:21','2025-12-29 00:28:21'),(2,1,'SAR','ريال سعودي','Saudi Riyal','ر.س',0,1,2,140.000000,150.000000,130.000000,2,NULL,NULL,'2025-12-29 00:28:21','2025-12-29 00:31:22'),(3,1,'USD','دولار أمريكي','US Dollar','$',0,1,2,530.000000,550.000000,520.000000,3,NULL,NULL,'2025-12-29 00:28:21','2025-12-29 00:32:38');
/*!40000 ALTER TABLE `custom_currencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_exchange_rates`
--

DROP TABLE IF EXISTS `custom_exchange_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_exchange_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `from_currency_id` int(11) NOT NULL,
  `to_currency_id` int(11) NOT NULL,
  `rate` decimal(18,6) NOT NULL,
  `effective_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cexr_business_idx` (`business_id`),
  KEY `cexr_from_currency_idx` (`from_currency_id`),
  KEY `cexr_to_currency_idx` (`to_currency_id`),
  KEY `cexr_effective_date_idx` (`effective_date`),
  KEY `cexr_is_active_idx` (`is_active`),
  KEY `cexr_currencies_date_idx` (`from_currency_id`,`to_currency_id`,`effective_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_exchange_rates`
--

LOCK TABLES `custom_exchange_rates` WRITE;
/*!40000 ALTER TABLE `custom_exchange_rates` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_exchange_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_intermediary_accounts`
--

DROP TABLE IF EXISTS `custom_intermediary_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_intermediary_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `from_sub_system_id` int(11) NOT NULL,
  `to_sub_system_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `balance` decimal(18,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'SAR',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_intermediary_accounts`
--

LOCK TABLES `custom_intermediary_accounts` WRITE;
/*!40000 ALTER TABLE `custom_intermediary_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_intermediary_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_journal_entries`
--

DROP TABLE IF EXISTS `custom_journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_journal_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) DEFAULT NULL,
  `entry_number` varchar(50) NOT NULL,
  `entry_date` date NOT NULL,
  `entry_type` enum('manual','opening','closing','adjustment','reversal','system_generated') NOT NULL,
  `description` text NOT NULL,
  `notes` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `status` enum('draft','posted','reversed','cancelled') NOT NULL DEFAULT 'draft',
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `posted_by` int(11) DEFAULT NULL,
  `reversed_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `reversed_by` int(11) DEFAULT NULL,
  `reversal_entry_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cje_business_number_unique` (`business_id`,`entry_number`),
  KEY `cje_business_idx` (`business_id`),
  KEY `cje_sub_system_idx` (`sub_system_id`),
  KEY `cje_entry_number_idx` (`entry_number`),
  KEY `cje_entry_date_idx` (`entry_date`),
  KEY `cje_entry_type_idx` (`entry_type`),
  KEY `cje_status_idx` (`status`),
  KEY `cje_reference_idx` (`reference_type`,`reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_journal_entries`
--

LOCK TABLES `custom_journal_entries` WRITE;
/*!40000 ALTER TABLE `custom_journal_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_journal_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_journal_entry_lines`
--

DROP TABLE IF EXISTS `custom_journal_entry_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_journal_entry_lines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `journal_entry_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `credit_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `currency_id` int(11) NOT NULL,
  `exchange_rate` decimal(18,6) DEFAULT 1.000000,
  `debit_amount_base` decimal(18,2) NOT NULL DEFAULT 0.00,
  `credit_amount_base` decimal(18,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `party_id` int(11) DEFAULT NULL,
  `cost_center_id` int(11) DEFAULT NULL,
  `line_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cjel_business_idx` (`business_id`),
  KEY `cjel_journal_entry_idx` (`journal_entry_id`),
  KEY `cjel_account_idx` (`account_id`),
  KEY `cjel_currency_idx` (`currency_id`),
  KEY `cjel_party_idx` (`party_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_journal_entry_lines`
--

LOCK TABLES `custom_journal_entry_lines` WRITE;
/*!40000 ALTER TABLE `custom_journal_entry_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_journal_entry_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_memos`
--

DROP TABLE IF EXISTS `custom_memos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_memos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `memo_number` varchar(50) NOT NULL,
  `memo_date` date NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` mediumtext DEFAULT NULL,
  `memo_type` enum('internal','external','circular','directive') DEFAULT 'internal',
  `from_department` varchar(255) DEFAULT NULL,
  `to_department` varchar(255) DEFAULT NULL,
  `status` enum('draft','sent','received','archived') DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `attachments` longtext DEFAULT NULL CHECK (json_valid(`attachments`)),
  `response_required` tinyint(1) DEFAULT 0,
  `response_deadline` date DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_memos`
--

LOCK TABLES `custom_memos` WRITE;
/*!40000 ALTER TABLE `custom_memos` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_memos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_notes`
--

DROP TABLE IF EXISTS `custom_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` mediumtext DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `color` varchar(20) DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT 0,
  `is_archived` tinyint(1) DEFAULT 0,
  `tags` longtext DEFAULT NULL CHECK (json_valid(`tags`)),
  `attachments` longtext DEFAULT NULL CHECK (json_valid(`attachments`)),
  `reminder_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_notes`
--

LOCK TABLES `custom_notes` WRITE;
/*!40000 ALTER TABLE `custom_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_parties`
--

DROP TABLE IF EXISTS `custom_parties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_parties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `party_type` enum('customer','supplier','employee','partner','government','other') NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Saudi Arabia',
  `tax_number` varchar(50) DEFAULT NULL,
  `commercial_register` varchar(50) DEFAULT NULL,
  `credit_limit` decimal(18,2) DEFAULT 0.00,
  `current_balance` decimal(18,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'SAR',
  `contact_person` varchar(255) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `tags` longtext DEFAULT NULL CHECK (json_valid(`tags`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cp_code_idx` (`business_id`,`code`),
  KEY `cp_business_idx` (`business_id`),
  KEY `cp_subsystem_idx` (`sub_system_id`),
  KEY `cp_party_type_idx` (`business_id`,`party_type`),
  KEY `cp_name_idx` (`name_ar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_parties`
--

LOCK TABLES `custom_parties` WRITE;
/*!40000 ALTER TABLE `custom_parties` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_parties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_party_transactions`
--

DROP TABLE IF EXISTS `custom_party_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_party_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `party_id` int(11) NOT NULL,
  `transaction_type` enum('receipt','payment','invoice','credit_note','debit_note','adjustment') NOT NULL,
  `transaction_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `balance_before` decimal(18,2) NOT NULL,
  `balance_after` decimal(18,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cpt_party_idx` (`party_id`),
  KEY `cpt_date_idx` (`transaction_date`),
  KEY `cpt_type_idx` (`transaction_type`),
  KEY `cpt_ref_idx` (`reference_type`,`reference_id`),
  KEY `cpt_party_date_idx` (`party_id`,`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_party_transactions`
--

LOCK TABLES `custom_party_transactions` WRITE;
/*!40000 ALTER TABLE `custom_party_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_party_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_payment_voucher_lines`
--

DROP TABLE IF EXISTS `custom_payment_voucher_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_payment_voucher_lines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `payment_voucher_id` int(11) NOT NULL,
  `line_order` int(11) NOT NULL DEFAULT 0,
  `account_type` varchar(50) DEFAULT NULL,
  `account_sub_type_id` int(11) DEFAULT NULL,
  `account_id` int(11) NOT NULL,
  `cost_center_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `analytic_account_id` int(11) DEFAULT NULL,
  `analytic_treasury_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cpvl_business_idx` (`business_id`),
  KEY `cpvl_voucher_idx` (`payment_voucher_id`),
  KEY `cpvl_account_idx` (`account_id`),
  KEY `cpvl_cost_center_idx` (`cost_center_id`),
  KEY `cpvl_analytic_account_idx` (`analytic_account_id`),
  KEY `cpvl_analytic_treasury_idx` (`analytic_treasury_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_payment_voucher_lines`
--

LOCK TABLES `custom_payment_voucher_lines` WRITE;
/*!40000 ALTER TABLE `custom_payment_voucher_lines` DISABLE KEYS */;
INSERT INTO `custom_payment_voucher_lines` VALUES (3,1,6,1,'employee_works',3,21,NULL,'2',200000.00,'2026-01-02 05:24:04',NULL,5),(10,1,5,1,'employee_works',4,19,NULL,'12315',10000.00,'2026-01-02 05:40:08',NULL,6),(11,1,5,2,'employee_works',3,21,NULL,'88',5000.00,'2026-01-02 05:40:08',NULL,5),(12,1,7,1,'employee_works',1,18,NULL,'2',100000000.00,'2026-01-02 05:48:12',NULL,2);
/*!40000 ALTER TABLE `custom_payment_voucher_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_payment_vouchers`
--

DROP TABLE IF EXISTS `custom_payment_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_payment_vouchers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) NOT NULL,
  `voucher_number` varchar(50) NOT NULL,
  `voucher_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency_id` int(11) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `account_analytic_id` int(11) DEFAULT NULL,
  `exchange_rate` decimal(18,6) NOT NULL DEFAULT 1.000000,
  `amount_in_base_currency` decimal(18,2) NOT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `treasury_id` int(11) NOT NULL,
  `destination_type` enum('person','entity','intermediary','party','other') NOT NULL,
  `destination_name` varchar(255) DEFAULT NULL,
  `destination_intermediary_id` int(11) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `attachments` longtext DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` enum('draft','confirmed','cancelled') DEFAULT 'draft',
  `is_reconciled` tinyint(1) DEFAULT 0,
  `reconciled_with` int(11) DEFAULT NULL,
  `reconciled_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `party_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `payment_method` enum('cash','check','transfer','card','wallet','other') DEFAULT 'cash',
  `check_number` varchar(50) DEFAULT NULL,
  `check_date` date DEFAULT NULL,
  `check_bank` varchar(100) DEFAULT NULL,
  `bank_reference` varchar(100) DEFAULT NULL,
  `edit_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpv_number_idx` (`business_id`,`sub_system_id`,`voucher_number`),
  KEY `cpv_business_idx` (`business_id`),
  KEY `cpv_subsystem_idx` (`sub_system_id`),
  KEY `cpv_treasury_idx` (`treasury_id`),
  KEY `cpv_party_idx` (`party_id`),
  KEY `cpv_category_idx` (`category_id`),
  KEY `cpv_date_idx` (`voucher_date`),
  KEY `cp_currency_idx` (`currency_id`),
  KEY `cp_journal_entry_idx` (`journal_entry_id`),
  KEY `cpv_account_idx` (`account_id`),
  KEY `cpv_account_analytic_idx` (`account_analytic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_payment_vouchers`
--

LOCK TABLES `custom_payment_vouchers` WRITE;
/*!40000 ALTER TABLE `custom_payment_vouchers` DISABLE KEYS */;
INSERT INTO `custom_payment_vouchers` VALUES (5,1,1,'PV-000005','2026-01-02',15000.00,NULL,NULL,NULL,1.000000,0.00,NULL,'YER',3,'person','888',NULL,'',NULL,'draft',0,NULL,'2026-01-02 05:40:08',1,'2026-01-02 04:37:51','2026-01-02 05:40:08',NULL,NULL,'cash',NULL,NULL,NULL,NULL,1),(6,1,1,'PV-000002','2026-01-02',200000.00,NULL,NULL,NULL,1.000000,0.00,NULL,'YER',2,'person','88',NULL,'',NULL,'confirmed',0,NULL,'2026-01-02 05:24:11',1,'2026-01-02 05:24:04','2026-01-02 05:24:11',NULL,NULL,'cash',NULL,NULL,NULL,NULL,0),(7,1,1,'1','2026-01-02',100000000.00,NULL,NULL,NULL,1.000000,0.00,NULL,'YER',3,'person','2',NULL,'',NULL,'draft',0,NULL,'2026-01-02 05:48:12',1,'2026-01-02 05:48:12','2026-01-02 05:48:12',NULL,NULL,'cash',NULL,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `custom_payment_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_receipt_vouchers`
--

DROP TABLE IF EXISTS `custom_receipt_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_receipt_vouchers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) NOT NULL,
  `voucher_number` varchar(50) NOT NULL,
  `voucher_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency_id` int(11) DEFAULT NULL,
  `exchange_rate` decimal(18,6) NOT NULL DEFAULT 1.000000,
  `amount_in_base_currency` decimal(18,2) NOT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `source_type` enum('person','entity','intermediary','party','other') NOT NULL,
  `source_name` varchar(255) DEFAULT NULL,
  `source_intermediary_id` int(11) DEFAULT NULL,
  `treasury_id` int(11) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `attachments` longtext DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` enum('draft','confirmed','cancelled') DEFAULT 'draft',
  `is_reconciled` tinyint(1) DEFAULT 0,
  `reconciled_with` int(11) DEFAULT NULL,
  `reconciled_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `party_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `payment_method` enum('cash','check','transfer','card','wallet','other') DEFAULT 'cash',
  `check_number` varchar(50) DEFAULT NULL,
  `check_date` date DEFAULT NULL,
  `check_bank` varchar(100) DEFAULT NULL,
  `bank_reference` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `crv_number_idx` (`business_id`,`sub_system_id`,`voucher_number`),
  KEY `crv_business_idx` (`business_id`),
  KEY `crv_subsystem_idx` (`sub_system_id`),
  KEY `crv_treasury_idx` (`treasury_id`),
  KEY `crv_party_idx` (`party_id`),
  KEY `crv_category_idx` (`category_id`),
  KEY `crv_date_idx` (`voucher_date`),
  KEY `cr_currency_idx` (`currency_id`),
  KEY `cr_journal_entry_idx` (`journal_entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_receipt_vouchers`
--

LOCK TABLES `custom_receipt_vouchers` WRITE;
/*!40000 ALTER TABLE `custom_receipt_vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_receipt_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_reconciliations`
--

DROP TABLE IF EXISTS `custom_reconciliations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_reconciliations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `payment_voucher_id` int(11) NOT NULL,
  `receipt_voucher_id` int(11) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `confidence_score` enum('high','medium','low') DEFAULT 'medium',
  `status` enum('pending','confirmed','rejected') DEFAULT 'pending',
  `notes` mediumtext DEFAULT NULL,
  `confirmed_by` int(11) DEFAULT NULL,
  `confirmed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_reconciliations`
--

LOCK TABLES `custom_reconciliations` WRITE;
/*!40000 ALTER TABLE `custom_reconciliations` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_reconciliations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_settings`
--

DROP TABLE IF EXISTS `custom_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) DEFAULT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` mediumtext DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_settings`
--

LOCK TABLES `custom_settings` WRITE;
/*!40000 ALTER TABLE `custom_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_sub_systems`
--

DROP TABLE IF EXISTS `custom_sub_systems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_sub_systems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `default_currency_id` int(11) DEFAULT NULL,
  `allow_multiple_currencies` tinyint(1) NOT NULL DEFAULT 0,
  `fiscal_year_start` date DEFAULT NULL,
  `fiscal_year_end` date DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `css_code_idx` (`business_id`,`code`),
  KEY `css_business_idx` (`business_id`),
  KEY `css_default_currency_idx` (`default_currency_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_sub_systems`
--

LOCK TABLES `custom_sub_systems` WRITE;
/*!40000 ALTER TABLE `custom_sub_systems` DISABLE KEYS */;
INSERT INTO `custom_sub_systems` VALUES (1,1,'FR-001','أعمال الحديدة','Branch One','نظام إدارة أعمال الحديدة',NULL,0,NULL,NULL,'blue','layers',1,1,'2025-12-28 21:07:25','2025-12-28 23:42:45'),(2,1,'FR-002','حسابات محمدي والعباسي','Branch Two','نظام حسابات محمدي والعباسي',NULL,0,NULL,NULL,'green','wallet',1,1,'2025-12-28 21:07:25','2025-12-28 23:42:45'),(3,1,'FR-003','العباسي الرئيسي','Al-Abbasi Main','النظام الرئيسي للعباسي',NULL,0,NULL,NULL,NULL,NULL,1,NULL,'2025-12-28 23:41:08','2025-12-28 23:41:08'),(4,1,'FR-004','العباسي شخصي','Al-Abbasi Personal','النظام الشخصي للعباسي',NULL,0,NULL,NULL,NULL,NULL,1,NULL,'2025-12-28 23:41:08','2025-12-28 23:41:08'),(5,1,'231','555555','','',NULL,0,NULL,NULL,'blue','layers',1,1,'2025-12-31 22:42:09','2025-12-31 22:42:09');
/*!40000 ALTER TABLE `custom_sub_systems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_treasuries`
--

DROP TABLE IF EXISTS `custom_treasuries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_treasuries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `treasury_type` enum('cash','bank','wallet','exchange') NOT NULL,
  `account_id` int(11) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `iban` varchar(50) DEFAULT NULL,
  `swift_code` varchar(20) DEFAULT NULL,
  `wallet_provider` varchar(100) DEFAULT NULL,
  `wallet_number` varchar(100) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `opening_balance` decimal(18,2) DEFAULT 0.00,
  `current_balance` decimal(18,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `accountId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ct_code_idx` (`business_id`,`code`),
  KEY `ct_business_idx` (`business_id`),
  KEY `ct_subsystem_idx` (`sub_system_id`),
  KEY `ct_type_idx` (`treasury_type`),
  KEY `fk_treasury_account` (`accountId`),
  KEY `ct_account_idx` (`account_id`),
  CONSTRAINT `fk_treasury_account` FOREIGN KEY (`accountId`) REFERENCES `custom_accounts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_treasuries`
--

LOCK TABLES `custom_treasuries` WRITE;
/*!40000 ALTER TABLE `custom_treasuries` DISABLE KEYS */;
INSERT INTO `custom_treasuries` VALUES (1,1,1,'TR-001','صندوق التحصيل والتوريد الدهمية','Collection and Supply Treasury - Dhamiya','cash',18,NULL,NULL,NULL,NULL,NULL,NULL,'',0.00,0.00,'صندوق التحصيل والتوريد الدهمية',1,NULL,'2025-12-28 23:46:13','2026-01-01 00:12:27',NULL),(2,1,1,'TR-002','صندوق التحصيل والتوريد الصبالي','Collection and Supply Treasury - Sabali','cash',18,NULL,NULL,NULL,NULL,NULL,NULL,'YER',0.00,-200000.00,'صندوق التحصيل والتوريد الصبالي',1,NULL,'2025-12-28 23:46:13','2026-01-02 05:24:11',NULL),(3,1,1,'TR-003','صندوق غليل','Ghalil Treasury','cash',18,'','','','','','','YER',0.00,0.00,'',1,NULL,'2025-12-28 23:46:13','2026-01-02 05:28:03',NULL),(4,1,1,'21','بنك','','bank',20,'','','',NULL,'','','',0.00,0.00,'',1,1,'2026-01-01 00:04:29','2026-01-01 00:12:16',NULL),(5,1,1,'55','محفظة','','wallet',21,'','','','','','','',0.00,0.00,'',1,1,'2026-01-01 00:04:45','2026-01-02 03:31:06',NULL),(6,1,1,'88','صراف','','exchange',19,'','','',NULL,'','','YER',0.00,0.00,'',1,1,'2026-01-01 00:05:01','2026-01-01 00:05:01',NULL);
/*!40000 ALTER TABLE `custom_treasuries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_treasury_currencies`
--

DROP TABLE IF EXISTS `custom_treasury_currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_treasury_currencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `treasury_id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `opening_balance` decimal(15,2) DEFAULT 0.00,
  `current_balance` decimal(15,2) DEFAULT 0.00,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_treasury_currency` (`treasury_id`,`currency_id`),
  KEY `idx_treasury_id` (`treasury_id`),
  KEY `idx_currency_id` (`currency_id`),
  KEY `idx_business_id` (`business_id`),
  CONSTRAINT `custom_treasury_currencies_ibfk_1` FOREIGN KEY (`treasury_id`) REFERENCES `custom_treasuries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `custom_treasury_currencies_ibfk_2` FOREIGN KEY (`currency_id`) REFERENCES `custom_currencies` (`id`),
  CONSTRAINT `custom_treasury_currencies_ibfk_3` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_treasury_currencies`
--

LOCK TABLES `custom_treasury_currencies` WRITE;
/*!40000 ALTER TABLE `custom_treasury_currencies` DISABLE KEYS */;
INSERT INTO `custom_treasury_currencies` VALUES (1,1,2,1,1,1,0.00,0.00,NULL,'2025-12-28 23:46:13',NULL),(3,1,6,1,1,1,0.00,0.00,NULL,'2026-01-01 00:05:01',NULL),(4,1,3,1,1,1,0.00,0.00,1,'2026-01-02 03:30:55',NULL),(5,1,3,2,0,1,0.00,0.00,1,'2026-01-02 03:30:55',NULL),(6,1,3,3,0,1,0.00,0.00,1,'2026-01-02 03:30:55',NULL),(7,1,5,1,1,1,0.00,0.00,1,'2026-01-02 03:31:06',NULL),(8,1,5,2,0,1,0.00,0.00,1,'2026-01-02 03:31:06',NULL),(9,1,5,3,0,1,0.00,0.00,1,'2026-01-02 03:31:06',NULL);
/*!40000 ALTER TABLE `custom_treasury_currencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_treasury_transfers`
--

DROP TABLE IF EXISTS `custom_treasury_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_treasury_transfers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `sub_system_id` int(11) NOT NULL,
  `transfer_number` varchar(50) NOT NULL,
  `transfer_date` date NOT NULL,
  `from_treasury_id` int(11) NOT NULL,
  `to_treasury_id` int(11) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `exchange_rate` decimal(10,6) DEFAULT 1.000000,
  `fees` decimal(18,2) DEFAULT 0.00,
  `description` mediumtext DEFAULT NULL,
  `status` enum('draft','confirmed','cancelled') DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_treasury_transfers`
--

LOCK TABLES `custom_treasury_transfers` WRITE;
/*!40000 ALTER TABLE `custom_treasury_transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_treasury_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_transactions_new`
--

DROP TABLE IF EXISTS `customer_transactions_new`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_transactions_new` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `wallet_id` int(11) DEFAULT NULL,
  `trans_type` enum('payment','refund','charge','adjustment','deposit','withdrawal') NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `balance_before` decimal(18,2) DEFAULT NULL,
  `balance_after` decimal(18,2) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_transactions_new`
--

LOCK TABLES `customer_transactions_new` WRITE;
/*!40000 ALTER TABLE `customer_transactions_new` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_transactions_new` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_wallets`
--

DROP TABLE IF EXISTS `customer_wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_wallets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `balance` decimal(18,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'SAR',
  `last_transaction_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_wallets`
--

LOCK TABLES `customer_wallets` WRITE;
/*!40000 ALTER TABLE `customer_wallets` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `account_number` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `type` enum('residential','commercial','industrial','government','agricultural') DEFAULT 'residential',
  `category` varchar(50) DEFAULT NULL,
  `id_type` enum('national_id','iqama','passport','cr') DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `tariff_id` int(11) DEFAULT NULL,
  `connection_date` date DEFAULT NULL,
  `status` enum('active','suspended','disconnected','closed') DEFAULT 'active',
  `current_balance` decimal(18,2) DEFAULT 0.00,
  `deposit_amount` decimal(18,2) DEFAULT 0.00,
  `credit_limit` decimal(18,2) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers_enhanced`
--

DROP TABLE IF EXISTS `customers_enhanced`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers_enhanced` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `mobile_no` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `national_id` varchar(50) DEFAULT NULL,
  `customer_type` enum('residential','commercial','industrial','government') DEFAULT 'residential',
  `service_tier` enum('basic','premium','vip') DEFAULT 'basic',
  `cust_status` enum('active','inactive','suspended','closed') DEFAULT 'active',
  `balance_due` decimal(18,2) DEFAULT 0.00,
  `user_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers_enhanced`
--

LOCK TABLES `customers_enhanced` WRITE;
/*!40000 ALTER TABLE `customers_enhanced` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers_enhanced` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `cost_center_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_pipes`
--

DROP TABLE IF EXISTS `diesel_pipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_pipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `pipe_material` enum('iron','plastic','copper','stainless_steel') DEFAULT 'iron',
  `diameter` decimal(6,2) DEFAULT NULL,
  `length` decimal(8,2) DEFAULT NULL,
  `condition` enum('good','fair','poor','needs_replacement') DEFAULT 'good',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_pipes`
--

LOCK TABLES `diesel_pipes` WRITE;
/*!40000 ALTER TABLE `diesel_pipes` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_pipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_pump_meters`
--

DROP TABLE IF EXISTS `diesel_pump_meters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_pump_meters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `pump_type` enum('supplier','intake','output') NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `current_reading` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_pump_meters`
--

LOCK TABLES `diesel_pump_meters` WRITE;
/*!40000 ALTER TABLE `diesel_pump_meters` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_pump_meters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_pump_readings`
--

DROP TABLE IF EXISTS `diesel_pump_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_pump_readings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `pump_meter_id` int(11) NOT NULL,
  `task_id` int(11) DEFAULT NULL,
  `reading_date` datetime NOT NULL,
  `reading_value` decimal(15,2) NOT NULL,
  `reading_type` enum('before','after') NOT NULL,
  `reading_image` mediumtext DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_pump_readings`
--

LOCK TABLES `diesel_pump_readings` WRITE;
/*!40000 ALTER TABLE `diesel_pump_readings` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_pump_readings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_receiving_tasks`
--

DROP TABLE IF EXISTS `diesel_receiving_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_receiving_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `task_number` varchar(50) NOT NULL,
  `task_date` date NOT NULL,
  `employee_id` int(11) NOT NULL,
  `tanker_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `task_status` enum('pending','started','at_supplier','loading','returning','at_station','unloading','completed','cancelled') DEFAULT 'pending',
  `start_time` datetime DEFAULT NULL,
  `arrival_at_supplier_time` datetime DEFAULT NULL,
  `loading_start_time` datetime DEFAULT NULL,
  `loading_end_time` datetime DEFAULT NULL,
  `departure_from_supplier_time` datetime DEFAULT NULL,
  `arrival_at_station_time` datetime DEFAULT NULL,
  `unloading_start_time` datetime DEFAULT NULL,
  `unloading_end_time` datetime DEFAULT NULL,
  `completion_time` datetime DEFAULT NULL,
  `supplier_pump_id` int(11) DEFAULT NULL,
  `supplier_pump_reading_before` decimal(15,2) DEFAULT NULL,
  `supplier_pump_reading_after` decimal(15,2) DEFAULT NULL,
  `supplier_pump_reading_before_image` mediumtext DEFAULT NULL,
  `supplier_pump_reading_after_image` mediumtext DEFAULT NULL,
  `supplier_invoice_number` varchar(50) DEFAULT NULL,
  `supplier_invoice_image` mediumtext DEFAULT NULL,
  `supplier_invoice_amount` decimal(18,2) DEFAULT NULL,
  `quantity_from_supplier` decimal(10,2) DEFAULT NULL,
  `compartment1_quantity` decimal(10,2) DEFAULT NULL,
  `compartment2_quantity` decimal(10,2) DEFAULT NULL,
  `intake_pump_id` int(11) DEFAULT NULL,
  `intake_pump_reading_before` decimal(15,2) DEFAULT NULL,
  `intake_pump_reading_after` decimal(15,2) DEFAULT NULL,
  `intake_pump_reading_before_image` mediumtext DEFAULT NULL,
  `intake_pump_reading_after_image` mediumtext DEFAULT NULL,
  `quantity_received_at_station` decimal(10,2) DEFAULT NULL,
  `receiving_tank_id` int(11) DEFAULT NULL,
  `quantity_difference` decimal(10,2) DEFAULT NULL,
  `difference_notes` mediumtext DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_receiving_tasks`
--

LOCK TABLES `diesel_receiving_tasks` WRITE;
/*!40000 ALTER TABLE `diesel_receiving_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_receiving_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_suppliers`
--

DROP TABLE IF EXISTS `diesel_suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_suppliers`
--

LOCK TABLES `diesel_suppliers` WRITE;
/*!40000 ALTER TABLE `diesel_suppliers` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_tank_movements`
--

DROP TABLE IF EXISTS `diesel_tank_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_tank_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `movement_date` datetime NOT NULL,
  `movement_type` enum('receiving','transfer','consumption','adjustment') NOT NULL,
  `from_tank_id` int(11) DEFAULT NULL,
  `to_tank_id` int(11) DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `task_id` int(11) DEFAULT NULL,
  `output_pump_id` int(11) DEFAULT NULL,
  `output_pump_reading_before` decimal(15,2) DEFAULT NULL,
  `output_pump_reading_after` decimal(15,2) DEFAULT NULL,
  `generator_id` int(11) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_tank_movements`
--

LOCK TABLES `diesel_tank_movements` WRITE;
/*!40000 ALTER TABLE `diesel_tank_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_tank_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_tank_openings`
--

DROP TABLE IF EXISTS `diesel_tank_openings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_tank_openings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tank_id` int(11) NOT NULL,
  `opening_number` int(11) NOT NULL,
  `position` enum('top','bottom','side') NOT NULL,
  `usage` enum('inlet','outlet','ventilation','measurement','cleaning') NOT NULL,
  `diameter` decimal(6,2) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_tank_openings`
--

LOCK TABLES `diesel_tank_openings` WRITE;
/*!40000 ALTER TABLE `diesel_tank_openings` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_tank_openings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_tankers`
--

DROP TABLE IF EXISTS `diesel_tankers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_tankers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `plate_number` varchar(20) NOT NULL,
  `capacity` decimal(10,2) NOT NULL,
  `compartment1_capacity` decimal(10,2) DEFAULT NULL,
  `compartment2_capacity` decimal(10,2) DEFAULT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `driver_phone` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_tankers`
--

LOCK TABLES `diesel_tankers` WRITE;
/*!40000 ALTER TABLE `diesel_tankers` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_tankers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diesel_tanks`
--

DROP TABLE IF EXISTS `diesel_tanks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diesel_tanks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `tank_type` enum('receiving','main','pre_output','generator') NOT NULL,
  `tank_material` enum('plastic','iron','stainless_steel','fiberglass') DEFAULT 'plastic',
  `brand` varchar(100) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `capacity` decimal(10,2) NOT NULL,
  `height` decimal(8,2) DEFAULT NULL,
  `diameter` decimal(8,2) DEFAULT NULL,
  `dead_stock` decimal(10,2) DEFAULT 0.00,
  `effective_capacity` decimal(10,2) DEFAULT NULL,
  `current_level` decimal(10,2) DEFAULT 0.00,
  `min_level` decimal(10,2) DEFAULT 0.00,
  `openings_count` int(11) DEFAULT 1,
  `linked_generator_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diesel_tanks`
--

LOCK TABLES `diesel_tanks` WRITE;
/*!40000 ALTER TABLE `diesel_tanks` DISABLE KEYS */;
/*!40000 ALTER TABLE `diesel_tanks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_contracts`
--

DROP TABLE IF EXISTS `employee_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_contracts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `contract_number` varchar(50) NOT NULL,
  `contract_type` enum('permanent','fixed_term','temporary','probation') DEFAULT 'permanent',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `basic_salary` decimal(15,2) DEFAULT NULL,
  `probation_period_days` int(11) DEFAULT 90,
  `notice_period_days` int(11) DEFAULT 30,
  `document_path` varchar(500) DEFAULT NULL,
  `status` enum('active','expired','terminated','renewed') DEFAULT 'active',
  `termination_date` date DEFAULT NULL,
  `termination_reason` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_contracts`
--

LOCK TABLES `employee_contracts` WRITE;
/*!40000 ALTER TABLE `employee_contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `employee_number` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `full_name_ar` varchar(200) DEFAULT NULL,
  `full_name_en` varchar(200) DEFAULT NULL,
  `id_type` enum('national_id','passport','residence') DEFAULT 'national_id',
  `id_number` varchar(50) NOT NULL,
  `id_expiry_date` date DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `date_of_birth` date DEFAULT NULL,
  `place_of_birth` varchar(100) DEFAULT NULL,
  `marital_status` enum('single','married','divorced','widowed') DEFAULT 'single',
  `phone` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `personal_email` varchar(100) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_relation` varchar(50) DEFAULT NULL,
  `photo_path` varchar(500) DEFAULT NULL,
  `hire_date` date NOT NULL,
  `probation_end_date` date DEFAULT NULL,
  `contract_type` enum('permanent','contract','temporary','part_time') DEFAULT 'permanent',
  `contract_start_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `job_title_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `is_manager` tinyint(1) DEFAULT 0,
  `work_location` varchar(100) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `work_schedule` enum('full_time','shift','flexible') DEFAULT 'full_time',
  `working_hours_per_week` decimal(5,2) DEFAULT 40.00,
  `field_worker_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive','terminated','suspended','on_leave') DEFAULT 'active',
  `termination_date` date DEFAULT NULL,
  `termination_reason` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `asset_id` int(11) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `type` enum('transformer','generator','switchgear','breaker','relay','meter','sensor','inverter','battery','panel','cable','motor') NOT NULL,
  `status` enum('online','offline','maintenance','fault','unknown') DEFAULT 'unknown',
  `manufacturer` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `rated_capacity` decimal(15,2) DEFAULT NULL,
  `capacity_unit` varchar(20) DEFAULT NULL,
  `voltage_rating` varchar(50) DEFAULT NULL,
  `current_rating` varchar(50) DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `last_maintenance_date` date DEFAULT NULL,
  `next_maintenance_date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_controllable` tinyint(1) DEFAULT 0,
  `is_monitored` tinyint(1) DEFAULT 1,
  `communication_protocol` varchar(50) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `metadata` longtext DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment`
--

LOCK TABLES `equipment` WRITE;
/*!40000 ALTER TABLE `equipment` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment_movements`
--

DROP TABLE IF EXISTS `equipment_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) NOT NULL,
  `movement_type` enum('checkout','return','transfer','maintenance','retire') NOT NULL,
  `from_holder_id` int(11) DEFAULT NULL,
  `to_holder_id` int(11) DEFAULT NULL,
  `operation_id` int(11) DEFAULT NULL,
  `movement_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `condition_before` enum('excellent','good','fair','poor') DEFAULT NULL,
  `condition_after` enum('excellent','good','fair','poor') DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment_movements`
--

LOCK TABLES `equipment_movements` WRITE;
/*!40000 ALTER TABLE `equipment_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipment_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_subscriptions`
--

DROP TABLE IF EXISTS `event_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `subscriber_name` varchar(100) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `handler_type` enum('webhook','queue','function','email','sms') NOT NULL,
  `handler_config` longtext NOT NULL CHECK (json_valid(`handler_config`)),
  `filter_expression` longtext DEFAULT NULL CHECK (json_valid(`filter_expression`)),
  `is_active` tinyint(1) DEFAULT 1,
  `priority` int(11) DEFAULT 0,
  `max_retries` int(11) DEFAULT 3,
  `retry_delay_seconds` int(11) DEFAULT 60,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_subscriptions`
--

LOCK TABLES `event_subscriptions` WRITE;
/*!40000 ALTER TABLE `event_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_types`
--

DROP TABLE IF EXISTS `fee_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `fee_type` enum('fixed','percentage','per_unit') DEFAULT 'fixed',
  `amount` decimal(18,2) DEFAULT 0.00,
  `is_recurring` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_types`
--

LOCK TABLES `fee_types` WRITE;
/*!40000 ALTER TABLE `fee_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `field_equipment`
--

DROP TABLE IF EXISTS `field_equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `field_equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `equipment_code` varchar(30) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `equipment_type` enum('tool','vehicle','device','safety','measuring') NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `status` enum('available','in_use','maintenance','retired','lost') DEFAULT 'available',
  `current_holder_id` int(11) DEFAULT NULL,
  `assigned_team_id` int(11) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(12,2) DEFAULT NULL,
  `warranty_end` date DEFAULT NULL,
  `last_maintenance` date DEFAULT NULL,
  `next_maintenance` date DEFAULT NULL,
  `condition` enum('excellent','good','fair','poor') DEFAULT 'good',
  `notes` mediumtext DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `field_equipment`
--

LOCK TABLES `field_equipment` WRITE;
/*!40000 ALTER TABLE `field_equipment` DISABLE KEYS */;
/*!40000 ALTER TABLE `field_equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `field_operations`
--

DROP TABLE IF EXISTS `field_operations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `field_operations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) DEFAULT NULL,
  `operation_number` varchar(30) NOT NULL,
  `operation_type` enum('installation','maintenance','inspection','disconnection','reconnection','meter_reading','collection','repair','replacement') NOT NULL,
  `status` enum('draft','scheduled','assigned','in_progress','waiting_customer','on_hold','completed','cancelled','rejected') DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `asset_id` int(11) DEFAULT NULL,
  `location_lat` decimal(10,8) DEFAULT NULL,
  `location_lng` decimal(11,8) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `scheduled_time` varchar(10) DEFAULT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `assigned_team_id` int(11) DEFAULT NULL,
  `assigned_worker_id` int(11) DEFAULT NULL,
  `estimated_duration` int(11) DEFAULT NULL,
  `actual_duration` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `completion_notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `field_operations`
--

LOCK TABLES `field_operations` WRITE;
/*!40000 ALTER TABLE `field_operations` DISABLE KEYS */;
/*!40000 ALTER TABLE `field_operations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `field_teams`
--

DROP TABLE IF EXISTS `field_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `field_teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `team_type` enum('installation','maintenance','inspection','collection','mixed') DEFAULT 'mixed',
  `leader_id` int(11) DEFAULT NULL,
  `max_members` int(11) DEFAULT 10,
  `current_members` int(11) DEFAULT 0,
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `working_area` mediumtext DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `field_teams`
--

LOCK TABLES `field_teams` WRITE;
/*!40000 ALTER TABLE `field_teams` DISABLE KEYS */;
/*!40000 ALTER TABLE `field_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `field_workers`
--

DROP TABLE IF EXISTS `field_workers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `field_workers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `employee_number` varchar(30) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `worker_type` enum('technician','engineer','supervisor','driver','helper') DEFAULT 'technician',
  `specialization` varchar(100) DEFAULT NULL,
  `skills` longtext DEFAULT NULL CHECK (json_valid(`skills`)),
  `status` enum('available','busy','on_leave','inactive') DEFAULT 'available',
  `current_location_lat` decimal(10,8) DEFAULT NULL,
  `current_location_lng` decimal(11,8) DEFAULT NULL,
  `last_location_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hire_date` date DEFAULT NULL,
  `daily_rate` decimal(10,2) DEFAULT NULL,
  `operation_rate` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `employee_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `field_workers`
--

LOCK TABLES `field_workers` WRITE;
/*!40000 ALTER TABLE `field_workers` DISABLE KEYS */;
/*!40000 ALTER TABLE `field_workers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fiscal_periods`
--

DROP TABLE IF EXISTS `fiscal_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fiscal_periods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `period` int(11) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('open','closed','locked') DEFAULT 'open',
  `closed_by` int(11) DEFAULT NULL,
  `closed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fiscal_periods`
--

LOCK TABLES `fiscal_periods` WRITE;
/*!40000 ALTER TABLE `fiscal_periods` DISABLE KEYS */;
/*!40000 ALTER TABLE `fiscal_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `generator_diesel_consumption`
--

DROP TABLE IF EXISTS `generator_diesel_consumption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `generator_diesel_consumption` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `generator_id` int(11) NOT NULL,
  `consumption_date` date NOT NULL,
  `rocket_tank_id` int(11) DEFAULT NULL,
  `start_level` decimal(10,2) DEFAULT NULL,
  `end_level` decimal(10,2) DEFAULT NULL,
  `quantity_consumed` decimal(10,2) NOT NULL,
  `running_hours` decimal(8,2) DEFAULT NULL,
  `consumption_rate` decimal(8,2) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `generator_diesel_consumption`
--

LOCK TABLES `generator_diesel_consumption` WRITE;
/*!40000 ALTER TABLE `generator_diesel_consumption` DISABLE KEYS */;
/*!40000 ALTER TABLE `generator_diesel_consumption` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incoming_webhooks`
--

DROP TABLE IF EXISTS `incoming_webhooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incoming_webhooks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `integration_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `webhook_type` varchar(100) NOT NULL,
  `payload` longtext NOT NULL CHECK (json_valid(`payload`)),
  `headers` longtext DEFAULT NULL CHECK (json_valid(`headers`)),
  `signature` varchar(255) DEFAULT NULL,
  `is_valid` tinyint(1) DEFAULT 1,
  `status` enum('received','processing','processed','failed') DEFAULT 'received',
  `processed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `error_message` mediumtext DEFAULT NULL,
  `retry_count` int(11) DEFAULT 0,
  `source_ip` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incoming_webhooks`
--

LOCK TABLES `incoming_webhooks` WRITE;
/*!40000 ALTER TABLE `incoming_webhooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `incoming_webhooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspection_checklists`
--

DROP TABLE IF EXISTS `inspection_checklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_checklists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(30) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `operation_type` varchar(50) DEFAULT NULL,
  `items` longtext DEFAULT NULL CHECK (json_valid(`items`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspection_checklists`
--

LOCK TABLES `inspection_checklists` WRITE;
/*!40000 ALTER TABLE `inspection_checklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `inspection_checklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspection_items`
--

DROP TABLE IF EXISTS `inspection_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inspection_id` int(11) NOT NULL,
  `checklist_item_id` int(11) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `is_passed` tinyint(1) DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspection_items`
--

LOCK TABLES `inspection_items` WRITE;
/*!40000 ALTER TABLE `inspection_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `inspection_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspections`
--

DROP TABLE IF EXISTS `inspections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `operation_id` int(11) NOT NULL,
  `inspection_number` varchar(30) NOT NULL,
  `inspection_type` enum('quality','safety','completion','periodic') NOT NULL,
  `inspector_id` int(11) DEFAULT NULL,
  `inspection_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','passed','failed','conditional') DEFAULT 'pending',
  `overall_score` decimal(5,2) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspections`
--

LOCK TABLES `inspections` WRITE;
/*!40000 ALTER TABLE `inspections` DISABLE KEYS */;
/*!40000 ALTER TABLE `inspections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `installation_details`
--

DROP TABLE IF EXISTS `installation_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `installation_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `operation_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `meter_serial_number` varchar(100) DEFAULT NULL,
  `meter_type` enum('smart','traditional','prepaid') DEFAULT NULL,
  `seal_number` varchar(50) DEFAULT NULL,
  `seal_color` varchar(30) DEFAULT NULL,
  `seal_type` varchar(50) DEFAULT NULL,
  `breaker_type` varchar(50) DEFAULT NULL,
  `breaker_capacity` varchar(20) DEFAULT NULL,
  `breaker_brand` varchar(50) DEFAULT NULL,
  `cable_length` decimal(10,2) DEFAULT NULL,
  `cable_type` varchar(50) DEFAULT NULL,
  `cable_size` varchar(20) DEFAULT NULL,
  `initial_reading` decimal(15,3) DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `installation_time` varchar(10) DEFAULT NULL,
  `technician_id` int(11) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `customer_signature` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `installation_details`
--

LOCK TABLES `installation_details` WRITE;
/*!40000 ALTER TABLE `installation_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `installation_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `installation_photos`
--

DROP TABLE IF EXISTS `installation_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `installation_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `installation_id` int(11) DEFAULT NULL,
  `operation_id` int(11) NOT NULL,
  `photo_type` enum('meter_front','meter_reading','seal','breaker','wiring','location','customer_premises','before_installation','after_installation') DEFAULT NULL,
  `photo_url` varchar(500) NOT NULL,
  `caption` varchar(200) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `captured_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `installation_photos`
--

LOCK TABLES `installation_photos` WRITE;
/*!40000 ALTER TABLE `installation_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `installation_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integration_configs`
--

DROP TABLE IF EXISTS `integration_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integration_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `integration_id` int(11) NOT NULL,
  `config_key` varchar(100) NOT NULL,
  `config_value` mediumtext DEFAULT NULL,
  `is_encrypted` tinyint(1) DEFAULT 0,
  `value_type` enum('string','number','boolean','json') DEFAULT 'string',
  `environment` enum('production','staging','development') DEFAULT 'production',
  `description` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integration_configs`
--

LOCK TABLES `integration_configs` WRITE;
/*!40000 ALTER TABLE `integration_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `integration_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integration_logs`
--

DROP TABLE IF EXISTS `integration_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integration_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `integration_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `request_id` varchar(100) DEFAULT NULL,
  `direction` enum('outgoing','incoming') NOT NULL,
  `method` varchar(10) DEFAULT NULL,
  `endpoint` varchar(500) DEFAULT NULL,
  `request_headers` longtext DEFAULT NULL CHECK (json_valid(`request_headers`)),
  `request_body` longtext DEFAULT NULL CHECK (json_valid(`request_body`)),
  `response_status` int(11) DEFAULT NULL,
  `response_headers` longtext DEFAULT NULL CHECK (json_valid(`response_headers`)),
  `response_body` longtext DEFAULT NULL CHECK (json_valid(`response_body`)),
  `duration_ms` int(11) DEFAULT NULL,
  `status` enum('success','failed','timeout','error') NOT NULL,
  `error_message` mediumtext DEFAULT NULL,
  `retry_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integration_logs`
--

LOCK TABLES `integration_logs` WRITE;
/*!40000 ALTER TABLE `integration_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `integration_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integrations`
--

DROP TABLE IF EXISTS `integrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(200) NOT NULL,
  `name_en` varchar(200) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `integration_type` enum('payment_gateway','sms','whatsapp','email','iot','erp','crm','scada','gis','weather','maps','other') NOT NULL,
  `category` enum('local','international','internal') DEFAULT 'local',
  `provider` varchar(100) DEFAULT NULL,
  `base_url` varchar(500) DEFAULT NULL,
  `api_version` varchar(20) DEFAULT NULL,
  `auth_type` enum('api_key','oauth2','basic','hmac','jwt','none') DEFAULT 'api_key',
  `is_active` tinyint(1) DEFAULT 1,
  `is_primary` tinyint(1) DEFAULT 0,
  `priority` int(11) DEFAULT 1,
  `last_health_check` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `health_status` enum('healthy','degraded','down','unknown') DEFAULT 'unknown',
  `webhook_url` varchar(500) DEFAULT NULL,
  `webhook_secret` varchar(255) DEFAULT NULL,
  `rate_limit_per_minute` int(11) DEFAULT 60,
  `timeout_seconds` int(11) DEFAULT 30,
  `retry_attempts` int(11) DEFAULT 3,
  `metadata` longtext DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integrations`
--

LOCK TABLES `integrations` WRITE;
/*!40000 ALTER TABLE `integrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `integrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_fees`
--

DROP TABLE IF EXISTS `invoice_fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_fees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_id` int(11) NOT NULL,
  `fee_type_id` int(11) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_fees`
--

LOCK TABLES `invoice_fees` WRITE;
/*!40000 ALTER TABLE `invoice_fees` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `meter_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date NOT NULL,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `reading_id` int(11) DEFAULT NULL,
  `consumption` decimal(15,3) DEFAULT NULL,
  `consumption_amount` decimal(18,2) DEFAULT 0.00,
  `fixed_charges` decimal(18,2) DEFAULT 0.00,
  `tax_amount` decimal(18,2) DEFAULT 0.00,
  `other_charges` decimal(18,2) DEFAULT 0.00,
  `discount_amount` decimal(18,2) DEFAULT 0.00,
  `previous_balance` decimal(18,2) DEFAULT 0.00,
  `total_amount` decimal(18,2) DEFAULT 0.00,
  `paid_amount` decimal(18,2) DEFAULT 0.00,
  `balance_due` decimal(18,2) DEFAULT 0.00,
  `status` enum('draft','issued','sent','partial','paid','overdue','cancelled') DEFAULT 'draft',
  `journal_entry_id` int(11) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices_enhanced`
--

DROP TABLE IF EXISTS `invoices_enhanced`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices_enhanced` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `meter_id` int(11) DEFAULT NULL,
  `meter_reading_id` int(11) DEFAULT NULL,
  `billing_period_id` int(11) DEFAULT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `meter_number` varchar(50) DEFAULT NULL,
  `previous_reading` decimal(15,3) DEFAULT NULL,
  `current_reading` decimal(15,3) DEFAULT NULL,
  `total_consumption_kwh` decimal(15,3) DEFAULT NULL,
  `price_kwh` decimal(10,4) DEFAULT NULL,
  `consumption_amount` decimal(18,2) DEFAULT 0.00,
  `fixed_charges` decimal(18,2) DEFAULT 0.00,
  `total_fees` decimal(18,2) DEFAULT 0.00,
  `vat_rate` decimal(5,2) DEFAULT 15.00,
  `vat_amount` decimal(18,2) DEFAULT 0.00,
  `total_amount` decimal(18,2) DEFAULT 0.00,
  `previous_balance_due` decimal(18,2) DEFAULT 0.00,
  `final_amount` decimal(18,2) DEFAULT 0.00,
  `paid_amount` decimal(18,2) DEFAULT 0.00,
  `balance_due` decimal(18,2) DEFAULT 0.00,
  `invoice_status` enum('generated','partial','approved','locked','paid','cancelled') DEFAULT 'generated',
  `invoice_type` enum('partial','final') DEFAULT 'final',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices_enhanced`
--

LOCK TABLES `invoices_enhanced` WRITE;
/*!40000 ALTER TABLE `invoices_enhanced` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices_enhanced` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_categories`
--

DROP TABLE IF EXISTS `item_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `inventory_account_id` int(11) DEFAULT NULL,
  `cogs_account_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_categories`
--

LOCK TABLES `item_categories` WRITE;
/*!40000 ALTER TABLE `item_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `type` enum('spare_part','consumable','raw_material','finished_good') DEFAULT 'spare_part',
  `unit` varchar(20) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `min_stock` decimal(15,3) DEFAULT 0.000,
  `max_stock` decimal(15,3) DEFAULT NULL,
  `reorder_point` decimal(15,3) DEFAULT NULL,
  `reorder_qty` decimal(15,3) DEFAULT NULL,
  `standard_cost` decimal(18,4) DEFAULT 0.0000,
  `last_purchase_price` decimal(18,4) DEFAULT NULL,
  `average_cost` decimal(18,4) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `image` mediumtext DEFAULT NULL,
  `specifications` longtext DEFAULT NULL CHECK (json_valid(`specifications`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_titles`
--

DROP TABLE IF EXISTS `job_titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_titles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `title_ar` varchar(100) NOT NULL,
  `title_en` varchar(100) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `grade_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `description` mediumtext DEFAULT NULL,
  `responsibilities` mediumtext DEFAULT NULL,
  `requirements` mediumtext DEFAULT NULL,
  `headcount` int(11) DEFAULT 1,
  `current_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_titles`
--

LOCK TABLES `job_titles` WRITE;
/*!40000 ALTER TABLE `job_titles` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `entry_number` varchar(50) NOT NULL,
  `entry_date` date NOT NULL,
  `period_id` int(11) NOT NULL,
  `type` enum('manual','auto','opening','closing','adjustment','invoice','payment','receipt','transfer','depreciation') DEFAULT 'manual',
  `source_module` varchar(50) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `total_debit` decimal(18,2) DEFAULT 0.00,
  `total_credit` decimal(18,2) DEFAULT 0.00,
  `status` enum('draft','posted','reversed') DEFAULT 'draft',
  `posted_by` int(11) DEFAULT NULL,
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reversed_by` int(11) DEFAULT NULL,
  `reversed_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `reversal_entry_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entries`
--

LOCK TABLES `journal_entries` WRITE;
/*!40000 ALTER TABLE `journal_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entry_lines`
--

DROP TABLE IF EXISTS `journal_entry_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_entry_lines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `entry_id` int(11) NOT NULL,
  `line_number` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `cost_center_id` int(11) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `debit` decimal(18,2) DEFAULT 0.00,
  `credit` decimal(18,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'SAR',
  `exchange_rate` decimal(10,6) DEFAULT 1.000000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entry_lines`
--

LOCK TABLES `journal_entry_lines` WRITE;
/*!40000 ALTER TABLE `journal_entry_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_entry_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_balances`
--

DROP TABLE IF EXISTS `leave_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `opening_balance` int(11) DEFAULT 0,
  `earned_balance` int(11) DEFAULT 0,
  `used_balance` int(11) DEFAULT 0,
  `adjustment_balance` int(11) DEFAULT 0,
  `remaining_balance` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balances`
--

LOCK TABLES `leave_balances` WRITE;
/*!40000 ALTER TABLE `leave_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` int(11) NOT NULL,
  `reason` mediumtext DEFAULT NULL,
  `attachment_path` varchar(500) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rejection_reason` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `annual_balance` int(11) DEFAULT 0,
  `is_paid` tinyint(1) DEFAULT 1,
  `requires_approval` tinyint(1) DEFAULT 1,
  `allows_carry_over` tinyint(1) DEFAULT 0,
  `max_carry_over_days` int(11) DEFAULT 0,
  `color` varchar(20) DEFAULT '#3B82F6',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_plans`
--

DROP TABLE IF EXISTS `maintenance_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `asset_category_id` int(11) DEFAULT NULL,
  `frequency` enum('daily','weekly','monthly','quarterly','semi_annual','annual') NOT NULL,
  `interval_days` int(11) DEFAULT NULL,
  `based_on` enum('calendar','meter','condition') DEFAULT 'calendar',
  `meter_type` varchar(50) DEFAULT NULL,
  `meter_interval` decimal(15,2) DEFAULT NULL,
  `estimated_hours` decimal(8,2) DEFAULT NULL,
  `estimated_cost` decimal(18,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `tasks` longtext DEFAULT NULL CHECK (json_valid(`tasks`)),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_plans`
--

LOCK TABLES `maintenance_plans` WRITE;
/*!40000 ALTER TABLE `maintenance_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_request_items`
--

DROP TABLE IF EXISTS `material_request_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_request_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `requested_qty` decimal(12,3) NOT NULL,
  `approved_qty` decimal(12,3) DEFAULT NULL,
  `issued_qty` decimal(12,3) DEFAULT NULL,
  `returned_qty` decimal(12,3) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_request_items`
--

LOCK TABLES `material_request_items` WRITE;
/*!40000 ALTER TABLE `material_request_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_request_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_requests`
--

DROP TABLE IF EXISTS `material_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `request_number` varchar(30) NOT NULL,
  `operation_id` int(11) DEFAULT NULL,
  `worker_id` int(11) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `request_date` date NOT NULL,
  `status` enum('pending','approved','issued','returned','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `issued_by` int(11) DEFAULT NULL,
  `issued_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_requests`
--

LOCK TABLES `material_requests` WRITE;
/*!40000 ALTER TABLE `material_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meter_readings`
--

DROP TABLE IF EXISTS `meter_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meter_readings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `meter_id` int(11) NOT NULL,
  `reading_date` date NOT NULL,
  `reading_value` decimal(15,3) NOT NULL,
  `previous_reading` decimal(15,3) DEFAULT NULL,
  `consumption` decimal(15,3) DEFAULT NULL,
  `reading_type` enum('actual','estimated','adjusted') DEFAULT 'actual',
  `read_by` int(11) DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `status` enum('pending','verified','billed','disputed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meter_readings`
--

LOCK TABLES `meter_readings` WRITE;
/*!40000 ALTER TABLE `meter_readings` DISABLE KEYS */;
/*!40000 ALTER TABLE `meter_readings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meter_readings_enhanced`
--

DROP TABLE IF EXISTS `meter_readings_enhanced`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meter_readings_enhanced` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `meter_id` int(11) NOT NULL,
  `billing_period_id` int(11) NOT NULL,
  `current_reading` decimal(15,3) NOT NULL,
  `previous_reading` decimal(15,3) DEFAULT NULL,
  `consumption` decimal(15,3) DEFAULT NULL,
  `reading_date` date NOT NULL,
  `reading_type` enum('actual','estimated','adjusted') DEFAULT 'actual',
  `reading_status` enum('entered','approved','locked','disputed') DEFAULT 'entered',
  `is_estimated` tinyint(1) DEFAULT 0,
  `images` longtext DEFAULT NULL CHECK (json_valid(`images`)),
  `read_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meter_readings_enhanced`
--

LOCK TABLES `meter_readings_enhanced` WRITE;
/*!40000 ALTER TABLE `meter_readings_enhanced` DISABLE KEYS */;
/*!40000 ALTER TABLE `meter_readings_enhanced` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meters`
--

DROP TABLE IF EXISTS `meters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `meter_number` varchar(50) NOT NULL,
  `type` enum('single_phase','three_phase','smart','prepaid') DEFAULT 'single_phase',
  `status` enum('active','inactive','faulty','replaced') DEFAULT 'active',
  `installation_date` date DEFAULT NULL,
  `last_reading_date` date DEFAULT NULL,
  `last_reading` decimal(15,3) DEFAULT NULL,
  `multiplier` decimal(10,4) DEFAULT 1.0000,
  `max_load` decimal(10,2) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meters`
--

LOCK TABLES `meters` WRITE;
/*!40000 ALTER TABLE `meters` DISABLE KEYS */;
/*!40000 ALTER TABLE `meters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meters_enhanced`
--

DROP TABLE IF EXISTS `meters_enhanced`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meters_enhanced` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `cabinet_id` int(11) DEFAULT NULL,
  `tariff_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `meter_number` varchar(50) NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `meter_type` enum('electricity','water','gas') DEFAULT 'electricity',
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `meter_category` enum('offline','iot','code') DEFAULT 'offline',
  `current_reading` decimal(15,3) DEFAULT 0.000,
  `previous_reading` decimal(15,3) DEFAULT 0.000,
  `balance` decimal(18,2) DEFAULT 0.00,
  `balance_due` decimal(18,2) DEFAULT 0.00,
  `installation_date` date DEFAULT NULL,
  `installation_status` enum('new','used','not_installed') DEFAULT 'new',
  `sign_number` varchar(50) DEFAULT NULL,
  `sign_color` varchar(50) DEFAULT NULL,
  `meter_status` enum('active','inactive','maintenance','faulty','not_installed') DEFAULT 'active',
  `is_active` tinyint(1) DEFAULT 1,
  `iot_device_id` varchar(100) DEFAULT NULL,
  `last_sync_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meters_enhanced`
--

LOCK TABLES `meters_enhanced` WRITE;
/*!40000 ALTER TABLE `meters_enhanced` DISABLE KEYS */;
/*!40000 ALTER TABLE `meters_enhanced` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `note_categories`
--

DROP TABLE IF EXISTS `note_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `note_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note_categories`
--

LOCK TABLES `note_categories` WRITE;
/*!40000 ALTER TABLE `note_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `note_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_approvals`
--

DROP TABLE IF EXISTS `operation_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_approvals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `operation_id` int(11) NOT NULL,
  `approval_level` int(11) DEFAULT 1,
  `approver_id` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `decision_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` mediumtext DEFAULT NULL,
  `signature_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_approvals`
--

LOCK TABLES `operation_approvals` WRITE;
/*!40000 ALTER TABLE `operation_approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `operation_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_payments`
--

DROP TABLE IF EXISTS `operation_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `operation_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `payment_type` enum('fixed','per_operation','commission','hourly') DEFAULT 'per_operation',
  `base_amount` decimal(12,2) DEFAULT 0.00,
  `bonus_amount` decimal(12,2) DEFAULT 0.00,
  `deduction_amount` decimal(12,2) DEFAULT 0.00,
  `net_amount` decimal(12,2) DEFAULT 0.00,
  `status` enum('calculated','approved','paid') DEFAULT 'calculated',
  `calculated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `paid_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_payments`
--

LOCK TABLES `operation_payments` WRITE;
/*!40000 ALTER TABLE `operation_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `operation_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_status_log`
--

DROP TABLE IF EXISTS `operation_status_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_status_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `operation_id` int(11) NOT NULL,
  `from_status` varchar(30) DEFAULT NULL,
  `to_status` varchar(30) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reason` mediumtext DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_status_log`
--

LOCK TABLES `operation_status_log` WRITE;
/*!40000 ALTER TABLE `operation_status_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `operation_status_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods_new`
--

DROP TABLE IF EXISTS `payment_methods_new`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods_new` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `method_type` enum('cash','card','bank_transfer','check','online','sadad','wallet') DEFAULT 'cash',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods_new`
--

LOCK TABLES `payment_methods_new` WRITE;
/*!40000 ALTER TABLE `payment_methods_new` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_methods_new` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `payment_number` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `payment_method` enum('cash','card','bank_transfer','check','online','sadad') DEFAULT 'cash',
  `reference_number` varchar(100) DEFAULT NULL,
  `bank_account_id` int(11) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'completed',
  `notes` mediumtext DEFAULT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments_enhanced`
--

DROP TABLE IF EXISTS `payments_enhanced`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments_enhanced` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `meter_id` int(11) DEFAULT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `cashbox_id` int(11) DEFAULT NULL,
  `payment_method_id` int(11) DEFAULT NULL,
  `payment_number` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `balance_due_before` decimal(18,2) DEFAULT NULL,
  `balance_due_after` decimal(18,2) DEFAULT NULL,
  `payer_name` varchar(255) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'completed',
  `notes` mediumtext DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments_enhanced`
--

LOCK TABLES `payments_enhanced` WRITE;
/*!40000 ALTER TABLE `payments_enhanced` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments_enhanced` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_items`
--

DROP TABLE IF EXISTS `payroll_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payroll_run_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `working_days` int(11) DEFAULT 30,
  `actual_days` int(11) DEFAULT 30,
  `housing_allowance` decimal(15,2) DEFAULT 0.00,
  `transport_allowance` decimal(15,2) DEFAULT 0.00,
  `other_allowances` decimal(15,2) DEFAULT 0.00,
  `total_allowances` decimal(15,2) DEFAULT 0.00,
  `overtime_hours` decimal(10,2) DEFAULT 0.00,
  `overtime_amount` decimal(15,2) DEFAULT 0.00,
  `bonuses` decimal(15,2) DEFAULT 0.00,
  `total_additions` decimal(15,2) DEFAULT 0.00,
  `absence_days` int(11) DEFAULT 0,
  `absence_deduction` decimal(15,2) DEFAULT 0.00,
  `late_deduction` decimal(15,2) DEFAULT 0.00,
  `social_insurance` decimal(15,2) DEFAULT 0.00,
  `tax_deduction` decimal(15,2) DEFAULT 0.00,
  `loan_deduction` decimal(15,2) DEFAULT 0.00,
  `other_deductions` decimal(15,2) DEFAULT 0.00,
  `total_deductions` decimal(15,2) DEFAULT 0.00,
  `gross_salary` decimal(15,2) DEFAULT NULL,
  `net_salary` decimal(15,2) DEFAULT NULL,
  `status` enum('calculated','approved','paid') DEFAULT 'calculated',
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_items`
--

LOCK TABLES `payroll_items` WRITE;
/*!40000 ALTER TABLE `payroll_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_runs`
--

DROP TABLE IF EXISTS `payroll_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_runs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `period_year` int(11) NOT NULL,
  `period_month` int(11) NOT NULL,
  `period_start_date` date NOT NULL,
  `period_end_date` date NOT NULL,
  `total_basic_salary` decimal(15,2) DEFAULT 0.00,
  `total_allowances` decimal(15,2) DEFAULT 0.00,
  `total_deductions` decimal(15,2) DEFAULT 0.00,
  `total_net_salary` decimal(15,2) DEFAULT 0.00,
  `employee_count` int(11) DEFAULT 0,
  `status` enum('draft','calculated','approved','paid','cancelled') DEFAULT 'draft',
  `journal_entry_id` int(11) DEFAULT NULL,
  `calculated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `calculated_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `approved_by` int(11) DEFAULT NULL,
  `paid_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `paid_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_runs`
--

LOCK TABLES `payroll_runs` WRITE;
/*!40000 ALTER TABLE `payroll_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_evaluations`
--

DROP TABLE IF EXISTS `performance_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `evaluation_period` varchar(50) NOT NULL,
  `period_start_date` date NOT NULL,
  `period_end_date` date NOT NULL,
  `overall_score` decimal(5,2) DEFAULT NULL,
  `performance_rating` enum('exceptional','exceeds','meets','needs_improvement','unsatisfactory') DEFAULT NULL,
  `quality_score` decimal(5,2) DEFAULT NULL,
  `productivity_score` decimal(5,2) DEFAULT NULL,
  `attendance_score` decimal(5,2) DEFAULT NULL,
  `teamwork_score` decimal(5,2) DEFAULT NULL,
  `initiative_score` decimal(5,2) DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `areas_for_improvement` text DEFAULT NULL,
  `goals` text DEFAULT NULL,
  `manager_comments` text DEFAULT NULL,
  `employee_comments` text DEFAULT NULL,
  `evaluated_by` int(11) NOT NULL,
  `evaluated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('draft','submitted','reviewed','acknowledged') DEFAULT 'draft',
  `acknowledged_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_evaluations`
--

LOCK TABLES `performance_evaluations` WRITE;
/*!40000 ALTER TABLE `performance_evaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_metrics`
--

DROP TABLE IF EXISTS `performance_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `metric_type` enum('response_time','throughput','error_rate','cpu_usage','memory_usage','disk_usage','network_io','db_connections','active_users','api_calls','queue_size','cache_hit_rate') NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `value` decimal(15,4) NOT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `tags` longtext DEFAULT NULL CHECK (json_valid(`tags`)),
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_metrics`
--

LOCK TABLES `performance_metrics` WRITE;
/*!40000 ALTER TABLE `performance_metrics` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `period_settlements`
--

DROP TABLE IF EXISTS `period_settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `period_settlements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `settlement_number` varchar(30) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `total_operations` int(11) DEFAULT 0,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `total_bonuses` decimal(15,2) DEFAULT 0.00,
  `total_deductions` decimal(15,2) DEFAULT 0.00,
  `net_amount` decimal(15,2) DEFAULT 0.00,
  `status` enum('draft','approved','paid') DEFAULT 'draft',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `period_settlements`
--

LOCK TABLES `period_settlements` WRITE;
/*!40000 ALTER TABLE `period_settlements` DISABLE KEYS */;
/*!40000 ALTER TABLE `period_settlements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module` varchar(50) NOT NULL,
  `code` varchar(100) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepaid_codes`
--

DROP TABLE IF EXISTS `prepaid_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepaid_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `meter_id` int(11) DEFAULT NULL,
  `code` varchar(100) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `prepaid_status` enum('active','used','expired','cancelled') DEFAULT 'active',
  `used_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `generated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `prepaid_codes_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepaid_codes`
--

LOCK TABLES `prepaid_codes` WRITE;
/*!40000 ALTER TABLE `prepaid_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `prepaid_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_phases`
--

DROP TABLE IF EXISTS `project_phases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_phases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `phase_number` int(11) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `actual_start_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `budget` decimal(18,2) DEFAULT NULL,
  `actual_cost` decimal(18,2) DEFAULT 0.00,
  `progress` decimal(5,2) DEFAULT 0.00,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_phases`
--

LOCK TABLES `project_phases` WRITE;
/*!40000 ALTER TABLE `project_phases` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_phases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_tasks`
--

DROP TABLE IF EXISTS `project_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `phase_id` int(11) DEFAULT NULL,
  `parent_task_id` int(11) DEFAULT NULL,
  `task_number` varchar(50) DEFAULT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `type` enum('task','milestone') DEFAULT 'task',
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `assigned_to` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `actual_start_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `estimated_hours` decimal(8,2) DEFAULT NULL,
  `actual_hours` decimal(8,2) DEFAULT NULL,
  `progress` decimal(5,2) DEFAULT 0.00,
  `dependencies` longtext DEFAULT NULL CHECK (json_valid(`dependencies`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_tasks`
--

LOCK TABLES `project_tasks` WRITE;
/*!40000 ALTER TABLE `project_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` enum('construction','expansion','maintenance','upgrade','installation','decommission','study') NOT NULL,
  `status` enum('planning','approved','in_progress','on_hold','completed','cancelled','closed') DEFAULT 'planning',
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `manager_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `planned_end_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `budget` decimal(18,2) DEFAULT NULL,
  `actual_cost` decimal(18,2) DEFAULT 0.00,
  `progress` decimal(5,2) DEFAULT 0.00,
  `cost_center_id` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `closed_by` int(11) DEFAULT NULL,
  `closed_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `order_date` date NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `status` enum('draft','pending','approved','sent','partial_received','received','cancelled','closed') DEFAULT 'draft',
  `delivery_date` date DEFAULT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `payment_terms` int(11) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `exchange_rate` decimal(10,6) DEFAULT 1.000000,
  `subtotal` decimal(18,2) DEFAULT 0.00,
  `tax_amount` decimal(18,2) DEFAULT 0.00,
  `discount_amount` decimal(18,2) DEFAULT 0.00,
  `total_amount` decimal(18,2) DEFAULT 0.00,
  `paid_amount` decimal(18,2) DEFAULT 0.00,
  `notes` mediumtext DEFAULT NULL,
  `terms` mediumtext DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_requests`
--

DROP TABLE IF EXISTS `purchase_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `request_number` varchar(50) NOT NULL,
  `request_date` date NOT NULL,
  `required_date` date DEFAULT NULL,
  `status` enum('draft','pending','approved','rejected','converted','cancelled') DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `requested_by` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `purpose` mediumtext DEFAULT NULL,
  `total_amount` decimal(18,2) DEFAULT 0.00,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_requests`
--

LOCK TABLES `purchase_requests` WRITE;
/*!40000 ALTER TABLE `purchase_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `receipt_number` varchar(50) NOT NULL,
  `issue_date` date NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `printed_by` int(11) DEFAULT NULL,
  `printed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `is_system` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_details`
--

DROP TABLE IF EXISTS `salary_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'SAR',
  `housing_allowance` decimal(15,2) DEFAULT 0.00,
  `transport_allowance` decimal(15,2) DEFAULT 0.00,
  `food_allowance` decimal(15,2) DEFAULT 0.00,
  `phone_allowance` decimal(15,2) DEFAULT 0.00,
  `other_allowances` decimal(15,2) DEFAULT 0.00,
  `total_salary` decimal(15,2) DEFAULT NULL,
  `payment_method` enum('bank_transfer','cash','check') DEFAULT 'bank_transfer',
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `iban` varchar(50) DEFAULT NULL,
  `effective_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_details`
--

LOCK TABLES `salary_details` WRITE;
/*!40000 ALTER TABLE `salary_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `salary_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_grades`
--

DROP TABLE IF EXISTS `salary_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `min_salary` decimal(15,2) DEFAULT NULL,
  `max_salary` decimal(15,2) DEFAULT NULL,
  `housing_allowance_pct` decimal(5,2) DEFAULT 0.00,
  `transport_allowance` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_grades`
--

LOCK TABLES `salary_grades` WRITE;
/*!40000 ALTER TABLE `salary_grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `salary_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensors`
--

DROP TABLE IF EXISTS `sensors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `type` enum('voltage','current','power','frequency','temperature','humidity','pressure','flow','level','speed','vibration') NOT NULL,
  `unit` varchar(20) NOT NULL,
  `min_value` decimal(15,4) DEFAULT NULL,
  `max_value` decimal(15,4) DEFAULT NULL,
  `warning_low` decimal(15,4) DEFAULT NULL,
  `warning_high` decimal(15,4) DEFAULT NULL,
  `critical_low` decimal(15,4) DEFAULT NULL,
  `critical_high` decimal(15,4) DEFAULT NULL,
  `current_value` decimal(15,4) DEFAULT NULL,
  `last_reading_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('active','inactive','faulty') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensors`
--

LOCK TABLES `sensors` WRITE;
/*!40000 ALTER TABLE `sensors` DISABLE KEYS */;
/*!40000 ALTER TABLE `sensors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequences`
--

DROP TABLE IF EXISTS `sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `prefix` varchar(20) DEFAULT NULL,
  `suffix` varchar(20) DEFAULT NULL,
  `current_value` int(11) DEFAULT 0,
  `min_digits` int(11) DEFAULT 6,
  `reset_period` enum('never','yearly','monthly') DEFAULT 'never',
  `last_reset_date` date DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequences`
--

LOCK TABLES `sequences` WRITE;
/*!40000 ALTER TABLE `sequences` DISABLE KEYS */;
/*!40000 ALTER TABLE `sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` mediumtext DEFAULT NULL,
  `value_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` mediumtext DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settlement_items`
--

DROP TABLE IF EXISTS `settlement_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlement_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `settlement_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `operations_count` int(11) DEFAULT 0,
  `base_amount` decimal(12,2) DEFAULT 0.00,
  `bonuses` decimal(12,2) DEFAULT 0.00,
  `deductions` decimal(12,2) DEFAULT 0.00,
  `net_amount` decimal(12,2) DEFAULT 0.00,
  `payment_method` enum('cash','bank_transfer','check') DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlement_items`
--

LOCK TABLES `settlement_items` WRITE;
/*!40000 ALTER TABLE `settlement_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `settlement_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `squares`
--

DROP TABLE IF EXISTS `squares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `squares` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `squares`
--

LOCK TABLES `squares` WRITE;
/*!40000 ALTER TABLE `squares` DISABLE KEYS */;
/*!40000 ALTER TABLE `squares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `station_diesel_config`
--

DROP TABLE IF EXISTS `station_diesel_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `station_diesel_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `has_intake_pump` tinyint(1) DEFAULT 0,
  `has_output_pump` tinyint(1) DEFAULT 0,
  `intake_pump_has_meter` tinyint(1) DEFAULT 0,
  `output_pump_has_meter` tinyint(1) DEFAULT 0,
  `notes` mediumtext DEFAULT NULL,
  `configured_by` int(11) DEFAULT NULL,
  `configured_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `station_diesel_config_station_id_unique` (`station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `station_diesel_config`
--

LOCK TABLES `station_diesel_config` WRITE;
/*!40000 ALTER TABLE `station_diesel_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `station_diesel_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `station_diesel_path`
--

DROP TABLE IF EXISTS `station_diesel_path`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `station_diesel_path` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_id` int(11) NOT NULL,
  `sequence_order` int(11) NOT NULL,
  `element_type` enum('receiving_tank','pipe','intake_pump','main_tank','pre_output_tank','output_pump','generator_tank') NOT NULL,
  `tank_id` int(11) DEFAULT NULL,
  `pump_id` int(11) DEFAULT NULL,
  `pipe_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `station_diesel_path`
--

LOCK TABLES `station_diesel_path` WRITE;
/*!40000 ALTER TABLE `station_diesel_path` DISABLE KEYS */;
/*!40000 ALTER TABLE `station_diesel_path` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stations`
--

DROP TABLE IF EXISTS `stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `type` enum('generation','transmission','distribution','substation','solar','wind','hydro','thermal','nuclear','storage') NOT NULL,
  `status` enum('operational','maintenance','offline','construction','decommissioned') DEFAULT 'operational',
  `capacity` decimal(15,2) DEFAULT NULL,
  `capacity_unit` varchar(20) DEFAULT 'MW',
  `voltage_level` varchar(50) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `commission_date` date DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `metadata` longtext DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stations`
--

LOCK TABLES `stations` WRITE;
/*!40000 ALTER TABLE `stations` DISABLE KEYS */;
/*!40000 ALTER TABLE `stations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_balances`
--

DROP TABLE IF EXISTS `stock_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `quantity` decimal(15,3) DEFAULT 0.000,
  `reserved_qty` decimal(15,3) DEFAULT 0.000,
  `available_qty` decimal(15,3) DEFAULT 0.000,
  `average_cost` decimal(18,4) DEFAULT 0.0000,
  `total_value` decimal(18,2) DEFAULT 0.00,
  `last_movement_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_balances`
--

LOCK TABLES `stock_balances` WRITE;
/*!40000 ALTER TABLE `stock_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `movement_type` enum('receipt','issue','transfer_in','transfer_out','adjustment_in','adjustment_out','return','scrap') NOT NULL,
  `movement_date` datetime NOT NULL,
  `document_type` varchar(50) DEFAULT NULL,
  `document_id` int(11) DEFAULT NULL,
  `document_number` varchar(50) DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_cost` decimal(18,4) DEFAULT NULL,
  `total_cost` decimal(18,2) DEFAULT NULL,
  `balance_before` decimal(15,3) DEFAULT NULL,
  `balance_after` decimal(15,3) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `type` enum('manufacturer','distributor','contractor','service_provider') DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `tax_number` varchar(50) DEFAULT NULL,
  `payment_terms` int(11) DEFAULT 30,
  `credit_limit` decimal(18,2) DEFAULT NULL,
  `current_balance` decimal(18,2) DEFAULT 0.00,
  `account_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_events`
--

DROP TABLE IF EXISTS `system_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_source` varchar(50) NOT NULL,
  `aggregate_type` varchar(50) DEFAULT NULL,
  `aggregate_id` int(11) DEFAULT NULL,
  `payload` longtext NOT NULL CHECK (json_valid(`payload`)),
  `metadata` longtext DEFAULT NULL CHECK (json_valid(`metadata`)),
  `correlation_id` varchar(100) DEFAULT NULL,
  `causation_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `processed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `error_message` mediumtext DEFAULT NULL,
  `retry_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_events`
--

LOCK TABLES `system_events` WRITE;
/*!40000 ALTER TABLE `system_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tariffs`
--

DROP TABLE IF EXISTS `tariffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tariffs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `tariff_type` enum('standard','custom','promotional','contract') DEFAULT 'standard',
  `service_type` enum('electricity','water','gas') DEFAULT 'electricity',
  `slabs` longtext DEFAULT NULL CHECK (json_valid(`slabs`)),
  `fixed_charge` decimal(18,2) DEFAULT 0.00,
  `vat_rate` decimal(5,2) DEFAULT 15.00,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tariffs`
--

LOCK TABLES `tariffs` WRITE;
/*!40000 ALTER TABLE `tariffs` DISABLE KEYS */;
/*!40000 ALTER TABLE `tariffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technical_alert_rules`
--

DROP TABLE IF EXISTS `technical_alert_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technical_alert_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name_ar` varchar(200) NOT NULL,
  `name_en` varchar(200) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `category` enum('performance','security','availability','integration','database','api','system') NOT NULL,
  `severity` enum('info','warning','error','critical') DEFAULT 'warning',
  `condition` longtext NOT NULL CHECK (json_valid(`condition`)),
  `threshold` decimal(15,4) DEFAULT NULL,
  `comparison_operator` enum('gt','gte','lt','lte','eq','neq') DEFAULT NULL,
  `evaluation_period_minutes` int(11) DEFAULT 5,
  `cooldown_minutes` int(11) DEFAULT 15,
  `notification_channels` longtext DEFAULT NULL CHECK (json_valid(`notification_channels`)),
  `escalation_rules` longtext DEFAULT NULL CHECK (json_valid(`escalation_rules`)),
  `auto_resolve` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technical_alert_rules`
--

LOCK TABLES `technical_alert_rules` WRITE;
/*!40000 ALTER TABLE `technical_alert_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `technical_alert_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technical_alerts`
--

DROP TABLE IF EXISTS `technical_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technical_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rule_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `alert_type` varchar(50) NOT NULL,
  `severity` enum('info','warning','error','critical') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `source_id` varchar(100) DEFAULT NULL,
  `current_value` decimal(15,4) DEFAULT NULL,
  `threshold_value` decimal(15,4) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `status` enum('active','acknowledged','resolved','suppressed') DEFAULT 'active',
  `acknowledged_by` int(11) DEFAULT NULL,
  `acknowledged_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `resolution_notes` text DEFAULT NULL,
  `notifications_sent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notifications_sent`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technical_alerts`
--

LOCK TABLES `technical_alerts` WRITE;
/*!40000 ALTER TABLE `technical_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `technical_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `business_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `name` mediumtext DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `loginMethod` varchar(64) DEFAULT NULL,
  `role` enum('user','admin','super_admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lastSignedIn` timestamp NOT NULL DEFAULT current_timestamp(),
  `employee_id` varchar(20) DEFAULT NULL,
  `name_ar` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `avatar` mediumtext DEFAULT NULL,
  `business_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB AUTO_INCREMENT=2970 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'local_0500000000_1766953967433','مدير النظام',NULL,'local','super_admin','2025-12-28 20:32:47','2026-01-02 07:23:48','2026-01-02 04:23:48',NULL,NULL,'0500000000',NULL,1,NULL,NULL,NULL,NULL,1,'$2b$10$TPGClz03LlHMJMJ40p1rtewYd55NdOsmPCDBWMtZyZVRiN1ZvoG4q'),(2,'demo_user_001','مستخدم تجريبي',NULL,'demo','super_admin','2025-12-28 20:38:41','2025-12-31 19:08:11','2025-12-31 16:08:11',NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,1,'$2b$10$TPGClz03LlHMJMJ40p1rtewYd55NdOsmPCDBWMtZyZVRiN1ZvoG4q');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `type` enum('main','spare_parts','consumables','transit','quarantine') DEFAULT 'main',
  `address` mediumtext DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_order_tasks`
--

DROP TABLE IF EXISTS `work_order_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_order_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `work_order_id` int(11) NOT NULL,
  `task_number` int(11) NOT NULL,
  `description` mediumtext NOT NULL,
  `status` enum('pending','in_progress','completed','skipped') DEFAULT 'pending',
  `assigned_to` int(11) DEFAULT NULL,
  `estimated_hours` decimal(8,2) DEFAULT NULL,
  `actual_hours` decimal(8,2) DEFAULT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_order_tasks`
--

LOCK TABLES `work_order_tasks` WRITE;
/*!40000 ALTER TABLE `work_order_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_order_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_orders`
--

DROP TABLE IF EXISTS `work_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `type` enum('preventive','corrective','emergency','inspection','calibration') NOT NULL,
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `status` enum('draft','pending','approved','assigned','in_progress','on_hold','completed','cancelled','closed') DEFAULT 'draft',
  `asset_id` int(11) DEFAULT NULL,
  `equipment_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `requested_by` int(11) DEFAULT NULL,
  `requested_date` datetime DEFAULT NULL,
  `scheduled_start` datetime DEFAULT NULL,
  `scheduled_end` datetime DEFAULT NULL,
  `actual_start` datetime DEFAULT NULL,
  `actual_end` datetime DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `estimated_hours` decimal(8,2) DEFAULT NULL,
  `actual_hours` decimal(8,2) DEFAULT NULL,
  `estimated_cost` decimal(18,2) DEFAULT NULL,
  `actual_cost` decimal(18,2) DEFAULT NULL,
  `labor_cost` decimal(18,2) DEFAULT NULL,
  `parts_cost` decimal(18,2) DEFAULT NULL,
  `completion_notes` text DEFAULT NULL,
  `failure_code` varchar(50) DEFAULT NULL,
  `root_cause` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `closed_by` int(11) DEFAULT NULL,
  `closed_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_orders`
--

LOCK TABLES `work_orders` WRITE;
/*!40000 ALTER TABLE `work_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker_incentives`
--

DROP TABLE IF EXISTS `worker_incentives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker_incentives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `worker_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `incentive_type` enum('bonus','commission','penalty','allowance') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `status` enum('pending','approved','paid','cancelled') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paid_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_incentives`
--

LOCK TABLES `worker_incentives` WRITE;
/*!40000 ALTER TABLE `worker_incentives` DISABLE KEYS */;
/*!40000 ALTER TABLE `worker_incentives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker_locations`
--

DROP TABLE IF EXISTS `worker_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker_locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `worker_id` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `accuracy` decimal(10,2) DEFAULT NULL,
  `speed` decimal(10,2) DEFAULT NULL,
  `heading` decimal(5,2) DEFAULT NULL,
  `altitude` decimal(10,2) DEFAULT NULL,
  `battery_level` int(11) DEFAULT NULL,
  `is_moving` tinyint(1) DEFAULT 0,
  `operation_id` int(11) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_locations`
--

LOCK TABLES `worker_locations` WRITE;
/*!40000 ALTER TABLE `worker_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `worker_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker_performance`
--

DROP TABLE IF EXISTS `worker_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker_performance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `worker_id` int(11) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `total_operations` int(11) DEFAULT 0,
  `completed_operations` int(11) DEFAULT 0,
  `on_time_operations` int(11) DEFAULT 0,
  `avg_completion_time` decimal(10,2) DEFAULT NULL,
  `customer_rating` decimal(3,2) DEFAULT NULL,
  `quality_score` decimal(5,2) DEFAULT NULL,
  `attendance_rate` decimal(5,2) DEFAULT NULL,
  `notes` mediumtext DEFAULT NULL,
  `evaluated_by` int(11) DEFAULT NULL,
  `evaluated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_performance`
--

LOCK TABLES `worker_performance` WRITE;
/*!40000 ALTER TABLE `worker_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `worker_performance` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-02 11:21:55
