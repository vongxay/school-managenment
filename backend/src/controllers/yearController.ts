import { Request, Response } from 'express';
import yearModel, { SchoolYear } from '../models/yearModel';

class YearController {
  // ดึงข้อมูลปีการศึกษาทั้งหมด
  async getAllYears(req: Request, res: Response): Promise<void> {
    try {
      const years = await yearModel.getAllYears();
      res.status(200).json({
        success: true,
        data: years
      });
    } catch (error) {
      console.error('Error in getAllYears:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສົກຮຽນ'
      });
    }
  }

  // ดึงข้อมูลปีการศึกษาตาม ID
  async getYearById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const year = await yearModel.getYearById(id);
      
      if (!year) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນສົກຮຽນ'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: year
      });
    } catch (error) {
      console.error('Error in getYearById:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສົກຮຽນ'
      });
    }
  }

  // เพิ่มปีการศึกษาใหม่
  async createYear(req: Request, res: Response): Promise<void> {
    try {
      const yearData: SchoolYear = req.body;
      
      if (!yearData.id || !yearData.period) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      const newYear = await yearModel.createYear(yearData);
      res.status(201).json({
        success: true,
        data: newYear,
        message: 'ເພີ່ມຂໍ້ມູນສົກຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in createYear:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນສົກຮຽນ'
      });
    }
  }

  // อัปเดตข้อมูลปีการศึกษา
  async updateYear(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const yearData: Partial<SchoolYear> = req.body;
      
      if (!yearData.period) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      const success = await yearModel.updateYear(id, yearData);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນສົກຮຽນຫຼືບໍ່ສາມາດອັບເດດໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ອັບເດດຂໍ້ມູນສົກຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in updateYear:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນສົກຮຽນ'
      });
    }
  }

  // ลบปีการศึกษา
  async deleteYear(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await yearModel.deleteYear(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນສົກຮຽນຫຼືບໍ່ສາມາດລຶບໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ລຶບຂໍ້ມູນສົກຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in deleteYear:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນສົກຮຽນ'
      });
    }
  }
}

export default new YearController(); 