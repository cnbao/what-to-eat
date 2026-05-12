<template>
  <teleport to="body">
    <div v-if="active" class="ssr-overlay" ref="overlayEl">
      <canvas ref="canvasEl" class="ssr-canvas" />
      <div class="ssr-text">
        <div class="ssr-label">SSR 传说</div>
        <div class="ssr-food-name">{{ foodName }}</div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  active:   { type: Boolean, default: false },
  foodName: { type: String, default: '' },
})

const emit = defineEmits(['done'])
const canvasEl = ref(null)
const overlayEl = ref(null)
let animFrame = null
let particles = []
let startTime = null

function createParticles(canvas) {
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  particles = []
  for (let i = 0; i < 120; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 3 + Math.random() * 8
    const colors = ['#FFD700', '#FFA500', '#FFEC8B', '#FF6B00', '#FFF8DC', '#22D3EE']
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.012 + Math.random() * 0.015,
      gravity: 0.15 + Math.random() * 0.1,
    })
  }
}

function drawFrame(canvas, ctx, elapsed) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles.forEach(p => {
    p.x += p.vx
    p.y += p.vy
    p.vy += p.gravity
    p.vx *= 0.99
    p.alpha -= p.decay
    if (p.alpha <= 0) return
    ctx.save()
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

function triggerVibrate() {
  if (navigator.vibrate) navigator.vibrate([80, 40, 80])
}

function playSSRSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.3, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  } catch {}
}

watch(() => props.active, (val) => {
  if (!val) {
    cancelAnimationFrame(animFrame)
    particles = []
    return
  }

  triggerVibrate()
  playSSRSound()

  setTimeout(() => {
    const canvas = canvasEl.value
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')
    createParticles(canvas)
    startTime = performance.now()

    function loop(now) {
      const elapsed = now - startTime
      drawFrame(canvas, ctx, elapsed)
      if (elapsed < 2400 && particles.some(p => p.alpha > 0)) {
        animFrame = requestAnimationFrame(loop)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        emit('done')
      }
    }
    animFrame = requestAnimationFrame(loop)
  }, 50)
})

onUnmounted(() => cancelAnimationFrame(animFrame))
</script>

<style scoped>
.ssr-overlay {
  position: fixed;
  inset: 0;
  z-index: 9990;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ssr-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.ssr-text {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: ssr-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
}

.ssr-label {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #FFD700;
  text-shadow: 0 0 20px rgba(255,215,0,0.8);
  margin-bottom: 8px;
}

.ssr-food-name {
  font-size: 32px;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 0 0 30px rgba(255,215,0,0.9), 0 0 60px rgba(255,165,0,0.5);
  animation: ssr-scale 1.2s ease-in-out;
}

@keyframes ssr-pop {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes ssr-scale {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
</style>
