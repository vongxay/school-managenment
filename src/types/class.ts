export interface Class {
  id: string;
  name: string;
  grade: string;
  year: string;
  teacherId: string;
  maxStudents: number;
  currentStudents: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
} 