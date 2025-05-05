import { Router } from 'express';
import tuitionController from '../controllers/tuitionController';
// import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ດຶງຂໍ້ມູນຄ່າຮຽນທັງໝົດ
router.get('/', tuitionController.getAllTuitions);

// ດຶງຂໍ້ມູນຄ່າຮຽນຕາມລະດັບຊັ້ນແລະປີການສຶກສາ - ຕ້ອງວາງກ່ອນເສັ້ນທາງທີ່ມີພາລາມິເຕີ id
router.get('/level/:level/year/:year', tuitionController.getTuitionByLevelAndYear);

// ດຶງຂໍ້ມູນຄ່າຮຽນຕາມ ID
router.get('/:id', tuitionController.getTuitionById);

// ເພີ່ມຄ່າຮຽນໃໝ່ (ຕອນທົດສອບບໍ່ຕ້ອງເຂົ້າສູ່ລະບົບ)
router.post('/', tuitionController.createTuition);

// ອັບເດດຂໍ້ມູນຄ່າຮຽນ (ຕອນທົດສອບບໍ່ຕ້ອງເຂົ້າສູ່ລະບົບ)
router.put('/:id', tuitionController.updateTuition);

// ລຶບຄ່າຮຽນ (ຕອນທົດສອບບໍ່ຕ້ອງເຂົ້າສູ່ລະບົບ)
router.delete('/:id', tuitionController.deleteTuition);

export default router; 