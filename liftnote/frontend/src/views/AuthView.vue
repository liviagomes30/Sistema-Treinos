<template>
  <div
    class="auth-page"
    style="
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
    "
  >
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon">LN</div>
        <div class="auth-title">LIFTNOTE</div>
        <div class="auth-sub">Track. Train. Evolve.</div>
      </div>

      <!-- Login -->
      <template v-if="authView === 'login'">
        <div class="form-group">
          <label>E-mail</label>
          <input
            v-model="authForm.email"
            type="email"
            placeholder="seu@email.com"
            @keyup.enter="doLogin"
          />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input
            v-model="authForm.password"
            type="password"
            placeholder="••••••••"
            @keyup.enter="doLogin"
          />
        </div>
        <div v-if="authError" class="error-msg">{{ authError }}</div>
        <button
          class="btn btn-accent"
          style="width: 100%; margin-top: 8px; justify-content: center"
          @click="doLogin"
        >
          Entrar
        </button>
        <div class="auth-divider">
          Não tem conta?
          <a class="auth-link" @click="authView = 'register'">Cadastre-se</a>
          &nbsp;·&nbsp;
          <a class="auth-link" @click="authView = 'reset'">Esqueci a senha</a>
        </div>
      </template>

      <!-- Register -->
      <template v-else-if="authView === 'register'">
        <div class="form-group">
          <label>Nome completo</label>
          <input v-model="authForm.name" placeholder="João Silva" />
        </div>
        <div class="form-group">
          <label>E-mail</label>
          <input
            v-model="authForm.email"
            type="email"
            placeholder="seu@email.com"
          />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input
            v-model="authForm.password"
            type="password"
            placeholder="mínimo 6 caracteres"
          />
        </div>
        <div class="form-group">
          <label>Idade (opcional)</label>
          <input v-model.number="authForm.age" type="number" placeholder="20" />
        </div>
        <div v-if="authError" class="error-msg">{{ authError }}</div>
        <button
          class="btn btn-accent"
          style="width: 100%; margin-top: 8px; justify-content: center"
          @click="doRegister"
        >
          Criar conta
        </button>
        <div class="auth-divider">
          Já tem conta?
          <a class="auth-link" @click="authView = 'login'">Entrar</a>
        </div>
      </template>

      <!-- Reset Password -->
      <template v-else>
        <p style="font-size: 13px; color: var(--text2); margin-bottom: 16px">
          Informe seu e-mail para receber as instruções de redefinição de senha.
        </p>
        <div class="form-group">
          <label>E-mail</label>
          <input
            v-model="authForm.email"
            type="email"
            placeholder="seu@email.com"
          />
        </div>
        <div v-if="authError" class="error-msg">{{ authError }}</div>
        <div
          v-if="resetSent"
          style="color: var(--accent); font-size: 12px; margin-top: 8px"
        >
          ✓ Link enviado para {{ authForm.email }}
        </div>
        <button
          class="btn btn-accent"
          style="width: 100%; margin-top: 8px; justify-content: center"
          @click="doReset"
        >
          Enviar link
        </button>
        <div class="auth-divider">
          <a class="auth-link" @click="authView = 'login'">← Voltar ao login</a>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";

const router = useRouter();
const authStore = useAuthStore();

const authView = ref("login");
const authError = ref("");
const resetSent = ref(false);
const authForm = ref({ name: "", email: "", password: "", age: null });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doLogin() {
  authError.value = "";
  if (!authForm.value.email || !authForm.value.password) {
    authError.value = "Preencha todos os campos";
    return;
  }
  if (!emailRegex.test(authForm.value.email)) {
    authError.value = "E-mail inválido";
    return;
  }
  // Mock login success
  authStore.login({
    _id: "u1",
    name: "João",
    email: authForm.value.email,
    age: 28,
  });
  router.push("/");
}

function doRegister() {
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
  // Mock register success
  authStore.login({
    _id: "u2",
    name: authForm.value.name,
    email: authForm.value.email,
    age: authForm.value.age,
  });
  router.push("/");
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
