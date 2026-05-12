import { getFoods, getFavorites, getPrefixes, getTagCategory, getTagFlavor, addRecord, getPairings, setPairing, hasAPIKey, getPrompts, calcRarity } from './storage.js'
import { simpleChat, extractJSON } from './aiService.js'

// 偏好加权随机算法（三层漂移）
export function weightedRandom(foods, favorites) {
  if (!favorites || favorites.length === 0) {
    return foods[Math.floor(Math.random() * foods.length)]
  }

  const freq = {}
  favorites.forEach(f => { freq[f] = (freq[f] || 0) + 1 })
  const uniqueFavs = Object.keys(freq)
  const totalSlots = favorites.length

  const weights = foods.map(food => {
    let w = 0
    const foodCat = getTagCategory(food.tag)
    const foodFlavor = getTagFlavor(food.tag)

    Object.entries(freq).forEach(([favName, count]) => {
      const favFood = foods.find(f => f.name === favName)
      if (!favFood) return
      const favCat = getTagCategory(favFood.tag)
      const favFlavor = getTagFlavor(favFood.tag)
      const ratio = count / totalSlots

      if (food.name === favName) {
        w += uniqueFavs.length === 1 ? 0.6 : ratio * 0.6
      } else if (foodCat === favCat && favCat !== '其他') {
        w += ratio * 0.2
      } else if (foodFlavor === favFlavor && favFlavor !== '咸香') {
        w += ratio * 0.1
      }
    })
    return w
  })

  const hasAnyWeight = weights.some(w => w > 0)
  const otherWeight = hasAnyWeight ? 0.2 / Math.max(1, foods.length) : 1 / foods.length
  const finalWeights = weights.map(w => w + (w === 0 ? otherWeight : w * 0.05))
  const total = finalWeights.reduce((a, b) => a + b, 0)
  const normalized = finalWeights.map(w => w / total)

  let rand = Math.random()
  for (let i = 0; i < foods.length; i++) {
    rand -= normalized[i]
    if (rand <= 0) return foods[i]
  }
  return foods[foods.length - 1]
}

export function buildDisplayItems(foods) {
  const prefixes = getPrefixes()
  const items = []
  const target = Math.max(foods.length, 18)

  while (items.length < target * 2) {
    foods.forEach(food => {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      items.push({ displayName: `${prefix}${food.name}`, originalName: food.name })
    })
  }
  return items.slice(0, target * 2)
}

// 十连：抽取10个食物（允许重复，按权重）
export function drawTen(foods, favorites) {
  const results = []
  for (let i = 0; i < 10; i++) {
    const food = weightedRandom(foods, favorites)
    const rarity = calcRarity(food.name)
    const prefixes = getPrefixes()
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    results.push({
      food,
      rarity,
      displayName: `${prefix}${food.name}`,
    })
  }
  return results
}

export async function fetchPairing(food) {
  const cache = getPairings()
  if (cache[food]) return cache[food]
  if (!hasAPIKey()) return null

  try {
    const prompts = getPrompts()
    const userPrompt = prompts.pairingPrompt.replace('{food}', food)
    const result = await simpleChat(prompts.pairingPrompt, userPrompt, 0.5)
    const parsed = extractJSON(result)
    if (parsed && Array.isArray(parsed)) {
      setPairing(food, parsed)
      return parsed
    }
  } catch (e) {
    console.warn('Failed to fetch pairing:', e)
  }
  return null
}
