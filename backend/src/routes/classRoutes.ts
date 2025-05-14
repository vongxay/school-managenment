import { Router } from 'express';
import classController from '../controllers/classController';

const router = Router();

// ดึงข้อมูลห้องเรียนทั้งหมด
router.get('/', classController.getAllClasses);

// ดึงข้อมูลห้องเรียนปัจจุบัน
router.get('/currentId', classController.getCurrentClassId);

// ดึงข้อมูลห้องเรียนตาม ID
router.get('/:id', classController.getClassById);

// เพิ่มห้องเรียนใหม่
router.post('/', classController.createClass);

// อัปเดตข้อมูลห้องเรียน
router.put('/:id', classController.updateClass);

// ลบห้องเรียน
router.delete('/:id', classController.deleteClass);

export default router; 