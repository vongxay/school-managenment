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
  paymentDate: string;
  paymentMethod: 'cash' | 'transfer' | 'other';
  status: 'completed' | 'pending' | 'canceled';
}

// Explicitly declaring the type for payment form to avoid circular reference issue
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
    paymentDate: '2022-6-11',
    paymentMethod: 'cash',
    status: 'completed'
  }
]);

const selectedPayment = ref<Payment | null>(null);
const isPaymentFormVisible = ref(false);

// Mock registration to pay for
const unpaidRegistration = {
  id: 'INV-00000033',
  student: { id: '010', name: 'ທ້າວ ເອ ແສງຈັນ', phone: '02058947234' },
  classroom: 'ມ 3/1',
  level: 'ຊັ້ນ ມ 3',
  schoolYear: '2024-2025',
  tuitionFee: 70000,
};

// Initialize with explicit type
const paymentFormData = reactive<PaymentFormData>({
  registrationId: unpaidRegistration.id,
  amount: unpaidRegistration.tuitionFee,
  paymentMethod: 'cash',
  receivedAmount: 100000,
});

// Create computed property separately to avoid the circular reference
const changeAmount = computed((): number => {
  return paymentFormData.receivedAmount - paymentFormData.amount;
});

const viewPayment = (payment: Payment): void => {
  selectedPayment.value = payment;
  isPaymentFormVisible.value = false;
};

const showPaymentForm = (): void => {
  selectedPayment.value = null;
  isPaymentFormVisible.value = true;
};

const processPayment = (): void => {
  if (paymentFormData.amount <= 0) {
    alert('ກະລຸນາປ້ອນຈຳນວນເງິນ');
    return;
  }
  
  if (paymentFormData.receivedAmount < paymentFormData.amount) {
    alert('ຈຳນວນເງິນທີ່ຮັບຕ້ອງຫຼາຍກວ່າຫຼືເທົ່າກັບຄ່າຮຽນ');
    return;
  }
  
  // Create new payment record
  const newPayment: Payment = {
    id: (payments.length + 1).toString().padStart(3, '0'),
    registrationId: paymentFormData.registrationId,
    studentId: unpaidRegistration.student.id,
    studentName: unpaidRegistration.student.name,
    studentPhone: unpaidRegistration.student.phone,
    classroom: unpaidRegistration.classroom,
    level: unpaidRegistration.level,
    schoolYear: unpaidRegistration.schoolYear,
    amount: paymentFormData.amount,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: paymentFormData.paymentMethod,
    status: 'completed'
  };
  
  payments.push(newPayment);
  alert('ບັນທຶກການຈ່າຍຄ່າຮຽນສຳເລັດ!');
  
  // In a real app, you would now print a receipt
  selectedPayment.value = newPayment;
  isPaymentFormVisible.value = false;
};

const cancelPaymentForm = (): void => {
  isPaymentFormVisible.value = false;
};

// Search and filter
const searchQuery = ref('');
const selectedYear = ref('all');
const selectedStatus = ref('all');

const years = ['2022-2023', '2023-2024', '2024-2025', '2025-2026'];

// Format currency
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString() + ' ₭';
};

// Format fixed currency (without decimals)
const formatFixedCurrency = (amount: number): string => {
  return amount.toLocaleString() + ' ₭';
};

// Format date for display
const formatDate = (dateString: string): string => {
  const dateParts = dateString.split('-');
  if (dateParts.length !== 3) return dateString;
  
  return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
};

// Print receipt
const printReceipt = (): void => {
  if (!selectedPayment.value) return;
  
  alert('ກຳລັງສັ່ງພິມໃບຮັບເງິນ...');
  // In a real app, this would open a print dialog or generate a PDF
};

// Get payment method label
const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'cash': return 'ເງິນສົດ';
    case 'transfer': return 'ໂອນເງິນ';
    case 'other': return 'ອື່ນໆ';
    default: return method;
  }
};

// Get status label
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed': return 'ຈ່າຍ';
    case 'pending': return 'ລໍຖ້າ';
    case 'canceled': return 'ຍົກເລີກ';
    default: return status;
  }
};

// Get status class
const getStatusClass = (status: string): string => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
</script>

<template>
  <div class="bg-gray-200 p-4 rounded-lg">
    <!-- Payment Header -->
    <div class="grid grid-cols-4 gap-2 mb-4">
      <div>
        <div class="mb-1">ລະຫັດລົງທະບຽນ</div>
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" :value="selectedPayment?.registrationId || 'INV-00000033'" readonly />
      </div>
      <div>
        <div class="mb-1">ຄ່າບໍາລຸງ</div>
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" :value="selectedPayment?.id || '007'" readonly />
      </div>
      <div class="col-span-2">
        <div class="mb-1">ຄ່າຮຽນຊັ້ນ ມ 3</div>
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" :value="selectedPayment?.level || 'ຊັ້ນ ມ 3'" readonly />
      </div>
    </div>

    <!-- Payment Table -->
    <div class="mb-4">
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
          <div>{{ selectedPayment?.registrationId || 'INV-00000033' }}</div>
          <div>{{ selectedPayment?.paymentDate || '2022-6-11' }}</div>
          <div>{{ selectedPayment?.studentId || '010' }}</div>
          <div>{{ selectedPayment?.studentName || 'ທ້າວ ເອ ແສງຈັນ' }}</div>
          <div>{{ selectedPayment?.studentPhone || '02058947234' }}</div>
          <div>{{ selectedPayment?.classroom || 'ມ 3/1' }}</div>
          <div>{{ selectedPayment?.level || 'ຊັ້ນ ມ 3' }}</div>
          <div>{{ selectedPayment?.schoolYear || '2024-2025' }}</div>
          <div>{{ getStatusLabel(selectedPayment?.status || 'completed') }}</div>
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      
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
          type="text" 
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
        <button class="px-10 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg border shadow mx-auto" @click="processPayment">
          ຊຳລະ
        </button>
      </div>
    </div>
  </div>

  <!-- Original Payment Component (Hidden) -->
  <div class="hidden">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Left: Payment List -->
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
            v-for="payment in payments" 
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
          <div v-if="payments.length === 0" class="p-4 text-center text-gray-500">
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
      
      <!-- Right: Payment Details or Form -->
      <div class="md:col-span-2 bg-white rounded-lg shadow">
        <!-- Payment Form -->
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
              >
                ບັນທຶກການຈ່າຍຄ່າຮຽນ
              </button>
            </div>
          </div>
        </div>
        
        <!-- Payment Details -->
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
        
        <!-- No Payment Selected -->
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
  </div>
</template> 