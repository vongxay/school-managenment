import { Request, Response } from 'express';
import { StudentModel } from '../models/student';

export const StudentController = {
  // ดึงข้อมูลนักเรียนทั้งหมด
  getAllStudents: async (req: Request, res: Response) => {
    try {
      const { search } = req.query;
      
      let students;
      if (search && typeof search === 'string') {
        // ถ้ามีการค้นหา ให้เรียกใช้ฟังก์ชันค้นหา
        students = await StudentModel.search(search);
      } else {
        // ถ้าไม่มีการค้นหา ให้ดึงข้อมูลทั้งหมด
        students = await StudentModel.findAll();
      }
      
      res.json({ success: true, data: { students } });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນນັກຮຽນ' });
    }
  },
  
  // ดึงข้อมูลนักเรียนตาม ID
  getStudentById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const student = await StudentModel.findById(id);
      
      if (!student) {
        return res.status(404).json({ success: false, message: 'ບໍ່ພົບຂໍ້ມູນນັກຮຽນ' });
      }
      
      res.json({ success: true, data: student });
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນນັກຮຽນ' });
    }
  },
  
  // ดึงข้อมูลนักเรียนตามรหัสนักเรียน
  getStudentByStudentId: async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
      const student = await StudentModel.findByStudentId(studentId);
      
      if (!student) {
        return res.status(404).json({ success: false, message: 'ບໍ່ພົບຂໍ້ມູນນັກຮຽນ' });
      }
      
      res.json({ success: true, data: student });
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນນັກຮຽນ' });
    }
  },
  
  // สร้างนักเรียนใหม่
  createStudent: async (req: Request, res: Response) => {
    try {
      const studentData = req.body;
      
      // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
      if (!studentData.student_name_lao || !studentData.gender) {
        return res.status(400).json({ 
          success: false, 
          message: 'ກະລຸນາລະບຸຂໍ້ມູນທີ່ຈຳເປັນ (ຊື່ນັກຮຽນ, ເພດ)' 
        });
      }
      
      // ตรวจสอบว่ามีนักเรียนรหัสซ้ำหรือไม่ (ถ้ามีรหัส)
      if (studentData.student_id) {
        const existingStudent = await StudentModel.findByStudentId(studentData.student_id);
        if (existingStudent) {
          return res.status(400).json({ 
            success: false, 
            message: 'ລະຫັດນັກຮຽນນີ້ມີໃນລະບົບແລ້ວ' 
          });
        }
      }
      
      const studentId = await StudentModel.create(studentData);
      
      res.status(201).json({ 
        success: true, 
        message: 'ເພີ່ມຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ', 
        data: { id: studentId } 
      });
    } catch (error) {
      console.error('Error creating student:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນນັກຮຽນ' });
    }
  },
  
  // อัปเดตข้อมูลนักเรียน
  updateStudent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const studentData = req.body;
      
      // ตรวจสอบว่ามีนักเรียนหรือไม่
      const existingStudent = await StudentModel.findById(id);
      if (!existingStudent) {
        return res.status(404).json({ success: false, message: 'ບໍ່ພົບຂໍ້ມູນນັກຮຽນ' });
      }
      
      const updated = await StudentModel.update(id, studentData);
      
      if (!updated) {
        return res.status(400).json({ success: false, message: 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນນັກຮຽນໄດ້' });
      }
      
      res.json({ success: true, message: 'ອັບເດດຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ' });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນນັກຮຽນ' });
    }
  },
  
  // ลบนักเรียน
  deleteStudent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // ตรวจสอบว่ามีนักเรียนหรือไม่
      const existingStudent = await StudentModel.findById(id);
      if (!existingStudent) {
        return res.status(404).json({ success: false, message: 'ບໍ່ພົບຂໍ້ມູນນັກຮຽນ' });
      }
      
      const deleted = await StudentModel.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ success: false, message: 'ບໍ່ສາມາດລຶບຂໍ້ມູນນັກຮຽນໄດ້' });
      }
      
      res.json({ success: true, message: 'ລຶບຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ' });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນນັກຮຽນ' });
    }
  },
  
  // ค้นหานักเรียน
  searchStudents: async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'ກະລຸນາລະບຸຄຳຄົ້ນຫາ' });
      }
      
      const students = await StudentModel.search(query);
      
      res.json({ success: true, data: students });
    } catch (error) {
      console.error('Error searching students:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫານັກຮຽນ' });
    }
  },
  
  // ดึงข้อมูลการลงทะเบียน
  getRegistrations: async (req: Request, res: Response) => {
    try {
      const { studentId } = req.query;
      
      const registrations = await StudentModel.getRegistrations(
        typeof studentId === 'string' ? studentId : undefined
      );
      
      res.json({ success: true, data: registrations });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການລົງທະບຽນ' });
    }
  },
  
  // ดึงข้อมูลการลงทะเบียนตาม Invoice ID
  getRegistrationByInvoiceId: async (req: Request, res: Response) => {
    try {
      const { invoiceId } = req.params;
      
      const registration = await StudentModel.getRegistrationByInvoiceId(invoiceId);
      
      if (!registration) {
        return res.status(404).json({ success: false, message: 'ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ' });
      }
      
      res.json({ success: true, data: registration });
    } catch (error) {
      console.error('Error fetching registration:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການລົງທະບຽນ' });
    }
  },
  
  // ค้นหาข้อมูลการลงทะเบียน
  searchRegistrations: async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'ກະລຸນາລະບຸຄຳຄົ້ນຫາ' });
      }
      
      const registrations = await StudentModel.searchRegistrations(query);
      
      res.json({ success: true, data: registrations });
    } catch (error) {
      console.error('Error searching registrations:', error);
      res.status(500).json({ success: false, message: 'ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາຂໍ້ມູນການລົງທະບຽນ' });
    }
  },
  
  // อัปเดตสถานะการชำระเงิน
  updateRegistrationPaymentStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isPaid } = req.body;
      
      if (typeof isPaid !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          message: 'ກະລຸນາລະບຸສະຖານະການຊຳລະເງິນ (true ຫຼື false)' 
        });
      }
      
      const updated = await StudentModel.updatePaymentStatus(id, isPaid);
      
      if (!updated) {
        return res.status(400).json({ 
          success: false, 
          message: 'ບໍ່ສາມາດອັບເດດສະຖານະການຊຳລະເງິນໄດ້' 
        });
      }
      
      res.json({ 
        success: true, 
        message: `ອັບເດດສະຖານະການຊຳລະເງິນເປັນ ${isPaid ? 'ຈ່າຍແລ້ວ' : 'ຍັງບໍ່ຈ່າຍ'} ສຳເລັດແລ້ວ` 
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະການຊຳລະເງິນ' 
      });
    }
  }
}; 