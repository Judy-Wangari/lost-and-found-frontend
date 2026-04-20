<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import PostFoundItem from '@/components/student/PostFoundItem.vue'

const router = useRouter()

const items = ref([])
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

const fetchItems = async () => {
  loading.value = true
  try {
    const params = {}
    if(selectedCategory.value) params.category = selectedCategory.value
    const response = await api.get('/items', { params })
    items.value = response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Found Items</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">
          Browse items found on campus
        </p>
      </div>
      <v-btn 
        color="secondary" 
        prepend-icon="mdi-plus"
        @click="showPostForm = true"
      >
        Post Found Item
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
          @update:modelValue="fetchItems"
        />
      </v-col>
    </v-row>

    <!-- Items Grid -->
    <v-row v-if="!loading">
      <v-col
        v-for="item in items"
        :key="item.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card rounded="lg" elevation="2" hover>
          <!-- Item Photo -->
          <v-img
            :src="`http://127.0.0.1:8000/storage/${item.photo_path}`"
            height="200"
            cover
          >
            <template #error>
              <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                <v-icon size="48" color="grey">mdi-image-off</v-icon>
              </div>
            </template>
          </v-img>

          <v-card-text>
            <!-- Category Chip -->
            <v-chip size="small" color="secondary" class="text-capitalize mb-2">
              {{ item.category.replace(/_/g, ' ') }}
            </v-chip>

            <!-- Date -->
            <p class="text-caption text-grey">
              Posted {{ new Date(item.created_at).toLocaleDateString() }}
            </p>

            <!-- Status -->
            <v-chip 
              size="x-small" 
              :color="item.status === 'listed' ? 'success' : 'warning'"
              class="mt-1"
            >
              {{ item.status.replace(/_/g, ' ') }}
            </v-chip>
          </v-card-text>

          <!-- Action Buttons -->
          <v-card-actions>
            <v-btn 
              color="secondary" 
              variant="tonal" 
              block
              @click="router.push({ name: 'found-item-detail', params: { id: item.id } })"
            >
              View & Claim
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Empty State -->
      <v-col v-if="items.length === 0" cols="12">
        <v-card rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
          <v-icon size="64" color="grey">mdi-package-variant-closed</v-icon>
          <h3 class="text-h6 text-grey mt-4">No found items yet</h3>
          <p class="text-body-2 text-grey mt-2">
            Be the first to post a found item
          </p>
          <v-btn 
            color="secondary" 
            class="mt-4"
            @click="showPostForm = true"
          >
            Post Found Item
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

    <!-- Post Found Item Dialog -->
    <v-dialog v-model="showPostForm" max-width="600" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">
          Post Found Item
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-grey mb-4">
            This is a two step process. First fill in the public details then the private details.
          </p>
          <!-- Step indicator -->
          <PostFoundItem @close="showPostForm = false" @success="fetchItems" />
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>