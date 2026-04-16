<template>
  <div v-if="requiresAuth">
    <MainLayout />
  </div>
  <div v-else style="height: 100vh; overflow: hidden; display: flex;">
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'

const route = useRoute()
const requiresAuth = computed(() => route.meta.requiresAuth)
</script>
