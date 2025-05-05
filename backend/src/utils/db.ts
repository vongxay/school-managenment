import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// สร้างการเชื่อมต่อกับฐานข้อมูล
export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// ตรวจสอบการเชื่อมต่อ
export const checkConnection = async (): Promise<boolean> => {
  try {
    const connection = await db.getConnection();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
    connection.release();
    return true;
  } catch (error) {
    console.error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await db.getConnection();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ!');
    connection.release();
    return true;
  } catch (error) {
    console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูล:', error);
    return false;
  }
};

// ส่งออกพูลเพื่อใช้งานกับไฟล์อื่น
export default db; 