<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onMounted, watch } from '@vue/runtime-core';
import axios from 'axios';

interface Tuition {
  id: string;
  name: string;
  year: string;
  level: string;
  amount: number;
}

interface SchoolYear {
  id: string;
  period: string;
}

interface Level {
  id: string;
  name: string;
}

const API_URL = 'http://localhost:5000/api';
const tuitions = reactive<Tuition[]>([]);
const selectedTuition = ref<Tuition | null>(null);
const formTuition = reactive<Tuition>({
  id: '',
  name: '',
  year: '',
  level: '',
  amount: 0
});
const schoolYears = reactive<SchoolYear[]>([]);
const levels = reactive<Level[]>([]);
const searchQuery = ref('');
const yearFilter = ref('');
const levelFilter = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// ດຶງຂໍ້ມູນຄ່າຮຽນທັງໝົດ
const fetchTuitions = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const response = await axios.get(`${API_URL}/tuitions`);
    if (response.data.success) {
      Object.assign(tuitions, response.data.data);
      if (tuitions.length > 0 && !selectedTuition.value) {
        selectTuition(tuitions[0]);
      }
    } else {
      errorMessage.value = 'ບໍ່ສາມາດດຶງຂໍ້ມູນຄ່າຮຽນໄດ້';
    }
  } catch (error) {
    console.error('Error fetching tuitions:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຄ່າຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນສົກຮຽນທັງໝົດ
const fetchYears = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const response = await axios.get(`${API_URL}/years`);
    if (response.data.success) {
      Object.assign(schoolYears, response.data.data);
      // ຕັ້ງຄ່າປີການສຶກສາປັດຈຸບັນເປັນຄ່າເລີ່ມຕົ້ນສຳລັບຕົວກອງ
      if (schoolYears.length > 0 && !yearFilter.value) {
        // ຫາປີການສຶກສາປັດຈຸບັນ
        const currentYear = new Date().getFullYear();
        const currentSchoolYear = schoolYears.find(y => 
          y.period === `${currentYear}-${currentYear + 1}` || 
          y.period === `${currentYear-1}-${currentYear}`
        );
        if (currentSchoolYear) {
          yearFilter.value = currentSchoolYear.period;
        }
      }
    } else {
      errorMessage.value = 'ບໍ່ສາມາດດຶງຂໍ້ມູນສົກຮຽນໄດ້';
    }
  } catch (error) {
    console.error('Error fetching school years:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສົກຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນຊັ້ນຮຽນທັງໝົດ
const fetchLevels = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const response = await axios.get(`${API_URL}/levels`);
    if (response.data.success) {
      Object.assign(levels, response.data.data);
      // ຕັ້ງຄ່າເລີ່ມຕົ້ນຖ້າມີຂໍ້ມູນ
      if (levels.length > 0 && !formTuition.level) {
        formTuition.level = levels[0].name;
      }
    } else {
      errorMessage.value = 'ບໍ່ສາມາດດຶງຂໍ້ມູນຊັ້ນຮຽນໄດ້';
    }
  } catch (error) {
    console.error('Error fetching levels:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຊັ້ນຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ຕົວກອງຂໍ້ມູນຄ່າຮຽນ
const filteredTuitions = computed(() => {
  let result = tuitions;
  
  // ກອງຕາມຂໍ້ຄວາມຄົ້ນຫາ
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      t.id.toLowerCase().includes(query) || 
      t.name.toLowerCase().includes(query) || 
      t.level.toLowerCase().includes(query) ||
      t.year.toLowerCase().includes(query)
    );
  }
  
  // ກອງຕາມປີການສຶກສາ
  if (yearFilter.value) {
    result = result.filter(t => t.year === yearFilter.value);
  }
  
  // ກອງຕາມລະດັບຊັ້ນ
  if (levelFilter.value) {
    result = result.filter(t => t.level === levelFilter.value);
  }
  
  return result;
});

// ຄ້ນຫາຄ່າຮຽນຕາມຊັ້ນຮຽນແລະປີການສຶກສາ
const findTuitionByLevelAndYear = (level: string, year: string): Tuition | undefined => {
  return tuitions.find(t => t.level === level && t.year === year);
};

// เพิ่มฟังก์ชันสำหรับค้นหาค่าเรียนที่สามารถใช้ได้กับ API
const searchTuitionByLevelAndYear = async (level: string, year: string): Promise<Tuition | undefined> => {
  try {
    // ค้นหาในข้อมูลในท้องถิ่นก่อน
    const localTuition = findTuitionByLevelAndYear(level, year);
    if (localTuition) {
      return localTuition;
    }
    
    // ถ้าไม่พบในข้อมูลท้องถิ่น ค้นหาจาก API
    isLoading.value = true;
    errorMessage.value = '';
    
    const response = await axios.get(`${API_URL}/tuitions?level=${encodeURIComponent(level)}&year=${encodeURIComponent(year)}`);
    
    if (response.data.success && response.data.data.length > 0) {
      return response.data.data[0];
    }
    
    return undefined;
  } catch (error) {
    console.error('Error searching tuition by level and year:', error);
    errorMessage.value = 'เกิดข้อผิดพลาดในการค้นหาข้อมูลค่าเรียน';
    return undefined;
  } finally {
    isLoading.value = false;
  }
};

// แสดงความสัมพันธ์ระหว่างค่าเรียน ระดับชั้น และปีการศึกษาในตารางสรุป
const showTuitionSummary = ref(false);
const tuitionSummaryData = computed(() => {
  // สร้างข้อมูลสำหรับตารางสรุป
  const summary: {
    level: string;
    years: {[year: string]: number};
  }[] = [];
  
  // จัดกลุ่มตามระดับชั้น
  const levelGroups = new Map<string, Tuition[]>();
  tuitions.forEach(tuition => {
    if (!levelGroups.has(tuition.level)) {
      levelGroups.set(tuition.level, []);
    }
    levelGroups.get(tuition.level)!.push(tuition);
  });
  
  // สร้างข้อมูลสรุป
  levelGroups.forEach((tuitions, level) => {
    const yearAmount: {[year: string]: number} = {};
    tuitions.forEach(tuition => {
      yearAmount[tuition.year] = tuition.amount;
    });
    summary.push({
      level,
      years: yearAmount
    });
  });
  
  return summary;
});

const selectTuition = (tuition: Tuition) => {
  selectedTuition.value = tuition;
  Object.assign(formTuition, tuition);
};

const validateForm = () => {
  if (!formTuition.name) {
    errorMessage.value = 'ກະລຸນາປ້ອນຊື່ຄ່າຮຽນ';
    return false;
  }
  
  if (formTuition.amount <= 0) {
    errorMessage.value = 'ກະລຸນາປ້ອນຈຳນວນເງິນທີ່ຖືກຕ້ອງ';
    return false;
  }
  
  if (!formTuition.level) {
    errorMessage.value = 'ກະລຸນາເລືອກລະດັບຊັ້ນຮຽນ';
    return false;
  }
  
  if (!formTuition.year) {
    errorMessage.value = 'ກະລຸນາເລືອກສົກຮຽນ';
    return false;
  }
  
  // ກວດສອບລະຫັດເມື່ອເພີ່ມໃໝ່
  if (!selectedTuition.value && !formTuition.id) {
    errorMessage.value = 'ກະລຸນາປ້ອນລະຫັດຄ່າຮຽນ';
    return false;
  }
  
  // ກວດສອບວ່າມີຄ່າຮຽນສຳລັບຊັ້ນຮຽນແລະປີການສຶກສານີ້ແລ້ວຫຼືບໍ່
  if (!selectedTuition.value) { // ກໍລະນີສ້າງໃໝ່
    const existingTuition = tuitions.find(
      t => t.level === formTuition.level && 
      t.year === formTuition.year && 
      t.id !== formTuition.id
    );
    
    if (existingTuition) {
      errorMessage.value = `ມີຄ່າຮຽນສຳລັບ ${formTuition.level} ໃນສົກຮຽນ ${formTuition.year} ແລ້ວ`;
      return false;
    }
    
    // ກວດສອບລະຫັດຊ້ຳ
    const existingId = tuitions.find(t => t.id === formTuition.id);
    if (existingId) {
      errorMessage.value = 'ລະຫັດຄ່າຮຽນນີ້ມີຢູ່ແລ້ວ';
      return false;
    }
  }
  
  return true;
};

const saveTuition = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    if (!validateForm()) {
      isLoading.value = false;
      return;
    }
    
    if (selectedTuition.value) {
      // ອັບເດດຄ່າຮຽນທີ່ມີຢູ່ແລ້ວ
      const response = await axios.put(`${API_URL}/tuitions/${selectedTuition.value.id}`, formTuition);
      if (response.data.success) {
        const index = tuitions.findIndex(t => t.id === selectedTuition.value?.id);
        if (index !== -1) {
          tuitions[index] = { ...formTuition };
        }
        alert('ອັບເດດຂໍ້ມູນຄ່າຮຽນສຳເລັດແລ້ວ');
      } else {
        errorMessage.value = 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນຄ່າຮຽນໄດ້';
      }
    } else {
      // ເພີ່ມຄ່າຮຽນໃໝ່
      const response = await axios.post(`${API_URL}/tuitions`, formTuition);
      if (response.data.success) {
        tuitions.push({ ...response.data.data });
        selectTuition(response.data.data);
        alert('ເພີ່ມຂໍ້ມູນຄ່າຮຽນໃໝ່ສຳເລັດແລ້ວ');
      } else {
        errorMessage.value = 'ບໍ່ສາມາດເພີ່ມຂໍ້ມູນຄ່າຮຽນໄດ້';
      }
    }
  } catch (error) {
    console.error('Error saving tuition:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນຄ່າຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

const deleteTuition = async () => {
  if (!selectedTuition.value) return;
  
  if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຄ່າຮຽນ ${selectedTuition.value.name}?`)) {
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const response = await axios.delete(`${API_URL}/tuitions/${selectedTuition.value.id}`);
    if (response.data.success) {
      const index = tuitions.findIndex(t => t.id === selectedTuition.value!.id);
      if (index !== -1) {
        tuitions.splice(index, 1);
        selectedTuition.value = null;
        formTuition.id = '';
        formTuition.name = '';
        formTuition.level = levels.length > 0 ? levels[0].name : '';
        formTuition.year = '';
        formTuition.amount = 0;
        
        if (tuitions.length > 0) {
          selectTuition(tuitions[0]);
        }
      }
      alert('ລຶບຂໍ້ມູນຄ່າຮຽນສຳເລັດແລ້ວ');
    } else {
      errorMessage.value = 'ບໍ່ສາມາດລຶບຂໍ້ມູນຄ່າຮຽນໄດ້';
    }
  } catch (error) {
    console.error('Error deleting tuition:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຄ່າຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

const createNewTuition = () => {
  // Generate a unique ID
  const maxId = tuitions.length > 0 
    ? Math.max(...tuitions.map(t => parseInt(t.id, 10)), 0)
    : 0;
  formTuition.id = (maxId + 1).toString().padStart(3, '0');
  formTuition.name = '';
  formTuition.level = levels.length > 0 ? levels[0].name : '';
  formTuition.year = schoolYears.length > 0 ? schoolYears[0].period : '';
  formTuition.amount = 0;
  selectedTuition.value = null;
};

// ສ້າງຊື່ຄ່າຮຽນຕາມລະດັບຊັ້ນທີ່ເລືອກ
const updateName = () => {
  formTuition.name = `ຄ່າຮຽນ${formTuition.level}`;
};

// ເມື່ອປ່ຽນລະດັບຊັ້ນ ໃຫ້ອັບເດດຊື່ຄ່າຮຽນອັດຕະໂນມັດ
watch(() => formTuition.level, updateName);

// ກວດສອບການເລືອກປີການສຶກສາແລະລະດັບຊັ້ນແລ້ວ
const checkForExistingTuition = () => {
  if (formTuition.level && formTuition.year && !selectedTuition.value) {
    const existingTuition = findTuitionByLevelAndYear(formTuition.level, formTuition.year);
    if (existingTuition) {
      // ແຈ້ງເຕືອນວ່າມີຄ່າຮຽນນີ້ແລ້ວ
      alert(`ມີຄ່າຮຽນສຳລັບ ${formTuition.level} ໃນສົກຮຽນ ${formTuition.year} ແລ້ວ`);
      
      // ເລືອກຄ່າຮຽນທີ່ມີແລ້ວມາແກ້ໄຂ
      selectTuition(existingTuition);
    }
  }
};

// ເມື່ອປ່ຽນລະດັບຊັ້ນຫຼືປີການສຶກສາ ໃຫ້ກວດສອບວ່າມີຄ່າຮຽນນີ້ແລ້ວຫຼືບໍ່
watch([() => formTuition.level, () => formTuition.year], checkForExistingTuition);

// ໂຫລດຂໍ້ມູນເມື່ອຄອມໂພເນັນຖືກສ້າງ
onMounted(async () => {
  await Promise.all([fetchTuitions(), fetchYears(), fetchLevels()]);
});

// ส่งออกฟังก์ชันเพื่อให้ใช้งานจากภายนอกได้
defineExpose({
  searchTuitionByLevelAndYear
});
</script>

<template>
  <div class="flex">
    <!-- ສ່ວນແຈ້ງເຕືອນຄວາມຜິດພາດ -->
    <div v-if="errorMessage" class="w-full bg-red-100 text-red-700 p-2 mb-4 rounded">
      {{ errorMessage }}
    </div>
    
    <!-- Left Form Section -->
    <div class="w-1/3 p-4 border-r">
      <div class="mb-4">
        <div class="mb-1">ລະຫັດຄ່າຮຽນ</div>
        <input 
          v-model="formTuition.id" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
          :disabled="selectedTuition !== null"
        />
      </div>
      
      <div class="mb-4">
        <div class="mb-1">ຊື່ຄ່າຮຽນ</div>
        <input 
          v-model="formTuition.name" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <div class="mb-4">
        <div class="mb-1">ຄ່າຮຽນ</div>
        <input 
          v-model.number="formTuition.amount" 
          type="number" 
          min="0"
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <div class="mb-4">
        <div class="mb-1">ຊັ້ນຮຽນ</div>
        <div class="flex items-center space-x-2">
          <input 
            type="text" 
            value="006"
            class="w-24 px-3 py-2 border border-gray-300 rounded"
            readonly
          />
          <select 
            v-model="formTuition.level" 
            @change="updateName"
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          >
            <option v-for="level in levels" :key="level.id" :value="level.name">
              {{ level.name }}
            </option>
          </select>
          <button class="px-3 py-2 bg-gray-200 rounded">...</button>
        </div>
      </div>
      
      <div class="mb-6">
        <div class="mb-1">ສົກຮຽນ</div>
        <div class="flex items-center space-x-2">
          <input 
            type="text" 
            value="002"
            class="w-24 px-3 py-2 border border-gray-300 rounded"
            readonly
          />
          <select 
            v-model="formTuition.year" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          >
            <option v-for="year in schoolYears" :key="year.id" :value="year.period">
              {{ year.period }}
            </option>
          </select>
          <button class="px-3 py-2 bg-gray-200 rounded">...</button>
        </div>
      </div>
      
      <div class="flex space-x-4">
        <button 
          @click="deleteTuition" 
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          :disabled="!selectedTuition"
        >
          ຍົກເລີກ
        </button>
        <button 
          @click="saveTuition" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          :disabled="isLoading"
        >
          ບັນທຶກ
        </button>
      </div>
    </div>
    
    <!-- Right Table Section -->
    <div class="w-2/3 p-4">
      <div class="mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 flex-grow">
            <div class="whitespace-nowrap">ຄົ້ນຫາ</div>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="ຄົ້ນຫາລະຫັດຄ່າຮຽນ, ຊື່, ລະດັບຊັ້ນ, ປີການສຶກສາ..."
              class="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <button
            @click="createNewTuition"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
          >
            ເພີ່ມ
          </button>
        </div>
        
        <!-- ຕົວກອງເພີ່ມເຕີມ -->
        <div class="flex mt-2 space-x-4">
          <div class="flex items-center space-x-2">
            <div>ປີການສຶກສາ:</div>
            <select 
              v-model="yearFilter" 
              class="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="">ທັງໝົດ</option>
              <option v-for="year in schoolYears" :key="year.id" :value="year.period">
                {{ year.period }}
              </option>
            </select>
          </div>
          
          <div class="flex items-center space-x-2">
            <div>ລະດັບຊັ້ນ:</div>
            <select 
              v-model="levelFilter" 
              class="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="">ທັງໝົດ</option>
              <option v-for="level in levels" :key="level.id" :value="level.name">
                {{ level.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Summary button -->
      <div class="flex justify-end mb-2">
        <button 
          @click="showTuitionSummary = !showTuitionSummary" 
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {{ showTuitionSummary ? 'ຊ່ອນສະຫຼຸບ' : 'ສະຫຼຸບຄ່າຮຽນ' }}
        </button>
      </div>
      
      <!-- Tuition Summary Table -->
      <div v-if="showTuitionSummary" class="mb-4 border p-2 bg-gray-50 rounded">
        <h3 class="text-lg font-bold mb-2">ສະຫຼຸບຄ່າຮຽນຕາມຊັ້ນຮຽນແລະສົກຮຽນ</h3>
        
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-300">
                <th class="py-2 px-3 text-left">ຊັ້ນຮຽນ</th>
                <th v-for="year in schoolYears" :key="year.id" class="py-2 px-3 text-center">
                  {{ year.period }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tuitionSummaryData" :key="row.level" class="border-b">
                <td class="py-2 px-3 font-medium">{{ row.level }}</td>
                <td v-for="year in schoolYears" :key="year.id" class="py-2 px-3 text-center">
                  <span v-if="row.years[year.period]" class="font-medium text-blue-700">
                    {{ row.years[year.period].toLocaleString() }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Table -->
      <div class="border">
        <!-- Table headers -->
        <div class="grid grid-cols-5 bg-gray-400 p-2 text-left">
          <div>ລະຫັດຄ່າຮຽນ</div>
          <div>ຊື່ຄ່າຮຽນ</div>
          <div>ສົກຮຽນ</div>
          <div>ຊັ້ນຮຽນ</div>
          <div>ຄ່າຮຽນ</div>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="isLoading" class="p-4 text-center">
          <p>ກຳລັງໂຫລດຂໍ້ມູນ...</p>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="filteredTuitions.length === 0" class="p-4 text-center text-gray-500">
          <p>ບໍ່ພົບຂໍ້ມູນຄ່າຮຽນ</p>
        </div>
        
        <!-- Table rows -->
        <div v-else class="max-h-96 overflow-y-auto">
          <div 
            v-for="tuition in filteredTuitions" 
            :key="tuition.id"
            @click="selectTuition(tuition)"
            :class="[
              'grid grid-cols-5 p-2 cursor-pointer',
              selectedTuition?.id === tuition.id ? 'bg-blue-600 text-white' : 
              parseInt(tuition.id) % 2 === 0 ? 'bg-gray-100' : ''
            ]"
          >
            <div>{{ tuition.id }}</div>
            <div>{{ tuition.name }}</div>
            <div>{{ tuition.year }}</div>
            <div>{{ tuition.level }}</div>
            <div>{{ tuition.amount.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 