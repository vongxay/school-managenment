import pool from '../utils/db';

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