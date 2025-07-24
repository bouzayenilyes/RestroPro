-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: restropro_saas
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `phone` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `is_member` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` int NOT NULL,
  PRIMARY KEY (`phone`,`tenant_id`),
  KEY `customers_ibfk_1` (`tenant_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exchange_rates`
--

DROP TABLE IF EXISTS `exchange_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exchange_rates` (
  `currency_code` varchar(5) NOT NULL,
  `rate_to_usd` decimal(10,6) DEFAULT NULL,
  PRIMARY KEY (`currency_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


INSERT INTO `exchange_rates` VALUES ('AED',0.272294),('AFN',0.011605),('ALL',0.009282),('AMD',0.002597),('ANG',0.558778),('AOA',0.001781),('ARS',0.005990),('AUD',0.642500),('BBD',0.499491),('BDT',0.009529),('BGN',0.546679),('BHD',2.659832),('BIF',0.000534),('BMD',1.000000),('BND',0.728092),('BOB',0.144319),('BRL',0.199698),('BSD',1.000000),('BTN',0.012350),('BWP',0.074960),('BYN',0.382052),('BZD',0.499491),('CAD',0.751200),('CDF',0.000478),('CHF',1.130100),('CLP',0.001261),('CNY',0.138800),('COP',0.000254),('CRC',0.001787),('CUP',0.039418),('CVE',0.009850),('CZK',0.044845),('DJF',0.005663),('DKK',0.151189),('DOP',0.017578),('DZD',0.007337),('EGP',0.032837),('ERN',0.066673),('ETB',0.018990),('EUR',1.083500),('FJD',0.455470),('FKP',1.213880),('GBP',1.271600),('GEL',0.378442),('GHS',0.084208),('GMD',0.019555),('GNF',0.000092),('GTQ',0.128165),('GYD',0.004752),('HNL',0.040623),('HRK',0.144318),('HTG',0.009611),('HUF',0.002940),('IDR',0.000065),('ILS',0.277613),('INR',0.012200),('IQD',0.000685),('IRR',0.000023),('ISK',0.007390),('JMD',0.006605),('JPY',0.006745),('KES',0.006915),('KGS',0.011845),('KHR',0.000025),('KID',0.642500),('KMF',0.002263),('KRW',0.000752),('KWD',3.290740),('KYD',1.202783),('KZT',0.002167),('LAK',0.000053),('LBP',0.000660),('LKR',0.003028),('LRD',0.053222),('LSL',0.051787),('LYD',0.217060),('MAD',0.097896),('MDL',0.055085),('MGA',0.000209),('MKD',0.020469),('MMK',0.000473),('MNT',0.000268),('MOP',0.124596),('MRO',0.002820),('MUR',0.022677),('MVR',0.064782),('MWK',0.001282),('MXN',0.055600),('MYR',0.215823),('MZN',0.015904),('NAD',0.051787),('NGN',0.002164),('NIO',0.027879),('NOK',0.093181),('NPR',0.009551),('NZD',0.601468),('OMR',2.600228),('PAB',1.000000),('PEN',0.269066),('PGK',0.284833),('PHP',0.018072),('PKR',0.003489),('PLN',0.260738),('PYG',0.000141),('QAR',0.274604),('RON',0.222891),('RSD',0.009238),('RUB',0.010352),('RWF',0.000912),('SAR',0.266697),('SBD',0.124509),('SCR',0.061233),('SDG',0.002093),('SEK',0.091820),('SGD',0.728092),('SHP',1.213880),('SLL',0.000052),('SOS',0.001761),('SRD',0.050451),('SSP',0.005547),('STN',0.046463),('SYP',0.001880),('SZL',0.051787),('THB',0.028871),('TJS',0.088342),('TMT',0.285969),('TND',0.330593),('TOP',0.437072),('TRY',0.037168),('TTD',0.148161),('TWD',0.031336),('TZS',0.000409),('UAH',0.027422),('UGX',0.000264),('USD',1.000000),('UYU',0.026892),('UZS',0.000094),('VES',0.034453),('VND',0.000042),('VUV',0.008731),('WST',0.384982),('XAF',0.001648),('XAG',22.120000),('XAU',1955.410000),('XCD',0.370129),('XDR',1.411709),('XOF',0.001648),('XPF',0.009390),('YER',0.003947),('ZAR',0.051787),('ZMW',0.037858),('ZWL',0.011788);

--
-- Table structure for table `invoice_sequences`
--

DROP TABLE IF EXISTS `invoice_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_sequences` (
  `tenant_id` int NOT NULL,
  `sequence_no` int DEFAULT NULL,
  PRIMARY KEY (`tenant_id`),
  CONSTRAINT `invoice_sequences_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `sub_total` decimal(10,2) DEFAULT NULL,
  `tax_total` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `payment_type_id` int DEFAULT NULL,
  `tenant_id` int NOT NULL,
  PRIMARY KEY (`id`,`tenant_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu_item_addons`
--

DROP TABLE IF EXISTS `menu_item_addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_item_addons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`,`item_id`),
  KEY `fk_menu_item_idx` (`item_id`),
  KEY `fk_menu_item_idx_index` (`item_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `fk_addon_menu_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `menu_item_addons_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu_item_variants`
--

DROP TABLE IF EXISTS `menu_item_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_item_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`,`item_id`),
  KEY `fk_variant_menu_item_id_idx` (`item_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `fk_variant_menu_item_id` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `menu_item_variants_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `net_price` decimal(10,2) DEFAULT NULL,
  `tax_id` int DEFAULT NULL,
  `image` varchar(2000) DEFAULT NULL,
  `category` int DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `status` enum('created','preparing','completed','cancelled','delivered') DEFAULT 'created',
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` varchar(255) DEFAULT NULL,
  `addons` mediumtext,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenantId_idx` (`tenant_id`),
  CONSTRAINT `tenantId` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `delivery_type` varchar(90) DEFAULT NULL,
  `customer_type` enum('WALKIN','CUSTOMER') DEFAULT 'WALKIN',
  `customer_id` varchar(20) DEFAULT NULL,
  `table_id` int DEFAULT NULL,
  `status` enum('created','completed','cancelled') DEFAULT 'created',
  `token_no` int DEFAULT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `invoice_id` int DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_types`
--

DROP TABLE IF EXISTS `payment_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `payment_types_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `print_settings`
--

DROP TABLE IF EXISTS `print_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `print_settings` (
  `tenant_id` int NOT NULL,
  `page_format` varchar(5) DEFAULT NULL,
  `header` varchar(2000) DEFAULT NULL,
  `footer` varchar(2000) DEFAULT NULL,
  `show_notes` tinyint(1) DEFAULT NULL,
  `is_enable_print` tinyint(1) DEFAULT NULL,
  `show_store_details` tinyint(1) DEFAULT NULL,
  `show_customer_details` tinyint(1) DEFAULT NULL,
  `print_token` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`tenant_id`),
  CONSTRAINT `ps_tenantid_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `qr_order_items`
--

DROP TABLE IF EXISTS `qr_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `status` enum('created','preparing','completed','cancelled','delivered') DEFAULT 'created',
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` varchar(255) DEFAULT NULL,
  `addons` mediumtext,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenantId_idx` (`tenant_id`),
  KEY `qr_oi_tenantIdx_idx` (`tenant_id`),
  CONSTRAINT `qr_oi_tenantIdx` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `qr_orders`
--

DROP TABLE IF EXISTS `qr_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `delivery_type` varchar(90) DEFAULT NULL,
  `customer_type` enum('WALKIN','CUSTOMER') DEFAULT 'WALKIN',
  `customer_id` varchar(20) DEFAULT NULL,
  `table_id` int DEFAULT NULL,
  `status` enum('created','completed','cancelled') DEFAULT 'created',
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id_idx` (`tenant_id`),
  CONSTRAINT `tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `refresh_token` varchar(500) NOT NULL,
  `device_ip` varchar(50) DEFAULT NULL,
  `device_name` varchar(255) DEFAULT NULL,
  `device_location` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `expiry` datetime DEFAULT NULL,
  `device_id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`device_id`,`username`,`refresh_token`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(20) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `table_id` int DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `people_count` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `unique_code` varchar(20) DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug_index` (`unique_code`) USING BTREE,
  KEY `INDEX` (`date`) USING BTREE,
  KEY `INDEX_CUSTOMER_SEARCH` (`customer_id`) USING BTREE,
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reset_password_tokens`
--

DROP TABLE IF EXISTS `reset_password_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reset_password_tokens` (
  `username` varchar(255) NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feedbacks`
--

CREATE TABLE feedbacks (
  id int NOT NULL AUTO_INCREMENT,
  invoice_id int DEFAULT NULL,
  phone varchar(20) DEFAULT NULL,
  date datetime DEFAULT CURRENT_TIMESTAMP,
  created_by varchar(255) DEFAULT NULL,
  average_rating double(10,2) DEFAULT NULL,
  food_quality_rating double(10,2) DEFAULT NULL,
  service_rating double(10,2) DEFAULT NULL,
  staff_behavior_rating double(10,2) DEFAULT NULL,
  ambiance_rating double(10,2) DEFAULT NULL,
  recommend_rating double(10,2) DEFAULT NULL,
  remarks mediumtext,
  tenant_id int DEFAULT NULL,
  PRIMARY KEY (id),
  KEY tenant_id (tenant_id),
  KEY invoice_id (invoice_id,tenant_id),
  CONSTRAINT feedbacks_ibfk_3 FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT feedbacks_ibfk_4 FOREIGN KEY (invoice_id, tenant_id) REFERENCES invoices (id, tenant_id) ON DELETE CASCADE ON UPDATE CASCADE
)

--
-- Table structure for table `store_details`
--

DROP TABLE IF EXISTS `store_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_details` (
  `store_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `store_image` varchar(2000) DEFAULT NULL,
  `unique_id` varchar(255) DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  `is_qr_menu_enabled` tinyint(1) DEFAULT '0',
  `unique_qr_code` varchar(255) DEFAULT NULL,
  `is_qr_order_enabled` tinyint(1) DEFAULT NULL,
  `is_feedback_enabled` tinyint(1) DEFAULT '0',
  UNIQUE KEY `tenant_id_pk` (`tenant_id`) USING BTREE,
  CONSTRAINT `store_details_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `store_tables`
--

DROP TABLE IF EXISTS `store_tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_tables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_title` varchar(100) DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `seating_capacity` smallint DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `store_tables_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_history`
--

DROP TABLE IF EXISTS `subscription_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `starts_on` datetime DEFAULT NULL,
  `expires_on` datetime DEFAULT NULL,
  `status` enum('updated','created','cancelled') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `subscription_history_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `superadmins`
--

DROP TABLE IF EXISTS `superadmins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `superadmins` (
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxes`
--

DROP TABLE IF EXISTS `taxes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taxes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) DEFAULT NULL,
  `rate` double DEFAULT NULL,
  `type` enum('inclusive','exclusive','other') DEFAULT 'other',
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `taxes_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(95) DEFAULT NULL,
  `is_active` tinyint DEFAULT NULL,
  `subscription_id` varchar(255) DEFAULT NULL,
  `payment_customer_id` varchar(255) DEFAULT NULL,
  `subscription_start` datetime DEFAULT NULL,
  `subscription_end` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `token_sequences`
--

DROP TABLE IF EXISTS `token_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_sequences` (
  `tenant_id` int NOT NULL,
  `sequence_no` int DEFAULT NULL,
  `last_updated` date DEFAULT NULL,
  PRIMARY KEY (`tenant_id`),
  CONSTRAINT `token_sequences_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(95) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `photo` varchar(2000) DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `scope` varchar(2000) DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`username`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-07 23:04:44
