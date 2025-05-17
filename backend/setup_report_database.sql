-- ສ້າງຕາຕະລາງສຳລັບທົດສອບລາຍງານ

-- ຕາຕະລາງ subjects (ວິຊາຮຽນ)
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ຕາຕະລາງ exams (ການສອບເສັງ)
CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  subject_id INT NOT NULL,
  exam_date DATE NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ຕາຕະລາງ attendances (ການມາຮຽນ)
CREATE TABLE IF NOT EXISTS attendances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'present',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id)
);

-- ເພີ່ມຂໍ້ມູນທົດສອບ

-- ຂໍ້ມູນວິຊາຮຽນ
INSERT INTO subjects (name, description) VALUES
  ('ຄະນິດສາດ', 'ວິຊາຄະນິດສາດ'),
  ('ພາສາລາວ', 'ວິຊາພາສາລາວ'),
  ('ພາສາອັງກິດ', 'ວິຊາພາສາອັງກິດ'),
  ('ວິທະຍາສາດ', 'ວິຊາວິທະຍາສາດ'),
  ('ສັງຄົມສຶກສາ', 'ວິຊາສັງຄົມສຶກສາ'),
  ('ພະລະສຶກສາ', 'ວິຊາພະລະສຶກສາ'),
  ('ວິທະຍາສາດຄອມພິວເຕີ', 'ວິຊາວິທະຍາສາດຄອມພິວເຕີ');

-- ຈຳລອງຂໍ້ມູນການສອບເສັງ (ຕ້ອງມີຂໍ້ມູນໃນ registrations ກ່ອນ)
-- ສົມມຸດວ່າມີ registration_id ຈາກ 1 ຫາ 100
DELIMITER //
CREATE PROCEDURE generate_exam_data()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE j INT DEFAULT 1;
  DECLARE reg_count INT;
  DECLARE subj_count INT;
  
  -- ຈຳນວນນັກຮຽນທີ່ຫຼົງທະບຽນ
  SELECT COUNT(*) INTO reg_count FROM registrations LIMIT 100;
  
  -- ຈຳນວນວິຊາທັງໝົດ
  SELECT COUNT(*) INTO subj_count FROM subjects;
  
  -- ສ້າງຂໍ້ມູນການສອບເສັງ
  WHILE i <= reg_count DO
    SET j = 1;
    WHILE j <= subj_count DO
      INSERT INTO exams (registration_id, subject_id, exam_date, score, max_score)
      VALUES 
        (i, j, DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 180) DAY), 
         FLOOR(50 + RAND() * 50), 100);
      SET j = j + 1;
    END WHILE;
    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;

-- ຈຳລອງຂໍ້ມູນການມາຮຽນ (ຕ້ອງມີຂໍ້ມູນໃນ registrations ກ່ອນ)
DELIMITER //
CREATE PROCEDURE generate_attendance_data()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE reg_count INT;
  DECLARE current_date DATE;
  DECLARE status_val VARCHAR(10);
  DECLARE rand_val DECIMAL(5,2);
  
  -- ຈຳນວນນັກຮຽນທີ່ຫຼົງທະບຽນ
  SELECT COUNT(*) INTO reg_count FROM registrations LIMIT 100;
  
  -- ສ້າງຂໍ້ມູນການມາຮຽນສຳລັບ 30 ວັນທີ່ຜ່ານມາ
  SET current_date = CURRENT_DATE;
  
  -- 30 ວັນຍ້ອນຫຼັງ
  WHILE DATEDIFF(current_date, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)) >= 0 DO
    -- ຂ້າມວັນເສົາ-ອາທິດ
    IF DAYOFWEEK(current_date) NOT IN (1, 7) THEN
      SET i = 1;
      WHILE i <= reg_count DO
        -- ສຸ່ມສະຖານະການມາຮຽນ (85% ມາຮຽນ, 10% ຂາດຮຽນ, 5% ມາຊ້າ)
        SET rand_val = RAND();
        IF rand_val < 0.85 THEN
          SET status_val = 'present';
        ELSEIF rand_val < 0.95 THEN
          SET status_val = 'absent';
        ELSE
          SET status_val = 'late';
        END IF;
        
        INSERT INTO attendances (registration_id, date, status)
        VALUES (i, current_date, status_val);
        
        SET i = i + 1;
      END WHILE;
    END IF;
    
    SET current_date = DATE_SUB(current_date, INTERVAL 1 DAY);
  END WHILE;
END //
DELIMITER ;

-- ເອີ້ນໃຊ້ຂັ້ນຕອນວິທີຈຳລອງຂໍ້ມູນ
CALL generate_exam_data();
CALL generate_attendance_data();

-- ລຶບຂັ້ນຕອນວິທີທີ່ບໍ່ຕ້ອງການແລ້ວ
DROP PROCEDURE IF EXISTS generate_exam_data;
DROP PROCEDURE IF EXISTS generate_attendance_data; 