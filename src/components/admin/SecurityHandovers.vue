<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const handovers = ref([])
const loading = ref(false)
const successMessage = ref('')
const error = ref('')

const fetchHandovers = async () => {
  loading.value = true
  try {
    const response = await api.get('/security-handovers')
    handovers.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const updateHandoverStatus = async (handoverId, status) => {
  try {
    await api.put(`/security-handovers/${handoverId}`, { status })
    successMessage.value = `Handover ${status}.`
    fetchHandovers()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to update handover.'
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
        <h2 class="text-h5 font-weight-bold text-secondary">Security Handovers</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">Items transferred to the security office</p>
      </div>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">{{ successMessage }}</v-alert>
    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">{{ error }}</v-alert>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-card rounded="lg" elevation="1" v-if="handovers.length > 0">
        <v-table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Finder</th>
              <th>Handed Over</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="handover in handovers" :key="handover.id">
              <td class="py-2">
                <v-img
                  v-if="handover.item?.photo_path"
                  :src="`http://127.0.0.1:8000/storage/${handover.item.photo_path}`"
                  width="50"
                  height="50"
                  cover
                  rounded="lg"
                />
                <v-icon v-else color="grey">mdi-image-off</v-icon>
              </td>
              <td class="text-body-2 text-capitalize">{{ handover.item?.category?.replace(/_/g, ' ') }}</td>
              <td>
                <p class="text-body-2">{{ handover.finder?.first_name }} {{ handover.finder?.last_name }}</p>
                <p class="text-caption text-grey">{{ handover.finder?.email }}</p>
              </td>
              <td class="text-body-2 text-grey">{{ new Date(handover.created_at).toLocaleDateString() }}</td>
              <td>
                <v-chip :color="getStatusColor(handover.status)" size="x-small">{{ handover.status }}</v-chip>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <v-btn
                    v-if="handover.status === 'pending'"
                    color="success"
                    size="small"
                    variant="tonal"
                    @click="updateHandoverStatus(handover.id, 'confirmed')"
                  >
                    Confirm
                  </v-btn>
                  <v-btn
                    v-if="handover.status === 'pending'"
                    color="error"
                    size="small"
                    variant="text"
                    @click="updateHandoverStatus(handover.id, 'rejected')"
                  >
                    Reject
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-package-up</v-icon>
        <h3 class="text-h6 text-grey mt-4">No handovers yet</h3>
        <p class="text-body-2 text-grey mt-2">No items have been handed to the security office.</p>
      </v-card>
    </div>
  </div>
</template>