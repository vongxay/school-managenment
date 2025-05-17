import { Request, Response } from 'express';
import * as reportModel from '../models/reportModel';

// ฟังก์ชันสำหรับดึงข้อมูลรายงานนักเรียนทั้งหมด
export const getStudentReports = async (req: Request, res: Response) => {
  try {
    const { year_id, level_id, class_id } = req.query;

    // แปลงค่าให้เป็นตัวเลข (ถ้ามี)
    const yearId = year_id ? parseInt(year_id as string) : undefined;
    
    // ดึงข้อมูลนักเรียนตามเพศ
    const genderData = await reportModel.getStudentsByGender(
      yearId, 
      level_id as string,
      class_id as string
    );
    
    // ดึงข้อมูลนักเรียนตามชั้นเรียน
    const levelData = await reportModel.getStudentsByLevel(
      yearId
    );
    
    // ดึงข้อมูลสถานะการจ่ายค่าเรียน
    const tuitionData = await reportModel.getTuitionStatus(
      yearId,
      level_id as string,
      class_id as string
    );

    // ดึงข้อมูลรายชื่อนักเรียนสำหรับรายงาน
    const studentList = await reportModel.getStudentList(
      yearId,
      level_id as string,
      class_id as string
    );
    
    res.json({
      success: true,
      data: {
        studentsByGender: genderData,
        studentsByLevel: levelData,
        tuitionStatus: tuitionData,
        studentList: studentList
      }
    });
  } catch (error) {
    console.error('Error in getStudentReports:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานนักเรียน',
      error: (error as Error).message
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลรายงานการเงิน
export const getFinancialReports = async (req: Request, res: Response) => {
  try {
    const { year_id, month } = req.query;

    // แปลงค่าให้เป็นตัวเลข (ถ้ามี)
    const yearId = year_id ? parseInt(year_id as string) : undefined;
    
    try {
      // ดึงข้อมูลรายได้ตามเดือน
      const monthlyData = await reportModel.getMonthlyPayments(
        yearId,
        month as string
      );
      
      // คำนวณยอดรวมทั้งหมด
      const totalAmount = monthlyData.reduce((sum, item) => sum + item.amount, 0);

      // ดึงข้อมูลรายงานการเงินสำหรับการแสดงในตาราง
      const financialReportData = await reportModel.getFinancialReportByMonth(
        yearId,
        month as string
      );
      
      res.json({
        success: true,
        data: {
          monthlyPayments: monthlyData,
          totalAmount: totalAmount,
          financialReport: financialReportData
        }
      });
    } catch (error) {
      console.error('Error fetching monthly payments:', error);
      // ส฻งข้อมูลว่างแทนกานโญนข้อผิดพลาด
      res.json({
        success: true,
        data: {
          monthlyPayments: [],
          totalAmount: 0,
          financialReport: []
        }
      });
    }
  } catch (error) {
    console.error('Error in getFinancialReports:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานการเงิน',
      error: (error as Error).message
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลรายงานด้านการเรียน
export const getAcademicReports = async (req: Request, res: Response) => {
  try {
    const { year_id, level_id, class_id } = req.query;

    // แปลงค่าให้เป็นตัวเลข (ถ้ามี)
    const yearId = year_id ? parseInt(year_id as string) : undefined;
    
    // ดึงข้อมูลผลการเรียนเฉลี่ยของห้องเรียน
    const classData = await reportModel.getClassAverages(
      yearId,
      level_id as string
    );

    // ดึงข้อมูลคะแนนรายวิชาตามห้องเรียน (สำหรับรายงาน gradesByClass)
    const gradesByClassData = await reportModel.getGradesByClass(
      yearId, 
      level_id as string,
      class_id as string
    );

    // ดึงข้อมูลคะแนนเฉลี่ยตามชั้นเรียน (สำหรับรายงาน gradesByLevel)
    const gradesByLevelData = await reportModel.getGradesByLevel(
      yearId,
      level_id as string
    );
    
    res.json({
      success: true,
      data: {
        classAverages: classData,
        gradesByClass: gradesByClassData,
        gradesByLevel: gradesByLevelData
      }
    });
  } catch (error) {
    console.error('Error in getAcademicReports:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานด้านการเรียน',
      error: (error as Error).message
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลรายงานทั้งหมด
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const { year_id, level_id, class_id, month } = req.query;

    // แปลงค่าให้เป็นตัวเลข (ถ้ามี)
    const yearId = year_id ? parseInt(year_id as string) : undefined;
    
    // ดึงข้อมูลทั้งหมด
    const [
      genderData, 
      levelData, 
      tuitionData, 
      monthlyData, 
      classData, 
      studentList,
      attendanceList,
      gradesByClass,
      gradesByLevel,
      registrationData,
      financialReportData
    ] = await Promise.all([
      reportModel.getStudentsByGender(yearId, level_id as string, class_id as string),
      reportModel.getStudentsByLevel(yearId),
      reportModel.getTuitionStatus(yearId, level_id as string, class_id as string),
      reportModel.getMonthlyPayments(yearId, month as string),
      reportModel.getClassAverages(yearId, level_id as string),
      reportModel.getStudentList(yearId, level_id as string, class_id as string),
      reportModel.getAttendanceList(yearId, level_id as string, class_id as string),
      reportModel.getGradesByClass(yearId, level_id as string, class_id as string),
      reportModel.getGradesByLevel(yearId, level_id as string),
      reportModel.getRegistrationData(yearId, level_id as string, class_id as string),
      reportModel.getFinancialReportByMonth(yearId, month as string)
    ]);
    
    // คำนวณยอดรวมทั้งหมด
    const totalAmount = monthlyData.reduce((sum, item) => sum + item.amount, 0);
    
    res.json({
      success: true,
      data: {
        studentsByGender: genderData,
        studentsByLevel: levelData,
        tuitionStatus: tuitionData,
        monthlyPayments: monthlyData,
        totalAmount: totalAmount,
        classAverages: classData,
        studentList: studentList,
        attendanceList: attendanceList,
        gradesByClass: gradesByClass,
        gradesByLevel: gradesByLevel,
        registration: registrationData,
        financialReport: financialReportData
      }
    });
  } catch (error) {
    console.error('Error in getAllReports:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานทั้งหมด',
      error: (error as Error).message
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลแนวโน้มของนักเรียนตามปีการสึกสำหรับ
export const getStudentTrends = async (req: Request, res: Response) => {
  try {
    const trendData = await reportModel.getStudentTrends();
    
    res.json({
      success: true,
      data: {
        studentTrends: trendData
      }
    });
  } catch (error) {
    console.error('Error in getStudentTrends:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลแนวโน้มของนักเรียน',
      error: (error as Error).message
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลการมารียนและขาดรียน
export const getAttendanceReports = async (req: Request, res: Response) => {
  try {
    const { year_id, level_id, class_id } = req.query;
    
    // แปลงค่าให้เป็นตัวเลข (ถ้ามี)
    const yearId = year_id ? parseInt(year_id as string) : undefined;
    
    const attendanceData = await reportModel.getAttendanceReports(
      yearId,
      class_id as string
    );

    // ดึงข้อมูลการมาเรียนของนักเรียนแต่ละคน (สำหรับรายงาน attendanceList)
    const attendanceList = await reportModel.getAttendanceList(
      yearId,
      level_id as string,
      class_id as string
    );
    
    res.json({
      success: true,
      data: {
        attendanceReports: attendanceData,
        attendanceList: attendanceList
      }
    });
  } catch (error) {
    console.error('Error in getAttendanceReports:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการมารียนและขาดรียน',
      error: (error as Error).message
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลส฻มท฽บคะแนนสอบเสังละหว่างชั้นเรียน
export const getExamComparisons = async (req: Request, res: Response) => {
  try {
    const { year_id, level_id } = req.query;
    
    // แปลงค่าให้เป็นตัวเลข (ถ้ามี)
    const yearId = year_id ? parseInt(year_id as string) : undefined;
    
    const examData = await reportModel.getExamComparisons(
      yearId,
      level_id as string
    );
    
    res.json({
      success: true,
      data: {
        examComparisons: examData
      }
    });
  } catch (error) {
    console.error('Error in getExamComparisons:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลส฻มท฽บคะแนนสอบเสัง',
      error: (error as Error).message
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลผลการรียนของนักเรียน
export const getStudentPerformance = async (req: Request, res: Response) => {
  try {
    const { year_id, class_id, limit } = req.query;
    
    // แปลงค่าให้เป็นตัวเลข (ถ้ามี)
    const yearId = year_id ? parseInt(year_id as string) : undefined;
    const limitNumber = limit ? parseInt(limit as string) : 10;
    
    const performanceData = await reportModel.getStudentPerformance(
      yearId,
      class_id as string,
      limitNumber
    );
    
    res.json({
      success: true,
      data: {
        studentPerformance: performanceData
      }
    });
  } catch (error) {
    console.error('Error in getStudentPerformance:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผลการรียนของนักเรียน',
      error: (error as Error).message
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลการลงทะเบียน
export const getRegistrationReports = async (req: Request, res: Response) => {
  try {
    const { year_id, level_id, class_id } = req.query;
    
    // แปลงค่าให้เป็นตัวเลข (ถ้ามี)
    const yearId = year_id ? parseInt(year_id as string) : undefined;
    
    const registrationData = await reportModel.getRegistrationData(
      yearId,
      level_id as string,
      class_id as string
    );
    
    res.json({
      success: true,
      data: {
        registration: registrationData
      }
    });
  } catch (error) {
    console.error('Error in getRegistrationReports:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน',
      error: (error as Error).message
    });
  }
}; 