import pool from '../utils/db';

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
      const [result] = await pool.query(
        'INSERT INTO classes (id, name, level) VALUES (?, ?, ?)',
        [classData.id, classData.name, classData.level]
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