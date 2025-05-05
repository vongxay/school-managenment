import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// ดึงข้อมูลนักเรียนทั้งหมด
router.get('/', authenticate, StudentController.getAllStudents);

// ดึงข้อมูลนักเรียนตามรหัสนักเรียน - ต้องระบุก่อนเส้นทาง /:id
router.get('/student-id/:studentId', authenticate, StudentController.getStudentByStudentId);

// ดึงข้อมูลนักเรียนตาม ID
router.get('/:id', authenticate, StudentController.getStudentById);

// สร้างนักเรียนใหม่ - ต้องเป็น admin หรือ staff
router.post('/', authenticate, authorize(['admin', 'staff']), StudentController.createStudent);

// อัปเดตข้อมูลนักเรียน - ต้องเป็น admin หรือ staff
router.put('/:id', authenticate, authorize(['admin', 'staff']), StudentController.updateStudent);

// ลบนักเรียน - ต้องเป็น admin เท่านั้น
router.delete('/:id', authenticate, authorize(['admin']), StudentController.deleteStudent);

// เส้นทางสำหรับการลงทะเบียน
router.get('/registrations', StudentController.getRegistrations);
router.get('/registrations/invoice/:invoiceId', StudentController.getRegistrationByInvoiceId);
router.get('/registrations/search', StudentController.searchRegistrations);
router.patch('/registrations/:id/payment-status', StudentController.updateRegistrationPaymentStatus);

export default router; 