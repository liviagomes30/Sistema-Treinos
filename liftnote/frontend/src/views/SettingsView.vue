<template>
  <div class="settings-page">
    <div class="topbar-settings">
      <div class="icon-btn" @click="$router.back()">
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
      <h1 class="page-title">Configurações</h1>
      <div style="width: 24px"></div>
    </div>

    <!-- Toast feedback -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition>

    <!-- Perfil -->
    <div class="settings-section card">
      <div class="section-header">
        <div class="section-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h3 class="section-title">Perfil</h3>
      </div>

      <div class="form-group-modern">
        <label>Nome</label>
        <input
          class="input-modern"
          v-model="editUser.name"
          placeholder="Seu nome"
        />
      </div>
      <div class="form-group-modern">
        <label>E-mail</label>
        <input
          class="input-modern"
          v-model="editUser.email"
          type="email"
          placeholder="seu@email.com"
        />
      </div>
      <div class="form-group-modern">
        <label>Idade</label>
        <input
          class="input-modern"
          v-model.number="editUser.age"
          type="number"
          placeholder="25"
          min="10"
          max="120"
        />
      </div>

      <button
        class="btn btn-accent mt"
        style="width: 100%"
        @click="saveProfile"
        :disabled="savingProfile"
      >
        {{ savingProfile ? "Salvando..." : "Salvar perfil" }}
      </button>
    </div>

    <!-- Alterar senha -->
    <div class="settings-section card mt">
      <div class="section-header">
        <div class="section-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3 class="section-title">Alterar senha</h3>
      </div>

      <div class="form-group-modern">
        <label>Senha atual</label>
        <input
          class="input-modern"
          v-model="pwdForm.current"
          type="password"
          placeholder="••••••"
        />
      </div>
      <div class="form-group-modern">
        <label>Nova senha</label>
        <input
          class="input-modern"
          v-model="pwdForm.new"
          type="password"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div class="form-group-modern">
        <label>Confirmar nova senha</label>
        <input
          class="input-modern"
          v-model="pwdForm.confirm"
          type="password"
          placeholder="••••••"
        />
      </div>

      <div
        v-if="pwdMsg"
        class="feedback-msg"
        :class="pwdMsgOk ? 'msg-ok' : 'msg-err'"
      >
        {{ pwdMsg }}
      </div>

      <button
        class="btn btn-accent mt"
        style="width: 100%"
        @click="changePassword"
        :disabled="savingPwd"
      >
        {{ savingPwd ? "Alterando..." : "Alterar senha" }}
      </button>
    </div>

    <!-- Logout -->
    <div class="settings-section card mt">
      <div class="section-header">
        <div class="section-icon logout-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <h3 class="section-title">Sessão</h3>
      </div>
      <p class="section-desc">
        Você está logado como <strong>{{ authStore.currentUser?.email }}</strong
        >.
      </p>
      <button class="btn btn-ghost mt" style="width: 100%" @click="doLogout">
        Sair da conta
      </button>
    </div>

    <!-- Zona de perigo -->
    <div class="settings-section card mt danger-zone">
      <div class="section-header">
        <div class="section-icon danger-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 class="section-title danger-text">Zona de perigo</h3>
      </div>
      <p class="danger-desc">
        Excluir conta remove permanentemente todos os seus dados. Esta ação não
        pode ser desfeita.
      </p>
      <button
        class="btn btn-danger mt"
        style="width: 100%"
        @click="showDeleteConfirm = true"
      >
        Excluir minha conta
      </button>
    </div>

    <!-- Modal confirmação de exclusão -->
    <div
      v-if="showDeleteConfirm"
      class="modal-overlay"
      @click.self="showDeleteConfirm = false"
    >
      <div class="modal-box">
        <h3 style="color: var(--red); margin-bottom: 12px">Excluir conta?</h3>
        <p
          style="
            font-size: 14px;
            color: var(--text2);
            margin-bottom: 20px;
            line-height: 1.6;
          "
        >
          Esta ação é irreversível. Todos os treinos, sessões e histórico serão
          apagados permanentemente.
        </p>
        <div style="display: flex; gap: 12px">
          <button
            class="btn btn-ghost"
            style="flex: 1"
            @click="showDeleteConfirm = false"
          >
            Cancelar
          </button>
          <button
            class="btn btn-danger"
            style="flex: 1"
            @click="confirmDeleteAccount"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";

const router = useRouter();
const authStore = useAuthStore();

const editUser = ref({ name: "", email: "", age: 0 });
const pwdForm = ref({ current: "", new: "", confirm: "" });
const pwdMsg = ref("");
const pwdMsgOk = ref(false);
const savingProfile = ref(false);
const savingPwd = ref(false);
const showDeleteConfirm = ref(false);

const toast = ref({ show: false, message: "", type: "ok" });

onMounted(() => {
  if (authStore.currentUser) {
    editUser.value.name = authStore.currentUser.name || "";
    editUser.value.email = authStore.currentUser.email || "";
    editUser.value.age = (authStore.currentUser as any).age || 0;
  }
});

function showToast(message: string, type: "ok" | "err" = "ok") {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

async function saveProfile() {
  if (!editUser.value.name || !editUser.value.email) {
    showToast("Preencha nome e e-mail.", "err");
    return;
  }
  savingProfile.value = true;
  try {
    const res = await api.put("/users/me", {
      name: editUser.value.name,
      email: editUser.value.email,
      age: editUser.value.age || undefined,
    });
    // Atualiza o store e localStorage com os dados novos
    const updatedUser = { ...authStore.currentUser, ...res.data };
    authStore.currentUser = updatedUser as any;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    showToast("Perfil salvo com sucesso!");
  } catch (err: any) {
    showToast(err.response?.data?.error || "Erro ao salvar perfil.", "err");
  } finally {
    savingProfile.value = false;
  }
}

async function changePassword() {
  pwdMsg.value = "";
  if (!pwdForm.value.current || !pwdForm.value.new || !pwdForm.value.confirm) {
    pwdMsg.value = "Preencha todos os campos.";
    pwdMsgOk.value = false;
    return;
  }
  if (pwdForm.value.new.length < 6) {
    pwdMsg.value = "A nova senha deve ter pelo menos 6 caracteres.";
    pwdMsgOk.value = false;
    return;
  }
  if (pwdForm.value.new !== pwdForm.value.confirm) {
    pwdMsg.value = "As senhas não coincidem.";
    pwdMsgOk.value = false;
    return;
  }
  savingPwd.value = true;
  try {
    await api.put("/users/me/password", {
      current_password: pwdForm.value.current,
      new_password: pwdForm.value.new,
    });
    pwdMsg.value = "Senha alterada com sucesso!";
    pwdMsgOk.value = true;
    pwdForm.value = { current: "", new: "", confirm: "" };
  } catch (err: any) {
    pwdMsg.value = err.response?.data?.error || "Erro ao alterar senha.";
    pwdMsgOk.value = false;
  } finally {
    savingPwd.value = false;
  }
}

function doLogout() {
  authStore.logout();
  router.push("/auth");
}

async function confirmDeleteAccount() {
  try {
    await api.delete("/users/me");
    authStore.logout();
    router.push("/auth");
  } catch (err: any) {
    showDeleteConfirm.value = false;
    showToast(err.response?.data?.error || "Erro ao excluir conta.", "err");
  }
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
  padding-bottom: calc(96px + env(safe-area-inset-bottom) + 16px);
  width: 100%;
  position: relative;
}

.topbar-settings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
}
.icon-btn {
  cursor: pointer;
  color: var(--text);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  transition: background 0.2s;
}
.icon-btn:hover {
  background: var(--surface);
}

/* Toast */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
.toast.ok {
  background: var(--accent);
  color: #192126;
}
.toast.err {
  background: var(--red);
  color: #fff;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* Sections */
.settings-section {
  padding: 24px 20px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: var(--accent-dim);
  border: 1px solid rgba(187, 242, 70, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}
.logout-icon {
  background: rgba(77, 166, 255, 0.12);
  color: var(--blue);
}
.section-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}
.section-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
  margin-bottom: 4px;
}

/* Form */
.form-group-modern {
  margin-bottom: 16px;
}
.form-group-modern label {
  display: block;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.input-modern {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--r);
  padding: 12px 16px;
  color: var(--text);
  font-size: 14px;
  font-family: var(--font);
  outline: none;
  transition: border-color 0.15s;
}
.input-modern:focus {
  border-color: var(--accent);
}
.input-modern::placeholder {
  color: var(--text3);
}

.feedback-msg {
  font-size: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
}
.msg-ok {
  color: var(--accent);
  background: var(--accent-dim);
}
.msg-err {
  color: var(--red);
  background: var(--red-dim);
}

/* Danger */
.danger-zone {
  border-color: rgba(237, 71, 71, 0.3);
}
.danger-icon {
  background: rgba(237, 71, 71, 0.15);
  color: var(--red);
}
.danger-text {
  color: var(--red);
}
.danger-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}
.modal-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 340px;
}

.mt {
  margin-top: 12px;
}
</style>
