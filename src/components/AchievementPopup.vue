<template>
  <teleport to="body">
    <transition name="achievement-popup">
      <div v-if="achievement" class="achievement-popup">
        <div class="achievement-inner">
          <div class="achievement-icon">🏆</div>
          <div class="achievement-content">
            <div class="achievement-label">成就解锁</div>
            <div class="achievement-name">{{ achievement.name }}</div>
            <div class="achievement-condition">{{ achievement.condition }}</div>
          </div>
          <div class="achievement-rarity" :class="`rarity-${rarityKey}`">
            {{ achievement.rarity }}
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  achievement: { type: Object, default: null },
})

const RARITY_MAP = { '普通': 'N', '稀有': 'R', '史诗': 'SR', '传说': 'SSR' }
const rarityKey = computed(() => RARITY_MAP[props.achievement?.rarity] || 'N')
</script>

<style scoped>
.achievement-popup {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  width: calc(100% - 32px);
  max-width: 440px;
}
.achievement-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(17,24,39,0.95);
  border: 1px solid rgba(255,215,0,0.4);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.15);
}
.achievement-icon { font-size: 28px; flex-shrink: 0; }
.achievement-content { flex: 1; min-width: 0; }
.achievement-label { font-size: 11px; color: #FFD700; font-weight: 700; letter-spacing: 1px; margin-bottom: 2px; }
.achievement-name { font-size: 16px; font-weight: 800; color: #F9FAFB; }
.achievement-condition { font-size: 12px; color: #9CA3AF; margin-top: 2px; }
.achievement-rarity {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 10px;
  border: 1.5px solid;
  flex-shrink: 0;
}
.rarity-N  { color: #9CA3AF; border-color: #9CA3AF; }
.rarity-R  { color: #3B82F6; border-color: #3B82F6; }
.rarity-SR { color: #A855F7; border-color: #A855F7; }
.rarity-SSR{ color: #FFD700; border-color: #FFD700; }

.achievement-popup-enter-active { transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.achievement-popup-leave-active { transition: all 0.3s ease-in; }
.achievement-popup-enter-from   { opacity: 0; transform: translateX(-50%) translateY(24px); }
.achievement-popup-leave-to     { opacity: 0; transform: translateX(-50%) translateY(16px); }
</style>
