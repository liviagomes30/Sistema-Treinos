<template>
  <div class="auth-content">
    <div class="auth-header">
      <h1 class="auth-title">Bem-vindo de volta</h1>
      <p class="auth-sub">Faça login para continuar.</p>
    </div>

    <div class="form-group-icon">
      <label>Email</label>
      <div class="input-with-icon">
        <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <input v-model="email" type="email" placeholder="seu@email.com" @keyup.enter="handleSubmit" />
      </div>
    </div>

    <div class="form-group-icon">
      <label>Senha</label>
      <div class="input-with-icon">
        <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="handleSubmit" />
      </div>
    </div>

    <div v-if="displayError" class="error-msg">{{ displayError }}</div>

    <div class="auth-bottom">
      <button class="btn btn-accent btn-large" @click="handleSubmit" :disabled="isLoading">
        {{ isLoading ? 'Entrando...' : 'Entrar' }}
      </button>
      <div class="auth-footer-links">
        Não tem conta?
        <a class="auth-link" @click="$emit('goRegister')">Cadastre-se</a>
        ·
        <a class="auth-link" @click="$emit('forgotPassword')">Esqueci a senha</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  error: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  submit: [data: { email: string; password: string }]
  goRegister: []
  forgotPassword: []
}>()

const email = ref('')
const password = ref('')
const localError = ref('')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const displayError = computed(() => localError.value || props.error)

function handleSubmit() {
  localError.value = ''
  if (!email.value || !password.value) {
    localError.value = 'Preencha todos os campos'
    return
  }
  if (!emailRegex.test(email.value)) {
    localError.value = 'E-mail inválido'
    return
  }
  emit('submit', { email: email.value, password: password.value })
}
</script>

<style scoped>
.auth-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.auth-header {
  margin-bottom: 32px;
}
.auth-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 6px;
}
.auth-sub {
  color: var(--text2);
  font-size: 14px;
  line-height: 1.5;
}
.form-group-icon {
  margin-bottom: 16px;
}
.form-group-icon label {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
  display: block;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.icon-left {
  position: absolute;
  left: 14px;
  color: var(--text3);
  pointer-events: none;
}
.input-with-icon input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--r);
  padding: 13px 14px 13px 42px;
  color: var(--text);
  font-size: 14px;
  outline: none;
  font-family: var(--font);
  transition: border-color 0.15s;
}
.input-with-icon input:focus {
  border-color: var(--accent);
}
.input-with-icon input::placeholder {
  color: var(--text3);
}
.auth-bottom {
  margin-top: auto;
  padding-top: 24px;
  padding-bottom: max(32px, env(safe-area-inset-bottom));
}
.auth-footer-links {
  text-align: center;
  font-size: 13px;
  color: var(--text2);
  margin-top: 16px;
  line-height: 2;
}
.auth-link {
  color: var(--accent);
  font-weight: 700;
  cursor: pointer;
}
.error-msg {
  color: var(--red);
  font-size: 13px;
  margin-top: 8px;
  background: var(--red-dim);
  padding: 10px 14px;
  border-radius: 8px;
}
</style>
