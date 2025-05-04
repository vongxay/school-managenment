import express from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// เส้นทางสำหรับการเข้าสู่ระบบ
router.post('/login', authController.login);

// เส้นทางสำหรับการลงทะเบียน
router.post('/register', authController.register);

// เส้นทางสำหรับตรวจสอบการเข้าสู่ระบบ
router.get('/check', authenticate, authController.checkAuth);

export default router; 