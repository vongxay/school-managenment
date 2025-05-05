import axios from 'axios';
import type { Student } from '../types/student';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// สร้าง axios instance สำหรับเรียกใช้ API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// แปลง API response ให้ตรงกับรูปแบบข้อมูลฝั่ง frontend
const mapStudent = (apiStudent: any): Student => {
  return {
    studentId: apiStudent.student_id,
    studentNameLao: apiStudent.student_name_lao,
    guardianPhone: apiStudent.guardian_phone,
    gender: apiStudent.gender,
    province: apiStudent.province,
    district: apiStudent.district,
    village: apiStudent.village,
    idNumber: apiStudent.id_number,
    idIssuedDate: apiStudent.id_issued_date,
    birthVillage: apiStudent.birth_village,
    birthDistrict: apiStudent.birth_district,
    birthProvince: apiStudent.birth_province,
    ethnicity: apiStudent.ethnicity,
    religion: apiStudent.religion,
    nationality: apiStudent.nationality,
    dateOfBirth: apiStudent.date_of_birth,
    phoneNumber: apiStudent.phone_number,
    photoUrl: apiStudent.photo_url || '',
    searchQuery: '',
    _id: apiStudent.id // เก็บ id จาก API ไว้สำหรับการอัปเดต
  };
};

// แปลงข้อมูลจาก frontend ให้เป็นรูปแบบที่ API ต้องการ
const mapToApiStudent = (student: Student): any => {
  return {
    student_id: student.studentId,
    student_name_lao: student.studentNameLao,
    guardian_phone: student.guardianPhone,
    gender: student.gender,
    province: student.province,
    district: student.district,
    village: student.village,
    id_number: student.idNumber,
    id_issued_date: student.idIssuedDate,
    birth_village: student.birthVillage,
    birth_district: student.birthDistrict,
    birth_province: student.birthProvince,
    ethnicity: student.ethnicity,
    religion: student.religion,
    nationality: student.nationality,
    date_of_birth: student.dateOfBirth,
    phone_number: student.phoneNumber,
    photo_url: student.photoUrl
  };
};

// ฟังก์ชันสำหรับเรียกใช้ API
export const studentApi = {
  // ดึงข้อมูลนักเรียนทั้งหมด
  getAllStudents: async (): Promise<Student[]> => {
    try {
      const response = await api.get('/students');
      return response.data.data.map(mapStudent);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน:', error);
      throw error;
    }
  },
  
  // ค้นหานักเรียน
  searchStudents: async (query: string, gender?: string): Promise<Student[]> => {
    try {
      let params: any = {};
      if (query) params.query = query;
      if (gender && gender !== 'all') params.gender = gender;
      
      const response = await api.get('/students/search', { params });
      return response.data.data.map(mapStudent);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการค้นหานักเรียน:', error);
      throw error;
    }
  },
  
  // ดึงข้อมูลนักเรียนตาม ID
  getStudentById: async (id: string): Promise<Student | null> => {
    try {
      const response = await api.get(`/students/id/${id}`);
      return mapStudent(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน:', error);
      throw error;
    }
  },
  
  // ดึงข้อมูลนักเรียนตามรหัสนักเรียน
  getStudentByStudentId: async (studentId: string): Promise<Student | null> => {
    try {
      const response = await api.get(`/students/studentId/${studentId}`);
      return mapStudent(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน:', error);
      throw error;
    }
  },
  
  // เพิ่มนักเรียนใหม่
  createStudent: async (student: Student): Promise<string> => {
    try {
      const response = await api.post('/students', mapToApiStudent(student));
      return response.data.data.id;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มนักเรียน:', error);
      throw error;
    }
  },
  
  // อัปเดตข้อมูลนักเรียน
  updateStudent: async (student: Student): Promise<boolean> => {
    try {
      if (!student._id) {
        throw new Error('ไม่พบ ID ของนักเรียน');
      }
      
      await api.put(`/students/${student._id}`, mapToApiStudent(student));
      return true;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตนักเรียน:', error);
      throw error;
    }
  },
  
  // ลบนักเรียน
  deleteStudent: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/students/${id}`);
      return true;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบนักเรียน:', error);
      throw error;
    }
  },
  
  // ดึงข้อมูลการลงทะเบียน
  getRegistrations: async () => {
    try {
      const response = await api.get('/students/registrations');
      return response.data.data;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน:', error);
      throw error;
    }
  },
  
  // ค้นหาข้อมูลการลงทะเบียน
  searchRegistrations: async (query: string) => {
    try {
      const response = await api.get('/students/registrations/search', {
        params: { query }
      });
      return response.data.data;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการค้นหาข้อมูลการลงทะเบียน:', error);
      throw error;
    }
  },
  
  // ดึงข้อมูลการลงทะเบียนตาม Invoice ID
  getRegistrationByInvoiceId: async (invoiceId: string) => {
    try {
      const response = await api.get(`/students/registrations/invoice/${invoiceId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน:', error);
      throw error;
    }
  },
  
  // อัปเดตสถานะการชำระเงิน
  updateRegistrationPaymentStatus: async (id: string, isPaid: boolean) => {
    try {
      await api.patch(`/students/registrations/${id}/payment-status`, { isPaid });
      return true;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน:', error);
      throw error;
    }
  }
}; 