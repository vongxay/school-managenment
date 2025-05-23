<script setup lang="ts">
import { ref, computed } from "vue";
import { onMounted } from "@vue/runtime-dom";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/authStore";
import SideBar from "./components/SideBar.vue";
import HeaderBar from "./components/HeaderBar.vue";
import StudentForm from "./components/StudentForm.vue";
import StudentList from "./components/StudentList.vue";
import ClassInfo from "./components/ClassInfo.vue";
import Dashboard from "./components/Dashboard.vue";
import YearInfo from "./components/YearInfo.vue";
import TuitionInfo from "./components/TuitionInfo.vue";
import UserInfo from "./components/UserInfo.vue";
import Registration from "./components/Registration.vue";
import Payment from "./components/Payment.vue";
import Reports from "./components/Reports.vue";
import LevelInfo from "./components/LevelInfo.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Active menu selection from sidebar
const activeMenu = ref("dashboard");

// For student section - toggle between list and form views
const studentTab = ref("list"); // 'list' or 'form'

// Toggle font demo section
const showFontDemo = ref(false);

const showDeniedDialog = ref(false);
const deniedText = ref("");

// Handle switching to form view when student is selected
const switchToFormView = () => {
  studentTab.value = "form";
};

// Check if we're on a public page (login or register)
const isPublicPage = computed(() => {
  return route.path === "/login" || route.path === "/register";
});
const userSession = JSON.parse(localStorage.getItem("currentUser") || "null");

// Computed to determine which component to display based on activeMenu
const activeComponent = computed(() => {
  switch (activeMenu.value) {
    case "dashboard":
      return Dashboard;
    case "studentInfo":
      return studentTab.value === "list" ? StudentList : StudentForm;
    case "classInfo":
      return ClassInfo;
    case "levelInfo":
      return LevelInfo;
    case "yearInfo":
      return YearInfo;
    case "tuitionInfo":
      return TuitionInfo;
    case "userInfo":
      return UserInfo;
    case "registration":
      return Registration;
    case "payment":
      return Payment;
    case "reports":
      return Reports;
    default:
      return Dashboard;
  }
});

const menuPermissions: Record<string, string[]> = {
  "T-money": ["dashboard", "tuitionInfo", "payment", "reports"],
  teacher: ["dashboard", "studentInfo", "registration", "payment", "reports"],
  admin: ["*"],
  "T-admin": ["*"],
};

const canAccessMenu = (role: string, menu: string) => {
  const allowed = menuPermissions[role];
  return allowed && (allowed.includes(menu) || allowed.includes("*"));
};

// Handle menu selection from sidebar
const handleMenuSelect = (menuId: string) => {
  if (!userSession || !userSession.role) return;

  if (canAccessMenu(userSession.role, menuId)) {
    activeMenu.value = menuId;
    if (menuId === "studentInfo") {
      studentTab.value = "list";
    }
  } else {
    showDeniedDialog.value = true;
    deniedText.value = "Account ຂອງທ່ານບໍ່ມີສີດເຂົ້າເຖີງສ່ວນນີ້.";
  }
};
// Check auth state on component mounted
onMounted(() => {
  // Initialize auth from localStorage if available
  if (authStore.isAuthenticated && !isPublicPage.value) {
    // Set the active menu to dashboard
    activeMenu.value = "dashboard";
  } else if (!authStore.isAuthenticated && !isPublicPage.value) {
    // If user is not authenticated, redirect to login
    router.push("/login");
  }
});
</script>

<template>
  <div class="h-screen bg-gray-100">
    <!-- Login and Register Pages without Dashboard UI -->
    <router-view v-if="isPublicPage"></router-view>

    <!-- Dashboard Layout -->
    <div v-else class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <SideBar @menu-select="handleMenuSelect" :active-menu="activeMenu" />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <HeaderBar />

        <!-- Content Area -->
        <div class="flex-1 overflow-auto p-6">
          <div class="max-w-7xl mx-auto">
            <!-- Title and sub-navigation -->
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold text-gray-900">
                {{
                  activeMenu === "dashboard"
                    ? "ຫນ້າຫລັກ"
                    : activeMenu === "studentInfo"
                    ? "ຂໍ້ມູນນັກຮຽນ"
                    : activeMenu === "classInfo"
                    ? "ຂໍ້ມູນຫ້ອງຮຽນ"
                    : activeMenu === "levelInfo"
                    ? "ຂໍ້ມູນຊັ້ນຮຽນ"
                    : activeMenu === "yearInfo"
                    ? "ຂໍ້ມູນສົກຮຽນ"
                    : activeMenu === "tuitionInfo"
                    ? "ຂໍ້ມູນຄ່າຮຽນ"
                    : activeMenu === "userInfo"
                    ? "ຂໍ້ມູນຜູ້ໃຊ້ລະບົບ"
                    : activeMenu === "registration"
                    ? "ການລົງທະບຽນ"
                    : activeMenu === "payment"
                    ? "ການຈ່າຍຄ່າຮຽນ"
                    : activeMenu === "reports"
                    ? "ລາຍງານ"
                    : "ໂຮງຮຽນ ສປປ ລາວ"
                }}
              </h1>

              <div
                v-if="showDeniedDialog"
                class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
              >
                <div class="bg-white p-6 rounded shadow text-center">
                  <p class="mb-4 text-red-600 font-bold">{{ deniedText }}</p>
                  <button
                    class="px-4 py-2 bg-blue-500 text-white rounded"
                    @click="showDeniedDialog = false"
                  >
                    OK
                  </button>
                </div>
              </div>
              <!-- Show sub-tabs for student info and registration sections -->
              <div
                v-if="
                  activeMenu === 'studentInfo' || activeMenu === 'registration'
                "
                class="space-x-2"
              >
                <button
                  @click="
                    activeMenu = 'studentInfo';
                    studentTab = 'list';
                  "
                  :class="[
                    'px-4 py-2 rounded-lg',
                    activeMenu === 'studentInfo' && studentTab === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300',
                  ]"
                >
                  ລາຍຊື່ນັກຮຽນ
                </button>
                <button
                  @click="
                    activeMenu = 'studentInfo';
                    studentTab = 'form';
                  "
                  :class="[
                    'px-4 py-2 rounded-lg',
                    activeMenu === 'studentInfo' && studentTab === 'form'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300',
                  ]"
                >
                  ແບບຟອມລົງທະບຽນ
                </button>
              </div>
            </div>

            <!-- Font Demo Section -->
            <div v-if="showFontDemo" class="mb-6">
              <LaoFontDemo />
            </div>

            <!-- Dynamic component based on active menu -->
            <component
              :is="activeComponent"
              @switch-to-form="switchToFormView"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
