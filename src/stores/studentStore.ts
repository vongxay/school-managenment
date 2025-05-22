import { ref, reactive } from "vue";
import type { Student, StudentRegistration } from "../types/student";
import { studentApi } from "../api/studentApi";

// ຂໍ້ມູນນັກຮຽນວ່າງເປົ່າສຳລັບສ້າງຂໍ້ມູນໃໝ່
const emptyStudent = (): Student => ({
  studentId: "",
  studentNameLao: "",
  guardianPhone: "",
  gender: "M",
  province: "",
  district: "",
  village: "",
  idNumber: "",
  idIssuedDate: "",
  birthVillage: "",
  birthDistrict: "",
  birthProvince: "",
  ethnicity: "",
  religion: "",
  nationality: "ລາວ",
  dateOfBirth: "",
  phoneNumber: "",
  searchQuery: "",
  photoUrl: "",
});

// ສະຖານະຕ່າງໆຂອງ store
const students = reactive<Student[]>([]);
const currentStudent = reactive<Student>(emptyStudent());
const isEditing = ref(false);
const searchQuery = ref("");
const selectedGender = ref("all");
const isLoading = ref(false);
const errorMessage = ref("");

// ຂໍ້ມູນການລົງທະບຽນ
const registrations = reactive<StudentRegistration[]>([]);

// Export store functions
export const useStudentStore = () => {
  // ດຶງຂໍ້ມູນນັກຮຽນທັງໝົດຈາກ API
  const fetchAllStudents = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = "";
      const data = await studentApi.getAllStudents();
      // ອັບເດດຂໍ້ມູນໃນຕົວແປ reactive
      students.splice(0, students.length, ...data);
      return true;
    } catch (error) {
      console.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນນັກຮຽນ:", error);
      errorMessage.value = "ບໍ່ສາມາດດຶງຂໍ້ມູນນັກຮຽນໄດ້";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ຄົ້ນຫານັກຮຽນ
  const searchStudents = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = "";
      const data = await studentApi.searchStudents(
        searchQuery.value,
        selectedGender.value !== "all" ? selectedGender.value : undefined
      );
      // ອັບເດດຂໍ້ມູນໃນຕົວແປ reactive
      students.splice(0, students.length, ...data);
      return true;
    } catch (error) {
      console.error("ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫານັກຮຽນ:", error);
      errorMessage.value = "ບໍ່ສາມາດຄົ້ນຫານັກຮຽນໄດ້";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ດຶງຂໍ້ມູນນັກຮຽນທັງໝົດ
  const getAllStudents = async () => {
    await fetchAllStudents();
    return students;
  };

  // ດຶງຂໍ້ມູນນັກຮຽນທີ່ກອງແລ້ວ
  const getFilteredStudents = () => {
    // ຖ້າມີການຄົ້ນຫາ ຫຼື ເລືອກເພດ ແລະມີການເອີ້ນໃຊ້ປຸ່ມຄົ້ນຫາຈາກ UI ໃຫ້ໃຊ້ API search
    // ຈະບໍ່ຖືກເອີ້ນໂດຍອັດຕະໂນມັດແລ້ວ ແຕ່ຈະຖືກເອີ້ນເມື່ອກົດປຸ່ມ "ຄົ້ນຫາ" ໃນ UI ແທນ
    return students;
  };

  // ເພີ່ມນັກຮຽນໃໝ່
  const addStudent = async (student: Student) => {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      // ເອີ້ນໃຊ້ API ສ້າງນັກຮຽນໃໝ່
      const newStudentId = await studentApi.createStudent(student);
      console.log("|3|:", newStudentId);
      // ດຶງຂໍ້ມູນນັກຮຽນທັງໝົດໃໝ່
      await fetchAllStudents();

      return newStudentId;
    } catch (error) {
      console.error("ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມນັກຮຽນ:", error);
      errorMessage.value = "ບໍ່ສາມາດເພີ່ມນັກຮຽນໄດ້";
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // ອັບເດດຂໍ້ມູນນັກຮຽນ
  const updateStudent = async (student: Student) => {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      // ເອີ້ນໃຊ້ API ອັບເດດນັກຮຽນ
      await studentApi.updateStudent(student);

      // ດຶງຂໍ້ມູນນັກຮຽນທັງໝົດໃໝ່
      await fetchAllStudents();

      return true;
    } catch (error) {
      console.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດນັກຮຽນ:", error);
      errorMessage.value = "ບໍ່ສາມາດອັບເດດຂໍ້ມູນນັກຮຽນໄດ້";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ລຶບນັກຮຽນ
  const deleteStudent = async (studentId: string) => {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      // ຫາຂໍ້ມູນນັກຮຽນຈາກ studentId
      const student = students.find((s) => s.studentId === studentId);

      if (!student || !student._id) {
        errorMessage.value = "ບໍ່ພົບຂໍ້ມູນນັກຮຽນ";
        return false;
      }

      // ເອີ້ນໃຊ້ API ລຶບນັກຮຽນ
      await studentApi.deleteStudent(student._id);

      // ດຶງຂໍ້ມູນນັກຮຽນທັງໝົດໃໝ່
      await fetchAllStudents();

      return true;
    } catch (error) {
      console.error("ເກີດຂໍ້ຜິດພາດໃນການລຶບນັກຮຽນ:", error);
      errorMessage.value = "ບໍ່ສາມາດລຶບຂໍ້ມູນນັກຮຽນໄດ້";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ເລີ່ມແກ້ໄຂນັກຮຽນ
  const startEdit = (studentId: string) => {
    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      // Clone student data to currentStudent
      Object.assign(currentStudent, student);
      isEditing.value = true;
      return true;
    }
    return false;
  };

  // ລ້າງຟອມສຳລັບນັກຮຽນໃໝ່
  const startNew = () => {
    Object.assign(currentStudent, emptyStudent());
    generateStudentId();
    isEditing.value = false;
  };

  const generateStudentId = () => {
    if (students.length === 0) {
      return "001"; // Start with '001' if no students exist
    }

    // Filter out invalid studentId values (non-numeric or empty)
    const numericIds = students
      .map((student) => parseInt(student.studentId || "0", 10))
      .filter((id) => !isNaN(id)); // Keep only valid numbers

    if (numericIds.length === 0) {
      currentStudent.studentId = "001";
    }
    const maxId = Math.max(...numericIds);
    currentStudent.studentId = (maxId + 1).toString().padStart(3, "0");
  };

  // ລ້າງການຄົ້ນຫາ
  const clearSearch = () => {
    searchQuery.value = "";
    selectedGender.value = "all";
    fetchAllStudents();
  };

  // ດຶງຂໍ້ມູນການລົງທະບຽນ
  const fetchRegistrations = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      const data = await studentApi.getRegistrations();
      // ອັບເດດຂໍ້ມູນໃນຕົວແປ reactive
      registrations.splice(0, registrations.length, ...data);

      return true;
    } catch (error) {
      console.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການລົງທະບຽນ:", error);
      errorMessage.value = "ບໍ່ສາມາດດຶງຂໍ້ມູນການລົງທະບຽນໄດ້";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ນຳເຂົ້າຂໍ້ມູນ
  fetchAllStudents();
  fetchRegistrations();

  return {
    students,
    currentStudent,
    isEditing,
    searchQuery,
    selectedGender,
    isLoading,
    errorMessage,
    getAllStudents,
    getFilteredStudents,
    searchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    startEdit,
    startNew,
    clearSearch,
    getStudentById: (studentId: string) => {
      return students.find((s) => s.studentId === studentId);
    },
    getRegistrations: () => {
      return registrations;
    },
    getRegistrationByInvoiceId: async (invoiceId: string) => {
      if (!invoiceId) {
        console.error("ລະຫັດລົງທະບຽນເປັນຄ່າຫວ່າງ");
        return null;
      }

      try {
        return await studentApi.getRegistrationByInvoiceId(invoiceId);
      } catch (error) {
        console.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການລົງທະບຽນ:", error);
        return null;
      }
    },
    searchRegistrations: async (query: string) => {
      if (!query) {
        return [];
      }

      try {
        return await studentApi.searchRegistrations(query);
      } catch (error) {
        console.error("ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາຂໍ້ມູນການລົງທະບຽນ:", error);
        return [];
      }
    },
    getTuitionFee: async (yearLevel: string) => {
      // ສົມມຸດຄ່າຮຽນຕາມລະດັບຊັ້ນ (ຄວນດຶງຈາກ API)
      const fees: { [key: string]: number } = {
        "ຊັ້ນ ມ 1": 60000,
        "ຊັ້ນ ມ 2": 65000,
        "ຊັ້ນ ມ 3": 70000,
        "ຊັ້ນ ມ 4": 75000,
        "ຊັ້ນ ມ 5": 80000,
        "ຊັ້ນ ມ 6": 85000,
      };
      return fees[yearLevel] || 50000; // ຄ່າເລີ່ມຕົ້ນຖ້າບໍ່ພົບລະດັບຊັ້ນ
    },
    savePayment: async (paymentData: any) => {
      // ໃນອະນາຄົດຄວນເອີ້ນໃຊ້ API ບັນທຶກການຊຳລະເງິນ
      console.log("ບັນທຶກການຊຳລະເງິນ:", paymentData);
      return true;
    },
    updateRegistrationPaymentStatus: async (id: string, isPaid: boolean) => {
      try {
        return await studentApi.updateRegistrationPaymentStatus(id, isPaid);
      } catch (error) {
        console.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະການຊຳລະເງິນ:", error);
        return false;
      }
    },
  };
};
