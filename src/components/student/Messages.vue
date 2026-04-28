<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()

// State
const claims = ref([])
const claimsLoading = ref(false)
const selectedClaim = ref(null)

const activeTab = ref('chat')
const messages = ref([])
const adminMessages = ref([])
const loading = ref(false)
const adminLoading = ref(false)
const newMessage = ref('')
const sendLoading = ref(false)
const adminReplyMessage = ref('')
const adminReplyLoading = ref(false)
const error = ref('')
const messagesContainer = ref(null)
const adminMessagesContainer = ref(null)
const claimApproved = ref(false)

// If navigated directly with claimId in route, pre-select that claim
const routeClaimId = computed(() => route.params.claimId)

const fetchClaims = async () => {
  claimsLoading.value = true
  try {
    const response = await api.get('/claims')
    claims.value = response.data

    // If routed with a specific claimId, auto-open it
    if(routeClaimId.value){
      const found = claims.value.find(c => c.id == routeClaimId.value)
      if(found) openClaim(found)
    }
  } catch(e) {
    console.error(e)
  } finally {
    claimsLoading.value = false
  }
}

const openClaim = async (claim) => {
  selectedClaim.value = claim
  activeTab.value = route.query.tab || 'chat'
  const itemStatus = claim.item?.status
  claimApproved.value = claim.status === 'approved' ||
                        itemStatus === 'awaiting_collection' ||
                        itemStatus === 'collected'
  await Promise.all([fetchMessages(claim.id), fetchAdminMessages(claim.id)])
}

const closeClaim = () => {
  selectedClaim.value = null
  messages.value = []
  adminMessages.value = []
  error.value = ''
}

const fetchMessages = async (claimId) => {
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

const fetchAdminMessages = async (claimId) => {
  adminLoading.value = true
  try {
    const response = await api.get('/admin-messages', {
      params: { claim_id: claimId }
    })
    adminMessages.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  } finally {
    adminLoading.value = false
  }
}

const sendMessage = async () => {
  if(!newMessage.value.trim() || !selectedClaim.value) return
  sendLoading.value = true
  error.value = ''
  try {
    const response = await api.post('/messages', {
      claim_id: selectedClaim.value.id,
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

// Admin reply --- open once admin has messaged, student can freely reply anytime after
const sendAdminReply = async () => {
  if(!adminReplyMessage.value.trim() || !selectedClaim.value) return

  // Find the last admin message to reply to
  const lastAdminMsg = adminMessages.value
    .filter(m => m.sender_id !== user.value?.id)
    .slice(-1)[0]

  if(!lastAdminMsg) return

  adminReplyLoading.value = true
  try {
    await api.post('/admin-messages', {
      claim_id: selectedClaim.value.id,
      receiver_id: lastAdminMsg.sender_id,
      message: adminReplyMessage.value,
      type: 'claim'
    })
    adminReplyMessage.value = ''
    fetchAdminMessages(selectedClaim.value.id)
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to send reply.'
  } finally {
    adminReplyLoading.value = false
  }
}

const scrollToBottom = () => {
  if(messagesContainer.value){
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const scrollAdminToBottom = () => {
  if(adminMessagesContainer.value){
    adminMessagesContainer.value.scrollTop = adminMessagesContainer.value.scrollHeight
  }
}

const isMyMessage = (message) => message.sender_id === user.value?.id

const getAvatarUrl = (pic) => {
  if(!pic) return null
  if(pic.startsWith('http')) return pic
  return `http://127.0.0.1:8000/storage/${pic}`
}

const getStatusColor = (status) => {
  const colors = { pending_review: 'warning', clarification_requested: 'orange', approved: 'success', rejected: 'error' }
  return colors[status] || 'grey'
}

// Count unread admin messages per claim for badge
const unreadAdminCount = (claimId) => {
  // This is approximate --- we show badge if user has unread admin messages
  return 0 // Will be refreshed when opening
}

watch(messages, async () => {
  await nextTick()
  scrollToBottom()
})

watch(adminMessages, async () => {
  await nextTick()
  scrollAdminToBottom()
})

onMounted(() => {
  fetchClaims()
})
</script>

<template>
  <div>

    <!-- ===== CLAIM LIST VIEW ===== -->
    <div v-if="!selectedClaim">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h2 class="text-h5 font-weight-bold text-secondary">Messages</h2>
          <p class="text-body-2 text-grey-darken-1 mt-1">Select a claim to view messages</p>
        </div>
        <v-btn
          variant="text"
          color="secondary"
          size="small"
          prepend-icon="mdi-bell-outline"
          @click="router.push('/student/notifications')"
        >
          Notifications
        </v-btn>
      </div>

      <div v-if="claimsLoading" class="text-center pa-12">
        <v-progress-circular indeterminate color="secondary" />
      </div>

      <div v-else>
        <v-card
          v-for="claim in claims"
          :key="claim.id"
          rounded="lg"
          elevation="2"
          class="mb-3 cursor-pointer"
          hover
          @click="openClaim(claim)"
        >
          <v-card-text class="d-flex align-center gap-4">
            <!-- Item image -->
            <v-img
              v-if="claim.item?.photo_path"
              :src="`http://127.0.0.1:8000/storage/${claim.item.photo_path}`"
              width="60"
              height="60"
              cover
              rounded="lg"
            />
            <div
              v-else
              class="d-flex align-center justify-center bg-grey-lighten-3 rounded-lg"
              style="width:60px;height:60px"
            >
              <v-icon color="grey">mdi-image-off</v-icon>
            </div>

            <!-- Claim info -->
            <div class="flex-grow-1">
              <p class="text-body-2 font-weight-bold text-capitalize">
                {{ claim.item?.category?.replace(/_/g, ' ') }}
              </p>
              <p class="text-caption text-grey">
                Claimed {{ new Date(claim.created_at).toLocaleDateString() }}
              </p>
              <v-chip :color="getStatusColor(claim.status)" size="x-small" class="mt-1">
                {{ claim.status.replace(/_/g, ' ') }}
              </v-chip>
            </div>

            <v-icon color="grey">mdi-chevron-right</v-icon>
          </v-card-text>
        </v-card>

        <v-card v-if="claims.length === 0" rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
          <v-icon size="64" color="grey">mdi-message-outline</v-icon>
          <h3 class="text-h6 text-grey mt-4">No claims yet</h3>
          <p class="text-body-2 text-grey mt-2">You have no active claims to message about.</p>
        </v-card>
      </div>
    </div>

    <!-- ===== CLAIM CONVERSATION VIEW ===== -->
    <div v-else>

      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center gap-3">
          <v-btn icon variant="text" color="secondary" @click="closeClaim">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div class="d-flex align-center gap-3">
            <v-img
              v-if="selectedClaim.item?.photo_path"
              :src="`http://127.0.0.1:8000/storage/${selectedClaim.item.photo_path}`"
              width="40"
              height="40"
              cover
              rounded="lg"
            />
            <div>
              <p class="text-body-2 font-weight-bold text-capitalize">
                {{ selectedClaim.item?.category?.replace(/_/g, ' ') }}
              </p>
              <v-chip :color="getStatusColor(selectedClaim.status)" size="x-small">
                {{ selectedClaim.status.replace(/_/g, ' ') }}
              </v-chip>
            </div>
          </div>
        </div>
        <v-btn
          variant="text"
          color="secondary"
          size="small"
          prepend-icon="mdi-bell-outline"
          @click="router.push('/student/notifications')"
        >
          Notifications
        </v-btn>
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
            v-if="adminMessages.filter(m => !m.is_read && m.sender_id !== user?.id).length > 0"
            :content="adminMessages.filter(m => !m.is_read && m.sender_id !== user?.id).length"
            color="error"
            class="ml-2"
          />
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="activeTab">

        <!-- ===== CHAT TAB ===== -->
        <v-tabs-window-item value="chat">
          <!-- LOCKED -->
          <v-card v-if="!claimApproved" rounded="lg" elevation="2" class="pa-12 text-center">
            <v-icon size="64" color="grey">mdi-lock-outline</v-icon>
            <h3 class="text-h6 text-grey mt-4">Chat Not Available Yet</h3>
            <p class="text-body-2 text-grey mt-2">
              Messaging will be enabled once your claim is approved by the admin.
            </p>
          </v-card>

          <!-- OPEN -->
          <v-card v-else rounded="lg" elevation="2">
            <!-- Chat header showing other person -->
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

            <!-- Messages -->
            <div ref="messagesContainer" class="pa-4" style="height: 380px; overflow-y: auto;">
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
                  <v-avatar v-if="!isMyMessage(message)" size="32" color="secondary" class="mr-2 mt-1">
                    <v-img v-if="message.sender?.profile_picture" :src="getAvatarUrl(message.sender.profile_picture)" cover />
                    <span v-else class="text-white text-caption font-weight-bold">{{ message.sender?.first_name?.charAt(0)?.toUpperCase() }}</span>
                  </v-avatar>
                  <div style="max-width: 70%">
                    <p v-if="!isMyMessage(message)" class="text-caption text-grey mb-1 ml-1">{{ message.sender?.first_name }}</p>
                    <div class="pa-3 rounded-lg" :class="isMyMessage(message) ? 'bg-secondary text-white rounded-te-0' : 'bg-grey-lighten-3 rounded-ts-0'">
                      <p class="text-body-2">{{ message.message_body }}</p>
                      <p class="text-caption mt-1 opacity-70 text-right">
                        {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                      </p>
                    </div>
                  </div>
                  <v-avatar v-if="isMyMessage(message)" size="32" color="secondary" class="ml-2 mt-1">
                    <v-img v-if="user?.profile_picture" :src="getAvatarUrl(user.profile_picture)" cover />
                    <span v-else class="text-white text-caption font-weight-bold">{{ user?.first_name?.charAt(0)?.toUpperCase() }}</span>
                  </v-avatar>
                </div>
                <div v-if="messages.length === 0" class="text-center pa-8">
                  <v-icon size="48" color="grey">mdi-message-outline</v-icon>
                  <p class="text-body-2 text-grey mt-2">No messages yet. Start the conversation.</p>
                </div>
              </div>
            </div>

            <v-divider />
            <div class="pa-4">
              <v-alert v-if="error" type="error" density="compact" class="mb-3" closable @click:close="error = ''">{{ error }}</v-alert>
              <div class="d-flex gap-3 align-center">
                <v-text-field v-model="newMessage" placeholder="Type a message..." density="comfortable" outlined hide-details rounded @keyup.enter="sendMessage" />
                <v-btn color="secondary" icon size="large" :loading="sendLoading" @click="sendMessage">
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

            <!-- Messages -->
            <div ref="adminMessagesContainer" class="pa-4" style="min-height: 300px; max-height: 400px; overflow-y: auto;">
              <div v-if="adminLoading" class="text-center pa-12">
                <v-progress-circular indeterminate color="secondary" />
              </div>
              <div v-else>
                <div
                  v-for="message in adminMessages"
                  :key="message.id"
                  class="mb-4 d-flex"
                  :class="message.sender_id === user?.id ? 'justify-end' : 'justify-start'"
                >
                  <!-- Unread highlight for incoming messages -->
                  <v-avatar v-if="message.sender_id !== user?.id" size="32" color="secondary" class="mr-2 mt-1">
                    <v-img v-if="message.sender?.profile_picture" :src="getAvatarUrl(message.sender.profile_picture)" cover />
                    <v-icon v-else color="white" size="18">mdi-shield-account</v-icon>
                  </v-avatar>

                  <div style="max-width: 70%">
                    <p class="text-caption text-grey mb-1" :class="message.sender_id === user?.id ? 'text-right mr-1' : 'ml-1'">
                      {{ message.sender_id !== user?.id ? (message.sender?.first_name + ' • Admin') : 'You' }}
                    </p>
                    <div
                      class="pa-3 rounded-lg"
                      :class="[
                        message.sender_id === user?.id ? 'bg-secondary text-white rounded-te-0' : 'rounded-ts-0',
                        message.sender_id !== user?.id && !message.is_read ? 'bg-blue-lighten-5 border border-secondary' : message.sender_id !== user?.id ? 'bg-grey-lighten-3' : ''
                      ]"
                    >
                      <p class="text-body-2">{{ message.message }}</p>
                      <p class="text-caption mt-1 opacity-70 text-right">
                        {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                      </p>
                    </div>
                    <!-- New badge for unread incoming -->
                    <p v-if="message.sender_id !== user?.id && !message.is_read" class="text-caption text-secondary mt-1 ml-1">
                      <v-icon size="10" color="secondary">mdi-circle</v-icon>
                      New
                    </p>
                  </div>

                  <v-avatar v-if="message.sender_id === user?.id" size="32" color="secondary" class="ml-2 mt-1">
                    <v-img v-if="user?.profile_picture" :src="getAvatarUrl(user.profile_picture)" cover />
                    <span v-else class="text-white text-caption font-weight-bold">{{ user?.first_name?.charAt(0)?.toUpperCase() }}</span>
                  </v-avatar>
                </div>

                <div v-if="adminMessages.length === 0" class="text-center pa-8">
                  <v-icon size="48" color="grey">mdi-shield-account</v-icon>
                  <p class="text-body-2 text-grey mt-2">No admin messages for this claim.</p>
                </div>
              </div>
            </div>

            <!-- Reply input --- available once admin has sent at least one message -->
            <div v-if="adminMessages.some(m => m.sender_id !== user?.id)">
              <v-divider />
              <div class="pa-4">
                <div class="d-flex gap-3 align-center">
                  <v-text-field
                    v-model="adminReplyMessage"
                    placeholder="Reply to admin..."
                    density="comfortable"
                    outlined
                    hide-details
                    rounded
                    @keyup.enter="sendAdminReply"
                  />
                  <v-btn color="secondary" icon size="large" :loading="adminReplyLoading" @click="sendAdminReply">
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <div v-else class="pa-4 text-center">
              <p class="text-caption text-grey">
                You will be able to reply once admin sends you a message.
              </p>
            </div>
          </v-card>
        </v-tabs-window-item>

      </v-tabs-window>
    </div>

  </div>
</template>