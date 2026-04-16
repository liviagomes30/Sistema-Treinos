import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const currentUser = ref<any>(null);

  function login(userData: any) {
    currentUser.value = userData;
  }

  function logout() {
    currentUser.value = null;
  }

  return { currentUser, login, logout };
});
