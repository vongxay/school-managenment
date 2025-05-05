import { Pool, PoolConnection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';

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

export interface CreateRegistrationDTO {
  student_id: string;
  student_name: string; 
  student_phone: string;
  classroom: string;
  level: string;
  school_year: string;
  paid?: boolean;
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
        SELECT r.*, s.student_name_lao as student_name, s.guardian_phone as student_phone
        FROM registrations r
        LEFT JOIN students s ON r.student_id = s.student_id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      
      // เพิ่มเงื่อนไขการค้นหา
      if (filters.search) {
        query += ` AND (
          r.student_id LIKE ? OR 
          s.student_name_lao LIKE ? OR
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
        query += ` AND r.paid = ?`;
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
  
  // ค้นหาการลงทะเบียนตาม ID
  async findById(id: string): Promise<Registration | null> {
    let connection;
    try {
      connection = await db.getConnection();
      
      const query = `
        SELECT r.*, s.student_name_lao as student_name, s.guardian_phone as student_phone
        FROM registrations r
        LEFT JOIN students s ON r.student_id = s.student_id
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
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      const id = `INV-${uuidv4().substring(0, 8)}`;
      const registrationDate = new Date().toISOString().split('T')[0];
      
      const insertQuery = `
        INSERT INTO registrations (
          id, registration_date, student_id, classroom, level, school_year, paid, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        id,
        registrationDate,
        data.student_id,
        data.classroom,
        data.level,
        data.school_year,
        data.paid || false
      ];
      
      await connection.query(insertQuery, values);
      
      await connection.commit();
      
      return id;
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
        updateQuery += `, paid = ?`;
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