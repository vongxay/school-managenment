<script setup lang="ts">
import { ref } from 'vue';
// ລຶບການ import Student ທີ່ບໍ່ໄດ້ໃຊ້
// import type { Student } from '../types/student';
import StudentList from './StudentList.vue';
import { useStudentStore } from '../stores/studentStore';

// ใช้ store
const studentStore = useStudentStore();
const student = studentStore.currentStudent;
const isEditing = studentStore.isEditing;

const photoInput = ref<HTMLInputElement | null>(null);
const photoPreview = ref<string>('');

const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // ສ້າງ Image object ເພື່ອຫຼຸດຂະໜາດ
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      
      img.onload = () => {
        // ສ້າງ canvas ເພື່ອຫຼຸດຂະໜາດ
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        console.log('canvas', canvas);
        // ແປງເປັນ Base64 ໃນຮູບແບບທີ່ມີຂະໜາດນ້ອຍລົງ (ຄຸນນະພາບ 70%)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        photoPreview.value = dataUrl;
        console.log('Photo URL:', dataUrl);
        student.photoUrl = dataUrl;
      };
    };
    
    reader.readAsDataURL(file);
  }
};

const formatDate = (field: 'idIssuedDate' | 'dateOfBirth') => {
  if (student[field]) {
    const date = new Date(student[field]);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    student[field] = formattedDate;
  }
};

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      const success = await studentStore.updateStudent(student);
      if (success) {
        alert('ອັບເດດຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ');
      } else {
        alert('ບໍ່ສາມາດອັບເດດຂໍ້ມູນນັກຮຽນໄດ້');
      }
    } else {
      const newId = await studentStore.addStudent(student);
      console.log('ລະຫັດນັກຮຽນໃໝ່:', newId);
      console.log('ລະຫັດນັກຮຽນໃໝ່:', newId, 'await::',await studentStore.addStudent(student));
      if (newId) {
        alert('ບັນທຶກຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ.');
      } else {
        alert('ບໍ່ສາມາດບັນທຶກຂໍ້ມູນນັກຮຽນໄດ້');
      }
    }
    // ເຄລີຢຣ໌ຟອມ
    studentStore.startNew();
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນນັກຮຽນ:', error);
    alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນນັກຮຽນ');
  }
};

const handleDelete = async () => {
  if (isEditing.value && student.studentId) {
    if (confirm(`ທ່ານແນ່ໃຈບໍວ່າຕ້ອງການລຶບຂໍ້ມູນນັກຮຽນ ${student.studentNameLao}?`)) {
      try {
        const success = await studentStore.deleteStudent(student.studentId);
        if (success) {
          alert('ລຶບຂໍ້ມູນນັກຮຽນສຳເລັດແລ້ວ');
          studentStore.startNew();
        } else {
          alert('ບໍ່ສາມາດລຶບຂໍ້ມູນນັກຮຽນໄດ້');
        }
      } catch (error) {
        console.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນນັກຮຽນ:', error);
        alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນນັກຮຽນ');
      }
    }
  }
};

const handleNew = () => {
  studentStore.startNew();
};
</script>

<template>
  <div class="bg-gray-200 p-6 rounded-lg">
    <div class="flex justify-between mb-4">
      <h2 class="text-xl font-bold">{{ isEditing ? 'ແກ້ໄຂຂໍ້ມູນນັກຮຽນ' : 'ເພີ່ມນັກຮຽນໃໝ່' }}</h2>
      <button 
        v-if="isEditing" 
        @click="handleNew" 
        class="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ເພີ່ມນັກຮຽນໃໝ່
      </button>
    </div>
    
    <!-- First Row -->
    <div class="grid grid-cols-7 gap-4 mb-4">
      <div>
        <label class="block text-sm mb-1">ລະຫັດນັກຮຽນ</label>
        <input v-model="student.studentId" type="text" class="w-full px-2 py-1 border rounded bg-white" disabled />
      </div>
      <div>
        <label class="block text-sm mb-1">ຊື່ນັກຮຽນ(La)</label>
        <input v-model="student.studentNameLao" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div>
        <label class="block text-sm mb-1">ເບີໂທຜູ້ປົກຄອງ</label>
        <input v-model="student.guardianPhone" type="number" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div>
        <label class="block text-sm mb-1">ເພດ</label>
        <select v-model="student.gender" class="w-full px-2 py-1 border rounded bg-white">
          <option value="M">M</option>
          <option value="F">F</option>
        </select>
      </div>
      <div>
        <label class="block text-sm mb-1">ບ້ານ</label>
        <input v-model="student.village" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div>
        <label class="block text-sm mb-1">ເມືອງ</label>
        <input v-model="student.district" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div>
        <label class="block text-sm mb-1">ແຂວງ</label>
        <input v-model="student.province" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
    </div>

    <!-- Second Row -->
    <div class="grid grid-cols-7 gap-4 mb-4">
      <div class="col-span-2">
        <label class="block text-sm mb-1">ເລກສຳມະໂນຄົວ</label>
        <input v-model="student.idNumber" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div class="col-span-2">
        <label class="block text-sm mb-1">ວັນທີອອກສຳມະໂນຄົວ</label>
        <div class="flex">
          <!-- Use input type="date" -->
          <input
            type="date"
            v-model="student.idIssuedDate"
            class="w-full px-2 py-1 border rounded bg-white"
            @change="formatDate('idIssuedDate')"
          />
        </div>
      </div>
      <div>
        <label class="block text-sm mb-1">ບ້ານເກີດ</label>
        <input v-model="student.birthVillage" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div>
        <label class="block text-sm mb-1">ເມືອງເກີດ</label>
        <input v-model="student.birthDistrict" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div>
        <label class="block text-sm mb-1">ແຂວງເກີດ</label>
        <input v-model="student.birthProvince" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
    </div>

    <!-- Third Row -->
    <div class="grid grid-cols-7 gap-4 mb-4">
      <div>
        <label class="block text-sm mb-1">ຊົນເຜົ່າ</label>
        <input v-model="student.ethnicity" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div>
        <label class="block text-sm mb-1">ສາສະໜາ</label>
        <input v-model="student.religion" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div>
        <label class="block text-sm mb-1">ສັນຊາດ</label>
        <input v-model="student.nationality" type="text" class="w-full px-2 py-1 border rounded bg-white" />
      </div>
      <div class="col-span-2">
      <label class="block text-sm mb-1">ວັນເດືອນປີເກີດ</label>
      <div class="flex">
        <input
          type="date"
          v-model="student.dateOfBirth"
          class="w-full px-2 py-1 border rounded bg-white"
          @change="formatDate('dateOfBirth')"
        />
        </div>
      </div>
      <div>
        <label class="block text-sm mb-1">ເບີໂທ</label>
        <input v-model="student.phoneNumber" type="number" class="w-full px-2 py-1 border rounded bg-white no-spinner" />
      </div>
      <div class="relative">
        <div class="w-full aspect-square bg-white border rounded mb-2">
          <img
            :src="student.photoUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzE0LTIyOjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMDMtMjdUMTE6NDA6MjMtMDQ6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMDMtMjdUMTE6NDA6MjMtMDQ6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTAzLTI3VDExOjQwOjIzLTA0OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmE1ZWYzMmRkLTU2NGEtNDM5Ny05YTc1LTNmOGQ5NWQ1OGUwYSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjAwMjEwZjUxLTY5ZjgtYzU0OC1h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'"
            alt="Student photo"
            class="w-full h-full object-cover"
          />
        </div>
        <button @click="() => photoInput?.click()" class="w-full px-4 py-1 bg-gray-300 rounded text-center">
          ເລືອກຮູບ
        </button>
        <input
          ref="photoInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handlePhotoUpload"
        />
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex justify-end space-x-2">
      <button
        @click="handleDelete"
        class="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        :class="{ 'cursor-not-allowed opacity-50': !isEditing }"
        :disabled="!isEditing"
      >
        ລຶບ
      </button>
      <button
        @click="handleSubmit"
        :class="[
            'px-4 py-2 text-white rounded hover:bg-opacity-90',
            isEditing
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700',
          ]"
      >
        {{ isEditing ? 'ອັບເດດ' : 'ບັນທຶກ' }}
      </button>
    </div>
    
  </div>
  
  <!-- Student List Component -->
  <div>
    <StudentList />
  </div>
</template>