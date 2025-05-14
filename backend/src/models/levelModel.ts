import pool from '../utils/db';
import { db } from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface Level {
  id: string;
  name: string;
}

class LevelModel {
  // ดึงข้อมูลระดับชั้นทั้งหมด
  async getAllLevels(): Promise<Level[]> {
    try {
      const [rows] = await pool.query('SELECT * FROM levels');
      return rows as Level[];
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลระดับชั้น:', error);
      throw error;
    }
  }
  async getCurrentLevels(): Promise<String> {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id FROM levels ORDER BY id DESC LIMIT 1`
    );

    let newLevelId = '001'; // Default value if no students exist
    if (rows.length > 0 && rows[0].id) {
        const lastStudentId = rows[0].id;
        const numericPart = parseInt(lastStudentId, 10); // Extract numeric part
        newLevelId = String(numericPart + 1).padStart(3, '0'); // Increment and pad with leading zeros
    }
  return newLevelId;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลระดับชั้น:', error);
      throw error;
    }
  }

  // ดึงข้อมูลระดับชั้นตาม ID
  async getLevelById(id: string): Promise<Level | null> {
    try {
      const [rows] = await pool.query('SELECT * FROM levels WHERE id = ?', [id]);
      const levels = rows as Level[];
      return levels.length > 0 ? levels[0] : null;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลระดับชั้นตาม ID:', error);
      throw error;
    }
  }

  // เพิ่มระดับชั้นใหม่
  async createLevel(levelData: Level): Promise<Level> {
    try {
      const [result] = await pool.query(
        'INSERT INTO levels (id, name) VALUES (?, ?)',
        [levelData.id, levelData.name]
      );
      return levelData;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มระดับชั้น:', error);
      throw error;
    }
  }

  // อัปเดตข้อมูลระดับชั้น
  async updateLevel(id: string, levelData: Partial<Level>): Promise<boolean> {
    try {
      const [result] = await pool.query(
        'UPDATE levels SET name = ? WHERE id = ?',
        [levelData.name, id]
      );
      const resultOk = result as { affectedRows: number };
      return resultOk.affectedRows > 0;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตระดับชั้น:', error);
      throw error;
    }
  }

  // ลบระดับชั้น
  async deleteLevel(id: string): Promise<boolean> {
    try {
      const [result] = await pool.query('DELETE FROM levels WHERE id = ?', [id]);
      const resultOk = result as { affectedRows: number };
      return resultOk.affectedRows > 0;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบระดับชั้น:', error);
      throw error;
    }
  }
}

export default new LevelModel(); 