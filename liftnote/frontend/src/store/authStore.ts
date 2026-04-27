import { defineStore } from "pinia";
import { ref } from "vue";
import type { User, LoginData, RegisterData } from "../types";
import { authService } from "../services/authService";

export const useAuthStore = defineStore("auth", () => {
  let savedUser = null;
  try {
    const userItem = localStorage.getItem("user");
    savedUser = userItem ? JSON.parse(userItem) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    localStorage.removeItem("user");
  }
  const currentUser = ref<User | null>(savedUser);
  const token = ref<string | null>(localStorage.getItem("token"));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function login(credentials: LoginData) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      currentUser.value = response.user;
      token.value = response.token;
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
    } catch (err: any) {
      error.value = err.response?.data?.error || "Falha no login";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(userData: RegisterData) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.register(userData);
      currentUser.value = response.user;
      token.value = response.token;
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
    } catch (err: any) {
      error.value = err.response?.data?.error || "Falha no registro";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    currentUser.value = null;
    token.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  return { currentUser, token, isLoading, error, login, register, logout };
});
