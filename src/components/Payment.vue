<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

interface Payment {
  id: string;
  registrationId: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  classroom: string;
  level: string;
  schoolYear: string;
  amount: number;
  totalAmount: number;
  remainingAmount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'transfer' | 'other';
  status: 'completed' | 'partial' | 'pending' | 'canceled';
}

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

interface PaymentFormData {
  registrationId: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'other';
  receivedAmount: number;
}

const payments = reactive<Payment[]>([
  { 
    id: '007', 
    registrationId: 'INV-00000033', 
    studentId: '010', 
    studentName: 'ທ້າວ ເອ ແສງຈັນ', 
    studentPhone: '02058947234',
    classroom: 'ມ 3/1', 
    level: 'ຊັ້ນ ມ 3', 
    schoolYear: '2024-2025', 
    amount: 70000, 
    totalAmount: 70000,
    remainingAmount: 70000,
    paymentDate: '2022-6-11',
    paymentMethod: 'cash',
    status: 'completed'
  }
]);

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
    paid: false 
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
    paid: false 
  },
  { 
    id: 'INV-00000033', 
    registrationDate: '2022-6-11', 
    studentId: '010', 
    studentName: 'ທ້າວ ເອ ແສງຈັນ', 
    studentPhone: '02058947234', 
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
    paid: false 
  },
]);

const selectedPayment = ref<Payment | null>(null);
const isPaymentFormVisible = ref(false);
const isStudentSelectionVisible = ref(false);
const selectedRegistration = ref<StudentRegistration | null>(null);

const tuitionFees = {
  'ຊັ້ນ ມ 1': 110000,
  'ຊັ້ນ ມ 2': 100000,
  'ຊັ້ນ ມ 3': 100000,
  'ຊັ້ນ ມ 4': 100000,
  'ຊັ້ນ ມ 5': 100000,
  'ຊັ້ນ ມ 6': 100000,
  'ຊັ້ນ ມ 7': 110000,
};

const unpaidRegistration = ref({
  id: 'INV-00000033',
  student: { 
    id: '010', 
    name: 'ທ້າວ ເອ ແສງຈັນ', 
    phone: '02058947234' 
  },
  classroom: 'ມ 3/1',
  level: 'ຊັ້ນ ມ 3',
  schoolYear: '2024-2025',
  tuitionFee: 70000,
});

const paymentFormData = reactive<PaymentFormData>({
  registrationId: unpaidRegistration.value.id,
  amount: unpaidRegistration.value.tuitionFee,
  paymentMethod: 'cash',
  receivedAmount: unpaidRegistration.value.tuitionFee,
});

const changeAmount = computed((): number => {
  return paymentFormData.receivedAmount - paymentFormData.amount;
});

const isPaymentValid = computed((): boolean => {
  return paymentFormData.amount > 0 && paymentFormData.receivedAmount >= paymentFormData.amount;
});

const viewPayment = (payment: Payment): void => {
  selectedPayment.value = payment;
  isPaymentFormVisible.value = false;
  isStudentSelectionVisible.value = false;
};

const showStudentSelection = (): void => {
  selectedPayment.value = null;
  isPaymentFormVisible.value = false;
  isStudentSelectionVisible.value = true;
};

const selectStudent = (registration: StudentRegistration): void => {
  selectedRegistration.value = registration;
  
  unpaidRegistration.value = {
    id: registration.id,
    student: {
      id: registration.studentId,
      name: registration.studentName,
      phone: registration.studentPhone
    },
    classroom: registration.classroom,
    level: registration.level,
    schoolYear: registration.schoolYear,
    tuitionFee: getTuitionFeeByLevel(registration.level)
  };
  
  paymentFormData.registrationId = registration.id;
  paymentFormData.amount = getTuitionFeeByLevel(registration.level);
  paymentFormData.receivedAmount = getTuitionFeeByLevel(registration.level);
  
  isStudentSelectionVisible.value = false;
  isPaymentFormVisible.value = true;
};

const getTuitionFeeByLevel = (level: string): number => {
  return tuitionFees[level as keyof typeof tuitionFees] || 100000;
};

const showPaymentForm = (): void => {
  if (selectedRegistration.value) {
    isPaymentFormVisible.value = true;
    isStudentSelectionVisible.value = false;
    return;
  }
  
  showStudentSelection();
};

const isConfirmDialogVisible = ref(false);
const paymentToConfirm = ref<{
  amount: number;
  receivedAmount: number;
  changeAmount: number;
  isPartial: boolean;
  remainingAmount: number;
} | null>(null);

const processPayment = (): void => {
  if (paymentFormData.amount <= 0) {
    alert('ກະລຸນາປ້ອນຈຳນວນເງິນ');
    return;
  }
  
  if (paymentFormData.receivedAmount < paymentFormData.amount) {
    alert('ຈຳນວນເງິນທີ່ຮັບຕ້ອງຫຼາຍກວ່າຫຼືເທົ່າກັບຄ່າຮຽນ');
    return;
  }
  
  const totalTuitionFee = getTuitionFeeByLevel(unpaidRegistration.value.level);
  const isPartialPayment = paymentFormData.amount < totalTuitionFee;
  const remainingAmount = totalTuitionFee - paymentFormData.amount;
  
  paymentToConfirm.value = {
    amount: paymentFormData.amount,
    receivedAmount: paymentFormData.receivedAmount,
    changeAmount: paymentFormData.receivedAmount - paymentFormData.amount,
    isPartial: isPartialPayment,
    remainingAmount: remainingAmount
  };
  
  isConfirmDialogVisible.value = true;
};

const confirmPayment = (): void => {
  if (!paymentToConfirm.value) return;
  
  try {
    const totalTuitionFee = getTuitionFeeByLevel(unpaidRegistration.value.level);
    const isPartialPayment = paymentToConfirm.value.isPartial;
    const remainingAmount = paymentToConfirm.value.remainingAmount;
    
    const newPayment: Payment = {
      id: generateNewPaymentId(),
      registrationId: paymentFormData.registrationId,
      studentId: unpaidRegistration.value.student.id,
      studentName: unpaidRegistration.value.student.name,
      studentPhone: unpaidRegistration.value.student.phone,
      classroom: unpaidRegistration.value.classroom,
      level: unpaidRegistration.value.level,
      schoolYear: unpaidRegistration.value.schoolYear,
      amount: paymentFormData.amount,
      totalAmount: totalTuitionFee,
      remainingAmount: remainingAmount,
      paymentDate: getCurrentDate(),
      paymentMethod: paymentFormData.paymentMethod,
      status: isPartialPayment ? 'partial' : 'completed'
    };
    
    payments.push(newPayment);
    
    if (selectedRegistration.value) {
      const regIndex = registrations.findIndex(r => r.id === selectedRegistration.value?.id);
      if (regIndex !== -1) {
        registrations[regIndex].paid = !isPartialPayment;
      }
    }
    
    const confirmMessage = isPartialPayment ? 
      `ບັນທຶກການຈ່າຍຄ່າຮຽນບາງສ່ວນສຳເລັດ! ຍັງເຫຼືອອີກ ${formatCurrency(remainingAmount)}` :
      'ບັນທຶກການຈ່າຍຄ່າຮຽນສຳເລັດ!';
    
    alert(confirmMessage);
    
    selectedPayment.value = newPayment;
    isPaymentFormVisible.value = false;
    isStudentSelectionVisible.value = false;
    isConfirmDialogVisible.value = false;
    paymentToConfirm.value = null;
  } catch (error) {
    console.error('Error processing payment:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການດຳເນີນການຊຳລະເງິນ');
  }
};

const cancelConfirmation = (): void => {
  isConfirmDialogVisible.value = false;
  paymentToConfirm.value = null;
};

const cancelPaymentForm = (): void => {
  isPaymentFormVisible.value = false;
  isStudentSelectionVisible.value = false;
};

const searchQuery = ref('');
const studentSearchQuery = ref('');

const filteredPayments = computed(() => {
  if (!searchQuery.value.trim()) {
    return payments;
  }
  
  const query = searchQuery.value.toLowerCase();
  return payments.filter(payment => 
    payment.registrationId.toLowerCase().includes(query) ||
    payment.studentId.toLowerCase().includes(query) ||
    payment.studentName.toLowerCase().includes(query) ||
    payment.classroom.toLowerCase().includes(query)
  );
});

const filteredRegistrations = computed(() => {
  let results = registrations.filter(reg => !reg.paid);
  
  if (studentSearchQuery.value.trim()) {
    const query = studentSearchQuery.value.toLowerCase();
    results = results.filter(reg =>
      reg.id.toLowerCase().includes(query) ||
      reg.studentId.toLowerCase().includes(query) ||
      reg.studentName.toLowerCase().includes(query) ||
      reg.classroom.toLowerCase().includes(query)
    );
  }
  
  return results;
});

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString() + ' ₭';
};

const formatFixedCurrency = (amount: number): string => {
  return amount.toLocaleString() + ' ₭';
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const dateParts = dateString.split('-');
  if (dateParts.length !== 3) return dateString;
  
  return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
};

const printReceipt = (): void => {
  if (!selectedPayment.value) return;
  
  try {
    // ສ້າງເນື້ອຫາໃບຮັບເງິນ
    const receipt = {
      schoolName: 'ໂຮງຮຽນ ABC',
      schoolAddress: 'ບ້ານ ສີສັງວາດ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
      schoolPhone: '020 XXXXXXXX',
      
      receiptTitle: 'ໃບຮັບເງິນຄ່າຮຽນ',
      receiptNo: selectedPayment.value.id,
      
      student: {
        id: selectedPayment.value.studentId,
        name: selectedPayment.value.studentName,
        class: selectedPayment.value.classroom,
        level: selectedPayment.value.level,
        year: selectedPayment.value.schoolYear,
      },
      
      payment: {
        amount: selectedPayment.value.amount,
        method: getPaymentMethodLabel(selectedPayment.value.paymentMethod),
        date: formatDate(selectedPayment.value.paymentDate),
        status: getStatusLabel(selectedPayment.value.status),
      }
    };
    
    // ສ້າງໜ້າ HTML ເພື່ອພິມ
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('ກະລຸນາອະນຸຍາດໃຫ້ເປີດ pop-up window ເພື່ອສ້າງໃບຮັບເງິນ');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ໃບຮັບເງິນຄ່າຮຽນ</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: bold;
            margin: 15px 0;
            text-align: center;
          }
          .receipt-no {
            margin-bottom: 15px;
            font-weight: bold;
          }
          .student-info, .payment-info {
            margin-bottom: 20px;
          }
          .row {
            display: flex;
            margin-bottom: 5px;
          }
          .label {
            width: 150px;
            font-weight: bold;
          }
          .value {
            flex-grow: 1;
          }
          .amount {
            font-size: 18px;
            font-weight: bold;
            text-align: right;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .status {
            text-align: center;
            margin: 15px 0;
            font-weight: bold;
          }
          .status-completed {
            color: green;
          }
          .status-partial {
            color: blue;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="school-name">${receipt.schoolName}</div>
            <div>${receipt.schoolAddress}</div>
            <div>ໂທ: ${receipt.schoolPhone}</div>
          </div>
          
          <div class="receipt-title">${receipt.receiptTitle}</div>
          <div class="receipt-no">ເລກທີໃບຮັບເງິນ: ${receipt.receiptNo}</div>
          
          <div class="student-info">
            <div class="row">
              <div class="label">ລະຫັດນັກຮຽນ:</div>
              <div class="value">${receipt.student.id}</div>
            </div>
            <div class="row">
              <div class="label">ຊື່ນັກຮຽນ:</div>
              <div class="value">${receipt.student.name}</div>
            </div>
            <div class="row">
              <div class="label">ຫ້ອງຮຽນ:</div>
              <div class="value">${receipt.student.class}</div>
            </div>
            <div class="row">
              <div class="label">ຊັ້ນຮຽນ:</div>
              <div class="value">${receipt.student.level}</div>
            </div>
            <div class="row">
              <div class="label">ສົກຮຽນ:</div>
              <div class="value">${receipt.student.year}</div>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="row">
              <div class="label">ວັນທີຊຳລະ:</div>
              <div class="value">${receipt.payment.date}</div>
            </div>
            <div class="row">
              <div class="label">ວິທີການຊຳລະ:</div>
              <div class="value">${receipt.payment.method}</div>
            </div>
          </div>
          
          <div class="status ${receipt.payment.status === 'ຈ່າຍ' ? 'status-completed' : 'status-partial'}">
            ${receipt.payment.status}
          </div>
          
          <div class="amount">
            ຈຳນວນເງິນທັງໝົດ: ${formatCurrency(receipt.payment.amount)}
          </div>
          
          ${receipt.payment.status === 'ຈ່າຍບາງສ່ວນ' && selectedPayment.value.remainingAmount ? 
            `<div class="amount" style="color: blue">
              ຍັງເຫຼືອອີກ: ${formatCurrency(selectedPayment.value.remainingAmount)}
            </div>` : ''
          }
          
          <div class="footer">
            ຂອບໃຈສຳລັບການຊຳລະເງິນ. ໃບຮັບເງິນສະບັບນີ້ເປັນຫຼັກຖານໃນການຊຳລະຄ່າຮຽນ.
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; cursor: pointer;">ພິມໃບຮັບເງິນ</button>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error generating receipt:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງໃບຮັບເງິນ');
  }
};

const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'cash': return 'ເງິນສົດ';
    case 'transfer': return 'ໂອນເງິນ';
    case 'other': return 'ອື່ນໆ';
    default: return method;
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed': return 'ຈ່າຍ';
    case 'partial': return 'ຈ່າຍບາງສ່ວນ';
    case 'pending': return 'ລໍຖ້າ';
    case 'canceled': return 'ຍົກເລີກ';
    default: return status;
  }
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'partial': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const generateNewPaymentId = (): string => {
  const timestamp = new Date().getTime();
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `P${timestamp.toString().slice(-6)}${randomDigits}`;
};

const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <div class="bg-gray-200 p-4 rounded-lg">
    <div class="grid grid-cols-4 gap-2 mb-4">
      <div>
        <div class="mb-1">ລະຫັດລົງທະບຽນ</div>
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" :value="selectedPayment?.registrationId || unpaidRegistration.id" readonly />
      </div>
      <div>
        <div class="mb-1">ຄ່າບໍາລຸງ</div>
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" :value="selectedPayment?.id || '007'" readonly />
      </div>
      <div class="col-span-2">
        <div class="mb-1">ຄ່າຮຽນ {{ selectedPayment?.level }}</div>
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" :value="selectedPayment?.level || unpaidRegistration.level" readonly />
      </div>
    </div>

    <div v-if="isStudentSelectionVisible" class="mb-4">
      <div class="flex items-center mb-2">
        <div class="w-1/4">ຄົ້ນຫານັກຮຽນທີ່ຍັງບໍ່ໄດ້ຈ່າຍ</div>
        <div class="w-3/4 ml-2">
          <input
            v-model="studentSearchQuery"
            type="text"
            placeholder="ຄົ້ນຫາຕາມລະຫັດ ຫຼື ຊື່ນັກຮຽນ..."
            class="w-full px-2 py-1 border rounded bg-white"
          />
        </div>
      </div>
      
      <div class="grid grid-cols-6 bg-gray-400 p-2 text-sm">
        <div>ລະຫັດລົງທະບຽນ</div>
        <div>ລະຫັດນັກຮຽນ</div>
        <div>ຊື່ນັກຮຽນ(La)</div>
        <div>ເບີໂທຜູ້ປົກຄອງ</div>
        <div>ຫ້ອງຮຽນ</div>
        <div>ຊັ້ນຮຽນ</div>
      </div>
      
      <div class="bg-white text-sm max-h-[300px] overflow-y-auto">
        <div 
          v-for="reg in filteredRegistrations" 
          :key="reg.id"
          class="grid grid-cols-6 p-2 border-b hover:bg-blue-50 cursor-pointer"
          @click="selectStudent(reg)"
        >
          <div>{{ reg.id }}</div>
          <div>{{ reg.studentId }}</div>
          <div>{{ reg.studentName }}</div>
          <div>{{ reg.studentPhone }}</div>
          <div>{{ reg.classroom }}</div>
          <div>{{ reg.level }}</div>
        </div>
        <div v-if="filteredRegistrations.length === 0" class="p-4 text-center text-gray-500">
          ບໍ່ມີນັກຮຽນທີ່ຍັງບໍ່ໄດ້ຈ່າຍ
        </div>
      </div>
    </div>

    <div v-else-if="!isPaymentFormVisible && !isStudentSelectionVisible" class="mb-4">
      <div class="grid grid-cols-9 bg-gray-400 p-2 text-sm">
        <div>ລະຫັດລົງທະບຽນ</div>
        <div>ວັນທີລົງທະບຽນ</div>
        <div>ລະຫັດນັກຮຽນ</div>
        <div>ຊື່ນັກຮຽນ(La)</div>
        <div>ເບີໂທຜູ້ປົກຄອງ</div>
        <div>ຫ້ອງຮຽນ</div>
        <div>ຊັ້ນຮຽນ</div>
        <div>ສົກຮຽນ</div>
        <div>ສະຖານະ</div>
      </div>
      <div class="bg-white text-sm">
        <div class="grid grid-cols-9 p-2 border-b">
          <div>{{ selectedPayment?.registrationId || unpaidRegistration.id }}</div>
          <div>{{ formatDate(selectedPayment?.paymentDate || getCurrentDate()) }}</div>
          <div>{{ selectedPayment?.studentId || unpaidRegistration.student.id }}</div>
          <div>{{ selectedPayment?.studentName || unpaidRegistration.student.name }}</div>
          <div>{{ selectedPayment?.studentPhone || unpaidRegistration.student.phone }}</div>
          <div>{{ selectedPayment?.classroom || unpaidRegistration.classroom }}</div>
          <div>{{ selectedPayment?.level || unpaidRegistration.level }}</div>
          <div>{{ selectedPayment?.schoolYear || unpaidRegistration.schoolYear }}</div>
          <div>{{ getStatusLabel(selectedPayment?.status || 'pending') }}</div>
        </div>
      </div>
    </div>

    <div v-if="isPaymentFormVisible" class="grid grid-cols-2 gap-4 mb-4">
      <div class="text-right pr-2">
        <div class="mb-1">ຄ່າຮຽນ</div>
      </div>
      <div>
        <input 
          type="text" 
          class="w-full px-2 py-1 border rounded bg-white" 
          :value="formatCurrency(paymentFormData.amount)" 
          readonly 
        />
      </div>
      
      <div class="text-right pr-2">
        <div class="mb-1">ຈ່າຍເງິນ</div>
      </div>
      <div>
        <input 
          v-model.number="paymentFormData.receivedAmount" 
          type="number"
          min="0" 
          class="w-full px-2 py-1 border rounded bg-white" 
        />
      </div>
      
      <div class="text-right pr-2">
        <div class="mb-1">ເງິນທອນ</div>
      </div>
      <div>
        <input 
          type="text" 
          class="w-full px-2 py-1 border rounded bg-white" 
          :value="formatFixedCurrency(changeAmount)" 
          readonly 
        />
      </div>
      <div class="col-span-2 flex justify-center mb-2">
        <button 
          class="px-10 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg border shadow mx-auto" 
          @click="processPayment"
          :disabled="!isPaymentValid"
        >
          ຊຳລະ
        </button>
      </div>
    </div>

    <div v-if="!isPaymentFormVisible && !isStudentSelectionVisible" class="flex justify-center space-x-4">
      <button 
        class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg border shadow" 
        @click="showStudentSelection"
      >
        ເລືອກນັກຮຽນ
      </button>
      <button 
        class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg border shadow" 
        @click="showPaymentForm"
      >
        ຊຳລະຄ່າຮຽນ
      </button>
    </div>

    <div v-if="isStudentSelectionVisible" class="flex justify-center">
      <button 
        class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg border shadow" 
        @click="cancelPaymentForm"
      >
        ຍົກເລີກ
      </button>
    </div>
  </div>

  <div class="hidden">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1 bg-white rounded-lg shadow">
        <div class="p-4 border-b">
          <h2 class="text-lg font-medium">ການຈ່າຍຄ່າຮຽນ</h2>
          
          <div class="mt-3 space-y-3">
            <div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ຄົ້ນຫາ..."
                class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div class="divide-y max-h-[600px] overflow-y-auto">
          <div 
            v-for="payment in filteredPayments" 
            :key="payment.id"
            @click="viewPayment(payment)"
            :class="[
              'p-4 hover:bg-gray-50 cursor-pointer',
              selectedPayment?.id === payment.id ? 'bg-blue-50' : ''
            ]"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">{{ payment.studentName }}</div>
                <div class="text-sm text-gray-500">
                  {{ payment.registrationId }} | {{ formatDate(payment.paymentDate) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ payment.classroom }} | {{ payment.schoolYear }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-blue-600">{{ formatFixedCurrency(payment.amount) }}</div>
                <span 
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block',
                    getStatusClass(payment.status)
                  ]"
                >
                  {{ getStatusLabel(payment.status) }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="filteredPayments.length === 0" class="p-4 text-center text-gray-500">
            ບໍ່ມີຂໍ້ມູນການຈ່າຍຄ່າຮຽນ
          </div>
        </div>
        
        <div class="p-4 border-t">
          <button 
            @click="showPaymentForm"
            class="px-4 py-2 w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + ຈ່າຍຄ່າຮຽນໃໝ່
          </button>
        </div>
      </div>
      
      <div class="md:col-span-2 bg-white rounded-lg shadow">
        <div v-if="isPaymentFormVisible" class="p-6">
          <h2 class="text-xl font-medium mb-6">ຟອມຈ່າຍຄ່າຮຽນ</h2>
          
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-medium mb-2">ຂໍ້ມູນນັກຮຽນ</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500">ລະຫັດລົງທະບຽນ</div>
                <div>{{ unpaidRegistration.id }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">ຊື່ນັກຮຽນ</div>
                <div class="font-medium">{{ unpaidRegistration.student.name }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">ຫ້ອງຮຽນ</div>
                <div>{{ unpaidRegistration.classroom }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">ສົກຮຽນ</div>
                <div>{{ unpaidRegistration.schoolYear }}</div>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ຈຳນວນຄ່າຮຽນທີ່ຕ້ອງຈ່າຍ</label>
              <input 
                v-model.number="paymentFormData.amount" 
                type="number"
                min="0" 
                class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ວິທີການຈ່າຍ</label>
              <select 
                v-model="paymentFormData.paymentMethod"
                @change="paymentFormData.paymentMethod !== 'cash' ? paymentFormData.receivedAmount = paymentFormData.amount : null"
                class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">ເງິນສົດ</option>
                <option value="transfer">ໂອນເງິນ</option>
                <option value="other">ອື່ນໆ</option>
              </select>
            </div>
            
            <div v-if="paymentFormData.paymentMethod === 'cash'">
              <label class="block text-sm font-medium text-gray-700 mb-1">ຈຳນວນເງິນທີ່ຮັບ</label>
              <input 
                v-model.number="paymentFormData.receivedAmount" 
                type="number"
                min="0" 
                class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div v-if="paymentFormData.paymentMethod === 'cash' && paymentFormData.receivedAmount > 0" class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between">
                <div class="text-sm font-medium">ຈຳນວນເງິນທີ່ຮັບ:</div>
                <div>{{ formatFixedCurrency(paymentFormData.receivedAmount) }}</div>
              </div>
              <div class="flex justify-between mt-1">
                <div class="text-sm font-medium">ຈຳນວນຄ່າຮຽນ:</div>
                <div>{{ formatFixedCurrency(paymentFormData.amount) }}</div>
              </div>
              <div class="border-t mt-2 pt-2 flex justify-between">
                <div class="text-sm font-medium">ເງິນທອນ:</div>
                <div class="font-bold" :class="changeAmount >= 0 ? 'text-blue-600' : 'text-red-600'">
                  {{ formatFixedCurrency(changeAmount) }}
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button 
                @click="cancelPaymentForm" 
                class="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                ຍົກເລີກ
              </button>
              <button 
                @click="processPayment" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                :disabled="!isPaymentValid"
              >
                ບັນທຶກການຈ່າຍຄ່າຮຽນ
              </button>
            </div>
          </div>
        </div>
        
        <div v-else-if="selectedPayment" class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-medium">ລາຍລະອຽດການຈ່າຍຄ່າຮຽນ</h2>
            <button 
              @click="printReceipt"
              class="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <span class="mr-2">🖨️</span> ພິມໃບຮັບເງິນ
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ລະຫັດການຈ່າຍຄ່າຮຽນ</div>
                <div class="font-medium">{{ selectedPayment.id }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ລະຫັດການລົງທະບຽນ</div>
                <div>{{ selectedPayment.registrationId }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ວັນທີຈ່າຍ</div>
                <div>{{ formatDate(selectedPayment.paymentDate) }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ວິທີການຈ່າຍ</div>
                <div>{{ getPaymentMethodLabel(selectedPayment.paymentMethod) }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ສະຖານະ</div>
                <div>
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusClass(selectedPayment.status)
                    ]"
                  >
                    {{ getStatusLabel(selectedPayment.status) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ລະຫັດນັກຮຽນ</div>
                <div class="font-medium">{{ selectedPayment.studentId }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ຊື່ນັກຮຽນ</div>
                <div class="font-medium">{{ selectedPayment.studentName }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ເບີໂທລະສັບ</div>
                <div>{{ selectedPayment.studentPhone }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ຫ້ອງຮຽນ</div>
                <div>{{ selectedPayment.classroom }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ຊັ້ນຮຽນ</div>
                <div>{{ selectedPayment.level }}</div>
              </div>
              
              <div class="border-b pb-3">
                <div class="text-sm text-gray-500">ສົກຮຽນ</div>
                <div>{{ selectedPayment.schoolYear }}</div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 border-t pt-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-center">
                <div class="text-lg font-medium">ຈຳນວນຄ່າຮຽນ</div>
                <div class="text-2xl font-bold text-blue-700">{{ formatCurrency(selectedPayment.amount) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="p-6">
          <h2 class="text-xl font-medium mb-4">ການຈ່າຍຄ່າຮຽນ</h2>
          <div class="p-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <div class="text-6xl mb-4">💰</div>
            <div class="text-gray-500 text-center">
              <p class="mb-2">ກະລຸນາເລືອກການຈ່າຍຄ່າຮຽນຈາກລາຍການ ຫຼື ເລີ່ມການຈ່າຍຄ່າຮຽນໃໝ່</p>
            </div>
            <button 
              @click="showPaymentForm"
              class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ຈ່າຍຄ່າຮຽນໃໝ່
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ໜ້າຈໍຢືນຢັນການຊຳລະ -->
    <div v-if="isConfirmDialogVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 class="text-lg font-medium mb-4">ຢືນຢັນການຊຳລະເງິນ</h3>
        
        <div class="space-y-4 mb-6">
          <div class="grid grid-cols-2 gap-2">
            <div class="text-gray-600">ຈຳນວນທີ່ຕ້ອງຈ່າຍ:</div>
            <div class="text-right font-medium">{{ formatCurrency(paymentToConfirm?.amount || 0) }}</div>
            
            <div class="text-gray-600">ຈຳນວນເງິນທີ່ຮັບ:</div>
            <div class="text-right font-medium">{{ formatCurrency(paymentToConfirm?.receivedAmount || 0) }}</div>
            
            <div class="text-gray-600">ເງິນທອນ:</div>
            <div class="text-right font-medium">{{ formatCurrency(paymentToConfirm?.changeAmount || 0) }}</div>
            
            <template v-if="paymentToConfirm?.isPartial">
              <div class="text-gray-600">ຍັງເຫຼືອ:</div>
              <div class="text-right font-medium text-orange-600">{{ formatCurrency(paymentToConfirm?.remainingAmount || 0) }}</div>
            </template>
          </div>
          
          <div v-if="paymentToConfirm?.isPartial" class="text-orange-600 text-sm border p-2 bg-orange-50 rounded">
            ເປັນການຊຳລະບາງສ່ວນ. ນັກຮຽນຍັງຕ້ອງຈ່າຍເພີ່ມໃນອະນາຄົດ.
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelConfirmation" 
            class="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            ຍົກເລີກ
          </button>
          <button 
            @click="confirmPayment" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ຢືນຢັນການຊຳລະ
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 