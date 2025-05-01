<script setup lang="ts">
import { ref } from 'vue';

const isCollapsed = ref(false);
const props = defineProps<{
  activeMenu: string
}>();

const emit = defineEmits<{
  (e: 'menu-select', menuId: string): void
}>();

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const selectMenu = (menuId: string) => {
  emit('menu-select', menuId);
};

const menuItems = [
  { 
    id: 'dashboard',
    label: 'ຫນ້າຫລັກ',
    icon: '📊', 
  },
  { 
    id: 'studentInfo',
    label: 'ຂໍ້ມູນນັກຮຽນ',
    icon: '👨‍🎓', 
  },
  { 
    id: 'classInfo',
    label: 'ຂໍ້ມູນຫ້ອງຮຽນ',
    icon: '🏫', 
  },
  { 
    id: 'levelInfo',
    label: 'ຂໍ້ມູນຊັ້ນຮຽນ',
    icon: '🏛️', 
  },
  { 
    id: 'yearInfo',
    label: 'ຂໍ້ມູນສົກຮຽນ',
    icon: '📅', 
  },
  { 
    id: 'tuitionInfo',
    label: 'ຂໍ້ມູນຄ່າຮຽນ',
    icon: '💰', 
  },
  { 
    id: 'userInfo',
    label: 'ຂໍ້ມູນຜູ້ໃຊ້ລະບົບ',
    icon: '👤', 
  },
  { 
    id: 'registration',
    label: 'ການລົງທະບຽນ',
    icon: '📝', 
  },
  { 
    id: 'payment',
    label: 'ການຈ່າຍຄ່າຮຽນ',
    icon: '💸', 
  },
  { 
    id: 'reports',
    label: 'ລາຍງານ',
    icon: '📊', 
  },
];
</script>

<template>
  <div
    :class="[
      'bg-gray-800 text-white transition-all duration-300 ease-in-out h-screen sticky top-0',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div class="flex justify-between items-center p-4 border-b border-gray-700">
      <div v-if="!isCollapsed" class="font-bold text-xl">ໂຮງຮຽນ ມສ ນາໂພ </div>
      <div v-else class="font-bold text-xl">ມສ</div>
      <button @click="toggleSidebar" class="text-gray-400 hover:text-white">
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </div>
    
    <div class="py-4">
      <ul>
        <li v-for="item in menuItems" :key="item.id" class="mb-2">
          <a
            href="#"
            @click.prevent="selectMenu(item.id)"
            :class="[
              'flex items-center px-4 py-2 hover:bg-gray-700 transition-colors duration-200',
              props.activeMenu === item.id ? 'bg-gray-700' : ''
            ]"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span v-if="!isCollapsed" class="ml-3">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </div>
    
    <div class="absolute bottom-0 w-full border-t border-gray-700 p-4">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg">
          👤
        </div>
        <div v-if="!isCollapsed" class="ml-3">
          <div class="font-medium">ຜູ້ບໍລິຫານ</div>
          <div class="text-sm text-gray-400">ອອກຈາກລະບົບ</div>
        </div>
      </div>
    </div>
  </div>
</template> 