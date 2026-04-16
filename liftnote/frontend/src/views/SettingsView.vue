<template>
          <div>
            <div class="card" style="max-width: 520px">
              <h3>Perfil</h3>
              <div class="form-group">
                <label>Nome</label>
                <input v-model="editUser.name" />
              </div>
              <div class="form-group">
                <label>E-mail</label>
                <input v-model="editUser.email" type="email" />
              </div>
              <div class="form-group">
                <label>Idade</label>
                <input v-model.number="editUser.age" type="number" />
              </div>
              <div class="flex-end">
                <button class="btn btn-accent" @click="saveProfile">
                  Salvar perfil
                </button>
              </div>
            </div>

            <div class="card mt" style="max-width: 520px; margin-top: 16px">
              <h3>Alterar senha</h3>
              <div class="form-group">
                <label>Senha atual</label>
                <input
                  v-model="pwdForm.current"
                  type="password"
                  placeholder="••••••"
                />
              </div>
              <div class="form-group">
                <label>Nova senha</label>
                <input
                  v-model="pwdForm.new"
                  type="password"
                  placeholder="••••••"
                />
              </div>
              <div class="form-group">
                <label>Confirmar nova senha</label>
                <input
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
              <div class="flex-end">
                <button class="btn btn-accent" @click="changePassword">
                  Alterar senha
                </button>
              </div>
            </div>

            <div
              class="card mt"
              style="
                max-width: 520px;
                margin-top: 16px;
                border-color: rgba(255, 77, 77, 0.2);
              "
            >
              <h3 style="color: var(--red)">Zona de perigo</h3>
              <p
                style="
                  font-size: 12px;
                  color: var(--text2);
                  margin-bottom: 14px;
                "
              >
                Excluir conta remove permanentemente todos os seus dados.
              </p>
              <button class="btn btn-danger" @click="confirmDeleteAccount">
                Excluir minha conta
              </button>
            </div>
          </div>
  



</template>
<script setup>
import { ref } from 'vue';

const editUser = ref({ name: '', email: '', age: 0 });
const pwdForm = ref({ current: '', new: '', confirm: '' });
const pwdMsg = ref('');
const pwdMsgOk = ref(false);
const modal = ref(null);

function saveProfile() {}
function changePassword() {}
function confirmDeleteAccount() {}
</script>
