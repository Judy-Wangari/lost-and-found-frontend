<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const route = useRoute()
const { user } = useAuth()

const messages = ref([])
const loading = ref(false)
const newMessage = ref('')
const sendLoading = ref(false)
const error = ref('')
const messagesContainer = ref(null)

const claimId = route.params.claimId

const fetchMessages = async () => {
  loading.value = true
  try {
    const response = await api.get(`/messages/${claimId}`)
    messages.value = response.data.data || response.data
    await nextTick()
    scrollToBottom()
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const sendMessage = async () => {
  if(!newMessage.value.trim()) return

  sendLoading.value = true
  error.value = ''
  try {
    const response = await api.post('/messages', {
      claim_id: claimId,
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

onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">Messages</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Communicate with the finder to arrange collection
      </p>
    </div>

    <v-card rounded="lg" elevation="2">

      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="pa-4"
        style="height: 450px; overflow-y: auto;"
      >
        <div v-if="loading" class="text-center pa-12">
          <v-progress-circular indeterminate color="secondary" />
        </div>

        <div v-else>
          <div
            v-for="message in messages"
            :key="message.id"
            class="mb-3 d-flex"
            :class="isMyMessage(message) ? 'justify-end' : 'justify-start'"
          >
            <div
              class="pa-3 rounded-lg"
              style="max-width: 70%"
              :class="isMyMessage(message) ? 'bg-secondary text-white' : 'bg-grey-lighten-3'"
            >
              <p class="text-body-2">{{ message.message_body }}</p>
              <p class="text-caption mt-1 opacity-70">
                {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </p>
            </div>
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
        <v-alert v-if="error" type="error" density="compact" class="mb-3">{{ error }}</v-alert>
        <div class="d-flex gap-3">
          <v-text-field
            v-model="newMessage"
            placeholder="Type a message..."
            density="comfortable"
            outlined
            hide-details
            @keyup.enter="sendMessage"
          />
          <v-btn
            color="secondary"
            icon
            :loading="sendLoading"
            @click="sendMessage"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>
      </div>

    </v-card>
  </div>
</template>