<template>
  <div class="pairing-area glass">
    <div class="pairing-title">建议搭配</div>
    <div class="pairing-options">
      <button
        v-for="(p, i) in pairings"
        :key="i"
        class="pairing-chip"
        :class="{ selected: selectedIndex === i }"
        @click="toggle(i)"
      >
        <span class="pairing-name">{{ p.pairing }}</span>
        <span class="pairing-cal">+{{ p.calories }}千卡</span>
      </button>
    </div>
    <div v-if="selectedIndex !== null" class="pairing-reason">
      {{ pairings[selectedIndex]?.reason }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../composables/useToast.js'

const props = defineProps({
  food:     { type: String, required: true },
  pairings: { type: Array, default: () => [] },
})

const { showToast } = useToast()
const selectedIndex = ref(null)

function toggle(i) {
  if (selectedIndex.value === i) {
    selectedIndex.value = null
  } else {
    selectedIndex.value = i
    showToast(`已搭配：${props.food} + ${props.pairings[i].pairing}`)
  }
}
</script>

<style scoped>
.pairing-area {
  width: 100%;
  border-radius: 16px;
  padding: 12px 14px;
}

.pairing-title {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 8px;
}

.pairing-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pairing-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid rgba(34,211,238,0.4);
  background: rgba(34,211,238,0.06);
  color: #22D3EE;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 44px;
}

.pairing-chip.selected {
  background: rgba(34,211,238,0.2);
  border-color: #22D3EE;
}

.pairing-chip:active { transform: scale(0.96); }

.pairing-cal {
  font-size: 11px;
  opacity: 0.7;
}

.pairing-reason {
  margin-top: 8px;
  font-size: 12px;
  color: #9CA3AF;
  line-height: 1.5;
}
</style>
