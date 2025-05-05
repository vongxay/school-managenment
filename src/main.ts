import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import App from './App.vue'
import './style.css'

import AdminLogin from './components/AdminLogin.vue'
import AdminRegister from './components/AdminRegister.vue'
import Dashboard from './components/Dashboard.vue'

// กำหนดค่าพื้นฐานสำหรับ axios
axios.defaults.baseURL = 'http://localhost:5000/api'
// เพิ่ม interceptor เพื่อแนบ token กับทุกคำขอ
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Define routes
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: AdminLogin },
  { path: '/register', component: AdminRegister },
  { path: '/dashboard', component: Dashboard },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to) => {
  // Check if the route requires authentication
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const currentUser = localStorage.getItem('currentUser');

  // If auth is required and user is not logged in, redirect to login
  if (authRequired && !currentUser) {
    return '/login';
  }
})

// Create and mount the app
createApp(App)
  .use(router)
  .mount('#app')
