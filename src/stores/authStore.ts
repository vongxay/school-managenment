import { reactive } from 'vue';
import type { UserSession, AuthState, LoginCredentials } from '../types/auth';
import axios from 'axios';

// ຕັ້ງຄ່າ base URL ຂອງ API
const API_URL = 'http://localhost:5000/api';

// Initialize store state
const state = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  isAuthLoading: false,
  authError: null
});

// Check for existing session on startup
const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser) as UserSession;
        state.user = userData;
        state.isAuthenticated = true;
        
        // ຕັ້ງຄ່າ default header ສຳລັບການຂໍຂໍ້ມູນຈາກ API
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }
};

// Call initialization
initializeAuth();

// Export auth store with actions and getters
export const useAuthStore = () => {
  // Login action
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    state.isAuthLoading = true;
    state.authError = null;
    
    try {
      // ຂໍຂໍ້ມູນຈາກ API
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      if (response.data.success) {
        // ສ້າງຂໍ້ມູນຜູ້ໃຊ້ຈາກຂໍ້ມູນທີ່ໄດ້ຈາກ API
        const userSession: UserSession = {
          id: response.data.data.user.id,
          username: response.data.data.user.username,
          name: response.data.data.user.name,
          role: response.data.data.user.role,
          token: response.data.data.token
        };
        
        // ອັບເດດຂໍ້ມູນ
        state.user = userSession;
        state.isAuthenticated = true;
        
        // ຕັ້ງຄ່າ authorization header ສຳລັບການສົ່ງຄຳຂໍຕໍ່ໄປ
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        
        // ບັນທຶກລົງໃນ localStorage
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        localStorage.setItem('token', response.data.data.token);
        
        state.isAuthLoading = false;
        return true;
      } else {
        state.authError = response.data.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ';
        state.isAuthLoading = false;
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      state.authError = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ';
      state.isAuthLoading = false;
      return false;
    }
  };
  
  // Register action
  const register = async (userData: { username: string; password: string; name: string; role: string }): Promise<{ success: boolean; message: string }> => {
    state.isAuthLoading = true;
    state.authError = null;
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        state.isAuthLoading = false;
        return {
          success: true,
          message: response.data.message || 'ລົງທະບຽນສຳເລັດ ກະລຸນາເຂົ້າສູ່ລະບົບ'
        };
      } else {
        state.authError = response.data.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ';
        state.isAuthLoading = false;
        return {
          success: false,
          message: state.authError || 'ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ'
        };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ';
      state.authError = errorMessage;
      state.isAuthLoading = false;
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };
  
  // Logout action
  const logout = () => {
    state.user = null;
    state.isAuthenticated = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };
  
  // ດຶງຂໍ້ມູນຜູ້ໃຊ້ປັດຈຸບັນ
  const fetchCurrentUser = async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/auth/check`);
      
      if (response.data.success) {
        // ອັບເດດຂໍ້ມູນຜູ້ໃຊ້
        if (state.user) {
          state.user = {
            ...state.user,
            id: response.data.data.user.id,
            username: response.data.data.user.username,
            name: response.data.data.user.name,
            role: response.data.data.user.role
          };
          
          localStorage.setItem('currentUser', JSON.stringify(state.user));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Get current user error:', error);
      return false;
    }
  };
  
  // ປ່ຽນລະຫັດຜ່ານ
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      state.authError = null;
      
      const response = await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'ປ່ຽນລະຫັດຜ່ານສຳເລັດ'
        };
      } else {
        state.authError = response.data.message;
        return {
          success: false,
          message: response.data.message || 'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ'
        };
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ';
      state.authError = errorMessage;
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };
  
  // Check if user has specific role
  const hasRole = (role: 'admin' | 'teacher' | 'staff'): boolean => {
    return state.user?.role === role;
  };
  
  // Check if current user is admin
  const isAdmin = (): boolean => {
    return state.user?.role === 'admin';
  };
  
  return {
    // State (readonly)
    state: state,
    
    // Computed properties
    get user() { return state.user; },
    get isAuthenticated() { return state.isAuthenticated; },
    get isLoading() { return state.isAuthLoading; },
    get error() { return state.authError; },
    
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    changePassword,
    hasRole,
    isAdmin
  };
}; 