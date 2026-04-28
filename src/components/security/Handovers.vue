<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const handovers = ref([])
const loading = ref(false)
const successMessage = ref('')
const error = ref('')
const selectedStatus = ref('')

const statusOptions = [
  { title: 'All', value: '' },
  { title: 'Pending', value: 'pending' },
  { title: 'Confirmed', value: 'confirmed' },
  { title: 'Rejected', value: 'rejected' },
]

const fetchHandovers = async () => {
  loading.value = true
  try {
    const params = {}
    if(selectedStatus.value) params.status = selectedStatus.value
    const response = await api.get('/security-handovers', { params })
    handovers.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (handoverId, status) => {
  try {
    await api.put(`/security-handovers/${handoverId}`, { status })
    successMessage.value = `Handover marked as ${status}.`
    fetchHandovers()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to update.'
  }
}

const getStatusColor = (status) => {
  const colors = { pending: 'warning', confirmed: 'success', rejected: 'error' }
  return colors[status] || 'grey'
}

onMounted(() => {
  fetchHandovers()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Handovers</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">Items handed to the security office by finders</p>
      </div>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">{{ successMessage }}</v-alert>
    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">{{ error }}</v-alert>

    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          label="Filter by Status"
          density="comfortable"
          outlined
          @update:modelValue="fetchHandovers"
        />
      </v-col>
    </v-row>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-row v-if="handovers.length > 0">
        <v-col v-for="handover in handovers" :key="handover.id" cols="12" md="6">
          <v-card rounded="lg" elevation="2" class="pa-4">
            <div class="d-flex align-center gap-4 mb-4">
              <v-img
                v-if="handover.item?.photo_path"
                :src="`http://127.0.0.1:8000/storage/${handover.item.photo_path}`"
                width="72"
                height="72"
                cover
                rounded="lg"
              />
              <div v-else class="d-flex align-center justify-center bg-grey-lighten-3 rounded-lg" style="width:72px;height:72px">
                <v-icon color="grey" size="28">mdi-package-variant</v-icon>
              </div>
              <div>
                <p class="text-body-2 font-weight-bold text-capitalize">{{ handover.item?.category?.replace(/_/g, ' ') }}</p>
                <p class="text-caption text-grey">Finder: {{ handover.finder?.first_name }} {{ handover.finder?.last_name }}</p>
                <p class="text-caption text-grey">{{ new Date(handover.created_at).toLocaleDateString() }}</p>
              </div>
            </div>

            <div class="mb-3">
              <v-chip :color="getStatusColor(handover.status)" size="small">{{ handover.status }}</v-chip>
            </div>

            <div v-if="handover.notes" class="mb-3">
              <p class="text-caption text-grey">Notes</p>
              <p class="text-body-2">{{ handover.notes }}</p>
            </div>

            <div v-if="handover.status === 'pending'" class="d-flex gap-2">
              <v-btn color="success" size="small" @click="updateStatus(handover.id, 'confirmed')">
                Confirm Receipt
              </v-btn>
              <v-btn color="error" size="small" variant="tonal" @click="updateStatus(handover.id, 'rejected')">
                Reject
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-package-up</v-icon>
        <h3 class="text-h6 text-grey mt-4">No handovers found</h3>
        <p class="text-body-2 text-grey mt-2">No items have been handed to the security office yet.</p>
      </v-card>
    </div>
  </div>
</template>