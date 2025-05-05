import { Request, Response } from 'express';
import tuitionModel, { Tuition } from '../models/tuitionModel';

class TuitionController {
  // ดึงข้อมูลค่าเล่าเรียนทั้งหมด
  async getAllTuitions(req: Request, res: Response): Promise<void> {
    try {
      const tuitions = await tuitionModel.getAllTuitions();
      res.status(200).json({
        success: true,
        data: tuitions
      });
    } catch (error) {
      console.error('Error in getAllTuitions:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຄ່າຮຽນ'
      });
    }
  }

  // ดึงข้อมูลค่าเล่าเรียนตาม ID
  async getTuitionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tuition = await tuitionModel.getTuitionById(id);
      
      if (!tuition) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຄ່າຮຽນ'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: tuition
      });
    } catch (error) {
      console.error('Error in getTuitionById:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຄ່າຮຽນ'
      });
    }
  }

  // เพิ่มค่าเล่าเรียนใหม่
  async createTuition(req: Request, res: Response): Promise<void> {
    try {
      const tuitionData: Tuition = req.body;
      
      if (!tuitionData.id || !tuitionData.name || !tuitionData.year || !tuitionData.level || tuitionData.amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      const newTuition = await tuitionModel.createTuition(tuitionData);
      res.status(201).json({
        success: true,
        data: newTuition,
        message: 'ເພີ່ມຂໍ້ມູນຄ່າຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in createTuition:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນຄ່າຮຽນ'
      });
    }
  }

  // อัปเดตข้อมูลค่าเล่าเรียน
  async updateTuition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tuitionData: Partial<Tuition> = req.body;
      
      if (!tuitionData.name || !tuitionData.year || !tuitionData.level || !tuitionData.amount || tuitionData.amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      const success = await tuitionModel.updateTuition(id, tuitionData);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຄ່າຮຽນຫຼືບໍ່ສາມາດອັບເດດໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ອັບເດດຂໍ້ມູນຄ່າຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in updateTuition:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນຄ່າຮຽນ'
      });
    }
  }

  // ลบค่าเล่าเรียน
  async deleteTuition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await tuitionModel.deleteTuition(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຄ່າຮຽນຫຼືບໍ່ສາມາດລຶບໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ລຶບຂໍ້ມູນຄ່າຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in deleteTuition:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຄ່າຮຽນ'
      });
    }
  }

  // ดึงข้อมูลค่าเล่าเรียนตามระดับชั้นและปีการศึกษา
  async getTuitionByLevelAndYear(req: Request, res: Response): Promise<void> {
    try {
      const { level, year } = req.params;
      
      if (!level || !year) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາລະບຸລະດັບຊັ້ນແລະປີການສຶກສາ'
        });
        return;
      }
      
      // ຕັດຊ່ອງຫວ່າງຂອງພາລາມິເຕີ
      const cleanLevel = level.trim();
      const cleanYear = year.trim();
      
      const tuition = await tuitionModel.getTuitionByLevelAndYear(cleanLevel, cleanYear);
      
      if (!tuition) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຄ່າຮຽນ'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: tuition
      });
    } catch (error) {
      console.error('Error in getTuitionByLevelAndYear:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຄ່າຮຽນ'
      });
    }
  }
}

export default new TuitionController(); 