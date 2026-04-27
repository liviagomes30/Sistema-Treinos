<template>
  <div v-if="requiresAuth" class="app-authenticated">
    <MainLayout />
  </div>
  <div v-else class="app-public">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'

const route = useRoute()
const requiresAuth = computed(() => route.meta.requiresAuth)
</script>

<style>
.app-authenticated,
.app-public {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
