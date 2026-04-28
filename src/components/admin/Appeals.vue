<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const appeals = ref([])
const loading = ref(false)
const selectedStatus = ref('pending')

const statusOptions = [
  { title: 'Pending', value: 'pending' },
  { title: 'Under Review', value: 'under_review' },
  { title: 'Resolved', value: 'resolved' },
]

const fetchAppeals = async () => {
  loading.value = true
  try {
    const response = await api.get('/appeals', {
      params: { status: selectedStatus.value }
    })
    appeals.value = response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = { pending: 'warning', under_review: 'orange', resolved: 'success' }
  return colors[status] || 'grey'
}

onMounted(() => {
  fetchAppeals()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Appeals</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">Review and manage claim appeals</p>
      </div>
    </div>

    <!-- Status Filter -->
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
          @update:modelValue="fetchAppeals"
        />
      </v-col>
    </v-row>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-card rounded="lg" elevation="1" v-if="appeals.length > 0">
        <v-table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Raised By</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appeal in appeals" :key="appeal.id">
              <td>
                <v-img
                  v-if="appeal.item?.photo_path"
                  :src="`http://127.0.0.1:8000/storage/${appeal.item.photo_path}`"
                  width="50"
                  height="50"
                  cover
                  rounded
                />
                <v-icon v-else color="grey">mdi-image-off</v-icon>
              </td>
              <td class="text-capitalize">{{ appeal.item?.category?.replace(/_/g, ' ') }}</td>
              <td>{{ appeal.raised_by?.first_name }} {{ appeal.raised_by?.last_name }}</td>
              <td>
                <p class="text-body-2 text-truncate" style="max-width: 200px">{{ appeal.reason }}</p>
              </td>
              <td>{{ new Date(appeal.created_at).toLocaleDateString() }}</td>
              <td>
                <v-chip :color="getStatusColor(appeal.status)" size="small">
                  {{ appeal.status.replace(/_/g, ' ') }}
                </v-chip>
              </td>
              <td>
                <v-btn
                  color="secondary"
                  size="small"
                  variant="tonal"
                  @click="router.push({ name: 'admin-appeal-detail', params: { id: appeal.id } })"
                >
                  Review
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-gavel</v-icon>
        <h3 class="text-h6 text-grey mt-4">No appeals found</h3>
        <p class="text-body-2 text-grey mt-2">No appeals with status {{ selectedStatus.replace(/_/g, ' ') }}</p>
      </v-card>
    </div>
  </div>
</template>