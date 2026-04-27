<template>
  <div class="auth-page">
    <!-- Header -->
    <div class="auth-top">
      <div class="back-btn" @click="goBack" v-if="authView !== 'login'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <div class="auth-brand" v-if="authView === 'login'">
        <span>LIFTNOTE</span>
      </div>
    </div>

    <!-- Login -->
    <div class="auth-content" v-if="authView === 'login'">
      <div class="auth-header">
        <h1 class="auth-title">Bem-vindo de volta</h1>
        <p class="auth-sub">Faça login para continuar.</p>
      </div>

      <div class="form-group-icon">
        <label>Email</label>
        <div class="input-with-icon">
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <input v-model="authForm.email" type="email" placeholder="seu@email.com" @keyup.enter="doLogin" />
        </div>
      </div>

      <div class="form-group-icon">
        <label>Senha</label>
        <div class="input-with-icon">
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <input v-model="authForm.password" type="password" placeholder="••••••••" @keyup.enter="doLogin" />
        </div>
      </div>

      <div v-if="authError" class="error-msg">{{ authError }}</div>

      <div class="auth-bottom">
        <button class="btn btn-accent btn-large" @click="doLogin">Entrar</button>
        <div class="auth-footer-links">
          Não tem conta?
          <a class="auth-link" @click="authView = 'register'; registerStep = 1">Cadastre-se</a>
          · <a class="auth-link" @click="authView = 'reset'">Esqueci a senha</a>
        </div>
      </div>
    </div>

    <!-- Register Step 1 -->
    <div class="auth-content" v-else-if="authView === 'register' && registerStep === 1">
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
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <input v-model="authForm.name" placeholder="Seu nome" />
        </div>
      </div>

      <div class="form-group-icon">
        <label>Email</label>
        <div class="input-with-icon">
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <input v-model="authForm.email" type="email" placeholder="seu@email.com" />
        </div>
      </div>

      <div class="form-group-icon">
        <label>Senha</label>
        <div class="input-with-icon">
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <input v-model="authForm.password" type="password" placeholder="Mín. 6 caracteres" />
        </div>
      </div>

      <div v-if="authError" class="error-msg">{{ authError }}</div>

      <div class="auth-bottom">
        <button class="btn btn-accent btn-large" @click="nextStep">Continuar</button>
      </div>
    </div>

    <!-- Register Step 2 -->
    <div class="auth-content" v-else-if="authView === 'register' && registerStep === 2">
      <div class="auth-header">
        <h1 class="auth-title">Criar conta</h1>
        <p class="auth-sub">Passo 2 de 2 — Informações do perfil.</p>
      </div>

      <div class="stepper">
        <div class="step completed" @click="registerStep = 1" style="cursor: pointer;">
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
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <input v-model.number="authForm.age" type="number" placeholder="25" />
        </div>
      </div>

      <div v-if="authError" class="error-msg">{{ authError }}</div>

      <div class="auth-bottom">
        <button class="btn btn-accent btn-large" @click="doRegister">Criar conta</button>
      </div>
    </div>

    <!-- Reset Password -->
    <div class="auth-content" v-else>
      <div class="auth-header">
        <h1 class="auth-title">Recuperar senha</h1>
        <p class="auth-sub">Informe seu e-mail para receber instruções.</p>
      </div>

      <div class="form-group-icon">
        <label>Email</label>
        <div class="input-with-icon">
          <svg class="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <input v-model="authForm.email" type="email" placeholder="seu@email.com" />
        </div>
      </div>

      <div v-if="authError" class="error-msg">{{ authError }}</div>
      <div v-if="resetSent" class="success-msg">
        ✓ Link enviado para {{ authForm.email }}
      </div>

      <div class="auth-bottom">
        <button class="btn btn-accent btn-large" @click="doReset">Enviar link</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";

const router = useRouter();
const authStore = useAuthStore();

const authView = ref("login");
const registerStep = ref(1);
const authError = ref("");
const resetSent = ref(false);
const authForm = ref({ name: "", email: "", password: "", age: null });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function goBack() {
  if (authView.value === 'register' && registerStep.value === 2) {
    registerStep.value = 1;
  } else {
    authView.value = 'login';
  }
}

async function doLogin() {
  authError.value = "";
  if (!authForm.value.email || !authForm.value.password) {
    authError.value = "Preencha todos os campos";
    return;
  }
  if (!emailRegex.test(authForm.value.email)) {
    authError.value = "E-mail inválido";
    return;
  }
  try {
    await authStore.login({
      email: authForm.value.email,
      password: authForm.value.password
    });
    router.push("/");
  } catch (err: any) {
    authError.value = authStore.error || "Erro ao entrar";
  }
}

function nextStep() {
  authError.value = "";
  if (!authForm.value.name || !authForm.value.email || !authForm.value.password) {
    authError.value = "Preencha todos os campos obrigatórios";
    return;
  }
  if (authForm.value.password.length < 6) {
    authError.value = "A senha deve ter no mínimo 6 caracteres";
    return;
  }
  registerStep.value = 2;
}

async function doRegister() {
  authError.value = "";
  try {
    await authStore.register({
      name: authForm.value.name,
      email: authForm.value.email,
      password: authForm.value.password
    });
    router.push("/");
  } catch (err: any) {
    authError.value = authStore.error || "Erro ao criar conta";
  }
}

function doReset() {
  authError.value = "";
  resetSent.value = false;
  if (!authForm.value.email) {
    authError.value = "Informe seu e-mail";
    return;
  }
  resetSent.value = true;
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
  position: relative;
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
  letter-spacing: 2px;
  color: var(--accent);
}

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
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  gap: 0;
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

/* Inputs */
.form-group-icon {
  margin-bottom: 16px;
}

.form-group-icon label {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
  display: block;
  font-weight: 600;
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
  padding-bottom: 8px;
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

.success-msg {
  color: var(--accent);
  font-size: 13px;
  margin-top: 8px;
  text-align: center;
  font-weight: 600;
}
</style>
