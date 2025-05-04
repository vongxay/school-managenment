import { Router } from 'express';
import yearController from '../controllers/yearController';

const router = Router();

// ดึงข้อมูลปีการศึกษาทั้งหมด
router.get('/', yearController.getAllYears);

// ดึงข้อมูลปีการศึกษาตาม ID
router.get('/:id', yearController.getYearById);

// เพิ่มปีการศึกษาใหม่
router.post('/', yearController.createYear);

// อัปเดตข้อมูลปีการศึกษา
router.put('/:id', yearController.updateYear);

// ลบปีการศึกษา
router.delete('/:id', yearController.deleteYear);

export default router; 