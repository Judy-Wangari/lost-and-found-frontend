
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const { register, loading, error, clearError } = useAuth()
  

const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const successMessage = ref('')


//form fields
const first_name = ref('')
const last_name = ref('')
const email = ref('')
const phone_number = ref('')
const profile_picture = ref(null)
const role = ref('student')
const password = ref('')
const password_confirmation = ref('')



const roleOptions = [
  { title: 'Student', value: 'student' },
  { title: 'Admin', value: 'admin' },
  { title: 'Security', value: 'security' }
]

 const rules = {
      required: value => !!value || 'This field is required',
      email: value => !value || /.+@.+\..+/.test(value) || 'E-mail must be valid',
      minLength: value => !value || value.length >= 6 || 'Password must be at least 6 characters',
      passwordMatch: value => value === password.value || 'Passwords do not match'
    }

const handleRegister = async () => {
  clearError()

 try {
    const result = await register({
      first_name: first_name.value,
      last_name: last_name.value,
      email: email.value,
      phone_number: phone_number.value,
      role: role.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
      profile_picture: profile_picture.value
    })

    if (result.success) {
      successMessage.value = result.message

      if (role.value === 'student') {
        // Student registers successfully → redirect to login
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        // Admin or Security → show pending message
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    }
  } catch (err) {
    console.error('Registration failed:', err)
  }
}
</script>
<template>
  <v-container fluid class="bg-grey-lighten-4 min-h-screen d-flex align-center  ">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="7" lg="5">
        <v-card elevation="8" class="pa-8 rounded-xl">
          <div class="text-center mb-8">
            <h1 class="text-h4 font-weight-bold text-secondary">Create Account</h1>
            <p class="text-body-1 mt-2 text-grey-darken-1">Join CampusFind</p>
          </div>

          <v-alert v-if="error" type="error" closable class="mb-6">{{ error }}</v-alert>
          <v-alert v-if="successMessage" type="success" closable class="mb-6">{{ successMessage }}</v-alert>

          <v-form @submit.prevent="handleRegister" >
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="first_name"
                  label="First Name"
                  outlined
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="last_name"
                  label="Last Name"
                  outlined
                  density="comfortable"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="email"
              label="Email Address"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              outlined
              density="comfortable"
              :rules="[rules.required, rules.email]"
              required
            />

            <v-text-field
              v-model="phone_number"
              label="Phone Number"
              prepend-inner-icon="mdi-phone"
              outlined
              density="comfortable"
              :rules="[rules.required]"
              required
            />

            <v-select
              v-model="role"
              :items="roleOptions"
              label="Register As"
              outlined
              density="comfortable"
              :rules="[rules.required]"
              required
            />

            <v-text-field
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              outlined
              density="comfortable"
              :rules="[rules.required, rules.minLength]"
              required
            />

            <v-text-field
              v-model="password_confirmation"
              label="Confirm Password"
              :type="showPasswordConfirm ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
              outlined
              density="comfortable"
              :rules="[rules.required, rules.passwordMatch]"
              required
            />

            <v-file-input
              v-model="profile_picture"
              label="Profile Picture (Optional)"
              accept="image/*"
              prepend-inner-icon="mdi-camera"
              outlined
              density="comfortable"
              show-size
            />

            <v-btn
              type="submit"
              color="secondary"
              block
              size="large"
              :loading="loading"
              class="mt-6 text-none font-weight-medium"
            >
              Create Account
            </v-btn>
          </v-form>

          <div class="text-center mt-8 text-body-2">
            Already have an account? 
            <router-link to="/login" class="text-secondary font-weight-medium text-decoration-none">
              Log in here
            </router-link>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
 <v-container fluid class="bg-primary text-center py-4 text-black">
  &copy; 2026 CampusFind. Design by Campus Designs
</v-container>



</template>
