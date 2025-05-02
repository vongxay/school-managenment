import { ref, reactive } from 'vue';
import type { Student } from '../types/student';

// สร้างข้อมูลจำลองสำหรับรายการนักเรียน
const students = reactive<Student[]>([
  {
    studentId: '005',
    studentNameLao: 'ວັນ ສຸລິນທາ',
    guardianPhone: '020 56667788',
    gender: 'M',
    province: 'ສຸຂຮອຍ',
    district: 'ແປກ',
    village: 'ຕັ້ງໂຊ',
    idNumber: '9320293923',
    idIssuedDate: '2/5/2022',
    birthVillage: 'ຕັ້ງໂຊ',
    birthDistrict: 'ແປກ',
    birthProvince: 'ສຸຂຮອຍ',
    ethnicity: 'ມົ້ງ',
    religion: 'ຜີ',
    nationality: 'ລາວ',
    dateOfBirth: '10/11/1999',
    phoneNumber: '02056442394',
    searchQuery: '',
    photoUrl: ''
  },
  {
    studentId: '004',
    studentNameLao: 'ແສງພະຈັນ',
    guardianPhone: '03056424356',
    gender: 'M',
    province: 'ສຸຂຮອຍ',
    district: 'ໄຊສະນະ',
    village: 'ຕັ້ງໂຊ',
    idNumber: '7487484978',
    idIssuedDate: '5/3/2022',
    birthVillage: 'ຕັ້ງໂຊ',
    birthDistrict: 'ໄຊສະນະ',
    birthProvince: 'ສຸຂຮອຍ',
    ethnicity: 'ມົ້ງ',
    religion: 'ຜີ',
    nationality: 'ລາວ',
    dateOfBirth: '10/1/1998',
    phoneNumber: '02059482364',
    searchQuery: '',
    photoUrl: ''
  },
  {
    studentId: '002',
    studentNameLao: 'ຈັນສະຫວັນ',
    guardianPhone: '02044556623',
    gender: 'M',
    province: 'ສຸຂຮອຍ',
    district: 'ໄພສະທອນ',
    village: 'ບ້ານສະຫວັນ',
    idNumber: '5949849467',
    idIssuedDate: '3/8/2022',
    birthVillage: 'ບ້ານສະຫວັນ',
    birthDistrict: 'ໄພສະທອນ',
    birthProvince: 'ສຸຂຮອຍ',
    ethnicity: 'ໄທ',
    religion: 'ຜີ',
    nationality: 'ລາວ',
    dateOfBirth: '18/7/1999',
    phoneNumber: '02056552654',
    searchQuery: '',
    photoUrl: ''
  },
  {
    studentId: '001',
    studentNameLao: 'ນູ່ຈິ',
    guardianPhone: '03022335566',
    gender: 'F',
    province: 'ນະຄອນຫລວງ',
    district: 'ໄຊທານີ',
    village: 'ໂພນໂຮງ',
    idNumber: '4784894979',
    idIssuedDate: '5/9/2021',
    birthVillage: 'ໂພນໂຮງ',
    birthDistrict: 'ໄຊທານີ',
    birthProvince: 'ນະຄອນຫລວງ',
    ethnicity: 'ໄທ',
    religion: 'ພຸດ',
    nationality: 'ລາວ',
    dateOfBirth: '16/12/2000',
    phoneNumber: '02059436126',
    searchQuery: '',
    photoUrl: ''
  },
]);

// สร้าง empty student object สำหรับฟอร์มใหม่
const emptyStudent = (): Student => ({
  studentId: '',
  studentNameLao: '',
  guardianPhone: '',
  gender: 'M',
  province: '',
  district: '',
  village: '',
  idNumber: '',
  idIssuedDate: '',
  birthVillage: '',
  birthDistrict: '',
  birthProvince: '',
  ethnicity: '',
  religion: '',
  nationality: 'ລາວ',
  dateOfBirth: '',
  phoneNumber: '',
  searchQuery: '',
  photoUrl: ''
});

// สร้าง current student สำหรับฟอร์มแก้ไข
const currentStudent = reactive<Student>(emptyStudent());
const isEditing = ref(false);
const searchQuery = ref('');
const selectedGender = ref('all');

// Export store functions
export const useStudentStore = () => {
  // ดึงข้อมูลนักเรียนทั้งหมด
  const getAllStudents = () => students;

  // ดึงข้อมูลนักเรียนที่กรองแล้ว
  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = 
        student.studentId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        student.studentNameLao.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        student.phoneNumber.toLowerCase().includes(searchQuery.value.toLowerCase());
      
      const matchesGender = selectedGender.value === 'all' || student.gender === selectedGender.value;
      
      return matchesSearch && matchesGender;
    });
  };

  // เพิ่มนักเรียนใหม่
  const addStudent = (student: Student) => {
    // กำหนด ID ใหม่ (ตัวอย่างง่ายๆ)
    if (!student.studentId) {
      const maxId = Math.max(...students.map(s => parseInt(s.studentId) || 0));
      student.studentId = String(maxId + 1).padStart(3, '0');
    }
    students.push({...student});
    return student.studentId;
  };

  // อัพเดทข้อมูลนักเรียน
  const updateStudent = (student: Student) => {
    const index = students.findIndex(s => s.studentId === student.studentId);
    if (index !== -1) {
      students[index] = {...student};
      return true;
    }
    return false;
  };

  // ลบนักเรียน
  const deleteStudent = (studentId: string) => {
    const index = students.findIndex(s => s.studentId === studentId);
    if (index !== -1) {
      students.splice(index, 1);
      return true;
    }
    return false;
  };

  // เริ่มแก้ไขนักเรียน
  const startEdit = (studentId: string) => {
    const student = students.find(s => s.studentId === studentId);
    if (student) {
      // Clone student data to currentStudent
      Object.assign(currentStudent, student);
      isEditing.value = true;
      return true;
    }
    return false;
  };

  // ล้างฟอร์มสำหรับนักเรียนใหม่
  const startNew = () => {
    Object.assign(currentStudent, emptyStudent());
    isEditing.value = false;
  };

  // ล้างการค้นหา
  const clearSearch = () => {
    searchQuery.value = '';
    selectedGender.value = 'all';
  };

  return {
    students,
    currentStudent,
    isEditing,
    searchQuery,
    selectedGender,
    getAllStudents,
    getFilteredStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    startEdit,
    startNew,
    clearSearch,
    getStudentById: (studentId: string) => {
      return students.find(s => s.studentId === studentId);
    },
    getTuitionFee: async (yearLevel: string) => {
      // สมมติค่าเรียนตามระดับชั้น
      const fees: {[key: string]: number} = {
        'ມ 1': 60000,
        'ມ 2': 65000,
        'ມ 3': 70000,
        'ມ 4': 75000,
        'ມ 5': 80000,
        'ມ 6': 85000,
      };
      return fees[yearLevel] || 50000; // ค่าเริ่มต้นถ้าไม่พบระดับชั้น
    },
    savePayment: async (paymentData: any) => {
      console.log('บันทึกการชำระเงิน:', paymentData);
      // ในระบบจริงจะส่งข้อมูลไปบันทึกที่ API
      return true;
    }
  };
}; 