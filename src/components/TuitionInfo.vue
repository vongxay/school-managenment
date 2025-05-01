<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

interface Tuition {
  id: string;
  name: string;
  year: string;
  level: string;
  amount: number;
}

const tuitions = reactive<Tuition[]>([
  { id: '001', name: 'ຄ່າຮຽນຊັ້ນ ມ 2', year: '2023-2024', level: 'ຊັ້ນ ມ 2', amount: 100000 },
  { id: '002', name: 'ຄ່າຮຽນຊັ້ນ ມ 3', year: '2023-2024', level: 'ຊັ້ນ ມ 3', amount: 100000 },
  { id: '003', name: 'ຄ່າຮຽນຊັ້ນ ມ 4', year: '2023-2024', level: 'ຊັ້ນ ມ 4', amount: 100000 },
  { id: '004', name: 'ຄ່າຮຽນຊັ້ນ ມ 5', year: '2023-2024', level: 'ຊັ້ນ ມ 5', amount: 100000 },
  { id: '005', name: 'ຄ່າຮຽນຊັ້ນ ມ 1', year: '2023-2024', level: 'ຊັ້ນ ມ 1', amount: 110000 },
  { id: '006', name: 'ຄ່າຮຽນຊັ້ນ ມ 2', year: '2023-2024', level: 'ຊັ້ນ ມ 2', amount: 100000 },
  { id: '007', name: 'ຄ່າຮຽນຊັ້ນ ມ 3', year: '2023-2024', level: 'ຊັ້ນ ມ 3', amount: 100000 },
  { id: '008', name: 'ຄ່າຮຽນຊັ້ນ ມ 4', year: '2023-2024', level: 'ຊັ້ນ ມ 4', amount: 100000 },
  { id: '009', name: 'ຄ່າຮຽນຊັ້ນ ມ 5', year: '2023-2024', level: 'ຊັ້ນ ມ 5', amount: 100000 },
  { id: '010', name: 'ຄ່າຮຽນຊັ້ນ ມ 6', year: '2023-2024', level: 'ຊັ້ນ ມ 6', amount: 100000 },
  { id: '011', name: 'ຄ່າຮຽນຊັ້ນ ມ 7', year: '2023-2024', level: 'ຊັ້ນ ມ 7', amount: 110000 },
]);

const selectedTuition = ref<Tuition | null>(tuitions.find(t => t.id === '005') || null);
const formTuition = reactive<Tuition>({
  id: selectedTuition.value?.id || '005',
  name: selectedTuition.value?.name || 'ຄ່າຮຽນຊັ້ນ ມ 1',
  year: selectedTuition.value?.year || '2023-2024',
  level: selectedTuition.value?.level || 'ຊັ້ນ ມ 1',
  amount: selectedTuition.value?.amount || 110000
});
const searchQuery = ref('');

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

const selectTuition = (tuition: Tuition) => {
  selectedTuition.value = tuition;
  Object.assign(formTuition, tuition);
};

const createNewTuition = () => {
  // Generate a unique ID
  const maxId = Math.max(...tuitions.map(t => parseInt(t.id, 10)), 0);
  formTuition.id = (maxId + 1).toString().padStart(3, '0');
  formTuition.name = '';
  formTuition.year = '2023-2024';
  formTuition.level = 'ຊັ້ນ ມ 1';
  formTuition.amount = 0;
  selectedTuition.value = null;
};

const saveTuition = () => {
  if (!formTuition.name || !formTuition.year || !formTuition.level || formTuition.amount <= 0) {
    alert('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ');
    return;
  }
  
  if (selectedTuition.value) {
    // Update existing tuition
    const index = tuitions.findIndex(t => t.id === selectedTuition.value?.id);
    if (index !== -1) {
      tuitions[index] = { ...formTuition };
    }
  } else {
    // Add new tuition
    tuitions.push({ ...formTuition });
  }
};

const deleteTuition = () => {
  if (selectedTuition.value) {
    if (confirm(`ທ່ານແນ່ໃຈບໍວ່າຕ້ອງການລຶບຂໍ້ມູນຄ່າຮຽນ ${selectedTuition.value.name}?`)) {
      const index = tuitions.findIndex(t => t.id === selectedTuition.value!.id);
      if (index !== -1) {
        tuitions.splice(index, 1);
        selectedTuition.value = null;
        formTuition.id = '';
        formTuition.name = '';
        formTuition.level = 'ຊັ້ນ ມ 1';
        formTuition.year = '2023-2024';
        formTuition.amount = 0;
      }
    }
  }
};

// Update name based on level change
const updateName = () => {
  formTuition.name = `ຄ່າຮຽນ${formTuition.level}`;
};
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
      <div class="mb-4">
        <div class="mb-1">ຄົ້ນຫາລະຫັດຄ່າຮຽນ</div>
        <input 
          v-model="searchQuery" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
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