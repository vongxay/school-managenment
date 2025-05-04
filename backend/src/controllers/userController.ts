import { Request, Response } from 'express';
import UserModel, { CreateUserDTO, UpdateUserDTO } from '../models/userModel';

class UserController {
  // ดึงข้อมูลผู้ใช้ทั้งหมด
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.findAll();
      
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້'
      });
    }
  }

  // ดึงข้อมูลผู้ใช้ตาม ID
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await UserModel.findById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້'
        });
        return;
      }
      
      // ลบรหัสผ่านก่อนส่งกลับ
      const { password, ...userData } = user;
      
      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້'
      });
    }
  }

  // สร้างผู้ใช้ใหม่
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!userData.username || !userData.password || !userData.name || !userData.role) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາລະບຸຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }
      
      // ตรวจสอบว่ามีชื่อผู้ใช้ซ้ำหรือไม่
      const existingUser = await UserModel.findByUsername(userData.username);
      
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'ມີຊື່ຜູ້ໃຊ້ນີ້ໃນລະບົບແລ້ວ'
        });
        return;
      }
      
      // สร้างผู้ใช้ใหม่
      const userId = await UserModel.create(userData);
      
      res.status(201).json({
        success: true,
        message: 'ສ້າງຜູ້ໃຊ້ສຳເລັດແລ້ວ',
        data: { id: userId }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຜູ້ໃຊ້'
      });
    }
  }

  // อัปเดตข้อมูลผู้ใช้
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDTO = req.body;
      
      // ตรวจสอบว่ามีผู้ใช้อยู่หรือไม่
      const existingUser = await UserModel.findById(id);
      
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້'
        });
        return;
      }
      
      // ตรวจสอบว่าการอัปเดตชื่อผู้ใช้ซ้ำหรือไม่
      if (userData.username && userData.username !== existingUser.username) {
        const usernameExists = await UserModel.findByUsername(userData.username);
        
        if (usernameExists) {
          res.status(400).json({
            success: false,
            message: 'ມີຊື່ຜູ້ໃຊ້ນີ້ໃນລະບົບແລ້ວ'
          });
          return;
        }
      }
      
      // อัปเดตข้อมูลผู้ใช้
      const updated = await UserModel.update(id, userData);
      
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນຜູ້ໃຊ້ໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ອັບເດດຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດແລ້ວ'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນຜູ້ໃຊ້'
      });
    }
  }

  // ลบผู้ใช้
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // ตรวจสอบว่ามีผู้ใช้อยู่หรือไม่
      const existingUser = await UserModel.findById(id);
      
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້'
        });
        return;
      }
      
      // ลบผู้ใช้
      const deleted = await UserModel.delete(id);
      
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'ບໍ່ສາມາດລຶບຂໍ້ມູນຜູ້ໃຊ້ໄດ້'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'ລຶບຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດແລ້ວ'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຜູ້ໃຊ້'
      });
    }
  }
}

export default new UserController(); 