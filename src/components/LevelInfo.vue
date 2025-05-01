<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

interface Level {
  id: string;
  name: string;
}

const levels = reactive<Level[]>([
  { id: '007', name: 'ຊັ້ນ ມ 2' },
  { id: '008', name: 'ຊັ້ນ ມ 3' },
  { id: '009', name: 'ຊັ້ນ ມ 4' },
  { id: '010', name: 'ຊັ້ນ ມ 5' },
  { id: '011', name: 'ຊັ້ນ ມ 6' },
]);

const selectedLevel = ref<Level | null>(null);
const formLevel = reactive<Level>({
  id: '',
  name: '',
});
const searchQuery = ref('');

const filteredLevels = computed(() => {
  if (!searchQuery.value) return levels;
  const query = searchQuery.value.toLowerCase();
  return levels.filter(level => 
    level.id.toLowerCase().includes(query) || 
    level.name.toLowerCase().includes(query)
  );
});

const selectLevel = (level: Level) => {
  selectedLevel.value = level;
  Object.assign(formLevel, level);
};

const createNewLevel = () => {
  // Generate a unique ID
  const maxId = Math.max(...levels.map(l => parseInt(l.id, 10)), 0);
  formLevel.id = (maxId + 1).toString().padStart(3, '0');
  formLevel.name = '';
  selectedLevel.value = null;
};

const saveLevel = () => {
  if (selectedLevel.value) {
    // Update existing level
    const index = levels.findIndex(l => l.id === selectedLevel.value?.id);
    if (index !== -1) {
      levels[index] = { ...formLevel };
    }
  } else {
    // Add new level
    levels.push({ ...formLevel });
  }
};

const deleteLevel = () => {
  if (selectedLevel.value) {
    const index = levels.findIndex(l => l.id === selectedLevel.value!.id);
    if (index !== -1) {
      levels.splice(index, 1);
      selectedLevel.value = null;
      formLevel.id = '';
      formLevel.name = '';
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
        <div class="mb-1">ລະຫັດຊັ້ນຮຽນ</div>
        <input 
          v-model="formLevel.id" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <!-- Name -->
      <div class="mb-4">
        <div class="mb-1">ຊື່ຊັ້ນຮຽນ</div>
        <input 
          v-model="formLevel.name" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <!-- Buttons -->
      <div class="flex space-x-4">
        <button 
          @click="deleteLevel" 
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          ລົບ
        </button>
        <button 
          @click="saveLevel" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ບັນທຶກ
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
          v-for="level in filteredLevels" 
          :key="level.id"
          @click="selectLevel(level)"
          :class="[
            'grid grid-cols-2 p-2 cursor-pointer',
            selectedLevel?.id === level.id ? 'bg-blue-600 text-white' : ''
          ]"
        >
          <div>{{ level.id }}</div>
          <div>{{ level.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template> 