<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const claims = ref([])
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// Verification code for direct collection
const showCollectDialog = ref(false)
const selectedClaim = ref(null)
const verificationCode = ref('')
const collectLoading = ref(false)
const collectError = ref('')

const fetchMyClaims = async () => {
  loading.value = true
  try {
    const response = await api.get('/claims')
    claims.value = response.data
  } catch(e) {
    console.error(e)
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

onMounted(() => {
  fetchMyClaims()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">My Claims</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Track the status of your item claims
      </p>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <!-- Loading -->
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>

      <!-- Claims List -->
      <v-row v-if="claims.length > 0">
        <v-col
          v-for="claim in claims"
          :key="claim.id"
          cols="12" md="6"
        >
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
              <div
                v-else
                class="d-flex align-center justify-center bg-grey-lighten-3 rounded-lg"
                style="width: 80px; height: 80px"
              >
                <v-icon color="grey">mdi-image-off</v-icon>
              </div>

              <div>
                <v-chip size="small" color="secondary" class="text-capitalize mb-1">
                  {{ claim.item?.category?.replace(/_/g, ' ') }}
                </v-chip>
                <p class="text-caption text-grey">
                  Claimed on {{ new Date(claim.created_at).toLocaleDateString() }}
                </p>
              </div>
            </div>

            <!-- Status -->
            <div class="mb-4">
              <v-chip :color="getStatusColor(claim.status)" size="small">
                {{ claim.status.replace(/_/g, ' ') }}
              </v-chip>
            </div>

            <!-- Status specific messages -->
            <v-alert
              v-if="claim.status === 'pending_review'"
              type="info"
              density="compact"
              class="mb-3"
            >
              Your claim is under review. You will be notified within 24 hours.
            </v-alert>

            <v-alert
              v-if="claim.status === 'clarification_requested'"
              type="warning"
              density="compact"
              class="mb-3"
            >
              Admin has requested more information. Check your messages.
            </v-alert>

            <v-alert
              v-if="claim.status === 'approved'"
              type="success"
              density="compact"
              class="mb-3"
            >
              Your claim has been approved. Check your notifications for the verification code.
            </v-alert>

            <v-alert
              v-if="claim.status === 'rejected'"
              type="error"
              density="compact"
              class="mb-3"
            >
              Your claim was rejected. You can submit a new claim or raise an appeal.
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

      <!-- Empty State -->
      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-clipboard-check-outline</v-icon>
        <h3 class="text-h6 text-grey mt-4">No claims yet</h3>
        <p class="text-body-2 text-grey mt-2">
          Browse found items and claim one that belongs to you
        </p>
        <v-btn
          color="secondary"
          class="mt-4"
          @click="router.push('/student/found-items')"
        >
          Browse Found Items
        </v-btn>
      </v-card>

    </div>

    <!-- Direct Collection Dialog -->
    <v-dialog v-model="showCollectDialog" max-width="400" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">
          Enter Verification Code
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-grey mb-4">
            Present your 6-digit verification code to the finder. They will enter it here to confirm collection.
          </p>
          <v-alert v-if="collectError" type="error" class="mb-4">{{ collectError }}</v-alert>
          <v-text-field
            v-model="verificationCode"
            label="6-digit Verification Code"
            density="comfortable"
            outlined
            maxlength="6"
          />
        </v-card-text>
        <v-card-actions class="justify-end gap-3">
          <v-btn variant="outlined" @click="showCollectDialog = false">Cancel</v-btn>
          <v-btn
            color="success"
            :loading="collectLoading"
            @click="submitDirectCollection"
          >
            Confirm Collection
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>