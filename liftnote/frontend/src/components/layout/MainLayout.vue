<template>
  <div
    class="app-container"
    style="
      display: flex;
      height: 100vh;
      overflow: hidden;
      width: 100%;
      background: var(--bg);
    "
  >
    <!-- Sidebar -->
    <aside :class="['sidebar', { open: sidebarOpen }]">
      <div class="sidebar-logo">
        <div class="logo-icon">LN</div>
        <div class="logo-text">LIFTNOTE</div>
      </div>
      <div class="sidebar-user" v-if="authStore.currentUser">
        <div class="user-avatar">
          {{ authStore.currentUser.name[0].toUpperCase() }}
        </div>
        <div class="user-name">{{ authStore.currentUser.name }}</div>
        <div class="user-sub">
          {{
            authStore.currentUser.age
              ? authStore.currentUser.age + " anos"
              : "Usuário"
          }}
        </div>
      </div>
      <div class="nav-label">Menu</div>
      <router-link
        to="/"
        class="nav-item"
        exact-active-class="active"
        @click="sidebarOpen = false"
      >
        <span class="nav-icon">⌂</span> Home
      </router-link>
      <router-link
        to="/workouts"
        class="nav-item"
        active-class="active"
        @click="sidebarOpen = false"
      >
        <span class="nav-icon">◈</span> Treinos
        <span class="badge" style="margin-left: auto">{{
          appStore.workouts.length
        }}</span>
      </router-link>
      <router-link
        to="/history"
        class="nav-item"
        active-class="active"
        @click="sidebarOpen = false"
      >
        <span class="nav-icon">◷</span> Histórico
      </router-link>
      <router-link
        to="/progress"
        class="nav-item"
        active-class="active"
        @click="sidebarOpen = false"
      >
        <span class="nav-icon">↗</span> Progresso
      </router-link>
      <div class="sidebar-bottom">
        <router-link
          to="/settings"
          class="nav-item"
          active-class="active"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon">⚙</span> Configurações
        </router-link>
        <div class="nav-item" @click="doLogout" style="color: var(--red)">
          <span class="nav-icon">←</span> Sair
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div
      class="main"
      @click="sidebarOpen = false"
      style="flex: 1; display: flex; flex-direction: column; overflow: hidden"
    >
      <div class="topbar">
        <div style="display: flex; align-items: center; gap: 12px">
          <div
            style="cursor: pointer; display: none"
            class="mobile-menu"
            @click.stop="sidebarOpen = !sidebarOpen"
          >
            ☰
          </div>
          <div class="topbar-title">{{ route.meta.title || route.name }}</div>
        </div>
        <div class="topbar-date">{{ todayFormatted }}</div>
      </div>

      <div class="page" style="flex: 1; overflow-y: auto; padding: 20px">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const appStore = useAppStore();

const sidebarOpen = ref(false);

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
});

function doLogout() {
  authStore.logout();
  router.push("/auth");
}
</script>
