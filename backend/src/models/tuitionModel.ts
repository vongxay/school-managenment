import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';

// Interface สำหรับข้อมูลค่าเล่าเรียน
export interface Tuition {
  id: string;
  name: string;
  year: string;
  level: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

class TuitionModel {
  // ดึงข้อมูลค่าเล่าเรียนทั้งหมด
  async getAllTuitions(): Promise<Tuition[]> {
    const [rows] = await db.execute('SELECT * FROM tuition_fees ORDER BY level, year');
    return rows as Tuition[];
  }

  // ดึงข้อมูลค่าเล่าเรียนตาม ID
  async getTuitionById(id: string): Promise<Tuition | null> {
    const [rows] = await db.execute('SELECT * FROM tuition_fees WHERE id = ?', [id]);
    const tuitions = rows as Tuition[];
    return tuitions.length > 0 ? tuitions[0] : null;
  }

  // เพิ่มค่าเล่าเรียนใหม่
  async createTuition(tuitionData: Tuition): Promise<Tuition> {
    // ถ้าไม่มี ID ให้สร้าง UUID
    if (!tuitionData.id) {
      tuitionData.id = uuidv4();
    }

    await db.execute(
      'INSERT INTO tuition_fees (id, name, year, level, amount) VALUES (?, ?, ?, ?, ?)',
      [tuitionData.id, tuitionData.name, tuitionData.year, tuitionData.level, tuitionData.amount]
    );

    return tuitionData;
  }

  // อัปเดตข้อมูลค่าเล่าเรียน
  async updateTuition(id: string, tuitionData: Partial<Tuition>): Promise<boolean> {
    const result = await db.execute(
      'UPDATE tuition_fees SET name = ?, year = ?, level = ?, amount = ? WHERE id = ?',
      [tuitionData.name, tuitionData.year, tuitionData.level, tuitionData.amount, id]
    );

    return (result as any)[0].affectedRows > 0;
  }

  // ลบค่าเล่าเรียน
  async deleteTuition(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM tuition_fees WHERE id = ?', [id]);
    return (result as any)[0].affectedRows > 0;
  }

  // ดึงข้อมูลค่าเล่าเรียนตามระดับชั้นและปีการศึกษา
  async getTuitionByLevelAndYear(level: string, year: string): Promise<Tuition | null> {
    const [rows] = await db.execute(
      'SELECT * FROM tuition_fees WHERE level = ? AND year = ?',
      [level, year]
    );
    const tuitions = rows as Tuition[];
    return tuitions.length > 0 ? tuitions[0] : null;
  }
}

export default new TuitionModel(); 