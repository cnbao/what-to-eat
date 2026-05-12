<template>
  <div class="delivery-btns">
    <div class="delivery-label">去点外卖</div>
    <div class="delivery-row">
      <button
        v-for="p in visiblePlatforms"
        :key="p.key"
        class="delivery-btn"
        :style="{ '--platform-color': p.color }"
        @click="openPlatform(p)"
      >
        <span class="platform-icon">{{ p.icon }}</span>
        <span class="platform-name">{{ p.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useToast } from '../composables/useToast.js'

const props = defineProps({
  foodName:          { type: String, required: true },
  enabledPlatforms:  { type: Array, default: () => ['meituan', 'eleme', 'jd', 'taobao'] },
})

const { showToast } = useToast()

const PLATFORMS = [
  {
    key: 'meituan',
    name: '美团',
    icon: '🛵',
    color: '#FFD100',
    scheme: (food) => `imeituan://www.meituan.com/search?query=${encodeURIComponent(food)}`,
    fallback: (food) => `https://h5.waimai.meituan.com/waimai/mindex/home?search=${encodeURIComponent(food)}`,
  },
  {
    key: 'eleme',
    name: '饿了么',
    icon: '🦋',
    color: '#0099FF',
    scheme: (food) => `eleme://home?searchText=${encodeURIComponent(food)}`,
    fallback: (food) => `https://h5.ele.me/search/?keyword=${encodeURIComponent(food)}`,
  },
  {
    key: 'jd',
    name: '京东',
    icon: '🐶',
    color: '#E1251B',
    scheme: (food) => `openapp.jdmobile://virtual?params=${encodeURIComponent(JSON.stringify({ des: 'food', keyword: food }))}`,
    fallback: (food) => `https://search.jd.com/Search?keyword=${encodeURIComponent(food)}`,
  },
  {
    key: 'taobao',
    name: '淘宝',
    icon: '🛒',
    color: '#FF6600',
    scheme: (food) => `taobao://s.taobao.com/search?q=${encodeURIComponent(food)}`,
    fallback: (food) => `https://s.taobao.com/search?q=${encodeURIComponent(food)}`,
  },
]

const visiblePlatforms = computed(() =>
  PLATFORMS.filter(p => props.enabledPlatforms.includes(p.key))
)

async function openPlatform(platform) {
  // 先复制到剪贴板
  try {
    await navigator.clipboard.writeText(props.foodName)
    showToast('已复制，打开 App 搜索粘贴即可')
  } catch {
    showToast('已复制食物名')
  }

  // 尝试 scheme 跳转，失败则 fallback
  const schemeUrl = platform.scheme(props.foodName)
  const fallbackUrl = platform.fallback(props.foodName)

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  let opened = false
  const timer = setTimeout(() => {
    if (!opened) window.open(fallbackUrl, '_blank')
    document.body.removeChild(iframe)
  }, 1200)

  document.addEventListener('visibilitychange', function handler() {
    if (document.hidden) {
      opened = true
      clearTimeout(timer)
      document.body.removeChild(iframe)
      document.removeEventListener('visibilitychange', handler)
    }
  })

  iframe.src = schemeUrl
}
</script>

<style scoped>
.delivery-btns {
  margin-top: 12px;
}

.delivery-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 8px;
  text-align: center;
}

.delivery-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.delivery-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border: 1.5px solid var(--platform-color);
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  color: #F9FAFB;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 44px;
}

.delivery-btn:active {
  background: rgba(255,255,255,0.1);
  transform: scale(0.96);
}

.platform-icon { font-size: 16px; }
.platform-name { font-size: 13px; }
</style>
