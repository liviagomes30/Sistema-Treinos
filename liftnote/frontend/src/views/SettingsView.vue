<template>
  <div class="settings-page">
    <div class="topbar-settings">
      <div class="icon-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <h1 class="page-title">Settings</h1>
      <div style="width: 24px;"></div>
    </div>

    <!-- Perfil Section -->
    <div class="settings-section card">
      <div class="section-header">
        <div class="section-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <h3 class="section-title">Perfil</h3>
      </div>
      
      <div class="form-group-modern">
        <label>Nome</label>
        <input class="input-modern" v-model="editUser.name" />
      </div>
      <div class="form-group-modern">
        <label>E-mail</label>
        <input class="input-modern" v-model="editUser.email" type="email" />
      </div>
      <div class="form-group-modern">
        <label>Idade</label>
        <input class="input-modern" v-model.number="editUser.age" type="number" />
      </div>
      
      <div class="flex-end mt">
        <button class="btn btn-accent" style="width: 100%;" @click="saveProfile">
          Salvar perfil
        </button>
      </div>
    </div>

    <!-- Senha Section -->
    <div class="settings-section card mt">
      <div class="section-header">
        <div class="section-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
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
          placeholder="••••••"
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
        :style="{
          color: pwdMsgOk ? 'var(--accent)' : 'var(--red)',
          fontSize: '12px',
          marginTop: '6px',
        }"
      >
        {{ pwdMsg }}
      </div>
      
      <div class="flex-end mt">
        <button class="btn btn-accent" style="width: 100%;" @click="changePassword">
          Alterar senha
        </button>
      </div>
    </div>

    <!-- Danger Zone Section -->
    <div class="settings-section card mt danger-zone">
      <div class="section-header">
        <div class="section-icon danger-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <h3 class="section-title danger-text">Zona de perigo</h3>
      </div>

      <p class="danger-desc">
        Excluir conta remove permanentemente todos os seus dados.
      </p>
      
      <button class="btn btn-danger" style="width: 100%; margin-top: 8px;" @click="confirmDeleteAccount">
        Excluir minha conta
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/authStore';

const authStore = useAuthStore();
const editUser = ref({ name: '', email: '', age: 0 });
const pwdForm = ref({ current: '', new: '', confirm: '' });
const pwdMsg = ref('');
const pwdMsgOk = ref(false);

onMounted(() => {
  if (authStore.currentUser) {
    editUser.value.name = authStore.currentUser.name || '';
    editUser.value.email = authStore.currentUser.email || '';
    editUser.value.age = authStore.currentUser.age || 0;
  }
});

function saveProfile() {
  // Logic not fully implemented in snippet, kept placeholder
}
function changePassword() {
  // Logic not fully implemented in snippet, kept placeholder
}
function confirmDeleteAccount() {
  // Logic not fully implemented in snippet, kept placeholder
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
  padding-bottom: 80px;
  width: 100%;
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
}

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
}
.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.form-group-modern {
  margin-bottom: 16px;
}
.form-group-modern label {
  display: block;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
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
  margin-bottom: 16px;
  line-height: 1.4;
}
</style>
