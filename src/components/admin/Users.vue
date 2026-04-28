<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const users = ref([])
const pendingUsers = ref([])
const loading = ref(false)
const pendingLoading = ref(false)
const successMessage = ref('')
const error = ref('')
const selectedTab = ref('all')

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/users')
    users.value = response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchPendingUsers = async () => {
  pendingLoading.value = true
  try {
    const response = await api.get('/users/pending')
    pendingUsers.value = response.data
  } catch(e) {
    console.error(e)
  } finally {
    pendingLoading.value = false
  }
}

const approveUser = async (userId) => {
  try {
    await api.post(`/users/${userId}/approve`)
    successMessage.value = 'User approved successfully.'
    fetchPendingUsers()
    fetchUsers()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to approve user.'
  }
}

const deleteUser = async (userId) => {
  if(!confirm('Are you sure you want to delete this user?')) return
  try {
    await api.delete(`/users/${userId}`)
    successMessage.value = 'User deleted successfully.'
    fetchUsers()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to delete user.'
  }
}

const getRoleColor = (role) => {
  const colors = { admin: 'secondary', student: 'primary', security: 'warning' }
  return colors[role] || 'grey'
}

const getStatusColor = (status) => {
  const colors = { active: 'success', pending: 'warning', suspended: 'error' }
  return colors[status] || 'grey'
}

onMounted(() => {
  fetchUsers()
  fetchPendingUsers()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Users</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">Manage platform users and approvals</p>
      </div>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">{{ successMessage }}</v-alert>
    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">{{ error }}</v-alert>

    <v-tabs v-model="selectedTab" color="secondary" class="mb-6">
      <v-tab value="all">
        All Users
        <v-chip size="x-small" class="ml-2">{{ users.length }}</v-chip>
      </v-tab>
      <v-tab value="pending">
        Pending Approval
        <v-chip v-if="pendingUsers.length > 0" size="x-small" color="warning" class="ml-2">{{ pendingUsers.length }}</v-chip>
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="selectedTab">

      <!-- All Users -->
      <v-tabs-window-item value="all">
        <div v-if="loading" class="text-center pa-12">
          <v-progress-circular indeterminate color="secondary" />
        </div>
        <v-card v-else rounded="lg" elevation="1">
          <v-table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="d-flex align-center gap-3 py-2">
                    <v-avatar size="36" color="secondary">
                      <v-img
                        v-if="user.profile_picture"
                        :src="user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000/storage/${user.profile_picture}`"
                        cover
                      />
                      <span v-else class="text-white text-caption font-weight-bold">
                        {{ user.first_name?.charAt(0)?.toUpperCase() }}
                      </span>
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-bold">{{ user.first_name }} {{ user.last_name }}</p>
                    </div>
                  </div>
                </td>
                <td class="text-body-2">{{ user.email }}</td>
                <td class="text-body-2">{{ user.phone_number || '---' }}</td>
                <td>
                  <v-chip :color="getRoleColor(user.role)" size="x-small">{{ user.role }}</v-chip>
                </td>
                <td>
                  <v-chip :color="getStatusColor(user.status)" size="x-small">{{ user.status || 'active' }}</v-chip>
                </td>
                <td class="text-body-2 text-grey">{{ new Date(user.created_at).toLocaleDateString() }}</td>
                <td>
                  <v-btn
                    v-if="user.role !== 'admin'"
                    color="error"
                    size="small"
                    variant="text"
                    icon
                    @click="deleteUser(user.id)"
                  >
                    <v-icon size="18">mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div v-if="users.length === 0" class="text-center pa-12">
            <v-icon size="64" color="grey">mdi-account-outline</v-icon>
            <p class="text-body-2 text-grey mt-2">No users found.</p>
          </div>
        </v-card>
      </v-tabs-window-item>

      <!-- Pending Approval -->
      <v-tabs-window-item value="pending">
        <div v-if="pendingLoading" class="text-center pa-12">
          <v-progress-circular indeterminate color="secondary" />
        </div>
        <div v-else>
          <v-row v-if="pendingUsers.length > 0">
            <v-col v-for="user in pendingUsers" :key="user.id" cols="12" md="6">
              <v-card rounded="lg" elevation="2" class="pa-4">
                <div class="d-flex align-center gap-4 mb-4">
                  <v-avatar size="52" color="secondary">
                    <v-img
                      v-if="user.profile_picture"
                      :src="user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000/storage/${user.profile_picture}`"
                      cover
                    />
                    <span v-else class="text-white font-weight-bold">
                      {{ user.first_name?.charAt(0)?.toUpperCase() }}
                    </span>
                  </v-avatar>
                  <div>
                    <p class="text-body-2 font-weight-bold">{{ user.first_name }} {{ user.last_name }}</p>
                    <p class="text-caption text-grey">{{ user.email }}</p>
                    <p class="text-caption text-grey">{{ user.phone_number }}</p>
                  </div>
                </div>
                <div class="mb-3">
                  <v-chip size="x-small" color="warning">Pending Approval</v-chip>
                  <p class="text-caption text-grey mt-1">
                    Registered {{ new Date(user.created_at).toLocaleDateString() }}
                  </p>
                </div>
                <v-btn color="success" size="small" block @click="approveUser(user.id)">
                  Approve Account
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
          <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
            <v-icon size="64" color="grey">mdi-account-check-outline</v-icon>
            <h3 class="text-h6 text-grey mt-4">No pending approvals</h3>
            <p class="text-body-2 text-grey mt-2">All accounts have been reviewed.</p>
          </v-card>
        </div>
      </v-tabs-window-item>

    </v-tabs-window>
  </div>
</template>