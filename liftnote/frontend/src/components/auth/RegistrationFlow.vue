<template>
  <div class="auth-content" v-if="step === 1">
    <div class="auth-header">
      <h1 class="auth-title">Criar conta</h1>
      <p class="auth-sub">Passo 1 de 2 — Informações de acesso.</p>
    </div>

    <div class="stepper">
      <div class="step active">
        <div class="step-num">1</div>
        <div class="step-label">Conta</div>
      </div>
      <div class="step-divider"></div>
      <div class="step">
        <div class="step-num inactive-num">2</div>
        <div class="step-label inactive-label">Perfil</div>
      </div>
    </div>

    <div class="form-group-icon">
      <label>Nome</label>
      <div class="input-with-icon">
        <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <input v-model="name" placeholder="Seu nome" />
      </div>
    </div>
    <div class="form-group-icon">
      <label>Email</label>
      <div class="input-with-icon">
        <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <input v-model="email" type="email" placeholder="seu@email.com" />
      </div>
    </div>
    <div class="form-group-icon">
      <label>Senha</label>
      <div class="input-with-icon">
        <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <input v-model="password" type="password" placeholder="Mín. 6 caracteres" />
      </div>
    </div>

    <div v-if="localError" class="error-msg">{{ localError }}</div>

    <div class="auth-bottom">
      <button class="btn btn-accent btn-large" @click="handleAdvanceStep">Continuar</button>
    </div>
  </div>

  <div class="auth-content" v-else>
    <div class="auth-header">
      <h1 class="auth-title">Criar conta</h1>
      <p class="auth-sub">Passo 2 de 2 — Informações do perfil.</p>
    </div>

    <div class="stepper">
      <div class="step completed" @click="$emit('back')" style="cursor: pointer">
        <div class="step-num">✓</div>
        <div class="step-label">Conta</div>
      </div>
      <div class="step-divider active-divider"></div>
      <div class="step active">
        <div class="step-num">2</div>
        <div class="step-label">Perfil</div>
      </div>
    </div>

    <div class="form-group-icon">
      <label>Idade (opcional)</label>
      <div class="input-with-icon">
        <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <input v-model.number="age" type="number" placeholder="25" />
      </div>
    </div>

    <div v-if="error" class="error-msg">{{ error }}</div>

    <div class="auth-bottom">
      <button class="btn btn-accent btn-large" @click="handleSubmit" :disabled="isLoading">
        {{ isLoading ? 'Criando conta...' : 'Criar conta' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  step: number
  error: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  advance: []
  submit: [data: { name: string; email: string; password: string; age?: number | null }]
  back: []
}>()

const name = ref('')
const email = ref('')
const password = ref('')
const age = ref<number | null>(null)
const localError = ref('')

function handleAdvanceStep() {
  localError.value = ''
  if (!name.value || !email.value || !password.value) {
    localError.value = 'Preencha todos os campos obrigatórios'
    return
  }
  if (password.value.length < 6) {
    localError.value = 'A senha deve ter no mínimo 6 caracteres'
    return
  }
  emit('advance')
}

function handleSubmit() {
  emit('submit', {
    name: name.value,
    email: email.value,
    password: password.value,
    age: age.value,
  })
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
.stepper {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}
.step {
  display: flex;
  align-items: center;
  gap: 8px;
}
.step-divider {
  flex: 1;
  height: 2px;
  background: var(--border2);
  margin: 0 12px;
}
.active-divider {
  background: var(--accent);
}
.step-num {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: var(--accent);
  color: #192126;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}
.inactive-num {
  background: var(--surface);
  color: var(--text2);
}
.step-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}
.inactive-label {
  color: var(--text2);
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
.error-msg {
  color: var(--red);
  font-size: 13px;
  margin-top: 8px;
  background: var(--red-dim);
  padding: 10px 14px;
  border-radius: 8px;
}
</style>
