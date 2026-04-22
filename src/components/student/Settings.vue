<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const router = useRouter()
const { logout } = useAuth()

const loading = ref(false)
const successMessage = ref('')
const error = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordError = ref('')

const changePassword = async () => {
  passwordError.value = ''
  successMessage.value = ''
  error.value = ''

  if(!currentPassword.value || !newPassword.value || !confirmNewPassword.value){
    passwordError.value = 'All fields are required.'
    return
  }

  if(newPassword.value !== confirmNewPassword.value){
    passwordError.value = 'New passwords do not match.'
    return
  }

  if(newPassword.value.length < 6){
    passwordError.value = 'New password must be at least 6 characters.'
    return
  }

  loading.value = true
  try {
    await api.post('/profile/change-password', {
      current_password: currentPassword.value,
      new_password: newPassword.value,
      new_password_confirmation: confirmNewPassword.value,
    })

    successMessage.value = 'Password changed successfully.'
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''

  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to change password.'
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">Settings</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Manage your account settings
      </p>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <v-row>
      <!-- Change Password -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="pa-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon color="secondary" class="mr-2">mdi-lock-reset</v-icon>
            Change Password
          </h3>

          <v-alert v-if="passwordError" type="error" density="compact" class="mb-4">
            {{ passwordError }}
          </v-alert>

          <v-text-field
            v-model="currentPassword"
            label="Current Password"
            :type="showCurrentPassword ? 'text' : 'password'"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
            density="comfortable"
            outlined
            class="mb-3"
          />

          <v-text-field
            v-model="newPassword"
            label="New Password"
            :type="showNewPassword ? 'text' : 'password'"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showNewPassword = !showNewPassword"
            density="comfortable"
            outlined
            class="mb-3"
          />

          <v-text-field
            v-model="confirmNewPassword"
            label="Confirm New Password"
            :type="showConfirmPassword ? 'text' : 'password'"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            density="comfortable"
            outlined
            class="mb-4"
          />

          <v-btn
            color="secondary"
            :loading="loading"
            @click="changePassword"
          >
            Update Password
          </v-btn>
        </v-card>
      </v-col>

      <!-- Account Actions -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="pa-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon color="secondary" class="mr-2">mdi-account-cog</v-icon>
            Account Actions
          </h3>

          <v-list>
            <v-list-item
              prepend-icon="mdi-account"
              title="Edit Profile"
              subtitle="Update your name, phone and photo"
              rounded="lg"
              class="mb-2"
              @click="router.push('/student/profile')"
            />

            <v-divider class="my-2" />

            <v-list-item
              prepend-icon="mdi-bell-outline"
              title="Notifications"
              subtitle="View all your notifications"
              rounded="lg"
              class="mb-2"
              @click="router.push('/student/notifications')"
            />

            <v-divider class="my-2" />

            <v-list-item
              prepend-icon="mdi-logout"
              title="Logout"
              subtitle="Sign out of your account"
              rounded="lg"
              class="text-error"
              @click="handleLogout"
            />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>