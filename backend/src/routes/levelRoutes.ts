import { Router } from 'express';
import levelController from '../controllers/levelController';

const router = Router();

// ดึงข้อมูลระดับชั้นทั้งหมด
router.get('/', levelController.getAllLevels);

// ดึงข้อมูลระดับชั้นปัจจุบัน
router.get('/currentId', levelController.getCurrentLevels);


// ดึงข้อมูลระดับชั้นตาม ID
router.get('/:id', levelController.getLevelById);

// เพิ่มระดับชั้นใหม่
router.post('/', levelController.createLevel);

// อัปเดตข้อมูลระดับชั้น
router.put('/:id', levelController.updateLevel);

// ลบระดับชั้น
router.delete('/:id', levelController.deleteLevel);

export default router; 