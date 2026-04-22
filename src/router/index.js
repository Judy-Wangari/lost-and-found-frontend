import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/components/LandingPage.vue'
import Register from '@/components/Register.vue'
import Login from '@/components/Login.vue'
import AboutUs from '@/components/AboutUs.vue'
import ContactUs from '@/components/ContactUs.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'
import StudentDashboard from '@/components/student/StudentDashboard.vue'
import SecurityDashboard from '@/components/security/SecurityDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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

    // ✅ STUDENT ROUTES
    {
      path: '/student',
      component: StudentDashboard,
      meta: { requiresAuth: true, role: 'student', hideNavbar: true },
      children: [
        { path: 'dashboard', name: 'student-dashboard', meta: { hideNavbar: true }, component: () => import('@/components/student/Overview.vue') },
        { path: 'found-items', name: 'found-items', meta: { hideNavbar: true }, component: () => import('@/components/student/FoundItems.vue') },
        { path: 'found-items/:id', name: 'found-item-detail', meta: { hideNavbar: true }, component: () => import('@/components/student/FoundItemDetail.vue') },
        { path: 'lost-items', name: 'lost-items', meta: { hideNavbar: true }, component: () => import('@/components/student/LostItems.vue') },
        { path: 'lost-items/:id', name: 'lost-item-detail', meta: { hideNavbar: true }, component: () => import('@/components/student/LostItemDetail.vue') },
        { path: 'my-posts', name: 'my-posts', meta: { hideNavbar: true }, component: () => import('@/components/student/MyPosts.vue') },
        { path: 'my-claims', name: 'my-claims', meta: { hideNavbar: true }, component: () => import('@/components/student/MyClaims.vue') },
        { path: 'my-appeals', name: 'my-appeals', meta: { hideNavbar: true }, component: () => import('@/components/student/MyAppeals.vue') },
        { path: 'messages', name: 'messages', meta: { hideNavbar: true }, component: () => import('@/components/student/Messages.vue') },
        { path: 'messages/:claimId', name: 'claim-messages', meta: { hideNavbar: true }, component: () => import('@/components/student/Messages.vue') },
        { path: 'notifications', name: 'notifications', meta: { hideNavbar: true }, component: () => import('@/components/student/Notifications.vue') },
        { path: 'settings', name: 'settings', meta: { hideNavbar: true }, component: () => import('@/components/student/Settings.vue') },
        { path: 'profile', name: 'profile', meta: { hideNavbar: true }, component: () => import('@/components/student/Profile.vue') },
      ]
    },

    // ✅ ADMIN ROUTES --- separate from student, not nested inside
    {
      path: '/admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'admin', hideNavbar: true },
      children: [
        { path: 'dashboard', name: 'admin-dashboard', meta: { hideNavbar: true }, component: () => import('@/components/admin/Overview.vue') },
        { path: 'claims', name: 'admin-claims', meta: { hideNavbar: true }, component: () => import('@/components/admin/Claims.vue') },
        { path: 'claims/:id', name: 'admin-claim-detail', meta: { hideNavbar: true }, component: () => import('@/components/admin/ClaimDetail.vue') },
        { path: 'appeals', name: 'admin-appeals', meta: { hideNavbar: true }, component: () => import('@/components/admin/Appeals.vue') },
        { path: 'appeals/:id', name: 'admin-appeal-detail', meta: { hideNavbar: true }, component: () => import('@/components/admin/AppealDetail.vue') },
        { path: 'users', name: 'admin-users', meta: { hideNavbar: true }, component: () => import('@/components/admin/Users.vue') },
        { path: 'items', name: 'admin-items', meta: { hideNavbar: true }, component: () => import('@/components/admin/Items.vue') },
        { path: 'lost-items', name: 'admin-lost-items', meta: { hideNavbar: true }, component: () => import('@/components/admin/LostItems.vue') },
        { path: 'handovers', name: 'admin-handovers', meta: { hideNavbar: true }, component: () => import('@/components/admin/SecurityHandovers.vue') },
        { path: 'profile', name: 'admin-profile', meta: { hideNavbar: true }, component: () => import('@/components/admin/Profile.vue') },
      ]
    },

    // ✅ SECURITY ROUTES
    {
      path: '/security',
      component: SecurityDashboard,
      meta: { requiresAuth: true, role: 'security', hideNavbar: true },
      children: [
        { path: 'dashboard', name: 'security-dashboard', meta: { hideNavbar: true }, component: () => import('@/components/security/Overview.vue') },
        { path: 'handovers', name: 'security-handovers', meta: { hideNavbar: true }, component: () => import('@/components/security/Handovers.vue') },
        { path: 'profile', name: 'security-profile', meta: { hideNavbar: true }, component: () => import('@/components/security/Profile.vue') },
      ]
    },
  ],
})

// Route guards
router.beforeEach((to, from) => {
  const token = sessionStorage.getItem('authToken')
  const userStr = sessionStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  if(to.meta.requiresAuth && !token){
    return '/login'
  }

  if(to.meta.role && user && user.role !== to.meta.role){
    if(user.role === 'admin') return '/admin/dashboard'
    if(user.role === 'security') return '/security/dashboard'
    return '/student/dashboard'
  }

  if(to.meta.guestOnly && token){
    if(user?.role === 'admin') return '/admin/dashboard'
    if(user?.role === 'security') return '/security/dashboard'
    return '/student/dashboard'
  }
})

export default router