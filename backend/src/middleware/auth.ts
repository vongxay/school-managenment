import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

// ขยาย interface ของ Express Request เพื่อเพิ่ม user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
      };
    }
  }
}

// มิดเดิลแวร์สำหรับการยืนยันตัวตน
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // ตรวจสอบ header สำหรับ token
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader);
    if (!authHeader) {
      res.status(401).json({ message: 'ບໍ່ມີໂທເຄັນການເຂົ້າລະບົບ' });
      return;
    }

    // แยก token จาก Bearer
    const token = authHeader.split(' ')[1];
    console.log('Token:', token);
    if (!token) {
      res.status(401).json({ message: 'ບໍ່ມີໂທເຄັນການເຂົ້າລະບົບ' });
      return;
    }

    // ยืนยัน token
    const decoded = jwt.verify(token, Buffer.from(config.jwt.secret)) as {
      id: string;
      username: string;
      role: string;
    };

    // เพิ่มข้อมูลผู้ใช้เข้าไปใน request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'ໂທເຄັນບໍ່ຖືກຕ້ອງຫລືໝົດອາຍຸ' });
  }
};

// มิดเดิลแวร์สำหรับตรวจสอบบทบาท
export const authorize = (roles: string[]): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'ບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'ບໍ່ມີສິດເຂົ້າເຖິງ' });
      return;
    }

    next();
  };
}; 