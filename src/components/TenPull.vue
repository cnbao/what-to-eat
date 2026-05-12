<template>
  <div class="ten-pull-wrapper">
    <!-- 翻牌网格 -->
    <div class="cards-grid">
      <div
        v-for="(card, i) in cards"
        :key="i"
        class="card-flip"
        :class="{ flipped: card.flipped, selected: selectedIndex === i }"
        @click="selectCard(i)"
      >
        <div class="card-flip-inner">
          <!-- 背面 -->
          <div class="card-face card-back-face">
            <div class="card-back-content">
              <div class="card-back-icon">?</div>
            </div>
          </div>
          <!-- 正面 -->
          <div class="card-face card-front-face" :class="`front-${card.rarity}`">
            <div class="card-front-content">
              <div class="card-rarity-label" :class="`label-${card.rarity}`">{{ card.rarity }}</div>
              <div class="card-name">{{ card.displayName }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中结果 -->
    <transition name="fade-up">
      <div v-if="selectedIndex !== null" class="selected-result">
        <div class="selected-label">今天就吃这个！</div>
        <div class="selected-food" :class="`rarity-text-${cards[selectedIndex]?.rarity}`">
          {{ cards[selectedIndex]?.food?.name }}
        </div>
        <button class="btn-confirm" @click="confirmSelection">确认选择</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getFoods, getFavorites, calcRarity, addRecord } from '../services/storage.js'
import { drawTen, fetchPairing } from '../services/gacha.js'

const cards = ref([])
const selectedIndex = ref(null)
const emit = defineEmits(['confirmed', 'pairing'])

function startDraw() {
  const foods = getFoods()
  const favorites = getFavorites()
  const results = drawTen(foods, favorites)

  selectedIndex.value = null
  cards.value = results.map(r => ({ ...r, flipped: false }))

  // 逐张翻牌，间隔 180ms
  results.forEach((_, i) => {
    setTimeout(() => {
      cards.value[i].flipped = true
    }, i * 180 + 300)
  })
}

function selectCard(i) {
  if (!cards.value[i]?.flipped) return
  selectedIndex.value = selectedIndex.value === i ? null : i
}

function confirmSelection() {
  if (selectedIndex.value === null) return
  const card = cards.value[selectedIndex.value]
  addRecord(card.food.name, card.rarity)
  emit('confirmed', { food: card.food, rarity: card.rarity, displayName: card.displayName })

  fetchPairing(card.food.name).then(pairings => {
    if (pairings) emit('pairing', { food: card.food.name, pairings })
  })
}

defineExpose({ startDraw })
</script>

<style scoped>
.ten-pull-wrapper {
  padding: 8px 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 0 4px;
}

.card-flip {
  perspective: 600px;
  cursor: pointer;
  border-radius: 12px;
}

.card-flip-inner {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
}

.card-flip.flipped .card-flip-inner {
  transform: rotateY(180deg);
}

.card-flip.selected .card-flip-inner {
  outline: 2px solid #FF7A00;
  outline-offset: 2px;
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}

.card-back-face {
  background: linear-gradient(135deg, #1F2937, #111827);
  border: 1.5px solid rgba(255,122,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-back-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-back-icon {
  font-size: 28px;
  font-weight: 900;
  color: rgba(255,122,0,0.4);
  font-family: 'JetBrains Mono', monospace;
}

.card-front-face {
  transform: rotateY(180deg);
  display: flex;
  align-items: flex-end;
}

.front-N   { background: linear-gradient(160deg, #1F2937, #111827); border: 1.5px solid #9CA3AF; }
.front-R   { background: linear-gradient(160deg, #1e3a5f, #111827); border: 1.5px solid #3B82F6; }
.front-SR  { background: linear-gradient(160deg, #3b1f5f, #111827); border: 1.5px solid #A855F7; }
.front-SSR { background: linear-gradient(160deg, #3d2e00, #111827); border: 1.5px solid #FFD700; }

.card-front-content {
  width: 100%;
  padding: 6px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.card-rarity-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 2px;
}
.label-N   { color: #9CA3AF; }
.label-R   { color: #3B82F6; }
.label-SR  { color: #A855F7; }
.label-SSR { color: #FFD700; }

.card-name {
  font-size: 11px;
  font-weight: 700;
  color: #F9FAFB;
  line-height: 1.3;
  word-break: break-all;
}

/* 选中结果 */
.selected-result {
  margin-top: 16px;
  text-align: center;
  padding: 16px;
  background: rgba(31,41,55,0.8);
  border-radius: 18px;
  border: 1px solid rgba(255,122,0,0.3);
}

.selected-label {
  font-size: 13px;
  color: #9CA3AF;
  margin-bottom: 6px;
}

.selected-food {
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 14px;
}

.rarity-text-N   { color: #9CA3AF; }
.rarity-text-R   { color: #3B82F6; }
.rarity-text-SR  { color: #A855F7; }
.rarity-text-SSR { color: #FFD700; text-shadow: 0 0 12px rgba(255,215,0,0.5); }

.btn-confirm {
  padding: 10px 32px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #FF7A00, #FF4500);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255,122,0,0.4);
  transition: transform 0.15s;
}
.btn-confirm:active { transform: scale(0.96); }

.fade-up-enter-active { transition: all 0.35s ease-out; }
.fade-up-leave-active { transition: all 0.25s ease-in; }
.fade-up-enter-from   { opacity: 0; transform: translateY(12px); }
.fade-up-leave-to     { opacity: 0; }
</style>
