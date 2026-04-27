import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/authStore";
import SessionView from "../views/SessionView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/AuthView.vue"),
    },
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/workouts",
      name: "workouts",
      component: () => import("../views/WorkoutsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/workouts/:id",
      name: "workout-details",
      component: () => import("../views/WorkoutDetailsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/history",
      name: "history",
      component: () => import("../views/HistoryView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/progress",
      name: "progress",
      component: () => import("../views/ProgressView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/session",
      name: "session",
      component: SessionView,
      meta: { requiresAuth: true, title: "Treino Ativo" },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      redirect: "/auth"
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/"
    }
  ],
});

// Navigation guard
router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.currentUser) {
    return "/auth";
  } else if (to.path === "/auth" && authStore.currentUser) {
    return "/";
  }
});

export default router;
