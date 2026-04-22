<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'
import Navbar from '@/components/NavBar.vue'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()

const drawer = ref(true)

const sidebarItems = [
  { title: 'Overview', icon: 'mdi-view-dashboard', route: '/student/dashboard' },
  { title: 'Found Items', icon: 'mdi-magnify', route: '/student/found-items' },
  { title: 'Lost Items', icon: 'mdi-help-circle', route: '/student/lost-items' },
  { title: 'My Posts', icon: 'mdi-post', route: '/student/my-posts' },
  { title: 'My Claims', icon: 'mdi-clipboard-check', route: '/student/my-claims' },
  { title: 'My Appeals', icon: 'mdi-gavel', route: '/student/my-appeals' },
  { title: 'Messages', icon: 'mdi-message', route: '/student/messages' },
  { title: 'Notifications', icon: 'mdi-bell', route: '/student/notifications' },
]

const bottomItems = [
  { title: 'Settings', icon: 'mdi-cog', route: '/student/settings' },
  { title: 'Profile', icon: 'mdi-account', route: '/student/profile' },
]

const handleLogout = async () => {
  await logout()
  router.push('/')
}

const isActive = (itemRoute) => route.path.startsWith(itemRoute)
</script>

<template>
  <!-- NO v-app here --- App.vue already has it -->

  <Navbar @toggle-drawer="drawer = !drawer" />

  <!-- Sidebar -->
  <v-navigation-drawer 
    v-model="drawer" 
    color="white" 
    elevation="2" 
    width="260"
  >
    <!-- User Info -->
    <div class="pa-4 mt-2">
      <div class="d-flex align-center gap-3">
        <v-avatar size="40" color="secondary">
          <v-img 
            v-if="user?.profile_picture" 
            :src="user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000/storage/${user.profile_picture}`"
            cover 
          />
          <span v-else class="text-white font-weight-bold">
            {{ user?.first_name?.charAt(0)?.toUpperCase() }}
          </span>
        </v-avatar>
        <div>
          <p class="text-body-2 font-weight-bold">{{ user?.first_name }} {{ user?.last_name }}</p>
          <p class="text-caption text-grey">Student</p>
        </div>
      </div>
    </div>

    <v-divider class="mb-2" />

    <v-list nav density="compact">
      <v-list-item
        v-for="item in sidebarItems"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="isActive(item.route)"
        color="secondary"
        rounded="lg"
        class="mb-1"
        @click="router.push(item.route)"
      />
    </v-list>

    <v-divider class="my-2" />

    <v-list nav density="compact">
      <v-list-item
        v-for="item in bottomItems"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="isActive(item.route)"
        color="secondary"
        rounded="lg"
        class="mb-1"
        @click="router.push(item.route)"
      />
      <v-list-item
        prepend-icon="mdi-logout"
        title="Logout"
        rounded="lg"
        class="mb-1 text-error"
        @click="handleLogout"
      />
    </v-list>
  </v-navigation-drawer>

  <!-- Main Content -->
  <v-main class="bg-grey-lighten-4">
    <v-container fluid class="pa-6">
      <router-view />
    </v-container>
  </v-main>
</template>