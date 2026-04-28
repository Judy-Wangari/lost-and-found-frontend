<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const notifications = ref([])
const loading = ref(false)
const markingAll = ref(false)

const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await api.get('/notifications')
    notifications.value = response.data.data || response.data
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notification) => {
  try {
    await api.get(`/notifications/${notification.id}`)
    notification.is_read = true
    handleNotificationClick(notification)
  } catch(e) {
    console.error(e)
  }
}

const markAllRead = async () => {
  markingAll.value = true
  try {
    await api.post('/notifications/mark-all-read')
    notifications.value.forEach(n => n.is_read = true)
    window.dispatchEvent(new Event('notifications-read'))
  } catch(e) {
    console.error(e)
  } finally {
    markingAll.value = false
  }
}

const handleNotificationClick = (notification) => {
  if(notification.reference_type === 'claim'){
    router.push({ name: 'admin-claim-detail', params: { id: notification.reference_id } })
  } else if(notification.reference_type === 'appeal'){
    router.push({ name: 'admin-appeal-detail', params: { id: notification.reference_id } })
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    claim_submitted: 'mdi-clipboard-plus',
    claim_approved: 'mdi-check-circle',
    claim_rejected: 'mdi-close-circle',
    clarification_requested: 'mdi-help-circle',
    clarification_responded: 'mdi-reply',
    appeal_submitted: 'mdi-gavel',
    appeal_under_review: 'mdi-gavel',
    appeal_resolved: 'mdi-gavel',
    appeal_rejected: 'mdi-gavel',
    item_collected: 'mdi-check-all',
    admin_message: 'mdi-shield-account',
    general: 'mdi-bell',
  }
  return icons[type] || 'mdi-bell'
}

const getNotificationColor = (type) => {
  const colors = {
    claim_submitted: 'secondary',
    claim_approved: 'success',
    claim_rejected: 'error',
    clarification_requested: 'warning',
    clarification_responded: 'secondary',
    appeal_submitted: 'warning',
    appeal_under_review: 'orange',
    appeal_resolved: 'success',
    appeal_rejected: 'error',
    item_collected: 'success',
    admin_message: 'secondary',
  }
  return colors[type] || 'secondary'
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-secondary">Notifications</h2>
        <p class="text-body-2 text-grey-darken-1 mt-1">Platform activity and alerts</p>
      </div>
      <v-btn
        v-if="notifications.some(n => !n.is_read)"
        variant="outlined"
        color="secondary"
        size="small"
        :loading="markingAll"
        @click="markAllRead"
      >
        Mark All as Read
      </v-btn>
    </div>

    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else>
      <v-card
        v-for="notification in notifications"
        :key="notification.id"
        rounded="lg"
        elevation="1"
        class="mb-3 cursor-pointer"
        :class="!notification.is_read ? 'border-s-4 border-secondary' : ''"
        @click="markAsRead(notification)"
      >
        <v-card-text class="d-flex align-center gap-4">
          <v-avatar size="44" :color="getNotificationColor(notification.type)" variant="tonal">
            <v-icon :color="getNotificationColor(notification.type)">
              {{ getNotificationIcon(notification.type) }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <p class="text-body-2" :class="!notification.is_read ? 'font-weight-bold' : ''">
              {{ notification.message_body }}
            </p>
            <p class="text-caption text-grey mt-1">
              {{ new Date(notification.created_at).toLocaleString() }}
            </p>
          </div>
          <v-icon v-if="!notification.is_read" color="secondary" size="10">mdi-circle</v-icon>
        </v-card-text>
      </v-card>

      <v-card v-if="notifications.length === 0" rounded="lg" elevation="0" class="pa-12 text-center bg-grey-lighten-4">
        <v-icon size="64" color="grey">mdi-bell-outline</v-icon>
        <h3 class="text-h6 text-grey mt-4">No notifications yet</h3>
      </v-card>
    </div>
  </div>
</template>