import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import AdminLogin from './components/AdminLogin.vue'
import Dashboard from './components/Dashboard.vue'

// Define routes
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: AdminLogin },
  { path: '/dashboard', component: Dashboard },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, from) => {
  // Check if the route requires authentication
  const publicPages = ['/login'];
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
