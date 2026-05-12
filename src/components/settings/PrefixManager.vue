<template>
  <div class="prefix-manager glass">
    <div class="section-title">🎭 前缀管理</div>

    <div class="add-row">
      <input
        v-model="newPrefix"
        type="text"
        placeholder="添加前缀…"
        maxlength="10"
        class="add-input"
        @keydown.enter="addPrefix"
      />
      <button class="btn-add" @click="addPrefix">添加</button>
    </div>

    <div class="prefix-actions">
      <button class="btn-ai" :disabled="generating" @click="aiGenerate">
        {{ generating ? '🤖 生成中…' : '🤖 AI 批量刷新' }}
      </button>
      <button class="btn-reset" @click="resetPrefixes">恢复默认</button>
    </div>

    <div class="prefix-list">
      <span
        v-for="(p, i) in prefixes"
        :key="i"
        class="prefix-chip"
      >
        {{ p }}
        <button class="chip-del" @click="deletePrefix(i)">✕</button>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getPrefixes, setPrefixes, getDefaultPrefixes, getPrompts, hasAPIKey } from '../../services/storage.js'
import { simpleChat, extractJSON } from '../../services/aiService.js'
import { useToast } from '../../composables/useToast.js'

const { showToast } = useToast()
const prefixes = ref(getPrefixes())
const newPrefix = ref('')
const generating = ref(false)

function addPrefix() {
  const val = newPrefix.value.trim()
  if (!val) return
  prefixes.value.push(val)
  setPrefixes(prefixes.value)
  newPrefix.value = ''
}

function deletePrefix(i) {
  prefixes.value.splice(i, 1)
  setPrefixes(prefixes.value)
}

function resetPrefixes() {
  prefixes.value = getDefaultPrefixes()
  setPrefixes(prefixes.value)
  showToast('已恢复默认前缀')
}

async function aiGenerate() {
  if (!hasAPIKey()) { showToast('请先配置 API Key'); return }
  generating.value = true
  try {
    const prompts = getPrompts()
    const result = await simpleChat(prompts.prefixPrompt, prompts.prefixPrompt, 0.9)
    const parsed = extractJSON(result)
    if (parsed && Array.isArray(parsed)) {
      prefixes.value = parsed
      setPrefixes(parsed)
      showToast(`已生成 ${parsed.length} 个新前缀`)
    } else {
      showToast('AI 返回格式错误')
    }
  } catch (e) {
    showToast('生成失败：' + e.message)
  }
  generating.value = false
}
</script>

<style scoped>
.prefix-manager { border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }

.section-title { font-size: 14px; font-weight: 800; color: #F9FAFB; }

.add-row { display: flex; gap: 8px; }

.add-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(17,24,39,0.8);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #F9FAFB;
  font-size: 14px;
  outline: none;
  min-height: 44px;
  transition: border-color 0.2s;
}
.add-input:focus { border-color: #FF7A00; }

.btn-add {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: #FF7A00;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  min-height: 44px;
}

.prefix-actions { display: flex; gap: 8px; }

.btn-ai {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  min-height: 44px;
  transition: opacity 0.15s;
}
.btn-ai:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-reset {
  padding: 10px 16px;
  border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  background: transparent;
  color: #9CA3AF;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
  transition: all 0.15s;
}
.btn-reset:hover { border-color: #9CA3AF; color: #F9FAFB; }

.prefix-list { display: flex; flex-wrap: wrap; gap: 8px; }

.prefix-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(168,85,247,0.1);
  border: 1.5px solid rgba(168,85,247,0.3);
  border-radius: 10px;
  color: #C084FC;
  font-size: 13px;
  font-weight: 600;
}

.chip-del {
  border: none;
  background: none;
  color: rgba(168,85,247,0.5);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
}
.chip-del:hover { color: #EF4444; }
</style>
