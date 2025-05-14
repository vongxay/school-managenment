import { Request, Response } from 'express';
import levelModel, { Level } from '../models/levelModel';

class LevelController {
  // ดึงข้อมูลระดับชั้นทั้งหมด
  async getAllLevels(req: Request, res: Response): Promise<void> {
    try {
      const levels = await levelModel.getAllLevels();
      res.status(200).json({
        success: true,
        data: levels
      });
    } catch (error) {
      console.error('Error in getAllLevels:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຊັ້ນຮຽນ'
      });
    }
  }
  async getCurrentLevels(req: Request, res: Response): Promise<void> {
    try {
      const levels = await levelModel.getCurrentLevels();
      res.status(200).json({
        success: true,
        data: levels
      });
    } catch (error) {
      console.error('Error in getAllLevels:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຊັ້ນຮຽນ'
      });
    }
  }

  // ดึงข้อมูลระดับชั้นตาม ID
  async getLevelById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const level = await levelModel.getLevelById(id);
      
      if (!level) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຊັ້ນຮຽນ'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: level
      });
    } catch (error) {
      console.error('Error in getLevelById:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຊັ້ນຮຽນ'
      });
    }
  }

  // เพิ่มระดับชั้นใหม่
  async createLevel(req: Request, res: Response): Promise<void> {
    try {
      const levelData: Level = req.body;
      
      if (!levelData.id || !levelData.name) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      const newLevel = await levelModel.createLevel(levelData);
      res.status(201).json({
        success: true,
        data: newLevel,
        message: 'ເພີ່ມຂໍ້ມູນຊັ້ນຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in createLevel:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນຊັ້ນຮຽນ'
      });
    }
  }

  // อัปเดตข้อมูลระดับชั้น
  async updateLevel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const levelData: Partial<Level> = req.body;
      
      if (!levelData.name) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      const success = await levelModel.updateLevel(id, levelData);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຊັ້ນຮຽນຫຼືບໍ່ສາມາດອັບເດດໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ອັບເດດຂໍ້ມູນຊັ້ນຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in updateLevel:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນຊັ້ນຮຽນ'
      });
    }
  }

  // ลบระดับชั้น
  async deleteLevel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await levelModel.deleteLevel(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຊັ້ນຮຽນຫຼືບໍ່ສາມາດລຶບໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ລຶບຂໍ້ມູນຊັ້ນຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in deleteLevel:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຊັ້ນຮຽນ'
      });
    }
  }
}

export default new LevelController(); 