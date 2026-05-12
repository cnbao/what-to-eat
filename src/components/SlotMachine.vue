<template>
  <div class="slot-wrapper">
    <div class="slot-machine" ref="machineEl">
      <div class="slot-window">
        <div class="slot-strip" ref="stripEl">
          <div
            v-for="(item, i) in repeatedItems"
            :key="i"
            class="slot-item"
            :class="`rarity-item-${item.rarity || 'N'}`"
          >
            {{ item.displayName }}
          </div>
        </div>
      </div>
      <div class="slot-indicator">
        <span class="indicator-arrow left">▶</span>
        <span class="indicator-arrow right">◀</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFoods, getFavorites, calcRarity, addRecord } from '../services/storage.js'
import { weightedRandom, buildDisplayItems, fetchPairing } from '../services/gacha.js'

const ITEM_HEIGHT = 88
const VISIBLE_ITEMS = 3
const REPEAT_COUNT = 18

const stripEl = ref(null)
const machineEl = ref(null)
const repeatedItems = ref([])
let displayItems = []

const emit = defineEmits(['result', 'pairing'])

function rebuild() {
  const foods = getFoods()
  displayItems = buildDisplayItems(foods)
  const repeated = []
  for (let i = 0; i < REPEAT_COUNT; i++) repeated.push(...displayItems)
  repeatedItems.value = repeated

  if (stripEl.value) {
    stripEl.value.style.transition = 'none'
    stripEl.value.style.transform = 'translateY(0)'
  }
}

onMounted(rebuild)

async function spin() {
  const foods = getFoods()
  const favorites = getFavorites()
  const targetFood = weightedRandom(foods, favorites)
  const rarity = calcRarity(targetFood.name)

  const targetDisplay = displayItems.find(d => d.originalName === targetFood.name)
    || { displayName: targetFood.name, originalName: targetFood.name }
  const targetIndex = displayItems.indexOf(targetDisplay)

  const stopCycle = REPEAT_COUNT - 3
  const stopGlobalIndex = stopCycle * displayItems.length + (targetIndex >= 0 ? targetIndex : 0)
  const centerOffset = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT
  const targetY = -(stopGlobalIndex * ITEM_HEIGHT) + centerOffset

  // Reset
  stripEl.value.style.transition = 'none'
  stripEl.value.style.transform = 'translateY(0)'
  void stripEl.value.offsetHeight

  // Spin duration: 2200~3200ms, SSR +400ms
  const baseDuration = 2200 + Math.random() * 1000
  const duration = rarity === 'SSR' ? baseDuration + 400 : baseDuration

  stripEl.value.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.82, 0.22, 1.02)`
  stripEl.value.style.transform = `translateY(${targetY}px)`

  return new Promise(resolve => {
    setTimeout(() => {
      addRecord(targetFood.name, rarity)
      emit('result', { food: targetFood, rarity, displayName: targetDisplay.displayName })

      fetchPairing(targetFood.name).then(pairings => {
        if (pairings) emit('pairing', { food: targetFood.name, pairings })
      })

      resolve({ food: targetFood, rarity })
    }, duration)
  })
}

defineExpose({ rebuild, spin })
</script>

<style scoped>
.slot-wrapper {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.slot-machine {
  position: relative;
  width: 300px;
  height: calc(88px * 3);
  border-radius: 24px;
  overflow: hidden;
  background: #0D1117;
  box-shadow:
    0 0 0 3px #FF7A00,
    0 0 0 6px #1F2937,
    0 0 40px rgba(255,122,0,0.3),
    0 8px 32px rgba(0,0,0,0.5);
}

.slot-window {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.slot-strip {
  will-change: transform;
}

.slot-item {
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #F9FAFB;
  background: #111827;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  user-select: none;
  padding: 0 12px;
  text-align: center;
  line-height: 1.3;
}

.rarity-item-R   { color: #93C5FD; }
.rarity-item-SR  { color: #C084FC; }
.rarity-item-SSR { color: #FDE68A; text-shadow: 0 0 8px rgba(255,215,0,0.6); }

.slot-indicator {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  height: 90px;
  border-top: 2px solid rgba(255,122,0,0.8);
  border-bottom: 2px solid rgba(255,122,0,0.8);
  pointer-events: none;
  z-index: 10;
  background: linear-gradient(
    to bottom,
    rgba(255,122,0,0.05) 0%,
    transparent 30%,
    transparent 70%,
    rgba(255,122,0,0.05) 100%
  );
}

.indicator-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #FF7A00;
  font-size: 16px;
}
.indicator-arrow.left  { left: 8px; }
.indicator-arrow.right { right: 8px; }
</style>
