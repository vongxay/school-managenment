import db from '../utils/db';

export interface StudentByGenderReport {
  male: number;
  female: number;
  total: number;
}

export interface StudentByLevelReport {
  level: string;
  level_id: number;
  count: number;
  color: string;
}

export interface TuitionStatusReport {
  paid: number;
  unpaid: number;
  total: number;
}

export interface MonthlyPaymentReport {
  month: string;
  month_number: number;
  amount: number;
}

export interface ClassAverageReport {
  class_name: string;
  class_id: number;
  average_score: number;
}

export interface StudentTrendReport {
  year_name: string;
  year_id: number;
  student_count: number;
}

export interface AttendanceReport {
  month: string;
  month_number: number;
  present_rate: number;
  absent_rate: number;
  total_days: number;
}

export interface ExamComparisonReport {
  subject_name: string;
  class_name: string;
  average_score: number;
  max_score: number;
  min_score: number;
}

export interface StudentPerformanceReport {
  student_name: string;
  student_id: number;
  average_score: number;
  subjects: {
    subject_name: string;
    score: number;
  }[];
}

// ฟังก์ชันสำหรับดึงข้อมูลนักเรียนในรูปแบบรายชื่อ (สำหรับตาราง studentList)
export interface StudentListReport {
  studentId: string;
  name: string;
  parentPhone: string;
  dob: string;
  village: string;
  district: string;
  province: string;
  gender: string;
  phone: string;
  levelId: string;
  classId: string;
  yearId: number;
}

export const getStudentList = async (
  year_id?: number,
  level_id?: string,
  class_id?: string
): Promise<StudentListReport[]> => {
  try {
    let sql = `
      SELECT 
        s.student_id,
        s.student_name_lao AS name,
        s.guardian_phone AS parentPhone,
        DATE_FORMAT(s.date_of_birth, '%d/%m/%Y') AS dob,
        s.village,
        s.district,
        s.province,
        CASE
          WHEN s.gender = 'male' THEN 'ຊາຍ'
          WHEN s.gender = 'female' THEN 'ຍິງ'
          ELSE s.gender
        END AS gender,
        s.phone_number,
        r.level AS levelId,
        r.classroom AS classId,
        r.school_year AS yearId
      FROM students s
      JOIN registrations r ON s.id = r.student_id
    `;
    
    const conditions = [];
    const params = [];
    if (year_id) {
      conditions.push('r.school_year= ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('r.level = ?');
      params.push(level_id);
    }
    
    if (class_id && class_id !== 'all') {
      conditions.push('r.classroom = ?');
      params.push(class_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY s.student_name_lao';
    
    const [rows] = await db.query(sql, params);
    return rows as StudentListReport[];
  } catch (error) {
    console.error('Error in getStudentList:', error);
    return [];
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลการมาเรียนของนักเรียน (สำหรับตาราง attendanceList)
export interface AttendanceListReport {
  studentId: string;
  name: string;
  class: string;
  attendance: string;
  lastAbsent: string;
  levelId: string;
  classId: string;
  yearId: number;
}

export const getAttendanceList = async (
  year_id?: number,
  level_id?: string,
  class_id?: string
): Promise<AttendanceListReport[]> => {
  try {
    let sql = `
      SELECT 
        s.student_code AS studentId,
        CONCAT(s.first_name, ' ', s.last_name) AS name,
        CONCAT('ມ.', l.name, '/', c.name) AS class,
        CONCAT(ROUND(AVG(CASE WHEN a.status = 'present' THEN 100 ELSE 0 END)), '%') AS attendance,
        DATE_FORMAT(MAX(CASE WHEN a.status = 'absent' THEN a.date ELSE NULL END), '%d/%m/%Y') AS lastAbsent,
        r.level_id AS levelId,
        r.class_id AS classId,
        r.year_id AS yearId
      FROM students s
      JOIN registrations r ON s.id = r.student_id
      JOIN levels l ON r.level_id = l.id
      JOIN classes c ON r.class_id = c.id
      LEFT JOIN attendances a ON r.id = a.registration_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.year_id = ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('r.level_id = ?');
      params.push(level_id);
    }
    
    if (class_id && class_id !== 'all') {
      conditions.push('r.class_id = ?');
      params.push(class_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY s.id ORDER BY attendance DESC';
    
    const [rows] = await db.query(sql, params);
    return rows as AttendanceListReport[];
  } catch (error) {
    console.error('Error in getAttendanceList:', error);
    return [];
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลคะแนนตามห้องเรียน (สำหรับตาราง gradesByClass)
export interface GradesByClassReport {
  studentId: string;
  name: string;
  class: string;
  math: number;
  science: number;
  language: number;
  average: number;
  levelId: string;
  classId: string;
  yearId: number;
}

export const getGradesByClass = async (
  year_id?: number,
  level_id?: string,
  class_id?: string
): Promise<GradesByClassReport[]> => {
  try {
    let sql = `
      SELECT 
        s.student_code AS studentId,
        CONCAT(s.first_name, ' ', s.last_name) AS name,
        CONCAT('ມ.', l.name, '/', c.name) AS class,
        (SELECT e.score FROM exams e 
         JOIN subjects sub ON e.subject_id = sub.id 
         WHERE e.registration_id = r.id AND sub.name = 'Math' LIMIT 1) AS math,
        (SELECT e.score FROM exams e 
         JOIN subjects sub ON e.subject_id = sub.id 
         WHERE e.registration_id = r.id AND sub.name = 'Science' LIMIT 1) AS science,
        (SELECT e.score FROM exams e 
         JOIN subjects sub ON e.subject_id = sub.id 
         WHERE e.registration_id = r.id AND sub.name = 'Language' LIMIT 1) AS language,
        r.average_score AS average,
        r.level_id AS levelId,
        r.class_id AS classId,
        r.year_id AS yearId
      FROM students s
      JOIN registrations r ON s.id = r.student_id
      JOIN levels l ON r.level_id = l.id
      JOIN classes c ON r.class_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.year_id = ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('r.level_id = ?');
      params.push(level_id);
    }
    
    if (class_id && class_id !== 'all') {
      conditions.push('r.class_id = ?');
      params.push(class_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY average DESC';
    
    const [rows] = await db.query(sql, params);
    return rows as GradesByClassReport[];
  } catch (error) {
    console.error('Error in getGradesByClass:', error);
    return [];
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลคะแนนตามชั้นเรียน (สำหรับตาราง gradesByLevel)
export interface GradesByLevelReport {
  classId: string;
  className: string;
  students: number;
  avgScore: number;
  passRate: string;
  levelId: string;
  yearId: number;
}

export const getGradesByLevel = async (
  year_id?: number,
  level_id?: string
): Promise<GradesByLevelReport[]> => {
  try {
    let sql = `
      SELECT 
        c.id AS classId,
        CONCAT('ມ.', l.name, '/', c.name) AS className,
        COUNT(r.student_id) AS students,
        AVG(r.average_score) AS avgScore,
        CONCAT(ROUND((COUNT(CASE WHEN r.average_score >= 60 THEN 1 ELSE NULL END) / COUNT(*) * 100)), '%') AS passRate,
        r.level_id AS levelId,
        r.year_id AS yearId
      FROM registrations r
      JOIN levels l ON r.level_id = l.id
      JOIN classes c ON r.class_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.year_id = ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('r.level_id = ?');
      params.push(level_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY c.id, r.level_id, r.year_id ORDER BY l.id, c.id';
    
    const [rows] = await db.query(sql, params);
    return rows as GradesByLevelReport[];
  } catch (error) {
    console.error('Error in getGradesByLevel:', error);
    return [];
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลการลงทะเบียน (สำหรับตาราง registration)
export interface RegistrationReport {
  id: string;
  code: string;
  name: string;
  idNumber: string;
  gender: string;
  level: string;
  class: string;
  regDate: string;
  status: string;
  levelId: string;
  classId: string;
  yearId: number;
}

export const getRegistrationData = async (
  year_id?: number,
  level_id?: string,
  class_id?: string
): Promise<RegistrationReport[]> => {
  try {
    let sql = `
      SELECT 
        r.registration_no AS id,
        s.student_code AS code,
        CONCAT(s.first_name, ' ', s.last_name) AS name,
        s.id_card_no AS idNumber,
        CASE
          WHEN s.gender = 'male' THEN 'ຊາຍ'
          WHEN s.gender = 'female' THEN 'ຍິງ'
          ELSE s.gender
        END AS gender,
        CONCAT('ຊັ້ນ ມ', l.name) AS level,
        CONCAT('ຊັ້ນ ມ.', c.name) AS class,
        DATE_FORMAT(r.registration_date, '%d/%m/%Y') AS regDate,
        r.status,
        r.level_id AS levelId,
        r.class_id AS classId,
        r.year_id AS yearId
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN levels l ON r.level_id = l.id
      JOIN classes c ON r.class_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.year_id = ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('r.level_id = ?');
      params.push(level_id);
    }
    
    if (class_id && class_id !== 'all') {
      conditions.push('r.class_id = ?');
      params.push(class_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY r.registration_date DESC';
    
    const [rows] = await db.query(sql, params);
    return rows as RegistrationReport[];
  } catch (error) {
    console.error('Error in getRegistrationData:', error);
    return [];
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลรายงานการเงินตามเดือน (สำหรับตาราง financialReport)
export interface FinancialReport {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  yearId: number;
}

export const getFinancialReportByMonth = async (
  year_id?: number,
  month?: string
): Promise<FinancialReport[]> => {
  try {
    let sql = `
      SELECT 
        CASE 
          WHEN MONTH(transaction_date) = 1 THEN 'ມັງກອນ'
          WHEN MONTH(transaction_date) = 2 THEN 'ກຸມພາ'
          WHEN MONTH(transaction_date) = 3 THEN 'ມີນາ'
          WHEN MONTH(transaction_date) = 4 THEN 'ເມສາ'
          WHEN MONTH(transaction_date) = 5 THEN 'ພຶດສະພາ'
          WHEN MONTH(transaction_date) = 6 THEN 'ມິຖຸນາ'
          WHEN MONTH(transaction_date) = 7 THEN 'ກໍລະກົດ'
          WHEN MONTH(transaction_date) = 8 THEN 'ສິງຫາ'
          WHEN MONTH(transaction_date) = 9 THEN 'ກັນຍາ'
          WHEN MONTH(transaction_date) = 10 THEN 'ຕຸລາ'
          WHEN MONTH(transaction_date) = 11 THEN 'ພະຈິກ'
          WHEN MONTH(transaction_date) = 12 THEN 'ທັນວາ'
        END AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance,
        academic_year_id AS yearId
      FROM financial_transactions
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('academic_year_id = ?');
      params.push(year_id);
    }
    
    if (month && month !== 'all') {
      conditions.push('MONTH(transaction_date) = ?');
      params.push(month);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY MONTH(transaction_date), academic_year_id ORDER BY MONTH(transaction_date)';
    
    const [rows] = await db.query(sql, params);
    return rows as FinancialReport[];
  } catch (error) {
    console.error('Error in getFinancialReportByMonth:', error);
    return [];
  }
};

// เพิ่มฟังก์ชันที่ขาดหายไป
export const getStudentsByGender = async (
  year_id?: number,
  level_id?: string,
  class_id?: string
): Promise<StudentByGenderReport> => {
  try {
    let sql = `
      SELECT 
        SUM(CASE WHEN s.gender = 'M' THEN 1 ELSE 0 END) AS male,
        SUM(CASE WHEN s.gender = 'F' THEN 1 ELSE 0 END) AS female,
        COUNT(*) AS total
      FROM students s
      JOIN registrations r ON s.student_id = r.student_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.school_year = ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('r.level= ?');
      params.push(level_id);
    }
    
    if (class_id && class_id !== 'all') {
      conditions.push('r.classroom = ?');
      params.push(class_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    console.log(sql);
    const [rows] = await db.query(sql, params);
    console.log(rows);
    const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : { male: 0, female: 0, total: 0 };
    return result as StudentByGenderReport;
  } catch (error) {
    console.error('Error in getStudentsByGender:', error);
    return { male: 0, female: 0, total: 0 };
  }
};

export const getStudentsByYear = async (
  year_id?: number,
   level_id?: string,
): Promise<any[]> => {
  try {
    if (!year_id) return [];
  let regRows: any[] = [];
if (!level_id || level_id === null || level_id === '' || level_id === 'all' || level_id === undefined || level_id === 'null') {
  const [rows] = await db.query(
    `SELECT student_id FROM registrations WHERE school_year = ?`,
    [year_id]
  );
  regRows = rows as any[]; // <-- assign only rows
} else {
  const [rows] = await db.query(
    `SELECT student_id FROM registrations WHERE school_year = ? AND level = ?`,
    [year_id, level_id]
  );
  regRows = rows as any[]; // <-- assign only rows
}
    console.log('getStudentsByYear regRows', regRows);
    const studentIds = (regRows as any[]).map(row => row.student_id);
    console.log('getStudentsByYear studentIds', studentIds);
    if (studentIds.length === 0) return [];

    // Step 2: Get students with those student_ids
    // Use parameterized query for IN clause
    const placeholders = studentIds.map(() => '?').join(',');
    const [studentRows] = await db.query(
      `SELECT id,student_id,student_name_lao,guardian_phone,gender,province,district,village,id_number,id_issued_date,birth_village,birth_district,birth_province,ethnicity,religion,nationality,date_of_birth,phone_number FROM students WHERE student_id IN (${placeholders})`,
      studentIds
    );

    return studentRows as any[];
  } catch (error) {
    console.error('Error in getStudentsByYear:', error);
    return [];
  }
};


export const getStudentsByLevel = async (
  year_id?: number
): Promise<StudentByLevelReport[]> => {
  try {
    let sql = `
      SELECT 
        l.name AS level,
        l.id AS level_id,
        COUNT(r.student_id) AS count,
        '#' + SUBSTRING(MD5(l.name), 1, 6) AS color
      FROM levels l
      LEFT JOIN registrations r ON l.id = r.level
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.school_year = ?');
      params.push(year_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY l.id ORDER BY l.id';
    
    console.log('level sql',sql);
    const [rows] = await db.query(sql, params);
    return rows as StudentByLevelReport[];
  } catch (error) {
    console.error('Error in getStudentsByLevel:', error);
    return [];
  }
};

export const getTuitionStatus = async (
  year_id?: number,
  level_id?: string,
  class_id?: string
): Promise<TuitionStatusReport> => {
  try {
    let sql = `
      SELECT 
        SUM(CASE WHEN is_paid = 1 THEN 1 ELSE 0 END) AS paid,
        SUM(CASE WHEN is_paid = 0 THEN 1 ELSE 0 END) AS unpaid,
        COUNT(*) AS total
      FROM registrations
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('school_year = ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('level = ?');
      params.push(level_id);
    }
    
    if (class_id && class_id !== 'all') {
      conditions.push('classroom = ?');
      params.push(class_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [rows] = await db.query(sql, params);
    const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : { paid: 0, unpaid: 0, total: 0 };
    return result as TuitionStatusReport;
  } catch (error) {
    console.error('Error in getTuitionStatus:', error);
    return { paid: 0, unpaid: 0, total: 0 };
  }
};

export const getMonthlyPayments = async (
  year_id?: number,
  month?: string
): Promise<MonthlyPaymentReport[]> => {
  try {
    let sql = `
      SELECT 
        CASE 
          WHEN MONTH(payment_date) = 1 THEN 'ມັງກອນ'
          WHEN MONTH(payment_date) = 2 THEN 'ກຸມພາ'
          WHEN MONTH(payment_date) = 3 THEN 'ມີນາ'
          WHEN MONTH(payment_date) = 4 THEN 'ເມສາ'
          WHEN MONTH(payment_date) = 5 THEN 'ພຶດສະພາ'
          WHEN MONTH(payment_date) = 6 THEN 'ມິຖຸນາ'
          WHEN MONTH(payment_date) = 7 THEN 'ກໍລະກົດ'
          WHEN MONTH(payment_date) = 8 THEN 'ສິງຫາ'
          WHEN MONTH(payment_date) = 9 THEN 'ກັນຍາ'
          WHEN MONTH(payment_date) = 10 THEN 'ຕຸລາ'
          WHEN MONTH(payment_date) = 11 THEN 'ພະຈິກ'
          WHEN MONTH(payment_date) = 12 THEN 'ທັນວາ'
        END AS month,
        MONTH(payment_date) AS month_number,
        SUM(amount) AS amount
      FROM payments
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('academic_year_id = ?');
      params.push(year_id);
    }
    
    if (month && month !== 'all') {
      conditions.push('MONTH(payment_date) = ?');
      params.push(month);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY MONTH(payment_date) ORDER BY MONTH(payment_date)';
    
    const [rows] = await db.query(sql, params);
    return rows as MonthlyPaymentReport[];
  } catch (error) {
    console.error('Error in getMonthlyPayments:', error);
    return [];
  }
};

export const getClassAverages = async (
  year_id?: number,
  level_id?: string
): Promise<ClassAverageReport[]> => {
  try {
    let sql = `
      SELECT 
        CONCAT('ມ.', l.name, '/', c.name) AS class_name,
        c.id AS class_id,
        AVG(r.average_score) AS average_score
      FROM classes c
      JOIN levels l ON c.level_id = l.id
      JOIN registrations r ON c.id = r.class_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.year_id = ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('r.level_id = ?');
      params.push(level_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY c.id ORDER BY l.id, c.id';
    
    const [rows] = await db.query(sql, params);
    return rows as ClassAverageReport[];
  } catch (error) {
    console.error('Error in getClassAverages:', error);
    return [];
  }
};

export const getStudentTrends = async (): Promise<StudentTrendReport[]> => {
  try {
    const sql = `
      SELECT 
        ay.name AS year_name,
        ay.id AS year_id,
        COUNT(r.student_id) AS student_count
      FROM school_years ay
      LEFT JOIN registrations r ON ay.id = r.year_id
      GROUP BY ay.id
      ORDER BY ay.id
    `;
    
    const [rows] = await db.query(sql);
    return rows as StudentTrendReport[];
  } catch (error) {
    console.error('Error in getStudentTrends:', error);
    return [];
  }
};

export const getAttendanceReports = async (
  year_id?: number,
  class_id?: string
): Promise<AttendanceReport[]> => {
  try {
    let sql = `
      SELECT 
        CASE 
          WHEN MONTH(date) = 1 THEN 'ມັງກອນ'
          WHEN MONTH(date) = 2 THEN 'ກຸມພາ'
          WHEN MONTH(date) = 3 THEN 'ມີນາ'
          WHEN MONTH(date) = 4 THEN 'ເມສາ'
          WHEN MONTH(date) = 5 THEN 'ພຶດສະພາ'
          WHEN MONTH(date) = 6 THEN 'ມິຖຸນາ'
          WHEN MONTH(date) = 7 THEN 'ກໍລະກົດ'
          WHEN MONTH(date) = 8 THEN 'ສິງຫາ'
          WHEN MONTH(date) = 9 THEN 'ກັນຍາ'
          WHEN MONTH(date) = 10 THEN 'ຕຸລາ'
          WHEN MONTH(date) = 11 THEN 'ພະຈິກ'
          WHEN MONTH(date) = 12 THEN 'ທັນວາ'
        END AS month,
        MONTH(date) AS month_number,
        COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*) * 100 AS present_rate,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) / COUNT(*) * 100 AS absent_rate,
        COUNT(DISTINCT date) AS total_days
      FROM attendances a
      JOIN registrations r ON a.registration_id = r.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.year_id = ?');
      params.push(year_id);
    }
    
    if (class_id && class_id !== 'all') {
      conditions.push('r.class_id = ?');
      params.push(class_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY MONTH(date) ORDER BY MONTH(date)';
    
    const [rows] = await db.query(sql, params);
    return rows as AttendanceReport[];
  } catch (error) {
    console.error('Error in getAttendanceReports:', error);
    return [];
  }
};

export const getExamComparisons = async (
  year_id?: number,
  level_id?: string
): Promise<ExamComparisonReport[]> => {
  try {
    let sql = `
      SELECT 
        s.name AS subject_name,
        CONCAT('ມ.', l.name, '/', c.name) AS class_name,
        AVG(e.score) AS average_score,
        MAX(e.score) AS max_score,
        MIN(e.score) AS min_score
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      JOIN registrations r ON e.registration_id = r.id
      JOIN levels l ON r.level_id = l.id
      JOIN classes c ON r.class_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.year_id = ?');
      params.push(year_id);
    }
    
    if (level_id && level_id !== 'all') {
      conditions.push('r.level_id = ?');
      params.push(level_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY s.id, r.class_id ORDER BY s.name, l.id, c.id';
    
    const [rows] = await db.query(sql, params);
    return rows as ExamComparisonReport[];
  } catch (error) {
    console.error('Error in getExamComparisons:', error);
    return [];
  }
};

export const getStudentPerformance = async (
  year_id?: number,
  class_id?: string,
  limit: number = 10
): Promise<StudentPerformanceReport[]> => {
  try {
    let sql = `
      SELECT 
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        s.id AS student_id,
        r.average_score
      FROM students s
      JOIN registrations r ON s.id = r.student_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year_id) {
      conditions.push('r.year_id = ?');
      params.push(year_id);
    }
    
    if (class_id && class_id !== 'all') {
      conditions.push('r.class_id = ?');
      params.push(class_id);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY r.average_score DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await db.query(sql, params);
    
    // สร้างข้อมูลรายวิชาสำหรับแต่ละนักเรียน
    const result = await Promise.all((rows as any[]).map(async (student) => {
      const subjectsSql = `
        SELECT 
          sub.name AS subject_name,
          e.score
        FROM exams e
        JOIN subjects sub ON e.subject_id = sub.id
        WHERE e.registration_id IN (
          SELECT id FROM registrations WHERE student_id = ?
        )
      `;
      
      try {
        const [subjects] = await db.query(subjectsSql, [student.student_id]);
        return {
          ...student,
          subjects: subjects as { subject_name: string; score: number }[]
        };
      } catch (error) {
        console.error('Error fetching subjects for student:', error);
        return {
          ...student,
          subjects: []
        };
      }
    }));
    
    return result as StudentPerformanceReport[];
  } catch (error) {
    console.error('Error in getStudentPerformance:', error);
    return [];
  }
}; 