<template>
  <div class="food-manager">
    <div class="section-title">🍜 食物管理</div>

    <!-- 添加食物 -->
    <div class="add-row">
      <input
        v-model="newFoodName"
        type="text"
        placeholder="添加新食物…"
        maxlength="20"
        class="add-input"
        @keydown.enter="addFood"
      />
      <button class="btn-add" @click="addFood">添加</button>
    </div>

    <!-- 一键打标签 -->
    <div class="tag-action">
      <button class="btn-tag-all" :disabled="tagging" @click="tagAll">
        {{ tagging ? `🏷️ ${tagProgress}` : '🏷️ 给所有食物打分类标签' }}
      </button>
      <span class="tag-hint">输入完食物清单后要点一下哦</span>
    </div>

    <!-- 分组食物列表 -->
    <div v-for="(foods, cat) in groups" :key="cat" class="food-group">
      <div class="group-title">{{ cat }}</div>
      <div class="food-grid">
        <div
          v-for="f in foods"
          :key="f.name"
          class="food-tile"
        >
          <span class="food-tile-name">{{ f.name }}</span>
          <span class="food-tile-tag">{{ f.tag }}</span>
          <button class="food-tile-del" @click="deleteFood(f.name)">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFoodsGroupByCategory, addFood as storageAddFood, removeFood, hasAPIKey, getFoods, setFoods } from '../../services/storage.js'
import { tagAllFoods, tagSingleFood } from '../../services/tagService.js'
import { useToast } from '../../composables/useToast.js'

const emit = defineEmits(['rebuilt'])
const { showToast } = useToast()

const newFoodName = ref('')
const tagging = ref(false)
const tagProgress = ref('')
const groups = ref(getFoodsGroupByCategory())

function refresh() {
  groups.value = getFoodsGroupByCategory()
  emit('rebuilt')
}

async function addFood() {
  const name = newFoodName.value.trim()
  if (!name) return
  if (!storageAddFood(name, '其他')) {
    showToast('这个食物已经有了！')
    return
  }
  newFoodName.value = ''

  if (hasAPIKey()) {
    try {
      const tag = await tagSingleFood(name)
      if (tag) {
        const { getFoods, setFoods } = await import('../../services/storage.js')
        const foods = getFoods()
        const food = foods.find(f => f.name === name)
        if (food) { food.tag = tag; setFoods(foods) }
      }
    } catch {}
  }
  refresh()
}

function deleteFood(name) {
  const { removeFood: rm } = { removeFood }
  if (!removeFood(name)) {
    showToast('至少保留3个食物选项哦！')
    return
  }
  refresh()
}

async function tagAll() {
  if (!hasAPIKey()) { showToast('请先在设置页配置 API Key'); return }
  tagging.value = true
  try {
    await tagAllFoods((msg) => { tagProgress.value = msg })
    refresh()
    showToast('标签已更新')
  } catch (e) {
    showToast('打标签失败：' + e.message)
  }
  tagging.value = false
  tagProgress.value = ''
}
</script>

<style scoped>
.food-manager { display: flex; flex-direction: column; gap: 12px; }

.section-title {
  font-size: 14px;
  font-weight: 800;
  color: #F9FAFB;
}

.add-row {
  display: flex;
  gap: 8px;
}

.add-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(17,24,39,0.8);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #F9FAFB;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  min-height: 44px;
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
  transition: opacity 0.15s;
}
.btn-add:hover { opacity: 0.9; }

.tag-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.btn-tag-all {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #22D3EE, #3B82F6);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  min-height: 44px;
  transition: opacity 0.15s;
}
.btn-tag-all:disabled { opacity: 0.6; cursor: not-allowed; }

.tag-hint {
  font-size: 11px;
  color: #FF7A00;
  font-weight: 600;
}

.food-group { margin-bottom: 4px; }

.group-title {
  font-size: 12px;
  font-weight: 700;
  color: #6B7280;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  letter-spacing: 1px;
}

.food-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.food-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 28px 8px 10px;
  background: rgba(31,41,55,0.7);
  border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  min-width: 80px;
}

.food-tile-name {
  font-size: 13px;
  font-weight: 700;
  color: #F9FAFB;
}

.food-tile-tag {
  font-size: 10px;
  color: #6B7280;
  margin-top: 2px;
}

.food-tile-del {
  position: absolute;
  top: 4px;
  right: 4px;
  border: none;
  background: none;
  color: #4B5563;
  font-size: 13px;
  cursor: pointer;
  padding: 2px;
  line-height: 1;
  transition: color 0.15s;
}
.food-tile-del:hover { color: #EF4444; }
</style>
