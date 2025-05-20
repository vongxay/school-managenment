<script setup lang="ts">
import { ref, computed } from 'vue';
import { onMounted, watch } from '@vue/runtime-core';
import {
  getStudentReports,
  getFinancialReports,
  getAcademicReports,
} from '../api/reports';
import { api } from '../api/index';
import { getAcademicYears, getLevels, getClasses } from '../api/common';
import * as XLSX from 'xlsx';

// Define interface for SchoolYear
interface SchoolYear {
  id: number;
  name: string;
  is_current?: boolean | number;
}

// ລາຍງານທີ່ເລືອກສະແດງ
const selectedReport = ref('studentList');

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
  { id: 'studentList', name: 'ລາຍງານຂໍ້ມູນນັກຮຽນ', icon: '👨‍🎓' },
  { id: 'gradesByClass', name: 'ຂໍ້ມູນນັກຮຽນຕາມຊັ້ນຮຽນ', icon: '🏠' },
  // { id: 'reportersByClass', name: 'ຫ້ອງຮຽນ', icon: '🏠' },
  { id: 'gradesByLevel', name: 'ຊັ້ນຮຽນ', icon: '📊' },
  { id: 'registration', name: 'ລາຍງານການລົງທະບຽນ', icon: '📑' },
  { id: 'financialReport', name: 'ລາຍງານການເງິນ', icon: '💰' },
];

// ຂໍ້ມູນລາຍງານ
const reportData = ref({
  studentList: [] as any[],
  gradesByClass: [] as any[],
  gradesByLevel: [] as any[],
  registration: [] as any[],
  financialReport: [] as any[],
  // reportersByClass: [] as any[],
});

// ສະຖານະການໂຫລດ
const loading = ref(false);

// ກອງຫ້ອງຮຽນຕາມຊັ້ນຮຽນທີ່ເລືອກ
const filteredClasses = computed(() => {
  if (!filters.value.levelId) return classes.value;
  return classes.value.filter(c => c.levelId === filters.value.levelId);
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
    const classesResponse = await getClasses();
    if (classesResponse.success) {
      classes.value = classesResponse.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        levelId: c.level_id
      }));
    }
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນພື້ນຖານ:', error);
  }
};

// ຟັງຊັນດຶງຂໍ້ມູນຫ້ອງຮຽນຕາມຊັ້ນຮຽນ
const fetchClassesByLevel = async (levelId: string) => {
  if (!levelId) return;

  try {
    const response = await getClasses(levelId);
    if (response.success) {
      classes.value = response.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        levelId: c.level_id
      }));
    }
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ:', error);
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

    if (selectedReport.value === 'studentList') {
      try {
        console.log('ຂໍ້ມູນລາຍງານນັກຮຽນPP:', params);
        const response = await getStudentReports(params);
        if (response.success) {
          console.log('ຂໍ້ມູນລາຍງານLL:', response.data);
          reportData.value.studentList = response.data.studentList || [];
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายงานนักเรียน:', error);
        reportData.value.studentList = [];
      }
    }  else if (selectedReport.value === 'gradesByClass') {
      try {
        const response = await getAcademicReports(params);
        if (response.success) {
          reportData.value.gradesByClass = response.data.gradesByClass || [];
        }
      } catch (error) {
        console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານຫ້ອງຮຽນ:', error);
        reportData.value.gradesByClass = [];
      }
    } else if (selectedReport.value === 'gradesByLevel') {
      try {
        const response = await getAcademicReports(params);
        if (response.success) {
          reportData.value.gradesByLevel = response.data.gradesByLevel || [];
        }
      } catch (error) {
        console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນນັກຮຽນຕາມຊັ້ນຮຽນ:', error);
        reportData.value.gradesByLevel = [];
      }
    } else if (selectedReport.value === 'registration') {
      try {
        const response = await getStudentReports(params);
        if (response.success) {
          reportData.value.registration = response.data.registration || [];
        } else {
          // ຖ້າບໍ່ມີຂໍ້ມູນໃນການຕອບກັບ ໃຫ້ລອງດຶງຂໍ້ມູນຈາກ endpoint ເພີ່ມເຕີມ
          const registrationResponse = await api.get('/reports/registration', { params });
          if (registrationResponse.data.success) {
            reportData.value.registration = registrationResponse.data.data.registration || [];
          }
        }
      } catch (error) {
        console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານການລົງທະບຽນ:', error);
        reportData.value.registration = [];
      }
    } else if (selectedReport.value === 'financialReport') {
      try {
        const response = await getFinancialReports(params);
        if (response.success) {
          reportData.value.financialReport = response.data.financialReport || [];
        }
      } catch (error) {
        console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານການເງິນ:', error);
        reportData.value.financialReport = [];
      }
    }
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານ:', error);
  } finally {
    loading.value = false;
  }
};

// ເອີ້ນຂໍ້ມູນເມື່ອຄອມໂພເນນໂຫລດສຳເລັດ ແລະເມື່ອມີການປ່ຽນແປງຕົວກອງ
onMounted(() => {
  fetchBasicData();
  fetchReportData();
});

// ເພີ່ມ watch ເພື່ອດັກການປ່ຽນແປງຂອງຕົວກອງ
watch(() => filters.value.levelId, (newLevelId, oldLevelId) => {
  // ຖ້າມີການປ່ຽນແປງຊັ້ນຮຽນ ໃຫ້ດຶງຂໍ້ມູນຫ້ອງຮຽນໃໝ່
  if (newLevelId !== oldLevelId) {
    filters.value.classId = null;  // ຣີເຊັດຫ້ອງຮຽນທີ່ເລືອກ
    if (newLevelId) {
      fetchClassesByLevel(newLevelId);
    }
  }
});

// ເພີ່ມ watch ເພື່ອດັກການປ່ຽນແປງຂອງຕົວກອງທັງໝົດ
watch(filters, () => {
  fetchReportData();
}, { deep: true });

// ຟັງຊັນເລືອກປະເພດລາຍງານ
const selectReportType = (reportType: string) => {
  selectedReport.value = reportType;
  fetchReportData();
};

// ຟັງຊັນພິມລາຍງານ
const printReport = () => {
  window.print();
};

// ຟັງຊັນສົ່ງອອກລາຍງານ
const exportReport = () => {
  try {
    let data: any[] = [];
    let fileName = '';

    // ກຳນົດຂໍ້ມູນຕາມປະເພດລາຍງານ
    switch (selectedReport.value) {
      case 'studentList':
        data = reportData.value.studentList;
        fileName = 'ລາຍງານຂໍ້ມູນນັກຮຽນ';
        break;
      case 'registration':
        data = reportData.value.registration;
        fileName = 'ລາຍງານການລົງທະບຽນ';
        break;
      case 'financialReport':
        data = reportData.value.financialReport;
        fileName = 'ລາຍງານການເງິນ';
        break;
      case 'gradesByClass':
        data = reportData.value.gradesByClass;
        fileName = 'ຂໍ້ມູນນັກຮຽນຕາມຊັ້ນຮຽນ';
        break;
      case 'gradesByLevel':
        data = reportData.value.gradesByLevel;
        fileName = 'ລາຍງານຄະແນນຕາມຊັ້ນຮຽນ';
        break;
      default:
        throw new Error('ປະເພດລາຍງານບໍ່ຖືກຕ້ອງ');
    }
    if (data.length === 0) {
      alert('ບໍ່ມີຂໍ້ມູນໃນລາຍງານ');
      return;
    }

    // ສ້າງ worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // ສ້າງ workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // ສ້າງໄຟລ໌ Excel
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // ສ້າງລິ້ງສຳລັບດາວໂຫຼດ
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`;

    // ດາວໂຫຼດໄຟລ໌
    document.body.appendChild(link);
    link.click();

    // ລຳບັກຊັບພະຍາກອນ
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການສົ່ງອອກເປັນ Excel:', error);
    alert('ການສົ່ງອອກລາຍງານລົ້ມເຫລວ');
  }
};
</script>

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
          <select v-model="filters.levelId" class="w-full p-2 border rounded">
            <option :value="null">ທັງໝົດ</option>
            <option v-for="level in levels" :key="level.id" :value="level.id">
              {{ level.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium">ຫ້ອງຮຽນ</label>
          <select v-model="filters.classId" class="w-full p-2 border rounded">
            <option :value="null">ທັງໝົດ</option>
            <option
              v-for="class_ in filteredClasses"
              :key="class_.id"
              :value="class_.id"
            >
              {{ class_.name }}
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
    <div class="bg-white p-6 rounded-lg shadow-md">
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
                  ? "ຂໍ້ມູນນັກຮຽນຕາມຊັ້ນຮຽນ"
                  : selectedReport === "gradesByLevel"
                  ? "ລາຍງານຄະແນນຕາມຊັ້ນຮຽນ"
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
              ລາຍງານຂໍ້ມູນນັກຮຽນທີ່ລົງທະບຽນແລ້ວປະຈຳສົກຮຽນ
              {{ years.find((y: SchoolYear) => y.id === filters.yearId)?.name }}
              <span v-if="filters.levelId">
                ຊັ້ນ
                {{ levels.find((l: any) => l.id === filters.levelId)?.name }}
              </span>
              <span v-if="filters.classId && filters.levelId">
                ຫ້ອງ
                {{ classes.find((c: any) => c.id === filters.classId)?.name }}
              </span>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in reportData.studentList" :key="index">
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.studentId }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.name }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.parentPhone }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.dob }}
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
                {{ student.phone }}
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

      <!-- ສ່ວນສະແດງຜົນລາຍງານຕາມຊັ້ນຮຽນ -->
      <div
        v-else-if="selectedReport === 'gradesByClass'"
        class="overflow-x-auto"
      >
        <table class="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
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
              <th class="border border-gray-300 px-4 py-2">ຊັ້ນຮຽນ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(student, index) in reportData.gradesByClass"
              :key="index"
            >
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.studentId }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.name }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.class }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.math }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.science }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.language }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ student.average }}
              </td>
            </tr>
            <tr v-if="reportData.gradesByClass.length === 0">
              <td
                colspan="8"
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
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດຊັ້ນຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ຊື່ຊັ້ນຮຽນ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(classData, index) in reportData.gradesByLevel"
              :key="index"
            >
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ classData.classId }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ classData.className }}
              </td>
            </tr>
            <tr v-if="reportData.gradesByLevel.length === 0">
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
        v-else-if="selectedReport === 'reportersByClass'"
        class="overflow-x-auto"
      >
        <table class="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດຫ້ອງຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ຊື່ຫ້ອງຮຽນ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(classData) in 2"
              :key="classData"
            >
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ classData + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <!-- {{ classData.classId }} -->
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <!-- {{ classData.className }} -->
              </td>
            </tr>
            <tr v-if="reportData.gradesByLevel.length === 0">
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
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດນັກສືກສາ</th>
              <th class="border border-gray-300 px-4 py-2">ລະຫັດປະຈຳຕົວ</th>
              <th class="border border-gray-300 px-4 py-2">ຊື່ ແລະ ນາມສະກຸນ</th>
              <th class="border border-gray-300 px-4 py-2">ເລກບັດປະຈຳຕົວ</th>
              <th class="border border-gray-300 px-4 py-2">ເພດ</th>
              <th class="border border-gray-300 px-4 py-2">ຊັ້ນຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ຫ້ອງຮຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ວັນທີລົງທະບຽນ</th>
              <th class="border border-gray-300 px-4 py-2">ສະຖານະພາບ</th>
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
                {{ registration.code }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.name }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.idNumber }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.gender }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.level }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.class }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.regDate }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ registration.status }}
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
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2">ລ/ດ</th>
              <th class="border border-gray-300 px-4 py-2">ເດືອນ</th>
              <th class="border border-gray-300 px-4 py-2">ລາຍຮັບ (ກີບ)</th>
              <th class="border border-gray-300 px-4 py-2">ລາຍຈ່າຍ (ກີບ)</th>
              <th class="border border-gray-300 px-4 py-2">ຍອດເຫຼືອ (ກີບ)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(finance, index) in reportData.financialReport"
              :key="index"
            >
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ index + 1 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ finance.month }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ finance.income.toLocaleString() }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ finance.expenses.toLocaleString() }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-right">
                {{ finance.balance.toLocaleString() }}
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
