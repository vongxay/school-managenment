<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

interface StudentRegistration {
  id: string;
  registrationDate: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  classroom: string;
  level: string;
  schoolYear: string;
  paid: boolean;
}

const registrations = reactive<StudentRegistration[]>([
  { 
    id: 'INV-00000031', 
    registrationDate: '2022-6-11', 
    studentId: '008', 
    studentName: 'ທ້າວ ກັນ ໄຊສະຫຸຼດ', 
    studentPhone: '02059874624', 
    classroom: 'ມ 3/1', 
    level: 'ຊັ້ນ ມ 3', 
    schoolYear: '2024-2025', 
    paid: true 
  },
  { 
    id: 'INV-00000032', 
    registrationDate: '2022-6-11', 
    studentId: '009', 
    studentName: 'ທ້າວ ບີ ບຸນມີໃຈ', 
    studentPhone: '02026345982', 
    classroom: 'ມ 3/1', 
    level: 'ຊັ້ນ ມ 3', 
    schoolYear: '2024-2025', 
    paid: true 
  },
  { 
    id: 'INV-00000033', 
    registrationDate: '2022-6-11', 
    studentId: '010', 
    studentName: 'ທ້າວ ເອ ແສງຈັນ', 
    studentPhone: '02056234895', 
    classroom: 'ມ 3/1', 
    level: 'ຊັ້ນ ມ 3', 
    schoolYear: '2024-2025', 
    paid: true 
  },
  { 
    id: 'INV-00000034', 
    registrationDate: '2023-6-15', 
    studentId: '020', 
    studentName: 'ທ້າວ ຊິງຕາ ຈັນມາລີ', 
    studentPhone: '0205689234', 
    classroom: 'ມ 1/1', 
    level: 'ຊັ້ນ ມ', 
    schoolYear: '2023-2024', 
    paid: true 
  },
]);

const currentRegistrationId = ref('INV-00000034');
const currentSchoolYear = ref('2023-2024');
const currentClassId = ref('002');
const currentClassSection = ref('004');
const currentStudentId = ref('020');
const currentStudentName = ref('ທ້າວ ຊິງຕາ ຈັນມາລີ');
const currentStudentPhone = ref('0205689234');
const currentClassName = ref('ມ 1/1');
const numberOfBills = ref('');
const description = ref('');
const totalStudents = ref('');
const searchQuery = ref('');

const filteredRegistrations = computed(() => {
  if (!searchQuery.value) {
    return [...registrations].reverse();
  }
  
  const query = searchQuery.value.toLowerCase();
  const filtered = registrations.filter(reg => 
    reg.studentName.toLowerCase().includes(query) || 
    reg.studentId.toLowerCase().includes(query) ||
    reg.id.toLowerCase().includes(query)
  );
  
  return filtered.slice(0, 10).reverse();
});

const printRegistration = () => {
  alert('ກຳລັງສັ່ງພິມໃບລົງທະບຽນ...');
};

const validateForm = () => {
  if (!currentStudentId.value || !currentStudentName.value || !currentStudentPhone.value || 
      !currentClassName.value || !currentSchoolYear.value) {
    alert('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ');
    return false;
  }
  return true;
};

const saveRegistration = () => {
  if (!validateForm()) return;
  
  try {
    // ດຶງຂໍ້ມູນລະດັບຊັ້ນຮຽນຈາກຫ້ອງຮຽນ
    let level = currentClassName.value.includes('/') 
      ? currentClassName.value.split('/')[0] 
      : 'ຊັ້ນ ມ';
    
    // ສ້າງຂໍ້ມູນການລົງທະບຽນໃໝ່
    const newRegistration: StudentRegistration = {
      id: currentRegistrationId.value,
      registrationDate: new Date().toISOString().split('T')[0],
      studentId: currentStudentId.value,
      studentName: currentStudentName.value,
      studentPhone: currentStudentPhone.value,
      classroom: currentClassName.value,
      level: level,
      schoolYear: currentSchoolYear.value,
      paid: false
    };
    
    // ເພີ່ມລົງໃນອາເຣລົງທະບຽນ
    registrations.push(newRegistration);
    
    // ສ້າງ ID ໃໝ່ສຳລັບການລົງທະບຽນຄັ້ງຕໍ່ໄປ
    let lastId = 34;  // ຄ່າເລີ່ມຕົ້ນຈາກໄອດີສຸດທ້າຍທີ່ມີຢູ່
    try {
      const idParts = currentRegistrationId.value.split('-');
      if (idParts.length > 1) {
        const numericPart = idParts[1].replace(/^0+/, '');
        lastId = parseInt(numericPart) || lastId;
      }
    } catch (error) {
      console.error("Error parsing ID:", error);
    }
    
    currentRegistrationId.value = `INV-${String(lastId + 1).padStart(8, '0')}`;
    
    // ລ້າງຟອມຫຼັງຈາກບັນທຶກ
    currentStudentId.value = '';
    currentStudentName.value = '';
    currentStudentPhone.value = '';
    
    alert('ບັນທຶກການລົງທະບຽນສຳເລັດ');
  } catch (error) {
    console.error("Error in registration:", error);
    alert('ມີຂໍ້ຜິດພາດໃນການລົງທະບຽນ');
  }
};
</script>

<template>
  <div class="bg-gray-200 p-4 rounded-lg">
    <div class="flex items-center mb-4">
      <div class="w-28 mr-2">ລະຫັດລົງທະບຽນ</div>
      <div class="w-40 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentRegistrationId" />
      </div>
      <div class="w-16 mr-2">ລະຫັດສາຍ</div>
      <div class="w-16 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentClassId" />
      </div>
      <div class="w-20 mr-4"></div>
      <div class="w-40 mr-2">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentSchoolYear" />
      </div>
      <div class="w-12">
        <button class="w-full px-2 py-1 bg-white border rounded">...</button>
      </div>
    </div>

    <div class="flex items-center mb-4">
      <div class="w-28 mr-2">ຫ້ອງສາຍ</div>
      <div class="w-16 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentClassSection" />
      </div>
      <div class="flex-grow"></div>
      <div class="w-40 mr-2">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentClassName" />
      </div>
      <div class="w-12">
        <button class="w-full px-2 py-1 bg-white border rounded">...</button>
      </div>
    </div>

    <div class="flex items-center mb-4">
      <div class="w-28 mr-2">ລະຫັດນັກຮຽນ</div>
      <div class="w-40 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentStudentId" />
      </div>
      <div class="w-28 mr-2">ຊື່ນັກຮຽນ(LA)</div>
      <div class="w-60 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentStudentName" />
      </div>
      <div class="w-28 mr-2">ເບີໂທຜູ້ປົກຄອງ</div>
      <div class="w-40">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentStudentPhone" />
      </div>
    </div>

    <div class="flex items-center mb-4">
      <div class="w-28 mr-2">ຈຳນວນບິນການຍ</div>
      <div class="w-40 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="numberOfBills" />
      </div>
      <div class="w-28 mr-2">ຄຳອະທິບາຍ</div>
      <div class="w-40">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="description" />
      </div>
    </div>

    <div class="mb-4">
      <div class="grid grid-cols-3 bg-gray-400 p-2">
        <div>ລະຫັດນັກຮຽນ</div>
        <div>ຊື່ນັກຮຽນ(La)</div>
        <div>ເບີໂທຜູ້ປົກຄອງ</div>
      </div>
      <div class="bg-white">
        <div class="grid grid-cols-3 p-2">
          <div>020</div>
          <div>ທ້າວ ຊິງຕາ ຈັນມາລີ</div>
          <div>020 56234891</div>
        </div>
        <div class="grid grid-cols-3 p-2 bg-gray-100">
          <div>019</div>
          <div>ນາງ ບີ ຈັນທະລີ</div>
          <div>020 56974325</div>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <div class="flex items-center mb-2">
        <div class="w-34 mr-2">ຈຳນວນນັກຮຽນທັງໝົດ</div>
        <div class="w-28 ml-28">ຄົ້ນຫານັກຮຽນ</div>
        <div class="flex-grow">
          <input 
            type="text" 
            class="w-full px-2 py-1 border rounded bg-white" 
            v-model="searchQuery" 
            placeholder="ຄົ້ນຫາຕາມລະຫັດ ຫຼື ຊື່ນັກຮຽນ..." 
          />
        </div>
      </div>
      <div class="grid grid-cols-9 bg-gray-400 p-2 text-sm">
        <div>ລະຫັດລົງທະບຽນ</div>
        <div>ວັນທີລົງທະບຽນ</div>
        <div>ລະຫັດນັກຮຽນ</div>
        <div>ຊື່ນັກຮຽນ(La)</div>
        <div>ເບີໂທຜູ້ປົກຄອງ</div>
        <div>ຫ້ອງສາຍ</div>
        <div>ຊັ້ນຮຽນ</div>
        <div>ສົກຮຽນ</div>
        <div>ສະຖານະ</div>
      </div>
      <div class="bg-white text-sm">
        <div 
          v-for="reg in filteredRegistrations" 
          :key="reg.id"
          class="grid grid-cols-9 p-1 border-b"
        >
          <div>{{ reg.id }}</div>
          <div>{{ reg.registrationDate }}</div>
          <div>{{ reg.studentId }}</div>
          <div>{{ reg.studentName }}</div>
          <div>{{ reg.studentPhone }}</div>
          <div>{{ reg.classroom }}</div>
          <div>{{ reg.level }}</div>
          <div>{{ reg.schoolYear }}</div>
          <div>{{ reg.paid ? 'ຈ່າຍ' : 'ຍັງບໍ່ຈ່າຍ' }}</div>
        </div>
      </div>
    </div>

    <div class="flex justify-center space-x-4">
      <button class="px-6 py-2 border bg-gray-300 text-black rounded hover:bg-gray-400" @click="saveRegistration">
        ລົງທະບຽນ
      </button>
      <button class="px-6 py-2 border bg-gray-300 text-black rounded hover:bg-gray-400" @click="printRegistration">
        ພິມໃບລົງທະບຽນ
      </button>
    </div>
  </div>
</template> 