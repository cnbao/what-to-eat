<template>
  <div class="gacha-view">
    <!-- 食神签 -->
    <FortuneCard />

    <!-- 运势 -->
    <DestinyCard />

    <!-- 模式切换 -->
    <div class="mode-switch">
      <button
        class="mode-btn"
        :class="{ active: mode === 'single' }"
        @click="mode = 'single'"
      >🎰 命运单抽</button>
      <button
        class="mode-btn"
        :class="{ active: mode === 'ten' }"
        @click="mode = 'ten'"
      >✨ 宇宙十连</button>
    </div>

    <!-- 单抽 -->
    <div v-if="mode === 'single'">
      <SlotMachine ref="slotRef" @result="onSingleResult" @pairing="onPairing" />

      <button
        class="btn-cyber spin-btn"
        :disabled="spinning"
        @click="doSpin"
      >
        <span v-if="spinning" class="spin-loading">转动命运中…</span>
        <span v-else>开选！</span>
      </button>

      <!-- 单抽结果 -->
      <transition name="result-pop">
        <div v-if="singleResult" class="result-area">
          <div class="result-rarity" :class="`rarity-text-${singleResult.rarity}`">
            {{ singleResult.rarity }}
          </div>
          <div class="result-food" :class="`rarity-text-${singleResult.rarity}`">
            今天吃 {{ singleResult.food.name }}！
          </div>
          <FoodCard
            :food-name="singleResult.food.name"
            :display-name="singleResult.displayName"
            :rarity="singleResult.rarity"
            :tag="singleResult.food.tag"
            :image-url="foodImageUrl"
            class="result-card"
          />
          <PairingArea v-if="pairingData" :food="singleResult.food.name" :pairings="pairingData" />
          <DeliveryButtons :food-name="singleResult.food.name" />
        </div>
      </transition>
    </div>

    <!-- 十连 -->
    <div v-if="mode === 'ten'">
      <TenPull ref="tenRef" @confirmed="onTenConfirmed" @pairing="onPairing" />
      <button
        class="btn-cyber spin-btn"
        :disabled="tenSpinning"
        @click="doTen"
      >
        <span v-if="tenSpinning">抽取中…</span>
        <span v-else>宇宙十连！</span>
      </button>

      <transition name="result-pop">
        <div v-if="tenResult" class="result-area">
          <div class="result-food" :class="`rarity-text-${tenResult.rarity}`">
            今天吃 {{ tenResult.food.name }}！
          </div>
          <PairingArea v-if="pairingData" :food="tenResult.food.name" :pairings="pairingData" />
          <DeliveryButtons :food-name="tenResult.food.name" />
        </div>
      </transition>
    </div>

    <!-- 成就预览 -->
    <AchievementsPreview @unlock="onUnlockAchievements" />

    <!-- SSR 特效 -->
    <SSREffect :active="ssrActive" :food-name="ssrFoodName" @done="ssrActive = false" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import SlotMachine from '../components/SlotMachine.vue'
import TenPull from '../components/TenPull.vue'
import FoodCard from '../components/FoodCard.vue'
import SSREffect from '../components/SSREffect.vue'
import DeliveryButtons from '../components/DeliveryButtons.vue'
import FortuneCard from '../components/FortuneCard.vue'
import DestinyCard from '../components/DestinyCard.vue'
import PairingArea from '../components/PairingArea.vue'
import AchievementsPreview from '../components/AchievementsPreview.vue'
import { getImageCache, blobToDataURL } from '../services/imageCache.js'
import { generateFoodImage } from '../services/aiService.js'
import { getPrompts, hasImageAPIKey } from '../services/storage.js'

const mode = ref('single')
const slotRef = ref(null)
const tenRef = ref(null)
const spinning = ref(false)
const tenSpinning = ref(false)
const singleResult = ref(null)
const tenResult = ref(null)
const pairingData = ref(null)
const foodImageUrl = ref('')
const ssrActive = ref(false)
const ssrFoodName = ref('')

async function loadFoodImage(foodName) {
  foodImageUrl.value = ''
  try {
    const cached = await getImageCache(foodName)
    if (cached) {
      foodImageUrl.value = await blobToDataURL(cached)
      return
    }
    if (!hasImageAPIKey()) return
    const prompts = getPrompts()
    const blob = await generateFoodImage(foodName, '', prompts.imagePrompt)
    if (blob) {
      const { setImageCache } = await import('../services/imageCache.js')
      await setImageCache(foodName, blob)
      foodImageUrl.value = await blobToDataURL(blob)
    }
  } catch {}
}

async function doSpin() {
  if (spinning.value || !slotRef.value) return
  spinning.value = true
  singleResult.value = null
  pairingData.value = null
  foodImageUrl.value = ''
  await slotRef.value.spin()
  spinning.value = false
}

function onSingleResult(result) {
  singleResult.value = result
  if (result.rarity === 'SSR') {
    ssrFoodName.value = result.food.name
    ssrActive.value = true
  }
  loadFoodImage(result.food.name)
}

function doTen() {
  if (tenSpinning.value || !tenRef.value) return
  tenSpinning.value = true
  tenResult.value = null
  pairingData.value = null
  tenRef.value.startDraw()
  setTimeout(() => { tenSpinning.value = false }, 10 * 180 + 600)
}

function onTenConfirmed(result) {
  tenResult.value = result
  if (result.rarity === 'SSR') {
    ssrFoodName.value = result.food.name
    ssrActive.value = true
  }
}

function onPairing({ food, pairings }) {
  pairingData.value = pairings
}

function onUnlockAchievements() {
  // 刷新成就预览由 AchievementsPreview 内部处理
}

// 切换模式时重置
watch(mode, () => {
  singleResult.value = null
  tenResult.value = null
  pairingData.value = null
  foodImageUrl.value = ''
})
</script>

<style scoped>
.gacha-view {
  padding: 12px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-switch {
  display: flex;
  gap: 8px;
  background: rgba(31,41,55,0.6);
  border-radius: 14px;
  padding: 4px;
}

.mode-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.mode-btn.active {
  background: #FF7A00;
  color: #fff;
  box-shadow: 0 2px 12px rgba(255,122,0,0.4);
}

.spin-btn {
  width: 100%;
  margin-top: 4px;
}

.result-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.result-rarity {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 3px;
}

.result-food {
  font-size: 26px;
  font-weight: 900;
  text-align: center;
}

.rarity-text-N   { color: #9CA3AF; }
.rarity-text-R   { color: #3B82F6; }
.rarity-text-SR  { color: #A855F7; }
.rarity-text-SSR { color: #FFD700; text-shadow: 0 0 16px rgba(255,215,0,0.5); }

.result-card {
  max-width: 200px;
}

.result-pop-enter-active { transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.result-pop-leave-active { transition: all 0.2s ease-in; }
.result-pop-enter-from   { opacity: 0; transform: scale(0.8) translateY(16px); }
.result-pop-leave-to     { opacity: 0; }

.spin-loading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
