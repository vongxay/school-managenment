export interface Student {
  studentId: string;
  studentNameLao: string;
  guardianPhone: string;
  gender: string;
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
  searchQuery: string;
  photoUrl: string;
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
}