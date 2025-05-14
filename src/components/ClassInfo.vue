<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { onMounted, watch } from "@vue/runtime-core";
import axios from "axios";

interface ClassRoom {
  id: string;
  name: string;
  level: string;
}
interface Level {
  id: string;
  name: string;
}
interface SelectedYear {
  id: string;
  name: string;
}

const API_URL = "http://localhost:5000/api";
const classes = reactive<ClassRoom[]>([]);
const selectedClass = ref<ClassRoom | null>(null);
const formClass = reactive<ClassRoom>({
  id: "",
  name: "",
  level: "",
});
const selectedYearObj = ref<SelectedYear>({
  id: "",
  name: "",
});

const classIdInput = ref("");
const searchQuery = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const errorMessageLevel = ref("");
const levels = reactive<Level[]>([]);

const filteredClasses = computed(() => {
  if (!searchQuery.value) return classes;
  const query = searchQuery.value.toLowerCase();
  return classes.filter(
    (c) =>
      c.id.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.level.toLowerCase().includes(query)
  );
});

// ດຶງຂໍ້ມູນຫ້ອງຮຽນທັງໝົດ
const fetchClasses = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    const response = await axios.get(`${API_URL}/classes`);
    if (response.data.success) {
      Object.assign(classes, response.data.data);
      if (classes.length > 0 && !selectedClass.value) {
        selectClass(classes[0]);
      }
    } else {
      errorMessage.value = "ບໍ່ສາມາດດຶງຂໍ້ມູນຫ້ອງຮຽນໄດ້";
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຫ້ອງຮຽນ";
  } finally {
    isLoading.value = false;
  }
};

// ດຶງຂໍ້ມູນຊັ້ນຮຽນທັງໝົດ
const fetchLevels = async () => {
  try {
    errorMessageLevel.value = "";
    const response = await axios.get(`${API_URL}/levels`);
    if (response.data.success) {
      Object.assign(levels, response.data.data);
    } else {
      errorMessage.value = "ບໍ່ສາມາດດຶງຂໍ້ມູນຊັ້ນຮຽນໄດ້";
    }
  } catch (error) {
    console.error("Error fetching levels:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຊັ້ນຮຽນ";
  } finally {
  }
};

watch(
  () => selectedYearObj.value, // Access the value of the ref
  (newVal) => {
    if (newVal) {
      formClass.level = newVal.name; // Access the 'name' property of SelectedYear
    } else {
      formClass.level = "";
    }
  }
);

const selectClass = (classItem: ClassRoom) => {
  selectedClass.value = classItem;
  Object.assign(formClass, classItem);
  classIdInput.value = classItem.id;
};

// เพิ่มฟังก์ชันเพื่อเชื่อมโยงชั้นเรียนกับระดับชั้น
const updateClassLevel = () => {
  // เมื่อเลือกระดับชั้น ให้อัปเดตชื่อชั้นเรียนอัตโนมัติ
  if (formClass.level && !selectedClass.value) {
    // ดึงเลขของระดับชั้น (เช่น M1, M2)
    const levelMatch = formClass.level.match(/ຊັ້ນ\s+ມ\s+(\d+)/);
    if (levelMatch && levelMatch[1]) {
      // ตั้งชื่อชั้นเรียนเป็น "M{level}/{section}" เช่น "ມ 1/1"
      formClass.name = `ມ ${levelMatch[1]}/1`;
    }
  }
};

// ติดตามการเปลี่ยนแปลงของระดับชั้น
watch(() => formClass.level, updateClassLevel);

// เพิ่มฟังก์ชันในการตรวจสอบการเชื่อมโยงระดับชั้นกับชั้นเรียน
const validateClassLevel = () => {
  if (!formClass.level) {
    errorMessage.value = "กรุณาเลือกระดับชั้น";
    return false;
  }

  // ตรวจสอบว่าชื่อชั้นเรียนสอดคล้องกับระดับชั้นหรือไม่
  const levelMatch = formClass.level.match(/ຊັ້ນ\s+ມ\s+(\d+)/);
  const nameMatch = formClass.name.match(/ມ\s+(\d+)/);

  if (levelMatch && nameMatch && levelMatch[1] !== nameMatch[1]) {
    if (
      !confirm(
        `ชั้นเรียน ${formClass.name} ไม่สอดคล้องกับระดับชั้น ${formClass.level} ต้องการดำเนินการต่อหรือไม่?`
      )
    ) {
      return false;
    }
  }

  return true;
};

// ปรับปรุงฟังก์ชัน validateForm เพื่อรวมการตรวจสอบเกี่ยวกับระดับชั้น
const validateForm = () => {
  if (!formClass.id) {
    errorMessage.value = "กรุณาระบุรหัสชั้นเรียน";
    return false;
  }

  if (!formClass.name) {
    errorMessage.value = "กรุณาระบุชื่อชั้นเรียน";
    return false;
  }

  // เพิ่มการตรวจสอบความสัมพันธ์ระหว่างชั้นเรียนกับระดับชั้น
  if (!validateClassLevel()) {
    return false;
  }

  // ตรวจสอบรหัสซ้ำเมื่อสร้างใหม่
  if (!selectedClass.value) {
    const existingClass = classes.find((c) => c.id === formClass.id);
    if (existingClass) {
      errorMessage.value = "รหัสชั้นเรียนนี้มีอยู่แล้ว";
      return false;
    }
  }

  return true;
};

const saveClass = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    if (!validateForm()) {
      isLoading.value = false;
      return;
    }

    if (selectedClass.value) {
      // ອັບເດດຫ້ອງຮຽນທີ່ມີຢູ່ແລ້ວ
      const response = await axios.put(
        `${API_URL}/classes/${selectedClass.value.id}`,
        formClass
      );
      if (response.data.success) {
        const index = classes.findIndex(
          (c) => c.id === selectedClass.value?.id
        );
        if (index !== -1) {
          classes[index] = { ...formClass };
        }
        alert("ອັບເດດຂໍ້ມູນຫ້ອງຮຽນສຳເລັດແລ້ວ");
      } else {
        errorMessage.value = "ບໍ່ສາມາດອັບເດດຂໍ້ມູນຫ້ອງຮຽນໄດ້";
      }
    } else {
      // ເພີ່ມຫ້ອງຮຽນໃໝ່
      const response = await axios.post(`${API_URL}/classes`, formClass);
      if (response.data.success) {
        classes.push({ ...response.data.data });
        selectClass(response.data.data);
        alert("ເພີ່ມຂໍ້ມູນຫ້ອງຮຽນໃໝ່ສຳເລັດແລ້ວ");
      } else {
        errorMessage.value = "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນຫ້ອງຮຽນໄດ້";
      }
    }
  } catch (error) {
    console.error("Error saving class:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນຫ້ອງຮຽນ";
  } finally {
    isLoading.value = false;
  }
};

const deleteClass = async () => {
  if (!selectedClass.value) return;

  if (
    !confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຫ້ອງຮຽນ ${selectedClass.value.name}?`)
  ) {
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    const response = await axios.delete(
      `${API_URL}/classes/${selectedClass.value.id}`
    );
    if (response.data.success) {
      const index = classes.findIndex((c) => c.id === selectedClass.value!.id);
      if (index !== -1) {
        classes.splice(index, 1);
        selectedClass.value = null;
        formClass.id = "";
        formClass.name = "";
        formClass.level = "";
        classIdInput.value = "";

        if (classes.length > 0) {
          selectClass(classes[0]);
        }
      }
      alert("ລຶບຂໍ້ມູນຫ້ອງຮຽນສຳເລັດແລ້ວ");
    } else {
      errorMessage.value = "ບໍ່ສາມາດລຶບຂໍ້ມູນຫ້ອງຮຽນໄດ້";
    }
  } catch (error) {
    console.error("Error deleting class:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຫ້ອງຮຽນ";
  } finally {
    isLoading.value = false;
  }
};

// ໂຫຼດຂໍ້ມູນເມື່ອຄອມໂພເນັນຖືກສ້າງ
onMounted(() => {
  fetchClasses();
  fetchLevels();
});

// อัปเดตฟังก์ชันสร้างชั้นเรียนใหม่เพื่อตั้งค่าระดับชั้นเริ่มต้น
const createNewClass = () => {
  selectedClass.value = null;
  formClass.id = "";
  formClass.name = "";
  formClass.level = levels.length > 0 ? levels[0].name : "";
  classIdInput.value = "";
  // หลังจากตั้งค่าระดับชั้น ให้อัปเดตชื่อชั้นเรียนอัตโนมัติ
  updateClassLevel();
  generateLevelId();
};
const generateLevelId = () => {
  if (classes.length === 0) {
    formClass.id = "001";
    classIdInput.value = "001";
    return;
  }
  const maxId = Math.max(...classes.map((l) => parseInt(l.id)));
  // console.log('ID: ', maxId)
  formClass.id = (maxId + 1).toString().padStart(3, "0");
  classIdInput.value = (maxId + 1).toString().padStart(3, "0");
};
// ໂຫຼດຂໍ້ມູນເມື່ອຄອມໂພເນັນຖືກສ້າງ
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
        <div class="mb-1">ລະຫັດຫ້ອງຮຽນ</div>
        <input
          disabled
          v-model="formClass.id"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded cursor-not-allowed"
        />
      </div>

      <!-- Name -->
      <div class="mb-4">
        <div class="mb-1">ຊື່ຫ້ອງຮຽນ</div>
        <input
          v-model="formClass.name"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <!-- Level -->
      <div class="mb-8">
        <div class="mb-1">ຊັ້ນຮຽນ</div>
        <div class="flex space-x-2">
          <input
            :value="selectedYearObj.id || '000'"
            disabled
            type="text"
            class="w-20 px-3 py-2 border border-gray-300 rounded cursor-not-allowed"
          />
          <select
            v-model="selectedYearObj"
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          >
            <option v-for="(level, index) in levels" :key="index" :value="level"
              :label="level.name">
              {{ level.name }}
            </option>
          </select>
          <button class="px-3 py-2 bg-gray-200 rounded">...</button>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex space-x-4">
        <button
          @click="deleteClass"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          :class="{
            'cursor-not-allowed opacity-60': isLoading || !selectedClass,
          }"
          :disabled="isLoading || !selectedClass"
        >
          ລົບ
        </button>
        <button
          @click="saveClass"
          :class="[
            'px-4 py-2 text-white rounded hover:bg-opacity-90',
            selectedClass
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700',
          ]"
          :disabled="isLoading"
        >
          {{ selectedClass ? "ອັບເດດ" : "ບັນທຶກ" }}
        </button>
      </div>
    </div>

    <!-- Right Column - Search and table -->
    <div class="col-span-2">
      <!-- Search -->
      <div class="flex items-center space-x-1 justify-between mb-2">
        <div class="flex items-center space-x-1 flex-grow">
          <div class="whitespace-nowrap">ຄົ້ນຫາຊື່ຫ້ອງຮຽນ</div>
          <input
            v-model="searchQuery"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button
          @click="createNewClass"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
          :disabled="isLoading"
        >
          ເພີ່ມ
        </button>
      </div>

      <!-- Table headers -->
      <div class="grid grid-cols-3 bg-gray-400 p-2 text-left">
        <div>ລະຫັດຫ້ອງຮຽນ</div>
        <div>ຊື່ຫ້ອງຮຽນ</div>
        <div>ຊັ້ນຮຽນ</div>
      </div>

      <!-- Table rows -->
      <div class="max-h-64 overflow-y-auto">
        <div
          v-for="(classItem, index) in filteredClasses"
          :key="index"
          @click="selectClass(classItem)"
          :class="[
            'grid grid-cols-3 p-2 cursor-pointer',
            selectedClass?.id === classItem.id
              ? 'bg-blue-600 text-white'
              : index % 2 !== 0
              ? 'bg-gray-100'
              : '',
          ]"
        >
          <div>{{ classItem.id }}</div>
          <div>{{ classItem.name }}</div>
          <div>{{ classItem.level }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
