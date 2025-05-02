<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const showPassword = ref(false);

// สร้าง form data สำหรับการล็อกอิน
const loginForm = reactive({
  username: '',
  password: '',
});

// ฟังก์ชันสำหรับการยืนยันตัวตน
const submitLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    authStore.state.authError = 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ';
    return;
  }

  const success = await authStore.login({
    username: loginForm.username,
    password: loginForm.password
  });

  if (success) {
    // นำทางไปยังหน้า Dashboard
    router.push('/dashboard');
  }
};

// ฟังก์ชันสลับการแสดงรหัสผ่าน
const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">ເຂົ້າສູ່ລະບົບ</h2>
        <p class="mt-2 text-sm text-gray-600">ລະບົບບໍລິຫານຈັດການໂຮງຮຽນ</p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="submitLogin">
        <div class="rounded-md -space-y-px">
          <!-- ช่องกรอกชื่อผู้ใช้ -->
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">ຊື່ຜູ້ໃຊ້</label>
            <input
              id="username"
              v-model="loginForm.username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="ຊື່ຜູ້ໃຊ້"
            />
          </div>
          
          <!-- ช่องกรอกรหัสผ่าน -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">ລະຫັດຜ່ານ</label>
            <div class="relative">
              <input
                id="password"
                v-model="loginForm.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ລະຫັດຜ່ານ"
              />
              <button 
                type="button" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center" 
                @click="toggleShowPassword"
              >
                <span class="text-gray-500">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- ข้อความแสดงข้อผิดพลาด -->
        <div v-if="authStore.error" class="rounded-md bg-red-50 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              ❌
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ authStore.error }}</h3>
            </div>
          </div>
        </div>

        <!-- ส่วนการจดจำและลืมรหัสผ่าน -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              ຈົດຈຳລະຫັດຜ່ານ
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              ລືມລະຫັດຜ່ານ?
            </a>
          </div>
        </div>

        <!-- ปุ่มล็อกอิน -->
        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- ไอคอนโหลด -->
              <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ authStore.isLoading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style> 