<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { onMounted } from "@vue/runtime-core";
import axios from "axios";

interface SchoolYear {
  id: string;
  period: string;
  is_current?: boolean;
}

const API_URL = "http://localhost:5000/api";
const schoolYears = reactive<SchoolYear[]>([]);
const selectedYear = ref<SchoolYear | null>(null);
const formYear = reactive<SchoolYear>({
  id: "",
  period: "",
});
const searchQuery = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const filteredYears = computed(() => {
  if (!searchQuery.value) return schoolYears;
  const query = searchQuery.value.toLowerCase();
  return schoolYears.filter(
    (y) =>
      y.id.toLowerCase().includes(query) ||
      y.period.toLowerCase().includes(query)
  );
});

// ດຶງຂໍ້ມູນສົກຮຽນທັງໝົດ
const fetchYears = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    const response = await axios.get(`${API_URL}/years`);
    if (response.data.success) {
      Object.assign(schoolYears, response.data.data);
      if (schoolYears.length > 0 && !selectedYear.value) {
        selectYear(schoolYears[0]);
      }
    } else {
      errorMessage.value = "ບໍ່ສາມາດດຶງຂໍ້ມູນສົກຮຽນໄດ້";
    }
  } catch (error) {
    console.error("Error fetching school years:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສົກຮຽນ";
  } finally {
    isLoading.value = false;
    createCurrentSchoolYear();
  }
};

const selectYear = (year: SchoolYear) => {
  selectedYear.value = year;
  Object.assign(formYear, year);
};

const createNewYear = () => {
  // ຕັ້ງຄ່າຟອມໃຫ້ເປັນຄ່າເລີ່ມຕົ້ນສຳລັບການສ້າງໃໝ່
  selectedYear.value = null;
  if (schoolYears.length > 0) {
    const maxId = Math.max(...schoolYears.map((y) => parseInt(y.id)));
    formYear.id = (maxId + 1).toString().padStart(3, "0");
    formYear.period = "";
  } else {
    formYear.id = "001";
    const currentYear = new Date().getFullYear();
    formYear.period = `${currentYear}-${currentYear + 1}`;
  }
};

const validateYearForm = () => {
  if (!formYear.period) {
    errorMessage.value = "ກະລຸນາປ້ອນສົກຮຽນ";
    return false;
  }

  // ກວດສອບຮູບແບບຂອງສົກຮຽນ (YYYY-YYYY)
  const yearPattern = /^\d{4}-\d{4}$/;
  if (!yearPattern.test(formYear.period)) {
    errorMessage.value = "ກະລຸນາປ້ອນສົກຮຽນໃນຮູບແບບ YYYY-YYYY";
    return false;
  }

  // ກວດສອບວ່າປີເລີ່ມຕົ້ນຕ້ອງນ້ອຍກວ່າປີສິ້ນສຸດ
  const years = formYear.period.split("-");
  if (parseInt(years[0]) >= parseInt(years[1])) {
    errorMessage.value = "ປີເລີ່ມຕົ້ນຕ້ອງນ້ອຍກວ່າປີສິ້ນສຸດ";
    return false;
  }

  // ກວດສອບລະຫັດເມື່ອສ້າງໃໝ່
  if (!selectedYear.value && !formYear.id) {
    errorMessage.value = "ກະລຸນາປ້ອນລະຫັດສົກຮຽນ";
    return false;
  }

  // ກວດສອບວ່າມີລະຫັດຊ້ຳກັນຫຼືບໍ່
  if (!selectedYear.value) {
    // ກໍລະນີສ້າງໃໝ່
    const existingYear = schoolYears.find((y) => y.id === formYear.id);
    if (existingYear) {
      errorMessage.value = "ລະຫັດສົກຮຽນນີ້ມີຢູ່ແລ້ວ";
      return false;
    }
  }

  return true;
};

const saveYear = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    if (!validateYearForm()) {
      isLoading.value = false;
      return;
    }

    if (selectedYear.value) {
      // ອັບເດດສົກຮຽນທີ່ມີຢູ່ແລ້ວ
      const response = await axios.put(
        `${API_URL}/years/${selectedYear.value.id}`,
        formYear
      );
      if (response.data.success) {
        const index = schoolYears.findIndex(
          (y) => y.id === selectedYear.value?.id
        );
        if (index !== -1) {
          schoolYears[index] = { ...formYear };
        }
        alert("ອັບເດດຂໍ້ມູນສົກຮຽນສຳເລັດແລ້ວ");
      } else {
        errorMessage.value = "ບໍ່ສາມາດອັບເດດຂໍ້ມູນສົກຮຽນໄດ້";
      }
    } else {
      // ເພີ່ມສົກຮຽນໃໝ່
      const response = await axios.post(`${API_URL}/years`, formYear);
      if (response.data.success) {
        schoolYears.push({ ...response.data.data });
        selectYear(response.data.data);
        alert("ເພີ່ມຂໍ້ມູນສົກຮຽນໃໝ່ສຳເລັດແລ້ວ");
      } else {
        errorMessage.value = "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນສົກຮຽນໄດ້";
      }
    }
  } catch (error) {
    console.error("Error saving school year:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນສົກຮຽນ";
  } finally {
    isLoading.value = false;
  }
};

const deleteYear = async () => {
  if (!selectedYear.value) return;

  if (
    !confirm(
      `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນສົກຮຽນ ${selectedYear.value.period}?`
    )
  ) {
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    const response = await axios.delete(
      `${API_URL}/years/${selectedYear.value.id}`
    );
    if (response.data.success) {
      const index = schoolYears.findIndex(
        (y) => y.id === selectedYear.value!.id
      );
      if (index !== -1) {
        schoolYears.splice(index, 1);
        selectedYear.value = null;
        formYear.id = "";
        formYear.period = "";

        if (schoolYears.length > 0) {
          selectYear(schoolYears[0]);
        }
      }
      alert("ລຶບຂໍ້ມູນສົກຮຽນສຳເລັດແລ້ວ");
    } else {
      errorMessage.value = "ບໍ່ສາມາດລຶບຂໍ້ມູນສົກຮຽນໄດ້";
    }
  } catch (error) {
    console.error("Error deleting school year:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນສົກຮຽນ";
  } finally {
    isLoading.value = false;
  }
};

// ເພີ່ມຟັງຊັນສຳລັບສ້າງຂໍ້ມູນປີປັດຈຸບັນ
const createCurrentSchoolYear = () => {
  if (schoolYears.length > 0) {
    const currentYear = schoolYears.find((year) => year.is_current);
    if (currentYear) {
      formYear.period = currentYear.period;
      formYear.id = currentYear.id;
      selectYear(currentYear);
    }
    else {
      alert("ບໍ່ໄດ້ຕັ້ງປີປະຈຸດບັນ");
    }
  } else {
    formYear.id = "001";
    const currentYear = new Date().getFullYear();
    formYear.period = `${currentYear}-${currentYear + 1}`;
  }
};

// ໂຫຼດຂໍ້ມູນເມື່ອຄອມໂພເນັນຖືກສ້າງ
onMounted(fetchYears);

// เพิ่มฟังก์ชันสำหรับกำหนดปีการศึกษาปัจจุบัน
const setCurrentYear = async (year: SchoolYear) => {
  if (
    !year ||
    !confirm(`ต้องการกำหนดให้ "${year.period}" เป็นปีการศึกษาปัจจุบันหรือไม่?`)
  ) {
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    // อัปเดตทุกปีการศึกษาให้ไม่เป็นปีปัจจุบัน
    for (const y of schoolYears) {
      if (y.is_current && y.id !== year.id) {
        try {
          await axios.put(`${API_URL}/years/${y.id}`, {
            ...y,
            is_current: false,
          });
        } catch (error) {
          console.error("Error updating year current status:", error);
        }
      }
    }

    // ตั้งค่าปีที่เลือกเป็นปีปัจจุบัน
    const response = await axios.put(`${API_URL}/years/${year.id}`, {
      ...year,
      is_current: true,
    });

    if (response.data.success) {
      // อัปเดตข้อมูลในอาร์เรย์
      schoolYears.forEach((y) => {
        y.is_current = y.id === year.id;
      });

      alert(`ตั้งค่า "${year.period}" เป็นปีการศึกษาปัจจุบันเรียบร้อยแล้ว`);
    } else {
      errorMessage.value = "ไม่สามารถตั้งค่าปีการศึกษาปัจจุบันได้";
    }
  } catch (error) {
    console.error("Error setting current year:", error);
    errorMessage.value = "เกิดข้อผิดพลาดในการตั้งค่าปีการศึกษาปัจจุบัน";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
    <!-- ຂໍ້ຄວາມແຈ້ງເຕືອນຄວາມຜິດພາດ -->
    <div
      v-if="errorMessage"
      class="col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    >
      {{ errorMessage }}
    </div>

    <!-- ຂໍ້ຄວາມກຳລັງໂຫຼດ -->
    <div v-if="isLoading" class="col-span-3 flex justify-center items-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"
      ></div>
    </div>

    <!-- Left Column - Form inputs -->
    <div class="border-r pr-4 col-span-1">
      <!-- ID -->
      <div class="mb-4">
        <div class="mb-1">ລະຫັດສົກຮຽນ</div>
        <input
          v-model="formYear.id"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded"
          disabled
        />
      </div>

      <!-- Period -->
      <div class="mb-8">
        <div class="mb-1">ສົກຮຽນ</div>
        <div class="flex">
          <input
            v-model="formYear.period"
            type="text"
            placeholder="YYYY-YYYY"
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
          <button
            @click="createCurrentSchoolYear"
            class="px-3 py-2 bg-gray-200 rounded ml-2"
            title="ສ້າງສົກຮຽນປັດຈຸບັນ"
            :disabled="isLoading"
          >
            ປະຈຸບັນ
          </button>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex space-x-4">
        <button
          @click="deleteYear"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          :disabled="isLoading || !selectedYear"
        >
          ລຶບ
        </button>
        <button
          @click="saveYear"
          :class="[
            'px-4 py-2 text-white rounded hover:bg-opacity-90',
            selectedYear
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700',
          ]"
          :disabled="isLoading"
        >
          {{ selectedYear ? "ອັບເດດ" : "ບັນທຶກ" }}
        </button>
      </div>
    </div>

    <!-- Right Column - Search and table -->
    <div class="col-span-2">
      <!-- Search and Add button -->
      <div class="flex items-center space-x-1 justify-between mb-2">
        <div class="flex items-center space-x-1 flex-grow">
          <div class="whitespace-nowrap">ຄົ້ນຫາສົກຮຽນ</div>
          <input
            v-model="searchQuery"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button
          @click="createNewYear"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
          :disabled="isLoading"
        >
          ເພີ່ມ
        </button>
      </div>

      <!-- Table headers -->
      <div class="grid grid-cols-3 bg-gray-400 p-2 text-left">
        <div>ລະຫັດສົກຮຽນ</div>
        <div>ສົກຮຽນ</div>
        <div>ສະຖານະ</div>
      </div>

      <!-- Table rows -->
      <div class="max-h-64 overflow-y-auto">
        <div
          v-for="(year, index) in filteredYears"
          :key="index"
          @click="selectYear(year)"
          :class="[
            'grid grid-cols-3 p-2 cursor-pointer',
            selectedYear?.id === year.id
              ? 'bg-blue-600 text-white'
              : index % 2 !== 0
              ? 'bg-gray-100'
              : 'bg-white',
          ]"
        >
          <div>{{ year.id }}</div>
          <div>{{ year.period }}</div>
          <div class="flex items-center justify-between">
            <span v-if="year.is_current" class="text-green-600 font-bold"
              >ປີປັດຈຸບັນ</span
            >
            <span v-else>-</span>
            <button
              v-if="!year.is_current"
              @click.stop="setCurrentYear(year)"
              class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              :disabled="isLoading"
            >
              ຕັ້ງເປັນປີປັດຈຸບັນ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
