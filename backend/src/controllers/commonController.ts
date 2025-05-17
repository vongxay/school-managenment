import { Request, Response } from 'express';
import * as commonModel from '../models/commonModel';

// ดึงข้อมูลปีการศึกษาทั้งหมด
export const getAcademicYears = async (req: Request, res: Response) => {
  try {
    const years = await commonModel.getAcademicYears();
    res.json({
      success: true,
      data: years
    });
  } catch (error) {
    console.error('Error in getAcademicYears:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลปีการศึกษา',
      error: (error as Error).message
    });
  }
};

// ดึงข้อมูลชั้นเรียนทั้งหมด
export const getLevels = async (req: Request, res: Response) => {
  try {
    const levels = await commonModel.getLevels();
    res.json({
      success: true,
      data: levels
    });
  } catch (error) {
    console.error('Error in getLevels:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลชั้นเรียน',
      error: (error as Error).message
    });
  }
};

// ดึงข้อมูลห้องเรียนทั้งหมด หรือกรองตามชั้นเรียน
export const getClasses = async (req: Request, res: Response) => {
  try {
    const { level_id } = req.query;
    const classes = await commonModel.getClasses(level_id as string);
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error in getClasses:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลห้องเรียน',
      error: (error as Error).message
    });
  }
}; 