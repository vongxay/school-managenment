import { api } from './index';

// ดึงข้อมูลรายงานนักเรียน
export const getStudentReportsByYear = async (params?: {
  year_id?: number;
  level_id?: string;
  // class_id?: string;
}) => {
  try {
    console.log('Fetching student reports with params{{}}:', params);
    const response = await api.get('/reports/studentByYear', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching student reports:', error);
    throw error;
  }
};

// ดึงข้อมูลรายงานการเงิน
export const getFinancialReports = async (params?: {
  year_id?: number;
  month?: string;
}) => {
  try {
    const response = await api.get('/reports/financial', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    throw error;
  }
};

// ดึงข้อมูลรายงานด้านการเรียน
export const getAcademicReports = async (params?: {
  year_id?: number;
  level_id?: string;
}) => {
  try {
    const response = await api.get('/reports/academic', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching academic reports:', error);
    throw error;
  }
};

// ดึงข้อมูลรายงานทั้งหมด
export const getAllReports = async (params?: {
  year_id?: number;
  level_id?: string;
  class_id?: string;
  month?: string;
}) => {
  try {
    const response = await api.get('/reports/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all reports:', error);
    throw error;
  }
};

// ดึงข้อมูลรายงานแนวโน้มของนักเรียนตามปีการศึกษา
export const getStudentTrends = async () => {
  try {
    const response = await api.get('/reports/student-trends');
    return response.data;
  } catch (error) {
    console.error('Error fetching student trends:', error);
    throw error;
  }
};

// ดึงข้อมูลรายงานการมีนักเรียนและขาดนักเรียน
export const getAttendanceReports = async (params?: {
  year_id?: number;
  class_id?: string;
}) => {
  try {
    const response = await api.get('/reports/attendance', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance reports:', error);
    throw error;
  }
};

// ดึงข้อมูลรายงานสมที่บคะแนนสอบเสังละหว่างชั้นเรียน
export const getExamComparisons = async (params?: {
  year_id?: number;
  level_id?: string;
}) => {
  try {
    const response = await api.get('/reports/exam-comparisons', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching exam comparisons:', error);
    throw error;
  }
};

// ดึงข้อมูลรายงานผลการเรียนของนักเรียน
export const getStudentPerformance = async (params?: {
  year_id?: number;
  class_id?: string;
  limit?: number;
}) => {
  try {
    const response = await api.get('/reports/student-performance', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching student performance:', error);
    throw error;
  }
}; 