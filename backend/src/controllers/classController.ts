import { Request, Response } from 'express';
import classModel, { ClassRoom } from '../models/classModel';

class ClassController {
  // ดึงข้อมูลห้องเรียนทั้งหมด
  async getAllClasses(req: Request, res: Response): Promise<void> {
    try {
      const classes = await classModel.getAllClasses();
      res.status(200).json({
        success: true,
        data: classes
      });
    } catch (error) {
      console.error('Error in getAllClasses:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ'
      });
    }
  }

  // ดึงข้อมูลห้องเรียนตาม ID
  async getClassById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classItem = await classModel.getClassById(id);
      
      if (!classItem) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຫ້ອງຮຽນ'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: classItem
      });
    } catch (error) {
      console.error('Error in getClassById:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ'
      });
    }
  }

  // เพิ่มห้องเรียนใหม่
  async createClass(req: Request, res: Response): Promise<void> {
    try {
      const classData: ClassRoom = req.body;
      
      if (!classData.id || !classData.name || !classData.level) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      const newClass = await classModel.createClass(classData);
      res.status(201).json({
        success: true,
        data: newClass,
        message: 'ເພີ່ມຂໍ້ມູນຫ້ອງຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in createClass:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນຫ້ອງຮຽນ'
      });
    }
  }

  // อัปเดตข้อมูลห้องเรียน
  async updateClass(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classData: Partial<ClassRoom> = req.body;
      
      if (!classData.name || !classData.level) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      const success = await classModel.updateClass(id, classData);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຫ້ອງຮຽນຫຼືບໍ່ສາມາດອັບເດດໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ອັບເດດຂໍ້ມູນຫ້ອງຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in updateClass:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນຫ້ອງຮຽນ'
      });
    }
  }

  // ลบห้องเรียน
  async deleteClass(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await classModel.deleteClass(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຫ້ອງຮຽນຫຼືບໍ່ສາມາດລຶບໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ລຶບຂໍ້ມູນຫ້ອງຮຽນສຳເລັດ'
      });
    } catch (error) {
      console.error('Error in deleteClass:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຫ້ອງຮຽນ'
      });
    }
  }
}

export default new ClassController(); 