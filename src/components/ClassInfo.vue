<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onMounted } from '@vue/runtime-core';
import axios from 'axios';

interface ClassRoom {
  id: string;
  name: string;
  level: string;
}

const API_URL = 'http://localhost:5000/api';
const classes = reactive<ClassRoom[]>([]);
const selectedClass = ref<ClassRoom | null>(null);
const formClass = reactive<ClassRoom>({
  id: '',
  name: '',
  level: 'ຊັ້ນ ມ 1',
});
const classIdInput = ref('');
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const levelOptions = [
  'ຊັ້ນ ມ 1',
  'ຊັ້ນ ມ 2',
  'ຊັ້ນ ມ 3',
  'ຊັ້ນ ມ 4',
  'ຊັ້ນ ມ 5',
  'ຊັ້ນ ມ 6',
  'ຊັ້ນ ມ 7',
];

const filteredClasses = computed(() => {
  if (!searchQuery.value) return classes;
  const query = searchQuery.value.toLowerCase();
  return classes.filter(c => 
    c.id.toLowerCase().includes(query) || 
    c.name.toLowerCase().includes(query) || 
    c.level.toLowerCase().includes(query)
  );
});

// ດຶງຂໍ້ມູນຫ້ອງຮຽນທັງໝົດ
const fetchClasses = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const response = await axios.get(`${API_URL}/classes`);
    if (response.data.success) {
      Object.assign(classes, response.data.data);
      if (classes.length > 0 && !selectedClass.value) {
        selectClass(classes[0]);
      }
    } else {
      errorMessage.value = 'ບໍ່ສາມາດດຶງຂໍ້ມູນຫ້ອງຮຽນໄດ້';
    }
  } catch (error) {
    console.error('Error fetching classes:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

const selectClass = (classItem: ClassRoom) => {
  selectedClass.value = classItem;
  Object.assign(formClass, classItem);
  classIdInput.value = classItem.id;
};

const createNewClass = () => {
  // ຕັ້ງຄ່າຟອມໃຫ້ເປັນຄ່າເລີ່ມຕົ້ນສຳລັບການສ້າງໃໝ່
  selectedClass.value = null;
  formClass.id = '';
  formClass.name = '';
  formClass.level = 'ຊັ້ນ ມ 1';
  classIdInput.value = '';
};

const validateForm = () => {
  if (!formClass.name) {
    errorMessage.value = 'ກະລຸນາປ້ອນຊື່ຫ້ອງຮຽນ';
    return false;
  }
  
  if (!formClass.id) {
    errorMessage.value = 'ກະລຸນາປ້ອນລະຫັດຫ້ອງຮຽນ';
    return false;
  }
  
  // ກວດສອບວ່າມີລະຫັດຊ້ຳກັນຫຼືບໍ່
  if (!selectedClass.value) { // ກໍລະນີສ້າງໃໝ່
    const existingClass = classes.find(c => c.id === formClass.id);
    if (existingClass) {
      errorMessage.value = 'ລະຫັດຫ້ອງຮຽນນີ້ມີຢູ່ແລ້ວ';
      return false;
    }
  }
  
  return true;
};

const saveClass = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    if (!validateForm()) {
      isLoading.value = false;
      return;
    }
    
    if (selectedClass.value) {
      // ອັບເດດຫ້ອງຮຽນທີ່ມີຢູ່ແລ້ວ
      const response = await axios.put(`${API_URL}/classes/${selectedClass.value.id}`, formClass);
      if (response.data.success) {
        const index = classes.findIndex(c => c.id === selectedClass.value?.id);
        if (index !== -1) {
          classes[index] = { ...formClass };
        }
        alert('ອັບເດດຂໍ້ມູນຫ້ອງຮຽນສຳເລັດແລ້ວ');
      } else {
        errorMessage.value = 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນຫ້ອງຮຽນໄດ້';
      }
    } else {
      // ເພີ່ມຫ້ອງຮຽນໃໝ່
      const response = await axios.post(`${API_URL}/classes`, formClass);
      if (response.data.success) {
        classes.push({ ...response.data.data });
        selectClass(response.data.data);
        alert('ເພີ່ມຂໍ້ມູນຫ້ອງຮຽນໃໝ່ສຳເລັດແລ້ວ');
      } else {
        errorMessage.value = 'ບໍ່ສາມາດເພີ່ມຂໍ້ມູນຫ້ອງຮຽນໄດ້';
      }
    }
  } catch (error) {
    console.error('Error saving class:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນຫ້ອງຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

const deleteClass = async () => {
  if (!selectedClass.value) return;
  
  if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຫ້ອງຮຽນ ${selectedClass.value.name}?`)) {
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const response = await axios.delete(`${API_URL}/classes/${selectedClass.value.id}`);
    if (response.data.success) {
      const index = classes.findIndex(c => c.id === selectedClass.value!.id);
      if (index !== -1) {
        classes.splice(index, 1);
        selectedClass.value = null;
        formClass.id = '';
        formClass.name = '';
        formClass.level = 'ຊັ້ນ ມ 1';
        classIdInput.value = '';
        
        if (classes.length > 0) {
          selectClass(classes[0]);
        }
      }
      alert('ລຶບຂໍ້ມູນຫ້ອງຮຽນສຳເລັດແລ້ວ');
    } else {
      errorMessage.value = 'ບໍ່ສາມາດລຶບຂໍ້ມູນຫ້ອງຮຽນໄດ້';
    }
  } catch (error) {
    console.error('Error deleting class:', error);
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຫ້ອງຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ໂຫຼດຂໍ້ມູນເມື່ອຄອມໂພເນັນຖືກສ້າງ
onMounted(fetchClasses);
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
        <div class="mb-1">ລະຫັດຫ້ອງຮຽນ</div>
        <input 
          v-model="formClass.id" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <!-- Name -->
      <div class="mb-4">
        <div class="mb-1">ຊື່ຫ້ອງຮຽນ</div>
        <input 
          v-model="formClass.name" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <!-- Level -->
      <div class="mb-8">
        <div class="mb-1">ຊັ້ນຮຽນ</div>
        <div class="flex space-x-2">
          <input 
            v-model="classIdInput" 
            type="text" 
            class="w-20 px-3 py-2 border border-gray-300 rounded"
          />
          <select 
            v-model="formClass.level" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          >
            <option v-for="level in levelOptions" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
          <button class="px-3 py-2 bg-gray-200 rounded">...</button>
        </div>
      </div>
      
      <!-- Buttons -->
      <div class="flex space-x-4">
        <button 
          @click="deleteClass" 
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          :disabled="isLoading || !selectedClass"
        >
          ລົບ
        </button>
        <button 
          @click="saveClass" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          :disabled="isLoading"
        >
          ບັນທຶກ
        </button>
      </div>
    </div>
    
    <!-- Right Column - Search and table -->
    <div class="col-span-2">
      <!-- Search -->
      <div class=" flex items-center space-x-1 justify-between mb-2">
        <div class="flex items-center space-x-1 flex-grow">
          <div class="whitespace-nowrap">ຄົ້ນຫາຊື່ຫ້ອງຮຽນ</div>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button
          @click="createNewClass"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
          :disabled="isLoading"
        >
          ເພີ່ມ
        </button>
      </div>
      
      <!-- Table headers -->
      <div class="grid grid-cols-3 bg-gray-400 p-2 text-left">
        <div>ລະຫັດຫ້ອງຮຽນ</div>
        <div>ຊື່ຫ້ອງຮຽນ</div>
        <div>ຊັ້ນຮຽນ</div>
      </div>
      
      <!-- Table rows -->
      <div class="max-h-64 overflow-y-auto">
        <div 
          v-for="classItem in filteredClasses" 
          :key="classItem.id"
          @click="selectClass(classItem)"
          :class="[
            'grid grid-cols-3 p-2 cursor-pointer',
            selectedClass?.id === classItem.id ? 'bg-blue-600 text-white' : classItem.id === '005' || classItem.id === '007' ? 'bg-gray-100' : ''
          ]"
        >
          <div>{{ classItem.id }}</div>
          <div>{{ classItem.name }}</div>
          <div>{{ classItem.level }}</div>
        </div>
      </div>
    </div>
  </div>
</template> 