<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

// ຂໍ້ມູນການລົງທະບຽນ
const registrations = ref([]);
const studentTableData = ref([]);

// ຂໍ້ມູນປີການສຶກສາແລະລະດັບຊັ້ນ
const schoolYears = ref([]);
const levels = ref([]);
const classroomData = ref([]); // holds array of objects { id, name, level } for dialog

// URL ຂອງ API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ຕົວແປສະຖານະ
const isLoading = ref(false);
const error = ref('');
const apiError = ref(''); // ຂໍ້ຜິດພາດຈາກ API
const currentRegistrationId = ref('');
const currentSchoolYear = ref('');
const currentSchoolYearId = ref(''); // ຕົວແປເກັບລະຫັດສົກຮຽນ
const currentClassId = ref('');
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
  // ถ้าไม่มีข้อมูลในตาราง ให้คืนค่าอาร์เรย์ว่าง
  if (!studentTableData.value || studentTableData.value.length === 0) {
    return [];
  }
  
  // ถ้าไม่มีการค้นหา ให้คืนค่าข้อมูลเดิม (ไม่เกิน 20 รายการ)
  if (!studentSearchQuery.value) {
    return studentTableData.value.slice(0, 20);
  }
  
  // ถ้ามีการค้นหา ให้กรองข้อมูล
  const query = studentSearchQuery.value.toLowerCase();
  return studentTableData.value.filter(student => 
    student.studentName.toLowerCase().includes(query) || 
    student.studentId.toLowerCase().includes(query) ||
    student.studentPhone.toLowerCase().includes(query)
  ).slice(0, 20); // จำกัดจำนวนที่แสดงไม่เกิน 20 รายการ
});

// ກອງຂໍ້ມູນການລົງທະບຽນສຳລັບສະແດງໃນຕາຕະລາງ
const filteredRegistrations = computed(() => {
  // ถ้าไม่มีข้อมูลการลงทะเบียน ให้คืนค่าอาร์เรย์ว่าง
  if (!registrations.value || registrations.value.length === 0) {
    return [];
  }
  
  // ถ้าไม่มีการค้นหา ให้แสดงข้อมูลล่าสุดเรียงจากใหม่ไปเก่า (ไม่เกิน 20 รายการ)
  if (!searchQuery.value) {
    return [...registrations.value].slice(0, 20).reverse();
  }
  
  // ถ้ามีการค้นหา ให้กรองข้อมูลตามคำค้นหา
  const query = searchQuery.value.toLowerCase();
  const filtered = registrations.value.filter(reg => 
    (reg.studentName?.toLowerCase() || '').includes(query) || 
    (reg.studentId?.toLowerCase() || '').includes(query) ||
    reg.id.toLowerCase().includes(query)
  );
  
  // คืนค่าข้อมูลที่กรองแล้ว และจำกัดจำนวนไม่เกิน 20 รายการ
  return filtered.slice(0, 20).reverse();
});

// ເພີ່ມຟັງຊັນแປລງรแแບวัີ่
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // ถ้าแปลงไม่ได้ให้แสดงเป็นข้อความเดิม
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// ດຶງຂໍ້ມູນການລົງທະບຽນທັງໝົດ
const fetchRegistrations = async (forceRefresh = false) => {
  try {
    // ไม่ดึงข้อมูลซ้ำถ้ากำลังโหลดอยู่แล้ว
    if (isLoading.value) return;
    
    isLoading.value = true;
    error.value = '';
    
    // ຖ້າບໍ່ມີການຄົ້ນຫາ ໃຫ້ດຶງຂໍ້ມູນທັງໝົດ
    let url = `${API_URL}/registrations`;
    
    // ເພີ່ມຕົວແປຕ່າງໆເຂົ້າໄປ URL
    const params = new URLSearchParams();
    
    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }
    
    // เพิ่มการกรองด้วยปีการศึกษาเพื่อลดปริมาณข้อมูล
    if (currentSchoolYear.value) {
      params.append('school_year', currentSchoolYear.value);
    }
    
    // ເພີ່ມພາຣາມິເຕີ້ cache-busting ເມື່ອໃຊ້ force refresh
    if (forceRefresh) {
      params.append('_', Date.now().toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
        'Cache-Control': forceRefresh ? 'no-cache, no-store' : ''
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
        paid: reg.is_paid === true || reg.is_paid === 1 || reg.paid === true || reg.paid === 1
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
    // ไม่ดึงข้อมูลซ้ำถ้ากำลังโหลดอยู่แล้ว
    if (isLoading.value) return;
    
    isLoading.value = true;
    error.value = '';
    
    let url = `${API_URL}/students`;
    
    // เพิ่มเงื่อนไขให้ส่งคำค้นหาเมื่อมีข้อความค้นหาอย่างน้อย 2 ตัวอักษร
    if (studentSearchQuery.value && studentSearchQuery.value.length >= 2) {
      url += `?search=${encodeURIComponent(studentSearchQuery.value)}`;
    } else if (!studentSearchQuery.value) {
      // ถ้าไม่มีคำค้นหา ให้ดึงข้อมูลนักเรียนทั้งหมดโดยไม่ใส่ limit เพื่อให้แสดงข้อมูลครบถ้วน
      // แต่จำกัดจำนวนที่ API ส่งกลับมาที่ 50 รายการ
      url += `?limit=50`; // จำกัดจำนวนนักเรียนที่แสดง
    } else {
      // ถ้ามีคำค้นหาแต่น้อยกว่า 2 ตัว ไม่ต้องค้นหา
      studentTableData.value = [];
      isLoading.value = false;
      return;
    }
    
    console.log('Fetching students with URL:', url);
    
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
      console.log('Student data received:', response.data.data);
      
      // ປັບຮູບແບບຂໍ້ມູນໃຫ້ຕົງກັບໂຄງສ້າງທີ່ໃຊ້ສະແດງຜົນ
      let formattedData = [];
      
      // ตรวจสอบว่า response.data.data มีข้อมูลนักเรียนในรูปแบบที่ถูกต้องหรือไม่
      if (response.data.data.students && Array.isArray(response.data.data.students)) {
        formattedData = response.data.data.students.map(student => ({
          studentId: student.student_id,
          studentName: student.student_name_lao,
          studentPhone: student.guardian_phone || student.phone_number || ''
        }));
      } else if (Array.isArray(response.data.data)) {
        // กรณีที่ API ส่งข้อมูลมาในรูปแบบอาร์เรย์โดยตรง
        formattedData = response.data.data.map(student => ({
          studentId: student.student_id,
          studentName: student.student_name_lao,
          studentPhone: student.guardian_phone || student.phone_number || ''
        }));
      }
      
      console.log('Formatted student data:', formattedData);
      
      // ดึงข้อมูลการลงทะเบียนเพื่อกรองนักเรียนที่ลงทะเบียนแล้ว เฉพาะเมื่อมีปีการศึกษาปัจจุบัน
      if (currentSchoolYear.value && formattedData.length > 0) {
        try {
          const regResponse = await axios.get(`${API_URL}/registrations?school_year=${currentSchoolYear.value}`, {
            headers: {
              Authorization: `Bearer ${authStore.user?.token}`
            }
          });
          
          if (regResponse.data.success) {
            // สร้างรายชื่อรหัสนักเรียนที่ลงทะเบียนแล้วในปีการศึกษาปัจจุบัน
            let registeredStudentIds = [];
            
            if (regResponse.data.data.registrations && Array.isArray(regResponse.data.data.registrations)) {
              registeredStudentIds = regResponse.data.data.registrations.map(reg => reg.student_id);
            } else if (Array.isArray(regResponse.data.data)) {
              registeredStudentIds = regResponse.data.data.map(reg => reg.student_id);
            }
            
            // กรองนักเรียนที่ยังไม่ได้ลงทะเบียนในปีการศึกษาปัจจุบัน
            const filteredData = formattedData.filter(student => 
              !registeredStudentIds.includes(student.studentId)
            );
            
            studentTableData.value = filteredData;
          } else {
            studentTableData.value = formattedData;
          }
        } catch (err) {
          console.error('Error filtering registered students:', err);
          studentTableData.value = formattedData;
        }
      } else {
        studentTableData.value = formattedData;
      }
    } else {
      console.error('API returned success=false:', response.data);
      studentTableData.value = [];
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

// ບັນທຶກການລົງທະບຽນ - ปรับปรุงประสิทธิภาพ
const saveRegistration = async () => {
  if (!validateForm()) return;
  
  // ป้องกันการกดปุ่มบันทึกซ้ำระหว่างกำลังประมวลผล
  if (isLoading.value) return;
  
  try {
    isLoading.value = true;
    error.value = '';
    apiError.value = '';
    
    // ใช้ระดับชั้นที่ดึงมาจากข้อมูลห้องเรียนแทนการคำนวณเอง
    console.log('กำลังลงทะเบียน:', {
      student_id: currentStudentId.value,
      student_name: currentStudentName.value,
      student_phone: currentStudentPhone.value,
      classroom: currentClassName.value,
      level: currentClassLevel.value, // ใช้ค่าจากตัวแปรที่เก็บระดับชั้น
      school_year: currentSchoolYear.value
    });
    
    // ดึงข้อมูลค่าเล่าเรียนตามระดับชั้นและปีการศึกษา
    let tuitionFee = 0;
    try {
      // ตรวจสอบว่ามีข้อมูลหรือไม่เพื่อป้องกันการเรียก API โดยไม่จำเป็น
      if (currentClassLevel.value && currentSchoolYear.value) {
        const tuitionResponse = await axios.get(`${API_URL}/tuitions`, {
          headers: {
            Authorization: `Bearer ${authStore.user?.token}`
          }
        });
        
        if (tuitionResponse.data.success) {
          // ค้นหาค่าเล่าเรียนตามระดับชั้นและปีการศึกษา
          const matchingTuition = tuitionResponse.data.data.find((t) => 
            t.level === currentClassLevel.value && 
            t.year === currentSchoolYear.value
          );
          
          if (matchingTuition) {
            tuitionFee = matchingTuition.amount;
          } else {
            console.warn('ไม่พบข้อมูลค่าเล่าเรียนสำหรับระดับชั้นและปีการศึกษานี้');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching tuition info:', err);
      // ไม่ throw error เพื่อให้สามารถบันทึกต่อได้แม้จะไม่พบข้อมูลค่าเล่าเรียน
    }
    
    // สร้างข้อมูลการลงทะเบียนใหม่
    const registrationData = {
      student_id: currentStudentId.value,
      student_name: currentStudentName.value,
      student_phone: currentStudentPhone.value,
      classroom: currentClassName.value,
      level: currentClassLevel.value,
      school_year: currentSchoolYear.value,
      paid: false,
      tuition_fee: tuitionFee,
      invoice_id: currentRegistrationId.value,
      registration_date: new Date().toISOString().split('T')[0]
    };
    
    // ส่งข้อมูลไปยัง API
    const response = await axios.post(`${API_URL}/registrations`, registrationData, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.error("API Error:", error.response?.data || error.message);
      throw error;
    });
    
    if (response.data.success) {
      // อัปเดตข้อมูลใบเสร็จตามการลงทะเบียน
      const newRegistration = {
        id: response.data.data.id || registrationData.invoice_id,
        registrationDate: registrationData.registration_date,
        studentId: registrationData.student_id,
        studentName: registrationData.student_name,
        studentPhone: registrationData.student_phone,
        classroom: registrationData.classroom,
        level: registrationData.level,
        schoolYear: registrationData.school_year,
        paid: false
      };
      
      // เพิ่มข้อมูลลงทะเบียนใหม่ที่ด้านหน้าของอาร์เรย์
      registrations.value = [newRegistration, ...registrations.value];
      
      // ล้างฟอร์มหลังจากบันทึก
      clearForm();
      
      alert('บันทึกการลงทะเบียนสำเร็จ');
    } else {
      apiError.value = response.data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน';
      alert(apiError.value);
    }
  } catch (err) {
    console.error("Error in registration:", err);
    const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน';
    apiError.value = errorMessage;
    error.value = errorMessage;
    alert(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// เลือกการลงทะเบียน - ปรับปรุงประสิทธิภาพ
const selectRegistration = async (registrationId) => {
  try {
    // ป้องกันการคลิกซ้ำระหว่างกำลังโหลดข้อมูล
    if (isLoading.value) return;
    
    isLoading.value = true;
    
    // ลองหาข้อมูลจากอาร์เรย์ที่มีอยู่แล้วก่อน เพื่อลดการเรียก API
    const existingReg = registrations.value.find(reg => reg.id === registrationId);
    
    if (existingReg) {
      // ใช้ข้อมูลที่มีอยู่แล้ว
      currentRegistrationId.value = existingReg.id;
      currentStudentId.value = existingReg.studentId;
      currentStudentName.value = existingReg.studentName;
      currentStudentPhone.value = existingReg.studentPhone;
      currentClassName.value = existingReg.classroom;
      currentClassLevel.value = existingReg.level;
      currentSchoolYear.value = existingReg.schoolYear;
      isLoading.value = false;
      return;
    }
    
    // ถ้าไม่พบในอาร์เรย์ให้เรียก API
    const response = await axios.get(`${API_URL}/registrations/${registrationId}`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`
      }
    });
    
    if (response.data.success && response.data.data) {
      const registration = response.data.data;
      
      // อัปเดตข้อมูลใบเสร็จตามการลงทะเบียน
      currentRegistrationId.value = registration.invoice_id || registration.id;
      currentStudentId.value = registration.student_id;
      currentStudentName.value = registration.student_name;
      currentStudentPhone.value = registration.student_phone;
      currentClassName.value = registration.classroom;
      currentClassLevel.value = registration.level;
      currentSchoolYear.value = registration.school_year;
    } else {
      throw new Error('ไม่พบข้อมูลการลงทะเบียน');
    }
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลการลงทะเบียน:', err);
    error.value = 'ไม่สามารถโหลดข้อมูลการลงทะเบียนได้';
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

// ເພີ່ມฟังก์ชันสำหรับปิด dropdown เมื่อคลิกนอกพื้นที่ dropdown
const closeDropdowns = (event) => {
  // ตรวจสอบว่ามีการคลิกนอกพื้นที่ dropdown หรือไม่
  const schoolYearDropdown = document.getElementById('school-year-dropdown');
  const classroomDropdown = document.getElementById('classroom-dropdown');
  const schoolYearButton = document.getElementById('school-year-button');
  const classroomButton = document.getElementById('classroom-button');
  
  // ถ้าคลิกนอกพื้นที่ dropdown และปุ่มที่เปิด dropdown ให้ปิด dropdown
  if (showSchoolYearDialog.value && 
      schoolYearDropdown && 
      !schoolYearDropdown.contains(event.target) && 
      schoolYearButton && 
      !schoolYearButton.contains(event.target)) {
    showSchoolYearDialog.value = false;
  }
  
  if (showClassroomDialog.value && 
      classroomDropdown && 
      !classroomDropdown.contains(event.target) && 
      classroomButton && 
      !classroomButton.contains(event.target)) {
    showClassroomDialog.value = false;
  }
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
    
    // ຕັ້ງຄ່າປີການສຶກສາປັດຈຸບັນ (ຈະໃຊ້ເປັນຄ່າເຣິ່ມຕ້ນຖ້າບໍ່ສາມາດດຶງຂໍ້ມູນຈາກ API)
    if (!currentSchoolYear.value) {
      const currentYear = new Date().getFullYear();
      currentSchoolYear.value = `${currentYear}-${currentYear + 1}`;
    }
    
    // ດຶງຂໍ້ມູນການລົງທະບຽນແລະນັກຮຽນ - ปรับลำดับการเรียกใช้
    fetchRegistrations();
    
    // ดึงข้อมูลนักเรียนหลังจากเตรียมข้อมูลส่วนอื่นแล้ว
    // รอสักครู่เพื่อให้ระบบโหลดข้อมูลอื่นก่อน
    setTimeout(() => {
      searchStudents(); // เรียกใช้โดยไม่ต้องมี query เพื่อดึงข้อมูลทั้งหมด
    }, 500);
    
    // ตรวจสอบการอัปเดตล่าสุดจากหน้า Payment
    checkLatestPaymentUpdates();
    
    // เพิ่ม event listener สำหรับการปิด dropdown เมื่อคลิกนอกพื้นที่
    document.addEventListener('click', closeDropdowns);
  } else {
    error.value = 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນໃຊ້ງານ';
  }
  
  // ลบ Event Listener เมื่อ component ถูกทำลาย
  onUnmounted(() => {
    document.removeEventListener('click', closeDropdowns);
  });
});

// ปรับปรุงฟังก์ชันสำหรับตรวจสอบการอัปเดตล่าสุดจากหน้า Payment
const checkLatestPaymentUpdates = () => {
  try {
    const lastUpdate = localStorage.getItem('last_payment_update');
    if (lastUpdate) {
      const updateTime = parseInt(lastUpdate);
      const currentTime = Date.now();
      const timeDiff = currentTime - updateTime;
      
      // ถ้ามีการอัปเดตภายใน 5 นาที ให้โหลดข้อมูลใหม่
      if (timeDiff < 300000) { // เพิ่มเวลาเป็น 5 นาที (300000ms)
        console.log('พบการอัปเดตการชำระเงินล่าสุด โหลดข้อมูลใหม่...');
        fetchRegistrations(true); // บังคับโหลดข้อมูลใหม่
        localStorage.removeItem('last_payment_update'); // ลบข้อมูลการอัปเดตเพื่อไม่ให้โหลดซ้ำ
      }
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตรวจสอบการอัปเดตล่าสุด:', error);
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับรีเฟรชข้อมูลทั้งหมด (แทนการอัพเดทอัตโนมัติทุก 5 วินาที)
const refreshData = async () => {
  if (isLoading.value) return;
  
  try {
    isLoading.value = true;
    
    // ดึงข้อมูลการลงทะเบียน
    await fetchRegistrations(true);
    
    // ตรวจสอบการอัปเดตล่าสุดจากหน้า Payment
    checkLatestPaymentUpdates();
    
    // ดึงข้อมูลนักเรียนใหม่ถ้ามีการค้นหา
    if (studentSearchQuery.value) {
      await searchStudents();
    }
  } catch (err) {
    console.error('Error refreshing data:', err);
  } finally {
    isLoading.value = false;
  }
};

// เพิ่มฟังก์ชันสำหรับการอัปเดตสถานะการชำระเงิน
const updatePaymentStatus = async (registrationId, isPaid) => {
  try {
    isLoading.value = true;
    error.value = '';
    apiError.value = '';
    
    // ลองใช้หลาย endpoint เพื่อให้แน่ใจว่าอัปเดตสำเร็จ
    let updateSuccess = false;
    
    // ลองใช้ endpoint แรก
    try {
      const response = await axios.patch(`${API_URL}/students/registrations/${registrationId}/payment-status`, 
        { isPaid },
        {
          headers: {
            Authorization: `Bearer ${authStore.user?.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        updateSuccess = true;
      }
    } catch (err) {
      console.log('ไม่สามารถอัปเดตผ่าน endpoint แรกได้');
    }
    
    // ลองใช้ endpoint ที่สอง
    if (!updateSuccess) {
      try {
        const response = await axios.patch(`${API_URL}/registrations/${registrationId}/payment-status`, 
          { is_paid: isPaid },
          {
            headers: {
              Authorization: `Bearer ${authStore.user?.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          updateSuccess = true;
        }
      } catch (err) {
        console.log('ไม่สามารถอัปเดตผ่าน endpoint ที่สองได้');
      }
    }
    
    // ลองใช้ endpoint ที่สาม
    if (!updateSuccess) {
      try {
        const response = await axios.put(`${API_URL}/registrations/${registrationId}`, 
          { is_paid: isPaid },
          {
            headers: {
              Authorization: `Bearer ${authStore.user?.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          updateSuccess = true;
        }
      } catch (err) {
        console.log('ไม่สามารถอัปเดตผ่าน endpoint ที่สามได้');
      }
    }
    
    // อัปเดตข้อมูลใหม่หลังจากเรียกทุก endpoint
    await fetchRegistrations(true);
    
    if (updateSuccess) {
      return true;
    } else {
      apiError.value = 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະການຊຳລະເງິນ';
      return false;
    }
  } catch (err) {
    console.error("Error updating payment status:", err);
    const errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະການຊຳລະເງິນ';
    apiError.value = errorMessage;
    error.value = errorMessage;
    return false;
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນປີການສຶກສາ
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
      schoolYears.value = response.data.data.map(year => ({
        id: year.id,
        period: year.period,
        is_current: year.is_current
      }));
      
      // ຕັ້ງຄ່າປີການສຶກສາປັດຈຸບັນ
      const currentYear = schoolYears.value.find(year => year.is_current);
      if (currentYear) {
        currentSchoolYear.value = currentYear.period;
        currentSchoolYearId.value = currentYear.id;
      }
    }
  } catch (err) {
    console.error('Error fetching school years:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສົກຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນລະດັບຊັ້ນ
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
      levels.value = response.data.data;
    }
  } catch (err) {
    console.error('Error fetching levels:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລະດັບຊັ້ນ';
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນຫ້ອງຮຽນ
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
      classroomData.value = response.data.data.map(classroom => ({
        id: classroom.id,
        name: classroom.name,
        level: classroom.level
      }));
    }
  } catch (err) {
    console.error('Error fetching classrooms:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນຫ້ອງຮຽນຕາມຊື່
const fetchClassInfo = async (className) => {
  try {
    isLoading.value = true;
    error.value = '';
    
    // ຊອກຫາຂໍ້ມູນຫ້ອງຮຽນຈາກຂໍ້ມູນທີ່ມີຢູ່ແລ້ວ
    const existingClass = classroomData.value.find(c => c.name === className);
    if (existingClass) {
      currentClassLevel.value = existingClass.level;
      currentClassId.value = existingClass.id;
      isLoading.value = false;
      return;
    }
    
    // ຖ້າບໍ່ພົບ ໃຫ້ດຶງຂໍ້ມູນຈາກ API
    const response = await axios.get(`${API_URL}/classes?name=${encodeURIComponent(className)}`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`
      }
    });
    
    if (response.data.success && response.data.data.length > 0) {
      const classroom = response.data.data[0];
      currentClassLevel.value = classroom.level;
      currentClassId.value = classroom.id;
    } else {
      currentClassLevel.value = '';
      currentClassId.value = '';
    }
  } catch (err) {
    console.error('Error fetching class info:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລະດັບຊັ້ນຂອງຫ້ອງຮຽນ';
  } finally {
    isLoading.value = false;
  }
};

// ເປີດກອງຂໍ້ມູນເລືອກສົກຮຽນ
const openSchoolYearDialog = (event) => {
  event.stopPropagation();
  showSchoolYearDialog.value = !showSchoolYearDialog.value;
  showClassroomDialog.value = false; // ປິດກອງຂໍ້ມູນເລືອກຫ້ອງຮຽນ
};

// ເປີດກອງຂໍ້ມູນເລືອກຫ້ອງຮຽນ
const openClassroomDialog = (event) => {
  event.stopPropagation();
  showClassroomDialog.value = !showClassroomDialog.value;
  showSchoolYearDialog.value = false; // ປິດກອງຂໍ້ມູນເລືອກສົກຮຽນ
};

// ເລືອກສົກຮຽນ
const selectSchoolYear = (year) => {
  currentSchoolYear.value = year.period;
  currentSchoolYearId.value = year.id;
  showSchoolYearDialog.value = false;
};

// ເລືອກຫ້ອງຮຽນ
const selectClassroom = (classroom) => {
  currentClassName.value = classroom.name;
  currentClassId.value = classroom.id;
  currentClassLevel.value = classroom.level;
  showClassroomDialog.value = false;
};

// ຈັດການການຄົ້ນຫານັກຮຽນ
const handleStudentSearch = () => {
  // ຊອກຫານັກຮຽນເມື່ອພິມມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ ຫຼື ເມື່ອລຶບໝົດ
  if (studentSearchQuery.value.length >= 2 || studentSearchQuery.value === '') {
    searchStudents();
  }
};

// ຈັດການການຄົ້ນຫາການລົງທະບຽນ
const handleRegistrationSearch = () => {
  // ຊອກຫາການລົງທະບຽນເມື່ອພິມມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ ຫຼື ເມື່ອລຶບໝົດ
  if (searchQuery.value.length >= 2 || searchQuery.value === '') {
    fetchRegistrations(true);
  }
};
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

    <!-- ສ່ວນແສດງປີການສຶກສາ -->
    <div class="flex items-center mb-4 justify-end relative">
      <div class="w-28">ສົກຮຽນ</div>
      <div class="w-16 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentSchoolYearId" placeholder="001" />
      </div>
      <div class="w-56 mr-2 relative">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentSchoolYear" readonly />
        <button 
          id="school-year-button"
          class="absolute right-0 top-0 h-full px-2 bg-white border-l hover:bg-gray-100" 
          @click="openSchoolYearDialog($event)"
        >▼</button>
        
        <!-- Dropdown ເລືອກປີການສຶກສາ -->
        <div 
          v-if="showSchoolYearDialog" 
          id="school-year-dropdown"
          class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <div class="p-2">
            <button 
              v-for="year in schoolYears" 
              :key="year.id"
              @click="selectSchoolYear(year)"
              class="w-full px-2 py-1 text-left rounded hover:bg-gray-100 flex justify-between items-center mb-1"
            >
              <span>{{ year.period }}</span>
              <span v-if="year.is_current" class="ml-2 text-xs bg-green-500 text-white px-1 py-0.5 rounded">ປັດຈຸບັນ</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ສ່ວນແສດງຫ້ອງຮຽນ -->
    <div class="flex items-center mb-4 justify-end relative">
      <div class="w-28">ຫ້ອງຮຽນ</div>
      <div class="w-16 mr-4">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentClassId" placeholder="001" />
      </div>
      <div class="w-56 mr-2 relative">
        <input type="text" class="w-full px-2 py-1 border rounded bg-white" v-model="currentClassName" readonly />
        <button 
          id="classroom-button"
          class="absolute right-0 top-0 h-full px-2 bg-white border-l hover:bg-gray-100" 
          @click="openClassroomDialog($event)"
        >▼</button>
        
        <!-- Dropdown ເລືອກຫ້ອງຮຽນ -->
        <div 
          v-if="showClassroomDialog" 
          id="classroom-dropdown"
          class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <div class="p-2">
            <button 
              v-for="classItem in classroomData" 
              :key="classItem.id"
              @click="selectClassroom(classItem)"
              class="w-full px-2 py-1 text-left rounded hover:bg-gray-100 grid grid-cols-3 mb-1"
            >
              <div>{{ classItem.id }}</div>
              <div class="col-span-1">{{ classItem.name }}</div>
              <div>{{ classItem.level }}</div>
            </button>
          </div>
        </div>
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
        <button 
          @click="refreshData" 
          class="ml-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="isLoading"
        >
          <span v-if="isLoading">⟳ ກຳລັງໂຫລດ...</span>
          <span v-else>⟳ ລີເຟຣຊ</span>
        </button>
      </div>
      <div class="grid grid-cols-9 bg-gray-400 p-2 text-sm">
        <div>ລະຫັດລົງທະບຽນ</div>
        <div>ວັນທີລົງທະບຽນ</div>
        <div>ລະຫັດນັກຮຽນ</div>
        <div>ຊື່ນັກຮຽນ(La)</div>
        <div>ເບີໂທຜູ້ປົກຄອງ</div>
        <div>ຫ້ອງຮຽນ</div>
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
          class="grid grid-cols-9 p-1 border-b hover:bg-gray-100 cursor-pointer"
          @click="selectRegistration(reg.id)"
        >
          <div>{{ reg.id }}</div>
          <div>{{ formatDate(reg.registrationDate) }}</div>
          <div>{{ reg.studentId }}</div>
          <div>{{ reg.studentName }}</div>
          <div>{{ reg.studentPhone }}</div>
          <div>{{ reg.classroom }}</div>
          <div>{{ reg.level }}</div>
          <div>{{ reg.schoolYear }}</div>
          <div :class="reg.paid ? 'text-green-600 font-bold' : 'text-red-600'">
            {{ reg.paid ? 'ຈ່າຍແລ້ວ' : 'ຍັງບໍ່ຈ່າຍ' }}
          </div>
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
  </div>
</template> 