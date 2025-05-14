import { ref, reactive } from "vue";
import type { Student, StudentRegistration } from "../types/student";
import { studentApi } from "../api/studentApi";

// ข้อมูลนักเรียนว่างเปล่าสำหรับสร้างข้อมูลใหม่
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

// สถานะต่างๆ ของ store
const students = reactive<Student[]>([]);
const currentStudent = reactive<Student>(emptyStudent());
const isEditing = ref(false);
const searchQuery = ref("");
const selectedGender = ref("all");
const isLoading = ref(false);
const errorMessage = ref("");

// ข้อมูลการลงทะเบียน
const registrations = reactive<StudentRegistration[]>([]);

// Export store functions
export const useStudentStore = () => {
  // ดึงข้อมูลนักเรียนทั้งหมดจาก API
  const fetchAllStudents = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = "";
      const data = await studentApi.getAllStudents();
      // อัปเดตข้อมูลในตัวแปร reactive
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

  // ค้นหานักเรียน
  const searchStudents = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = "";
      const data = await studentApi.searchStudents(
        searchQuery.value,
        selectedGender.value !== "all" ? selectedGender.value : undefined
      );
      // อัปเดตข้อมูลในตัวแปร reactive
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

  // ดึงข้อมูลนักเรียนทั้งหมด
  const getAllStudents = async () => {
    await fetchAllStudents();
    return students;
  };

  // ดึงข้อมูลนักเรียนที่กรองแล้ว
  const getFilteredStudents = () => {
    // ถ้ามีการค้นหา หรือ เลือกเพศ และมีการเรียกใช้ปุ่มค้นหาจาก UI ให้ใช้ API search
    // จะไม่ถูกเรียกโดยอัตโนมัติแล้ว แต่จะถูกเรียกเมื่อกดปุ่ม "ค้นหา" ใน UI แทน
    return students;
  };

  // เพิ่มนักเรียนใหม่
  const addStudent = async (student: Student) => {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      // เรียกใช้ API สร้างนักเรียนใหม่
      const newStudentId = await studentApi.createStudent(student);

      // ดึงข้อมูลนักเรียนทั้งหมดใหม่
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

  // อัพเดทข้อมูลนักเรียน
  const updateStudent = async (student: Student) => {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      // เรียกใช้ API อัพเดทนักเรียน
      await studentApi.updateStudent(student);

      // ดึงข้อมูลนักเรียนทั้งหมดใหม่
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

  // ลบนักเรียน
  const deleteStudent = async (studentId: string) => {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      // หาข้อมูลนักเรียนจาก studentId
      const student = students.find((s) => s.studentId === studentId);

      if (!student || !student._id) {
        errorMessage.value = "ບໍ່ພົບຂໍ້ມູນນັກຮຽນ";
        return false;
      }

      // เรียกใช้ API ลบนักเรียน
      await studentApi.deleteStudent(student._id);

      // ดึงข้อมูลนักเรียนทั้งหมดใหม่
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

  // เริ่มแก้ไขนักเรียน
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

  // ล้างฟอร์มสำหรับนักเรียนใหม่
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

  // ล้างการค้นหา
  const clearSearch = () => {
    searchQuery.value = "";
    selectedGender.value = "all";
    fetchAllStudents();
  };

  // ดึงข้อมูลการลงทะเบียน
  const fetchRegistrations = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      const data = await studentApi.getRegistrations();
      // อัปเดตข้อมูลในตัวแปร reactive
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

  // นำเข้าข้อมูล
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
      // สมมติค่าเรียนตามระดับชั้น (ควรดึงจาก API)
      const fees: { [key: string]: number } = {
        "ຊັ້ນ ມ 1": 60000,
        "ຊັ້ນ ມ 2": 65000,
        "ຊັ້ນ ມ 3": 70000,
        "ຊັ້ນ ມ 4": 75000,
        "ຊັ້ນ ມ 5": 80000,
        "ຊັ້ນ ມ 6": 85000,
      };
      return fees[yearLevel] || 50000; // ค่าเริ่มต้นถ้าไม่พบระดับชั้น
    },
    savePayment: async (paymentData: any) => {
      // ในอนาคตควรเรียกใช้ API บันทึกการชำระเงิน
      console.log("บันทึกการชำระเงิน:", paymentData);
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
