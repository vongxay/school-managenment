import express from 'express';
import * as reportController from '../controllers/reportController';

const router = express.Router();

// เส้นทางสำหรับดึงข้อมูลรายงานนักเรียน
router.get('/students', reportController.getStudentReports);

// เส้นทางสำหรับดึงข้อมูลรายงานการเงิน
router.get('/financial', reportController.getFinancialReports);

// เส้นทางสำหรับดึงข้อมูลรายงานด้านการเรียน
router.get('/academic', reportController.getAcademicReports);

// เส้นทางสำหรับดึงข้อมูลรายงานทั้งหมด
router.get('/all', reportController.getAllReports);

// เส้นทางสำหรับดึงข้อมูลรายงานที่นักเรียนต้องสึกสำหรับปีการศึกษา
router.get('/student-trends', reportController.getStudentTrends);

// เส้นทางสำหรับดึงข้อมูลรายงานการมีครูสอนและครูขาดสอน
router.get('/attendance', reportController.getAttendanceReports);

// เส้นทางสำหรับดึงข้อมูลรายงานการสอบคะแนนระหว่างชั้นเรียน
router.get('/exam-comparisons', reportController.getExamComparisons);

// เส้นทางสำหรับดึงข้อมูลรายงานผลการเรียนของนักเรียน
router.get('/student-performance', reportController.getStudentPerformance);

// เส้นทางสำหรับดึงข้อมูลรายงานการลงทะเบียน
router.get('/registration', reportController.getRegistrationReports);

export default router; 