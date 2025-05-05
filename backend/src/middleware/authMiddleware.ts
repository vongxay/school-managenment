import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

interface DecodedToken {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // ຮັບ token ຈາກ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // ກວດສອບ token
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
    
    // ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້ເຂົ້າໄປໃນຄຳຂໍ
    (req as any).user = {
      userId: decoded.userId,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'ເຊສຊັນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່' 
    });
  }
};

// middleware ສຳລັບກວດສອບສິດທິຂອງ admin
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'ທ່ານບໍ່ມີສິດໃຊ້ງານສ່ວນນີ້' 
      });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການກວດສອບສິດທິ' 
    });
  }
}; 