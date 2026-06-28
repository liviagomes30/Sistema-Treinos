import { defineStore } from "pinia";
import { ref } from "vue";
import { Preferences } from "@capacitor/preferences";
import type { User, LoginData, RegisterData } from "../types";
import { authService } from "../services/authService";
import { setApiToken } from "../services/api";

async function getItem(key: string): Promise<string | null> {
  const { value } = await Preferences.get({ key });
  return value;
}

async function setItem(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

async function removeItem(key: string): Promise<void> {
  await Preferences.remove({ key });
}

export const useAuthStore = defineStore("auth", () => {
  const currentUser = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  async function restoreAuthFromStorage() {
    if (isInitialized.value) return;
    try {
      const [savedUser, savedToken] = await Promise.all([
        getItem("user"),
        getItem("token"),
      ]);
      currentUser.value = savedUser ? JSON.parse(savedUser) : null;
      token.value = savedToken;
      setApiToken(savedToken);
    } catch {
      await Promise.all([removeItem("user"), removeItem("token")]);
    } finally {
      isInitialized.value = true;
    }
  }

  async function login(credentials: LoginData) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      currentUser.value = response.user;
      token.value = response.token;
      setApiToken(response.token);
      await Promise.all([
        setItem("user", JSON.stringify(response.user)),
        setItem("token", response.token),
      ]);
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
      setApiToken(response.token);
      await Promise.all([
        setItem("user", JSON.stringify(response.user)),
        setItem("token", response.token),
      ]);
    } catch (err: any) {
      error.value = err.response?.data?.error || "Falha no registro";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    currentUser.value = null;
    token.value = null;
    setApiToken(null);
    await Promise.all([removeItem("user"), removeItem("token")]);
  }

  return { currentUser, token, isLoading, error, isInitialized, restoreAuthFromStorage, login, register, logout };
});
