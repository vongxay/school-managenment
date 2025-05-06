<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

// ຂໍ້ມູນການລົງທະບຽນ
const registrations = ref([]);
const studentTableData = ref([]);

// ຂໍ້ມູນປີການສຶກສາແລະລະດັບຊັ້ນ
const schoolYears = ref([]);
const levels = ref([]);
const classroomData = ref([]); // ເພີ່ມຕົວແປເກັບຂໍ້ມູນຫ້ອງຮຽນສຳລັບ dialog

// URL ຂອງ API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ຕົວແປສະຖານະ
const isLoading = ref(false);
const error = ref('');
const apiError = ref(''); // ຂໍ້ຜິດພາດຈາກ API
const currentRegistrationId = ref('');
const currentSchoolYear = ref('');
const currentClassId = ref('');
const currentClassSection = ref('');
const currentStudentId = ref('');
const currentStudentName = ref('');
const currentStudentPhone = ref('');
const currentClassName = ref('');
const currentClassLevel = ref(''); // ເພີ່ມຕົວແປເກັບລະດັບຊັ້ນຂອງຫ້ອງຮຽນ
const numberOfBills = ref('');
const description = ref('');
const searchQuery = ref('');
const studentSearchQuery = ref('');
const isAuthenticated = ref(false);
const token = ref('');
const showClassroomDialog = ref(false);
const showSchoolYearDialog = ref(false);

// ກອງຂໍ້ມູນນັກຮຽນສຳລັບສະແດງໃນຕາຕະລາງ
const filteredStudents = computed(() => {
  if (!studentSearchQuery.value) {
    return studentTableData.value;
  }
  
  const query = studentSearchQuery.value.toLowerCase();
  return studentTableData.value.filter(student => 
    student.studentName.toLowerCase().includes(query) || 
    student.studentId.toLowerCase().includes(query) ||
    student.studentPhone.toLowerCase().includes(query)
  );
});

// ກອງຂໍ້ມູນການລົງທະບຽນສຳລັບສະແດງໃນຕາຕະລາງ
const filteredRegistrations = computed(() => {
  if (!searchQuery.value) {
    return [...registrations.value].reverse();
  }
  
  const query = searchQuery.value.toLowerCase();
  const filtered = registrations.value.filter(reg => 
    (reg.studentName?.toLowerCase() || '').includes(query) || 
    (reg.studentId?.toLowerCase() || '').includes(query) ||
    reg.id.toLowerCase().includes(query)
  );
  
  return filtered.slice(0, 10).reverse();
});

// ດຶງຂໍ້ມູນການລົງທະບຽນທັງໝົດ
const fetchRegistrations = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    // ຖ້າບໍ່ມີການຄົ້ນຫາ ໃຫ້ດຶງຂໍ້ມູນທັງໝົດ
    let url = `${API_URL}/registrations`;
    if (searchQuery.value) {
      url += `?search=${encodeURIComponent(searchQuery.value)}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`
      }
    });
    
    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນໃຫ້ຕົງກັບໂຄງສ້າງທີ່ໃຊ້ສະແດງຜົນ
      const formattedData = response.data.data.registrations.map(reg => ({
        id: reg.id || reg.invoice_id,
        registrationDate: reg.registration_date,
        studentId: reg.student_id,
        studentName: reg.student_name || '',
        studentPhone: reg.student_phone || '',
        classroom: reg.classroom || '',
        level: reg.level || '',
        schoolYear: reg.school_year || '',
        paid: reg.paid || reg.is_paid || false
      }));
      
      // ກຳນົດຂໍ້ມູນໃຫ້ກັບອາເຣເທີ່ໃຊ້ສະແດງຜົນ
      registrations.value = formattedData;
    }
  } catch (err) {
    console.error('Error fetching registrations:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການລົງທະບຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ຄົ້ນຫານັກຮຽນ
const searchStudents = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    let url = `${API_URL}/students`;
    if (studentSearchQuery.value) {
      url += `?search=${encodeURIComponent(studentSearchQuery.value)}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.error("Search API Error:", error.response?.data || error.message);
      throw error;
    });
    
    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນໃຫ້ຕົງກັບໂຄງສ້າງທີ່ໃຊ້ສະແດງຜົນ
      const formattedData = response.data.data.students.map(student => ({
        studentId: student.student_id,
        studentName: student.student_name_lao,
        studentPhone: student.guardian_phone || student.phone || ''
      }));
      
      // ກຳນົດຂໍ້ມູນໃຫ້ກັບອາເຣເທີ່ໃຊ້ສະແດງຜົນ
      studentTableData.value = formattedData;
    }
  } catch (err) {
    console.error('Error searching students:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫານັກຮຽນ';
    studentTableData.value = []; // ລ້າງຂໍ້ມູນທີ່ສະແດງ
  } finally {
    isLoading.value = false;
  }
};

// ເລືອກນັກຮຽນຈາກຕາຕະລາງ
const selectStudent = (student) => {
  currentStudentId.value = student.studentId;
  currentStudentName.value = student.studentName;
  currentStudentPhone.value = student.studentPhone;
};

// ສ້າງ ID ໃໝ່ສຳລັບການລົງທະບຽນ
const generateNewRegistrationId = () => {
  let lastId = 0;
  
  // ຫາຄ່າ ID ຫຼ້າສຸດຈາກຂໍ້ມູນທີ່ມີຢູ່
  registrations.value.forEach(reg => {
    try {
      const idParts = reg.id.split('-');
      if (idParts.length > 1) {
        const numericPart = idParts[1].replace(/^0+/, '');
        const currentId = parseInt(numericPart);
        if (!isNaN(currentId) && currentId > lastId) {
          lastId = currentId;
        }
      }
    } catch (error) {
      console.error("Error parsing ID:", error);
    }
  });
  
  // ສ້າງ ID ໃໝ່
  currentRegistrationId.value = `INV-${String(lastId + 1).padStart(8, '0')}`;
};

// ພິມການລົງທະບຽນ
const printRegistration = () => {
  alert('ກຳລັງສັ່ງພິມໃບລົງທະບຽນ...');
};

// ກວດສອບຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ
const validateForm = () => {
  if (!currentStudentId.value) {
    alert('ກະລຸນາເລືອກນັກຮຽນກ່ອນລົງທະບຽນ');
    return false;
  }
  
  if (!currentStudentName.value) {
    alert('ກະລຸນາລະບຸຊື່ນັກຮຽນກ່ອນລົງທະບຽນ');
    return false;
  }
  
  if (!currentStudentPhone.value) {
    alert('ກະລຸນາລະບຸເບີໂທຜູ້ປົກຄອງກ່ອນລົງທະບຽນ');
    return false;
  }
  
  if (!currentClassName.value) {
    alert('ກະລຸນາລະບຸຫ້ອງຮຽນກ່ອນລົງທະບຽນ');
    return false;
  }
  
  if (!currentSchoolYear.value) {
    alert('ກະລຸນາລະບຸສົກຮຽນກ່ອນລົງທະບຽນ');
    return false;
  }

  if (!currentClassLevel.value) {
    alert('ກະລຸນາເລືອກຫ້ອງຮຽນທີ່ມີລະດັບຊັ້ນຮຽນກຳນົດໄວ້');
    
    // ພະຍາຍາມດຶງຂໍ້ມູນຫ້ອງຮຽນອີກຄັ້ງ
    if (currentClassName.value) {
      fetchClassInfo(currentClassName.value);
    }
    
    return false;
  }
  
  return true;
};

// ບັນທຶກການລົງທະບຽນ
const saveRegistration = async () => {
  if (!validateForm()) return;
  
  try {
    isLoading.value = true;
    error.value = '';
    apiError.value = '';
    
    // ໃຊ້ລະດັບຊັ້ນທີ່ດຶງມາຈາກຂໍ້ມູນຫ້ອງຮຽນແທນການຄຳນວນເອງ
    console.log('ກຳລັງລົງທະບຽນ:', {
      student_id: currentStudentId.value,
      student_name: currentStudentName.value,
      student_phone: currentStudentPhone.value,
      classroom: currentClassName.value,
      level: currentClassLevel.value, // ໃຊ້ຄ່າຈາກຕົວແປທີ່ເກັບລະດັບຊັ້ນ
      school_year: currentSchoolYear.value
    });
    
    // ດຶງຂໍ້ມູນຄ່າເຣີຢນຕາມລະດັບຊັ້ນແລະປີການສຶກສາ
    let tuitionFee = 0;
    try {
      const tuitionResponse = await axios.get(`${API_URL}/tuitions`, {
        headers: {
          Authorization: `Bearer ${authStore.user?.token}`
        }
      });
      
      if (tuitionResponse.data.success) {
        // ຄ້ນຫາຄ່າເຣີຢນຕາມລະດັບຊັ້ນແລະປີການສຶກສາ
        const matchingTuition = tuitionResponse.data.data.find((t) => 
          t.level === currentClassLevel.value && 
          t.year === currentSchoolYear.value
        );
        
        if (matchingTuition) {
          tuitionFee = matchingTuition.amount;
        } else {
          console.warn('ໄມ່ພບຂ້ອມູນຄ່າເຣີຢນສຳຫຣັບລະດັບຊັ້ນແລະປີການສຶກສານີ້');
        }
      }
    } catch (err) {
      console.error('Error fetching tuition info:', err);
    }
    
    // ສ້າງຂໍ້ມູນການລົງທະບຽນໃໝ່ຕາມໂຄງສ້າງຖານຂໍ້ມູນ
    const registrationData = {
      student_id: currentStudentId.value,
      student_name: currentStudentName.value,
      student_phone: currentStudentPhone.value,
      classroom: currentClassName.value,
      level: currentClassLevel.value, // ໃຊ້ຄ່າຈາກຕົວແປທີ່ເກັບລະດັບຊັ້ນ
      school_year: currentSchoolYear.value,
      paid: false,
      tuition_fee: tuitionFee, // ເພີ່ມຄ່າເຣີຢນທີ່ຈະເຣີຢກເກ໇ບ
      invoice_id: currentRegistrationId.value,
      registration_date: new Date().toISOString().split('T')[0]
    };
    
    // ສ່ງຂໍ້ມູນໄປຍັງ API
    const response = await axios.post(`${API_URL}/registrations`, registrationData, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.error("API Error:", error.response?.data || error.message);
      throw error; // ສ່ງຕໍ່ຂໍ້ຜິດພາດເພື່ອໃຫ້ catch ດ້ານນອກຈັດການຕໍ່
    });
    
    if (response.data.success) {
      // ດຶງຂໍ້ມູນການລົງທະບຽນໃໝ່
      await fetchRegistrations();
      
      // ລ້າງຟອມຫຼັງຈາກບັນທຶກ
      clearForm();
      
      alert('ບັນທຶກການລົງທະບຽນສຳເລັດ');
    } else {
      apiError.value = response.data.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ';
      alert(apiError.value);
    }
  } catch (err) {
    console.error("Error in registration:", err);
    const errorMessage = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ';
    apiError.value = errorMessage;
    error.value = errorMessage;
    alert(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// ເພີ່ມຟັງຊັນ clearForm ສຳລັບລ້າງຂໍ້ມູນໃນຟອມ
const clearForm = () => {
  currentStudentId.value = '';
  currentStudentName.value = '';
  currentStudentPhone.value = '';
  currentClassName.value = '';
  currentClassLevel.value = ''; // ລ້າງຄ່າລະດັບຊັ້ນ
  
  // ສ້າງ ID ໃໝ່ສຳລັບການລົງທະບຽນຄັ້ງຕໍ່ໄປ
  generateNewRegistrationId();
};

// ຄົ້ນຫາຂໍ້ມູນເມື່ອມີການປ່ຽນແປງຄ່າໃນຊ່ອງຄົ້ນຫາ
const handleStudentSearch = () => {
  searchStudents();
};

// ຄົ້ນຫາການລົງທະບຽນເມື່ອມີການປ່ຽນແປງຄ່າໃນຊ່ອງຄົ້ນຫາ
const handleRegistrationSearch = () => {
  fetchRegistrations();
};

// ເລືອກຫ້ອງຮຽນ
const selectClassroom = (classroom) => {
  currentClassName.value = classroom;
  showClassroomDialog.value = false;
  
  // ດຶງຂໍ້ມູນຫ້ອງຮຽນຈາກ API
  fetchClassInfo(classroom);
};

// ດຶງຂໍ້ມູນຫ້ອງຮຽນແລະລະດັບຊັ້ນທີ່ຖືກຕ້ອງ
const fetchClassInfo = async (className) => {
  try {
    isLoading.value = true;
    error.value = '';
    
    const response = await axios.get(`${API_URL}/classes`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`
      }
    });
    
    if (response.data.success) {
      // ຊອກຫາຂໍ້ມູນຫ້ອງຮຽນທີ່ເລືອກ
      const classInfo = response.data.data.find(c => c.name === className);
      if (classInfo) {
        // ຕັ້ງຄ່າລະດັບຊັ້ນຕາມຂໍ້ມູນຈາກຖານຂໍ້ມູນ
        currentClassLevel.value = classInfo.level;
        currentClassId.value = classInfo.id;
      } else {
        // ຖ້າບໍ່ພົບຂໍ້ມູນຫ້ອງຮຽນ ໃຫ້ໃຊ້ວິທີຄຳນວນເດີມ
        if (className.includes('/')) {
          const grade = className.split('/')[0].trim();
          if (grade.startsWith('ມ ')) {
            const gradeNumber = grade.substring(2);
            currentClassId.value = gradeNumber;
            
            // ຊອກຫາລະດັບຊັ້ນໃນຂໍ້ມູນທີ່ດຶງມາຈາກຖານຂໍ້ມູນ
            const levelObj = levels.value.find(l => l.name === `ຊັ້ນ ມ ${gradeNumber}`);
            if (levelObj) {
              currentClassLevel.value = levelObj.name;
            } else {
              currentClassLevel.value = `ຊັ້ນ ມ ${gradeNumber}`;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching class info:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ເປີດໜ້າຕ່າງເລືອກຫ້ອງຮຽນ
const openClassroomDialog = () => {
  // ດຶງຂໍ້ມູນຫ້ອງຮຽນກ່ອນເປີດ dialog
  fetchClasses();
  showClassroomDialog.value = true;
};

// ດຶງຂໍ້ມູນຫ້ອງຮຽນທັງໝົດ
const fetchClasses = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    const response = await axios.get(`${API_URL}/classes`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`
      }
    });
    
    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນຫ້ອງຮຽນສຳລັບ dialog
      classroomData.value = response.data.data.map(c => c.name);
    }
  } catch (err) {
    console.error('Error fetching classes:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນປີການສຶກສາທັງໝົດ
const fetchSchoolYears = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    const response = await axios.get(`${API_URL}/years`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`
      }
    });
    
    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນປີການສຶກສາ
      schoolYears.value = response.data.data.map(year => ({
        id: year.id,
        period: year.period || year.name
      }));
      
      // ຕັ້ງຄ່າປີການສຶກສາປັດຈຸບັນຖ້າມີຂໍ້ມູນ
      if (schoolYears.value.length > 0 && !currentSchoolYear.value) {
        // ຫາປີການສຶກສາທີ່ເປັນປັດຈຸບັນ
        const currentYear = schoolYears.value.find(year => year.period === `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
        if (currentYear) {
          currentSchoolYear.value = currentYear.period;
          currentClassId.value = currentYear.id;
        } else {
          // ໃຊ້ປີການສຶກສາທຳອິດໃນລາຍການ
          currentSchoolYear.value = schoolYears.value[0].period;
          currentClassId.value = schoolYears.value[0].id;
        }
      }
    }
  } catch (err) {
    console.error('Error fetching school years:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປີການສຶກສາ';
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນລະດັບຊັ້ນທັງໝົດ
const fetchLevels = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    const response = await axios.get(`${API_URL}/levels`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`
      }
    });
    
    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນລະດັບຊັ້ນ
      levels.value = response.data.data.map(level => ({
        id: level.id,
        name: level.name
      }));
    }
  } catch (err) {
    console.error('Error fetching levels:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລະດັບຊັ້ນ';
  } finally {
    isLoading.value = false;
  }
};

// ເລືອກປີການສຶກສາ
const selectSchoolYear = (year) => {
  currentSchoolYear.value = year.period;
  currentClassId.value = year.id;
  showSchoolYearDialog.value = false;
};

// ເປີດໜ້າຕ່າງເລືອກປີການສຶກສາ
const openSchoolYearDialog = () => {
  showSchoolYearDialog.value = true;
};

// ເມື່ອຄອມໂພເນນໂຫລດ
onMounted(() => {
  // ກວດສອບການເຂົ້າສູ່ລະບົບຈາກ authStore
  if (authStore.isAuthenticated) {
    isAuthenticated.value = true;
    token.value = authStore.user?.token || '';
    
    // ດຶງຂໍ້ມູນການລົງທະບຽນແລະນັກຮຽນ
    fetchRegistrations();
    searchStudents();
    
    // ດຶງຂໍ້ມູນປີການສຶກສາແລະລະດັບຊັ້ນຈາກຖານຂໍ້ມູນ
    fetchSchoolYears();
    fetchLevels();
    fetchClasses(); // ດຶງຂໍ້ມູນຫ້ອງຮຽນ
    
    // ສ້າງ ID ໃໝ່ສຳລັບການລົງທະບຽນ
    generateNewRegistrationId();
    
    // ຕັ້ງຄ່າປີການສຶກສາປັດຈຸບັນ (ຈະໃຊ້ເປັນຄ່າເລີ່ມຕົ້ນຖ້າບໍ່ສາມາດດຶງຂໍ້ມູນຈາກ API)
    if (!currentSchoolYear.value) {
      const currentYear = new Date().getFullYear();
      currentSchoolYear.value = `${currentYear}-${currentYear + 1}`;
    }
  } else {
    error.value = 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນໃຊ້ງານ';
  }
});
</script>

<template>
  <div class="bg-gray-200 p-4 rounded-lg">
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
      {{ error }}
    </div>
    
    <div v-if="apiError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
      <strong>API Error:</strong> {{ apiError }}
    </div>

    <div class="flex items-center mb-4">
      <div class="w-28 mr-2">ລະຫັດລົງທະບຽນ</div>
      <div class="w-40 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentRegistrationId" />
      </div>
    </div>

    <!-- ສ່ວນແສດງປີການຨຶກສາ -->
    <div class="flex items-center mb-4 justify-end">
      <div class="w-28">ສົກຮຽນ</div>
      <div class="w-16 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentClassId" placeholder="002" />
      </div>
      <div class="w-56 mr-2">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentSchoolYear" readonly />
      </div>
      <div class="w-12">
        <button class="w-full px-2 py-1 bg-white border rounded hover:bg-gray-100" @click="openSchoolYearDialog">...</button>
      </div>
    </div>

    <!-- ສ່ວນແສດງຫ້ອງຮຽນ -->
    <div class="flex items-center mb-4 justify-end">
      <div class="w-28">ຫ້ອງຮຽນ</div>
      <div class="w-16 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentClassSection" placeholder="004" />
      </div>
      <div class="w-56 mr-2">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentClassName" readonly />
      </div>
      <div class="w-12">
        <button class="w-full px-2 py-1 bg-white border rounded hover:bg-gray-100" @click="openClassroomDialog">...</button>
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
      <div class="w-28 mr-2">ຂໍ້ມູນຂອງນັກຮຽນ</div>
      <div class="w-28 mr-2">search</div>
      <div class="w-40">
        <input 
          type="text" 
          class="w-full px-2 py-1 border rounded bg-white" 
          v-model="studentSearchQuery" 
          @input="handleStudentSearch"
        />
      </div>
    </div>

    <div class="mb-4">
      <div class="grid grid-cols-3 bg-gray-400 p-2">
        <div>ລະຫັດນັກຮຽນ</div>
        <div>ຊື່ນັກຮຽນ(La)</div>
        <div>ເບີໂທຜູ້ປົກຄອງ</div>
      </div>
      <div class="bg-white">
        <div 
          v-for="student in filteredStudents" 
          :key="student.studentId" 
          class="grid grid-cols-3 p-2 cursor-pointer hover:bg-gray-200" 
          @click="selectStudent(student)"
        >
          <div>{{ student.studentId }}</div>
          <div>{{ student.studentName }}</div>
          <div>{{ student.studentPhone }}</div>
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
            @input="handleRegistrationSearch"
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
      <div class="bg-white text-sm" v-if="isLoading">
        <div class="p-4 text-center">ກຳລັງໂຫລດຂໍ້ມູນ...</div>
      </div>
      <div class="bg-white text-sm" v-else-if="filteredRegistrations.length === 0">
        <div class="p-4 text-center">ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ</div>
      </div>
      <div class="bg-white text-sm" v-else>
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
      <button 
        class="px-6 py-2 border bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50" 
        @click="saveRegistration"
        :disabled="isLoading || !isAuthenticated"
      >
        {{ isLoading ? 'ກຳລັງລົງທະບຽນ...' : 'ລົງທະບຽນ' }}
      </button>
      <button 
        class="px-6 py-2 border bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50" 
        @click="printRegistration"
        :disabled="isLoading || !isAuthenticated"
      >
        ພິມໃບລົງທະບຽນ
      </button>
    </div>

    <!-- Dialog ເລືອກຫ້ອງຮຽນ -->
    <div v-if="showClassroomDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-md shadow-lg max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">ເລືອກຫ້ອງຮຽນ</h3>
          <button @click="showClassroomDialog = false" class="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div class="grid grid-cols-4 gap-2 mb-4">
          <button 
            v-for="classroom in classroomData" 
            :key="classroom"
            @click="selectClassroom(classroom)"
            class="px-2 py-1 border rounded hover:bg-gray-100"
          >
            {{ classroom }}
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog ເລືອກປີການສຶກສາ -->
    <div v-if="showSchoolYearDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-md shadow-lg max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">ເລືອກປີການສຶກສາ</h3>
          <button @click="showSchoolYearDialog = false" class="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-4">
          <button 
            v-for="year in schoolYears" 
            :key="year.id"
            @click="selectSchoolYear(year)"
            class="px-2 py-1 border rounded hover:bg-gray-100"
          >
            {{ year.period }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 