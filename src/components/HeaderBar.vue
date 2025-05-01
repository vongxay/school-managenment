<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');
const showNotifications = ref(false);
const showUserMenu = ref(false);

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: 1,
    message: 'ມີການລົງທະບຽນໃໝ່ 5 ຄົນ',
    time: '2 ຊົ່ວໂມງກ່ອນ',
    read: false
  },
  {
    id: 2,
    message: 'ມີການຈ່າຍຄ່າຮຽນໃໝ່',
    time: '3 ຊົ່ວໂມງກ່ອນ',
    read: false
  },
  {
    id: 3,
    message: 'ການອັບເດດລະບົບໃໝ່',
    time: 'ມື້ວານ',
    read: true
  }
];

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showUserMenu.value) showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showNotifications.value) showNotifications.value = false;
};

const markAsRead = (id: number) => {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
};
</script>

<template>
  <div class="bg-white shadow-md px-6 py-4">
    <div class="flex justify-between items-center">
      <!-- Search Bar -->
      <div class="relative w-96">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ຄົ້ນຫາ..."
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button class="absolute right-3 top-2.5 text-gray-500">
          🔍
        </button>
      </div>
      
      <!-- Right Side -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <div class="relative">
          <button 
            @click="toggleNotifications"
            class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <span class="text-xl">🔔</span>
            <span 
              v-if="notifications.filter((n: Notification) => !n.read).length > 0"
              class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ notifications.filter((n: Notification) => !n.read).length }}
            </span>
          </button>
          
          <!-- Notifications Dropdown -->
          <div 
            v-if="showNotifications"
            class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-10"
          >
            <div class="p-3 border-b">
              <h3 class="font-medium">ການແຈ້ງເຕືອນ</h3>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                :class="['p-3 border-b hover:bg-gray-50 cursor-pointer', 
                  notification.read ? 'bg-white' : 'bg-blue-50']"
                @click="markAsRead(notification.id)"
              >
                <div class="text-sm">{{ notification.message }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ notification.time }}</div>
              </div>
            </div>
            <div class="p-3 text-center text-sm text-blue-600 hover:underline cursor-pointer">
              ເບິ່ງການແຈ້ງເຕືອນທັງໝົດ
            </div>
          </div>
        </div>
        
        <!-- User Menu -->
        <div class="relative">
          <button 
            @click="toggleUserMenu"
            class="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2"
          >
            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              👤
            </div>
            <div class="text-sm font-medium">ຜູ້ບໍລິຫານ</div>
            <span>▼</span>
          </button>
          
          <!-- User Dropdown -->
          <div 
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
          >
            <div class="py-1">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                ໂປຣໄຟລ໌
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                ການຕັ້ງຄ່າ
              </a>
              <div class="border-t border-gray-200 my-1"></div>
              <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                ອອກຈາກລະບົບ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 