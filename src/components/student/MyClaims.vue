<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const claims = ref([])
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// Verification code dialog
const showCollectDialog = ref(false)
const selectedClaim = ref(null)
const verificationCode = ref('')
const collectLoading = ref(false)
const collectError = ref('')

// Appeal dialog
const showAppealDialog = ref(false)
const appealClaim = ref(null)
const appealReason = ref('')
const appealLoading = ref(false)
const appealError = ref('')

const fetchMyClaims = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/claims')
    claims.value = response.data
  } catch(e) {
    console.error(e)
    error.value = 'Could not load claims.'
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    pending_review: 'warning',
    clarification_requested: 'orange',
    approved: 'success',
    rejected: 'error',
    appeal_resolved: 'secondary',
  }
  return colors[status] || 'grey'
}

const openCollectDialog = (claim) => {
  selectedClaim.value = claim
  verificationCode.value = ''
  collectError.value = ''
  showCollectDialog.value = true
}

const submitDirectCollection = async () => {
  if(!verificationCode.value){
    collectError.value = 'Please enter the verification code.'
    return
  }
  collectLoading.value = true
  collectError.value = ''
  try {
    await api.post(`/claims/${selectedClaim.value.id}/collect-direct`, {
      verification_code: verificationCode.value
    })
    successMessage.value = 'Item collected successfully. Case closed.'
    showCollectDialog.value = false
    fetchMyClaims()
  } catch(e) {
    collectError.value = e.response?.data?.message || 'Failed to collect item. Check your verification code.'
  } finally {
    collectLoading.value = false
  }
}

const openAppealDialog = (claim) => {
  appealClaim.value = claim
  appealReason.value = ''
  appealError.value = ''
  showAppealDialog.value = true
}

const submitAppeal = async () => {
  if(!appealReason.value.trim()){
    appealError.value = 'Please provide a reason for your appeal.'
    return
  }
  appealLoading.value = true
  appealError.value = ''
  try {
    await api.post('/appeals', {
      claim_id: appealClaim.value.id,
      reason: appealReason.value
    })
    successMessage.value = 'Appeal submitted successfully. Admin will review your appeal.'
    showAppealDialog.value = false
    fetchMyClaims()
  } catch(e) {
    appealError.value = e.response?.data?.message || 'Failed to submit appeal.'
  } finally {
    appealLoading.value = false
  }
}

onMounted(() => {
  fetchMyClaims()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">My Claims</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">Track the status of your item claims</p>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>
    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-row v-if="claims.length > 0">
        <v-col v-for="claim in claims" :key="claim.id" cols="12" md="6">
          <v-card rounded="lg" elevation="2" class="pa-4">

            <!-- Item Photo and Category -->
            <div class="d-flex align-center gap-4 mb-4">
              <v-img
                v-if="claim.item?.photo_path"
                :src="`http://127.0.0.1:8000/storage/${claim.item.photo_path}`"
                width="80"
                height="80"
                cover
                rounded="lg"
              />
              <div v-else class="d-flex align-center justify-center bg-grey-lighten-3 rounded-lg" style="width:80px;height:80px">
                <v-icon color="grey">mdi-image-off</v-icon>
              </div>
              <div>
                <v-chip size="small" color="secondary" class="text-capitalize mb-1">
                  {{ claim.item?.category?.replace(/_/g, ' ') }}
                </v-chip>
                <p class="text-caption text-grey">Claimed on {{ new Date(claim.created_at).toLocaleDateString() }}</p>
              </div>
            </div>

            <!-- Status -->
            <div class="mb-4">
              <v-chip :color="getStatusColor(claim.status)" size="small">
                {{ claim.status.replace(/_/g, ' ') }}
              </v-chip>
            </div>

            <!-- Status messages -->
            <v-alert v-if="claim.status === 'pending_review'" type="info" density="compact" class="mb-3">
              Your claim is under review. You will be notified within 24 hours.
            </v-alert>

            <v-alert v-if="claim.status === 'clarification_requested'" type="warning" density="compact" class="mb-3">
              Admin has requested more information. Check your messages for details.
            </v-alert>

            <v-alert v-if="claim.status === 'approved'" type="success" density="compact" class="mb-3">
              Your claim has been approved. Check your notifications for the verification code.
            </v-alert>

            <v-alert v-if="claim.status === 'rejected'" type="error" density="compact" class="mb-3">
              Your claim was rejected. You may submit a new claim or appeal this decision below.
            </v-alert>

            <v-alert v-if="claim.status === 'appeal_resolved'" type="info" density="compact" class="mb-3">
              Your appeal was resolved. You may now submit a new claim for this item.
            </v-alert>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 flex-wrap">

              <!-- Message finder if approved -->
              <v-btn
                v-if="claim.status === 'approved'"
                color="secondary"
                size="small"
                prepend-icon="mdi-message"
                @click="router.push({ name: 'claim-messages', params: { claimId: claim.id } })"
              >
                Message Finder
              </v-btn>

              <!-- Collect directly if approved -->
              <v-btn
                v-if="claim.status === 'approved'"
                color="success"
                size="small"
                variant="tonal"
                prepend-icon="mdi-check-circle"
                @click="openCollectDialog(claim)"
              >
                Enter Verification Code
              </v-btn>

              <!-- Appeal button --- only for rejected claims -->
              <v-btn
                v-if="claim.status === 'rejected'"
                color="warning"
                size="small"
                prepend-icon="mdi-gavel"
                @click="openAppealDialog(claim)"
              >
                Appeal Decision
              </v-btn>

              <!-- View item -->
              <v-btn
                color="secondary"
                variant="text"
                size="small"
                @click="router.push({ name: 'found-item-detail', params: { id: claim.item_id } })"
              >
                View Item
              </v-btn>

            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-clipboard-check-outline</v-icon>
        <h3 class="text-h6 text-grey mt-4">No claims yet</h3>
        <p class="text-body-2 text-grey mt-2">Browse found items and claim one that belongs to you</p>
        <v-btn color="secondary" class="mt-4" @click="router.push('/student/found-items')">Browse Found Items</v-btn>
      </v-card>
    </div>

    <!-- Collect Dialog -->
    <v-dialog v-model="showCollectDialog" max-width="400" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">Enter Verification Code</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-grey mb-4">
            Present your 6-digit verification code to the finder. They will enter it here to confirm collection.
          </p>
          <v-alert v-if="collectError" type="error" class="mb-4">{{ collectError }}</v-alert>
          <v-text-field v-model="verificationCode" label="6-digit Verification Code" density="comfortable" outlined maxlength="6" />
        </v-card-text>
        <v-card-actions class="justify-end gap-3">
          <v-btn variant="outlined" @click="showCollectDialog = false">Cancel</v-btn>
          <v-btn color="success" :loading="collectLoading" @click="submitDirectCollection">Confirm Collection</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Appeal Dialog -->
    <v-dialog v-model="showAppealDialog" max-width="500" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">
          <v-icon class="mr-2">mdi-gavel</v-icon>
          Appeal Rejected Claim
        </v-card-title>
        <v-card-text>
          <v-alert type="info" density="compact" class="mb-4">
            You are appealing the rejection of your claim for
            <strong>{{ appealClaim?.item?.category?.replace(/_/g, ' ') }}</strong>.
            Provide a clear reason why you believe this rejection was unfair.
          </v-alert>
          <v-alert v-if="appealError" type="error" class="mb-4">{{ appealError }}</v-alert>
          <v-textarea
            v-model="appealReason"
            label="Reason for Appeal"
            placeholder="Explain why you believe this rejection was unfair and provide any additional details that support your ownership of this item..."
            density="comfortable"
            outlined
            rows="5"
          />
        </v-card-text>
        <v-card-actions class="justify-end gap-3">
          <v-btn variant="outlined" @click="showAppealDialog = false">Cancel</v-btn>
          <v-btn
            color="warning"
            :loading="appealLoading"
            :disabled="!appealReason.trim()"
            @click="submitAppeal"
          >
            Submit Appeal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>