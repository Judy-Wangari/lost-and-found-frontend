<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const appeals = ref([])
const loading = ref(false)

const fetchMyAppeals = async () => {
  loading.value = true
  try {
    const response = await api.get('/appeals')
    appeals.value = response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = { pending: 'warning', under_review: 'orange', resolved: 'success', rejected: 'error' }
  return colors[status] || 'grey'
}

const getStatusMessage = (status) => {
  const messages = {
    pending: 'Your appeal has been submitted and is waiting for review.',
    under_review: 'Admin is currently reviewing your appeal.',
    resolved: 'Your appeal has been resolved. You may re-claim the item.',
    rejected: 'Your appeal was rejected by the admin.',
  }
  return messages[status] || ''
}

const getStatusType = (status) => {
  const types = { pending: 'info', under_review: 'warning', resolved: 'success', rejected: 'error' }
  return types[status] || 'info'
}

onMounted(() => {
  fetchMyAppeals()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">My Appeals</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">Track the status of your submitted appeals</p>
    </div>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-row v-if="appeals.length > 0">
        <v-col v-for="appeal in appeals" :key="appeal.id" cols="12" md="6">
          <v-card rounded="lg" elevation="2" class="pa-4">

            <!-- Item Info -->
            <div class="d-flex align-center gap-4 mb-4">
              <v-img
                v-if="appeal.item?.photo_path"
                :src="`http://127.0.0.1:8000/storage/${appeal.item.photo_path}`"
                width="80"
                height="80"
                cover
                rounded="lg"
              />
              <div v-else class="d-flex align-center justify-center bg-grey-lighten-3 rounded-lg" style="width:80px;height:80px">
                <v-icon color="grey">mdi-image-off</v-icon>
              </div>
              <div>
                <v-chip size="small" color="secondary" class="text-capitalize mb-1">
                  {{ appeal.item?.category?.replace(/_/g, ' ') }}
                </v-chip>
                <p class="text-caption text-grey">Submitted {{ new Date(appeal.created_at).toLocaleDateString() }}</p>
              </div>
            </div>

            <!-- Status -->
            <div class="mb-3">
              <v-chip :color="getStatusColor(appeal.status)" size="small">
                {{ appeal.status.replace(/_/g, ' ') }}
              </v-chip>
            </div>

            <!-- Status message -->
            <v-alert :type="getStatusType(appeal.status)" density="compact" class="mb-3">
              {{ getStatusMessage(appeal.status) }}
            </v-alert>

            <!-- Appeal reason -->
            <div class="mb-3">
              <p class="text-caption text-grey mb-1">Your Reason</p>
              <v-card color="grey-lighten-4" rounded="lg" class="pa-3">
                <p class="text-body-2">{{ appeal.reason }}</p>
              </v-card>
            </div>

            <!-- Admin note if exists -->
            <div v-if="appeal.admin_note" class="mb-3">
              <p class="text-caption text-grey mb-1">Admin Note</p>
              <v-card color="secondary" variant="tonal" rounded="lg" class="pa-3">
                <p class="text-body-2">{{ appeal.admin_note }}</p>
              </v-card>
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2 flex-wrap">
              <v-btn
                color="secondary"
                variant="text"
                size="small"
                @click="router.push({ name: 'found-item-detail', params: { id: appeal.item_id } })"
              >
                View Item
              </v-btn>
            </div>

          </v-card>
        </v-col>
      </v-row>

      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-gavel</v-icon>
        <h3 class="text-h6 text-grey mt-4">No appeals yet</h3>
        <p class="text-body-2 text-grey mt-2">You have not submitted any appeals yet.</p>
        <v-btn color="secondary" class="mt-4" @click="router.push('/student/found-items')">Browse Found Items</v-btn>
      </v-card>
    </div>
  </div>
</template>