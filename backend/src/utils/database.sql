-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 05, 2025 at 03:53 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `level` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `level`, `created_at`, `updated_at`) VALUES
('005', 'ມ 2/1', 'ຊັ້ນ ມ 2', '2025-05-05 06:07:47', '2025-05-05 06:07:47'),
('006', 'ມ 3/2', 'ຊັ້ນ ມ 3', '2025-05-05 06:08:29', '2025-05-05 06:08:29'),
('007', 'ມ 6/2', 'ຊັ້ນ ມ 6', '2025-05-05 06:09:05', '2025-05-05 06:09:05'),
('008', 'ມ 7/1', 'ຊັ້ນ ມ 7', '2025-05-05 06:09:51', '2025-05-05 06:09:51'),
('009', 'ມ 5/3', 'ຊັ້ນ ມ 5', '2025-05-05 06:10:37', '2025-05-05 06:10:37'),
('100', 'ມ 1/1', 'ຊັ້ນ ມ 1', '2025-05-04 16:09:58', '2025-05-05 06:06:44');

-- --------------------------------------------------------

--
-- Table structure for table `classrooms`
--

CREATE TABLE `classrooms` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `level_id` varchar(36) NOT NULL,
  `teacher_id` varchar(36) DEFAULT NULL,
  `max_students` int(11) DEFAULT 30,
  `school_year_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `levels`
--

CREATE TABLE `levels` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `levels`
--

INSERT INTO `levels` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
('007', 'ຊັ້ນ ມ 1', NULL, '2025-05-05 05:59:47', '2025-05-05 06:01:08'),
('008', 'ຊັ້ນ ມ 2', NULL, '2025-05-05 06:01:26', '2025-05-05 06:01:26'),
('009', 'ຊັ້ນ ມ 3', NULL, '2025-05-05 06:01:41', '2025-05-05 06:01:41'),
('010', 'ຊັ້ນ ມ 4', NULL, '2025-05-05 06:02:04', '2025-05-05 06:02:04'),
('011', 'ຊັ້ນ ມ 5', NULL, '2025-05-05 06:02:21', '2025-05-05 06:02:21'),
('012', 'ຊັ້ນ ມ 6', NULL, '2025-05-05 06:02:38', '2025-05-05 06:02:38'),
('013', 'ຊັ້ນ ມ 7', NULL, '2025-05-05 06:02:57', '2025-05-05 06:02:57');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `registration_id` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('cash','bank_transfer') NOT NULL,
  `receipt_number` varchar(50) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `received_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `registrations`
--

CREATE TABLE `registrations` (
  `id` varchar(36) NOT NULL,
  `invoice_id` varchar(50) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `student_name` varchar(100) DEFAULT NULL,
  `student_phone` varchar(20) DEFAULT NULL,
  `classroom` varchar(36) NOT NULL,
  `level` varchar(50) NOT NULL, 
  `school_year` varchar(20) NOT NULL,
  `registration_date` date NOT NULL,
  `tuition_fee` decimal(10,2) NOT NULL,
  `is_paid` tinyint(1) DEFAULT 0,
  `registered_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_years`
--

CREATE TABLE `school_years` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `period` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_years`
--

INSERT INTO `school_years` (`id`, `name`, `start_date`, `end_date`, `is_current`, `created_at`, `updated_at`, `period`) VALUES
('001', '2022-2023', '1899-11-29', '1899-11-29', 0, '2025-05-05 05:48:30', '2025-05-05 05:48:30', '2022-2023'),
('002', '2023-2024', '1899-11-30', '1899-11-30', 0, '2025-05-05 05:52:02', '2025-05-05 05:52:02', '2023-2024'),
('003', '2024-2025', '1899-11-30', '1899-11-30', 0, '2025-05-05 05:52:29', '2025-05-05 05:52:29', '2024-2025'),
('004', '2025-2026', '1899-11-30', '1899-11-30', 0, '2025-05-05 05:53:03', '2025-05-05 05:53:03', '2025-2026'),
('005', '2026-2027', '1899-11-30', '1899-11-30', 0, '2025-05-05 05:53:30', '2025-05-05 05:53:30', '2026-2027');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `student_name_lao` varchar(100) NOT NULL,
  `guardian_phone` varchar(20) DEFAULT NULL,
  `gender` enum('M','F') NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `id_issued_date` date DEFAULT NULL,
  `birth_village` varchar(100) DEFAULT NULL,
  `birth_district` varchar(100) DEFAULT NULL,
  `birth_province` varchar(100) DEFAULT NULL,
  `ethnicity` varchar(50) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT 'ລາວ',
  `date_of_birth` date DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_id`, `student_name_lao`, `guardian_phone`, `gender`, `province`, `district`, `village`, `id_number`, `id_issued_date`, `birth_village`, `birth_district`, `birth_province`, `ethnicity`, `religion`, `nationality`, `date_of_birth`, `phone_number`, `photo_url`, `created_at`, `updated_at`) VALUES
('4fc4e06a-296c-11f0-b01f-04421a89833a', '001', 'ນູ່ຈິ ສະຫວັນໃຈ', '03022335566', 'F', 'ນະຄອນຫລວງ', 'ໄຊທານີ', 'ໂພນໂຮງ', '4784894979', '2021-09-04', 'ໂພນໂຮງ', 'ໄຊທານີ', 'ນະຄອນຫລວງ', 'ໄທ', 'ພຸດ', 'ລາວ', '2000-12-15', '02059436126', '', '2025-05-05 04:49:21', '2025-05-05 05:03:59'),
('4fc4f3d3-296c-11f0-b01f-04421a89833a', '002', 'ຈັນສະຫວັນ ທຳມະວົງ', '02044556623', 'M', 'ສຸຂຮອຍ', 'ໄພສະທອນ', 'ບ້ານສະຫວັນ', '5949849467', '2022-08-02', 'ບ້ານສະຫວັນ', 'ໄພສະທອນ', 'ສຸຂຮອຍ', 'ໄທ', 'ຜີ', 'ລາວ', '1999-07-17', '02056552654', '', '2025-05-05 04:49:21', '2025-05-05 05:03:12'),
('4fc4f4a9-296c-11f0-b01f-04421a89833a', '003', 'ສຸພາພອນ ວິໄລສັກ', '02055667788', 'F', 'ອັດຕະປື', 'ສາມັກຄີໄຊ', 'ດົງນາໂຊກ', '9876543210', '2022-03-15', 'ດົງນາໂຊກ', 'ສາມັກຄີໄຊ', 'ອັດຕະປື', 'ລາວລຸ່ມ', 'ພຸດ', 'ລາວ', '2001-05-22', '02091234567', '', '2025-05-05 04:49:21', '2025-05-05 04:49:21'),
('4fc4f4fc-296c-11f0-b01f-04421a89833a', '004', 'ແສງພະຈັນ ວິໄລພອນ', '03056424356', 'M', 'ສຸຂຮອຍ', 'ໄຊສະນະ', 'ຕັ້ງໂຊ', '7487484978', '2022-03-05', 'ຕັ້ງໂຊ', 'ໄຊສະນະ', 'ສຸຂຮອຍ', 'ມົ້ງ', 'ຜີ', 'ລາວ', '1998-01-10', '02059482364', '', '2025-05-05 04:49:21', '2025-05-05 04:49:21'),
('4fc4f547-296c-11f0-b01f-04421a89833a', '005', 'ວັນ ສຸລິນທາ', '020 56667788', 'M', 'ສຸຂຮອຍ', 'ແປກ', 'ຕັ້ງໂຊ', '9320293923', '2022-05-02', 'ຕັ້ງໂຊ', 'ແປກ', 'ສຸຂຮອຍ', 'ມົ້ງ', 'ຜີ', 'ລາວ', '1999-11-10', '02056442394', '', '2025-05-05 04:49:21', '2025-05-05 04:49:21');

-- --------------------------------------------------------

--
-- Table structure for table `tuition_fees`
--

CREATE TABLE `tuition_fees` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `level` varchar(50) NOT NULL,
  `year` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tuition_fees`
--

INSERT INTO `tuition_fees` (`id`, `name`, `level`, `year`, `amount`, `created_at`, `updated_at`) VALUES
('001', 'ຄ່າຮຽນຊັ້ນ ມ 1', 'ຊັ້ນ ມ 1', '2023-2024', 110000.00, '2025-05-05 04:29:01', '2025-05-05 04:29:01'),
('002', 'ຄ່າຮຽນຊັ້ນ ມ 2', 'ຊັ້ນ ມ 2', '2023-2024', 100000.00, '2025-05-05 04:29:01', '2025-05-05 04:29:01'),
('003', 'ຄ່າຮຽນຊັ້ນ ມ 3', 'ຊັ້ນ ມ 3', '2023-2024', 100000.00, '2025-05-05 04:29:01', '2025-05-05 04:29:01'),
('004', 'ຄ່າຮຽນຊັ້ນ ມ 4', 'ຊັ້ນ ມ 4', '2023-2024', 100000.00, '2025-05-05 04:29:01', '2025-05-05 04:29:01'),
('005', 'ຄ່າຮຽນຊັ້ນ ມ 5', 'ຊັ້ນ ມ 5', '2023-2024', 100000.00, '2025-05-05 04:29:01', '2025-05-05 04:29:01'),
('006', 'ຄ່າຮຽນຊັ້ນ ມ 6', 'ຊັ້ນ ມ 6', '2023-2024', 100000.00, '2025-05-05 04:29:01', '2025-05-05 04:29:01'),
('007', 'ຄ່າຮຽນຊັ້ນ ມ 7', 'ຊັ້ນ ມ 7', '2023-2024', 110000.00, '2025-05-05 04:29:01', '2025-05-05 04:29:01');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('admin','teacher','staff') NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `active`, `created_at`, `updated_at`) VALUES
('b86a06d9-28f4-11f0-ac65-04421a89833a', 'admin', '0192023a7bbd73250516f069df18b500', 'ທ້າວ ມິຮຸນດົງ ອິສິຣິ', 'admin', 1, '2025-05-04 14:33:17', '2025-05-04 14:44:36'),
('b86a4ab4-28f4-11f0-ac65-04421a89833a', 'teacher', '$2b$10$ECpLZ8ylV/StG4h5eDDKB.nssCl/ZGQdmA0LXRbJXJzGRmPTuDvRC', 'ນາງສາວ ນຸ ສຸກົນໄຊ', 'teacher', 1, '2025-05-04 14:33:17', '2025-05-04 14:33:17'),
('b86a4c56-28f4-11f0-ac65-04421a89833a', 'staff', '$2b$10$ECpLZ8ylV/StG4h5eDDKB.nssCl/ZGQdmA0LXRbJXJzGRmPTuDvRC', 'ທ້າວ ສົມສະຫວັນ', 'staff', 1, '2025-05-04 14:33:17', '2025-05-04 14:33:17'),
('bba146ed-a7fb-4632-9f14-4dff15353d91', 'admin1', '$2b$10$SQIUyHzUexBgy1jM.1GbI.iVi3n4Avt/tWGeU99ELWaveAGo7HZ6G', 'Vongxay Vang', 'admin', 1, '2025-05-04 15:15:30', '2025-05-04 15:15:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `level_id` (`level_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `school_year_id` (`school_year_id`);

--
-- Indexes for table `levels`
--
ALTER TABLE `levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `registration_id` (`registration_id`),
  ADD KEY `received_by` (`received_by`);

--
-- Indexes for table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `school_years`
--
ALTER TABLE `school_years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- Indexes for table `tuition_fees`
--
ALTER TABLE `tuition_fees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD CONSTRAINT `classrooms_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `levels` (`id`),
  ADD CONSTRAINT `classrooms_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `classrooms_ibfk_3` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `registrations`
--
-- ໄດ້ລຶບ constraint ອອກ ເພື່ອໃຫ້ສາມາດລົງທະບຽນໂດຍບໍ່ຕ້ອງມີນັກຮຽນໃນຕາຕະລາງ students

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
