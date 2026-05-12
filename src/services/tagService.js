import { getFoods, setFoods, getPrompts } from './storage.js'
import { simpleChat, extractJSON } from './aiService.js'

export async function tagAllFoods(onProgress) {
  const foods = getFoods()
  const names = foods.map(f => f.name).join('、')
  const prompts = getPrompts()
  const userPrompt = prompts.tagPrompt.replace('{foods}', names)

  if (onProgress) onProgress('AI 分析中...')
  const result = await simpleChat(prompts.tagPrompt, userPrompt, 0.3)
  const parsed = extractJSON(result)

  if (!parsed || !Array.isArray(parsed)) throw new Error('AI 返回格式错误')

  const tagMap = {}
  parsed.forEach(item => { if (item.name && item.tag) tagMap[item.name] = item.tag })

  const updated = foods.map(f => ({ ...f, tag: tagMap[f.name] || f.tag }))
  setFoods(updated)
  if (onProgress) onProgress('标签已更新')
  return updated
}

export async function tagSingleFood(name) {
  const prompts = getPrompts()
  const userPrompt = prompts.tagPrompt.replace('{foods}', name)
  const result = await simpleChat(prompts.tagPrompt, userPrompt, 0.3)
  const parsed = extractJSON(result)
  if (parsed && Array.isArray(parsed) && parsed[0]?.tag) return parsed[0].tag
  return null
}
