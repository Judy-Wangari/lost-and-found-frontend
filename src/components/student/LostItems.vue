<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import PostLostItem from '@/components/student/PostLostItem.vue'

const router = useRouter()

const lostItems = ref([])
const loading = ref(false)
const selectedCategory = ref('')
const showPostForm = ref(false)

const categories = [
  { title: 'All Categories', value: '' },
  { title: 'Eyewear', value: 'eyewear' },
  { title: 'Electronics', value: 'electronics' },
  { title: 'Stationery', value: 'stationery' },
  { title: 'Clothing & Accessories', value: 'clothing_and_accessories' },
  { title: 'Documents & Cards', value: 'documents_and_cards' },
  { title: 'Bags & Luggage', value: 'bags_and_luggage' },
  { title: 'Keys', value: 'keys' },
  { title: 'Other', value: 'other' },
]

const fetchLostItems = async () => {
  loading.value = true
  try {
    const params = {}
    if(selectedCategory.value) params.category = selectedCategory.value
    const response = await api.get('/lost-items', { params })
    lostItems.value = response.data
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
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Lost Items</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">
          Browse items lost on campus
        </p>
      </div>
      <v-btn
        color="secondary"
        prepend-icon="mdi-plus"
        @click="showPostForm = true"
      >
        Post Lost Item
      </v-btn>
    </div>

    <!-- Category Filter -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedCategory"
          :items="categories"
          item-title="title"
          item-value="value"
          label="Filter by Category"
          density="comfortable"
          outlined
          clearable
          @update:modelValue="fetchLostItems"
        />
      </v-col>
    </v-row>

    <!-- Lost Items Grid -->
    <v-row v-if="!loading">
      <v-col
        v-for="item in lostItems"
        :key="item.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card rounded="lg" elevation="2" hover>
          <!-- Photo if available -->
          <v-img
            v-if="item.photo_path"
            :src="`http://127.0.0.1:8000/storage/${item.photo_path}`"
            height="180"
            cover
          />

          <!-- No photo placeholder -->
          <div 
            v-else 
            class="d-flex align-center justify-center bg-grey-lighten-3"
            style="height: 180px"
          >
            <div class="text-center">
              <v-icon size="48" color="grey">mdi-image-off</v-icon>
              <p class="text-caption text-grey mt-1">No photo available</p>
            </div>
          </div>

          <v-card-text>
            <!-- Category -->
            <v-chip size="small" color="orange" class="text-capitalize mb-2">
              {{ item.category.replace(/_/g, ' ') }}
            </v-chip>

            <!-- Description -->
            <p class="text-body-2 mt-2 text-truncate">
              {{ item.general_description }}
            </p>

            <!-- Date -->
            <p class="text-caption text-grey mt-1">
              Posted {{ new Date(item.created_at).toLocaleDateString() }}
            </p>

            <!-- Status -->
            <v-chip
              size="x-small"
              :color="item.status === 'searching' ? 'warning' : 'success'"
              class="mt-1"
            >
              {{ item.status }}
            </v-chip>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="secondary"
              variant="tonal"
              block
              @click="router.push({ name: 'lost-item-detail', params: { id: item.id } })"
            >
              View Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Empty State -->
      <v-col v-if="lostItems.length === 0" cols="12">
        <v-card rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
          <v-icon size="64" color="grey">mdi-help-circle-outline</v-icon>
          <h3 class="text-h6 text-grey mt-4">No lost items posted yet</h3>
          <p class="text-body-2 text-grey mt-2">
            Lost something on campus? Post it here.
          </p>
          <v-btn
            color="secondary"
            class="mt-4"
            @click="showPostForm = true"
          >
            Post Lost Item
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading Skeleton -->
    <v-row v-else>
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <!-- Post Lost Item Dialog -->
    <v-dialog v-model="showPostForm" max-width="600" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">
          Post Lost Item
        </v-card-title>
        <v-card-text>
          <PostLostItem @close="showPostForm = false" @success="fetchLostItems" />
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>