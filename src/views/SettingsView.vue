<template>
  <div class="settings-view">
    <!-- 子分页导航 -->
    <div class="sub-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="sub-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- API & Prompt -->
    <div v-if="activeTab === 'api'" class="tab-content">
      <APISettings />
      <PromptEditor />
    </div>

    <!-- 食物管理 -->
    <div v-if="activeTab === 'foods'" class="tab-content">
      <FoodManager @rebuilt="$emit('rebuilt')" />
    </div>

    <!-- 前缀管理 -->
    <div v-if="activeTab === 'prefixes'" class="tab-content">
      <PrefixManager />
    </div>

    <!-- 关于 -->
    <div v-if="activeTab === 'about'" class="tab-content">
      <AboutSettings />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import APISettings from '../components/settings/APISettings.vue'
import PromptEditor from '../components/settings/PromptEditor.vue'
import FoodManager from '../components/settings/FoodManager.vue'
import PrefixManager from '../components/settings/PrefixManager.vue'
import AboutSettings from '../components/settings/AboutSettings.vue'

defineEmits(['rebuilt'])

const activeTab = ref('api')
const tabs = [
  { key: 'api',      label: '🔌 API' },
  { key: 'foods',    label: '🍜 食物' },
  { key: 'prefixes', label: '🎭 前缀' },
  { key: 'about',    label: 'ℹ️ 关于' },
]
</script>

<style scoped>
.settings-view { padding: 12px 16px 24px; }

.sub-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.sub-tabs::-webkit-scrollbar { display: none; }

.sub-tab {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1.5px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #9CA3AF;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 40px;
  white-space: nowrap;
}

.sub-tab.active {
  border-color: #FF7A00;
  background: rgba(255,122,0,0.12);
  color: #FF7A00;
}

.tab-content { display: flex; flex-direction: column; gap: 16px; }
</style>
