export interface Student {
  studentId: string;
  studentNameLao: string;
  guardianPhone: string;
  gender: 'M' | 'F';
  province: string;
  district: string;
  village: string;
  idNumber: string;
  idIssuedDate: string;
  birthVillage: string;
  birthDistrict: string;
  birthProvince: string;
  ethnicity: string;
  religion: string;
  nationality: string;
  dateOfBirth: string;
  phoneNumber: string;
  photoUrl: string;
  searchQuery: string;
  _id?: string; // ID จาก API
}

export interface StudentFormValidation {
  studentId: boolean;
  studentNameLao: boolean;
  phoneNumber: boolean;
  gender: boolean;
  dateOfBirth: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'teacher' | 'staff';
  active: boolean;
  image: string | null;
}

export interface StudentRegistration {
  id: string;
  invoice_id: string;
  student_id: string;
  student_name: string;
  student_phone: string;
  classroom: string;
  level: string;
  school_year: string;
  is_paid: boolean;
  registration_date: string;
  tuition_fee: number;
}