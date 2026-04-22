<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const appeals = ref([])
const loading = ref(false)
const error = ref('')

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
  const colors = {
    pending: 'warning',
    under_review: 'orange',
    resolved: 'success',
  }
  return colors[status] || 'grey'
}

onMounted(() => {
  fetchMyAppeals()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">My Appeals</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Track the status of your appeals
      </p>
    </div>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-row v-if="appeals.length > 0">
        <v-col
          v-for="appeal in appeals"
          :key="appeal.id"
          cols="12" md="6"
        >
          <v-card rounded="lg" elevation="2" class="pa-4">

            <div class="d-flex align-center gap-4 mb-4">
              <v-img
                v-if="appeal.item?.photo_path"
                :src="`http://127.0.0.1:8000/storage/${appeal.item.photo_path}`"
                width="80"
                height="80"
                cover
                rounded="lg"
              />
              <div
                v-else
                class="d-flex align-center justify-center bg-grey-lighten-3 rounded-lg"
                style="width: 80px; height: 80px"
              >
                <v-icon color="grey">mdi-image-off</v-icon>
              </div>

              <div>
                <v-chip size="small" color="secondary" class="text-capitalize mb-1">
                  {{ appeal.item?.category?.replace(/_/g, ' ') }}
                </v-chip>
                <p class="text-caption text-grey">
                  Appealed on {{ new Date(appeal.created_at).toLocaleDateString() }}
                </p>
              </div>
            </div>

            <div class="mb-4">
              <v-chip :color="getStatusColor(appeal.status)" size="small">
                {{ appeal.status.replace(/_/g, ' ') }}
              </v-chip>
            </div>

            <v-alert
              v-if="appeal.status === 'pending'"
              type="warning"
              density="compact"
              class="mb-3"
            >
              Your appeal is waiting for admin review.
            </v-alert>

            <v-alert
              v-if="appeal.status === 'under_review'"
              type="info"
              density="compact"
              class="mb-3"
            >
              Admin is currently reviewing your appeal.
            </v-alert>

            <v-alert
              v-if="appeal.status === 'resolved'"
              type="success"
              density="compact"
              class="mb-3"
            >
              Your appeal has been resolved. Check your notifications for the outcome.
            </v-alert>

            <v-btn
              color="secondary"
              variant="text"
              size="small"
              @click="router.push({ name: 'found-item-detail', params: { id: appeal.item_id } })"
            >
              View Item
            </v-btn>

          </v-card>
        </v-col>
      </v-row>

      <v-card v-else rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-gavel</v-icon>
        <h3 class="text-h6 text-grey mt-4">No appeals yet</h3>
        <p class="text-body-2 text-grey mt-2">
          Appeals can be raised after a rejected claim
        </p>
      </v-card>
    </div>

  </div>
</template>