<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { User } from '../types/student';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = 'http://localhost:3000/api';
const authStore = useAuthStore();

const users = reactive<User[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const selectedUser = ref<User | null>(null);
const formUser = reactive<User>({
  id: '',
  username: '',
  name: '',
  role: 'staff',
  active: true,
  image: null
});
const searchQuery = ref('');
const password = ref('');
const previewImage = ref<string | null>(null);

// ດຶງຂໍ້ມູນຜູ້ໃຊ້ທັງໝົດ
const fetchUsers = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data.success) {
      users.splice(0, users.length, ...response.data.data);
      
      if (users.length > 0) {
        selectUser(users[0]);
      }
    } else {
      error.value = response.data.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້';
    }
  } catch (err: any) {
    console.error('Error fetching users:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້';
  } finally {
    isLoading.value = false;
  }
};

// ໂຫລດຂໍ້ມູນເມື່ອ component ສ້າງແລ້ວ
fetchUsers();

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
  password.value = ''; // ບໍ່ແສດງລະຫັດຜ່ານ
  previewImage.value = user.image;
};

const createNewUser = () => {
  formUser.id = '';
  formUser.username = '';
  formUser.name = '';
  formUser.role = 'staff';
  formUser.active = true;
  formUser.image = null;
  selectedUser.value = null;
  password.value = '';
  previewImage.value = null;
};

const saveUser = async () => {
  // ກວດສອບຄວາມຖືກຕ້ອງ
  if (!formUser.username || !formUser.name) {
    alert('ກະລຸນາປ້ອນຂໍ້ມູນຜູ້ໃຊ້ໃຫ້ຄົບຖ້ວນ');
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const userData: Record<string, any> = {
      username: formUser.username,
      name: formUser.name,
      role: formUser.role,
      active: formUser.active,
      image: formUser.image
    };
    
    // ຖ້າມີລະຫັດຜ່ານ, ເພີ່ມເຂົ້າໃນຂໍ້ມູນ
    if (password.value && password.value !== '************') {
      userData.password = password.value;
    }
    
    let response;
    
    if (selectedUser.value) {
      // ອັບເດດຜູ້ໃຊ້ທີ່ມີຢູ່ແລ້ວ
      response = await axios.put(`${API_URL}/users/${selectedUser.value.id}`, userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } else {
      // ເພີ່ມຜູ້ໃຊ້ໃໝ່
      if (!password.value) {
        alert('ກະລຸນາປ້ອນລະຫັດຜ່ານສຳລັບຜູ້ໃຊ້ໃໝ່');
        isLoading.value = false;
        return;
      }
      
      response = await axios.post(`${API_URL}/users`, {
        ...userData,
        password: password.value
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    }
    
    if (response.data.success) {
      // ດຶງຂໍ້ມູນຜູ້ໃຊ້ໃໝ່ອີກຄັ້ງ
      await fetchUsers();
      alert(selectedUser.value ? 'ອັບເດດຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດແລ້ວ' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່ສຳເລັດແລ້ວ');
    } else {
      error.value = response.data.message;
      alert(error.value);
    }
  } catch (err: any) {
    console.error('Error saving user:', err);
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນຜູ້ໃຊ້';
    alert(error.value);
  } finally {
    isLoading.value = false;
  }
};

const deleteUser = async () => {
  if (selectedUser.value && confirm(`ທ່ານແນ່ໃຈບໍວ່າຕ້ອງການລຶບຜູ້ໃຊ້ ${selectedUser.value.name}?`)) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.delete(`${API_URL}/users/${selectedUser.value.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        await fetchUsers();
        
        // ລ້າງຂໍ້ມູນແບບຟອມ
        formUser.id = '';
        formUser.username = '';
        formUser.name = '';
        formUser.role = 'staff';
        formUser.active = true;
        formUser.image = null;
        selectedUser.value = null;
        password.value = '';
        previewImage.value = null;
        
        alert('ລຶບຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດແລ້ວ');
      } else {
        error.value = response.data.message;
        alert(error.value);
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຜູ້ໃຊ້';
      alert(error.value);
    } finally {
      isLoading.value = false;
    }
  }
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      previewImage.value = result;
      formUser.image = result;
    };
    
    reader.readAsDataURL(file);
  }
};
</script>

<template>
  <div class="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
    <!-- ຂໍ້ຄວາມແຈ້ງເຕືອນຂໍ້ຜິດພາດ -->
    <div v-if="error" class="col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <!-- ລໍຖ້າໂຫລດຂໍ້ມູນ -->
    <div v-if="isLoading" class="col-span-3 flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      <span class="ml-2">ກຳລັງໂຫລດຂໍ້ມູນ...</span>
    </div>
    
    <template v-else>
      <!-- ດ້ານຊ້າຍ - ຟອມຂໍ້ມູນ -->
      <div class="border-r pr-4 col-span-1">
        <!-- ລະຫັດຜູ້ໃຊ້ -->
        <div class="mb-4">
          <div class="mb-1">ລະຫັດໃຊ້ລະບົບ</div>
          <input 
            v-model="formUser.id" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded"
            disabled
          />
        </div>
        
        <!-- ຊື່ຜູ້ໃຊ້ -->
        <div class="mb-4">
          <div class="mb-1">ຊື່ຜູ້ໃຊ້ລະບົບ</div>
          <input 
            v-model="formUser.username" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        
        <!-- ລະຫັດຜ່ານ -->
        <div class="mb-4">
          <div class="mb-1">ລະຫັດຜ່ານ</div>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-3 py-2 border border-gray-300 rounded"
            :placeholder="selectedUser ? 'ປ່ອຍວ່າງໄວ້ເພື່ອບໍ່ປ່ຽນ' : 'ປ້ອນລະຫັດຜ່ານ'"
          />
        </div>
        
        <!-- ຊື່-ນາມສະກຸນ -->
        <div class="mb-4">
          <div class="mb-1">ຊື່-ນາມສະກຸນ</div>
          <input 
            v-model="formUser.name" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        
        <!-- ບົດບາດ -->
        <div class="mb-4">
          <div class="mb-1">ບົດບາດ</div>
          <select 
            v-model="formUser.role" 
            class="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="admin">ຜູ້ດູແລລະບົບ</option>
            <option value="teacher">ຄູສອນ</option>
            <option value="staff">ພະນັກງານ</option>
          </select>
        </div>
        
        <!-- ສະຖານະ -->
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
        
        <!-- ຮູບ -->
        <div class="mb-8">
          <div class="mb-1">ຮູບ</div>
          <div class="border border-gray-300 rounded p-2 flex justify-center">
            <img v-if="previewImage" :src="previewImage" class="w-24 h-24 object-cover" />
            <svg v-else width="100" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="#e2e8f0"/>
              <circle cx="50" cy="35" r="18" fill="#94a3b8"/>
              <path d="M50,95 C70,95 85,80 85,65 L85,61 C85,53 75,45 50,45 C25,45 15,53 15,61 L15,65 C15,80 30,95 50,95 Z" fill="#94a3b8"/>
            </svg>
          </div>
          <label class="mt-2 w-full px-3 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 cursor-pointer text-center block">
            ອັບໂຫລດຮູບພາບ
            <input 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleImageUpload"
            />
          </label>
        </div>
        
        <!-- ປຸ່ມ -->
        <div class="grid grid-cols-2 gap-4">
          <button 
            @click="deleteUser" 
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            :disabled="isLoading || !selectedUser"
          >
            ລຶບ
          </button>
          <button 
            @click="saveUser" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            :disabled="isLoading"
          >
            ບັນທຶກ
          </button>
        </div>
      </div>
      
      <!-- ດ້ານຂວາ - ຄົ້ນຫາແລະຕາຕະລາງ -->
      <div class="col-span-2">
        <!-- ຄົ້ນຫາແລະປຸ່ມເພີ່ມ -->
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
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
            :disabled="!authStore.isAdmin()"
          >
            ເພີ່ມ
          </button>
        </div>
        
        <!-- ຫົວຕາຕະລາງ -->
        <div class="grid grid-cols-4 bg-gray-400 p-2 text-left">
          <div>ລະຫັດຜູ້ໃຊ້ລະບົບ</div>
          <div>ຊື່ຜູ້ໃຊ້ລະບົບ</div>
          <div>ສະຖານະ</div>
          <div>ຮູບ</div>
        </div>
        
        <!-- ແຖວຕາຕະລາງ -->
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
              <img v-if="user.image" :src="user.image" class="w-6 h-6 object-cover rounded-full" />
              <svg v-else width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#e2e8f0"/>
                <circle cx="50" cy="35" r="18" fill="#94a3b8"/>
                <path d="M50,95 C70,95 85,80 85,65 L85,61 C85,53 75,45 50,45 C25,45 15,53 15,61 L15,65 C15,80 30,95 50,95 Z" fill="#94a3b8"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template> 