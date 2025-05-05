-- สร้างตาราง tuition_fees หากยังไม่มี
CREATE TABLE IF NOT EXISTS `tuition_fees` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `level` VARCHAR(50) NOT NULL,
  `year` VARCHAR(20) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO `tuition_fees` (`id`, `name`, `level`, `year`, `amount`)
VALUES
  ('001', 'ຄ່າຮຽນຊັ້ນ ມ 1', 'ຊັ້ນ ມ 1', '2023-2024', 110000),
  ('002', 'ຄ່າຮຽນຊັ້ນ ມ 2', 'ຊັ້ນ ມ 2', '2023-2024', 100000),
  ('003', 'ຄ່າຮຽນຊັ້ນ ມ 3', 'ຊັ້ນ ມ 3', '2023-2024', 100000),
  ('004', 'ຄ່າຮຽນຊັ້ນ ມ 4', 'ຊັ້ນ ມ 4', '2023-2024', 100000),
  ('005', 'ຄ່າຮຽນຊັ້ນ ມ 5', 'ຊັ້ນ ມ 5', '2023-2024', 100000),
  ('006', 'ຄ່າຮຽນຊັ້ນ ມ 6', 'ຊັ້ນ ມ 6', '2023-2024', 100000),
  ('007', 'ຄ່າຮຽນຊັ້ນ ມ 7', 'ຊັ້ນ ມ 7', '2023-2024', 110000); 