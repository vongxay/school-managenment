<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onMounted } from '@vue/runtime-core';
import axios from 'axios';

interface Tuition {
  id: string;
  name: string;
  year: string;
  level: string;
  amount: number;
}

const API_URL = 'http://localhost:5000/api';
const tuitions = reactive<Tuition[]>([]);
const selectedTuition = ref<Tuition | null>(null);
const formTuition = reactive<Tuition>({
  id: '',
  name: '',
  year: '',
  level: 'ຊັ້ນ ມ 1',
  amount: 0
});
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const years = [
  '2022-2023',
  '2023-2024',
  '2024-2025',
  '2025-2026',
];

const levels = [
  'ຊັ້ນ ມ 1',
  'ຊັ້ນ ມ 2',
  'ຊັ້ນ ມ 3',
  'ຊັ້ນ ມ 4',
  'ຊັ້ນ ມ 5',
  'ຊັ້ນ ມ 6',
  'ຊັ້ນ ມ 7',
];

const filteredTuitions = computed(() => {
  if (!searchQuery.value) return tuitions;
  const query = searchQuery.value.toLowerCase();
  return tuitions.filter(t => 
    t.id.toLowerCase().includes(query) || 
    t.name.toLowerCase().includes(query) || 
    t.level.toLowerCase().includes(query) ||
    t.year.toLowerCase().includes(query)
  );
});

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
  
  // ກວດສອບລະຫັດເມື່ອເພີ່ມໃໝ່
  if (!selectedTuition.value && !formTuition.id) {
    errorMessage.value = 'ກະລຸນາປ້ອນລະຫັດຄ່າຮຽນ';
    return false;
  }
  
  // ກວດສອບວ່າມີລະຫັດຊ້ຳກັນຫຼືບໍ່
  if (!selectedTuition.value) { // ກໍລະນີສ້າງໃໝ່
    const existingTuition = tuitions.find(t => t.id === formTuition.id);
    if (existingTuition) {
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
        formTuition.level = 'ຊັ້ນ ມ 1';
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
  formTuition.level = 'ຊັ້ນ ມ 1';
  formTuition.year = years[1]; // Default to current year (2023-2024)
  formTuition.amount = 0;
  selectedTuition.value = null;
};

// Update name based on level change
const updateName = () => {
  formTuition.name = `ຄ່າຮຽນ${formTuition.level}`;
};

// ໂຫລດຂໍ້ມູນເມື່ອຄອມໂພເນັນຖືກສ້າງ
onMounted(fetchTuitions);
</script>

<template>
  <div class="flex">
    <!-- Left Form Section -->
    <div class="w-1/3 p-4 border-r">
      <div class="mb-4">
        <div class="mb-1">ລະຫັດຄ່າຮຽນ</div>
        <input 
          v-model="formTuition.id" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
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
          type="text" 
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
            <option v-for="level in levels" :key="level" :value="level">
              {{ level }}
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
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
          <button class="px-3 py-2 bg-gray-200 rounded">...</button>
        </div>
      </div>
      
      <div class="flex space-x-4">
        <button 
          @click="deleteTuition" 
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ຍົກເລີກ
        </button>
        <button 
          @click="saveTuition" 
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ບັນທຶກ
        </button>
      </div>
    </div>
    
    <!-- Right Table Section -->
    <div class="w-2/3 p-4">
      <div class="flex items-center space-x-1 justify-between mb-4">
        <div class="flex items-center space-x-1 flex-grow">
          <div class="mb-1">ຄົ້ນຫາລະຫັດຄ່າຮຽນ</div>
          <input 
            v-model="searchQuery" 
            type="text" 
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
        
        <!-- Table rows -->
        <div class="max-h-96 overflow-y-auto">
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