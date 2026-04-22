<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'

// router & route
const router = useRouter()
const route = useRoute()

// auth
const { isAuthenticated, logout, user } = useAuth()

// emit for sidebar toggle
const emit = defineEmits(['toggle-drawer'])

// logout
const handleLogout = async () => {
  await logout()
  router.push('/')
}

// Go to profile
const goToProfile = () => {
  router.push('/student/profile')
}

// ✅ CHECK IF USER IS ON STUDENT DASHBOARD
const isDashboard = () => {
  return route.path.startsWith('/student')
}
</script>

<template>
  <v-app-bar color="primary" elevation="2" height="70">

    <!-- ✅ Menu icon ONLY on dashboard -->
    <v-app-bar-nav-icon 
      v-if="isAuthenticated() && isDashboard()" 
      @click="emit('toggle-drawer')" 
      color="secondary"
    />

    <!-- Logo -->
    <v-toolbar-title 
      class="text-secondary font-weight-bold cursor-pointer"
      @click="router.push('/')"
    >
      CampusFind
    </v-toolbar-title>

    <v-spacer />

    <!-- Links -->
    <div class="d-flex align-center">

      <!-- Home -->
      <v-btn 
        v-if="isAuthenticated()" 
        variant="text" 
        color="secondary"
        @click="router.push(
          user?.role === 'admin' 
            ? '/admin/dashboard' 
            : user?.role === 'security' 
            ? '/security/dashboard' 
            : '/student/dashboard'
        )"
      >
        Home
      </v-btn>

      <!-- Public -->
      <v-btn variant="text" color="secondary" @click="router.push('/about')">
        About
      </v-btn>

      <v-btn variant="text" color="secondary" @click="router.push('/contact')">
        Contact
      </v-btn>

      <!-- NOT logged in -->
      <template v-if="!isAuthenticated()">
        <v-btn to="/login" color="secondary" variant="text">
          Login
        </v-btn>
      </template>

      <!-- Logged in -->
      <template v-else>

        <!-- Notifications -->
        <v-btn icon @click="router.push('/student/notifications')">
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>

        <!-- Avatar -->
        <v-avatar 
          size="32" 
          color="secondary" 
          class="mx-3 cursor-pointer" 
          @click="goToProfile"
        >
          <v-img
            v-if="user?.profile_picture"
            :src="user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000/storage/${user.profile_picture}`"
            cover
          />
          <span v-else class="text-white text-caption font-weight-bold">
            {{ user?.first_name?.charAt(0)?.toUpperCase() }}
          </span>
        </v-avatar>

        <!-- Logout -->
        <v-btn color="error" variant="text" @click="handleLogout">
          Logout
        </v-btn>

      </template>

    </div>
  </v-app-bar>
</template>