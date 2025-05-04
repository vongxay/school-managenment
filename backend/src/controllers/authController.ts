import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import UserModel from '../models/userModel';
import config from '../config';

class AuthController {
  // ล็อกอินผู้ใช้
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // ตรวจสอบว่ามีข้อมูลครบถ้วน
      if (!username || !password) {
        res.status(400).json({ 
          success: false, 
          message: 'ກະລຸນາລະບຸຊື່ຜູ້ໃຊ້ແລະລະຫັດຜ່ານ' 
        });
        return;
      }

      // ค้นหาผู้ใช้จากฐานข้อมูล
      const user = await UserModel.findByUsername(username);
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' 
        });
        return;
      }

      // ตรวจสอบว่าผู้ใช้ยังใช้งานได้
      if (!user.active) {
        res.status(401).json({ 
          success: false, 
          message: 'ບັນຊີຜູ້ໃຊ້ນີ້ຖືກລະງັບການໃຊ້ງານ' 
        });
        return;
      }

      // ตรวจสอบรหัสผ่าน
      const isPasswordValid = await UserModel.comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        res.status(401).json({ 
          success: false, 
          message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' 
        });
        return;
      }

      // สร้าง JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        config.jwt.secret as Secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      // ส่งข้อมูลผู้ใช้กลับไป (ไม่รวมรหัสผ่าน)
      res.status(200).json({
        success: true,
        message: 'ເຂົ້າສູ່ລະບົບສຳເລັດ',
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ' 
      });
    }
  }

  // ลงทะเบียนผู้ใช้ใหม่
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, name, role } = req.body;

      // ตรวจสอบว่ามีข้อมูลครบถ้วน
      if (!username || !password || !name || !role) {
        res.status(400).json({
          success: false,
          message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
        });
        return;
      }

      // ตรวจสอบว่า username ไม่ซ้ำ
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'ຊື່ຜູ້ໃຊ້ນີ້ຖືກໃຊ້ງານແລ້ວ'
        });
        return;
      }

      // ตรวจสอบค่าของ role
      if (!['admin', 'teacher', 'staff'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'ສະຖານະຜູ້ໃຊ້ບໍ່ຖືກຕ້ອງ'
        });
        return;
      }

      // สร้างผู้ใช้ใหม่
      const userId = await UserModel.create({
        username,
        password,
        name,
        role: role as 'admin' | 'teacher' | 'staff',
        active: true
      });

      res.status(201).json({
        success: true,
        message: 'ລົງທະບຽນສຳເລັດແລ້ວ',
        data: {
          userId
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ'
      });
    }
  }

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  async checkAuth(req: Request, res: Response): Promise<void> {
    try {
      // ข้อมูลผู้ใช้จะถูกเพิ่มโดย middleware
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'ບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ' 
        });
        return;
      }

      // ดึงข้อมูลผู้ใช้ล่าสุดจากฐานข้อมูล
      const user = await UserModel.findById(userId);
      
      if (!user || !user.active) {
        res.status(401).json({ 
          success: false, 
          message: 'ບັນຊີຜູ້ໃຊ້ບໍ່ຖືກຕ້ອງຫຼືຖືກລະງັບການໃຊ້ງານ' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          }
        }
      });
    } catch (error) {
      console.error('Check auth error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'ເກີດຂໍ້ຜິດພາດໃນການກວດສອບການເຂົ້າສູ່ລະບົບ' 
      });
    }
  }
}

export default new AuthController(); 