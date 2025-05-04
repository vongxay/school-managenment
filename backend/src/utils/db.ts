import mysql from 'mysql2/promise';
import config from '../config';

// สร้างพูลของการเชื่อมต่อฐานข้อมูล
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ!');
    connection.release();
    return true;
  } catch (error) {
    console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูล:', error);
    return false;
  }
};

// ส่งออกพูลเพื่อใช้งานกับไฟล์อื่น
export default pool; 