<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/auth'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()

const lostItem = ref(null)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// Match found post
const showMatchForm = ref(false)
const myFoundPosts = ref([])
const selectedFoundPostId = ref(null)
const matchLoading = ref(false)

const fetchLostItem = async () => {
  loading.value = true
  try {
    const response = await api.get(`/lost-items/${route.params.id}`)
    lostItem.value = response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchMyFoundPosts = async () => {
  try {
    const response = await api.get('/items')
    // Filter only items posted by logged in user
    myFoundPosts.value = response.data.filter(item => item.posted_by === user.value?.id)
  } catch(e) {
    console.error(e)
  }
}

const submitMatch = async () => {
  if(!selectedFoundPostId.value){
    error.value = 'Please select a found post to link.'
    return
  }

  matchLoading.value = true
  error.value = ''
  try {
    await api.post(`/lost-items/${lostItem.value.id}/match-found-post`, {
      item_id: selectedFoundPostId.value
    })

    successMessage.value = 'Match notification sent to the lost item poster successfully.'
    showMatchForm.value = false

  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to send match notification.'
  } finally {
    matchLoading.value = false
  }
}

onMounted(() => {
  fetchLostItem()
  fetchMyFoundPosts()
})
</script>

<template>
  <div>
    <!-- Back Button -->
    <v-btn
      variant="text"
      color="secondary"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      @click="router.push('/student/lost-items')"
    >
      Back to Lost Items
    </v-btn>

    <!-- Loading -->
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <!-- Lost Item Detail -->
    <div v-else-if="lostItem">

      <v-alert v-if="successMessage" type="success" class="mb-4">
        {{ successMessage }}
      </v-alert>

      <v-alert v-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>

      <v-row>
        <!-- Photo -->
        <v-col cols="12" md="5">
          <v-card rounded="lg" elevation="2">
            <v-img
              v-if="lostItem.photo_path"
              :src="`http://127.0.0.1:8000/storage/${lostItem.photo_path}`"
              height="350"
              cover
            />
            <div
              v-else
              class="d-flex align-center justify-center bg-grey-lighten-3"
              style="height: 350px"
            >
              <div class="text-center">
                <v-icon size="64" color="grey">mdi-image-off</v-icon>
                <p class="text-caption text-grey mt-2">No photo available</p>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Info -->
        <v-col cols="12" md="7">
          <v-card rounded="lg" elevation="2" class="pa-6">

            <v-chip color="orange" class="text-capitalize mb-4">
              {{ lostItem.category?.replace(/_/g, ' ') }}
            </v-chip>

            <v-chip
              :color="lostItem.status === 'searching' ? 'warning' : 'success'"
              size="small"
              class="mb-4 ml-2"
            >
              {{ lostItem.status }}
            </v-chip>

            <p class="text-body-1 mb-4">{{ lostItem.general_description }}</p>

            <p class="text-caption text-grey mb-6">
              Posted on {{ new Date(lostItem.created_at).toLocaleDateString() }}
            </p>

            <!-- This Matches My Found Post button -->
            <div v-if="lostItem.status === 'searching'">
              <v-btn
                color="secondary"
                prepend-icon="mdi-link-variant"
                @click="showMatchForm = true"
              >
                This Matches My Found Post
              </v-btn>
            </div>

            <v-alert
              v-if="lostItem.status === 'found'"
              type="success"
              density="compact"
              class="mt-4"
            >
              This item has been found and reunited with its owner.
            </v-alert>

          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Match Found Post Dialog -->
    <v-dialog v-model="showMatchForm" max-width="500" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-secondary mb-2">
          Link Your Found Post
        </v-card-title>

        <v-card-text>
          <p class="text-body-2 text-grey mb-4">
            Select the found item post that matches this lost item. The owner will be notified to view your found post and submit a claim.
          </p>

          <div v-if="myFoundPosts.length > 0">
            <v-radio-group v-model="selectedFoundPostId">
              <v-radio
                v-for="post in myFoundPosts"
                :key="post.id"
                :value="post.id"
                :label="`${post.category.replace(/_/g, ' ')} - Posted ${new Date(post.created_at).toLocaleDateString()}`"
              />
            </v-radio-group>
          </div>

          <v-alert v-else type="info" density="compact">
            You have no found item posts yet. Go to Found Items to post one first.
          </v-alert>
        </v-card-text>

        <v-card-actions class="justify-end gap-3">
          <v-btn variant="outlined" @click="showMatchForm = false">Cancel</v-btn>
          <v-btn
            color="secondary"
            :loading="matchLoading"
            :disabled="!selectedFoundPostId || myFoundPosts.length === 0"
            @click="submitMatch"
          >
            Send Match Notification
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>