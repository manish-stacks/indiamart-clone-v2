-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 23, 2026 at 02:00 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `indiamart_marketplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `detailsJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detailsJson`)),
  `ipAddress` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `legalName` varchar(191) DEFAULT NULL,
  `gstin` varchar(191) DEFAULT NULL,
  `businessType` enum('MANUFACTURER','WHOLESALER','DISTRIBUTOR','EXPORTER','IMPORTER','SERVICE_PROVIDER','RETAILER') NOT NULL DEFAULT 'MANUFACTURER',
  `verificationStatus` enum('PENDING','UNDER_REVIEW','VERIFIED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  `description` text DEFAULT NULL,
  `logoUrl` varchar(191) DEFAULT NULL,
  `bannerUrl` varchar(191) DEFAULT NULL,
  `yearEstablished` int(11) DEFAULT NULL,
  `trustScore` decimal(3,2) NOT NULL DEFAULT 4.50,
  `responseTimeHours` int(11) NOT NULL DEFAULT 4,
  `gstinVerified` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `businesses`
--

INSERT INTO `businesses` (`id`, `name`, `slug`, `legalName`, `gstin`, `businessType`, `verificationStatus`, `description`, `logoUrl`, `bannerUrl`, `yearEstablished`, `trustScore`, `responseTimeHours`, `gstinVerified`, `createdAt`, `updatedAt`) VALUES
('7ab3dde5-3812-4c30-8b2d-2ffa242d9304', 'Surat Tex Fabric Mills (Demo)', 'surat-tex-fabric-mills', 'Surat Tex Fabric Mills LLP', '24AAACS5678B1Z2', 'MANUFACTURER', 'VERIFIED', 'Direct manufacturer and wholesale bulk supplier of pure organic combed cotton fabrics, polyester yarn, and export-grade textiles.', NULL, NULL, 2014, 4.70, 3, 1, '2026-10-21 07:29:32.295', '2026-10-21 07:29:32.295'),
('e95065e6-29b4-4c88-a60f-a637cd466db6', 'Apex Machinery & Automation Ltd (Demo)', 'apex-machinery-automation', 'Apex Machinery & Automation Private Limited', '24AAACA1234A1Z5', 'MANUFACTURER', 'VERIFIED', 'ISO 9001:2015 certified manufacturer of high precision CNC lathes, industrial milling machines, and automated packaging equipment.', NULL, NULL, 2010, 4.80, 2, 1, '2026-10-21 07:29:32.284', '2026-10-21 07:29:32.284');

-- --------------------------------------------------------

--
-- Table structure for table `business_addresses`
--

CREATE TABLE `business_addresses` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `street` varchar(191) NOT NULL,
  `city` varchar(191) NOT NULL,
  `state` varchar(191) NOT NULL,
  `postalCode` varchar(191) NOT NULL,
  `country` varchar(191) NOT NULL DEFAULT 'India',
  `isPrimary` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_addresses`
--

INSERT INTO `business_addresses` (`id`, `businessId`, `street`, `city`, `state`, `postalCode`, `country`, `isPrimary`, `createdAt`) VALUES
('91fb5643-1fc1-42cb-870d-50da0f2df30d', 'e95065e6-29b4-4c88-a60f-a637cd466db6', 'Plot No. 42, GIDC Industrial Estate, Vatva', 'Ahmedabad', 'Gujarat', '382445', 'India', 1, '2026-10-21 07:29:32.284'),
('964b0588-684e-40a2-8c92-52cb29aa1422', '7ab3dde5-3812-4c30-8b2d-2ffa242d9304', 'Ring Road Textile Market, Salabatpura', 'Surat', 'Gujarat', '395002', 'India', 1, '2026-10-21 07:29:32.295');

-- --------------------------------------------------------

--
-- Table structure for table `business_documents`
--

CREATE TABLE `business_documents` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `docType` varchar(191) NOT NULL,
  `fileUrl` varchar(191) NOT NULL,
  `status` enum('PENDING','UNDER_REVIEW','VERIFIED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  `verifiedAt` datetime(3) DEFAULT NULL,
  `rejectionReason` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `business_members`
--

CREATE TABLE `business_members` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `role` enum('OWNER','MANAGER','STAFF') NOT NULL DEFAULT 'STAFF',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_members`
--

INSERT INTO `business_members` (`id`, `businessId`, `userId`, `role`, `createdAt`) VALUES
('3331b823-7712-43f1-9363-3debde6bfbc4', '7ab3dde5-3812-4c30-8b2d-2ffa242d9304', '9ca9e103-bda6-475d-a2be-7d8e539fff5e', 'OWNER', '2026-10-21 07:29:32.295'),
('6b443cc0-5bb9-4cd7-9305-bf339d3bf459', 'e95065e6-29b4-4c88-a60f-a637cd466db6', '8f71e955-9a5a-4a54-ad53-08738923d0af', 'OWNER', '2026-10-21 07:29:32.284');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `sessionId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` varchar(191) NOT NULL,
  `cartId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unitPrice` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `displayOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `imageUrl`, `icon`, `parentId`, `displayOrder`, `createdAt`) VALUES
('033ba82e-4774-45c0-8657-2866a636f65c', 'Industrial Machinery & Plants', 'industrial-machinery', 'CNC machines, lathes, pumps, packaging and food processing plants.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', 'Cpu', NULL, 1, '2026-10-21 07:29:32.300'),
('63afb454-1f5f-4a47-954a-c21f1a546f33', 'Textiles, Fabrics & Yarns', 'textiles-fabrics', 'Cotton fabrics, industrial yarns, garment raw materials, and apparel.', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80', 'Shirt', NULL, 2, '2026-10-21 07:29:32.309'),
('89a6acf2-0bc0-439f-a6cf-e9af8af5fe8d', 'Cotton Fabrics & Twill', 'cotton-fabrics', 'Pure organic cotton, twill, canvas, and woven fabrics.', NULL, NULL, '63afb454-1f5f-4a47-954a-c21f1a546f33', 1, '2026-10-21 07:29:32.311'),
('9dc7ba59-8aad-40aa-a9aa-37aaedfd8329', 'CNC & Lathe Machines', 'cnc-lathe-machines', 'Computer Numerical Control lathes, turning centers, and milling equipment.', NULL, NULL, '033ba82e-4774-45c0-8657-2866a636f65c', 1, '2026-10-21 07:29:32.304'),
('acf547ac-8d88-4259-81f2-2f24aac79aa6', 'Packaging & Strapping Machines', 'packaging-machinery', 'Automatic and semi-automatic cartooning and strapping equipment.', NULL, NULL, '033ba82e-4774-45c0-8657-2866a636f65c', 2, '2026-10-21 07:29:32.307'),
('bb0294b9-0392-4603-949a-7dfa2022f705', 'Electrical, Power & Electronics', 'electrical-electronics', 'Transformers, switchgears, industrial lighting, and automation control panels.', 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&auto=format&fit=crop&q=80', 'Zap', NULL, 3, '2026-10-21 07:29:32.315'),
('e1e39cf6-c5bf-4aff-9c43-1bddf5b5891e', 'Industrial Yarns & Threads', 'industrial-yarns', 'Polyester filament yarns, cotton threads, and high-tenacity yarn.', NULL, NULL, '63afb454-1f5f-4a47-954a-c21f1a546f33', 2, '2026-10-21 07:29:32.313');

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` varchar(191) NOT NULL,
  `inquiryId` varchar(191) DEFAULT NULL,
  `businessId` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `inquiryId`, `businessId`, `buyerId`, `productId`, `createdAt`, `updatedAt`) VALUES
('144bc701-a077-4ebc-afe1-0845c5c9f34e', '6440cb8c-4bcb-4f40-91fb-f180fad1297d', 'e95065e6-29b4-4c88-a60f-a637cd466db6', '5a37c4bc-180d-4e2f-8229-f75571331d0b', 'a4f2e260-bc22-4364-b021-f33e7aaf0199', '2026-10-23 10:34:36.427', '2026-10-23 10:50:32.902');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `requirementId` varchar(191) DEFAULT NULL,
  `message` text NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unitOfMeasure` enum('PIECE','BOX','CARTON','TON','KG','GRAM','METER','SQUARE_METER','LITRE','SET','PACK','HOUR') NOT NULL DEFAULT 'PIECE',
  `status` enum('NEW','CONTACTED','QUOTED','WON','LOST') NOT NULL DEFAULT 'NEW',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `buyerId`, `businessId`, `productId`, `requirementId`, `message`, `quantity`, `unitOfMeasure`, `status`, `createdAt`, `updatedAt`) VALUES
('386df41a-74cf-45cd-a13c-641b59e45dfd', '5a37c4bc-180d-4e2f-8229-f75571331d0b', 'e95065e6-29b4-4c88-a60f-a637cd466db6', 'a4f2e260-bc22-4364-b021-f33e7aaf0199', NULL, 'Need delivery timeline and installation support for CNC Lathe in Delhi', 1, 'PIECE', 'NEW', '2026-10-23 06:46:50.512', '2026-10-23 06:46:50.512'),
('5f88ebf6-e7e9-4d72-9d4e-a85505e03f6b', 'c4a0c5e1-8940-4193-9cd9-2fb5c1d41f22', '7ab3dde5-3812-4c30-8b2d-2ffa242d9304', 'e9815d08-b1a2-4e44-8d96-34b4ea3dbb1c', NULL, 'Please quote bulk price for 500 KG with delivery to Surat warehouse', 500, 'KG', 'NEW', '2026-10-23 06:44:55.933', '2026-10-23 06:44:55.933'),
('6440cb8c-4bcb-4f40-91fb-f180fad1297d', '5a37c4bc-180d-4e2f-8229-f75571331d0b', 'e95065e6-29b4-4c88-a60f-a637cd466db6', 'a4f2e260-bc22-4364-b021-f33e7aaf0199', NULL, 'Hello, I am interested in purchasing Heavy Duty CNC Lathe Machine 3000 RPM (Demo). Please send your best quotation including GST and delivery schedule to my location.', 1, 'PIECE', 'NEW', '2026-10-23 06:54:35.517', '2026-10-23 06:54:35.517');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `inquiryId` varchar(191) DEFAULT NULL,
  `buyerName` varchar(191) NOT NULL,
  `buyerPhone` varchar(191) DEFAULT NULL,
  `buyerEmail` varchar(191) DEFAULT NULL,
  `stage` enum('NEW','CONTACTED','QUALIFIED','QUOTATION_SENT','NEGOTIATION','WON','LOST') NOT NULL DEFAULT 'NEW',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `estimatedValue` decimal(12,2) DEFAULT NULL,
  `assignedToUserId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `businessId`, `inquiryId`, `buyerName`, `buyerPhone`, `buyerEmail`, `stage`, `priority`, `estimatedValue`, `assignedToUserId`, `createdAt`, `updatedAt`) VALUES
('639b15c9-dba8-4ae8-b4a9-69b11e57d4d5', 'e95065e6-29b4-4c88-a60f-a637cd466db6', '6440cb8c-4bcb-4f40-91fb-f180fad1297d', 'Rohit Sharma (Demo Procurement Buyer)', '+919811000003', 'buyer.delhi@demomarketplace.in', 'NEW', 'MEDIUM', 350000.00, NULL, '2026-10-23 06:54:35.520', '2026-10-23 06:54:35.520'),
('6be5b1b0-3205-4c22-b160-6b67cd182bba', 'e95065e6-29b4-4c88-a60f-a637cd466db6', '386df41a-74cf-45cd-a13c-641b59e45dfd', 'Rohit Sharma (Demo Procurement Buyer)', '+919811000003', 'buyer.delhi@demomarketplace.in', 'NEW', 'MEDIUM', 350000.00, NULL, '2026-10-23 06:46:50.513', '2026-10-23 06:46:50.513'),
('dfd81c24-994a-40b3-bcdf-763c4332f6b4', '7ab3dde5-3812-4c30-8b2d-2ffa242d9304', '5f88ebf6-e7e9-4d72-9d4e-a85505e03f6b', 'Anil Mehta', '+919825123456', 'anil.mehta@example.com', 'NEW', 'MEDIUM', 67500.00, NULL, '2026-10-23 06:44:55.936', '2026-10-23 06:44:55.936');

-- --------------------------------------------------------

--
-- Table structure for table `lead_notes`
--

CREATE TABLE `lead_notes` (
  `id` varchar(191) NOT NULL,
  `leadId` varchar(191) NOT NULL,
  `authorId` varchar(191) NOT NULL,
  `note` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(191) NOT NULL,
  `conversationId` varchar(191) NOT NULL,
  `senderId` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversationId`, `senderId`, `content`, `isRead`, `createdAt`) VALUES
('cbd7a7dd-4f1b-474b-b823-7705648ead5a', '144bc701-a077-4ebc-afe1-0845c5c9f34e', '5a37c4bc-180d-4e2f-8229-f75571331d0b', 'Can you share your latest product catalogue / brochure?', 0, '2026-10-23 10:50:32.893'),
('df2ea78b-b18a-4c7c-bcb4-23e947c100a3', '144bc701-a077-4ebc-afe1-0845c5c9f34e', '5a37c4bc-180d-4e2f-8229-f75571331d0b', 'Hello, what is the best wholesale price for 200 units delivered to Delhi NCR?', 1, '2026-10-23 10:34:36.440');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(191) NOT NULL,
  `orderNumber` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `status` enum('PENDING_PAYMENT','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURN_REQUESTED','RETURNED','REFUND_PENDING','REFUNDED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `totalAmount` decimal(12,2) NOT NULL,
  `shippingAddressJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`shippingAddressJson`)),
  `paymentStatus` enum('INITIATED','AUTHORIZED','CAPTURED','FAILED','REFUNDED','PARTIALLY_REFUNDED') NOT NULL DEFAULT 'INITIATED',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` decimal(12,2) NOT NULL,
  `totalPrice` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp_attempts`
--

CREATE TABLE `otp_attempts` (
  `id` varchar(191) NOT NULL,
  `recipient` varchar(191) NOT NULL,
  `otpHash` varchar(191) NOT NULL,
  `purpose` varchar(191) NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `isUsed` tinyint(1) NOT NULL DEFAULT 0,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `price_tiers`
--

CREATE TABLE `price_tiers` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `minQuantity` int(11) NOT NULL,
  `maxQuantity` int(11) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `price_tiers`
--

INSERT INTO `price_tiers` (`id`, `productId`, `minQuantity`, `maxQuantity`, `price`) VALUES
('31cd76ff-1ab7-48cc-ab4f-4bb2a068ef34', 'a4f2e260-bc22-4364-b021-f33e7aaf0199', 1, 2, 350000.00),
('50273f89-960f-4b08-9d25-ceda20d3eaf7', 'cc134440-e200-45f4-a224-a02e8ea63461', 100, 499, 165.00),
('521182fd-c712-4c8e-a812-641c1d51ff16', 'e9815d08-b1a2-4e44-8d96-34b4ea3dbb1c', 1000, NULL, 124.00),
('66226653-fb89-473f-b45f-17b8eed58e88', 'a4f2e260-bc22-4364-b021-f33e7aaf0199', 3, 5, 330000.00),
('69895859-575d-4cdd-8f0c-1f843cf59ee7', 'e9815d08-b1a2-4e44-8d96-34b4ea3dbb1c', 200, 999, 135.00),
('945f6857-0a1c-4591-b5d7-204608a3e65d', 'cc134440-e200-45f4-a224-a02e8ea63461', 2000, NULL, 140.00),
('a68c7a48-5ba0-4070-933e-bc63deead641', 'a4f2e260-bc22-4364-b021-f33e7aaf0199', 6, NULL, 310000.00),
('c7f6d6d8-16ad-4697-b065-44e1c82d2a3a', 'edcca1cc-5689-4e1d-8226-fcdf501145be', 5, NULL, 34500.00),
('ca413124-1aba-4d8c-a7d3-d0d97adbafc7', 'cc134440-e200-45f4-a224-a02e8ea63461', 500, 1999, 152.00),
('d820a4fc-9512-4277-80bb-b22949dd50bf', 'edcca1cc-5689-4e1d-8226-fcdf501145be', 1, 4, 38000.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('DRAFT','PENDING_APPROVAL','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `minOrderQuantity` int(11) NOT NULL DEFAULT 1,
  `unitOfMeasure` enum('PIECE','BOX','CARTON','TON','KG','GRAM','METER','SQUARE_METER','LITRE','SET','PACK','HOUR') NOT NULL DEFAULT 'PIECE',
  `unitPrice` decimal(12,2) NOT NULL,
  `isB2B` tinyint(1) NOT NULL DEFAULT 1,
  `isB2C` tinyint(1) NOT NULL DEFAULT 0,
  `sku` varchar(191) DEFAULT NULL,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `businessId`, `categoryId`, `name`, `slug`, `description`, `status`, `minOrderQuantity`, `unitOfMeasure`, `unitPrice`, `isB2B`, `isB2C`, `sku`, `specifications`, `createdAt`, `updatedAt`) VALUES
('a4f2e260-bc22-4364-b021-f33e7aaf0199', 'e95065e6-29b4-4c88-a60f-a637cd466db6', '9dc7ba59-8aad-40aa-a9aa-37aaedfd8329', 'Heavy Duty CNC Lathe Machine 3000 RPM (Demo)', 'heavy-duty-cnc-lathe-machine-3000-rpm', 'Industrial heavy duty CNC horizontal lathe machine designed for high speed precision metal turning. Equipped with Siemens 808D controller and 8-station hydraulic turret.', 'PUBLISHED', 1, 'PIECE', 350000.00, 1, 0, 'APEX-CNC-3000', '{\"Spindle Speed\":\"3000 RPM\",\"Max Turning Diameter\":\"400 mm\",\"Bed Type\":\"Slant Bed 45 Degree\",\"Control System\":\"Siemens 808D Advance\",\"Warranty\":\"2 Years Comprehensive\"}', '2026-10-21 07:29:32.318', '2026-10-21 07:29:32.318'),
('cc134440-e200-45f4-a224-a02e8ea63461', '7ab3dde5-3812-4c30-8b2d-2ffa242d9304', '89a6acf2-0bc0-439f-a6cf-e9af8af5fe8d', 'Pure Organic Combed Cotton Fabric 60s Count (Demo)', 'pure-organic-combed-cotton-fabric-60s', 'GOTS certified organic cotton woven fabric. High GSM, breathable, pre-shrunk, ideal for shirts, uniforms, and garment manufacturing.', 'PUBLISHED', 100, 'METER', 165.00, 1, 1, 'TEX-COT-60S', '{\"Yarn Count\":\"60s x 60s\",\"Weave\":\"Plain Weave\",\"GSM\":\"115 GSM\",\"Width\":\"58 Inches\",\"Color Fastness\":\"Grade 4+\"}', '2026-10-21 07:29:32.334', '2026-10-21 07:29:32.334'),
('e9815d08-b1a2-4e44-8d96-34b4ea3dbb1c', '7ab3dde5-3812-4c30-8b2d-2ffa242d9304', 'e1e39cf6-c5bf-4aff-9c43-1bddf5b5891e', 'Polyester Spun Filament Yarn 150D/48F Semi-Dull (Demo)', 'polyester-spun-filament-yarn-150d', 'High tenacity continuous filament polyester yarn. Uniform intermingle points, suitable for circular knitting and waterjet looms.', 'PUBLISHED', 200, 'KG', 135.00, 1, 0, 'TEX-YARN-150D', '{\"Denier\":\"150 Denier / 48 Filaments\",\"Lustre\":\"Semi-Dull (SD)\",\"Tenacity\":\"4.2 gpd\",\"Elongation\":\"26%\"}', '2026-10-21 07:29:32.337', '2026-10-21 07:29:32.337'),
('edcca1cc-5689-4e1d-8226-fcdf501145be', 'e95065e6-29b4-4c88-a60f-a637cd466db6', 'acf547ac-8d88-4259-81f2-2f24aac79aa6', 'Semi-Automatic Carton Box Strapping Machine (Demo)', 'semi-automatic-carton-strapping-machine', 'High speed table top strapping machine for corrugated packaging boxes. Cycle time 1.5 seconds per strap. Compatible with standard PP strapping rolls.', 'PUBLISHED', 1, 'PIECE', 38000.00, 1, 1, 'APEX-STRAP-740', '{\"Tension Range\":\"15 to 45 kg\",\"Strap Width\":\"6 mm - 15 mm\",\"Power Supply\":\"Single Phase 220V 50Hz\",\"Table Height\":\"750 mm\"}', '2026-10-21 07:29:32.328', '2026-10-21 07:29:32.328');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `altText` varchar(191) DEFAULT NULL,
  `displayOrder` int(11) NOT NULL DEFAULT 0,
  `isPrimary` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `productId`, `url`, `altText`, `displayOrder`, `isPrimary`) VALUES
('157f1766-8aae-4a1d-97ef-09873fa2ac05', 'edcca1cc-5689-4e1d-8226-fcdf501145be', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80', 'Semi-Automatic Box Strapping Machine', 0, 1),
('2951d3d1-cca5-4eac-be42-d83278bbedc1', 'e9815d08-b1a2-4e44-8d96-34b4ea3dbb1c', 'https://images.unsplash.com/photo-1598555230054-d8bc42f53448?w=800&auto=format&fit=crop&q=80', 'Polyester Spun Yarn', 0, 1),
('c80aad37-078a-4cb0-84fa-49be42bd0742', 'cc134440-e200-45f4-a224-a02e8ea63461', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80', 'Pure Organic Cotton Fabric', 0, 1),
('e4d84fba-e416-48b3-a889-cbdcc3b99628', 'a4f2e260-bc22-4364-b021-f33e7aaf0199', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', 'Heavy Duty CNC Lathe Machine', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` varchar(191) NOT NULL,
  `inquiryId` varchar(191) DEFAULT NULL,
  `businessId` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `quoteNumber` varchar(191) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `taxAmount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `shippingAmount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `totalAmount` decimal(12,2) NOT NULL,
  `paymentTerms` varchar(191) DEFAULT NULL,
  `validityDate` datetime(3) DEFAULT NULL,
  `status` enum('DRAFT','SENT','VIEWED','ACCEPTED','REJECTED','REVISED','EXPIRED') NOT NULL DEFAULT 'SENT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quotations`
--

INSERT INTO `quotations` (`id`, `inquiryId`, `businessId`, `buyerId`, `quoteNumber`, `subtotal`, `taxAmount`, `shippingAmount`, `totalAmount`, `paymentTerms`, `validityDate`, `status`, `createdAt`, `updatedAt`) VALUES
('a6c85695-b546-41b0-b243-f6dd8af02fae', NULL, 'e95065e6-29b4-4c88-a60f-a637cd466db6', '5a37c4bc-180d-4e2f-8229-f75571331d0b', 'QT-652959', 400000.00, 72000.00, 4500.00, 476500.00, '50% advance, balance on dispatch', '2026-11-12 09:10:52.959', 'ACCEPTED', '2026-10-23 09:10:52.960', '2026-10-23 09:10:52.999');

-- --------------------------------------------------------

--
-- Table structure for table `quotation_items`
--

CREATE TABLE `quotation_items` (
  `id` varchar(191) NOT NULL,
  `quotationId` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `description` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitOfMeasure` enum('PIECE','BOX','CARTON','TON','KG','GRAM','METER','SQUARE_METER','LITRE','SET','PACK','HOUR') NOT NULL DEFAULT 'PIECE',
  `unitPrice` decimal(12,2) NOT NULL,
  `totalAmount` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quotation_items`
--

INSERT INTO `quotation_items` (`id`, `quotationId`, `productId`, `description`, `quantity`, `unitOfMeasure`, `unitPrice`, `totalAmount`) VALUES
('42f9b41d-0e90-43fc-b370-6850e1f7aa79', 'a6c85695-b546-41b0-b243-f6dd8af02fae', NULL, 'High Speed Live Tooling Chuck Attachment', 2, 'SET', 25000.00, 50000.00),
('6848190f-c39b-4848-aa7a-94b6e03074a6', 'a6c85695-b546-41b0-b243-f6dd8af02fae', NULL, 'Heavy Duty CNC Lathe Machine 3000 RPM with Tooling Package', 1, 'PIECE', 350000.00, 350000.00);

-- --------------------------------------------------------

--
-- Table structure for table `requirements`
--

CREATE TABLE `requirements` (
  `id` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitOfMeasure` enum('PIECE','BOX','CARTON','TON','KG','GRAM','METER','SQUARE_METER','LITRE','SET','PACK','HOUR') NOT NULL DEFAULT 'PIECE',
  `targetPrice` decimal(12,2) DEFAULT NULL,
  `deliveryCity` varchar(191) NOT NULL,
  `deliveryState` varchar(191) NOT NULL,
  `status` enum('OPEN','UNDER_REVIEW','QUOTES_RECEIVED','MATCHED','CLOSED','EXPIRED') NOT NULL DEFAULT 'OPEN',
  `expiresAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `requirements`
--

INSERT INTO `requirements` (`id`, `buyerId`, `categoryId`, `title`, `description`, `quantity`, `unitOfMeasure`, `targetPrice`, `deliveryCity`, `deliveryState`, `status`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
('993afc1b-ba70-4600-9ca3-6584cb5e0773', '5a37c4bc-180d-4e2f-8229-f75571331d0b', '033ba82e-4774-45c0-8657-2866a636f65c', 'Urgent Requirement: 50 Sets High Precision Carbide End Mills', 'Need 4-flute solid carbide end mills with TiAlN coating for high hardness steel machining.', 50, 'SET', 45000.00, 'Delhi NCR', 'Delhi', 'OPEN', '2026-11-22 11:05:37.119', '2026-10-23 11:05:37.121', '2026-10-23 11:05:37.121');

-- --------------------------------------------------------

--
-- Table structure for table `requirement_responses`
--

CREATE TABLE `requirement_responses` (
  `id` varchar(191) NOT NULL,
  `requirementId` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `offeredPrice` decimal(12,2) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `requirement_responses`
--

INSERT INTO `requirement_responses` (`id`, `requirementId`, `businessId`, `message`, `offeredPrice`, `createdAt`) VALUES
('ca277f7d-8538-4a5b-8ce2-6e5775ecb73a', '993afc1b-ba70-4600-9ca3-6584cb5e0773', 'e95065e6-29b4-4c88-a60f-a637cd466db6', 'We can supply 50 sets of premium TiAlN carbide end mills ready for immediate dispatch from our Ahmedabad facility.', 42000.00, '2026-10-23 11:05:37.217');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `createdAt`) VALUES
('04dca84c-aa47-448b-9d5c-6da93157a6ac', 'ADMIN', 'Marketplace administrator', '2026-10-21 07:29:32.072'),
('151db667-1d77-4279-8b15-02c99c496009', 'FINANCE', 'Finance and payout operator', '2026-10-21 07:29:32.069'),
('26a2ff92-0563-4b68-bfc8-72ba96d1c6ce', 'SUPPORT', 'Customer support staff', '2026-10-21 07:29:32.064'),
('66b70747-ef36-4e36-870d-94d51cddc4c9', 'MODERATOR', 'Content and listing moderator', '2026-10-21 07:29:32.067'),
('8791b6ce-ae81-4cf5-8c59-490eebecc2e7', 'SUPER_ADMIN', 'Full system super administrator', '2026-10-21 07:29:32.075'),
('9ab4b284-8549-4ce5-a1f0-ba3e8f741293', 'SELLER', 'Verified or registered business supplier', '2026-10-21 07:29:32.062'),
('db02c32c-993f-4bdb-90af-016efa6af7c0', 'BUYER', 'Standard buyer account', '2026-10-21 07:29:32.055');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `refreshToken` varchar(512) NOT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `userId`, `refreshToken`, `userAgent`, `ipAddress`, `expiresAt`, `createdAt`) VALUES
('44ef9b09-38f8-4022-8bee-0fe726f786e8', '073f153e-e953-4240-b3ca-5387cb630e7e', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzNmMTUzZS1lOTUzLTQyNDAtYjNjYS01Mzg3Y2I2MzBlN2UiLCJpYXQiOjE3OTI3NTYxOTUsImV4cCI6MTc5MzM2MDk5NX0.XR-X1tt5KEfmZANt5TxwX53vgqPSKY_nmupX4tUOziw', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '::1', '2026-10-30 11:49:55.839', '2026-10-23 11:49:55.841'),
('9a7591a6-5a55-46e9-9a18-9880c6f7393f', '5a37c4bc-180d-4e2f-8229-f75571331d0b', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YTM3YzRiYy0xODBkLTRlMmYtODIyOS1mNzU1NzEzMzFkMGIiLCJpYXQiOjE3OTI3NTM1MzcsImV4cCI6MTc5MzM1ODMzN30.gYyJhCbUGIZ_sL1fKqSoLITU5PhoBkWFksse09aan70', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711', '::1', '2026-10-30 11:05:37.027', '2026-10-23 11:05:37.029'),
('b2a06ebf-364a-4f8f-8956-5bae5bb32d70', '9ca9e103-bda6-475d-a2be-7d8e539fff5e', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5Y2E5ZTEwMy1iZGE2LTQ3NWQtYTJiZS03ZDhlNTM5ZmZmNWUiLCJpYXQiOjE3OTI3NTYyMzMsImV4cCI6MTc5MzM2MTAzM30.01ikZk1G0YFHZs7FCja61JUdkbUahIuA4R6cT9UKw7A', 'admin-impersonation', '127.0.0.1', '2026-10-30 11:50:33.881', '2026-10-23 11:50:33.883'),
('cfea223f-d692-40da-a054-f3222dc8d4bb', '073f153e-e953-4240-b3ca-5387cb630e7e', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzNmMTUzZS1lOTUzLTQyNDAtYjNjYS01Mzg3Y2I2MzBlN2UiLCJpYXQiOjE3OTI3NTM5OTEsImV4cCI6MTc5MzM1ODc5MX0.N3uWfiQ5Cm5h8QJQ4lyajHJ_fj3Rans8mECxCSF73pU', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '::1', '2026-10-30 11:13:11.869', '2026-10-23 11:13:11.870'),
('ef21273b-2854-4a5e-950e-67a65ed1cbb5', '8f71e955-9a5a-4a54-ad53-08738923d0af', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZjcxZTk1NS05YTVhLTRhNTQtYWQ1My0wODczODkyM2QwYWYiLCJpYXQiOjE3OTI3NTM1MzcsImV4cCI6MTc5MzM1ODMzN30.oxsuUuhCoOfiOMvjhStXBGvRsT0CqowDsFxgQyRnA08', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711', '::1', '2026-10-30 11:05:37.203', '2026-10-23 11:05:37.204');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` varchar(191) NOT NULL,
  `ticketNumber` varchar(191) NOT NULL,
  `requesterId` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `status` enum('OPEN','ASSIGNED','IN_PROGRESS','WAITING_FOR_USER','ESCALATED','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  `assignedAgentId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `avatarUrl` varchar(191) DEFAULT NULL,
  `status` enum('ACTIVE','PENDING_VERIFY','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `emailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `phoneVerified` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `passwordHash`, `fullName`, `avatarUrl`, `status`, `emailVerified`, `phoneVerified`, `createdAt`, `updatedAt`) VALUES
('073f153e-e953-4240-b3ca-5387cb630e7e', 'admin@demomarketplace.in', NULL, '$2b$10$7bEAojrAWFGLFZQ6oSsPmur6X4FI7M/2Yi7g/RwPh/5q/du/mOk0W', 'Super Administrator (Demo)', NULL, 'ACTIVE', 1, 0, '2026-10-21 07:29:32.248', '2026-10-21 07:29:32.248'),
('5a37c4bc-180d-4e2f-8229-f75571331d0b', 'buyer.delhi@demomarketplace.in', '+919811000003', '$2b$10$7bEAojrAWFGLFZQ6oSsPmu4nvM.y8bCikxlichRSOad5Qvinwfihi', 'Rohit Sharma (Demo Procurement Buyer)', NULL, 'ACTIVE', 1, 1, '2026-10-21 07:29:32.281', '2026-10-21 07:29:32.281'),
('8f71e955-9a5a-4a54-ad53-08738923d0af', 'apex.machinery@demomarketplace.in', '+919825000001', '$2b$10$7bEAojrAWFGLFZQ6oSsPmuA1Ts3gJslOSOizm3WsQPq.JJJfsyjmG', 'Praveen Patel (Demo Supplier)', NULL, 'ACTIVE', 1, 1, '2026-10-21 07:29:32.255', '2026-10-21 07:29:32.255'),
('9ca9e103-bda6-475d-a2be-7d8e539fff5e', 'surat.textiles@demomarketplace.in', '+919825000002', '$2b$10$7bEAojrAWFGLFZQ6oSsPmuA1Ts3gJslOSOizm3WsQPq.JJJfsyjmG', 'Vikram Shah (Demo Supplier)', NULL, 'ACTIVE', 1, 1, '2026-10-21 07:29:32.278', '2026-10-21 07:29:32.278'),
('c4a0c5e1-8940-4193-9cd9-2fb5c1d41f22', 'anil.mehta@example.com', '+919825123456', '$2b$10$/aFougISkHNyuvEzoyTBLus1JxGtwFkHtWMaejteCneN72lkF9RK2', 'Anil Mehta', NULL, 'ACTIVE', 0, 0, '2026-10-23 06:44:55.925', '2026-10-23 06:44:55.925');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `roleId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `userId`, `roleId`, `createdAt`) VALUES
('1e8768d3-fc62-4831-a91d-be20a4a55930', 'c4a0c5e1-8940-4193-9cd9-2fb5c1d41f22', 'db02c32c-993f-4bdb-90af-016efa6af7c0', '2026-10-23 06:44:55.925'),
('255067ab-de76-4551-8bad-c172fd59d54e', '073f153e-e953-4240-b3ca-5387cb630e7e', '04dca84c-aa47-448b-9d5c-6da93157a6ac', '2026-10-21 07:29:32.248'),
('61b070c8-df51-4ec5-b45f-90f5d0244410', '5a37c4bc-180d-4e2f-8229-f75571331d0b', 'db02c32c-993f-4bdb-90af-016efa6af7c0', '2026-10-21 07:29:32.281'),
('7547e844-fcf9-4eb3-b0a2-0ff67752c4bd', '8f71e955-9a5a-4a54-ad53-08738923d0af', 'db02c32c-993f-4bdb-90af-016efa6af7c0', '2026-10-21 07:29:32.255'),
('7d191a20-645d-486e-98f0-0c65dddb8b1e', '8f71e955-9a5a-4a54-ad53-08738923d0af', '9ab4b284-8549-4ce5-a1f0-ba3e8f741293', '2026-10-21 07:29:32.255'),
('98e2fb88-7479-4c1d-bf1a-d8c2b85d9b45', '9ca9e103-bda6-475d-a2be-7d8e539fff5e', '9ab4b284-8549-4ce5-a1f0-ba3e8f741293', '2026-10-21 07:29:32.278'),
('d84d048f-ccb1-4476-b0bd-5bb16c5d0296', '073f153e-e953-4240-b3ca-5387cb630e7e', '8791b6ce-ae81-4cf5-8c59-490eebecc2e7', '2026-10-21 07:29:32.248');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_userId_idx` (`userId`),
  ADD KEY `audit_logs_action_idx` (`action`);

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `businesses_slug_key` (`slug`),
  ADD UNIQUE KEY `businesses_gstin_key` (`gstin`),
  ADD KEY `businesses_slug_idx` (`slug`),
  ADD KEY `businesses_verificationStatus_idx` (`verificationStatus`);

--
-- Indexes for table `business_addresses`
--
ALTER TABLE `business_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_addresses_businessId_idx` (`businessId`),
  ADD KEY `business_addresses_city_state_idx` (`city`,`state`);

--
-- Indexes for table `business_documents`
--
ALTER TABLE `business_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_documents_businessId_idx` (`businessId`);

--
-- Indexes for table `business_members`
--
ALTER TABLE `business_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `business_members_businessId_userId_key` (`businessId`,`userId`),
  ADD KEY `business_members_businessId_idx` (`businessId`),
  ADD KEY `business_members_userId_idx` (`userId`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carts_userId_idx` (`userId`),
  ADD KEY `carts_sessionId_idx` (`sessionId`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_items_cartId_idx` (`cartId`),
  ADD KEY `cart_items_productId_idx` (`productId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_key` (`slug`),
  ADD KEY `categories_slug_idx` (`slug`),
  ADD KEY `categories_parentId_idx` (`parentId`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `conversations_inquiryId_key` (`inquiryId`),
  ADD KEY `conversations_businessId_idx` (`businessId`),
  ADD KEY `conversations_buyerId_idx` (`buyerId`),
  ADD KEY `conversations_productId_fkey` (`productId`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inquiries_buyerId_idx` (`buyerId`),
  ADD KEY `inquiries_businessId_idx` (`businessId`),
  ADD KEY `inquiries_status_idx` (`status`),
  ADD KEY `inquiries_productId_fkey` (`productId`),
  ADD KEY `inquiries_requirementId_fkey` (`requirementId`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leads_businessId_idx` (`businessId`),
  ADD KEY `leads_stage_idx` (`stage`),
  ADD KEY `leads_inquiryId_fkey` (`inquiryId`);

--
-- Indexes for table `lead_notes`
--
ALTER TABLE `lead_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_notes_leadId_idx` (`leadId`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_conversationId_idx` (`conversationId`),
  ADD KEY `messages_senderId_idx` (`senderId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  ADD KEY `orders_buyerId_idx` (`buyerId`),
  ADD KEY `orders_businessId_idx` (`businessId`),
  ADD KEY `orders_status_idx` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_idx` (`orderId`),
  ADD KEY `order_items_productId_idx` (`productId`);

--
-- Indexes for table `otp_attempts`
--
ALTER TABLE `otp_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otp_attempts_recipient_purpose_idx` (`recipient`,`purpose`);

--
-- Indexes for table `price_tiers`
--
ALTER TABLE `price_tiers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `price_tiers_productId_idx` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_key` (`slug`),
  ADD KEY `products_businessId_idx` (`businessId`),
  ADD KEY `products_categoryId_idx` (`categoryId`),
  ADD KEY `products_status_idx` (`status`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_productId_idx` (`productId`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quotations_quoteNumber_key` (`quoteNumber`),
  ADD KEY `quotations_businessId_idx` (`businessId`),
  ADD KEY `quotations_buyerId_idx` (`buyerId`),
  ADD KEY `quotations_inquiryId_fkey` (`inquiryId`);

--
-- Indexes for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_items_quotationId_idx` (`quotationId`),
  ADD KEY `quotation_items_productId_fkey` (`productId`);

--
-- Indexes for table `requirements`
--
ALTER TABLE `requirements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requirements_buyerId_idx` (`buyerId`),
  ADD KEY `requirements_categoryId_idx` (`categoryId`),
  ADD KEY `requirements_status_idx` (`status`);

--
-- Indexes for table `requirement_responses`
--
ALTER TABLE `requirement_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `requirement_responses_requirementId_businessId_key` (`requirementId`,`businessId`),
  ADD KEY `requirement_responses_businessId_fkey` (`businessId`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_key` (`name`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_userId_idx` (`userId`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `support_tickets_ticketNumber_key` (`ticketNumber`),
  ADD KEY `support_tickets_requesterId_idx` (`requesterId`),
  ADD KEY `support_tickets_status_idx` (`status`),
  ADD KEY `support_tickets_assignedAgentId_fkey` (`assignedAgentId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_phone_key` (`phone`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_roles_userId_roleId_key` (`userId`,`roleId`),
  ADD KEY `user_roles_userId_idx` (`userId`),
  ADD KEY `user_roles_roleId_idx` (`roleId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `business_addresses`
--
ALTER TABLE `business_addresses`
  ADD CONSTRAINT `business_addresses_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `business_documents`
--
ALTER TABLE `business_documents`
  ADD CONSTRAINT `business_documents_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `business_members`
--
ALTER TABLE `business_members`
  ADD CONSTRAINT `business_members_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `business_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_inquiryId_fkey` FOREIGN KEY (`inquiryId`) REFERENCES `inquiries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `inquiries_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inquiries_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inquiries_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `inquiries_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `requirements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `leads_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leads_inquiryId_fkey` FOREIGN KEY (`inquiryId`) REFERENCES `inquiries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lead_notes`
--
ALTER TABLE `lead_notes`
  ADD CONSTRAINT `lead_notes_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `price_tiers`
--
ALTER TABLE `price_tiers`
  ADD CONSTRAINT `price_tiers_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quotations_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quotations_inquiryId_fkey` FOREIGN KEY (`inquiryId`) REFERENCES `inquiries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD CONSTRAINT `quotation_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `quotation_items_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `requirements`
--
ALTER TABLE `requirements`
  ADD CONSTRAINT `requirements_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `requirements_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `requirement_responses`
--
ALTER TABLE `requirement_responses`
  ADD CONSTRAINT `requirement_responses_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `requirement_responses_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `requirements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_assignedAgentId_fkey` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `support_tickets_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
