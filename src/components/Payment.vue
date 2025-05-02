<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useStudentStore } from '../stores/studentStore';
import { useRouter } from 'vue-router';

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

// เพิ่ม loading state
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

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
      
      // ดึงเฉพาะส่วนของ ມ X จากชื่อชั้นเรียน
      payment.level = `ມ ${grade}`;
      
      payment.academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      payment.tuitionId = student.studentId || '';
      
      // เรียกค่าเรียนตามระดับชั้น
      amount.value = await studentStore.getTuitionFee(payment.level) || 0;
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
  payment.status = 'ລໍຖ້າຊໍາລະ';
  paidAmount.value = 0;
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
      <!-- Header Section -->
      <div class="flex justify-between mb-4 p-2 bg-white rounded">
        <div class="flex items-center space-x-4">
          <div>
            <span class="mb-1 mr-2 text-sm">ລະຫັດລົງທະບຽນ</span>
            <input type="text" v-model="payment.invoiceNo" class="px-2 py-1 border rounded" readonly />
          </div>
          <div>
            <span class="mb-1 mr-2 text-sm">ຄ່າທຳນຽມ</span>
            <input type="text" value="007" class="px-2 py-1 border rounded" readonly />
          </div>
          <div>
            <span class="mb-1 mr-2 text-sm">ຄ່າຮຽນຊັ້ນ</span>
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
              v-model="amount" 
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
