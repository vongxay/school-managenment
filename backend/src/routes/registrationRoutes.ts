import express from 'express';
import registrationController from '../controllers/registrationController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// ดึงข้อมูลการลงทะเบียนทั้งหมด
router.get('/', authenticate, registrationController.getAllRegistrations);

// ดึงข้อมูลการลงทะเบียนปัจจุบัน
router.get('/currentId', authenticate, registrationController.getCurrentRegistrations);

// ดึงข้อมูลการลงทะเบียนตามระดับชั้น
router.get('/studentByClass', registrationController.getStudentByClass);

// ดึงข้อมูลการลงทะเบียนตาม ID
router.get('/:id', authenticate, registrationController.getRegistrationById);

// สร้างการลงทะเบียนใหม่ - ต้องเป็น admin หรือ staff
router.post('/', authenticate, authorize(['admin', 'staff']), registrationController.createRegistration);

// อัปเดตข้อมูลการลงทะเบียน - ต้องเป็น admin หรือ staff
router.put('/:id', authenticate, authorize(['admin', 'staff']), registrationController.updateRegistration);

// ลบการลงทะเบียน - ต้องเป็น admin เท่านั้น
router.delete('/:id', authenticate, authorize(['admin']), registrationController.deleteRegistration);

export default router; 