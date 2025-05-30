<script setup lang="ts">
import { ref, computed } from "vue";
import { onMounted, watch } from "@vue/runtime-core";
import {
  getStudentReportsByYear,
  getMoneyByYearReportsByYear,
} from "../api/reports";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import html2pdf from "html2pdf.js";

const authStore = useAuthStore();
// import { api } from '../api/index';
import { getAcademicYears, getLevels, getClassesReoort } from "../api/common";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// Define interface for SchoolYear
interface SchoolYear {
  id: number;
  name: string;
  is_current?: boolean | number;
}

// ລາຍງານທີ່ເລືອກສະແດງ
const selectedReport = ref("studentList");

// ຂໍ້ມູນຕົວກອງ
const filters = ref({
  yearId: null as number | null,
  levelId: null as string | null,
  classId: null as string | null,
  month: null as string | null,
});

// ຂໍ້ມູນປີການສຶກສາ
const years = ref<SchoolYear[]>([]);

// ຂໍ້ມູນຊັ້ນຮຽນ
const levels = ref<{ id: string; name: string }[]>([]);

// ຂໍ້ມູນຫ້ອງຮຽນ
const classes = ref<{ id: string; name: string; levelId: string }[]>([]);

// ປະເພດລາຍງານ
const reportTypes = [
  { id: "studentList", name: "ລາຍງານຂໍ້ມູນນັກຮຽນ", icon: "👨‍🎓" },
  { id: "registration", name: "ລາຍງານການລົງທະບຽນ", icon: "📑" },
  { id: "gradesByLevel", name: "ຊັ້ນຮຽນ", icon: "📊" },
  { id: "gradesByClass", name: "ຫ້ອງຮຽນ", icon: "🏠" },
  { id: "financialReport", name: "ລາຍງານການເງິນ", icon: "💰" },
];

// ຂໍ້ມູນລາຍງານ
const reportData = ref({
  studentList: [] as any[],
  registration: [] as any[],
  financialReport: [] as any[],
});

// ສະຖານະການໂຫລດ
const loading = ref(false);

// ກອງຫ້ອງຮຽນຕາມຊັ້ນຮຽນທີ່ເລືອກ
const filteredClasses = computed(() => {
  return classes.value;
});

// ຟັງຊັນດຶງຂໍ້ມູນພື້ນຖານ
const fetchBasicData = async () => {
  try {
    // ດຶງຂໍ້ມູນປີການສຶກສາ
    const yearsResponse = await getAcademicYears();
    if (yearsResponse.success) {
      years.value = yearsResponse.data;
      // ตั้งค่า default เป็นปีที่ is_current === true หรือ 1
      const currentYear = years.value.find(
        (y: SchoolYear) => y.is_current === true || y.is_current === 1
      );
      if (currentYear) {
        filters.value.yearId = currentYear.id;
      }
    }

    // ດຶງຂໍ້ມູນຊັ້ນຮຽນ
    const levelsResponse = await getLevels();
    if (levelsResponse.success) {
      levels.value = levelsResponse.data;
    }

    // ດຶງຂໍ້ມູນຫ້ອງຮຽນທັງໝົດ
    const classesResponse = await getClassesReoort();
    if (classesResponse.success) {
      classes.value = classesResponse.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        levelId: c.level_id,
      }));
    }
  } catch (error) {
    console.error("ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນພື້ນຖານ:", error);
  }
};

// ຟັງຊັນດຶງຂໍ້ມູນຫ້ອງຮຽນຕາມຊັ້ນຮຽນ
const fetchClassesByLevel = async (levelId: string) => {
  if (!levelId) return;

  try {
    const response = await getClassesReoort();
    if (response.success) {
      classes.value = response.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        levelId: c.level_id,
      }));
    }
  } catch (error) {
    console.error("ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ:", error);
  }
};

// ຟັງຊັນດຶງຂໍ້ມູນລາຍງານ
const fetchReportData = async () => {
  loading.value = true;
  try {
    // ສ້າງ params ແລະກອງເອົາຄ່າ null ອອກ
    const params: { [key: string]: any } = {};

    if (filters.value.yearId !== null) params.year_id = filters.value.yearId;
    if (filters.value.levelId !== null) params.level_id = filters.value.levelId;
    if (filters.value.classId !== null) params.class_id = filters.value.classId;
    if (filters.value.month !== null) params.month = filters.value.month;

    if (selectedReport.value === "studentList") {
      try {
        if (Object.keys(params).length === 0) {
          return;
        }
        const response = await getStudentReportsByYear(params);
        if (response.success) {
          reportData.value.studentList = response.data.studentsByYear || [];
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลรายงานนักเรียน:", error);
        reportData.value.studentList = [];
      }
    } else if (selectedReport.value === "registration") {
      await fetchRegistrations();
    } else if (selectedReport.value === "financialReport") {
      // await fetchFinancialReport();
      const response = await getMoneyByYearReportsByYear(params);
      console.log("response||:", response.data.studentsByYear);
      if (response.success) {
        // Group data by school year
        const groupedByYear = response.data.studentsByYear.reduce((acc: { [key: string]: any[] }, curr: any) => {
          if (!acc[curr.school_year_name]) {
            acc[curr.school_year_name] = [];
          }
          acc[curr.school_year_name].push(curr);
          return acc;
        }, {});

        // Calculate totals and add summary rows
        const processedData = Object.entries(groupedByYear).flatMap(([year, data]) => {
          const yearData = data as any[];
          const totalAmount = yearData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
          const totalNumber = yearData.reduce((sum, item) => sum + item.number, 0);

          // Add summary row for this year
          const summaryRow = {
            amount: totalAmount.toFixed(2),
            number: totalNumber,
            school_year_name: year,
            level_name: 'ທັງໝົດ'
          };

          return [...yearData, summaryRow];
        });

        reportData.value.financialReport = processedData || [];
      }
    }
  } catch (error) {
    console.error("ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານ:", error);
  } finally {
    loading.value = false;
  }
};

const fetchRegistrations = async () => {
  try {
    const response = await axios.get(`${API_URL}/registrations`, {
      headers: {
        Authorization: `Bearer ${authStore.user?.token}`,
      },
    });

    if (response.data.success) {
      // ປັບຮູບແບບຂໍ້ມູນໃຫ້ຕົງກັບໂຄງສ້າງທີ່ໃຊ້ສະແດງຜົນ
      const formattedData = response.data.data.registrations.map(
        (reg: any) => ({
          id: reg.id || reg.invoice_id,
          registrationDate: reg.registration_date,
          studentId: reg.student_id,
          studentName: reg.student_name || "",
          studentPhone: reg.student_phone || "",
          classroom: reg.classroom || "",
          level: reg.level || "",
          schoolYear: reg.school_year || "",
          paid: reg.paid === 1 ? true : false,
        })
      );

      // ກຳນົດຂໍ້ມູນໃຫ້ກັບອາເຣເທີ່ໃຊ້ສະແດງຜົນ
      reportData.value.registration = formattedData;
    }
  } catch (err) {
    console.error("Error fetching registrations:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBasicData();
  fetchReportData();
});

// ເພີ່ມ watch ເພື່ອດັກການປ່ຽນແປງຂອງຕົວກອງ
watch(
  () => filters.value.levelId,
  (newLevelId, oldLevelId) => {
    // ຖ້າມີການປ່ຽນແປງຊັ້ນຮຽນ ໃຫ້ດຶງຂໍ້ມູນຫ້ອງຮຽນໃໝ່
    if (newLevelId !== oldLevelId) {
      filters.value.classId = null; // ຣີເຊັດຫ້ອງຮຽນທີ່ເລືອກ
      if (newLevelId) {
        fetchClassesByLevel(newLevelId);
      }
    }
  }
);

// ເພີ່ມ watch ເພື່ອດັກການປ່ຽນແປງຂອງຕົວກອງທັງໝົດ
watch(
  filters,
  () => {
    fetchReportData();
  },
  { deep: true }
);

// ຟັງຊັນເລືອກປະເພດລາຍງານ
const selectReportType = (reportType: string) => {
  selectedReport.value = reportType;
  fetchReportData();
};

// ຟັງຊັນພິມລາຍງານ
const printReport = () => {
  const element = document.getElementById("registration-print");
  if (!element) {
    alert("ບໍ່ພົບຂໍ້ມູນທີ່ຕ້ອງການພິມ");
    return;
  }
  const todayStr = new Date()
    .toISOString()
    .replace("T", "_")
    .substring(0, 19)
    .replace(/:/g, "-");

  const opt = {
    margin: 0.5,
    filename: `ການລົງທະບຽນ_${todayStr}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: [610, 1000], orientation: "portrait" }, // 210mm x 1000mm
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
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
    .catch(() => {
      console.error("Error generating PDF:");
      document.body.removeChild(loadingMessage);
      alert("ເກີດຂໍ້ຜິດພາດໃນການພິມເອກະສານ");
    });
};
// ຟັງຊັນສົ່ງອອກລາຍງານ
const exportReport = () => {
  try {
    let data: any[] = [];
    let fileName = "";

    // ກຳນົດຂໍ້ມູນຕາມປະເພດລາຍງານ
    switch (selectedReport.value) {
      case "studentList":
        data = reportData.value.studentList;
        fileName = "ລາຍງານຂໍ້ມູນນັກຮຽນ";
        break;
      case "registration":
        data = reportData.value.registration;
        fileName = "ລາຍງານການລົງທະບຽນ";
        break;
      case "financialReport":
        data = reportData.value.financialReport;
        fileName = "ລາຍງານການເງິນ";
        break;
      case "gradesByClass":
        data = filteredClasses.value;
        fileName = "ຂໍ້ມູນຫ້ອງຮຽນ";
        break;
      case "gradesByLevel":
        data = levels.value;
        fileName = "ລາຍງານຊັ້ນຮຽນ";
        break;
      default:
        throw new Error("ປະເພດລາຍງານບໍ່ຖືກຕ້ອງ");
    }
    if (data.length === 0) {
      alert("ບໍ່ມີຂໍ້ມູນໃນລາຍງານ");
      return;
    }

    // ສ້າງ worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // ສ້າງ workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // ສ້າງໄຟລ໌ Excel
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // ສ້າງລິ້ງສຳລັບດາວໂຫຼດ
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // ດາວໂຫຼດໄຟລ໌
    document.body.appendChild(link);
    link.click();

    // ລຳບັກຊັບພະຍາກອນ
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("ຂໍ້ຜິດພາດໃນການສົ່ງອອກເປັນ Excel:", error);
    alert("ການສົ່ງອອກລາຍງານລົ້ມເຫລວ");
  }
};
function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
}
</script>
<style>
@media print {
  table,
  tr,
  td,
  th {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .page-break {
    page-break-before: always;
    break-before: always;
  }
}
</style>
<template>
  <div class="reports-container">
    <!-- ສ່ວນຂອງຕົວກອງ -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block mb-2 text-sm font-medium">ປີການສຶກສາ</label>
          <select v-model="filters.yearId" class="w-full p-2 border rounded">
            <!-- <option :value="null">ທັງໝົດ</option> -->
            <option v-for="year in years" :key="year.id" :value="year.id">
              {{ year.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium">ຊັ້ນຮຽນ</label>
          <select
            v-model="filters.levelId"
            class="w-full p-2 border rounded"
            :class="[
              !(
                selectedReport === 'studentList' ||
                selectedReport === 'financialReport'
              )
                ? 'bg-gray-200 cursor-not-allowed'
                : '',
            ]"
            :disabled="
              !(
                selectedReport === 'studentList' ||
                selectedReport === 'financialReport'
              )
            "
          >
            <option :value="null">ທັງໝົດ</option>
            <option v-for="level in levels" :key="level.id" :value="level.id">
              {{ !(selectedReport === 'studentList' || selectedReport === 'financialReport') ? 'ທັງໝົດ' : level.name }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="fetchReportData"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ສະແດງຜົນ
          </button>
        </div>
      </div>
    </div>

    <!-- ເລືອກປະເພດລາຍງານ -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="report in reportTypes"
          :key="report.id"
          @click="selectReportType(report.id)"
          :class="[
            'px-4 py-2 rounded-lg flex items-center',
            selectedReport === report.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300',
          ]"
        >
          <span class="mr-2">{{ report.icon }}</span>
          {{ report.name }}
        </button>
      </div>

      <div class="space-x-2">
        <button
          @click="printReport"
          class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          🖨️ ພິມລາຍງານ
        </button>
        <button
          @click="exportReport"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📊 ສົ່ງອອກ
        </button>
      </div>
    </div>

    <!-- ສ່ວນສະແດງຜົນລາຍງານ -->
    <div id="registration-print" class="bg-white p-6 rounded-lg shadow-md">
      <!-- ສ່ວນຫົວເອກະສານ -->
      <div class="text-center mb-8 print-header">
        <!-- ສ່ວນທີ 1: ສ່ວນເທິງສຸດ - ຕຣາປະເທດລາວ -->
        <div class="mb-4 p-4 mx-auto max-w-2xl">
          <div class="flex justify-center mb-4">
            <img
              src="/src/assets/school-logo.png"
              alt="Laos Emblem"
              class="h-16"
            />
          </div>
          <h1 class="text-xl font-bold mb-1">
            ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
          </h1>
          <h2 class="text-lg mb-1">
            ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
          </h2>
          <div class="border-t border-b border-gray-400 my-2 mx-auto w-48">
            ========*****========
          </div>
        </div>

        <!-- ສ່ວນທີ 2: ໂລໂກ້ໂຮງຮຽນແລະຂໍ້ມູນໂຮງຮຽນ -->
        <div class="mb-4">
          <div class="flex flex-col items-start ml-32">
            <img
              src="/src/assets/school.png"
              alt="School Logo"
              class="h-28 mb-3"
            />
            <div class="flex flex-col items-start">
              <h4 class="text-md text-center">ໂຮງຮຽນມັດທະຍົມສົມບູນນາໂພ</h4>
              <h4 class="text-md text-center">
                ບ້ານ ນາໂພ, ເມືອງ ວຽງຄຳ, ແຂວງ ໄຊສົມບູນ
              </h4>
              <h4 class="text-md text-center">023-xxxxxxx</h4>
            </div>
          </div>
        </div>

        <!-- ສ່ວນທີ 4: ຊື່ລາຍງານ -->
        <div class="p-4 mb-4 mx-auto">
          <div class="text-center">
            <h2 class="text-xl font-bold">
              {{
                selectedReport === "studentList"
                  ? "ລາຍງານຂໍ້ມູນນັກຮຽນ"
                  : selectedReport === "gradesByClass"
                  ? "ຂໍ້ມູນຫ້ອງຮຽນ"
                  : selectedReport === "gradesByLevel"
                  ? "ລາຍງານຊັ້ນຮຽນ"
                  : selectedReport === "registration"
                  ? "ລາຍງານການລົງທະບຽນ"
                  : selectedReport === "financialReport"
                  ? "ລາຍງານການເງິນ"
                  : ""
              }}
            </h2>
          </div>
        </div>

        <!-- ສ່ວນທີ 5: ປີການສຶກສາ (ຖ້າມີ) -->
        <div v-if="filters.yearId" class="p-4 mb-4 mx-auto">
          <div class="text-center">
            <h3 class="text-lg">
              {{
                "ລາຍງານຂໍ້ມູນ" +
                (selectedReport === "studentList"
                  ? "ນັກຮຽນທັງໝົດ"
                  : selectedReport === "gradesByClass"
                  ? "ຫ້ອງຮຽນ"
                  : selectedReport === "gradesByLevel"
                  ? "ຊັ້ນຮຽນ"
                  : selectedReport === "registration"
                  ? "ການລົງທະບຽນ"
                  : selectedReport === "financialReport"
                  ? "ການເງິນ"
                  : "") +
                "ປະຈຳສົກຮຽນ" +
                (years.find((y: SchoolYear) => y.id === filters.yearId)?.name ||
                  "")
              }}
            </h3>
          </div>
        </div>
      </div>
      <!-- Loading indicator -->
      <div v-if="loading" class="flex justify-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- ສ່ວນສະແດງຜົນລາຍງານ -->
      <div v-else-if="selectedReport === 'studentList'" class="overflow-x-auto">
        <table class="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-yellow-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດນັກຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ຊື່ ແລະ ນາມສະກຸນ</th>
              <th class="border border-gray-300 px-4 py-2">ເບີໂທຜູ້ປົກຄອງ</th>
              <th class="border border-gray-300 px-4 py-2">ວັນເດືອນປີເກີດ</th>
              <th class="border border-gray-300 px-4 py-2">ບ້ານ</th>
              <th class="border border-gray-300 px-4 py-2">ເມືອງ</th>
              <th class="border border-gray-300 px-4 py-2">ແຂວງ</th>
              <th class="border border-gray-300 px-4 py-2">ເພດ</th>
              <th class="border border-gray-300 px-4 py-2">ເບີໂທຕິດຕໍ່</th>
              <th class="border border-gray-300 px-4 py-2">ຊົນເຜົ່າ</th>
              <th class="border border-gray-300 px-4 py-2">ສັນຊາດ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in reportData.studentList" :key="index">
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.student_id }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.student_name_lao }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.guardian_phone }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ formatDate(student.date_of_birth) }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.village }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.district }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.province }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.gender }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.phone_number }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.ethnicity }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.nationality }}
              </td>
            </tr>
            <tr v-if="reportData.studentList.length === 0">
              <td
                colspan="10"
                class="border border-gray-300 px-4 py-4 text-center"
              >
                ບໍ່ມີຂໍ້ມູນໃນລະບົບ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ສ່ວນສະແດງຜົນລາຍງານ -->
      <div
        v-else-if="selectedReport === 'gradesByLevel'"
        class="overflow-x-auto"
      >
        <table class="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-yellow-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດຊັ້ນຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ຊື່ຊັ້ນຮຽນ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(classData, index) in levels" :key="index">
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ classData.id }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ classData.name }}
              </td>
            </tr>
            <tr v-if="levels.length === 0">
              <td
                colspan="6"
                class="border border-gray-300 px-4 py-4 text-center"
              >
                ບໍ່ມີຂໍ້ມູນໃນລະບົບ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ສ່ວນສະແດງຜົນລາຍງານຫ້ອງຮຽນ -->
      <div
        v-else-if="selectedReport === 'gradesByClass'"
        class="overflow-x-auto"
      >
        <table class="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-yellow-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດຫ້ອງຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ຊື່ຫ້ອງຮຽນ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(classData, index) in filteredClasses" :key="index">
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ classData.id }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ classData.name }}
              </td>
            </tr>
            <tr v-if="filteredClasses.length === 0">
              <td
                colspan="6"
                class="border border-gray-300 px-4 py-4 text-center"
              >
                ບໍ່ມີຂໍ້ມູນໃນລະບົບ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ສ່ວນສະແດງຜົນລາຍງານ -->
      <div
        v-else-if="selectedReport === 'registration'"
        class="overflow-x-auto"
      >
        <table class="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-yellow-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດລົງທະບຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດນັກສືກສາ</th>
              <th class="border border-gray-300 px-4 py-2">ຊື່ ແລະ ນາມສະກຸນ</th>
              <th class="border border-gray-300 px-4 py-2">ເບີໂທຕິດຕໍ່</th>
              <th class="border border-gray-300 px-4 py-2">ຫ້ອງຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ຊັ້ນຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ສົກຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ວັນທີລົງທະບຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(registration, index) in reportData.registration"
              :key="index"
            >
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.id }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.studentId }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.studentName }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.studentPhone }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.classroom }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.level }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.schoolYear }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ formatDate(registration.registrationDate) }}
              </td>
              <td
                class="border border-gray-300 px-4 py-2"
                :class="
                  registration.paid
                    ? 'text-green-600 font-bold'
                    : 'text-red-600'
                "
              >
                {{ registration.paid ? "ຈ່າຍແລ້ວ" : "ບໍ່ຈ່າຍ" }}
              </td>
            </tr>
            <tr v-if="reportData.registration.length === 0">
              <td
                colspan="10"
                class="border border-gray-300 px-4 py-4 text-center"
              >
                ບໍ່ມີຂໍ້ມູນໃນລະບົບ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ສ່ວນສະແດງຜົນລາຍງານ -->
      <div
        v-else-if="selectedReport === 'financialReport'"
        class="overflow-x-auto"
      >
        <table class="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-yellow-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ສົກຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ຊັ້ນຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ນັກຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ເງີນ (Lak)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(finance, index) in reportData.financialReport"
              :key="index"
              :class="[finance.level_name === 'ທັງໝົດ' ? 'bg-yellow-50' : '']"
            >
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ finance.level_name === 'ທັງໝົດ' ? 'ລອມ' : index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ finance.school_year_name }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ finance.level_name }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ finance.number.toLocaleString() }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ Number(finance.amount).toLocaleString() }}
              </td>
            </tr>
            <tr v-if="reportData.financialReport.length === 0">
              <td
                colspan="5"
                class="border border-gray-300 px-4 py-4 text-center"
              >
                ບໍ່ມີຂໍ້ມູນໃນລະບົບ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ຂອບລຸ່ມ -->
      <div class="mt-8 text-right pr-10">
        <p>
          ວັນທີ {{ new Date().getDate() }}/{{ new Date().getMonth() + 1 }}/{{
            new Date().getFullYear()
          }}
        </p>
        <p class="mt-20">ຜູ້ອຳນວຍການໂຮງຮຽນ</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .reports-container > *:not(.print-header):not(.bg-white) {
    display: none;
  }

  .reports-container {
    background-color: white;
    padding: 0;
    margin: 0;
  }

  .bg-white {
    box-shadow: none;
    padding: 0;
    border-radius: 0;
  }

  @page {
    size: A4;
    margin: 10mm;
  }

  body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
  }

  .print-header {
    margin-top: 5mm;
  }

  table {
    width: 100%;
    font-size: 12pt;
  }
}
</style>
