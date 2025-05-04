import express from 'express';
import userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// ดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

// ดึงข้อมูลผู้ใช้ตาม ID
router.get('/:id', authenticate, authorize(['admin']), userController.getUserById);

// สร้างผู้ใช้ใหม่
router.post('/', authenticate, authorize(['admin']), userController.createUser);

// อัปเดตข้อมูลผู้ใช้
router.put('/:id', authenticate, authorize(['admin']), userController.updateUser);

// ลบผู้ใช้
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);

export default router; 