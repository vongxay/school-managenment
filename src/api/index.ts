import axios from 'axios';

// กำหนดค่า API URL จาก environment หรือใช้ค่าเริ่มต้น
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// สร้าง axios instance สำหรับใช้งานตลอดแอพพลิเคชัน
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor สำหรับเพิ่ม token ลงใน header ทุกครั้งที่มีการส่งคำขอ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor สำหรับจัดการข้อผิดพลาดจากการตอบสนอง
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // กรณี token หมดอายุหรือไม่ถูกต้อง (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // ถ้าต้องการทำการ redirect ไปยังหน้า login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 