import express from 'express';import cors from 'cors';import dotenv from 'dotenv';import morgan from 'morgan';import { checkConnection } from './utils/db';import apiRoutes from './routes/index';import authRoutes from './routes/authRoutes';import userRoutes from './routes/userRoutes';import studentRoutes from './routes/studentRoutes';import levelRoutes from './routes/levelRoutes';import classRoutes from './routes/classRoutes';import yearRoutes from './routes/yearRoutes';import registrationRoutes from './routes/registrationRoutes';import tuitionRoutes from './routes/tuitionRoutes';import paymentRoutes from './routes/paymentRoutes';import reportRoutes from './routes/reportRoutes';

// โหลดตัวแปรสภาพแวดล้อม
dotenv.config();

// สร้างแอปพลิเคชัน Express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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

// เส้นทาง API หลัก
app.get('/', (req, res) => {
  res.json({ message: 'ยินดีต้อนรับสู่ School Management API' });
});

// นำเข้าเส้นทาง API ทั้งหมด
app.use('/api', apiRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์กำลังทำงานที่พอร์ต ${port}`);
}); 