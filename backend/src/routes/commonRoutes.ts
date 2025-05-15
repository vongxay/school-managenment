import express from 'express';
import * as commonController from '../controllers/commonController';

const router = express.Router();

// เส้นทางสำหรับดึงข้อมูลปีการศึกษา
router.get('/academic-years', commonController.getAcademicYears);

// เส้นทางสำหรับดึงข้อมูลชั้นเรียน
router.get('/levels', commonController.getLevels);

// เส้นทางสำหรับดึงข้อมูลห้องเรียน
router.get('/classes', commonController.getClasses);

export default router; 