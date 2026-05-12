<template>
  <div class="stats-view">
    <div class="stats-header">
      <div class="stats-tabs">
        <button class="stats-tab" :class="{ active: period === 7 }" @click="period = 7">一周</button>
        <button class="stats-tab" :class="{ active: period === 30 }" @click="period = 30">一月</button>
      </div>
      <span class="stats-total">共 {{ records.length }} 次</span>
    </div>

    <div v-if="records.length === 0" class="stats-empty">
      还没有饮食记录，快去抽卡吧！
    </div>

    <template v-else>
      <!-- 食物频率条形图 -->
      <div class="stats-section-title">食物频率</div>
      <div class="stats-chart">
        <div v-for="item in topFoods" :key="item.name" class="bar-row">
          <span class="bar-label">{{ item.name }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: (item.count / maxCount * 100) + '%', background: catColor(item.tag) }"
            />
          </div>
          <span class="bar-count">{{ item.count }}</span>
        </div>
      </div>

      <!-- 标签分布 -->
      <div class="stats-section-title">分类分布</div>
      <div class="tag-chips">
        <span
          v-for="(count, cat) in catCounts"
          :key="cat"
          class="tag-chip"
          :style="{ background: catColor(cat) + '22', color: catColor(cat), border: `1px solid ${catColor(cat)}44` }"
        >{{ cat }} {{ count }}</span>
      </div>

      <!-- 日历 -->
      <div class="stats-section-title">饮食日历</div>
      <div class="calendar">
        <div v-for="(foods, date) in byDate" :key="date" class="cal-row">
          <span class="cal-date">{{ formatDate(date) }}</span>
          <span class="cal-foods">{{ foods.join('、') }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getRecords, getFoods, getTagCategory } from '../services/storage.js'

const period = ref(7)

const records = computed(() => getRecords(period.value))

const topFoods = computed(() => {
  const counts = {}
  const tags = {}
  const foods = getFoods()
  const foodMap = Object.fromEntries(foods.map(f => [f.name, f]))
  records.value.forEach(r => {
    const name = r.food.split('+')[0]
    counts[name] = (counts[name] || 0) + 1
    tags[name] = foodMap[name]?.tag || '其他'
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, tag: tags[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

const maxCount = computed(() => Math.max(...topFoods.value.map(f => f.count), 1))

const catCounts = computed(() => {
  const c = {}
  records.value.forEach(r => {
    const foods = getFoods()
    const food = foods.find(f => f.name === r.food.split('+')[0])
    const cat = getTagCategory(food?.tag || '其他')
    c[cat] = (c[cat] || 0) + 1
  })
  return c
})

const byDate = computed(() => {
  const d = {}
  ;[...records.value].sort((a, b) => b.time - a.time).forEach(r => {
    if (!d[r.date]) d[r.date] = []
    if (!d[r.date].includes(r.food)) d[r.date].push(r.food)
  })
  return d
})

const CAT_COLORS = {
  '面食': '#FF7A00', '粉类': '#22D3EE', '米饭': '#A855F7',
  '小吃': '#EF4444', '粥品': '#3B82F6', '快餐': '#F59E0B',
  '甜品': '#EC4899', '其他': '#9CA3AF',
}

function catColor(tag) {
  const cat = getTagCategory(tag)
  return CAT_COLORS[cat] || '#9CA3AF'
}

function formatDate(date) {
  const d = new Date(date)
  const day = ['日','一','二','三','四','五','六'][d.getDay()]
  return `${date.slice(5)} 周${day}`
}
</script>

<style scoped>
.stats-view { padding: 16px; }

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stats-tabs { display: flex; gap: 6px; }

.stats-tab {
  padding: 7px 18px;
  border-radius: 20px;
  border: 1.5px solid rgba(255,122,0,0.4);
  background: transparent;
  color: #9CA3AF;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 36px;
}

.stats-tab.active {
  background: #FF7A00;
  border-color: #FF7A00;
  color: #fff;
}

.stats-total { font-size: 13px; color: #6B7280; }

.stats-empty {
  text-align: center;
  padding: 60px 0;
  color: #6B7280;
  font-size: 14px;
}

.stats-section-title {
  font-size: 14px;
  font-weight: 800;
  color: #9CA3AF;
  margin: 16px 0 10px;
  letter-spacing: 1px;
}

.stats-chart { display: flex; flex-direction: column; gap: 8px; }

.bar-row { display: flex; align-items: center; gap: 8px; }

.bar-label {
  width: 80px;
  font-size: 12px;
  color: #D1D5DB;
  text-align: right;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  height: 18px;
  background: rgba(255,255,255,0.06);
  border-radius: 9px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 9px;
  transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
  min-width: 4px;
}

.bar-count { font-size: 12px; color: #6B7280; width: 24px; text-align: right; }

.tag-chips { display: flex; flex-wrap: wrap; gap: 6px; }

.tag-chip {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.calendar { display: flex; flex-direction: column; gap: 6px; }

.cal-row {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(31,41,55,0.5);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.cal-date {
  font-size: 12px;
  color: #6B7280;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
}

.cal-foods { font-size: 13px; color: #D1D5DB; line-height: 1.5; }
</style>
