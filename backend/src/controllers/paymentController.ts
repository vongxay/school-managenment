import { Request, Response } from 'express';
import paymentModel from '../models/paymentModel';

export const PaymentController = {
  // สร้างการชำระเงินใหม่
  createPayment: async (req: Request, res: Response) => {
    try {
      // รับข้อมูลจาก request body
      const paymentData = req.body;
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!paymentData.registration_id || !paymentData.amount || !paymentData.payment_date) {
        return res.status(400).json({
          success: false,
          message: 'ກະລຸນາລະບຸຂໍ້ມູນທີ່ຈຳເປັນ (registration_id, amount, payment_date)'
        });
      }
      
      // เพิ่มข้อมูลผู้รับชำระเงิน (ถ้าไม่มีในข้อมูลที่ส่งมา)
      if (!paymentData.received_by && req.user) {
        paymentData.received_by = req.user.id;
      }
      
      // บันทึกข้อมูลการชำระเงิน
      const paymentId = await paymentModel.create(paymentData);
      
      res.status(201).json({
        success: true,
        message: 'ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ',
        data: {
          id: paymentId
        }
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ'
      });
    }
  },
  
  // ดึงข้อมูลการชำระเงินตาม registration_id
  getPaymentsByRegistrationId: async (req: Request, res: Response) => {
    try {
      const { registration_id } = req.params;
      
      if (!registration_id) {
        return res.status(400).json({
          success: false,
          message: 'ກະລຸນາລະບຸລະຫັດການລົງທະບຽນ'
        });
      }
      
      const payments = await paymentModel.findByRegistrationId(registration_id);
      
      res.json({
        success: true,
        data: {
          payments
        }
      });
    } catch (error) {
      console.error('Error getting payments:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການຊຳລະເງິນ'
      });
    }
  },
  
  // ค้นหาข้อมูลการชำระเงิน
  searchPayments: async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'ກະລຸນາລະບຸຄຳຄົ້ນຫາ'
        });
      }
      
      const payments = await paymentModel.search(query);
      
      res.json({
        success: true,
        data: {
          payments
        }
      });
    } catch (error) {
      console.error('Error searching payments:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາຂໍ້ມູນການຊຳລະເງິນ'
      });
    }
  }
}; 