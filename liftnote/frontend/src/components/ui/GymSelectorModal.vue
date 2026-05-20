<template>
  <BaseModal :modelValue="isOpen" @update:modelValue="val => emit('update:isOpen', val)" title="Selecionar Academia">
    <div class="gym-selector">
      <!-- Estado: sem localização ainda -->
      <div v-if="locationState === 'idle'" class="gym-detect">
        <p class="gym-hint">Detecte sua localização para ver as academias próximas, ou busque pelo nome da cidade.</p>
        <button class="btn btn-accent" style="width: 100%;" @click="detectLocation" :disabled="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>
          </svg>
          Usar minha localização
        </button>
        <div class="gym-or">ou</div>
        <div class="city-search-row">
          <input
            v-model="cityInput"
            type="text"
            placeholder="Ex: Presidente Prudente, SP"
            class="gym-input"
            @keyup.enter="searchByCity"
          />
          <button class="btn btn-ghost btn-sm" @click="searchByCity" :disabled="loading || !cityInput.trim()">
            Buscar
          </button>
        </div>
        <div class="gym-or">ou</div>
        <input
          v-model="manualGymName"
          type="text"
          placeholder="Não encontrei minha academia — digite o nome"
          class="gym-input"
          @keyup.enter="confirmManualGym"
        />
      </div>

      <!-- Carregando -->
      <div v-if="loading" class="gym-loading">
        <span class="spinner-btn" style="width: 20px; height: 20px;"></span>
        <span>Buscando academias...</span>
      </div>

      <!-- Erro -->
      <div v-if="errorMsg && !loading" class="gym-error">
        {{ errorMsg }}
        <button class="btn btn-ghost btn-sm" style="margin-top: 8px;" @click="reset">Tentar novamente</button>
      </div>

      <!-- Lista de academias -->
      <div v-if="!loading && gyms.length > 0" class="gym-list">
        <div class="gym-list-header">
          <span class="gym-count">{{ gyms.length }} academias encontradas</span>
          <button class="btn btn-ghost btn-sm" @click="reset" style="font-size: 11px;">Refazer busca</button>
        </div>

        <div
          v-for="gym in gyms"
          :key="gym.id"
          class="gym-item"
          :class="{ 'gym-item-selected': selectedGym?.id === gym.id }"
          @click="selectGym(gym)"
        >
          <div class="gym-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
          </div>
          <div class="gym-item-info">
            <div class="gym-item-name">{{ gym.name }}</div>
            <div class="gym-item-address">{{ gym.address }}</div>
          </div>
          <div v-if="selectedGym?.id === gym.id" class="gym-check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>



      <!-- Ações -->
      <div class="gym-actions">
        <button class="btn btn-ghost" @click="skipAndContinue">Pular</button>
        <button
          class="btn btn-accent"
          :disabled="!selectedGym && !manualGymName.trim()"
          @click="manualGymName.trim() ? confirmManualGym() : confirmSelection()"
        >
          Confirmar
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from './BaseModal.vue';
import { placesService } from '../../services/placesService';
import type { GymPlace } from '../../types';

defineProps<{ isOpen: boolean }>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'select', gym: GymPlace | null): void;
}>();

const locationState = ref<'idle' | 'located'>('idle');
const loading = ref(false);
const errorMsg = ref('');
const gyms = ref<GymPlace[]>([]);
const selectedGym = ref<GymPlace | null>(null);
const cityInput = ref('');
const manualGymName = ref('');

async function detectLocation() {
  if (!navigator.geolocation) {
    errorMsg.value = 'Geolocalização não suportada pelo navegador.';
    return;
  }

  loading.value = true;
  errorMsg.value = '';

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const results = await placesService.searchGyms({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        gyms.value = results;
        locationState.value = 'located';
        if (results.length === 0) {
          errorMsg.value = 'Nenhuma academia encontrada próxima à sua localização.';
        }
      } catch {
        errorMsg.value = 'Erro ao buscar academias. Tente pelo nome da cidade.';
      } finally {
        loading.value = false;
      }
    },
    () => {
      loading.value = false;
      errorMsg.value = 'Permissão de localização negada. Use a busca por cidade.';
    },
    { timeout: 10000 },
  );
}

async function searchByCity() {
  const city = cityInput.value.trim();
  if (!city) return;

  loading.value = true;
  errorMsg.value = '';
  gyms.value = [];

  try {
    const results = await placesService.searchGyms({ city });
    gyms.value = results;
    locationState.value = 'located';
    if (results.length === 0) {
      errorMsg.value = `Nenhuma academia encontrada em "${city}".`;
    }
  } catch {
    errorMsg.value = 'Erro ao buscar academias. Verifique o nome da cidade.';
  } finally {
    loading.value = false;
  }
}

function selectGym(gym: GymPlace) {
  selectedGym.value = selectedGym.value?.id === gym.id ? null : gym;
}

function confirmSelection() {
  emit('select', selectedGym.value);
  emit('update:isOpen', false);
}

function skipAndContinue() {
  emit('select', null);
  emit('update:isOpen', false);
}


function confirmManualGym() {
  const name = manualGymName.value.trim();
  if (!name) return;

  const manualGym: GymPlace = {
    id: 'manual',
    name,
    address: '',
    mapsUrl: null,
  };

  emit('select', manualGym);
  emit('update:isOpen', false);
}

function reset() {
  locationState.value = 'idle';
  gyms.value = [];
  selectedGym.value = null;
  errorMsg.value = '';
  cityInput.value = '';
  manualGymName.value = '';
}
</script>

<style scoped>
.gym-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 4px;
}

.gym-hint {
  font-size: 13px;
  color: var(--text2);
  margin: 0 0 12px;
  line-height: 1.5;
}

.gym-or {
  text-align: center;
  font-size: 12px;
  color: var(--text2);
  margin: 4px 0;
}

.city-search-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.gym-input {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.gym-input:focus {
  border-color: var(--accent);
}

.gym-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  padding: 16px 0;
  color: var(--text2);
  font-size: 14px;
}

.spinner-btn {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gym-error {
  font-size: 13px;
  color: var(--danger, #e74c3c);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.gym-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gym-count {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text2);
}

.gym-list {
  max-height: 280px;
  overflow-y: auto;
}

.gym-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.2s;
  margin-bottom: 6px;
  background: var(--surface);
}

.gym-item:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.gym-item-selected {
  border-color: var(--accent) !important;
  background: var(--accent-dim) !important;
}

.gym-item-icon {
  width: 36px;
  height: 36px;
  background: var(--bg4);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--accent);
}

.gym-item-info {
  flex: 1;
  min-width: 0;
}

.gym-item-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gym-item-address {
  font-size: 11px;
  color: var(--text2);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gym-check {
  color: var(--accent);
  flex-shrink: 0;
}

.gym-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}

.manual-gym-toggle {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--text2);
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}

.btn-link:hover {
  color: var(--accent);
}

.manual-gym-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: fadeSlideIn 0.2s ease;
}

.manual-gym-hint {
  font-size: 11px;
  color: var(--text2);
  margin: 0;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
