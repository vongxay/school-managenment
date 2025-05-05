import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { checkConnection } from './utils/db';
import studentRoutes from './routes/studentRoutes';

// โหลดตัวแปรสภาพแวดล้อม
dotenv.config();

// สร้างแอปพลิเคชัน Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ตรวจสอบการเชื่อมต่อฐานข้อมูล
checkConnection()
  .then((connected) => {
    if (!connected) {
      console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาตรวจสอบการตั้งค่า');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล:', error);
    process.exit(1);
  });

// เส้นทาง API
app.get('/', (req, res) => {
  res.json({ message: 'ยินดีต้อนรับสู่ School Management API' });
});

// นำเข้าเส้นทาง API
app.use('/api/students', studentRoutes);

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์กำลังทำงานที่พอร์ต ${port}`);
}); 