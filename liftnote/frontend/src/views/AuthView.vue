<template>
  <div class="auth-page">
    <div class="auth-top">
      <div class="back-btn" @click="resetFormAndGoBack" v-if="authView !== 'login'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </div>
      <div class="auth-brand" v-if="authView === 'login'">LIFTNOTE</div>
    </div>

    <LoginForm
      v-if="authView === 'login'"
      :error="authError"
      :is-loading="authStore.isLoading"
      @submit="handleLoginSubmit"
      @go-register="goToRegister"
      @forgot-password="authView = 'reset'"
    />

    <RegistrationFlow
      v-else-if="authView === 'register'"
      :step="registerStep"
      :error="authError"
      :is-loading="authStore.isLoading"
      @advance="registerStep = 2"
      @back="registerStep = 1"
      @submit="handleRegistrationSubmit"
    />

    <PasswordRecoveryFlow
      v-else-if="authView === 'reset' || authView === 'new-password'"
      :mode="authView"
      :reset-token="resetToken"
      :error="authError"
      :is-loading="resetLoading"
      :new-password-done="newPasswordDone"
      @submit-reset-request="handlePasswordResetRequest"
      @submit-new-password="handleNewPasswordSubmit"
      @go-login="authView = 'login'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import LoginForm from '../components/auth/LoginForm.vue'
import RegistrationFlow from '../components/auth/RegistrationFlow.vue'
import PasswordRecoveryFlow from '../components/auth/PasswordRecoveryFlow.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const authView = ref('login')
const registerStep = ref(1)
const authError = ref('')
const resetLoading = ref(false)
const resetToken = ref('')
const newPasswordDone = ref(false)

onMounted(() => {
  const token = route.query.reset as string
  if (token) {
    resetToken.value = token
    authView.value = 'new-password'
  }
})

function resetFormAndGoBack() {
  authError.value = ''
  if (authView.value === 'register' && registerStep.value === 2) {
    registerStep.value = 1
  } else {
    authView.value = 'login'
    registerStep.value = 1
  }
}

function goToRegister() {
  authError.value = ''
  authView.value = 'register'
  registerStep.value = 1
}

async function handleLoginSubmit(data: { email: string; password: string }) {
  authError.value = ''
  try {
    await authStore.login(data)
    router.push('/')
  } catch {
    authError.value = authStore.error || 'Erro ao entrar'
  }
}

async function handleRegistrationSubmit(data: { name: string; email: string; password: string; age?: number | null }) {
  authError.value = ''
  try {
    await authStore.register(data)
    router.push('/')
  } catch {
    authError.value = authStore.error || 'Erro ao criar conta'
  }
}

async function handlePasswordResetRequest(email: string) {
  try {
    await authService.forgotPassword(email)
  } catch {
    // silent — PasswordRecoveryFlow already shows optimistic "sent" feedback
  }
}

async function handleNewPasswordSubmit(data: { token: string; newPassword: string }) {
  authError.value = ''
  resetLoading.value = true
  try {
    await authService.resetPassword({ token: data.token, new_password: data.newPassword })
    newPasswordDone.value = true
    router.replace({ query: {} })
  } catch (err: any) {
    authError.value = err.response?.data?.error || 'Link inválido ou expirado. Solicite um novo.'
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  padding: 20px;
}
.auth-top {
  display: flex;
  align-items: center;
  height: 56px;
  margin-bottom: 8px;
}
.back-btn {
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
}
.auth-brand {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 3px;
  color: var(--accent);
}
</style>
