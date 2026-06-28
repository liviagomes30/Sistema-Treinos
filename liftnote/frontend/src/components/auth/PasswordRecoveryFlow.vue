<template>
  <div class="auth-content" v-if="mode === 'reset'">
    <div class="auth-header">
      <h1 class="auth-title">Recuperar senha</h1>
      <p class="auth-sub">Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>
    </div>

    <div v-if="!resetSent">
      <div class="form-group-icon">
        <label>Email</label>
        <div class="input-with-icon">
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input v-model="email" type="email" placeholder="seu@email.com" @keyup.enter="handleResetRequest" />
        </div>
      </div>

      <div v-if="localError" class="error-msg">{{ localError }}</div>

      <div class="auth-bottom">
        <button class="btn btn-accent btn-large" @click="handleResetRequest" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Enviar link de recuperação' }}
        </button>
        <div class="auth-footer-links">
          <a class="auth-link" @click="$emit('goLogin')">← Voltar ao login</a>
        </div>
      </div>
    </div>

    <div v-else class="reset-sent-box">
      <div class="reset-sent-icon">📬</div>
      <h2 class="reset-sent-title">E-mail enviado!</h2>
      <p class="reset-sent-desc">
        Se <strong>{{ email }}</strong> estiver cadastrado, você receberá as instruções em breve.<br /><br />
        Verifique também a caixa de spam.
      </p>
      <button class="btn btn-ghost btn-large mt" @click="$emit('goLogin')">Voltar ao login</button>
    </div>
  </div>

  <div class="auth-content" v-else-if="mode === 'new-password'">
    <div class="auth-header">
      <h1 class="auth-title">Nova senha</h1>
      <p class="auth-sub">Digite e confirme sua nova senha.</p>
    </div>

    <div v-if="!newPasswordDone">
      <div class="form-group-icon">
        <label>Nova senha</label>
        <div class="input-with-icon">
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input v-model="newPassword" type="password" placeholder="Mín. 6 caracteres" />
        </div>
      </div>
      <div class="form-group-icon">
        <label>Confirmar nova senha</label>
        <div class="input-with-icon">
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input v-model="confirmPassword" type="password" placeholder="Repita a senha" />
        </div>
      </div>

      <div v-if="displayError" class="error-msg">{{ displayError }}</div>

      <div class="auth-bottom">
        <button class="btn btn-accent btn-large" @click="handleNewPasswordSubmit" :disabled="isLoading">
          {{ isLoading ? 'Salvando...' : 'Salvar nova senha' }}
        </button>
      </div>
    </div>

    <div v-else class="reset-sent-box">
      <div class="reset-sent-icon">✅</div>
      <h2 class="reset-sent-title">Senha redefinida!</h2>
      <p class="reset-sent-desc">Sua senha foi alterada com sucesso.</p>
      <button class="btn btn-accent btn-large mt" @click="$emit('goLogin')">Fazer login</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  mode: string
  resetToken: string
  error: string
  isLoading: boolean
  newPasswordDone?: boolean
}>()

const emit = defineEmits<{
  submitResetRequest: [email: string]
  submitNewPassword: [data: { token: string; newPassword: string }]
  goLogin: []
}>()

const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const localError = ref('')
const resetSent = ref(false)

const displayError = computed(() => localError.value || props.error)

function handleResetRequest() {
  localError.value = ''
  if (!email.value) {
    localError.value = 'Informe seu e-mail'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    localError.value = 'E-mail inválido'
    return
  }
  resetSent.value = true
  emit('submitResetRequest', email.value)
}

function handleNewPasswordSubmit() {
  localError.value = ''
  if (!newPassword.value || !confirmPassword.value) {
    localError.value = 'Preencha os dois campos'
    return
  }
  if (newPassword.value.length < 6) {
    localError.value = 'A senha deve ter no mínimo 6 caracteres'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'As senhas não coincidem'
    return
  }
  emit('submitNewPassword', { token: props.resetToken, newPassword: newPassword.value })
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
.reset-sent-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}
.reset-sent-icon {
  font-size: 52px;
  margin-bottom: 20px;
}
.reset-sent-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
}
.reset-sent-desc {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.7;
}
.mt {
  margin-top: 20px;
}
</style>
