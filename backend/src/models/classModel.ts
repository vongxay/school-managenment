import pool from '../utils/db';
import { db } from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface ClassRoom {
  id: string;
  name: string;
  level: string;
}

class ClassModel {
  // ดึงข้อมูลห้องเรียนทั้งหมด
  async getAllClasses(): Promise<ClassRoom[]> {
    try {
      const [rows] = await pool.query('SELECT * FROM classes');
      return rows as ClassRoom[];
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลห้องเรียน:', error);
      throw error;
    }
  }

  async getCurrentClassesId(): Promise<String> {
    try {
         const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id FROM classes ORDER BY id DESC LIMIT 1`
    );

    let newClassId = '001'; // Default value if no students exist
    if (rows.length > 0 && rows[0].id) {
        const lastStudentId = rows[0].id;
        const numericPart = parseInt(lastStudentId, 10); // Extract numeric part
        newClassId = String(numericPart + 1).padStart(3, '0'); // Increment and pad with leading zeros
    }
  return newClassId;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลห้องเรียน:', error);
      throw error;
    }
  }

  // ดึงข้อมูลห้องเรียนตาม ID
  async getClassById(id: string): Promise<ClassRoom | null> {
    try {
      const [rows] = await pool.query('SELECT * FROM classes WHERE id = ?', [id]);
      const classes = rows as ClassRoom[];
      return classes.length > 0 ? classes[0] : null;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลห้องเรียนตาม ID:', error);
      throw error;
    }
  }

  // เพิ่มห้องเรียนใหม่
  async createClass(classData: ClassRoom): Promise<ClassRoom> {
    try {

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id FROM classes ORDER BY id DESC LIMIT 1`
    );

    let newClassId = '001'; // Default value if no students exist
    if (rows.length > 0 && rows[0].id) {
        const lastStudentId = rows[0].id;
        const numericPart = parseInt(lastStudentId, 10); // Extract numeric part
        newClassId = String(numericPart + 1).padStart(3, '0'); // Increment and pad with leading zeros
    }

      const [result] = await pool.query(
        'INSERT INTO classes (id, name, level) VALUES (?, ?, ?)',
        [newClassId, classData.name, classData.level]
      );
      return classData;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มห้องเรียน:', error);
      throw error;
    }
  }

  // อัปเดตข้อมูลห้องเรียน
  async updateClass(id: string, classData: Partial<ClassRoom>): Promise<boolean> {
    try {
      const [result] = await pool.query(
        'UPDATE classes SET name = ?, level = ? WHERE id = ?',
        [classData.name, classData.level, id]
      );
      const resultOk = result as { affectedRows: number };
      return resultOk.affectedRows > 0;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตห้องเรียน:', error);
      throw error;
    }
  }

  // ลบห้องเรียน
  async deleteClass(id: string): Promise<boolean> {
    try {
      const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [id]);
      const resultOk = result as { affectedRows: number };
      return resultOk.affectedRows > 0;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบห้องเรียน:', error);
      throw error;
    }
  }
}

export default new ClassModel(); 