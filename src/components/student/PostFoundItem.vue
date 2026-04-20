<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close', 'success'])

const step = ref(1)
const loading = ref(false)
const error = ref('')

// Step 1 data
const category = ref('')
const photo = ref(null)
const photoPreview = ref(null)
const savedItemId = ref(null)

// Step 2 data
const brandModelOrLogo = ref('')
const whatWasInsideOrAttached = ref('')
const hiddenOrInternalDetails = ref('')
const extraNotes = ref('')
const locationFound = ref('')

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

// Handle photo preview
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
  if(!photo.value){
    error.value = 'Please upload a photo.'
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('category', category.value)
    formData.append('photo_path', photo.value)

    const response = await api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    savedItemId.value = response.data.item.id
    step.value = 2

  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to save item. Please try again.'
  } finally {
    loading.value = false
  }
}

// Step 2 --- Submit private details
const submitStep2 = async () => {
  error.value = ''

  if(!locationFound.value){
    error.value = 'Please enter where you found the item.'
    return
  }

  loading.value = true
  try {
    await api.post(`/items/${savedItemId.value}/private-details`, {
      brand_model_or_logo: brandModelOrLogo.value,
      what_was_inside_or_attached: whatWasInsideOrAttached.value,
      hidden_or_internal_details: hiddenOrInternalDetails.value,
      extra_notes: extraNotes.value,
      location_found: locationFound.value,
    })

    emit('success')
    emit('close')

  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to save private details. Please try again.'
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

    <!-- Error -->
    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- STEP 1 -->
    <div v-if="step === 1">
      <p class="text-body-2 text-grey mb-4">
        This information will be visible to everyone. Only share the category and photo.
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

      <!-- Photo Upload -->
      <v-file-input
        label="Photo of Item"
        accept="image/*"
        prepend-inner-icon="mdi-camera"
        density="comfortable"
        outlined
        @change="handlePhotoChange($event.target.files[0])"
      />

      <!-- Photo Preview -->
      <div v-if="photoPreview" class="mb-4">
        <v-img :src="photoPreview" height="200" cover rounded="lg" />
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
        This information is private and will only be used to verify the rightful owner. It will never be shown publicly.
      </p>

      <v-text-field
        v-model="brandModelOrLogo"
        label="Brand, Model or Logo"
        hint="Enter the brand name, model number, or describe any logo not clearly visible in the photo"
        persistent-hint
        density="comfortable"
        outlined
        class="mb-4"
      />

      <v-textarea
        v-model="whatWasInsideOrAttached"
        label="Contents or Attachments"
        hint="Describe anything inside the item or attached to it such as keychains, straps, tags or contents"
        persistent-hint
        density="comfortable"
        outlined
        rows="2"
        class="mb-4"
      />

      <v-textarea
        v-model="hiddenOrInternalDetails"
        label="Hidden or Internal Details"
        hint="Describe any name, writing, engraving, damage or markings not visible in the photo"
        persistent-hint
        density="comfortable"
        outlined
        rows="2"
        class="mb-4"
      />

      <v-textarea
        v-model="extraNotes"
        label="Extra Notes"
        hint="Anything else only the real owner would know"
        persistent-hint
        density="comfortable"
        outlined
        rows="2"
        class="mb-4"
      />

      <v-text-field
        v-model="locationFound"
        label="Location Found"
        hint="Where on campus did you find this item"
        persistent-hint
        density="comfortable"
        outlined
        class="mb-4"
        :rules="[v => !!v || 'Location is required']"
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