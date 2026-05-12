import { getFoods, setFoods, getPrompts, hasAPIKey } from './storage.js';
import { simpleChat } from './ai-service.js';

function extractJSON(text) {
  // Try to find JSON array in the response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function tagAllFoods(onProgress) {
  if (!hasAPIKey()) throw new Error('请先在设置中配置 API Key');

  const foods = getFoods();
  const prompts = getPrompts();
  const foodNames = foods.map(f => f.name).join('、');

  const userPrompt = prompts.tagPrompt.replace('{foods}', foodNames);

  if (onProgress) onProgress('正在分析食物分类...');

  const result = await simpleChat(prompts.tagPrompt, userPrompt, 0.3);
  const parsed = extractJSON(result);

  if (!parsed || !Array.isArray(parsed)) throw new Error('AI 返回格式错误，请重试');

  // Build a name->tag map from AI response
  const tagMap = {};
  parsed.forEach(item => {
    if (item.name && item.tag) tagMap[item.name] = item.tag;
  });

  // Apply tags back to foods
  let updated = 0;
  const updatedFoods = foods.map(f => {
    if (tagMap[f.name]) {
      updated++;
      return { ...f, tag: tagMap[f.name] };
    }
    return f;
  });

  setFoods(updatedFoods);
  if (onProgress) onProgress(`完成！已更新 ${updated} 个食物的标签`);
  return updatedFoods;
}

export async function tagSingleFood(name) {
  if (!hasAPIKey()) return null;

  const prompts = getPrompts();
  const userPrompt = prompts.tagPrompt.replace('{foods}', name);

  const result = await simpleChat(prompts.tagPrompt, userPrompt, 0.3);
  const parsed = extractJSON(result);

  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) return null;
  return parsed[0].tag || null;
}
