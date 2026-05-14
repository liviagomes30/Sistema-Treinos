<template>
  <div class="app-shell">
    <!-- Main content area -->
    <div class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Active Session Banner -->
    <div 
      v-if="sessionStore.activeSession && route.path !== '/session'" 
      class="active-session-banner" 
      @click="router.push('/session')"
    >
      <div class="banner-pulse"></div>
      <div class="banner-info">
        <span class="banner-title">Treino em Andamento</span>
        <span class="banner-workout">{{ sessionStore.activeSession.workoutName }}</span>
      </div>
      <div class="banner-action">Retomar <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="feather"><polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></div>
    </div>

    <!-- Bottom Navigation Bar -->
    <nav class="bottom-nav" v-if="showBottomNav">
      <router-link to="/" class="nav-item" exact-active-class="active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span class="nav-label">Home</span>
      </router-link>

      <router-link to="/workouts" class="nav-item" active-class="active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
        <span class="nav-label">Treinos</span>
      </router-link>

      <router-link to="/history" class="nav-item" active-class="active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span class="nav-label">Histórico</span>
      </router-link>

      <router-link to="/settings" class="nav-item" active-class="active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
        <span class="nav-label">Perfil</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSessionStore } from "../../store/sessionStore";

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();

const showBottomNav = computed(() => {
  const hiddenRoutes: string[] = [];
  return !hiddenRoutes.includes(route.path);
});
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: var(--bg);
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.3px;
}

/* Active Session Banner */
.active-session-banner {
  background: var(--accent);
  color: #192126;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 -4px 12px rgba(187, 242, 70, 0.15);
  transition: transform 0.2s;
  z-index: 10;
}
.active-session-banner:active {
  transform: scale(0.98);
}
.banner-pulse {
  width: 10px;
  height: 10px;
  background: #192126;
  border-radius: 50%;
  animation: pulse-dark 1.5s infinite;
  flex-shrink: 0;
}
.banner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.banner-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.banner-workout {
  font-size: 14px;
  font-weight: 600;
}
.banner-action {
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}
@keyframes pulse-dark {
  0% { box-shadow: 0 0 0 0 rgba(25, 33, 38, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(25, 33, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 33, 38, 0); }
}
</style>
