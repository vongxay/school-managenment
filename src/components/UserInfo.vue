<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { User } from '../types/student';

const users = reactive<User[]>([
  { id: '001', username: 'Mr. Mihundong Isiri', name: 'ທ້າວ ມິຮຸນດົງ ອິສິຣິ', role: 'admin', active: true },
  { id: '002', username: 'nu', name: 'ນາງສາວ ນຸ ສຸກົນໄຊ', role: 'teacher', active: true },
]);

const selectedUser = ref<User | null>(users[0]);  // เลือกผู้ใช้แรกเป็นค่าเริ่มต้น
const formUser = reactive<User>({
  id: selectedUser.value?.id || '',
  username: selectedUser.value?.username || '',
  name: selectedUser.value?.name || '',
  role: selectedUser.value?.role || 'staff',
  active: selectedUser.value?.active || true
});
const searchQuery = ref('');
const password = ref('');

const roles = [
  { value: 'admin', label: 'ຜູ້ບໍລິຫານລະບົບ' },
  { value: 'teacher', label: 'ຄູອາຈານ' },
  { value: 'staff', label: 'ພະນັກງານ' },
];

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users;
  const query = searchQuery.value.toLowerCase();
  return users.filter(u => 
    u.id.toLowerCase().includes(query) || 
    u.username.toLowerCase().includes(query) || 
    u.name.toLowerCase().includes(query)
  );
});

const selectUser = (user: User) => {
  selectedUser.value = user;
  Object.assign(formUser, user);
  password.value = '************';
};

const createNewUser = () => {
  // สร้าง ID ที่ไม่ซ้ำกัน
  const maxId = Math.max(...users.map(u => parseInt(u.id, 10)), 0);
  formUser.id = (maxId + 1).toString().padStart(3, '0');
  formUser.username = '';
  formUser.name = '';
  formUser.role = 'staff';
  formUser.active = true;
  selectedUser.value = null;
  password.value = '';
};

const saveUser = () => {
  // ตรวจสอบความถูกต้อง
  if (!formUser.username || !formUser.name) {
    alert('ກະລຸນາປ້ອນຂໍ້ມູນຜູ້ໃຊ້ໃຫ້ຄົບຖ້ວນ');
    return;
  }
  
  if (selectedUser.value) {
    // อัปเดตผู้ใช้ที่มีอยู่
    const index = users.findIndex(u => u.id === selectedUser.value?.id);
    if (index !== -1) {
      users[index] = { ...formUser };
    }
  } else {
    // เพิ่มผู้ใช้ใหม่
    users.push({ ...formUser });
  }
  
  selectedUser.value = { ...formUser };
};

const deleteUser = () => {
  if (selectedUser.value && confirm(`ທ່ານແນ່ໃຈບໍວ່າຕ້ອງການລຶບຜູ້ໃຊ້ ${selectedUser.value.name}?`)) {
    const index = users.findIndex(u => u.id === selectedUser.value!.id);
    if (index !== -1) {
      users.splice(index, 1);
      selectedUser.value = null;
      formUser.id = '';
      formUser.username = '';
      formUser.name = '';
      formUser.role = 'staff';
      formUser.active = true;
      password.value = '';
    }
  }
};

// ฟังก์ชันเปลี่ยนสถานะผู้ใช้
const toggleUserStatus = () => {
  if (selectedUser.value) {
    formUser.active = !formUser.active;
    if (selectedUser.value) {
      const index = users.findIndex(u => u.id === selectedUser.value!.id);
      if (index !== -1) {
        users[index].active = formUser.active;
      }
    }
  }
};

// รับป้ายกำกับบทบาท
const getRoleLabel = (role: string) => {
  const foundRole = roles.find(r => r.value === role);
  return foundRole ? foundRole.label : role;
};
</script>

<template>
  <div class="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
    <!-- ด้านซ้าย - ฟอร์มข้อมูน -->
    <div class="border-r pr-4 col-span-1">
      <!-- ละหัดผู้ใช้ -->
      <div class="mb-4">
        <div class="mb-1">ລະຫັດໃຊ້ລະບົບ</div>
        <input 
          v-model="formUser.id" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
          disabled
        />
      </div>
      
      <!-- ชื่อผู้ใช้ -->
      <div class="mb-4">
        <div class="mb-1">ຊື່ຜູ້ໃຊ້ລະບົບ</div>
        <input 
          v-model="formUser.username" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <!-- รหัสผ่าน -->
      <div class="mb-4">
        <div class="mb-1">ລະຫັດຜ່ານ</div>
        <input 
          v-model="password" 
          type="password" 
          class="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      
      <!-- สถานะ -->
      <div class="mb-4">
        <div class="mb-1">ສະຖານະ</div>
        <div class="flex items-center">
          <input 
            id="active-status" 
            type="checkbox" 
            v-model="formUser.active"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="active-status" class="ml-2 py-2 px-3 bg-gray-100 rounded">
            {{ formUser.active ? 'Y' : 'N' }}
          </label>
        </div>
      </div>
      
      <!-- รูป -->
      <div class="mb-8">
        <div class="mb-1">ຮູບ</div>
        <div class="border border-gray-300 rounded p-2 flex justify-center">
          <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#e2e8f0"/>
            <circle cx="50" cy="35" r="18" fill="#94a3b8"/>
            <path d="M50,95 C70,95 85,80 85,65 L85,61 C85,53 75,45 50,45 C25,45 15,53 15,61 L15,65 C15,80 30,95 50,95 Z" fill="#94a3b8"/>
          </svg>
        </div>
      </div>
      
      <!-- ปุ่ม -->
      <div class="grid grid-cols-2 gap-4">
        <button 
          @click="deleteUser" 
          class="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 text-center"
        >
          ລຶບ
        </button>
        <button 
          @click="saveUser" 
          class="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 text-center"
        >
          ບັນທຶກ
        </button>
      </div>
    </div>
    
    <!-- ด้านขวา - ค้นหาและตาราง -->
    <div class="col-span-2">
      <!-- ค้นหาและปุ่มเพิ่ม -->
      <div class="flex items-center space-x-1 justify-between mb-2">
        <div class="flex items-center space-x-1 flex-grow">
          <div class="whitespace-nowrap">ຄົ້ນຫາຜູ້ໃຊ້</div>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button
          @click="createNewUser"
          class="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 ml-2"
        >
          ເພີ່ມ
        </button>
      </div>
      
      <!-- หัวตาราง -->
      <div class="grid grid-cols-4 bg-gray-400 p-2 text-left">
        <div>ລະຫັດຜູ້ໃຊ້ລະບົບ</div>
        <div>ຊື່ຜູ້ໃຊ້ລະບົບ</div>
        <div>ສະຖານະ</div>
        <div>ຮູບ</div>
      </div>
      
      <!-- แถวตาราง -->
      <div class="max-h-72 overflow-y-auto">
        <div 
          v-for="user in filteredUsers" 
          :key="user.id"
          @click="selectUser(user)"
          :class="[
            'grid grid-cols-4 p-2 cursor-pointer',
            selectedUser?.id === user.id ? 'bg-blue-600 text-white' : ''
          ]"
        >
          <div>{{ user.id }}</div>
          <div>{{ user.username }}</div>
          <div>{{ user.active ? 'Y' : 'N' }}</div>
          <div class="flex justify-center">
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="#e2e8f0"/>
              <circle cx="50" cy="35" r="18" fill="#94a3b8"/>
              <path d="M50,95 C70,95 85,80 85,65 L85,61 C85,53 75,45 50,45 C25,45 15,53 15,61 L15,65 C15,80 30,95 50,95 Z" fill="#94a3b8"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 