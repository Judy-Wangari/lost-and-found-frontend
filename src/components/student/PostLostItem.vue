<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close', 'success'])

const step = ref(1)
const loading = ref(false)
const error = ref('')

// Step 1 data
const category = ref('')
const generalDescription = ref('')
const photo = ref(null)
const photoPreview = ref(null)
const savedLostItemId = ref(null)

// Step 2 data
const brandModelOrLogo = ref('')
const whatWasInsideOrAttached = ref('')
const hiddenOrInternalDetails = ref('')
const extraNotes = ref('')

const categories = [
  { title: 'Eyewear', value: 'eyewear' },
  { title: 'Electronics', value: 'electronics' },
  { title: 'Stationery', value: 'stationery' },
  { title: 'Clothing & Accessories', value: 'clothing_and_accessories' },
  { title: 'Documents & Cards', value: 'documents_and_cards' },
  { title: 'Bags & Luggage', value: 'bags_and_luggage' },
  { title: 'Keys', value: 'keys' },
  { title: 'Other', value: 'other' },
]

const handlePhotoChange = (file) => {
  if(file){
    photo.value = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

// Step 1 --- Submit public form
const submitStep1 = async () => {
  error.value = ''

  if(!category.value){
    error.value = 'Please select a category.'
    return
  }
  if(!generalDescription.value){
    error.value = 'Please enter a description.'
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('category', category.value)
    formData.append('general_description', generalDescription.value)
    if(photo.value){
      formData.append('photo_path', photo.value)
    }

    const response = await api.post('/lost-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    savedLostItemId.value = response.data.lost_item.id
    step.value = 2

  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to save. Please try again.'
  } finally {
    loading.value = false
  }
}

// Step 2 --- Submit private details
const submitStep2 = async () => {
  error.value = ''
  loading.value = true
  try {
    await api.post(`/lost-items/${savedLostItemId.value}/private-details`, {
      brand_model_or_logo: brandModelOrLogo.value,
      what_was_inside_or_attached: whatWasInsideOrAttached.value,
      hidden_or_internal_details: hiddenOrInternalDetails.value,
      extra_notes: extraNotes.value,
    })

    emit('success')
    emit('close')

  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to save private details.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Step Indicator -->
    <div class="d-flex align-center justify-center mb-6">
      <div class="d-flex align-center gap-2">
        <v-chip :color="step >= 1 ? 'secondary' : 'grey'" size="small">1</v-chip>
        <span class="text-caption" :class="step >= 1 ? 'text-secondary' : 'text-grey'">Public Details</span>
        <v-icon size="16" color="grey">mdi-chevron-right</v-icon>
        <v-chip :color="step >= 2 ? 'secondary' : 'grey'" size="small">2</v-chip>
        <span class="text-caption" :class="step >= 2 ? 'text-secondary' : 'text-grey'">Private Details</span>
      </div>
    </div>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- STEP 1 -->
    <div v-if="step === 1">
      <p class="text-body-2 text-grey mb-4">
        This information will be visible to everyone browsing lost items.
      </p>

      <v-select
        v-model="category"
        :items="categories"
        item-title="title"
        item-value="value"
        label="Item Category"
        density="comfortable"
        outlined
        class="mb-4"
      />

      <v-textarea
        v-model="generalDescription"
        label="General Description"
        hint="Describe what the item looks like"
        persistent-hint
        density="comfortable"
        outlined
        rows="3"
        class="mb-4"
      />

      <v-file-input
        label="Photo (Optional)"
        accept="image/*"
        prepend-inner-icon="mdi-camera"
        density="comfortable"
        outlined
        @change="handlePhotoChange($event.target.files[0])"
      />

      <div v-if="photoPreview" class="mb-4">
        <v-img :src="photoPreview" height="150" cover rounded="lg" />
      </div>

      <div class="d-flex justify-end gap-3 mt-4">
        <v-btn variant="outlined" @click="emit('close')">Cancel</v-btn>
        <v-btn color="secondary" :loading="loading" @click="submitStep1">
          Next
        </v-btn>
      </div>
    </div>

    <!-- STEP 2 -->
    <div v-if="step === 2">
      <p class="text-body-2 text-grey mb-4">
        This information is private and will only be used by the admin as additional evidence during claim review.
      </p>

      <v-text-field
        v-model="brandModelOrLogo"
        label="Brand, Model or Logo"
        hint="Enter the brand name, model or any logo"
        persistent-hint
        density="comfortable"
        outlined
        class="mb-4"
      />

      <v-textarea
        v-model="whatWasInsideOrAttached"
        label="Contents or Attachments"
        hint="Describe anything inside or attached to the item"
        persistent-hint
        density="comfortable"
        outlined
        rows="2"
        class="mb-4"
      />

      <v-textarea
        v-model="hiddenOrInternalDetails"
        label="Hidden or Internal Details"
        hint="Any name, writing, engraving or markings"
        persistent-hint
        density="comfortable"
        outlined
        rows="2"
        class="mb-4"
      />

      <v-textarea
        v-model="extraNotes"
        label="Extra Notes"
        hint="Anything else only you would know about this item"
        persistent-hint
        density="comfortable"
        outlined
        rows="2"
        class="mb-4"
      />

      <div class="d-flex justify-end gap-3 mt-4">
        <v-btn variant="outlined" @click="step = 1">Back</v-btn>
        <v-btn color="secondary" :loading="loading" @click="submitStep2">
          Submit
        </v-btn>
      </div>
    </div>
  </div>
</template>