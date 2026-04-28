<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const { user } = useAuth()
const handovers = ref([])
const loading = ref(false)
const stats = ref({ pending: 0, confirmed: 0, total: 0 })

const fetchHandovers = async () => {
  loading.value = true
  try {
    const response = await api.get('/security-handovers')
    handovers.value = (response.data.data || response.data).slice(0, 5)
    const all = response.data.data || response.data
    stats.value.total = all.length
    stats.value.pending = all.filter(h => h.status === 'pending').length
    stats.value.confirmed = all.filter(h => h.status === 'confirmed').length
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
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
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">Welcome, {{ user?.first_name }}</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">Security Office Overview</p>
    </div>

    <!-- Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="1" class="pa-4 text-center">
          <v-icon size="40" color="warning" class="mb-2">mdi-clock-outline</v-icon>
          <p class="text-h4 font-weight-bold text-warning">{{ stats.pending }}</p>
          <p class="text-body-2 text-grey">Pending Handovers</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="1" class="pa-4 text-center">
          <v-icon size="40" color="success" class="mb-2">mdi-check-circle</v-icon>
          <p class="text-h4 font-weight-bold text-success">{{ stats.confirmed }}</p>
          <p class="text-body-2 text-grey">Confirmed Handovers</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="lg" elevation="1" class="pa-4 text-center">
          <v-icon size="40" color="secondary" class="mb-2">mdi-package-up</v-icon>
          <p class="text-h4 font-weight-bold text-secondary">{{ stats.total }}</p>
          <p class="text-body-2 text-grey">Total Handovers</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Handovers -->
    <v-card rounded="lg" elevation="1" class="pa-4">
      <p class="text-subtitle-2 font-weight-bold mb-4">Recent Handovers</p>
      <div v-if="loading" class="text-center pa-6">
        <v-progress-circular indeterminate color="secondary" />
      </div>
      <div v-else>
        <div v-for="handover in handovers" :key="handover.id" class="d-flex align-center gap-4 mb-3 pa-3 bg-grey-lighten-4 rounded-lg">
          <v-img
            v-if="handover.item?.photo_path"
            :src="`http://127.0.0.1:8000/storage/${handover.item.photo_path}`"
            width="48"
            height="48"
            cover
            rounded="lg"
          />
          <div v-else class="d-flex align-center justify-center bg-grey-lighten-3 rounded-lg" style="width:48px;height:48px">
            <v-icon color="grey" size="20">mdi-package-variant</v-icon>
          </div>
          <div class="flex-grow-1">
            <p class="text-body-2 font-weight-bold text-capitalize">{{ handover.item?.category?.replace(/_/g, ' ') }}</p>
            <p class="text-caption text-grey">{{ new Date(handover.created_at).toLocaleDateString() }}</p>
          </div>
          <v-chip :color="getStatusColor(handover.status)" size="x-small">{{ handover.status }}</v-chip>
        </div>
        <div v-if="handovers.length === 0" class="text-center pa-8">
          <v-icon size="48" color="grey">mdi-package-up</v-icon>
          <p class="text-body-2 text-grey mt-2">No handovers yet.</p>
        </div>
      </div>
    </v-card>
  </div>
</template>