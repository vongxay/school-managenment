import pool from '../utils/db';

export interface SchoolYear {
  id: string;
  period: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
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
      // ตั้งค่า name เหมือนกับ period ถ้าไม่มีการระบุ
      if (!yearData.name) {
        yearData.name = yearData.period;
      }
      
      // ตั้งค่าเริ่มต้นสำหรับวันที่ถ้าไม่มีการระบุ
      if (!yearData.start_date) {
        const currentYear = new Date().getFullYear();
        yearData.start_date = `${currentYear}-05-01`;
      }
      
      if (!yearData.end_date) {
        const nextYear = new Date().getFullYear() + 1;
        yearData.end_date = `${nextYear}-04-30`;
      }
      
      // ตรวจสอบรูปแบบวันที่ให้ถูกต้อง
      // ตรวจสอบว่าวันที่เป็น string หรือ Date object
      let startDate = yearData.start_date;
      let endDate = yearData.end_date;
      
      // ถ้าเป็น string ที่อาจมี timestamp ให้แปลงเป็น YYYY-MM-DD
      if (typeof startDate === 'string' && startDate.includes('T')) {
        const date = new Date(startDate);
        startDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      if (typeof endDate === 'string' && endDate.includes('T')) {
        const date = new Date(endDate);
        endDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      // กำหนดค่าเริ่มต้นสำหรับ is_current
      if (yearData.is_current === undefined) {
        yearData.is_current = false;
      }
      
      const [result] = await pool.query(
        'INSERT INTO school_years (id, period, name, start_date, end_date, is_current) VALUES (?, ?, ?, ?, ?, ?)',
        [yearData.id, yearData.period, yearData.name, startDate, endDate, yearData.is_current]
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
      // ดึงข้อมูลปีการศึกษาปัจจุบัน
      const currentYear = await this.getYearById(id);
      if (!currentYear) {
        return false;
      }
      
      // ตั้งค่า name เหมือนกับ period ถ้ามีการอัปเดต period แต่ไม่มีการอัปเดต name
      if (yearData.period && !yearData.name) {
        yearData.name = yearData.period;
      }
      
      // จัดการรูปแบบวันที่
      let startDate = yearData.start_date || currentYear.start_date;
      let endDate = yearData.end_date || currentYear.end_date;
      
      // ถ้าเป็น string ที่อาจมี timestamp ให้แปลงเป็น YYYY-MM-DD
      if (typeof startDate === 'string' && startDate.includes('T')) {
        const date = new Date(startDate);
        startDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      if (typeof endDate === 'string' && endDate.includes('T')) {
        const date = new Date(endDate);
        endDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      const [result] = await pool.query(
        'UPDATE school_years SET period = ?, name = ?, start_date = ?, end_date = ?, is_current = ? WHERE id = ?',
        [
          yearData.period || currentYear.period,
          yearData.name || currentYear.name,
          startDate,
          endDate,
          yearData.is_current !== undefined ? yearData.is_current : currentYear.is_current,
          id
        ]
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