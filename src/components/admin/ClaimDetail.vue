<script setup>
import { ref, onMounted, computed } from 'vue'
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
const adminMessageText = ref('')
const adminMessageReceiver = ref(null)
const adminMessageLoading = ref(false)

// const messageRecipients = computed(() => {
//   if(!claim.value) return []
  
//   const finder = claim.value.item?.poster || claim.value.item?.postedBy
//   const owner = claim.value.claimedBy

//   return [
//     {
//       id: claim.value.item?.posted_by,
//       name: `Finder — ${finder?.first_name || ''} ${finder?.last_name || ''} (${finder?.email || ''})`
//     },
//     {
//       id: claim.value.claimed_by,
//       name: `Owner — ${owner?.first_name || ''} ${owner?.last_name || ''} (${owner?.email || ''})`
//     }
//   ]
// })

const fetchChatMessages = async () => {
  try {
    const response = await api.get(`/messages/${route.params.id}`)
    chatMessages.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  }
}

const sendAdminMessage = async () => {
  adminMessageLoading.value = true
  try {
    await api.post('/admin-messages', {
      claim_id: route.params.id,
      receiver_id: adminMessageReceiver.value,
      message: adminMessageText.value,
      type: 'claim'
    })
    adminMessageText.value = ''
    adminMessageReceiver.value = null
    successMessage.value = 'Message sent successfully.'
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to send message.'
  } finally {
    adminMessageLoading.value = false
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
  if(!clarificationText.value){
    return
  }
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

onMounted(() => {
  fetchClaim()
  fetchChatMessages()
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

          <!-- Action Buttons -->
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
              v-if="claim.status === 'pending_review'"
              color="orange"
              variant="tonal"
              :loading="actionLoading"
              @click="handleAction('clarification_requested')"
            >
              Request Clarification
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
      <v-alert
        v-if="claim.clarification_request_text"
        type="warning"
        class="mb-6"
      >
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

            <!-- Item Photo -->
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

        <!-- Panel 2 --- Owner's Lost Post Details (only if they posted a lost item) -->
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

 <!-- Messages Section in ClaimDetail -->
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
      Send Admin Message
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

    <!-- TAB 2 --- Send Admin Message -->
    <v-tabs-window-item value="admin">
      <div class="pa-3">

        <!-- Recipients Cards -->
        <p class="text-body-2 font-weight-bold mb-3">Select recipient</p>
        <v-row class="mb-4">

          <!-- Finder Card -->
          <v-col cols="12" sm="6">
            <v-card
              rounded="lg"
              :variant="adminMessageReceiver === claim.item?.posted_by ? 'tonal' : 'outlined'"
              :color="adminMessageReceiver === claim.item?.posted_by ? 'secondary' : ''"
              class="pa-3 cursor-pointer"
              @click="adminMessageReceiver = claim.item?.posted_by"
            >
              <div class="d-flex align-center gap-3">
                <v-avatar size="40" color="secondary">
                  <v-img
                    v-if="claim.item?.poster?.profile_picture"
                    :src="claim.item.poster.profile_picture.startsWith('http') ? claim.item.poster.profile_picture : `http://127.0.0.1:8000/storage/${claim.item.poster.profile_picture}`"
                    cover
                  />
                  <span v-else class="text-white font-weight-bold">
                    {{ claim.item?.poster?.first_name?.charAt(0)?.toUpperCase() || 'F' }}
                  </span>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey">Finder</p>
                  <p class="text-body-2 font-weight-bold">
                    {{ claim.item?.poster?.first_name }} {{ claim.item?.poster?.last_name }}
                  </p>
                  <p class="text-caption text-grey">{{ claim.item?.poster?.email }}</p>
                </div>
                <v-icon v-if="adminMessageReceiver === claim.item?.posted_by" color="secondary" class="ml-auto">
                  mdi-check-circle
                </v-icon>
              </div>
            </v-card>
          </v-col>

          <!-- Owner Card -->
          <v-col cols="12" sm="6">
            <v-card
              rounded="lg"
              :variant="adminMessageReceiver === claim.claimed_by ? 'tonal' : 'outlined'"
              :color="adminMessageReceiver === claim.claimed_by ? 'secondary' : ''"
              class="pa-3 cursor-pointer"
              @click="adminMessageReceiver = claim.claimed_by?.id"
            >
              <div class="d-flex align-center gap-3">
                <v-avatar size="40" color="secondary">
                  <v-img
                    v-if="claim.claimed_by?.profile_picture"
                    :src="claim.claimed_by.profile_picture.startsWith('http') ? claim.claimed_by.profile_picture : `http://127.0.0.1:8000/storage/${claim.claimed_by.profile_picture}`"
                    cover
                  />
                  <span v-else class="text-white font-weight-bold">
                    {{ claim.claimed_by?.first_name?.charAt(0)?.toUpperCase() || 'O' }}
                  </span>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey">Owner / Claimant</p>
                  <p class="text-body-2 font-weight-bold">
                    {{ claim.claimed_by?.first_name }} {{ claim.claimed_by?.last_name }}
                  </p>
                  <p class="text-caption text-grey">{{ claim.claimed_by?.email }}</p>
                </div>
                <v-icon v-if="adminMessageReceiver === claim.claimed_by?.id" color="secondary" class="ml-auto">
                  mdi-check-circle
                </v-icon>
              </div>
            </v-card>
          </v-col>

        </v-row>

        <!-- Message Input -->
        <v-textarea
          v-model="adminMessageText"
          label="Message"
          placeholder="Type your message to the selected recipient..."
          density="comfortable"
          outlined
          rows="3"
          class="mb-3"
        />

        <div class="d-flex align-center justify-space-between">
          <p v-if="adminMessageReceiver" class="text-caption text-secondary">
            <v-icon size="14">mdi-send</v-icon>
            Sending to {{ adminMessageReceiver === claim.item?.posted_by ? `${claim.item?.poster?.first_name} (Finder)` : `${claim.claimedBy?.first_name} (Owner)` }}
          </p>
          <p v-else class="text-caption text-grey">Select a recipient above</p>

          <v-btn
            color="secondary"
            :loading="adminMessageLoading"
            :disabled="!adminMessageText || !adminMessageReceiver"
            prepend-icon="mdi-send"
            @click="sendAdminMessage"
          >
            Send Message
          </v-btn>
        </div>

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