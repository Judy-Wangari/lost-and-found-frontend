<script setup>
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'

const route = useRoute()
</script>

<template>
  <v-app>
    <NavBar v-if="!route.meta.hideNavbar" />
    <v-main v-if="!route.meta.hideNavbar">
      <RouterView />
    </v-main>
    <RouterView v-else />
  </v-app>
</template>