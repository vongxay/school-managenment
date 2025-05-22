import axios from 'axios';
import type { Student, StudentRegistration } from '../types/student';

// สร้างตัวแปรสำหรับเรียกใช้ API ที่เกี่ยวข้องกับนักเรียน
export const studentApi = {
  // ดึงข้อมูลนักเรียนทั้งหมด
  getAllStudents: async (): Promise<Student[]> => {
    try {
      const response = await axios.get('/students');
      return response.data.data.students.map((student: any) => ({
        _id: student.id,
        studentId: student.student_id,
        studentNameLao: student.student_name_lao,
        guardianPhone: student.guardian_phone,
        gender: student.gender,
        province: student.province,
        district: student.district,
        village: student.village,
        idNumber: student.id_number,
        idIssuedDate: student.id_issued_date,
        birthVillage: student.birth_village,
        birthDistrict: student.birth_district,
        birthProvince: student.birth_province,
        ethnicity: student.ethnicity,
        religion: student.religion,
        nationality: student.nationality,
        dateOfBirth: student.date_of_birth,
        phoneNumber: student.phone_number,
        photoUrl: student.photo_url
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // ค้นหานักเรียน
  searchStudents: async (query: string, gender?: string): Promise<Student[]> => {
    try {
      const params: any = {};
      if (query) params.search = query;
      if (gender) params.gender = gender;

      const response = await axios.get('/students', { params });
      return response.data.data.students.map((student: any) => ({
        _id: student.id,
        studentId: student.student_id,
        studentNameLao: student.student_name_lao,
        guardianPhone: student.guardian_phone,
        gender: student.gender,
        province: student.province,
        district: student.district,
        village: student.village,
        idNumber: student.id_number,
        idIssuedDate: student.id_issued_date,
        birthVillage: student.birth_village,
        birthDistrict: student.birth_district,
        birthProvince: student.birth_province,
        ethnicity: student.ethnicity,
        religion: student.religion,
        nationality: student.nationality,
        dateOfBirth: student.date_of_birth,
        phoneNumber: student.phone_number,
        photoUrl: student.photo_url
      }));
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  },

  // สร้างนักเรียนใหม่
  createStudent: async (student: Student): Promise<string> => {
    try {
      const studentData = {
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

      const response = await axios.post('/students', studentData);
      console.log('|4|:', response.data);
      return response.data.data.id;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // อัพเดทข้อมูลนักเรียน
  updateStudent: async (student: Student): Promise<void> => {
    try {
      if (!student._id) {
        throw new Error('Student ID is required for update');
      }

      const studentData = {
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

      await axios.put(`/students/${student._id}`, studentData);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // ลบข้อมูลนักเรียน
  deleteStudent: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/students/${id}`);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // ดึงข้อมูลการลงทะเบียน
  getRegistrations: async (): Promise<StudentRegistration[]> => {
    try {
      const response = await axios.get('/registrations');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }
  },

  // ดึงข้อมูลการลงทะเบียนตาม invoice ID
  getRegistrationByInvoiceId: async (invoiceId: string): Promise<StudentRegistration | null> => {
    try {
      const response = await axios.get(`/registrations/invoice/${invoiceId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching registration by invoice ID:', error);
      throw error;
    }
  },

  // ค้นหาข้อมูลการลงทะเบียน
  searchRegistrations: async (query: string): Promise<StudentRegistration[]> => {
    try {
      const response = await axios.get(`/students/registrations/search?q=${query}`);
      return response.data.data;
    } catch (error) {
      console.error('Error searching registrations:', error);
      throw error;
    }
  },

  // อัพเดทสถานะการชำระเงิน
  updateRegistrationPaymentStatus: async (id: string, isPaid: boolean): Promise<boolean> => {
    try {
      await axios.put(`/registrations/${id}/payment-status`, { is_paid: isPaid });
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}; 