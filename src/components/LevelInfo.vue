<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onMounted } from '@vue/runtime-core';
import axios from 'axios';

interface Level {
  id: string;
  name: string;
}

const API_URL = 'http://localhost:5000/api';
const levels = reactive<Level[]>([]);
const selectedLevel = ref<Level | null>(null);
const formLevel = reactive<Level>({
  id: '',
  name: '',
});
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const filteredLevels = computed(() => {
  if (!searchQuery.value) return levels;
  const query = searchQuery.value.toLowerCase();
  return levels.filter(level => 
    level.id.toLowerCase().includes(query) || 
    level.name.toLowerCase().includes(query)
  );
});

// ດຶງຂໍ້ມູນຊັ້ນຮຽນທັງໝົດ
const fetchLevels = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const response = await axios.get(`${API_URL}/levels`);
    if (response.data.success) {
      Object.assign(levels, response.data.data);
      if (levels.length > 0 && !selectedLevel.value) {
        selectLevel(levels[0]);
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
const selectLevel = (level: Level) => {
  selectedLevel.value = level;
  Object.assign(formLevel, level);
};

const createNewLevel = () => {
  // ຕັ້ງຄ່າຟອມໃຫ້ເປັນຄ່າເລີ່ມຕົ້ນສຳລັບການສ້າງໃໝ່
  selectedLevel.value = null;
  formLevel.id = '';
  formLevel.name = '';
  generateLevelId();
};
const validateLevelForm = () => {
  if (!formLevel.name) {
    errorMessage.value = 'ກະລຸນາປ້ອນຊື່ຊັ້ນຮຽນ';
    return false;
  }
  
  // ກວດສອບວ່າຊື່ຊັ້ນຮຽນເລີ່ມຕົ້ນດ້ວຍ "ຊັ້ນ ມ" ຫຼືບໍ່
  if (!formLevel.name.startsWith('ຊັ້ນ ມ')) {
    errorMessage.value = 'ກະລຸນາປ້ອນຊື່ຊັ້ນຮຽນທີ່ເລີ່ມຕົ້ນດ້ວຍ "ຊັ້ນ ມ"';
    return false;
  }
  
  // ກວດສອບລະຫັດເມື່ອເພີ່ມໃໝ່
  if (!selectedLevel.value && !formLevel.id) {
    errorMessage.value = 'ກະລຸນາປ້ອນລະຫັດຊັ້ນຮຽນ';
    return false;
  }
  
  // ກວດສອບວ່າມີລະຫັດຊ້ຳກັນຫຼືບໍ່
  if (!selectedLevel.value) { // ກໍລະນີສ້າງໃໝ່
    const existingLevel = levels.find(l => l.id === formLevel.id);
    if (existingLevel) {
      errorMessage.value = 'ລະຫັດຊັ້ນຮຽນນີ້ມີຢູ່ແລ້ວ';
      return false;
    }
  }
  
  return true;
};

const generateLevelId = () => {
  if (levels.length === 0) {
    formLevel.id = '001';
    return;
  }
  const maxId = Math.max(...levels.map(l => parseInt(l.id)));
  // console.log('ID: ', maxId)
  formLevel.id = (maxId + 1).toString().padStart(3, '0');
};

const saveLevel = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    if (!validateLevelForm()) {
      isLoading.value = false;
      return;
    }
    if (selectedLevel.value) {
      // ອັບເດດຊັ້ນຮຽນທີ່ມີຢູ່ແລ້ວ
      const response = await axios.put(`${API_URL}/levels/${selectedLevel.value.id}`, formLevel);
      if (response.data.success) {
        const index = levels.findIndex(l => l.id === selectedLevel.value?.id);
        if (index !== -1) {
          levels[index] = { ...formLevel };
        }
        alert('ອັບເດດຂໍ້ມູນຊັ້ນຮຽນສຳເລັດແລ້ວ');
      } else {
        errorMessage.value = 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນຊັ້ນຮຽນໄດ້';
      }
    } else {
      // ເພີ່ມຊັ້ນຮຽນໃໝ່
      const response = await axios.post(`${API_URL}/levels`, formLevel);
      if (response.data.success) {
        levels.push({ ...response.data.data });
        selectLevel(response.data.data);
        alert('ເພີ່ມຂໍ້ມູນຊັ້ນຮຽນໃໝ່ສຳເລັດແລ້ວ');
      } else {
        errorMessage.value = 'ບໍ່ສາມາດເພີ່ມຂໍ້ມູນຊັ້ນຮຽນໄດ້';
      }
    }
  } catch (error) {
    console.error('Error saving level:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນຊັ້ນຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

const deleteLevel = async () => {
  if (!selectedLevel.value) return;
  
  if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຊັ້ນຮຽນ ${selectedLevel.value.name}?`)) {
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const response = await axios.delete(`${API_URL}/levels/${selectedLevel.value.id}`);
    if (response.data.success) {
      const index = levels.findIndex(l => l.id === selectedLevel.value!.id);
      if (index !== -1) {
        levels.splice(index, 1);
        selectedLevel.value = null;
        formLevel.id = '';
        formLevel.name = '';
        
        if (levels.length > 0) {
          selectLevel(levels[0]);
        }
      }
      alert('ລຶບຂໍ້ມູນຊັ້ນຮຽນສຳເລັດແລ້ວ');
    } else {
      errorMessage.value = 'ບໍ່ສາມາດລຶບຂໍ້ມູນຊັ້ນຮຽນໄດ້';
    }
  } catch (error) {
    console.error('Error deleting level:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຊັ້ນຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ໂຫຼດຂໍ້ມູນເມື່ອຄອມໂພເນັນຖືກສ້າງ
onMounted(fetchLevels);
</script>

<template>
  <div class="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
    <!-- ຂໍ້ຄວາມແຈ້ງເຕືອນຄວາມຜິດພາດ -->
    <div v-if="errorMessage" class="col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      {{ errorMessage }}
    </div>
    
    <!-- ຂໍ້ຄວາມກຳລັງໂຫຼດ -->
    <div v-if="isLoading" class="col-span-3 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
    </div>
    
    <!-- Left Column - Form inputs -->
    <div class="border-r pr-4 col-span-1">
      <!-- ID -->
      <div class="mb-4">
        <div class="mb-1">ລະຫັດຊັ້ນຮຽນ</div>
        <div class="flex">
          <input 
            v-model="formLevel.id" 
            type="text" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
            disabled
          />
          <!-- <button 
            v-if="!selectedLevel"
            @click="generateLevelId" 
            class="px-3 py-2 bg-gray-200 rounded ml-2"
            title="ສ້າງລະຫັດອັດຕະໂນມັດ"
            :disabled="isLoading"
          >
            ສ້າງ ID
          </button> -->
        </div>
      </div>
      
      <!-- Name -->
      <div class="mb-4">
        <div class="mb-1">ຊື່ຊັ້ນຮຽນ</div>
        <input 
          v-model="formLevel.name" 
          type="text" 
          placeholder="ຊັ້ນ ມ 1"
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <!-- Buttons -->
      <div class="flex space-x-4">
        <button 
          @click="deleteLevel" 
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          :disabled="isLoading || !selectedLevel"
        >
          ລົບ
        </button>
        <button
          @click="saveLevel"
          :class="[
            'px-4 py-2 text-white rounded hover:bg-opacity-90',
            selectedLevel
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700',
          ]"
          :disabled="isLoading"
        >
          {{ selectedLevel ? "ອັບເດດ" : "ບັນທຶກ"}}
        </button>
      </div>
    </div>
    
    <!-- Right Column - Search and table -->
    <div class="col-span-2">
      <!-- Search -->
      <div class="flex items-center space-x-1 justify-between mb-2">
        <div class="flex items-center space-x-1 flex-grow">
          <div class="whitespace-nowrap">ຄົ້ນຫາຊື່ຊັ້ນຮຽນ</div>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button
          @click="createNewLevel"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
          :disabled="isLoading"
        >
          ເພີ່ມ
        </button>
      </div>
      
      <!-- Table headers -->
      <div class="grid grid-cols-2 bg-gray-400 p-2 text-left">
        <div>ລະຫັດຊັ້ນຮຽນ</div>
        <div>ຊື່ຊັ້ນຮຽນ</div>
      </div>
      
      <!-- Table rows -->
      <div class="max-h-64 overflow-y-auto">
        <div 
          v-for="(level, index) in filteredLevels" 
          :key="level.id"
          @click="selectLevel(level)"
          :class="[
            'grid grid-cols-2 p-2 cursor-pointer',
            selectedLevel?.id === level.id ? 'bg-blue-600 text-white' : index % 2 !== 0 ? 'bg-gray-100' : 'bg-white'
          ]"
        >
          <div>{{ level.id }}</div>
          <div>{{ level.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template> 