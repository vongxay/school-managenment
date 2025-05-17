import db from '../utils/db';

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Level {
  id: string;
  name: string;
  description?: string;
}

export interface Class {
  id: string;
  name: string;
  level_id: string;
  teacher_id?: string;
  description?: string;
}

// ดึงข้อมูลปีการศึกษาทั้งหมด
export const getAcademicYears = async (): Promise<AcademicYear[]> => {
  try {
    // ตรวจสอบว่ามีตาราง academic_years หรือไม่
    try {
      await db.query('SELECT 1 FROM academic_years LIMIT 1');
      
      const sql = `
        SELECT id, name, start_date, end_date, is_current
        FROM academic_years
        ORDER BY start_date DESC
      `;
      
      const [rows] = await db.query(sql);
      return rows as AcademicYear[];
    } catch (error) {
      // ถ้าไม่มีตาราง academic_years ให้ใช้ข้อมูลจำลอง
      return [
        { id: 1, name: '2024-2025', start_date: '2024-05-01', end_date: '2025-04-30', is_current: true },
        { id: 2, name: '2025-2026', start_date: '2025-05-01', end_date: '2026-04-30', is_current: false }
      ];
    }
  } catch (error) {
    console.error('Error in getAcademicYears:', error);
    return [
      { id: 1, name: '2024-2025', start_date: '2024-05-01', end_date: '2025-04-30', is_current: true },
      { id: 2, name: '2025-2026', start_date: '2025-05-01', end_date: '2026-04-30', is_current: false }
    ];
  }
};

// ดึงข้อมูลชั้นเรียนทั้งหมด
export const getLevels = async (): Promise<Level[]> => {
  try {
    // ตรวจสอบว่ามีตาราง levels หรือไม่
    try {
      await db.query('SELECT 1 FROM levels LIMIT 1');
      
      const sql = `
        SELECT id, name, description
        FROM levels
        ORDER BY id
      `;
      
      const [rows] = await db.query(sql);
      return rows as Level[];
    } catch (error) {
      // ถ้าไม่มีตาราง levels ให้ใช้ข้อมูลจำลอง
      return [
        { id: '1', name: 'ຊັ້ນ ມ 1' },
        { id: '2', name: 'ຊັ້ນ ມ 2' },
        { id: '3', name: 'ຊັ້ນ ມ 3' },
        { id: '4', name: 'ຊັ້ນ ມ 4' },
        { id: '5', name: 'ຊັ້ນ ມ 5' },
        { id: '6', name: 'ຊັ້ນ ມ 6' },
        { id: '7', name: 'ຊັ້ນ ມ 7' },
      ];
    }
  } catch (error) {
    console.error('Error in getLevels:', error);
    return [
      { id: '1', name: 'ຊັ້ນ ມ 1' },
      { id: '2', name: 'ຊັ້ນ ມ 2' },
      { id: '3', name: 'ຊັ້ນ ມ 3' },
      { id: '4', name: 'ຊັ້ນ ມ 4' },
      { id: '5', name: 'ຊັ້ນ ມ 5' },
      { id: '6', name: 'ຊັ້ນ ມ 6' },
      { id: '7', name: 'ຊັ້ນ ມ 7' },
    ];
  }
};

// ดึงข้อมูลห้องเรียนทั้งหมด หรือกรองตามชั้นเรียน
export const getClasses = async (level_id?: string): Promise<Class[]> => {
  try {
    // ตรวจสอบว่ามีตาราง classes หรือไม่
    try {
      await db.query('SELECT 1 FROM classes LIMIT 1');
      
      let sql = `
        SELECT id, name, level_id, teacher_id, description
        FROM classes
      `;
      
      const params = [];
      
      if (level_id && level_id !== 'all') {
        sql += ' WHERE level_id = ?';
        params.push(level_id);
      }
      
      sql += ' ORDER BY level_id, name';
      
      const [rows] = await db.query(sql, params);
      return rows as Class[];
    } catch (error) {
      // ถ้าไม่มีตาราง classes ให้ใช้ข้อมูลจำลอง
      const mockClasses = [
        { id: '1', name: 'ຫ້ອງ 1', level_id: '1' },
        { id: '2', name: 'ຫ້ອງ 2', level_id: '1' },
        { id: '3', name: 'ຫ້ອງ 1', level_id: '2' },
        { id: '4', name: 'ຫ້ອງ 2', level_id: '2' },
        { id: '5', name: 'ຫ້ອງ 1', level_id: '3' },
        { id: '6', name: 'ຫ້ອງ 2', level_id: '3' },
        { id: '7', name: 'ຫ້ອງ 1', level_id: '4' },
        { id: '8', name: 'ຫ້ອງ 2', level_id: '4' },
        { id: '9', name: 'ຫ້ອງ 1', level_id: '5' },
        { id: '10', name: 'ຫ້ອງ 2', level_id: '5' },
        { id: '11', name: 'ຫ້ອງ 1', level_id: '6' },
        { id: '12', name: 'ຫ້ອງ 2', level_id: '6' },
        { id: '13', name: 'ຫ້ອງ 1', level_id: '7' },
        { id: '14', name: 'ຫ້ອງ 2', level_id: '7' },
      ];
      
      // กรองตาม level_id ถ้ามีการระบุ
      if (level_id && level_id !== 'all') {
        return mockClasses.filter(c => c.level_id === level_id);
      }
      
      return mockClasses;
    }
  } catch (error) {
    console.error('Error in getClasses:', error);
    const mockClasses = [
      { id: '1', name: 'ຫ້ອງ 1', level_id: '1' },
      { id: '2', name: 'ຫ້ອງ 2', level_id: '1' },
      { id: '3', name: 'ຫ້ອງ 1', level_id: '2' },
      { id: '4', name: 'ຫ້ອງ 2', level_id: '2' },
    ];
    
    // กรองตาม level_id ถ้ามีการระบุ
    if (level_id && level_id !== 'all') {
      return mockClasses.filter(c => c.level_id === level_id);
    }
    
    return mockClasses;
  }
}; 