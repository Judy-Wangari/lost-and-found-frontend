<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const { user, loadUserFromStorage } = useAuth()

const loading = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const successMessage = ref('')
const error = ref('')

const form = ref({ first_name: '', last_name: '', phone_number: '' })
const passwordForm = ref({ current_password: '', new_password: '', new_password_confirmation: '' })
const profilePictureFile = ref(null)
const previewUrl = ref(null)

const loadProfile = () => {
  form.value = {
    first_name: user.value?.first_name || '',
    last_name: user.value?.last_name || '',
    phone_number: user.value?.phone_number || '',
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if(!file) return
  profilePictureFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const saveProfile = async () => {
  saving.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('first_name', form.value.first_name)
    formData.append('last_name', form.value.last_name)
    formData.append('phone_number', form.value.phone_number)
    if(profilePictureFile.value){
      formData.append('profile_picture', profilePictureFile.value)
    }
    await api.post('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    successMessage.value = 'Profile updated successfully.'
    loadUserFromStorage()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to update profile.'
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  changingPassword.value = true
  error.value = ''
  try {
    await api.post('/change-password', passwordForm.value)
    successMessage.value = 'Password changed successfully.'
    passwordForm.value = { current_password: '', new_password: '', new_password_confirmation: '' }
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to change password.'
  } finally {
    changingPassword.value = false
  }
}

const getAvatarUrl = () => {
  if(previewUrl.value) return previewUrl.value
  if(!user.value?.profile_picture) return null
  if(user.value.profile_picture.startsWith('http')) return user.value.profile_picture
  return `http://127.0.0.1:8000/storage/${user.value.profile_picture}`
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">My Profile</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">Manage your account details</p>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">{{ successMessage }}</v-alert>
    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">{{ error }}</v-alert>

    <v-row>
      <v-col cols="12" md="5">
        <v-card rounded="lg" elevation="1" class="pa-6 text-center mb-4">
          <v-avatar size="100" color="secondary" class="mb-4">
            <v-img v-if="getAvatarUrl()" :src="getAvatarUrl()" cover />
            <span v-else class="text-white text-h4 font-weight-bold">
              {{ user?.first_name?.charAt(0)?.toUpperCase() }}
            </span>
          </v-avatar>

          <p class="text-h6 font-weight-bold">{{ user?.first_name }} {{ user?.last_name }}</p>
          <v-chip size="small" color="secondary" class="mt-1">{{ user?.role }}</v-chip>
          <p class="text-body-2 text-grey mt-2">{{ user?.email }}</p>

          <v-btn
            color="secondary"
            variant="tonal"
            class="mt-4"
            prepend-icon="mdi-camera"
            @click="$refs.fileInput.click()"
          >
            Change Photo
          </v-btn>
          <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="handleFileChange" />
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <!-- Profile Info -->
        <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
          <p class="text-subtitle-2 font-weight-bold mb-4">Personal Information</p>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.first_name" label="First Name" density="comfortable" outlined />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.last_name" label="Last Name" density="comfortable" outlined />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.phone_number" label="Phone Number" density="comfortable" outlined />
            </v-col>
          </v-row>
          <v-btn color="secondary" :loading="saving" @click="saveProfile">Save Changes</v-btn>
        </v-card>

        <!-- Change Password -->
        <v-card rounded="lg" elevation="1" class="pa-4">
          <p class="text-subtitle-2 font-weight-bold mb-4">Change Password</p>
          <v-text-field v-model="passwordForm.current_password" label="Current Password" type="password" density="comfortable" outlined class="mb-2" />
          <v-text-field v-model="passwordForm.new_password" label="New Password" type="password" density="comfortable" outlined class="mb-2" />
          <v-text-field v-model="passwordForm.new_password_confirmation" label="Confirm New Password" type="password" density="comfortable" outlined class="mb-4" />
          <v-btn color="secondary" variant="tonal" :loading="changingPassword" @click="changePassword">Change Password</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>