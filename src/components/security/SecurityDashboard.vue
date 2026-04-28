<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()
const drawer = ref(true)

const navItems = [
  { title: 'Overview', icon: 'mdi-view-dashboard', to: '/security/dashboard' },
  { title: 'Handovers', icon: 'mdi-package-up', to: '/security/handovers' },
  { title: 'Profile', icon: 'mdi-account', to: '/security/profile' },
]

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <v-layout>
    <v-navigation-drawer v-model="drawer" color="primary" width="240">
      <div class="pa-4">
        <p class="text-h6 font-weight-bold text-secondary">CampusFind</p>
        <p class="text-caption text-grey-lighten-1">Security Portal</p>
      </div>

      <v-divider color="grey-darken-3" />

      <div class="pa-3 mt-2">
        <v-avatar size="40" color="secondary" class="mr-3">
          <v-img
            v-if="user?.profile_picture"
            :src="user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000/storage/${user.profile_picture}`"
            cover
          />
          <span v-else class="text-white font-weight-bold">{{ user?.first_name?.charAt(0)?.toUpperCase() }}</span>
        </v-avatar>
        <span class="text-body-2 text-white font-weight-medium">{{ user?.first_name }} {{ user?.last_name }}</span>
      </div>

      <v-divider color="grey-darken-3" class="mb-2" />

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          color="secondary"
          rounded="lg"
          class="mb-1"
        />
      </v-list>

      <template #append>
        <div class="pa-3">
          <v-btn block color="error" variant="tonal" prepend-icon="mdi-logout" @click="handleLogout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <div class="pa-6">
        <router-view />
      </div>
    </v-main>
  </v-layout>
</template>