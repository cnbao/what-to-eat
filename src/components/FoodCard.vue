<template>
  <div
    class="food-card"
    :class="[`rarity-card-${rarity}`, { 'ssr-card': rarity === 'SSR', 'sr-card': rarity === 'SR' }]"
    :style="cardStyle"
  >
    <!-- 图片区域 -->
    <div class="card-image-area">
      <img v-if="imageUrl" :src="imageUrl" class="card-image" :alt="foodName" />
      <div v-else class="card-placeholder" :class="`placeholder-${rarity}`">
        <div class="placeholder-icon">{{ rarityIcon }}</div>
        <div class="placeholder-name">{{ foodName }}</div>
      </div>
      <!-- 稀有度光效 -->
      <div v-if="rarity === 'SSR'" class="ssr-shine" />
      <div v-if="rarity === 'SR'" class="sr-pulse" />
    </div>

    <!-- 信息区域 -->
    <div class="card-info">
      <div class="card-rarity-badge" :class="`badge-${rarity}`">{{ rarity }}</div>
      <div class="card-food-name">{{ displayName || foodName }}</div>
      <div v-if="showTag && tag" class="card-tag">{{ tag }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  foodName:    { type: String, required: true },
  displayName: { type: String, default: '' },
  rarity:      { type: String, default: 'N' }, // N R SR SSR
  tag:         { type: String, default: '' },
  imageUrl:    { type: String, default: '' },
  showTag:     { type: Boolean, default: false },
})

const RARITY_COLORS = {
  N:   '#9CA3AF',
  R:   '#3B82F6',
  SR:  '#A855F7',
  SSR: '#FFD700',
}

const RARITY_ICONS = { N: '🍜', R: '⭐', SR: '💫', SSR: '👑' }

const rarityIcon = computed(() => RARITY_ICONS[props.rarity] || '🍜')

const cardStyle = computed(() => {
  const color = RARITY_COLORS[props.rarity] || RARITY_COLORS.N
  return {
    '--rarity-color': color,
    '--rarity-color-dim': color + '33',
  }
})
</script>

<style scoped>
.food-card {
  position: relative;
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: #1F2937;
  border: 2px solid var(--rarity-color);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  user-select: none;
}

.food-card:hover { transform: scale(1.03); }
.ssr-card:hover  { transform: scale(1.06); }

.food-card { box-shadow: 0 4px 20px rgba(0,0,0,0.18); }
.rarity-card-R   { box-shadow: 0 0 16px rgba(59,130,246,0.4); }
.rarity-card-SR  { box-shadow: 0 0 20px rgba(168,85,247,0.5); animation: pulse-sr 2s ease-in-out infinite; }
.rarity-card-SSR { box-shadow: 0 0 40px rgba(255,215,0,0.45); }

@keyframes pulse-sr {
  0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.5); }
  50%       { box-shadow: 0 0 35px rgba(168,85,247,0.8); }
}

.card-image-area {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
}

.placeholder-N   { background: linear-gradient(160deg, #1F2937, #111827); }
.placeholder-R   { background: linear-gradient(160deg, #1e3a5f, #111827); }
.placeholder-SR  { background: linear-gradient(160deg, #3b1f5f, #111827); }
.placeholder-SSR { background: linear-gradient(160deg, #3d2e00, #111827); }

.placeholder-icon { font-size: 48px; }
.placeholder-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--rarity-color);
  text-align: center;
  text-shadow: 0 0 12px var(--rarity-color);
}

/* SSR 光晕 */
.ssr-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 30%, rgba(255,215,0,0.15) 50%, transparent 70%);
  animation: shine 2.5s ease-in-out infinite;
}
@keyframes shine {
  0%   { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(200%) rotate(45deg); }
}

/* SR 脉冲边框 */
.sr-pulse {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(168,85,247,0.6);
  border-radius: 16px;
  animation: sr-border 2s ease-in-out infinite;
}
@keyframes sr-border {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}

.card-info {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-rarity-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1.5px solid var(--rarity-color);
  color: var(--rarity-color);
  width: fit-content;
  letter-spacing: 1px;
}

.badge-SSR {
  background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s linear infinite;
  border-color: #FFD700;
}
@keyframes shimmer {
  0%   { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.card-food-name {
  font-size: 15px;
  font-weight: 800;
  color: #F9FAFB;
  line-height: 1.3;
}

.card-tag {
  font-size: 11px;
  color: #6B7280;
}
</style>
