<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

interface ClassRoom {
  id: string;
  name: string;
  level: string;
}

const classes = reactive<ClassRoom[]>([
  { id: '004', name: 'ຫ້ອງ 1/1', level: 'ຊັ້ນ ມ 1' },
  { id: '005', name: 'ຫ້ອງ 1/2', level: 'ຊັ້ນ ມ 1' },
  { id: '006', name: 'ຫ້ອງ 2/1', level: 'ຊັ້ນ ມ 2' },
  { id: '007', name: 'ຫ້ອງ 2/2', level: 'ຊັ້ນ ມ 2' },
  { id: '008', name: 'ຫ້ອງ 3/1', level: 'ຊັ້ນ ມ 3' },
  { id: '009', name: 'ຫ້ອງ 3/2', level: 'ຊັ້ນ ມ 3' },
]);

const selectedClass = ref<ClassRoom | null>(classes[0]);  // Default select first class
const formClass = reactive<ClassRoom>({
  id: selectedClass.value?.id || '004',
  name: selectedClass.value?.name || 'ຫ້ອງ 1/1',
  level: selectedClass.value?.level || 'ຊັ້ນ ມ 1',
});
const searchQuery = ref('');

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

const selectClass = (classItem: ClassRoom) => {
  selectedClass.value = classItem;
  Object.assign(formClass, classItem);
};

const createNewClass = () => {
  // Generate a unique ID - in production this would be handled server-side
  const maxId = Math.max(...classes.map(c => parseInt(c.id, 10)), 0);
  formClass.id = (maxId + 1).toString().padStart(3, '0');
  formClass.name = '';
  formClass.level = 'ຊັ້ນ ມ 1';
  selectedClass.value = null;
};

const saveClass = () => {
  if (selectedClass.value) {
    // Update existing class
    const index = classes.findIndex(c => c.id === selectedClass.value?.id);
    if (index !== -1) {
      classes[index] = { ...formClass };
    }
  } else {
    // Add new class
    classes.push({ ...formClass });
  }
};

const deleteClass = () => {
  if (selectedClass.value) {
    const index = classes.findIndex(c => c.id === selectedClass.value!.id);
    if (index !== -1) {
      classes.splice(index, 1);
      selectedClass.value = null;
      formClass.id = '';
      formClass.name = '';
      formClass.level = 'ຊັ້ນ ມ 1';
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
            v-model="formClass.id" 
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
        >
          ລົບ
        </button>
        <button 
          @click="saveClass" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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