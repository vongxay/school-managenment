<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { useStudentStore } from '../stores/studentStore';
import { useRouter } from 'vue-router';
import type { Student } from '../types/student';
import axios from 'axios';

const studentStore = useStudentStore();
const router = useRouter();

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
const filteredStudents = ref<Student[]>([]);
const filteredRegistrations = ref<any[]>([]);
const showStudentSearch = ref(false);

// เพิ่ม loading state
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

// เพิ่มตัวแปรสำหรับเก็บข้อมูลค่าเรียน
const tuitionInfo = ref<{id: string, amount: number}>({ id: '', amount: 0 });
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
    // ถ้าไม่มี studentId ให้ใช้ข้อมูลตัวอย่าง (สำหรับการพัฒนา)
    payment.invoiceNo = 'INV-' + Math.floor(Math.random() * 1000000).toString().padStart(9, '0');
    payment.tuitionId = '010';
    payment.studentName = 'ທ້າວ ເອ ສະຫວັນ';
    payment.studentPhone = '02058947234';
    payment.classLevel = 'ມ 3/1';
    payment.level = 'ມ 3';
    payment.yearLevel = payment.classLevel;
    payment.academicYear = '2024-2025';
    amount.value = 70000;
  }
};

// เรียกใช้ฟังก์ชันโหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
loadData();

// โหลดข้อมูลค่าเรียน
const loadTuitionInfo = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_URL}/tuitions`);
    if (response.data.success && response.data.data.length > 0) {
      // ใช้ค่าแรกที่ได้
      tuitionInfo.value = { 
        id: response.data.data[0].id,
        amount: response.data.data[0].amount
      };
      
      // อัปเดตค่า amount จาก tuitionInfo
      amount.value = tuitionInfo.value.amount;
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
              amount: matchingTuition.amount
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
    await studentStore.savePayment({
      invoiceNo: payment.invoiceNo,
      studentId: payment.tuitionId,
      amount: amount.value,
      paidAmount: paidAmount.value,
      changeAmount: changeAmount.value,
      paymentDate: payment.date,
      status: payment.status
    });
    
    // อัปเดตสถานะการชำระเงินในการลงทะเบียน
    try {
      await studentStore.updateRegistrationPaymentStatus(payment.tuitionId, true);
    } catch (regError) {
      console.error('ບໍ່ສາມາດອັບເດດສະຖານະການລົງທະບຽນໄດ້:', regError);
    }
    
    alert('ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ');
    isLoading.value = false;
    
    // Reset form สำหรับการชำระครั้งต่อไป
    resetForm();
    
    // นำทางไปยังหน้ารายการชำระเงิน
    router.push('/payments');
  } catch (error) {
    isLoading.value = false;
    console.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ');
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
  filteredStudents.value = [];
  filteredRegistrations.value = [];
  hasError.value = false;
  errorMessage.value = '';
};

// เพิ่มฟังก์ชันสำหรับค้นหานักเรียน
const searchStudents = async () => {
  if (!studentSearchQuery.value.trim()) {
    filteredStudents.value = [];
    filteredRegistrations.value = [];
    return;
  }
  
  const query = studentSearchQuery.value.toLowerCase();
  
  try {
    // ค้นหาในข้อมูลนักเรียน
    const students = await studentStore.getAllStudents();
    filteredStudents.value = students.filter(student => 
      student.studentId.toLowerCase().includes(query) || 
      student.studentNameLao.toLowerCase().includes(query) ||
      student.phoneNumber.toLowerCase().includes(query)
    ).slice(0, 3); // แสดงแค่ 3 คนแรกเพื่อไม่ให้รายการยาวเกินไป
    
    // ค้นหาในข้อมูลการลงทะเบียน
    const registrations = await studentStore.searchRegistrations(query);
    filteredRegistrations.value = registrations.slice(0, 3);
    
    showStudentSearch.value = true;
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາ:', error);
    filteredStudents.value = [];
    filteredRegistrations.value = [];
  }
};

// เพิ่มฟังก์ชันสำหรับเลือกนักเรียน
const selectStudent = async (studentId: string) => {
  try {
    isLoading.value = true;
    await loadStudentData(studentId);
    showStudentSearch.value = false;
    isLoading.value = false;
  } catch (error) {
    console.error('ບໍ່ສາມາດໂຫລດຂໍ້ມູນນັກສຶກສາໄດ້:', error);
    hasError.value = true;
    errorMessage.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນນັກສຶກສາໄດ້';
    isLoading.value = false;
  }
};

// เพิ่มฟังก์ชันเลือกการลงทะเบียน
const selectRegistration = async (registrationId: string) => {
  try {
    isLoading.value = true;
    
    console.log('ກຳລັງໂຫລດຂໍ້ມູນລົງທະບຽນ:', registrationId);
    const registration = await studentStore.getRegistrationByInvoiceId(registrationId);
    
    if (!registration) {
      console.error('ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ:', registrationId);
      throw new Error('ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ');
    }
    
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
    
    // ดึงค่าเรียนตามระดับชั้นจาก API
    try {
      const response = await axios.get(`${API_URL}/tuitions`);
      if (response.data.success && response.data.data.length > 0) {
        // หาค่าเรียนตามระดับชั้น
        const matchingTuition = response.data.data.find((t: any) => t.level === registration.level);
        if (matchingTuition) {
          amount.value = matchingTuition.amount;
          tuitionInfo.value = {
            id: matchingTuition.id,
            amount: matchingTuition.amount
          };
        } else {
          // ถ้าไม่พบค่าเรียนที่ตรงกับระดับชั้น ใช้ค่าเรียนเริ่มต้น
          amount.value = tuitionInfo.value.amount;
        }
      }
    } catch (error) {
      console.error('ບໍ່ສາມາດດຶງຂໍ້ມູນຄ່າຮຽນໄດ້:', error);
      // ใช้วิธีเดิมถ้าเรียก API ไม่สำเร็จ
      amount.value = await studentStore.getTuitionFee(registration.level) || 0;
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
        
        <!-- ปุ่มทดสอบค้นหาด้วยรหัสลงทะเบียนตัวอย่าง -->
        <div class="mt-2 flex flex-wrap gap-2 text-sm">
          <span class="text-gray-600">ຕົວຢ່າງລະຫັດ:</span>
          <button 
            @click="selectRegistration('INV-00000031')" 
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            INV-00000031
          </button>
          <button 
            @click="selectRegistration('INV-00000032')" 
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            INV-00000032
          </button>
          <button 
            @click="selectRegistration('INV-00000033')" 
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            INV-00000033
          </button>
          <button 
            @click="selectRegistration('INV-00000034')" 
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            INV-00000034
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
          
          <!-- ผลการค้นหานักเรียน -->
          <div v-if="filteredStudents.length > 0">
            <div class="p-2 font-bold bg-gray-200">ຂໍ້ມູນນັກສຶກສາ</div>
            <div 
              v-for="student in filteredStudents" 
              :key="student.studentId"
              @click="selectStudent(student.studentId)"
              class="p-2 hover:bg-gray-100 cursor-pointer border-b"
            >
              {{ student.studentId }} - {{ student.studentNameLao }} ({{ student.phoneNumber }})
            </div>
          </div>
          
          <!-- ไม่พบข้อมูล -->
          <div v-if="filteredStudents.length === 0 && filteredRegistrations.length === 0" class="p-2 text-gray-500">
            ບໍ່ພົບຂໍ້ມູນ
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
