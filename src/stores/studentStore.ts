import { ref, reactive } from 'vue';
import type { Student } from '../types/student';

// เพิ่มข้อมูลการลงทะเบียน
interface StudentRegistration {
  id: string;
  registrationDate: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  classroom: string;
  level: string;
  schoolYear: string;
  paid: boolean;
}

// ข้อมูลการลงทะเบียนจำลอง
const registrations = reactive<StudentRegistration[]>([
  { 
    id: 'INV-00000031', 
    registrationDate: '2022-6-11', 
    studentId: '008', 
    studentName: 'ທ້າວ ກັນ ໄຊສະຫຸຼດ', 
    studentPhone: '02059874624', 
    classroom: 'ມ 3/1', 
    level: 'ຊັ້ນ ມ 3', 
    schoolYear: '2024-2025', 
    paid: true 
  },
  { 
    id: 'INV-00000032', 
    registrationDate: '2022-6-11', 
    studentId: '009', 
    studentName: 'ທ້າວ ບີ ບຸນມີໃຈ', 
    studentPhone: '02026345982', 
    classroom: 'ມ 3/1', 
    level: 'ຊັ້ນ ມ 3', 
    schoolYear: '2024-2025', 
    paid: true 
  },
  { 
    id: 'INV-00000033', 
    registrationDate: '2022-6-11', 
    studentId: '010', 
    studentName: 'ທ້າວ ເອ ແສງຈັນ', 
    studentPhone: '02056234895', 
    classroom: 'ມ 3/1', 
    level: 'ຊັ້ນ ມ 3', 
    schoolYear: '2024-2025', 
    paid: true 
  },
  { 
    id: 'INV-00000034', 
    registrationDate: '2023-6-15', 
    studentId: '020', 
    studentName: 'ທ້າວ ຊິງຕາ ຈັນມາລີ', 
    studentPhone: '0205689234', 
    classroom: 'ມ 1/1', 
    level: 'ຊັ້ນ ມ 1', 
    schoolYear: '2023-2024', 
    paid: true 
  },
]);

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
    getRegistrations: () => {
      return registrations;
    },
    getRegistrationByInvoiceId: (invoiceId: string) => {
      if (!invoiceId) {
        console.error('ລະຫັດລົງທະບຽນເປັນຄ່າຫວ່າງ');
        return null;
      }
      
      console.log('ຄົ້ນຫາລະຫັດລົງທະບຽນ:', invoiceId);
      console.log('ຂໍ້ມູນລົງທະບຽນທັງໝົດ:', registrations.length, 'ລາຍການ');
      
      const reg = registrations.find(r => r.id === invoiceId);
      console.log('ຜົນການຄົ້ນຫາ:', reg ? 'ພົບຂໍ້ມູນ' : 'ບໍ່ພົບຂໍ້ມູນ');
      
      return reg || null;
    },
    searchRegistrations: (query: string) => {
      if (!query) {
        return [];
      }
      
      query = query.toLowerCase();
      console.log('ຄົ້ນຫາຂໍ້ມູນລົງທະບຽນດ້ວຍຄຳວ່າ:', query);
      
      const results = registrations.filter(reg => 
        reg.id.toLowerCase().includes(query) || 
        reg.studentId.toLowerCase().includes(query) || 
        reg.studentName.toLowerCase().includes(query) ||
        reg.studentPhone.toLowerCase().includes(query)
      );
      
      console.log('ພົບ', results.length, 'ລາຍການ');
      return results;
    },
    getTuitionFee: async (yearLevel: string) => {
      // สมมติค่าเรียนตามระดับชั้น
      const fees: {[key: string]: number} = {
        'ຊັ້ນ ມ 1': 60000,
        'ຊັ້ນ ມ 2': 65000,
        'ຊັ້ນ ມ 3': 70000,
        'ຊັ້ນ ມ 4': 75000,
        'ຊັ້ນ ມ 5': 80000,
        'ຊັ້ນ ມ 6': 85000,
      };
      return fees[yearLevel] || 50000; // ค่าเริ่มต้นถ้าไม่พบระดับชั้น
    },
    savePayment: async (paymentData: any) => {
      console.log('บันทึกการชำระเงิน:', paymentData);
      // ในระบบจริงจะส่งข้อมูลไปบันทึกที่ API
      return true;
    },
    updateRegistrationPaymentStatus: async (studentId: string, isPaid: boolean) => {
      // หาข้อมูลการลงทะเบียนของนักเรียน
      const foundRegistration = registrations.find(r => r.studentId === studentId);
      if (foundRegistration) {
        foundRegistration.paid = isPaid;
        console.log(`อัปเดตสถานะการชำระเงินของการลงทะเบียน ${foundRegistration.id} เป็น ${isPaid ? 'ຈ່າຍ' : 'ຍັງບໍ່ຈ່າຍ'}`);
      }
      return true;
    }
  };
}; 