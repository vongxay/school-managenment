import { ref, reactive } from 'vue';
import type { UserSession, AuthState, LoginCredentials } from '../types/auth';

// Mock users for testing (in a real app, this would come from an API)
const mockUsers = [
  { id: '001', username: 'admin', password: 'admin123', name: 'ທ້າວ ມິຮຸນດົງ ອິສິຣິ', role: 'admin', active: true },
  { id: '002', username: 'teacher', password: 'teacher123', name: 'ນາງສາວ ນຸ ສຸກົນໄຊ', role: 'teacher', active: true },
  { id: '003', username: 'staff', password: 'staff123', name: 'ທ້າວ ສົມສະຫວັນ', role: 'staff', active: true },
];

// Initialize store state
const state = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  isAuthLoading: false,
  authError: null
});

// Check for existing session on startup
const initializeAuth = () => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser) as UserSession;
      state.user = userData;
      state.isAuthenticated = true;
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      localStorage.removeItem('currentUser');
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockUsers.find(
        u => u.username === credentials.username && 
             u.password === credentials.password && 
             u.active
      );
      
      if (user) {
        // Create session without password
        const userSession: UserSession = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          token: 'mock-jwt-token-' + Date.now() // Simulate JWT token
        };
        
        // Update state
        state.user = userSession;
        state.isAuthenticated = true;
        
        // Store in localStorage (in real app, would just store the token)
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        
        state.isAuthLoading = false;
        return true;
      } else {
        state.authError = 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ';
        state.isAuthLoading = false;
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      state.authError = 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ';
      state.isAuthLoading = false;
      return false;
    }
  };
  
  // Logout action
  const logout = () => {
    state.user = null;
    state.isAuthenticated = false;
    localStorage.removeItem('currentUser');
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
    logout,
    hasRole,
    isAdmin
  };
}; 