<template>
  <div class="destiny-card glass">
    <div v-if="!destiny" class="destiny-empty">
      <span v-if="loading" class="destiny-loading">运势推算中…</span>
      <span v-else class="destiny-hint">今日运势加载中</span>
    </div>
    <div v-else class="destiny-content">
      <div class="destiny-header">
        <span class="destiny-title">今日天命运势</span>
        <span class="destiny-date">{{ today }}</span>
      </div>
      <div class="destiny-dims">
        <div v-for="d in destiny.dimensions" :key="d.name" class="destiny-dim">
          <span class="dim-name">{{ d.name }}</span>
          <div class="dim-stars">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ filled: n <= d.stars }"
            >★</span>
          </div>
          <span class="dim-level" :class="levelClass(d.level)">{{ d.level }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDestiny, setDestiny, getPrompts, getRecords, hasAPIKey } from '../services/storage.js'
import { simpleChat, extractJSON } from '../services/aiService.js'

const today = new Date().toISOString().slice(0, 10)
const destiny = ref(null)
const loading = ref(false)

onMounted(() => {
  const cached = getDestiny()
  if (cached && cached.date === today) {
    destiny.value = cached
  } else if (hasAPIKey()) {
    generate()
  }
})

async function generate() {
  if (loading.value) return
  loading.value = true
  try {
    const prompts = getPrompts()
    const records = getRecords(7)
    const recentFoods = [...new Set(records.map(r => r.food))].slice(0, 5).join('、') || '暂无记录'
    const userPrompt = prompts.destinyPrompt
      .replace('{date}', today)
      .replace('{recent_foods}', recentFoods)
    const result = await simpleChat(prompts.destinyPrompt, userPrompt, 0.8)
    const parsed = extractJSON(result)
    if (parsed && parsed.dimensions) {
      const data = { date: today, ...parsed }
      setDestiny(data)
      destiny.value = data
    }
  } catch {}
  loading.value = false
}

function levelClass(level) {
  if (['大吉', '中吉'].includes(level)) return 'level-good'
  if (['小吉', '末吉'].includes(level)) return 'level-ok'
  return 'level-bad'
}
</script>

<style scoped>
.destiny-card {
  border-radius: 18px;
  padding: 14px 16px;
}

.destiny-empty {
  text-align: center;
  color: #6B7280;
  font-size: 13px;
  padding: 8px;
}

.destiny-loading { color: #FF7A00; }

.destiny-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.destiny-title {
  font-size: 13px;
  font-weight: 800;
  color: #22D3EE;
  letter-spacing: 1px;
}

.destiny-date {
  font-size: 11px;
  color: #6B7280;
  font-family: 'JetBrains Mono', monospace;
}

.destiny-dims {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.destiny-dim {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dim-name {
  font-size: 12px;
  color: #9CA3AF;
  width: 72px;
  flex-shrink: 0;
}

.dim-stars {
  display: flex;
  gap: 1px;
  flex: 1;
}

.star {
  font-size: 13px;
  color: #374151;
  transition: color 0.2s;
}
.star.filled { color: #FFD700; }

.dim-level {
  font-size: 11px;
  font-weight: 800;
  width: 28px;
  text-align: right;
}

.level-good { color: #22D3EE; }
.level-ok   { color: #9CA3AF; }
.level-bad  { color: #EF4444; }
</style>
