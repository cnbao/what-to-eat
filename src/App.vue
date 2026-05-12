<template>
  <div id="app-root">
    <!-- 背景粒子 -->
    <div class="bg-particles">
      <div v-for="i in 30" :key="i" class="particle" :style="particleStyle(i)" />
    </div>

    <!-- 顶部标题栏 -->
    <header class="app-header">
      <span class="header-title">今天吃什么？</span>
      <span class="header-sub">赛博抽卡</span>
    </header>

    <!-- 主内容区 -->
    <main class="view-container">
      <transition name="page">
        <GachaView    v-if="activeTab === 'gacha'"     key="gacha" />
        <FavoritesView v-else-if="activeTab === 'fav'" key="fav" />
        <StatsView    v-else-if="activeTab === 'stats'" key="stats" />
        <RoastView    v-else-if="activeTab === 'roast'" key="roast" />
        <SettingsView v-else-if="activeTab === 'settings'" key="settings" @rebuilt="onRebuilt" />
      </transition>
    </main>

    <!-- 底部 Tab 栏 -->
    <nav class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- 全局 Toast -->
    <ToastLayer />

    <!-- 成就弹窗 -->
    <AchievementPopup :achievement="pendingPopup" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GachaView from './views/GachaView.vue'
import FavoritesView from './views/FavoritesView.vue'
import StatsView from './views/StatsView.vue'
import RoastView from './views/RoastView.vue'
import SettingsView from './views/SettingsView.vue'
import ToastLayer from './components/ToastLayer.vue'
import AchievementPopup from './components/AchievementPopup.vue'
import { useAchievements } from './composables/useAchievements.js'

const { pendingPopup } = useAchievements()

const activeTab = ref('gacha')

const tabs = [
  { key: 'gacha',    icon: '🎰', label: '抽卡' },
  { key: 'fav',      icon: '❤️', label: '偏好' },
  { key: 'stats',    icon: '📊', label: '统计' },
  { key: 'roast',    icon: '🤖', label: '点评' },
  { key: 'settings', icon: '⚙️', label: '设置' },
]

function onRebuilt() {
  // 食物列表更新后可触发抽卡重建，通过 GachaView 内部 ref 处理
}

function particleStyle(i) {
  const size = 1 + (i % 3)
  const x = (i * 37) % 100
  const y = (i * 53) % 100
  const duration = 20 + (i % 15)
  const delay = -(i * 1.3)
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity: 0.15 + (i % 5) * 0.06,
  }
}
</script>

<style scoped>
#app-root {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #111827;
  overflow: hidden;
}

/* 背景粒子 */
.bg-particles {
  position: fixed;
  inset: 0;
  max-width: 480px;
  margin: 0 auto;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: #FF7A00;
  animation: float linear infinite;
}

@keyframes float {
  0%   { transform: translateY(0) translateX(0); }
  25%  { transform: translateY(-20px) translateX(10px); }
  50%  { transform: translateY(-8px) translateX(-8px); }
  75%  { transform: translateY(-24px) translateX(6px); }
  100% { transform: translateY(0) translateX(0); }
}

/* Header */
.app-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 14px 20px 12px;
  background: rgba(17,24,39,0.9);
  border-bottom: 1px solid rgba(255,122,0,0.2);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.header-title {
  font-size: 22px;
  font-weight: 900;
  color: #FF7A00;
  letter-spacing: 2px;
}

.header-sub {
  font-size: 11px;
  color: #22D3EE;
  font-weight: 700;
  letter-spacing: 2px;
  border: 1px solid rgba(34,211,238,0.4);
  padding: 2px 8px;
  border-radius: 8px;
}

/* View Container */
.view-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
  padding-bottom: 70px;
}

/* Tab Bar */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  background: rgba(17,24,39,0.95);
  border-top: 1px solid rgba(255,122,0,0.2);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  backdrop-filter: blur(12px);
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 0;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 56px;
}

.tab-icon {
  font-size: 20px;
  line-height: 1;
  transition: transform 0.2s;
}

.tab-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 600;
  transition: color 0.2s;
}

.tab-btn.active .tab-label { color: #FF7A00; }
.tab-btn.active .tab-icon  { transform: scale(1.15); }

/* Page transition */
.page-enter-active { transition: all 0.3s ease-out; }
.page-leave-active { transition: all 0.2s ease-in; position: absolute; width: 100%; }
.page-enter-from   { opacity: 0; transform: translateY(10px); }
.page-leave-to     { opacity: 0; transform: translateY(-6px); }
</style>
