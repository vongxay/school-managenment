<script setup lang="ts">
import { ref } from 'vue';

// Active report
const activeReport = ref('students');

// Filter options
const yearOptions = ['2022-2023', '2023-2024', '2024-2025', '2025-2026'];
const selectedYear = ref('2023-2024');
const selectedMonth = ref('all');
const selectedClass = ref('all');
const selectedLevel = ref('all');

// Mock data
const studentsByGender = {
  male: 210,
  female: 148,
  total: 358
};

const studentsByLevel = [
  { level: 'ຊັ້ນ ມ 1', count: 65, color: 'bg-blue-100' },
  { level: 'ຊັ້ນ ມ 2', count: 62, color: 'bg-green-100' },
  { level: 'ຊັ້ນ ມ 3', count: 55, color: 'bg-yellow-100' },
  { level: 'ຊັ້ນ ມ 4', count: 63, color: 'bg-red-100' },
  { level: 'ຊັ້ນ ມ 5', count: 58, color: 'bg-purple-100' },
  { level: 'ຊັ້ນ ມ 6', count: 55, color: 'bg-indigo-100' },
];

const tuitionStatus = {
  paid: 275,
  unpaid: 83,
  total: 358
};

interface Payment {
  month: string;
  amount: number;
}

const monthlyPayments: Payment[] = [
  { month: 'ມັງກອນ', amount: 1500000 },
  { month: 'ກຸມພາ', amount: 850000 },
  { month: 'ມີນາ', amount: 750000 },
  { month: 'ເມສາ', amount: 1200000 },
  { month: 'ພຶດສະພາ', amount: 950000 },
  { month: 'ມິຖຸນາ', amount: 800000 },
  { month: 'ກໍລະກົດ', amount: 1050000 },
  { month: 'ສິງຫາ', amount: 1350000 },
  { month: 'ກັນຍາ', amount: 1550000 },
  { month: 'ຕຸລາ', amount: 950000 },
  { month: 'ພະຈິກ', amount: 850000 },
  { month: 'ທັນວາ', amount: 750000 },
];

const topClasses = [
  { class: 'ມ.6/1', averageScore: 85.2 },
  { class: 'ມ.5/2', averageScore: 84.7 },
  { class: 'ມ.4/1', averageScore: 83.9 },
  { class: 'ມ.6/2', averageScore: 83.5 },
  { class: 'ມ.5/1', averageScore: 83.1 },
];

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString() + ' ₭';
};

// Calculate percentage
const calculatePercentage = (value: number, total: number) => {
  return ((value / total) * 100).toFixed(1) + '%';
};

// Generate PDF report
const generatePdfReport = () => {
  alert('ກຳລັງສ້າງຟາຍ PDF...');
  // In a real app, this would generate a PDF file
};

// Export to Excel
const exportToExcel = () => {
  alert('ກຳລັງສົ່ງອອກເປັນຟາຍ Excel...');
  // In a real app, this would export data to Excel
};
</script>

<template>
  <div class="space-y-6">
    <!-- Report Selection Tabs -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="flex border-b">
        <button 
          @click="activeReport = 'students'" 
          :class="[
            'px-4 py-3 text-sm md:text-base font-medium',
            activeReport === 'students' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          ລາຍງານນັກຮຽນ
        </button>
        <button 
          @click="activeReport = 'financial'" 
          :class="[
            'px-4 py-3 text-sm md:text-base font-medium',
            activeReport === 'financial' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          ລາຍງານການເງິນ
        </button>
        <button 
          @click="activeReport = 'academic'" 
          :class="[
            'px-4 py-3 text-sm md:text-base font-medium',
            activeReport === 'academic' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          ລາຍງານດ້ານການຮຽນ
        </button>
      </div>
      
      <!-- Filters -->
      <div class="p-4 bg-gray-50 border-b">
        <div class="flex flex-wrap gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ສົກຮຽນ</label>
            <select 
              v-model="selectedYear"
              class="min-w-32 px-3 py-1.5 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          
          <div v-if="activeReport === 'financial'">
            <label class="block text-xs font-medium text-gray-700 mb-1">ເດືອນ</label>
            <select 
              v-model="selectedMonth"
              class="min-w-32 px-3 py-1.5 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">ທຸກເດືອນ</option>
              <option value="1">ມັງກອນ</option>
              <option value="2">ກຸມພາ</option>
              <option value="3">ມີນາ</option>
              <option value="4">ເມສາ</option>
              <option value="5">ພຶດສະພາ</option>
              <option value="6">ມິຖຸນາ</option>
              <option value="7">ກໍລະກົດ</option>
              <option value="8">ສິງຫາ</option>
              <option value="9">ກັນຍາ</option>
              <option value="10">ຕຸລາ</option>
              <option value="11">ພະຈິກ</option>
              <option value="12">ທັນວາ</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ຊັ້ນຮຽນ</label>
            <select 
              v-model="selectedLevel"
              class="min-w-32 px-3 py-1.5 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">ທຸກຊັ້ນຮຽນ</option>
              <option value="1">ຊັ້ນ ມ 1</option>
              <option value="2">ຊັ້ນ ມ 2</option>
              <option value="3">ຊັ້ນ ມ 3</option>
              <option value="4">ຊັ້ນ ມ 4</option>
              <option value="5">ຊັ້ນ ມ 5</option>
              <option value="6">ຊັ້ນ ມ 6</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ຫ້ອງຮຽນ</label>
            <select 
              v-model="selectedClass"
              class="min-w-32 px-3 py-1.5 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">ທຸກຫ້ອງຮຽນ</option>
              <option value="1/1">ຫ້ອງ 1/1</option>
              <option value="1/2">ຫ້ອງ 1/2</option>
              <option value="2/1">ຫ້ອງ 2/1</option>
              <option value="2/2">ຫ້ອງ 2/2</option>
              <!-- Add more classes here -->
            </select>
          </div>
          
          <div class="flex ml-auto self-end gap-2">
            <button 
              @click="exportToExcel"
              class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Excel
            </button>
            <button 
              @click="generatePdfReport"
              class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Student Reports -->
    <div v-if="activeReport === 'students'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Students by Gender -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">ນັກຮຽນຕາມເພດ</h2>
          <div class="flex items-center mb-4">
            <div class="w-1/2">
              <div class="h-3 bg-blue-500 rounded-full mb-2"></div>
              <div class="flex justify-between text-sm">
                <span>ຜູ້ຊາຍ</span>
                <span class="font-medium">{{ studentsByGender.male }} ({{ calculatePercentage(studentsByGender.male, studentsByGender.total) }})</span>
              </div>
            </div>
            <div class="w-1/2 pl-4">
              <div class="h-3 bg-pink-500 rounded-full mb-2"></div>
              <div class="flex justify-between text-sm">
                <span>ຜູ້ຍິງ</span>
                <span class="font-medium">{{ studentsByGender.female }} ({{ calculatePercentage(studentsByGender.female, studentsByGender.total) }})</span>
              </div>
            </div>
          </div>
          <div class="text-center text-sm text-gray-600 mt-6">
            ນັກຮຽນທັງໝົດ: <span class="font-bold">{{ studentsByGender.total }}</span> ຄົນ
          </div>
        </div>
        
        <!-- Tuition Status -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">ສະຖານະການຈ່າຍຄ່າຮຽນ</h2>
          <div class="flex items-center mb-4">
            <div class="w-1/2">
              <div class="h-3 bg-green-500 rounded-full mb-2"></div>
              <div class="flex justify-between text-sm">
                <span>ຈ່າຍແລ້ວ</span>
                <span class="font-medium">{{ tuitionStatus.paid }} ({{ calculatePercentage(tuitionStatus.paid, tuitionStatus.total) }})</span>
              </div>
            </div>
            <div class="w-1/2 pl-4">
              <div class="h-3 bg-red-500 rounded-full mb-2"></div>
              <div class="flex justify-between text-sm">
                <span>ຍັງບໍ່ຈ່າຍ</span>
                <span class="font-medium">{{ tuitionStatus.unpaid }} ({{ calculatePercentage(tuitionStatus.unpaid, tuitionStatus.total) }})</span>
              </div>
            </div>
          </div>
          <div class="text-center text-sm text-gray-600 mt-6">
            ນັກຮຽນທັງໝົດ: <span class="font-bold">{{ tuitionStatus.total }}</span> ຄົນ
          </div>
        </div>
      </div>
      
      <!-- Students by Level -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium mb-4">ນັກຮຽນຕາມຊັ້ນຮຽນ</h2>
        <div class="space-y-3">
          <div v-for="level in studentsByLevel" :key="level.level" class="flex items-center">
            <div class="w-32 text-sm">{{ level.level }}</div>
            <div class="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                :class="[level.color, 'h-full transition-all duration-300']" 
                :style="{ width: (level.count / studentsByGender.total * 100) + '%' }"
              ></div>
            </div>
            <div class="ml-3 text-sm font-medium w-20 text-right">{{ level.count }} ຄົນ</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Financial Reports -->
    <div v-if="activeReport === 'financial'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-3 bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">ລາຍຮັບຄ່າຮຽນຕາມເດືອນ ({{ selectedYear }})</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              v-for="payment in monthlyPayments" 
              :key="payment.month"
              class="bg-gray-50 rounded-lg p-4"
            >
              <div class="text-sm text-gray-600">{{ payment.month }}</div>
              <div class="text-xl font-bold text-blue-600">{{ formatCurrency(payment.amount) }}</div>
            </div>
          </div>
          <div class="mt-6 pt-6 border-t">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium">ລາຍຮັບທັງໝົດ:</span>
              <span class="text-2xl font-bold text-blue-700">
                {{ formatCurrency(monthlyPayments.reduce((total: number, month: Payment) => total + month.amount, 0)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Academic Reports -->
    <div v-if="activeReport === 'academic'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-3 bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">ຜົນການຮຽນສະເລ່ຍຂອງຫ້ອງ</h2>
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ລຳດັບ
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ຫ້ອງຮຽນ
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ຄະແນນສະເລ່ຍ
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ສະຖານະ
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(classItem, index) in topClasses" :key="classItem.class">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ index + 1 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ classItem.class }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 font-bold">{{ classItem.averageScore }}%</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                        classItem.averageScore >= 85 ? 'bg-green-100 text-green-800' :
                        classItem.averageScore >= 80 ? 'bg-blue-100 text-blue-800' :
                        classItem.averageScore >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ 
                        classItem.averageScore >= 85 ? 'ດີເລີດ' :
                        classItem.averageScore >= 80 ? 'ດີຫຼາຍ' :
                        classItem.averageScore >= 75 ? 'ດີ' : 'ປານກາງ'
                      }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 