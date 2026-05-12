<template>
  <div class="fav-view">
    <div class="fav-header">
      <h2 class="fav-title">选择偏好食物</h2>
      <p class="fav-hint">最多选3个，可重复。偏好食物会提高抽中概率。</p>
    </div>

    <!-- 已选槽位 -->
    <div class="fav-slots">
      <div
        v-for="i in 3"
        :key="i"
        class="fav-slot"
        :class="{ filled: favorites[i-1] }"
      >
        <span v-if="favorites[i-1]">{{ favorites[i-1] }}</span>
        <span v-else class="slot-empty">未选择</span>
      </div>
    </div>

    <!-- 分组食物 -->
    <div v-for="(foods, cat) in groups" :key="cat" class="fav-group">
      <div class="group-title">{{ cat }}</div>
      <div class="fav-grid">
        <button
          v-for="f in foods"
          :key="f.name"
          class="fav-tile"
          :class="{ selected: favCount[f.name] > 0 }"
          @click="toggleFav(f.name)"
        >
          {{ f.name }}
          <span v-if="favCount[f.name] > 0" class="fav-badge">×{{ favCount[f.name] }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFavorites, setFavorites, getFoodsGroupByCategory } from '../services/storage.js'
import { useToast } from '../composables/useToast.js'

const { showToast } = useToast()
const favorites = ref(getFavorites())
const groups = computed(() => getFoodsGroupByCategory())

const favCount = computed(() => {
  const c = {}
  favorites.value.forEach(f => { c[f] = (c[f] || 0) + 1 })
  return c
})

function toggleFav(name) {
  let favs = [...favorites.value]
  if (favs.includes(name)) {
    favs.splice(favs.indexOf(name), 1)
  } else if (favs.length < 3) {
    favs.push(name)
  } else {
    showToast('最多选3个哦！')
    return
  }
  setFavorites(favs)
  favorites.value = favs
}
</script>

<style scoped>
.fav-view { padding: 16px; }

.fav-header { margin-bottom: 16px; }
.fav-title { font-size: 18px; font-weight: 800; color: #F9FAFB; margin-bottom: 4px; }
.fav-hint  { font-size: 12px; color: #6B7280; line-height: 1.5; }

.fav-slots {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.fav-slot {
  flex: 1;
  padding: 10px 8px;
  border-radius: 12px;
  border: 1.5px solid rgba(255,122,0,0.3);
  background: rgba(31,41,55,0.6);
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #FF7A00;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-slot.filled {
  border-color: #FF7A00;
  background: rgba(255,122,0,0.1);
}

.slot-empty { color: #4B5563; font-weight: 400; }

.fav-group { margin-bottom: 20px; }

.group-title {
  font-size: 12px;
  font-weight: 700;
  color: #6B7280;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  letter-spacing: 1px;
}

.fav-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fav-tile {
  position: relative;
  padding: 9px 14px;
  border-radius: 12px;
  border: 1.5px solid rgba(255,255,255,0.1);
  background: rgba(31,41,55,0.6);
  color: #D1D5DB;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 44px;
}

.fav-tile.selected {
  border-color: #FF7A00;
  background: rgba(255,122,0,0.12);
  color: #FF7A00;
}

.fav-tile:active { transform: scale(0.95); }

.fav-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #FF7A00;
  color: #fff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 800;
}
</style>
