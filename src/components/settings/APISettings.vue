<template>
  <div class="api-settings glass">
    <div class="section-title">🔌 文本 API 配置</div>

    <!-- 文本 Provider -->
    <div class="provider-tabs">
      <button
        v-for="p in providers"
        :key="p.key"
        class="provider-tab"
        :class="{ active: settings.provider === p.key }"
        @click="switchProvider(p.key)"
      >{{ p.name }}</button>
    </div>

    <div class="setting-row">
      <label>API Key</label>
      <input
        v-model="apiKey"
        type="password"
        :placeholder="currentProvider?.keyPlaceholder || 'sk-...'"
        class="setting-input"
      />
    </div>

    <template v-if="settings.provider === 'custom'">
      <div class="setting-row">
        <label>端点 URL</label>
        <input v-model="settings.customEndpoint" type="text" placeholder="https://..." class="setting-input" />
      </div>
      <div class="setting-row">
        <label>模型名</label>
        <input v-model="settings.customModel" type="text" placeholder="model-name" class="setting-input" />
      </div>
    </template>

    <button class="btn-save" @click="saveText">保存文本 API</button>

    <!-- 图片 Provider -->
    <div class="section-title" style="margin-top:20px">🖼️ 图片 API 配置</div>
    <div class="provider-tabs">
      <button
        v-for="p in imageProviders"
        :key="p.key"
        class="provider-tab"
        :class="{ active: settings.imageProvider === p.key }"
        @click="settings.imageProvider = p.key"
      >{{ p.name }}</button>
    </div>

    <div class="setting-row">
      <label>图片 API Key</label>
      <input
        v-model="imageApiKey"
        type="password"
        :placeholder="currentImageProvider?.keyPlaceholder || 'sk-...'"
        class="setting-input"
      />
    </div>

    <template v-if="settings.imageProvider === 'custom'">
      <div class="setting-row">
        <label>图片端点 URL</label>
        <input v-model="settings.imageEndpoint" type="text" placeholder="https://..." class="setting-input" />
      </div>
    </template>

    <button class="btn-save" @click="saveImage">保存图片 API</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAISettings, setAISettings } from '../../services/storage.js'
import { getProviderList, getImageProviderList } from '../../services/aiService.js'
import { useToast } from '../../composables/useToast.js'

const { showToast } = useToast()
const providers = getProviderList()
const imageProviders = getImageProviderList()
const settings = ref(getAISettings())

const apiKey = computed({
  get: () => settings.value.apiKeys?.[settings.value.provider] || '',
  set: (v) => {
    if (!settings.value.apiKeys) settings.value.apiKeys = {}
    settings.value.apiKeys[settings.value.provider] = v
  },
})

const imageApiKey = computed({
  get: () => settings.value.imageApiKeys?.[settings.value.imageProvider] || '',
  set: (v) => {
    if (!settings.value.imageApiKeys) settings.value.imageApiKeys = {}
    settings.value.imageApiKeys[settings.value.imageProvider] = v
  },
})

const currentProvider = computed(() => providers.find(p => p.key === settings.value.provider))
const currentImageProvider = computed(() => imageProviders.find(p => p.key === settings.value.imageProvider))

function switchProvider(key) {
  settings.value.provider = key
}

function saveText() {
  setAISettings(settings.value)
  showToast('文本 API 已保存')
}

function saveImage() {
  setAISettings(settings.value)
  showToast('图片 API 已保存')
}
</script>

<style scoped>
.api-settings { border-radius: 18px; padding: 16px; }

.section-title {
  font-size: 14px;
  font-weight: 800;
  color: #F9FAFB;
  margin-bottom: 12px;
}

.provider-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.provider-tab {
  padding: 6px 12px;
  border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #9CA3AF;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 36px;
}

.provider-tab.active {
  border-color: #FF7A00;
  background: rgba(255,122,0,0.12);
  color: #FF7A00;
}

.setting-row { margin-bottom: 10px; }

.setting-row label {
  display: block;
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 600;
  margin-bottom: 4px;
}

.setting-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(17,24,39,0.8);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #F9FAFB;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.setting-input:focus { border-color: #FF7A00; }

.btn-save {
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF7A00, #FF4500);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s;
  min-height: 44px;
}
.btn-save:hover { opacity: 0.9; }
</style>
