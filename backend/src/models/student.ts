import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/db';
import { formatDateToYMD } from '../utils/dateUtils';

export interface Student extends RowDataPacket {
  id: string;
  student_id: string;
  student_name_lao: string;
  guardian_phone: string;
  gender: 'M' | 'F';
  province: string;
  district: string;
  village: string;
  id_number: string;
  id_issued_date: string;
  birth_village: string;
  birth_district: string;
  birth_province: string;
  ethnicity: string;
  religion: string;
  nationality: string;
  date_of_birth: string;
  phone_number: string;
  photo_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentRegistration extends RowDataPacket {
  id: string;
  invoice_id: string;
  student_id: string;
  classroom_id: string;
  school_year_id: string;
  registration_date: string;
  tuition_fee: number;
  is_paid: boolean;
  registered_by: string;
  created_at?: string;
  updated_at?: string;
}

export const StudentModel = {
  findAll: async (): Promise<Student[]> => {
    const [rows] = await db.query<Student[]>('SELECT * FROM students');
    
    // จัดรูปแบบวันที่สำหรับนักเรียนทุกคน
    return rows.map(student => {
      if (student.date_of_birth) {
        student.date_of_birth = formatDateToYMD(student.date_of_birth);
      }
      
      if (student.id_issued_date) {
        student.id_issued_date = formatDateToYMD(student.id_issued_date);
      }
      
      return student;
    });
  },
  findCurrentId: async (): Promise<String> => {
     // Query the latest student_id
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT student_id FROM students ORDER BY student_id DESC LIMIT 1`
    );

    let newStudentId = '001'; // Default value if no students exist
    if (rows.length > 0 && rows[0].student_id) {
        const lastStudentId = rows[0].student_id;
        const numericPart = parseInt(lastStudentId, 10); // Extract numeric part
        newStudentId = String(numericPart + 1).padStart(3, '0'); // Increment and pad with leading zeros
    }
  return newStudentId;
  },
  
  findById: async (id: string): Promise<Student | null> => {
    const [rows] = await db.query<Student[]>('SELECT * FROM students WHERE student_id = ?', [id]);
    
    if (rows.length > 0) {
      const student = rows[0];
      
      // จัดรูปแบบวันที่
      if (student.date_of_birth) {
        student.date_of_birth = formatDateToYMD(student.date_of_birth);
      }
      
      if (student.id_issued_date) {
        student.id_issued_date = formatDateToYMD(student.id_issued_date);
      }
      
      return student;
    }
    
    return null;
  },
  
  findByStudentId: async (studentId: string): Promise<Student | null> => {
    const [rows] = await db.query<Student[]>('SELECT * FROM students WHERE student_id = ?', [studentId]);
    
    if (rows.length > 0) {
      const student = rows[0];
      
      // จัดรูปแบบวันที่
      if (student.date_of_birth) {
        student.date_of_birth = formatDateToYMD(student.date_of_birth);
      }
      
      if (student.id_issued_date) {
        student.id_issued_date = formatDateToYMD(student.id_issued_date);
      }
      
      return student;
    }
    
    return null;
  },
  
  create: async (student: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'student_id'>): Promise<string> => {
    const id = uuidv4();

    // Query the latest student_id
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT student_id FROM students ORDER BY student_id DESC LIMIT 1`
    );

    let newStudentId = '001'; // Default value if no students exist
    if (rows.length > 0 && rows[0].student_id) {
        const lastStudentId = rows[0].student_id;
        const numericPart = parseInt(lastStudentId, 10); // Extract numeric part
        newStudentId = String(numericPart + 1).padStart(3, '0'); // Increment and pad with leading zeros
    }

    // Insert the new student with the generated student_id
    await db.query<ResultSetHeader>(
      `INSERT INTO students (
        id, student_id, student_name_lao, guardian_phone, gender, 
        province, district, village, id_number, id_issued_date, 
        birth_village, birth_district, birth_province, ethnicity, 
        religion, nationality, date_of_birth, phone_number, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, newStudentId, student.student_name_lao, student.guardian_phone, student.gender,
        student.province, student.district, student.village, student.id_number, student.id_issued_date,
        student.birth_village, student.birth_district, student.birth_province, student.ethnicity,
        student.religion, student.nationality, student.date_of_birth, student.phone_number, student.photo_url
      ]
    );

    return id;
},
  
  update: async (id: string, student: Partial<Student>): Promise<boolean> => {
    // สร้างคำสั่ง SQL แบบไดนามิก
    const keys = Object.keys(student);
    if (keys.length === 0) return false;
    
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(student), id];
    
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE students SET ${updates} WHERE student_id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const [result] = await db.query<ResultSetHeader>('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  deleteWithAll: async (id: string): Promise<boolean> => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    console.log('id:',id)
    // 1. Get all registration IDs for this student
    const [regRows] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM registrations WHERE student_id = ?',
      [id]
    );
    const registrationIds = regRows.map((row: any) => row.id);

    // 2. Delete payments for each registration_id
    if (registrationIds.length > 0) {
      const placeholders = registrationIds.map(() => '?').join(',');
      await connection.query<ResultSetHeader>(
        `DELETE FROM payments WHERE registration_id IN (${placeholders})`,
        registrationIds
      );
    }

    // 3. Delete registrations for this student
    await connection.query<ResultSetHeader>(
      'DELETE FROM registrations WHERE student_id = ?',
      [id]
    );

    // 4. Delete the student
    const [result] = await connection.query<ResultSetHeader>(
      'DELETE FROM students WHERE student_id = ?',
      [id]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error('เกิดข้อผิดพลาดในการลบนักเรียนและข้อมูลที่เกี่ยวข้อง:', error);
    throw error;
  } finally {
    connection.release();
  }
},

  
  // เพิ่มเติมสำหรับการค้นหา
  search: async (query: string): Promise<Student[]> => {
    const searchPattern = `%${query}%`;
    const [rows] = await db.query<Student[]>(
      `SELECT * FROM students 
       WHERE student_id LIKE ? 
       OR student_name_lao LIKE ? 
       OR phone_number LIKE ?`,
      [searchPattern, searchPattern, searchPattern]
    );
    return rows;
  },
  
  // ดึงข้อมูลการลงทะเบียน
  getRegistrations: async (studentId?: string): Promise<StudentRegistration[]> => {
    let query = `
      SELECT r.*, s.student_name_lao as student_name, c.name as classroom, 
      l.name as level, sy.name as school_year, s.phone_number as student_phone
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN classrooms c ON r.classroom_id = c.id
      JOIN levels l ON c.level_id = l.id
      JOIN school_years sy ON r.school_year_id = sy.id
    `;
    
    const params = [];
    if (studentId) {
      query += " WHERE r.student_id = ?";
      params.push(studentId);
    }
    
    const [rows] = await db.query<any[]>(query, params);
    
    // จัดรูปแบบวันที่ในข้อมูลการลงทะเบียน
    return rows.map(registration => {
      if (registration.registration_date) {
        registration.registration_date = formatDateToYMD(registration.registration_date);
      }
      return registration;
    });
  },
  
  // หาข้อมูลการลงทะเบียนตาม Invoice ID
  getRegistrationByInvoiceId: async (invoiceId: string): Promise<StudentRegistration | null> => {
    const [rows] = await db.query<any[]>(
      `SELECT r.*, s.student_name_lao as student_name, c.name as classroom, 
      l.name as level, sy.name as school_year, s.phone_number as student_phone
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN classrooms c ON r.classroom_id = c.id
      JOIN levels l ON c.level_id = l.id
      JOIN school_years sy ON r.school_year_id = sy.id
      WHERE r.invoice_id = ?`,
      [invoiceId]
    );
    
    if (rows.length > 0) {
      const registration = rows[0];
      
      // จัดรูปแบบวันที่
      if (registration.registration_date) {
        registration.registration_date = formatDateToYMD(registration.registration_date);
      }
      
      return registration;
    }
    
    return null;
  },
  
  // ค้นหาข้อมูลการลงทะเบียน
  searchRegistrations: async (query: string): Promise<StudentRegistration[]> => {
    const searchPattern = `%${query}%`;
    const [rows] = await db.query<any[]>(
      `SELECT r.*, s.student_name_lao as student_name, c.name as classroom, 
      l.name as level, sy.name as school_year, s.phone_number as student_phone
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN classrooms c ON r.classroom_id = c.id
      JOIN levels l ON c.level_id = l.id
      JOIN school_years sy ON r.school_year_id = sy.id
      WHERE r.invoice_id LIKE ? 
      OR s.student_id LIKE ? 
      OR s.student_name_lao LIKE ? 
      OR s.phone_number LIKE ?`,
      [searchPattern, searchPattern, searchPattern, searchPattern]
    );
    
    // จัดรูปแบบวันที่ในข้อมูลการลงทะเบียน
    return rows.map(registration => {
      if (registration.registration_date) {
        registration.registration_date = formatDateToYMD(registration.registration_date);
      }
      return registration;
    });
  },
  
  // อัปเดตสถานะการชำระเงิน
  updatePaymentStatus: async (registrationId: string, isPaid: boolean): Promise<boolean> => {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE registrations SET is_paid = ? WHERE id = ?',
      [isPaid, registrationId]
    );
    
    return result.affectedRows > 0;
  }
}; 