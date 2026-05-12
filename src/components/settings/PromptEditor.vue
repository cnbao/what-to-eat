<template>
  <div class="prompt-editor glass">
    <div class="section-title">📝 Prompt 管理</div>

    <div class="prompt-tabs">
      <button
        v-for="p in promptList"
        :key="p.key"
        class="prompt-tab"
        :class="{ active: currentKey === p.key }"
        @click="switchPrompt(p.key)"
      >{{ p.label }}</button>
    </div>

    <textarea
      v-model="currentText"
      class="prompt-textarea"
      rows="10"
      :placeholder="`编辑 ${currentLabel}…`"
    />

    <div class="prompt-actions">
      <button class="btn-reset" @click="resetPrompt">恢复默认</button>
      <button class="btn-save" @click="savePrompt">保存</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getPrompts, setPrompts, getDefaultPrompts } from '../../services/storage.js'
import { useToast } from '../../composables/useToast.js'

const { showToast } = useToast()

const promptList = [
  { key: 'achievementPrompt', label: '成就' },
  { key: 'roastPrompt',       label: '毒舌点评' },
  { key: 'tagPrompt',         label: '打标签' },
  { key: 'prefixPrompt',      label: '前缀生成' },
  { key: 'pairingPrompt',     label: '搭配提示' },
  { key: 'imagePrompt',       label: '食物插画' },
  { key: 'fortunePrompt',     label: '食神签' },
  { key: 'destinyPrompt',     label: '天命运势' },
]

const currentKey = ref('achievementPrompt')
const prompts = ref(getPrompts())

const currentLabel = computed(() => promptList.find(p => p.key === currentKey.value)?.label || '')
const currentText = computed({
  get: () => prompts.value[currentKey.value] || '',
  set: (v) => { prompts.value[currentKey.value] = v },
})

function switchPrompt(key) {
  // auto-save current before switching
  setPrompts(prompts.value)
  currentKey.value = key
  prompts.value = getPrompts()
}

function resetPrompt() {
  const defaults = getDefaultPrompts()
  prompts.value[currentKey.value] = defaults[currentKey.value]
  showToast('已恢复默认')
}

function savePrompt() {
  setPrompts(prompts.value)
  showToast('Prompt 已保存')
}
</script>

<style scoped>
.prompt-editor { border-radius: 18px; padding: 16px; }

.section-title {
  font-size: 14px;
  font-weight: 800;
  color: #F9FAFB;
  margin-bottom: 12px;
}

.prompt-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.prompt-tab {
  padding: 5px 12px;
  border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #9CA3AF;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 34px;
}

.prompt-tab.active {
  border-color: #22D3EE;
  background: rgba(34,211,238,0.1);
  color: #22D3EE;
}

.prompt-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(17,24,39,0.8);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #D1D5DB;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
  min-height: 180px;
}

.prompt-textarea:focus { border-color: #22D3EE; }

.prompt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.btn-reset {
  padding: 8px 16px;
  border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  background: transparent;
  color: #9CA3AF;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  min-height: 40px;
  transition: all 0.15s;
}
.btn-reset:hover { border-color: #9CA3AF; color: #F9FAFB; }

.btn-save {
  padding: 8px 20px;
  border: none;
  border-radius: 10px;
  background: #22D3EE;
  color: #111827;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  min-height: 40px;
  transition: opacity 0.15s;
}
.btn-save:hover { opacity: 0.9; }
</style>
