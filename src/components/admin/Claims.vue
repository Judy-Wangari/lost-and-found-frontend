<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const claims = ref([])
const loading = ref(false)
const selectedStatus = ref('pending_review')

const statusOptions = [
  { title: 'Pending Review', value: 'pending_review' },
  { title: 'Clarification Requested', value: 'clarification_requested' },
  { title: 'Approved', value: 'approved' },
  { title: 'Rejected', value: 'rejected' },
]

const fetchClaims = async () => {
  loading.value = true
  try {
    const response = await api.get('/claims', {
      params: { status: selectedStatus.value }
    })
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

onMounted(() => {
  fetchClaims()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Claims</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">
          Review and manage item claims
        </p>
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
          @update:modelValue="fetchClaims"
        />
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <!-- Claims Table -->
      <v-card rounded="lg" elevation="1" v-if="claims.length > 0">
        <v-table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Claimed By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="claim in claims" :key="claim.id">
              <td>
                <v-img
                  v-if="claim.item?.photo_path"
                  :src="`http://127.0.0.1:8000/storage/${claim.item.photo_path}`"
                  width="50"
                  height="50"
                  cover
                  rounded
                />
                <v-icon v-else color="grey">mdi-image-off</v-icon>
              </td>
              <td class="text-capitalize">
                {{ claim.item?.category?.replace(/_/g, ' ') }}
              </td>
              <td>
                {{ claim.claimed_by?.first_name }} {{ claim.claimed_by?.last_name }}
              </td>
              <td>
                {{ new Date(claim.created_at).toLocaleDateString() }}
              </td>
              <td>
                <v-chip :color="getStatusColor(claim.status)" size="small">
                  {{ claim.status.replace(/_/g, ' ') }}
                </v-chip>
              </td>
              <td>
                <v-btn
                  color="secondary"
                  size="small"
                  variant="tonal"
                  @click="router.push({ name: 'admin-claim-detail', params: { id: claim.id } })"
                >
                  Review
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- Empty State -->
      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-clipboard-check-outline</v-icon>
        <h3 class="text-h6 text-grey mt-4">No claims found</h3>
        <p class="text-body-2 text-grey mt-2">
          No claims with status {{ selectedStatus.replace(/_/g, ' ') }}
        </p>
      </v-card>
    </div>
  </div>
</template>