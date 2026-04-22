<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()

const activeTab = ref('chat')
const messages = ref([])
const adminMessages = ref([])
const loading = ref(false)
const adminLoading = ref(false)
const newMessage = ref('')
const sendLoading = ref(false)
const error = ref('')
const messagesContainer = ref(null)
const claimApproved = ref(false)

const claimId = computed(() => route.params.claimId)

const fetchClaimStatus = async () => {
  try {
    const response = await api.get('/claims')
    const found = response.data.find(c => c.id == claimId.value)
    claimApproved.value = found?.status === 'approved'
  } catch(e) {
    console.error(e)
  }
}

const fetchMessages = async () => {
  loading.value = true
  try {
    const response = await api.get(`/messages/${claimId.value}`)
    messages.value = response.data.data || response.data
    await nextTick()
    scrollToBottom()
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchAdminMessages = async () => {
  adminLoading.value = true
  try {
    const response = await api.get('/admin-messages', {
      params: { claim_id: claimId.value }
    })
    adminMessages.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  } finally {
    adminLoading.value = false
  }
}

const sendMessage = async () => {
  if(!newMessage.value.trim()) return
  sendLoading.value = true
  error.value = ''
  try {
    const response = await api.post('/messages', {
      claim_id: claimId.value,
      message_body: newMessage.value
    })
    messages.value.push(response.data.data)
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to send message.'
  } finally {
    sendLoading.value = false
  }
}

const scrollToBottom = () => {
  if(messagesContainer.value){
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const isMyMessage = (message) => {
  return message.sender_id === user.value?.id
}

const getAvatarUrl = (profilePicture) => {
  if(!profilePicture) return null
  if(profilePicture.startsWith('http')) return profilePicture
  return `http://127.0.0.1:8000/storage/${profilePicture}`
}

onMounted(() => {
  fetchClaimStatus()
  fetchMessages()
  fetchAdminMessages()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center gap-3 mb-4">
      <v-btn icon variant="text" color="secondary" @click="router.push('/student/my-claims')">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div>
        <h2 class="text-h6 font-weight-bold text-secondary">Messages</h2>
        <p class="text-caption text-grey">Claim #{{ claimId }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="secondary" class="mb-4">
      <v-tab value="chat">
        <v-icon start>mdi-message</v-icon>
        Chat
      </v-tab>
      <v-tab value="admin">
        <v-icon start>mdi-shield-account</v-icon>
        Admin Messages
        <v-badge
          v-if="adminMessages.filter(m => !m.is_read).length > 0"
          :content="adminMessages.filter(m => !m.is_read).length"
          color="error"
          class="ml-2"
        />
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">

      <!-- ===== CHAT TAB ===== -->
      <v-tabs-window-item value="chat">

        <!-- LOCKED --- claim not approved yet -->
        <v-card v-if="!claimApproved" rounded="lg" elevation="2" class="pa-12 text-center">
          <v-icon size="64" color="grey">mdi-lock-outline</v-icon>
          <h3 class="text-h6 text-grey mt-4">Chat Not Available Yet</h3>
          <p class="text-body-2 text-grey mt-2">
            Messaging will be enabled once your claim is approved by the admin.
          </p>
        </v-card>

        <!-- OPEN --- claim is approved -->
        <v-card v-else rounded="lg" elevation="2">

          <!-- Chat Header -->
          <div class="pa-4 border-b d-flex align-center gap-3">
            <v-avatar size="40" color="secondary">
              <v-img
                v-if="messages[0]?.receiver?.profile_picture"
                :src="getAvatarUrl(messages[0]?.receiver?.profile_picture)"
                cover
              />
              <span v-else class="text-white font-weight-bold text-caption">
                {{ messages[0]?.receiver?.first_name?.charAt(0)?.toUpperCase() || '?' }}
              </span>
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-bold">
                {{ messages[0]?.receiver?.first_name }} {{ messages[0]?.receiver?.last_name }}
              </p>
              <p class="text-caption text-success">Active</p>
            </div>
          </div>

          <!-- Messages Area -->
          <div
            ref="messagesContainer"
            class="pa-4"
            style="height: 400px; overflow-y: auto;"
          >
            <div v-if="loading" class="text-center pa-12">
              <v-progress-circular indeterminate color="secondary" />
            </div>

            <div v-else>
              <div
                v-for="message in messages"
                :key="message.id"
                class="mb-4 d-flex"
                :class="isMyMessage(message) ? 'justify-end' : 'justify-start'"
              >
                <!-- Other person avatar -->
                <v-avatar
                  v-if="!isMyMessage(message)"
                  size="32"
                  color="secondary"
                  class="mr-2 mt-1"
                >
                  <v-img
                    v-if="message.sender?.profile_picture"
                    :src="getAvatarUrl(message.sender.profile_picture)"
                    cover
                  />
                  <span v-else class="text-white text-caption font-weight-bold">
                    {{ message.sender?.first_name?.charAt(0)?.toUpperCase() }}
                  </span>
                </v-avatar>

                <div style="max-width: 70%">
                  <p v-if="!isMyMessage(message)" class="text-caption text-grey mb-1 ml-1">
                    {{ message.sender?.first_name }}
                  </p>
                  <div
                    class="pa-3 rounded-lg"
                    :class="isMyMessage(message)
                      ? 'bg-secondary text-white rounded-te-0'
                      : 'bg-grey-lighten-3 rounded-ts-0'"
                  >
                    <p class="text-body-2">{{ message.message_body }}</p>
                    <p class="text-caption mt-1 opacity-70 text-right">
                      {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </p>
                  </div>
                </div>

                <!-- My avatar -->
                <v-avatar
                  v-if="isMyMessage(message)"
                  size="32"
                  color="secondary"
                  class="ml-2 mt-1"
                >
                  <v-img
                    v-if="user?.profile_picture"
                    :src="getAvatarUrl(user.profile_picture)"
                    cover
                  />
                  <span v-else class="text-white text-caption font-weight-bold">
                    {{ user?.first_name?.charAt(0)?.toUpperCase() }}
                  </span>
                </v-avatar>

              </div>

              <div v-if="messages.length === 0" class="text-center pa-8">
                <v-icon size="48" color="grey">mdi-message-outline</v-icon>
                <p class="text-body-2 text-grey mt-2">No messages yet. Start the conversation.</p>
              </div>
            </div>
          </div>

          <v-divider />

          <!-- Message Input -->
          <div class="pa-4">
            <v-alert v-if="error" type="error" density="compact" class="mb-3" closable @click:close="error = ''">
              {{ error }}
            </v-alert>
            <div class="d-flex gap-3 align-center">
              <v-text-field
                v-model="newMessage"
                placeholder="Type a message..."
                density="comfortable"
                outlined
                hide-details
                rounded
                @keyup.enter="sendMessage"
              />
              <v-btn
                color="secondary"
                icon
                size="large"
                :loading="sendLoading"
                @click="sendMessage"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </div>
          </div>

        </v-card>
      </v-tabs-window-item>

      <!-- ===== ADMIN MESSAGES TAB ===== -->
      <v-tabs-window-item value="admin">
        <v-card rounded="lg" elevation="2">

          <div class="pa-4 border-b d-flex align-center gap-3">
            <v-avatar size="40" color="secondary">
              <v-icon color="white">mdi-shield-account</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-bold">CampusFind Admin</p>
              <p class="text-caption text-grey">Official platform messages</p>
            </div>
          </div>

          <div class="pa-4" style="min-height: 300px;">
            <div v-if="adminLoading" class="text-center pa-12">
              <v-progress-circular indeterminate color="secondary" />
            </div>

            <div v-else>
              <v-card
                v-for="message in adminMessages"
                :key="message.id"
                rounded="lg"
                class="mb-3 pa-3 bg-grey-lighten-4"
              >
                <div class="d-flex align-start gap-3">
                  <!-- Admin Avatar -->
                  <v-avatar size="36" color="secondary">
                    <v-img
                      v-if="message.sender?.profile_picture"
                      :src="getAvatarUrl(message.sender.profile_picture)"
                      cover
                    />
                    <v-icon v-else color="white">mdi-shield-account</v-icon>
                  </v-avatar>

                  <div class="flex-grow-1">
                    <p class="text-caption font-weight-bold text-secondary mb-1">
                      {{ message.sender?.first_name }} {{ message.sender?.last_name }} • Admin
                    </p>
                    <p class="text-body-2">{{ message.message }}</p>
                    <p class="text-caption text-grey mt-1">
                      {{ new Date(message.created_at).toLocaleString() }}
                    </p>
                  </div>

                  <v-icon v-if="!message.is_read" color="secondary" size="10">
                    mdi-circle
                  </v-icon>
                </div>
              </v-card>

              <div v-if="adminMessages.length === 0" class="text-center pa-8">
                <v-icon size="48" color="grey">mdi-shield-account</v-icon>
                <p class="text-body-2 text-grey mt-2">No admin messages for this claim.</p>
              </div>
            </div>
          </div>

        </v-card>
      </v-tabs-window-item>

    </v-tabs-window>
  </div>
</template>