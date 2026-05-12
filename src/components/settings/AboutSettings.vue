<template>
  <div class="about-settings glass">
    <div class="section-title">ℹ️ 关于</div>

    <div class="about-info">
      <div class="about-row">
        <span class="about-label">版本</span>
        <span class="about-value">v2.0.0</span>
      </div>
      <div class="about-row">
        <span class="about-label">定位</span>
        <span class="about-value">赛博抽卡 H5 游戏</span>
      </div>
    </div>

    <!-- 外卖平台开关 -->
    <div class="section-subtitle">外卖平台显示</div>
    <div class="platform-toggles">
      <label v-for="p in platforms" :key="p.key" class="platform-toggle">
        <input type="checkbox" v-model="enabledPlatforms" :value="p.key" @change="savePlatforms" />
        <span class="toggle-label">{{ p.icon }} {{ p.name }}</span>
      </label>
    </div>

    <!-- 数据操作 -->
    <div class="section-subtitle">数据管理</div>
    <div class="data-actions">
      <button class="btn-export" @click="exportData">📤 导出配置</button>
      <button class="btn-import" @click="triggerImport">📥 导入配置</button>
      <input ref="importInput" type="file" accept=".json" style="display:none" @change="importData" />
    </div>

    <button class="btn-danger" @click="confirmClear">🗑️ 清除所有数据</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../../composables/useToast.js'

const { showToast } = useToast()

const platforms = [
  { key: 'meituan', name: '美团外卖', icon: '🛵' },
  { key: 'eleme',   name: '饿了么',   icon: '🦋' },
  { key: 'jd',      name: '京东外卖', icon: '🐶' },
  { key: 'taobao',  name: '淘宝',     icon: '🛒' },
]

const PLATFORM_KEY = 'wte_enabled_platforms'
const enabledPlatforms = ref(
  JSON.parse(localStorage.getItem(PLATFORM_KEY) || 'null') || ['meituan', 'eleme', 'jd', 'taobao']
)

function savePlatforms() {
  localStorage.setItem(PLATFORM_KEY, JSON.stringify(enabledPlatforms.value))
}

const importInput = ref(null)

function exportData() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('wte_')) {
      try { data[key] = JSON.parse(localStorage.getItem(key)) }
      catch { data[key] = localStorage.getItem(key) }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wte-backup-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('配置已导出')
}

function triggerImport() {
  importInput.value?.click()
}

function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      Object.entries(data).forEach(([k, v]) => {
        localStorage.setItem(k, JSON.stringify(v))
      })
      showToast('配置已导入，刷新页面生效')
    } catch {
      showToast('导入失败：文件格式错误')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function confirmClear() {
  if (!confirm('确定要清除所有数据吗？此操作不可恢复！')) return
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('wte_')) keys.push(key)
  }
  keys.forEach(k => localStorage.removeItem(k))
  showToast('数据已清除，刷新页面生效')
}
</script>

<style scoped>
.about-settings { border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 14px; }

.section-title { font-size: 14px; font-weight: 800; color: #F9FAFB; }
.section-subtitle { font-size: 13px; font-weight: 700; color: #9CA3AF; margin-top: 4px; }

.about-info { display: flex; flex-direction: column; gap: 8px; }

.about-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.about-label { font-size: 13px; color: #9CA3AF; }
.about-value { font-size: 13px; color: #F9FAFB; font-weight: 600; }

.platform-toggles { display: flex; flex-direction: column; gap: 8px; }

.platform-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 0;
}

.platform-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #FF7A00;
  cursor: pointer;
}

.toggle-label { font-size: 14px; color: #D1D5DB; }

.data-actions { display: flex; gap: 8px; }

.btn-export, .btn-import {
  flex: 1;
  padding: 10px;
  border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  background: transparent;
  color: #D1D5DB;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
  transition: all 0.15s;
}
.btn-export:hover, .btn-import:hover {
  border-color: #22D3EE;
  color: #22D3EE;
}

.btn-danger {
  width: 100%;
  padding: 11px;
  border: 1.5px solid rgba(239,68,68,0.4);
  border-radius: 12px;
  background: rgba(239,68,68,0.08);
  color: #EF4444;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  min-height: 44px;
  transition: all 0.15s;
}
.btn-danger:hover { background: rgba(239,68,68,0.15); }
</style>
