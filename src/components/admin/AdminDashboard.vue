<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'
import Navbar from '@/components/NavBar.vue'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()

const drawer = ref(true)

const sidebarItems = [
  { title: 'Overview', icon: 'mdi-view-dashboard', route: '/admin/dashboard' },
  { title: 'Claims', icon: 'mdi-clipboard-check', route: '/admin/claims' },
  { title: 'Appeals', icon: 'mdi-gavel', route: '/admin/appeals' },
    { title: 'Notifications', icon: 'mdi-bell', route: '/admin/notifications' }, 
  { title: 'Users', icon: 'mdi-account-group', route: '/admin/users' },
  { title: 'Found Items', icon: 'mdi-magnify', route: '/admin/items' },
  { title: 'Lost Items', icon: 'mdi-help-circle', route: '/admin/lost-items' },
  { title: 'Security Handovers', icon: 'mdi-shield-account', route: '/admin/handovers' },
]

const bottomItems = [
  { title: 'Profile', icon: 'mdi-account', route: '/admin/profile' },
]

const handleLogout = async () => {
  await logout()
  router.push('/')
}

const isActive = (itemRoute) => route.path.startsWith(itemRoute)
</script>

<template>
  <Navbar @toggle-drawer="drawer = !drawer" />

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
          <p class="text-caption text-grey">Administrator</p>
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

  <v-main class="bg-grey-lighten-4">
    <v-container fluid class="pa-6">
      <router-view />
    </v-container>
  </v-main>
</template>