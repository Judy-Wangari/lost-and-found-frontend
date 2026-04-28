<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'
import api from '@/services/api'


const router = useRouter()
const route = useRoute()
const { isAuthenticated, logout, user } = useAuth()
const emit = defineEmits(['toggle-drawer'])

const unreadCount = ref(0)

const fetchUnreadCount = async () => {
  try {
    if(!isAuthenticated()) return
    const response = await api.get('/notifications/unread-count')
    unreadCount.value = response.data.unread_count
  } catch(e) {
    console.error(e)
  }
}

// Refresh badge count every time route changes
watch(() => route.path, () => {
  fetchUnreadCount()
})

const handleLogout = async () => {
  await logout()
  router.push('/')
}

const goToProfile = () => {
  if(user.value?.role === 'admin'){
    router.push('/admin/profile')
  } else if(user.value?.role === 'security'){
    router.push('/security/profile')
  } else {
    router.push('/student/profile')
  }
}

const goToNotifications = () => {
  if(user.value?.role === 'admin'){
    router.push('/admin/notifications')  // we will add this route
  } else if(user.value?.role === 'security'){
    router.push('/security/dashboard')
  } else {
    router.push('/student/notifications')
  }
}

const isDashboard = () => {
  return route.path.startsWith('/student') ||
         route.path.startsWith('/admin') ||
         route.path.startsWith('/security')
}

onMounted(() => {
  fetchUnreadCount()
  window.addEventListener('notifications-read', fetchUnreadCount)
})

onUnmounted(() => {
  window.removeEventListener('notifications-read', fetchUnreadCount)
})
</script>

<template>
  <v-app-bar color="primary" elevation="2" height="70">

    <v-app-bar-nav-icon
      v-if="isAuthenticated() && isDashboard()"
      @click="emit('toggle-drawer')"
      color="secondary"
    />

    <v-toolbar-title
      class="text-secondary font-weight-bold cursor-pointer"
      @click="router.push('/')"
    >
      CampusFind
    </v-toolbar-title>

    <v-spacer />

    <div class="d-flex align-center">

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

      <v-btn variant="text" color="secondary" @click="router.push('/about')">
        About
      </v-btn>

      <v-btn variant="text" color="secondary" @click="router.push('/contact')">
        Contact
      </v-btn>

      <template v-if="!isAuthenticated()">
        <v-btn to="/login" color="secondary" variant="text">
          Login
        </v-btn>
      </template>

      <template v-else>

        <!-- Bell with unread badge -->
        <v-btn icon @click="goToNotifications">
          <v-badge
            v-if="unreadCount > 0"
            :content="unreadCount > 99 ? '99+' : String(unreadCount)"
            color="error"
            floating
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
          <v-icon v-else>mdi-bell-outline</v-icon>
        </v-btn>

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

        <v-btn color="error" variant="text" @click="handleLogout">
          Logout
        </v-btn>

      </template>

    </div>
  </v-app-bar>
</template>