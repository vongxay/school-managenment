import { Request, Response } from 'express';
import StudentModel, { CreateStudentDTO, UpdateStudentDTO } from '../models/studentModel';

class StudentController {
  // ดึงข้อมูลนักเรียนทั้งหมด
  async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const gender = req.query.gender as 'M' | 'F' | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const result = await StudentModel.findAll({ search, gender, limit, offset });
      
      res.status(200).json({
        success: true,
        data: {
          students: result.students,
          total: result.total
        }
      });
    } catch (error) {
      console.error('Error getting all students:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນນັກຮຽນ'
      });
    }
  }

  // ดึงข้อมูลนักเรียนตาม ID
  async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const student = await StudentModel.findById(id);
      
      if (!student) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນນັກຮຽນ'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: student
      });
    } catch (error) {
      console.error('Error getting student by ID:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນນັກຮຽນ'
      });
    }
  }

  // ดึงข้อมูลนักเรียนตามรหัสนักเรียน
  async getStudentByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      
      const student = await StudentModel.findByStudentId(studentId);
      
      if (!student) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນນັກຮຽນ'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: student
      });
    } catch (error) {
      console.error('Error getting student by student ID:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນນັກຮຽນ'
      });
    }
  }

  // สร้างนักเรียนใหม่
  async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentData: CreateStudentDTO = req.body;
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!studentData.student_name_lao || !studentData.gender) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາລະບຸຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      // ตรวจสอบว่ามีรหัสนักเรียนซ้ำหรือไม่ (ถ้ามี)
      if (studentData.student_id) {
        const existingStudent = await StudentModel.findByStudentId(studentData.student_id);
        
        if (existingStudent) {
          res.status(400).json({
            success: false,
            message: 'ມີນັກຮຽນທີ່ໃຊ້ລະຫັດນີ້ໃນລະບົບແລ້ວ'
          });
          return;
        }
      }
      
      // สร้างนักเรียนใหม่
      const studentId = await StudentModel.create(studentData);
      
      // ดึงข้อมูลนักเรียนที่สร้างใหม่
      const newStudent = await StudentModel.findById(studentId);
      
      res.status(201).json({
        success: true,
        message: 'ສ້າງຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ',
        data: newStudent
      });
    } catch (error) {
      console.error('Error creating student:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຂໍ້ມູນນັກຮຽນ'
      });
    }
  }

  // อัปเดตข้อมูลนักเรียน
  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentData: UpdateStudentDTO = req.body;
      
      // ตรวจสอบว่ามีนักเรียนอยู่หรือไม่
      const existingStudent = await StudentModel.findById(id);
      
      if (!existingStudent) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນນັກຮຽນ'
        });
        return;
      }
      
      // อัปเดตข้อมูลนักเรียน
      const updated = await StudentModel.update(id, studentData);
      
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນນັກຮຽນໄດ້'
        });
        return;
      }
      
      // ดึงข้อมูลที่อัปเดตแล้ว
      const updatedStudent = await StudentModel.findById(id);
      
      res.status(200).json({
        success: true,
        message: 'ອັບເດດຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ',
        data: updatedStudent
      });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນນັກຮຽນ'
      });
    }
  }

  // ลบนักเรียน
  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // ตรวจสอบว่ามีนักเรียนอยู่หรือไม่
      const existingStudent = await StudentModel.findById(id);
      
      if (!existingStudent) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນນັກຮຽນ'
        });
        return;
      }
      
      // ลบนักเรียน
      const deleted = await StudentModel.delete(id);
      
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'ບໍ່ສາມາດລຶບຂໍ້ມູນນັກຮຽນໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ລຶບຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ'
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນນັກຮຽນ'
      });
    }
  }
}

export default new StudentController(); 