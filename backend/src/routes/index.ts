import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import studentRoutes from './studentRoutes';

const router = Router();

// ลงทะเบียนเส้นทาง API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);

// เส้นทางทดสอบ API
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API ໃຊ້ງານໄດ້ປົກກະຕິ' 
  });
});

export default router; 