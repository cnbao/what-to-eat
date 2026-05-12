<template>
  <div class="achievements-preview glass">
    <div class="preview-header">
      <span class="preview-title">最近成就</span>
      <button class="btn-unlock" :disabled="unlocking" @click="unlock">
        {{ unlocking ? '解锁中…' : '解锁新成就' }}
      </button>
    </div>

    <div v-if="recent.length === 0" class="preview-empty">
      还没有成就，快去吃饭吧！
    </div>
    <div v-else class="preview-list">
      <div v-for="a in recent" :key="a.name" class="ach-item">
        <span class="ach-name">{{ a.name }}</span>
        <span class="ach-badge" :class="`badge-${rarityKey(a.rarity)}`">{{ a.rarity }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAchievements, getRecords, getPrompts, hasAPIKey } from '../services/storage.js'
import { simpleChat, extractJSON } from '../services/aiService.js'
import { useAchievements } from '../composables/useAchievements.js'
import { useToast } from '../composables/useToast.js'

const { achievements, unlockAchievements } = useAchievements()
const { showToast } = useToast()
const unlocking = ref(false)

const recent = computed(() => [...achievements.value].slice(-3).reverse())

const RARITY_MAP = { '普通': 'N', '稀有': 'R', '史诗': 'SR', '传说': 'SSR' }
function rarityKey(r) { return RARITY_MAP[r] || 'N' }

function formatRecords(records) {
  const byDate = {}
  records.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = []
    byDate[r.date].push(r.food)
  })
  return Object.entries(byDate).sort().map(([date, foods]) => {
    const day = ['日','一','二','三','四','五','六'][new Date(date).getDay()]
    return `${date}(周${day}): ${foods.join('、')}`
  }).join('\n')
}

async function unlock() {
  if (!hasAPIKey()) { showToast('请先在设置中配置 API Key'); return }
  const records = getRecords(7)
  if (records.length === 0) { showToast('还没有饮食记录哦'); return }

  unlocking.value = true
  try {
    const prompts = getPrompts()
    const recordsText = formatRecords(records)
    const userPrompt = prompts.achievementPrompt.replace('{records}', recordsText)
    const result = await simpleChat(prompts.achievementPrompt, userPrompt, 0.9)
    const parsed = extractJSON(result)
    if (parsed && Array.isArray(parsed)) {
      const list = parsed.map(a => ({
        name: a.name || '未知成就',
        condition: a.condition || '',
        rarity: a.rarity || '普通',
      }))
      unlockAchievements(list)
      showToast(`解锁了 ${list.length} 个成就！`)
    } else {
      showToast('AI 返回格式有误，再试一次吧')
    }
  } catch (e) {
    showToast('解锁失败：' + e.message)
  }
  unlocking.value = false
}
</script>

<style scoped>
.achievements-preview {
  border-radius: 18px;
  padding: 14px 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.preview-title {
  font-size: 14px;
  font-weight: 800;
  color: #F9FAFB;
}

.btn-unlock {
  padding: 6px 14px;
  border: 1.5px solid rgba(255,122,0,0.5);
  border-radius: 14px;
  background: transparent;
  color: #FF7A00;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 36px;
}
.btn-unlock:hover { background: rgba(255,122,0,0.1); }
.btn-unlock:disabled { opacity: 0.5; cursor: not-allowed; }

.preview-empty {
  text-align: center;
  color: #6B7280;
  font-size: 13px;
  padding: 8px 0;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ach-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(17,24,39,0.6);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}

.ach-name {
  font-size: 14px;
  font-weight: 700;
  color: #F9FAFB;
}

.ach-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1.5px solid;
}

.badge-N   { color: #9CA3AF; border-color: #9CA3AF; }
.badge-R   { color: #3B82F6; border-color: #3B82F6; }
.badge-SR  { color: #A855F7; border-color: #A855F7; }
.badge-SSR { color: #FFD700; border-color: #FFD700; }
</style>
