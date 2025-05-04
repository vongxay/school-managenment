import express from 'express';
import studentController from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// ดึงข้อมูลนักเรียนทั้งหมด
router.get('/', authenticate, studentController.getAllStudents);

// ดึงข้อมูลนักเรียนตามรหัสนักเรียน - ต้องระบุก่อนเส้นทาง /:id
router.get('/student-id/:studentId', authenticate, studentController.getStudentByStudentId);

// ดึงข้อมูลนักเรียนตาม ID
router.get('/:id', authenticate, studentController.getStudentById);

// สร้างนักเรียนใหม่ - ต้องเป็น admin หรือ staff
router.post('/', authenticate, authorize(['admin', 'staff']), studentController.createStudent);

// อัปเดตข้อมูลนักเรียน - ต้องเป็น admin หรือ staff
router.put('/:id', authenticate, authorize(['admin', 'staff']), studentController.updateStudent);

// ลบนักเรียน - ต้องเป็น admin เท่านั้น
router.delete('/:id', authenticate, authorize(['admin']), studentController.deleteStudent);

export default router; 