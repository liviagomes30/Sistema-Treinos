<template>
  <div class="auth-page">
    <!-- Header -->
    <div class="auth-top">
      <div class="back-btn" @click="goBack" v-if="authView !== 'login'">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </div>
      <div class="auth-brand" v-if="authView === 'login'">LIFTNOTE</div>
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
          <svg
            class="icon-left"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            ></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input
            v-model="authForm.email"
            type="email"
            placeholder="seu@email.com"
            @keyup.enter="doLogin"
          />
        </div>
      </div>

      <div class="form-group-icon">
        <label>Senha</label>
        <div class="input-with-icon">
          <svg
            class="icon-left"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input
            v-model="authForm.password"
            type="password"
            placeholder="••••••••"
            @keyup.enter="doLogin"
          />
        </div>
      </div>

      <div v-if="authError" class="error-msg">{{ authError }}</div>

      <div class="auth-bottom">
        <button
          class="btn btn-accent btn-large"
          @click="doLogin"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? "Entrando..." : "Entrar" }}
        </button>
        <div class="auth-footer-links">
          Não tem conta?
          <a
            class="auth-link"
            @click="
              authView = 'register';
              registerStep = 1;
            "
            >Cadastre-se</a
          >
          ·
          <a class="auth-link" @click="authView = 'reset'">Esqueci a senha</a>
        </div>
      </div>
    </div>

    <!-- Register Step 1 -->
    <div
      class="auth-content"
      v-else-if="authView === 'register' && registerStep === 1"
    >
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
          <svg
            class="icon-left"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <input v-model="authForm.name" placeholder="Seu nome" />
        </div>
      </div>
      <div class="form-group-icon">
        <label>Email</label>
        <div class="input-with-icon">
          <svg
            class="icon-left"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            ></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input
            v-model="authForm.email"
            type="email"
            placeholder="seu@email.com"
          />
        </div>
      </div>
      <div class="form-group-icon">
        <label>Senha</label>
        <div class="input-with-icon">
          <svg
            class="icon-left"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input
            v-model="authForm.password"
            type="password"
            placeholder="Mín. 6 caracteres"
          />
        </div>
      </div>

      <div v-if="authError" class="error-msg">{{ authError }}</div>

      <div class="auth-bottom">
        <button class="btn btn-accent btn-large" @click="nextStep">
          Continuar
        </button>
      </div>
    </div>

    <!-- Register Step 2 -->
    <div
      class="auth-content"
      v-else-if="authView === 'register' && registerStep === 2"
    >
      <div class="auth-header">
        <h1 class="auth-title">Criar conta</h1>
        <p class="auth-sub">Passo 2 de 2 — Informações do perfil.</p>
      </div>

      <div class="stepper">
        <div
          class="step completed"
          @click="registerStep = 1"
          style="cursor: pointer"
        >
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
          <svg
            class="icon-left"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <input v-model.number="authForm.age" type="number" placeholder="25" />
        </div>
      </div>

      <div v-if="authError" class="error-msg">{{ authError }}</div>

      <div class="auth-bottom">
        <button
          class="btn btn-accent btn-large"
          @click="doRegister"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? "Criando conta..." : "Criar conta" }}
        </button>
      </div>
    </div>

    <!-- Esqueci a senha — solicitar link -->
    <div class="auth-content" v-else-if="authView === 'reset'">
      <div class="auth-header">
        <h1 class="auth-title">Recuperar senha</h1>
        <p class="auth-sub">
          Informe seu e-mail e enviaremos um link para criar uma nova senha.
        </p>
      </div>

      <div v-if="!resetSent">
        <div class="form-group-icon">
          <label>Email</label>
          <div class="input-with-icon">
            <svg
              class="icon-left"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              ></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input
              v-model="authForm.email"
              type="email"
              placeholder="seu@email.com"
              @keyup.enter="doReset"
            />
          </div>
        </div>

        <div v-if="authError" class="error-msg">{{ authError }}</div>

        <div class="auth-bottom">
          <button
            class="btn btn-accent btn-large"
            @click="doReset"
            :disabled="resetLoading"
          >
            {{ resetLoading ? "Enviando..." : "Enviar link de recuperação" }}
          </button>
          <div class="auth-footer-links">
            <a class="auth-link" @click="authView = 'login'"
              >← Voltar ao login</a
            >
          </div>
        </div>
      </div>

      <!-- Feedback pós-envio -->
      <div v-else class="reset-sent-box">
        <div class="reset-sent-icon">📬</div>
        <h2 class="reset-sent-title">E-mail enviado!</h2>
        <p class="reset-sent-desc">
          Se <strong>{{ authForm.email }}</strong> estiver cadastrado, você
          receberá as instruções em breve.<br /><br />
          Verifique também a caixa de spam.
        </p>
        <button
          class="btn btn-ghost btn-large mt"
          @click="
            authView = 'login';
            resetSent = false;
          "
        >
          Voltar ao login
        </button>
      </div>
    </div>

    <!-- Nova senha — chegou pelo link do e-mail (?reset=TOKEN) -->
    <div class="auth-content" v-else-if="authView === 'new-password'">
      <div class="auth-header">
        <h1 class="auth-title">Nova senha</h1>
        <p class="auth-sub">Digite e confirme sua nova senha.</p>
      </div>

      <div v-if="!newPasswordDone">
        <div class="form-group-icon">
          <label>Nova senha</label>
          <div class="input-with-icon">
            <svg
              class="icon-left"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              v-model="newPwdForm.password"
              type="password"
              placeholder="Mín. 6 caracteres"
            />
          </div>
        </div>
        <div class="form-group-icon">
          <label>Confirmar nova senha</label>
          <div class="input-with-icon">
            <svg
              class="icon-left"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              v-model="newPwdForm.confirm"
              type="password"
              placeholder="Repita a senha"
            />
          </div>
        </div>

        <div v-if="authError" class="error-msg">{{ authError }}</div>

        <div class="auth-bottom">
          <button
            class="btn btn-accent btn-large"
            @click="doNewPassword"
            :disabled="resetLoading"
          >
            {{ resetLoading ? "Salvando..." : "Salvar nova senha" }}
          </button>
        </div>
      </div>

      <!-- Sucesso -->
      <div v-else class="reset-sent-box">
        <div class="reset-sent-icon">✅</div>
        <h2 class="reset-sent-title">Senha redefinida!</h2>
        <p class="reset-sent-desc">Sua senha foi alterada com sucesso.</p>
        <button class="btn btn-accent btn-large mt" @click="authView = 'login'">
          Fazer login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const authView = ref("login");
const registerStep = ref(1);
const authError = ref("");
const resetSent = ref(false);
const resetLoading = ref(false);
const newPasswordDone = ref(false);
const resetToken = ref("");

const authForm = ref({
  name: "",
  email: "",
  password: "",
  age: null as number | null,
});
const newPwdForm = ref({ password: "", confirm: "" });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

onMounted(() => {
  // Se vier com ?reset=TOKEN na URL, vai direto para a tela de nova senha
  const token = route.query.reset as string;
  if (token) {
    resetToken.value = token;
    authView.value = "new-password";
  }
});

function goBack() {
  authError.value = "";
  if (authView.value === "register" && registerStep.value === 2) {
    registerStep.value = 1;
  } else {
    authView.value = "login";
    resetSent.value = false;
    newPasswordDone.value = false;
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
      password: authForm.value.password,
    });
    router.push("/");
  } catch {
    authError.value = authStore.error || "Erro ao entrar";
  }
}

function nextStep() {
  authError.value = "";
  if (
    !authForm.value.name ||
    !authForm.value.email ||
    !authForm.value.password
  ) {
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
      password: authForm.value.password,
    });
    router.push("/");
  } catch {
    authError.value = authStore.error || "Erro ao criar conta";
  }
}

async function doReset() {
  authError.value = "";
  if (!authForm.value.email) {
    authError.value = "Informe seu e-mail";
    return;
  }
  if (!emailRegex.test(authForm.value.email)) {
    authError.value = "E-mail inválido";
    return;
  }
  resetLoading.value = true;
  try {
    await authService.forgotPassword(authForm.value.email);
    resetSent.value = true;
  } catch {
    // Mesmo com erro (ex: e-mail não encontrado), mostra feedback genérico por segurança
    resetSent.value = true;
  } finally {
    resetLoading.value = false;
  }
}

async function doNewPassword() {
  authError.value = "";
  if (!newPwdForm.value.password || !newPwdForm.value.confirm) {
    authError.value = "Preencha os dois campos";
    return;
  }
  if (newPwdForm.value.password.length < 6) {
    authError.value = "A senha deve ter no mínimo 6 caracteres";
    return;
  }
  if (newPwdForm.value.password !== newPwdForm.value.confirm) {
    authError.value = "As senhas não coincidem";
    return;
  }
  resetLoading.value = true;
  try {
    await authService.resetPassword({
      token: resetToken.value,
      new_password: newPwdForm.value.password,
    });
    newPasswordDone.value = true;
    // Remove o token da URL
    router.replace({ query: {} });
  } catch (err: any) {
    authError.value =
      err.response?.data?.error ||
      "Link inválido ou expirado. Solicite um novo.";
  } finally {
    resetLoading.value = false;
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

/* Stepper */
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

.error-msg {
  color: var(--red);
  font-size: 13px;
  margin-top: 8px;
  background: var(--red-dim);
  padding: 10px 14px;
  border-radius: 8px;
}

/* Reset sent / success */
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
