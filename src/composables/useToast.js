import { ref } from 'vue'

const toasts = ref([])
let _id = 0

export function useToast() {
  function showToast(msg, duration = 2200) {
    const id = ++_id
    toasts.value.push({ id, msg })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }
  return { toasts, showToast }
}
