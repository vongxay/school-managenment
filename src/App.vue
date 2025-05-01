<script setup lang="ts">
import { ref, computed } from 'vue';
import SideBar from './components/SideBar.vue';
import HeaderBar from './components/HeaderBar.vue';
import StudentForm from './components/StudentForm.vue';
import StudentList from './components/StudentList.vue';
import ClassInfo from './components/ClassInfo.vue';
import Dashboard from './components/Dashboard.vue';
import YearInfo from './components/YearInfo.vue';
import TuitionInfo from './components/TuitionInfo.vue';
import UserInfo from './components/UserInfo.vue';
import Registration from './components/Registration.vue';
import Payment from './components/Payment.vue';
import Reports from './components/Reports.vue';
import LevelInfo from './components/LevelInfo.vue';
import LaoFontDemo from './components/LaoFontDemo.vue';

// Active menu selection from sidebar
const activeMenu = ref('dashboard');

// For student section - toggle between list and form views
const studentTab = ref('list'); // 'list' or 'form'

// Toggle font demo section
const showFontDemo = ref(false);

// Handle switching to form view when student is selected
const switchToFormView = () => {
  studentTab.value = 'form';
};

// Computed to determine which component to display based on activeMenu
const activeComponent = computed(() => {
  switch (activeMenu.value) {
    case 'dashboard':
      return Dashboard;
    case 'studentInfo':
      return studentTab.value === 'list' ? StudentList : StudentForm;
    case 'classInfo':
      return ClassInfo;
    case 'levelInfo':
      return LevelInfo;
    case 'yearInfo':
      return YearInfo;
    case 'tuitionInfo':
      return TuitionInfo;
    case 'userInfo':
      return UserInfo;
    case 'registration':
      return Registration;
    case 'payment':
      return Payment;
    case 'reports':
      return Reports;
    default:
      return Dashboard;
  }
});

// Handle menu selection from sidebar
const handleMenuSelect = (menuId: string) => {
  activeMenu.value = menuId;
  // Reset sub-tabs when changing main menu
  if (menuId === 'studentInfo') {
    studentTab.value = 'list';
  }
};

// Toggle font demo display
const toggleFontDemo = () => {
  showFontDemo.value = !showFontDemo.value;
};
</script>

<template>
  <div class="flex h-screen bg-gray-100">
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
              {{ activeMenu === 'dashboard' ? 'ຫນ້າຫລັກ' : 
                 activeMenu === 'studentInfo' ? 'ຂໍ້ມູນນັກຮຽນ' : 
                 activeMenu === 'classInfo' ? 'ຂໍ້ມູນຫ້ອງຮຽນ' : 
                 activeMenu === 'levelInfo' ? 'ຂໍ້ມູນຊັ້ນຮຽນ' : 
                 activeMenu === 'yearInfo' ? 'ຂໍ້ມູນສົກຮຽນ' : 
                 activeMenu === 'tuitionInfo' ? 'ຂໍ້ມູນຄ່າຮຽນ' : 
                 activeMenu === 'userInfo' ? 'ຂໍ້ມູນຜູ້ໃຊ້ລະບົບ' : 
                 activeMenu === 'registration' ? 'ການລົງທະບຽນ' : 
                 activeMenu === 'payment' ? 'ການຈ່າຍຄ່າຮຽນ' : 
                 activeMenu === 'reports' ? 'ລາຍງານ' : 'ໂຮງຮຽນ ສປປ ລາວ' }}
            </h1>
            
            <!-- Show sub-tabs for student info and registration sections -->
            <div v-if="activeMenu === 'studentInfo' || activeMenu === 'registration'" class="space-x-2">
              <button 
                @click="activeMenu = 'studentInfo'; studentTab = 'list'"
                :class="[
                  'px-4 py-2 rounded-lg',
                  activeMenu === 'studentInfo' && studentTab === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                ]"
              >
                ລາຍຊື່ນັກຮຽນ
              </button>
              <button 
                @click="activeMenu = 'registration'"
                :class="[
                  'px-4 py-2 rounded-lg',
                  activeMenu === 'registration'
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                ]"
              >
                ແບບຟອມລົງທະບຽນ
              </button>
            </div>
            
            <!-- Font demo toggle button -->
            <button 
              v-if="activeMenu === 'dashboard'"
              @click="toggleFontDemo"
              class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              {{ showFontDemo ? 'ປິດການທົດສອບຟອນຕ໌' : 'ທົດສອບຟອນຕ໌ລາວ' }}
            </button>
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
</template>