<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { useStudentStore } from '../stores/studentStore';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

const studentStore = useStudentStore();
const authStore = useAuthStore();

interface Payment {
  invoiceNo: string;
  date: string;
  tuitionId: string;
  studentName: string;
  studentPhone: string;
  yearLevel: string;
  level: string;
  classLevel: string;
  academicYear: string;
  status: string;
}

// รับข้อมูลนักเรียนจาก prop
const props = defineProps({
  studentId: {
    type: String,
    default: ''
  }
});

const payment = reactive<Payment>({
  invoiceNo: 'INV-' + Math.floor(Math.random() * 1000000).toString().padStart(9, '0'),
  date: new Date().toISOString().split('T')[0],
  tuitionId: '',
  studentName: '',
  studentPhone: '',
  yearLevel: '',
  level: '',
  classLevel: '',
  academicYear: '',
  status: 'ລໍຖ້າຊໍາລະ'
});

const amount = ref<number>(0);
const paidAmount = ref<number>(0);
const changeAmount = computed(() => {
  return Math.max(0, paidAmount.value - amount.value);
});

// เพิ่ม state สำหรับการค้นหานักเรียน
const studentSearchQuery = ref('');
const filteredRegistrations = ref<any[]>([]);
const showStudentSearch = ref(false);

// เพิ่มตัวแปรสำหรับเก็บข้อมูลการลงทะเบียนที่ยังไม่ชำระเงิน
const unpaidRegistrations = ref<any[]>([]);

// เพิ่ม loading state
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

// เพิ่มตัวแปรสำหรับเก็บข้อมูลค่าเรียน
const tuitionInfo = ref<{id: string, amount: number, level: string, year: string}>({ 
  id: '', 
  amount: 0,
  level: '',
  year: ''
});
const API_URL = 'http://localhost:5000/api';

// เพิ่มตัวแปรใหม่สำหรับเก็บประวัติการชำระเงิน
const paymentHistory = ref<any[]>([]);
const showPaymentHistory = ref(false);

// โหลดข้อมูลนักเรียนเมื่อคอมโพเนนต์ถูกโหลด
const loadData = async () => {
  if (props.studentId) {
    // ถ้ามี studentId ในพร็อพ ให้โหลดข้อมูลนักเรียน
    try {
      isLoading.value = true;
      await loadStudentData(props.studentId);
      isLoading.value = false;
    } catch (error) {
      console.error('ບໍ່ສາມາດໂຫລດຂໍ້ມູນນັກສຶກສາໄດ້:', error);
      hasError.value = true;
      errorMessage.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນນັກສຶກສາໄດ້';
      isLoading.value = false;
    }
  } else {
    // ถ้าไม่มี studentId ให้ดึงข้อมูลการลงทะเบียนที่ยังไม่ชำระเงินมาแสดง
    await fetchUnpaidRegistrations();
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับดึงข้อมูลการลงทะเบียนที่ยังไม่ชำระเงิน
const fetchUnpaidRegistrations = async () => {
  try {
    isLoading.value = true;
    // เรียก API เพื่อดึงข้อมูลการลงทะเบียนที่ยังไม่ชำระเงิน
    const response = await axios.get(`${API_URL}/registrations?paid=false`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`
      }
    });

    if (response.data.success && response.data.data.registrations.length > 0) {
      console.log('ພົບການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນ:', response.data.data.registrations);
      
      // เก็บข้อมูลไว้ในตัวแปร
      unpaidRegistrations.value = response.data.data.registrations.map((reg: any) => {
        // ແນ່ໃຈວ່າໃຊ້ field id ທີ່ຖືກຕ້ອງ
        const regId = reg.id; 
        
        return {
          id: regId,
          registrationDate: reg.registration_date,
          studentId: reg.student_id,
          studentName: reg.student_name || '',
          studentPhone: reg.student_phone || '',
          classroom: reg.classroom || '',
          level: reg.level || '',
          schoolYear: reg.school_year || '',
          paid: reg.paid || reg.is_paid || false,
          tuition_fee: reg.tuition_fee || 0
        };
      });
      
      // แสดงข้อมูลการลงทะเบียนแรกในรายการ
      if (unpaidRegistrations.value.length > 0) {
        const firstReg = unpaidRegistrations.value[0];
        // เลือกการลงทะเบียนนี้เพื่อแสดงในฟอร์ม
        await selectRegistration(firstReg.id);
      }
    } else {
      console.log('ບໍ່ພົບການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນ');
      unpaidRegistrations.value = [];
    }
  } catch (error) {
    console.error('ບໍ່ສາມາດໂຫລດຂໍ້ມູນການລົງທະບຽນໄດ້:', error);
    hasError.value = true;
    errorMessage.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນການລົງທະບຽນໄດ້';
  } finally {
    isLoading.value = false;
  }
};

// โหลดข้อมูลค่าเรียน
const loadTuitionInfo = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_URL}/tuitions`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`
      }
    });
    if (response.data.success && response.data.data.length > 0) {
      // เก็บข้อมูลค่าเรียนทั้งหมดไว้ใช้
      const allTuitions = response.data.data;
      console.log("ข้อมูลค่าเรียนทั้งหมด:", allTuitions);
      
      // ถ้ามีข้อมูลชั้นเรียนและปีการศึกษาแล้ว ใช้หาค่าเรียนที่เหมาะสม
      if (payment.level && payment.academicYear) {
        const matchingTuition = allTuitions.find((t: any) => 
          t.level === payment.level && 
          t.year === payment.academicYear
        );
        
        if (matchingTuition) {
          tuitionInfo.value = { 
            id: matchingTuition.id,
            amount: matchingTuition.amount,
            level: matchingTuition.level,
            year: matchingTuition.year
          };
          amount.value = tuitionInfo.value.amount;
        } else {
          // ถ้าไม่พบค่าเรียนที่ตรงกัน ใช้ค่าแรกเป็นค่าเริ่มต้น
          tuitionInfo.value = { 
            id: allTuitions[0].id,
            amount: allTuitions[0].amount,
            level: allTuitions[0].level,
            year: allTuitions[0].year
          };
          amount.value = tuitionInfo.value.amount;
        }
      } else {
        // ถ้ายังไม่มีข้อมูลชั้นเรียน ใช้ค่าแรกเป็นค่าเริ่มต้น
        tuitionInfo.value = { 
          id: allTuitions[0].id,
          amount: allTuitions[0].amount,
          level: allTuitions[0].level,
          year: allTuitions[0].year
        };
        amount.value = tuitionInfo.value.amount;
      }
    }
  } catch (error) {
    console.error('ບໍ່ສາມາດໂຫລດຂໍ້ມູນຄ່າຮຽນໄດ້:', error);
  } finally {
    isLoading.value = false;
  }
};

// เรียกใช้ฟังก์ชันโหลดข้อมูลค่าเรียนเมื่อคอมโพเนนต์ถูกโหลด
onMounted(() => {
  // ຕັ້ງຄ່າ default headers ສຳລັບ axios ຖ້າມີ token
  if (authStore.user?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.user.token}`;
  }
  
  loadTuitionInfo();
  loadData();
});

// ฟังก์ชันโหลดข้อมูลนักเรียน
async function loadStudentData(studentId: string) {
  try {
    const student = await studentStore.getStudentById(studentId);
    if (student) {
      payment.studentName = student.studentNameLao || '';
      payment.studentPhone = student.phoneNumber || '';
      
      // ดึงชั้นเรียนจาก studentId ตามรูปแบบ
      const grade = student.studentId?.charAt(0) || '1';
      const section = student.studentId?.charAt(1) || '1';
      payment.classLevel = `ມ ${grade}/${section}`;
      payment.yearLevel = payment.classLevel;
      
      // ปรับรูปแบบให้สอดคล้องกับ LevelInfo และ TuitionInfo
      payment.level = `ຊັ້ນ ມ ${grade}`;
      
      payment.academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      payment.tuitionId = student.studentId || '';
      
      // เรียกหาค่าเรียนตามระดับชั้นจาก API
      try {
        const response = await axios.get(`${API_URL}/tuitions`, {
          headers: {
            Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`
          }
        });
        if (response.data.success && response.data.data.length > 0) {
          // หาค่าเรียนตามระดับชั้น
          const matchingTuition = response.data.data.find((t: any) => t.level === payment.level);
          if (matchingTuition) {
            amount.value = matchingTuition.amount;
            tuitionInfo.value = {
              id: matchingTuition.id,
              amount: matchingTuition.amount,
              level: matchingTuition.level,
              year: matchingTuition.year
            };
          } else {
            // ถ้าไม่พบค่าเรียนที่ตรงกับระดับชั้น ใช้ค่าเรียนเริ่มต้น
            amount.value = tuitionInfo.value.amount;
          }
        }
      } catch (error) {
        console.error('ບໍ່ສາມາດດຶງຂໍ້ມູນຄ່າຮຽນໄດ້:', error);
        // ใช้วิธีเดิมถ้าเรียก API ไม่สำเร็จ
        amount.value = await studentStore.getTuitionFee(payment.level) || 0;
      }
    } else {
      throw new Error('ບໍ່ພົບຂໍ້ມູນນັກສຶກສາ');
    }
  } catch (error) {
    console.error('Error loading student data:', error);
    throw error;
  }
}

// ตรวจสอบและแก้ไขเมื่อมีการเปลี่ยนแปลงค่า paidAmount
const updatePaidAmount = (event: Event) => {
  const value = Number((event.target as HTMLInputElement)?.value || 0);
  if (value < 0) {
    paidAmount.value = 0;
  } else {
    paidAmount.value = value;
  }
};

// ฟังก์ชันรีเซ็ตฟอร์ม
const resetForm = () => {
  payment.invoiceNo = 'INV-' + Math.floor(Math.random() * 1000000).toString().padStart(9, '0');
  payment.date = new Date().toISOString().split('T')[0];
  payment.tuitionId = '';
  payment.studentName = '';
  payment.studentPhone = '';
  payment.yearLevel = '';
  payment.level = '';
  payment.classLevel = '';
  payment.academicYear = '';
  payment.status = 'ລໍຖ້າຊໍາລະ';
  amount.value = 0;
  paidAmount.value = 0;
  showStudentSearch.value = false;
  studentSearchQuery.value = '';
  filteredRegistrations.value = [];
  hasError.value = false;
  errorMessage.value = '';
  
  // ເລືອກນັກຮຽນຄົນຕໍ່ໄປທີ່ຍັງບໍ່ໄດ້ຊຳລະເງິນ (ຖ້າມີ)
  if (unpaidRegistrations.value.length > 0) {
    selectRegistration(unpaidRegistrations.value[0].id);
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับการเลือกนักเรียนคนต่อไปหลังจากชำระเงินเสร็จ
const selectNextUnpaidStudent = async () => {
  try {
    // ດຶງຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນໃໝ່
    await fetchUnpaidRegistrations();
    
    // ເລືອກນັກຮຽນຄົນຕໍ່ໄປທັນທີຖ້າມີ
    if (unpaidRegistrations.value.length > 0) {
      await selectRegistration(unpaidRegistrations.value[0].id);
      return true;
    }
    return false;
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການເລືອກນັກຮຽນຄົນຕໍ່ໄປ:', error);
    return false;
  }
};

// เพิ่มฟังก์ชันสำหรับบังคับอัปเดตสถานะการชำระเงินให้ตรงกันทั้งระบบ
const forceSyncRegistrationStatus = async (registrationId: string) => {
  try {
    // ลองเรียกทั้งสอง API endpoint เพื่อให้แน่ใจว่าข้อมูลตรงกัน
    
    // 1. อัปเดตผ่าน endpoint หลัก
    await axios.patch(`${API_URL}/registrations/${registrationId}/payment-status`, 
      { is_paid: true },
      {
        headers: {
          Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 2. อัปเดตผ่าน endpoint สำรอง (ถ้ามี)
    try {
      await axios.patch(`${API_URL}/students/registrations/${registrationId}/payment-status`, 
        { isPaid: true },
        {
          headers: {
            Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err) {
      console.log('Alternative endpoint not available, using only main endpoint');
    }
    
    // 3. อัปเดตโดยตรงผ่าน SQL (ถ้ามี endpoint นี้)
    try {
      await axios.post(`${API_URL}/execute-sql`, {
        query: `UPDATE registrations SET is_paid = 1 WHERE id = '${registrationId}'`
      }, {
        headers: {
          Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.log('SQL endpoint not available, skipping direct update');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to sync payment status:', error);
    return false;
  }
};

// แก้ไขฟังก์ชัน confirmPayment เพื่อใช้ forceSyncRegistrationStatus
const confirmPayment = async () => {
  const validationError = validatePaymentInput();
  if (validationError) {
    alert(validationError);
    return;
  }
  
  try {
    isLoading.value = true;
    // อัปเดตสถานะการชำระเงิน
    payment.status = 'ຈ່າຍແລ້ວ';
    
    // บันทึกการชำระเงิน
    const paymentData = {
      registration_id: payment.invoiceNo,
      amount: amount.value,
      payment_date: payment.date,
      payment_method: 'cash', // ค่าเริ่มต้นเป็นเงินสด
      received_by: authStore.user?.id || '',
      receipt_number: 'R-' + Math.floor(Math.random() * 1000000).toString().padStart(8, '0'),
      note: `ชำระค่าเรียน ${payment.level} ปีการศึกษา ${payment.academicYear}`
    };
    
    console.log("ກຳລັງສ້າງການຊຳລະເງິນກັບ registration_id:", paymentData.registration_id);
    
    // เรียกใช้ API endpoint ใหม่สำหรับบันทึกการชำระเงิน
    const paymentResponse = await axios.post(`${API_URL}/payments`, paymentData, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (paymentResponse.data.success) {
      // บังคับอัปเดตสถานะการชำระเงินทุกวิธีที่เป็นไปได้
      await forceSyncRegistrationStatus(payment.invoiceNo);
      
      // โหลดข้อมูลการลงทะเบียนอีกครั้งเพื่ออัปเดตหน้าจอ
      try {
        const registrationResponse = await axios.get(`${API_URL}/registrations/${payment.invoiceNo}`, {
          headers: {
            Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`
          }
        });
        
        if (registrationResponse.data.success && registrationResponse.data.data) {
          // อัปเดตสถานะในหน้าจอตามข้อมูลล่าสุด
          const registration = registrationResponse.data.data;
          payment.status = registration.is_paid === true ? 'ຈ່າຍແລ້ວ' : 'ລໍຖ້າຊໍາລະ';
        }
      } catch (err) {
        console.error('ບໍ່ສາມາດໂຫລດຂໍ້ມູນການລົງທະບຽນຫຼັງຈາກອັບເດດສະຖານະ:', err);
      }
      
      alert('ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ');
      
      // ດຶງປະຫວັດການຊຳລະເງິນ
      await getPaymentHistory(payment.invoiceNo);
      
      // ດຶງຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ໄດ້ຊຳລະເງິນໃໝ່ທັນທີ
      await fetchUnpaidRegistrations();
      
      // ຖາມຜູ້ໃຊ້ວ່າຕ້ອງການຊຳລະເງິນຄ່າຮຽນໃຫ້ນັກຮຽນຄົນຕໍ່ໄປຫຼືບໍ່
      if (confirm('ທ່ານຕ້ອງການຊຳລະຄ່າຮຽນໃຫ້ນັກຮຽນຄົນຕໍ່ໄປບໍ່?')) {
        const hasNextStudent = await selectNextUnpaidStudent();
        
        if (!hasNextStudent) {
          alert('ບໍ່ມີການລົງທະບຽນທີ່ຍັງບໍ່ໄດ້ຊຳລະເງິນແລ້ວ');
          resetForm();
        }
      } else {
        resetForm();
      }
    } else {
      alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ');
    }
  } catch (error) {
    isLoading.value = false;
    console.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ');
  } finally {
    isLoading.value = false;
  }
};

// เพิ่มฟังก์ชันสำหรับค้นหานักเรียน
const searchStudents = async () => {
  if (!studentSearchQuery.value.trim()) {
    filteredRegistrations.value = [];
    return;
  }
  
  const query = studentSearchQuery.value.toLowerCase();
  
  try {
    // ค้นหาเฉพาะในข้อมูลการลงทะเบียนที่ยังไม่ชำระเงิน (ตัดการค้นหาในข้อมูลนักเรียนออก)
    if (unpaidRegistrations.value.length > 0) {
      // ค้นหาในข้อมูลในแอพ
      filteredRegistrations.value = unpaidRegistrations.value.filter(reg => 
        reg.id.toLowerCase().includes(query) || 
        reg.studentName.toLowerCase().includes(query) || 
        reg.studentId.toLowerCase().includes(query) ||
        reg.studentPhone.toLowerCase().includes(query)
      ).slice(0, 5);
      
      console.log('ຄົ້ນຫາພົບ:', filteredRegistrations.value.length, 'ລາຍການ');
    } else {
      // ถ้ายังไม่มีข้อมูลในแอพ ให้ค้นหาผ่าน API
      const registrations = await studentStore.searchRegistrations(query);
      
      console.log('ຜົນການຄົ້ນຫາຈາກ API:', registrations);
      
      // ແນ່ໃຈວ່າໃຊ້ field id ທີ່ຖືກຕ້ອງ ແລະກວດສອບຄ່າ is_paid
      filteredRegistrations.value = registrations
        .filter(reg => reg.is_paid === false) // ກອງສະເພາະທີ່ຍັງບໍ່ຊຳລະເງິນ
        .map(reg => ({
          id: reg.id,
          studentName: reg.student_name || '',
          studentId: reg.student_id || '',
          studentPhone: reg.student_phone || ''
        }))
        .slice(0, 5);
    }
    
    showStudentSearch.value = true;
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາ:', error);
    filteredRegistrations.value = [];
  }
};

// แก้ไขฟังก์ชัน selectRegistration ดั้งเดิมให้ใช้ getPaymentHistory
const selectRegistration = async (registrationId: string) => {
  try {
    isLoading.value = true;
    
    console.log('กำลังโหลดข้อมูลลงทะเบียน:', registrationId);
    const response = await axios.get(`${API_URL}/registrations/${registrationId}`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`
      }
    });
    
    if (!response.data.success || !response.data.data) {
      console.error('ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ:', registrationId);
      throw new Error('ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ');
    }
    
    const registration = response.data.data;
    console.log('ພົບຂໍ້ມູນການລົງທະບຽນ:', registration);
    
    // อัปเดตข้อมูลใบเสร็จตามการลงทะเบียน
    payment.invoiceNo = registration.id;
    payment.date = new Date().toISOString().split('T')[0];
    payment.tuitionId = registration.student_id;
    payment.studentName = registration.student_name;
    payment.studentPhone = registration.student_phone;
    payment.classLevel = registration.classroom;
    payment.level = registration.level;
    payment.academicYear = registration.school_year;
    payment.status = registration.is_paid ? 'ຈ່າຍແລ້ວ' : 'ລໍຖ້າຊໍາລະ';
    
    // ใช้ค่าเรียนจากใบลงทะเบียนถ้ามี
    if (registration.tuition_fee && parseFloat(registration.tuition_fee) > 0) {
      amount.value = parseFloat(registration.tuition_fee);
      
      // บันทึกข้อมูลค่าเรียนให้ครบถ้วน
      tuitionInfo.value = {
        id: registration.tuition_id || '',
        amount: parseFloat(registration.tuition_fee),
        level: registration.level || '',
        year: registration.school_year || ''
      };
    } else {
      // ถ้าไม่มีค่าเรียนในใบลงทะเบียน ดึงค่าเรียนตามระดับชั้นจาก API
      try {
        const tuitionResponse = await axios.get(`${API_URL}/tuitions`, {
          headers: {
            Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`
          }
        });
        if (tuitionResponse.data.success && tuitionResponse.data.data.length > 0) {
          // หาค่าเรียนตามระดับชั้นและปีการศึกษา
          const matchingTuition = tuitionResponse.data.data.find((t: any) => 
            t.level === registration.level && 
            t.year === registration.school_year
          );
          
          if (matchingTuition) {
            amount.value = matchingTuition.amount;
            tuitionInfo.value = {
              id: matchingTuition.id,
              amount: matchingTuition.amount,
              level: matchingTuition.level,
              year: matchingTuition.year
            };
          } else {
            // ถ้าไม่พบค่าเรียนที่ตรงกับระดับชั้น ใช้ค่าเรียนเริ่มต้น
            const firstTuition = tuitionResponse.data.data[0];
            amount.value = firstTuition.amount;
            tuitionInfo.value = {
              id: firstTuition.id,
              amount: firstTuition.amount,
              level: firstTuition.level,
              year: firstTuition.year
            };
            
            console.warn('ບໍ່ພົບຄ່າຮຽນສຳລັບລະດັບຊັ້ນນີ້, ໃຊ້ຄ່າເລີ່ມຕົ້ນແທນ');
          }
        }
      } catch (error) {
        console.error('ບໍ່ສາມາດດຶງຂໍ້ມູນຄ່າຮຽນໄດ້:', error);
      }
    }
    
    // ดึงประวัติการชำระเงิน
    await getPaymentHistory(registrationId);
    
    showStudentSearch.value = false;
    isLoading.value = false;
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນການລົງທະບຽນ:', error);
    hasError.value = true;
    errorMessage.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນການລົງທະບຽນໄດ້';
    isLoading.value = false;
  }
};

// เพิ่มฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูล
const validatePaymentInput = () => {
  if (!payment.tuitionId || !payment.studentName) {
    return 'ກະລຸນາລະບຸຂໍ້ມູນນັກສຶກສາ';
  }
  
  if (amount.value <= 0) {
    return 'ຄ່າຮຽນບໍ່ຖືກຕ້ອງ';
  }
  
  if (!paidAmount.value || paidAmount.value <= 0) {
    return 'ກະລຸນາລະບຸຈຳນວນເງິນທີ່ຈ່າຍ';
  }
  
  if (paidAmount.value < amount.value) {
    return 'ຈຳນວນເງິນທີ່ຈ່າຍນ້ອຍກວ່າຄ່າຮຽນ';
  }
  
  return null;
};

// เพิ่มฟังก์ชันใหม่สำหรับดึงประวัติการชำระเงิน
const getPaymentHistory = async (registrationId: string) => {
  try {
    isLoading.value = true;
    console.log('ກຳລັງດຶງປະຫວັດການຊຳລະເງິນສຳລັບການລົງທະບຽນ ID:', registrationId);
    
    const response = await axios.get(`${API_URL}/payments/registration/${registrationId}`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token || localStorage.getItem('token')}`
      }
    });
    
    if (response.data.success) {
      console.log('ພົບປະຫວັດການຊຳລະເງິນ:', response.data.data.payments);
      paymentHistory.value = response.data.data.payments;
      showPaymentHistory.value = true;
    } else {
      console.log('ບໍ່ພົບປະຫວັດການຊຳລະເງິນ');
      paymentHistory.value = [];
      showPaymentHistory.value = false;
    }
  } catch (error) {
    console.error('ບໍ່ສາມາດດຶງຂໍ້ມູນປະຫວັດການຊຳລະເງິນໄດ້:', error);
    paymentHistory.value = [];
    showPaymentHistory.value = false;
  } finally {
    isLoading.value = false;
  }
};

// เพิ่มฟังก์ชันเลือกการลงทะเบียน
const showUnpaidRegistrationsSearch = () => {
  filteredRegistrations.value = unpaidRegistrations.value.slice(0, 5); // แสดงเพียง 5 รายการแรก
  showStudentSearch.value = true;
};
</script>

<template>
  <div class="p-4 bg-gray-200 rounded-lg">
    <!-- Loading/Error states -->
    <div v-if="isLoading" class="p-4 text-center">
      <p class="text-lg">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>
    
    <div v-else-if="hasError" class="p-4 bg-red-100 text-red-700 rounded mb-4">
      <p>{{ errorMessage }}</p>
    </div>
    
    <div v-else>
      <!-- ค้นหานักเรียน -->
      <div class="mb-4 p-2 bg-white rounded">
        <div class="flex items-center space-x-2">
          <div class="w-28">ຄົ້ນຫານັກສຶກສາ</div>
          <input 
            type="text" 
            v-model="studentSearchQuery" 
            @input="searchStudents"
            class="flex-1 px-2 py-1 border rounded" 
            placeholder="ພິມລະຫັດລົງທະບຽນ, ລະຫັດນັກສຶກສາ ຫຼື ຊື່ນັກສຶກສາ..."
          />
          <button @click="resetForm" class="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400">
            ລ້າງຂໍ້ມູນ
          </button>
        </div>
        
        <!-- ปุ่มแสดงรายการลงทะเบียนที่ยังไม่ชำระเงิน -->
        <div class="mt-2 flex flex-wrap gap-2 text-sm">
          <span class="text-gray-600">ຣາຍການ:</span>
          <button 
            @click="showUnpaidRegistrationsSearch" 
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            ລາຍການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນ
          </button>
        </div>
        
        <!-- แสดงผลการค้นหา -->
        <div v-if="showStudentSearch" class="mt-2 border rounded">
          <!-- ผลการค้นหาการลงทะเบียน -->
          <div v-if="filteredRegistrations.length > 0">
            <div class="p-2 font-bold bg-gray-200">ຂໍ້ມູນການລົງທະບຽນ</div>
            <div 
              v-for="reg in filteredRegistrations" 
              :key="reg.id"
              @click="selectRegistration(reg.id)"
              class="p-2 hover:bg-gray-100 cursor-pointer border-b"
            >
              {{ reg.id }} - {{ reg.studentName }} ({{ reg.level }})
            </div>
          </div>
          <!-- ไม่พบข้อมูล -->
          <div v-if="filteredRegistrations.length === 0" class="p-2 text-gray-500">
            ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ໄດ້ຊຳລະເງິນ
          </div>
        </div>
      </div>
      
      <!-- Header Section -->
      <div class="flex justify-between mb-4 p-2 bg-white rounded">
        <div class="flex items-center space-x-4">
          <div>
            <span class="mb-1 mr-2 text-sm">ລະຫັດລົງທະບຽນ</span>
            <input type="text" v-model="payment.invoiceNo" class="px-2 py-1 border rounded" readonly />
          </div>
          <div>
            <span class="mb-1 mr-2 text-sm">ລະຫັດຄ່າຮຽນ</span>
            <input type="text" :value="tuitionInfo.id" class="px-2 py-1 border rounded" readonly />
          </div>
          <div>
            <span class="mb-1 mr-2 text-sm">ຊື່ຊັ້ນຮຽນ</span>
            <input type="text" :value="payment.level" class="px-2 py-1 border rounded" readonly />
          </div>
          <div>
            <span class="mb-1 mr-2 text-sm">ປີການສຶກສາ</span>
            <input type="text" :value="payment.academicYear" class="px-2 py-1 border rounded" readonly />
          </div>
        </div>
        
        <div>
          <button class="px-2 py-1 bg-gray-200 rounded">...</button>
        </div>
      </div>
      
      <!-- Payment Information Table -->
      <div class="mb-4 bg-white rounded overflow-hidden">
        <div class="grid grid-cols-9 bg-gray-300 p-2 text-sm">
          <div>ລະຫັດລົງທະບຽນ</div>
          <div>ວັນທີລົງທະບຽນ</div>
          <div>ລະຫັດນັກສຶກສາ</div>
          <div>ຊື່ນັກສຶກສາ(La)</div>
          <div>ເບີໂທນັກສຶກສາ</div>
          <div>ຫ້ອງຮຽນ</div>
          <div>ຊັ້ນຮຽນ</div>
          <div>ສົກຮຽນ</div>
          <div>ສະຖານະ</div>
        </div>
        
        <div class="grid grid-cols-9 p-2 bg-gray-100">
          <div>{{ payment.invoiceNo }}</div>
          <div>{{ payment.date }}</div>
          <div>{{ payment.tuitionId }}</div>
          <div>{{ payment.studentName }}</div>
          <div>{{ payment.studentPhone }}</div>
          <div>{{ payment.classLevel }}</div>
          <div>{{ payment.level }}</div>
          <div>{{ payment.academicYear }}</div>
          <div :class="payment.status === 'ຈ່າຍແລ້ວ' ? 'text-green-600 font-bold' : ''">
            {{ payment.status }}
          </div>
        </div>
      </div>
      
      <!-- แสดงข้อมูลค่าเรียนตามชั้น -->
      <div class="mb-4 bg-white rounded p-2">
        <div class="text-lg font-bold mb-2">ຂໍ້ມູນການຊຳລະຄ່າຮຽນ</div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="mb-1 text-sm">ລະຫັດຄ່າຮຽນ:</div>
            <div class="p-2 bg-gray-100 rounded">{{ tuitionInfo.id || 'ບໍ່ມີຂໍ້ມູນ' }}</div>
          </div>
          <div>
            <div class="mb-1 text-sm">ລະດັບຊັ້ນ:</div>
            <div class="p-2 bg-gray-100 rounded">{{ tuitionInfo.level || 'ບໍ່ມີຂໍ້ມູນ' }}</div>
          </div>
          <div>
            <div class="mb-1 text-sm">ປີການສຶກສາ:</div>
            <div class="p-2 bg-gray-100 rounded">{{ tuitionInfo.year || 'ບໍ່ມີຂໍ້ມູນ' }}</div>
          </div>
          <div>
            <div class="mb-1 text-sm">ຄ່າຮຽນ:</div>
            <div class="p-2 bg-gray-100 rounded font-bold">{{ tuitionInfo.amount.toLocaleString() }} ກີບ</div>
          </div>
        </div>
      </div>
      
      <!-- แสดงประวัติการชำระเงิน -->
      <div v-if="showPaymentHistory && paymentHistory.length > 0" class="mb-4 bg-white rounded p-2">
        <div class="text-lg font-bold mb-2">ປະຫວັດການຊຳລະເງິນ</div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-200">
              <tr>
                <th class="px-4 py-2 text-left">ລະຫັດຊຳລະ</th>
                <th class="px-4 py-2 text-left">ວັນທີຊຳລະ</th>
                <th class="px-4 py-2 text-right">ຈຳນວນເງິນ</th>
                <th class="px-4 py-2 text-left">ວິທີການຊຳລະ</th>
                <th class="px-4 py-2 text-left">ເລກທີໃບເສັດ</th>
                <th class="px-4 py-2 text-left">ຜູ້ຮັບເງິນ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paymentHistory" :key="item.id" class="border-b">
                <td class="px-4 py-2">{{ item.id.substring(0, 8) }}...</td>
                <td class="px-4 py-2">{{ item.payment_date }}</td>
                <td class="px-4 py-2 text-right">{{ Number(item.amount).toLocaleString() }} ກີບ</td>
                <td class="px-4 py-2">{{ item.payment_method === 'cash' ? 'ເງິນສົດ' : 'ໂອນເງິນ' }}</td>
                <td class="px-4 py-2">{{ item.receipt_number }}</td>
                <td class="px-4 py-2">{{ item.received_by }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Amounts and Confirmation -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex-1 flex justify-center">
          <button 
            @click="confirmPayment" 
            class="px-12 py-2 bg-green-600 text-white border rounded shadow-sm hover:bg-green-700 disabled:bg-gray-400"
            :disabled="isLoading || payment.status === 'ຈ່າຍແລ້ວ'"
          >
            <span v-if="isLoading">ກຳລັງດຳເນີນການ...</span>
            <span v-else>ຊຳລະ</span>
          </button>
        </div>
        
        <div class="space-y-2">
          <div class="flex items-center justify-end space-x-2">
            <div class="text-right">ຈໍານວນ</div>
            <input 
              type="text" 
              :value="tuitionInfo.amount.toLocaleString()" 
              class="w-32 px-2 py-1 border rounded text-right" 
              readonly
            />
          </div>
          
          <div class="flex items-center justify-end space-x-2">
            <div class="text-right">ຊຳລະເງິນ</div>
            <input 
              type="number" 
              v-model="paidAmount" 
              class="w-32 px-2 py-1 border rounded text-right"
              :disabled="payment.status === 'ຈ່າຍແລ້ວ'"
              min="0"
              @input="updatePaidAmount"
            />
          </div>
          
          <div class="flex items-center justify-end space-x-2">
            <div class="text-right">ເງິນທອນ</div>
            <input 
              type="text" 
              v-model="changeAmount" 
              class="w-32 px-2 py-1 border rounded text-right" 
              readonly
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
