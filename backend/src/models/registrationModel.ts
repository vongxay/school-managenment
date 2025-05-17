import { Pool, PoolConnection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
export interface Registration {
  id: string;
  registration_date: string;
  student_id: string;
  student_name: string;
  student_phone: string;
  classroom: string;
  level: string;
  school_year: string;
  paid: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ClassRoom {
  id: string;
  name: string;
  level: string;
}

export interface CreateRegistrationDTO {
  student_id: string;
  student_name: string; 
  student_phone: string;
  classroom: string;
  level: string;
  school_year: string;
  paid?: boolean;
  registered_by?: string; // ຜູ້ລົງທະບຽນ
}

export interface UpdateRegistrationDTO {
  student_id?: string;
  student_name?: string;
  student_phone?: string;
  classroom?: string;
  level?: string;
  school_year?: string;
  paid?: boolean;
}

export interface RegistrationFilters {
  search?: string;
  schoolYear?: string;
  paid?: boolean;
  limit?: number;
  offset?: number;
}

class RegistrationModel {
  // ค้นหาการลงทะเบียนทั้งหมด
  async findAll(filters: RegistrationFilters = {}): Promise<{ registrations: Registration[], total: number }> {
    let connection;
    try {
      connection = await db.getConnection();
      
      let query = `
        SELECT 
          r.id, 
          r.invoice_id,
          r.registration_date, 
          r.student_id, 
          r.student_name, 
          r.student_phone,
          r.classroom, 
          r.level, 
          r.school_year, 
          r.is_paid as paid,
          r.created_at,
          r.updated_at
        FROM registrations r
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      
      // เพิ่มเงื่อนไขการค้นหา
      if (filters.search) {
        query += ` AND (
          r.student_id LIKE ? OR 
          r.student_name LIKE ? OR
          r.id LIKE ?
        )`;
        const searchPattern = `%${filters.search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }
      
      if (filters.schoolYear) {
        query += ` AND r.school_year = ?`;
        queryParams.push(filters.schoolYear);
      }
      
      if (filters.paid !== undefined) {
        query += ` AND r.is_paid = ?`;
        queryParams.push(filters.paid);
      }
      
      // คำสั่ง SQL สำหรับนับจำนวนทั้งหมด
      const countQuery = `SELECT COUNT(*) as count FROM (${query}) AS count_query`;
      const [countResult] = await connection.query(countQuery, queryParams);
      const total = parseInt((countResult as any)[0].count);
      
      // เพิ่มการเรียงลำดับและการแบ่งหน้า
      query += ` ORDER BY r.registration_date DESC`;
      
      if (filters.limit) {
        query += ` LIMIT ?`;
        queryParams.push(filters.limit);
      }
      
      if (filters.offset) {
        query += ` OFFSET ?`;
        queryParams.push(filters.offset);
      }
      
      const [rows] = await connection.query(query, queryParams);
      
      return {
        registrations: rows as Registration[],
        total
      };
    } finally {
      if (connection) connection.release();
    }
  }
  
  async findAllStudentsGroupedByClass(): Promise<{ class: ClassRoom; students: Registration[] }[]> {
    let connection;
    try {
        connection = await db.getConnection();

        // Query all classes
        const classesQuery = `
            SELECT 
                id, 
                name, 
                level 
            FROM classes
        `;
        const [classesRows] = await connection.query(classesQuery);
        const classes = classesRows as ClassRoom[];

        const result = [];

        // For each class, query the students in the registrations table
        for (const classRoom of classes) {
            const studentsQuery = `
                SELECT 
                    r.id, 
                    r.registration_date, 
                    r.student_id, 
                    r.student_name, 
                    r.student_phone, 
                    r.classroom, 
                    r.level, 
                    r.school_year, 
                    r.is_paid as paid, 
                    r.created_at, 
                    r.updated_at
                FROM registrations r
                WHERE r.classroom = ?
            `;
            const [studentsRows] = await connection.query(studentsQuery, [classRoom.id]);
            const students = studentsRows as Registration[];

            // Combine class details with its students
            result.push({
                class: classRoom,
                students: students,
            });
        }

        return result;
    } finally {
        if (connection) connection.release();
    }
}


async getCurrentRegistration(): Promise<String> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
          `SELECT id FROM registrations ORDER BY id DESC LIMIT 1`
        );
        let newId = 'INV-001'; // Default value if no registrations exist
        if (rows.length > 0 && rows[0].id) {
            const lastId = rows[0].id; // Example: 'INV-001'
            const numericPart = parseInt(lastId.replace('INV-', ''), 10); // Extract numeric part (e.g., 1)
            const incrementedPart = numericPart + 1; // Increment the numeric part
            newId = `INV-${String(incrementedPart).padStart(3, '0')}`; // Format as 'INV-002'
        }
  return newId;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลระดับชั้น:', error);
      throw error;
    }
  }

  // ค้นหาการลงทะเบียนตาม ID
  async findById(id: string): Promise<Registration | null> {
  let connection;
  try {
    connection = await db.getConnection();

    const query = `
      SELECT 
        r.id, 
        r.invoice_id,
        r.registration_date, 
        r.student_id, 
        r.student_name, 
        r.student_phone,
        r.classroom, 
        r.level, 
        sy.name as school_year,  -- Get the name from school_years
        r.is_paid as paid,
        r.created_at,
        r.updated_at
      FROM registrations r
      LEFT JOIN school_years sy ON r.school_year = sy.id
      WHERE r.id = ?
    `;
    const [rows] = await connection.query(query, [id]);

    return (rows as any[])[0] || null;
  } finally {
    if (connection) connection.release();
  }
}
  
  // สร้างการลงทะเบียนใหม่
  async create(data: CreateRegistrationDTO): Promise<string> {
    let connection;
        try {
        const [rows] = await db.query<RowDataPacket[]>(
          `SELECT id FROM registrations ORDER BY id DESC LIMIT 1`
        );
        let newId = 'INV-001'; // Default value if no registrations exist
        if (rows.length > 0 && rows[0].id) {
            const lastId = rows[0].id; // Example: 'INV-001'
            const numericPart = parseInt(lastId.replace('INV-', ''), 10); // Extract numeric part (e.g., 1)
            const incrementedPart = numericPart + 1; // Increment the numeric part
            newId = `INV-${String(incrementedPart).padStart(3, '0')}`; // Format as 'INV-002'
        }
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      const registrationDate = new Date().toISOString().split('T')[0];
      
      // ກວດສອບວ່ານັກຮຽນມີໃນລະບົບຫຼືບໍ່
      const [studentRows] = await connection.query(
        'SELECT * FROM students WHERE student_id = ?',
        [data.student_id]
      );
      
      // ຖ້າບໍ່ພົບນັກຮຽນ, ໃຫ້ສ້າງນັກຮຽນໃໝ່
      if ((studentRows as any[]).length === 0) {
        console.log(`ບໍ່ພົບນັກຮຽນ ID: ${data.student_id}, ກຳລັງສ້າງນັກຮຽນໃໝ່...`);
        
        const studentId = uuidv4();
        const insertStudentQuery = `
          INSERT INTO students (
            id, 
            student_id, 
            student_name_lao, 
            guardian_phone, 
            gender,
            nationality
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await connection.query(insertStudentQuery, [
          studentId,
          data.student_id,
          data.student_name,
          data.student_phone,
          'M', // ກຳນົດເປັນເພດຊາຍໂດຍຄ່າເລີ່ມຕົ້ນ, ສາມາດແກ້ໄຂໄດ້ພາຍຫຼັງ
          'ລາວ'
        ]);
        
        console.log(`ສ້າງນັກຮຽນໃໝ່ສຳເລັດ: ${data.student_name}`);
      }
      
      const insertQuery = `
        INSERT INTO registrations (
          id, 
          invoice_id, 
          student_id, 
          student_name, 
          student_phone, 
          classroom, 
          level, 
          school_year, 
          is_paid,
          registered_by,
          registration_date,
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        newId, // Use the new incremented ID
        newId,// ใช้ id เดียวกันสำหรับ invoice_id
        data.student_id,
        data.student_name,
        data.student_phone,
        data.classroom,
        data.level,
        data.school_year,
        data.paid || false,
        data.registered_by || '', // ຖ້າບໍ່ມີການລະບຸ, ສະເລີຍໃສ່ 'system'
        registrationDate
      ];
      
      await connection.query(insertQuery, values);
      
      await connection.commit();
      
      return newId;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
  
  // อัปเดตการลงทะเบียน
  async update(id: string, data: UpdateRegistrationDTO): Promise<boolean> {
    let connection;
    
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      let updateQuery = 'UPDATE registrations SET updated_at = NOW()';
      const queryParams: any[] = [];
      
      if (data.student_id !== undefined) {
        updateQuery += `, student_id = ?`;
        queryParams.push(data.student_id);
      }
      
      if (data.student_name !== undefined) {
        updateQuery += `, student_name = ?`;
        queryParams.push(data.student_name);
      }
      
      if (data.student_phone !== undefined) {
        updateQuery += `, student_phone = ?`;
        queryParams.push(data.student_phone);
      }
      
      if (data.classroom !== undefined) {
        updateQuery += `, classroom = ?`;
        queryParams.push(data.classroom);
      }
      
      if (data.level !== undefined) {
        updateQuery += `, level = ?`;
        queryParams.push(data.level);
      }
      
      if (data.school_year !== undefined) {
        updateQuery += `, school_year = ?`;
        queryParams.push(data.school_year);
      }
      
      if (data.paid !== undefined) {
        updateQuery += `, is_paid = ?`;
        queryParams.push(data.paid);
      }
      
      updateQuery += ` WHERE id = ?`;
      queryParams.push(id);
      
      const [result] = await connection.query(updateQuery, queryParams);
      
      await connection.commit();
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
  
  // ลบการลงทะเบียน
  async delete(id: string): Promise<boolean> {
    let connection;
    
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      // ตรวจสอบความสัมพันธ์ก่อนลบ
      const deleteQuery = 'DELETE FROM registrations WHERE id = ?';
      const [result] = await connection.query(deleteQuery, [id]);
      
      await connection.commit();
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

export default new RegistrationModel(); 