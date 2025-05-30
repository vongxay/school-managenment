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
      
      // ตรวจสอบว่ามีปีการศึกษาซ้ำหรือไม่
      const existingYears = await yearModel.getAllYears();
      const isDuplicatePeriod = existingYears.some(year => 
        year.period === yearData.period || year.name === yearData.period
      );
      
      if (isDuplicatePeriod) {
        res.status(400).json({
          success: false,
          message: 'ສົກຮຽນນີ້ມີຢູ່ໃນລະບົບແລ້ວ'
        });
        return;
      }
      
      // กำหนดชื่อปีการศึกษาให้ตรงกับ period
      yearData.name = yearData.period;
      
      // กำหนดวันที่เริ่มต้นและสิ้นสุดถ้าไม่มี
      if (!yearData.start_date || !yearData.end_date) {
        const [startYear, endYear] = yearData.period.split('-').map(year => parseInt(year.trim()));
        
        if (startYear && endYear) {
          yearData.start_date = `${startYear}-05-01`;
          yearData.end_date = `${endYear}-04-30`;
        } else {
          const currentYear = new Date().getFullYear();
          yearData.start_date = `${currentYear}-05-01`;
          yearData.end_date = `${currentYear + 1}-04-30`;
        }
      }
      
      // กำหนดค่า is_current ถ้าไม่มี
      if (yearData.is_current === undefined) {
        yearData.is_current = false;
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
      
      // กำหนดชื่อปีการศึกษาถ้าไม่มี
      if (!yearData.name && yearData.period) {
        yearData.name = yearData.period;
      }
      
      // อัปเดตวันที่เริ่มต้นและสิ้นสุดถ้ามีการเปลี่ยนแปลงปีการศึกษา
      if (yearData.period && (!yearData.start_date || !yearData.end_date)) {
        const [startYear, endYear] = yearData.period.split('-').map(year => parseInt(year.trim()));
        
        if (startYear && endYear) {
          if (!yearData.start_date) yearData.start_date = `${startYear}-05-01`;
          if (!yearData.end_date) yearData.end_date = `${endYear}-04-30`;
        }
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