import express from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// ทุกเส้นทางต้องมีการตรวจสอบการเข้าสู่ระบบก่อน
router.use(authMiddleware);

// สร้างการชำระเงินใหม่
router.post('/', PaymentController.createPayment);

// ดึงข้อมูลการชำระเงินตาม registration_id
router.get('/registration/:registration_id', PaymentController.getPaymentsByRegistrationId);

// ค้นหาข้อมูลการชำระเงิน
router.get('/search', PaymentController.searchPayments);

export default router; 