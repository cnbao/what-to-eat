import { ref } from 'vue'
import { getAchievements, addAchievements } from '../services/storage.js'

// 全局成就弹窗队列
const pendingPopup = ref(null)

export function useAchievements() {
  const achievements = ref(getAchievements())

  function refresh() {
    achievements.value = getAchievements()
  }

  function unlockAchievements(list) {
    addAchievements(list)
    refresh()
    // 逐个弹窗
    list.forEach((a, i) => {
      setTimeout(() => {
        pendingPopup.value = a
        setTimeout(() => { pendingPopup.value = null }, 2800)
      }, i * 3200)
    })
  }

  return { achievements, pendingPopup, refresh, unlockAchievements }
}
