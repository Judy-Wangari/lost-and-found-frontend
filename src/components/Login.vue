<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const { login, loading, error, clearError } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const successMessage = ref('')
const emailError = ref('')
const passwordError = ref('')

const validate = () => {
  emailError.value = ''
  passwordError.value = ''
  let valid = true

  if(!email.value){
    emailError.value = 'Email is required'
    valid = false
  } else if(!/^.+@.+\..+$/.test(email.value)){
    emailError.value = 'Email must be valid'
    valid = false
  }

  if(!password.value){
    passwordError.value = 'Password is required'
    valid = false
  }

  return valid
}

const handleLogin = async () => {
  clearError()
  successMessage.value = ''

  if(!validate()) return

  try {
    const result = await login({
      email: email.value,
      password: password.value
    })

    if(result.success){
      successMessage.value = result.message || 'Login successful!'

      setTimeout(() => {
        const role = result.user?.role
        if(role === 'student'){
          router.push('/student/dashboard')
        } else if(role === 'admin'){
          router.push('/admin/dashboard')
        } else if(role === 'security'){
          router.push('/security/dashboard')
        } else {
          router.push('/')
        }
      }, 800)
    }
  } catch(err) {
    console.error('Login failed:', err)
  }
}
</script>

<template>
  <div class="d-flex flex-column min-h-screen bg-grey-lighten-4">
    
    <v-container fluid class="d-flex align-center flex-grow-1">
      <v-row justify="center">
        <v-col cols="12" sm="10" md="6" lg="4">
          <v-card elevation="8" class="pa-8 rounded-xl">
            <div class="text-center mb-8">
              <h1 class="text-h4 font-weight-bold text-secondary">CampusFind</h1>
              <p class="text-body-1 mt-2 text-grey-darken-1">Lost & Found Platform</p>
            </div>

            <v-alert v-if="error" type="error" closable class="mb-6">{{ error }}</v-alert>
            <v-alert v-if="successMessage" type="success" closable class="mb-6">{{ successMessage }}</v-alert>

            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email Address"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                density="comfortable"
                :error-messages="emailError"
                @input="emailError = ''"
              />

              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                density="comfortable"
                :error-messages="passwordError"
                @input="passwordError = ''"
                autocomplete="new-password"
              />

              <div class="d-flex justify-end mb-6">
                <a href="#" class="text-caption text-secondary">Forgot Password?</a>
              </div>

              <v-btn
                type="submit"
                color="secondary"
                block
                size="large"
                :loading="loading"
                class="text-none font-weight-medium"
              >
                Log In
              </v-btn>
            </v-form>

            <div class="text-center mt-8 text-body-2">
              Don't have an account?
              <router-link to="/register" class="text-secondary font-weight-medium text-decoration-none">
                Sign up here
              </router-link>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-footer color="primary" class="justify-center py-4 text-black flex-grow-0">
      <div>&copy; 2026 CampusFind. Design by Campus Designs</div>
    </v-footer>
  </div>
</template>

<style scoped>
/* Ensures the div takes up at least the full height of the browser window */
.min-h-screen {
  min-height: 100vh;
}
</style>