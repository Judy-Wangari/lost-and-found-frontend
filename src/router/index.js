
import { createRouter, createWebHistory } from 'vue-router'


import LandingPage from '@/components/LandingPage.vue'
import Register from '@/components/Register.vue'
import Login from '@/components/Login.vue'
import AboutUs from '@/components/AboutUs.vue'
import ContactUs from '@/components/ContactUs.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'
import StudentDashboard from '@/components/student/StudentDashboard.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name: 'landingpage',
      component: LandingPage,
    },
    
    {
      path: '/login',
      name: 'login',
      component: Login,
       meta: { guestOnly: true }
    },

     {
      path: '/register',
      name: 'register',
      component: Register,
       meta: { guestOnly: true }
    },

     {
      path: '/about',
      name: 'aboutUs',
      component: AboutUs,
    },
     {
      path: '/contact',
      name: 'contactUs',
      component: ContactUs,
    },
    {
      path: '/admin/dashboard',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'admin' }
    },
     {
  path: '/student',
  component: StudentDashboard,
  meta: { requiresAuth: true, role: 'student' },
  children: [
    { path: 'dashboard', name: 'student-dashboard', component: () => import('@/components/student/Overview.vue') },
    { path: 'found-items', name: 'found-items', component: () => import('@/components/student/FoundItems.vue') },
    { path: 'lost-items', name: 'lost-items', component: () => import('@/components/student/LostItems.vue') },
    { path: 'my-posts', name: 'my-posts', component: () => import('@/components/student/MyPosts.vue') },
    { path: 'my-claims', name: 'my-claims', component: () => import('@/components/student/MyClaims.vue') },
    { path: 'my-appeals', name: 'my-appeals', component: () => import('@/components/student/MyAppeals.vue') },
    { path: 'messages', name: 'messages', component: () => import('@/components/student/Messages.vue') },
    { path: 'notifications', name: 'notifications', component: () => import('@/components/student/Notifications.vue') },
    { path: 'settings', name: 'settings', component: () => import('@/components/student/Settings.vue') },
    { path: 'profile', name: 'profile', component: () => import('@/components/student/Profile.vue') },
  ]
},
  
  
  
    ],
})
// Route guards
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('authToken')
  const userStr = sessionStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // If route requires auth and no token --- redirect to login
  if(to.meta.requiresAuth && !token){
    return next('/login')
  }

  // If route requires specific role and user does not have it
  if(to.meta.role && user && user.role !== to.meta.role){
    // Redirect to their correct dashboard
    if(user.role === 'admin') return next('/admin/dashboard')
    if(user.role === 'security') return next('/security/dashboard')
    return next('/student/dashboard')
  }

  // If logged in user tries to access login or register --- redirect to dashboard
  if(to.meta.guestOnly && token){
    if(user?.role === 'admin') return next('/admin/dashboard')
    if(user?.role === 'security') return next('/security/dashboard')
    return next('/student/dashboard')
  }

  next()
})


export default router
