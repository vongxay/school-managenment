<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

interface SchoolYear {
  id: string;
  period: string;
}

const schoolYears = reactive<SchoolYear[]>([
  { id: '001', period: '2022-2023' },
  { id: '002', period: '2023-2024' },
  { id: '003', period: '2024-2025' },
  { id: '004', period: '2025-2026' },
]);

const selectedYear = ref<SchoolYear | null>(schoolYears[0]);  // Default select first year
const formYear = reactive<SchoolYear>({
  id: selectedYear.value?.id || '001',
  period: selectedYear.value?.period || '2022-2023',
});
const searchQuery = ref('');

const filteredYears = computed(() => {
  if (!searchQuery.value) return schoolYears;
  const query = searchQuery.value.toLowerCase();
  return schoolYears.filter(y => 
    y.id.toLowerCase().includes(query) || 
    y.period.toLowerCase().includes(query)
  );
});

const selectYear = (year: SchoolYear) => {
  selectedYear.value = year;
  Object.assign(formYear, year);
};

const createNewYear = () => {
  // Generate a unique ID
  const maxId = Math.max(...schoolYears.map(y => parseInt(y.id, 10)), 0);
  formYear.id = (maxId + 1).toString().padStart(3, '0');
  formYear.period = '';
  selectedYear.value = null;
};

const saveYear = () => {
  if (!formYear.period) {
    alert('ກະລຸນາປ້ອນສົກຮຽນ');
    return;
  }
  
  if (selectedYear.value) {
    // Update existing year
    const index = schoolYears.findIndex(y => y.id === selectedYear.value?.id);
    if (index !== -1) {
      schoolYears[index] = { ...formYear };
    }
  } else {
    // Add new year
    schoolYears.push({ ...formYear });
  }
};

const deleteYear = () => {
  if (selectedYear.value) {
    if (confirm(`ທ່ານແນ່ໃຈບໍວ່າຕ້ອງການລຶບຂໍ້ມູນສົກຮຽນ ${selectedYear.value.period}?`)) {
      const index = schoolYears.findIndex(y => y.id === selectedYear.value!.id);
      if (index !== -1) {
        schoolYears.splice(index, 1);
        selectedYear.value = null;
        formYear.id = '';
        formYear.period = '';
      }
    }
  }
};
</script>

<template>
  <div class="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
    <!-- Left Column - Form inputs -->
    <div class="border-r pr-4 col-span-1">
      <!-- ID -->
      <div class="mb-4">
        <div class="mb-1">ລະຫັດສົກຮຽນ</div>
        <input 
          v-model="formYear.id" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
          :disabled="!!selectedYear"
        />
      </div>
      
      <!-- Period -->
      <div class="mb-8">
        <div class="mb-1">ສົກຮຽນ</div>
        <input 
          v-model="formYear.period" 
          type="text" 
          placeholder="YYYY-YYYY"
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <!-- Buttons -->
      <div class="flex space-x-4">
        <button 
          @click="deleteYear" 
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          ລຶບ
        </button>
        <button 
          @click="saveYear" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ບັນທຶກ
        </button>
      </div>
    </div>
    
    <!-- Right Column - Search and table -->
    <div class="col-span-2">
      <!-- Search and Add button -->
      <div class="flex items-center space-x-1 justify-between mb-2">
        <div class="flex items-center space-x-1 flex-grow">
          <div class="whitespace-nowrap">ຄົ້ນຫາສົກຮຽນ</div>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button
          @click="createNewYear"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
        >
          ເພີ່ມ
        </button>
      </div>
      
      <!-- Table headers -->
      <div class="grid grid-cols-2 bg-gray-400 p-2 text-left">
        <div>ລະຫັດສົກຮຽນ</div>
        <div>ສົກຮຽນ</div>
      </div>
      
      <!-- Table rows -->
      <div class="max-h-64 overflow-y-auto">
        <div 
          v-for="year in filteredYears" 
          :key="year.id"
          @click="selectYear(year)"
          :class="[
            'grid grid-cols-2 p-2 cursor-pointer',
            selectedYear?.id === year.id ? 'bg-blue-600 text-white' : ''
          ]"
        >
          <div>{{ year.id }}</div>
          <div>{{ year.period }}</div>
        </div>
      </div>
    </div>
  </div>
</template> 