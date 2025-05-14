import { Request, Response } from 'express';
import RegistrationModel, { CreateRegistrationDTO, UpdateRegistrationDTO } from '../models/registrationModel';
import StudentModel from '../models/studentModel';

class RegistrationController {
  // ดึงข้อมูลการลงทะเบียนทั้งหมด
  async getAllRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const schoolYear = req.query.schoolYear as string | undefined;
      const paid = req.query.paid !== undefined ? req.query.paid === 'true' : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const result = await RegistrationModel.findAll({ 
        search, 
        schoolYear,
        paid,
        limit, 
        offset 
      });
      
      res.status(200).json({
        success: true,
        data: {
          registrations: result.registrations,
          total: result.total
        }
      });
    } catch (error) {
      console.error('Error getting all registrations:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການລົງທະບຽນ'
      });
    }
  }

async getCurrentRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const registrationId = await RegistrationModel.getCurrentRegistration();
      res.status(200).json({
        success: true,
        data: registrationId
      });
    } catch (error) {
      console.error('Error in getAllLevels:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຊັ້ນຮຽນ'
      });
    }
  }


  async getStudentByClass(req: Request, res: Response): Promise<void> {
    try {
      const groupedData = await RegistrationModel.findAllStudentsGroupedByClass();
      res.status(200).json({
        success: true,
        data: groupedData
      });
    } catch (error) {
      console.error('Error in getAllLevels:', error);
      res.status(500).json({
        success: false,
        message: 'ມີຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຊັ້ນຮຽນ'
      });
    }
  }

  // ดึงข้อมูลการลงทะเบียนตาม ID
  async getRegistrationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const registration = await RegistrationModel.findById(id);
      
      if (!registration) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: registration
      });
    } catch (error) {
      console.error('Error getting registration by ID:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການລົງທະບຽນ'
      });
    }
  }

  // สร้างการลงทะเบียนใหม่
  async createRegistration(req: Request, res: Response): Promise<void> {
    try {
      const registrationData: CreateRegistrationDTO = req.body;
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!registrationData.student_id || !registrationData.classroom || !registrationData.level || !registrationData.school_year) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາລະບຸຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      // ໄດ້ລຶບການກວດສອບຂໍ້ມູນນັກຮຽນຈາກຖານຂໍ້ມູນ
      // ສາມາດລົງທະບຽນໄດ້ເລີຍໂດຍໃຊ້ຂໍ້ມູນທີ່ສົ່ງມາຈາກຟອມ
      console.log('ກຳລັງລົງທະບຽນ:', registrationData);
      
      // สร้างการลงทะเบียนใหม่
      const registrationId = await RegistrationModel.create(registrationData);
      
      // ดึงข้อมูลการลงทะเบียนที่สร้างใหม่
      const newRegistration = await RegistrationModel.findById(registrationId);
      
      res.status(201).json({
        success: true,
        message: 'ສ້າງຂໍ້ມູນການລົງທະບຽນສຳເລັດແລ້ວ',
        data: newRegistration
      });
    } catch (error) {
      console.error('Error creating registration:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຂໍ້ມູນການລົງທະບຽນ'
      });
    }
  }

  // อัปเดตข้อมูลการลงทะเบียน
  async updateRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const registrationData: UpdateRegistrationDTO = req.body;
      
      // ตรวจสอบว่ามีการลงทะเบียนอยู่หรือไม่
      const existingRegistration = await RegistrationModel.findById(id);
      
      if (!existingRegistration) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ'
        });
        return;
      }
      
      // ໄດ້ລຶບການກວດສອບຂໍ້ມູນນັກຮຽນຈາກຖານຂໍ້ມູນ
      
      // อัปเดตข้อมูลการลงทะเบียน
      const updated = await RegistrationModel.update(id, registrationData);
      
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນການລົງທະບຽນໄດ້'
        });
        return;
      }
      
      // ดึงข้อมูลที่อัปเดตแล้ว
      const updatedRegistration = await RegistrationModel.findById(id);
      
      res.status(200).json({
        success: true,
        message: 'ອັບເດດຂໍ້ມູນການລົງທະບຽນສຳເລັດແລ້ວ',
        data: updatedRegistration
      });
    } catch (error) {
      console.error('Error updating registration:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນການລົງທະບຽນ'
      });
    }
  }

  // ลบการลงทะเบียน
  async deleteRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // ตรวจสอบว่ามีการลงทะเบียนอยู่หรือไม่
      const existingRegistration = await RegistrationModel.findById(id);
      
      if (!existingRegistration) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ'
        });
        return;
      }
      
      // ลบการลงทะเบียน
      const deleted = await RegistrationModel.delete(id);
      
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'ບໍ່ສາມາດລຶບຂໍ້ມູນການລົງທະບຽນໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ລຶບຂໍ້ມູນການລົງທະບຽນສຳເລັດແລ້ວ'
      });
    } catch (error) {
      console.error('Error deleting registration:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນການລົງທະບຽນ'
      });
    }
  }
}

export default new RegistrationController(); 