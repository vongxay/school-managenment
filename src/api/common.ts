import { api } from './index';

// ดึงข้อมูลปีการศึกษาทั้งหมด
export const getAcademicYears = async () => {
  try {
    const response = await api.get('/common/academic-years');
    console.log('response.data', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching academic years:', error);
    throw error;
  }
};

// ดึงข้อมูลชั้นเรียนทั้งหมด
export const getLevels = async () => {
  try {
    const response = await api.get('/common/levels');
    return response.data;
  } catch (error) {
    console.error('Error fetching levels:', error);
    throw error;
  }
};

// ดึงข้อมูลห้องเรียนทั้งหมด หรือกรองตามชั้นเรียน
export const getClasses = async (level_id?: string) => {
  try {
    const params = level_id ? { level_id } : {};
    const response = await api.get('/common/classes', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
}; 