<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const loading = ref(false)
const stats = ref(null)
const recentActivity = ref(null)

const fetchDashboard = async () => {
  loading.value = true
  try {
    const [dashRes, activityRes] = await Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/recent-activity')
    ])
    stats.value = dashRes.data
    recentActivity.value = activityRes.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-secondary">Admin Overview</h2>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Platform summary at a glance
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else-if="stats">

      <!-- Items Stats Row -->
      <p class="text-subtitle-2 font-weight-bold text-grey-darken-2 mb-3">Found Items</p>
      <v-row class="mb-6">
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.item_stats.listed }}</h3>
            <p class="text-caption text-grey mt-1">Listed</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-orange">{{ stats.item_stats.under_review }}</h3>
            <p class="text-caption text-grey mt-1">Under Review</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-blue">{{ stats.item_stats.awaiting_collection }}</h3>
            <p class="text-caption text-grey mt-1">Awaiting Collection</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-error">{{ stats.item_stats.unresponsive }}</h3>
            <p class="text-caption text-grey mt-1">Unresponsive</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-success">{{ stats.item_stats.collected }}</h3>
            <p class="text-caption text-grey mt-1">Collected</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.item_stats.total }}</h3>
            <p class="text-caption text-grey mt-1">Total</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Claims and Appeals Row -->
      <p class="text-subtitle-2 font-weight-bold text-grey-darken-2 mb-3">Claims & Appeals</p>
      <v-row class="mb-6">
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center cursor-pointer" hover @click="router.push('/admin/claims')">
            <h3 class="text-h5 font-weight-bold text-orange">{{ stats.claim_stats.pending_review }}</h3>
            <p class="text-caption text-grey mt-1">Pending Claims</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center cursor-pointer" hover @click="router.push('/admin/claims')">
            <h3 class="text-h5 font-weight-bold text-warning">{{ stats.claim_stats.clarification_requested }}</h3>
            <p class="text-caption text-grey mt-1">Clarification Needed</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center cursor-pointer" hover @click="router.push('/admin/appeals')">
            <h3 class="text-h5 font-weight-bold text-error">{{ stats.appeal_stats.pending }}</h3>
            <p class="text-caption text-grey mt-1">Pending Appeals</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center cursor-pointer" hover @click="router.push('/admin/users')">
            <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.user_stats.pending_approval }}</h3>
            <p class="text-caption text-grey mt-1">Pending Approvals</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Users Row -->
      <p class="text-subtitle-2 font-weight-bold text-grey-darken-2 mb-3">Users</p>
      <v-row class="mb-6">
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.user_stats.total }}</h3>
            <p class="text-caption text-grey mt-1">Total Users</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.user_stats.students }}</h3>
            <p class="text-caption text-grey mt-1">Students</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.user_stats.security }}</h3>
            <p class="text-caption text-grey mt-1">Security</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.user_stats.admins }}</h3>
            <p class="text-caption text-grey mt-1">Admins</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Security Handovers Row -->
      <p class="text-subtitle-2 font-weight-bold text-grey-darken-2 mb-3">Security Handovers</p>
      <v-row class="mb-6">
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center cursor-pointer" hover @click="router.push('/admin/handovers')">
            <h3 class="text-h5 font-weight-bold text-orange">{{ stats.handover_stats.pending_confirmation }}</h3>
            <p class="text-caption text-grey mt-1">Pending Confirmation</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-success">{{ stats.handover_stats.confirmed }}</h3>
            <p class="text-caption text-grey mt-1">Confirmed</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-success">{{ stats.handover_stats.collected }}</h3>
            <p class="text-caption text-grey mt-1">Collected</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card rounded="lg" elevation="1" class="pa-4 text-center">
            <h3 class="text-h5 font-weight-bold text-secondary">{{ stats.handover_stats.total }}</h3>
            <p class="text-caption text-grey mt-1">Total</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Activity -->
      <p class="text-subtitle-2 font-weight-bold text-grey-darken-2 mb-3">Recent Activity</p>
      <v-row v-if="recentActivity">

        <!-- Recent Claims -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="1" class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <p class="text-body-2 font-weight-bold">Recent Claims</p>
              <v-btn variant="text" color="secondary" size="small" @click="router.push('/admin/claims')">
                View All
              </v-btn>
            </div>
            <div
              v-for="claim in recentActivity.recent_claims"
              :key="claim.id"
              class="d-flex align-center justify-space-between py-2 border-b"
            >
              <div>
                <p class="text-body-2 text-capitalize">{{ claim.item?.category?.replace(/_/g, ' ') }}</p>
                <p class="text-caption text-grey">{{ new Date(claim.created_at).toLocaleDateString() }}</p>
              </div>
              <v-chip
                size="x-small"
                :color="claim.status === 'pending_review' ? 'warning' : claim.status === 'approved' ? 'success' : 'error'"
              >
                {{ claim.status.replace(/_/g, ' ') }}
              </v-chip>
            </div>
            <p v-if="recentActivity.recent_claims.length === 0" class="text-caption text-grey text-center pa-4">
              No recent claims
            </p>
          </v-card>
        </v-col>

        <!-- Recent Items -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="1" class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <p class="text-body-2 font-weight-bold">Recent Found Items</p>
              <v-btn variant="text" color="secondary" size="small" @click="router.push('/admin/items')">
                View All
              </v-btn>
            </div>
            <div
              v-for="item in recentActivity.recent_items"
              :key="item.id"
              class="d-flex align-center justify-space-between py-2 border-b"
            >
              <div>
                <p class="text-body-2 text-capitalize">{{ item.category?.replace(/_/g, ' ') }}</p>
                <p class="text-caption text-grey">{{ new Date(item.created_at).toLocaleDateString() }}</p>
              </div>
              <v-chip
                size="x-small"
                :color="item.status === 'listed' ? 'success' : item.status === 'collected' ? 'grey' : 'warning'"
              >
                {{ item.status.replace(/_/g, ' ') }}
              </v-chip>
            </div>
            <p v-if="recentActivity.recent_items.length === 0" class="text-caption text-grey text-center pa-4">
              No recent items
            </p>
          </v-card>
        </v-col>

      </v-row>

    </div>

  </div>
</template>