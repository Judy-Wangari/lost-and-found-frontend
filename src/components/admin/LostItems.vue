<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const lostItems = ref([])
const loading = ref(false)
const selectedCategory = ref('')

const categoryOptions = [
  { title: 'All Categories', value: '' },
  { title: 'Electronics', value: 'electronics' },
  { title: 'Wallet', value: 'wallet' },
  { title: 'Keys', value: 'keys' },
  { title: 'Bag', value: 'bag' },
  { title: 'ID / Cards', value: 'id_cards' },
  { title: 'Clothing', value: 'clothing' },
  { title: 'Other', value: 'other' },
]

const fetchLostItems = async () => {
  loading.value = true
  try {
    const params = {}
    if(selectedCategory.value) params.category = selectedCategory.value
    const response = await api.get('/lost-items', { params })
    lostItems.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLostItems()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Lost Items</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">All lost item reports posted by students</p>
      </div>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedCategory"
          :items="categoryOptions"
          item-title="title"
          item-value="value"
          label="Filter by Category"
          density="comfortable"
          outlined
          @update:modelValue="fetchLostItems"
        />
      </v-col>
    </v-row>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-card rounded="lg" elevation="1" v-if="lostItems.length > 0">
        <v-table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Reported By</th>
              <th>Date Lost</th>
              <th>Date Reported</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in lostItems" :key="item.id">
              <td>
                <v-chip size="x-small" color="secondary" class="text-capitalize">
                  {{ item.category?.replace(/_/g, ' ') }}
                </v-chip>
              </td>
              <td>
                <p class="text-body-2 text-truncate" style="max-width: 250px">
                  {{ item.description || '---' }}
                </p>
              </td>
              <td>
                <p class="text-body-2">{{ item.posted_by_user?.first_name }} {{ item.posted_by_user?.last_name }}</p>
                <p class="text-caption text-grey">{{ item.posted_by_user?.email }}</p>
              </td>
              <td class="text-body-2 text-grey">
                {{ item.date_lost ? new Date(item.date_lost).toLocaleDateString() : '---' }}
              </td>
              <td class="text-body-2 text-grey">
                {{ new Date(item.created_at).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-magnify</v-icon>
        <h3 class="text-h6 text-grey mt-4">No lost item reports</h3>
      </v-card>
    </div>
  </div>
</template>