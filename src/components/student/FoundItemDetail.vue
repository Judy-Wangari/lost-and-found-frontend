<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()

const item = ref(null)
const loading = ref(false)
const showClaimForm = ref(false)
const claimSuccess = ref(false)
const claimError = ref('')
const appealSuccess = ref(false)

// Claim form fields
const brandModelOrLogo = ref('')
const whatWasInsideOrAttached = ref('')
const hiddenOrInternalDetails = ref('')
const extraNotes = ref('')
const claimLoading = ref(false)

// Appeal
const showAppealForm = ref(false)
const appealReason = ref('')
const appealLoading = ref(false)

const fetchItem = async () => {
  loading.value = true
  try {
    const response = await api.get(`/items/${route.params.id}`)
    item.value = response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Count filled claim fields
const filledFieldsCount = () => {
  return [
    brandModelOrLogo.value,
    whatWasInsideOrAttached.value,
    hiddenOrInternalDetails.value,
    extraNotes.value
  ].filter(v => v && v.trim() !== '').length
}

const submitClaim = async () => {
  claimError.value = ''

  if(filledFieldsCount() < 2){
    claimError.value = 'Please fill in at least 2 fields.'
    return
  }

  claimLoading.value = true
  try {
    await api.post('/claims', {
      item_id: item.value.id,
      brand_model_or_logo: brandModelOrLogo.value,
      what_was_inside_or_attached: whatWasInsideOrAttached.value,
      hidden_or_internal_details: hiddenOrInternalDetails.value,
      extra_notes: extraNotes.value,
    })

    claimSuccess.value = true
    showClaimForm.value = false
    fetchItem()

  } catch(e) {
    claimError.value = e.response?.data?.error || e.response?.data?.message || 'Failed to submit claim.'
  } finally {
    claimLoading.value = false
  }
}

const submitAppeal = async () => {
  if(!appealReason.value){
    return
  }

  // Get the rejected claim id
  appealLoading.value = true
  try {
    const claimsResponse = await api.get('/claims?status=rejected')
    const rejectedClaim = claimsResponse.data.find(c => c.item_id === item.value.id)

    if(!rejectedClaim){
      claimError.value = 'No rejected claim found for this item.'
      return
    }

    await api.post('/appeals', {
      claim_id: rejectedClaim.id,
      reason: appealReason.value,
    })

    appealSuccess.value = true
    showAppealForm.value = false

  } catch(e) {
    claimError.value = e.response?.data?.message || 'Failed to submit appeal.'
  } finally {
    appealLoading.value = false
  }
}

onMounted(() => {
  fetchItem()
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
      @click="router.push('/student/found-items')"
    >
      Back to Found Items
    </v-btn>

    <!-- Loading -->
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <!-- Item Detail -->
    <div v-else-if="item">

      <!-- Success Messages -->
      <v-alert v-if="claimSuccess" type="success" class="mb-4">
        Your claim has been submitted successfully. You will be notified within 24 hours.
      </v-alert>

      <v-alert v-if="appealSuccess" type="success" class="mb-4">
        Your appeal has been submitted successfully. Admin will review it.
      </v-alert>

      <v-row>
        <!-- Item Photo -->
        <v-col cols="12" md="5">
          <v-card rounded="lg" elevation="2">
            <v-img
              :src="`http://127.0.0.1:8000/storage/${item.photo_path}`"
              height="350"
              cover
            >
              <template #error>
                <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                  <v-icon size="64" color="grey">mdi-image-off</v-icon>
                </div>
              </template>
            </v-img>
          </v-card>
        </v-col>

        <!-- Item Info -->
        <v-col cols="12" md="7">
          <v-card rounded="lg" elevation="2" class="pa-6">

            <!-- Category -->
            <v-chip color="secondary" class="text-capitalize mb-4">
              {{ item.category?.replace(/_/g, ' ') }}
            </v-chip>

            <!-- Status -->
            <div class="mb-4">
              <v-chip 
                :color="item.status === 'listed' ? 'success' : item.status === 'under_review' ? 'warning' : 'grey'"
                size="small"
              >
                {{ item.status?.replace(/_/g, ' ') }}
              </v-chip>
            </div>

            <!-- Date Posted -->
            <p class="text-body-2 text-grey mb-6">
              Posted on {{ new Date(item.created_at).toLocaleDateString() }}
            </p>

            <!-- Status Messages -->
            <v-alert 
              v-if="item.status === 'under_review'" 
              type="warning" 
              class="mb-4"
              density="compact"
            >
              This item is currently under review for another claim.
            </v-alert>

            <v-alert 
              v-if="item.status === 'awaiting_collection'" 
              type="info" 
              class="mb-4"
              density="compact"
            >
              This item has already been claimed.
            </v-alert>

            <v-alert 
              v-if="item.status === 'collected'" 
              type="success" 
              class="mb-4"
              density="compact"
            >
              This item has been collected by its owner.
            </v-alert>

            <!-- Action Buttons --- only show if item is listed -->
            <div v-if="item.status === 'listed'" class="d-flex gap-3">
              <v-btn 
                color="secondary" 
                size="large"
                @click="showClaimForm = true"
              >
                Claim This Item
              </v-btn>
              <v-btn 
                variant="outlined" 
                size="large"
                @click="router.push('/student/found-items')"
              >
                Cancel
              </v-btn>
            </div>

            <!-- Appeal Button --- shows after failed claim -->
            <div v-if="claimError" class="mt-4">
              <v-alert type="error" class="mb-3">{{ claimError }}</v-alert>
              <v-btn 
                color="orange" 
                variant="tonal"
                @click="showAppealForm = true"
              >
                Raise an Appeal
              </v-btn>
            </div>

          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Claim Form Dialog -->
    <v-dialog v-model="showClaimForm" max-width="600" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">
          Claim This Item
        </v-card-title>

        <v-card-text>
          <v-alert type="info" density="compact" class="mb-4">
            Fill in at least 2 fields. Only fill in what you remember --- you do not need to complete every field.
          </v-alert>

          <v-alert v-if="claimError" type="error" class="mb-4">{{ claimError }}</v-alert>

          <v-text-field
            v-model="brandModelOrLogo"
            label="Brand, Model or Logo"
            hint="Enter the brand name, model or describe any logo"
            persistent-hint
            density="comfortable"
            outlined
            class="mb-3"
          />

          <v-textarea
            v-model="whatWasInsideOrAttached"
            label="Contents or Attachments"
            hint="Describe anything inside or attached to the item"
            persistent-hint
            density="comfortable"
            outlined
            rows="2"
            class="mb-3"
          />

          <v-textarea
            v-model="hiddenOrInternalDetails"
            label="Hidden or Internal Details"
            hint="Describe any name, writing, engraving or markings not visible in the photo"
            persistent-hint
            density="comfortable"
            outlined
            rows="2"
            class="mb-3"
          />

          <v-textarea
            v-model="extraNotes"
            label="Extra Notes"
            hint="Anything else only the real owner would know"
            persistent-hint
            density="comfortable"
            outlined
            rows="2"
            class="mb-3"
          />

          <!-- Fields counter -->
          <p class="text-caption text-grey mt-2">
            {{ filledFieldsCount() }} of 4 fields filled 
            <span :class="filledFieldsCount() >= 2 ? 'text-success' : 'text-error'">
              (minimum 2 required)
            </span>
          </p>
        </v-card-text>

        <v-card-actions class="justify-end gap-3">
          <v-btn variant="outlined" @click="showClaimForm = false">Cancel</v-btn>
          <v-btn 
            color="secondary" 
            :loading="claimLoading"
            :disabled="filledFieldsCount() < 2"
            @click="submitClaim"
          >
            Submit Claim
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Appeal Form Dialog -->
    <v-dialog v-model="showAppealForm" max-width="500" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">
          Raise an Appeal
        </v-card-title>
        <v-card-text>
          <v-alert type="warning" density="compact" class="mb-4">
            Only raise an appeal if you genuinely believe the rejection was unfair.
          </v-alert>
          <v-textarea
            v-model="appealReason"
            label="Reason for Appeal"
            hint="Explain why you believe this item belongs to you"
            persistent-hint
            density="comfortable"
            outlined
            rows="4"
          />
        </v-card-text>
        <v-card-actions class="justify-end gap-3">
          <v-btn variant="outlined" @click="showAppealForm = false">Cancel</v-btn>
          <v-btn 
            color="orange" 
            :loading="appealLoading"
            :disabled="!appealReason"
            @click="submitAppeal"
          >
            Submit Appeal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>