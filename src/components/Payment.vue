<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { onMounted } from "@vue/runtime-core";
import { useStudentStore } from "../stores/studentStore";
import { useAuthStore } from "../stores/authStore";
import axios from "axios";

const studentStore = useStudentStore();
const authStore = useAuthStore();

interface Payment {
  invoiceNo: string;
  date: string;
  tuitionId: string;
  studentName: string;
  studentPhone: string;
  yearLevel: string;
  level: string;
  classLevel: string;
  academicYear: string;
  status: string;
}

// ຮັບຂໍ້ມູນນັກຮຽນາກ prop
const props = defineProps({
  studentId: {
    type: String,
    default: "",
  },
});

const payment = reactive<Payment>({
  invoiceNo:
    "INV-" +
    Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(9, "0"),
  date: new Date().toISOString().split("T")[0],
  tuitionId: "",
  studentName: "",
  studentPhone: "",
  yearLevel: "",
  level: "",
  classLevel: "",
  academicYear: "",
  status: "ລໍຖ້າຊໍາລະ",
});

const amount = ref<number>(0);
const paidAmount = ref<number>(0);
const changeAmount = computed(() => {
  return Math.max(0, paidAmount.value - amount.value);
});

// ເພີ່ມ state ສຳລັບການຄົ້ນຫານັກຮຽນ
const studentSearchQuery = ref("");
const filteredRegistrations = ref<any[]>([]);
const showStudentSearch = ref(false);

// ເພີ່ມຕົວແປສຳລັບເກັບຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນ
const unpaidRegistrations = ref<any[]>([]);

// ເພີ່ມ loading state
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref("");

// ເພີ່ມຕົວແປສຳລັບເກັບຂໍ້ມູນຄ່າຮຽນ
const tuitionInfo = ref<{
  id: string;
  amount: number;
  level: string;
  year: string;
}>({
  id: "",
  amount: 0,
  level: "",
  year: "",
});
const API_URL = "http://localhost:5000/api";

// ເພີ່ມຕົວແປໃໝ່ສຳລັບເກັບປະຫວັດການຊຳລະເງິນ
const paymentHistory = ref<any[]>([]);
const showPaymentHistory = ref(false);

// ໂຫຼດຂໍ້ມູນນັກຮຽນເມື່ອຄອມໂພເນັນຖືກໂຫຼດ
const loadData = async () => {
  if (props.studentId) {
    // ຖ້າມີ studentId ໃນພຣອບ ໃຫ້ໂຫຼດຂໍ້ມູນນັກຮຽນ
    try {
      isLoading.value = true;
      await loadStudentData(props.studentId);
      isLoading.value = false;
    } catch (error) {
      console.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນນັກຮຽນໄດ້:", error);
      hasError.value = true;
      errorMessage.value = "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນນັກຮຽນໄດ້";
      isLoading.value = false;
    }
  } else {
    // ຖ້າບໍ່ມີ studentId ໃຫ້ດຶງຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນມາແສງ
    await fetchUnpaidRegistrations();
  }
};

// ເພີ່ມຟັງຊັ່ນໃໝ່ສຳລັບດຶງຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນ
const fetchUnpaidRegistrations = async () => {
  try {
    isLoading.value = true;
    // ເອີ້ນ API ເພື່ອດຶງຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນ
    const response = await axios.get(`${API_URL}/registrations?paid=false`, {
      headers: {
        Authorization: `Bearer ${
          authStore.user?.token || localStorage.getItem("token")
        }`,
      },
    });
    if (response.data.success && response.data.data.registrations.length > 0) {
      // ເກັບຂໍ້ມູນໄວ້ໃນຕົວແປ
      unpaidRegistrations.value = response.data.data.registrations.map(
        (reg: any) => {
          // ແນ່ໃຈວ່າໃຊ້ field id ທີ່ຖືກຕ້ອງ
          const regId = reg.id;
          return {
            id: regId,
            registrationDate: reg.registration_date,
            studentId: reg.student_id,
            studentName: reg.student_name || "",
            studentPhone: reg.student_phone || "",
            classroom: reg.classroom || "",
            level: reg.level || "",
            schoolYear: reg.school_year || "",
            paid: reg.paid || reg.is_paid || false,
            tuition_fee: reg.tuition_fee || 0,
          };
        }
      );

      // ສະແດງຂໍ້ມູນການລົງທະບຽນທຳອິດໃນລາຍການ
      if (unpaidRegistrations.value.length > 0) {
        const firstReg = unpaidRegistrations.value[0];
        // ເລືອກການລົງທະບຽນນີ້ເພື່ອສະແດງໃນຟອມ
        await selectRegistration(firstReg.id);
      }
    } else {
      unpaidRegistrations.value = [];
    }
  } catch (error) {
    console.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນການລົງທະບຽນໄດ້:", error);
    hasError.value = true;
    errorMessage.value = "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນການລົງທະບຽນໄດ້";
  } finally {
    isLoading.value = false;
  }
};

// ໂຫຼດຂໍ້ມູນຄ່າຮຽນ
// const loadTuitionInfo = async () => {
//   try {
//     isLoading.value = true;
//     const response = await axios.get(`${API_URL}/tuitions`, {
//       headers: {
//         Authorization: `Bearer ${
//           authStore.user?.token || localStorage.getItem("token")
//         }`,
//       },
//     });
//     if (response.data.success && response.data.data.length > 0) {
//       // ເກັບຂໍ້ມູນຄ່າຮຽນທັງໝົດໄວ້ໃຊ້
//       const allTuitions = response.data.data;

//       if (payment.level && payment.academicYear) {
//         const matchingTuition = allTuitions.find(
//           (t: any) =>
//             t.level === payment.level && t.year === payment.academicYear
//         );
//         if (matchingTuition) {
//           tuitionInfo.value = {
//             id: matchingTuition.id,
//             amount: matchingTuition.amount,
//             level: matchingTuition.level,
//             year: matchingTuition.year,
//           };
//           amount.value = tuitionInfo.value.amount;
//         } else {
//           tuitionInfo.value = {
//             id: "000",
//             amount: 20000, // Changed to use consistent default amount
//             level: allTuitions[0].level,
//             year: allTuitions[0].year,
//           };
//           amount.value = tuitionInfo.value.amount;
//         }
//       } else {
//         // ຖ້າຍັງບໍ່ມີຂໍ້ມູນຊັ້ນຮຽນ ໃຊ້ຄ່າຈາກ array index 1 ຫຼືຄ່າທຳອິດ
//         if (allTuitions.length > 1) {
//           tuitionInfo.value = {
//             id: "000",
//             amount: 20000, // Changed to use consistent default amount
//             level: allTuitions[1].level,
//             year: allTuitions[1].year,
//           };
//         } else {
//           tuitionInfo.value = {
//             id: "000",
//             amount: 20000, // Changed to use consistent default amount
//             level: allTuitions[0].level,
//             year: allTuitions[0].year,
//           };
//         }
//         amount.value = tuitionInfo.value.amount;
//       }
//     }
//   } catch (error) {
//     console.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຄ່າຮຽນໄດ້:", error);
//   } finally {
//     isLoading.value = false;
//   }
// };

// ເອີ້ນໃຊ້ຟັງຊັ່ນໂຫຼດຂໍ້ມູນຄ່າຮຽນເມື່ອຄອມໂພເນັນຖືກໂຫຼດ
onMounted(() => {
  // ຕັ້ງຄ່າ default headers ສຳລັບ axios ຖ້າມີ token
  if (authStore.user?.token) {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${authStore.user.token}`;
  }

  // loadTuitionInfo();
  loadData();
});

// ຟັງຊັ່ນໂຫຼດຂໍ້ມູນນັກຮຽນ
async function loadStudentData(studentId: string) {
  try {
    const student = await studentStore.getStudentById(studentId);
    console.log("PPL::", student);
    if (student) {
      payment.studentName = student.studentNameLao || "";
      payment.studentPhone = student.phoneNumber || "";
      // ດຶງຊັ້ນຮຽນຈາກ studentId ຕາມຮູບແບບ
      const grade = student.studentId?.charAt(0) || "1";
      const section = student.studentId?.charAt(1) || "1";
      payment.classLevel = `ມ ${grade}/${section}`;
      payment.yearLevel = payment.classLevel;

      // ປັບຮູບແບບໃຫ້ສອດຄ່ອງກັບ LevelInfo ແລະ TuitionInfo
      payment.level = `ຊັ້ນ ມ ${grade}`;

      payment.academicYear = `${new Date().getFullYear()}-${
        new Date().getFullYear() + 1
      }`;
      payment.tuitionId = student.studentId || "";

      // ເອີ້ນຫາຄ່າຮຽນຕາມລະດັບຊັ້ນຈາກ API
      try {
        const response = await axios.get(`${API_URL}/tuitions`, {
          headers: {
            Authorization: `Bearer ${
              authStore.user?.token || localStorage.getItem("token")
            }`,
          },
        });
        if (response.data.success && response.data.data.length > 0) {
          // ຫາຄ່າຮຽນຕາມລະດັບຊັ້ນ
          const matchingTuition = response.data.data.find(
            (t: any) => t.level === payment.level
          );
          if (matchingTuition) {
            amount.value = matchingTuition.amount;
            tuitionInfo.value = {
              id: matchingTuition.id,
              amount: matchingTuition.amount,
              level: matchingTuition.level,
              year: matchingTuition.year,
            };
            console.log("Found matching tuition:", matchingTuition);
          } else {
            // ຖ້າບໍ່ພົບຄ່າຮຽນທີ່ຕົງກັບລະດັບຊັ້ນ ໃຊ້ຄ່າຮຽນເລີ່ມຕົ້ນ
            amount.value = tuitionInfo.value.amount;
          }
        }
      } catch (error) {
        console.error("ບໍ່ສາມາດດຶງຂໍ້ມູນຄ່າຮຽນໄດ້:", error);
        // ໃຊ້ວິທີເດີມຖ້າເອີ້ນ API ບໍ່ສຳເລັດ
        amount.value = (await studentStore.getTuitionFee(payment.level)) || 0;
      }
    } else {
      throw new Error("ບໍ່ພົບຂໍ້ມູນນັກຮຽນ");
    }
  } catch (error) {
    console.error("Error loading student data:", error);
    throw error;
  }
}

// ກວດສອບແລະແກ້ໄຂເມື່ອມີການປ່ຽນແປງຄ່າ paidAmount
const updatePaidAmount = (event: Event) => {
  const value = Number((event.target as HTMLInputElement)?.value || 0);
  if (value < 0) {
    paidAmount.value = 0;
  } else {
    paidAmount.value = value;
  }
};

const confirmPayment = async () => {
  const validationError = validatePaymentInput();
  if (validationError) {
    alert(validationError);
    return;
  }

  try {
    isLoading.value = true;
    // ອັບເດດສະຖານະການຊຳລະເງິນ
    payment.status = "ຈ່າຍແລ້ວ";

    // ບັນທຶກການຊຳລະເງິນ
    const paymentData = {
      registration_id: payment.invoiceNo,
      amount: amount.value,
      payment_date: payment.date,
      payment_method: "cash", // ຄ່າເລີ່ມຕົ້ນເປັນເງິນສົດ
      received_by: authStore.user?.id || "",
      receipt_number:
        "R-" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(8, "0"),
      note: `ຊຳລະຄ່າຮຽນ ${payment.level} ປີການສຶກສາ ${payment.academicYear}`,
    };

    // ເອີ້ນໃຊ້ API endpoint ໃໝ່ສຳລັບບັນທຶກການຊຳລະເງິນ
    const paymentResponse = await axios.post(
      `${API_URL}/payments`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${
            authStore.user?.token || localStorage.getItem("token")
          }`,
          "Content-Type": "application/json",
        },
      }
    );
    if (paymentResponse.data.success) {
      alert("ບັນທຶກການຊຳລະເງິນສຳເລັດແລ້ວ");

      // ດຶງຂໍ້ມູນການລົງທະບຽນເພື່ອອັບເດດສະຖານະ (ກໍລະນີທີ່ໃນຝັ່ງ backend ບໍ່ໄດ້ອັບເດດສະຖານະການຊຳລະເງິນອັດຕະໂນມັດ)
      try {
        // ດຶງຂໍ້ມູນການລົງທະບຽນໃໝ່ເພື່ອກວດສອບສະຖານະ
        const registrationResponse = await axios.get(
          `${API_URL}/registrations/${payment.invoiceNo}`,
          {
            headers: {
              Authorization: `Bearer ${
                authStore.user?.token || localStorage.getItem("token")
              }`,
            },
          }
        );

        if (
          registrationResponse.data.success &&
          registrationResponse.data.data
        ) {
          // ອັບເດດສະຖານະໃນໜ້າຈໍ
          payment.status = registrationResponse.data.data.is_paid
            ? "ຈ່າຍແລ້ວ"
            : "ລໍຖ້າຊໍາລະ";
        }
      } catch (error) {
        console.error("ບໍ່ສາມາດດຶງຂໍ້ມູນການລົງທະບຽນຫຼັງຈາກຊຳລະເງິນ:", error);
      }

      // ດຶງປະຫວັດການຊຳລະເງິນ
      await getPaymentHistory(payment.invoiceNo);

      // ດຶງຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ໄດ້ຊຳລະເງິນໃໝ່
      await fetchUnpaidRegistrations();

      // ຖາມຜູ້ໃຊ້ວ່າຕ້ອງການລ້າງຟອມເພື່ອຊຳລະເງິນຄົນໃໝ່ຫຼືບໍ່
      if (confirm("ທ່ານຕ້ອງການລ້າງຟອມເພື່ອຊຳລະເງິນຄົນໃໝ່ຫຼືບໍ່?")) {
      }
      resetForm();                                                        ///////////////////////////////
    } else {
      alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ");
    }
  } catch (error) {
    isLoading.value = false;
    console.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ:", error);
    alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຊຳລະເງິນ");
  } finally {
    isLoading.value = false;
  }
};

// ຟັງຊັ່ນລີເຊັດຟອມ
const resetForm = () => {
  payment.invoiceNo =
    "INV-" +
    Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(9, "0");
  payment.date = new Date().toISOString().split("T")[0];
  payment.tuitionId = "";
  payment.studentName = "";
  payment.studentPhone = "";
  payment.yearLevel = "";
  payment.level = "";
  payment.classLevel = "";
  payment.academicYear = "";
  payment.status = "ລໍຖ້າຊໍາລະ";
  amount.value = 0;
  paidAmount.value = 0;
  showStudentSearch.value = false;
  studentSearchQuery.value = "";
  filteredRegistrations.value = [];
  hasError.value = false;
  errorMessage.value = "";
};

// ເພີ່ມຟັງຊັ່ນສຳລັບຄົ້ນຫານັກຮຽນ
const searchStudents = async () => {
  if (!studentSearchQuery.value.trim()) {
    filteredRegistrations.value = [];
    return;
  }

  const query = studentSearchQuery.value.toLowerCase();

  try {
    // ຄົ້ນຫາເທົ່ານັ້ນໃນຂໍ້ມູນການລົງທະບຽນທີ່ຍັງບໍ່ຊຳລະເງິນ (ຕັດການຄົ້ນຫາໃນຂໍ້ມູນນັກຮຽນອອກ)
    if (unpaidRegistrations.value.length > 0) {
      // ຄົ້ນຫາໃນຂໍ້ມູນໃນແອັບ
      filteredRegistrations.value = unpaidRegistrations.value
        .filter(
          (reg) =>
            reg.id.toLowerCase().includes(query) ||
            reg.studentName.toLowerCase().includes(query) ||
            reg.studentId.toLowerCase().includes(query) ||
            reg.studentPhone.toLowerCase().includes(query)
        )
        .slice(0, 5);
    } else {
      // ຖ້າຍັງບໍ່ມີຂໍ້ມູນໃນແອັບ ໃຫ້ຄົ້ນຫາຜ່ານ API
      const registrations = await studentStore.searchRegistrations(query);

      // ແນ່ໃຈວ່າໃຊ້ field id ທີ່ຖືກຕ້ອງ ແລະກວດສອບຄ່າ is_paid
      filteredRegistrations.value = registrations
        .filter((reg) => reg.is_paid === false) // ກອງສະເພາະທີ່ຍັງບໍ່ຊຳລະເງິນ
        .map((reg) => ({
          id: reg.id,
          studentName: reg.student_name || "",
          studentId: reg.student_id || "",
          studentPhone: reg.student_phone || "",
        }))
        .slice(0, 5);
    }

    showStudentSearch.value = true;
  } catch (error) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາ:", error);
    filteredRegistrations.value = [];
  }
};

// ແກ້ໄຂຟັງຊັ່ນ selectRegistration ດັ້ງເດີມໃຫ້ໃຊ້ getPaymentHistory
const selectRegistration = async (registrationId: string) => {
  try {
    isLoading.value = true;

    const response = await axios.get(
      `${API_URL}/registrations/${registrationId}`,
      {
        headers: {
          Authorization: `Bearer ${
            authStore.user?.token || localStorage.getItem("token")
          }`,
        },
      }
    );

    if (!response.data.success || !response.data.data) {
      console.error("ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ:", registrationId);
      throw new Error("ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນ");
    }

    const registration = response.data.data;
    // ອັບເດດຂໍ້ມູນໃບເສັດຕາມການລົງທະບຽນ
    payment.invoiceNo = registration.id;
    payment.date = new Date().toISOString().split("T")[0];
    payment.tuitionId = registration.student_id;
    payment.studentName = registration.student_name;
    payment.studentPhone = registration.student_phone;
    payment.classLevel = registration.classroom;
    payment.level = registration.level;
    payment.academicYear = registration.school_year;
    payment.status = registration.is_paid ? "ຈ່າຍແລ້ວ" : "ລໍຖ້າຊໍາລະ";

    // ໃຊ້ຄ່າຮຽນຈາກໃບລົງທະບຽນຖ້າມີ
    if (registration.tuition_fee && parseFloat(registration.tuition_fee) > 0) {
      amount.value = parseFloat(registration.tuition_fee);

      // ບັນທຶກຂໍ້ມູນຄ່າຮຽນໃຫ້ຄົບຖ້ວນ
      tuitionInfo.value = {
        id: registration.tuition_id || "",
        amount: parseFloat(registration.tuition_fee),
        level: registration.level || "",
        year: registration.school_year || "",
      };
    } else {
      // ຖ້າບໍ່ມີຄ່າຮຽນໃນໃບລົງທະບຽນ ໃຊ້ຄ່າຮຽນຕາມລະດັບຊັ້ນຈາກ API
      try {
        const tuitionResponse = await axios.get(`${API_URL}/tuitions`, {
          headers: {
            Authorization: `Bearer ${
              authStore.user?.token || localStorage.getItem("token")
            }`,
          },
        });
        if (
          tuitionResponse.data.success &&
          tuitionResponse.data.data.length > 0
        ) {
          // ຫາຄ່າຮຽນຕາມລະດັບຊັ້ນແລະປີການສຶກສາ
          const matchingTuition = tuitionResponse.data.data.find(
            (t: any) =>
              t.level === registration.level && t.year === registration.school_year
          );
          if (matchingTuition) {
            amount.value = matchingTuition.amount;
            tuitionInfo.value = {
              id: matchingTuition.id,
              amount: matchingTuition.amount,
              level: matchingTuition.level,
              year: matchingTuition.year,
            };
          } else {
            // ຖ້າບໍ່ພົບຄ່າຮຽນທີ່ຕົງກັບລະດັບຊັ້ນ ໃຊ້ຄ່າ 20000
            tuitionInfo.value = {
              id: "000",
              amount: 0, // Changed from 0 to 20000 as default
              level: "",
              year: "",
            };
          
          }
        }
      } catch (error) {
        console.error("ບໍ່ສາມາດດຶງຂໍ້ມູນຄ່າຮຽນໄດ້:", error);
      }
    }

    // ດຶງປະຫວັດການຊຳລະເງິນ
    await getPaymentHistory(registrationId);

    showStudentSearch.value = false;
    isLoading.value = false;
  } catch (error) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນການລົງທະບຽນ:", error);
    hasError.value = true;
    errorMessage.value = "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນການລົງທະບຽນໄດ້";
    isLoading.value = false;
  }
};

// const loadTuitionInfo = async () => {
//   try {
//     isLoading.value = true;
//     const response = await axios.get(`${API_URL}/tuitions`, {
//       headers: {
//         Authorization: `Bearer ${
//           authStore.user?.token || localStorage.getItem("token")
//         }`,
//       },
//     });
//     if (response.data.success && response.data.data.length > 0) {
//       // ເກັບຂໍ້ມູນຄ່າຮຽນທັງໝົດໄວ້ໃຊ້
//       const allTuitions = response.data.data;

//       console.log('??',payment.level ,payment)
//       if (payment.level && payment.academicYear) {
//         const matchingTuition = allTuitions.find(
//           (t: any) =>
//             t.level === payment.level && t.year === payment.academicYear
//         );
//         if (matchingTuition) {
//           tuitionInfo.value = {
//             id: matchingTuition.id,
//             amount: matchingTuition.amount,
//             level: matchingTuition.level,
//             year: matchingTuition.year,
//           };
//           amount.value = tuitionInfo.value.amount;
//         } else {
//           tuitionInfo.value = {
//             id: "000",
//             amount: 0, // ໃຊ້ຄ່າທີ່ກຳນົດ
//             level: allTuitions[0].level,
//             year: allTuitions[0].year,
//           };
//           amount.value = tuitionInfo.value.amount;
//         }
//       } else {
//         // ຖ້າຍັງບໍ່ມີຂໍ້ມູນຊັ້ນຮຽນ ໃຊ້ຄ່າຈາກ array index 1 ຫຼືຄ່າທຳອິດ
//         if (allTuitions.length > 1) {
//           tuitionInfo.value = {
//             id: "000",
//             amount: 0, // ໃຊ້ຄ່າທີ່ກຳນົດ
//             level: allTuitions[1].level,
//             year: allTuitions[1].year,
//           };
//         } else {
//           tuitionInfo.value = {
//             id: "000",
//             amount: 0, // ໃຊ້ຄ່າທີ່ກຳນົດ
//             level: allTuitions[0].level,
//             year: allTuitions[0].year,
//           };
//         }
//         amount.value = tuitionInfo.value.amount;
//       }
//     }
//   } catch (error) {
//     console.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຄ່າຮຽນໄດ້:", error);
//   } finally {
//     isLoading.value = false;
//   }
// };

// ເພີ່ມຟັງຊັ່ນສຳລັບກວດສອບຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ
const validatePaymentInput = () => {
  if (!payment.tuitionId || !payment.studentName) {
    return "ກະລຸນາລະບຸຂໍ້ມູນນັກຮຽນ";
  }

  if (amount.value <= 0) {
    return "ຄ່າຮຽນບໍ່ຖືກຕ້ອງ";
  }

  if (!paidAmount.value || paidAmount.value <= 0) {
    return "ກະລຸນາລະບຸຈຳນວນເງິນທີ່ຈ່າຍ";
  }

  if (paidAmount.value < amount.value) {
    return "ຈຳນວນເງິນທີ່ຈ່າຍນ້ອຍກວ່າຄ່າຮຽນ";
  }

  return null;
};

// ເພີ່ມຟັງຊັ່ນໃໝ່ສຳລັບດຶງປະຫວັດການຊຳລະເງິນ
const getPaymentHistory = async (registrationId: string) => {
  try {
    isLoading.value = true;
    const response = await axios.get(
      `${API_URL}/payments/registration/${registrationId}`,
      {
        headers: {
          Authorization: `Bearer ${
            authStore.user?.token || localStorage.getItem("token")
          }`,
        },
      }
    );

    if (response.data.success) {
      paymentHistory.value = response.data.data.payments;
      showPaymentHistory.value = true;
    } else {
      paymentHistory.value = [];
      showPaymentHistory.value = false;
    }
  } catch (error) {
    console.error("ບໍ່ສາມາດດຶງຂໍ້ມູນປະຫວັດການຊຳລະເງິນໄດ້:", error);
    paymentHistory.value = [];
    showPaymentHistory.value = false;
  } finally {
    isLoading.value = false;
  }
};

// ເພີ່ມຟັງຊັ່ນເລືອກການລົງທະບຽນ
const showUnpaidRegistrationsSearch = () => {
  filteredRegistrations.value = unpaidRegistrations.value.slice(0, 5); // ສະແດງພຽງ 5 ລາຍການທຳອິດ
  showStudentSearch.value = true;
};
</script>

<template>
  <div class="p-4 bg-gray-200 rounded-lg">
    <!-- Loading/Error states -->
    <div v-if="isLoading" class="p-4 text-center">
      <p class="text-lg">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>

    <div v-else-if="hasError" class="p-4 bg-red-100 text-red-700 rounded mb-4">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else>
      <!-- ຄ້ນຫານັກຮຽນ -->
      <div class="mb-4 p-2 bg-white rounded">
        <div class="flex items-center space-x-2">
          <div class="w-28">ຄ້ນຫານັກຮຽນ</div>
          <input
            type="text"
            v-model="studentSearchQuery"
            @input="searchStudents"
            class="flex-1 px-2 py-1 border rounded"
            placeholder="ພິມລະຫັດລົງທະບຽນ, ລະຫັດນັກຮຽນ ຫຼື ຊື່ນັກຮຽນ..."
          />
          <button
            @click="resetForm"
            class="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            ລ້າງຂໍ້ມູນ
          </button>
        </div>

        <!-- ປຸ່ມແສດງຣາຢການລົງທະບຽນທີ່ຍັງໄມ່ຊຳລະເງິນ -->
        <div class="mt-2 flex flex-wrap gap-2 text-sm">
          <span class="text-gray-600">ຣາຍການ:</span>
          <button
            @click="showUnpaidRegistrationsSearch"
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            ລາຍການລົງທະບຽນທີ່ຍັງໄມ່ຊຳລະເງິນ
          </button>
        </div>

        <!-- ແສດງຜລການຄ້ນຫາ -->
        <div v-if="showStudentSearch" class="mt-2 border rounded">
          <!-- ຜລການຄ້ນຫາການລົງທະບຽນ -->
          <div v-if="filteredRegistrations.length > 0">
            <div class="p-2 font-bold bg-gray-200">ຂໍ້ມູນການລົງທະບຽນ</div>
            <div
              v-for="reg in filteredRegistrations"
              :key="reg.id"
              @click="selectRegistration(reg.id)"
              class="p-2 hover:bg-gray-100 cursor-pointer border-b"
            >
              {{ reg.id }} - {{ reg.studentName }} ({{ reg.level }})
            </div>
          </div>
          <!-- ໄມ່ພບຂໍ້ມູນ -->
          <div
            v-if="filteredRegistrations.length === 0"
            class="p-2 text-gray-500"
          >
            ບໍ່ພົບຂໍ້ມູນການລົງທະບຽນທີ່ຍັງໄມ່ຊຳລະເງິນ
          </div>
        </div>
      </div>

      <!-- Header Section -->
      <div class="flex justify-between mb-4 p-2 bg-white rounded">
        <div class="flex items-center space-x-3">
          <div>
            <span class="mb-1 mr-2 text-sm">ລະຫັດລົງທະບຽນ</span>
            <input
              type="text"
              v-model="payment.invoiceNo"
              class="px-2 py-1 border rounded"
              readonly
            />
          </div>
          <div>
            <span class="mb-1 mr-2 text-sm">ລະຫັດຄ່າຮຽນ</span>
            <input
              type="text"
              :value="tuitionInfo.id"
              class="px-2 py-1 border rounded"
              readonly
            />
          </div>
          <div>
            <span class="mb-1 mr-2 text-sm">ຊື່ຊັ້ນຮຽນ</span>
            <input
              type="text"
              :value="payment.level"
              class="px-2 py-1 border rounded"
              readonly
            />
          </div>
          <div>
            <span class="mb-1 mr-2 text-sm">ປີການສຶກສາ</span>
            <input
              type="text"
              :value="payment.academicYear"
              class="px-2 py-1 border rounded"
              readonly
            />
          </div>
          <div>
            <button class="mt-5 px-2 py-1 bg-gray-200 rounded">...</button>
          </div>
        </div>
      </div>

      <!-- Payment Information Table -->
      <div class="mb-4 bg-white rounded overflow-hidden">
        <div class="grid grid-cols-9 bg-gray-300 p-2 text-sm">
          <div>ລະຫັດລົງທະບຽນ</div>
          <div>ວັນທີລົງທະບຽນ</div>
          <div>ລະຫັດນັກຮຽນ</div>
          <div>ຊື່ນັກຮຽນ(La)</div>
          <div>ເບີໂທນັກຮຽນ</div>
          <div>ຫ້ອງຮຽນ</div>
          <div>ຊັ້ນຮຽນ</div>
          <div>ສົກຮຽນ</div>
          <div>ສະຖານະ</div>
        </div>

        <div class="grid grid-cols-9 p-2 bg-gray-100">
          <div>{{ payment.invoiceNo }}</div>
          <div>{{ payment.date }}</div>
          <div>{{ payment.tuitionId }}</div>
          <div>{{ payment.studentName }}</div>
          <div>{{ payment.studentPhone }}</div>
          <div>{{ payment.classLevel }}</div>
          <div>{{ payment.level }}</div>
          <!-- <div>{{ payment.academicYear }}</div> -->
          <div>{{ payment.academicYear }}</div>
          <div
            :class="
              payment.status === 'ຈ່າຍແລ້ວ' ? 'text-green-600 font-bold' : ''
            "
          >
            {{ payment.status }}
          </div>
        </div>
      </div>

      <!-- ແສດງຂໍ້ມູນຄ່າຮຽນຕາມຊັ້ນ -->
      <div class="mb-4 bg-white rounded p-2">
        <div class="text-lg font-bold mb-2">ຂໍ້ມູນການຊຳລະຄ່າຮຽນ</div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="mb-1 text-sm">ລະຫັດຄ່າຮຽນ:</div>
            <div class="p-2 bg-gray-100 rounded">
              {{ tuitionInfo.id || "ບໍ່ມີຂໍ້ມູນ" }}
            </div>
          </div>
          <div>
            <div class="mb-1 text-sm">ລະດັບຊັ້ນ:</div>
            <div class="p-2 bg-gray-100 rounded">
              {{ payment.level || "ບໍ່ມີຂໍ້ມູນ" }}
            </div>
          </div>
          <div>
            <div class="mb-1 text-sm">ປີການສຶກສາ:</div>
            <div class="p-2 bg-gray-100 rounded">
              {{ payment.academicYear || "ບໍ່ມີຂໍ້ມູນ" }}
            </div>
          </div>
          <div>
            <div class="mb-1 text-sm">ຄ່າຮຽນ:</div>
            <div class="p-2 bg-gray-100 rounded font-bold">
              {{ Number(tuitionInfo.amount).toLocaleString() }} ກີບ
            </div>
          </div>
        </div>
      </div>

      <!-- ແສດງປະຫວັດການຊຳລະເງິນ -->
      <div
        v-if="showPaymentHistory && paymentHistory.length > 0"
        class="mb-4 bg-white rounded p-2"
      >
        <div class="text-lg font-bold mb-2">ປະຫວັດການຊຳລະເງິນ</div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-200">
              <tr>
                <th class="px-4 py-2 text-left">ລະຫັດຊຳລະ</th>
                <th class="px-4 py-2 text-left">ວັນທີຊຳລະ</th>
                <th class="px-4 py-2 text-right">ຈຳນວນເງິນ</th>
                <th class="px-4 py-2 text-left">ວິທີການຊຳລະ</th>
                <th class="px-4 py-2 text-left">ເລກທີໃບເສັດ</th>
                <th class="px-4 py-2 text-left">ຜູ່ຮັບເງິນ</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in paymentHistory"
                :key="item.id"
                class="border-b"
              >
                <td class="px-4 py-2">{{ item.id.substring(0, 8) }}...</td>
                <td class="px-4 py-2">{{ item.payment_date }}</td>
                <td class="px-4 py-2 text-right">
                  {{ Number(item.amount).toLocaleString() }} ກີບ
                </td>
                <td class="px-4 py-2">
                  {{ item.payment_method === "cash" ? "ເງິນສົດ" : "ໂອນເງິນ" }}
                </td>
                <td class="px-4 py-2">{{ item.receipt_number }}</td>
                <td class="px-4 py-2">{{ item.received_by }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Amounts and Confirmation -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex-1 flex justify-center">
          <button
            v-if="tuitionInfo.id !== '000'"
            @click="confirmPayment"
            class="px-12 py-2 bg-green-600 text-white border rounded shadow-sm hover:bg-green-700 disabled:bg-gray-400"
            :disabled="isLoading || payment.status === 'ຈ່າຍແລ້ວ'"
          >
            <span v-if="isLoading">ກຳລັງດຳເນີນການ...</span>
            <span v-else>ຊຳລະ</span>
          </button>
          <div v-else class="px-12 py-2 rounded">
            <span>ບໍ່ພົບຂໍ້ມູນຄ່າ!</span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-end space-x-2">
            <div class="text-right">ຈໍານວນ</div>
            <input
              type="text"
              :value="Number(tuitionInfo.amount).toLocaleString()"
              class="w-32 px-2 py-1 border rounded text-right"
              readonly
            />
          </div>

          <div class="flex items-center justify-end space-x-2">
            <div class="text-right">ຊຳລະເງິນ</div>
            <input
              type="number"
              v-model="paidAmount"
              class="w-32 px-2 py-1 border rounded text-right"
              :disabled="payment.status === 'ຈ່າຍແລ້ວ'"
              min="0"
              @input="updatePaidAmount"
            />
          </div>

          <div class="flex items-center justify-end space-x-2">
            <div class="text-right">ເງິນທອນ</div>
            <input
              type="text"
              v-model="changeAmount"
              class="w-32 px-2 py-1 border rounded text-right"
              readonly
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
