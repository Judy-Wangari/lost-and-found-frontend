<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

const appeal = ref(null)
const loading = ref(false)
const actionLoading = ref(false)
const successMessage = ref('')
const error = ref('')
const adminNote = ref('')

// Messaging
const messageTab = ref('appellant')
const appellantMessages = ref([])
const appellantMessageText = ref('')
const appellantMessageLoading = ref(false)

const firstUnreadAppellantIndex = computed(() => {
  if(!appeal.value) return -1
  return appellantMessages.value.findIndex(m => !m.is_read && m.sender_id === appeal.value?.raised_by?.id)
})

const appellantThreadContainer = ref(null)

const fetchAppeal = async () => {
  loading.value = true
  try {
    const response = await api.get(`/appeals/${route.params.id}`)
    appeal.value = response.data
    adminNote.value = response.data.admin_note || ''
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchAppellantMessages = async () => {
  if(!appeal.value) return
  try {
    const response = await api.get('/admin-messages', {
      params: { appeal_id: route.params.id }
    })
    appellantMessages.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  }
}

const sendToAppellant = async () => {
  if(!appellantMessageText.value.trim()) return
  appellantMessageLoading.value = true
  try {
    await api.post('/admin-messages', {
      appeal_id: String(route.params.id),
      receiver_id: appeal.value.raised_by?.id,
      message: appellantMessageText.value,
      type: 'appeal'
    })
    appellantMessageText.value = ''
    fetchAppellantMessages()
    successMessage.value = 'Message sent.'
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to send.'
  } finally {
    appellantMessageLoading.value = false
  }
}

const handleAction = async (action) => {
  actionLoading.value = true
  error.value = ''
  try {
    await api.put(`/appeals/${route.params.id}`, {
      action,
      admin_note: adminNote.value
    })
    successMessage.value = `Appeal ${action.replace(/_/g, ' ')}d successfully.`
    fetchAppeal()
  } catch(e) {
    error.value = e.response?.data?.message || 'Action failed.'
  } finally {
    actionLoading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = { pending: 'warning', under_review: 'orange', resolved: 'success', rejected: 'error' }
  return colors[status] || 'grey'
}

const getAvatarUrl = (pic) => {
  if(!pic) return null
  if(pic.startsWith('http')) return pic
  return `http://127.0.0.1:8000/storage/${pic}`
}

watch(appellantMessages, async () => {
  await nextTick()
  if(appellantThreadContainer.value) appellantThreadContainer.value.scrollTop = appellantThreadContainer.value.scrollHeight
})

onMounted(async () => {
  await fetchAppeal()
  fetchAppellantMessages()
})
</script>

<template>
  <div>
    <v-btn variant="text" color="secondary" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/admin/appeals')">
      Back to Appeals
    </v-btn>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else-if="appeal">
      <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">{{ successMessage }}</v-alert>
      <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">{{ error }}</v-alert>

      <!-- Appeal Header and Actions -->
      <v-card rounded="lg" elevation="1" class="pa-4 mb-6">
        <div class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div>
            <p class="text-body-2 font-weight-bold">Appeal #{{ appeal.id }}</p>
            <v-chip :color="getStatusColor(appeal.status)" size="small" class="mt-1">
              {{ appeal.status.replace(/_/g, ' ') }}
            </v-chip>
          </div>
          <div class="d-flex gap-3 flex-wrap">
            <v-btn
              v-if="appeal.status === 'pending'"
              color="orange"
              variant="tonal"
              :loading="actionLoading"
              @click="handleAction('under_review')"
            >
              Mark Under Review
            </v-btn>
            <v-btn
              v-if="appeal.status === 'pending' || appeal.status === 'under_review'"
              color="success"
              :loading="actionLoading"
              @click="handleAction('resolve')"
            >
              Resolve Appeal
            </v-btn>
            <v-btn
              v-if="appeal.status === 'pending' || appeal.status === 'under_review'"
              color="error"
              variant="tonal"
              :loading="actionLoading"
              @click="handleAction('reject')"
            >
              Reject Appeal
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Two Panel Review -->
      <v-row class="mb-6">

        <!-- Panel 1 --- Finder's Private Details of the item -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="1" class="pa-4 h-100">
            <div class="d-flex align-center gap-2 mb-4">
              <v-icon color="secondary">mdi-account-search</v-icon>
              <p class="text-subtitle-2 font-weight-bold">Item Details (Finder's Private Info)</p>
            </div>
            <v-img
              v-if="appeal.item?.photo_path"
              :src="`http://127.0.0.1:8000/storage/${appeal.item.photo_path}`"
              height="160"
              cover
              rounded="lg"
              class="mb-4"
            />
            <div>
              <div class="mb-2"><p class="text-caption text-grey">Category</p><p class="text-body-2 text-capitalize">{{ appeal.item?.category?.replace(/_/g, ' ') }}</p></div>
              <div v-if="appeal.item?.item_private_detail">
                <div class="mb-2"><p class="text-caption text-grey">Brand / Model / Logo</p><p class="text-body-2">{{ appeal.item.item_private_detail.brand_model_or_logo || '---' }}</p></div>
                <div class="mb-2"><p class="text-caption text-grey">Contents or Attachments</p><p class="text-body-2">{{ appeal.item.item_private_detail.what_was_inside_or_attached || '---' }}</p></div>
                <div class="mb-2"><p class="text-caption text-grey">Hidden or Internal Details</p><p class="text-body-2">{{ appeal.item.item_private_detail.hidden_or_internal_details || '---' }}</p></div>
                <div class="mb-2"><p class="text-caption text-grey">Location Found</p><p class="text-body-2">{{ appeal.item.item_private_detail.location_found || '---' }}</p></div>
              </div>
              <p v-else class="text-body-2 text-grey">No private details available.</p>
            </div>
          </v-card>
        </v-col>

        <!-- Panel 2 --- Appellant's Info and Appeal Reason -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
            <div class="d-flex align-center gap-2 mb-4">
              <v-icon color="secondary">mdi-account</v-icon>
              <p class="text-subtitle-2 font-weight-bold">Appellant & Appeal Reason</p>
            </div>

            <div class="d-flex align-center gap-3 mb-4">
              <v-avatar size="44" color="secondary">
                <v-img v-if="appeal.raised_by?.profile_picture" :src="getAvatarUrl(appeal.raised_by.profile_picture)" cover />
                <span v-else class="text-white font-weight-bold">{{ appeal.raised_by?.first_name?.charAt(0)?.toUpperCase() }}</span>
              </v-avatar>
              <div>
                <p class="text-body-2 font-weight-bold">{{ appeal.raised_by?.first_name }} {{ appeal.raised_by?.last_name }}</p>
                <p class="text-caption text-grey">{{ appeal.raised_by?.email }}</p>
              </div>
            </div>

            <div class="mb-3">
              <p class="text-caption text-grey">Appeal Reason</p>
              <v-card color="grey-lighten-4" rounded="lg" class="pa-3 mt-1">
                <p class="text-body-2">{{ appeal.reason }}</p>
              </v-card>
            </div>

            <div class="mb-3">
              <p class="text-caption text-grey">Date Submitted</p>
              <p class="text-body-2">{{ new Date(appeal.created_at).toLocaleString() }}</p>
            </div>

            <div v-if="appeal.claim" class="mb-3">
              <p class="text-caption text-grey">Related Claim</p>
              <v-btn size="small" color="secondary" variant="tonal" class="mt-1" @click="router.push({ name: 'admin-claim-detail', params: { id: appeal.claim_id } })">
                View Original Claim
              </v-btn>
            </div>
          </v-card>

          <!-- Admin Note -->
          <v-card v-if="appeal.status !== 'resolved' && appeal.status !== 'rejected'" rounded="lg" elevation="1" class="pa-4">
            <div class="d-flex align-center gap-2 mb-3">
              <v-icon color="secondary">mdi-note-edit</v-icon>
              <p class="text-subtitle-2 font-weight-bold">Admin Note (optional)</p>
            </div>
            <v-textarea v-model="adminNote" label="Note" placeholder="Add a note that will be sent to the appellant with your decision..." density="comfortable" outlined rows="3" />
          </v-card>

          <v-card v-else-if="appeal.admin_note" rounded="lg" elevation="1" class="pa-4 mt-4">
            <p class="text-caption text-grey mb-1">Admin Note</p>
            <v-card color="secondary" variant="tonal" rounded="lg" class="pa-3">
              <p class="text-body-2">{{ appeal.admin_note }}</p>
            </v-card>
          </v-card>
        </v-col>
      </v-row>

      <!-- Messaging Section -->
      <v-card rounded="lg" elevation="1" class="pa-4">
        <p class="text-subtitle-2 font-weight-bold mb-4">
          <v-icon color="secondary" class="mr-2">mdi-message</v-icon>
          Messages with Appellant
        </p>

        <v-card rounded="lg" elevation="0" border>
          <!-- Appellant Header -->
          <div class="pa-3 border-b d-flex align-center gap-2">
            <v-avatar size="32" color="secondary">
              <v-img v-if="appeal.raised_by?.profile_picture" :src="getAvatarUrl(appeal.raised_by.profile_picture)" cover />
              <span v-else class="text-white text-caption font-weight-bold">{{ appeal.raised_by?.first_name?.charAt(0)?.toUpperCase() || 'A' }}</span>
            </v-avatar>
            <div class="flex-grow-1">
              <p class="text-body-2 font-weight-bold">{{ appeal.raised_by?.first_name }} {{ appeal.raised_by?.last_name }}</p>
              <p class="text-caption text-secondary">Appellant</p>
            </div>
            <!-- Unread badge -->
            <v-badge
              v-if="appellantMessages.filter(m => !m.is_read && m.sender_id === appeal.raised_by?.id).length > 0"
              :content="appellantMessages.filter(m => !m.is_read && m.sender_id === appeal.raised_by?.id).length"
              color="error"
            />
          </div>

          <!-- Messages with new messages divider -->
          <div style="height: 280px; overflow-y: auto;" class="pa-2" ref="appellantThreadContainer">
            <div v-if="appellantMessages.length === 0" class="text-center pa-8">
              <v-icon color="grey" size="40">mdi-message-outline</v-icon>
              <p class="text-caption text-grey mt-2">No messages yet</p>
            </div>

            <template v-for="(msg, index) in appellantMessages" :key="msg.id">
              <!-- New messages divider -->
              <div v-if="firstUnreadAppellantIndex > 0 && index === firstUnreadAppellantIndex" class="d-flex align-center gap-2 my-2">
                <v-divider />
                <span class="text-caption text-secondary font-weight-bold px-1" style="white-space:nowrap;font-size:10px">New</span>
                <v-divider />
              </div>

              <div class="mb-2 d-flex" :class="msg.sender_id === appeal.raised_by?.id ? 'justify-start' : 'justify-end'">
                <div style="max-width: 85%">
                  <p class="text-caption text-grey mb-1" :class="msg.sender_id === appeal.raised_by?.id ? 'ml-1' : 'text-right mr-1'">
                    {{ msg.sender_id === appeal.raised_by?.id ? (appeal.raised_by?.first_name + ' (Appellant)') : 'You (Admin)' }}
                  </p>
                  <div
                    class="pa-2 rounded-lg text-body-2"
                    :class="[
                      msg.sender_id === appeal.raised_by?.id ? 'rounded-ts-0' : 'bg-secondary text-white rounded-te-0',
                      msg.sender_id === appeal.raised_by?.id && !msg.is_read ? 'bg-blue-lighten-5 border-s-4 border-secondary' : msg.sender_id === appeal.raised_by?.id ? 'bg-grey-lighten-3' : ''
                    ]"
                  >
                    {{ msg.message }}
                  </div>
                  <p class="text-caption text-grey mt-1" :class="msg.sender_id === appeal.raised_by?.id ? 'ml-1' : 'text-right mr-1'">
                    {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </p>
                </div>
              </div>
            </template>
          </div>

          <v-divider />
          <div class="pa-2 d-flex gap-2 align-center">
            <v-text-field
              v-model="appellantMessageText"
              placeholder="Message appellant..."
              density="compact"
              outlined
              hide-details
              rounded
              @keyup.enter="sendToAppellant"
            />
            <v-btn color="secondary" icon size="small" :loading="appellantMessageLoading" @click="sendToAppellant">
              <v-icon size="18">mdi-send</v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-card>

    </div>

    <div v-else class="text-center pa-12">
      <v-icon size="64" color="grey">mdi-alert-circle-outline</v-icon>
      <p class="text-body-2 text-grey mt-2">Appeal not found.</p>
    </div>
  </div>
</template>