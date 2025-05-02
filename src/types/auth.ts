export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'teacher' | 'staff';
  token?: string;
}

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
} 