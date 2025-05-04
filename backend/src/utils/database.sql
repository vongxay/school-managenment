-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS school_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE school_management;

-- สร้างตารางผู้ใช้งาน
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'teacher', 'staff') NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตารางนักเรียน
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  student_name_lao VARCHAR(100) NOT NULL,
  guardian_phone VARCHAR(20),
  gender ENUM('M', 'F') NOT NULL,
  province VARCHAR(100),
  district VARCHAR(100),
  village VARCHAR(100),
  id_number VARCHAR(50),
  id_issued_date DATE,
  birth_village VARCHAR(100),
  birth_district VARCHAR(100),
  birth_province VARCHAR(100),
  ethnicity VARCHAR(50),
  religion VARCHAR(50),
  nationality VARCHAR(50) DEFAULT 'ລາວ',
  date_of_birth DATE,
  phone_number VARCHAR(20),
  photo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตารางชั้นเรียน
CREATE TABLE IF NOT EXISTS levels (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตารางปีการศึกษา
CREATE TABLE IF NOT EXISTS school_years (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตารางห้องเรียน
CREATE TABLE IF NOT EXISTS classrooms (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  level_id VARCHAR(36) NOT NULL,
  teacher_id VARCHAR(36),
  max_students INT DEFAULT 30,
  school_year_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (level_id) REFERENCES levels(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (school_year_id) REFERENCES school_years(id)
);

-- สร้างตารางค่าเล่าเรียน
CREATE TABLE IF NOT EXISTS tuition_fees (
  id VARCHAR(36) PRIMARY KEY,
  level_id VARCHAR(36) NOT NULL,
  school_year_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (level_id) REFERENCES levels(id),
  FOREIGN KEY (school_year_id) REFERENCES school_years(id)
);

-- สร้างตารางการลงทะเบียน
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(36) PRIMARY KEY,
  invoice_id VARCHAR(50) NOT NULL UNIQUE,
  student_id VARCHAR(36) NOT NULL,
  classroom_id VARCHAR(36) NOT NULL,
  school_year_id VARCHAR(36) NOT NULL,
  registration_date DATE NOT NULL,
  tuition_fee DECIMAL(10, 2) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  registered_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
  FOREIGN KEY (school_year_id) REFERENCES school_years(id),
  FOREIGN KEY (registered_by) REFERENCES users(id)
);

-- สร้างตารางการชำระเงิน
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  registration_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('cash', 'bank_transfer') NOT NULL,
  receipt_number VARCHAR(50) UNIQUE,
  note TEXT,
  received_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
);

-- เพิ่มข้อมูลตัวอย่างผู้ใช้งาน
INSERT INTO users (id, username, password, name, role, active)
VALUES 
  (UUID(), 'admin', '$2b$10$ECpLZ8ylV/StG4h5eDDKB.nssCl/ZGQdmA0LXRbJXJzGRmPTuDvRC', 'ທ້າວ ມິຮຸນດົງ ອິສິຣິ', 'admin', 1),
  (UUID(), 'teacher', '$2b$10$ECpLZ8ylV/StG4h5eDDKB.nssCl/ZGQdmA0LXRbJXJzGRmPTuDvRC', 'ນາງສາວ ນຸ ສຸກົນໄຊ', 'teacher', 1),
  (UUID(), 'staff', '$2b$10$ECpLZ8ylV/StG4h5eDDKB.nssCl/ZGQdmA0LXRbJXJzGRmPTuDvRC', 'ທ້າວ ສົມສະຫວັນ', 'staff', 1);

-- หมายเหตุ: รหัสผ่านที่เข้ารหัสไว้คือ "admin123", "teacher123", "staff123" ตามลำดับ (ใช้ bcrypt) 