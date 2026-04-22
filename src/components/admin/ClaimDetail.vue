<script setup>
import { ref, onMounted } from 'vue'
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