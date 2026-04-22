<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const foundPosts = ref([])
const lostPosts = ref([])
const loading = ref(false)
const activeTab = ref('found')
const deleteDialog = ref(false)
const itemToDelete = ref(null)
const deleteType = ref('')
const deleteLoading = ref(false)
const successMessage = ref('')
const error = ref('')

const fetchMyPosts = async () => {
  loading.value = true
  try {
    const [foundRes, lostRes] = await Promise.all([
     api.get('/my-items'),
     api.get('/my-lost-items')
    ])
    foundPosts.value = foundRes.data
    lostPosts.value = lostRes.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item, type) => {
  itemToDelete.value = item
  deleteType.value = type
  deleteDialog.value = true
}

const deletePost = async () => {
  deleteLoading.value = true
  error.value = ''
  try {
    if(deleteType.value === 'found'){
      await api.delete(`/items/${itemToDelete.value.id}`)
      foundPosts.value = foundPosts.value.filter(i => i.id !== itemToDelete.value.id)
    } else {
      await api.delete(`/lost-items/${itemToDelete.value.id}`)
      lostPosts.value = lostPosts.value.filter(i => i.id !== itemToDelete.value.id)
    }
    successMessage.value = 'Post deleted successfully.'
    deleteDialog.value = false
  } catch(e) {
    error.value = e.response?.data?.message || 'Failed to delete post.'
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  fetchMyPosts()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">My Posts</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Manage your found and lost item posts
      </p>
    </div>

    <v-alert v-if="successMessage" type="success" closable class="mb-4" @click:close="successMessage = ''">
      {{ successMessage }}
    </v-alert>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="secondary" class="mb-6">
      <v-tab value="found">
        Found Posts ({{ foundPosts.length }})
      </v-tab>
      <v-tab value="lost">
        Lost Posts ({{ lostPosts.length }})
      </v-tab>
    </v-tabs>

    <!-- Loading -->
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>

      <!-- Found Posts Tab -->
      <v-tabs-window v-model="activeTab">
        <v-tabs-window-item value="found">
          <v-row>
            <v-col
              v-for="item in foundPosts"
              :key="item.id"
              cols="12" sm="6" md="4"
            >
              <v-card rounded="lg" elevation="2">
                <v-img
                  :src="`http://127.0.0.1:8000/storage/${item.photo_path}`"
                  height="180"
                  cover
                >
                  <template #error>
                    <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                      <v-icon size="40" color="grey">mdi-image-off</v-icon>
                    </div>
                  </template>
                </v-img>

                <v-card-text>
                  <v-chip size="small" color="secondary" class="text-capitalize mb-2">
                    {{ item.category.replace(/_/g, ' ') }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    :color="item.status === 'listed' ? 'success' : item.status === 'collected' ? 'grey' : 'warning'"
                    class="ml-2"
                  >
                    {{ item.status.replace(/_/g, ' ') }}
                  </v-chip>
                  <p class="text-caption text-grey mt-2">
                    Posted {{ new Date(item.created_at).toLocaleDateString() }}
                  </p>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    color="error"
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-delete"
                    :disabled="item.status !== 'listed'"
                    @click="confirmDelete(item, 'found')"
                  >
                    Delete
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    color="secondary"
                    variant="text"
                    size="small"
                    @click="router.push({ name: 'found-item-detail', params: { id: item.id } })"
                  >
                    View
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Empty State -->
            <v-col v-if="foundPosts.length === 0" cols="12">
              <v-card rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
                <v-icon size="64" color="grey">mdi-package-variant</v-icon>
                <h3 class="text-h6 text-grey mt-4">No found posts yet</h3>
                <v-btn
                  color="secondary"
                  class="mt-4"
                  @click="router.push('/student/found-items')"
                >
                  Post Found Item
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <!-- Lost Posts Tab -->
        <v-tabs-window-item value="lost">
          <v-row>
            <v-col
              v-for="item in lostPosts"
              :key="item.id"
              cols="12" sm="6" md="4"
            >
              <v-card rounded="lg" elevation="2">
                <v-img
                  v-if="item.photo_path"
                  :src="`http://127.0.0.1:8000/storage/${item.photo_path}`"
                  height="180"
                  cover
                />
                <div
                  v-else
                  class="d-flex align-center justify-center bg-grey-lighten-3"
                  style="height: 180px"
                >
                  <v-icon size="40" color="grey">mdi-image-off</v-icon>
                </div>

                <v-card-text>
                  <v-chip size="small" color="orange" class="text-capitalize mb-2">
                    {{ item.category.replace(/_/g, ' ') }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    :color="item.status === 'searching' ? 'warning' : 'success'"
                    class="ml-2"
                  >
                    {{ item.status }}
                  </v-chip>
                  <p class="text-body-2 mt-2 text-truncate">{{ item.general_description }}</p>
                  <p class="text-caption text-grey mt-1">
                    Posted {{ new Date(item.created_at).toLocaleDateString() }}
                  </p>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    color="error"
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-delete"
                    :disabled="item.status !== 'searching'"
                    @click="confirmDelete(item, 'lost')"
                  >
                    Delete
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    color="secondary"
                    variant="text"
                    size="small"
                    @click="router.push({ name: 'lost-item-detail', params: { id: item.id } })"
                  >
                    View
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Empty State -->
            <v-col v-if="lostPosts.length === 0" cols="12">
              <v-card rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
                <v-icon size="64" color="grey">mdi-help-circle-outline</v-icon>
                <h3 class="text-h6 text-grey mt-4">No lost posts yet</h3>
                <v-btn
                  color="secondary"
                  class="mt-4"
                  @click="router.push('/student/lost-items')"
                >
                  Post Lost Item
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-error mb-2">
          Delete Post
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this post? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="justify-end gap-3">
          <v-btn variant="outlined" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="deletePost"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>