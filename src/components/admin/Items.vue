<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const items = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const successMessage = ref('')
const error = ref('')

const statusOptions = [
  { title: 'All', value: '' },
  { title: 'Listed', value: 'listed' },
  { title: 'Under Review', value: 'under_review' },
  { title: 'Awaiting Collection', value: 'awaiting_collection' },
  { title: 'Collected', value: 'collected' },
  { title: 'Clarification Requested', value: 'clarification_requested' },
]

const fetchItems = async () => {
  loading.value = true
  try {
    const params = {}
    if(selectedStatus.value) params.status = selectedStatus.value
    const response = await api.get('/items', { params })
    items.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const deleteItem = async (itemId) => {
  if(!confirm('Are you sure you want to delete this item?')) return
  try {
    await api.delete(`/items/${itemId}`)
    successMessage.value = 'Item deleted.'
    fetchItems()
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to delete item.'
  }
}

const getStatusColor = (status) => {
  const colors = {
    listed: 'success',
    under_review: 'warning',
    awaiting_collection: 'secondary',
    collected: 'grey',
    clarification_requested: 'orange',
  }
  return colors[status] || 'grey'
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Found Items</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">All found items posted on the platform</p>
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
          @update:modelValue="fetchItems"
        />
      </v-col>
    </v-row>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-card rounded="lg" elevation="1" v-if="items.length > 0">
        <v-table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Category</th>
              <th>Posted By</th>
              <th>Date Posted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td class="py-2">
                <v-img
                  v-if="item.photo_path"
                  :src="`http://127.0.0.1:8000/storage/${item.photo_path}`"
                  width="56"
                  height="56"
                  cover
                  rounded="lg"
                />
                <v-icon v-else color="grey" size="32">mdi-image-off</v-icon>
              </td>
              <td class="text-body-2 text-capitalize">{{ item.category?.replace(/_/g, ' ') }}</td>
              <td>
                <p class="text-body-2">{{ item.poster?.first_name }} {{ item.poster?.last_name }}</p>
                <p class="text-caption text-grey">{{ item.poster?.email }}</p>
              </td>
              <td class="text-body-2 text-grey">{{ new Date(item.created_at).toLocaleDateString() }}</td>
              <td>
                <v-chip :color="getStatusColor(item.status)" size="x-small">
                  {{ item.status?.replace(/_/g, ' ') }}
                </v-chip>
              </td>
              <td>
                <v-btn
                  color="error"
                  size="small"
                  variant="text"
                  icon
                  @click="deleteItem(item.id)"
                >
                  <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-package-variant-outline</v-icon>
        <h3 class="text-h6 text-grey mt-4">No items found</h3>
      </v-card>
    </div>
  </div>
</template>