<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { useStudentStore } from '../stores/studentStore';
import axios from 'axios';

const studentStore = useStudentStore();

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
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.data.success && response.data.data.registrations.length > 0) {
      // เก็บข้อมูลไว้ในตัวแปร
      unpaidRegistrations.value = response.data.data.registrations.map((reg: any) => ({
        id: reg.id || reg.invoice_id,
        registrationDate: reg.registration_date,
        studentId: reg.student_id,
        studentName: reg.student_name || '',
        studentPhone: reg.student_phone || '',
        classroom: reg.classroom || '',
        level: reg.level || '',
        schoolYear: reg.school_year || '',
        paid: reg.paid || reg.is_paid || false,
        tuition_fee: reg.tuition_fee || 0
      }));
      
      // แสดงข้อมูลการลงทะเบียนแรกในรายการ
      if (unpaidRegistrations.value.length > 0) {
        const firstReg = unpaidRegistrations.value[0];
        // เลือกการลงทะเบียนนี้เพื่อแสดงในฟอร์ม
        await selectRegistration(firstReg.id);
      }
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
    const response = await axios.get(`${API_URL}/tuitions`);
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
        const response = await axios.get(`${API_URL}/tuitions`);
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
      invoice_id: payment.invoiceNo,
      registration_id: payment.invoiceNo,
      student_id: payment.tuitionId,
      amount: amount.value,
      payment_date: payment.date,
      payment_method: 'cash', // ค่าเริ่มต้นเป็นเงินสด
      received_by: localStorage.getItem('userId') || 'admin',
      receipt_number: 'R-' + Math.floor(Math.random() * 1000000).toString().padStart(8, '0'),
      tuition_id: tuitionInfo.value.id // เพิ่มรหัสค่าเรียนที่ใช้ชำระ
    };
    
    // ใช้เส้นทาง API ที่ถูกต้องสำหรับการบันทึกการชำระเงิน
    const paymentResponse = await axios.post(`${API_URL}/registrations/${payment.invoiceNo}/payment`, paymentData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (paymentResponse.data.success) {
      // อัปเดตสถานะการชำระเงินในการลงทะเบียน
      const updateData = { 
        is_paid: true,
        tuition_id: tuitionInfo.value.id,  // บันทึกรหัสค่าเรียนที่ใช้
        tuition_fee: amount.value          // บันทึกจำนวนเงินที่ชำระ
      };
      
      try {
        await axios.put(`${API_URL}/registrations/${payment.invoiceNo}/payment-status`, updateData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        alert('ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ');
      } catch (updateError) {
        console.error('ບໍ່ສາມາດອັບເດດສະຖານະການລົງທະບຽນໄດ້:', updateError);
        alert('ບັນທຶກການຊຳລະເງິນສຳເລັດ ແຕ່ບໍ່ສາມາດອັບເດດສະຖານະການລົງທະບຽນໄດ້');
      }
    } else {
      alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ');
    }
    
    // รีเซ็ตฟอร์มสำหรับการชำระครั้งต่อไป
    resetForm();
  } catch (error) {
    isLoading.value = false;
    console.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ');
  } finally {
    isLoading.value = false;
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
    } else {
      // ถ้ายังไม่มีข้อมูลในแอพ ให้ค้นหาผ่าน API
      const registrations = await studentStore.searchRegistrations(query);
      filteredRegistrations.value = registrations
        .filter(reg => !reg.is_paid) // กรองเฉพาะที่ยังไม่ชำระเงิน
        .slice(0, 5);
    }
    
    showStudentSearch.value = true;
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາ:', error);
    filteredRegistrations.value = [];
  }
};

// เพิ่มฟังก์ชันเลือกการลงทะเบียน
const selectRegistration = async (registrationId: string) => {
  try {
    isLoading.value = true;
    
    console.log('กำลังโหลดข้อมูลลงทะเบียน:', registrationId);
    const response = await axios.get(`${API_URL}/registrations/${registrationId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.data.success || !response.data.data) {
      console.error('ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ:', registrationId);
      throw new Error('ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ');
    }
    
    const registration = response.data.data;
    console.log('ພົບຂໍ້ມູນການລົງທະບຽນ:', registration);
    
    // อัปเดตข้อมูลใบเสร็จตามการลงทะเบียน
    payment.invoiceNo = registration.invoice_id || registration.id;
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
        const tuitionResponse = await axios.get(`${API_URL}/tuitions`);
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

// เพิ่มฟังก์ชันสำหรับแสดงรายการลงทะเบียนที่ยังไม่ชำระเงิน
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
