import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import studentRoutes from './studentRoutes';
import classRoutes from './classRoutes';
import yearRoutes from './yearRoutes';
import levelRoutes from './levelRoutes';
import registrationRoutes from './registrationRoutes';
import tuitionRoutes from './tuitionRoutes';
import reportRoutes from './reportRoutes';
import paymentRoutes from './paymentRoutes';
import commonRoutes from './commonRoutes';

const router = Router();

// ลงทะเบียนเส้นทาง API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/years', yearRoutes);
router.use('/levels', levelRoutes);
router.use('/registrations', registrationRoutes);
router.use('/tuitions', tuitionRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);
router.use('/common', commonRoutes);

// เส้นทางทดสอบ API
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API ໃຊ້ງານໄດ້ປົກກະຕິ' 
  });
});

export default router; 