import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../utils/db';
import { v4 as uuidv4 } from 'uuid';
import { formatDateToYMD } from '../utils/dateUtils';

// กำหนดชนิดข้อมูลสำหรับนักเรียน
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
  id_issued_date: Date | string | null;
  birth_village: string;
  birth_district: string;
  birth_province: string;
  ethnicity: string;
  religion: string;
  nationality: string;
  date_of_birth: Date | string | null;
  phone_number: string;
  photo_url: string;
  created_at: Date;
  updated_at: Date;
}

// กำหนดชนิดข้อมูลสำหรับสร้างนักเรียนใหม่
export interface CreateStudentDTO {
  student_id?: string;
  student_name_lao: string;
  guardian_phone?: string;
  gender: 'M' | 'F';
  province?: string;
  district?: string;
  village?: string;
  id_number?: string;
  id_issued_date?: string | null;
  birth_village?: string;
  birth_district?: string;
  birth_province?: string;
  ethnicity?: string;
  religion?: string;
  nationality?: string;
  date_of_birth?: string | null;
  phone_number?: string;
  photo_url?: string;
}

// กำหนดชนิดข้อมูลสำหรับอัปเดตนักเรียน
export interface UpdateStudentDTO {
  student_name_lao?: string;
  guardian_phone?: string;
  gender?: 'M' | 'F';
  province?: string;
  district?: string;
  village?: string;
  id_number?: string;
  id_issued_date?: string | null;
  birth_village?: string;
  birth_district?: string;
  birth_province?: string;
  ethnicity?: string;
  religion?: string;
  nationality?: string;
  date_of_birth?: string | null;
  phone_number?: string;
  photo_url?: string;
}

class StudentModel {
  // ค้นหานักเรียนตาม ID
  async findById(id: string): Promise<Student | null> {
    try {
      const [rows] = await db.execute<Student[]>(
        'SELECT * FROM students WHERE id = ?',
        [id]
      );
      
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
    } catch (error) {
      console.error('Error finding student by ID:', error);
      throw error;
    }
  }

  // ค้นหานักเรียนตามรหัสนักเรียน
  async findByStudentId(studentId: string): Promise<Student | null> {
    try {
      const [rows] = await db.execute<Student[]>(
        'SELECT * FROM students WHERE student_id = ?',
        [studentId]
      );
      
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
    } catch (error) {
      console.error('Error finding student by student ID:', error);
      throw error;
    }
  }

  // ดึงนักเรียนทั้งหมด
  async findAll(filters?: { 
    search?: string, 
    gender?: 'M' | 'F',
    limit?: number,
    offset?: number
  }): Promise<{ students: Student[], total: number }> {
    try {
      let query = 'SELECT * FROM students';
      const countQuery = 'SELECT COUNT(*) as total FROM students';
      const queryParams: any[] = [];
      const countParams: any[] = [];
      
      // สร้างเงื่อนไขการค้นหา
      const conditions: string[] = [];
      
      if (filters?.search) {
        const searchParam = `%${filters.search}%`;
        conditions.push('(student_id LIKE ? OR student_name_lao LIKE ? OR phone_number LIKE ?)');
        queryParams.push(searchParam, searchParam, searchParam);
        countParams.push(searchParam, searchParam, searchParam);
      }
      
      if (filters?.gender) {
        conditions.push('gender = ?');
        queryParams.push(filters.gender);
        countParams.push(filters.gender);
      }
      
      // เพิ่มเงื่อนไขใน query
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
        countQuery === ' WHERE ' + conditions.join(' AND ');
      }
      
      // เพิ่ม ordering
      query += ' ORDER BY student_id';
      
      // เพิ่ม pagination
      if (filters?.limit !== undefined) {
        query += ' LIMIT ?';
        queryParams.push(filters.limit);
        
        if (filters?.offset !== undefined) {
          query += ' OFFSET ?';
          queryParams.push(filters.offset);
        }
      }
      
      // ดึงข้อมูลนักเรียน
      const [rows] = await db.execute<Student[]>(query, queryParams);
      
      // จัดรูปแบบวันที่สำหรับนักเรียนทุกคน
      const formattedStudents = rows.map(student => {
        if (student.date_of_birth) {
          student.date_of_birth = formatDateToYMD(student.date_of_birth);
        }
        
        if (student.id_issued_date) {
          student.id_issued_date = formatDateToYMD(student.id_issued_date);
        }
        
        return student;
      });
      
      // ดึงจำนวนทั้งหมด
      const [countResult] = await db.execute<RowDataPacket[]>(countQuery, countParams);
      const total = countResult[0]?.total || 0;
      
      return {
        students: formattedStudents,
        total
      };
    } catch (error) {
      console.error('Error finding all students:', error);
      throw error;
    }
  }

  // สร้างนักเรียนใหม่
  async create(studentData: CreateStudentDTO): Promise<string> {
    try {
      const id = uuidv4();
      let studentId = studentData.student_id;
      
      // ถ้าไม่มีรหัสนักเรียน ให้สร้างรหัสใหม่
      if (!studentId) {
        // ค้นหารหัสสูงสุดในระบบ
        const [result] = await db.execute<RowDataPacket[]>(
          'SELECT MAX(CAST(student_id AS UNSIGNED)) as max_id FROM students'
        );
        
        const maxId = result[0]?.max_id || 0;
        studentId = String(Number(maxId) + 1).padStart(3, '0');
      }
      
      // แปลงค่าวันที่
      const idIssuedDate = studentData.id_issued_date ? new Date(studentData.id_issued_date) : null;
      const dateOfBirth = studentData.date_of_birth ? new Date(studentData.date_of_birth) : null;
      
      // สร้างนักเรียนใหม่
      await db.execute(
        `INSERT INTO students 
          (id, student_id, student_name_lao, guardian_phone, gender, province, district, village, 
          id_number, id_issued_date, birth_village, birth_district, birth_province, 
          ethnicity, religion, nationality, date_of_birth, phone_number, photo_url) 
        VALUES 
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          studentId,
          studentData.student_name_lao,
          studentData.guardian_phone || '',
          studentData.gender,
          studentData.province || '',
          studentData.district || '',
          studentData.village || '',
          studentData.id_number || '',
          idIssuedDate,
          studentData.birth_village || '',
          studentData.birth_district || '',
          studentData.birth_province || '',
          studentData.ethnicity || '',
          studentData.religion || '',
          studentData.nationality || 'ລາວ',
          dateOfBirth,
          studentData.phone_number || '',
          studentData.photo_url || ''
        ]
      );
      
      return id;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  // อัปเดตข้อมูลนักเรียน
  async update(id: string, studentData: UpdateStudentDTO): Promise<boolean> {
    try {
      // แปลงค่าวันที่
      const idIssuedDate = studentData.id_issued_date ? new Date(studentData.id_issued_date) : undefined;
      const dateOfBirth = studentData.date_of_birth ? new Date(studentData.date_of_birth) : undefined;
      
      // สร้าง query
      let query = 'UPDATE students SET ';
      const values: any[] = [];
      const updateFields: string[] = [];
      
      // ตรวจสอบและเพิ่มฟิลด์ที่ต้องการอัปเดต
      if (studentData.student_name_lao !== undefined) {
        updateFields.push('student_name_lao = ?');
        values.push(studentData.student_name_lao);
      }
      
      if (studentData.guardian_phone !== undefined) {
        updateFields.push('guardian_phone = ?');
        values.push(studentData.guardian_phone);
      }
      
      if (studentData.gender !== undefined) {
        updateFields.push('gender = ?');
        values.push(studentData.gender);
      }
      
      if (studentData.province !== undefined) {
        updateFields.push('province = ?');
        values.push(studentData.province);
      }
      
      if (studentData.district !== undefined) {
        updateFields.push('district = ?');
        values.push(studentData.district);
      }
      
      if (studentData.village !== undefined) {
        updateFields.push('village = ?');
        values.push(studentData.village);
      }
      
      if (studentData.id_number !== undefined) {
        updateFields.push('id_number = ?');
        values.push(studentData.id_number);
      }
      
      if (idIssuedDate !== undefined) {
        updateFields.push('id_issued_date = ?');
        values.push(idIssuedDate);
      }
      
      if (studentData.birth_village !== undefined) {
        updateFields.push('birth_village = ?');
        values.push(studentData.birth_village);
      }
      
      if (studentData.birth_district !== undefined) {
        updateFields.push('birth_district = ?');
        values.push(studentData.birth_district);
      }
      
      if (studentData.birth_province !== undefined) {
        updateFields.push('birth_province = ?');
        values.push(studentData.birth_province);
      }
      
      if (studentData.ethnicity !== undefined) {
        updateFields.push('ethnicity = ?');
        values.push(studentData.ethnicity);
      }
      
      if (studentData.religion !== undefined) {
        updateFields.push('religion = ?');
        values.push(studentData.religion);
      }
      
      if (studentData.nationality !== undefined) {
        updateFields.push('nationality = ?');
        values.push(studentData.nationality);
      }
      
      if (dateOfBirth !== undefined) {
        updateFields.push('date_of_birth = ?');
        values.push(dateOfBirth);
      }
      
      if (studentData.phone_number !== undefined) {
        updateFields.push('phone_number = ?');
        values.push(studentData.phone_number);
      }
      
      if (studentData.photo_url !== undefined) {
        updateFields.push('photo_url = ?');
        values.push(studentData.photo_url);
      }
      
      // ถ้าไม่มีข้อมูลที่ต้องการอัปเดต
      if (updateFields.length === 0) {
        return false;
      }
      
      // สร้าง query สมบูรณ์
      query += updateFields.join(', ') + ' WHERE id = ?';
      values.push(id);
      
      // ทำการอัปเดต
      const [result] = await db.execute<ResultSetHeader>(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // ลบนักเรียน
  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        'DELETE FROM students WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
}

export default new StudentModel();