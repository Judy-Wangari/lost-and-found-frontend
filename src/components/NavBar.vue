<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const { isAuthenticated, logout, user } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <v-app-bar color="primary" elevation="2" height="70" class="border-b" >
    <v-container class="px-6">
      <div class="d-flex align-center w-100">

        <!-- Left: Logo (Clickable to Landing Page) -->
        <div 
          class="d-flex align-center gap-3 cursor-pointer" 
          @click="router.push('/')"
        >
          <h1 class="text-h5 font-weight-bold text-secondary">CampusFind</h1>
        </div>

        <v-spacer />

        <!-- Right Side Links -->
        <div class="d-flex align-center gap-8">

         

         <!-- Home appears only when logged in -->
          <router-link 
            v-if="isAuthenticated()" 
            :to="user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'security' ? '/security/dashboard' : '/student/dashboard'" 
            class="text-secondary text-decoration-none font-weight-medium pr-10">
            Home
          </router-link>
          
           
          <router-link to="/about" class="text-secondary text-decoration-none pr-10">About Us</router-link>
          <router-link to="/contact" class="text-secondary text-decoration-none pr-10">Contact Us</router-link>

          <!-- Login / Logout -->
          <template v-if="!isAuthenticated()">
            <v-btn 
              to="/login" 
              color="secondary" 
              variant="text">
              Login
            </v-btn>
          </template>

          <template v-else>
            <v-btn 
              color="error" 
              variant="text"
              @click="handleLogout">
              Logout
            </v-btn>
          </template>

        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>