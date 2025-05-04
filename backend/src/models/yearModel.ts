import pool from '../utils/db';

export interface SchoolYear {
  id: string;
  period: string;
}

class YearModel {
  // ดึงข้อมูลปีการศึกษาทั้งหมด
  async getAllYears(): Promise<SchoolYear[]> {
    try {
      const [rows] = await pool.query('SELECT * FROM school_years');
      return rows as SchoolYear[];
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลปีการศึกษา:', error);
      throw error;
    }
  }

  // ดึงข้อมูลปีการศึกษาตาม ID
  async getYearById(id: string): Promise<SchoolYear | null> {
    try {
      const [rows] = await pool.query('SELECT * FROM school_years WHERE id = ?', [id]);
      const years = rows as SchoolYear[];
      return years.length > 0 ? years[0] : null;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลปีการศึกษาตาม ID:', error);
      throw error;
    }
  }

  // เพิ่มปีการศึกษาใหม่
  async createYear(yearData: SchoolYear): Promise<SchoolYear> {
    try {
      const [result] = await pool.query(
        'INSERT INTO school_years (id, period) VALUES (?, ?)',
        [yearData.id, yearData.period]
      );
      return yearData;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มปีการศึกษา:', error);
      throw error;
    }
  }

  // อัปเดตข้อมูลปีการศึกษา
  async updateYear(id: string, yearData: Partial<SchoolYear>): Promise<boolean> {
    try {
      const [result] = await pool.query(
        'UPDATE school_years SET period = ? WHERE id = ?',
        [yearData.period, id]
      );
      const resultOk = result as { affectedRows: number };
      return resultOk.affectedRows > 0;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตปีการศึกษา:', error);
      throw error;
    }
  }

  // ลบปีการศึกษา
  async deleteYear(id: string): Promise<boolean> {
    try {
      const [result] = await pool.query('DELETE FROM school_years WHERE id = ?', [id]);
      const resultOk = result as { affectedRows: number };
      return resultOk.affectedRows > 0;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบปีการศึกษา:', error);
      throw error;
    }
  }
}

export default new YearModel(); 