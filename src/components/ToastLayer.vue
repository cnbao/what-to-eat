<template>
  <teleport to="body">
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-item">
        {{ t.msg }}
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'
const { toasts } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  width: max-content;
  max-width: 320px;
}
.toast-item {
  padding: 10px 22px;
  background: rgba(17,24,39,0.92);
  border: 1px solid rgba(255,122,0,0.3);
  color: #F9FAFB;
  border-radius: 24px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.25s ease-in; }
.toast-enter-from   { opacity: 0; transform: translateY(-12px); }
.toast-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>
