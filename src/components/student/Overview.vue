<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const router = useRouter()
const { user } = useAuth()

const recentItems = ref([])
const recentLostItems = ref([])
const loading = ref(false)

const stats = ref({
  listed: 0,
  searching: 0,
})

const fetchData = async () => {
  loading.value = true
  try {
    const [foundRes, lostRes] = await Promise.all([
      api.get('/items'),
      api.get('/lost-items')
    ])

    recentItems.value = foundRes.data.slice(0, 4)
    recentLostItems.value = lostRes.data.slice(0, 4)
    stats.value.listed = foundRes.data.length
    stats.value.searching = lostRes.data.length
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <!-- Welcome -->
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">
        Welcome back, {{ user?.first_name }} 👋
      </h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Here is what is happening on campus today.
      </p>
    </div>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="1" class="pa-4 text-center">
          <v-icon size="36" color="secondary" class="mb-2">mdi-magnify</v-icon>
          <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.listed }}</h3>
          <p class="text-caption text-grey">Found Items Listed</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="1" class="pa-4 text-center">
          <v-icon size="36" color="orange" class="mb-2">mdi-help-circle</v-icon>
          <h3 class="text-h5 font-weight-bold text-orange">{{ stats.searching }}</h3>
          <p class="text-caption text-grey">Lost Items Searching</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6">
        <v-card 
          rounded="lg" 
          elevation="1" 
          class="pa-6 d-flex align-center gap-4 cursor-pointer"
          @click="router.push('/student/found-items')"
          hover
        >
          <v-icon size="40" color="secondary">mdi-plus-circle</v-icon>
          <div>
            <p class="font-weight-bold text-secondary">Post Found Item</p>
            <p class="text-caption text-grey">Found something on campus?</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card 
          rounded="lg" 
          elevation="1" 
          class="pa-6 d-flex align-center gap-4 cursor-pointer"
          @click="router.push('/student/lost-items')"
          hover
        >
          <v-icon size="40" color="orange">mdi-alert-circle</v-icon>
          <div>
            <p class="font-weight-bold text-orange">Post Lost Item</p>
            <p class="text-caption text-grey">Lost something on campus?</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Found Items -->
    <div class="mb-4 d-flex align-center justify-space-between">
      <h3 class="text-subtitle-1 font-weight-bold">Recent Found Items</h3>
      <v-btn 
        variant="text" 
        color="secondary" 
        size="small"
        @click="router.push('/student/found-items')"
      >
        View All
      </v-btn>
    </div>

    <v-row v-if="!loading">
      <v-col 
        v-for="item in recentItems" 
        :key="item.id" 
        cols="12" sm="6" md="3"
      >
        <v-card 
          rounded="lg" 
          elevation="1" 
          hover
          @click="router.push('/student/found-items')"
        >
          <v-img
            :src="`http://127.0.0.1:8000/storage/${item.photo_path}`"
            height="160"
            cover
          />
          <v-card-text>
            <v-chip size="small" color="secondary" class="text-capitalize">
              {{ item.category.replace(/_/g, ' ') }}
            </v-chip>
            <p class="text-caption text-grey mt-1">
              {{ new Date(item.created_at).toLocaleDateString() }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="recentItems.length === 0" cols="12">
        <v-card rounded="lg" elevation="0" class="pa-8 text-center bg-grey-lighten-4">
          <v-icon size="48" color="grey">mdi-package-variant</v-icon>
          <p class="text-body-2 text-grey mt-2">No found items yet</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="3">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

  </div>
</template>