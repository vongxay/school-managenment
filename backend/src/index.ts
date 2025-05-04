import express from 'express';
import cors from 'cors';
import config from './config';
import routes from './routes';
import { testConnection } from './utils/db';

// สร้าง Express app
const app = express();

// ใช้ middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ทดสอบการเชื่อมต่อฐานข้อมูล
testConnection();

// ลงทะเบียนเส้นทาง API
app.use('/api', routes);

// จัดการเส้นทางที่ไม่มี
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'ບໍ່ພົບເສັ້ນທາງທີ່ຮ້ອງຂໍ'
  });
});

// เริ่มต้นเซิร์ฟเวอร์
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`ເຊີເວີ້ກຳລັງທຳງານທີ່ພອດ ${PORT}`);
}); 