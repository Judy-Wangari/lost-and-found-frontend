<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const { user } = useAuth()

const saving = ref(false)
const successMessage = ref('')
const error = ref('')

const phoneNumber = ref('')
const profilePicture = ref(null)
const profilePicturePreview = ref(null)

// Computed full URL for profile picture
const profilePictureUrl = computed(() => {
  if(profilePicturePreview.value) return profilePicturePreview.value
  if(user.value?.profile_picture){
    if(user.value.profile_picture.startsWith('http')) return user.value.profile_picture
    return `http://127.0.0.1:8000/storage/${user.value.profile_picture}`
  }
  return null
})

const loadProfile = () => {
  if(user.value){
    phoneNumber.value = user.value.phone_number || ''
  }
}

const handlePhotoChange = (file) => {
  if(file){
    profilePicture.value = file
    profilePicturePreview.value = URL.createObjectURL(file)
  }
}

const saveProfile = async () => {
  saving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('phone_number', phoneNumber.value)
    if(profilePicture.value){
      formData.append('profile_picture', profilePicture.value)
    }

    const response = await api.post('/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const updatedUser = response.data.user

    // Update the shared user ref
    user.value = updatedUser

    // Update sessionStorage with new user data
    sessionStorage.setItem('user', JSON.stringify(updatedUser))

    // Clear local preview since we now use the server path
    profilePicturePreview.value = null

    successMessage.value = 'Profile updated successfully.'

  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to update profile.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">My Profile</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        View and update your profile information
      </p>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <v-row>
      <!-- Profile Picture -->
      <v-col cols="12" md="4" class="text-center">
        <v-card rounded="lg" elevation="2" class="pa-6">
          <v-avatar size="120" color="secondary" class="mb-4">
            <v-img v-if="profilePictureUrl" :src="profilePictureUrl" cover />
            <span v-else class="text-h4 text-white font-weight-bold">
              {{ user?.first_name?.charAt(0)?.toUpperCase() }}
            </span>
          </v-avatar>

          <p class="text-h6 font-weight-bold">
            {{ user?.first_name }} {{ user?.last_name }}
          </p>
          <v-chip color="secondary" size="small" class="mt-2 text-capitalize">
            {{ user?.role }}
          </v-chip>

          <div class="mt-4">
            <v-file-input
              label="Change Photo"
              accept="image/*"
              prepend-inner-icon="mdi-camera"
              density="compact"
              outlined
              hide-details
              @change="handlePhotoChange($event.target.files[0])"
            />
          </div>
        </v-card>
      </v-col>

      <!-- Profile Details -->
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="2" class="pa-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Personal Information</h3>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="user?.first_name"
                label="First Name"
                density="comfortable"
                outlined
                readonly
                bg-color="grey-lighten-4"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="user?.last_name"
                label="Last Name"
                density="comfortable"
                outlined
                readonly
                bg-color="grey-lighten-4"
              />
            </v-col>
          </v-row>

          <v-text-field
            :model-value="user?.email"
            label="Email Address"
            density="comfortable"
            outlined
            readonly
            bg-color="grey-lighten-4"
            class="mb-3"
          />

          <v-text-field
            v-model="phoneNumber"
            label="Phone Number"
            density="comfortable"
            outlined
            class="mb-4"
          />

          <v-btn color="secondary" :loading="saving" @click="saveProfile">
            Save Changes
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>