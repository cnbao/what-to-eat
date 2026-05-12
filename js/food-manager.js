import { getFoods, addFood, removeFood, setFoods, hasAPIKey } from './storage.js';
import { tagAllFoods, tagSingleFood } from './tag-service.js';

const PRESET_TAGS = [
  '陕西面食', '西北面食', '湘味粉面', '广西粉面', '西北小吃',
  '川味小吃', '川味盖浇', '鲁味盖浇', '闽味小吃', '粤式饭类',
  '粤式粥品', '北方粥品', '日式料理', '韩式料理', '快餐烤制',
  '西式快餐', '饮品甜点', '其他',
];

export function renderFoodManager(container, onRebuildSlot) {
  const foods = getFoods();
  container.innerHTML = `
    <div class="food-add-row">
      <input id="inputNewFood" type="text" placeholder="添加新食物..." maxlength="20" />
      <button id="btnAddFood" class="btn-small">添加</button>
    </div>
    <div class="food-tag-action">
      <button id="btnTagAll" class="btn-tag-all">🏷️ 给所有食物打分类标签</button>
      <span class="food-tag-hint">输入完食物清单后要点一下哦</span>
    </div>
    <div id="foodList" class="food-list"></div>
  `;

  const listEl = container.querySelector('#foodList');
  const inputEl = container.querySelector('#inputNewFood');
  const addBtn = container.querySelector('#btnAddFood');
  const tagAllBtn = container.querySelector('#btnTagAll');

  function renderList() {
    const currentFoods = getFoods();
    listEl.innerHTML = currentFoods.map((f, i) => `
      <div class="food-item" data-index="${i}">
        <span class="food-item-name">${f.name}</span>
        <select class="food-item-tag" data-name="${f.name}">
          ${PRESET_TAGS.map(t => `<option value="${t}" ${t === f.tag ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <button class="food-item-delete" data-name="${f.name}">✕</button>
      </div>
    `).join('');

    // Bind tag change
    listEl.querySelectorAll('.food-item-tag').forEach(sel => {
      sel.addEventListener('change', () => {
        const name = sel.dataset.name;
        const foods = getFoods();
        const food = foods.find(f => f.name === name);
        if (food) { food.tag = sel.value; setFoods(foods); }
      });
    });

    // Bind delete
    listEl.querySelectorAll('.food-item-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        if (!removeFood(name)) {
          alert('至少保留3个食物选项哦！');
          return;
        }
        renderList();
        if (onRebuildSlot) onRebuildSlot();
      });
    });
  }

  renderList();

  addBtn.addEventListener('click', async () => {
    const name = inputEl.value.trim();
    if (!name) return;
    if (!addFood(name, '其他')) {
      alert('这个食物已经有了！');
      return;
    }
    inputEl.value = '';

    // Try auto-tag with AI
    if (hasAPIKey()) {
      try {
        const tag = await tagSingleFood(name);
        if (tag) {
          const foods = getFoods();
          const food = foods.find(f => f.name === name);
          if (food) { food.tag = tag; setFoods(foods); }
        }
      } catch { /* keep '其他' */ }
    }

    renderList();
    if (onRebuildSlot) onRebuildSlot();
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
  });

  tagAllBtn.addEventListener('click', async () => {
    if (!hasAPIKey()) {
      alert('请先在设置页配置 API Key');
      return;
    }
    tagAllBtn.disabled = true;
    tagAllBtn.textContent = '🏷️ 正在打标签...';
    try {
      await tagAllFoods((msg) => { tagAllBtn.textContent = `🏷️ ${msg}`; });
      renderList();
      if (onRebuildSlot) onRebuildSlot();
    } catch (e) {
      alert('打标签失败：' + e.message);
    }
    tagAllBtn.disabled = false;
    tagAllBtn.textContent = '🏷️ 给所有食物打分类标签';
  });
}
