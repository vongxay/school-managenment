<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
// ຂໍ້ມູນການລົງທະບຽນ
const registrations = ref([]);
const studentTableData = ref([]);

// ຂໍ້ມູນປີການສຶກສາແລະລະດັບຊັ້ນ
const schoolYears = ref([]);
const levels = ref([]);
const classroomData = ref([]); // holds array of objects { id, name, level } for dialog

// URL ຂອງ API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ຕົວແປສະຖານະ
const isLoading = ref(false);
const error = ref("");
const apiError = ref(""); // ຂໍ້ຜິດພາດຈາກ API
const currentRegistrationId = ref("");
const currentSchoolYear = ref("");
const currentSchoolYearId = ref(""); // ຕົວແປເກັບລະຫັດສົກຮຽນ
const currentClassId = ref("");
const currentStudentId = ref("");
const currentStudentName = ref("");
const currentStudentPhone = ref("");
const currentClassName = ref("");
const currentClassLevel = ref(""); // ເພີ່ມຕົວແປເກັບລະດັບຊັ້ນຂອງຫ້ອງຮຽນ
const currentClassLevelId = ref(""); // ເພີ່ມຕົວແປເກັບລະຫັດລະດັບຊັ້ນຂອງຫ້ອງຮຽນ

const reportFile = ref({
  id: "",
  studentId: "",
  name: "",
  phone: "",
  classroom: "",
  level: "",
  schoolYear: "",
  paid: false,
  date: "",
  tuition_fee: 0, // เพิ่มฟิลด์เก็บค่าเรียน
});

const searchQuery = ref("");
const studentSearchQuery = ref("");
const isAuthenticated = ref(false);
const token = ref("");
const showClassroomDialog = ref(false);
const showSchoolYearDialog = ref(false);

// ກອງຂໍ້ມູນນັກຮຽນສຳລັບສະແດງໃນຕາຕະລາງ
const filteredStudents = computed(() => {
  if (!studentSearchQuery.value) {
    return studentTableData.value;
  }

  const query = studentSearchQuery.value.toLowerCase();
  return studentTableData.value.filter(
    (student) =>
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
  const filtered = registrations.value.filter(
    (reg) =>
      (reg.studentName?.toLowerCase() || "").includes(query) ||
      (reg.studentId?.toLowerCase() || "").includes(query) ||
      reg.id.toLowerCase().includes(query)
  );

  return filtered.slice(0, 10).reverse();
});

// ເພີ່ມຟັງຊັນแปลงรูปแบบวันที่
const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // ถ้าแปลงไม่ได้ให้แสดงเป็นข้อความเดิม
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// ດຶງຂໍ້ມູນການລົງທະບຽນທັງໝົດ
const fetchRegistrations = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    // ຖ້າບໍ່ມີການຄົ້ນຫາ ໃຫ້ດຶງຂໍ້ມູນທັງໝົດ
    let url = `${API_URL}/registrations`;
    if (searchQuery.value) {
      url += `?search=${encodeURIComponent(searchQuery.value)}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
      },
    });

    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນໃຫ້ຕົງກັບໂຄງສ້າງທີ່ໃຊ້ສະແດງຜົນ
      const formattedData = response.data.data.registrations.map((reg) => ({
        id: reg.id || reg.invoice_id,
        registrationDate: reg.registration_date,
        studentId: reg.student_id,
        studentName: reg.student_name || "",
        studentPhone: reg.student_phone || "",
        classroom: reg.classroom || "",
        level: reg.level || "",
        schoolYear: reg.school_year || "",
        paid: reg.paid === 1 ? true : false, // ແກ້ໄຂໃຫ້ຕົວແປ paid ມີຄ່າ boolean ເທົ່ານັ້ນ
        tuition_fee: reg.tuition_fee || 0, // เพิ่มการเก็บค่าเรียน
      }));

      // ກຳນົດຂໍ້ມູນໃຫ້ກັບອາເຣເທີ່ໃຊ້ສະແດງຜົນ
      registrations.value = formattedData;
      generateNewRegistrationId();
    }
  } catch (err) {
    console.error("Error fetching registrations:", err);
    error.value =
      err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການລົງທະບຽນ";
  } finally {
    isLoading.value = false;
  }
};

// ຄົ້ນຫານັກຮຽນ
const searchStudents = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    let url = `${API_URL}/students`;
    if (studentSearchQuery.value) {
      url += `?search=${encodeURIComponent(studentSearchQuery.value)}`;
    }

    const response = await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${authStore.user?.token}`,
          "Content-Type": "application/json",
        },
      })
      .catch((error) => {
        console.error(
          "Search API Error:",
          error.response?.data || error.message
        );
        throw error;
      });

    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນໃຫ້ຕົງກັບໂຄງສ້າງທີ່ໃຊ້ສະແດງຜົນ
      const formattedData = response.data.data.students.map((student) => ({
        studentId: student.student_id,
        studentName: student.student_name_lao,
        studentPhone: student.guardian_phone || student.phone_number || "",
      }));

      // ດຶງຂໍ້ມູນການລົງທະບຽນເພື່ອກອງນັກຮຽນທີ່ລົງທະບຽນແລ້ວ
      const regResponse = await axios.get(
        `${API_URL}/registrations?school_year=${currentSchoolYear.value || ""}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.user?.token}`,
          },
        }
      );

      if (regResponse.data.success) {
        // ສ້າງລາຍຊື່ລະຫັດນັກຮຽນທີ່ລົງທະບຽນແລ້ວໃນປີການສຶກສາປັດຈຸບັນ
        const registeredStudentIds = regResponse.data.data.registrations.map(
          (reg) => reg.student_id
        );

        // ກອງນັກຮຽນທີ່ຍັງບໍ່ໄດ້ລົງທະບຽນໃນປີການສຶກສາປັດຈຸບັນ
        const filteredData = formattedData.filter(
          (student) => !registeredStudentIds.includes(student.studentId)
        );

        // ກຳນົດຂໍ້ມູນໃຫ້ກັບອາເຣເທີ່ໃຊ້ສະແດງຜົນ
        studentTableData.value = filteredData;
      } else {
        // ຖ້າບໍ່ສາມາໂຫລດຂໍ້ມູນການລົງທະບຽນໄດ້ ໃຫ້ສະແດງຂໍ້ມູນນັກຮຽນທັງໝົດ
        studentTableData.value = formattedData;
      }
    }
  } catch (err) {
    console.error("Error searching students:", err);
    error.value =
      err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫານັກຮຽນ";
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
  // console.log('ກຳລັງສ້າງ ID ສໍາລັບການລົງທະບຽນ', filteredRegistrations.value);
  filteredRegistrations.value.forEach((reg, idx) => {
    const match = reg.id.match(/^INV-(\d+)$/); // <-- ตรงนี้!
    // console.log('Checking:', reg.id, 'Match:', match);
    if (match) {
      const currentId = parseInt(match[1], 10);
      if (currentId > lastId) {
        lastId = currentId;
      }
    }
  });
  const nextId = lastId + 1;

  currentRegistrationId.value = `INV-${nextId.toString().padStart(3, "0")}`;
};

// ພິມການລົງທະບຽນ
const printRegistration = () => {
  const element = document.getElementById("registration-print");
  if (!element) {
    alert("ບໍ່ພົບຂໍ້ມູນທີ່ຕ້ອງການພິມ");
    return;
  }

  const opt = {
    margin: 1,
    filename: `ການລົງທະບຽນ_${currentRegistrationId.value}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  // ສະແດງຂໍ້ຄວາມກຳລັງພິມ
  const loadingMessage = document.createElement("div");
  loadingMessage.className =
    "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50";
  loadingMessage.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-lg">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
      <p class="mt-2">ກຳລັງພິມເອກະສານ...</p>
    </div>
  `;
  document.body.appendChild(loadingMessage);

  // ເລີ່ມການພິມ PDF
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      // ລຶບຂໍ້ຄວາມກຳລັງພິມເມື່ອສຳເລັດ
      document.body.removeChild(loadingMessage);
    })
    .catch((err) => {
      console.error("Error generating PDF:", err);
      document.body.removeChild(loadingMessage);
      alert("ເກີດຂໍ້ຜິດພາດໃນການພິມເອກະສານ");
    });
};

// ກວດສອບຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ
const validateForm = () => {
  if (!currentStudentId.value) {
    alert("ກະລຸນາເລືອກນັກຮຽນກ່ອນລົງທະບຽນ");
    return false;
  }

  if (!currentStudentName.value) {
    alert("ກະລຸນາລະບຸຊື່ນັກຮຽນກ່ອນລົງທະບຽນ");
    return false;
  }

  if (!currentStudentPhone.value) {
    alert("ກະລຸນາລະບຸເບີໂທຜູ້ປົກຄອງກ່ອນລົງທະບຽນ");
    return false;
  }

  if (!currentClassName.value) {
    alert("ກະລຸນາລະບຸຫ້ອງຮຽນກ່ອນລົງທະບຽນ");
    return false;
  }

  if (!currentSchoolYear.value) {
    alert("ກະລຸນາລະບຸສົກຮຽນກ່ອນລົງທະບຽນ");
    return false;
  }

  if (!currentClassLevelId.value) {
    alert("ກະລຸນາເລືອກຫ້ອງຮຽນທີ່ມີລະດັບຊັ້ນຮຽນກຳນົດໄວ້");

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
    error.value = "";
    apiError.value = "";
    // ດຶງຂໍ້ມູນຄ່າເຣີຢນຕາມລະດັບຊັ້ນແລະປີການສຶກສາ
    let tuitionFee = 0;
    try {
      const tuitionResponse = await axios.get(`${API_URL}/tuitions`, {
        headers: {
          Authorization: `Bearer ${authStore.user?.token}`,
        },
      });
      if (tuitionResponse.data.success) {
        // ຄ້ນຫາຄ່າເຣີຢນຕາມລະດັບຊັ້ນແລະປີການສຶກສາ
        const matchingTuition = tuitionResponse.data.data.find(
          (t) =>
            t.level === currentClassLevel.value &&
            t.year === currentSchoolYear.value
        );

        if (matchingTuition) {
          tuitionFee = matchingTuition.amount;
        } else {
          console.warn("ໄມ່ພບຂ້ອມູນຄ່າເຣີຢນສຳຫຣັບລະດັບຊັ້ນແລະປີການສຶກສານີ້");
        }
      }
    } catch (err) {
      console.error("Error fetching tuition info:", err);
    }

    // ສ້າງຂໍ້ມູນການລົງທະບຽນໃໝ່ຕາມໂຄງສ້າງຖານຂໍ້ມູນ
    currentClassLevel.value = currentClassLevelId.value;
    const registrationData = {
      student_id: currentStudentId.value,
      student_name: currentStudentName.value,
      student_phone: currentStudentPhone.value,
      classroom: currentClassId.value,
      level: currentClassLevel.value, // ໃຊ້ລະຫັດລະດັບຊັ້ນແທນຊື່ລະດັບຊັ້ນ
      school_year: currentSchoolYearId.value,
      paid: false,
      registered_by: authStore.user?.id || "",
      tuition_fee: tuitionFee,
      invoice_id: currentRegistrationId.value,
      registration_date: new Date().toISOString().split("T")[0],
    };

    // ສ່ງຂໍ້ມູນໄປຍັງ API
    const response = await axios
      .post(`${API_URL}/registrations`, registrationData, {
        headers: {
          Authorization: `Bearer ${authStore.user?.token}`,
          "Content-Type": "application/json",
        },
      })
      .catch((error) => {
        console.error("API Error:", error.response?.data || error.message);
        throw error; // ສ່ງຕໍ່ຂໍ້ຜິດພາດເພື່ອໃຫ້ catch ດ້ານນອກຈັດການຕໍ່
      });

    if (response.data.success) {
      // ດຶງຂໍ້ມູນການລົງທະບຽນໃໝ່
      await fetchRegistrations();

      // ລ້າງຟອມຫຼັງຈາກບັນທຶກ
      alert("ບັນທຶກການລົງທະບຽນສຳເລັດ");
      
      searchStudents();
      clearForm();
    } else {
      apiError.value = response.data.message || "ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ";
      alert(apiError.value);
    }
  } catch (err) {
    console.error("Error in registration:", err);
    const errorMessage =
      err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ";
    apiError.value = errorMessage;
    error.value = errorMessage;
    alert(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// const messageBook = (value) => {
//   this.$Message.info({
//     content: value,
//     duration: 5,
//   });
// };
// ເພີ່ມຟັງຊັນ clearForm ສຳລັບລ້າງຂໍ້ມູນໃນຟອມ
const clearForm = () => {
  currentStudentId.value = "";
  currentStudentName.value = "";
  currentStudentPhone.value = "";
  currentClassName.value = "";
  currentClassLevel.value = ""; // ລ້າງຄ່າລະດັບຊັ້ນ

  // ສ້າງ ID ໃໝ່ສຳລັບການລົງທະບຽນຄັ້ງຕໍ່ໄປ
  generateNewRegistrationId();
};

// ຄົ້ນຫາຂໍ້ມູນເມື່ອມີການປ່ຽນແປງຄ່າໃນຊ່ອງຄົ້ນຫາ
// ປັບປຸງຟັງຊັນ handleRegistrationSearch ໃຫ້ໃຊ້ debounce
let searchTimeout = null;
const handleRegistrationSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchRegistrations();
  }, 300); // ລໍຖ້າ 300ms ຫຼັງຈາກພິມຈົບຈຶ່ງຄົ້ນຫາ
};

// ຄົ້ນຫາການລົງທະບຽນເມື່ອມີການປ່ຽນແປງຄ່າໃນຊ່ອງຄົ້ນຫາ
const handleStudentSearch = () => {
  searchStudents();
};

// ເລືອກຫ້ອງຮຽນ
const selectClassroom = (classItem) => {
  console.log("ກຳລັງເລືອກຫ້ອງຮຽນ||:", classroomData);
  currentClassId.value = classItem.id;
  currentClassName.value = classItem.name;

  const levelObj = levels.value.find((l) => l.name === classItem.level);
  if (levelObj) {
    currentClassLevelId.value = levelObj.id;
  }

  // ຊອກຫາລະຫັດລະດັບຊັ້ນຈາກຂໍ້ມູນລະດັບຊັ້ນ
  showClassroomDialog.value = false;
};

// ດຶງຂໍ້ມູນຫ້ອງຮຽນແລະລະດັບຊັ້ນທີ່ຖືກຕ້ອງ
const fetchClassInfo = async (className) => {
  try {
    isLoading.value = true;
    error.value = "";

    const response = await axios.get(`${API_URL}/classes`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
      },
    });

    if (response.data.success) {
      // ຊອກຫາຂໍ້ມູນຫ້ອງຮຽນທີ່ເລືອກ
      const classInfo = response.data.data.find((c) => c.name === className);
      if (classInfo) {
        // ຕັ້ງຄ່າລະດັບຊັ້ນຕາມຂໍ້ມູນຈາກຖານຂໍ້ມູນ
        currentClassLevel.value = classInfo.level;
        currentClassId.value = classInfo.id;
      } else {
        // ຖ້າບໍ່ພົບຂໍ້ມູນຫ້ອງຮຽນ ໃຫ້ໃຊ້ວິທີຄຳນວນເດີມ
        if (className.includes("/")) {
          const grade = className.split("/")[0].trim();
          if (grade.startsWith("ມ ")) {
            const gradeNumber = grade.substring(2);
            currentClassId.value = gradeNumber;

            // ຊອກຫາລະດັບຊັ້ນໃນຂໍ້ມູນທີ່ດຶງມາຈາກຖານຂໍ້ມູນ
            const levelObj = levels.value.find(
              (l) => l.name === `ຊັ້ນ ມ ${gradeNumber}`
            );
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
    console.error("Error fetching class info:", err);
    error.value =
      err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ";
  } finally {
    isLoading.value = false;
  }
};

// ເປີດໜ້າຕ່າງເລືອກຫ້ອງຮຽນ
const openClassroomDialog = (event) => {
  // ດຶງຂໍ້ມູນຫ້ອງຮຽນກ່ອນເປີດ dialog
  fetchClasses();
  // ປິດ dropdown ປີການສຶກສາຖ້າກຳລັງເປີດຢູ່
  showSchoolYearDialog.value = false;
  // ສະຫຼັບສະຖານະການສະແດງ dropdown ຫ້ອງຮຽນ
  showClassroomDialog.value = !showClassroomDialog.value;
  // ປ້ອງກັນການ bubble ຂອງອີເວນຄລິກ
  if (event) event.stopPropagation();
};

// ດຶງຂໍ້ມູນຫ້ອງຮຽນທັງໝົດ
const fetchClasses = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    const response = await axios.get(`${API_URL}/classes`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
      },
    });

    if (response.data.success) {
      // ປັບໃຫ້ເກັບຂໍ້ມູນເປັນ object ໂດຍກົງສຳລັບ dialog
      classroomData.value = response.data.data.map((cls) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
      }));
    }
  } catch (err) {
    console.error("Error fetching classes:", err);
    error.value =
      err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ";
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນປີການສຶກສາທັງໝົດ
const fetchSchoolYears = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    const response = await axios.get(`${API_URL}/years`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
      },
    });

    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນປີການສຶກສາ
      schoolYears.value = response.data.data.map((year) => ({
        id: year.id,
        period: year.period || year.name,
        is_current: year.is_current || false,
      }));

      // ຕັ້ງຄ່າປີການສຶກສາປັດຈຸບັນຖ້າມີຂໍ້ມູນ
      if (schoolYears.value.length > 0 && !currentSchoolYear.value) {
        // ຫາປີການສຶກສາທີ່ເປັນປັດຈຸບັນ
        const currentYear = schoolYears.value.find((year) => year.is_current);
        if (currentYear) {
          currentSchoolYear.value = currentYear.period;
          currentSchoolYearId.value = currentYear.id;
        } else {
          // ໃຊ້ປີການສຶກສາທຳອິດໃນລາຍການ
          currentSchoolYear.value = schoolYears.value[0].period;
          currentSchoolYearId.value = schoolYears.value[0].id;
        }
      }
    }
  } catch (err) {
    console.error("Error fetching school years:", err);
    error.value =
      err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປີການສຶກສາ";
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນລະດັບຊັ້ນທັງໝົດ
const fetchLevels = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    const response = await axios.get(`${API_URL}/levels`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
      },
    });

    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນລະດັບຊັ້ນ
      levels.value = response.data.data.map((level) => ({
        id: level.id,
        name: level.name,
      }));
    }
  } catch (err) {
    console.error("Error fetching levels:", err);
    error.value =
      err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລະດັບຊັ້ນ";
  } finally {
    isLoading.value = false;
  }
};

// ເລືອກປີການສຶກສາ
const selectSchoolYear = (year) => {
  currentSchoolYear.value = year.period;
  currentSchoolYearId.value = year.id;
  showSchoolYearDialog.value = false;
};

// ເປີດໜ້າຕ່າງເລືອກປີການສຶກສາ
const openSchoolYearDialog = (event) => {
  // ປິດ dropdown ຫ້ອງຮຽນຖ້າກຳລັງເປີດຢູ່
  showClassroomDialog.value = false;
  // ສະຫຼັບສະຖານະການສະແດງ dropdown ປີການສຶກສາ
  showSchoolYearDialog.value = !showSchoolYearDialog.value;
  // ປ້ອງກັນການ bubble ຂອງອີເວນຄລິກ
  if (event) event.stopPropagation();
};

// ເລືອກການລົງທະບຽນ
const selectRegistration = async (registrationId) => {
  console.log("ກຳລັງເລືອກການລົງທະບຽນ11:", registrationId);
  
  // เก็บข้อมูลพื้นฐานก่อน
  reportFile.value = {
    id: registrationId.id,
    studentId: registrationId.studentId, // ใช้ key ให้ตรงกับ ref
    name: registrationId.studentName, // ใช้ key name
    phone: registrationId.studentPhone, // ใช้ key phone
    classroom: registrationId.classroom,
    level: registrationId.level,
    schoolYear: registrationId.schoolYear,
    paid: registrationId.paid || false,
    date: registrationId.registrationDate,
    tuition_fee: registrationId.tuition_fee || 0, // เก็บค่าเรียนจากข้อมูลการลงทะเบียน
  };
  
  // ถ้าค่าเรียนเป็น 0 ให้ดึงข้อมูลค่าเรียนจาก API
  if (!reportFile.value.tuition_fee || reportFile.value.tuition_fee === 0) {
    try {
      isLoading.value = true;
      const tuitionResponse = await axios.get(`${API_URL}/tuitions`, {
        headers: {
          Authorization: `Bearer ${authStore.user?.token}`,
        },
      });
      
      if (tuitionResponse.data.success) {
        // ค้นหาค่าเรียนตามระดับชั้นและปีการศึกษา
        const matchingTuition = tuitionResponse.data.data.find(
          (t) => 
            t.level === reportFile.value.level && 
            t.year === reportFile.value.schoolYear
        );
        
        if (matchingTuition) {
          // ถ้าพบข้อมูลค่าเรียนที่ตรงกัน
          reportFile.value.tuition_fee = matchingTuition.amount;
          console.log("พบข้อมูลค่าเรียน:", matchingTuition.amount);
        } else {
          console.log("ไม่พบข้อมูลค่าเรียนที่ตรงกับระดับชั้นและปีการศึกษา");
        }
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลค่าเรียน:", error);
    } finally {
      isLoading.value = false;
    }
  }
  
  console.log("ກຳລັງເລືອກການລົງທະບຽນ22:", reportFile.value);
};

const creaReport = async () => {
  reportFile.value = {
    id: "",
    studentId: "", // ใช้ key ให้ตรงกับ ref
    name: "", // ใช้ key name
    phone: "", // ใช้ key phone
    classroom: "",
    level: "",
    schoolYear: "",
    paid: false,
    date: "",
    tuition_fee: 0, // รีเซ็ตค่าเรียน
  };
};
// ເພີ່ມຟັງຊັນສຳລັບປິດ dropdown ເມື່ອຄລິກນອກພື້ນທີ່ dropdown
const closeDropdowns = (event) => {
  // ກວດສອບວ່າມີການຄລິກນອກພື້ນທີ່ dropdown ຫຼືບໍ່
  const schoolYearDropdown = document.getElementById("school-year-dropdown");
  const classroomDropdown = document.getElementById("classroom-dropdown");
  const schoolYearButton = document.getElementById("school-year-button");
  const classroomButton = document.getElementById("classroom-button");

  // ຖ້າຄລິກນອກພື້ນທີ່ dropdown ແລະປຸ່ມທີ່ເປີດ dropdown ໃຫ້ປິດ dropdown
  if (
    showSchoolYearDialog.value &&
    schoolYearDropdown &&
    !schoolYearDropdown.contains(event.target) &&
    schoolYearButton &&
    !schoolYearButton.contains(event.target)
  ) {
    showSchoolYearDialog.value = false;
  }

  if (
    showClassroomDialog.value &&
    classroomDropdown &&
    !classroomDropdown.contains(event.target) &&
    classroomButton &&
    !classroomButton.contains(event.target)
  ) {
    showClassroomDialog.value = false;
  }
};

// ເມື່ອຄອມໂພເນນໂຫລດ
onMounted(() => {
  // ກວດສອບການເຂົ້າສູ່ລະບົບຈາກ authStore
  if (authStore.isAuthenticated) {
    isAuthenticated.value = true;
    token.value = authStore.user?.token || "";

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

    // ຕັ້ງ interval ສຳລັບການອັບເດດຂໍ້ມູນອັດຕະໂນມັດທຸກໆ 30 ວິນາທີ
    const refreshInterval = setInterval(() => {
      if (authStore.isAuthenticated) {
        fetchRegistrations();
      }
    }, 60*1000);

    // ເກັບ interval ໄວ້ໃນຕົວແປເພື່ອລຶບເມື່ອຄອມໂພເນນຖືກທຳລາຍ
    onUnmounted(() => {
      clearInterval(refreshInterval);
      document.removeEventListener("click", closeDropdowns);
    });
  } else {
    error.value = "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນໃຊ້ງານ";
  }
});

// ເພີ່ມຟັງຊັນໃໝ່ສຳລັບການອັບເດດສະຖານະການຊຳລະເງິນ
const updatePaymentStatus = async (registrationId, isPaid) => {
  try {
    isLoading.value = true;
    error.value = "";
    apiError.value = "";

    const response = await axios.patch(
      `${API_URL}/students/registrations/${registrationId}/payment-status`,
      { isPaid },
      {
        headers: {
          Authorization: `Bearer ${authStore.user?.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      // ອັບເດດຂໍ້ມູນໃໝ່ຫຼັງຈາກເຮັດລາຍການສຳເລັດ
      await fetchRegistrations();
      return true;
    } else {
      apiError.value =
        response.data.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະການຊຳລະເງິນ";
      return false;
    }
  } catch (err) {
    console.error("Error updating payment status:", err);
    const errorMessage =
      err.response?.data?.message ||
      "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະການຊຳລະເງິນ";
    apiError.value = errorMessage;
    error.value = errorMessage;
    return false;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-gray-200 p-4 rounded-lg">
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded"
    >
      {{ error }}
    </div>

    <div
      v-if="apiError"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded"
    >
      <strong>API Error:</strong> {{ apiError }}
    </div>

    <div class="flex items-center mb-4">
      <div class="w-28 mr-2">ລະຫັດລົງທະບຽນ</div>
      <div class="w-40 mr-4">
        <input
          type="text"
          class="w-full px-2 py-1 border rounded bg-white cursor-not-allowed"
          v-model="currentRegistrationId"
          disabled
        />
      </div>
    </div>

    <!-- ສ່ວນແສດງປີການສຶກສາ -->
    <div class="flex items-center mb-4 justify-end relative">
      <div class="w-28">ສົກຮຽນ</div>
      <div class="w-16 mr-4">
        <input
          type="text"
          class="w-full px-2 py-1 border rounded bg-white cursor-not-allowed"
          v-model="currentSchoolYearId"
          placeholder="000"
          disabled
        />
      </div>
      <div class="w-56 mr-2 relative">
        <input
          type="text"
          class="w-full px-2 py-1 border rounded bg-white"
          :value="!currentSchoolYearId ? '' : currentSchoolYear"
          readonly
        />
        <button
          id="school-year-button"
          class="absolute right-0 top-0 h-full px-2 bg-white border-l hover:bg-gray-100"
          @click="openSchoolYearDialog($event)"
        >
          ▼
        </button>
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
              <span
                v-if="year.is_current"
                class="ml-2 text-xs bg-green-500 text-white px-1 py-0.5 rounded"
                >ປັດຈຸບັນ</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ສ່ວນແສດງຫ້ອງຮຽນ -->
    <div class="flex items-center mb-4 justify-end relative">
      <div class="w-28">ຫ້ອງຮຽນ</div>
      <div class="w-16 mr-4">
        <input
          type="text"
          class="w-full px-2 py-1 border rounded bg-white cursor-not-allowed"
          v-model="currentClassId"
          placeholder="000"
          disabled
        />
      </div>
      <div class="w-56 mr-2 relative">
        <input
          type="text"
          class="w-full px-2 py-1 border rounded bg-white"
          v-model="currentClassName"
          readonly
        />
        <button
          id="classroom-button"
          class="absolute right-0 top-0 h-full px-2 bg-white border-l hover:bg-gray-100"
          @click="openClassroomDialog($event)"
        >
          ▼
        </button>

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
      <!-- <button
       @click="messageBook('ລະຫັດນັກຮຽນ: 444')"
       class="absolute right-0 top-0 h-full px-2 bg-white border-l hover:bg-gray-100"
     >
       ✖
     </button> -->
      <div class="w-28 mr-2">ລະຫັດນັກຮຽນ</div>
      <div class="w-40 mr-4">
        <input
          type="text"
          class="w-full px-2 py-1 border rounded bg-white cursor-not-allowed"
          v-model="currentStudentId"
          disabled
        />
      </div>
      <div class="w-28 mr-2">ຊື່ນັກຮຽນ(LA)</div>
      <div class="w-60 mr-4">
        <input
          type="text"
          class="w-full px-2 py-1 border rounded bg-white cursor-not-allowed"
          v-model="currentStudentName"
          disabled
        />
      </div>
      <div class="w-28 mr-2">ເບີໂທຜູ້ປົກຄອງ</div>
      <div class="w-40">
        <input
          type="text"
          class="w-full px-2 py-1 border rounded bg-white cursor-not-allowed"
          v-model="currentStudentPhone"
          disabled
        />
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
      <!-- <button @click="idgenerlage" class="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Id</button> -->
    </div>

    <div class="mb-4">
      <div class="grid grid-cols-3 bg-gray-400 p-2">
        <div>ລະຫັດນັກຮຽນ</div>
        <div>ຊື່ນັກຮຽນ(La)</div>
        <div>ເບີໂທຜູ້ປົກຄອງ</div>
      </div>
      <div class="bg-white">
        <div
          v-for="(student, index) in filteredStudents"
          :key="index"
          class="grid grid-cols-3 p-2 cursor-pointer"
          :class="[
            'grid grid-cols-4 p-2 cursor-pointer',
            currentStudentId === student.studentId
              ? 'bg-blue-600 text-white '
              : index % 2 !== 0
              ? 'bg-gray-100 hover:bg-blue-100'
              : 'bg-white hover:bg-blue-100',
          ]"
          @click="selectStudent(student)"
        >
          <div>{{ student.studentId }}</div>
          <div>{{ student.studentName }}</div>
          <div>{{ student.studentPhone }}</div>
          <div>{{ currentStudentId + student.studentId }}</div>
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
          @click="fetchRegistrations"
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
      <div
        class="bg-white text-sm"
        v-else-if="filteredRegistrations.length === 0"
      >
        <div class="p-4 text-center">ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ</div>
      </div>
      <div class="bg-white text-sm" v-else>
        <div
          v-for="(reg, index) in filteredRegistrations"
          :key="index"
          class="grid grid-cols-9 p-1 border-b"
          :class="[
            'grid grid-cols-4 p-2',
            reportFile.id === reg.id
              ? 'bg-blue-600 text-white '
              : index % 2 !== 0
              ? 'bg-gray-100 hover:bg-blue-100'
              : 'bg-white hover:bg-blue-100',
          ]"
          @click="selectRegistration(reg)"
        >
          <div>{{ reg.id }}</div>
          <div>{{ formatDate(reg.registrationDate) }}</div>
          <div>{{ reg.studentId }}</div>
          <div>{{ reg.studentName }}</div>
          <div>{{ reg.studentPhone }}</div>
          <div>{{ reg.classroom }}</div>
          <div>{{ reg.level }}</div>
          <div>{{ reg.schoolYear }}</div>
          <div :class="reportFile.id === reg.id ? 'text-white' : reg.paid ? 'text-green-600 font-bold' : 'text-red-600'">
            {{ reg.paid ? "ຈ່າຍແລ້ວ" : "ຍັງບໍ່ຈ່າຍ" }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center space-x-4 mb-4">
      <button
        class="px-6 py-2 border bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50"
        @click="saveRegistration"
        :disabled="isLoading || !isAuthenticated"
      >
        {{ isLoading ? "ກຳລັງລົງທະບຽນ..." : "ລົງທະບຽນ" }}
      </button>
      <button
        class="px-6 py-2 border bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50"
        @click="printRegistration"
        :disabled="isLoading || !isAuthenticated"
      >
        ພິມໃບລົງທະບຽນ
      </button>
      <button
        class="px-6 py-2 border bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50"
        @click="creaReport"
        :disabled="isLoading || !isAuthenticated"
      >
        ລ້າງຟອມ
      </button>
    </div>

    <!-- ສ່ວນທີ່ຕ້ອງການພິມ -->
    <div id="registration-print" class="bg-white p-6 rounded-lg shadow-md">
      <!-- ສ່ວນຫົວເອກະສານ -->
      <div class="text-center mb-8">
        <div class="mb-4 p-4 mx-auto max-w-2xl">
          <div class="flex justify-center mb-4">
            <img
              src="/src/assets/school-logo.png"
              alt="School Logo"
              class="h-16"
            />
          </div>
          <h1 class="text-xl font-bold">ໃບລົງທະບຽນ</h1>
        </div>
      </div>

      <!-- ຂໍ້ມູນການລົງທະບຽນ -->
      <div class="mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p><strong>ລະຫັດລົງທະບຽນ:</strong> {{ reportFile.id }}</p>
            <p>
              <strong>ວັນທີລົງທະບຽນ:</strong>
              {{ reportFile.date ? reportFile.date.split("T")[0] : "" }}
            </p>
            <p><strong>ລະຫັດນັກຮຽນ:</strong> {{ reportFile.studentId }}</p>
            <p><strong>ຊື່ນັກຮຽນ:</strong> {{ reportFile.name }}</p>
          </div>
          <div>
            <p><strong>ເບີໂທ:</strong> {{ reportFile.phone }}</p>
            <p><strong>ຫ້ອງຮຽນ:</strong> {{ reportFile.classroom }}</p>
            <p><strong>ຊັ້ນຮຽນ:</strong> {{ reportFile.level }}</p>
            <p><strong>ສົກຮຽນ:</strong> {{ reportFile.schoolYear }}</p>
          </div>
        </div>
      </div>

      <!-- ຂໍ້ມູນຄ່າເຣີຢນ -->
      <div class="mb-6">
        <h2 class="text-lg font-bold mb-2">ຂໍ້ມູນຄ່າຮຽນ</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2">ຊື່ນັກຮຽນ</th>
              <th class="border p-2">ຈຳນວນເງິນ</th>
              <th class="border p-2">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-2 text-center pl-4">{{ reportFile.name || "..." }}</td>
              <td class="border p-2  text-center pr-4 font-bold">
                {{ reportFile.tuition_fee ? Number(reportFile.tuition_fee).toLocaleString() + " ກີບ" : "..." }}
              </td>
              <td
                class="border p-2 text-center pr-4"
                :class="
                  reportFile.paid ? 'text-green-600 font-bold' : 'text-red-600'
                "
              >
                {{
                  reportFile.id
                    ? reportFile.paid
                      ? "ຈ່າຍແລ້ວ"
                      : "ຍັງບໍ່ຈ່າຍ"
                    : "..."
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ລາຍເຊັນ -->
      <div class="mt-8 grid grid-cols-2 gap-4">
        <div class="text-center">
          <p class="mb-16">ລາຍເຊັນຜູ້ລົງທະບຽນ</p>
          <p>...................................</p>
        </div>
        <div class="text-center">
          <p class="mb-16">ລາຍເຊັນຜູ້ຮັບເງິນ</p>
          <p>...................................</p>
        </div>
      </div>
    </div>
  </div>
</template>
