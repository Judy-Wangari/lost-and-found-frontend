<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

const claim = ref(null)
const finderDetails = ref(null)
const ownerLostDetails = ref(null)
const loading = ref(false)
const actionLoading = ref(false)
const successMessage = ref('')
const error = ref('')

const showClarificationDialog = ref(false)
const clarificationText = ref('')

const messageTab = ref('chat')
const chatMessages = ref([])

// Admin message state --- separate threads per person
const finderMessages = ref([])
const ownerMessages = ref([])
const finderMessageText = ref('')
const ownerMessageText = ref('')
const finderMessageLoading = ref(false)
const ownerMessageLoading = ref(false)
const messageBoth = ref(false)
const bothMessageText = ref('')
const bothMessageLoading = ref(false)


const finderThreadContainer = ref(null)
const ownerThreadContainer = ref(null)

const fetchChatMessages = async () => {
  try {
    const response = await api.get(`/messages/${route.params.id}`)
    chatMessages.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  }
}

const fetchAdminMessages = async () => {
  if(!claim.value) return
  const finderId = claim.value.item?.posted_by
  const ownerId = claim.value.claimed_by?.id  // claimed_by is the full user object

  try {
    const [finderRes, ownerRes] = await Promise.all([
      api.get('/admin-messages', { params: { claim_id: route.params.id, participant_id: finderId } }),
      api.get('/admin-messages', { params: { claim_id: route.params.id, participant_id: ownerId } })
    ])
    finderMessages.value = finderRes.data.data || finderRes.data
    ownerMessages.value = ownerRes.data.data || ownerRes.data
  } catch(e) {
    console.error(e)
  }
}

const sendToFinder = async () => {
  if(!finderMessageText.value.trim()) return
  finderMessageLoading.value = true
  try {
    await api.post('/admin-messages', {
      claim_id: route.params.id,
      receiver_id: claim.value.item?.posted_by,
      message: finderMessageText.value,
      type: 'claim'
    })
    finderMessageText.value = ''
    fetchAdminMessages()
    successMessage.value = 'Message sent to Finder.'
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to send.'
  } finally {
    finderMessageLoading.value = false
  }
}

const sendToOwner = async () => {
  if(!ownerMessageText.value.trim()) return
  ownerMessageLoading.value = true
  const ownerId = claim.value.claimed_by?.id  // claimed_by is the full user object
  if(!ownerId){
    error.value = 'Could not resolve owner ID.'
    ownerMessageLoading.value = false
    return
  }
  try {
    await api.post('/admin-messages', {
      claim_id: String(route.params.id),
      receiver_id: ownerId,
      message: ownerMessageText.value,
      type: 'claim'
    })
    ownerMessageText.value = ''
    fetchAdminMessages()
    successMessage.value = 'Message sent to Owner.'
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to send.'
  } finally {
    ownerMessageLoading.value = false
  }
}

const sendToBoth = async () => {
  if(!bothMessageText.value.trim()) return
  bothMessageLoading.value = true
  const finderId = claim.value.item?.posted_by
  const ownerId = claim.value.claimed_by?.id  // claimed_by is the full user object

  if(!finderId || !ownerId){
    error.value = 'Could not resolve finder or owner ID. Please refresh and try again.'
    bothMessageLoading.value = false
    return
  }
  try {
    await Promise.all([
      api.post('/admin-messages', {
        claim_id: String(route.params.id),
        receiver_id: finderId,
        message: bothMessageText.value,
        type: 'claim'
      }),
      api.post('/admin-messages', {
        claim_id: String(route.params.id),
        receiver_id: ownerId,
        message: bothMessageText.value,
        type: 'claim'
      })
    ])
    bothMessageText.value = ''
    messageBoth.value = false
    fetchAdminMessages()
    successMessage.value = 'Message sent to both parties.'
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to send.'
  } finally {
    bothMessageLoading.value = false
  }
}
const fetchClaim = async () => {
  loading.value = true
  try {
    const response = await api.get(`/claims/${route.params.id}`)
    claim.value = response.data.claim
    finderDetails.value = response.data.finder_details
    ownerLostDetails.value = response.data.owner_lost_details
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleAction = async (action) => {
  if(action === 'clarification_requested'){
    showClarificationDialog.value = true
    return
  }
  actionLoading.value = true
  error.value = ''
  try {
    await api.put(`/claims/${route.params.id}`, { action })
    successMessage.value = `Claim ${action}d successfully.`
    fetchClaim()
  } catch(e) {
    error.value = e.response?.data?.message || 'Action failed.'
  } finally {
    actionLoading.value = false
  }
}

const submitClarification = async () => {
  if(!clarificationText.value) return
  actionLoading.value = true
  error.value = ''
  try {
    await api.put(`/claims/${route.params.id}`, {
      action: 'clarification_requested',
      clarification_text: clarificationText.value
    })
    successMessage.value = 'Clarification requested successfully.'
    showClarificationDialog.value = false
    clarificationText.value = ''
    fetchClaim()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to request clarification.'
  } finally {
    actionLoading.value = false
  }
}

const undoApproval = async () => {
  actionLoading.value = true
  error.value = ''
  try {
    await api.post(`/claims/${route.params.id}/undo-approval`)
    successMessage.value = 'Approval undone successfully.'
    fetchClaim()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to undo approval.'
  } finally {
    actionLoading.value = false
  }
}

watch(finderMessages, async () => {
  await nextTick()
  if(finderThreadContainer.value) finderThreadContainer.value.scrollTop = finderThreadContainer.value.scrollHeight
})

watch(ownerMessages, async () => {
  await nextTick()
  if(ownerThreadContainer.value) ownerThreadContainer.value.scrollTop = ownerThreadContainer.value.scrollHeight
})


onMounted(async () => {
  await fetchClaim()
  fetchChatMessages()
  fetchAdminMessages()
})
</script>

<template>
  <div>
    <!-- Back Button -->
    <v-btn
      variant="text"
      color="secondary"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      @click="router.push('/admin/claims')"
    >
      Back to Claims
    </v-btn>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else-if="claim">

      <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">
        {{ successMessage }}
      </v-alert>

      <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">
        {{ error }}
      </v-alert>

      <!-- Claim Status and Actions -->
      <v-card rounded="lg" elevation="1" class="pa-4 mb-6">
        <div class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div>
            <p class="text-body-2 font-weight-bold">Claim #{{ claim.id }}</p>
            <v-chip
              :color="claim.status === 'pending_review' ? 'warning' : claim.status === 'approved' ? 'success' : 'error'"
              size="small"
              class="mt-1"
            >
              {{ claim.status.replace(/_/g, ' ') }}
            </v-chip>
          </div>
          <div class="d-flex gap-3 flex-wrap">
            <v-btn
              v-if="claim.status === 'pending_review' || claim.status === 'clarification_requested'"
              color="success"
              :loading="actionLoading"
              @click="handleAction('approve')"
            >
              Approve
            </v-btn>
            <v-btn
              v-if="claim.status === 'pending_review' || claim.status === 'clarification_requested'"
              color="error"
              variant="tonal"
              :loading="actionLoading"
              @click="handleAction('reject')"
            >
              Reject
            </v-btn>
            <v-btn
              v-if="claim.status === 'approved'"
              color="warning"
              variant="tonal"
              :loading="actionLoading"
              @click="undoApproval"
            >
              Undo Approval
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Clarification Request Text if exists -->
      <v-alert v-if="claim.clarification_request_text" type="warning" class="mb-6">
        <strong>Clarification Requested:</strong> {{ claim.clarification_request_text }}
      </v-alert>

      <!-- Three Panel Review -->
      <v-row>

        <!-- Panel 1 --- Finder's Private Details -->
        <v-col cols="12" :md="ownerLostDetails ? 4 : 6">
          <v-card rounded="lg" elevation="1" class="pa-4 h-100">
            <div class="d-flex align-center gap-2 mb-4">
              <v-icon color="secondary">mdi-account-search</v-icon>
              <p class="text-subtitle-2 font-weight-bold">Finder's Private Details</p>
            </div>
            <v-img
              v-if="claim.item?.photo_path"
              :src="`http://127.0.0.1:8000/storage/${claim.item.photo_path}`"
              height="150"
              cover
              rounded="lg"
              class="mb-4"
            />
            <div v-if="finderDetails">
              <div class="mb-3">
                <p class="text-caption text-grey">Category</p>
                <p class="text-body-2 text-capitalize">{{ claim.item?.category?.replace(/_/g, ' ') }}</p>
              </div>
              <div class="mb-3">
                <p class="text-caption text-grey">Brand / Model / Logo</p>
                <p class="text-body-2">{{ finderDetails.brand_model_or_logo || '---' }}</p>
              </div>
              <div class="mb-3">
                <p class="text-caption text-grey">Contents or Attachments</p>
                <p class="text-body-2">{{ finderDetails.what_was_inside_or_attached || '---' }}</p>
              </div>
              <div class="mb-3">
                <p class="text-caption text-grey">Hidden or Internal Details</p>
                <p class="text-body-2">{{ finderDetails.hidden_or_internal_details || '---' }}</p>
              </div>
              <div class="mb-3">
                <p class="text-caption text-grey">Extra Notes</p>
                <p class="text-body-2">{{ finderDetails.extra_notes || '---' }}</p>
              </div>
              <div class="mb-3">
                <p class="text-caption text-grey">Location Found</p>
                <p class="text-body-2">{{ finderDetails.location_found || '---' }}</p>
              </div>
            </div>
            <p v-else class="text-body-2 text-grey">No private details available.</p>
          </v-card>
        </v-col>

        <!-- Panel 2 --- Owner's Lost Post Details -->
        <v-col v-if="ownerLostDetails" cols="12" md="4">
          <v-card rounded="lg" elevation="1" class="pa-4 h-100">
            <div class="d-flex align-center gap-2 mb-4">
              <v-icon color="orange">mdi-help-circle</v-icon>
              <p class="text-subtitle-2 font-weight-bold">Owner's Lost Post Details</p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Brand / Model / Logo</p>
              <p class="text-body-2">{{ ownerLostDetails.brand_model_or_logo || '---' }}</p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Contents or Attachments</p>
              <p class="text-body-2">{{ ownerLostDetails.what_was_inside_or_attached || '---' }}</p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Hidden or Internal Details</p>
              <p class="text-body-2">{{ ownerLostDetails.hidden_or_internal_details || '---' }}</p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Extra Notes</p>
              <p class="text-body-2">{{ ownerLostDetails.extra_notes || '---' }}</p>
            </div>
          </v-card>
        </v-col>

        <!-- Panel 3 --- Owner's Claim Description -->
        <v-col cols="12" :md="ownerLostDetails ? 4 : 6">
          <v-card rounded="lg" elevation="1" class="pa-4 h-100">
            <div class="d-flex align-center gap-2 mb-4">
              <v-icon color="secondary">mdi-account</v-icon>
              <p class="text-subtitle-2 font-weight-bold">Owner's Claim Description</p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Claimed By</p>
              <p class="text-body-2">
                {{ claim.claimed_by?.first_name }} {{ claim.claimed_by?.last_name }}
              </p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Brand / Model / Logo</p>
              <p class="text-body-2">{{ claim.brand_model_or_logo || '---' }}</p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Contents or Attachments</p>
              <p class="text-body-2">{{ claim.what_was_inside_or_attached || '---' }}</p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Hidden or Internal Details</p>
              <p class="text-body-2">{{ claim.hidden_or_internal_details || '---' }}</p>
            </div>
            <div class="mb-3">
              <p class="text-caption text-grey">Extra Notes</p>
              <p class="text-body-2">{{ claim.extra_notes || '---' }}</p>
            </div>
          </v-card>
        </v-col>

      </v-row>
    </div>

    <!-- Messages Section -->
    <v-card rounded="lg" elevation="1" class="pa-4 mt-6" v-if="claim">
      <p class="text-subtitle-2 font-weight-bold mb-4">
        <v-icon color="secondary" class="mr-2">mdi-message</v-icon>
        Messages
      </p>

      <v-tabs v-model="messageTab" color="secondary" class="mb-4">
        <v-tab value="chat">
          <v-icon start size="16">mdi-message-text</v-icon>
          Finder-Owner Chat
        </v-tab>
        <v-tab value="admin">
          <v-icon start size="16">mdi-shield-account</v-icon>
          Admin Messages
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="messageTab">

        <!-- TAB 1 --- Finder-Owner Chat (read only for admin) -->
        <v-tabs-window-item value="chat">
          <div style="height: 300px; overflow-y: auto;" class="pa-2">
            <div v-if="chatMessages.length === 0" class="text-center pa-8">
              <v-icon size="48" color="grey">mdi-message-outline</v-icon>
              <p class="text-body-2 text-grey mt-2">No messages between finder and owner yet.</p>
            </div>
            <div v-for="message in chatMessages" :key="message.id" class="mb-3">
              <div class="d-flex align-center gap-2 mb-1">
                <v-avatar size="28" color="secondary">
                  <v-img
                    v-if="message.sender?.profile_picture"
                    :src="message.sender.profile_picture.startsWith('http') ? message.sender.profile_picture : `http://127.0.0.1:8000/storage/${message.sender.profile_picture}`"
                    cover
                  />
                  <span v-else class="text-white" style="font-size: 11px">
                    {{ message.sender?.first_name?.charAt(0)?.toUpperCase() }}
                  </span>
                </v-avatar>
                <p class="text-caption font-weight-bold">
                  {{ message.sender?.first_name }} {{ message.sender?.last_name }}
                </p>
                <p class="text-caption text-grey">
                  {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </p>
              </div>
              <div class="bg-grey-lighten-4 pa-3 rounded-lg ml-9">
                <p class="text-body-2">{{ message.message_body }}</p>
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <!-- TAB 2 --- Admin Messages -->
        <v-tabs-window-item value="admin">
          <div class="pa-3">

            <!-- Top bar with clarification and message both -->
            <div class="d-flex align-center justify-space-between mb-4">
              <p class="text-body-2 font-weight-bold">Conversations</p>
              <div class="d-flex gap-2">
                <v-btn
                  v-if="claim.status === 'pending_review' || claim.status === 'clarification_requested'"
                  size="small"
                  color="orange"
                  variant="tonal"
                  prepend-icon="mdi-help-circle"
                  @click="showClarificationDialog = true"
                >
                  Request Clarification
                </v-btn>
                <v-btn
                  size="small"
                  :color="messageBoth ? 'secondary' : 'default'"
                  :variant="messageBoth ? 'flat' : 'outlined'"
                  prepend-icon="mdi-account-multiple"
                  @click="messageBoth = !messageBoth"
                >
                  {{ messageBoth ? 'Cancel Both' : 'Message Both' }}
                </v-btn>
              </div>
            </div>

            <!-- Message Both Panel -->
            <v-card v-if="messageBoth" rounded="lg" color="secondary" variant="tonal" class="pa-3 mb-4">
              <div class="d-flex align-center gap-2 mb-2">
                <v-icon color="secondary" size="18">mdi-account-multiple</v-icon>
                <p class="text-body-2 font-weight-bold">
                  Sending to:
                  <span class="text-secondary"> {{ claim.item?.poster?.first_name }} (Finder)</span>
                  &amp;
                  <span class="text-secondary">{{ claim.claimed_by?.first_name }} (Owner)</span>
                </p>
              </div>
              <div class="d-flex gap-2 align-center">
                <v-text-field
                  v-model="bothMessageText"
                  placeholder="Type message for both parties..."
                  density="comfortable"
                  outlined
                  hide-details
                  rounded
                  @keyup.enter="sendToBoth"
                />
                <v-btn color="secondary" icon :loading="bothMessageLoading" @click="sendToBoth">
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </div>
            </v-card>

            <!-- Two separate conversation threads side by side -->
            <v-row>

              <!-- FINDER Thread -->
              <v-col cols="12" md="6">
                <v-card rounded="lg" elevation="1">
                  <!-- Finder Header -->
                  <div class="pa-3 border-b d-flex align-center gap-2">
                    <v-avatar size="32" color="secondary">
                      <v-img
                        v-if="claim.item?.poster?.profile_picture"
                        :src="claim.item.poster.profile_picture.startsWith('http') ? claim.item.poster.profile_picture : `http://127.0.0.1:8000/storage/${claim.item.poster.profile_picture}`"
                        cover
                      />
                      <span v-else class="text-white text-caption font-weight-bold">
                        {{ claim.item?.poster?.first_name?.charAt(0)?.toUpperCase() || 'F' }}
                      </span>
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-bold">
                        {{ claim.item?.poster?.first_name }} {{ claim.item?.poster?.last_name }}
                      </p>
                      <p class="text-caption text-secondary">Finder</p>
                    </div>
                  </div>

                  <!-- Finder Messages -->
                 <div style="height: 220px; overflow-y: auto;" class="pa-2" ref="finderThreadContainer">
                    <div v-if="finderMessages.length === 0" class="text-center pa-6">
                      <v-icon color="grey" size="32">mdi-message-outline</v-icon>
                      <p class="text-caption text-grey mt-1">No messages yet</p>
                    </div>
                    <div
                      v-for="msg in finderMessages"
                      :key="msg.id"
                      class="mb-2 d-flex"
                      :class="msg.sender_id === claim.item?.posted_by ? 'justify-start' : 'justify-end'"
                    >
                      <div style="max-width: 85%">
                        <p class="text-caption text-grey mb-1"
                          :class="msg.sender_id === claim.item?.posted_by ? 'ml-1' : 'text-right mr-1'"
                        >
                          {{ msg.sender_id === claim.item?.posted_by
                            ? (claim.item?.poster?.first_name + ' (Finder)')
                            : 'You (Admin)' }}
                        </p>
                        <div
                          class="pa-2 rounded-lg text-body-2"
                          :class="msg.sender_id === claim.item?.posted_by ? 'bg-grey-lighten-3' : 'bg-secondary text-white'"
                        >
                          {{ msg.message }}
                        </div>
                        <p
                          class="text-caption text-grey mt-1"
                          :class="msg.sender_id === claim.item?.posted_by ? 'ml-1' : 'text-right mr-1'"
                        >
                          {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Finder Input -->
                  <v-divider />
                  <div class="pa-2 d-flex gap-2 align-center">
                    <v-text-field
                      v-model="finderMessageText"
                      placeholder="Message finder..."
                      density="compact"
                      outlined
                      hide-details
                      rounded
                      @keyup.enter="sendToFinder"
                    />
                    <v-btn color="secondary" icon size="small" :loading="finderMessageLoading" @click="sendToFinder">
                      <v-icon size="18">mdi-send</v-icon>
                    </v-btn>
                  </div>
                </v-card>
              </v-col>

              <!-- OWNER Thread -->
              <v-col cols="12" md="6">
                <v-card rounded="lg" elevation="1">
                  <!-- Owner Header -->
                  <div class="pa-3 border-b d-flex align-center gap-2">
                    <v-avatar size="32" color="secondary">
                      <v-img
                        v-if="claim.claimed_by?.profile_picture"
                        :src="claim.claimed_by.profile_picture.startsWith('http') ? claim.claimed_by.profile_picture : `http://127.0.0.1:8000/storage/${claim.claimed_by.profile_picture}`"
                        cover
                      />
                      <span v-else class="text-white text-caption font-weight-bold">
                        {{ claim.claimed_by?.first_name?.charAt(0)?.toUpperCase() || 'O' }}
                      </span>
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-bold">
                        {{ claim.claimed_by?.first_name }} {{ claim.claimed_by?.last_name }}
                      </p>
                      <p class="text-caption text-secondary">Owner / Claimant</p>
                    </div>
                  </div>

                  <!-- Owner Messages -->
                 <div style="height: 220px; overflow-y: auto;" class="pa-2" ref="ownerThreadContainer">
                    <div v-if="ownerMessages.length === 0" class="text-center pa-6">
                      <v-icon color="grey" size="32">mdi-message-outline</v-icon>
                      <p class="text-caption text-grey mt-1">No messages yet</p>
                    </div>
                    <div
                      v-for="msg in ownerMessages"
                      :key="msg.id"
                      class="mb-2 d-flex"
                      :class="msg.sender_id === (claim.claimed_by?.id ?? claim.claimed_by) ? 'justify-start' : 'justify-end'"
                    >
                      <div style="max-width: 85%">
                        <p class="text-caption text-grey mb-1"
                            :class="msg.sender_id === claim.claimed_by?.id ? 'ml-1' : 'text-right mr-1'"
                          >
                            {{ msg.sender_id === claim.claimed_by?.id
                              ? (claim.claimed_by?.first_name + ' (Owner)')
                              : 'You (Admin)' }}
                          </p>
                        <div
                          class="pa-2 rounded-lg text-body-2"
                          :class="msg.sender_id === (claim.claimed_by?.id ?? claim.claimed_by) ? 'bg-grey-lighten-3' : 'bg-secondary text-white'"
                        >
                          {{ msg.message }}
                        </div>
                        <p
                          class="text-caption text-grey mt-1"
                          :class="msg.sender_id === (claim.claimed_by?.id ?? claim.claimed_by) ? 'ml-1' : 'text-right mr-1'"
                        >
                          {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Owner Input -->
                  <v-divider />
                  <div class="pa-2 d-flex gap-2 align-center">
                    <v-text-field
                      v-model="ownerMessageText"
                      placeholder="Message owner..."
                      density="compact"
                      outlined
                      hide-details
                      rounded
                      @keyup.enter="sendToOwner"
                    />
                    <v-btn color="secondary" icon size="small" :loading="ownerMessageLoading" @click="sendToOwner">
                      <v-icon size="18">mdi-send</v-icon>
                    </v-btn>
                  </div>
                </v-card>
              </v-col>

            </v-row>
          </div>
        </v-tabs-window-item>

      </v-tabs-window>
    </v-card>

    <!-- Clarification Dialog -->
    <v-dialog v-model="showClarificationDialog" max-width="500" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">
          Request Clarification
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-grey mb-4">
            Explain what additional information you need from the owner.
          </p>
          <v-textarea
            v-model="clarificationText"
            label="Clarification Request"
            density="comfortable"
            outlined
            rows="4"
          />
        </v-card-text>
        <v-card-actions class="justify-end gap-3">
          <v-btn variant="outlined" @click="showClarificationDialog = false">Cancel</v-btn>
          <v-btn
            color="orange"
            :loading="actionLoading"
            :disabled="!clarificationText"
            @click="submitClarification"
          >
            Send Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>