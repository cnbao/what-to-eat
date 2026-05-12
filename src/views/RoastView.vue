<template>
  <div class="roast-view">
    <div class="roast-header">
      <h2 class="roast-title">🤖 毒舌点评</h2>
      <p class="roast-subtitle">游戏旁白风格，专治饮食不均衡</p>
    </div>

    <div class="roast-section glass">
      <button class="btn-cyber roast-btn" :disabled="roasting" @click="doRoast">
        {{ roasting ? '旁白酝酿中…' : '点评我的饮食' }}
      </button>
      <transition name="fade-up">
        <div v-if="roastResult" class="roast-result">
          <div class="roast-text">{{ roastResult }}</div>
        </div>
      </transition>
    </div>

    <div class="roast-section glass">
      <div class="section-title">🏆 解锁成就</div>
      <button class="btn-cyber roast-btn" :disabled="achieving" @click="doAchievement">
        {{ achieving ? '成就生成中…' : '生成本周成就' }}
      </button>
      <transition name="fade-up">
        <div v-if="achieveResult" class="achieve-list">
          <div v-for="a in achieveResult" :key="a.name" class="achieve-item">
            <span class="achieve-name">{{ a.name }}</span>
            <span class="achieve-badge" :class="`badge-${rarityKey(a.rarity)}`">{{ a.rarity }}</span>
            <div class="achieve-cond">{{ a.condition }}</div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getRecords, getPrompts, hasAPIKey } from '../services/storage.js'
import { simpleChat, extractJSON } from '../services/aiService.js'
import { useAchievements } from '../composables/useAchievements.js'
import { useToast } from '../composables/useToast.js'

const { showToast } = useToast()
const { unlockAchievements } = useAchievements()

const roasting = ref(false)
const achieving = ref(false)
const roastResult = ref('')
const achieveResult = ref(null)

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

async function doRoast() {
  if (!hasAPIKey()) { showToast('请先在设置中配置 API Key'); return }
  const records = getRecords(7)
  if (records.length === 0) { showToast('还没有饮食记录哦'); return }

  roasting.value = true
  roastResult.value = ''
  try {
    const prompts = getPrompts()
    const recordsText = formatRecords(records)
    const userPrompt = prompts.roastPrompt.replace('{records}', recordsText)
    roastResult.value = await simpleChat(prompts.roastPrompt, userPrompt, 0.9)
  } catch (e) {
    showToast('点评失败：' + e.message)
  }
  roasting.value = false
}

async function doAchievement() {
  if (!hasAPIKey()) { showToast('请先在设置中配置 API Key'); return }
  const records = getRecords(7)
  if (records.length === 0) { showToast('还没有饮食记录哦'); return }

  achieving.value = true
  achieveResult.value = null
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
      achieveResult.value = list
      unlockAchievements(list)
      showToast(`解锁了 ${list.length} 个成就！`)
    } else {
      showToast('AI 返回格式有误，再试一次吧')
    }
  } catch (e) {
    showToast('生成失败：' + e.message)
  }
  achieving.value = false
}
</script>

<style scoped>
.roast-view { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

.roast-header { margin-bottom: 4px; }
.roast-title { font-size: 20px; font-weight: 900; color: #F9FAFB; }
.roast-subtitle { font-size: 13px; color: #6B7280; margin-top: 4px; }

.roast-section {
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #F9FAFB;
}

.roast-btn { width: 100%; }

.roast-result {
  padding: 14px;
  background: rgba(17,24,39,0.6);
  border-radius: 14px;
  border: 1px solid rgba(255,122,0,0.2);
}

.roast-text {
  font-size: 14px;
  line-height: 1.8;
  color: #D1D5DB;
  white-space: pre-wrap;
}

.achieve-list { display: flex; flex-direction: column; gap: 10px; }

.achieve-item {
  padding: 12px 14px;
  background: rgba(17,24,39,0.6);
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
}

.achieve-name {
  font-size: 15px;
  font-weight: 800;
  color: #F9FAFB;
  margin-right: 8px;
}

.achieve-badge {
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

.achieve-cond {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
}

.fade-up-enter-active { transition: all 0.35s ease-out; }
.fade-up-leave-active { transition: all 0.2s ease-in; }
.fade-up-enter-from   { opacity: 0; transform: translateY(10px); }
.fade-up-leave-to     { opacity: 0; }
</style>
