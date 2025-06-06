<script setup lang="ts">
import { ref, computed } from 'vue';
import { onMounted, watch } from '@vue/runtime-core';
import type { Student } from '../types/student';
import { useStudentStore } from '../stores/studentStore';

// ใช้ store แทน mock data
const studentStore = useStudentStore();
// ໃຊ້ store ແທນ mock data
// ลบตัวแปร students ที่ไม่ได้ใช้งาน เพราะใช้ studentStore.students โดยตรง
// ລຶບຕົວແປ students ທີ່ບໍ່ໄດ້ໃຊ້ ເພາະໃຊ້ studentStore.students ໂດຍກົງ
const searchQuery = ref('');
const selectedGender = ref('all');
const isLoading = ref(false);
const errorMessage = ref('');

// Function to switch to form tab - need to be used by parent component 
const emits = defineEmits(['switch-to-form']);

// State for pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// ຟັງຊັນສຳລັບປ່ຽນໄປທີ່ແຖບຟອມ - ຕ້ອງໃຊ້ໂດຍຄອມໂພເນນແມ່
const filteredStudents = computed(() => {
  const students = studentStore.students;
  let result = [...students];
  
  // ກອງຕາມຂໍ້ຄວາມຄົ້ນຫາ
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      student => 
        student.studentId.toLowerCase().includes(query) ||
        student.studentNameLao.toLowerCase().includes(query) ||
        student.phoneNumber.toLowerCase().includes(query) ||
        (student.guardianPhone && student.guardianPhone.toLowerCase().includes(query))
    );
  }
  
  // ກອງຕາມເພດ
  if (selectedGender.value !== 'all') {
    result = result.filter(student => student.gender === selectedGender.value);
  }
  
  return result;
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredStudents.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / itemsPerPage.value);
});

const navigateToPage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const editStudent = (student: Student) => {
  // ເລີ່ມແກ້ໄຂຂໍ້ມູນ
  studentStore.startEdit(student.studentId);
  // Emit event to switch to form view
  emits('switch-to-form');
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deleteStudent = async (student: Student) => {
  if (confirm(`ທ່ານແນ່ໃຈບໍວ່າຕ້ອງການລຶບຂໍ້ມູນນັກຮຽນ ${student.studentNameLao}?`)) {
    try {
      isLoading.value = true;
      const success = await studentStore.deleteStudent(student.studentId);
      if (success) {
        alert('ລຶບຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ');
        // ຣີເຊັດໜ້າເມື່ອລາຍການໃນໜ້ານັ້ນວ່າງເປົ່າ
        if (paginatedStudents.value.length === 1 && currentPage.value > 1) {
          currentPage.value--;
        }
      } else {
        errorMessage.value = studentStore.errorMessage.value || 'ບໍ່ສາມາດລຶບຂໍ້ມູນນັກຮຽນໄດ້';
      }
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນນັກຮຽນ:', error);
      errorMessage.value = 'ບໍ່ສາມາດລຶບຂໍ້ມູນນັກຮຽນໄດ້';
    } finally {
      isLoading.value = false;
    }
  }
};

const addNewStudent = () => {
  studentStore.startNew();
  // Emit event to switch to form view
  emits('switch-to-form');
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ເພີ່ມຟັງຊັນໂຫລດຂໍ້ມູນເມື່ອເລີ່ມຕົ້ນ
const loadStudents = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    await studentStore.getAllStudents();
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນນັກຮຽນ:', error);
    errorMessage.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນນັກຮຽນໄດ້';
  } finally {
    isLoading.value = false;
  }
};

// ໂຫລດຂໍ້ມູນເມື່ອຄອມໂພເນນຖືກສ້າງ
onMounted(loadStudents);

// ຕິດຕາມການປ່ຽນແປງຂອງການຄົ້ນຫາແລະເພດເພື່ອຣີເຊັດໜ້າ
watch([searchQuery, selectedGender], () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <!-- Loading/Error states -->
    <div v-if="isLoading" class="p-4 text-center">
      <p class="text-lg">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
    </div>
    
    <div v-else-if="errorMessage" class="p-4 bg-red-100 text-red-700 rounded mb-4">
      <p>{{ errorMessage }}</p>
    </div>
    
    <!-- Search and Filter Controls -->
    <div v-else class="flex flex-wrap justify-between items-center mb-6">
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ຄົ້ນຫານັກຮຽນ..."
            class="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        
        <div>
          <select 
            v-model="selectedGender"
            class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ທັງໝົດ</option>
            <option value="M">ຊາຍ</option>
            <option value="F">ຍິງ</option>
          </select>
        </div>
       
      </div>
      
      <div>
        <button 
          @click="addNewStudent"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + ເພີ່ມນັກຮຽນໃໝ່
        </button>
      </div>
    </div>
    
    <!-- Student Table -->
    <div v-if="!isLoading" class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-300 border-b">
            <th class="px-4 py-3 text-left">ລະຫັດນັກຮຽນ</th>
            <th class="px-4 py-3 text-left">ຊື່ນັກຮຽນ(La)</th>
            <th class="px-4 py-3 text-left">ເບີໂທຜູ້ປົກຄອງ</th>
            <th class="px-4 py-3 text-left">ເພດ</th>
            <th class="px-4 py-3 text-left">ບ້ານ</th>
            <th class="px-4 py-3 text-left">ເມືອງ</th>
            <th class="px-4 py-3 text-left">ແຂວງ</th>
            <th class="px-4 py-3 text-left">ວດປ ເກີດ</th>
            <th class="px-4 py-3 text-left">ເບີໂທນັກຮຽນ</th>
            <th class="px-4 py-3 text-left">ເລກບັດປະຈຳຕົວ</th>
            <th class="px-4 py-3 text-center">ດຳເນີນການ</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(student, index) in paginatedStudents"
            :key="index"
            :class="['border-b hover:bg-gray-50', index%2 !== 0 ? 'bg-gray-100' : '' ]"
          >
            <td class="px-4 py-3">{{ student.studentId }}</td>
            <td class="px-4 py-3">{{ student.studentNameLao }}</td>
            <td class="px-4 py-3">{{ student.guardianPhone }}</td>
            <td class="px-4 py-3">{{ student.gender }}</td>
            <td class="px-4 py-3">{{ student.village }}</td>
            <td class="px-4 py-3">{{ student.district }}</td>
            <td class="px-4 py-3">{{ student.province }}</td>
            <td class="px-4 py-3">{{ student.dateOfBirth }}</td>
            <td class="px-4 py-3">{{ student.phoneNumber }}</td>
            <td class="px-4 py-3">{{ student.idNumber }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex justify-center space-x-2">
                <button 
                  @click="editStudent(student)"
                  class="p-1 text-yellow-600 hover:text-yellow-800"
                  title="ແກ້ໄຂ"
                >
                  ✏️
                </button>
                <button 
                  @click="deleteStudent(student)"
                  class="p-1 text-red-600 hover:text-red-800"
                  title="ລຶບ"
                  :disabled="isLoading"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedStudents.length === 0">
            <td colspan="11" class="px-4 py-6 text-center text-gray-500">
              ບໍ່ພົບຂໍ້ມູນນັກຮຽນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination Controls -->
    <div v-if="!isLoading" class="flex justify-between items-center mt-6">
      <div class="text-sm text-gray-600">
        ສະແດງ {{ paginatedStudents.length }} ຈາກທັງໝົດ {{ filteredStudents.length }} ລາຍການ
        <span v-if="searchQuery.trim() || selectedGender !== 'all'" class="ml-2 text-blue-600">
          (ຜົນການຄົ້ນຫາ)
        </span>
      </div>
      
      <div class="flex space-x-1">
        <button 
          @click="navigateToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          :class="[
            'px-3 py-1 rounded',
            currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
          ]"
        >
          ກັບຄືນ
        </button>
        
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="navigateToPage(page)"
          :class="[
            'px-3 py-1 rounded',
            currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
          ]"
        >
          {{ page }}
        </button>
        
        <button 
          @click="navigateToPage(currentPage + 1)"
          :disabled="currentPage === totalPages || totalPages === 0"
          :class="[
            'px-3 py-1 rounded',
            currentPage === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
          ]"
        >
          ຕໍ່ໄປ
        </button>
      </div>
    </div>
  </div>
</template> 