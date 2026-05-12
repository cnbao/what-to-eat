<template>
  <div class="fortune-card glass">
    <div v-if="loading" class="fortune-loading">
      <span class="loading-dot" />
      <span>食神签生成中…</span>
    </div>
    <div v-else-if="fortune" class="fortune-content">
      <div class="fortune-header">
        <span class="fortune-icon">🔮</span>
        <span class="fortune-date">{{ today }}</span>
        <span class="fortune-badge">今日食神签</span>
      </div>
      <div class="fortune-title">{{ fortune.title }}</div>
      <div class="fortune-body">{{ fortune.body }}</div>
      <div class="fortune-footer">
        <span class="fortune-yi">宜 {{ fortune.yi }}</span>
        <span class="fortune-ji">忌 {{ fortune.ji }}</span>
      </div>
    </div>
    <div v-else class="fortune-empty" @click="generate">
      <span>🔮 点击生成今日食神签</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFortune, setFortune, getPrompts, getRecords, hasAPIKey } from '../services/storage.js'
import { simpleChat, extractJSON } from '../services/aiService.js'

const today = new Date().toISOString().slice(0, 10)
const fortune = ref(null)
const loading = ref(false)

onMounted(() => {
  const cached = getFortune()
  if (cached && cached.date === today) {
    fortune.value = cached
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
    // Pick a random food from records or default
    const food = records.length > 0
      ? records[Math.floor(Math.random() * records.length)].food
      : '螺蛳粉'

    const userPrompt = prompts.fortunePrompt
      .replace('{date}', today)
      .replace('{recent_foods}', recentFoods)
      .replace('{food}', food)

    const result = await simpleChat(prompts.fortunePrompt, userPrompt, 0.9)
    const parsed = extractJSON(result)
    if (parsed && parsed.title) {
      const data = { date: today, ...parsed }
      setFortune(data)
      fortune.value = data
    }
  } catch {}
  loading.value = false
}
</script>

<style scoped>
.fortune-card {
  border-radius: 18px;
  padding: 16px;
  min-height: 80px;
  display: flex;
  align-items: center;
}

.fortune-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9CA3AF;
  font-size: 13px;
  width: 100%;
  justify-content: center;
}

.loading-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #FF7A00;
  animation: blink 1s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

.fortune-content { width: 100%; }

.fortune-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.fortune-icon { font-size: 16px; }
.fortune-date { font-size: 11px; color: #6B7280; font-family: 'JetBrains Mono', monospace; }
.fortune-badge {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  color: #FF7A00;
  border: 1px solid rgba(255,122,0,0.4);
  padding: 2px 8px;
  border-radius: 8px;
}

.fortune-title {
  font-size: 18px;
  font-weight: 900;
  color: #FFD700;
  margin-bottom: 6px;
  text-shadow: 0 0 12px rgba(255,215,0,0.3);
}

.fortune-body {
  font-size: 13px;
  color: #D1D5DB;
  line-height: 1.6;
  margin-bottom: 10px;
}

.fortune-footer {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.fortune-yi { color: #22D3EE; }
.fortune-ji { color: #EF4444; }

.fortune-empty {
  width: 100%;
  text-align: center;
  color: #6B7280;
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
}
</style>
