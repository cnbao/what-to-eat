# "今天吃什么" 赛博抽卡 H5 游戏

## 产品定位
不做普通美食工具，定位为**吃饭抽卡游戏**。核心价值：情绪价值、摸鱼快乐、随机惊喜与社交分享。

## 技术栈
- **框架**：Vue3 (Composition API + `<script setup>`)
- **样式**：TailwindCSS
- **动画**：GSAP（核心动画）+ Framer Motion（页面动效）
- **粒子**：tsParticles（SSR 出金特效）
- **轻量动画**：Lottie（成就弹窗等）
- **图片缓存**：IndexedDB（AI 生成食物插画永久缓存）
- **构建**：Vite

## 视觉风格
- **整体**：赛博夜市 + 游戏抽卡 UI，**不使用**传统外卖 App 风格
- **日常页面**：克制、高级、留白充足
- **高潮节点**：SSR/成就等关键节点爆发特效
- **食物图片**：统一 AI 游戏插画风格（3:4 比例，512×768，深色渐变背景），不使用真实外卖照片

## 色彩参数
| 用途 | 色值 |
|------|------|
| 背景主色 | #111827（深夜蓝） |
| 主强调色 | #FF7A00（橙） |
| SSR 金色 | #FFD700 |
| 史诗紫色 | #A855F7 |
| 稀有蓝色 | #3B82F6 |
| 普通灰色 | #9CA3AF |
| 危险辣味红 | #EF4444 |
| 赛博青色点缀 | #22D3EE |

## 字体排版
- 中文字体：微软雅黑 / PingFang SC
- 数字字体：DIN / JetBrains Mono
- 主标题：28px~36px | 卡片标题：18px~22px | 正文：14px~16px | 辅助：12px
- 行高：1.5~1.7

## 动画参数
| 参数 | 值 |
|------|-----|
| 老虎机滚动时长 | 2200ms~3200ms |
| 老虎机减速阶段 | 最后 800ms |
| SSR 额外停顿 | +400ms |
| 卡片 hover 放大 | scale(1.03) |
| SSR 卡片 hover | scale(1.06) |
| 普通卡片阴影 | 0 4px 20px rgba(0,0,0,.18) |
| SSR 金色辉光 | 0 0 40px rgba(255,215,0,.45) |
| 玻璃拟态 blur | 10px~18px |
| 全局圆角 | 18px~28px |
| 按钮最低高度 | 52px |
| 最小触控区域 | 44px |
| 页面最大宽度 | 480px |
| 背景粒子 | 20~80 粒子 |
| SSR 爆炸粒子 | 最多 120 粒子 |
| 动画帧率目标 | 60fps |
| 背景动画时长 | 20s+ 缓慢循环 |
| 成就弹窗显示 | 2800ms |
| Toast 动画 | 300ms ease-out |
| 页面切换动画 | 250ms~400ms |

## SSR 出金反馈
| 参数 | 值 |
|------|-----|
| SSR 金光持续 | 1.2s |
| 金光透明度峰值 | 0.8 |
| 卡片放大 | 1 → 1.08 → 1 |
| 震动时长 | 200ms |
| 音效长度 | 0.5s~1.2s |

## 性能约束
- 避免超过 3 层 backdrop-filter
- 避免大面积 blur > 20px
- 避免无限高频背景动画
- SSR 粒子仅关键节点触发
- 优先 transform 动画，减少频繁重绘
- 移动端优先 GPU 加速
- 安卓低端机默认关闭部分高级特效

---

## 双模式玩法

### 命运单抽
直接决定今日饮食。老虎机滚动停下，一个食物 + 稀有度 + 食物插画卡片。SSR 触发出金特效。

### 宇宙十连
抽取 10 个候选食物，用户自主选择。10 张卡片排列，翻转逐张揭示稀有度，最后用户点选一个。

---

## 稀有度系统

| 稀有度 | 颜色 | 概率 | 视觉反馈 |
|--------|------|------|----------|
| 普通 (N) | #9CA3AF 灰 | 50% | 普通卡片，底部微光 |
| 稀有 (R) | #3B82F6 蓝 | 30% | 蓝色边框发光 |
| 史诗 (SR) | #A855F7 紫 | 15% | 紫色脉冲光 + 粒子 |
| 传说 (SSR) | #FFD700 金 | 5% | 金色爆炸粒子 + 震动 + 音效 + 卡片放大 |

稀有度基于食物被选中的频率动态计算：很少吃到的食物稀有度更高，经常吃的更普通。

---

## 核心功能

### 1. 老虎机 / 抽卡引擎
- 命运单抽：单次 spin，CSS + GSAP 动画，偏好加权随机
- 宇宙十连：10 张卡片翻转揭示，用户选择
- 趣味前缀系统：显示名 = 随机前缀 + 原食物名
- 偏好加权随机算法（三层漂移，与统计无关）
- 稀有度计算：基于吃该食物的频率，越少吃越稀有
- SSR 出金特效：tsParticles 金色爆炸粒子 + 震动 + 音效
- 搭配提示：选中后调 AI 推荐搭配（缓存到 IndexedDB）
- **外卖跳转按钮**：选中食物后，下方显示外卖平台快捷按钮
  - 点击按钮：先将食物名复制到剪贴板（Toast提示"已复制，打开App搜索粘贴即可"），然后尝试通过 scheme URL 跳转到对应App
  - 支持平台及 scheme：
    - 美团外卖：`imeituan://www.meituan.com/search?query=食物名`
    - 饿了么：`eleme://home?searchText=食物名`
    - 京东外卖：`openapp.jdmobile://virtual?params={"des":"food","keyword":"食物名"}`
    - 淘宝：`taobao://s.taobao.com/search?q=食物名`
  - scheme 跳转失败（如未安装App）时自动回退到 H5 页面
  - 按钮样式：平台 logo/名称小图标，横排排列
  - 可在设置中配置显示哪些平台（默认全显示）

### 2. 食物插画系统
- **占位图优先**：食物卡片默认显示占位图（深色渐变 + 食物名文字 + 稀有度色边框），有 AI 生成图后替换为真实图
- 首次出现食物且已配图片 API 时，后台调 AI 图片生成 API 生成游戏插画风格图片
- 图片比例 3:4，推荐尺寸 512×768
- 默认深色渐变背景，半写实 + 游戏道具感
- 缓存策略：IndexedDB 永久缓存，首次生成后不再调用
- 新增食物后台低优先级生成
- 新增第6个 Prompt：**食物插画 Prompt（imagePrompt）**，预置默认值：

```
Game item illustration style, food card art for a cyberpunk gacha game.
Subject: {food_name}
Style: Semi-realistic Japanese RPG item icon, dark gradient background (#111827 to #1a1a2e), subtle neon glow outline matching rarity color, food rendered with glossy appetizing look, slight magical particle effects around edges.
Composition: Centered food item, 3:4 portrait, dramatic lighting from below, game UI card frame.
No text, no watermark, no realistic photo.
```

- 图片生成 API 配置：在设置页单独配置（DALL-E / SD / 自定义端点）
- imagePrompt 可在设置页编辑调试

### 3. 成就系统
- **成就墙**：展示所有已解锁成就，未解锁显示为暗色剪影
- **隐藏成就**：部分成就解锁前不可见（??? 状态），触发后惊喜揭示
- **Steam 风格弹窗**：解锁时底部弹出弹窗，2800ms 后自动消失
- AI 生成成就：参考魔兽/Dota/瓦/三角洲/燕云十六声等游戏命名风格
- 成就示例：「柳州户口本」(连续吃3天螺蛳粉)、「碳水之王」(一周5天面食)
- 存储格式：`wte_achievements` → `[{name, condition, rarity, hidden, date}]`

### 4. AI 毒舌点评
- 不是正经营养师，是**游戏旁白风格**的毒舌吐槽
- 例：「你和鸡之间，必须死一个。」「本周你是碳水的奴隶。」
- 替代原 healthPrompt，改为毒舌+建议结合
- 保留成就点评 Prompt（单独的 achievementPrompt）

### 5. 今日食神签
- 每日首次打开自动生成（基于日期种子，当日不变）
- 格式：一封信签卡片，含食物推荐 + 运势文案
- 提升日活与分享欲
- 新增第7个 Prompt：**食神签 Prompt（fortunePrompt）**
- 缓存：`wte_fortune` → `{date, food, text}`，同一天不重复生成

### 6. 今日天命运势
- 每日首次打开生成，展示在食神签下方
- 轻量氛围文案，如「辣味亲和度 ★★★★☆」「碳水运势 大吉」
- 5 个运势维度：辣味亲和度、碳水运势、清淡指数、尝鲜运、食神护佑
- 新增第8个 Prompt：**天命运势 Prompt（destinyPrompt）**
- 缓存：`wte_destiny` → `{date, dimensions: [...]}`

### 7. 偏好选择（独立 Tab）
- 食物按大类分组，方块网格布局
- 点选高亮，可重复选同一食物（最多3个）
- 顶部显示已选偏好
- 加权规则说明

### 8. 饮食统计
- 纯按实际记录展示，一周/一月切换
- 横向条形图，按标签大类着色
- 日历概览

### 9. 食物管理
- **分类方块布局**：与偏好选择页风格一致，食物按大类分组，每个食物一个方块，显示食物名 + 标签
- 每个方块右上角有 ✕ 删除按钮（hover/长按显示），至少保留 3 项
- 点击方块可弹出编辑弹窗：修改标签（下拉选择）、删除
- 底部添加输入框 + 添加按钮，新食物自动归入对应标签分组
- **"给所有食物打分类标签"按钮**（醒目位置）：
  - 按钮旁提示文字："输入完食物清单后要点一下哦"
  - 一键调用 AI 给所有食物打标签（覆盖旧的）
  - 未配 AI Key 时提示先去设置页配置
  - 打标签中显示 loading 状态
  - 完成后刷新方块展示新标签

---

## 页面结构

### 底部 5 Tab
1. 🎰 抽卡（单抽/十连切换 + 食神签 + 成就预览）
2. ❤️ 偏好（方块点选）
3. 📊 统计（一周/一月条形图 + 日历）
4. 🤖 点评（毒舌点评 + 健康建议）
5. ⚙️ 设置（子分页导航，见下方）

### 设置页子分页结构
设置页顶部有子导航栏，点击切换不同设置区域：

| 子分页 | 内容 |
|--------|------|
| 🔌 API & Prompt | 文本 API 配置 + 图片 API 配置 + 8 个 Prompt 编辑（含 imagePrompt）+ 恢复默认 |
| 🍜 食物管理 | 分类方块布局 + 添加/删除/编辑标签 + 一键打标签按钮 |
| 🎭 前缀管理 | 前缀方块列表 + 手动增删 + AI 批量刷新 + 恢复默认 |
| ℹ️ 关于 | 版本信息 + 外卖平台开关 + 清除数据 + 导出/导入配置 |

### 首页（抽卡 Tab）布局
1. 今日食神签卡片
2. 今日天命运势
3. 单抽/十连切换按钮
4. 老虎机 / 十连卡片区域
5. 选中结果 + 搭配提示
6. 最近成就（2-3个卡片预览）
7. "解锁新成就"按钮

---

## 数据模型（LocalStorage + IndexedDB）

### LocalStorage Keys
| Key | 格式 | 说明 |
|-----|------|------|
| wte_foods | `[{name, tag, rarity_base}]` | 食物列表 |
| wte_records | `[{date, food, time, rarity}]` | 饮食记录（含稀有度） |
| wte_ai_settings | `{provider, apiKeys, customEndpoint, customModel, imageProvider, imageApiKeys, imageEndpoint}` | AI 设置 |
| wte_prompts | `{achievementPrompt, roastPrompt, tagPrompt, prefixPrompt, pairingPrompt, imagePrompt, fortunePrompt, destinyPrompt}` | 8 个 Prompt |
| wte_favorites | `["油泼面", "油泼面", "螺蛳粉"]` | 3 偏好槽位 |
| wte_prefixes | `["艾泽拉斯的", ...]` | 趣味前缀 |
| wte_achievements | `[{name, condition, rarity, hidden, date}]` | 成就 |
| wte_pairings | `{food: [{pairing, reason, calories}]}` | 搭配缓存 |
| wte_fortune | `{date, food, text}` | 今日食神签 |
| wte_destiny | `{date, dimensions: [{name, level, stars}]}` | 今日运势 |

### IndexedDB
- Store: `food_images`
- Key: 食物名
- Value: Blob（512×768 PNG）

---

## 8 个可编辑 Prompt

1. **成就 Prompt（achievementPrompt）**：游戏成就命名风格，食物化
2. **毒舌点评 Prompt（roastPrompt）**：游戏旁白风格吐槽用户饮食，替代原 healthPrompt
3. **打标签 Prompt（tagPrompt）**：给食物打分类标签
4. **前缀生成 Prompt（prefixPrompt）**：游戏/电影/动漫梗生成前缀
5. **搭配提示 Prompt（pairingPrompt）**：推荐搭配 + 热量
6. **食物插画 Prompt（imagePrompt）**：AI 生图的提示词模板
7. **食神签 Prompt（fortunePrompt）**：每日食物推荐 + 运势文案
8. **天命运势 Prompt（destinyPrompt）**：5 维运势生成

---

## AI Provider 配置
- **文本 API**：DeepSeek / 通义千问 / Moonshot / OpenAI / Claude / 自定义
- **图片 API**：DALL-E / Stable Diffusion / 自定义端点（独立配置）

---

## 偏好加权随机算法（不变）
三层标签：具体标签 → 大类 → 口味
- 场景A 3同：该食物 60% + 同大类 20% + 其他 20%
- 场景B 2同1异：重复 40% + 另一个 20% + 同大类 20% + 其他 20%
- 场景C 3不同：各 20% × 3 = 60% + 同大类 20% + 其他 20%
- 漂移：同具体标签 → 同大类 → 同口味，逐层扩展

---

## 默认食物清单（外卖高频菜品，50种）
```js
[
  // 面食类
  { name: "兰州牛肉面", tag: "西北面食" },
  { name: "油泼面", tag: "陕西面食" },
  { name: "biangbiang面", tag: "陕西面食" },
  { name: "肉夹馍", tag: "陕西面食" },
  { name: "打卤面", tag: "北方面食" },
  { name: "炸酱面", tag: "北方面食" },
  { name: "阳春面", tag: "江浙面食" },
  { name: "葱油拌面", tag: "江浙面食" },
  { name: "日式拉面", tag: "日式料理" },
  { name: "豚骨拉面", tag: "日式料理" },
  { name: "重庆小面", tag: "川渝面食" },
  { name: "热干面", tag: "湖北面食" },
  { name: "沙县拌面", tag: "闽味小吃" },
  { name: "担担面", tag: "川渝面食" },
  { name: "刀削面", tag: "山西面食" },
  // 粉类
  { name: "湖南牛肉粉", tag: "湘味粉面" },
  { name: "螺蛳粉", tag: "广西粉面" },
  { name: "桂林米粉", tag: "广西粉面" },
  { name: "云南过桥米线", tag: "云南粉面" },
  { name: "酸辣粉", tag: "川渝粉面" },
  { name: "南昌拌粉", tag: "赣味粉面" },
  { name: "炒河粉", tag: "粤式粉面" },
  { name: "肠粉", tag: "粤式粉面" },
  // 米饭/盖浇
  { name: "黄焖鸡米饭", tag: "鲁味盖浇" },
  { name: "酸菜鱼米饭", tag: "川味盖浇" },
  { name: "宫保鸡丁盖饭", tag: "川味盖浇" },
  { name: "回锅肉盖饭", tag: "川味盖浇" },
  { name: "鱼香肉丝盖饭", tag: "川味盖浇" },
  { name: "番茄炒蛋盖饭", tag: "家常盖浇" },
  { name: "红烧肉盖饭", tag: "家常盖浇" },
  { name: "麻婆豆腐盖饭", tag: "川味盖浇" },
  { name: "煲仔饭", tag: "粤式饭类" },
  { name: "叉烧饭", tag: "粤式饭类" },
  { name: "卤肉饭", tag: "台式饭类" },
  { name: "咖喱饭", tag: "日式料理" },
  { name: "韩式拌饭", tag: "韩式料理" },
  { name: "照烧鸡腿饭", tag: "日式料理" },
  // 粥品
  { name: "皮蛋瘦肉粥", tag: "粤式粥品" },
  { name: "白粥+小菜", tag: "粤式粥品" },
  { name: "小米粥+饼", tag: "北方粥品" },
  { name: "八宝粥", tag: "北方粥品" },
  // 小吃/麻辣烫/火锅
  { name: "甘肃麻辣烫", tag: "西北小吃" },
  { name: "冒菜", tag: "川味小吃" },
  { name: "麻辣香锅", tag: "川味小吃" },
  { name: "麻辣拌", tag: "东北小吃" },
  { name: "烤冷面", tag: "东北小吃" },
  { name: "煎饼果子", tag: "北方小吃" },
  // 快餐
  { name: "烤肉饭", tag: "快餐烤制" },
  { name: "炸鸡汉堡", tag: "西式快餐" },
  { name: "轻食沙拉", tag: "西式快餐" },
  { name: "三明治", tag: "西式快餐" },
]
```

---

## 验证方式
- 单抽：老虎机滚动 + SSR 出金特效（粒子+震动+音效）
- 十连：10 张卡片翻转揭示，稀有度颜色正确
- 食物插画：首次出现调 AI 生成，第二次读取缓存
- 食神签 + 运势：每日首次生成，同一天不变
- 成就弹窗：Steam 风格底部弹窗，隐藏成就解锁前显示 ???
- 毒舌点评：游戏旁白风格
- 偏好加权：3 同偏好多次 spin 验证
- 统计页：一周/一月切换正确
