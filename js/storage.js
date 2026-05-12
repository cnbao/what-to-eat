const KEYS = {
  foods: 'wte_foods',
  records: 'wte_records',
  aiSettings: 'wte_ai_settings',
  prompts: 'wte_prompts',
  favorites: 'wte_favorites',
  prefixes: 'wte_prefixes',
  achievements: 'wte_achievements',
  pairings: 'wte_pairings',
};

const DEFAULT_FOODS = [
  { name: '湖南牛肉粉', tag: '湘味粉面' },
  { name: '螺蛳粉', tag: '广西粉面' },
  { name: '甘肃麻辣烫', tag: '西北小吃' },
  { name: '冒菜', tag: '川味小吃' },
  { name: '兰州牛肉面', tag: '西北面食' },
  { name: '油泼面', tag: '陕西面食' },
  { name: '肉夹馍', tag: '陕西面食' },
  { name: '黄焖鸡米饭', tag: '鲁味盖浇' },
  { name: '酸菜鱼米饭', tag: '川味盖浇' },
  { name: '沙县拌面', tag: '闽味小吃' },
  { name: '煲仔饭', tag: '粤式饭类' },
  { name: '叉烧饭', tag: '粤式饭类' },
  { name: '日式拉面', tag: '日式料理' },
  { name: '咖喱饭', tag: '日式料理' },
  { name: '韩式拌饭', tag: '韩式料理' },
  { name: '粥+小菜', tag: '粤式粥品' },
  { name: '小米粥+饼', tag: '北方粥品' },
  { name: '麻辣香锅', tag: '川味小吃' },
  { name: '烤肉饭', tag: '快餐烤制' },
  { name: '炸鸡汉堡', tag: '西式快餐' },
];

const DEFAULT_PREFIXES = [
  '艾泽拉斯的', '暗黑破坏', '赛博朋克', '进击的', '史诗级',
  '传说之', '龙裔的', '刺客信条的', '来自星际的', '黑客帝国的',
  '终结者的', '漫威级', '咒术回战级', '鬼灭级', '新世纪的',
  '传送门级', '核弹级', '绝绝子', '天花板级', '降维打击的',
  '尊嘟假嘟的', 'DC暗黑', '魔兽级的', '三角洲的', '无畏契约的',
  '燕云十六声的', '星际穿越的', '量子级的', '降服人心的', '氪星级的',
];

const DEFAULT_PROMPTS = {
  achievementPrompt: `你是一个游戏成就系统的设计师，精通魔兽世界、Dota2、三角洲行动、无畏契约、燕云十六声等游戏的成就命名风格。

根据以下一周饮食数据，为用户生成3-5个吃饭成就。

要求：
1. 成就名称参考上述游戏的成就命名风格，但食物化。如"碳水征途·连吃五碗面""火锅征服者""来自柳州的执念""粥行天下"
2. 每个成就包含：成就名、解锁条件描述、稀有度（普通/稀有/史诗/传说）
3. 语气要酷，有游戏感
4. 返回严格的JSON数组，每个元素包含name、condition、rarity字段

一周饮食数据：
{records}`,

  healthPrompt: `你是一个专业的营养师朋友。根据以下一周饮食数据，完成两个任务：

【热量估算】
- 估算每天大致摄入热量（千卡）
- 判断整体热量水平是偏高/正常/偏低

【健康建议】
- 指出当前饮食中可能缺乏的营养类别（蔬菜、蛋白质、粗粮等）
- 给出3个具体的今日推荐菜品，兼顾营养和口味
- 如果热量偏高，建议如何调整

一周饮食数据：
{records}`,

  tagPrompt: `请为以下食物列表中的每个食物打一个类型标签。

标签体系参考（可自行扩展）：陕西面食、湘味粉面、广西粉面、西北面食、西北小吃、川味小吃、川味盖浇、鲁味盖浇、闽味小吃、粤式饭类、粤式粥品、北方粥品、日式料理、韩式料理、快餐烤制、西式快餐、饮品甜点、其他

返回严格的JSON数组格式，每个元素包含name和tag字段。
示例：[{"name":"油泼面","tag":"陕西面食"},{"name":"螺蛳粉","tag":"广西粉面"}]

食物列表：
{foods}`,

  prefixPrompt: `请生成30个有趣的中文食物前缀，参考知名电影、游戏、动漫的经典梗。

风格参考：
- 游戏：艾泽拉斯的、暗黑破坏、赛博朋克、传送门、核弹级、传说之、史诗级、龙裔的、刺客信条的
- 电影：来自星际的、黑客帝国的、终结者的、漫威级、DC暗黑
- 动漫：进击的、咒术回战级、鬼灭级、赛博的、新世纪的
- 梗文化：尊嘟假嘟的、绝绝子、天花板级、降维打击的、降服人心的

要求：
1. 2-5个字
2. 搭配食物名要好笑且顺口，如"艾泽拉斯的螺蛳粉""进击的煲仔饭"
3. 多样化：游戏、电影、动漫、网络梗各约1/4
4. 返回严格的JSON数组，只包含字符串
示例：["艾泽拉斯的","进击的","赛博朋克","史诗级"]`,

  pairingPrompt: `你是一个了解中国各地饮食文化的美食顾问。根据给定的食物，推荐2-3个最常见、最地道的搭配。

要求：
1. 搭配要符合当地饮食习惯，如肉夹馍配凉皮/稀饭，火锅配冰粉/米饭，螺蛳粉配炸蛋/鸭脚
2. 简短说明为什么要这样搭配（一句话）
3. 估算该搭配增加的大致热量（千卡），帮助用户了解摄入
4. 返回严格的JSON数组，每个元素包含pairing、reason、calories字段
示例：[{"pairing":"凉皮","reason":"陕西三件套，馍皮稀饭缺一不可","calories":200},{"pairing":"稀饭","reason":"解腻标配","calories":80}]

食物：{food}`,
};

// 具体标签 -> 大类 -> 口味 映射
const TAG_MAP = {
  '陕西面食': { category: '面食', flavor: '咸香' },
  '西北面食': { category: '面食', flavor: '咸香' },
  '湘味粉面': { category: '粉类', flavor: '辣味' },
  '广西粉面': { category: '粉类', flavor: '辣味' },
  '西北小吃': { category: '小吃', flavor: '辣味' },
  '川味小吃': { category: '小吃', flavor: '辣味' },
  '川味盖浇': { category: '米饭', flavor: '辣味' },
  '鲁味盖浇': { category: '米饭', flavor: '咸香' },
  '闽味小吃': { category: '小吃', flavor: '清淡' },
  '粤式饭类': { category: '米饭', flavor: '清淡' },
  '粤式粥品': { category: '粥品', flavor: '清淡' },
  '北方粥品': { category: '粥品', flavor: '清淡' },
  '日式料理': { category: '其他', flavor: '清淡' },
  '韩式料理': { category: '其他', flavor: '辣味' },
  '快餐烤制': { category: '快餐', flavor: '咸香' },
  '西式快餐': { category: '快餐', flavor: '咸香' },
  '饮品甜点': { category: '甜品', flavor: '酸甜' },
  '其他': { category: '其他', flavor: '咸香' },
};

function _read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function _write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}

function _initDefaults() {
  if (!_read(KEYS.foods, null)) _write(KEYS.foods, DEFAULT_FOODS);
  if (!_read(KEYS.prefixes, null)) _write(KEYS.prefixes, DEFAULT_PREFIXES);
  if (!_read(KEYS.prompts, null)) _write(KEYS.prompts, DEFAULT_PROMPTS);
  if (!_read(KEYS.records, null)) _write(KEYS.records, []);
  if (!_read(KEYS.favorites, null)) _write(KEYS.favorites, []);
  if (!_read(KEYS.achievements, null)) _write(KEYS.achievements, []);
  if (!_read(KEYS.pairings, null)) _write(KEYS.pairings, {});
  if (!_read(KEYS.aiSettings, null)) {
    _write(KEYS.aiSettings, {
      provider: 'deepseek',
      apiKeys: {},
      customEndpoint: '',
      customModel: '',
    });
  }
}

// Foods
export function getFoods() { return _read(KEYS.foods, DEFAULT_FOODS); }
export function setFoods(foods) { _write(KEYS.foods, foods); }
export function addFood(name, tag = '其他') {
  const foods = getFoods();
  if (foods.some(f => f.name === name)) return false;
  foods.push({ name, tag });
  setFoods(foods);
  return true;
}
export function removeFood(name) {
  const foods = getFoods();
  if (foods.length <= 3) return false;
  setFoods(foods.filter(f => f.name !== name));
  return true;
}

// Records
export function getRecords(days = 7) {
  const records = _read(KEYS.records, []);
  if (days <= 0) return records;
  const cutoff = Date.now() - days * 86400000;
  return records.filter(r => r.time >= cutoff);
}
export function addRecord(food) {
  const records = _read(KEYS.records, []);
  records.push({ date: new Date().toISOString().slice(0, 10), food, time: Date.now() });
  _write(KEYS.records, records);
}

// AI Settings
export function getAISettings() { return _read(KEYS.aiSettings, { provider: 'deepseek', apiKeys: {}, customEndpoint: '', customModel: '' }); }
export function setAISettings(settings) { _write(KEYS.aiSettings, settings); }
export function hasAPIKey() {
  const s = getAISettings();
  const key = s.apiKeys[s.provider];
  return !!(key && key.trim());
}

// Prompts
export function getPrompts() { return _read(KEYS.prompts, DEFAULT_PROMPTS); }
export function setPrompts(prompts) { _write(KEYS.prompts, prompts); }
export function getDefaultPrompts() { return { ...DEFAULT_PROMPTS }; }

// Favorites
export function getFavorites() { return _read(KEYS.favorites, []); }
export function setFavorites(favs) { _write(KEYS.favorites, favs); }

// Prefixes
export function getPrefixes() { return _read(KEYS.prefixes, DEFAULT_PREFIXES); }
export function setPrefixes(prefixes) { _write(KEYS.prefixes, prefixes); }
export function getDefaultPrefixes() { return [...DEFAULT_PREFIXES]; }

// Achievements
export function getAchievements() { return _read(KEYS.achievements, []); }
export function addAchievements(newAch) {
  const achs = getAchievements();
  newAch.forEach(a => achs.push({ ...a, date: new Date().toISOString().slice(0, 10) }));
  _write(KEYS.achievements, achs);
}

// Pairings cache
export function getPairings() { return _read(KEYS.pairings, {}); }
export function setPairing(food, data) {
  const pairings = getPairings();
  pairings[food] = data;
  _write(KEYS.pairings, pairings);
}

// Tag helpers
export function getTagCategory(tag) { return TAG_MAP[tag]?.category || '其他'; }
export function getTagFlavor(tag) { return TAG_MAP[tag]?.flavor || '咸香'; }
export function getTagMap() { return TAG_MAP; }

export function getFoodsGroupByCategory() {
  const foods = getFoods();
  const groups = {};
  foods.forEach(f => {
    const cat = getTagCategory(f.tag);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(f);
  });
  return groups;
}

// Init
_initDefaults();
